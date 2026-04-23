import type { Section } from '@/types/section';

const section: Section = {
  id: 'context',
  title: '15',
  label: 'Context',
  blocks: [
    {
      type: 'prose',
      text: 'In Java, cancellation and request-scoped data travel via thread-local storage (`ThreadLocal`), `CancellationToken`, or Spring\'s `@RequestScope`. Go has no thread-local storage — goroutines are multiplexed and ephemeral. Instead, Go uses `context.Context`: an explicit value passed as the first argument to every function that does I/O, waits, or calls downstream services.',
    },
    {
      type: 'callout',
      title: 'What context.Context carries',
      color: '#7c9fff',
      text: '**Cancellation signal** — a channel that is closed when the work is cancelled or times out. Every DB query, HTTP call, and goroutine checks `ctx.Done()`.\n\n**Deadline** — an absolute time after which the context is automatically cancelled.\n\n**Key-value metadata** — request IDs, trace IDs, auth tokens. Narrow, explicit, not a general-purpose bag.',
    },
    { type: 'heading', text: 'Background, TODO, and the root context' },
    {
      type: 'compare',
      javaLabel: 'Java — no explicit root',
      goLabel: 'Go — context.Background()',
      java: `// Java — cancellation is implicit in thread lifecycle
// or passed via CompletableFuture/CancellationToken
ExecutorService exec = Executors.newFixedThreadPool(10);
Future<Result> f = exec.submit(() -> queryDatabase(id));
f.cancel(true);  // interrupt the thread — best-effort`,
      go: `// context.Background() is the root context — never cancelled.
// Create it once at the top of your call tree (main, HTTP handler, test).
ctx := context.Background()

// context.TODO() is a placeholder — use while refactoring
// to mark "I know a context should come from above, not yet wired"
ctx := context.TODO()`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'Every net/http request already comes with a context: `r.Context()`. Every database/sql and gRPC call accepts one. You rarely create `context.Background()` outside of `main`, tests, and background job entry points.',
    },
    { type: 'heading', text: 'WithCancel — manual cancellation' },
    {
      type: 'compare',
      javaLabel: 'Java — CompletableFuture.cancel()',
      goLabel: 'Go — context.WithCancel',
      java: `CompletableFuture<Result> f =
    CompletableFuture.supplyAsync(() -> fetchData(id));

// Cancel — returns true if cancelled before completion
f.cancel(true);`,
      go: `ctx, cancel := context.WithCancel(context.Background())
defer cancel()  // always defer cancel — releases resources even on happy path

go worker.Run(ctx)  // worker selects on ctx.Done()

// Elsewhere, when work is no longer needed:
cancel()  // closes ctx.Done() — all goroutines watching ctx.Done() unblock`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Always `defer cancel()` immediately after `context.WithCancel`, `context.WithTimeout`, or `context.WithDeadline`. Forgetting to call cancel leaks the goroutine that monitors the parent context, even if you never call `ctx.Done()`.',
    },
    { type: 'heading', text: 'WithTimeout and WithDeadline' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'WithTimeout vs WithDeadline',
      code: `// WithTimeout: duration from now
ctx, cancel := context.WithTimeout(parentCtx, 5*time.Second)
defer cancel()

// WithDeadline: absolute time
deadline := time.Now().Add(5 * time.Second)
ctx, cancel := context.WithDeadline(parentCtx, deadline)
defer cancel()

// Both produce the same result above.
// Use WithTimeout for "5 seconds from now".
// Use WithDeadline when the absolute time comes from an external source
// (e.g., the deadline was set by the caller and passed in).

rows, err := db.QueryContext(ctx, "SELECT * FROM messages WHERE id = $1", id)
if err != nil {
    // context.DeadlineExceeded if the 5s elapsed
    // context.Canceled if cancel() was called upstream
    if errors.Is(err, context.DeadlineExceeded) {
        // handle timeout
    }
}`,
    },
    {
      type: 'compare',
      javaLabel: 'Java — CompletableFuture.orTimeout()',
      goLabel: 'Go — WithTimeout propagates everywhere',
      java: `// Java — timeout on a single future
CompletableFuture<Result> f = fetchData(id)
    .orTimeout(5, TimeUnit.SECONDS);

// But: the timeout does NOT automatically cancel downstream
// JDBC queries or HTTP calls inside fetchData()
// — they continue running until they naturally complete.`,
      go: `// Go — context timeout propagates through the entire call tree
ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
defer cancel()

// FindByID passes ctx to db.QueryContext internally
msg, err := service.FindByID(ctx, id)

// If ctx times out:
// 1. db.QueryContext returns context.DeadlineExceeded
// 2. FindByID returns the error
// 3. The HTTP handler receives it and writes 503
// The timeout propagates automatically — no special wiring per layer.`,
    },
    { type: 'heading', text: 'Checking cancellation in long-running work' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'select on ctx.Done() inside a loop',
      code: `func processBatch(ctx context.Context, items []Item) error {
    for _, item := range items {
        // Check for cancellation at the start of each iteration
        select {
        case <-ctx.Done():
            return ctx.Err()  // context.Canceled or context.DeadlineExceeded
        default:
            // not cancelled — continue
        }

        if err := processItem(ctx, item); err != nil {
            return err
        }
    }
    return nil
}`,
    },
    { type: 'heading', text: 'WithoutCancel — fire-and-forget child work' },
    {
      type: 'prose',
      text: 'Sometimes you need to start a background task (audit log, async notification) that should outlive the request context. `context.WithoutCancel` (Go 1.21+) creates a child that keeps the parent\'s values and deadline metadata but is immune to the parent\'s cancellation.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'context.WithoutCancel — Go 1.21+',
      code: `func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()  // cancelled when the HTTP request closes

    order, err := h.db.CreateOrder(ctx, req)
    if err != nil {
        http.Error(w, "failed", http.StatusInternalServerError)
        return
    }

    // Audit log should complete even if the HTTP connection drops.
    // context.WithoutCancel inherits values (trace IDs etc.) but
    // ignores the parent's cancellation.
    auditCtx := context.WithoutCancel(ctx)
    go h.audit.LogOrder(auditCtx, order)

    w.WriteHeader(http.StatusCreated)
}`,
    },
    { type: 'heading', text: 'WithValue — request-scoped metadata' },
    {
      type: 'compare',
      javaLabel: 'Java — MDC / ThreadLocal',
      goLabel: 'Go — context.WithValue',
      java: `// SLF4J MDC — thread-local key-value store
MDC.put("requestId", requestId);
MDC.put("userId", userId);

// Available anywhere in the same thread:
String id = MDC.get("requestId");`,
      go: `// context.WithValue attaches a value to the context.
// Use an unexported type as the key to avoid collisions.
type contextKey string
const requestIDKey contextKey = "requestID"

// Set (typically in middleware):
ctx = context.WithValue(ctx, requestIDKey, requestID)

// Get:
if id, ok := ctx.Value(requestIDKey).(string); ok {
    slog.InfoContext(ctx, "handling request", "requestID", id)
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Use `context.WithValue` **only for request-scoped data that crosses API boundaries** (trace IDs, auth tokens). Do not use it as a general-purpose parameter bag — it bypasses the type system, making code harder to follow. If a function needs a value, pass it as an explicit argument.',
    },
    { type: 'heading', text: 'The first-argument convention' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'ctx is always the first argument',
      code: `// Go convention: ctx is ALWAYS the first parameter.
// Never embed context in a struct — it makes cancellation invisible.

// CORRECT
func (s *Service) FindByID(ctx context.Context, id string) (*Message, error)
func (r *Repository) Query(ctx context.Context, q string) ([]Row, error)

// WRONG — do not store context in a struct
type Service struct {
    ctx context.Context  // never do this
}

// The first-argument convention makes it obvious:
// - which functions are context-aware
// - where cancellation can propagate
// - how to trace a request across layers`,
    },
    {
      type: 'callout',
      title: 'Context vs Java ThreadLocal — the key difference',
      color: '#4ec9b0',
      text: 'Java\'s `ThreadLocal` ties data to a thread, which works because one thread handles one request from start to finish (Spring MVC). Go goroutines are not tied to threads — the scheduler moves them freely. Explicit context passing is Go\'s answer: the data travels with the **logical operation**, not with the OS thread. This is why `context.Context` is the first argument to nearly every function that does I/O or spawns work.',
    },
  ],
};

export default section;
