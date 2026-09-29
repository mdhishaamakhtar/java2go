import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'structs',
  label: 'Structs',
  summary:
    'Structs hold data, methods are declared beside them, constructors are plain functions, and embedding replaces inheritance.',
  blocks: [
    {
      type: 'prose',
      text: 'A struct is a typed collection of fields. There is no class, no constructor keyword and no `this`: you get a struct definition, an optional `NewX()` function by convention, and methods with an explicit receiver.',
    },
    { type: 'heading', text: 'Defining a struct and creating instances' },
    {
      type: 'compare',
      javaLabel: 'Java — class with a constructor',
      goLabel: 'Go — struct + constructor function',
      java: `public class Message {
    private final long id;
    private final String topic;
    private byte[] payload;
    private int retries;

    public Message(long id, String topic) {
        this.id = id;
        this.topic = topic;
        this.retries = 0;
    }
}

Message m = new Message(1L, "orders");`,
      go: `type Message struct {
    ID      int64  // exported: other packages can read it
    Topic   string
    Payload []byte // nil until set
    Retries int    // zero value 0 is a valid default
}

// Constructor by convention: an ordinary function
func NewMessage(id int64, topic string) *Message {
    return &Message{ID: id, Topic: topic}
}

m := NewMessage(1, "orders")`,
    },
    {
      type: 'why',
      text: '`NewX()` is a naming convention, not a language feature. Write one when construction needs validation or non-zero defaults; skip it when a struct literal is clear enough. Returning `*Message` versus `Message` is a real decision covered in [Pointers](/sections/pointers#when-to-use-a-pointer). Where the value lives (stack or heap) is **not** decided by that choice: the compiler’s escape analysis decides.',
    },
    { type: 'heading', text: 'Initialisation styles' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'go — three ways to initialise, one to prefer',
      code: `// 1. Named fields: always prefer this. Order does not matter,
//    omitted fields get their zero value.
msg := Message{
    ID:    1,
    Topic: "orders.created",
}

// 2. Positional: breaks when a field is added. go vet warns
//    when you do this with a struct from another package.
msg2 := Message{1, "orders.created", nil, 0}

// 3. Zero value: every field zeroed, ready to use
var msg3 Message

// Taking the address of a literal gives you a *Message
msg4 := &Message{ID: 2, Topic: "payments"}

// Anonymous struct: handy for one-off shapes in tests and JSON
point := struct{ X, Y int }{X: 1, Y: 2}`,
    },
    { type: 'heading', text: 'Methods: explicit receivers' },
    {
      type: 'compare',
      javaLabel: "Java — methods inside the class, implicit 'this'",
      goLabel: 'Go — methods beside the struct, named receiver',
      java: `public class Message {
    private int retries;

    public boolean isRetryable() {
        return this.retries < 3;
    }

    public void incrementRetry() {
        this.retries++;
    }
}`,
      go: `// Value receiver: m is a copy of the caller's Message
func (m Message) IsRetryable() bool {
    return m.Retries < 3
}

// Pointer receiver: m points at the caller's Message
func (m *Message) IncrementRetry() {
    m.Retries++ // visible to the caller
}`,
    },
    {
      type: 'why',
      text: 'Go makes mutation visible in the signature. A value receiver `(m Message)` works on a copy, so the method cannot change the caller’s struct. A pointer receiver `(m *Message)` can. In Java every instance method can mutate `this` and you have to read the body to know. The receiver name is short by convention (`m`, `s`, `srv`), never `this` or `self`.',
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'If any method needs a pointer receiver, give all of the type’s methods pointer receivers. Mixing them works, but it makes the type’s method set (and therefore which interfaces it satisfies) harder to reason about.',
    },
    { type: 'heading', text: 'Struct equality' },
    {
      type: 'compare',
      javaLabel: 'Java — equals() and hashCode()',
      goLabel: 'Go — == compares every field',
      java: `record Point(int x, int y) {}  // equals/hashCode generated

new Point(1, 2).equals(new Point(1, 2)); // true
new Point(1, 2) == new Point(1, 2);      // false: identity

// Usable as a HashMap key because of hashCode()`,
      go: `type Point struct{ X, Y int }

Point{1, 2} == Point{1, 2} // true: field-by-field

// Comparable structs are valid map keys, no code needed
seen := map[Point]bool{}
seen[Point{1, 2}] = true

// Structs containing slices, maps or funcs are not comparable:
// == on them is a compile error.`,
    },
    { type: 'heading', text: 'Embedding: composition instead of inheritance' },
    {
      type: 'compare',
      javaLabel: 'Java — extends (is-a)',
      goLabel: 'Go — embedding (has-a, with promotion)',
      java: `class BaseMessage {
    protected long id;
    protected String topic;

    public String logLine() {
        return id + " on " + topic;
    }
}

// PriorityMessage IS-A BaseMessage
class PriorityMessage extends BaseMessage {
    private int priority;
}`,
      go: `type BaseMessage struct {
    ID    int64
    Topic string
}

func (b BaseMessage) LogLine() string {
    return fmt.Sprintf("%d on %s", b.ID, b.Topic)
}

// PriorityMessage HAS-A BaseMessage
type PriorityMessage struct {
    BaseMessage // no field name: embedded
    Priority int
}

pm := PriorityMessage{
    BaseMessage: BaseMessage{ID: 1, Topic: "alerts"},
    Priority:    10,
}
pm.LogLine() // promoted: pm.BaseMessage.LogLine()
pm.ID        // promoted: pm.BaseMessage.ID`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '**Go 1.27** lets struct literals use promoted fields directly: `PriorityMessage{ID: 1, Topic: "alerts", Priority: 10}`. Earlier versions require spelling out the embedded struct as above, which you will see in most existing code.',
    },
    {
      type: 'callout',
      title: 'The trap for Java developers: no virtual dispatch through embedding',
      tone: 'warn',
      text: 'An outer type can declare a method with the same name as an embedded one; it **shadows** the promoted method. But this is not overriding. When a method on the embedded type calls another of its own methods, it always calls the embedded version, never the outer one. The Template Method pattern, where a base class calls a hook the subclass overrides, does not work through embedding.\n\nIf you need that kind of polymorphism, define an interface for the hook and pass an implementation in explicitly. That makes the extension point visible instead of implicit.',
    },
    {
      type: 'why',
      text: 'Embedding is mechanical promotion of fields and methods, not an is-a relationship. `PriorityMessage` cannot be passed where a `BaseMessage` is expected; polymorphism comes only from interfaces. Removing inheritance removes whole categories of problems: fragile base classes, deep hierarchies and the question of which `super` call runs when.',
    },
    { type: 'heading', text: 'Struct tags: metadata for libraries' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'struct tags for JSON, databases and validation',
      code: `// Tags are string literals after a field. Libraries read them
// at runtime through reflection, much like Java annotations.
type User struct {
    ID        int64     \`json:"id"         db:"id"\`
    Email     string    \`json:"email"      validate:"required,email"\`
    Nickname  string    \`json:"nickname,omitempty"\` // omit when ""
    CreatedAt time.Time \`json:"created_at,omitzero"\` // Go 1.24+
    Password  string    \`json:"-"\`                  // never serialised
}

// json.Marshal output:
// {"id":1,"email":"ada@example.com","created_at":"2026-01-02T15:04:05Z"}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Tags are just strings to the compiler. A typo such as `json: "email"` (note the space) compiles, and the field is silently serialised as `Email` instead. `go vet` validates tag syntax and catches this, which is one more reason to run it in CI.',
    },
  ],
};

export default section;
