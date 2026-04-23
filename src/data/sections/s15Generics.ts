import type { Section } from '@/types/section';

const section: Section = {
  id: 'generics',
  title: '17',
  label: 'Generics',
  blocks: [
    {
      type: 'prose',
      text: 'Generics (Go 1.18+) let you write functions and types that work across multiple concrete types with full compile-time type safety. No casting, no `any`, no runtime type assertions.',
    },
    { type: 'heading', text: 'The problem generics solve' },
    {
      type: 'compare',
      javaLabel: 'Java — pre-generics (Object) or raw types',
      goLabel: 'Go — pre-generics problem (same issue)',
      java: `// Before generics: cast everywhere, ClassCastException at runtime
List items = new ArrayList();
items.add("hello");
items.add(42);  // compiles!
String s = (String) items.get(1);  // ClassCastException at runtime

// With generics: type-safe
List<String> items2 = new ArrayList<>();
items2.add("hello");
// items2.add(42);  compile error — caught early
String s2 = items2.get(0);  // no cast needed`,
      go: `// Without generics: use any, assert types at runtime
func contains(slice []any, val any) bool {
    for _, v := range slice {
        if v == val { return true }
    }
    return false
}
// Compiles — but type-unsafe, runtime assertions needed

// With generics: type-safe, no assertions
func Contains[T comparable](slice []T, val T) bool {
    for _, v := range slice {
        if v == val { return true }
    }
    return false
}
// Compiler checks T is comparable at call site
Contains([]string{"a","b"}, "a")  // T inferred as string
Contains([]int{1, 2, 3}, 4)        // T inferred as int`,
    },
    { type: 'heading', text: 'Generic function syntax — Java vs Go side by side' },
    {
      type: 'compare',
      javaLabel: 'Java — generic method',
      goLabel: 'Go — generic function',
      java: `// Java: type params before return type
public static <T, U> List<U> map(List<T> in, Function<T, U> fn) {
    List<U> out = new ArrayList<>(in.size());
    for (T v : in) {
        out.add(fn.apply(v));
    }
    return out;
}

List<String> topics = map(messages, m -> m.topic);
List<String> strs = map(List.of(1, 2, 3), String::valueOf);`,
      go: `// Go: type params after function name
func Map[T, U any](slice []T, fn func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = fn(v)
    }
    return result
}

topics := Map(messages, func(m Message) string { return m.Topic })
strs := Map([]int{1, 2, 3}, strconv.Itoa)`,
    },
    { type: 'heading', text: 'Generic types — type parameter on a struct' },
    {
      type: 'compare',
      javaLabel: 'Java — generic class',
      goLabel: 'Go — generic type',
      java: `// Java — generic class
class APIResponse<T> {
    private T data;
    private boolean success;
    private String message;

    public APIResponse(T data) {
        this.data = data;
        this.success = true;
    }
}

APIResponse<User> r1 = new APIResponse<>(user);
APIResponse<List<Order>> r2 = new APIResponse<>(orders);`,
      go: `// Go — generic type
type APIResponse[T any] struct {
    Data    T      \`json:"data"\`
    Success bool   \`json:"success"\`
    Message string \`json:"message,omitempty"\`
}

// Generic constructor
func OK[T any](data T) APIResponse[T] {
    return APIResponse[T]{Data: data, Success: true}
}

func Fail[T any](msg string) APIResponse[T] {
    return APIResponse[T]{Success: false, Message: msg}
}

// Usage — T inferred from argument
c.JSON(200, OK(user))     // APIResponse[User]
c.JSON(200, OK(orders))   // APIResponse[[]Order]
c.JSON(404, Fail[User]("not found"))`,
    },
    { type: 'heading', text: 'Type constraints — Java vs Go side by side' },
    {
      type: 'compare',
      javaLabel: 'Java — bounds / interfaces',
      goLabel: 'Go — comparable / interface / union',
      java: `// Interface bound (similar to Go interface constraint)
static <T extends Stringable> void printAll(List<T> items) {
    for (T item : items) {
        System.out.println(item.asString());
    }
}

// Numeric operations in Java usually need Number + conversion
static <T extends Number> double sum(List<T> nums) {
    double total = 0;
    for (T n : nums) total += n.doubleValue();
    return total;
}`,
      go: `// comparable: supports == and != (map keys, equality helpers)
func Keys[K comparable, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }
    return keys
}

// Interface constraint
type Stringer interface { String() string }
func PrintAll[T Stringer](items []T) {
    for _, item := range items {
        fmt.Println(item.String())
    }
}

// Union constraint (exact allowed types)
type Number interface { int | int64 | float32 | float64 }
func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}`,
    },
    { type: 'heading', text: 'Real-world generic utility functions' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'Filter, Find, GroupBy — write once, use everywhere',
      code: `// Filter — keep only elements where predicate returns true
func Filter[T any](slice []T, keep func(T) bool) []T {
    result := make([]T, 0)
    for _, v := range slice {
        if keep(v) {
            result = append(result, v)
        }
    }
    return result
}

// Find — return first match, or zero value + false
func Find[T any](slice []T, match func(T) bool) (T, bool) {
    for _, v := range slice {
        if match(v) { return v, true }
    }
    var zero T  // zero value of T
    return zero, false
}

// Usage
active := Filter(workers, func(w *Worker) bool { return w.Active })

w, found := Find(workers, func(w *Worker) bool { return w.ID == "w-1" })

// These work for ANY type — no code duplication, no any casting`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Java generics have wildcards (`? extends T`, `? super T`), variance, and type erasure. Go generics have none of those. They are simpler, predictable, and fully reified (no type erasure). The trade-off is less flexibility for some advanced patterns.',
    },
  ],
};

export default section;
