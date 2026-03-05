import type { Section } from '@/types/section';

const section: Section = {
  id: 'interfaces',
  title: '04',
  label: 'Interfaces',
  blocks: [
    {
      type: 'prose',
      text: 'An interface is a set of method signatures. Any type that has all those methods satisfies the interface — no declaration needed. The compiler checks this. This is called structural typing.',
    },
    { type: 'heading', text: 'Implicit vs explicit implementation' },
    {
      type: 'compare',
      javaLabel: 'Java — explicit implements',
      goLabel: 'Go — implicit satisfaction',
      java: `// Interface defined
public interface MessageStore {
    Message getById(long id);
    void save(Message m);
}

// Class MUST declare implements
public class PostgresStore implements MessageStore {
    @Override
    public Message getById(long id) { ... }

    @Override
    public void save(Message m) { ... }
}`,
      go: `// Interface defined
type MessageStore interface {
    GetByID(id int64) (Message, error)
    Save(m Message) error
}

// Implementation — NO 'implements' keyword
// Just... have the methods. That is it.
type pgStore struct{ db *sql.DB }

func (s pgStore) GetByID(id int64) (Message, error) {
    // ... query postgres ...
    return Message{}, nil
}

func (s pgStore) Save(m Message) error {
    // ... insert ...
    return nil
}

// pgStore satisfies MessageStore — compiler verifies
var _ MessageStore = pgStore{}  // compile-time check`,
    },
    {
      type: 'why',
      text: 'Implicit implementation means a type can satisfy an interface it has never heard of. You can define an interface in your package for a type that lives in a library you do not control. This is the opposite of Java, where the implementer must know about every interface it satisfies at the time of writing.',
    },
    { type: 'heading', text: 'Define interfaces where they are USED, not implemented' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'go — interface at call site pattern',
      code: `// handler/handler.go — the CONSUMER defines what it needs
package handler

// This interface lives in the handler package, not the store package
// The handler only declares the methods IT actually calls
type messageReader interface {
    GetByID(id int64) (Message, error)  // only need to read
}

type Handler struct {
    store messageReader  // depends on the interface, not pgStore
}

// Now pgStore satisfies messageReader automatically
// (pgStore.GetByID exists and matches the signature)
// pgStore never needs to change, never needs to know about Handler

// This is the opposite of Java where the interface usually
// lives next to the implementation, not the consumer`,
    },
    { type: 'heading', text: 'Interface composition' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'composing small interfaces into larger ones',
      code: `// Good Go style: define many small focused interfaces
type Reader interface {
    GetByID(id int64) (Message, error)
}

type Writer interface {
    Save(m Message) error
    Delete(id int64) error
}

// Compose them when a function needs both
type ReadWriter interface {
    Reader  // embed Reader interface
    Writer  // embed Writer interface
}

// Function that only reads — accept Reader, not ReadWriter
// This makes testing easy: mock only has to implement one method
func GetHandler(store Reader) http.HandlerFunc { ... }

// Standard library interfaces you will see everywhere:
// io.Reader  -> Read(p []byte) (n int, err error)
// io.Writer  -> Write(p []byte) (n int, err error)
// io.Closer  -> Close() error
// io.ReadWriteCloser composes all three`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Keep interfaces small. 1–3 methods is ideal. A function that accepts a 10-method interface is hard to mock and hard to swap. A function that accepts a 1-method interface can work with anything.',
    },
  ],
};

export default section;
