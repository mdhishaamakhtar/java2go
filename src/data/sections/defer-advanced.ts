import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'defer-advanced',
  label: 'Defer — Advanced',
  summary:
    'defer in concurrent code: unlocking, closing channels, containing panics in background goroutines, and annotating errors on the way out.',
  blocks: [
    {
      type: 'prose',
      text: 'With mutexes, channels and goroutines covered, here are the `defer` patterns that keep concurrent code correct. Each one is short; each one prevents a class of production incident.',
    },
    { type: 'heading', text: 'Lock, then defer Unlock' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'two consecutive lines, every time',
      code: `func (c *Cache) Set(key string, v Value) {
    c.mu.Lock()
    defer c.mu.Unlock()
    // Any return below, or a panic, still unlocks.
    // Forget it once and every other goroutine calling
    // Lock() waits forever: a silent, total deadlock.
    c.items[key] = v
}

// Keep critical sections short. If you must do slow work
// (I/O, network calls), copy what you need under the lock,
// unlock, then do the slow part:
func (c *Cache) Snapshot() map[string]Value {
    c.mu.Lock()
    snap := maps.Clone(c.items)
    c.mu.Unlock()
    return snap // callers can iterate without holding the lock
}`,
    },
    { type: 'heading', text: 'defer close(ch): tell consumers you are done' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the producer closes on every exit path',
      code: `func stream(ctx context.Context, rows *sql.Rows) <-chan Message {
    out := make(chan Message)
    go func() {
        defer close(out)    // runs on success, error, or cancellation
        defer rows.Close()  // runs first (LIFO)
        for rows.Next() {
            var m Message
            if err := rows.Scan(&m.ID, &m.Topic); err != nil {
                return // consumers still see the channel close
            }
            select {
            case out <- m:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}`,
    },
    { type: 'heading', text: 'Containing panics in background goroutines' },
    {
      type: 'prose',
      text: 'A panic that escapes any goroutine terminates the process. `net/http` recovers panics in handlers, but nothing recovers panics in goroutines you start yourself. For long-lived workers, recover at the top of the goroutine, log with a stack trace, and report the failure.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'a panic-safe goroutine launcher',
      code: `// Go runs fn in a goroutine. A panic becomes an error on errc
// instead of crashing the process.
func Go(ctx context.Context, name string, fn func(context.Context) error) <-chan error {
    errc := make(chan error, 1) // buffered: never blocks the sender
    go func() {
        defer func() {
            if r := recover(); r != nil {
                slog.ErrorContext(ctx, "goroutine panicked",
                    "name", name, "panic", r, "stack", string(debug.Stack()))
                errc <- fmt.Errorf("%s: panic: %v", name, r)
            }
            close(errc)
        }()
        errc <- fn(ctx)
    }()
    return errc
}`,
    },
    {
      type: 'list',
      items: [
        '`recover()` only stops a panic when called **directly** by a deferred function. Calling it from a helper that the deferred function calls does nothing.',
        '`recover()` returns `nil` when there is no panic, so the check is always `if r := recover(); r != nil`.',
        'A recovered panic means something is already broken. Log it loudly, count it in metrics, and consider exiting cleanly rather than continuing in an unknown state.',
        '`sync.WaitGroup.Go` requires that its function does not panic. For worker goroutines that might, use a wrapper like the one above.',
      ],
    },
    { type: 'heading', text: 'Annotating every error on the way out' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'one deferred wrap instead of one per return',
      code: `func (s *Service) Transfer(ctx context.Context, from, to string, amt Money) (err error) {
    defer func() {
        if err != nil {
            err = fmt.Errorf("transfer %s→%s: %w", from, to, err)
        }
    }()

    if err := s.accounts.Debit(ctx, from, amt); err != nil {
        return err // wrapped by the deferred func
    }
    if err := s.accounts.Credit(ctx, to, amt); err != nil {
        return err // wrapped too
    }
    return nil
}`,
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'Since Go 1.14 most `defer` statements are "open-coded" by the compiler and cost about as much as a direct call. There is no performance reason to avoid `defer` for unlocking or closing, even in hot paths.',
    },
  ],
};

export default section;
