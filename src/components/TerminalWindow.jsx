/** Mock terminal window: title bar with red/yellow/green dots, monospace body. Theme-aware via CSS vars. */
export default function TerminalWindow({ title = 'maxwell — bash — 80x24', className = '', children }) {
  return (
    <div className={`tw ${className}`.trim()}>
      <div className="tw__bar">
        <span className="tw__dots" aria-hidden>
          <i className="tw__dot tw__dot--red" />
          <i className="tw__dot tw__dot--yellow" />
          <i className="tw__dot tw__dot--green" />
        </span>
        <span className="tw__title">{title}</span>
      </div>
      <div className="tw__body">{children}</div>
    </div>
  );
}

export function Prompt({ children }) {
  return (
    <div className="tw__cmd">
      <span className="tw__prompt">$</span> {children}
    </div>
  );
}

/** Loosely syntax-highlighted JSON for flat objects of strings / numbers / string arrays. */
export function JsonBlock({ data }) {
  const entries = Object.entries(data);
  const val = (v) =>
    Array.isArray(v) ? (
      <>
        [
        {v.map((x, i) => (
          <span key={i}>
            <span className="tw-str">"{x}"</span>
            {i < v.length - 1 ? ', ' : ''}
          </span>
        ))}
        ]
      </>
    ) : typeof v === 'number' ? (
      <span className="tw-num">{v}</span>
    ) : (
      <span className="tw-str">"{v}"</span>
    );
  return (
    <div className="tw__json">
      <div>{'{'}</div>
      {entries.map(([k, v], i) => (
        <div key={k} className="tw__json-line">
          <span className="tw-key">"{k}"</span>: {val(v)}
          {i < entries.length - 1 ? ',' : ''}
        </div>
      ))}
      <div>{'}'}</div>
    </div>
  );
}
