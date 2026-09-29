import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'channels',
  label: 'Channels',
  summary:
    'Typed pipes between goroutines: unbuffered handoffs, buffered queues, closing, select, timeouts and the rules for nil and closed channels.',
  blocks: [
    {
      type: 'prose',
      text: 'A channel is a typed conduit between goroutines. Sending and receiving synchronise the two sides, so a channel carries both data and coordination. The Go proverb: "Do not communicate by sharing memory; instead, share memory by communicating."',
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'The closest Java type is `BlockingQueue`. A buffered channel behaves much like an `ArrayBlockingQueue`; an unbuffered channel is like a `SynchronousQueue`. What Java lacks is `select` (waiting on several queues at once) and `close` (a built-in "no more items" signal).',
    },
    { type: 'heading', text: 'Creating and using channels' },
    {
      type: 'compare',
      javaLabel: 'Java — BlockingQueue',
      goLabel: 'Go — channel',
      java: `BlockingQueue<Message> queue = new ArrayBlockingQueue<>(10);

executor.submit(() -> {
    queue.put(new Message("orders.created")); // blocks if full
    return null;
});

Message msg = queue.take(); // blocks if empty`,
      go: `ch := make(chan Message, 10) // buffered, capacity 10

go func() {
    ch <- Message{Topic: "orders.created"} // send: blocks if full
}()

msg := <-ch // receive: blocks if empty
fmt.Println(msg.Topic)`,
    },
    { type: 'heading', text: 'Unbuffered vs buffered' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'unbuffered = rendezvous, buffered = bounded queue',
      code: `// UNBUFFERED: capacity 0
done := make(chan struct{})
// A send blocks until a receiver takes the value, and vice versa.
// Both goroutines meet at the handoff: a synchronisation point.

// BUFFERED: capacity 100
jobs := make(chan Job, 100)
jobs <- Job{ID: 1} // returns immediately while there is room
// The 101st send blocks until a receiver makes space.
// That blocking is backpressure: fast producers slow down.

len(jobs) // items currently buffered
cap(jobs) // capacity: 100`,
    },
    {
      type: 'callout',
      title: 'Which one?',
      tone: 'go',
      text: '**Unbuffered** when the sender needs to know the value was received before it continues: signals, handoffs, request/response between goroutines.\n\n**Buffered** to decouple a producer and consumer running at different speeds, sized for the bursts you expect. A buffer does not make a slow consumer faster; it only delays backpressure. If you are tempted to make a buffer huge "just in case", you probably have an unbounded queue problem.',
    },
    { type: 'heading', text: 'Closing a channel: no more values' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'close() signals completion; range stops at close',
      code: `results := make(chan Result)

go func() {
    defer close(results) // the SENDER closes, when it is done
    for _, job := range jobs {
        results <- run(job)
    }
}()

// range receives until the channel is closed and drained
for r := range results {
    fmt.Println(r)
}

// The comma-ok form tells you whether the channel is closed
r, ok := <-results
if !ok {
    // closed and empty: r is the zero value
}`,
    },
    {
      type: 'table',
      head: ['Operation', 'On a nil channel', 'On a closed channel'],
      rows: [
        ['Send `ch <- v`', 'Blocks forever', '**Panics**'],
        [
          'Receive `<-ch`',
          'Blocks forever',
          'Returns remaining values, then the zero value with `ok == false`',
        ],
        ['`close(ch)`', '**Panics**', '**Panics** (closing twice)'],
        ['`range ch`', 'Blocks forever', 'Ends after draining buffered values'],
      ],
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Only the sender closes a channel, and only when no other goroutine might still send. With several senders, coordinate with a `sync.WaitGroup` and close once after `Wait()`. You never need to close a channel just to free it: an unreachable channel is garbage collected like anything else.',
    },
    { type: 'heading', text: 'select: wait on several channels at once' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'select is a switch whose cases are channel operations',
      code: `for {
    select {
    case msg := <-urgent:
        handleUrgent(msg)
    case msg := <-normal:
        handle(msg)
    case <-ctx.Done():
        return ctx.Err() // cancelled: stop the loop
    }
}

// If no case is ready, select blocks until one is.
// If several are ready, one is chosen at random (no priority!).`,
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'timeouts and non-blocking operations',
      code: `// Timeout: time.After returns a channel that fires once
select {
case res := <-results:
    use(res)
case <-time.After(2 * time.Second):
    return errors.New("timed out waiting for result")
}

// Non-blocking send: default runs when no case is ready
select {
case events <- ev:
    // queued
default:
    droppedEvents.Add(1) // buffer full: drop instead of blocking
}`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'In request-handling code prefer `context.WithTimeout` over `time.After`: the context also cancels the work you are waiting for, not just your wait. `time.After` is fine for simple, one-off waits.',
    },
    { type: 'heading', text: 'Directional channel types' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'send-only and receive-only narrow the contract',
      code: `// chan T    bidirectional
// chan<- T  send-only
// <-chan T  receive-only

// A producer returns a receive-only channel: callers can
// read from it but cannot send to it or close it.
func generate(ctx context.Context, n int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for i := range n {
            select {
            case out <- i:
            case <-ctx.Done():
                return // consumer gave up: exit, don't leak
            }
        }
    }()
    return out
}

func sum(in <-chan int) (total int) {
    for v := range in {
        total += v
    }
    return total
}`,
    },
    {
      type: 'why',
      text: 'Channel direction is checked at compile time, so the type signature tells you who produces and who consumes. Notice the `select` on `ctx.Done()` around the send: a goroutine blocked forever on a send that nobody will receive is a goroutine leak, and it is the most common concurrency bug in Go services.',
    },
    {
      type: 'note',
      noteType: 'engine',
      text: 'Channels are not always the answer. For protecting a map or a counter, a mutex is simpler and faster. Use channels to transfer ownership of data or to signal events; use `sync` types to guard state. The [next section](/sections/sync) covers those.',
    },
  ],
};

export default section;
