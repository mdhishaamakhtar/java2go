import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'iterators',
  label: 'Iterators',
  summary:
    'Range-over-func iterators (Go 1.23+) in place of Iterable and Stream: writing them with yield, consuming them with for-range, and lazy pipelines.',
  blocks: [
    {
      type: 'prose',
      text: 'For most of its life Go could only `range` over built-in types: slices, maps, strings, channels. Custom collections exposed callbacks or `Next()` methods, each with its own conventions. **Go 1.23** added range-over-func: any function with the right shape can drive a `for … range` loop. The standard library now returns iterators from `slices`, `maps`, `strings` and `bytes`.',
    },
    { type: 'heading', text: 'The shape of an iterator' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'package iter: two function types',
      code: `// An iterator is a function that pushes values into yield.
type Seq[V any] func(yield func(V) bool)
type Seq2[K, V any] func(yield func(K, V) bool)

// yield returns false when the loop body executes break or return.
// The iterator must then stop immediately.`,
    },
    {
      type: 'compare',
      javaLabel: 'Java — implementing Iterator',
      goLabel: 'Go — returning an iter.Seq',
      java: `class Countdown implements Iterable<Integer> {
    private final int start;
    Countdown(int start) { this.start = start; }

    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            int next = start;
            public boolean hasNext() { return next > 0; }
            public Integer next() {
                if (next <= 0)
                    throw new NoSuchElementException();
                return next--;
            }
        };
    }
}

for (int n : new Countdown(3)) { ... } // 3 2 1`,
      go: `func Countdown(n int) iter.Seq[int] {
    return func(yield func(int) bool) {
        for i := n; i > 0; i-- {
            if !yield(i) {
                return // the caller broke out of the loop
            }
        }
    }
}

for n := range Countdown(3) {
    fmt.Println(n) // 3 2 1
}`,
    },
    {
      type: 'why',
      text: 'A push iterator is written as an ordinary loop: state lives in local variables instead of fields, and there is no `hasNext`/`next` protocol to keep consistent. Because the iterator controls the loop, it can also run cleanup (closing a file or a database cursor) after the last `yield`, which Java’s `Iterator` cannot do without `AutoCloseable` streams.',
    },
    { type: 'heading', text: 'Iterators in the standard library' },
    {
      type: 'table',
      rows: [
        ['`list.iterator()`', '`slices.Values(s)`, and `slices.All(s)` for index + value'],
        ['`list.reversed()` (Java 21)', '`slices.Backward(s)`'],
        ['`map.keySet()` / `map.values()`', '`maps.Keys(m)` / `maps.Values(m)`'],
        ['`stream.toList()`', '`slices.Collect(seq)`'],
        ['`stream.sorted().toList()`', '`slices.Sorted(seq)`'],
        ['`string.lines()`', '`strings.Lines(s)` (Go 1.24)'],
        ['`Pattern.compile(",").splitAsStream(s)`', '`strings.SplitSeq(s, ",")` (Go 1.24)'],
        ['`IntStream.range(0, n)`', '`for i := range n` (Go 1.22, a plain loop)'],
      ],
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'combining standard iterators',
      code: `ages := map[string]int{"bob": 31, "ada": 36}

// Sorted keys: iterate a map in a stable order
for _, name := range slices.Sorted(maps.Keys(ages)) {
    fmt.Println(name, ages[name])
}

// Split lazily, without allocating a []string
for field := range strings.SplitSeq("a,b,c", ",") {
    fmt.Println(field)
}`,
    },
    { type: 'heading', text: 'Lazy pipelines vs Java streams' },
    {
      type: 'compare',
      javaLabel: 'Java — Stream API',
      goLabel: 'Go — small iterator adapters',
      java: `List<String> result = names.stream()
    .filter(s -> s.length() <= 3)
    .map(String::toUpperCase)
    .limit(2)
    .toList();`,
      go: `// Adapters like this are about ten lines each.
// The standard library does not ship Filter/Map for iter.Seq.
func Filter[V any](seq iter.Seq[V], keep func(V) bool) iter.Seq[V] {
    return func(yield func(V) bool) {
        for v := range seq {
            if keep(v) && !yield(v) {
                return
            }
        }
    }
}

short := Filter(slices.Values(names), func(s string) bool {
    return len(s) <= 3
})
// Map and Take are written the same way. Nothing runs until
// Collect pulls values through the pipeline.
result := slices.Collect(Take(Map(short, strings.ToUpper), 2))`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'The idiomatic default is still a plain `for` loop that appends to a slice. It is easy to read, easy to debug and fast. Reach for iterator pipelines when laziness matters (large or unbounded data, early exit) or when you expose a sequence from your own type.',
    },
    { type: 'heading', text: 'Iterators that can fail' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'Seq2[T, error] for paginated APIs and cursors',
      code: `// Pages through an API lazily. Callers see one flat sequence.
func (c *Client) Users(ctx context.Context) iter.Seq2[User, error] {
    return func(yield func(User, error) bool) {
        cursor := ""
        for {
            page, err := c.fetchPage(ctx, cursor)
            if err != nil {
                yield(User{}, err) // report the error once, then stop
                return
            }
            for _, u := range page.Users {
                if !yield(u, nil) {
                    return // caller stopped early: no more requests
                }
            }
            if page.Next == "" {
                return
            }
            cursor = page.Next
        }
    }
}

for u, err := range client.Users(ctx) {
    if err != nil {
        return fmt.Errorf("list users: %w", err)
    }
    if u.Active {
        notify(u)
    }
}`,
    },
    { type: 'heading', text: 'Pull iterators' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'iter.Pull: turn a push iterator into next()',
      code: `// When you need Java-style next() control, for example to
// merge two sorted sequences step by step:
next, stop := iter.Pull(Countdown(2))
defer stop() // always release the iterator's resources

v, ok := next() // 2 true
v, ok = next()  // 1 true
v, ok = next()  // 0 false: exhausted`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'You will still meet older iterator styles, and they remain idiomatic where they fit: `bufio.Scanner` (`for sc.Scan() { sc.Text() }`), `sql.Rows` (`for rows.Next()`), and callback APIs such as `filepath.WalkDir`.',
    },
  ],
};

export default section;
