import type { Section } from '@/types/section';

const section: Section = {
  id: 'collections',
  title: '09',
  label: 'Slices & Maps',
  blocks: [
    {
      type: 'prose',
      text: "Slices and maps are Go's primary collections. No ArrayList, no HashMap class — they are built-in types with dedicated syntax.",
    },
    { type: 'heading', text: 'Slice vs Java ArrayList' },
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
    System.out.println(m.topic);
}`,
      go: `// make([]Type, length, capacity)
// capacity is optional — pre-alloc avoids reallocations
msgs := make([]Message, 0, 10)

// append always returns the new slice — must reassign
msgs = append(msgs, Message{ID: 1, Topic: "a"})
msgs = append(msgs, Message{ID: 2, Topic: "b"})

size := len(msgs)   // 2
first := msgs[0]    // direct index

for i, m := range msgs {  // i = index, m = copy of element
    fmt.Println(i, m.Topic)
}
for _, m := range msgs {  // _ discards index
    fmt.Println(m.Topic)
}`,
    },
    {
      type: 'why',
      text: 'Slices are not a class — they are a built-in header: (pointer to array, length, capacity). Append may allocate a new backing array and return a new header. This is why you must always write `msgs = append(msgs, ...)` — the original variable may point to the old array.',
    },
    { type: 'heading', text: 'Slice internals — the three-field header' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'slice header: pointer + length + capacity',
      code: `// Internally a slice is three fields:
// { ptr *Array, len int, cap int }

s := make([]int, 3, 5)
// ptr -> [0, 0, 0, _, _]   (backing array, 5 slots)
// len = 3  (3 elements visible)
// cap = 5  (5 slots allocated)

s = append(s, 99)  // len becomes 4, cap still 5
s = append(s, 88)  // len becomes 5, cap still 5
s = append(s, 77)  // len would be 6 > cap=5
// Go allocates a NEW larger backing array, copies, returns new header
// The old backing array is garbage collected

// Pre-allocating avoids this reallocation in hot loops:
msgs := make([]Message, 0, 1000)  // room for 1000 before any realloc`,
    },
    { type: 'heading', text: 'Slice sharing — the gotcha' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'sub-slices share the backing array',
      code: `a := []int{1, 2, 3, 4, 5}

// b is a sub-slice — it shares the SAME backing array as a
b := a[1:3]   // b = [2, 3], but backed by a's array

b[0] = 99     // writing through b modifies the shared array
fmt.Println(a) // [1 99 3 4 5]  — a changed too!

// To make a fully independent copy:
c := make([]int, len(a))
copy(c, a)  // copy(dst, src)
// Now c is independent — modifying c does not affect a`,
    },
    { type: 'heading', text: 'Map vs Java HashMap' },
    {
      type: 'compare',
      javaLabel: 'Java — HashMap',
      goLabel: 'Go — map',
      java: `Map<String, Message> cache = new HashMap<>();
cache.put("key1", new Message(1, "a"));

// get returns null if missing — easy NPE
Message m = cache.get("key1");
boolean exists = cache.containsKey("key1");
cache.remove("key1");`,
      go: `// Must initialise before writing — nil map write panics
cache := make(map[string]Message)

// Set
cache["key1"] = Message{ID: 1, Topic: "a"}

// Get — two-value form, ok is false if key missing
// Never returns null — returns zero value + ok=false
msg, ok := cache["key1"]
if !ok {
    fmt.Println("not found")
}

// Single-value form — returns zero value silently if missing
// Dangerous if you forget to check
msg2 := cache["key1"]  // zero value if missing

delete(cache, "key1")`,
    },
    {
      type: 'why',
      text: 'Go maps never return null — they return the zero value of the value type. The two-value form `val, ok := m[key]` is how you distinguish "key exists with zero value" from "key does not exist". Always use the two-value form when absence matters.',
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'Maps are NOT safe for concurrent access. If two goroutines read/write simultaneously you get a data race. This is fixed with `sync.RWMutex` or `sync.Map`, covered in the Sync Primitives section.',
    },
  ],
};

export default section;
