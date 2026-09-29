import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'defer',
  label: 'Defer',
  summary:
    '`defer` replaces try/finally and try-with-resources: cleanup next to acquisition, LIFO order, and panic/recover for the truly exceptional.',
  blocks: [
    {
      type: 'prose',
      text: '`defer` schedules a function call to run when the surrounding function returns, whether it returns normally, returns early from any branch, or panics. It is Go’s answer to `finally` and to try-with-resources.',
    },
    { type: 'heading', text: 'defer vs try-with-resources' },
    {
      type: 'compare',
      javaLabel: 'Java — try-with-resources',
      goLabel: 'Go — defer',
      java: `List<Message> load(DataSource ds) throws SQLException {
    try (Connection conn = ds.getConnection();
         Statement st = conn.createStatement();
         ResultSet rs = st.executeQuery("SELECT ...")) {
        List<Message> out = new ArrayList<>();
        while (rs.next()) {
            out.add(map(rs));
        }
        return out;
    } // closed in reverse order, even on exceptions
}`,
      go: `func load(ctx context.Context, db *sql.DB) ([]Message, error) {
    rows, err := db.QueryContext(ctx, "SELECT ...")
    if err != nil {
        return nil, err
    }
    defer rows.Close() // registered right after acquiring

    var out []Message
    for rows.Next() {
        var m Message
        if err := rows.Scan(&m.ID, &m.Topic); err != nil {
            return nil, err // rows.Close() still runs
        }
        out = append(out, m)
    }
    return out, rows.Err()
}`,
    },
    {
      type: 'why',
      text: 'defer keeps cleanup next to acquisition. The line after you open something is the line that closes it, so a reviewer can check resource handling without scrolling, and adding an early `return` later cannot introduce a leak. It works for anything, not only types implementing `AutoCloseable`: unlocking a mutex, stopping a timer, restoring a setting.',
    },
    { type: 'heading', text: 'Deferred calls run last-in, first-out' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'cleanup mirrors acquisition order',
      code: `func transfer(ctx context.Context, db *sql.DB) error {
    conn, err := db.Conn(ctx)
    if err != nil {
        return err
    }
    defer conn.Close() // registered 1st, runs LAST

    tx, err := conn.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback() // registered 2nd, runs FIRST
    // After a successful Commit, Rollback is a harmless no-op
    // (it returns sql.ErrTxDone, which we ignore here).

    if err := debit(ctx, tx); err != nil {
        return err // Rollback, then Close
    }
    return tx.Commit()
}`,
    },
    { type: 'heading', text: 'Arguments are evaluated immediately' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'the call is deferred; its arguments are not',
      code: `start := time.Now()
defer log.Printf("took %v", time.Since(start)) // BUG: Since runs NOW, logs ~0s

// Wrap it in a closure to evaluate at exit time
defer func() {
    log.Printf("took %v", time.Since(start)) // runs at return
}()`,
    },
    { type: 'heading', text: 'Changing the return value with defer' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'named results let deferred code inspect and replace errors',
      code: `// Closing a file you WROTE can fail (data may not be flushed).
// Ignoring that error can silently lose data.
func writeReport(path string, data []byte) (err error) {
    f, err := os.Create(path)
    if err != nil {
        return err
    }
    defer func() {
        // Keep the first error, but never drop a Close error
        err = errors.Join(err, f.Close())
    }()

    _, err = f.Write(data)
    return err
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Deferred calls run when the **function** returns, not when a loop iteration or block ends. `defer f.Close()` inside a loop over ten thousand files keeps ten thousand files open until the function exits. Move the loop body into its own function (or a closure) so each iteration’s defer runs at the end of that iteration.',
    },
    { type: 'heading', text: 'panic and recover' },
    {
      type: 'compare',
      javaLabel: 'Java — unchecked exception',
      goLabel: 'Go — panic, recovered in a deferred function',
      java: `void riskyOp() {
    throw new IllegalStateException("broken invariant");
}

try {
    riskyOp();
} catch (RuntimeException e) {
    log.error("recovered", e);
}`,
      go: `func riskyOp() {
    panic("broken invariant")
}

func safeOp() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()
    riskyOp()
    return nil
}`,
    },
    {
      type: 'why',
      text: 'A panic is for bugs and impossible states: a nil dereference, an index out of range, a broken invariant, or missing configuration at startup. It is not for "user not found" or "connection refused"; those are errors, returned as values. `recover` only works inside a deferred function, and only in the goroutine that panicked.',
    },
    {
      type: 'callout',
      title: 'A panic in any goroutine kills the whole process',
      tone: 'warn',
      text: 'In Java an uncaught exception kills one thread. In Go, a panic that unwinds to the top of **any** goroutine without being recovered terminates the entire program. `net/http` recovers panics inside handlers so one bad request cannot crash the server, but if a handler starts its own goroutine and that goroutine panics, nothing recovers it. Long-lived background goroutines should recover, log and report their own panics (see [Defer — Advanced](/sections/defer-advanced#containing-panics-in-background-goroutines)).',
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`os.Exit` and `log.Fatal` end the process immediately **without running deferred calls**. Call them only from `main`, after cleanup, or better, have `main` call a `run() error` function and exit based on its result, as shown in [Init & Main Lifecycle](/sections/lifecycle#a-production-main-go).',
    },
  ],
};

export default section;
