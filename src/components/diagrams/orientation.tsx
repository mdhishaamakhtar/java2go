import { Arrow, Box, Mark, Panel, Panels, T, Tok } from './kit';

/** 00 · Go Mental Model: methods live inside a Java class, beside a Go type. */
export function WhereBehaviourLives() {
  return (
    <Panels>
      <Panel width={340} height={176} title="Java: behaviour inside the class" tone="java">
        <Box x={14} y={14} w={312} h={128} tone="java" />
        <T x={28} y={38}>
          <Tok tone="kw">class</Tok> Celsius
        </T>
        <Box x={28} y={52} w={284} h={32} fill="chip" tone="muted" />
        <T x={40} y={73}>
          <Tok tone="kw">double</Tok> value
        </T>
        <Box x={28} y={94} w={284} h={32} fill="chip" tone="muted" />
        <T x={40} y={115}>
          toFahrenheit()
        </T>
        <T x={14} y={168} kind="note">
          data and methods enclosed together
        </T>
      </Panel>

      <Panel width={340} height={176} title="Go: behaviour beside the type" tone="go">
        <Box x={14} y={14} w={190} h={40} tone="go" fill="go" />
        <T x={28} y={39}>
          <Tok tone="kw">type</Tok> Celsius float64
        </T>
        <Box x={14} y={94} w={312} h={40} />
        <T x={26} y={119}>
          <Tok tone="kw">func</Tok> (c Celsius) Fahrenheit()
        </T>
        <Arrow
          points={[
            [96, 94],
            [96, 58],
          ]}
          tone="go"
          dashed
        />
        <T x={106} y={80} kind="small">
          receiver ties it to Celsius
        </T>
        <T x={14} y={168} kind="note">
          a method is a function with a receiver
        </T>
      </Panel>
    </Panels>
  );
}

/** 01 · Packages & Imports: capitalisation exports; internal/ fences off a subtree. */
export function PackageVisibility() {
  return (
    <Panels>
      <Panel width={340} height={212} title="Capital letter: exported" tone="go">
        <Box x={132} y={14} w={198} h={174} dashed tone="muted" fill="none" />
        <T x={144} y={34} kind="small">
          package model
        </T>
        <Box x={144} y={44} w={174} h={92} />
        <T x={156} y={62} kind="small">
          type User struct
        </T>
        <T x={156} y={84} tone="go">
          ID, Email
        </T>
        <T x={156} y={106} tone="ink2">
          password
        </T>
        <T x={144} y={158} tone="go">
          NewUser()
        </T>
        <T x={144} y={178} tone="ink2">
          hashPw()
        </T>

        <Box x={10} y={64} w={104} h={46} />
        <T x={22} y={84} kind="small">
          package main
        </T>
        <T x={22} y={102}>
          caller
        </T>
        <Arrow
          points={[
            [114, 78],
            [150, 80],
          ]}
          tone="go"
        />
        <Arrow
          points={[
            [114, 96],
            [150, 102],
          ]}
          tone="warn"
          dashed
        />
        <Mark at={[132, 110]} kind="no" />
        <T x={10} y={206} kind="note">
          u.Email compiles; u.password does not
        </T>
      </Panel>

      <Panel width={340} height={212} title="internal/: importable from inside only" tone="go">
        <Box x={10} y={14} w={320} h={124} dashed tone="muted" fill="none" />
        <T x={22} y={34} kind="small">
          github.com/mycompany/app/
        </T>
        <Box x={24} y={48} w={160} h={34} tone="go" fill="go" />
        <T x={36} y={70}>
          internal/billing
        </T>
        <Box x={24} y={94} w={160} h={34} />
        <T x={36} y={116}>
          cmd/api
        </T>
        <Arrow
          points={[
            [184, 111],
            [186, 65],
          ]}
          curve={[
            [222, 111],
            [222, 65],
          ]}
          tone="go"
        />
        <T x={232} y={92} kind="small" tone="go">
          allowed
        </T>

        <Box x={24} y={174} w={188} h={30} />
        <T x={36} y={194} kind="small">
          github.com/someone/else
        </T>
        <Arrow
          points={[
            [118, 174],
            [118, 142],
          ]}
          tone="warn"
          dashed
        />
        <Mark at={[132, 158]} kind="no" />
        <T x={146} y={162} kind="small" tone="warn">
          import …/internal/billing
        </T>
      </Panel>
    </Panels>
  );
}

function Node({
  x,
  y,
  w,
  label,
  fill = 'box',
  tone = 'ink',
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  fill?: 'box' | 'go' | 'warn';
  tone?: 'ink' | 'go' | 'warn';
}) {
  return (
    <>
      <Box x={x} y={y} w={w} h={30} fill={fill} tone={tone} />
      <T x={x + w / 2} y={y + 20} anchor="middle">
        {label}
      </T>
    </>
  );
}

/** The same dependency graph, resolved two ways. */
function VersionGraph({ chosen }: { chosen: 'nearest' | 'highest' }) {
  const nearest = chosen === 'nearest';
  return (
    <>
      <Node x={10} y={78} w={58} label="app" />
      <Node x={96} y={28} w={72} label="A v1.2" />
      <Node x={96} y={128} w={72} label="B v1.1" />
      <Node
        x={184}
        y={28}
        w={72}
        label="C v1.3"
        fill={nearest ? 'warn' : 'box'}
        tone={nearest ? 'warn' : 'ink'}
      />
      <Node x={184} y={128} w={72} label="D v1.0" />
      <Node
        x={268}
        y={128}
        w={66}
        label="C v1.5"
        fill={nearest ? 'box' : 'go'}
        tone={nearest ? 'ink' : 'go'}
      />
      <Arrow
        points={[
          [68, 88],
          [96, 46],
        ]}
      />
      <Arrow
        points={[
          [68, 98],
          [96, 140],
        ]}
      />
      <Arrow
        points={[
          [168, 43],
          [184, 43],
        ]}
      />
      <Arrow
        points={[
          [168, 143],
          [184, 143],
        ]}
      />
      <Arrow
        points={[
          [256, 143],
          [268, 143],
        ]}
      />
      <T x={198} y={76} kind="small">
        depth 2
      </T>
      <T x={282} y={176} kind="small">
        depth 3
      </T>
    </>
  );
}

/** 02 · Dependency Management: Maven's nearest-wins vs Go's minimal version selection. */
export function VersionSelection() {
  return (
    <Panels>
      <Panel width={340} height={214} title="Maven: nearest definition wins" tone="java">
        <VersionGraph chosen="nearest" />
        <T x={10} y={204} kind="note">
          builds with C v1.3, older than D asked for
        </T>
      </Panel>
      <Panel width={340} height={214} title="Go: minimal version selection" tone="go">
        <VersionGraph chosen="highest" />
        <T x={10} y={204} kind="note">
          builds with C v1.5, the highest anyone requires
        </T>
      </Panel>
    </Panels>
  );
}
