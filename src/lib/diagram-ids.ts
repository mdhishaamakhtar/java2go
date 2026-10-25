/**
 * Every diagram a `figure` block may name. The registry in
 * `components/diagrams` must provide a component for each one (the type
 * system enforces it), so a figure can never point at a missing drawing.
 */
export const DIAGRAM_IDS = [
  'where-behaviour-lives',
  'package-visibility',
  'version-selection',
  'zero-values',
  'utf8-bytes-runes',
  'embedding',
  'consumer-interface',
  'value-vs-pointer',
  'interface-pair',
  'slice-header',
  'middleware-onion',
  'defer-stack',
  'error-chain',
  'blank-identifier',
  'scheduling-models',
  'channel-timing',
  'rwmutex-lanes',
  'worker-pool',
  'context-tree',
  'exit-paths',
  'type-sets',
  'push-iterator',
  'startup-order',
  'service-layout',
  'request-path',
  'http-models',
  'table-tests',
  'slog-pipeline',
  'multi-stage-build',
  'range-copy',
  'three-shifts',
] as const;

export type DiagramId = (typeof DIAGRAM_IDS)[number];
