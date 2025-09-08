import React from "react";

type Props = {
  items: { title: string; url: string; pages?: number[]; links?: string[] }[];
};

export default function SourcesList({ items }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <div className="sources-list">
      <span className="sources-title">Источники:</span>
      <span className="sources-links">
        {items.map((s, i) => (
          <React.Fragment key={i}>
            {s.pages && s.pages.length > 0 ? (
              s.pages.map((p, idx) => (
                <a
                  key={`${i}-${idx}`}
                  href={s.links?.[idx] || s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sources-link"
                  title={`${s.title} - стр. ${p}`}
                >
                  {s.title} (стр. {p})
                </a>
              ))
            ) : (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="sources-link"
                title={s.title}
              >
                {s.title}
              </a>
            )}
            {i < items.length - 1 && <span className="sources-separator">; </span>}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}
