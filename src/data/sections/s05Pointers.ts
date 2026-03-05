import type { Section } from '@/types/section';

const section: Section = {
  id: 'pointers',
  title: '05',
  label: 'Pointers',
  blocks: [
    {
      type: 'prose',
      text: 'A pointer stores a memory address — the location of a value, not the value itself. Go makes this explicit. You choose, at every point, whether to work with the value or its address.',
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Java hides this completely. Every object variable is secretly a reference (pointer). You never see the address, you never choose. Go makes the choice visible and explicit — which is why Go code is full of `*` and `&`.',
    },
    { type: 'heading', text: 'The two operators: & and *' },
    {
      type: 'codeblock',
      lang: 'go',
      label: '& = address-of,  * = dereference',
      code: `x := 42
// x lives at some address in memory, say 0xc0000b4008
// x holds the value 42

p := &x
// & means 'give me the address of x'
// p is now type *int (pointer to int)
// p holds the VALUE 0xc0000b4008 — the address where 42 lives

*p = 100
// * means 'follow this address and operate on what is there'
// This goes to address 0xc0000b4008 and writes 100
// That address IS x — so x is now 100

fmt.Println(x)   // 100  — x changed even though we wrote to p
fmt.Println(*p)  // 100  — *p reads through the pointer
fmt.Println(p)   // 0xc0000b4008  — p itself is just an address`,
    },
    {
      type: 'callout',
      title: 'Memory model — two variables',
      color: '#7c9fff',
      text: `x  lives at 0xc0000b4008  holds value: 42\np  lives at 0xc0000b4016  holds value: 0xc0000b4008  (points to x)\n\n*p = 100  →  follow p  →  go to 0xc0000b4008  →  write 100\nThat location IS x. So x changes.`,
    },
    { type: 'heading', text: 'Java reference vs Go pointer — what is actually different' },
    {
      type: 'compare',
      javaLabel: 'Java — every object is secretly a reference',
      goLabel: 'Go — explicit pointer vs value',
      java: `// Java hides the pointer — you never choose
Message m1 = new Message();  // m1 is secretly a reference
Message m2 = m1;             // m2 points to SAME object
m2.retries = 5;              // mutates m1.retries too!

// Java primitives are copied (not references):
int a = 10;
int b = a;   // b is a copy
b = 20;      // a is still 10`,
      go: `// Go — you choose explicitly
m1 := Message{Retries: 0}  // value on the stack
m2 := m1                   // m2 is a COPY — independent
m2.Retries = 5             // m1.Retries is still 0

// To share — use a pointer explicitly
m3 := &Message{Retries: 0}  // m3 is *Message — a pointer
m4 := m3                    // m4 points to SAME Message
m4.Retries = 5              // m3.Retries is now 5`,
    },
    {
      type: 'why',
      text: 'Go gives you control. You choose value (copy, independent) or pointer (shared, mutatable). This makes data flow visible in code. In Java, sharing vs copying is hidden — you have to know the rules for primitives vs objects. In Go, you see it in the type: `Message` vs `*Message`.',
    },
    { type: 'heading', text: 'Auto-dereference for struct fields' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'go auto-dereferences pointer to struct',
      code: `type Message struct { Topic string; Retries int }

msg := &Message{Topic: "orders"}  // msg is *Message

// Without auto-deref you would need to write:
(*msg).Topic = "updated"  // (*msg) dereferences, then .Topic accesses field

// But Go auto-inserts (*msg) for struct pointer field access:
msg.Topic = "updated"  // identical to (*msg).Topic = "updated"
msg.Retries++          // identical to (*msg).Retries++

// This is why you can call methods on a *Message without writing (*msg).Method():
msg.IncrementRetry()  // Go inserts the dereference for you`,
    },
    { type: 'heading', text: 'Four reasons you see *Type everywhere in Go code' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'when to use a pointer',
      code: `// REASON 1: MUTATION — pointer receiver lets method change the struct
func (m *Message) IncrementRetry() {
    m.Retries++  // mutates the real Message, not a copy
}

// REASON 2: AVOID COPYING — large structs are expensive to copy
// A *Message is always 8 bytes (64-bit pointer)
// A Message with a 1MB Payload would copy 1MB on every call
func ProcessMessage(msg *Message) error {  // pass the address, not the data
    return nil
}

// REASON 3: SHARED SINGLETON — one DB pool, one engine instance
// Every goroutine uses the same *sql.DB — it manages its own connection pool
func NewEngine(store MessageStore) *Engine {
    return &Engine{store: store}  // allocate once, share everywhere
}

// REASON 4: OPTIONAL / NULLABLE — nil pointer means 'not set'
type Config struct {
    MaxRetries *int           // nil = use built-in default (3)
    Timeout    *time.Duration // nil = no timeout
}`,
    },
    { type: 'heading', text: 'nil pointer — the most common runtime panic' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'nil pointer dereference — how it happens and how to prevent it',
      code: `var msg *Message   // declared but not initialised — value is nil
                   // msg points to NOTHING

// Any field access or method call on nil panics:
// msg.Topic     PANIC: runtime error: invalid memory address
// msg.Retries++ PANIC: same

// Always guard before using a pointer you did not create yourself:
if msg != nil {
    fmt.Println(msg.Topic)  // safe
}

// Defensive nil check at function entry — common in engine dispatch:
func (e *Engine) Dispatch(msg *Message) error {
    if msg == nil {
        return fmt.Errorf("dispatch: received nil message")
    }
    return e.store.Save(*msg)
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Never copy a struct that will contain a mutex or channel (introduced in later sections). Always use a pointer to such structs. `go vet` detects this.',
    },
  ],
};

export default section;
