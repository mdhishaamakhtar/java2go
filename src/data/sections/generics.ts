import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'generics',
  label: 'Generics',
  summary:
    'Type parameters on functions, types and (since Go 1.27) methods; constraints with interfaces, unions and ~; and what Go generics deliberately leave out.',
  blocks: [
    {
      type: 'prose',
      text: 'Generics arrived in Go 1.18 (2022). They let you write functions and types that work across many concrete types with full compile-time checking. They are deliberately smaller than Java’s: no wildcards, no variance annotations, no raw types. And, unlike Java, **no type erasure**: inside a generic function `T` is a real type, so `var zero T` and `make([]T, n)` just work.',
    },
    { type: 'heading', text: 'Generic functions' },
    {
      type: 'compare',
      javaLabel: 'Java — generic method',
      goLabel: 'Go — type parameters after the name',
      java: `static <T, R> List<R> map(List<T> in, Function<T, R> fn) {
    List<R> out = new ArrayList<>(in.size());
    for (T v : in) {
        out.add(fn.apply(v));
    }
    return out;
}

List<String> topics = map(messages, Message::topic);
List<String> strs = map(List.of(1, 2, 3), String::valueOf);`,
      go: `func Map[T, R any](in []T, fn func(T) R) []R {
    out := make([]R, 0, len(in))
    for _, v := range in {
        out = append(out, fn(v))
    }
    return out
}

// Type arguments are inferred from the call
topics := Map(messages, func(m Message) string { return m.Topic })
strs := Map([]int{1, 2, 3}, strconv.Itoa)`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Before writing `Map`, `Filter` or `Contains` yourself, check the standard library: `slices.Contains`, `slices.IndexFunc`, `slices.SortFunc`, `slices.Max`, `maps.Keys` and friends cover most needs. Idiomatic Go also uses a plain `for` loop where Java would chain a stream; that is not a failure to abstract.',
    },
    { type: 'heading', text: 'Generic types' },
    {
      type: 'compare',
      javaLabel: 'Java — generic class',
      goLabel: 'Go — generic struct',
      java: `record Page<T>(List<T> items, String nextCursor) {
    boolean hasMore() {
        return nextCursor != null;
    }
}

Page<User> users = new Page<>(list, "abc");`,
      go: `type Page[T any] struct {
    Items      []T    \`json:"items"\`
    NextCursor string \`json:"next_cursor,omitempty"\`
}

// Methods use the type's parameter
func (p Page[T]) HasMore() bool {
    return p.NextCursor != ""
}

users := Page[User]{Items: list, NextCursor: "abc"}`,
    },
    { type: 'heading', text: 'Constraints' },
    {
      type: 'compare',
      javaLabel: 'Java — bounded type parameters',
      goLabel: 'Go — interfaces as constraints',
      java: `// Upper bound: T must implement Comparable<T>
static <T extends Comparable<T>> T max(List<T> xs) { ... }

// Numeric code needs Number and a conversion
static <T extends Number> double sum(List<T> xs) {
    double total = 0;
    for (T x : xs) total += x.doubleValue();
    return total;
}`,
      go: `// comparable: supports == and != (can be a map key)
func Index[T comparable](xs []T, want T) int { ... }

// cmp.Ordered: supports < <= > >= (numbers and strings)
func Max[T cmp.Ordered](xs []T) T { ... }

// A union constraint lists the allowed types.
// ~int means "int, or any type whose underlying type is int".
type Number interface {
    ~int | ~int32 | ~int64 | ~float32 | ~float64
}

func Sum[T Number](xs []T) T {
    var total T // the zero value of T
    for _, x := range xs {
        total += x // + works: every type in the set supports it
    }
    return total
}`,
    },
    {
      type: 'why',
      text: 'Without the tilde, `Sum` would reject `type Celsius float64` because `Celsius` is not literally `float64`. The `~` admits every type built on the listed ones, which is almost always what you want. Constraints with unions can only be used as constraints, never as ordinary variable types.',
    },
    { type: 'heading', text: 'Generic methods (Go 1.27+)' },
    {
      type: 'compare',
      javaLabel: 'Java — generic instance method',
      goLabel: 'Go 1.27 — methods with their own type parameters',
      java: `class Cache {
    private final Map<String, Object> items = new HashMap<>();

    <T> Optional<T> get(String key, Class<T> type) {
        return Optional.ofNullable(items.get(key))
            .filter(type::isInstance)
            .map(type::cast);
    }
}`,
      go: `type Cache struct {
    items map[string]any
}

// Allowed since Go 1.27. Earlier versions required a
// package-level function: func Get[T any](c *Cache, key string)
func (c *Cache) Get[T any](key string) (T, bool) {
    v, ok := c.items[key].(T)
    return v, ok
}

n, ok := cache.Get[int]("retries")`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Interface methods still cannot declare type parameters, and a generic method never satisfies an interface method. In code written before Go 1.27 you will see the workaround everywhere: generic helpers as package-level functions taking the receiver as the first argument.',
    },
    { type: 'heading', text: 'Recursive constraints (Go 1.26+)' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the Go version of <T extends Comparable<T>>',
      code: `// A constraint that refers to the type being constrained.
// Before Go 1.26 a generic type could not refer to itself here.
type Ordered[T Ordered[T]] interface {
    Less(T) bool
}

func Min[T Ordered[T]](a, b T) T {
    if b.Less(a) {
        return b
    }
    return a
}

type Version struct{ Major, Minor int }

func (v Version) Less(o Version) bool {
    return v.Major < o.Major || (v.Major == o.Major && v.Minor < o.Minor)
}

oldest := Min(Version{1, 4}, Version{1, 2}) // {1 2}`,
    },
    { type: 'heading', text: 'What Go generics leave out' },
    {
      type: 'table',
      rows: [
        ['`List<? extends Number>` wildcards', 'None: use a type parameter or an interface'],
        [
          'Covariance: a `List<Integer>` is not a `List<Number>`',
          'Same in Go: `[]Dog` is never a `[]Animal`',
        ],
        [
          'Type erasure: no `new T()`, no `T[]`',
          'No erasure: `var zero T`, `make([]T, n)`, `any(v).(T)` all work',
        ],
        [
          'Primitive type arguments need boxing',
          'Any type works: `Max[int]` operates on real ints',
        ],
        [
          'Specialisation via overloading',
          'No overloading or specialisation; use a type switch if you must',
        ],
      ],
    },
    {
      type: 'callout',
      title: 'When to use generics',
      tone: 'go',
      text: 'Use them for **data structures** (a typed cache, set or tree) and **algorithms over collections** (sort, filter, group). Prefer an ordinary interface when you only call methods on the value: `func Save(w io.Writer)` is simpler than `func Save[W io.Writer](w W)`. A useful rule: write the concrete version first, and reach for type parameters when you find yourself copying it for a second type.',
    },
  ],
};

export default section;
