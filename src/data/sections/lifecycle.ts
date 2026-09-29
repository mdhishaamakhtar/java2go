import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'lifecycle',
  label: 'Init & Main Lifecycle',
  summary:
    'How a Go program starts, why init() should be rare, wiring dependencies by hand instead of Spring, and a production main() with graceful shutdown.',
  blocks: [
    {
      type: 'prose',
      text: 'A Go service has no container, no classpath scanning and no application context. `main()` is the composition root: it reads configuration, constructs every dependency, starts the servers and waits for a signal to stop. Reading `main.go` tells you how the whole program fits together.',
    },
    { type: 'heading', text: 'Startup order' },
    {
      type: 'callout',
      title: 'What runs before main()',
      tone: 'go',
      text: '**1.** Imported packages are initialised first, dependencies before dependents, each package exactly once.\n\n**2.** Within a package, package-level variables are initialised in dependency order, then every `init()` function runs in the order the files are presented to the compiler.\n\n**3.** `main.main()` runs.\n\nIf `main` imports `b` and `b` imports `c`: c’s variables → c’s `init()` → b’s variables → b’s `init()` → main’s variables → main’s `init()` → `main()`.',
    },
    { type: 'heading', text: 'init(): automatic, invisible, hard to test' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'init() rules',
      code: `package metrics

// Package-level vars are initialised before init()
var registry = prometheus.NewRegistry()

// init() takes no arguments, returns nothing, and cannot be
// called explicitly. A package may have several; all run.
func init() {
    registry.MustRegister(collectors.NewGoCollector())
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Keep `init()` for registering things with the standard library or a driver (the way `database/sql` drivers register themselves). Do not read environment variables, open connections or start goroutines in `init()`: it runs in every test binary that imports the package, cannot return an error, and hides work from anyone reading `main`. Write an explicit constructor and call it from `main`.',
    },
    { type: 'heading', text: 'Spring DI vs wiring by hand' },
    {
      type: 'compare',
      javaLabel: 'Java — Spring injects dependencies',
      goLabel: 'Go — main() constructs them',
      java: `@Repository
class PostgresMessageStore implements MessageStore { ... }

@Service
class MessageService {
    private final MessageStore store;
    MessageService(MessageStore store) { this.store = store; }
}

@RestController
class MessageController {
    private final MessageService service;
    MessageController(MessageService service) {
        this.service = service;
    }
}

// The container scans, instantiates and injects at startup.`,
      go: `func run(ctx context.Context, cfg Config) error {
    pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
    if err != nil {
        return fmt.Errorf("connect database: %w", err)
    }
    defer pool.Close()

    messages := store.NewPostgres(pool)     // needs the pool
    svc := service.NewMessages(messages)    // needs the store
    api := handler.NewMessages(svc)         // needs the service

    return serve(ctx, cfg.HTTPAddr, api.Routes())
}`,
    },
    {
      type: 'why',
      text: 'Spring’s constructor injection is already explicit about what each class needs; Go keeps that part and drops the container. Every dependency is created in one function you can read top to bottom, a missing dependency is a compile error rather than a startup failure, and there is no reflection or proxying involved. The cost is a few dozen lines of wiring in `main`, which most teams find a fair trade.',
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'For very large graphs, code generators such as Google’s `wire` produce this wiring code at build time, and Uber’s `fx` offers a runtime container closer to Spring. Most Go services never need either.',
    },
    { type: 'heading', text: 'A production main.go' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'main.go: run(), signals and graceful shutdown',
      code: `func main() {
    // main only reports; run does the work and can use defer freely
    if err := run(); err != nil {
        slog.Error("fatal", "err", err)
        os.Exit(1)
    }
}

func run() error {
    // Cancelled on Ctrl+C or SIGTERM (what Kubernetes sends)
    ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer stop()

    cfg, err := config.Load()
    if err != nil {
        return fmt.Errorf("load config: %w", err)
    }

    pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
    if err != nil {
        return fmt.Errorf("connect database: %w", err)
    }
    defer pool.Close() // runs last: after the server has drained

    api := handler.NewMessages(service.NewMessages(store.NewPostgres(pool)))
    srv := &http.Server{
        Addr:              cfg.HTTPAddr,
        Handler:           api.Routes(),
        ReadHeaderTimeout: 5 * time.Second,
        ReadTimeout:       15 * time.Second,
        WriteTimeout:      30 * time.Second,
        IdleTimeout:       2 * time.Minute,
    }

    serveErr := make(chan error, 1)
    go func() {
        slog.Info("listening", "addr", srv.Addr)
        if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
            serveErr <- err // failed to start, e.g. port already in use
        }
        close(serveErr)
    }()

    select {
    case err := <-serveErr:
        return fmt.Errorf("http server: %w", err)
    case <-ctx.Done():
        stop() // a second Ctrl+C now kills the process immediately
        slog.Info("shutting down")
    }

    // Stop accepting connections; wait up to 20s for in-flight requests
    shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
    defer cancel()
    if err := srv.Shutdown(shutdownCtx); err != nil {
        return fmt.Errorf("http shutdown: %w", err)
    }
    return nil
}`,
    },
    {
      type: 'list',
      items: [
        '**`run() error`** keeps `main` tiny and lets every `defer` run: `os.Exit` and `log.Fatal` skip deferred calls, so they belong only in `main`.',
        '**`signal.NotifyContext`** turns SIGTERM into context cancellation, so the same `ctx` stops the server and any background workers.',
        '**`srv.Shutdown`** stops accepting new connections and waits for active requests, bounded by its own timeout. Kubernetes waits `terminationGracePeriodSeconds` (30s by default) before sending SIGKILL, so keep this shorter.',
        '**Server timeouts** default to none. `ReadHeaderTimeout` in particular protects against slow-header (Slowloris) clients.',
      ],
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'This is what Spring Boot’s `server.shutdown=graceful` and `spring.lifecycle.timeout-per-shutdown-phase` do for you. In Go the sequence is twenty readable lines in your own `main`, and you can see exactly what order things stop in.',
    },
  ],
};

export default section;
