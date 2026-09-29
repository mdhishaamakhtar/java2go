import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'outro',
  label: 'Go Mental Model — Recap',
  summary:
    'The complete Java-to-Go mapping on one page, what Go leaves out on purpose, the three mental shifts, and where to go next.',
  blocks: [
    {
      type: 'prose',
      text: 'You have seen the syntax and the patterns. Step back and look at how the pieces fit together into one coherent way of building software.',
    },
    { type: 'heading', text: 'The complete Java → Go mapping' },
    {
      type: 'table',
      rows: [
        ['Class', 'Struct, with methods declared beside it'],
        ['Constructor', '`NewX()` function, or a struct literal'],
        ['`this`', 'An explicit, named receiver: `func (s *Server) …`'],
        ['`extends`', 'Embedding: promotion of fields and methods, not is-a'],
        ['`implements`', 'Nothing: interfaces are satisfied implicitly'],
        ['Interface beside its implementation', 'Small interface declared by the consumer'],
        [
          'Checked and unchecked exceptions',
          '`error` values, wrapped with `%w`, inspected with `errors.Is`/`As`',
        ],
        ['`try/catch`', '`if err != nil { … }`'],
        ['`finally` / try-with-resources', '`defer`, right after acquiring the resource'],
        ['`synchronized` / `ReentrantLock`', '`sync.Mutex` + `defer Unlock()` (not reentrant)'],
        ['`volatile` / `AtomicLong`', '`sync/atomic` types'],
        ['`CountDownLatch` / `invokeAll`', '`sync.WaitGroup` / `errgroup`'],
        ['`Thread`, `ExecutorService`, virtual threads', '`go f()`'],
        ['`BlockingQueue`', 'Buffered channel'],
        ['`Thread.interrupt()`, timeouts', '`context.Context`'],
        ['`ThreadLocal` / MDC', '`context.Context` values; attributes on `slog.Logger`'],
        ['Spring DI', 'Constructor functions wired in `main()`'],
        [
          '`null`',
          '`nil` for pointers, slices, maps, channels, functions, interfaces; zero values elsewhere',
        ],
        ['`Object`', '`any`'],
        ['`Optional<T>`', '`(T, bool)` comma-ok results, or `*T`'],
        ['`List<T>` / `Map<K,V>` / `Set<T>`', '`[]T` / `map[K]V` / `map[T]struct{}`'],
        ['Streams', 'Loops; `slices`/`maps` helpers; `iter.Seq` for lazy sequences'],
        ['`enum`', 'Named type + `iota` constants'],
        ['Annotations', 'Struct tags, and `//go:` directives'],
        ['Maven / Gradle', 'The `go` command and `go.mod`'],
      ],
    },
    { type: 'heading', text: 'What Go leaves out on purpose' },
    {
      type: 'callout',
      title: 'Missing by design, not by oversight',
      tone: 'warn',
      text: '**No inheritance.** Embedding is not inheritance: there is no overriding and no `super`. Calls through an interface are dynamically dispatched, which is where polymorphism lives.\n\n**No exceptions for ordinary failures.** Panics exist for bugs; everything else is an `error` value.\n\n**No overloading and no default arguments.** One name, one signature. Use distinct names, a config struct or functional options.\n\n**No implicit conversions.** `int32` to `int64`, `int` to `float64`, `string` to `[]byte`: each is written out.\n\n**No annotations or runtime magic.** No proxies, no aspect weaving, no classpath scanning. What runs is what you can read.',
    },
    { type: 'heading', text: 'The three mental shifts' },
    {
      type: 'callout',
      title: 'Shift 1: data and behaviour are separate',
      tone: 'info',
      text: 'Stop asking "what can a `User` do?" and ask "what operations work on a `User`?" A struct is just data. `SendWelcomeEmail(ctx, u User)` can live in the email package. Behaviour attaches to types through small interfaces at the point of use, not through class hierarchies.',
    },
    {
      type: 'callout',
      title: 'Shift 2: errors are just values',
      tone: 'go',
      text: 'Stop reaching for try/catch. Call, check, then handle or wrap and return. `if err != nil` is not noise; it marks every place something can fail and shows what happens next. Reviewing error handling becomes a matter of reading, not of reasoning about what might be thrown.',
    },
    {
      type: 'callout',
      title: 'Shift 3: concurrency is ordinary, and must be bounded',
      tone: 'engine',
      text: 'Blocking code is the efficient default, and `go` costs almost nothing, so concurrency stops being an architectural decision. The discipline moves elsewhere: every goroutine needs a way to stop (`context`), shared state needs a clear owner (a channel or a mutex), and fan-out needs a limit.',
    },
    { type: 'heading', text: 'Reading a Go codebase cold' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Start at `cmd/*/main.go`. It is the wiring diagram: what gets constructed, from what, and in which order.',
        'Read the package list under `internal/`. Package names are the architecture.',
        'Find the interfaces. They are the seams between packages, and they sit next to the code that consumes them.',
        'Search for `go ` statements. For each goroutine, find how it stops: a context, a closed channel, or the end of its input.',
        'Follow `if err != nil` branches to see the failure paths, and `defer` lines to see resource lifetimes.',
        'Run `go test -race ./...` and `go vet ./...` before you change anything.',
      ],
    },
    { type: 'heading', text: 'Where to go next' },
    {
      type: 'list',
      items: [
        '[A Tour of Go](https://go.dev/tour/): the interactive introduction, useful for filling syntax gaps.',
        '[Effective Go](https://go.dev/doc/effective_go) and [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments): the idioms, straight from the Go team.',
        '[Google’s Go Style Guide](https://google.github.io/styleguide/go/): a thorough, opinionated style reference.',
        '[Go by Example](https://gobyexample.com/): short, runnable examples for every standard feature.',
        '[The Go Memory Model](https://go.dev/ref/mem): what the language guarantees about concurrent access.',
        '[Release notes](https://go.dev/doc/devel/release): each release is small; reading them keeps you current.',
      ],
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'The best next step is to build something small end to end: a service with one endpoint, a Postgres table, tests and a Dockerfile. Come back to individual sections as reference when something looks unfamiliar. The language is small; once the mental model clicks, the rest is patterns.',
    },
  ],
};

export default section;
