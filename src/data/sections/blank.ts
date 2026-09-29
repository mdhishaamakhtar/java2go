import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'blank',
  label: 'Blank Identifier',
  summary:
    'The underscore discards values on purpose: ignored results, side-effect imports, and compile-time interface checks.',
  blocks: [
    {
      type: 'prose',
      text: 'Go refuses to compile unused imports and unused local variables. Java merely warns about them, if your IDE is configured to. The blank identifier `_` is how you tell the compiler "I am discarding this on purpose". It can be assigned to, but never read.',
    },
    { type: 'heading', text: 'Five uses of _' },
    {
      type: 'codeblock',
      lang: 'go',
      label: '_ in five contexts',
      code: `// 1. Discard one of several results (be deliberate about errors!)
n, _ := fmt.Sscan(input, &x)

// 2. Discard the index (or value) in a range loop
for _, msg := range messages {
    process(msg)
}

// 3. Import a package only for its side effects (its init functions)
import (
    _ "github.com/jackc/pgx/v5/stdlib" // registers the "pgx" database/sql driver
    _ "net/http/pprof"                 // registers /debug/pprof/ handlers
    _ "time/tzdata"                    // embeds the time zone database
)

// 4. Compile-time interface check (below)
var _ MessageStore = (*PostgresStore)(nil)

// 5. Keep a variable around while you are mid-refactor
_ = unusedForNow`,
    },
    { type: 'heading', text: 'The compile-time interface check' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'assert that a type satisfies an interface, at zero runtime cost',
      code: `// Usually placed right below the type it checks
var (
    _ MessageStore  = (*PostgresStore)(nil)
    _ MessageBroker = (*RedisBroker)(nil)
    _ http.Handler  = (*Router)(nil)
)

// Read it as: "a nil *PostgresStore must be assignable to a
// MessageStore". If a method is missing or its signature drifts,
// the build fails HERE, with a precise message:
//
//   cannot use (*PostgresStore)(nil) (value of type *PostgresStore)
//   as MessageStore value in variable declaration:
//   *PostgresStore does not implement MessageStore
//   (missing method Delete)`,
    },
    {
      type: 'why',
      text: 'Implicit interfaces mean nothing forces a type to keep satisfying an interface. Usually a mismatch is caught wherever the type is used as that interface. But when the only use is in another package, a test, or through dependency wiring, the check documents intent and fails fast next to the implementation. It is the closest Go gets to writing `implements`, and it costs nothing at runtime.',
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'A silently ignored error is the most common source of "impossible" bugs in Go code. `result, _ := doSomething()` deserves a comment explaining why the error cannot matter. Linters such as `errcheck` (part of golangci-lint) flag unchecked errors, including ones dropped without `_`.',
    },
  ],
};

export default section;
