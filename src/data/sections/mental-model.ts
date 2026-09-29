import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'mental-model',
  label: 'Go Mental Model',
  summary:
    'Go is not Java with different syntax. The ten differences that shape everything else, and how to read the rest of this guide.',
  blocks: [
    {
      type: 'prose',
      text: 'Before writing a line of Go, re-wire how you think about programs. Go has a different philosophy about nearly everything a Java developer takes for granted: types, memory, concurrency, errors and how an application is wired together. Learn the philosophy first and the syntax becomes obvious.',
    },
    { type: 'heading', text: 'The core differences at a glance' },
    {
      type: 'table',
      rows: [
        ['Classes bundle data and behaviour', 'Structs hold data; methods are declared separately'],
        ['Inheritance with `extends`', 'Composition via struct embedding'],
        ['Exceptions, checked and unchecked', 'Errors are return values, handled explicitly'],
        [
          'JVM: bytecode, JIT, tunable GC',
          'Native binary with a small runtime and a low-latency GC',
        ],
        [
          'Platform threads (~1 MB stack each), or virtual threads since Java 21',
          'Goroutines: start at a few KB, scheduled by the Go runtime',
        ],
        ['Spring wires dependencies (IoC)', 'You wire dependencies by hand in `main()`'],
        [
          'Reverse-domain packages, one class per file',
          'Short package names; a package is a directory',
        ],
        [
          'Any object reference can be `null`',
          '`nil` only for pointers, slices, maps, channels, functions and interfaces',
        ],
        [
          'Generics with erasure and wildcards',
          'Generics with constraints, no wildcards or variance',
        ],
        ['`implements` declared up front', 'Interfaces are satisfied implicitly'],
      ],
    },
    { type: 'heading', text: 'The Go philosophy in three sentences' },
    {
      type: 'callout',
      title: "Go's design philosophy",
      tone: 'go',
      text: '**Simplicity over cleverness.** Go deliberately has fewer features than Java: no inheritance, no exceptions, no annotations, no overloading. Generics arrived only in 2022, a decade after Go 1.0. Each omission is a deliberate trade to keep code readable by anyone on the team.\n\n**Explicit over implicit.** Errors are returned, not thrown. Dependencies are passed in, not injected by a framework. Whether a function can mutate its argument is visible in its signature. You can follow control flow by reading, without knowing what a framework does at runtime.\n\n**Concurrency as a first-class citizen.** Goroutines and channels are part of the language, and the runtime schedules them. You do not choose a thread pool or a reactive library; blocking code is the normal, efficient way to write concurrent Go.',
    },
    { type: 'heading', text: 'How to read this guide' },
    {
      type: 'prose',
      text: 'Most sections put idiomatic Java on the left and idiomatic Go on the right. Under many comparisons is a **Why Go does this** box explaining the reasoning behind the design choice. Read those carefully: they build the mental model, not just the syntax.\n\nThe guide is written against **Go 1.27** and **Java 25**. When a feature is recent, the version that introduced it is called out, because you will meet older code in real codebases.',
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'The Java analogies are training wheels. They get you started, but the goal is to stop asking "how do I do this Java thing in Go?" and start thinking in Go directly. By the end you should be able to read an unfamiliar Go codebase cold.',
    },
    { type: 'heading', text: 'One thing to internalise before anything else' },
    {
      type: 'callout',
      title: 'Where does behaviour live?',
      tone: 'engine',
      text: '**Java:** behaviour lives inside the class. A `User` class contains its own methods, and you cannot add methods to a class you do not own.\n\n**Go:** behaviour lives next to the type, not inside it. A method is an ordinary function with a receiver parameter. You can declare methods on any type defined in your package, including types built on primitives like `type Celsius float64`. A struct is just data; the functions that operate on it live nearby but are not enclosed by it.',
    },
    {
      type: 'compare',
      javaLabel: 'Java — methods live inside the class',
      goLabel: 'Go — methods are declared beside the type',
      java: `public final class Celsius {
    private final double value;

    public Celsius(double value) {
        this.value = value;
    }

    public double toFahrenheit() {
        return value * 9 / 5 + 32;
    }
}`,
      go: `// A new named type built on float64
type Celsius float64

// A method is a function with a receiver
func (c Celsius) Fahrenheit() float64 {
    return float64(c)*9/5 + 32
}

temp := Celsius(21.5)
fmt.Println(temp.Fahrenheit()) // 70.7`,
    },
  ],
};

export default section;
