import type { Section } from '@/types/section';

const section: Section = {
  id: 'mental-model',
  title: '00',
  label: 'Go Mental Model',
  blocks: [
    {
      type: 'prose',
      text: 'Before writing a line of Go, re-wire how you think about programs. Go is not Java with different syntax. It has a fundamentally different philosophy about nearly everything: types, memory, concurrency, and errors.',
    },
    { type: 'heading', text: 'The core differences at a glance' },
    {
      type: 'table',
      rows: [
        ['Object-Oriented', 'Data (structs) and behaviour (functions) are separate'],
        ['Classes with inheritance', 'Structs + composition via embedding'],
        ['Checked exceptions (try/catch)', 'Errors are return values — handled explicitly'],
        ['JVM managed runtime + GC', 'Compiled to native binary, lightweight GC'],
        ['Threads (1 thread ≈ 1MB stack)', 'Goroutines (start at 2KB, multiplexed)'],
        ['Spring manages wiring (IoC)', 'Manual wiring in main() — explicit, readable'],
        ['import = class path', 'import = package path, one word namespace'],
        ['null (Objects can be null)', 'nil only for pointers, slices, maps, interfaces'],
        ['Generics with wildcards/variance', 'Generics with simple type constraints'],
        ['Interface = explicit implements', 'Interface = implicit — just have the methods'],
      ],
    },
    { type: 'heading', text: 'The Go philosophy in three sentences' },
    {
      type: 'callout',
      title: "Go's design philosophy",
      color: '#4ec9b0',
      text: `**Simplicity over cleverness.** Go intentionally has fewer features than Java. No generics for 10 years, no exceptions, no inheritance. Every missing feature is a deliberate choice to keep code readable by anyone on the team.\n\n**Explicit over implicit.** Errors are returned, not thrown. Dependencies are wired by hand, not injected by a framework. Value vs pointer behavior is visible in types and method signatures, so control flow and mutation are easy to reason about.\n\n**Concurrency as a first-class citizen.** Goroutines and channels are built into the language. The runtime scheduler handles thousands of concurrent operations with minimal overhead. You do not reach for a library — you use the language.`,
    },
    { type: 'heading', text: 'How to read this guide' },
    {
      type: 'prose',
      text: 'Every section shows Java code on the left and Go code on the right. Under each comparison is a "Why Go does this" explanation — the reasoning behind the design choice. Read those carefully: they build the Go mental model, not just Go syntax.',
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'The Java analogies are training wheels. They help you get started, but the goal is to stop thinking "how do I do this Java thing in Go?" and start thinking in Go\'s model directly. By the end, you should be able to read Go code cold.',
    },
    { type: 'heading', text: 'One thing to internalize before anything else' },
    {
      type: 'callout',
      title: 'Java vs Go: where does behaviour live?',
      color: '#c07ed4',
      text: '**Java:** behaviour lives INSIDE the class. A `User` class contains its own methods. You cannot add methods to a class you do not own.\n\n**Go:** behaviour lives OUTSIDE the type. Methods are regular functions that declare a receiver. You can attach methods to any type in the same package — including primitive aliases. A struct is just data. Functions that operate on it live nearby but are not enclosed by it.',
    },
  ],
};

export default section;
