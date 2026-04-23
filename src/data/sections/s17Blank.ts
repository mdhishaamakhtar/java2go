import type { Section } from '@/types/section';

const section: Section = {
  id: 'blank',
  title: '19',
  label: 'Blank Identifier',
  blocks: [
    {
      type: 'prose',
      text: 'The blank identifier `_` is a write-only discard slot. Go requires every declared variable to be used — `_` is how you say "I am intentionally not using this value."',
    },
    { type: 'heading', text: 'Four uses of _' },
    {
      type: 'codeblock',
      lang: 'go',
      label: '_ — four contexts',
      code: `// 1. Discard a return value
value, _ := strconv.Atoi("42")   // ignore the error (be careful!)

// 2. Discard loop index
for _, msg := range messages {
    process(msg)  // only care about the value, not the index
}

// 3. Import for side effects — run init() without using the package
import _ "github.com/lib/pq"      // registers postgres driver in init()
import _ "net/http/pprof"          // registers /debug/pprof/ routes

// 4. Compile-time interface satisfaction check
// This line does NOTHING at runtime. At compile time, if *pgStore
// does NOT satisfy MessageStore, you get a compile error here.
var _ MessageStore = (*pgStore)(nil)
// Read: 'assign nil *pgStore to MessageStore variable, discard result'
// Compiler must verify the assignment is valid — that IS the check`,
    },
    { type: 'heading', text: 'Interface check pattern — you will see this in every Go codebase' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'compile-time interface assertion',
      code: `// Put at the top of the implementation file
// Acts as documentation: 'this type is intended to satisfy these interfaces'
// Fails fast at compile time instead of at runtime when the interface is used

var _ MessageStore  = (*pgStore)(nil)
var _ MessageBroker = (*redisBroker)(nil)
var _ WorkerPool    = (*boundedPool)(nil)

// Java equivalent: no direct analog.
// Java's 'implements' is enforced at class declaration.
// Go's check is at the usage site — more flexible, less automatic.`,
    },
  ],
};

export default section;
