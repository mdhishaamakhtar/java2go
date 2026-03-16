import type { Section } from '@/types/section';

const section: Section = {
  id: 'http-concurrency',
  title: '20',
  label: 'HTTP Concurrency Model',
  blocks: [
    {
      type: 'prose',
      text: 'One of the most important practical differences between Java Spring and Go is how they handle concurrent HTTP requests. Java has two distinct models — imperative (thread-per-request) and reactive (event loop). Go has one model — goroutines — which gives you the efficiency of reactive without the complexity.',
    },
    {
      type: 'callout',
      title: 'The three concurrency models',
      color: '#7c9fff',
      text: "**Spring Boot MVC (imperative):** Each HTTP request is handed a thread from Tomcat's thread pool. That thread is occupied — blocked — until the response is sent. Simple to reason about, but thread count limits throughput.\n\n**Spring WebFlux (reactive):** A small number of Netty event-loop threads handle all requests using non-blocking I/O. Code must be written as reactive streams (Mono/Flux). High throughput, but a completely different programming model.\n\n**Go (net/http / Gin):** Each HTTP request spawns a goroutine (~2KB stack). The Go runtime scheduler multiplexes goroutines onto OS threads (M:N scheduling). When a goroutine blocks on I/O, the runtime parks it and runs another goroutine on that OS thread. Code looks synchronous — no callbacks, no Mono chains.",
    },
    { type: 'heading', text: 'Spring Boot MVC — thread per request' },
    {
      type: 'codeblock',
      lang: 'java',
      label: 'Spring Boot MVC — each request blocks a Tomcat thread',
      code: `// Dependency: spring-boot-starter-web  (embeds Tomcat)
// Default thread pool: up to 200 threads (server.tomcat.threads.max)

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    // Tomcat picks a thread from its pool and runs this method on it.
    // The thread is OCCUPIED until MessageController returns.
    // During service.findById() — waiting on the database — the thread
    // just sits there, blocked. It cannot serve other requests.
    // At 200 concurrent slow DB calls, the 201st request queues.
    @GetMapping("/messages/{id}")
    public ResponseEntity<Message> getMessage(@PathVariable Long id) {
        Message msg = service.findById(id);  // thread BLOCKS here
        return ResponseEntity.ok(msg);
    }
}`,
    },
    { type: 'heading', text: 'Spring WebFlux — event loop (reactive)' },
    {
      type: 'codeblock',
      lang: 'java',
      label: 'Spring WebFlux — non-blocking, but reactive types everywhere',
      code: `// Dependency: spring-boot-starter-webflux  (embeds Netty)
// Event loop threads: 2 × CPU cores  — these must NEVER block

@RestController
@RequestMapping("/api")
public class MessageController {

    private final ReactiveMessageService service;

    // Returns Mono<T> — a promise of a single future value.
    // The event loop thread is freed immediately to handle other requests.
    // When the DB responds, Netty picks up the continuation.
    // High throughput — but you must think in reactive streams.
    @GetMapping("/messages/{id}")
    public Mono<ResponseEntity<Message>> getMessage(@PathVariable Long id) {
        return service.findById(id)              // non-blocking DB call
            .map(ResponseEntity::ok)             // transform when value arrives
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // Flux<T> — a stream of multiple values over time
    @GetMapping("/messages")
    public Flux<Message> streamMessages() {
        return service.streamAll();  // emits items as they arrive
    }

    // WARNING: never call blocking code inside a Mono/Flux chain.
    // service.findById() must itself return a Mono — all the way down
    // to the DB driver (R2DBC, not JDBC). One blocking call stalls
    // the entire event loop thread and kills throughput.
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: "Reactive Java is powerful but it's a different programming model — every layer from controller to DB driver must be non-blocking. Mixing blocking JDBC inside a reactive chain stalls the event loop. Teams often migrate to WebFlux only to accidentally block anyway.",
    },
    { type: 'heading', text: 'Go Gin — goroutine per request' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'Go Gin — synchronous-looking code, goroutine-based concurrency',
      code: `// Gin wraps net/http. Go's http.Server spawns one goroutine per request.
// Goroutines start at ~2KB of stack (grows on demand, up to ~1GB).
// Millions of goroutines can coexist — no pool size to tune.

type MessageHandler struct {
    service MessageService
}

// This handler runs inside its own goroutine for every request.
// The code reads top-to-bottom like blocking code.
// When FindByID waits on the DB, the goroutine is parked —
// but its OS thread immediately picks up another runnable goroutine.
// No callbacks. No Mono chains. No reactive operators.
func (h *MessageHandler) GetMessage(c *gin.Context) {
    id := c.Param("id")

    msg, err := h.service.FindByID(c.Request.Context(), id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
        return
    }
    c.JSON(http.StatusOK, msg)
}

func main() {
    service := NewMessageService()
    handler := &MessageHandler{service: service}

    r := gin.Default()
    r.GET("/api/messages/:id", handler.GetMessage)
    // Every incoming GET /api/messages/:id → new goroutine → GetMessage
    r.Run(":8080")
}`,
    },
    {
      type: 'callout',
      title: "Go's M:N scheduler — how goroutines stay cheap",
      color: '#4ec9b0',
      text: 'Go uses **M:N scheduling**: M goroutines are multiplexed onto N OS threads, where N = `GOMAXPROCS` (defaults to number of CPU cores).\n\nWhen a goroutine blocks on I/O (DB query, HTTP call, file read), the Go runtime **parks the goroutine** and immediately assigns another runnable goroutine to that OS thread. The OS thread never sits idle.\n\nWhen the I/O completes, the goroutine becomes runnable again and is scheduled back onto any available OS thread.\n\nResult: thousands of concurrent I/O-bound goroutines, running on just a handful of OS threads — without the code complexity of reactive streams.',
    },
    { type: 'heading', text: 'Comparing the models' },
    {
      type: 'table',
      rows: [
        ['1 OS thread per request (Spring MVC)', '1 goroutine per request (~2KB)'],
        ['Thread pool: ~200 threads default', 'No pool — goroutines are spawned freely'],
        ['Thread blocks during I/O', 'Goroutine parks; OS thread serves others'],
        ['201st slow request queues at 200 threads', 'Millions of concurrent goroutines in prod'],
        ['Code is synchronous, easy to read', 'Code is synchronous, easy to read'],
        ['Thread pool size must be tuned', 'GOMAXPROCS auto-set to CPU cores'],
      ],
    },
    {
      type: 'table',
      rows: [
        ['~(2 × CPU) event loop threads (WebFlux)', 'N OS threads (GOMAXPROCS = CPU cores)'],
        [
          'Must never block event loop threads',
          'Blocking goroutines are fine — runtime handles it',
        ],
        ['Mono<T> / Flux<T> return types everywhere', 'Plain return values and error'],
        ['Entire stack must be non-blocking (R2DBC etc.)', 'Standard library drivers work as-is'],
        ['Steep learning curve', 'No new programming model to learn'],
        ['High throughput', 'Equivalent throughput'],
      ],
    },
    {
      type: 'why',
      text: "Spring WebFlux achieves non-blocking I/O throughput but forces you to rewrite every layer — controllers, services, repositories — in reactive style, using Mono and Flux. One accidental blocking call stalls the event loop. Go achieves the same throughput via goroutines while keeping synchronous-looking code. The runtime transparently parks goroutines during I/O. You get reactive-level efficiency with imperative-level readability. This is the reason many teams migrating from Java find Go's concurrency model refreshing rather than foreign.",
    },
  ],
};

export default section;
