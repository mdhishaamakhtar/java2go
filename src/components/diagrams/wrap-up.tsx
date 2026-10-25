import { Arrow, Box, Panel, Panels, T } from './kit';

// ─── 29 · Common Gotchas ───────────────────────────────────────────────────

/** The users slice. Elements up to index `setUpTo` have Active true; `current` is highlighted. */
function Users({ setUpTo = -1, current }: { setUpTo?: number; current?: number }) {
  return (
    <>
      <T x={12} y={22} kind="small">
        users
      </T>
      {[0, 1, 2].map((i) => {
        const x = 12 + i * 102;
        const active = i <= setUpTo;
        const highlighted = i === current;
        return (
          <g key={i}>
            <Box
              x={x}
              y={30}
              w={96}
              h={44}
              tone={highlighted ? 'go' : 'ink'}
              fill={highlighted ? 'go' : 'box'}
            />
            <T x={x + 10} y={47} kind="small">
              Active
            </T>
            <T x={x + 10} y={66} tone={active ? 'go' : undefined}>
              {active ? 'true' : 'false'}
            </T>
          </g>
        );
      })}
    </>
  );
}

/** The range variable is a copy; indexing reaches the element itself. */
export function RangeCopy() {
  return (
    <Panels>
      <Panel width={320} height={190} title="for _, u := range users" tone="warn">
        <Users />
        <Arrow
          points={[
            [162, 74],
            [162, 118],
          ]}
          tone="muted"
        />
        <T x={172} y={100} kind="small">
          copied
        </T>
        <Box x={114} y={120} w={96} h={44} tone="warn" fill="warn" />
        <T x={124} y={137} kind="small">
          u.Active
        </T>
        <T x={124} y={156} tone="warn">
          true
        </T>
        <T x={12} y={184} kind="note">
          users is unchanged: only the copy was set
        </T>
      </Panel>

      <Panel width={320} height={190} title="for i := range users" tone="go">
        <Users setUpTo={1} current={1} />
        <Arrow
          points={[
            [162, 130],
            [162, 78],
          ]}
          tone="go"
        />
        <T x={172} y={104} kind="small" tone="go">
          i = 1
        </T>
        <T x={162} y={150} anchor="middle" tone="go">
          users[i].Active = true
        </T>
        <T x={12} y={184} kind="note">
          indexing reaches the element itself
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 30 · Go Mental Model — Recap ──────────────────────────────────────────

function Shift({ java, go, see }: { java: string; go: string; see: string }) {
  return (
    <>
      <Box x={14} y={8} w={272} h={44} tone="java" fill="java" />
      <T x={24} y={25} kind="small">
        Java
      </T>
      <T x={24} y={43}>
        {java}
      </T>
      <Arrow
        points={[
          [150, 52],
          [150, 78],
        ]}
      />
      <Box x={14} y={80} w={272} h={44} tone="go" fill="go" />
      <T x={24} y={97} kind="small">
        Go
      </T>
      <T x={24} y={115}>
        {go}
      </T>
      <T x={14} y={150} kind="small">
        {see}
      </T>
    </>
  );
}

/** The three shifts the guide keeps coming back to. */
export function ThreeShifts() {
  return (
    <Panels>
      <Panel width={300} height={160} title="1 · Data and behaviour are separate" tone="go">
        <Shift
          java="class: data and methods"
          go="struct, methods beside it"
          see="see sections 00, 05 and 06"
        />
      </Panel>
      <Panel width={300} height={160} title="2 · Errors are values" tone="go">
        <Shift
          java="throw, catch elsewhere"
          go="if err != nil { return … }"
          see="see sections 10 and 12"
        />
      </Panel>
      <Panel width={300} height={160} title="3 · Concurrency is ordinary, and bounded" tone="go">
        <Shift
          java="choose and size an executor"
          go="go f() + context + a limit"
          see="see sections 14 to 19"
        />
      </Panel>
    </Panels>
  );
}
