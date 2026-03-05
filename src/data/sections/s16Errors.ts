import type { Section } from '@/types/section';

const section: Section = {
  id: 'errors',
  title: '16',
  label: 'Error Handling',
  blocks: [
    {
      type: 'prose',
      text: 'Errors are values that implement the `error` interface: one method, `Error() string`. No exceptions. No stack unwinding. Every error is explicit.',
    },
    { type: 'heading', text: 'Java exceptions vs Go errors' },
    {
      type: 'callout',
      title: 'The philosophical difference',
      color: '#c9b85a',
      text: '**Java:** errors are exceptional events that interrupt the normal flow. They unwind the stack and propagate automatically until caught. Callers do not need to think about errors unless they declare `throws` or catch them.\n\n**Go:** errors are normal return values — just another thing the function returns. They do not propagate automatically. Every caller explicitly receives and handles (or passes up) the error. The code is more verbose, but every failure path is visible by reading top to bottom.',
    },
    { type: 'heading', text: 'Custom error types' },
    {
      type: 'compare',
      javaLabel: 'Java — checked exception class',
      goLabel: 'Go — error interface implementation',
      java: `// Custom exception
class MessageNotFoundException extends RuntimeException {
    private final long messageId;
    public MessageNotFoundException(long id) {
        super("Message " + id + " not found");
        this.messageId = id;
    }
    public long getMessageId() { return messageId; }
}

throw new MessageNotFoundException(42L);`,
      go: `// Custom error type — just implement error interface
type NotFoundError struct {
    Resource string  // 'message', 'user', etc.
    ID       int64
}

// Error() string satisfies the error interface
func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s with id %d not found", e.Resource, e.ID)
}

// Return it like any other value
return nil, &NotFoundError{Resource: "message", ID: 42}`,
    },
    { type: 'heading', text: 'Wrapping errors — building a trace' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'fmt.Errorf %w — wrap, preserve, inspect',
      code: `// %w wraps the original error — the chain is inspectable

func GetMessage(id int64) (Message, error) {
    msg, err := store.GetByID(id)
    if err != nil {
        // Add context at each layer: what were we doing, what ID
        return Message{}, fmt.Errorf("GetMessage id=%d: %w", id, err)
    }
    return msg, nil
}

// Error chain builds up as it propagates:
// 'handler.GetUser id=42: store.GetByID: sql: no rows in result set'

// Inspect the chain — finds through any number of wraps:
var notFound *NotFoundError
if errors.As(err, &notFound) {  // unwraps chain looking for *NotFoundError
    c.JSON(404, gin.H{"error": err.Error()})
    return
}

// Check for a specific sentinel error:
if errors.Is(err, sql.ErrNoRows) {  // checks every layer of the chain
    return Message{}, &NotFoundError{Resource: "message", ID: id}
}`,
    },
  ],
};

export default section;
