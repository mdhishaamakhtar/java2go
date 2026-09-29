import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'types',
  label: 'Types & Variables',
  summary:
    'Zero values instead of null, explicit integer sizes, no implicit conversions, and enums built from named types and iota.',
  blocks: [
    {
      type: 'prose',
      text: 'Go is statically typed like Java, but stricter in some places and simpler in others. Every variable has a usable **zero value**, integer sizes are explicit, and there are no implicit numeric conversions at all.',
    },
    { type: 'heading', text: 'Declaring variables' },
    {
      type: 'compare',
      javaLabel: 'Java — declarations',
      goLabel: 'Go — var and :=',
      java: `int x = 10;
int y;          // field: 0; local: must assign first
String s;       // field: null (!)
var z = 10;     // Java 10+: local type inference
final int MAX = 3;`,
      go: `var x int = 10 // explicit type and value
var y int      // zero value: 0
var s string   // zero value: "" (never nil)
z := 10        // short form: inferred, functions only
const Max = 3  // compile-time constant

var (          // grouped declarations
    host = "localhost"
    port = 8080
)`,
    },
    {
      type: 'why',
      text: 'Java leaves object fields `null` until assigned, which is where NullPointerExceptions come from. In Go every type has a zero value that is ready to use: `0`, `""`, `false`, an empty struct, a nil slice you can append to. Only pointers, slices, maps, channels, functions and interfaces can be `nil`, and their types tell you so.',
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Idiom: use `:=` inside functions, `var x T` when you want the zero value on purpose, and `var` at package level (where `:=` is not allowed). Design your own types so their zero value is useful: `sync.Mutex{}` is an unlocked mutex and `bytes.Buffer{}` is an empty buffer, with no constructor call required.',
    },
    { type: 'heading', text: 'Integer types: size is explicit' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'pick integer types intentionally',
      code: `// Java: byte(8) short(16) int(32) long(64), all signed, plus char(16, unsigned)
// Go: signed and unsigned, named by bit width

var a int    // 64-bit on 64-bit platforms. The default choice.
var b int32  // ±2.1 billion. Alias: rune (a Unicode code point)
var c int64  // ±9.2 quintillion. IDs, Unix timestamps
var d uint8  // 0–255. Alias: byte (raw binary data)
var e uint64 // bit masks, hashes, IDs from external systems

// Quick guide:
//   int     counters, indexes, lengths (len() returns int)
//   int64   database keys, time.Duration, anything on the wire
//   byte    binary data: []byte is the standard buffer type
//   rune    one Unicode code point (see the Strings section)
//   uint*   bit manipulation and wire formats, not "can't be negative"`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Integer overflow wraps silently in both languages; Go has no `Math.addExact`. Unsigned types do not protect you from negative values either: after `var u uint; u--`, `u` is 18446744073709551615. Use `int` for sizes and counts even when they cannot be negative, just as the standard library does.',
    },
    { type: 'heading', text: 'No implicit conversions' },
    {
      type: 'compare',
      javaLabel: 'Java — widening happens silently',
      goLabel: 'Go — every conversion is written out',
      java: `int count = 3;
long total = count;        // implicit widening
double avg = total / 2.0;  // implicit promotion

Integer boxed = count;     // autoboxing
String s = "n=" + count;   // implicit toString`,
      go: `count := 3
var total int64 = int64(count) // must convert
avg := float64(total) / 2.0    // must convert

// There is no boxing: int is always a value.
s := "n=" + strconv.Itoa(count) // no implicit toString
s2 := fmt.Sprintf("n=%d", count)

// var t int64 = count  // compile error: int ≠ int64`,
    },
    {
      type: 'why',
      text: 'Implicit conversions hide precision loss and surprising promotions. Go makes every conversion visible, even between `int` and `int64` on a platform where they are the same size. The one exception is untyped constants: `const n = 3` or the literal `2.0` adapts to whatever type the context needs, which is why `float64(total) / 2.0` compiles without writing `float64(2.0)`.',
    },
    { type: 'heading', text: 'Named types and enums with iota' },
    {
      type: 'compare',
      javaLabel: 'Java — enum',
      goLabel: 'Go — named type + iota constants',
      java: `public enum Status {
    IDLE, ACTIVE, DRAINING, STOPPED;
}

Status s = Status.ACTIVE;
switch (s) {
    case ACTIVE -> start();
    default -> {}
}`,
      go: `// A distinct type, not an alias for int
type Status int

const (
    StatusIdle     Status = iota // 0
    StatusActive                 // 1
    StatusDraining               // 2
    StatusStopped                // 3
)

s := StatusActive
switch s {
case StatusActive:
    start()
}`,
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'what a named type does and does not protect you from',
      code: `func SetStatus(s Status) {}

SetStatus(StatusActive) // ok
SetStatus(2)            // ok: untyped constant converts implicitly

n := 2
SetStatus(n)            // compile error: int is not Status
SetStatus(Status(n))    // ok: explicit conversion, even if n is 42`,
    },
    {
      type: 'why',
      text: 'Go has no `enum` keyword. A named type plus `iota` constants stops you mixing up statuses with plain integers from variables, but it is **not a closed set**: any `Status(n)` conversion compiles, and `switch` does not check exhaustiveness. Linters such as `exhaustive` (bundled in golangci-lint) fill that gap. Start real enums at `iota + 1` when the zero value should mean "unset".',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'giving an enum a String method',
      code: `// Java enums have name() for free. In Go, implement fmt.Stringer:
func (s Status) String() string {
    switch s {
    case StatusIdle:
        return "idle"
    case StatusActive:
        return "active"
    case StatusDraining:
        return "draining"
    case StatusStopped:
        return "stopped"
    }
    return fmt.Sprintf("Status(%d)", int(s))
}

fmt.Println(StatusDraining) // "draining": fmt calls String()

// For long enums, generate it instead:
//go:generate go tool stringer -type=Status`,
    },
    { type: 'heading', text: 'Defined types vs type aliases' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'type T U vs type T = U',
      code: `type UserID int64   // defined type: new, distinct type
type Celsius float64 // can have its own methods

type Bytes = []byte  // alias: just another name, same type
                     // cannot add methods to it

var id UserID = 42
var n int64 = id         // compile error: UserID is not int64
var m int64 = int64(id)  // ok

var b Bytes = []byte("hi") // ok: identical types`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'Aliases exist mainly for gradual refactoring, such as moving a type between packages without breaking callers. In everyday code you want defined types: `type UserID int64` stops you passing an `OrderID` where a `UserID` belongs, which Java can only do with a wrapper class or record.',
    },
  ],
};

export default section;
