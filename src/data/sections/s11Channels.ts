import type { Section } from '@/types/section';

const section: Section = {
  id: 'channels',
  title: '11',
  label: 'Channels',
  blocks: [
    {
      type: 'prose',
      text: 'Channels are typed pipes between goroutines. They carry both the data and the synchronisation. Go\'s design principle: "Do not communicate by sharing memory; share memory by communicating."',
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'Java concurrent code typically shares mutable objects protected by locks. Go channels transfer ownership — the sender gives up the value, the receiver takes it. This makes data flow explicit and eliminates many classes of race conditions.',
    },
    { type: 'heading', text: 'Creating and using channels' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'make, send, receive — the three operations',
      code: `// Create a channel — make(chan Type, bufferSize)
ch := make(chan Message)      // unbuffered — capacity 0
ch2 := make(chan Message, 10) // buffered — capacity 10

// Send: ch <- value
// Receive: value := <-ch

// Simple example: one goroutine sends, this goroutine receives
go func() {
    ch <- Message{Topic: "orders.created"}  // send — blocks until receiver ready
}()

msg := <-ch   // receive — blocks until sender sends
fmt.Println(msg.Topic)`,
    },
    { type: 'heading', text: 'Unbuffered vs Buffered — the critical difference' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'unbuffered = rendezvous, buffered = queue',
      code: `// ─── UNBUFFERED ──────────────────────────────────────────────
ch := make(chan Message)   // capacity = 0

// Send BLOCKS until a receiver is waiting
// Receive BLOCKS until a sender sends
// Both goroutines must be ready at the SAME TIME
// Think of it as a baton handoff — both runner and receiver must be at the line

// ─── BUFFERED ────────────────────────────────────────────────
ch2 := make(chan Message, 100)  // capacity = 100

// Send DOES NOT block until buffer is FULL
ch2 <- Message{Topic: "a"}  // returns immediately — space in buffer
ch2 <- Message{Topic: "b"}  // returns immediately
// ... 98 more sends without blocking ...
// ch2 <- msg  on the 101st would block until someone reads

// Receive DOES NOT block when buffer has items
msg := <-ch2  // returns immediately — gets "a" (FIFO)

fmt.Println(len(ch2))   // items currently in buffer
fmt.Println(cap(ch2))   // total buffer capacity`,
    },
    {
      type: 'callout',
      title: 'Which to use?',
      color: '#4ec9b0',
      text: '**Unbuffered** — when you need synchronisation: "I need to know the receiver has this value before I continue." Handoff semantics.\n\n**Buffered** — when producer and consumer run at different speeds. Buffer absorbs bursts. Size for your maximum burst, not average throughput. Too small = producer blocks under load. Too large = memory waste and hidden backpressure.',
    },
    { type: 'heading', text: 'Closing channels — signalling completion' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'close() — no more values. range detects close automatically.',
      code: `ch := make(chan Message, 10)

// Producer goroutine: send then close
go func() {
    for _, msg := range batch {
        ch <- msg       // send each message
    }
    close(ch)          // signal: no more messages will ever come
    // Sending to a closed channel PANICS — only sender closes
}()

// Consumer: range over channel stops when channel is closed AND empty
for msg := range ch {
    process(msg)       // runs for each message, exits when closed+drained
}
// Loop exits cleanly — no need to check for a sentinel value

// Two-value receive — check close manually
msg, ok := <-ch
if !ok {
    fmt.Println("channel closed and empty")
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Only the sender should close a channel. Never close from the receiver side. Closing twice panics. Sending to a closed channel panics.',
    },
    { type: 'heading', text: 'Select — wait on multiple channels simultaneously' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'select is to channels what switch is to values',
      code: `highCh   := make(chan Message, 10)   // urgent messages
normalCh := make(chan Message, 100)  // normal messages
doneCh   := make(chan struct{})       // stop signal — struct{} costs 0 bytes

for {
    select {

    case msg := <-highCh:
        // highCh had a message — handle it
        processUrgent(msg)

    case msg := <-normalCh:
        // normalCh had a message — handle it
        process(msg)

    case <-doneCh:
        // doneCh was closed/sent to — time to stop
        return

    // If NONE are ready: select blocks until one becomes ready
    // If MULTIPLE are ready: one is chosen at random (not priority!)
    }
}`,
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'select with default — non-blocking check',
      code: `// default case runs immediately if no channel is ready

// Non-blocking receive — check without waiting:
select {
case msg := <-ch:
    process(msg)     // channel had something
default:
    doOtherWork()    // channel was empty — don't wait
}

// Non-blocking send — drop if buffer full:
select {
case ch <- msg:
    // sent successfully
default:
    // buffer full — apply backpressure or drop
    log.Println("channel full, dropping")
}`,
    },
    { type: 'heading', text: 'Directional channel types' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'send-only and receive-only narrow the contract',
      code: `// chan   T  = bidirectional (read and write)
// chan<- T  = send-only    (can only write: ch <- val)
// <-chan T  = receive-only (can only read:  val := <-ch)

// Producer — returns receive-only so caller cannot accidentally send or close
func startProducer() <-chan Message {
    ch := make(chan Message, 100)  // bidirectional inside
    go func() {
        defer close(ch)            // close when done producing
        for {
            ch <- generateMessage()
        }
    }()
    return ch  // narrowed to receive-only — caller can only read
}

// Consumer — parameter is receive-only — compiler prevents it from sending
func consume(in <-chan Message) {
    for msg := range in {
        process(msg)
    }
}

// Usage
msgs := startProducer()
consume(msgs)`,
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'In engine code: `chan struct{}` fields named `stopCh` or `doneCh` are signal-only channels. No data — just the act of closing them broadcasts to all receivers. `<-chan Message` as a return type marks a producer.',
    },
  ],
};

export default section;
