import type { Section } from '@/types/section';

const section: Section = {
  id: 'lifecycle',
  title: '20',
  label: 'Init & Main Lifecycle',
  blocks: [
    {
      type: 'prose',
      text: "Go programs have a precise startup sequence. Understanding it is essential for reading `main.go` files — and for understanding how Go's manual wiring compares to Spring's automatic wiring.",
    },
    { type: 'heading', text: 'Startup order' },
    {
      type: 'callout',
      title: 'Go program startup — exact sequence',
      color: '#4ec9b0',
      text: '**1.** Package-level variables initialised, in import dependency order (deepest import first)\n\n**2.** `init()` functions run — all of them, in import order, then current package\n\n**3.** `main()` runs\n\nIf A imports B imports C: C vars → C init() → B vars → B init() → A vars → A init() → main()',
    },
    { type: 'heading', text: 'init() — automatic, invisible, hard to test' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'init() rules',
      code: `package config

// Package-level var — initialised before init()
var defaultTimeout = 30 * time.Second

// init() runs automatically before main()
// Cannot be called manually
// No parameters, no return values
// Multiple init() in same file/package are allowed — all run
func init() {
    if os.Getenv("ENV") == "" {
        os.Setenv("ENV", "development")
    }
}

// A second init() in the same package — also runs
func init() {
    setupLogger()
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Use `init()` only for driver registration and truly one-time global setup. It cannot be tested directly and runs invisibly. Prefer explicit `InitX()` functions called from `main()`.',
    },
    { type: 'heading', text: 'Spring DI vs Go manual wiring' },
    {
      type: 'compare',
      javaLabel: 'Java Spring — @Autowired, IoC container',
      goLabel: 'Go — manual wiring in main()',
      java: `@Repository
class PostgresMessageStore implements MessageStore { ... }

@Service
class MessageService {
    @Autowired
    MessageStore store;  // Spring injects this
}

@RestController
class MessageController {
    @Autowired
    MessageService service;  // Spring injects this
}

// Spring scans, reflects, injects — invisible wiring
// Hard to trace: where does store come from?`,
      go: `// In Go — wire everything explicitly in main()
func main() {
    // Each dependency constructed and passed explicitly
    // You can read main() and trace every connection

    db := mustOpenDB(cfg.DatabaseURL)

    // store depends on db
    store := store.NewPostgresStore(db)

    // service depends on store
    service := service.NewMessageService(store)

    // handler depends on service
    handler := handler.NewMessageHandler(service)

    // router depends on handler
    router := setupRouter(handler)

    http.ListenAndServe(":8080", router)
}`,
    },
    {
      type: 'why',
      text: 'Spring uses reflection and classpath scanning to wire dependencies at startup — convenient but opaque. Go wires everything explicitly in `main()` — more code, but you can trace every dependency by reading the function. No surprises, no magic, no annotation scanning. The trade-off: more boilerplate in main() for the benefit of complete transparency.',
    },
    { type: 'heading', text: 'Full production main.go — everything wired' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'main.go — the complete lifecycle',
      code: `func main() {
    // ── 1. LOAD CONFIG ────────────────────────────────────────────
    cfg, err := config.Load(os.Getenv("CONFIG_PATH"))
    if err != nil { log.Fatal("config:", err) }

    // ── 2. CONNECT INFRASTRUCTURE ─────────────────────────────────
    db, err := sql.Open("postgres", cfg.DatabaseURL)
    if err != nil { log.Fatal("db:", err) }
    defer db.Close()   // last in, first closed

    // ── 3. BUILD LAYERS BOTTOM-UP ────────────────────────────────
    // Each layer only knows about the layer below it via interface
    store   := store.NewPostgresStore(db)
    engine  := engine.NewEngine(store, cfg)
    handler := handler.NewHandler(engine)

    // ── 4. ROOT CONTEXT — cancelling this stops everything ─────────
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()  // ensure cancel is always called on exit

    // ── 5. START ENGINE GOROUTINES ────────────────────────────────
    if err := engine.Start(ctx); err != nil { log.Fatal("engine:", err) }

    // ── 6. HTTP SERVER IN BACKGROUND GOROUTINE ──────────────────
    srv := &http.Server{Addr: cfg.HTTPAddr, Handler: handler.Router()}
    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Printf("http server error: %v", err)
        }
    }()
    log.Printf("listening on %s", cfg.HTTPAddr)

    // ── 7. BLOCK UNTIL OS SIGNAL ─────────────────────────────────
    // quit is a buffered channel — signal.Notify needs buffer ≥ 1
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit   // main goroutine blocks here — all other goroutines stay alive
    // Ctrl+C or SIGTERM (k8s pod shutdown) unblocks this

    // ── 8. GRACEFUL SHUTDOWN ─────────────────────────────────────
    log.Println("shutdown signal received — draining...")
    cancel()  // broadcasts to ALL goroutines using ctx — they see ctx.Done()

    // Give in-flight requests 30s to complete
    shutCtx, shutCancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer shutCancel()
    srv.Shutdown(shutCtx)  // stops accepting new, waits for in-flight
    engine.Stop()          // drains message queues
    log.Println("shutdown complete")
}`,
    },
    {
      type: 'note',
      noteType: 'engine',
      text: "The `<-quit` line is the program's heartbeat — main blocks there, keeping every goroutine alive. When k8s sends SIGTERM, this unblocks, cancel() fires, all goroutines exit their select loops, and the server drains cleanly before the process terminates.",
    },
  ],
};

export default section;
