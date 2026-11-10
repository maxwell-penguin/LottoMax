import { useEffect, useRef } from 'react';

// ── Tweakables (everything you'd want to tune lives here) ──────────────────
export const KOI = {
  // Entrance + approach, ms. Keep ≈ 1500: the CSS orbit starts spinning at 34% of 4.4s.
  ENTRANCE_MS: 1500,
  EASE_POWER: 2.5, // higher = longer, gentler deceleration
  START_Y_OFFSET: 12, // svg units; left fish starts this far above center, right fish mirrors below
  DRIFT_PX: 30, // vertical S-curve amplitude while swimming in
  DRIFT_WAVES: 1.25, // how many S-waves across the entrance
  // Undulation
  FREQ_CRUISE_HZ: 2.2,
  FREQ_CIRCLE_HZ: 1.3,
  AMP_HEAD: 0.025, // fraction of body length at the head
  AMP_TAIL: 0.175, // fraction of body length at the tail tip
  PHASE_SPREAD: 4.6, // radians of wave phase between head and tail
  CIRCLE_AMP_SCALE: 0.55, // undulation strength while circling (1 = same as cruising)
  TAIL_FLICK_RAD: 0.4, // extra tail-fin rotation
  TAIL_LAG_RAD: 0.9, // how far the tail fin lags the wave
  FIN_FLUTTER_RAD: 0.28,
  // Body
  SPINE_POINTS: 10,
  BODY_LEN: 144, // svg units (the 200-unit box is the circle's bounding square)
  MAX_WIDTH: 0.17, // fraction of body length, reached 1/3 of the way back from the head
  // Final circling pose: head angle on the ring, ring radius (svg units)
  RING_R: 69,
  HEAD_ANGLE_DEG: -50,
};

const { SPINE_POINTS: N, BODY_LEN: L } = KOI;
const TAU = Math.PI * 2;
const C = 100; // box center
const smooth = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

function widthAt(s) {
  const s1 = 1 / 3;
  const w =
    s < s1
      ? 0.55 + 0.45 * Math.sin((s / s1) * (Math.PI / 2))
      : 0.08 + 0.92 * Math.pow(Math.cos(((s - s1) / (1 - s1)) * (Math.PI / 2)), 1.1);
  return w * KOI.MAX_WIDTH * L;
}

// Closed Catmull-Rom → cubic Bézier path through the points.
function smoothClosed(p) {
  const n = p.length;
  let d = `M${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d}Z`;
}

const TAIL_D = `M${-0.03 * L} 0 C${0.05 * L} ${-0.07 * L} ${0.18 * L} ${-0.17 * L} ${0.3 * L} ${-0.15 * L} C${0.23 * L} ${-0.05 * L} ${0.23 * L} ${0.05 * L} ${0.3 * L} ${0.15 * L} C${0.18 * L} ${0.17 * L} ${0.05 * L} ${0.07 * L} ${-0.03 * L} 0Z`;
const PEC_D = `M0 0 C${0.04 * L} ${-0.045 * L} ${0.11 * L} ${-0.05 * L} ${0.16 * L} 0 C${0.11 * L} ${0.025 * L} ${0.04 * L} ${0.02 * L} 0 0Z`;

/**
 * One koi, drawn in the same 200-unit box as the circling orbit.
 * Entrance (swim in, head-first, S-curve) → approach (spine bends onto the ring)
 * → handoff to the pose the CSS orbit spins. The undulation never stops.
 * `variant="light"` is the dark fish's point-reflection about the center.
 */
export default function KoiFish({ variant }) {
  const svgRef = useRef(null);
  const body = useRef(null);
  const tail = useRef(null);
  const pecs = useRef([null, null]);
  const whiskers = useRef([null, null]);
  const spot = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // px per svg unit on screen: box size / 200, times the orbit's initial 1.12 scale
    const ppu = (svg.clientWidth / 200) * 1.12 || 1.5;
    const halfW = window.innerWidth / 2 / ppu;

    const R = KOI.RING_R;
    const th = (KOI.HEAD_ANGLE_DEG * Math.PI) / 180;
    const E = [R * Math.cos(th), R * Math.sin(th)]; // final head position, relative to center
    const phiEnd = th + Math.PI / 2; // clockwise travel direction on the ring
    const T = [Math.cos(phiEnd), Math.sin(phiEnd)];

    // Entrance path (relative to center): leaves horizontally from off-screen left,
    // arrives at E exactly along the ring's tangent.
    const P0 = [-halfW - 10, -KOI.START_Y_OFFSET];
    const P2 = [E[0] - T[0] * 45, E[1] - T[1] * 45];
    const P1 = [P0[0] + (P2[0] - P0[0]) * 0.55, P0[1]];
    const P3 = E;
    const drift = KOI.DRIFT_PX / ppu;

    const pathAt = (u) => {
      const m = 1 - u;
      const x = m * m * m * P0[0] + 3 * m * m * u * P1[0] + 3 * m * u * u * P2[0] + u * u * u * P3[0];
      const y = m * m * m * P0[1] + 3 * m * m * u * P1[1] + 3 * m * u * u * P2[1] + u * u * u * P3[1];
      const dx = 3 * m * m * (P1[0] - P0[0]) + 6 * m * u * (P2[0] - P1[0]) + 3 * u * u * (P3[0] - P2[0]);
      const dy = 3 * m * m * (P1[1] - P0[1]) + 6 * m * u * (P2[1] - P1[1]) + 3 * u * u * (P3[1] - P2[1]);
      // S-curve drift, fading out (value and slope) so the end pose is exact
      const a = TAU * KOI.DRIFT_WAVES;
      const env = m * m;
      const sn = Math.sin(a * u);
      const ddrift = drift * (a * Math.cos(a * u) * env - 2 * m * sn);
      return { x, y: y + drift * sn * env, heading: Math.atan2(dy + ddrift, dx) };
    };

    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let phase = 0;
    const set = (el, name, v) => el && el.setAttribute(name, v);

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const x = reduce ? 1 : Math.min(1, (now - t0) / KOI.ENTRANCE_MS);
      const u = 1 - Math.pow(1 - x, KOI.EASE_POWER);

      // head pose from the path (heading = direction of velocity)
      const p = pathAt(u);
      const bend = smooth((x - 0.4) / 0.6); // 0 = straight body, 1 = lies on the ring
      const kappa = bend / R;
      const amp = reduce ? 0.2 : lerp(1, KOI.CIRCLE_AMP_SCALE, bend);
      const freq = lerp(KOI.FREQ_CRUISE_HZ, KOI.FREQ_CIRCLE_HZ, bend);
      phase += TAU * freq * dt;

      // base spine: walk back from the head, curving by kappa
      const ds = L / (N - 1);
      const base = [[C + p.x, C + p.y]];
      let a = p.heading + Math.PI;
      for (let i = 1; i < N; i++) {
        const am = a - (kappa * ds) / 2;
        const prev = base[i - 1];
        base.push([prev[0] + ds * Math.cos(am), prev[1] + ds * Math.sin(am)]);
        a -= kappa * ds;
      }

      const normals = (pts) =>
        pts.map((_, i) => {
          const a0 = pts[Math.max(0, i - 1)];
          const a1 = pts[Math.min(N - 1, i + 1)];
          const tx = a1[0] - a0[0];
          const ty = a1[1] - a0[1];
          const len = Math.hypot(tx, ty) || 1;
          return [-ty / len, tx / len, tx / len, ty / len]; // nx, ny, tx, ty (toward tail)
        });

      // traveling wave, head steady → tail swishing
      const n0 = normals(base);
      const spine = base.map((pt, i) => {
        const s = i / (N - 1);
        const A = L * lerp(KOI.AMP_HEAD, KOI.AMP_TAIL, s * s) * amp;
        const off = A * Math.sin(phase - s * KOI.PHASE_SPREAD);
        return [pt[0] + n0[i][0] * off, pt[1] + n0[i][1] * off];
      });
      const nm = normals(spine);

      // outline: nose, left edge, right edge back up — one smooth closed path
      const left = [];
      const right = [];
      spine.forEach((pt, i) => {
        const w = widthAt(i / (N - 1)) / 2;
        left.push([pt[0] + nm[i][0] * w, pt[1] + nm[i][1] * w]);
        right.push([pt[0] - nm[i][0] * w, pt[1] - nm[i][1] * w]);
      });
      const nose = [spine[0][0] - nm[0][2] * 0.05 * L, spine[0][1] - nm[0][3] * 0.05 * L];
      set(body.current, 'd', smoothClosed([nose, ...left, ...right.reverse()]));

      // tail fin: follows the tail tangent, lags the wave, flicks
      const tailAng =
        Math.atan2(nm[N - 1][3], nm[N - 1][2]) +
        KOI.TAIL_FLICK_RAD * Math.sin(phase - KOI.PHASE_SPREAD - KOI.TAIL_LAG_RAD);
      const tp = spine[N - 1];
      set(tail.current, 'transform', `translate(${tp[0].toFixed(2)} ${tp[1].toFixed(2)}) rotate(${((tailAng * 180) / Math.PI).toFixed(2)})`);

      // pectoral fins, out of phase with the body
      const pi = Math.round((N - 1) / 3);
      const angTail = Math.atan2(nm[pi][3], nm[pi][2]);
      const wp = widthAt(pi / (N - 1)) / 2;
      [1, -1].forEach((side, k) => {
        const ang = angTail + side * 0.7 + KOI.FIN_FLUTTER_RAD * Math.sin(phase * 0.9 + Math.PI + k);
        const ax = spine[pi][0] + nm[pi][0] * wp * 0.85 * side;
        const ay = spine[pi][1] + nm[pi][1] * wp * 0.85 * side;
        set(pecs.current[k], 'transform', `translate(${ax.toFixed(2)} ${ay.toFixed(2)}) rotate(${((ang * 180) / Math.PI).toFixed(2)}) scale(1 ${side})`);
      });

      // barbels from the nose
      const fx = -nm[0][2];
      const fy = -nm[0][3];
      [1, -1].forEach((side, k) => {
        const bx = nose[0] + fx * 0.01 * L;
        const by = nose[1] + fy * 0.01 * L;
        const ex = bx + fx * 0.11 * L + nm[0][0] * side * 0.09 * L;
        const ey = by + fy * 0.11 * L + nm[0][1] * side * 0.09 * L;
        const cx = bx + fx * 0.07 * L + nm[0][0] * side * 0.01 * L;
        const cy = by + fy * 0.07 * L + nm[0][1] * side * 0.01 * L;
        set(whiskers.current[k], 'd', `M${bx.toFixed(2)} ${by.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`);
      });

      // yin-yang dot (the fish's eye) on the centerline behind the head
      set(spot.current, 'cx', spine[2][0].toFixed(2));
      set(spot.current, 'cy', spine[2][1].toFixed(2));

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className={`tl-koi tl-koi--${variant}`}>
      <svg ref={svgRef} viewBox="0 0 200 200" className="tl-koi__svg">
        <g transform={variant === 'light' ? 'rotate(180 100 100)' : undefined}>
          <path ref={tail} className="tl-koi__tail" d={TAIL_D} />
          <path ref={(el) => (pecs.current[0] = el)} className="tl-koi__fin tl-koi__fin--pectoral" d={PEC_D} />
          <path ref={(el) => (pecs.current[1] = el)} className="tl-koi__fin tl-koi__fin--pectoral" d={PEC_D} />
          <path ref={body} className="tl-koi__body" />
          <path ref={(el) => (whiskers.current[0] = el)} className="tl-koi__whisker" />
          <path ref={(el) => (whiskers.current[1] = el)} className="tl-koi__whisker" />
          <circle ref={spot} className="tl-koi__spot" r={0.046 * L} />
        </g>
      </svg>
    </span>
  );
}
