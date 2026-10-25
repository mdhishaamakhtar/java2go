import type { ComponentType } from 'react';
import type { DiagramId } from '@/lib/diagram-ids';
import { PushIterator, TypeSets } from './abstraction';
import {
  ChannelTiming,
  ContextTree,
  ExitPaths,
  RWMutexLanes,
  SchedulingModels,
  WorkerPool,
} from './concurrency';
import { BlankIdentifier, DeferStack, ErrorChain, MiddlewareOnion } from './functions-errors';
import { PackageVisibility, VersionSelection, WhereBehaviourLives } from './orientation';
import {
  HttpModels,
  MultiStageBuild,
  RequestPath,
  ServiceLayout,
  SlogPipeline,
  StartupOrder,
  TableTests,
} from './services';
import {
  ConsumerInterface,
  Embedding,
  InterfacePair,
  SliceHeader,
  Utf8BytesRunes,
  ValueVsPointer,
  ZeroValues,
} from './types-data';
import { RangeCopy, ThreeShifts } from './wrap-up';

/** Every drawing a `figure` block can name, in guide order. */
const diagrams: Record<DiagramId, ComponentType> = {
  'where-behaviour-lives': WhereBehaviourLives,
  'package-visibility': PackageVisibility,
  'version-selection': VersionSelection,
  'zero-values': ZeroValues,
  'utf8-bytes-runes': Utf8BytesRunes,
  embedding: Embedding,
  'consumer-interface': ConsumerInterface,
  'value-vs-pointer': ValueVsPointer,
  'interface-pair': InterfacePair,
  'slice-header': SliceHeader,
  'middleware-onion': MiddlewareOnion,
  'defer-stack': DeferStack,
  'error-chain': ErrorChain,
  'blank-identifier': BlankIdentifier,
  'scheduling-models': SchedulingModels,
  'channel-timing': ChannelTiming,
  'rwmutex-lanes': RWMutexLanes,
  'worker-pool': WorkerPool,
  'context-tree': ContextTree,
  'exit-paths': ExitPaths,
  'type-sets': TypeSets,
  'push-iterator': PushIterator,
  'startup-order': StartupOrder,
  'service-layout': ServiceLayout,
  'request-path': RequestPath,
  'http-models': HttpModels,
  'table-tests': TableTests,
  'slog-pipeline': SlogPipeline,
  'multi-stage-build': MultiStageBuild,
  'range-copy': RangeCopy,
  'three-shifts': ThreeShifts,
};

export default diagrams;
