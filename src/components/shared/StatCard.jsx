import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const palette = {
  purple:  '#6366f1',
  teal:    '#14b8a6',
  amber:   '#f59e0b',
  emerald: '#10b981',
  rose:    '#f43f5e',
};

const R = 14, CX = 19, CY = 19, CIRC = 2 * Math.PI * R;

/* ── Animated count-up ── */
function useCountUp(value, active) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!active) return;
    const m = String(value).match(/^([^0-9]*)([0-9][0-9,.]*)(.*)$/);
    if (!m) { setDisplay(value); return; }
    const [, pre, ns, suf] = m;
    const num = parseFloat(ns.replace(/,/g, ''));
    if (isNaN(num)) { setDisplay(value); return; }
    const dec = ns.includes('.') ? ns.split('.')[1].length : 0;
    const dur = 1100, t0 = performance.now();
    let raf;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      const v = num * e;
      const f = num >= 1000
        ? Math.round(v).toLocaleString()
        : dec ? v.toFixed(dec) : Math.round(v).toString();
      setDisplay(pre + f + suf);
      if (p < 1) raf = requestAnimationFrame(tick);
    })(performance.now());
    return () => cancelAnimationFrame(raf);
  }, [value, active]);

  return display;
}

/* ── Ring progress — scalable ── */
function Ring({ pct, color, active, small = false }) {
  const r  = small ? 10 : R;
  const cx = small ? 14 : CX;
  const cy = small ? 14 : CY;
  const c  = 2 * Math.PI * r;
  const on = c * (pct / 100);
  const dim = small ? 28 : 38;

  return (
    <svg
      width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}
      style={{ transform: 'rotate(-90deg)', flexShrink: 0, marginTop: 2 }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border-tertiary)" strokeWidth="3" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={active ? c - on : c}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)' }}
      />
    </svg>
  );
}

/* ── Breakpoint hook ── */
function useBreakpoint() {
  const get = () => {
    const w = window.innerWidth;
    if (w < 360) return 'xs';
    if (w < 480) return 'sm';
    if (w < 768) return 'md';
    return 'lg';
  };
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const fn = () => setBp(get());
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return bp;
}

/* ── Main card ── */
export default function StatCard({
  label,
  value,
  colorKey = 'purple',
  change,
  sub,
  raw = 0,
  max = 100,
  index = 0,
}) {
  const color = palette[colorKey] || palette.purple;
  const pct   = Math.min(Math.round((raw / max) * 100), 100);
  const pos   = change >= 0;
  const bp    = useBreakpoint();

  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setActive(true), index * 80 + 180);
    return () => clearTimeout(timerRef.current);
  }, [index]);

  const displayed = useCountUp(value, active);

  // Sizing tokens per breakpoint
  const tokens = {
    xs: { height: 100, padding: 10, valueSz: 20, labelSz: 8,   badgeSz: 9,  subSz: 7.5,  letterSp: '-0.5px', radius: 10, smallRing: true,  hideSub: false },
    sm: { height: 116, padding: 12, valueSz: 22, labelSz: 8.5, badgeSz: 9,  subSz: 8,    letterSp: '-1px',   radius: 11, smallRing: true,  hideSub: false },
    md: { height: 130, padding: 14, valueSz: 26, labelSz: 9.5, badgeSz: 10, subSz: 9,    letterSp: '-1.5px', radius: 13, smallRing: true,  hideSub: false },
    lg: { height: 168, padding: 18, valueSz: 36, labelSz: 10,  badgeSz: 11, subSz: 9.5,  letterSp: '-2px',   radius: 16, smallRing: false, hideSub: false },
  };
  const t = tokens[bp];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.025 }}
      onHoverStart={e => e.currentTarget.style.boxShadow = `0 20px 48px -10px ${color}44`}
      onHoverEnd={e   => e.currentTarget.style.boxShadow = 'none'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radius,
        height: t.height,
        cursor: 'default',
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: color,
        transformOrigin: 'left',
        transform: active ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.9s cubic-bezier(.22,1,.36,1) 0.1s',
      }} />

      {/* Liquid fill */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: active ? `${pct}%` : '0%',
        background: color,
        opacity: 0.09,
        borderRadius: '0 0 16px 16px',
        transition: 'height 1.3s cubic-bezier(.22,1,.36,1)',
      }} />

      {/* Shimmer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.055) 50%,transparent 70%)',
        backgroundSize: '200% 100%',
        animation: 'statcard-shim 2.6s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: t.padding,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>

        {/* Top row: label + value + ring */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: t.labelSz,
              fontWeight: 700,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              marginBottom: bp === 'xs' ? 4 : 8,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {label}
            </div>
            <div style={{
              fontSize: t.valueSz,
              fontWeight: 900,
              letterSpacing: t.letterSp,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-text-primary)',
              opacity: active ? 1 : 0,
              transform: active ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.5s ease 0.35s, transform 0.5s cubic-bezier(.22,1,.36,1) 0.35s',
              whiteSpace: 'nowrap',
            }}>
              {displayed}
            </div>
          </div>

          <Ring pct={pct} color={color} active={active} small={t.smallRing} />
        </div>

        {/* Bottom row: change badge + pulse dot + sub */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          {change !== undefined && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: t.badgeSz,
              fontWeight: 800,
              padding: bp === 'xs' ? '2px 6px' : '3px 8px',
              borderRadius: 4,
              background: pos ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: pos ? '#059669' : '#e11d48',
              opacity: active ? 1 : 0,
              transform: active ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 0.4s ease 0.65s, transform 0.4s ease 0.65s',
              flexShrink: 0,
            }}>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                {pos
                  ? <path d="M4.5 7.5V1.5M4.5 1.5L2 4M4.5 1.5L7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M4.5 1.5V7.5M4.5 7.5L2 5M4.5 7.5L7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                }
              </svg>
              {pos ? '+' : ''}{change}%
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              width: bp === 'xs' ? 6 : 7,
              height: bp === 'xs' ? 6 : 7,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
              animation: 'statcard-pulse 1.5s ease-in-out infinite',
            }} />
            {sub && !t.hideSub && (
              <div style={{
                fontSize: t.subSz,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {sub}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes statcard-shim {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes statcard-pulse {
          0%, 100% { opacity: 1; transform: scale(1) }
          50%       { opacity: .25; transform: scale(.65) }
        }
      `}</style>
    </motion.div>
  );
}

/*
  ── Props ──────────────────────────────────────────────────
  label    string   Card title, e.g. "Total Revenue"
  value    string   Displayed value, e.g. "$128,450" or "4.87%"
  raw      number   Numeric value for count-up & fill, e.g. 128450
  max      number   Maximum for % fill & ring, e.g. 200000
  colorKey string   'purple' | 'teal' | 'amber' | 'emerald' | 'rose'
  change   number   % change, positive = green up, negative = red down
  sub      string   Small label, e.g. "vs last month"
  index    number   Stagger index (0, 1, 2…)

  ── Responsive grid usage ───────────────────────────────────
  Use auto-fit so the grid naturally reflows at every screen width:

  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  }}>
    <StatCard label="Total Revenue" value="$128,450" raw={128450} max={200000} colorKey="purple"  change={12.4}  sub="vs last month"  index={0} />
    <StatCard label="Active Users"  value="34,210"   raw={34210}  max={50000}  colorKey="teal"    change={8.1}   sub="monthly active" index={1} />
    <StatCard label="Conversion"    value="4.87%"    raw={4.87}   max={10}     colorKey="amber"   change={-1.3}  sub="7-day avg"      index={2} />
    <StatCard label="Satisfaction"  value="96.2%"    raw={96.2}   max={100}    colorKey="emerald" change={3.5}   sub="NPS score"      index={3} />
    <StatCard label="Churn Rate"    value="1.4%"     raw={1.4}    max={5}      colorKey="rose"    change={-0.6}  sub="below target"   index={4} />
  </div>

  ── Internal breakpoints ────────────────────────────────────
  lg  (≥768px)  height 168 · value 36px · ring 38px · sub 9.5px
  md  (≥480px)  height 130 · value 26px · ring 28px · sub 9px
  sm  (≥360px)  height 116 · value 22px · ring 28px · sub 8px
  xs  (<360px)  height 100 · value 20px · ring 28px · sub 7.5px
*/