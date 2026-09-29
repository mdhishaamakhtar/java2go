import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'gotchas',
  label: 'Common Gotchas',
  summary:
    'The mistakes Java developers make most often in their first months of Go, each with the fix. A checklist to skim before code review.',
  blocks: [
    {
      type: 'prose',
      text: 'Most of these compile cleanly and pass a quick test. They show up later as a nil panic, a race, a leak or a hung request. Each links back to the section that explains it in depth.',
    },

    { type: 'heading', text: 'Types and values' },
    { type: 'subheading', text: 'A nil pointer inside an interface is not nil' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'err != nil even though nothing failed',
      code: `func find() error {
    var err *NotFoundError // nil pointer
    return err             // non-nil error interface!
}
// Fix: return nil literally on the success path.`,
    },
    {
      type: 'prose',
      text: 'An interface is nil only when both its type and value are nil. See [any / interface{}](/sections/any#the-nil-interface-trap).',
    },
    { type: 'subheading', text: 'Accidental shadowing with :=' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the outer cfg is never assigned',
      code: `var cfg *Config
if path != "" {
    cfg, err := load(path) // declares a NEW cfg in this block
    if err != nil {
        return err
    }
    _ = cfg
}
use(cfg) // still nil

// Fix: declare err first and assign with =
var err error
cfg, err = load(path)`,
    },
    { type: 'subheading', text: 'Integer division and missing conversions' },
    {
      type: 'prose',
      text: '`7 / 2` is `3`, as in Java, but Go will not promote for you: `float64(hits) / float64(total)` needs both conversions written out. Converting a float to an int truncates toward zero, and converting between integer sizes silently wraps. See [Types & Variables](/sections/types#no-implicit-conversions).',
    },
    { type: 'subheading', text: 'Comparing time.Time with ==' },
    {
      type: 'prose',
      text: '`==` on `time.Time` also compares the location and the monotonic clock reading, so two values for the same instant can be unequal. Use `t1.Equal(t2)`, `Before` and `After`. Similarly, compare errors with `errors.Is`, not `==`, because wrapping hides the original.',
    },

    { type: 'heading', text: 'Collections' },
    { type: 'subheading', text: 'range gives you a copy' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'modifying the loop variable does nothing to the slice',
      code: `for _, u := range users {
    u.Active = true // modifies a copy: users is unchanged
}

// Fix: index into the slice
for i := range users {
    users[i].Active = true
}`,
    },
    { type: 'subheading', text: 'Sub-slices share memory with the original' },
    {
      type: 'prose',
      text: '`b := a[1:3]` does not copy. Writing to `b`, or appending to it while it has spare capacity, changes `a`. Use `slices.Clone` when you need independence. See [Slices & Maps](/sections/collections#sub-slices-share-memory).',
    },
    { type: 'subheading', text: 'nil maps panic on write; map order is random' },
    {
      type: 'prose',
      text: 'A declared-but-unmade map (`var m map[string]int`) can be read but panics on write: initialise it with `make` or a literal. Iteration order is deliberately randomised on every run, so tests that depend on it are flaky. Sort the keys with `slices.Sorted(maps.Keys(m))` when order matters.',
    },
    { type: 'subheading', text: 'JSON numbers decode to float64' },
    {
      type: 'prose',
      text: 'Unmarshalling into `map[string]any` produces `float64` for every number, so `v.(int)` always fails, and integers above 2^53 lose precision. Decode into a typed struct instead, or use `Decoder.UseNumber()`.',
    },

    { type: 'heading', text: 'Concurrency' },
    { type: 'subheading', text: 'Concurrent map writes crash the process' },
    {
      type: 'prose',
      text: 'Unlike a `HashMap` quietly corrupting itself, a Go map written by two goroutines at once can trigger `fatal error: concurrent map writes`, which cannot be recovered. Guard shared maps with a mutex. See [Sync Primitives](/sections/sync).',
    },
    { type: 'subheading', text: 'Mutexes are not reentrant, and must not be copied' },
    {
      type: 'prose',
      text: 'Locking a `sync.Mutex` that the same goroutine already holds deadlocks. Copying a struct that contains a mutex copies the lock state: pass such structs by pointer. `go vet` reports the copies. See [Sync Primitives](/sections/sync#sync-mutex-exclusive-access).',
    },
    { type: 'subheading', text: 'A panic in any goroutine kills the program' },
    {
      type: 'prose',
      text: 'There is no per-thread uncaught-exception handler. `net/http` recovers panics in handlers, but not in goroutines those handlers start. Recover at the top of long-lived goroutines. See [Defer — Advanced](/sections/defer-advanced#containing-panics-in-background-goroutines).',
    },
    { type: 'subheading', text: 'Goroutines that never end' },
    {
      type: 'prose',
      text: 'A goroutine blocked on a channel nobody will ever use again is leaked forever, with everything it references. Every `go` statement needs a known way to stop: a closed channel, a cancelled context, or a finite loop. See [Goroutine Management](/sections/goroutine-mgmt#goroutine-leaks).',
    },
    { type: 'subheading', text: 'Unbounded fan-out' },
    {
      type: 'prose',
      text: 'Goroutines are cheap; database connections, file descriptors and third-party rate limits are not. Starting one goroutine per item for 100,000 items can exhaust them. Bound concurrency with `errgroup.SetLimit` or a semaphore channel.',
    },
    { type: 'subheading', text: 'Data races that "work"' },
    {
      type: 'prose',
      text: 'A boolean flag or counter shared without synchronisation may appear to work for months. Go has no `volatile`, and the compiler may legally cache or reorder unsynchronised accesses. Use `sync/atomic` or a mutex, and run `go test -race` in CI.',
    },

    { type: 'heading', text: 'Errors and cleanup' },
    { type: 'subheading', text: 'defer inside a loop' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'every file stays open until the function returns',
      code: `for _, path := range paths {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close() // runs at FUNCTION exit, not iteration end
    process(f)
}

// Fix: one function call per iteration
for _, path := range paths {
    if err := processFile(path); err != nil { // defer inside processFile
        return err
    }
}`,
    },
    { type: 'subheading', text: 'Logging an error and returning it' },
    {
      type: 'prose',
      text: 'Each layer that logs and returns duplicates the same failure in your logs. Wrap with context and return; log once where the error is finally handled. See [Error Handling](/sections/errors#handle-an-error-once).',
    },
    { type: 'subheading', text: 'log.Fatal and os.Exit skip deferred calls' },
    {
      type: 'prose',
      text: 'They exit immediately: no deferred `Close`, no flushed buffers, no graceful shutdown. Use them only in `main`, and prefer a `run() error` function. See [Init & Main Lifecycle](/sections/lifecycle#a-production-main-go).',
    },

    { type: 'heading', text: 'HTTP and I/O' },
    { type: 'subheading', text: 'The default HTTP client never times out' },
    {
      type: 'prose',
      text: '`http.Get` and `http.DefaultClient` have no timeout, so one unresponsive dependency can hang goroutines indefinitely. Create an `http.Client` with a `Timeout` and pass a context to every request. Close every response body, and check `resp.StatusCode` yourself: a 500 is not an `error`. See [JSON & HTTP APIs](/sections/json-http#calling-other-services).',
    },
    { type: 'subheading', text: 'Headers set after WriteHeader are ignored' },
    {
      type: 'prose',
      text: 'The first call to `WriteHeader` or `Write` sends the status line and headers. Setting `Content-Type` afterwards silently does nothing, and calling `WriteHeader` twice logs "superfluous response.WriteHeader call". Set headers, then the status, then the body.',
    },
    { type: 'subheading', text: 'string(n) is not strconv.Itoa(n)' },
    {
      type: 'prose',
      text: '`string(65)` is `"A"`: the integer is treated as a Unicode code point. Use `strconv.Itoa` or `fmt.Sprint` for decimal text. `go vet` flags the conversion. See [Strings & Formatting](/sections/strings#parsing-and-converting-strconv).',
    },
  ],
};

export default section;
