import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'interfaces',
  label: 'Interfaces',
  summary:
    'Interfaces are satisfied implicitly, defined by the consumer, and kept small. Accept interfaces, return structs.',
  blocks: [
    {
      type: 'prose',
      text: 'An interface is a set of method signatures. Any type with those methods satisfies the interface automatically; there is no `implements` clause. The compiler still checks everything statically, at the point where a value is assigned to an interface type. This is structural typing, checked at compile time.',
    },
    { type: 'heading', text: 'Implicit vs explicit implementation' },
    {
      type: 'compare',
      javaLabel: 'Java — explicit implements',
      goLabel: 'Go — implicit satisfaction',
      java: `public interface MessageStore {
    Message getById(long id);
    void save(Message m);
}

// The class must name the interface
public class PostgresStore implements MessageStore {
    @Override
    public Message getById(long id) { ... }

    @Override
    public void save(Message m) { ... }
}`,
      go: `type MessageStore interface {
    GetByID(ctx context.Context, id int64) (Message, error)
    Save(ctx context.Context, m Message) error
}

// No 'implements': having the methods is enough
type PostgresStore struct{ db *sql.DB }

func (s *PostgresStore) GetByID(ctx context.Context, id int64) (Message, error) {
    // ... query ...
}

func (s *PostgresStore) Save(ctx context.Context, m Message) error {
    // ... insert ...
}

// Optional compile-time assertion (see Blank Identifier)
var _ MessageStore = (*PostgresStore)(nil)`,
    },
    {
      type: 'why',
      text: 'Implicit satisfaction means a type can satisfy an interface its author never heard of. You can define an interface for a type in a library you do not control and it just works. In Java, the implementer must know about every interface it satisfies when it is written, which is why Java codebases grow adapter classes.',
    },
    { type: 'heading', text: 'Define interfaces where they are used' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the consumer owns the interface',
      code: `// package handler: the CONSUMER declares only what it calls
package handler

import (
    "context"

    "github.com/mycompany/app/internal/store"
)

type messageReader interface {
    GetByID(ctx context.Context, id int64) (store.Message, error)
}

type Handler struct {
    messages messageReader // depends on behaviour, not on PostgresStore
}

func New(messages messageReader) *Handler {
    return &Handler{messages: messages}
}

// *store.PostgresStore satisfies messageReader automatically.
// The store package never imports handler or knows it exists,
// and a test can pass a two-line fake.`,
    },
    {
      type: 'callout',
      title: 'Accept interfaces, return structs',
      tone: 'go',
      text: 'This Go proverb flips the Java habit of pairing every class with an interface. A constructor returns its concrete type (`*PostgresStore`), and consumers accept a small interface describing what they need. Do not create `UserService` + `UserServiceImpl` pairs up front; introduce an interface when a second implementation or a test fake actually needs one.',
    },
    { type: 'heading', text: 'Pointer receivers and method sets' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the compile error every newcomer meets',
      code: `type Counter struct{ n int }

func (c *Counter) Inc() { c.n++ } // pointer receiver

type Incrementer interface{ Inc() }

var a Incrementer = &Counter{} // ok: *Counter has Inc
var b Incrementer = Counter{}  // compile error:
// Counter does not implement Incrementer
// (method Inc has pointer receiver)

// Why: storing a Counter value in an interface stores a copy.
// Calling Inc on that copy would silently lose the update,
// so Go refuses to let the value satisfy the interface.`,
    },
    { type: 'heading', text: 'Composing small interfaces' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'small interfaces, embedded into larger ones',
      code: `type Reader interface {
    GetByID(ctx context.Context, id int64) (Message, error)
}

type Writer interface {
    Save(ctx context.Context, m Message) error
    Delete(ctx context.Context, id int64) error
}

// Interface embedding: the method set is the union
type ReadWriter interface {
    Reader
    Writer
}

// A function that only reads accepts Reader, not ReadWriter,
// so its test fake needs exactly one method.
func ShowMessage(r Reader) http.HandlerFunc { ... }

// The standard library is built from tiny interfaces:
//   io.Reader     Read(p []byte) (n int, err error)
//   io.Writer     Write(p []byte) (n int, err error)
//   io.Closer     Close() error
//   fmt.Stringer  String() string
//   error         Error() string`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Keep interfaces small: one to three methods is typical. "The bigger the interface, the weaker the abstraction." A function that takes an `io.Reader` works with files, network connections, HTTP bodies, gzip streams and in-memory buffers, because they all have one method in common.',
    },
    { type: 'heading', text: 'Asking a value what else it can do' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'type assertions on interfaces: optional capabilities',
      code: `// Like "instanceof" + cast, but for behaviour, not classes.
func describe(w io.Writer) {
    if f, ok := w.(interface{ Flush() error }); ok {
        f.Flush() // this writer also supports flushing
    }
    if s, ok := w.(fmt.Stringer); ok {
        fmt.Println("writer:", s.String())
    }
}

// net/http uses this pattern: a ResponseWriter may also be
// an http.Flusher or http.Hijacker, checked at runtime.`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'There are no default methods on Go interfaces and no abstract classes. Shared behaviour goes into a plain function that takes the interface (`io.Copy(dst Writer, src Reader)`) rather than into the interface itself.',
    },
  ],
};

export default section;
