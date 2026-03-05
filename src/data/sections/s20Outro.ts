import type { Section } from '@/types/section';

const section: Section = {
  id: 'outro',
  title: '20',
  label: 'Go Mental Model — Recap',
  blocks: [
    {
      type: 'prose',
      text: 'You have been through all the syntax. Now step back and look at how the pieces fit together into a coherent worldview — the Go mental model.',
    },
    { type: 'heading', text: 'The complete Java → Go mapping' },
    {
      type: 'table',
      rows: [
        ['Class', 'Struct + methods defined outside'],
        ['Constructor', 'NewX() factory function — just a regular function'],
        ['this', 'Explicit receiver: (e *Engine) — you name it yourself'],
        ['extends / inheritance', 'Embedding — field/method promotion, not is-a'],
        ['implements (explicit)', 'Implicit — just have the methods'],
        ['Interface (next to impl)', 'Interface defined at the call site, not the impl'],
        ['checked/unchecked exception', 'Error return value — explicit at every layer'],
        ['try/catch', 'if err != nil — checked inline, propagated with %w'],
        ['try/finally', 'defer — placed right after resource acquisition'],
        ['synchronized / ReentrantLock', 'sync.Mutex + defer unlock'],
        ['CountDownLatch / Future', 'sync.WaitGroup / channels'],
        ['Thread / ExecutorService', 'goroutine — just prefix with go'],
        ['BlockingQueue', 'Buffered channel'],
        ['volatile / AtomicInteger', 'sync/atomic package'],
        ['Spring @Autowired', 'Manual wiring in main()'],
        ['@Bean singleton', 'Variable in main() passed around as argument'],
        ['null (for Objects)', 'nil — but only for pointer/slice/map/interface/channel'],
        ['Object (universal base)', 'any (interface{}) — no class hierarchy'],
        ['List<T>', '[]T — slice'],
        ['Map<K,V>', 'map[K]V'],
        ['Optional<T>', '*T — nil means absent'],
        ['Stream.map() / filter()', 'Generic Map[], Filter[] functions or loops'],
      ],
    },
    { type: 'heading', text: 'What Go intentionally does NOT have' },
    {
      type: 'callout',
      title: 'Missing by design — not by oversight',
      color: '#d47e7e',
      text: '**No inheritance.** Embedding is not inheritance. There is no method overriding, no virtual dispatch, no abstract classes. Use interfaces and composition.\n\n**No exceptions.** Panics exist but are not for normal error handling. Return errors as values. Every failure path is explicit.\n\n**No generics covariance/contravariance.** Go generics are simpler than Java. No wildcards, no variance. Simpler to reason about.\n\n**No implicit conversions.** You cannot pass an `int32` where an `int64` is expected. You cannot pass a `string` where a `[]byte` is expected. Conversions are always explicit.\n\n**No method overloading.** One function name, one signature. Use different names or variadic args.',
    },
    { type: 'heading', text: 'The three mental shifts' },
    {
      type: 'callout',
      title: 'Shift 1 — Behaviour does not belong to data',
      color: '#7c9fff',
      text: 'Stop thinking "what can a User do?" Start thinking "what functions operate on a User?" The User struct is just data. `SendWelcomeEmail(u User)` is a function in the email package. Nothing stops you from reading User fields from outside.',
    },
    {
      type: 'callout',
      title: 'Shift 2 — Errors are just values',
      color: '#4ec9b0',
      text: 'Stop reaching for try/catch. The pattern is: call function, check error, handle or propagate. `if err != nil` is not noise — it is the explicit acknowledgement that something can go wrong here and you are handling it. It makes code reviews trivially easy to audit for error handling.',
    },
    {
      type: 'callout',
      title: 'Shift 3 — Concurrency through communication',
      color: '#c07ed4',
      text: 'Stop thinking about locking shared state (though mutexes exist when needed). Start thinking about data flowing through pipelines. Goroutine A produces messages, sends them through a channel, Goroutine B receives and processes. The channel is the synchronisation — no locks needed for the handoff.',
    },
    { type: 'heading', text: 'How to read a Go codebase cold' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'reading strategy for a new Go repo',
      code: `// 1. Start at cmd/*/main.go — this is the wiring
//    Who creates what? What depends on what?

// 2. Find the interfaces — usually in interfaces.go or at the top of files
//    Interfaces tell you the contracts between layers

// 3. Look for goroutine launch sites — 'go func(' or 'go someFunc('
//    For each one: where does it exit? (ctx.Done, stopCh, return condition)

// 4. Look for channel declarations — 'make(chan'
//    Who sends? Who receives? What buffers?

// 5. Look for struct definitions — they ARE the data model
//    No business logic inside — look for functions that take those structs

// 6. Follow errors — 'if err != nil' shows the unhappy paths explicitly
//    In Java you'd need to trace exception hierarchies

// 7. defer lines tell you about resource lifecycles
//    defer X.Close() = X was acquired above and will be released on exit`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'You are ready to read Go. When something looks unfamiliar, the concepts are all in this guide. Come back to any section as a reference. The syntax is small — once you have the mental model, the rest is just patterns.',
    },
  ],
};

export default section;
