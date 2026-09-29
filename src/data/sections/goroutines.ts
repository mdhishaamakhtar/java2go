import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'goroutines',
  label: 'Goroutines',
  summary:
    'Goroutines vs platform and virtual threads, the go keyword, the loop-variable change in Go 1.22, WaitGroup, and how to see what is running.',
  blocks: [
    {
      type: 'prose',
      text: 'A goroutine is a function running concurrently with the rest of the program. You start one by putting `go` in front of a function call. The Go runtime multiplexes goroutines onto a small pool of OS threads, parks them when they block, and resumes them when they can continue.',
    },
    { type: 'heading', text: 'Threads, virtual threads and goroutines' },
    {
      type: 'table',
      rows: [
        [
          'Platform thread: one OS thread, ~1 MB of reserved stack by default',
          'Goroutine: a few KB of stack that grows and shrinks as needed',
        ],
        [
          'Virtual thread (Java 21+): JVM-scheduled on carrier threads',
          'Goroutine: runtime-scheduled onto OS threads (M:N)',
        ],
        [
          'Thousands of platform threads is a lot; virtual threads scale to millions',
          'Hundreds of thousands of goroutines is routine',
        ],
        ['`Thread.ofVirtual().start(task)`', '`go task()`'],
        ['`Executors.newVirtualThreadPerTaskExecutor()`', 'No executor: `go` is the executor'],
        [
          '`Future` / `CompletableFuture` for results',
          'Channels, or shared state + `sync.WaitGroup`',
        ],
        [
          '`Thread.interrupt()` for cancellation',
          '`context.Context` (see [Context](/sections/context))',
        ],
      ],
    },
    {
      type: 'callout',
      title: 'Virtual threads narrowed the gap, they did not close it',
      tone: 'java',
      text: 'Java 21’s virtual threads bring the same idea to the JVM: cheap threads, blocking code, a scheduler underneath. The differences are ecosystem-wide rather than per-thread. In Go every library has always been written for this model, so there is no `synchronized` pinning to audit (Java 24 fixed most pinning), no thread-local habits to unlearn, and no reactive stack to choose instead. Cancellation through `context.Context` is also universal, where Java’s interruption is best-effort.',
    },
    { type: 'heading', text: 'Starting a goroutine' },
    {
      type: 'compare',
      javaLabel: 'Java — a thread or an executor',
      goLabel: 'Go — the go keyword',
      java: `// A virtual thread (Java 21+)
Thread t = Thread.ofVirtual().start(() -> process(msg));

// Or an executor
try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    pool.submit(() -> process(msg));
} // close() waits for submitted tasks`,
      go: `// Prefix any function call with go
go process(msg)

// Or an anonymous function, called immediately
go func() {
    process(msg)
}() // <- these parentheses call it

// The current goroutine continues IMMEDIATELY.
// Nothing waits for process() unless you arrange it.`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'When `main` returns, the program exits, and every other goroutine is stopped mid-flight with no cleanup. There is no equivalent of a non-daemon thread keeping the JVM alive. Anything that must finish needs an explicit wait: a `WaitGroup`, a channel, or `errgroup`.',
    },
    { type: 'heading', text: 'How the scheduler works' },
    {
      type: 'callout',
      title: 'Parked, not blocked',
      tone: 'info',
      text: 'The runtime keeps `GOMAXPROCS` goroutines executing Go code at once. By default that is the number of CPU cores, and since **Go 1.25** it also respects a container’s CPU limit (for example a Kubernetes CPU limit), so Go services no longer need a library to set it.\n\nWhen a goroutine waits on a network read, a channel, a lock or a timer, the runtime parks it and runs another goroutine on that thread. Network I/O goes through the runtime’s poller (epoll/kqueue), so thousands of waiting connections cost memory, not threads. Blocking system calls such as file I/O do occupy a thread; the runtime simply starts another one to keep the other goroutines running.',
    },
    { type: 'heading', text: 'Closures and loop variables' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the classic bug, fixed in Go 1.22',
      code: `for _, msg := range messages {
    go func() {
        fmt.Println(msg.Topic)
    }()
}

// Go 1.22+: each iteration has its OWN msg variable, so this
// prints every topic. Before 1.22 there was one msg shared by
// all iterations, and the goroutines could all print the last one.
//
// The semantics follow the "go" line in go.mod, not the compiler:
// a module that still says "go 1.21" keeps the old behaviour.

// The old workaround, still common in existing code:
for _, msg := range messages {
    go func(m Message) {
        fmt.Println(m.Topic)
    }(msg) // evaluated now, copied into m
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Go 1.22 fixed loop variables, not data races. A goroutine that writes a variable another goroutine reads, such as a counter declared outside the loop, still needs synchronisation. Run your tests with `go test -race`.',
    },
    { type: 'heading', text: 'Waiting for goroutines: sync.WaitGroup' },
    {
      type: 'compare',
      javaLabel: 'Java — CountDownLatch',
      goLabel: 'Go — WaitGroup.Go (Go 1.25+)',
      java: `CountDownLatch latch = new CountDownLatch(messages.size());

for (Message msg : messages) {
    executor.submit(() -> {
        try {
            process(msg);
        } finally {
            latch.countDown();
        }
    });
}
latch.await(); // block until the count reaches zero`,
      go: `var wg sync.WaitGroup

for _, msg := range messages {
    wg.Go(func() { // Add(1), go, and Done() in one call
        process(msg)
    })
}

wg.Wait() // block until every function has returned
fmt.Println("all done")`,
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the pre-1.25 form you will see everywhere',
      code: `var wg sync.WaitGroup
for _, msg := range messages {
    wg.Add(1)          // BEFORE starting the goroutine
    go func() {
        defer wg.Done() // runs even if process returns early
        process(msg)
    }()
}
wg.Wait()

// Calling wg.Add(1) inside the goroutine is a race: Wait() can
// run first and return early. go vet (Go 1.25+) reports it.`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'When the goroutines can fail, you usually want the first error and cancellation of the rest. That is `errgroup.Group` from `golang.org/x/sync/errgroup`, covered in [Goroutine Management](/sections/goroutine-mgmt#errgroup-run-tasks-fail-fast-wait-for-all).',
    },
    { type: 'heading', text: 'Seeing what is running' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'goroutine counts, dumps and profiles',
      code: `// How many goroutines exist right now?
slog.Info("runtime", "goroutines", runtime.NumGoroutine())

// pprof: import for side effects, serve on an internal port
import _ "net/http/pprof"

go func() {
    // localhost only: profiles expose internals
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()

// Full stack of every goroutine, grouped (like jstack):
//   curl 'localhost:6060/debug/pprof/goroutine?debug=2'
//
// Go 1.27+: goroutines that can provably never wake up:
//   curl 'localhost:6060/debug/pprof/goroutineleak?debug=1'`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'The equivalents of `jstack`, JFR and VisualVM are built in: `pprof` for CPU, heap, goroutine, mutex and block profiles, and `go tool trace` for a timeline of scheduler events. Sending `SIGQUIT` (Ctrl+\\) to a Go process prints every goroutine’s stack and exits, which is handy for a hung program.',
    },
  ],
};

export default section;
