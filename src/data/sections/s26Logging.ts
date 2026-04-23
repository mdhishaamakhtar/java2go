import type { Section } from '@/types/section';

const section: Section = {
  id: 'logging',
  title: '25',
  label: 'Logging & Observability',
  blocks: [
    {
      type: 'prose',
      text: 'Java logging is a layered ecosystem: SLF4J as the facade, Logback or Log4j2 as the implementation, configured via XML. Go ships a production-ready structured logger, `log/slog`, in the standard library since Go 1.21. No dependencies, no XML.',
    },
    { type: 'heading', text: 'log vs log/slog' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'old log package vs slog',
      code: `// log package — unstructured, fine for small scripts
import "log"
log.Printf("processing message id=%d", id)
// Output: 2026/04/24 12:00:00 processing message id=42

// log/slog — structured, production-ready (Go 1.21+)
import "log/slog"
slog.Info("processing message", "id", id, "topic", topic)
// Output: time=2026-04-24T12:00:00Z level=INFO msg="processing message" id=42 topic=orders`,
    },
    {
      type: 'table',
      rows: [
        ['SLF4J (facade)', 'log/slog (facade + default implementation)'],
        ['Logback / Log4j2 (implementation)', 'slog.Handler (TextHandler / JSONHandler built-in)'],
        ['log.xml / logback.xml', 'slog.New(handler) in main()'],
        ['MDC (thread-local context)', 'slog.With(...) or slog.InfoContext(ctx, ...)'],
        ['logger.info("msg", kv)', 'slog.Info("msg", "key", value)'],
        ['logger.error("msg", exception)', 'slog.Error("msg", "err", err)'],
      ],
    },
    { type: 'heading', text: 'Log levels' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'slog log levels',
      code: `slog.Debug("cache miss", "key", key)           // debug — verbose, off by default
slog.Info("server started", "addr", ":8080")   // info — normal events
slog.Warn("retry attempt", "n", n, "err", err) // warn — degraded but continuing
slog.Error("db query failed", "err", err)      // error — needs attention

// Set minimum level (default is Info — Debug is suppressed):
opts := &slog.HandlerOptions{Level: slog.LevelDebug}
handler := slog.NewTextHandler(os.Stderr, opts)
slog.SetDefault(slog.New(handler))`,
    },
    { type: 'heading', text: 'Structured attributes — key-value pairs' },
    {
      type: 'compare',
      javaLabel: 'Java — SLF4J structured arguments',
      goLabel: 'Go — slog key-value pairs',
      java: `// SLF4J 2.x — structured key-value
logger.atInfo()
    .addKeyValue("userId", userId)
    .addKeyValue("action", "login")
    .log("user logged in");

// Logback / ELK picks up the key-value pairs as JSON fields`,
      go: `// slog — alternating key, value arguments
slog.Info("user logged in",
    "userId", userId,
    "action", "login",
    "duration", time.Since(start),
)

// Or use typed Attr for performance in hot paths:
slog.Info("user logged in",
    slog.Int64("userId", userId),
    slog.String("action", "login"),
    slog.Duration("duration", time.Since(start)),
)`,
    },
    { type: 'heading', text: 'JSON output for production' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'configure JSON handler in main()',
      code: `package main

import (
    "log/slog"
    "os"
)

func main() {
    // JSON output — structured logs for Datadog, ELK, Cloud Logging etc.
    handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    })
    slog.SetDefault(slog.New(handler))

    // All slog calls now emit JSON:
    // {"time":"2026-04-24T12:00:00Z","level":"INFO","msg":"server started","addr":":8080"}
    slog.Info("server started", "addr", ":8080")
}`,
    },
    { type: 'heading', text: 'slog.With — adding context fields' },
    {
      type: 'compare',
      javaLabel: 'Java — MDC (thread-local)',
      goLabel: 'Go — slog.With',
      java: `// MDC — attached to the current thread
MDC.put("requestId", requestId);
MDC.put("userId", userId);
logger.info("processing request");  // MDC fields appear automatically
MDC.clear();  // must clean up — or use try-finally`,
      go: `// slog.With creates a child logger with pre-attached fields
// Pass it down explicitly — no thread-local storage in Go
func (h *Handler) HandleRequest(w http.ResponseWriter, r *http.Request) {
    log := slog.With(
        "requestId", r.Header.Get("X-Request-ID"),
        "method", r.Method,
        "path", r.URL.Path,
    )

    log.Info("request started")
    result, err := h.service.Process(r.Context())
    if err != nil {
        log.Error("processing failed", "err", err)
        http.Error(w, "error", 500)
        return
    }
    log.Info("request completed", "status", 200)
}`,
    },
    { type: 'heading', text: 'Context-aware logging' },
    {
      type: 'prose',
      text: '`slog.InfoContext`, `slog.ErrorContext` etc. accept a `context.Context` as the first argument. Custom handlers can extract values from the context (trace IDs, user IDs) and attach them to every log entry automatically — without passing a logger through every function.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'log with context — trace ID propagation',
      code: `// Middleware attaches trace ID to context
func withTraceID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        traceID := r.Header.Get("X-Trace-ID")
        ctx := context.WithValue(r.Context(), traceIDKey, traceID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Deep in the call tree — no logger threading required
func (r *Repository) Query(ctx context.Context, id string) (*Message, error) {
    slog.InfoContext(ctx, "querying database", "id", id)
    // A custom slog.Handler can read traceIDKey from ctx and add it to every line
    // ...
}`,
    },
    { type: 'heading', text: 'Goroutine count — the key operational metric' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'expose runtime metrics',
      code: `import "runtime"

// Number of currently live goroutines
n := runtime.NumGoroutine()
slog.Info("runtime stats", "goroutines", n)

// Export to Prometheus / Datadog via a metrics endpoint:
// A steadily climbing goroutine count is the primary signal
// of a goroutine leak (blocked channel, missed ctx.Done()).

// expvar package — built-in HTTP endpoint at /debug/vars
import _ "expvar"
// GET /debug/vars returns a JSON snapshot of runtime stats

// Full pprof profiles (CPU, memory, goroutine traces):
import _ "net/http/pprof"
// GET /debug/pprof/goroutine?debug=2 — full goroutine dump`,
    },
  ],
};

export default section;
