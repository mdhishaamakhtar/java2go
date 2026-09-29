import type { Block, Part, Section, SectionContent, SectionLink } from '@/types/section';
import { getHeadings } from '@/lib/slug';

import mentalModel from './mental-model';
import packages from './packages';
import dependencyManagement from './dependency-management';
import types from './types';
import strings from './strings';
import structs from './structs';
import interfaces from './interfaces';
import pointers from './pointers';
import any from './any';
import collections from './collections';
import functions from './functions';
import defer from './defer';
import errors from './errors';
import blank from './blank';
import goroutines from './goroutines';
import channels from './channels';
import sync from './sync';
import goroutineMgmt from './goroutine-mgmt';
import context from './context';
import deferAdvanced from './defer-advanced';
import generics from './generics';
import iterators from './iterators';
import lifecycle from './lifecycle';
import project from './project';
import jsonHttp from './json-http';
import httpConcurrency from './http-concurrency';
import testing from './testing';
import logging from './logging';
import tooling from './tooling';
import gotchas from './gotchas';
import outro from './outro';

/**
 * The guide's reading order. Section numbers are derived from this order, so
 * inserting or moving a section renumbers everything after it automatically.
 */
const outline: { part: Part; sections: SectionContent[] }[] = [
  {
    part: {
      id: 'orientation',
      title: 'Orientation',
      description: 'The mindset shift, how code is organised, and how dependencies work.',
    },
    sections: [mentalModel, packages, dependencyManagement],
  },
  {
    part: {
      id: 'types-and-data',
      title: 'Types & Data',
      description: 'Zero values, structs, interfaces, pointers and the built-in collections.',
    },
    sections: [types, strings, structs, interfaces, pointers, any, collections],
  },
  {
    part: {
      id: 'functions-and-errors',
      title: 'Functions & Errors',
      description: 'Multiple returns, cleanup with defer, and errors as ordinary values.',
    },
    sections: [functions, defer, errors, blank],
  },
  {
    part: {
      id: 'concurrency',
      title: 'Concurrency',
      description: 'Goroutines, channels, locks, cancellation and the patterns that combine them.',
    },
    sections: [goroutines, channels, sync, goroutineMgmt, context, deferAdvanced],
  },
  {
    part: {
      id: 'abstraction',
      title: 'Generics & Iterators',
      description: 'Type parameters, constraints, and range-over-func iterators.',
    },
    sections: [generics, iterators],
  },
  {
    part: {
      id: 'building-services',
      title: 'Building Services',
      description: 'From main() to a tested, observable HTTP service you can ship.',
    },
    sections: [lifecycle, project, jsonHttp, httpConcurrency, testing, logging, tooling],
  },
  {
    part: {
      id: 'wrap-up',
      title: 'Wrap-up',
      description: 'The traps Java developers hit most, and the whole mapping on one page.',
    },
    sections: [gotchas, outro],
  },
];

export const parts: Part[] = outline.map(({ part }) => part);

const sections: Section[] = outline.flatMap(({ part, sections: contents }) =>
  contents.map((content) => ({ ...content, part, index: 0, number: '' })),
);
sections.forEach((section, index) => {
  section.index = index;
  section.number = String(index).padStart(2, '0');
});

validate(sections);

export default sections;

export function getSectionById(id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

export function getSectionNav(id: string): { prev?: Section; next?: Section } {
  const idx = sections.findIndex((s) => s.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? sections[idx - 1] : undefined,
    next: idx < sections.length - 1 ? sections[idx + 1] : undefined,
  };
}

export function getSectionsByPart(): { part: Part; sections: Section[] }[] {
  return parts.map((part) => ({
    part,
    sections: sections.filter((s) => s.part.id === part.id),
  }));
}

/** Minimal shape for client navigation components. */
export function getSectionLinks(): SectionLink[] {
  return sections.map(({ id, label, number, part }) => ({ id, label, number, partId: part.id }));
}

/** Rough reading time: prose at ~220 wpm, code at a slower ~110 wpm. */
export function getReadingMinutes(section: Section): number {
  let proseWords = 0;
  let codeWords = 0;
  const count = (text: string) => text.split(/\s+/).filter(Boolean).length;

  for (const block of section.blocks) {
    switch (block.type) {
      case 'compare':
        codeWords += count(block.java) + count(block.go);
        break;
      case 'codeblock':
        codeWords += count(block.code);
        break;
      case 'table':
        proseWords += block.rows.flat().reduce((n, cell) => n + count(cell), 0);
        break;
      case 'list':
        proseWords += block.items.reduce((n, item) => n + count(item), 0);
        break;
      case 'callout':
        proseWords += count(block.title) + count(block.text);
        break;
      default:
        proseWords += count(block.text);
    }
  }

  return Math.max(1, Math.round(proseWords / 220 + codeWords / 110));
}

// ─── Build-time validation ─────────────────────────────────────────────────
// Content mistakes should fail `next build` with a clear message instead of
// shipping a broken page or a dead link.

function textFields(block: Block): string[] {
  switch (block.type) {
    case 'compare':
      return [block.java, block.go];
    case 'codeblock':
      return [block.code];
    case 'table':
      return block.rows.flat();
    case 'list':
      return block.items;
    case 'callout':
      return [block.title, block.text];
    default:
      return [block.text];
  }
}

function validate(all: Section[]): void {
  const problems: string[] = [];
  const ids = new Set<string>();

  for (const section of all) {
    const where = `section "${section.id}"`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section.id)) {
      problems.push(`${where}: id must be kebab-case`);
    }
    if (ids.has(section.id)) problems.push(`${where}: duplicate id`);
    ids.add(section.id);
    if (!section.label.trim()) problems.push(`${where}: empty label`);
    if (!section.summary.trim()) problems.push(`${where}: empty summary`);
    if (section.blocks.length === 0) problems.push(`${where}: has no blocks`);

    section.blocks.forEach((block, i) => {
      if (textFields(block).some((field) => !field.trim())) {
        problems.push(`${where}, block ${i} (${block.type}): empty text or code`);
      }
      if (block.type === 'table') {
        const width = block.head?.length ?? block.rows[0]?.length ?? 0;
        if (!block.head && width !== 2) {
          problems.push(`${where}, block ${i}: tables without a head must have two columns`);
        }
        if (block.rows.length === 0 || block.rows.some((row) => row.length !== width)) {
          problems.push(`${where}, block ${i}: table rows must all have ${width} cells`);
        }
      }
    });
  }

  // Internal links must point at a real section (and anchor, if given).
  const linkPattern = /\]\((\/sections\/([a-z0-9-]+)(?:#([a-z0-9-]+))?)\)/g;
  for (const section of all) {
    for (const block of section.blocks) {
      if (block.type === 'compare' || block.type === 'codeblock') continue;
      for (const field of textFields(block)) {
        for (const [, href, targetId, anchor] of field.matchAll(linkPattern)) {
          const target = all.find((s) => s.id === targetId);
          if (!target) {
            problems.push(`section "${section.id}": link ${href} points to a missing section`);
          } else if (anchor && !getHeadings(target.blocks).some((h) => h.id === anchor)) {
            problems.push(`section "${section.id}": link ${href} points to a missing heading`);
          }
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid guide content:\n  - ${problems.join('\n  - ')}`);
  }
}
