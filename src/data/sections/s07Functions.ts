import type { Section } from '@/types/section';

const section: Section = {
  id: 'functions',
  title: '07',
  label: 'Functions',
  blocks: [
    {
      type: 'prose',
      text: 'Functions in Go are first-class values. They can be stored, passed, and returned. There are no exceptions — errors are explicit return values. This is a fundamental difference from Java.',
    },
    { type: 'heading', text: 'Function basics and multiple returns' },
    {
      type: 'compare',
      javaLabel: 'Java — single return, exceptions for errors',
      goLabel: 'Go — multiple returns, errors as values',
      java: `// Java — throw for errors
public Message getById(long id) throws SQLException {
    // throws propagates up invisibly
    return db.query(id);
}

// Caller must catch or declare throws
try {
    Message m = getById(42L);
} catch (SQLException e) {
    // handle
}`,
      go: `// Go — return the error alongside the result
func GetByID(id int64) (Message, error) {
    msg, err := db.Query(id)  // err is a value
    if err != nil {
        return Message{}, fmt.Errorf("GetByID %d: %w", id, err)
    }
    return msg, nil  // nil = no error
}

// Caller MUST handle — there is no try/catch to skip it
msg, err := GetByID(42)
if err != nil {
    // handle explicitly
}`,
    },
    {
      type: 'why',
      text: 'Errors as return values make every failure path explicit. In Java, exceptions can propagate invisibly through many stack frames. In Go, every function that can fail says so in its signature, and every caller decides what to do. The code is more verbose, but you can trace any failure path by reading the code top-to-bottom.',
    },
    { type: 'heading', text: 'Error wrapping — building context up the call chain' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'fmt.Errorf with %w — wrap and preserve errors',
      code: `// %w wraps the original error — callers can inspect it
func GetMessage(id int64) (Message, error) {
    msg, err := store.GetByID(id)
    if err != nil {
        // Add context: which operation failed, what ID
        // %w preserves the original error for errors.As / errors.Is
        return Message{}, fmt.Errorf("GetMessage id=%d: %w", id, err)
    }
    return msg, nil
}

// Stack of wrapped errors builds a readable trace:
// 'handler.GetMessage id=42: store.GetByID: sql: no rows in result set'

// Unwrap the chain to find a specific error type:
var notFound *NotFoundError
if errors.As(err, &notFound) {  // searches entire wrapped chain
    // handle not found specifically
}`,
    },
    { type: 'heading', text: 'Functions as values — how middleware works' },
    {
      type: 'compare',
      javaLabel: 'Java — functional interface / lambda',
      goLabel: 'Go — function type',
      java: `@FunctionalInterface
interface Handler {
    void handle(Message msg);
}

// Middleware via function composition
Handler withLogging(Handler h) {
    return msg -> {
        log.info("handling " + msg.topic);
        h.handle(msg);
    };
}`,
      go: `// Define a function type — just like a type alias
type HandlerFunc func(msg Message) error

// Middleware: takes a HandlerFunc, returns a HandlerFunc
// The returned function wraps the original with extra behaviour
func WithLogging(h HandlerFunc) HandlerFunc {
    return func(msg Message) error {
        fmt.Printf("handling topic: %s\\n", msg.Topic)
        err := h(msg)      // call the original handler
        if err != nil {
            fmt.Printf("handler error: %v\\n", err)
        }
        return err
    }
}

// Chain middleware — each wraps the next
handler := WithLogging(WithRetry(3, myHandler))`,
    },
    { type: 'heading', text: 'Closures — functions that capture outer variables' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'closures — function remembers its birth environment',
      code: `// A closure captures variables from the enclosing scope
// The function and the captured variables are bundled together

func makeCounter() func() int {
    count := 0  // this variable is captured by the returned function
    return func() int {
        count++  // count lives as long as the returned function lives
        return count
    }
}

counter := makeCounter()
fmt.Println(counter())  // 1
fmt.Println(counter())  // 2
fmt.Println(counter())  // 3

// Important in goroutines — closures capture variables BY REFERENCE
// (covered in the goroutines section — this causes a common bug)`,
    },
  ],
};

export default section;
