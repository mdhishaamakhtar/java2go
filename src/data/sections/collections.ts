import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'collections',
  label: 'Slices & Maps',
  summary:
    'Slices and maps are built-in types, not library classes. How slices share memory, why append must be reassigned, and the slices and maps packages.',
  blocks: [
    {
      type: 'prose',
      text: 'Go has two workhorse collections built into the language: slices (Java’s `ArrayList`) and maps (Java’s `HashMap`). There is no collections hierarchy, no `List` interface and no boxing: a `[]int` stores ints contiguously in memory. Since Go 1.21 the standard `slices` and `maps` packages supply the utility methods you would expect.',
    },
    { type: 'heading', text: 'Slice vs ArrayList' },
    {
      type: 'compare',
      javaLabel: 'Java — ArrayList',
      goLabel: 'Go — slice',
      java: `List<Message> msgs = new ArrayList<>();
msgs.add(new Message(1, "a"));
msgs.add(new Message(2, "b"));

int size = msgs.size();
Message first = msgs.get(0);

for (Message m : msgs) {
    System.out.println(m.topic());
}`,
      go: `// make([]T, length, capacity): capacity is optional
msgs := make([]Message, 0, 10)

// append returns the (possibly new) slice: reassign it
msgs = append(msgs, Message{ID: 1, Topic: "a"})
msgs = append(msgs, Message{ID: 2, Topic: "b"})

size := len(msgs)
first := msgs[0] // out of range panics, like get()

for i, m := range msgs { // m is a COPY of the element
    fmt.Println(i, m.Topic)
}`,
    },
    {
      type: 'why',
      text: 'A slice is a small header of three fields (pointer to a backing array, length, capacity) passed around by value. When `append` runs out of capacity it allocates a bigger array, copies the elements and returns a header pointing at the new array. The old header still points at the old array, which is why you must always write `s = append(s, …)`.',
    },
    { type: 'heading', text: 'Slice internals' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'length, capacity and growth',
      code: `s := make([]int, 3, 5)
// header: ptr → [0 0 0 _ _], len = 3, cap = 5

s = append(s, 99) // len 4, cap 5: same backing array
s = append(s, 88) // len 5, cap 5: full
s = append(s, 77) // len 6 > cap: new, larger array + copy

// Pre-size when you know the final length. Avoids repeated growth.
ids := make([]int64, 0, len(users))
for _, u := range users {
    ids = append(ids, u.ID)
}`,
    },
    { type: 'heading', text: 'Sub-slices share memory' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the slice aliasing gotcha',
      code: `a := []int{1, 2, 3, 4, 5}
b := a[1:3] // [2 3], but backed by a's array

b[0] = 99
fmt.Println(a) // [1 99 3 4 5]: a changed too!

// Worse: append into spare capacity overwrites a's elements
b = append(b, 42)
fmt.Println(a) // [1 99 3 42 5]

// Independent copy
c := slices.Clone(a)

// Or cap the sub-slice so append must reallocate (full slice expression)
d := a[1:3:3] // len 2, cap 2`,
    },
    { type: 'heading', text: 'nil slice vs empty slice' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'both have length 0, but JSON can tell them apart',
      code: `var s1 []string    // nil slice: len 0, s1 == nil
s2 := []string{}    // empty, non-nil slice: len 0

// Both are safe to range over, append to and len():
s1 = append(s1, "ok")

// But encoding/json distinguishes them:
json.Marshal(struct{ Tags []string }{})          // {"Tags":null}
json.Marshal(struct{ Tags []string }{[]string{}}) // {"Tags":[]}

// Check emptiness with len(s) == 0, never s == nil`,
    },
    { type: 'heading', text: 'The slices package (Go 1.21+)' },
    {
      type: 'compare',
      javaLabel: 'Java — Collections and streams',
      goLabel: 'Go — slices package',
      java: `Collections.sort(names);
names.sort(Comparator.comparing(String::length));
boolean has = names.contains("ada");
int idx = names.indexOf("ada");
List<String> copy = new ArrayList<>(names);
Collections.reverse(names);
String max = Collections.max(names);
names.removeIf(String::isBlank);`,
      go: `slices.Sort(names)
slices.SortFunc(names, func(a, b string) int {
    return cmp.Compare(len(a), len(b))
})
has := slices.Contains(names, "ada")
idx := slices.Index(names, "ada")
cp := slices.Clone(names)
slices.Reverse(names)
biggest := slices.Max(names)
names = slices.DeleteFunc(names, func(s string) bool {
    return strings.TrimSpace(s) == ""
})`,
    },
    { type: 'heading', text: 'Map vs HashMap' },
    {
      type: 'compare',
      javaLabel: 'Java — HashMap',
      goLabel: 'Go — map',
      java: `Map<String, Integer> counts = new HashMap<>();
counts.put("go", 1);

Integer n = counts.get("java"); // null if missing
boolean exists = counts.containsKey("go");
counts.merge("go", 1, Integer::sum);
counts.remove("go");

for (var e : counts.entrySet()) { ... }`,
      go: `counts := map[string]int{"go": 1} // literal
// or: counts := make(map[string]int)

n := counts["java"]         // 0: missing key → zero value
n, ok := counts["java"]     // comma-ok: ok is false if missing
counts["go"]++              // no merge() needed: zero value helps
delete(counts, "go")

for key, value := range counts { ... } // order is random!`,
    },
    {
      type: 'why',
      text: 'A map lookup never returns null; it returns the value type’s zero value. The comma-ok form `v, ok := m[k]` distinguishes "present with a zero value" from "absent". Zero values also make counting and grouping pleasant: `counts[w]++` and `groups[k] = append(groups[k], v)` work without initialising the entry first.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'map idioms',
      code: `// A nil map reads fine but PANICS on write
var m map[string]int
_ = m["x"]   // 0
// m["x"] = 1 // panic: assignment to entry in nil map

// Sets: map to the zero-size struct{}
seen := map[string]struct{}{}
seen["ada"] = struct{}{}
if _, ok := seen["ada"]; ok { ... }

// Iteration order is deliberately randomised. Sort keys for stable output:
for _, k := range slices.Sorted(maps.Keys(counts)) {
    fmt.Println(k, counts[k])
}

clear(counts) // Go 1.21: remove every entry`,
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'Maps are **not** safe for concurrent use. A concurrent write is not just a data race: the runtime detects it and crashes the whole process with `fatal error: concurrent map writes`, which cannot be recovered. Protect shared maps with a `sync.Mutex`/`sync.RWMutex`, or use `sync.Map` for the specific patterns it is built for. Both are covered in [Sync Primitives](/sections/sync).',
    },
    { type: 'heading', text: 'Arrays: fixed size, value semantics' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'arrays exist, but you will mostly use slices',
      code: `var grid [3][3]int     // the size is part of the type
hash := sha256.Sum256(data) // returns [32]byte, a value

copied := hash // arrays COPY on assignment, unlike Java arrays
key := hash[:] // slice it to get a []byte view

// Arrays are comparable, so [32]byte works as a map key.`,
    },
  ],
};

export default section;
