import React from 'react';

/** Compact list of source links shown under each object's facts. */
export function SourceList({ sources, className = '' }: { sources: string[]; className?: string }) {
  return (
    <p className={`text-[10px] font-mono text-cosmos-muted leading-relaxed ${className}`}>
      <span className="uppercase tracking-[0.2em] mr-1">Sources</span>
      {sources.map((url, i) => {
        let host = url;
        try {
          const u = new URL(url);
          host = u.hostname.replace('www.', '') + u.pathname.replace(/\/$/, '');
        } catch {
          /* keep raw */
        }
        return (
          <React.Fragment key={url}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-cosmos-cyan break-all">
              {host}
            </a>
          </React.Fragment>
        );
      })}
    </p>
  );
}
