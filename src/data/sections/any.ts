import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'any',
  label: 'any / interface{}',
  summary:
    'The empty interface is Go’s Object: type assertions, type switches, and the nil-interface trap that catches every Java developer once.',
  blocks: [
    {
      type: 'prose',
      text: '`any` is an alias for `interface{}`, the interface with no methods. Every type satisfies it. It is Go’s escape hatch for "I genuinely don’t know the type at compile time", and it should be rare in application code.',
    },
    { type: 'heading', text: 'any vs Java Object' },
    {
      type: 'compare',
      javaLabel: 'Java — Object and pattern matching',
      goLabel: 'Go — any and type assertions',
      java: `Object val = 42;       // autoboxed to Integer
val = "now a string";

if (val instanceof String s) {   // Java 16+
    System.out.println(s.toUpperCase());
}

String t = (String) val; // ClassCastException if wrong`,
      go: `var val any = 42
val = "now a string"

// Comma-ok assertion: never panics
if s, ok := val.(string); ok {
    fmt.Println(strings.ToUpper(s))
}

t := val.(string) // panics if val is not a string`,
    },
    {
      type: 'why',
      text: 'Go has no class hierarchy, so there is no universal base class. `any` is simply the interface every type satisfies. There is no boxing ceremony and no checked cast syntax to remember: a type assertion either uses the comma-ok form and checks, or panics like a failed cast.',
    },
    { type: 'heading', text: 'Type switches' },
    {
      type: 'compare',
      javaLabel: 'Java 21 — pattern matching for switch',
      goLabel: 'Go — type switch',
      java: `static String describe(Object val) {
    return switch (val) {
        case String s -> "string: " + s;
        case Integer i -> "int: " + i;
        case byte[] b -> b.length + " bytes";
        case null -> "null";
        default -> "unknown: " + val.getClass();
    };
}`,
      go: `func describe(val any) string {
    switch v := val.(type) {
    case string:
        return "string: " + v // v is a string here
    case int:
        return fmt.Sprintf("int: %d", v)
    case []byte:
        return fmt.Sprintf("%d bytes", len(v))
    case nil:
        return "nil"
    default:
        return fmt.Sprintf("unknown: %T", v) // %T prints the type
    }
}`,
    },
    { type: 'heading', text: 'Where any shows up in real code' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'decoding unknown JSON and metadata bags',
      code: `// Decoding JSON whose shape you do not know
var doc map[string]any
if err := json.Unmarshal(data, &doc); err != nil {
    return err
}

// JSON numbers decode as float64, never int!
count, ok := doc["count"].(float64)   // ok
// n, ok := doc["count"].(int)        // always false

// Nested objects are map[string]any, arrays are []any
tags, _ := doc["tags"].([]any)

// Standard library APIs that take any:
//   fmt.Println(a ...any)
//   json.Marshal(v any)
//   context.WithValue(ctx, key, val any)`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Reach for a concrete struct, a small interface, or generics before `any`. Decode JSON into a typed struct whenever you know its shape. `map[string]any` is for genuinely dynamic data, and every value you pull out of it costs a type assertion and a possible bug.',
    },
    { type: 'heading', text: 'The nil interface trap' },
    {
      type: 'prose',
      text: 'An interface value has two parts: a **type** and a **value**. It is only `nil` when both are nil. Put a nil pointer into an interface and the interface is no longer nil, because it now knows the type. This bites hardest with the `error` interface.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'a nil pointer inside an interface is not a nil interface',
      code: `type ValidationError struct{ Field string }

func (e *ValidationError) Error() string { return e.Field + " is invalid" }

func validate(name string) error {
    var verr *ValidationError // nil pointer
    if name == "" {
        verr = &ValidationError{Field: "name"}
    }
    return verr // BUG: returns (type=*ValidationError, value=nil)
}

err := validate("ada")
fmt.Println(err == nil) // false! The interface holds a type.

// FIX: return a literal nil on the success path
func validate(name string) error {
    if name == "" {
        return &ValidationError{Field: "name"}
    }
    return nil
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Never declare a function’s error result as a concrete pointer type and then return it as `error`. Return `nil` explicitly. Static analysers such as `nilness` and staticcheck catch some of these cases, but not all.',
    },
  ],
};

export default section;
