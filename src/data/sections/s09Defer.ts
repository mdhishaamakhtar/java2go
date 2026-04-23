import type { Section } from '@/types/section';

const section: Section = {
  id: 'defer',
  title: '10',
  label: 'Defer',
  blocks: [
    {
      type: 'prose',
      text: '`defer` schedules a function call to run when the surrounding function returns — whether it returns normally, returns early via any path, or panics. It replaces try/finally.',
    },
    { type: 'heading', text: 'defer vs try-finally' },
    {
      type: 'compare',
      javaLabel: 'Java — try-finally for cleanup',
      goLabel: 'Go — defer for cleanup',
      java: `ResultSet rs = null;
try {
    rs = db.query("SELECT ...");
    // ... process ...
    return result;
} finally {
    // runs even if exception thrown
    if (rs != null) rs.close();
}`,
      go: `rows, err := db.Query("SELECT ...")
if err != nil {
    return nil, err
}
// Register cleanup RIGHT AFTER acquiring the resource
// Much harder to forget than a finally block
defer rows.Close()  // runs when queryMessage() returns

// ... process rows ...
return result, nil  // rows.Close() runs here
// Any early return above also triggers rows.Close()`,
    },
    {
      type: 'why',
      text: 'defer collocates the cleanup with the acquisition. In Java, the cleanup lives in finally which may be 50 lines away. With defer, `rows.Close()` is on the line after `rows, err := db.Query()` — impossible to forget, impossible to miss in a code review.',
    },
    { type: 'heading', text: 'LIFO — multiple defers stack' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'defers run in reverse order of registration',
      code: `func openResources() {
    db := openDatabase()      // step 1: open database
    defer db.Close()          // registered 1st — runs LAST

    conn := db.NewConn()      // step 2: open connection (depends on db)
    defer conn.Close()        // registered 2nd — runs 2nd

    tx, _ := conn.Begin()     // step 3: begin transaction (depends on conn)
    defer tx.Rollback()       // registered 3rd — runs FIRST
    // If tx.Commit() succeeds, Rollback() is a safe no-op

    // ... do work ...
    tx.Commit()
}
// Cleanup order: tx.Rollback(), conn.Close(), db.Close()
// = exact mirror of open order — each resource closed before its dependency`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'LIFO mirrors the open order. Resources opened last (most dependent on others) are closed first. This is the correct order for safe cleanup.',
    },
    { type: 'heading', text: 'Argument capture — evaluated at defer time' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'defer arguments are snapshotted when defer is registered',
      code: `i := 0
defer fmt.Println(i)  // i evaluated NOW = 0
i = 100
// Function returns — deferred Println prints 0, not 100
// The argument was captured at the defer line

// To capture the FINAL value, use a closure (no arguments):
j := 0
defer func() {
    fmt.Println(j)  // j read at exit time — prints 100
}()
j = 100`,
    },
    { type: 'heading', text: 'Tracing pattern — enter/exit timing' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'single-line function tracing with defer',
      code: `func trace(name string) func() {
    start := time.Now()
    fmt.Printf(">>> enter %s\\n", name)
    // Returns a cleanup function
    return func() {
        fmt.Printf("<<< exit  %s  (%v)\\n", name, time.Since(start))
    }
}

func (e *Engine) RouteMessage(msg Message) error {
    defer trace("RouteMessage")()  // two calls: trace() then defer on result
    //          ^^^^^^^^^^^^^^^^  trace() runs NOW — prints '>>> enter'
    //                          ^^ returned func is deferred — prints '<<< exit'

    return e.store.Save(msg)
}`,
    },
    { type: 'heading', text: 'Panic and recover' },
    {
      type: 'compare',
      javaLabel: 'Java — RuntimeException unwinds stack',
      goLabel: 'Go — panic unwinds, recover catches',
      java: `// Unchecked exception unwinds the stack
void riskyOp() {
    throw new RuntimeException("something broke");
}

try {
    riskyOp();
} catch (RuntimeException e) {
    // caught here
}`,
      go: `// panic unwinds the stack, running deferred functions
func riskyOp() {
    panic("something broke")
}

// recover() inside a deferred function catches a panic
func safeOp() (err error) {
    defer func() {
        if r := recover(); r != nil {
            // convert panic to error — goroutine survives
            err = fmt.Errorf("recovered panic: %v", r)
        }
    }()
    riskyOp()  // panics — recover catches it above
    return nil
}`,
    },
    {
      type: 'why',
      text: 'Panic is not for normal error handling — it is for truly unrecoverable situations (nil pointer, out of bounds, programmer error). Use it at startup for missing required config. In production handlers, recover prevents one bad request from crashing the server.',
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'The full defer + mutex and defer + channel patterns are in section 13 — Defer Advanced — after those primitives are introduced.',
    },
  ],
};

export default section;
