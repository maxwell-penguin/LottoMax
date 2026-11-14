import { useEffect, useRef } from 'react';
import { METEOR, WAVE_EASING, impactPoint } from '@/hooks/use-theme';

// One canvas, one rAF loop, clock started by the theme hook (`go` = performance.now() at start).
// Replaces the old stack of huge CSS layers (a 260vmax ring with blur/box-shadow was the lag).

const DEBRIS = [[-130, -70], [110, -110], [170, 30], [-90, 120], [30, 150], [-190, 20], [90, -170]];
const DIR = [Math.cos((-35 * Math.PI) / 180), Math.sin((-35 * Math.PI) / 180)]; // up-right

// cubic-bezier(x1,y1,x2,y2) easing, same curve the dark reveal uses
function bezier([x1, y1, x2, y2]) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  return (x) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const e = ((ax * t + bx) * t + cx) * t - x;
      const d = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(e) < 1e-4 || !d) break;
      t -= e / d;
    }
    return ((ay * t + by) * t + cy) * t;
  };
}
const waveEase = bezier(WAVE_EASING);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function MeteorImpact({ go }) {
  const ref = useRef(null);

  useEffect(() => {
    if (go == null) return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const P = impactPoint();
    const far = Math.max(W, H) * 0.95;
    const S = { x: P.x + DIR[0] * far, y: P.y + DIR[1] * far };
    const travel = { x: (P.x - S.x) / far, y: (P.y - S.y) / far }; // unit vector toward impact
    const Rmax = Math.hypot(Math.max(P.x, W - P.x), Math.max(P.y, H - P.y)) + 8;
    const flashR = Math.min(W, H) * 0.19;

    let raf = 0;
    const frame = (now) => {
      const t = now - go;
      ctx.clearRect(0, 0, W, H);

      // 1) meteor: accelerating fall
      if (t >= 0 && t < METEOR.FALL_MS) {
        const p = Math.pow(t / METEOR.FALL_MS, 2.2);
        const hx = S.x + (P.x - S.x) * p;
        const hy = S.y + (P.y - S.y) * p;
        const len = 70 + 190 * p;
        const tx = hx - travel.x * len;
        const ty = hy - travel.y * len;
        const g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, 'rgba(255,225,170,0.95)');
        g.addColorStop(0.4, 'rgba(255,150,70,0.5)');
        g.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 28);
        halo.addColorStop(0, 'rgba(255,210,140,0.9)');
        halo.addColorStop(1, 'rgba(255,140,60,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(hx, hy, 28, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#fff4dc';
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, 6.2832);
        ctx.fill();
      }

      // 2) flash: white-hot, point -> medium radius, ~110ms
      const f = (t - METEOR.FALL_MS) / METEOR.FLASH_MS;
      if (f >= 0 && f <= 1) {
        const r = Math.max(2, flashR * (1 - (1 - f) * (1 - f)));
        const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, r);
        g.addColorStop(0, `rgba(255,255,255,${1 - f})`);
        g.addColorStop(0.35, `rgba(255,240,212,${0.85 * (1 - f)})`);
        g.addColorStop(0.7, `rgba(255,170,90,${0.45 * (1 - f)})`);
        g.addColorStop(1, 'rgba(255,170,90,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(P.x, P.y, r, 0, 6.2832);
        ctx.fill();
      }

      // 3) shockwave ring — its edge is exactly the dark reveal's edge
      const u = (t - METEOR.WAVE_AT_MS) / METEOR.WAVE_MS;
      if (u >= 0 && u <= 1) {
        const r = Rmax * waveEase(u);
        const a = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
        ctx.lineWidth = 14;
        ctx.strokeStyle = `rgba(255,170,90,${0.16 * a})`;
        ctx.beginPath();
        ctx.arc(P.x, P.y, r, 0, 6.2832);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(255,238,215,${0.9 * a})`;
        ctx.beginPath();
        ctx.arc(P.x, P.y, r, 0, 6.2832);
        ctx.stroke();
      }

      // 4) debris thrown out on the shockwave frame
      const d = (t - METEOR.WAVE_AT_MS) / 450;
      if (d >= 0 && d <= 1) {
        const e = 1 - Math.pow(1 - d, 3);
        ctx.fillStyle = `rgba(255,217,160,${1 - d})`;
        for (const [dx, dy] of DEBRIS) {
          ctx.beginPath();
          ctx.arc(P.x + dx * e, P.y + dy * e, 2.5 * (1 - 0.7 * d), 0, 6.2832);
          ctx.fill();
        }
      }

      if (t < METEOR.TOTAL_MS) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [go]);

  return <canvas ref={ref} className="td-canvas" aria-hidden />;
}
