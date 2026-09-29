/** Languages the syntax highlighter is loaded with. */
export type CodeLang =
  'go' | 'java' | 'bash' | 'xml' | 'json' | 'yaml' | 'sql' | 'dockerfile' | 'properties' | 'text';

/** Semantic note styles. Each maps to a colour set in globals.css. */
export type NoteType = 'info' | 'java' | 'warn' | 'tip' | 'engine' | 'why';

/** Accent tone for callouts. `go` = cyan, `java` = amber, `info` = blue. */
export type Tone = 'go' | 'java' | 'info' | 'engine' | 'warn';

/**
 * Content blocks. Text fields support a small inline syntax:
 * `code`, **bold**, [link text](/sections/id or https://…), and blank lines
 * for paragraph breaks.
 */
export type Block =
  | { type: 'prose'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | {
      type: 'compare';
      java: string;
      go: string;
      javaLabel?: string;
      goLabel?: string;
      /** Override highlighting, e.g. `xml` for a pom.xml snippet. */
      javaLang?: CodeLang;
      goLang?: CodeLang;
    }
  | { type: 'codeblock'; code: string; lang: CodeLang; label?: string }
  | { type: 'note'; noteType: NoteType; text: string }
  | { type: 'callout'; title: string; text: string; tone?: Tone }
  | { type: 'why'; text: string }
  | {
      type: 'table';
      rows: string[][];
      /** Column headings. A two-column table without one gets Java | Go. */
      head?: string[];
    };

/** What a section file exports. Numbering and parts are assigned in `data/sections/index.ts`. */
export interface SectionContent {
  /** URL segment: /sections/{id}. Changing it breaks inbound links. */
  id: string;
  /** Display title. */
  label: string;
  /** One or two sentences; used for meta descriptions, the home page and search. */
  summary: string;
  blocks: Block[];
}

export interface Part {
  id: string;
  title: string;
  description: string;
}

export interface Section extends SectionContent {
  /** Zero-based position in the guide. */
  index: number;
  /** Two-digit display number, e.g. `07`. */
  number: string;
  part: Part;
}

export type SectionLink = Pick<Section, 'id' | 'label' | 'number'> & { partId: string };

export interface SectionHeading {
  id: string;
  text: string;
  level: 2 | 3;
}
