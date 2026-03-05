import type { Section } from '@/types/section';

const section: Section = {
  id: 'types',
  title: '02',
  label: 'Types & Variables',
  blocks: [
    {
      type: 'prose',
      text: 'Go is statically typed. Types are explicit, integer sizes are explicit, and every variable has a zero value — there is no uninitialised state.',
    },
    { type: 'heading', text: 'Variable declaration — four forms' },
    {
      type: 'compare',
      javaLabel: 'Java — declaration',
      goLabel: 'Go — four equivalent forms',
      java: `int x = 10;
int y;         // y = 0 (primitive)
String s;      // s = null (object!)
var z = 10;    // Java 10+ local var`,
      go: `var x int = 10   // explicit type + value
var y int        // zero value: 0  (never null)
var s string     // zero value: ""  (never null)
z := 10          // := infers type, only inside functions

// Go has NO null for value types
// Zero values are always valid, usable defaults`,
    },
    {
      type: 'why',
      text: 'Java objects can be null, causing NullPointerExceptions. Go value types always have a zero value. Only pointers, slices, maps, and interfaces can be nil — and you know which ones those are because you declared them that way.',
    },
    { type: 'heading', text: 'Integer types — size is explicit' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'go — integer types, pick intentionally',
      code: `// Java has: byte(8), short(16), int(32), long(64) — all signed
// Go has signed AND unsigned, explicitly named by bit width:

var a int     // platform-sized: 64-bit on 64-bit OS  — default choice
var b int8    // -128 to 127                          — rare
var c int16   // -32768 to 32767                      — rare
var d int32   // ±2 billion  — alias: rune (Unicode code points)
var e int64   // ±9 quintillion — DB IDs, Unix timestamps

var f uint    // unsigned platform-sized              — loop bounds etc
var g uint8   // 0–255  — alias: byte  (binary data, buffers, payloads)
var h uint64  // 0–18 quintillion  — file sizes, memory offsets

// Quick reference:
// int    = general purpose counter / index
// int64  = database primary key, Unix timestamp (time.Now().Unix())
// byte   = one octet of binary data  ([]byte is a byte slice)
// rune   = one Unicode character      (range over string gives runes)`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`byte` and `uint8` are identical — just different names expressing intent. Same for `rune` and `int32`. The name you use tells the reader what the value represents.',
    },
    { type: 'heading', text: 'Named types and enums with iota' },
    {
      type: 'compare',
      javaLabel: 'Java — enum',
      goLabel: 'Go — named type + iota',
      java: `public enum Status {
    IDLE, ACTIVE, DRAINING, STOPPED
}

Status s = Status.ACTIVE;`,
      go: `// Create a named type — distinct from plain int
type Status int

const (
    StatusIdle     Status = iota  // 0 — iota starts at 0
    StatusActive                  // 1 — auto-increments
    StatusDraining                // 2
    StatusStopped                 // 3
)

var s Status = StatusActive

// Named type prevents accidental mixing:
func SetStatus(s Status) {}
SetStatus(StatusActive)  // ok
SetStatus(1)             // compile error — int != Status`,
    },
    {
      type: 'why',
      text: 'Go has no enum keyword. Instead, a named type over int plus iota constants gives you the same safety. The compiler treats `Status` and `int` as different types — you cannot accidentally pass a raw integer where a Status is expected.',
    },
  ],
};

export default section;
