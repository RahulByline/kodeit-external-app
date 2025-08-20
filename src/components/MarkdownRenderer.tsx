import React from 'react';
import CodeBlock from './CodeBlock';
import CodeGroup, { CodeItem } from './CodeGroup';
import { parseInfo } from '../lib/markdown/extractCodeGroups';

// Very lightweight parser for ``` fenced blocks with meta
const FENCE_RE = /```([^\n]*)\n([\s\S]*?)```/g;

function splitIntoGroups(md: string) {
  const items: { group?: string; meta: ReturnType<typeof parseInfo>; code: string }[] = [];
  let m;
  while ((m = FENCE_RE.exec(md))) {
    const meta = parseInfo(m[1]);
    items.push({ group: meta.group, meta, code: m[2] });
  }
  return items;
}

function groupBy<T>(arr: T[], key: (t: T) => string | undefined) {
  const map = new Map<string, T[]>();
  arr.forEach(it => {
    const k = key(it) || '';
    const bucket = map.get(k) || [];
    bucket.push(it);
    map.set(k, bucket);
  });
  return map;
}

export default function MarkdownRenderer({ markdown }: { markdown: string }) {
  const parsed = splitIntoGroups(markdown);
  if (!parsed.length) {
    return <div>{markdown}</div>; // fall back to raw text if no fences
  }

  const grouped = groupBy(parsed, x => x.group);
  const elements: React.ReactNode[] = [];
  let idx = 0;

  grouped.forEach((items, groupKey) => {
    if (groupKey) {
      const tabs: CodeItem[] = items.map((it, i) => ({
        id: `${groupKey}-${i}`,
        code: it.code,
        lang: it.meta.lang,
        filename: it.meta.filename,
        title: it.meta.title
      }));
      elements.push(<CodeGroup key={`g-${idx++}`} items={tabs} />);
    } else {
      items.forEach(it => {
        elements.push(
          <CodeBlock
            key={`c-${idx++}`}
            code={it.code}
            lang={it.meta.lang}
            filename={it.meta.filename}
            title={it.meta.title}
            isDiff={it.meta.lang === 'diff'}
          />
        );
      });
    }
  });

  return <div>{elements}</div>;
}
