import type { Section } from '@/types/section';

const section: Section = {
  id: 'json-http',
  title: '22',
  label: 'JSON & HTTP APIs',
  blocks: [
    {
      type: 'prose',
      text: 'The first thing most Java backend developers build in Go is an HTTP API. This section covers the two things you reach for immediately: `encoding/json` for serialisation and `net/http` for routing — both in the standard library, no dependencies required.',
    },
    { type: 'heading', text: 'encoding/json — struct tags replace annotations' },
    {
      type: 'compare',
      javaLabel: 'Java — Jackson annotations',
      goLabel: 'Go — struct tags',
      java: `// Jackson reads annotations at runtime via reflection
@JsonProperty("user_id")
private Long userId;

@JsonIgnore
private String passwordHash;

@JsonInclude(JsonInclude.Include.NON_NULL)
private String nickname;`,
      go: `// Go struct tags — parsed at compile time, evaluated at runtime
type User struct {
    UserID       int64  \`json:"user_id"\`
    PasswordHash string \`json:"-"\`          // always omit
    Nickname     string \`json:"nickname,omitempty"\` // omit if zero value
    CreatedAt    time.Time \`json:"created_at"\`
}

// Tags are the only config — no annotation processor, no ObjectMapper setup.`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`omitempty` omits the field when it holds the zero value: `""` for strings, `0` for numbers, `false` for booleans, `nil` for pointers/slices/maps. Use a pointer (`*string`) if you need to distinguish between "field absent" and "field is zero".',
    },
    { type: 'heading', text: 'Marshal and Unmarshal' },
    {
      type: 'compare',
      javaLabel: 'Java — ObjectMapper',
      goLabel: 'Go — encoding/json',
      java: `ObjectMapper mapper = new ObjectMapper();

// Serialise
String json = mapper.writeValueAsString(user);

// Deserialise
User user = mapper.readValue(jsonString, User.class);`,
      go: `// Serialise (struct → JSON bytes)
data, err := json.Marshal(user)
if err != nil { ... }
// data = []byte(\`{"user_id":1,"created_at":"..."}\`)

// Deserialise (JSON bytes → struct)
var user User
if err := json.Unmarshal(data, &user); err != nil { ... }`,
    },
    { type: 'heading', text: 'Streaming encode/decode for HTTP' },
    {
      type: 'prose',
      text: 'For HTTP request/response bodies, use the streaming encoder/decoder — it reads and writes directly from an `io.Reader`/`io.Writer` without buffering the full payload into a `[]byte` first.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'decode request body, encode response',
      code: `func (h *Handler) CreateMessage(w http.ResponseWriter, r *http.Request) {
    var req CreateMessageRequest
    // Decode directly from r.Body — no intermediate []byte
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid JSON", http.StatusBadRequest)
        return
    }

    msg, err := h.service.Create(r.Context(), req)
    if err != nil {
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }

    // Encode directly into w — no intermediate []byte
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(msg)
}`,
    },
    { type: 'heading', text: 'net/http — the Handler interface' },
    {
      type: 'compare',
      javaLabel: 'Java — Spring @RestController',
      goLabel: 'Go — http.Handler interface',
      java: `@RestController
@RequestMapping("/api")
public class MessageController {

    @GetMapping("/messages/{id}")
    public ResponseEntity<Message> get(@PathVariable Long id) {
        // Spring handles: routing, JSON serialisation,
        // status code, Content-Type header
        return ResponseEntity.ok(service.findById(id));
    }
}`,
      go: `// http.Handler is a single-method interface:
// type Handler interface { ServeHTTP(ResponseWriter, *Request) }

// HandlerFunc is a function adapter — same as implementing the interface
type MessageHandler struct{ service MessageService }

func (h *MessageHandler) Get(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")  // Go 1.22+ stdlib path variable

    msg, err := h.service.FindByID(r.Context(), id)
    if err != nil {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(msg)
}`,
    },
    { type: 'heading', text: 'Routing with net/http (Go 1.22+)' },
    {
      type: 'prose',
      text: 'Go 1.22 added method and wildcard routing to `net/http.ServeMux`. For many services the standard library is now sufficient — no Gin or chi required.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'Go 1.22+ stdlib routing',
      code: `handler := &MessageHandler{service: NewMessageService()}

mux := http.NewServeMux()

// "METHOD /path/{variable}" — Go 1.22+
mux.HandleFunc("GET /api/messages/{id}", handler.Get)
mux.HandleFunc("POST /api/messages", handler.Create)
mux.HandleFunc("DELETE /api/messages/{id}", handler.Delete)

// r.PathValue("id") retrieves the wildcard value inside handlers

srv := &http.Server{
    Addr:         ":8080",
    Handler:      mux,
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
}
srv.ListenAndServe()`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Always set `ReadTimeout` and `WriteTimeout` on `http.Server`. The zero value means no timeout — a slow client can hold a goroutine open indefinitely. A common production default is 5s read, 10–30s write depending on expected response times.',
    },
    { type: 'heading', text: 'Middleware — wrapping handlers' },
    {
      type: 'compare',
      javaLabel: 'Java — Spring @Component filter / HandlerInterceptor',
      goLabel: 'Go — handler wrapping',
      java: `@Component
public class LoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException {
        long start = System.currentTimeMillis();
        chain.doFilter(req, res);
        log.info("{}ms", System.currentTimeMillis() - start);
    }
}`,
      go: `// Middleware is just a function: takes a Handler, returns a Handler
func withLogging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)  // call the inner handler
        slog.Info("request", "method", r.Method, "path", r.URL.Path,
            "duration", time.Since(start))
    })
}

// Stack middleware by nesting:
mux.Handle("/api/", withAuth(withLogging(apiHandler)))`,
    },
    {
      type: 'why',
      text: 'Go middleware is plain functions — no framework registration, no annotation scanning, no bean wiring. You compose them by wrapping: `withAuth(withLogging(handler))`. The innermost function is called last. This is the same pattern as Java\'s `FilterChain`, but without any framework machinery.',
    },
    { type: 'heading', text: 'Full minimal API example' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'complete HTTP API — stdlib only, no dependencies',
      code: `package main

import (
    "encoding/json"
    "log/slog"
    "net/http"
    "time"
)

type Message struct {
    ID   string \`json:"id"\`
    Body string \`json:"body"\`
}

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("GET /api/messages/{id}", func(w http.ResponseWriter, r *http.Request) {
        id := r.PathValue("id")
        msg := Message{ID: id, Body: "hello"}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(msg)
    })

    mux.HandleFunc("POST /api/messages", func(w http.ResponseWriter, r *http.Request) {
        var msg Message
        if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
            http.Error(w, "bad request", http.StatusBadRequest)
            return
        }
        // ... persist msg
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(msg)
    })

    srv := &http.Server{
        Addr:         ":8080",
        Handler:      mux,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
    }
    slog.Info("listening", "addr", srv.Addr)
    srv.ListenAndServe()
}`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`encoding/json/v2` is available as an experiment in Go 1.25+ (`GOEXPERIMENT=jsonv2`) with better performance and stricter semantics. As of Go 1.26 it is still experimental and not subject to the compatibility promise. Stick with `encoding/json` for production code until v2 stabilises.',
    },
  ],
};

export default section;
