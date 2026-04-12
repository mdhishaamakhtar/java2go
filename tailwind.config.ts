import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-java': 'var(--bg-java)',
        'bg-java-header': 'var(--bg-java-header)',

        'border-dim': 'var(--border-dim)',
        'border-subtle': 'var(--border-subtle)',
        'border-java': 'var(--border-java)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',

        'accent-blue': 'var(--accent-blue)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-java': 'var(--accent-java)',

        'syn-keyword': 'var(--syn-keyword)',
        'syn-type': 'var(--syn-type)',
        'syn-string': 'var(--syn-string)',
        'syn-number': 'var(--syn-number)',
        'syn-comment': 'var(--syn-comment)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
