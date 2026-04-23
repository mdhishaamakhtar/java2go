import type { Section } from '@/types/section';

const section: Section = {
  id: 'goroutine-mgmt',
  title: '14',
  label: 'Goroutine Management',
  blocks: [
    {
      type: 'prose',
      text: 'Now that goroutines, channels, and sync primitives are covered: how do you start, stop, and keep goroutines under control in production? This is where the real patterns live.',
    },
    { type: 'heading', text: 'Stop channel — basic shutdown signal' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'chan struct{} as a stop signal',
      code: `// A goroutine with no exit path runs forever — goroutine leak.
// The stop channel pattern: close a channel to broadcast 'stop'

type Worker struct {
    inputCh chan Message    // receives work
    stopCh  chan struct{}   // receives shutdown signal
    // struct{} costs zero bytes — this channel carries no data
    // closing it is the signal
}

func (w *Worker) Run() {
    for {
        select {
        case msg := <-w.inputCh:
            process(msg)
        case <-w.stopCh:
            // stopCh was closed — this unblocks immediately
            // All goroutines selecting on stopCh get unblocked
            fmt.Println("shutting down")
            return  // goroutine exits
        }
    }
}

func (w *Worker) Stop() {
    close(w.stopCh)  // broadcasts to all goroutines selecting on stopCh
}`,
    },
    { type: 'heading', text: 'context.Context — the production stop mechanism' },
    {
      type: 'compare',
      javaLabel: 'Java — InterruptedException / CancellationToken',
      goLabel: 'Go — context.Context',
      java: `// Java — thread interruption
Thread t = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        processNext();
    }
});
t.start();
// Later:
t.interrupt();`,
      go: `// context carries a cancellation signal AND a deadline
// Pass as first arg to every long-running or I/O function

func (w *Worker) Run(ctx context.Context) {
    for {
        select {
        case msg := <-w.inputCh:
            process(msg)
        case <-ctx.Done():
            // ctx was cancelled or timed out
            fmt.Println("reason:", ctx.Err())
            return
        }
    }
}

ctx, cancel := context.WithCancel(context.Background())
defer cancel()  // always defer — frees resources
go w.Run(ctx)
cancel()  // stops the goroutine`,
    },
    {
      type: 'why',
      text: 'context.Context can be passed to DB queries, HTTP calls, and your own goroutines — cancelling the context cancels everything downstream simultaneously. It also carries a deadline and key-value metadata for tracing. It is the standard way to propagate cancellation in Go.',
    },
    { type: 'heading', text: 'Fan-out — distribute work across many workers' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'fan-out: one input channel, N competing workers',
      code: `// Fan-out: N goroutines read from the SAME channel
// Each message goes to exactly ONE worker — they compete
// This is automatic load balancing — busy workers just don't read as fast

workCh := make(chan Message, 1000)

var wg sync.WaitGroup
for i := 0; i < 16; i++ {          // launch 16 worker goroutines
    wg.Add(1)
    go func(workerID int) {
        defer wg.Done()
        for msg := range workCh {   // each worker competes for messages
            process(msg)
        }
        // range exits when workCh is closed
    }(i)
}

for _, msg := range messages {
    workCh <- msg                   // send work
}
close(workCh)  // signal workers: no more work — they will drain and exit
wg.Wait()      // wait for all 16 workers to finish`,
    },
    { type: 'heading', text: 'Fan-in — merge multiple channels into one' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'fan-in: merge N input streams into one pipeline',
      code: `// Fan-in: one output channel receives from many input channels
// Each input gets its own forwarding goroutine

func fanIn(ctx context.Context, sources ...<-chan Message) <-chan Message {
    merged := make(chan Message, 100)
    var wg sync.WaitGroup

    for _, src := range sources {
        wg.Add(1)
        go func(ch <-chan Message) {
            defer wg.Done()
            for {
                select {
                case msg, ok := <-ch:
                    if !ok { return }    // this source closed
                    merged <- msg        // forward to merged output
                case <-ctx.Done(): return
                }
            }
        }(src)
    }

    // Close merged when ALL sources are drained
    go func() {
        wg.Wait()
        close(merged)
    }()

    return merged  // caller reads one channel, gets all messages
}`,
    },
    { type: 'heading', text: 'Goroutine leak detection' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'three common leak patterns and how to find them',
      code: `// LEAK 1: blocked receive with no exit path
ch := make(chan Message)
go func() {
    msg := <-ch   // if nobody ever sends to ch, this runs forever
    process(msg)
}()
// FIX: use select with ctx.Done()

// LEAK 2: blocked send with no reader
ch2 := make(chan Message)
go func() {
    ch2 <- Message{}  // blocks forever if nobody reads
}()
// FIX: buffered channel, or ensure reader goroutine starts first

// LEAK 3: infinite loop with no exit condition
go func() {
    for {
        doWork()  // loops forever — no select, no ctx.Done()
    }
}()
// FIX: for { select { case <-ctx.Done(): return ... } }

// DETECT IN TESTS:
// import "go.uber.org/goleak"
// defer goleak.VerifyNone(t)  — fails test if goroutines leaked

// DETECT IN PRODUCTION:
// runtime.NumGoroutine() in metrics
// Count climbing indefinitely = goroutine leak`,
    },
  ],
};

export default section;
