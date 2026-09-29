import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'sync',
  label: 'Sync Primitives',
  summary:
    'Mutex, RWMutex, Once, atomics and sync.Map: guarding shared state when a channel is the wrong tool, and why Go locks are not reentrant.',
  blocks: [
    {
      type: 'prose',
      text: 'Channels move data between goroutines. When several goroutines need to read and update the same data in place, a map of sessions, a cache, a counter, the `sync` and `sync/atomic` packages are the right tools.',
    },
    {
      type: 'table',
      rows: [
        ['`synchronized` / `ReentrantLock`', '`sync.Mutex` (not reentrant!)'],
        ['`ReentrantReadWriteLock`', '`sync.RWMutex`'],
        ['`CountDownLatch`', '`sync.WaitGroup`'],
        ['Lazy holder idiom / double-checked locking', '`sync.Once`, `sync.OnceValue`'],
        [
          '`AtomicLong`, `AtomicBoolean`, `AtomicReference`',
          '`atomic.Int64`, `atomic.Bool`, `atomic.Pointer[T]`',
        ],
        ['`ConcurrentHashMap`', '`map` + `sync.RWMutex`, or `sync.Map`'],
        ['`volatile`', 'Use atomics or a mutex; there is no `volatile`'],
      ],
    },
    { type: 'heading', text: 'sync.Mutex: exclusive access' },
    {
      type: 'compare',
      javaLabel: 'Java — ReentrantLock',
      goLabel: 'Go — sync.Mutex',
      java: `class Registry {
    private final Map<String, Worker> workers = new HashMap<>();
    private final ReentrantLock lock = new ReentrantLock();

    void register(String id, Worker w) {
        lock.lock();
        try {
            workers.put(id, w);
        } finally {
            lock.unlock();
        }
    }
}`,
      go: `type Registry struct {
    mu      sync.Mutex // guards workers
    workers map[string]*Worker
}

func (r *Registry) Register(id string, w *Worker) {
    r.mu.Lock()
    defer r.mu.Unlock() // released on every return path

    r.workers[id] = w
}`,
    },
    {
      type: 'why',
      text: '`Lock` followed immediately by `defer Unlock` is Go’s `synchronized` block: the lock is released on every return path and during a panic. The zero value of a `Mutex` is an unlocked mutex, so it needs no initialisation. By convention the mutex sits directly above the fields it guards, with a comment saying so.',
    },
    {
      type: 'callout',
      title: 'Go mutexes are not reentrant',
      tone: 'warn',
      text: 'In Java a thread that holds a monitor can enter another `synchronized` method on the same object. In Go, calling `Lock` on a mutex the same goroutine already holds **deadlocks forever**. There is no owner tracking.\n\nThe idiomatic fix is structural: exported methods take the lock, and they call unexported helpers that assume the lock is already held, often named with a `Locked` suffix, such as `removeLocked`.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'locked helpers instead of reentrancy',
      code: `func (r *Registry) Replace(id string, w *Worker) {
    r.mu.Lock()
    defer r.mu.Unlock()
    r.removeLocked(id) // must NOT call r.Remove(): it would re-lock
    r.workers[id] = w
}

func (r *Registry) Remove(id string) {
    r.mu.Lock()
    defer r.mu.Unlock()
    r.removeLocked(id)
}

// removeLocked requires r.mu to be held.
func (r *Registry) removeLocked(id string) {
    if w, ok := r.workers[id]; ok {
        w.Stop()
        delete(r.workers, id)
    }
}`,
    },
    { type: 'heading', text: 'sync.RWMutex: many readers or one writer' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'RWMutex for read-heavy state',
      code: `type Router struct {
    mu     sync.RWMutex
    routes map[string]Handler
}

// Writers take the exclusive lock
func (r *Router) Register(topic string, h Handler) {
    r.mu.Lock()
    defer r.mu.Unlock()
    r.routes[topic] = h
}

// Readers share the read lock
func (r *Router) Lookup(topic string) (Handler, bool) {
    r.mu.RLock()
    defer r.mu.RUnlock()
    h, ok := r.routes[topic]
    return h, ok
}`,
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'An `RWMutex` is not automatically faster: it costs more than a `Mutex` per operation, so it only pays off when reads are frequent and the critical section is not tiny. If data is built once at startup and never changes afterwards, it needs no lock at all. For config that changes rarely, a copy-on-write `atomic.Pointer` (below) makes reads lock-free.',
    },
    { type: 'heading', text: 'sync.Once and friends: lazy initialisation' },
    {
      type: 'compare',
      javaLabel: 'Java — holder class idiom',
      goLabel: 'Go — sync.OnceValue (Go 1.21+)',
      java: `class Templates {
    private static class Holder {
        static final Map<String, Template> ALL = loadAll();
    }

    static Map<String, Template> get() {
        return Holder.ALL; // loaded on first access, once
    }
}`,
      go: `// Runs loadAll exactly once, on first call, from any goroutine.
// Concurrent callers wait for the first call to finish.
var templates = sync.OnceValue(func() map[string]*Template {
    return loadAll()
})

func render(name string) {
    t := templates()[name]
    ...
}

// sync.OnceValues returns (T, error); sync.OnceFunc for no result.
// The older form: var once sync.Once; once.Do(func() { ... })`,
    },
    { type: 'heading', text: 'sync/atomic: lock-free counters and pointers' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'typed atomics (Go 1.19+)',
      code: `type Metrics struct {
    processed atomic.Int64
    failed    atomic.Int64
}

func (m *Metrics) RecordSuccess() { m.processed.Add(1) }
func (m *Metrics) RecordFailure() { m.failed.Add(1) }

// Copy-on-write configuration: readers never block
type Server struct {
    cfg atomic.Pointer[Config]
}

func (s *Server) Config() *Config { return s.cfg.Load() }

func (s *Server) Reload(next *Config) {
    s.cfg.Store(next) // readers see the old or new config, never half of one
}`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Go has no `volatile`. The Go memory model only guarantees visibility across goroutines through synchronisation: channel operations, mutexes, `sync.Once`, `WaitGroup` and atomics. A plain boolean "stop" flag written by one goroutine and polled by another is a data race, even if it seems to work.',
    },
    { type: 'heading', text: 'sync.Map' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'a concurrent map for two specific patterns',
      code: `// sync.Map is optimised for:
//   1. keys written once and read many times (caches that only grow)
//   2. goroutines working on disjoint sets of keys
// For everything else, a map + Mutex is clearer and usually as fast.

var sessions sync.Map // zero value ready; keys and values are any

sessions.Store("u-1", &Session{UserID: "1"})

if v, ok := sessions.Load("u-1"); ok {
    s := v.(*Session) // values come back as any
    fmt.Println(s.UserID)
}

actual, loaded := sessions.LoadOrStore("u-2", &Session{UserID: "2"})
// loaded == true: a value already existed and actual is that value

sessions.Range(func(key, value any) bool {
    return true // false stops the iteration
})`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Prove your locking with the race detector: `go test -race ./...` instruments memory accesses and fails the test when two goroutines touch the same memory without synchronisation. Run it in CI. It finds bugs that code review and ordinary tests almost never do.',
    },
  ],
};

export default section;
