import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'logging',
  label: 'Logging & Observability',
  summary:
    'log/slog in place of SLF4J and Logback, request context in every log line without MDC, redacting secrets, and metrics, tracing and profiling.',
  blocks: [
    {
      type: 'prose',
      text: 'Java logging is a layered ecosystem: SLF4J as the API, Logback or Log4j2 as the implementation, configured in XML. Since Go 1.21 the standard library includes `log/slog`, a structured logger with levels, attributes and pluggable handlers. It is both the API and a production-ready implementation.',
    },
    { type: 'heading', text: 'log vs log/slog' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the old log package and its structured successor',
      code: `// log: unstructured text. Fine for scripts and small tools.
log.Printf("processing message id=%d", id)
// 2026/09/29 12:00:00 processing message id=42

// log/slog: structured key/value pairs, with levels
slog.Info("processing message", "id", id, "topic", topic)
// time=2026-09-29T12:00:00.000Z level=INFO msg="processing message" id=42 topic=orders`,
    },
    {
      type: 'table',
      rows: [
        ['SLF4J (API)', '`slog.Logger` and the package-level `slog.Info` etc.'],
        [
          'Logback / Log4j2 (implementation)',
          '`slog.Handler`: `TextHandler` and `JSONHandler` built in',
        ],
        ['`logback.xml`', 'A few lines in `main()`: `slog.SetDefault(slog.New(handler))`'],
        [
          '`log.info("user {}", id)`',
          '`slog.Info("user loaded", "id", id)`: a constant message plus attributes',
        ],
        ['`log.error("failed", exception)`', '`slog.Error("failed", "err", err)`'],
        ['MDC', 'Attributes from `logger.With(…)`, or a handler reading the context'],
        ['Multiple appenders', '`slog.NewMultiHandler(h1, h2)` (Go 1.26+)'],
      ],
    },
    { type: 'heading', text: 'Configuring the logger in main' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'JSON logs to stdout, level from configuration',
      code: `func newLogger(level slog.Level) *slog.Logger {
    // JSON to stdout: what Kubernetes, Datadog, Loki and
    // Cloud Logging all expect from a container
    handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level:     level, // records below this are dropped cheaply
        AddSource: true,  // adds "source": file and line
    })
    return slog.New(handler)
}

func main() {
    logger := newLogger(slog.LevelInfo)
    slog.SetDefault(logger) // also redirects the old log package

    slog.Info("server starting", "addr", ":8080", "version", version)
    // {"time":"…","level":"INFO","source":{…},"msg":"server starting","addr":":8080","version":"1.4.2"}
}`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Use a `slog.LevelVar` instead of a fixed level when you want to change verbosity at runtime, for example from an admin endpoint, similar to Spring Boot Actuator’s `/loggers`.',
    },
    { type: 'heading', text: 'Attributes' },
    {
      type: 'compare',
      javaLabel: 'Java — SLF4J 2 fluent API',
      goLabel: 'Go — key/value pairs or typed attributes',
      java: `log.atInfo()
    .setMessage("user logged in")
    .addKeyValue("userId", userId)
    .addKeyValue("method", "sso")
    .log();`,
      go: `// Alternating keys and values: concise
slog.Info("user logged in", "user_id", userID, "method", "sso")

// Typed attributes: no allocations for the pairs, and a
// mismatched key/value count becomes impossible
slog.Info("user logged in",
    slog.Int64("user_id", userID),
    slog.String("method", "sso"),
    slog.Duration("took", time.Since(start)),
)`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`go vet` checks slog calls: a key without a value, or a non-string key, is reported at build time rather than producing a garbled log line in production.',
    },
    { type: 'heading', text: 'Request context without MDC' },
    {
      type: 'compare',
      javaLabel: 'Java — MDC (thread-local)',
      goLabel: 'Go — a logger with attributes attached',
      java: `MDC.put("requestId", requestId);
try {
    log.info("processing request"); // requestId included
    service.handle(request);        // and in every log below
} finally {
    MDC.clear();
}`,
      go: `func (h *Handler) Handle(w http.ResponseWriter, r *http.Request) {
    id, _ := RequestID(r.Context()) // helper from the Context section
    logger := slog.With(
        "request_id", id,
        "method", r.Method,
        "path", r.URL.Path,
    )
    logger.Info("processing request")

    if err := h.svc.Process(r.Context()); err != nil {
        logger.Error("processing failed", "err", err)
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }
    logger.Info("request completed")
}`,
    },
    {
      type: 'prose',
      text: 'Passing a logger into every function gets tedious. The alternative is to keep request data in the `context.Context` (which you pass anyway), log with the `…Context` variants, and install a handler that copies context values into every record. The built-in handlers ignore the context, so this small wrapper is a common pattern:',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'a handler that adds the request ID from the context',
      code: `type ContextHandler struct {
    slog.Handler // embed: inherit Enabled and everything else
}

func (h ContextHandler) Handle(ctx context.Context, r slog.Record) error {
    if id, ok := RequestID(ctx); ok {
        r.AddAttrs(slog.String("request_id", id))
    }
    return h.Handler.Handle(ctx, r)
}

// Keep the wrapper when attributes or groups are added
func (h ContextHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
    return ContextHandler{h.Handler.WithAttrs(attrs)}
}

func (h ContextHandler) WithGroup(name string) slog.Handler {
    return ContextHandler{h.Handler.WithGroup(name)}
}

// main: slog.SetDefault(slog.New(ContextHandler{slog.NewJSONHandler(os.Stdout, nil)}))
// anywhere: slog.InfoContext(ctx, "charging card", "amount", amt)
// {"level":"INFO","msg":"charging card","amount":1999,"request_id":"req-42"}`,
    },
    { type: 'heading', text: 'Keeping secrets out of logs' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'slog.LogValuer controls how a type is logged',
      code: `type Password string

// Whenever a Password is logged, this value is used instead
func (Password) LogValue() slog.Value {
    return slog.StringValue("REDACTED")
}

// Log a summary of a large struct instead of every field
func (u User) LogValue() slog.Value {
    return slog.GroupValue(
        slog.Int64("id", u.ID),
        slog.String("plan", u.Plan),
    )
}

slog.Info("signup", "user", user, "password", pw)
// {"msg":"signup","user":{"id":7,"plan":"pro"},"password":"REDACTED"}`,
    },
    { type: 'heading', text: 'Metrics, tracing and profiling' },
    {
      type: 'list',
      items: [
        '**Metrics:** the Prometheus client (`github.com/prometheus/client_golang`) exposes counters, gauges and histograms plus Go runtime metrics such as goroutine count, GC pauses and heap size. OpenTelemetry metrics are the vendor-neutral alternative.',
        '**Tracing:** OpenTelemetry for Go propagates trace context through `context.Context`, so spans cross function and service boundaries with no thread-local magic. `otelhttp` wraps handlers and clients.',
        '**Profiling:** `net/http/pprof` serves CPU, heap, goroutine, mutex and block profiles; `go tool pprof` analyses them. Expose it only on an internal port.',
        '**Execution traces:** `go tool trace` shows scheduling, GC and blocking over time. Go 1.25’s `trace.FlightRecorder` keeps the last few seconds in memory so you can dump a trace when something goes wrong.',
      ],
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'The single most useful Go-specific metric is the goroutine count. A value that climbs and never comes back down is a goroutine leak, usually a blocked channel send or a missing `ctx.Done()` case (see [Goroutine Management](/sections/goroutine-mgmt#goroutine-leaks)).',
    },
  ],
};

export default section;
