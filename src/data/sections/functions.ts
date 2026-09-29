import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'functions',
  label: 'Functions',
  summary:
    'Multiple return values, first-class functions and closures, and what replaces overloading, default arguments and builders.',
  blocks: [
    {
      type: 'prose',
      text: 'Functions in Go are first-class values: they can be stored in variables, passed as arguments and returned. They can return several values at once, which is how Go reports errors without exceptions.',
    },
    { type: 'heading', text: 'Multiple return values' },
    {
      type: 'compare',
      javaLabel: 'Java — one return value, exceptions for failure',
      goLabel: 'Go — results and error returned together',
      java: `public Message getById(long id) throws SQLException {
    return db.query(id); // failure propagates invisibly
}

try {
    Message m = getById(42L);
} catch (SQLException e) {
    // handle
}`,
      go: `func GetByID(id int64) (Message, error) {
    msg, err := db.Query(id)
    if err != nil {
        return Message{}, fmt.Errorf("get message %d: %w", id, err)
    }
    return msg, nil // nil error means success
}

msg, err := GetByID(42)
if err != nil {
    // handle it, or return it with context
}`,
    },
    {
      type: 'why',
      text: 'Returning errors as values makes every failure path visible in the code. In Java an exception can travel through many frames without any of them mentioning it. In Go, every function that can fail says so in its signature, and every caller decides what to do right there. [Error handling](/sections/errors) gets its own section later; for now, notice the shape: result first, `error` last.',
    },
    { type: 'heading', text: 'Signature features' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'variadic, grouped and named parameters',
      code: `// Consecutive parameters of one type can share it
func Clamp(v, lo, hi int) int { ... }

// Variadic: like Java's String... args. nums is a []int
func Sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

Sum(1, 2, 3)
xs := []int{4, 5}
Sum(xs...) // spread an existing slice

// Named results: documentation, and useful with defer
func ParsePair(s string) (key, value string, err error) {
    key, value, found := strings.Cut(s, "=")
    if !found {
        return "", "", fmt.Errorf("parse %q: missing '='", s)
    }
    return key, value, nil
}`,
    },
    { type: 'heading', text: 'Functions as values: how middleware works' },
    {
      type: 'compare',
      javaLabel: 'Java — functional interface + lambda',
      goLabel: 'Go — function types',
      java: `@FunctionalInterface
interface Handler {
    void handle(Message msg) throws Exception;
}

static Handler withLogging(Handler next) {
    return msg -> {
        log.info("handling {}", msg.topic());
        next.handle(msg);
    };
}`,
      go: `// A defined function type (not an alias)
type HandlerFunc func(msg Message) error

// Takes a HandlerFunc, returns one wrapping it
func WithLogging(next HandlerFunc) HandlerFunc {
    return func(msg Message) error {
        slog.Info("handling", "topic", msg.Topic)
        err := next(msg)
        if err != nil {
            slog.Error("handler failed", "err", err)
        }
        return err
    }
}

// Compose by wrapping; the outermost runs first
handler := WithLogging(WithRetry(3, process))`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Go needs no `Function`, `Supplier`, `Consumer` or `BiFunction` zoo. A function type is written directly: `func(Message) error`, `func() int`, `func(string, int) (bool, error)`. Methods can be used as values too: `srv.Handle` is a function value with `srv` already bound, like `srv::handle`.',
    },
    { type: 'heading', text: 'Closures' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'a closure captures variables, not values',
      code: `func makeCounter() func() int {
    count := 0 // captured by the returned function
    return func() int {
        count++ // shared, mutable: not "effectively final"
        return count
    }
}

next := makeCounter()
fmt.Println(next(), next(), next()) // 1 2 3`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Java lambdas may only capture effectively-final locals. Go closures capture the variable itself and can modify it. That is convenient, and it is also how data races happen when a closure runs in another goroutine; [Goroutines](/sections/goroutines#closures-and-loop-variables) covers the details, including the loop-variable change in Go 1.22.',
    },
    { type: 'heading', text: 'No overloading, no default arguments' },
    {
      type: 'prose',
      text: 'Go has neither method overloading nor default parameter values, so Java’s telescoping constructors and builders need a different shape. Use distinct names for distinct operations (`strconv.Itoa`, `strconv.FormatInt`), a config struct whose zero values are sensible defaults, or, for public constructors with many optional settings, **functional options**.',
    },
    {
      type: 'compare',
      javaLabel: 'Java — builder',
      goLabel: 'Go — functional options',
      java: `Server srv = Server.builder()
    .addr(":8080")
    .timeout(Duration.ofSeconds(5))
    .maxConns(100)
    .build();

// Plus a Builder class with a field,
// a setter and validation per option.`,
      go: `type Option func(*Server)

func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}

func WithMaxConns(n int) Option {
    return func(s *Server) { s.maxConns = n }
}

func NewServer(addr string, opts ...Option) *Server {
    s := &Server{addr: addr, timeout: 30 * time.Second}
    for _, opt := range opts {
        opt(s)
    }
    return s
}

srv := NewServer(":8080", WithTimeout(5*time.Second))`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Functional options suit libraries whose APIs must stay stable as options are added. Inside an application, a plain `Config` struct passed to `New(cfg Config)` is simpler and just as clear.',
    },
  ],
};

export default section;
