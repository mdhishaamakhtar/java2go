import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'json-http',
  label: 'JSON & HTTP APIs',
  summary:
    'encoding/json in place of Jackson, net/http routing in place of Spring MVC, request limits and error mapping, middleware, and calling other services safely.',
  blocks: [
    {
      type: 'prose',
      text: 'The first thing most Java backend developers build in Go is an HTTP API. The standard library covers the essentials: `encoding/json` for serialisation and `net/http` for both servers and clients. Many production Go services use no web framework at all.',
    },
    { type: 'heading', text: 'encoding/json: struct tags instead of annotations' },
    {
      type: 'compare',
      javaLabel: 'Java — Jackson annotations',
      goLabel: 'Go — struct tags',
      java: `public class User {
    @JsonProperty("user_id")
    private Long userId;

    @JsonIgnore
    private String passwordHash;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String nickname;

    private Instant createdAt; // needs JavaTimeModule
}`,
      go: `type User struct {
    UserID       int64     \`json:"user_id"\`
    PasswordHash string    \`json:"-"\`                  // never serialised
    Nickname     string    \`json:"nickname,omitempty"\` // omit when ""
    CreatedAt    time.Time \`json:"created_at"\`         // RFC 3339
}

// Only exported (capitalised) fields are serialised.
// No ObjectMapper, no modules to register.`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`omitempty` omits zero values of basic types and empty slices, maps and strings, but **not** empty structs such as a zero `time.Time`. `omitzero` (Go 1.24+) omits any zero value, including structs, and respects an `IsZero()` method. Use a pointer such as `*string` when you must distinguish "absent" from "empty".',
    },
    {
      type: 'compare',
      javaLabel: 'Java — ObjectMapper',
      goLabel: 'Go — Marshal and Unmarshal',
      java: `ObjectMapper mapper = new ObjectMapper();

String json = mapper.writeValueAsString(user);
User back = mapper.readValue(json, User.class);`,
      go: `data, err := json.Marshal(user) // []byte
if err != nil { ... }

var back User
if err := json.Unmarshal(data, &back); err != nil { ... }
// Unknown JSON fields are ignored by default, like
// FAIL_ON_UNKNOWN_PROPERTIES = false.`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '**Go 1.27** made `encoding/json/v2` stable and moved the classic `encoding/json` package onto its implementation, so existing code gets much faster decoding with no changes. The v2 API (`json.MarshalWrite`, `json.UnmarshalRead`, options such as `json.RejectUnknownMembers(true)`) is stricter by default: it rejects invalid UTF-8 and duplicate object keys. New code can adopt it gradually.',
    },
    { type: 'heading', text: 'Routing with net/http (Go 1.22+)' },
    {
      type: 'compare',
      javaLabel: 'Java — Spring @RestController',
      goLabel: 'Go — ServeMux patterns',
      java: `@RestController
@RequestMapping("/api/messages")
class MessageController {
    @GetMapping("/{id}")
    Message get(@PathVariable String id) { ... }

    @PostMapping
    ResponseEntity<Message> create(
            @RequestBody @Valid NewMessage in) { ... }

    @DeleteMapping("/{id}")
    void delete(@PathVariable String id) { ... }
}`,
      go: `mux := http.NewServeMux()

// "METHOD /path/{wildcard}", matched most-specific first
mux.HandleFunc("GET /api/messages/{id}", h.Get)
mux.HandleFunc("POST /api/messages", h.Create)
mux.HandleFunc("DELETE /api/messages/{id}", h.Delete)

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id") // the {id} segment
    ...
}

// A request with the wrong method gets 405 with an Allow
// header automatically. GET patterns also answer HEAD.`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Before Go 1.22 the standard router could not match methods or path variables, which is why so much existing Go code uses chi, Gin, Echo or gorilla/mux. For a new service the standard library is usually enough. chi is a popular step up because its handlers are still plain `http.Handler`s.',
    },
    { type: 'heading', text: 'Reading requests and writing responses' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'small helpers every Go API ends up with',
      code: `// Spring does these for you; in Go they are ~20 lines you own.
func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status) // headers must be set BEFORE this call
    if err := json.NewEncoder(w).Encode(v); err != nil {
        // Too late to change the status: the client already has it
        slog.Error("write response", "err", err)
    }
}

func writeError(w http.ResponseWriter, status int, msg string) {
    writeJSON(w, status, map[string]string{"error": msg})
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
    r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // reject bodies > 1 MB
    dec := json.NewDecoder(r.Body)
    dec.DisallowUnknownFields() // typo'd fields become 400s, not silent drops
    if err := dec.Decode(dst); err != nil {
        return fmt.Errorf("invalid JSON: %w", err)
    }
    return nil
}`,
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'mapping domain errors to status codes',
      code: `func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
    msg, err := h.messages.Find(r.Context(), r.PathValue("id"))
    switch {
    case err == nil:
        writeJSON(w, http.StatusOK, msg)
    case errors.Is(err, message.ErrNotFound):
        writeError(w, http.StatusNotFound, "message not found")
    case errors.Is(err, context.DeadlineExceeded):
        writeError(w, http.StatusGatewayTimeout, "timed out")
    default:
        // Log the details, return a generic message: never leak internals
        slog.ErrorContext(r.Context(), "get message", "err", err)
        writeError(w, http.StatusInternalServerError, "internal error")
    }
}`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'This `switch` plays the role of a Spring `@ControllerAdvice` with `@ExceptionHandler` methods. Larger codebases often move it into one function, `func statusFor(err error) int`, shared by every handler.',
    },
    { type: 'heading', text: 'Middleware' },
    {
      type: 'compare',
      javaLabel: 'Java — servlet Filter',
      goLabel: 'Go — a function wrapping a Handler',
      java: `@Component
public class TimingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        long start = System.nanoTime();
        chain.doFilter(req, res);
        long ms = (System.nanoTime() - start) / 1_000_000;
        log.info("{} {} {}ms",
            req.getMethod(), req.getRequestURI(), ms);
    }
}`,
      go: `func withTiming(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        slog.InfoContext(r.Context(), "request",
            "method", r.Method,
            "path", r.URL.Path,
            "duration", time.Since(start))
    })
}

// Compose by wrapping: the outermost runs first
handler := withRecovery(withTiming(withAuth(mux)))`,
    },
    {
      type: 'why',
      text: 'Middleware is just a function from `http.Handler` to `http.Handler`. There is no registration, ordering annotation or filter chain object: the order is the nesting you can see. The same shape works with every router built on `net/http`.',
    },
    { type: 'heading', text: 'Server timeouts' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the zero value means "no timeout at all"',
      code: `srv := &http.Server{
    Addr:              ":8080",
    Handler:           handler,
    ReadHeaderTimeout: 5 * time.Second,  // slow-header (Slowloris) protection
    ReadTimeout:       15 * time.Second, // whole request, including body
    WriteTimeout:      30 * time.Second, // until the response is written
    IdleTimeout:       2 * time.Minute,  // keep-alive connections
}
// http.ListenAndServe(":8080", h) uses a server with NO timeouts.
// Fine for a demo, not for production.`,
    },
    { type: 'heading', text: 'Calling other services' },
    {
      type: 'compare',
      javaLabel: 'Java — java.net.http.HttpClient',
      goLabel: 'Go — http.Client',
      java: `HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(2))
    .build();

HttpRequest req = HttpRequest.newBuilder(URI.create(url))
    .timeout(Duration.ofSeconds(5))
    .build();

HttpResponse<String> res =
    client.send(req, HttpResponse.BodyHandlers.ofString());`,
      go: `// Create once and reuse: it pools connections
var client = &http.Client{Timeout: 10 * time.Second}

func fetchUser(ctx context.Context, url string) (*User, error) {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, err
    }
    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("fetch user: %w", err)
    }
    defer resp.Body.Close() // always, or the connection leaks

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("fetch user: unexpected status %s", resp.Status)
    }
    var u User
    if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
        return nil, fmt.Errorf("decode user: %w", err)
    }
    return &u, nil
}`,
    },
    {
      type: 'callout',
      title: 'Three http.Client mistakes to avoid',
      tone: 'warn',
      text: '**`http.DefaultClient` has no timeout.** `http.Get(url)` uses it, and a hung server hangs your goroutine forever. Always use a client with a `Timeout`, and pass a context with `NewRequestWithContext`.\n\n**Non-2xx responses are not errors.** `client.Do` only returns an error for transport failures; a 500 is a successful round trip. Check `resp.StatusCode` yourself.\n\n**Always close the body**, even when you don’t read it. An unclosed body keeps the connection out of the pool.',
    },
  ],
};

export default section;
