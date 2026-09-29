import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'errors',
  label: 'Error Handling',
  summary:
    'Errors are values: sentinel errors, custom types, wrapping with %w, errors.Is and errors.As, joining, and when a panic is acceptable.',
  blocks: [
    {
      type: 'prose',
      text: 'An error in Go is any value that implements the built-in `error` interface, which has one method: `Error() string`. Functions return errors as their last result; callers check them. There are no exceptions, no `throws` clauses and no stack unwinding for ordinary failures.',
    },
    {
      type: 'callout',
      title: 'The philosophical difference',
      tone: 'java',
      text: '**Java:** failures interrupt normal flow. An exception unwinds the stack until something catches it, and a caller can be unaware that a call might fail at all (unchecked exceptions) or be forced to handle failures it cannot do anything about (checked ones).\n\n**Go:** failures are ordinary return values. They do not propagate unless you return them. Each caller decides: handle it here, add context and return it, or deliberately ignore it where everyone can see. The code is longer, and every failure path is visible when you read top to bottom.',
    },
    { type: 'heading', text: 'Three kinds of error values' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'ad-hoc, sentinel and typed errors',
      code: `// 1. Ad-hoc: a one-off message, nobody needs to match on it
return errors.New("config: empty database URL")
return fmt.Errorf("config: port %d out of range", port)

// 2. Sentinel: a package-level value callers compare against.
//    Named Err..., like io.EOF and sql.ErrNoRows.
var ErrNotFound = errors.New("not found")

// 3. Typed: a struct carrying data, named ...Error
type ValidationError struct {
    Field string
    Issue string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Issue)
}`,
    },
    {
      type: 'compare',
      javaLabel: 'Java — custom exception class',
      goLabel: 'Go — custom error type',
      java: `class MessageNotFoundException extends RuntimeException {
    private final long messageId;

    MessageNotFoundException(long id) {
        super("message " + id + " not found");
        this.messageId = id;
    }

    long getMessageId() { return messageId; }
}

throw new MessageNotFoundException(42L);`,
      go: `type NotFoundError struct {
    Resource string
    ID       int64
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s %d not found", e.Resource, e.ID)
}

return Message{}, &NotFoundError{Resource: "message", ID: 42}`,
    },
    { type: 'heading', text: 'Wrapping: adding context as errors travel up' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'fmt.Errorf with %w builds a readable chain',
      code: `func (s *Store) GetByID(ctx context.Context, id int64) (Message, error) {
    var m Message
    err := s.db.QueryRowContext(ctx, query, id).Scan(&m.ID, &m.Topic)
    if errors.Is(err, sql.ErrNoRows) {
        return Message{}, &NotFoundError{Resource: "message", ID: id}
    }
    if err != nil {
        return Message{}, fmt.Errorf("query message %d: %w", id, err)
    }
    return m, nil
}

func (svc *Service) Publish(ctx context.Context, id int64) error {
    m, err := svc.store.GetByID(ctx, id)
    if err != nil {
        return fmt.Errorf("publish: %w", err) // add context, keep the cause
    }
    ...
}

// err.Error() reads like a stack trace written by humans:
// "publish: query message 42: dial tcp 10.0.0.5:5432: connection refused"`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Conventions: error strings are lowercase with no trailing punctuation, because they get embedded in other messages. Each layer adds what **it** was doing ("publish", "query message 42"), not "error:" or "failed to". Use `%w` to keep the cause inspectable and `%v` when you intentionally want to hide it from callers.',
    },
    { type: 'heading', text: 'Inspecting errors: errors.Is and errors.As' },
    {
      type: 'compare',
      javaLabel: 'Java — catch by type',
      goLabel: 'Go — match anywhere in the chain',
      java: `try {
    service.publish(42L);
} catch (MessageNotFoundException e) {
    return ResponseEntity.status(404).build();
} catch (ValidationException e) {
    return ResponseEntity.badRequest().body(e.getMessage());
}`,
      go: `err := svc.Publish(ctx, 42)

// Is: compare against a sentinel value, through every %w layer
if errors.Is(err, context.DeadlineExceeded) { ... }

// AsType (Go 1.26+): find an error of a given type
if nf, ok := errors.AsType[*NotFoundError](err); ok {
    http.Error(w, nf.Error(), http.StatusNotFound)
    return
}

// Before Go 1.26: errors.As with a target pointer
var verr *ValidationError
if errors.As(err, &verr) {
    http.Error(w, verr.Error(), http.StatusBadRequest)
    return
}`,
    },
    {
      type: 'why',
      text: 'Never compare error strings, and never use `==` on wrapped errors: once a layer adds context with `%w`, only `errors.Is` and `errors.As` can see the original. They walk the whole chain, like Java’s `getCause()` loop, but built in.',
    },
    { type: 'heading', text: 'Multiple errors at once' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'errors.Join (Go 1.20+): like addSuppressed, but inspectable',
      code: `func (c Config) Validate() error {
    var errs []error
    if c.DatabaseURL == "" {
        errs = append(errs, &ValidationError{Field: "database_url", Issue: "required"})
    }
    if c.Port <= 0 || c.Port > 65535 {
        errs = append(errs, &ValidationError{Field: "port", Issue: "must be 1-65535"})
    }
    return errors.Join(errs...) // nil when errs is empty
}

// errors.Is and errors.As search every joined error.
// fmt.Errorf also accepts several %w verbs in one call.`,
    },
    { type: 'heading', text: 'Handle an error once' },
    {
      type: 'compare',
      javaLabel: 'Java — log and rethrow',
      goLabel: 'Go — either handle it or return it',
      java: `} catch (SQLException e) {
    log.error("query failed", e); // logged here...
    throw new ServiceException(e); // ...and again upstream
}`,
      go: `// Anti-pattern: log AND return. The same failure
// appears in the logs once per layer.
if err != nil {
    slog.Error("query failed", "err", err)
    return err
}

// Idiomatic: wrap and return; log once at the top
// (the HTTP handler or main), where you decide what to do.
if err != nil {
    return fmt.Errorf("load orders: %w", err)
}`,
    },
    { type: 'heading', text: 'Errors vs panics' },
    {
      type: 'table',
      head: ['Return an error when…', 'Panic when…'],
      rows: [
        ['The failure can happen in a correct program', 'Only a bug could cause it'],
        ['Input is invalid or a resource is missing', 'An internal invariant is broken'],
        ['A network, disk or database call fails', 'Startup configuration makes running pointless'],
        [
          'The caller might reasonably retry or recover',
          'A `Must…` helper is used on constant input, like `regexp.MustCompile`',
        ],
      ],
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'Go errors do not carry stack traces by default. In practice the wrapped context ("publish: query message 42: …") locates failures well. If you want stack traces, add them once at the boundary where errors are created, or use structured logging with source locations (see [Logging & Observability](/sections/logging)).',
    },
  ],
};

export default section;
