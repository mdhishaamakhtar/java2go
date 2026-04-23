import type { Section } from '@/types/section';

const section: Section = {
  id: 'structs',
  title: '04',
  label: 'Structs',
  blocks: [
    {
      type: 'prose',
      text: 'Structs hold data. Methods are attached separately. There is no class, no constructor keyword, no this — just a struct definition, a `NewX()` factory function, and methods with explicit receivers.',
    },
    { type: 'heading', text: 'Defining a struct and creating instances' },
    {
      type: 'compare',
      javaLabel: 'Java — class with constructor',
      goLabel: 'Go — struct + factory function',
      java: `public class Message {
    private long id;
    private String topic;
    private byte[] payload;
    private int retries;

    public Message(long id, String topic) {
        this.id = id;
        this.topic = topic;
        this.retries = 0;  // explicit default
    }
}

Message m = new Message(1L, "orders");`,
      go: `type Message struct {
    ID      int64  // exported — other packages can read
    Topic   string // exported
    Payload []byte // exported — byte slice, nil until set
    Retries int    // exported — zero value is 0, valid default
}

// Factory function — Go's 'constructor'
// Returns value (stack) — pointer version below
func NewMessage(id int64, topic string) Message {
    return Message{ID: id, Topic: topic}
    // Retries gets zero value 0 automatically
}

m := NewMessage(1, "orders")`,
    },
    {
      type: 'why',
      text: 'Structs have no constructors. `NewX()` is a convention, not a language feature. This means you can also create structs inline without going through a constructor — which is often cleaner for test data and simple cases.',
    },
    { type: 'heading', text: 'Struct initialisation styles' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'go — three ways to initialise',
      code: `// 1. Named fields — always prefer this, order does not matter
msg := Message{
    ID:    1,
    Topic: "orders.created",
    // Payload omitted — gets nil (zero value for []byte)
    // Retries omitted — gets 0
}

// 2. Positional — fragile, breaks when struct gains fields. Avoid.
msg2 := Message{1, "orders.created", nil, 0}

// 3. Zero value — every field gets its zero value
var msg3 Message  // Message{ID:0, Topic:"", Payload:nil, Retries:0}

// Pointer to struct — most common in service/engine code
// & allocates on the heap and returns the address
msg4 := &Message{ID: 2, Topic: "payments"}
// msg4 is *Message — a pointer to a Message`,
    },
    { type: 'heading', text: 'Methods — receiver syntax' },
    {
      type: 'compare',
      javaLabel: "Java — methods inside class, implicit 'this'",
      goLabel: 'Go — methods outside struct, explicit receiver',
      java: `public class Message {
    private int retries;

    // 'this' is implicit
    public boolean isRetryable() {
        return this.retries < 3;
    }

    // mutates this
    public void incrementRetry() {
        this.retries++;
    }
}`,
      go: `// Methods live OUTSIDE the struct definition
// The receiver (m Message) is explicit — it IS 'this'

// Value receiver — m is a COPY, cannot mutate original
func (m Message) IsRetryable() bool {
    return m.Retries < 3
    // m is a copy — changes here are discarded
}

// Pointer receiver — m is the REAL struct, can mutate
func (m *Message) IncrementRetry() {
    m.Retries++  // mutates the original
}`,
    },
    {
      type: 'why',
      text: 'Go makes mutation visible. If you see `(m Message)`, this method cannot change anything. If you see `(m *Message)`, it can. In Java, every non-static method can mutate the object — you have to read the body to know. In Go, the signature tells you.',
    },
    { type: 'heading', text: 'Embedding — composition over inheritance' },
    {
      type: 'compare',
      javaLabel: 'Java — extends (is-a relationship)',
      goLabel: 'Go — embedding (has-a, with promotion)',
      java: `class BaseMessage {
    protected long id;
    protected String topic;

    public String logLine() {
        return id + " on " + topic;
    }
}

// Admin IS-A User
class PriorityMessage extends BaseMessage {
    private int priority;
    // inherits id, topic, logLine()
}`,
      go: `type BaseMessage struct {
    ID    int64
    Topic string
}

func (b BaseMessage) LogLine() string {
    return fmt.Sprintf("%d on %s", b.ID, b.Topic)
}

// PriorityMessage HAS-A BaseMessage (embedded)
type PriorityMessage struct {
    BaseMessage        // no field name = embedded
    Priority int
}

pm := PriorityMessage{
    BaseMessage: BaseMessage{ID: 1, Topic: "alerts"},
    Priority:    10,
}
pm.LogLine()  // promoted — same as pm.BaseMessage.LogLine()
pm.ID         // promoted field — same as pm.BaseMessage.ID`,
    },
    {
      type: 'why',
      text: 'Go has no inheritance hierarchy. Embedding is mechanical field/method promotion — not an is-a relationship. There is no polymorphism through embedding (that comes from interfaces). This eliminates entire categories of OOP complexity: no diamond problem, no method hiding, no abstract classes.',
    },
    { type: 'heading', text: 'Struct tags — metadata for libraries' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'struct tags — JSON, DB, validation',
      code: `// Tags are string literals in backticks after field declarations
// Libraries like encoding/json and validator packages read them

type User struct {
    ID        int64     \`json:"id"          db:"id"\`
    Email     string    \`json:"email"       db:"email"       validate:"required,email"\`
    CreatedAt time.Time \`json:"created_at"  db:"created_at"\`
    Password  string    \`json:"-"\`           // json:"-" = omit from JSON output
}

// json.Marshal uses the json tag for key names:
// { "id": 1, "email": "h@x.com", "created_at": "..." }
// Password is not included because json:"-"

// easyjson can generate MarshalJSON()/UnmarshalJSON() from these tags
// sqlc is different: it generates code from SQL files + schema, not struct tags
// go-playground/validator uses validate tags`,
    },
  ],
};

export default section;
