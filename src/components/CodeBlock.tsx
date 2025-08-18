import React from 'react';
import { shiki } from '../lib/shiki';
import copy from 'copy-to-clipboard';
import { clsx } from 'clsx';
import { Copy, Edit } from 'lucide-react';
import styles from './codeblock.module.css';

type Props = {
  code: string;
  lang?: string;
  filename?: string;
  title?: string;
  collapsible?: boolean;
  showLineNumbers?: boolean;
  isDiff?: boolean;
};

export default function CodeBlock({
  code,
  lang,
  filename,
  title,
  collapsible = true,
  showLineNumbers = true,
  isDiff = false
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [html, setHtml] = React.useState<string>('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hi = await shiki();
        const theme = window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'github-dark' : 'github-light';

        // Try to use the specified language, fallback to 'text' if not supported
        let tokens;
        try {
          tokens = hi.codeToTokens(code, {
            lang: lang || 'text',
            theme: theme
          });
        } catch (langError) {
          console.warn(`Language '${lang}' not supported, falling back to 'text'`);
          tokens = hi.codeToTokens(code, {
            lang: 'text',
            theme: theme
          });
        }

        const lines = tokens.map((line: any[], i: number) => {
          const lineHtml = line.map((t) =>
            `<span style="color:${t.color}">${escapeHtml(t.content)}</span>`
          ).join('');
          const ln = showLineNumbers ? `<span class="ln">${i + 1}</span>` : '';
          return `<div class="line">${ln}<code>${lineHtml}</code></div>`;
        }).join('');

        const diffClass = isDiff || lang === 'diff' ? ' diff' : '';
        const out = `<pre class="shiki${diffClass}">${lines}</pre>`;
        if (mounted) setHtml(out);
      } catch (error) {
        console.error('Error highlighting code:', error);
        // Fallback to plain text
        const lines = code.split('\n').map((line, i) => {
          const ln = showLineNumbers ? `<span class="ln">${i + 1}</span>` : '';
          return `<div class="line">${ln}<code>${escapeHtml(line)}</code></div>`;
        }).join('');
        const out = `<pre class="shiki">${lines}</pre>`;
        if (mounted) setHtml(out);
      }
    })();
    return () => { mounted = false; };
  }, [code, lang, showLineNumbers, isDiff]);

  // re-highlight on theme change
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setHtml((h) => h ? '' : ''); // trigger rerun of effect above
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const languageLabel = lang ? lang.toLowerCase() : 'text';
  const needsCollapse = collapsible && countLines(code) > 30;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.languageLabel}>{languageLabel}</span>
        <div className={styles.spacer} />
        <button
          className={styles.iconButton}
          onClick={() => copy(code)}
          aria-label="Copy code"
          title="Copy code"
        >
          <Copy size={16} />
        </button>
        <button
          className={styles.iconButton}
          onClick={() => downloadFile(filename || `snippet.${lang || 'txt'}`, code)}
          aria-label="Edit code"
          title="Edit code"
        >
          <Edit size={16} />
        </button>
      </div>

      <div
        className={clsx(styles.body, needsCollapse && !expanded && styles.collapsed)}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {needsCollapse && (
        <button className={styles.toggle} onClick={() => setExpanded(v => !v)}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      )}
    </div>
  );
}

function countLines(s: string) {
  return (s.match(/\n/g)?.length || 0) + 1;
}
function escapeHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
