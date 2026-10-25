import type { ReactNode } from 'react';
import { Arrow, Box, Line, Mark, Panel, Panels, T, Tok } from './kit';

// ─── 20 · Generics ─────────────────────────────────────────────────────────

/** Constraints are sets of types; the tilde admits types built on the listed ones. */
export function TypeSets() {
  return (
    <Panels>
      <Panel width={340} height={226} title="Each constraint is a set of types" tone="go">
        <Box x={8} y={8} w={324} h={190} tone="muted" fill="none" r={10} />
        <T x={20} y={28}>
          any
        </T>
        <T x={250} y={28} tone="ink2">
          []int
        </T>
        <Box x={24} y={40} w={292} h={148} tone="muted" fill="chip" r={10} />
        <T x={36} y={60}>
          comparable
        </T>
        <T x={244} y={60} tone="ink2">
          *User
        </T>
        <Box x={40} y={72} w={260} h={106} tone="go" fill="box" r={10} />
        <T x={52} y={92}>
          cmp.Ordered
        </T>
        <T x={222} y={128} tone="ink2">
          string
        </T>
        <Box x={56} y={104} w={150} h={64} tone="go" fill="go" r={10} />
        <T x={68} y={124}>
          Number
        </T>
        <T x={68} y={154} tone="go">
          int Celsius
        </T>
        <T x={8} y={218} kind="note">
          each set is inside the one it narrows
        </T>
      </Panel>

      <Panel width={320} height={226} title="The tilde admits types built on them" tone="go">
        <Box x={14} y={14} w={196} h={66} />
        <T x={26} y={36}>
          int | float64
        </T>
        <T x={26} y={64} tone="ink2">
          int float64
        </T>
        <T x={226} y={52} tone="warn">
          Celsius
        </T>
        <Mark at={[298, 48]} kind="no" />
        <Box x={14} y={104} w={292} h={66} tone="go" fill="go" />
        <T x={26} y={126}>
          ~int | ~float64
        </T>
        <T x={26} y={154}>
          int float64 <Tok tone="go">Celsius</Tok>
        </T>
        <Mark at={[202, 150]} kind="yes" />
        <T x={14} y={218} kind="note">
          type Celsius float64 is built on float64
        </T>
      </Panel>
    </Panels>
  );
}

// ─── 21 · Iterators ────────────────────────────────────────────────────────

function Lifelines({ left, right }: { left: string; right: string }) {
  return (
    <>
      <Box x={14} y={8} w={112} h={26} fill="chip" tone="muted" />
      <T x={70} y={26} anchor="middle" kind="small">
        {left}
      </T>
      <Box x={184} y={8} w={112} h={26} fill="chip" tone="muted" />
      <T x={240} y={26} anchor="middle" kind="small">
        {right}
      </T>
      <Line from={[70, 34]} to={[70, 172]} tone="muted" dashed />
      <Line from={[240, 34]} to={[240, 172]} tone="muted" dashed />
    </>
  );
}

function Message({
  y,
  to,
  children,
  reply = false,
  tone,
}: {
  y: number;
  to: 'left' | 'right';
  children: ReactNode;
  reply?: boolean;
  tone?: 'go' | 'warn' | 'java';
}) {
  const [from, end] = to === 'right' ? [72, 238] : [238, 72];
  return (
    <>
      <Arrow
        points={[
          [from, y],
          [end, y],
        ]}
        dashed={reply}
        tone={tone ?? (reply ? 'muted' : 'ink')}
      />
      <T x={155} y={y - 6} anchor="middle" kind="small" tone={tone}>
        {children}
      </T>
    </>
  );
}

/** Java's caller pulls values out; Go's iterator pushes them into the loop body. */
export function PushIterator() {
  return (
    <Panels>
      <Panel width={310} height={196} title="Java: the loop pulls from an Iterator" tone="java">
        <Lifelines left="for loop" right="Iterator" />
        <Message y={58} to="right">
          hasNext()
        </Message>
        <Message y={80} to="left" reply>
          true
        </Message>
        <Message y={112} to="right">
          next()
        </Message>
        <Message y={134} to="left" reply>
          3
        </Message>
        <T x={155} y={164} anchor="middle" kind="small">
          … until hasNext() is false
        </T>
        <T x={14} y={190} kind="note">
          state lives in the Iterator&apos;s fields
        </T>
      </Panel>

      <Panel width={310} height={196} title="Go: the iterator pushes into yield" tone="go">
        <Lifelines left="iterator func" right="loop body" />
        <Message y={58} to="right" tone="go">
          yield(3)
        </Message>
        <Message y={80} to="left" reply>
          true: keep going
        </Message>
        <Message y={112} to="right" tone="go">
          yield(2)
        </Message>
        <Message y={134} to="left" reply tone="warn">
          false: the body hit break
        </Message>
        <T x={70} y={164} anchor="middle" kind="small">
          return
        </T>
        <T x={234} y={164} anchor="middle" kind="small">
          if n == 2 {'{'} break {'}'}
        </T>
        <T x={14} y={190} kind="note">
          state lives in the iterator&apos;s locals
        </T>
      </Panel>
    </Panels>
  );
}
