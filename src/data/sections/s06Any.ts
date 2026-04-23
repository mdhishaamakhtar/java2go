import type { Section } from '@/types/section';

const section: Section = {
  id: 'any',
  title: '07',
  label: 'any / interface{}',
  blocks: [
    {
      type: 'prose',
      text: '`any` is an alias for `interface{}` — the empty interface with no methods. Every type satisfies it. It is Go\'s escape hatch for "I genuinely don\'t know the type at compile time."',
    },
    { type: 'heading', text: 'any vs Java Object' },
    {
      type: 'compare',
      javaLabel: 'Java — Object as universal base',
      goLabel: 'Go — any (interface{}) as universal type',
      java: `Object val = 42;          // autoboxed to Integer
val = "now a string";

// Cast to use it
if (val instanceof String s) {
    System.out.println(s.toUpperCase());
}

// Old style
String s = (String) val;  // ClassCastException if wrong`,
      go: `var val any = 42
val = "now a string"   // reassign to different type — fine

// Type assertion — explicit check
s, ok := val.(string)  // ok = true if val is a string
if ok {
    fmt.Println(strings.ToUpper(s))
}

// Type assertion without check — panics if wrong type
s2 := val.(string)  // panics if val is not a string`,
    },
    {
      type: 'why',
      text: 'Go does not have an object hierarchy — there is no universal base class. `any` is simply an interface with no method requirements. No autoboxing, no class cast exceptions — just an explicit assertion that you check.',
    },
    { type: 'heading', text: 'Type switch — clean multi-type handling' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'type switch — the idiomatic way to handle any',
      code: `func describe(val any) string {
    // switch v := val.(type) extracts the value as the correct type
    // v has the concrete type in each case branch
    switch v := val.(type) {
    case string:
        return "string: " + v          // v is string here
    case int:
        return fmt.Sprintf("int: %d", v)  // v is int here
    case bool:
        return fmt.Sprintf("bool: %t", v)
    case []byte:
        return fmt.Sprintf("bytes: %d bytes", len(v))
    default:
        return fmt.Sprintf("unknown type: %T", v)
        // %T prints the concrete type name
    }
}`,
    },
    { type: 'heading', text: 'Where you see any in a comms engine' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'metadata maps and gin.H',
      code: `// Message metadata bag — different messages carry different metadata
type Message struct {
    ID       int64
    Topic    string
    Payload  []byte
    Metadata map[string]any  // open-ended key-value bag
}

// Store any type of metadata
msg.Metadata = map[string]any{}
msg.Metadata["trace_id"]  = "abc-123-def"
msg.Metadata["priority"]  = 5
msg.Metadata["retryable"] = true

// Retrieve and assert
traceID, ok := msg.Metadata["trace_id"].(string)
priority, ok := msg.Metadata["priority"].(int)

// gin.H is literally just: type H map[string]any
// so when you write gin.H{...} you are writing map[string]any{...}
c.JSON(200, gin.H{"status": "ok", "count": 42})`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Avoid `any` in hot paths. Type assertions have a small runtime cost and you lose compile-time safety. Prefer typed interfaces or generics (section 15) when possible.',
    },
  ],
};

export default section;
