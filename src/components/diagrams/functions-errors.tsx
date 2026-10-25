import { Arrow, Box, Line, Mark, Panel, Panels, T } from './kit';

// ─── 10 · Functions ────────────────────────────────────────────────────────

/** handler := WithLogging(WithRetry(3, process)): wrappers nest; the outermost runs first. */
export function MiddlewareOnion() {
  return (
    <Panels>
      <Panel width={330} height={194} title="Each wrapper returns a new function" tone="go">
        <Box x={10} y={14} w={310} h={148} tone="go" />
        <T x={22} y={34}>
          WithLogging
        </T>
        <Box x={26} y={46} w={278} h={102} tone="muted" fill="chip" />
        <T x={38} y={66}>
          WithRetry(3, …)
        </T>
        <Box x={42} y={78} w={246} h={56} tone="ink" />
        <T x={165} y={111} anchor="middle">
          process
        </T>
        <T x={10} y={186} kind="note">
          handler := WithLogging(WithRetry(3, process))
        </T>
      </Panel>

      <Panel width={300} height={194} title="Calls go in, errors come back out" tone="go">
        <Box x={30} y={14} w={180} h={32} tone="go" />
        <T x={120} y={35} anchor="middle">
          WithLogging
        </T>
        <Box x={30} y={78} w={180} h={32} />
        <T x={120} y={99} anchor="middle">
          WithRetry
        </T>
        <Box x={30} y={142} w={180} h={32} />
        <T x={120} y={163} anchor="middle">
          process
        </T>
        <Arrow
          points={[
            [80, 46],
            [80, 78],
          ]}
        />
        <Arrow
          points={[
            [80, 110],
            [80, 142],
          ]}
        />
        <T x={90} y={66} kind="small">
          next(msg)
        </T>
        <T x={90} y={124} kind="small">
          next(msg),
        </T>
        <T x={90} y={138} kind="small">
          up to 3 tries
        </T>
        <Arrow
          points={[
            [196, 142],
            [196, 110],
          ]}
          tone="muted"
          dashed
        />
        <Arrow
          points={[
            [196, 78],
            [196, 46],
          ]}
          tone="muted"
          dashed
        />
        <T x={206} y={130} kind="small">
          err
        </T>
        <T x={206} y={66} kind="small">
          err or nil
        </T>
        <T x={218} y={35} kind="small">
          runs first
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 11 · Defer ────────────────────────────────────────────────────────────

/** An open-topped box: the stack of deferred calls. */
function DeferStackFrame({ order }: { order: 'registered' | 'runs' }) {
  const registered = order === 'registered';
  return (
    <>
      <Line from={[14, 40]} to={[14, 168]} tone="muted" />
      <Line from={[14, 168]} to={[200, 168]} tone="muted" />
      <Line from={[200, 168]} to={[200, 40]} tone="muted" />
      <Box x={26} y={84} w={162} h={36} tone="go" fill="go" />
      <T x={107} y={107} anchor="middle">
        tx.Rollback()
      </T>
      <Box x={26} y={124} w={162} h={36} />
      <T x={107} y={147} anchor="middle">
        conn.Close()
      </T>
      <T x={210} y={107} kind="small" tone={registered ? undefined : 'go'}>
        {registered ? 'registered 2nd' : 'runs 1st'}
      </T>
      <T x={210} y={147} kind="small">
        {registered ? 'registered 1st' : 'runs 2nd'}
      </T>
    </>
  );
}

/** Deferred calls are pushed as they are reached and popped in reverse on return. */
export function DeferStack() {
  return (
    <Panels>
      <Panel width={320} height={196} title="Each defer pushes a call" tone="go">
        <Arrow
          points={[
            [107, 14],
            [107, 78],
          ]}
        />
        <T x={119} y={36} kind="small">
          defer
        </T>
        <DeferStackFrame order="registered" />
        <T x={14} y={190} kind="note">
          in the order the code reaches them
        </T>
      </Panel>
      <Panel width={320} height={196} title="Returning pops them: last in, first out" tone="go">
        <Arrow
          points={[
            [107, 78],
            [107, 14],
          ]}
          tone="go"
        />
        <T x={119} y={36} kind="small" tone="go">
          return
        </T>
        <DeferStackFrame order="runs" />
        <T x={14} y={190} kind="note">
          cleanup mirrors acquisition order
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 12 · Error Handling ───────────────────────────────────────────────────

/** fmt.Errorf("…: %w", err) nests errors; errors.Is and errors.As search every layer. */
export function ErrorChain() {
  return (
    <Panels>
      <Panel width={340} height={196} title="Each layer wraps the error with %w" tone="go">
        <Box x={10} y={14} w={320} h={148} />
        <T x={22} y={34}>
          &quot;publish: %w&quot;
        </T>
        <Box x={26} y={46} w={288} h={104} fill="chip" tone="muted" />
        <T x={38} y={66}>
          &quot;query message %d: %w&quot;
        </T>
        <Box x={42} y={80} w={256} h={56} tone="warn" fill="warn" />
        <T x={54} y={102} kind="small">
          the cause
        </T>
        <T x={54} y={122}>
          connection refused
        </T>
        <T x={10} y={188} kind="note">
          the message lists every layer, outside in
        </T>
      </Panel>

      <Panel width={320} height={196} title="errors.Is and errors.As check every layer" tone="go">
        <Box x={14} y={14} w={196} h={32} />
        <T x={26} y={35}>
          publish
        </T>
        <Box x={14} y={78} w={196} h={32} fill="chip" tone="muted" />
        <T x={26} y={99}>
          query message 42
        </T>
        <Box x={14} y={142} w={196} h={32} tone="warn" fill="warn" />
        <T x={26} y={163}>
          connection refused
        </T>
        <Arrow
          points={[
            [54, 46],
            [54, 78],
          ]}
        />
        <Arrow
          points={[
            [54, 110],
            [54, 142],
          ]}
        />
        <T x={64} y={66} kind="small">
          Unwrap()
        </T>
        <T x={64} y={130} kind="small">
          Unwrap()
        </T>
        <Line from={[228, 14]} to={[228, 174]} tone="go" />
        <T x={238} y={88} kind="small" tone="go">
          errors.Is
        </T>
        <T x={238} y={106} kind="small" tone="go">
          errors.As
        </T>
        <T x={14} y={192} kind="note">
          == compares only the outermost error
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 13 · Blank Identifier ─────────────────────────────────────────────────

/** _ takes a value and drops it; var _ T = … makes the compiler check a type. */
export function BlankIdentifier() {
  return (
    <Panels>
      <Panel width={320} height={176} title="n, _ := fmt.Sscan(input, &x)" tone="go">
        <Box x={14} y={14} w={232} h={34} />
        <T x={130} y={36} anchor="middle">
          fmt.Sscan(…)
        </T>
        <Arrow
          points={[
            [70, 48],
            [70, 92],
          ]}
        />
        <Arrow
          points={[
            [190, 48],
            [190, 92],
          ]}
          tone="muted"
          dashed
        />
        <T x={80} y={74} kind="small">
          count
        </T>
        <T x={200} y={74} kind="small">
          error
        </T>
        <Box x={42} y={96} w={56} h={34} />
        <T x={70} y={118} anchor="middle">
          n
        </T>
        <Box x={162} y={96} w={56} h={34} tone="muted" dashed fill="none" />
        <T x={190} y={118} anchor="middle" tone="ink2">
          _
        </T>
        <T x={14} y={166} kind="note">
          _ can be assigned to but never read
        </T>
      </Panel>

      <Panel width={340} height={176} title="var _ MessageStore = (*PostgresStore)(nil)" tone="go">
        <Box x={14} y={14} w={196} h={32} />
        <T x={26} y={35}>
          *PostgresStore
        </T>
        <Arrow
          points={[
            [100, 46],
            [100, 80],
          ]}
        />
        <T x={112} y={67} kind="small">
          checked when it compiles
        </T>
        <Box x={14} y={82} w={196} h={32} tone="go" fill="go" />
        <T x={26} y={103}>
          MessageStore
        </T>
        <Mark at={[20, 138]} kind="yes" />
        <T x={34} y={142} kind="small" tone="go">
          every method present: it builds
        </T>
        <Mark at={[20, 160]} kind="no" />
        <T x={34} y={164} kind="small" tone="warn">
          missing or changed method: build fails
        </T>
      </Panel>
    </Panels>
  );
}
