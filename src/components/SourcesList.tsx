import React from "react";

type Props = {
  items: { title: string; url: string; pages?: number[]; links?: string[] }[];
};

export default function SourcesList({ items }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <div className="sources-list">
      <div className="sources-title">Источники</div>
      <ul className="sources-items">
        {items.map((s, i) => (
          <li key={i} className="sources-item">
            <div className="sources-item-title">{s.title}</div>
            {s.pages && s.pages.length > 0 ? (
              <div className="sources-pages">
                {s.pages.map((p, idx) => (
                  <a
                    key={idx}
                    href={s.links?.[idx] || s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="sources-page-link"
                    title={`Стр. ${p}`}
                  >
                    стр. {p}
                  </a>
                ))}
              </div>
            ) : (
              <a href={s.url} target="_blank" rel="noreferrer" className="sources-doc-link">
                открыть
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
