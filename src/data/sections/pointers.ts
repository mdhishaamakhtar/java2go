import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'pointers',
  label: 'Pointers',
  summary:
    'Java hides references; Go makes you choose between a value and a pointer. When to use each, and why it is safer than C.',
  blocks: [
    {
      type: 'prose',
      text: 'A pointer holds the address of a value rather than the value itself. Go makes the choice explicit: every variable, field and parameter is either a value (`Message`) or a pointer to one (`*Message`). Unlike C, there is no pointer arithmetic and memory is garbage collected, so pointers in Go are about **sharing and mutation**, not manual memory management.',
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Java hides this decision. Primitives are always copied and every object variable is a reference, so all objects are shared by default. Java is still strictly pass-by-value; it just passes copies of references. Go is also pass-by-value, but you decide whether the thing being copied is the struct or a pointer to it.',
    },
    { type: 'heading', text: 'The two operators: & and *' },
    {
      type: 'codeblock',
      lang: 'go',
      label: '& takes an address, * follows one',
      code: `x := 42
p := &x // & = "address of x". p has type *int

*p = 100 // * = "the value p points to". Writes to x.

fmt.Println(x)  // 100: x changed through p
fmt.Println(*p) // 100: reading through the pointer
fmt.Println(p)  // 0xc000012080: the address itself

var q *int      // zero value of a pointer type is nil
fmt.Println(q == nil) // true`,
    },
    { type: 'heading', text: 'Java references vs Go values and pointers' },
    {
      type: 'compare',
      javaLabel: 'Java — objects are always shared',
      goLabel: 'Go — you choose: copy or share',
      java: `Message m1 = new Message();
Message m2 = m1;   // same object
m2.retries = 5;    // m1.retries is 5 too

int a = 10;
int b = a;         // primitives copy
b = 20;            // a is still 10`,
      go: `m1 := Message{Retries: 0}
m2 := m1           // a full copy of the struct
m2.Retries = 5     // m1.Retries is still 0

m3 := &Message{Retries: 0}
m4 := m3           // copies the pointer: same Message
m4.Retries = 5     // m3.Retries is now 5`,
    },
    {
      type: 'why',
      text: 'Go puts sharing in the type. When you see `Message` you know you have your own copy; when you see `*Message` you know someone else may be looking at, or changing, the same data. In Java you have to remember which types are primitives and which are objects to know whether assignment copies.',
    },
    { type: 'heading', text: 'Automatic dereferencing' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'no -> operator: . works through pointers',
      code: `msg := &Message{Topic: "orders"} // msg is *Message

(*msg).Topic = "updated" // explicit dereference: legal but never written
msg.Topic = "updated"    // Go inserts (*msg) for you
msg.Retries++

// Method calls adapt in both directions:
msg.IncrementRetry() // pointer receiver on a pointer: fine
v := Message{}
v.IncrementRetry()   // pointer receiver on an addressable value:
                     // Go calls (&v).IncrementRetry()`,
    },
    { type: 'heading', text: 'When to use a pointer' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'four reasons you will see *T',
      code: `// 1. MUTATION: the method must change the caller's struct
func (m *Message) IncrementRetry() { m.Retries++ }

// 2. LARGE VALUES: avoid copying big structs on every call.
//    Note: slices, maps, strings and channels are small headers.
//    Copying a struct with a 1 MB []byte copies 24 bytes, not 1 MB.
type Frame struct {
    Pixels [1920 * 1080]uint32 // an array IS the data: ~8 MB
}
func Render(f *Frame) { ... }   // pass the address, not 8 MB

// 3. SHARED IDENTITY: one pool, cache or server used by everyone
func NewServer(store MessageStore) *Server {
    return &Server{store: store}
}

// 4. OPTIONAL VALUES: nil means "not set"
type Config struct {
    MaxRetries *int           // nil: use the default
    Timeout    *time.Duration // nil: no timeout
}
cfg := Config{MaxRetries: new(5)} // Go 1.26+: new(expr)`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'Before Go 1.26 the built-in `new(T)` only took a type and returned a pointer to a zero value, so optional fields needed a helper like `func ptr[T any](v T) *T { return &v }`. Since Go 1.26, `new(5)` or `new(time.Second)` creates the variable with that initial value.',
    },
    {
      type: 'callout',
      title: 'Stack or heap? The compiler decides',
      tone: 'engine',
      text: 'Writing `&Message{}` does not mean "allocate on the heap", and returning a value does not mean "stays on the stack". The compiler runs **escape analysis**: if a value might outlive the function (it is returned by pointer, stored in a global, captured by a goroutine), it is moved to the heap; otherwise it stays on the stack. You can see the decisions with `go build -gcflags=-m`. Choose values or pointers for their semantics first, and let profiling tell you when allocation matters.',
    },
    { type: 'heading', text: 'Nil pointers' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'nil pointer dereference: the Go NullPointerException',
      code: `var msg *Message // declared but never assigned: nil

// msg.Topic
// panic: runtime error: invalid memory address or nil pointer dereference

// Check pointers you did not create yourself
func (s *Server) Dispatch(msg *Message) error {
    if msg == nil {
        return errors.New("dispatch: nil message")
    }
    return s.store.Save(*msg)
}

// Methods can be called on a nil pointer receiver; this is legal
// and occasionally useful, e.g. a nil *Tree representing "empty".
func (t *Tree) Len() int {
    if t == nil {
        return 0
    }
    return 1 + t.Left.Len() + t.Right.Len()
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Never copy a value that contains a `sync.Mutex`, `sync.WaitGroup` or other `sync` type after first use; the copy has its own, disconnected lock state. Types that embed them should be passed and stored as pointers. `go vet` reports these copies (its `copylocks` check).',
    },
  ],
};

export default section;
