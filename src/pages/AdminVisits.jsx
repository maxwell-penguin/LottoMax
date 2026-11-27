import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../styles/Home.css';

// Residential / mobile / generic ISPs. Anything NOT matching is treated as a company worth a look.
const ISP =
  /comcast|xfinity|bell\b|rogers|telus|shaw|cogeco|videotron|eastlink|sasktel|verizon|at&t|spectrum|charter|cox\b|t-mobile|sprint|vodafone|orange|\bbt\b|british telecom|virgin|sky\b|talktalk|optimum|altice|centurylink|lumen|frontier|windstream|comcast|rcn|google fiber|starlink|telecom|telekom|telefonica|internet|broadband|cable|wireless|mobile|cellular|fibre|fiber/i;
const isCompany = (org) => !!org && !ISP.test(org);

const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminVisits() {
  const [pw, setPw] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [onlyCompanies, setOnlyCompanies] = useState(false);

  const unlock = async (e) => {
    e.preventDefault();
    if (!supabase) return setError('Supabase is not configured.');
    setBusy(true);
    setError('');
    // The password is checked inside the database (see supabase/schema.sql); it is never in this bundle.
    const { data, error: err } = await supabase.rpc('site_visits_admin', { p_password: pw, p_limit: 100 });
    setBusy(false);
    if (err) return setError(err.message.includes('unauthorized') ? 'wrong password' : 'could not load visits');
    setRows(data ?? []);
  };

  const shown = useMemo(
    () => (rows ?? []).filter((r) => !onlyCompanies || isCompany(r.org)),
    [rows, onlyCompanies],
  );

  if (!rows) {
    return (
      <main className="admin">
        <form className="admin__lock" onSubmit={unlock}>
          <label htmlFor="admin-pw">password</label>
          <input
            id="admin-pw"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="submit" disabled={busy || !pw}>unlock</button>
          {error && <p className="admin__err">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin">
      <header className="admin__head">
        <h1>site_visits</h1>
        <label className="admin__toggle">
          <input type="checkbox" checked={onlyCompanies} onChange={(e) => setOnlyCompanies(e.target.checked)} />
          companies only
        </label>
        <span className="admin__count">{shown.length} / {rows.length} (latest 100)</span>
      </header>
      <div className="admin__scroll">
        <table className="admin__table">
          <thead>
            <tr><th>when</th><th>where</th><th>org</th><th>page</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className={isCompany(r.org) ? 'is-company' : ''}>
                <td>{fmt(r.visited_at)}</td>
                <td>{[r.city, r.region, r.country].filter(Boolean).join(', ') || '—'}</td>
                <td>{r.org || '—'}</td>
                <td>{r.page}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={4} className="admin__empty">no visits</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
