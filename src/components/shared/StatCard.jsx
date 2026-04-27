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

/* ── Ring progress ── */
function Ring({ pct, color, active }) {
  const dashOn = CIRC * (pct / 100);
  return (
    <svg
      width="38" height="38" viewBox="0 0 38 38"
      style={{ transform: 'rotate(-90deg)', flexShrink: 0, marginTop: 2 }}
    >
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke="var(--color-border-tertiary)"
        strokeWidth="3"
      />
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={active ? CIRC - dashOn : CIRC}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)' }}
      />
    </svg>
  );
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
  const pct = Math.min(Math.round((raw / max) * 100), 100);
  const pos = change >= 0;

  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setActive(true), index * 80 + 180);
    return () => clearTimeout(timerRef.current);
  }, [index]);

  const displayed = useCountUp(value, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.025 }}
      onHoverStart={e => e.currentTarget.style.boxShadow = `0 20px 48px -10px ${color}44`}
      onHoverEnd={e => e.currentTarget.style.boxShadow = 'none'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
        height: 168,
        cursor: 'default',
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Accent bar — slides in from left */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: color,
        transformOrigin: 'left',
        transform: active ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.9s cubic-bezier(.22,1,.36,1) 0.1s',
      }} />

      {/* Liquid fill rising from bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: active ? `${pct}%` : '0%',
        background: color,
        opacity: 0.09,
        borderRadius: '0 0 16px 16px',
        transition: 'height 1.3s cubic-bezier(.22,1,.36,1)',
      }} />

      {/* Shimmer sweep */}
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
        padding: 18,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>

        {/* Top row: label + value + ring */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              {label}
            </div>
            <div style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: '-2px',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-text-primary)',
              opacity: active ? 1 : 0,
              transform: active ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.5s ease 0.35s, transform 0.5s cubic-bezier(.22,1,.36,1) 0.35s',
            }}>
              {displayed}
            </div>
          </div>

          <Ring pct={pct} color={color} active={active} />
        </div>

        {/* Bottom row: change badge + pulse dot + sub */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {change !== undefined && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
              background: pos ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: pos ? '#059669' : '#e11d48',
              opacity: active ? 1 : 0,
              transform: active ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 0.4s ease 0.65s, transform 0.4s ease 0.65s',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: color,
              animation: 'statcard-pulse 1.5s ease-in-out infinite',
            }} />
            {sub && (
              <div style={{
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
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

  ── Usage ──────────────────────────────────────────────────
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
    <StatCard label="Total Revenue" value="$128,450" raw={128450} max={200000} colorKey="purple"  change={12.4}  sub="vs last month"  index={0} />
    <StatCard label="Active Users"  value="34,210"   raw={34210}  max={50000}  colorKey="teal"    change={8.1}   sub="monthly active" index={1} />
    <StatCard label="Conversion"    value="4.87%"    raw={4.87}   max={10}     colorKey="amber"   change={-1.3}  sub="7-day avg"      index={2} />
    <StatCard label="Satisfaction"  value="96.2%"    raw={96.2}   max={100}    colorKey="emerald" change={3.5}   sub="NPS score"      index={3} />
    <StatCard label="Churn Rate"    value="1.4%"     raw={1.4}    max={5}      colorKey="rose"    change={-0.6}  sub="below target"   index={4} />
  </div>
*/