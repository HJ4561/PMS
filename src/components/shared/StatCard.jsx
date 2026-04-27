import { motion, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const colorMap = {
  purple: {
    orb1: '#6366f1',
    orb2: '#818cf8',
    accent: '#6366f1',
    accentRgb: '99, 102, 241',
    shimmer: '#a5b4fc',
    textAccent: '#818cf8',
  },
  teal: {
    orb1: '#0d9488',
    orb2: '#2dd4bf',
    accent: '#14b8a6',
    accentRgb: '20, 184, 166',
    shimmer: '#5eead4',
    textAccent: '#2dd4bf',
  },
  amber: {
    orb1: '#d97706',
    orb2: '#fbbf24',
    accent: '#f59e0b',
    accentRgb: '245, 158, 11',
    shimmer: '#fde68a',
    textAccent: '#fbbf24',
  },
  emerald: {
    orb1: '#059669',
    orb2: '#34d399',
    accent: '#10b981',
    accentRgb: '16, 185, 129',
    shimmer: '#6ee7b7',
    textAccent: '#34d399',
  },
  rose: {
    orb1: '#e11d48',
    orb2: '#fb7185',
    accent: '#f43f5e',
    accentRgb: '244, 63, 94',
    shimmer: '#fda4af',
    textAccent: '#fb7185',
  },
};

function AnimatedValue({ value }) {
  const [display, setDisplay] = useState('0');
  const numericMatch = String(value).match(/^([^\d]*)(\d[\d,.]*)(.*)$/);

  useEffect(() => {
    if (!numericMatch) {
      setDisplay(value);
      return;
    }

    const prefix = numericMatch[1];
    const numStr = numericMatch[2].replace(/,/g, '');
    const suffix = numericMatch[3];
    const num = parseFloat(numStr);

    if (isNaN(num)) {
      setDisplay(value);
      return;
    }

    const ctrl = animate(0, num, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        const formatted =
          num >= 1000
            ? Math.round(v).toLocaleString()
            : numStr.includes('.')
              ? v.toFixed(1)
              : Math.round(v).toString();

        setDisplay(`${prefix}${formatted}${suffix}`);
      },
    });

    return () => ctrl.stop();
  }, [value]);

  return <span>{display}</span>;
}

/* ================= CRYSTAL BACKGROUND ================= */

function CrystalCanvas({ color, hovered }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);

    const c = colorMap[color] || colorMap.purple;
    const speed = hovered ? 1.6 : 0.7;

    function draw() {
      timeRef.current += 0.016 * speed;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // ORB 1
      const ox1 = W * 0.25 + Math.sin(t * 0.7) * W * 0.18;
      const oy1 = H * 0.4 + Math.cos(t * 0.5) * H * 0.25;
      const g1 = ctx.createRadialGradient(ox1, oy1, 0, ox1, oy1, W * 0.45);
      g1.addColorStop(0, `${c.orb1}55`);
      g1.addColorStop(1, `${c.orb1}00`);
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // ORB 2
      const ox2 = W * 0.72 + Math.cos(t * 0.6) * W * 0.2;
      const oy2 = H * 0.55 + Math.sin(t * 0.45) * H * 0.28;
      const g2 = ctx.createRadialGradient(ox2, oy2, 0, ox2, oy2, W * 0.38);
      g2.addColorStop(0, `${c.orb2}44`);
      g2.addColorStop(1, `${c.orb2}00`);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // shimmer lines only (kept)
      for (let i = 0; i < 3; i++) {
        const lx = (((t * 0.3 + i * 0.33) % 1) * (W + 60)) - 30;
        const lg = ctx.createLinearGradient(lx - 20, 0, lx + 20, 0);
        lg.addColorStop(0, `${c.shimmer}00`);
        lg.addColorStop(0.5, `${c.shimmer}18`);
        lg.addColorStop(1, `${c.shimmer}00`);
        ctx.fillStyle = lg;
        ctx.fillRect(lx - 20, 0, 40, H);
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [color, hovered]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ================= CARD ================= */

export default function StatCard({
  label,
  value,
  icon: Icon,
  colorKey = 'purple',
  change,
  sub,
  index = 0,
}) {
  const [hovered, setHovered] = useState(false);
  const c = colorMap[colorKey] || colorMap.purple;

  const isPositive = change >= 0;

  return (
    <motion.div
      className="stat-card-crystal"
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        padding: '20px',
        overflow: 'hidden',
        background: 'var(--stat-card-bg)',
        border: `1px solid rgba(${c.accentRgb}, 0.18)`,
      }}
    >
      <CrystalCanvas color={colorKey} hovered={hovered} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* top row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `rgba(${c.accentRgb},0.1)`,
            border: `1px solid rgba(${c.accentRgb},0.2)`
          }}>
            <Icon size={18} color={c.accent} />
          </div>

          {/* CLEAN BADGE (FIXED) */}
          {change !== undefined && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 999,
                background: isPositive
                  ? 'rgba(16,185,129,0.12)'
                  : 'rgba(244,63,94,0.12)',
                color: isPositive ? '#10b981' : '#f43f5e',
                border: `1px solid ${isPositive ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {isPositive ? '▲' : '▼'} {Math.abs(change)}%
            </div>
          )}
        </div>

        {/* value */}
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 4
        }}>
          <AnimatedValue value={value} />
        </div>

        {/* label */}
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {label}
        </div>

        {/* sub */}
        {sub && (
          <div style={{
            fontSize: 11,
            marginTop: 6,
            opacity: 0.6
          }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}