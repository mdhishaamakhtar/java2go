import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'http-concurrency',
  label: 'HTTP Concurrency Model',
  summary:
    'Thread-per-request, reactive WebFlux, virtual threads and Go’s goroutine-per-request: how each model handles slow I/O, and what that means for your code.',
  blocks: [
    {
      type: 'prose',
      text: 'How a server handles thousands of concurrent requests that each wait on a database shapes how you write every handler. The Java world has had three answers over the years. Go has had one since day one.',
    },
    {
      type: 'callout',
      title: 'Four concurrency models',
      tone: 'info',
      text: '**Spring MVC on platform threads:** each request occupies a Tomcat worker thread (200 by default) until the response is written, including all the time spent waiting on I/O. Simple code; thread count caps concurrency.\n\n**Spring WebFlux (reactive):** a few Netty event-loop threads serve every request with non-blocking I/O. High concurrency, but every layer must return `Mono`/`Flux` and nothing may block.\n\n**Spring MVC on virtual threads (Java 21+):** set `spring.threads.virtual.enabled=true` and each request runs on a cheap virtual thread that unmounts while blocked. Blocking code, high concurrency.\n\n**Go `net/http`:** every connection is served by its own goroutine. Blocking calls park the goroutine and free the OS thread. Blocking code, high concurrency, and the only model the ecosystem has ever used.',
    },
    { type: 'heading', text: 'Spring MVC: a thread per request' },
    {
      type: 'codeblock',
      lang: 'java',
      label: 'each request holds a Tomcat worker for its whole lifetime',
      code: `@RestController
@RequestMapping("/api")
class MessageController {
    private final MessageService service;

    MessageController(MessageService service) {
        this.service = service;
    }

    @GetMapping("/messages/{id}")
    Message get(@PathVariable long id) {
        // On platform threads, this worker sits idle while the
        // database answers. With server.tomcat.threads.max=200,
        // request 201 waits in the accept queue.
        return service.findById(id);
    }
}`,
    },
    { type: 'heading', text: 'Spring WebFlux: reactive all the way down' },
    {
      type: 'codeblock',
      lang: 'java',
      label: 'non-blocking, but every layer must be reactive',
      code: `@RestController
@RequestMapping("/api")
class MessageController {
    private final ReactiveMessageService service;

    MessageController(ReactiveMessageService service) {
        this.service = service;
    }

    @GetMapping("/messages/{id}")
    Mono<ResponseEntity<Message>> get(@PathVariable long id) {
        return service.findById(id)          // R2DBC, not JDBC
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    // One accidental blocking call inside the chain stalls an
    // event-loop thread, and every request queued behind it.
}`,
    },
    { type: 'heading', text: 'Go: a goroutine per request' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'plain blocking code, served concurrently',
      code: `type MessageHandler struct {
    messages *message.Service
}

// net/http runs this in the goroutine serving the connection.
// While Find waits on Postgres, the goroutine is parked and its
// OS thread runs other goroutines. No callbacks, no Mono.
func (h *MessageHandler) Get(w http.ResponseWriter, r *http.Request) {
    msg, err := h.messages.Find(r.Context(), r.PathValue("id"))
    if err != nil {
        writeError(w, statusFor(err), "could not load message")
        return
    }
    writeJSON(w, http.StatusOK, msg)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/messages/{id}", handler.Get)
    // ... server with timeouts, graceful shutdown (see Lifecycle)
}`,
    },
    {
      type: 'callout',
      title: 'Why goroutines stay cheap: the M:N scheduler',
      tone: 'go',
      text: 'The runtime multiplexes many goroutines (G) onto a few OS threads (M) through `GOMAXPROCS` logical processors (P), by default one per available CPU core.\n\nWhen a goroutine waits on the network, it is parked and its thread picks up another runnable goroutine. The runtime’s network poller (epoll on Linux, kqueue on macOS) wakes it when data arrives. When a goroutine makes a blocking system call, the runtime hands its processor to another thread so the rest keep running.\n\nIdle goroutines cost only their stack, a few kilobytes. Tens of thousands of in-flight requests fit comfortably in memory.',
    },
    { type: 'heading', text: 'Comparing the models' },
    {
      type: 'table',
      head: ['', 'Spring MVC + platform threads', 'Spring MVC + virtual threads', 'Go net/http'],
      rows: [
        [
          'Unit of work',
          'OS thread (~1 MB stack reserved)',
          'Virtual thread (heap-allocated stack)',
          'Goroutine (few-KB growable stack)',
        ],
        [
          'While waiting on I/O',
          'Thread blocked',
          'Unmounted from its carrier',
          'Parked; thread runs others',
        ],
        [
          'Concurrency limit',
          'Thread pool size (200)',
          'Memory, and downstream pools',
          'Memory, and downstream pools',
        ],
        ['Code style', 'Blocking', 'Blocking', 'Blocking'],
        [
          'Cancellation',
          'Interrupts, per-library timeouts',
          'Interrupts, per-library timeouts',
          '`context.Context` everywhere',
        ],
        [
          'Caveats',
          'Tune pool sizes',
          'Pinning, ThreadLocal cost, library readiness',
          'Bound fan-out yourself',
        ],
      ],
    },
    {
      type: 'why',
      text: 'Reactive frameworks bought high concurrency by giving up readable, blocking code. Virtual threads, and goroutines before them, show you do not have to choose. Go’s advantage today is less about raw throughput than about uniformity: every driver, client and library in the ecosystem was written for this model, and every one of them accepts a `context.Context` for cancellation.',
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'Cheap concurrency moves the bottleneck downstream. With no thread pool limiting you, 10,000 concurrent requests become 10,000 concurrent database queries unless something bounds them. Size your database pool (`pgxpool` `MaxConns`, or `db.SetMaxOpenConns`), set timeouts, and use `errgroup.SetLimit` or rate limiting for fan-out.',
    },
  ],
};

export default section;
