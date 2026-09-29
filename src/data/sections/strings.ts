import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'strings',
  label: 'Strings & Formatting',
  summary:
    'Strings are immutable UTF-8 bytes, not UTF-16 chars. Indexing, runes, building strings efficiently, fmt verbs and strconv.',
  blocks: [
    {
      type: 'prose',
      text: 'A Go `string` is an immutable sequence of **bytes**, conventionally holding UTF-8 text. A Java `String` is a sequence of UTF-16 `char`s. That one difference explains every string surprise a Java developer hits in Go: `len` counts bytes, indexing returns a byte, and ranging over a string yields Unicode code points.',
    },
    { type: 'heading', text: 'Length, indexing and runes' },
    {
      type: 'compare',
      javaLabel: 'Java — UTF-16 code units',
      goLabel: 'Go — UTF-8 bytes and runes',
      java: `String s = "héllo";

s.length();                  // 5 (UTF-16 units)
s.charAt(1);                 // 'é'
s.codePointCount(0, s.length()); // 5

for (char c : s.toCharArray()) {
    // breaks on emoji: surrogate pairs
}

s.equals("héllo");  // true; == compares references`,
      go: `s := "héllo"

len(s)                     // 6: é is two bytes
s[1]                       // 195: a byte, not a char
utf8.RuneCountInString(s)  // 5 code points

for i, r := range "hé!" {
    // i = byte offset, r = rune (int32)
    fmt.Println(i, string(r)) // 0 h, 1 é, 3 !
}

s == "héllo" // true: == compares contents`,
    },
    {
      type: 'why',
      text: 'UTF-8 is what files, network protocols and JSON already use, so Go strings need no encoding step at I/O boundaries, and ASCII text costs one byte per character. The price is that "the fifth character" is not an O(1) index. When you genuinely need per-character indexing, convert once with `[]rune(s)`, which decodes the whole string into code points.',
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'The Java habit `a == b` for strings is a bug; in Go it is correct. Strings are values compared by content, they can be `map` keys, and they work in `switch` statements. There is no `null` string: the zero value is `""`, so an empty check is just `s == ""`.',
    },
    { type: 'heading', text: 'Everyday operations: the strings package' },
    {
      type: 'table',
      rows: [
        [
          '`s.contains(x)` / `s.startsWith(p)`',
          '`strings.Contains(s, x)` / `strings.HasPrefix(s, p)`',
        ],
        ['`s.split(",")` (regex!)', '`strings.Split(s, ",")`: a literal separator, no regex'],
        ['`s.split("\\\\s+")`', '`strings.Fields(s)`: split on runs of whitespace'],
        ['`s.strip()` / `s.trim()`', '`strings.TrimSpace(s)`'],
        ['`s.equalsIgnoreCase(t)`', '`strings.EqualFold(s, t)`'],
        ['`s.indexOf("=")` + two `substring` calls', '`before, after, ok := strings.Cut(s, "=")`'],
        ['`String.join(",", list)`', '`strings.Join(list, ",")`'],
        ['`s.replace(a, b)`', '`strings.ReplaceAll(s, a, b)`'],
        ['`s.lines()`', '`strings.Lines(s)`: an iterator (Go 1.24)'],
        ['`"ab".repeat(3)`', '`strings.Repeat("ab", 3)`'],
      ],
    },
    {
      type: 'note',
      noteType: 'tip',
      text: '`strings.Cut` (Go 1.18) replaces most `Index` + slice gymnastics, and Go 1.27 adds `strings.CutLast` for splitting at the last separator. The `bytes` package mirrors almost every function for `[]byte`, so you rarely need to convert back and forth.',
    },
    { type: 'heading', text: 'Building strings' },
    {
      type: 'compare',
      javaLabel: 'Java — StringBuilder',
      goLabel: 'Go — strings.Builder',
      java: `StringBuilder sb = new StringBuilder();
for (int i = 0; i < 3; i++) {
    sb.append(i).append(',');
}
String csv = sb.toString(); // "0,1,2,"`,
      go: `var b strings.Builder // zero value is ready to use
for i := range 3 {
    fmt.Fprintf(&b, "%d,", i) // Builder is an io.Writer
}
csv := b.String() // "0,1,2,"

// Or collect and join:
parts := []string{"a", "b", "c"}
joined := strings.Join(parts, ",")`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Exactly as in Java, `s += x` inside a loop copies the whole string on every iteration, which is quadratic time. Use `strings.Builder` or `strings.Join` for anything built in a loop.',
    },
    { type: 'heading', text: 'Strings and byte slices' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'converting between string and []byte copies the data',
      code: `b := []byte("hi") // copy: strings are immutable, []byte is not
b[0] = 'H'
s := string(b)     // copy again: "Hi"

// Raw string literals: backticks, no escapes, may span lines.
// The Go equivalent of a Java text block (""" ... """).
query := \`
    SELECT id, email
    FROM users
    WHERE email LIKE '%@example.com'\``,
    },
    { type: 'heading', text: 'Formatting with fmt' },
    {
      type: 'prose',
      text: '`fmt.Sprintf` is `String.format` with better verbs for inspecting values. `%v` prints any value in a default format, which is what you reach for while debugging.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the verbs you will use every day',
      code: `u := User{ID: 7, Name: "Ada"}

fmt.Printf("%v\\n", u)   // {7 Ada}                         default format
fmt.Printf("%+v\\n", u)  // {ID:7 Name:Ada}                 with field names
fmt.Printf("%#v\\n", u)  // main.User{ID:7, Name:"Ada"}     Go syntax
fmt.Printf("%T\\n", u)   // main.User                       the type

fmt.Printf("%q\\n", "tab\\there") // "tab\\there"  quoted and escaped
fmt.Printf("%8.2f|\\n", 3.14159) // "    3.14|"  width 8, 2 decimals
fmt.Printf("%-6s|\\n", "ab")      // "ab    |"   left-aligned
fmt.Printf("%x %08b\\n", 255, 5)  // "ff 00000101"

err := fmt.Errorf("load user %d: %w", u.ID, cause) // %w wraps an error`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'Implement `String() string` on a type (the `fmt.Stringer` interface) and `%v`, `%s` and `Println` use it, exactly like overriding `toString()`. `go vet` checks every `Printf`-style call and reports mismatched verbs and arguments at build time, something Java only catches at runtime.',
    },
    { type: 'heading', text: 'Parsing and converting: strconv' },
    {
      type: 'compare',
      javaLabel: 'Java — Integer.parseInt and friends',
      goLabel: 'Go — strconv',
      java: `int n = Integer.parseInt("42");
// throws NumberFormatException on bad input

long big = Long.parseLong("9000000000");
double d = Double.parseDouble("2.5");
String s = String.valueOf(99);
boolean ok = Boolean.parseBoolean("true");`,
      go: `n, err := strconv.Atoi("42x")
// n = 0, err = strconv.Atoi: parsing "42x": invalid syntax

big, err := strconv.ParseInt("9000000000", 10, 64)
d, err := strconv.ParseFloat("2.5", 64)
s := strconv.Itoa(99)                // "99"
ok, err := strconv.ParseBool("true") // "1", "t", "TRUE"… also work`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: '`string(65)` does not produce `"65"`: it converts an integer to the Unicode code point it names, giving `"A"`. `go vet` flags this conversion. Use `strconv.Itoa(65)` or `fmt.Sprint(65)` for decimal text.',
    },
  ],
};

export default section;
