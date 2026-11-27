import { supabase } from '@/lib/supabase';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Log one visit per browser session: coarse location + org from ipinfo, and a SHA-256 hash
 * of the IP (the raw IP is never stored). Silent by design; any failure is ignored.
 */
export async function logVisit() {
  const token = import.meta.env.VITE_IPINFO_TOKEN;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (!supabase || !token || path.startsWith('/admin')) return;
  try {
    if (sessionStorage.getItem('visit_logged')) return;
    sessionStorage.setItem('visit_logged', '1'); // set first so StrictMode / re-renders can't double-log
  } catch {
    return; // no sessionStorage -> skip rather than log on every load
  }
  try {
    const res = await fetch(`https://ipinfo.io/json?token=${encodeURIComponent(token)}`);
    if (!res.ok) return;
    const d = await res.json();
    if (!d.ip) return;
    await supabase.from('site_visits').insert({
      ip_hash: await sha256(d.ip),
      city: d.city ?? null,
      region: d.region ?? null,
      country: d.country ?? null,
      org: d.org ? d.org.replace(/^AS\d+\s+/, '') : null, // "AS15169 Google LLC" -> "Google LLC"
      page: path === '/' ? '/about' : path, // '/' is the intro, which lands on About
      user_agent: navigator.userAgent.slice(0, 400),
    });
  } catch {
    /* analytics must never affect the site */
  }
}
