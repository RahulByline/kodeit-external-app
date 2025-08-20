import { visit } from 'unist-util-visit'; // reserved for future; not used directly

export type CodeMeta = {
  lang?: string;
  filename?: string;
  title?: string;
  group?: string;
  [k: string]: string | undefined;
};

// Parses: ```ts title="app.ts" filename="app.ts" group="ex1"
export function parseInfo(info?: string): CodeMeta {
  if (!info) return {};
  const [lang, ...rest] = info.trim().split(/\s+/);
  const meta: CodeMeta = { lang };
  const metaString = rest.join(' ');
  metaString.replace(/(\w+)=["']([^"']+)["']/g, (_, k, v) => {
    (meta as any)[k] = v;
    return '';
  });
  return meta;
}
