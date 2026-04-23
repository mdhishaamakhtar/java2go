import type { Section } from '@/types/section';
import s00 from './s00MentalModel';
import s01 from './s01Packages';
import s22 from './s22DependencyMgmt';
import s02 from './s02Types';
import s03 from './s03Structs';
import s04 from './s04Interfaces';
import s05 from './s05Pointers';
import s06 from './s06Any';
import s07 from './s07Functions';
import s08 from './s08Collections';
import s09 from './s09Defer';
import s10 from './s10Goroutines';
import s11 from './s11Channels';
import s12 from './s12Sync';
import s13 from './s13GoroutineMgmt';
import s23 from './s23Context';
import s14 from './s14DeferAdvanced';
import s15 from './s15Generics';
import s16 from './s16Errors';
import s17 from './s17Blank';
import s18 from './s18Lifecycle';
import s19 from './s19Project';
import s24 from './s24JsonHttp';
import s21 from './s21HttpConcurrency';
import s25 from './s25Testing';
import s26 from './s26Logging';
import s20 from './s20Outro';

const sections: Section[] = [
  s00,
  s01,
  s22, // Dependency Management (02)
  s02, // Types & Variables (03)
  s03, // Structs (04)
  s04, // Interfaces (05)
  s05, // Pointers (06)
  s06, // Any Type (07)
  s07, // Functions (08)
  s08, // Collections (09)
  s09, // Defer (10)
  s10, // Goroutines (11)
  s11, // Channels (12)
  s12, // Sync (13)
  s13, // Goroutine Management (14)
  s23, // Context (15)
  s14, // Defer Advanced (16)
  s15, // Generics (17)
  s16, // Error Handling (18)
  s17, // Blank Identifier (19)
  s18, // Lifecycle (20)
  s19, // Project Layout (21)
  s24, // JSON & HTTP APIs (22)
  s21, // HTTP Concurrency Model (23)
  s25, // Testing (24)
  s26, // Logging & Observability (25)
  s20, // Outro (26)
];

export default sections;

export function getSectionById(id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

export function getSectionNav(id: string): { prev?: Section; next?: Section } {
  const idx = sections.findIndex((s) => s.id === id);
  return {
    prev: idx > 0 ? sections[idx - 1] : undefined,
    next: idx < sections.length - 1 ? sections[idx + 1] : undefined,
  };
}
