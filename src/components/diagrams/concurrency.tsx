import { Arrow, Box, Dot, Line, Panel, Panels, T, type Tone } from './kit';

// ─── 14 · Goroutines ───────────────────────────────────────────────────────

function OsThreads({ count, label }: { count: number; label: string }) {
  const width = count === 3 ? 80 : 120;
  const gap = count === 3 ? 14 : 36;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = 16 + i * (width + gap);
        return (
          <g key={i}>
            <Box x={x} y={118} w={width} h={30} fill="chip" tone="muted" />
            <T x={x + width / 2} y={138} anchor="middle" kind="small">
              {label}
            </T>
          </g>
        );
      })}
    </>
  );
}

/** Many lightweight threads, a few of them running on OS threads at any moment. */
export function ManyOnFew({
  tone,
  unit,
  thread = 'OS thread',
}: {
  tone: 'java' | 'go';
  unit: string;
  thread?: string;
}) {
  const columns = [40, 76, 112, 148, 184, 220, 256];
  const tasks = [...columns.map((x) => [x, 34] as const), ...columns.map((x) => [x, 68] as const)];
  const running = new Set([8, 11]);
  return (
    <>
      <T x={14} y={12} kind="small">
        {unit}, mostly parked
      </T>
      {tasks.map(([x, y], i) => (
        <Dot key={i} at={[x, y]} r={7} tone={running.has(i) ? tone : 'muted'} />
      ))}
      <Arrow
        points={[
          [76, 76],
          [76, 116],
        ]}
        tone={tone}
      />
      <Arrow
        points={[
          [184, 76],
          [226, 116],
        ]}
        tone={tone}
      />
      <OsThreads count={2} label={thread} />
    </>
  );
}

/** Java platform threads map 1:1 to OS threads; virtual threads and goroutines are M:N. */
export function SchedulingModels() {
  return (
    <Panels>
      <Panel width={300} height={180} title="Java platform threads: 1:1" tone="java">
        {[0, 1, 2].map((i) => {
          const x = 16 + i * 94;
          return (
            <g key={i}>
              <Box x={x} y={14} w={80} h={30} tone="java" fill="java" />
              <T x={x + 40} y={34} anchor="middle" kind="small">
                thread
              </T>
              <Arrow
                points={[
                  [x + 40, 44],
                  [x + 40, 116],
                ]}
                tone="java"
              />
            </g>
          );
        })}
        <OsThreads count={3} label="OS thread" />
        <T x={14} y={172} kind="note">
          ~1 MB of stack reserved per thread
        </T>
      </Panel>

      <Panel width={300} height={180} title="Java virtual threads: M:N" tone="java">
        <ManyOnFew tone="java" unit="virtual threads" thread="carrier thread" />
        <T x={14} y={172} kind="note">
          the JVM schedules them on carrier threads
        </T>
      </Panel>

      <Panel width={300} height={180} title="Go goroutines: M:N" tone="go">
        <ManyOnFew tone="go" unit="goroutines" />
        <T x={14} y={172} kind="note">
          at most GOMAXPROCS run Go code at once
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 15 · Channels ─────────────────────────────────────────────────────────

function Lane({
  y,
  label,
  from = 84,
  to = 316,
}: {
  y: number;
  label: string;
  from?: number;
  to?: number;
}) {
  return (
    <>
      <T x={14} y={y + 4} kind="small">
        {label}
      </T>
      <Line from={[from, y]} to={[to, y]} tone="ink" />
    </>
  );
}

/** Unbuffered channels are a rendezvous; buffered ones block only when full. */
export function ChannelTiming() {
  return (
    <Panels>
      <Panel width={330} height={190} title="Unbuffered: the two sides meet" tone="go">
        <T x={14} y={48} kind="small">
          sender
        </T>
        <Line from={[84, 44]} to={[120, 44]} tone="ink" />
        <Line from={[120, 44]} to={[210, 44]} tone="warn" dashed />
        <Line from={[210, 44]} to={[316, 44]} tone="ink" />
        <Dot at={[120, 44]} />
        <T x={120} y={30} anchor="middle" kind="small">
          ch &lt;- v
        </T>
        <T x={165} y={66} anchor="middle" kind="small" tone="warn">
          blocked
        </T>
        <Lane y={130} label="receiver" />
        <Dot at={[210, 130]} />
        <T x={210} y={152} anchor="middle" kind="small">
          &lt;-ch
        </T>
        <Arrow
          points={[
            [210, 48],
            [210, 124],
          ]}
          tone="go"
        />
        <T x={218} y={92} kind="small" tone="go">
          handoff
        </T>
        <T x={14} y={182} kind="note">
          a send waits for a receiver, and vice versa
        </T>
      </Panel>

      <Panel width={330} height={190} title="Buffered, cap 3: sends block only when full" tone="go">
        <T x={14} y={44} kind="small">
          producer
        </T>
        <Line from={[84, 40]} to={[182, 40]} tone="ink" />
        <Line from={[182, 40]} to={[252, 40]} tone="warn" dashed />
        <Line from={[252, 40]} to={[316, 40]} tone="ink" />
        <T x={124} y={60} anchor="middle" kind="small">
          jobs &lt;- j
        </T>
        <Dot at={[100, 40]} />
        <Dot at={[124, 40]} />
        <Dot at={[148, 40]} />
        <Dot at={[182, 40]} tone="warn" />
        <T x={217} y={26} anchor="middle" kind="small" tone="warn">
          full: next send waits
        </T>
        <T x={14} y={96} kind="small">
          buffer
        </T>
        <Box x={100} y={76} w={34} h={30} tone="go" fill="go" />
        <Box x={140} y={76} w={34} h={30} tone="go" fill="go" />
        <Box x={180} y={76} w={34} h={30} tone="go" fill="go" />
        <Lane y={140} label="consumer" />
        <Dot at={[252, 140]} />
        <T x={252} y={162} anchor="middle" kind="small">
          &lt;-jobs
        </T>
        <Arrow
          points={[
            [214, 96],
            [248, 134],
          ]}
          curve={[
            [236, 100],
            [248, 116],
          ]}
          tone="go"
        />
        <T x={14} y={182} kind="note">
          sends return at once while there is room
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 16 · Sync Primitives ──────────────────────────────────────────────────

function Hold({
  y,
  from,
  to,
  tone,
  waitFrom,
}: {
  y: number;
  from: number;
  to: number;
  tone: Tone;
  waitFrom?: number;
}) {
  return (
    <>
      {waitFrom !== undefined && waitFrom < from && (
        <Line from={[waitFrom, y]} to={[from, y]} tone="muted" dashed />
      )}
      <Box
        x={from}
        y={y - 7}
        w={to - from}
        h={14}
        r={3}
        tone={tone}
        fill={tone === 'go' ? 'go' : 'chip'}
      />
    </>
  );
}

function LockLanes({ shared }: { shared: boolean }) {
  return (
    <>
      <T x={14} y={44} kind="small">
        reader
      </T>
      <T x={14} y={74} kind="small">
        reader
      </T>
      <T x={14} y={104} kind="small">
        reader
      </T>
      <T x={14} y={144} kind="small">
        writer
      </T>
      {shared ? (
        <>
          <Hold y={40} from={84} to={196} tone="go" />
          <Hold y={70} from={104} to={206} tone="go" />
          <Hold y={100} from={124} to={186} tone="go" />
          <Hold y={140} from={208} to={272} tone="ink" waitFrom={150} />
          <Hold y={100} from={274} to={316} tone="go" waitFrom={196} />
          <T x={234} y={92} anchor="middle" kind="small">
            new reader queues
          </T>
        </>
      ) : (
        <>
          <Hold y={40} from={84} to={134} tone="go" />
          <Hold y={70} from={138} to={188} tone="go" waitFrom={104} />
          <Hold y={100} from={192} to={242} tone="go" waitFrom={124} />
          <Hold y={140} from={246} to={316} tone="ink" waitFrom={150} />
        </>
      )}
    </>
  );
}

/** RWMutex lets readers overlap; a Mutex serialises everyone. */
export function RWMutexLanes() {
  return (
    <Panels>
      <Panel width={330} height={190} title="sync.RWMutex: many readers or one writer" tone="go">
        <LockLanes shared />
        <T x={14} y={182} kind="note">
          reads overlap; once a writer waits, new reads queue
        </T>
      </Panel>
      <Panel width={330} height={190} title="sync.Mutex: one holder at a time" tone="go">
        <LockLanes shared={false} />
        <T x={14} y={182} kind="note">
          every holder runs alone, readers included
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 17 · Goroutine Management ─────────────────────────────────────────────

function Pipe({ y, label }: { y: number; label: string }) {
  return (
    <>
      <Box x={60} y={y} w={210} h={28} r={14} tone="go" fill="go" />
      <T x={165} y={y + 19} anchor="middle">
        {label}
      </T>
    </>
  );
}

function Step({ y, code, note }: { y: number; code: string; note: string }) {
  return (
    <>
      <Box x={14} y={y} w={296} h={30} />
      <T x={26} y={y + 20}>
        {code}
      </T>
      <T x={298} y={y + 20} anchor="end" kind="small">
        {note}
      </T>
    </>
  );
}

/** A fixed pool reading one channel, and the order in which it shuts down. */
export function WorkerPool() {
  const workers = [50, 130, 210, 290];
  return (
    <Panels>
      <Panel width={330} height={226} title="Fan-out: workers share one jobs channel" tone="go">
        <Box x={115} y={8} w={100} h={28} />
        <T x={165} y={27} anchor="middle">
          feeder
        </T>
        <Arrow
          points={[
            [165, 36],
            [165, 56],
          ]}
        />
        <Pipe y={58} label="jobs" />
        {workers.map((cx, i) => (
          <g key={cx}>
            <Arrow
              points={[
                [120 + i * 30, 86],
                [cx, 116],
              ]}
            />
            <Box x={cx - 30} y={118} w={60} h={28} />
            <T x={cx} y={137} anchor="middle" kind="small">
              {i === 3 ? 'worker 8' : `worker ${i + 1}`}
            </T>
            {i === 3 && (
              <T x={cx - 40} y={137} anchor="middle" kind="small">
                …
              </T>
            )}
            <Arrow
              points={[
                [cx, 146],
                [120 + i * 30, 170],
              ]}
            />
          </g>
        ))}
        <Pipe y={172} label="results" />
        <T x={14} y={220} kind="note">
          whichever worker is free takes the next job
        </T>
      </Panel>

      <Panel width={320} height={226} title="Shutting down, in order" tone="go">
        <Step y={8} code="close(jobs)" note="feeder is done" />
        <Arrow
          points={[
            [40, 38],
            [40, 50],
          ]}
        />
        <Step y={50} code="range jobs ends" note="in each worker" />
        <Arrow
          points={[
            [40, 80],
            [40, 92],
          ]}
        />
        <Step y={92} code="wg.Wait() returns" note="all exited" />
        <Arrow
          points={[
            [40, 122],
            [40, 134],
          ]}
        />
        <Step y={134} code="close(results)" note="nothing sends now" />
        <Arrow
          points={[
            [40, 164],
            [40, 176],
          ]}
        />
        <Step y={176} code="range results ends" note="main loop" />
        <T x={14} y={222} kind="note">
          each close tells the next stage to stop
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 18 · Context ──────────────────────────────────────────────────────────

function CtxNode({ x, y, label, done }: { x: number; y: number; label: string; done: boolean }) {
  return (
    <>
      <Box x={x} y={y} w={140} h={30} tone={done ? 'warn' : 'ink'} fill={done ? 'warn' : 'box'} />
      <T x={x + 70} y={y + 20} anchor="middle">
        {label}
      </T>
    </>
  );
}

function ContextTreeDrawing({ timedOut }: { timedOut: boolean }) {
  return (
    <>
      <CtxNode x={90} y={8} label="Background()" done={false} />
      <CtxNode x={90} y={66} label="r.Context()" done={false} />
      <CtxNode x={14} y={128} label="WithTimeout" done={timedOut} />
      <CtxNode x={166} y={128} label="WithCancel" done={false} />
      <CtxNode x={14} y={186} label="WithCancel" done={timedOut} />
      <Arrow
        points={[
          [160, 38],
          [160, 64],
        ]}
      />
      <Arrow
        points={[
          [160, 96],
          [84, 126],
        ]}
      />
      <Arrow
        points={[
          [160, 96],
          [236, 126],
        ]}
      />
      <Arrow
        points={[
          [84, 158],
          [84, 184],
        ]}
      />
    </>
  );
}

/** Derived contexts form a tree; cancelling a node cancels everything under it. */
export function ContextTree() {
  return (
    <Panels>
      <Panel width={320} height={244} title="Each derived context has a parent" tone="go">
        <ContextTreeDrawing timedOut={false} />
        <T x={14} y={238} kind="note">
          one request, one tree of contexts
        </T>
      </Panel>
      <Panel width={320} height={244} title="The timeout fires" tone="warn">
        <ContextTreeDrawing timedOut />
        <T x={14} y={238} kind="note">
          its subtree stops; parent and sibling carry on
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 19 · Defer — Advanced ─────────────────────────────────────────────────

function Exit({ x, label, code }: { x: number; label: string; code: string }) {
  return (
    <>
      <Box x={x} y={8} w={100} h={44} />
      <T x={x + 9} y={25} kind="small">
        {label}
      </T>
      <T x={x + 9} y={43}>
        {code}
      </T>
    </>
  );
}

/** However a function leaves, its deferred calls run. */
export function ExitPaths() {
  return (
    <Panels>
      <Panel width={320} height={240} title="stream()'s goroutine: defer close(out)" tone="go">
        <Exit x={6} label="rows done" code="loop ends" />
        <Exit x={110} label="scan fails" code="return" />
        <Exit x={214} label="cancelled" code="ctx.Done()" />
        <Arrow
          points={[
            [56, 52],
            [120, 104],
          ]}
          tone="go"
        />
        <Arrow
          points={[
            [160, 52],
            [160, 104],
          ]}
          tone="go"
        />
        <Arrow
          points={[
            [264, 52],
            [200, 104],
          ]}
          tone="go"
        />
        <Box x={30} y={106} w={260} h={64} tone="go" fill="go" />
        <T x={42} y={126} kind="small">
          deferred calls, last in first out
        </T>
        <T x={42} y={146}>
          1 rows.Close()
        </T>
        <T x={42} y={163}>
          2 close(out)
        </T>
        <Arrow
          points={[
            [160, 170],
            [160, 192],
          ]}
        />
        <Box x={60} y={194} w={200} h={30} />
        <T x={160} y={214} anchor="middle">
          range out ends
        </T>
      </Panel>

      <Panel width={320} height={240} title="Transfer(): one deferred wrap" tone="go">
        <Exit x={6} label="debit fails" code="return err" />
        <Exit x={110} label="credit fails" code="return err" />
        <Exit x={214} label="success" code="return nil" />
        <Arrow
          points={[
            [56, 52],
            [120, 104],
          ]}
          tone="go"
        />
        <Arrow
          points={[
            [160, 52],
            [160, 104],
          ]}
          tone="go"
        />
        <Arrow
          points={[
            [264, 52],
            [200, 104],
          ]}
          tone="go"
        />
        <Box x={30} y={106} w={260} h={64} tone="go" fill="go" />
        <T x={42} y={126} kind="small">
          deferred: runs on every return
        </T>
        <T x={42} y={146}>
          if err != nil {'{'}
        </T>
        <T x={42} y={163}>
          {'  err = fmt.Errorf(…)'}
        </T>
        <Arrow
          points={[
            [160, 170],
            [160, 192],
          ]}
        />
        <Box x={30} y={194} w={260} h={30} />
        <T x={160} y={214} anchor="middle">
          caller: wrapped err, or nil
        </T>
      </Panel>
    </Panels>
  );
}
