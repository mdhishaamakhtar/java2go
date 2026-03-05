import type { Section } from '@/types/section';
import s00 from './s00MentalModel';
import s01 from './s01Packages';
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
import s14 from './s14DeferAdvanced';
import s15 from './s15Generics';
import s16 from './s16Errors';
import s17 from './s17Blank';
import s18 from './s18Lifecycle';
import s19 from './s19Project';
import s20 from './s20Outro';

const sections: Section[] = [
  s00,
  s01,
  s02,
  s03,
  s04,
  s05,
  s06,
  s07,
  s08,
  s09,
  s10,
  s11,
  s12,
  s13,
  s14,
  s15,
  s16,
  s17,
  s18,
  s19,
  s20,
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
