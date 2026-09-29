import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'goroutine-mgmt',
  label: 'Goroutine Management',
  summary:
    'Production patterns: stopping goroutines, errgroup for fail-fast fan-out, bounded concurrency, worker pools, fan-in, and finding leaks.',
  blocks: [
    {
      type: 'prose',
      text: 'Starting a goroutine is one keyword. Knowing that every goroutine will eventually stop, that failures propagate, and that concurrency stays bounded is where the real work is. The rule to live by: **never start a goroutine without knowing how it will end.**',
    },
    { type: 'heading', text: 'Stopping a goroutine with context' },
    {
      type: 'compare',
      javaLabel: 'Java — interruption',
      goLabel: 'Go — context cancellation',
      java: `Thread worker = Thread.ofVirtual().start(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            process(queue.take()); // take() throws on interrupt
        } catch (InterruptedException e) {
            return;
        }
    }
});

worker.interrupt(); // best-effort: code must cooperate`,
      go: `func (w *Worker) Run(ctx context.Context) error {
    for {
        select {
        case msg := <-w.inbox:
            if err := w.process(ctx, msg); err != nil {
                return err
            }
        case <-ctx.Done():
            return ctx.Err() // context.Canceled or DeadlineExceeded
        }
    }
}

ctx, cancel := context.WithCancel(context.Background())
go w.Run(ctx)
// ...
cancel() // Run returns at its next select`,
    },
    {
      type: 'why',
      text: 'Cancellation in Go is cooperative too, but it is standardised: every blocking library call (database queries, HTTP requests, channel selects) accepts a `context.Context`, so one `cancel()` stops a whole tree of work. The [next section](/sections/context) covers context in depth. A bare `chan struct{}` that you `close()` to broadcast "stop" is the older, lower-level version of the same idea.',
    },
    { type: 'heading', text: 'errgroup: run tasks, fail fast, wait for all' },
    {
      type: 'compare',
      javaLabel: 'Java — invokeAll / StructuredTaskScope',
      goLabel: 'Go — golang.org/x/sync/errgroup',
      java: `try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Profile>> futures = pool.invokeAll(
        ids.stream()
            .map(id -> (Callable<Profile>) () -> fetch(id))
            .toList());

    for (Future<Profile> f : futures) {
        profiles.add(f.get()); // ExecutionException on failure
    }
}
// StructuredTaskScope (still a preview API in Java 25)
// adds fail-fast cancellation of sibling tasks.`,
      go: `g, ctx := errgroup.WithContext(ctx)
profiles := make([]Profile, len(ids))

for i, id := range ids {
    g.Go(func() error {
        p, err := fetch(ctx, id) // ctx is cancelled on first error
        if err != nil {
            return fmt.Errorf("fetch %s: %w", id, err)
        }
        profiles[i] = p // each goroutine owns one index: no lock
        return nil
    })
}

if err := g.Wait(); err != nil { // waits for ALL, returns the first error
    return nil, err
}
return profiles, nil`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: '`errgroup` is the default tool whenever goroutines can fail. It combines a `WaitGroup`, first-error capture and (with `WithContext`) cancellation of the other tasks. It lives in `golang.org/x/sync`, maintained by the Go team but outside the standard library.',
    },
    { type: 'heading', text: 'Bounding concurrency' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'goroutines are cheap; the things they call are not',
      code: `// Launching 50,000 goroutines is fine. Opening 50,000 database
// connections or HTTP requests at once is not. Bound the work.

// Option 1: errgroup.SetLimit, the simplest
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(8) // at most 8 run at once; g.Go blocks for a free slot
for _, url := range urls {
    g.Go(func() error { return crawl(ctx, url) })
}
err := g.Wait()

// Option 2: a buffered channel as a semaphore (like java.util.concurrent.Semaphore)
sem := make(chan struct{}, 8)
var wg sync.WaitGroup
for _, url := range urls {
    sem <- struct{}{} // acquire: blocks while 8 are running
    wg.Go(func() {
        defer func() { <-sem }() // release
        crawl(ctx, url)
    })
}
wg.Wait()`,
    },
    { type: 'heading', text: 'Worker pools: fan-out' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'N workers compete for jobs from one channel',
      code: `jobs := make(chan Job)
results := make(chan Result)

// Start a fixed number of workers
var wg sync.WaitGroup
for range 8 {
    wg.Go(func() {
        for job := range jobs { // exits when jobs is closed
            results <- process(job)
        }
    })
}

// Close results once every worker has finished
go func() {
    wg.Wait()
    close(results)
}()

// Feed jobs, then signal there are no more
go func() {
    defer close(jobs)
    for _, j := range pending {
        jobs <- j
    }
}()

for r := range results {
    fmt.Println(r)
}`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'A fixed pool of workers reading from a channel is the Go shape of `Executors.newFixedThreadPool(8)`. You need it less often than in Java: when the limit exists only to protect a downstream resource, `errgroup.SetLimit` or a semaphore is simpler than a pool.',
    },
    { type: 'heading', text: 'Fan-in: merging channels' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'merge several channels into one, cancellably',
      code: `func merge[T any](ctx context.Context, sources ...<-chan T) <-chan T {
    out := make(chan T)
    var wg sync.WaitGroup

    for _, src := range sources {
        wg.Go(func() {
            for v := range src {
                select {
                case out <- v:
                case <-ctx.Done():
                    return // consumer is gone: don't block forever
                }
            }
        })
    }

    go func() {
        wg.Wait()
        close(out) // close only after every forwarder has stopped
    }()
    return out
}`,
    },
    { type: 'heading', text: 'Goroutine leaks' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the three shapes of a leak',
      code: `// LEAK 1: a send nobody receives
func first(urls []string) string {
    ch := make(chan string) // unbuffered
    for _, u := range urls {
        go func() { ch <- fetch(u) }() // all but one block forever
    }
    return <-ch
}
// FIX: make(chan string, len(urls)), or cancel the others via ctx

// LEAK 2: a receive nobody sends to
go func() {
    msg := <-inbox // if inbox is never written or closed, stuck forever
    handle(msg)
}()
// FIX: select on ctx.Done() too, or make sure the sender closes

// LEAK 3: a loop with no exit condition
go func() {
    for {
        poll() // runs until the process dies
    }
}()
// FIX: for { select { case <-ctx.Done(): return; case <-ticker.C: poll() } }`,
    },
    {
      type: 'list',
      items: [
        '**In tests:** `go.uber.org/goleak` fails a test if goroutines are still running when it ends: `defer goleak.VerifyNone(t)`.',
        '**In production:** export `runtime.NumGoroutine()` as a metric. A count that climbs steadily and never falls is a leak.',
        '**Go 1.27+:** the `goroutineleak` profile (`/debug/pprof/goroutineleak`) lists goroutines the garbage collector can prove will never be unblocked, with their stacks.',
      ],
    },
  ],
};

export default section;
