import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../styles/Guestbook.css';

// ponytail: tiny client-side blocklist; move server-side if abuse shows up.
const BLOCKLIST = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'nigg', 'fag', 'retard', 'whore', 'slut'];
const isProfane = (s) => {
  const t = s.toLowerCase().replace(/[^a-z]/g, '');
  return BLOCKLIST.some((w) => t.includes(w));
};

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ponytail: client-supplied IP (ipify) is spoofable; the 24h limit is a politeness
// check, not security. Falls back to a per-browser id if the lookup fails.
async function visitorHash() {
  let id;
  try {
    id = (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
  } catch {
    try {
      id = localStorage.getItem('gb_id') || crypto.randomUUID();
      localStorage.setItem('gb_id', id);
    } catch {
      id = 'unknown';
    }
  }
  return sha256(id);
}

const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function GuestbookPanel() {
  const [entries, setEntries] = useState([]);
  const [count, setCount] = useState(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('loading'); // loading | open | signed | already | offline
  const [error, setError] = useState('');
  const [newId, setNewId] = useState(null);

  useEffect(() => {
    try { sessionStorage.setItem('gb_nudge', '1'); } catch { /* ignore */ }
    if (!supabase) return setStatus('offline');
    (async () => {
      const [list, total, hash] = await Promise.all([
        supabase.from('guestbook_entries').select('id,name,created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('guestbook_entries').select('id', { count: 'exact', head: true }),
        visitorHash(),
      ]);
      setEntries((list.data ?? []).reverse());
      setCount(total.count ?? 0);
      const { data: signed } = await supabase.rpc('guestbook_has_signed', { p_ip_hash: hash });
      setStatus(signed ? 'already' : 'open');
    })();
  }, []);

  const stamp = async (e) => {
    e.preventDefault();
    const clean = name.trim().slice(0, 40);
    if (!clean || status !== 'open') return;
    if (isProfane(clean)) return setError('please keep it friendly');
    setError('');
    const { error: err } = await supabase
      .from('guestbook_entries')
      .insert({ name: clean, ip_hash: await visitorHash() });
    if (err) {
      if (err.message?.includes('rate_limited')) return setStatus('already');
      return setError('could not stamp the card, try again');
    }
    const id = `new-${Date.now()}`;
    setNewId(id);
    setEntries((prev) => [...prev, { id, name: clean, created_at: new Date().toISOString() }].slice(-20));
    setCount((c) => (c ?? 0) + 1);
    setName('');
    setStatus('signed');
  };

  return (
    <div className="tab-panel gb-page">
      <div className="gb-card">
        <div className="gb-card__tab" aria-hidden />
        <header className="gb-card__header">
          <div className="gb-card__label">Library Card</div>
          <div className="gb-card__owner">Maxwell Peng</div>
        </header>
        <div className="gb-cols"><span>Name</span><span>Date</span></div>
        <ul className="gb-rows">
          {entries.map((en) => (
            <motion.li
              key={en.id}
              className="gb-row"
              initial={en.id === newId ? { opacity: 0, y: 4 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <span className="gb-row__name">{en.name}</span>
              <span className="gb-row__date">{fmt(en.created_at)}</span>
            </motion.li>
          ))}
          {status === 'open' && (
            <li className="gb-row gb-row--hint">
              <span className="gb-row__name">you?</span>
              <span className="gb-row__date">today</span>
            </li>
          )}
        </ul>
        <div className="gb-input-area">
          {status === 'open' && (
            <form onSubmit={stamp} className="gb-form">
              <input
                className="gb-input"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                placeholder="sign the card..."
                aria-label="Your name"
              />
              <button type="submit" className="gb-stamp">stamp</button>
            </form>
          )}
          {status === 'signed' && <p className="gb-note">thanks for stopping by</p>}
          {status === 'already' && <p className="gb-note">you already signed today</p>}
          {status === 'offline' && <p className="gb-note">the card is out for repairs</p>}
          {error && <p className="gb-note gb-note--error">{error}</p>}
        </div>
        {count !== null && (
          <p className="gb-count">{count} {count === 1 ? 'reader' : 'readers'} checked out this book</p>
        )}
      </div>
    </div>
  );
}
