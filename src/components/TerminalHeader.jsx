import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { aboutData } from '@/data/content';

const THEME_LABEL = {
  light: 'Switch to dark mode',
  dark: 'Hollow Purple',
  purple: 'Switch to light mode',
};

const MAX_ENTRIES = 20;
const ALIASES = { experiences: 'experience' }; // old route name

const HELP = [
  'available commands:',
  '  cd <section>     go to a section (about, experience, projects, resume, contact)',
  '  ls               list sections',
  '  cat about.json   preview about info',
  '  whoami           who is this',
  '  clear            clear this output',
  '  help             show this list',
];

/**
 * Persistent header: a real terminal prompt (text input) + classic nav tabs + theme toggle.
 * Output renders in a panel under the prompt (overlay, so page content never shifts) and is
 * cleared by `clear` or by navigating.
 */
export default function TerminalHeader({ nav, path, theme, toggleTheme, navigate }) {
  const [value, setValue] = useState('');
  const [entries, setEntries] = useState([]); // { cmd, lines: [{ text, muted }] }
  const history = useRef([]);
  const cursor = useRef(-1); // -1 = not browsing history
  const inputRef = useRef(null);

  // navigating away dismisses output
  useEffect(() => setEntries([]), [path]);

  // typing anywhere (outside other inputs / dialogs) focuses the prompt
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1 || e.key === ' ') return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.closest('input, textarea, select') || t.isContentEditable)) return;
      if (document.querySelector('.cover-stage, .xc-overlay, .fixed.inset-0.z-50')) return;
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const names = nav.map((n) => n.path);

  const run = (raw) => {
    const [cmd, ...args] = raw.split(/\s+/);
    const out = (lines) => lines.map((t) => (typeof t === 'string' ? { text: t } : t));

    switch (cmd) {
      case 'cd': {
        const arg = (args[0] ?? '~').replace(/^~\/?/, '').replace(/^\/+|\/+$/g, '');
        const target = ALIASES[arg] ?? (arg === '' ? names[0] : arg);
        if (names.includes(target)) {
          setEntries([]);
          navigate(`/${target}`);
          return null;
        }
        return out([{ text: `cd: no such directory: ${args[0]}`, muted: true }]);
      }
      case 'ls':
        return out([names.join('  ')]);
      case 'cat':
        if (!args[0]) return out([{ text: 'cat: missing file operand', muted: true }]);
        if (args[0] !== 'about.json') {
          return out([{ text: `cat: ${args[0]}: no such file`, muted: true }]);
        }
        return out(
          JSON.stringify(
            {
              name: aboutData.name,
              currently: aboutData.aboutCurrently,
              open_to: aboutData.aboutAvailability,
              building: aboutData.aboutCurrentlyBuilding.name,
              links: { github: aboutData.github, linkedin: aboutData.linkedin },
            },
            null,
            2,
          ).split('\n'),
        );
      case 'whoami':
        return out([`${aboutData.name}: builder, founder, student. Currently ${aboutData.aboutCurrently}.`]);
      case 'help':
        return out(HELP);
      case 'clear':
        setEntries([]);
        return null;
      default:
        return out([{ text: `command not found: ${raw}`, muted: true }]);
    }
  };

  const submit = () => {
    const raw = value.trim();
    setValue('');
    cursor.current = -1;
    if (!raw) return;
    if (history.current[history.current.length - 1] !== raw) history.current.push(raw);
    const lines = run(raw);
    if (lines) setEntries((prev) => [...prev, { cmd: raw, lines }].slice(-MAX_ENTRIES));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      cursor.current = cursor.current === -1 ? h.length - 1 : Math.max(0, cursor.current - 1);
      setValue(h[cursor.current]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const h = history.current;
      if (cursor.current === -1) return;
      if (cursor.current >= h.length - 1) {
        cursor.current = -1;
        setValue('');
      } else {
        cursor.current += 1;
        setValue(h[cursor.current]);
      }
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  return (
    <header className="term-header">
      <label className="term__prompt" onClick={() => inputRef.current?.focus()}>
        <span className="term__user">visitor@maxwellpeng</span>
        <span className="term__sep">:~$</span>
        <input
          ref={inputRef}
          className="term__input"
          style={{ width: `${Math.max(1, value.length)}ch` }}
          value={value}
          onChange={(e) => {
            cursor.current = -1;
            setValue(e.target.value);
          }}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Terminal prompt: type a command, try help"
        />
        <span className="term__cursor" aria-hidden>_</span>
      </label>

      <nav className="term__tabs" aria-label="Sections">
        {nav.map((n) => (
          <Link
            key={n.path}
            to={`/${n.path}`}
            className={`term__tab${path === `/${n.path}` ? ' is-active' : ''}`}
            aria-current={path === `/${n.path}` ? 'page' : undefined}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={toggleTheme}
        className="portfolio-social__link portfolio-theme-toggle term__theme"
        aria-label={THEME_LABEL[theme]}
        title={theme === 'dark' ? 'Hollow Purple' : undefined}
      >
        {/* shows the theme you'll get next: light -> moon, dark -> orb, purple -> sun */}
        {theme === 'light' ? <Moon size={18} /> : theme === 'dark' ? <span className="theme-orb" /> : <Sun size={18} />}
      </button>

      {entries.length > 0 && (
        <div className="term__out" role="log" aria-live="polite">
          {entries.map((en, i) => (
            <div key={i} className="term__entry">
              <div className="term__echo">$ {en.cmd}</div>
              {en.lines.map((l, j) => (
                <div key={j} className={l.muted ? 'term__line term__line--muted' : 'term__line'}>
                  {l.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
