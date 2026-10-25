import { ManyOnFew } from './concurrency';
import { Arrow, Box, Line, Mark, Panel, Panels, T } from './kit';

/** A box with a line of code and an optional small note under it. */
function Stage({
  y,
  code,
  note,
  tone = 'ink',
  x = 14,
  w = 292,
}: {
  y: number;
  code: string;
  note?: string;
  tone?: 'ink' | 'go' | 'warn';
  x?: number;
  w?: number;
}) {
  const h = note ? 44 : 30;
  return (
    <>
      <Box x={x} y={y} w={w} h={h} tone={tone} fill={tone === 'ink' ? 'box' : tone} />
      <T x={x + 12} y={y + 20}>
        {code}
      </T>
      {note && (
        <T x={x + 12} y={y + 37} kind="small">
          {note}
        </T>
      )}
    </>
  );
}

// ─── 22 · Init & Main Lifecycle ────────────────────────────────────────────

const INIT_ORDER = [
  { pkg: 'c', step: 'variables' },
  { pkg: 'c', step: 'init()' },
  { pkg: 'b', step: 'variables' },
  { pkg: 'b', step: 'init()' },
  { pkg: 'main', step: 'variables' },
  { pkg: 'main', step: 'init()' },
] as const;

/** Packages initialise dependencies-first; run() owns the service's whole life. */
export function StartupOrder() {
  return (
    <Panels>
      <Panel width={320} height={262} title="main imports b, b imports c" tone="go">
        {INIT_ORDER.map(({ pkg, step }, i) => (
          <g key={i}>
            <Box x={14} y={8 + i * 32} w={190} h={26} />
            <T x={26} y={26 + i * 32}>
              {pkg}: {step}
            </T>
          </g>
        ))}
        <Box x={14} y={200} w={190} h={30} tone="go" fill="go" />
        <T x={26} y={220}>
          main()
        </T>
        <Line from={[214, 8]} to={[214, 64]} tone="muted" />
        <Line from={[214, 72]} to={[214, 128]} tone="muted" />
        <Line from={[214, 136]} to={[214, 192]} tone="muted" />
        <T x={222} y={40} kind="small">
          package c
        </T>
        <T x={222} y={104} kind="small">
          package b
        </T>
        <T x={222} y={168} kind="small">
          package main
        </T>
        <T x={14} y={256} kind="note">
          dependencies first, each package once
        </T>
      </Panel>

      <Panel width={320} height={262} title="run(): from start to graceful shutdown" tone="go">
        <Stage y={8} code="signal.NotifyContext" note="SIGTERM will cancel ctx" />
        <Stage y={60} code="load config, open pool" note="defer pool.Close()" />
        <Stage y={112} code="go srv.ListenAndServe()" />
        <Stage y={150} code="<-ctx.Done()" note="SIGTERM arrives" tone="warn" />
        <Stage
          y={202}
          code="srv.Shutdown(shutdownCtx)"
          note="up to 20s to drain, then pool.Close()"
          tone="go"
        />
        <T x={14} y={258} kind="note">
          main() only reports the error run returns
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 23 · Project Layout & Ecosystem ───────────────────────────────────────

function Pkg({
  x,
  y,
  w,
  label,
  tone = 'ink',
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  tone?: 'ink' | 'go' | 'warn';
}) {
  return (
    <>
      <Box x={x} y={y} w={w} h={30} tone={tone} fill={tone === 'ink' ? 'box' : tone} />
      <T x={x + w / 2} y={y + 20} anchor="middle">
        {label}
      </T>
    </>
  );
}

/** Package by domain: imports point inward. Package by layer: imports go in circles. */
export function ServiceLayout() {
  return (
    <Panels>
      <Panel width={320} height={212} title="By domain: imports point inward" tone="go">
        <Pkg x={90} y={8} w={140} label="cmd/messaging" />
        <Pkg x={14} y={84} w={124} label="httpapi" />
        <Pkg x={182} y={84} w={124} label="postgres" />
        <Pkg x={90} y={158} w={140} label="message" tone="go" />
        <Arrow
          points={[
            [130, 38],
            [84, 82],
          ]}
        />
        <Arrow
          points={[
            [190, 38],
            [236, 82],
          ]}
        />
        <Arrow
          points={[
            [160, 38],
            [160, 156],
          ]}
        />
        <Arrow
          points={[
            [76, 114],
            [124, 156],
          ]}
        />
        <Arrow
          points={[
            [244, 114],
            [196, 156],
          ]}
        />
        <T x={14} y={206} kind="note">
          message, the domain, imports none of them
        </T>
      </Panel>

      <Panel width={310} height={212} title="By layer: imports tend to circle back" tone="warn">
        <Pkg x={84} y={8} w={140} label="services" />
        <Pkg x={14} y={110} w={124} label="models" />
        <Pkg x={172} y={110} w={124} label="repositories" />
        <Arrow
          points={[
            [200, 38],
            [232, 108],
          ]}
          tone="warn"
        />
        <Arrow
          points={[
            [172, 125],
            [140, 125],
          ]}
          tone="warn"
        />
        <Arrow
          points={[
            [76, 108],
            [110, 40],
          ]}
          tone="warn"
        />
        <T x={14} y={68} kind="small">
          a model method
        </T>
        <T x={14} y={84} kind="small">
          calls a service
        </T>
        <Mark at={[20, 166]} kind="no" />
        <T x={34} y={170} kind="small" tone="warn">
          import cycle not allowed
        </T>
        <T x={14} y={206} kind="note">
          one back-edge and the build fails
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 24 · JSON & HTTP APIs ─────────────────────────────────────────────────

function Outcome({
  y,
  when,
  status,
  tone,
}: {
  y: number;
  when: string;
  status: string;
  tone: 'go' | 'ink2' | 'warn';
}) {
  return (
    <>
      <Arrow
        points={[
          [30, y],
          [46, y],
        ]}
        tone="muted"
      />
      <T x={52} y={y + 4}>
        {when}
      </T>
      <T x={306} y={y + 4} anchor="end" tone={tone}>
        {status}
      </T>
    </>
  );
}

/** What a request passes through, and how the handler turns errors into statuses. */
export function RequestPath() {
  return (
    <Panels>
      <Panel width={320} height={262} title="One request's path" tone="go">
        <Stage y={8} code="GET /api/messages/42" tone="go" />
        <Stage y={50} code="withRecovery" />
        <Stage y={92} code="withTiming" />
        <Stage y={134} code="withAuth" />
        <Stage y={176} code="GET /api/messages/{id}" note="ServeMux picks the handler" />
        <Arrow
          points={[
            [160, 38],
            [160, 50],
          ]}
        />
        <Arrow
          points={[
            [160, 80],
            [160, 92],
          ]}
        />
        <Arrow
          points={[
            [160, 122],
            [160, 134],
          ]}
        />
        <Arrow
          points={[
            [160, 164],
            [160, 176],
          ]}
        />
        <T x={14} y={236} kind="small">
          each wrapper also runs after the handler
        </T>
        <T x={14} y={254} kind="note">
          h.Get reads r.PathValue(&quot;id&quot;): &quot;42&quot;
        </T>
      </Panel>

      <Panel width={320} height={262} title="Errors become status codes" tone="go">
        <Stage y={8} code="h.messages.Find(…)" />
        <Arrow
          points={[
            [30, 38],
            [30, 60],
          ]}
        />
        <Stage y={62} code="switch on err" />
        <Line from={[30, 92]} to={[30, 206]} tone="muted" />
        <Outcome y={116} when="nil" status="200" tone="go" />
        <Outcome y={146} when="ErrNotFound" status="404" tone="ink2" />
        <Outcome y={176} when="DeadlineExceeded" status="504" tone="ink2" />
        <Outcome y={206} when="anything else" status="500" tone="warn" />
        <T x={14} y={254} kind="note">
          log the details, never leak them
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 25 · HTTP Concurrency Model ───────────────────────────────────────────

/** A thread-per-request pool, an event loop, and a goroutine per request. */
export function HttpModels() {
  const callbacks = [
    [84, 104],
    [108, 124],
    [128, 150],
    [154, 170],
    [174, 196],
    [200, 214],
    [218, 240],
    [244, 262],
    [266, 288],
  ] as const;
  return (
    <Panels>
      <Panel width={300} height={180} title="Spring MVC, platform threads" tone="java">
        {[30, 62, 94].map((y) => (
          <g key={y}>
            <T x={14} y={y + 4} kind="small">
              worker
            </T>
            <Box x={84} y={y - 6} w={36} h={12} r={3} tone="java" fill="java" />
            <Line from={[120, y]} to={[246, y]} tone="warn" dashed />
            <Box x={246} y={y - 6} w={40} h={12} r={3} tone="java" fill="java" />
          </g>
        ))}
        <T x={183} y={126} anchor="middle" kind="small" tone="warn">
          waiting on the database
        </T>
        <T x={14} y={172} kind="note">
          the thread is held the whole time
        </T>
      </Panel>

      <Panel width={300} height={180} title="WebFlux: a few event-loop threads" tone="java">
        <T x={84} y={22} kind="small">
          callbacks from many requests
        </T>
        {[50, 96].map((y) => (
          <g key={y}>
            <T x={14} y={y + 4} kind="small">
              loop
            </T>
            {callbacks.map(([from, to], i) => (
              <Box
                key={from}
                x={from}
                y={y - 7}
                w={to - from}
                h={14}
                r={3}
                tone={i % 2 ? 'muted' : 'java'}
                fill={i % 2 ? 'chip' : 'java'}
              />
            ))}
          </g>
        ))}
        <T x={14} y={140} kind="small">
          every layer returns Mono / Flux
        </T>
        <T x={14} y={172} kind="note">
          nothing on a loop may block
        </T>
      </Panel>

      <Panel width={300} height={180} title="Spring MVC, virtual threads" tone="java">
        <ManyOnFew tone="java" unit="one per request" thread="carrier thread" />
        <T x={14} y={172} kind="note">
          a waiting virtual thread unmounts
        </T>
      </Panel>

      <Panel width={300} height={180} title="Go: a goroutine per request" tone="go">
        <ManyOnFew tone="go" unit="one per request" />
        <T x={14} y={172} kind="note">
          blocking code; a waiting request holds no thread
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 26 · Testing ──────────────────────────────────────────────────────────

const CASES = [
  { name: 'positive', a: '1', b: '2', want: '3' },
  { name: 'zeros', a: '0', b: '0', want: '0' },
  { name: 'negative', a: '-1', b: '1', want: '0' },
];

/** A table of cases fans out into named subtests you can run one at a time. */
export function TableTests() {
  return (
    <Panels>
      <Panel width={330} height={186} title="Each case becomes a named subtest" tone="go">
        <Box x={10} y={8} w={180} h={126} />
        <T x={20} y={28} kind="small">
          name
        </T>
        <T x={112} y={28} kind="small">
          a
        </T>
        <T x={136} y={28} kind="small">
          b
        </T>
        <T x={160} y={28} kind="small">
          want
        </T>
        <Line from={[10, 38]} to={[190, 38]} tone="muted" />
        {CASES.map((c, i) => {
          const y = 62 + i * 28;
          return (
            <g key={c.name}>
              <T x={20} y={y}>
                {c.name}
              </T>
              <T x={110} y={y}>
                {c.a}
              </T>
              <T x={136} y={y}>
                {c.b}
              </T>
              <T x={166} y={y}>
                {c.want}
              </T>
              <Arrow
                points={[
                  [192, y - 4],
                  [212, y - 4],
                ]}
                tone="go"
              />
              <Box x={214} y={y - 19} w={108} h={26} tone="go" fill="go" />
              <T x={224} y={y - 1} kind="small">
                t.Run
              </T>
              <Mark at={[304, y - 6]} kind="yes" />
            </g>
          );
        })}
        <T x={10} y={180} kind="note">
          adding a case is adding a row
        </T>
      </Panel>

      <Panel width={330} height={186} title="go test -run 'TestAdd/zeros'" tone="go">
        {CASES.map((c, i) => {
          const y = 14 + i * 44;
          const picked = c.name === 'zeros';
          return (
            <g key={c.name}>
              <Box
                x={14}
                y={y}
                w={210}
                h={32}
                tone={picked ? 'go' : 'muted'}
                fill={picked ? 'go' : 'none'}
                dashed={!picked}
              />
              <T x={26} y={y + 21} tone={picked ? undefined : 'ink2'}>
                TestAdd/{c.name}
              </T>
              <T x={236} y={y + 21} kind="small" tone={picked ? 'go' : undefined}>
                {picked ? 'runs' : 'not run'}
              </T>
            </g>
          );
        })}
        <T x={14} y={180} kind="note">
          run one case by its name
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 27 · Logging & Observability ─────────────────────────────────────────

/** A log call passes through handlers; a LogValuer decides how a value is printed. */
export function SlogPipeline() {
  return (
    <Panels>
      <Panel width={330} height={250} title="A log call flows through handlers" tone="go">
        <Stage y={8} code="slog.InfoContext(ctx, …)" />
        <Arrow
          points={[
            [160, 38],
            [160, 52],
          ]}
        />
        <Stage y={54} code="ContextHandler" note="adds request_id from ctx" tone="go" />
        <Arrow
          points={[
            [160, 98],
            [160, 112],
          ]}
        />
        <Stage y={114} code="JSONHandler" note="formats the record" />
        <Arrow
          points={[
            [160, 158],
            [160, 172],
          ]}
        />
        <Box x={14} y={174} w={292} h={44} fill="chip" tone="muted" />
        <T x={22} y={192} kind="small">
          {'{"level":"INFO","msg":"charging card",'}
        </T>
        <T x={22} y={209} kind="small">
          {'"amount":1999,"request_id":"req-42"}'}
        </T>
        <T x={14} y={244} kind="note">
          no thread-locals: ctx carries the request
        </T>
      </Panel>

      <Panel width={330} height={250} title="LogValuer keeps secrets out" tone="go">
        <Stage y={8} code={'slog.Info("signup", …)'} note={'…, "password", pw)'} />
        <Arrow
          points={[
            [160, 52],
            [160, 76],
          ]}
        />
        <Stage y={78} code="Password.LogValue()" note="used instead of the real value" tone="go" />
        <Arrow
          points={[
            [160, 122],
            [160, 146],
          ]}
        />
        <Box x={14} y={148} w={292} h={44} fill="chip" tone="muted" />
        <T x={22} y={166} kind="small">
          {'{"msg":"signup",…,'}
        </T>
        <T x={22} y={183} kind="small">
          {'"password":"REDACTED"}'}
        </T>
        <T x={14} y={244} kind="note">
          an attribute value of that type is replaced
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 28 · Tooling & Deployment ─────────────────────────────────────────────

function Layer({
  x,
  y,
  label,
  tone = 'ink',
}: {
  x: number;
  y: number;
  label: string;
  tone?: 'ink' | 'go' | 'java';
}) {
  return (
    <>
      <Box x={x} y={y} w={116} h={34} tone={tone} fill={tone === 'ink' ? 'chip' : tone} />
      <T x={x + 58} y={y + 22} anchor="middle" kind="small">
        {label}
      </T>
    </>
  );
}

/** Build in one image, ship only the binary in another. */
export function MultiStageBuild() {
  return (
    <Panels>
      <Panel width={320} height={248} title="A two-stage Dockerfile" tone="go">
        <Box x={10} y={8} w={300} h={104} dashed tone="muted" fill="none" />
        <T x={22} y={28} kind="small">
          build stage: golang:1.27
        </T>
        <Box x={22} y={40} w={96} h={30} />
        <T x={70} y={60} anchor="middle">
          source
        </T>
        <Arrow
          points={[
            [118, 55],
            [176, 55],
          ]}
        />
        <T x={147} y={86} anchor="middle" kind="small">
          go build
        </T>
        <Box x={178} y={40} w={120} h={30} tone="go" fill="go" />
        <T x={238} y={60} anchor="middle">
          /out/api
        </T>
        <T x={22} y={102} kind="small">
          compiler and module cache stay here
        </T>
        <Arrow
          points={[
            [238, 70],
            [238, 150],
          ]}
          tone="go"
        />
        <T x={228} y={134} anchor="end" kind="small" tone="go">
          COPY --from=build
        </T>
        <Box x={10} y={152} w={300} h={64} tone="go" />
        <T x={22} y={172} kind="small">
          runtime stage: distroless/static
        </T>
        <T x={22} y={200}>
          /api
        </T>
        <T x={74} y={200} kind="small">
          + CA certificates, time zones
        </T>
        <T x={10} y={240} kind="note">
          only the binary reaches production
        </T>
      </Panel>

      <Panel width={300} height={248} title="What each image carries" tone="go">
        <T x={20} y={60} kind="label">
          Go
        </T>
        <Layer x={20} y={112} label="/api" tone="go" />
        <Layer x={20} y={150} label="distroless base" />
        <T x={20} y={206} kind="small" tone="go">
          typically 10–30 MB
        </T>
        <T x={164} y={60} kind="label">
          Java
        </T>
        <Layer x={164} y={74} label="app jars" tone="java" />
        <Layer x={164} y={112} label="JRE" />
        <Layer x={164} y={150} label="OS base" />
        <T x={164} y={206} kind="small" tone="java">
          a couple of
        </T>
        <T x={164} y={222} kind="small" tone="java">
          hundred MB
        </T>
        <T x={10} y={240} kind="note">
          layers drawn, not to scale
        </T>
      </Panel>
    </Panels>
  );
}
