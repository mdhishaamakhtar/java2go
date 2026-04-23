import type { Section } from '@/types/section';

const section: Section = {
  id: 'defer-advanced',
  title: '16',
  label: 'Defer — Advanced',
  blocks: [
    {
      type: 'prose',
      text: 'Now that mutexes, WaitGroups, and channels are introduced: the defer patterns that make all of them safe in concurrent code.',
    },
    { type: 'heading', text: 'defer + Mutex — the most important engine pattern' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'always defer Unlock immediately after Lock',
      code: `func (e *Engine) RegisterWorker(id string, w *Worker) {
    e.mu.Lock()           // acquire — no other goroutine can enter
    defer e.mu.Unlock()   // NEXT LINE — guarantee release
    // If we forgot defer and this function panicked or returned early,
    // the mutex would stay locked. Every other goroutine calling Lock()
    // would block forever. The program deadlocks silently.
    e.workers[id] = w
}

// Pattern is always:
// lock(); defer unlock()   — two consecutive lines, every time`,
    },
    { type: 'heading', text: 'defer + wg.Done() — every goroutine in a WaitGroup' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'defer wg.Done() — first line of every tracked goroutine',
      code: `var wg sync.WaitGroup

for _, msg := range batch {
    wg.Add(1)
    go func(m Message) {
        defer wg.Done()   // FIRST LINE of goroutine body
        // If process(m) panics:
        //   WITHOUT defer: wg counter stays at +1, Wait() blocks forever
        //   WITH defer:    Done() still runs, counter reaches 0, Wait() returns
        process(m)
    }(msg)
}
wg.Wait()`,
    },
    { type: 'heading', text: 'defer + close(ch) — notify downstream when done' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'defer close — signal that no more values are coming',
      code: `func produce(msgs []Message) <-chan Message {
    out := make(chan Message, len(msgs))
    go func() {
        defer close(out)   // close when this goroutine exits — always
        // Downstream range loops exit cleanly when out is closed
        // Without this, consumers wait forever after last message
        for _, m := range msgs {
            out <- m
        }
    }()
    return out
}

for msg := range produce(messages) {  // exits when out is closed
    process(msg)
}`,
    },
    { type: 'heading', text: 'defer + recover — prevent one bad message from crashing the engine' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'wrap goroutine in recover to contain panics',
      code: `// A panic in a goroutine kills the ENTIRE program unless recovered.
// One corrupted message must not take down the whole engine.

func (w *Worker) processSafe(msg Message) (err error) {
    // Deferred function runs even during panic unwind
    defer func() {
        if r := recover(); r != nil {
            // Panic was caught — convert to an error
            err = fmt.Errorf("panic in worker %s: %v", w.ID, r)
            // Log the stack trace for debugging
            buf := make([]byte, 4096)
            n := runtime.Stack(buf, false)  // false = this goroutine only
            log.Printf("stack:\\n%s", buf[:n])
        }
    }()

    return w.process(msg)  // if this panics, recover catches it above
}

// recover() returns nil when there was no panic
// recover() ONLY works inside a deferred function
// recover() called outside defer does nothing`,
    },
  ],
};

export default section;
