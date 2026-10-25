import { Arrow, Box, Dot, Line, Panel, Panels, T, Tok } from './kit';

// ─── 03 · Types & Variables ────────────────────────────────────────────────

function ZeroRow({
  y,
  type,
  value,
  tone,
}: {
  y: number;
  type: string;
  value: string;
  tone?: 'warn' | 'go';
}) {
  return (
    <>
      <T x={14} y={y}>
        {type}
      </T>
      <Line from={[150, y - 4]} to={[178, y - 4]} tone="muted" dashed />
      <T x={186} y={y} tone={tone === 'warn' ? 'warn' : tone === 'go' ? 'go' : undefined}>
        {value}
      </T>
    </>
  );
}

/** What an unassigned field holds: null for every Java object, a usable value in Go. */
export function ZeroValues() {
  return (
    <Panels>
      <Panel width={330} height={204} title="Java: a field before assignment" tone="java">
        <ZeroRow y={30} type="int" value="0" />
        <ZeroRow y={58} type="boolean" value="false" />
        <ZeroRow y={86} type="String" value="null" tone="warn" />
        <ZeroRow y={114} type="List<String>" value="null" tone="warn" />
        <ZeroRow y={142} type="User" value="null" tone="warn" />
        <T x={14} y={190} kind="note">
          every object field starts as null
        </T>
      </Panel>
      <Panel width={330} height={204} title="Go: the zero value of each type" tone="go">
        <ZeroRow y={30} type="int" value="0" />
        <ZeroRow y={58} type="bool" value="false" />
        <ZeroRow y={86} type="string" value='""' tone="go" />
        <ZeroRow y={114} type="[]string" value="nil, len 0" tone="go" />
        <ZeroRow y={142} type="User" value="all fields zero" tone="go" />
        <ZeroRow y={170} type="*User" value="nil" tone="warn" />
        <T x={14} y={196} kind="note">
          nil only where the type allows it
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 04 · Strings & Formatting ─────────────────────────────────────────────

const BYTES = [
  { byte: '104', index: 0 },
  { byte: '195', index: 1 },
  { byte: '169', index: 2 },
  { byte: '108', index: 3 },
  { byte: '108', index: 4 },
  { byte: '111', index: 5 },
];
const RUNES = [
  { char: 'h', from: 0, to: 0 },
  { char: 'é', from: 1, to: 2 },
  { char: 'l', from: 3, to: 3 },
  { char: 'l', from: 4, to: 4 },
  { char: 'o', from: 5, to: 5 },
];
const cellX = (i: number) => 14 + i * 50;

/** "héllo" is six UTF-8 bytes but five runes. */
export function Utf8BytesRunes() {
  return (
    <Panels>
      <Panel width={330} height={150} title="len(s) is 6: s holds UTF-8 bytes" tone="go">
        {RUNES.map((r) => (
          <T
            key={r.from}
            x={(cellX(r.from) + cellX(r.to) + 46) / 2}
            y={22}
            anchor="middle"
            kind="small"
          >
            {r.char}
          </T>
        ))}
        {BYTES.map((b) => (
          <g key={b.index}>
            <Box
              x={cellX(b.index)}
              y={30}
              w={46}
              h={38}
              tone={b.index === 1 ? 'go' : 'ink'}
              fill={b.index === 1 ? 'go' : 'box'}
            />
            <T x={cellX(b.index) + 23} y={54} anchor="middle">
              {b.byte}
            </T>
            <T x={cellX(b.index) + 23} y={86} anchor="middle" kind="small">
              {b.index}
            </T>
          </g>
        ))}
        <T x={14} y={130} kind="note">
          s[1] is 195: one byte of é, not a character
        </T>
      </Panel>

      <Panel width={330} height={150} title="range s: one rune at a time" tone="go">
        {RUNES.map((r) => (
          <g key={r.from}>
            <Box x={cellX(r.from)} y={30} w={cellX(r.to) - cellX(r.from) + 46} h={38} />
            <T x={(cellX(r.from) + cellX(r.to) + 46) / 2} y={54} anchor="middle">
              {r.char}
            </T>
            <T x={(cellX(r.from) + cellX(r.to) + 46) / 2} y={86} anchor="middle" kind="small">
              i={r.from}
            </T>
          </g>
        ))}
        <T x={14} y={130} kind="note">
          5 runes; i is each rune&apos;s byte offset
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 05 · Structs ──────────────────────────────────────────────────────────

/** Java subclasses; Go embeds one struct in another and promotes its members. */
export function Embedding() {
  return (
    <Panels>
      <Panel width={340} height={200} title="Java: PriorityMessage extends BaseMessage" tone="java">
        <Box x={70} y={14} w={200} h={72} />
        <T x={84} y={34} kind="small">
          BaseMessage
        </T>
        <T x={84} y={54}>
          id, topic
        </T>
        <T x={84} y={74}>
          logLine()
        </T>
        <Box x={70} y={124} w={200} h={46} />
        <T x={84} y={143} kind="small">
          PriorityMessage
        </T>
        <T x={84} y={161}>
          priority
        </T>
        <Arrow
          points={[
            [170, 124],
            [170, 87],
          ]}
          head="triangle"
        />
        <T x={182} y={110} kind="small">
          is-a
        </T>
        <T x={14} y={192} kind="note">
          usable anywhere a BaseMessage is expected
        </T>
      </Panel>

      <Panel width={340} height={200} title="Go: PriorityMessage embeds BaseMessage" tone="go">
        <Box x={14} y={14} w={186} h={150} tone="go" />
        <T x={26} y={34} kind="small">
          PriorityMessage
        </T>
        <Box x={26} y={44} w={162} h={74} fill="chip" tone="muted" />
        <T x={38} y={63} kind="small">
          BaseMessage
        </T>
        <T x={38} y={84}>
          ID, Topic
        </T>
        <T x={38} y={106}>
          LogLine()
        </T>
        <T x={26} y={146}>
          Priority
        </T>
        <Arrow
          points={[
            [188, 80],
            [222, 80],
          ]}
          tone="go"
          dashed
        />
        <Arrow
          points={[
            [188, 102],
            [222, 102],
          ]}
          tone="go"
          dashed
        />
        <T x={228} y={84} tone="go">
          pm.ID
        </T>
        <T x={228} y={106} tone="go">
          pm.LogLine()
        </T>
        <T x={14} y={192} kind="note">
          has-a, with promotion; not a subtype
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 06 · Interfaces ───────────────────────────────────────────────────────

/** Java's implementer names the interface; in Go the consumer declares it. */
export function ConsumerInterface() {
  return (
    <Panels>
      <Panel width={340} height={226} title="Java: the implementer declares it" tone="java">
        <Box x={10} y={14} w={320} h={110} dashed tone="muted" fill="none" />
        <T x={22} y={34} kind="small">
          package store
        </T>
        <Box x={22} y={46} w={140} h={44} tone="java" fill="java" />
        <T x={34} y={63} kind="small">
          interface
        </T>
        <T x={34} y={81}>
          MessageStore
        </T>
        <Box x={192} y={46} w={128} h={44} />
        <T x={204} y={63} kind="small">
          class
        </T>
        <T x={204} y={81}>
          PostgresStore
        </T>
        <Arrow
          points={[
            [192, 68],
            [164, 68],
          ]}
          head="triangle"
          dashed
        />
        <T x={178} y={110} kind="small" anchor="middle">
          implements
        </T>

        <Box x={10} y={150} w={320} h={44} dashed tone="muted" fill="none" />
        <T x={22} y={170} kind="small">
          package handler
        </T>
        <T x={22} y={186}>
          Handler
        </T>
        <Arrow
          points={[
            [96, 160],
            [96, 92],
          ]}
        />
        <T x={104} y={140} kind="small">
          depends on
        </T>
        <T x={10} y={218} kind="note">
          a class lists every interface it satisfies
        </T>
      </Panel>

      <Panel width={340} height={226} title="Go: the consumer declares it" tone="go">
        <Box x={10} y={14} w={320} h={84} dashed tone="muted" fill="none" />
        <T x={22} y={34} kind="small">
          package handler
        </T>
        <Box x={22} y={46} w={168} h={38} tone="go" fill="go" />
        <T x={34} y={70}>
          messageReader
        </T>
        <T x={202} y={70} kind="small">
          Handler needs
        </T>
        <T x={202} y={86} kind="small">
          only GetByID
        </T>

        <Box x={10} y={132} w={210} h={62} dashed tone="muted" fill="none" />
        <T x={22} y={152} kind="small">
          package store
        </T>
        <Box x={22} y={160} w={176} h={28} />
        <T x={34} y={179}>
          *PostgresStore
        </T>
        <Arrow
          points={[
            [110, 160],
            [106, 88],
          ]}
          tone="go"
          dashed
        />
        <T x={118} y={124} kind="small" tone="go">
          satisfies it implicitly
        </T>
        <T x={10} y={218} kind="note">
          store never imports handler
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 07 · Pointers ─────────────────────────────────────────────────────────

/** A variable that holds a reference: a small box with a dot, named on its left. */
function RefVar({ name, y }: { name: string; y: number }) {
  return (
    <>
      <T x={14} y={y + 20}>
        {name}
      </T>
      <Box x={44} y={y} w={36} h={30} fill="chip" />
      <Dot at={[62, y + 15]} />
    </>
  );
}

function SharedObject({ fieldName }: { fieldName: string }) {
  return (
    <>
      <Arrow
        points={[
          [62, 45],
          [176, 76],
        ]}
        curve={[
          [110, 45],
          [132, 76],
        ]}
      />
      <Arrow
        points={[
          [62, 119],
          [176, 92],
        ]}
        curve={[
          [110, 119],
          [132, 92],
        ]}
      />
      <Box x={178} y={58} w={112} h={50} />
      <T x={190} y={78} kind="small">
        Message
      </T>
      <T x={190} y={97}>
        {fieldName}: <Tok tone="num">5</Tok>
      </T>
    </>
  );
}

/** Java shares objects by reference; a Go struct variable holds the struct itself. */
export function ValueVsPointer() {
  return (
    <Panels>
      <Panel width={300} height={176} title="Java: m2 = m1; m2.retries = 5" tone="java">
        <RefVar name="m1" y={30} />
        <RefVar name="m2" y={104} />
        <SharedObject fieldName="retries" />
        <T x={14} y={168} kind="note">
          two references, one object
        </T>
      </Panel>

      <Panel width={300} height={176} title="Go: m2 := m1; m2.Retries = 5" tone="go">
        <T x={14} y={54}>
          m1
        </T>
        <Box x={44} y={26} w={150} h={48} />
        <T x={56} y={45} kind="small">
          Message
        </T>
        <T x={56} y={64}>
          Retries: <Tok tone="num">0</Tok>
        </T>
        <T x={14} y={128}>
          m2
        </T>
        <Box x={44} y={100} w={150} h={48} tone="go" fill="go" />
        <T x={56} y={119} kind="small">
          Message (a copy)
        </T>
        <T x={56} y={138}>
          Retries: <Tok tone="num">5</Tok>
        </T>
        <T x={14} y={168} kind="note">
          each variable holds its own Message
        </T>
      </Panel>

      <Panel width={300} height={176} title="Go pointers: m4 := m3; m4.Retries = 5" tone="go">
        <RefVar name="m3" y={30} />
        <RefVar name="m4" y={104} />
        <SharedObject fieldName="Retries" />
        <T x={14} y={168} kind="note">
          {'m3 := &Message{}: one Message, like Java'}
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 08 · any / interface{} ────────────────────────────────────────────────

function InterfaceValue({ type, value }: { type: string; value: string }) {
  return (
    <>
      <T x={24} y={40} kind="small">
        type
      </T>
      <T x={190} y={40} kind="small">
        value
      </T>
      <Box x={14} y={48} w={168} h={40} />
      <Box x={182} y={48} w={104} h={40} />
      <T x={26} y={73}>
        {type}
      </T>
      <T x={194} y={73}>
        {value}
      </T>
    </>
  );
}

/** An interface value is nil only when both its type and value are nil. */
export function InterfacePair() {
  return (
    <Panels>
      <Panel width={300} height={140} title="return nil" tone="go">
        <T x={14} y={20} kind="small">
          err (an error interface value)
        </T>
        <InterfaceValue type="nil" value="nil" />
        <T x={14} y={122} tone="go">
          err == nil is true
        </T>
      </Panel>
      <Panel width={300} height={140} title="return a nil *ValidationError" tone="warn">
        <T x={14} y={20} kind="small">
          err (an error interface value)
        </T>
        <InterfaceValue type="*ValidationError" value="nil" />
        <T x={14} y={122} tone="warn">
          err == nil is false
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 09 · Slices & Maps ────────────────────────────────────────────────────

/** A slice header: pointer, length and capacity. */
function Header({ x, y, len, cap }: { x: number; y: number; len: number; cap: number }) {
  return (
    <>
      <Box x={x} y={y} w={32} h={32} fill="chip" />
      <Dot at={[x + 16, y + 16]} />
      <Box x={x + 32} y={y} w={56} h={32} fill="chip" />
      <T x={x + 60} y={y + 21} anchor="middle">
        len {len}
      </T>
      <Box x={x + 88} y={y} w={56} h={32} fill="chip" />
      <T x={x + 116} y={y + 21} anchor="middle">
        cap {cap}
      </T>
    </>
  );
}

function Cells({
  x,
  y,
  values,
  step = 50,
  width = 46,
  highlight = [],
  spare = 0,
}: {
  x: number;
  y: number;
  values: string[];
  step?: number;
  width?: number;
  highlight?: number[];
  spare?: number;
}) {
  return (
    <>
      {values.map((v, i) => (
        <g key={i}>
          <Box
            x={x + i * step}
            y={y}
            w={width}
            h={34}
            tone={highlight.includes(i) ? 'go' : 'ink'}
            fill={highlight.includes(i) ? 'go' : 'box'}
          />
          <T x={x + i * step + width / 2} y={y + 22} anchor="middle">
            {v}
          </T>
        </g>
      ))}
      {Array.from({ length: spare }, (_, i) => (
        <Box
          key={i}
          x={x + (values.length + i) * step}
          y={y}
          w={width}
          h={34}
          tone="muted"
          dashed
          fill="none"
        />
      ))}
    </>
  );
}

/** Slices are views onto arrays: shared on sub-slicing, copied when they outgrow cap. */
export function SliceHeader() {
  return (
    <Panels>
      <Panel width={330} height={196} title="s := make([]int, 3, 5)" tone="go">
        <Header x={14} y={14} len={3} cap={5} />
        <T x={168} y={35} kind="small">
          the slice header
        </T>
        <Arrow
          points={[
            [30, 30],
            [34, 94],
          ]}
        />
        <Cells x={14} y={98} values={['0', '0', '0']} spare={2} />
        <Line from={[14, 146]} to={[160, 146]} tone="go" />
        <T x={87} y={162} anchor="middle" kind="small" tone="go">
          len 3
        </T>
        <Line from={[14, 172]} to={[260, 172]} tone="muted" />
        <T x={137} y={188} anchor="middle" kind="small">
          cap 5: room to append
        </T>
      </Panel>

      <Panel width={330} height={196} title="b := a[1:3] shares a's array" tone="go">
        <T x={14} y={12} kind="small">
          a
        </T>
        <Header x={14} y={18} len={5} cap={5} />
        <T x={174} y={12} kind="small">
          b
        </T>
        <Header x={174} y={18} len={2} cap={4} />
        <Arrow
          points={[
            [30, 34],
            [37, 102],
          ]}
        />
        <Arrow
          points={[
            [190, 34],
            [89, 102],
          ]}
          curve={[
            [190, 76],
            [89, 66],
          ]}
          tone="go"
        />
        <Cells
          x={14}
          y={106}
          values={['1', '99', '3', '4', '5']}
          highlight={[1, 2]}
          step={52}
          width={48}
        />
        <T x={14} y={166} kind="small" tone="go">
          b covers a[1] and a[2]
        </T>
        <T x={14} y={188} kind="note">
          b[0] = 99 changed a[1] as well
        </T>
      </Panel>

      <Panel width={330} height={196} title="s = append(s, 77) past cap" tone="go">
        <T x={14} y={14} kind="small">
          before: len 5, cap 5 (full)
        </T>
        <Cells x={14} y={22} values={['0', '0', '0', '99', '88']} step={36} width={32} />
        <Arrow
          points={[
            [100, 62],
            [100, 104],
          ]}
        />
        <T x={110} y={88} kind="small">
          copied to a new array
        </T>
        <Cells
          x={14}
          y={108}
          values={['0', '0', '0', '99', '88', '77']}
          step={36}
          width={32}
          highlight={[5]}
          spare={2}
        />
        <T x={312} y={130} anchor="middle" kind="small">
          …
        </T>
        <T x={14} y={166} kind="small">
          after: len 6, larger cap; s points here
        </T>
        <T x={14} y={188} kind="note">
          other slices still see the old array
        </T>
      </Panel>
    </Panels>
  );
}
