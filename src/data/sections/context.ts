import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'context',
  label: 'Context',
  summary:
    '`context.Context` carries cancellation, deadlines and request-scoped values through every call. It replaces interruption, timeouts and ThreadLocal.',
  blocks: [
    {
      type: 'prose',
      text: 'In Java, cancellation, timeouts and request-scoped data travel through several mechanisms: `Thread.interrupt()`, `Future.cancel()`, per-library timeout settings, and `ThreadLocal`/MDC for request data. Go has no thread-locals, because goroutines have no identity you can attach data to. Instead there is one explicit value, `context.Context`, passed as the first argument to every function that blocks, does I/O or calls another service.',
    },
    {
      type: 'callout',
      title: 'What a context carries',
      tone: 'info',
      text: '**A cancellation signal:** `ctx.Done()` returns a channel that is closed when the work should stop, and `ctx.Err()` says why.\n\n**An optional deadline:** a point in time after which the context cancels itself.\n\n**Request-scoped values:** trace IDs, the authenticated principal. Narrow and deliberate, not a general-purpose bag.\n\nContexts form a tree. Deriving a child adds a deadline or a value; cancelling a parent cancels every child beneath it, but never the other way round.',
    },
    { type: 'heading', text: 'Where contexts come from' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'root contexts and inherited ones',
      code: `// The root: never cancelled, no deadline, no values.
// Create it at the top of the call tree: main, tests, jobs.
ctx := context.Background()

// A placeholder while refactoring: "a real context should
// be passed in here, I haven't wired it up yet".
ctx = context.TODO()

// In an HTTP handler: cancelled when the client disconnects
// or the server shuts down.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    ...
}

// In a test (Go 1.24+): cancelled when the test finishes
func TestGet(t *testing.T) {
    ctx := t.Context()
    ...
}`,
    },
    { type: 'heading', text: 'Cancelling work' },
    {
      type: 'compare',
      javaLabel: 'Java — Future.cancel()',
      goLabel: 'Go — context.WithCancel',
      java: `Future<Report> f = executor.submit(() -> build(id));

// Later: best-effort interrupt of the task's thread.
// Libraries that don't check interruption keep running.
f.cancel(true);`,
      go: `ctx, cancel := context.WithCancel(parent)
defer cancel() // always: releases resources on every path

go func() {
    report, err := build(ctx, id) // build passes ctx on down
    ...
}()

// Later: every goroutine and call using ctx sees Done() close
cancel()`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Call `cancel` on every path, usually with `defer cancel()` on the very next line. A derived context that is never cancelled stays registered with its parent (and keeps its timer, for timeouts) until the parent itself ends. `go vet` reports a discarded cancel function.',
    },
    { type: 'heading', text: 'Timeouts and deadlines' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'WithTimeout: a deadline relative to now',
      code: `func (s *Store) Find(ctx context.Context, id string) (*Message, error) {
    // Give this query at most 2s, and less if the caller's
    // own deadline is sooner: a child never outlives its parent.
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
    defer cancel()

    row := s.db.QueryRowContext(ctx, "SELECT body FROM messages WHERE id = $1", id)
    var m Message
    if err := row.Scan(&m.Body); err != nil {
        // context.DeadlineExceeded if our 2s elapsed,
        // context.Canceled if the caller gave up first
        return nil, fmt.Errorf("find message %s: %w", id, err)
    }
    return &m, nil
}

// WithDeadline takes an absolute time instead:
//   ctx, cancel := context.WithDeadline(ctx, time.Now().Add(2*time.Second))`,
    },
    {
      type: 'compare',
      javaLabel: 'Java — timeouts per call site',
      goLabel: 'Go — one deadline for the whole request',
      java: `CompletableFuture<Result> f = fetchData(id)
    .orTimeout(5, TimeUnit.SECONDS);

// The future fails after 5s, but the JDBC query and HTTP
// call inside fetchData keep running: each library needs
// its own timeout configured separately.`,
      go: `ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
defer cancel()

msg, err := svc.Find(ctx, id)
// When the 5s budget runs out:
//   1. the database driver aborts the query
//   2. outgoing HTTP calls using ctx are cancelled
//   3. Find returns an error wrapping context.DeadlineExceeded
//   4. the handler can respond 504 Gateway Timeout`,
    },
    {
      type: 'why',
      text: 'Because every layer accepts the same `ctx`, a deadline set at the edge of your service bounds all the work beneath it: queries, HTTP calls, channel waits. There is no per-library timeout to forget. If the client disconnects, `r.Context()` is cancelled and your service stops doing work nobody is waiting for.',
    },
    { type: 'heading', text: 'Checking for cancellation in your own loops' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'long CPU-bound work should check ctx periodically',
      code: `func processBatch(ctx context.Context, items []Item) error {
    for _, item := range items {
        // Cheap, non-blocking check between units of work
        if err := ctx.Err(); err != nil {
            return err
        }
        if err := processItem(ctx, item); err != nil {
            return err
        }
    }
    return nil
}`,
    },
    { type: 'heading', text: 'Work that must outlive the request' },
    {
      type: 'prose',
      text: 'Sometimes a handler starts work that should finish even if the client disconnects, such as writing an audit record. `context.WithoutCancel` (Go 1.21+) returns a context that keeps the parent’s **values** (trace IDs and so on) but is never cancelled and has **no deadline**. Give that work its own timeout so it cannot run forever.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'detach from the request, but keep its values',
      code: `func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    order, err := h.orders.Create(r.Context(), parseOrder(r))
    if err != nil {
        http.Error(w, "could not create order", http.StatusInternalServerError)
        return
    }

    // Survives the client hanging up; still carries trace IDs.
    auditCtx, cancel := context.WithTimeout(context.WithoutCancel(r.Context()), 10*time.Second)
    go func() {
        defer cancel()
        if err := h.audit.Record(auditCtx, order); err != nil {
            slog.ErrorContext(auditCtx, "audit failed", "order", order.ID, "err", err)
        }
    }()

    w.WriteHeader(http.StatusCreated)
}`,
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'A goroutine started from a handler is not tracked by `http.Server.Shutdown`. For work that must not be lost, hand it to a component with its own lifecycle (a queue, or a worker that drains on shutdown) instead of a bare `go` statement.',
    },
    { type: 'heading', text: 'Request-scoped values' },
    {
      type: 'compare',
      javaLabel: 'Java — MDC / ThreadLocal',
      goLabel: 'Go — context.WithValue',
      java: `// Tied to the current thread
MDC.put("requestId", requestId);
try {
    chain.doFilter(req, res);
} finally {
    MDC.remove("requestId"); // or it leaks to the next request
}

String id = MDC.get("requestId"); // anywhere on this thread`,
      go: `// An unexported key type: no other package can collide with it
type ctxKey struct{}

func WithRequestID(ctx context.Context, id string) context.Context {
    return context.WithValue(ctx, ctxKey{}, id)
}

func RequestID(ctx context.Context) (string, bool) {
    id, ok := ctx.Value(ctxKey{}).(string)
    return id, ok
}

// Middleware: ctx := WithRequestID(r.Context(), newID())
//             next.ServeHTTP(w, r.WithContext(ctx))`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Use context values only for request-scoped data that crosses API boundaries: trace IDs, the authenticated user. Never for optional parameters or dependencies such as a logger or database handle. Values bypass the type system, so wrap access in small typed helpers like `RequestID(ctx)` above.',
    },
    { type: 'heading', text: 'Conventions' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'ctx is the first parameter, and never a struct field',
      code: `// Correct: ctx first, named ctx
func (s *Service) FindByID(ctx context.Context, id string) (*Message, error)

// Wrong: a context stored in a struct outlives the call it was for
type Service struct {
    ctx context.Context // don't
}

// Also wrong: passing nil. Use context.TODO() if you have nothing better.`,
    },
    {
      type: 'callout',
      title: 'Context vs ThreadLocal',
      tone: 'go',
      text: '`ThreadLocal` works in Spring MVC because one thread handles a request from start to finish. It breaks as soon as work hops threads: async executors, reactive pipelines, and, with virtual threads, it becomes costly at scale. Java 25’s `ScopedValue` is the JDK’s answer. Go chose explicit passing from the start: the data travels with the logical operation, visible in every signature, and the same `ctx` carries cancellation.',
    },
  ],
};

export default section;
