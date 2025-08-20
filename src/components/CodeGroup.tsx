import React from 'react';
import CodeBlock from './CodeBlock';
import styles from './codegroup.module.css';

export type CodeItem = {
  id: string;
  code: string;
  lang?: string;
  filename?: string;
  title?: string;
};

type Props = { items: CodeItem[] };

export default function CodeGroup({ items }: Props) {
  const [active, setActive] = React.useState(0);
  return (
    <div className={styles.group}>
      <div className={styles.tabs}>
        {items.map((it, i) => (
          <button
            key={it.id}
            className={i === active ? styles.tabActive : styles.tab}
            onClick={() => setActive(i)}
            title={it.filename || it.title || it.lang || `Tab ${i+1}`}
          >
            {it.filename || it.title || it.lang || `Tab ${i+1}`}
          </button>
        ))}
      </div>
      <CodeBlock
        code={items[active].code}
        lang={items[active].lang}
        filename={items[active].filename}
        title={items[active].title}
      />
    </div>
  );
}
