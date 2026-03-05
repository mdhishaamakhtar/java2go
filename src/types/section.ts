export type NoteType = 'info' | 'java' | 'warn' | 'tip' | 'engine' | 'why';

export type Block =
  | { type: 'prose'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'compare'; java: string; go: string; javaLabel?: string; goLabel?: string }
  | { type: 'codeblock'; code: string; lang: 'go' | 'java'; label?: string }
  | { type: 'note'; noteType: NoteType; text: string }
  | { type: 'callout'; title: string; text: string; color?: string }
  | { type: 'why'; text: string }
  | { type: 'table'; rows: [string, string][] };

export interface Section {
  id: string;
  title: string;
  label: string;
  blocks: Block[];
}
