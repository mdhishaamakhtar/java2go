import type { Section } from '@/types/section';

const section: Section = {
  id: 'sync',
  title: '12',
  label: 'Sync Primitives',
  blocks: [
    {
      type: 'prose',
      text: "Go's `sync` package provides the low-level primitives for protecting shared state when channels are not the right tool. In a comms engine, these are everywhere.",
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Java has `synchronized`, `ReentrantLock`, `CountDownLatch`, `AtomicInteger`. Go has simpler equivalents with slightly different names and explicit lock/unlock rather than block-scoped locking.',
    },
    { type: 'heading', text: 'sync.Mutex — exclusive lock' },
    {
      type: 'compare',
      javaLabel: 'Java — synchronized method or ReentrantLock',
      goLabel: 'Go — sync.Mutex',
      java: `class Engine {
    private final Map<String, Worker> workers
        = new HashMap<>();
    private final ReentrantLock lock
        = new ReentrantLock();

    public void register(String id, Worker w) {
        lock.lock();
        try {
            workers.put(id, w);
        } finally {
            lock.unlock();  // must remember finally
        }
    }
}`,
      go: `type Engine struct {
    workers map[string]*Worker
    mu      sync.Mutex  // zero value is unlocked — no init needed
}

func (e *Engine) Register(id string, w *Worker) {
    e.mu.Lock()           // acquire exclusive lock
    defer e.mu.Unlock()   // ALWAYS release — even on panic
    // defer here replaces try/finally — impossible to forget

    e.workers[id] = w  // safe — only one goroutine at a time
}`,
    },
    {
      type: 'why',
      text: 'The `defer e.mu.Unlock()` pattern guarantees the lock is released no matter what happens — early returns, panics, any code path. Forgetting an Unlock causes a deadlock that never recovers. Defer makes forgetting impossible.',
    },
    { type: 'heading', text: 'sync.RWMutex — multiple readers, exclusive writer' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'RWMutex — optimise for read-heavy workloads',
      code: `// RWMutex allows MANY concurrent readers OR ONE writer — never both
// Use when reads vastly outnumber writes (e.g. routing table, config)

type Router struct {
    routes map[string][]HandlerFunc
    mu     sync.RWMutex  // not sync.Mutex
}

// WRITE path — exclusive lock, blocks all readers and writers
func (r *Router) Register(topic string, h HandlerFunc) {
    r.mu.Lock()            // no other goroutine can read or write
    defer r.mu.Unlock()
    r.routes[topic] = append(r.routes[topic], h)
}

// READ path — shared lock, many goroutines can read simultaneously
func (r *Router) Lookup(topic string) []HandlerFunc {
    r.mu.RLock()           // many goroutines can hold RLock at once
    defer r.mu.RUnlock()
    return r.routes[topic] // safe — nobody can write during RLock
}

// In a comms engine: the route table is written once at startup
// and read millions of times per second. RWMutex is a huge win.`,
    },
    { type: 'heading', text: 'sync.WaitGroup — coordinate goroutine completion' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'WaitGroup — wait for a batch of goroutines',
      code: `// WaitGroup is a counter with three operations:
//   Add(n)  — increment counter by n  (call BEFORE launching goroutine)
//   Done()  — decrement counter by 1  (call when goroutine finishes)
//   Wait()  — block until counter reaches 0

func processBatch(messages []Message) {
    var wg sync.WaitGroup

    for _, msg := range messages {
        wg.Add(1)                // counter: +1 before launch
        go func(m Message) {
            defer wg.Done()      // counter: -1 guaranteed when done
            // defer ensures Done() is called even if process panics
            // Without defer: a panic would leave counter stuck
            // wg.Wait() would block forever — deadlock
            process(m)
        }(msg)  // copy msg into m to avoid closure capture bug
    }

    wg.Wait()  // blocks here until all goroutines finish
    // Counter is 0 — all Done() calls have been made
}`,
    },
    { type: 'heading', text: 'sync.Once — run exactly once, ever' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'sync.Once — singleton initialisation',
      code: `// Once guarantees a function runs exactly once, even if called
// from many goroutines simultaneously

type Config struct {
    once sync.Once
    data map[string]string
}

func (c *Config) Load() map[string]string {
    c.once.Do(func() {
        // This runs EXACTLY ONCE, no matter how many goroutines call Load()
        // All other calls block until this function finishes
        c.data = loadFromDisk()  // expensive operation — do it once
    })
    return c.data
}

// Java equivalent: double-checked locking or static final field
// Go's sync.Once is simpler and provably correct`,
    },
    { type: 'heading', text: 'sync/atomic — lock-free integer operations' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'atomic — faster than mutex for counters',
      code: `import "sync/atomic"

// atomic operations are hardware-level — no mutex needed
// Use for counters and flags that are updated frequently

type Metrics struct {
    processed atomic.Int64   // Go 1.19+ typed atomic
    errors    atomic.Int64
}

func (m *Metrics) RecordProcessed() {
    m.processed.Add(1)  // atomic increment — safe from any goroutine
}

func (m *Metrics) Snapshot() (int64, int64) {
    return m.processed.Load(), m.errors.Load()
}

// Old-style (pre Go 1.19) — still common in codebases:
var counter int64
atomic.AddInt64(&counter, 1)    // atomic add
n := atomic.LoadInt64(&counter) // atomic read`,
    },
    { type: 'heading', text: 'sync.Map — concurrent-safe map' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'sync.Map — for specific access patterns',
      code: `// sync.Map is optimised for two cases:
//   1. Keys are written once but read many times
//   2. Many goroutines access disjoint key sets
// For general use, map + RWMutex is often clearer and faster

var cache sync.Map

// Store
cache.Store("user-1", &User{ID: "1"})

// Load — returns (value any, ok bool)
val, ok := cache.Load("user-1")
if ok {
    user := val.(*User)  // type assert back from any
    fmt.Println(user.ID)
}

// LoadOrStore — atomic get-or-set
actual, loaded := cache.LoadOrStore("user-2", &User{ID: "2"})
// loaded=true if key already existed, false if we just stored

// Delete
cache.Delete("user-1")

// Iterate
cache.Range(func(key, value any) bool {
    fmt.Println(key, value)
    return true  // return false to stop iteration
})`,
    },
  ],
};

export default section;
