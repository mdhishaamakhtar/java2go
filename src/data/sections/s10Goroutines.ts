import type { Section } from '@/types/section';

const section: Section = {
  id: 'goroutines',
  title: '10',
  label: 'Goroutines',
  blocks: [
    {
      type: 'prose',
      text: 'A goroutine is a function running concurrently with others in the same process. Start one with `go functionCall()`. The Go runtime schedules goroutines across OS threads automatically.',
    },
    { type: 'heading', text: 'Thread vs Goroutine' },
    {
      type: 'table',
      rows: [
        ['Java Thread', 'Go Goroutine'],
        ['~1MB initial stack', '~2KB initial stack, grows on demand'],
        ['Managed by OS', 'Managed by Go runtime scheduler'],
        ['~10K threads before OOM', 'Millions of goroutines in production'],
        ['new Thread(() -> ...).start()', 'go func() { ... }()'],
        ['Future/CompletableFuture for results', 'Channels for results (next section)'],
        ['Thread pool (ExecutorService)', 'No pool needed — goroutines are cheap'],
      ],
    },
    { type: 'heading', text: 'Starting a goroutine' },
    {
      type: 'compare',
      javaLabel: 'Java — Thread or ExecutorService',
      goLabel: 'Go — go keyword',
      java: `// Java — create a thread explicitly
Thread t = new Thread(() -> {
    processMessage(msg);
});
t.start();

// Or use an executor pool:
ExecutorService pool = Executors.newFixedThreadPool(8);
pool.submit(() -> processMessage(msg));`,
      go: `// Go — prefix any function call with 'go'
// That's it. No thread object, no pool.
go processMessage(msg)

// With an anonymous function:
go func() {
    processMessage(msg)
}()
// The () at the end calls the function immediately
// 'go' starts it in a new goroutine

// Current goroutine continues IMMEDIATELY
// Does not wait for processMessage to finish`,
    },
    { type: 'heading', text: 'Goroutine lifecycle' },
    {
      type: 'callout',
      title: 'Four states',
      color: '#7c9fff',
      text: `**Runnable** — created with \`go\`, waiting for a thread slot\n**Running** — executing on an OS thread right now\n**Waiting** — blocked on I/O, sleep, or synchronisation. Its OS thread is freed for other goroutines\n**Dead** — function returned. Stack reclaimed. No explicit join.\n\nThe scheduler runs GOMAXPROCS OS threads (= CPU cores by default). When a goroutine blocks, its thread immediately picks up another runnable goroutine. This is why Go can handle thousands of concurrent I/O operations with only a handful of threads.`,
    },
    { type: 'heading', text: 'go func() — anonymous goroutine, fully explained' },
    {
      type: 'codeblock',
      lang: 'go',
      label: "every part of 'go func() { ... }()' explained",
      code: `// Break down:  go  func()  {  ...  }  ()
//              ^   ^            ^   ^
//              |   |            |   +-- () calls the function immediately
//              |   |            +------ function body
//              |   +------------------- anonymous function literal
//              +----------------------- start in a new goroutine

counter := 0

go func() {
    // This runs in a NEW goroutine concurrently
    // It CAN access 'counter' from outer scope (closure)
    // But concurrent access without synchronisation is a data race!
    counter++
}()

// The current goroutine continues here IMMEDIATELY
// counter++ above may or may not have run yet`,
    },
    { type: 'heading', text: 'The closure capture bug — very common mistake' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'loop variable capture — wrong vs right',
      code: `messages := []Message{{Topic: "a"}, {Topic: "b"}, {Topic: "c"}}

// ─── WRONG ───────────────────────────────────────────────────
for _, msg := range messages {
    go func() {
        // BUG: msg is the LOOP VARIABLE — shared across all iterations
        // By the time this goroutine runs, the loop may have advanced
        // All three goroutines may print the SAME last message
        fmt.Println(msg.Topic)
    }()
}

// ─── CORRECT — pass as argument ──────────────────────────────
for _, msg := range messages {
    go func(m Message) {  // m is a new parameter, scoped to THIS goroutine
        // m is a copy of msg at the moment this goroutine was launched
        // Safe — no sharing with other goroutines or loop iterations
        fmt.Println(m.Topic)
    }(msg)  // msg evaluated HERE, copied into m
}`,
    },
    { type: 'heading', text: 'WaitGroup — waiting for goroutines to finish' },
    {
      type: 'compare',
      javaLabel: 'Java — Future or CountDownLatch',
      goLabel: 'Go — sync.WaitGroup',
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
latch.await();  // block until count = 0`,
      go: `var wg sync.WaitGroup
// WaitGroup is a counter:
// Add(n)  ->  counter += n
// Done()  ->  counter -= 1   (call when goroutine finishes)
// Wait()  ->  block until counter == 0

for _, msg := range messages {
    wg.Add(1)               // counter++ before launching
    go func(m Message) {
        defer wg.Done()     // counter-- guaranteed, even on panic
        process(m)
    }(msg)
}

wg.Wait()  // blocks until all goroutines call Done()
fmt.Println("all done")`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: '`wg.Add(1)` must be called BEFORE launching the goroutine, in the parent goroutine. If you call it inside the goroutine, `wg.Wait()` may return before Add() even executes.',
    },
    { type: 'heading', text: 'Debugging goroutines' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'runtime inspection — how many are running?',
      code: `import "runtime"

// Count goroutines right now
n := runtime.NumGoroutine()
fmt.Printf("goroutines running: %d\\n", n)

// Print full stack trace of EVERY goroutine — invaluable for debugging hangs
buf := make([]byte, 1<<20)              // 1MB buffer
n = runtime.Stack(buf, true)             // true = include all goroutines
fmt.Printf("%s", buf[:n])

// Expose count as an HTTP endpoint (add to your server):
http.HandleFunc("/debug/goroutines", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "goroutines: %d", runtime.NumGoroutine())
})

// pprof gives you goroutine dumps, CPU profiles, heap profiles:
import _ "net/http/pprof"   // registers /debug/pprof/ routes in init()
// curl localhost:8080/debug/pprof/goroutine?debug=2`,
    },
  ],
};

export default section;
