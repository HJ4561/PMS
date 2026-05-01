import { motion, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const colorMap = {
  purple: {
    orb1: '#6366f1',
    orb2: '#818cf8',
    accent: '#6366f1',
    accentRgb: '99, 102, 241',
    shimmer: '#a5b4fc',
  },
  teal: {
    orb1: '#0d9488',
    orb2: '#2dd4bf',
    accent: '#14b8a6',
    accentRgb: '20, 184, 166',
    shimmer: '#5eead4',
  },
  amber: {
    orb1: '#d97706',
    orb2: '#fbbf24',
    accent: '#f59e0b',
    accentRgb: '245, 158, 11',
    shimmer: '#fde68a',
  },
  emerald: {
    orb1: '#059669',
    orb2: '#34d399',
    accent: '#10b981',
    accentRgb: '16, 185, 129',
    shimmer: '#6ee7b7',
  },
};

function AnimatedValue({ value }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));

    if (isNaN(num)) {
      setDisplay(value);
      return;
    }

    const ctrl = animate(0, num, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        setDisplay(Math.round(v).toLocaleString());
      },
    });

    return () => ctrl.stop();
  }, [value]);

  return <span>{display}</span>;
}

/* ================= BACKGROUND ================= */

function CrystalCanvas({ color }) {
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

    function draw() {
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      const ox1 = W * 0.3 + Math.sin(t * 0.6) * 40;
      const oy1 = H * 0.5 + Math.cos(t * 0.5) * 30;

      const g1 = ctx.createRadialGradient(ox1, oy1, 0, ox1, oy1, W * 0.5);
      g1.addColorStop(0, `${c.orb1}40`);
      g1.addColorStop(1, `${c.orb1}00`);
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const ox2 = W * 0.7 + Math.cos(t * 0.4) * 50;
      const oy2 = H * 0.4 + Math.sin(t * 0.5) * 40;

      const g2 = ctx.createRadialGradient(ox2, oy2, 0, ox2, oy2, W * 0.45);
      g2.addColorStop(0, `${c.orb2}35`);
      g2.addColorStop(1, `${c.orb2}00`);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [color]);

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
        opacity: 0.9,
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

  // 👉 NEW: navigation support
  to,
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const c = colorMap[colorKey] || colorMap.purple;
  const isPositive = change >= 0;

  return (
    <motion.div
      onClick={() => to && navigate(to)}
      className="stat-card-crystal"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 18,
        padding: 20,
        overflow: 'hidden',
        background: 'var(--stat-card-bg)',
        border: `1px solid rgba(${c.accentRgb}, 0.18)`,
        cursor: to ? 'pointer' : 'default',
      }}
    >
      <CrystalCanvas color={colorKey} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* TOP */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `rgba(${c.accentRgb},0.12)`,
            border: `1px solid rgba(${c.accentRgb},0.2)`
          }}>
            <Icon size={18} color={c.accent} />
          </div>

          {change !== undefined && (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',

      minWidth: 58,
      height: 24,
      padding: '0 10px',

      borderRadius: 999,

      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.2,

      lineHeight: 1,

      background: isPositive
        ? 'rgba(16,185,129,0.12)'
        : 'rgba(244,63,94,0.12)',

      color: isPositive ? '#10b981' : '#f43f5e',

      border: `1px solid ${
        isPositive
          ? 'rgba(16,185,129,0.25)'
          : 'rgba(244,63,94,0.25)'
      }`,

      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',

      gap: 4,
      boxSizing: 'border-box'
    }}
  >
    <span style={{ fontSize: 10, transform: 'translateY(-0.5px)' }}>
      {isPositive ? '▲' : '▼'}
    </span>

    <span style={{ display: 'flex', alignItems: 'center' }}>
      {Math.abs(change)}%
    </span>
  </div>
)}
        </div>

        {/* VALUE */}
        <div style={{
          fontSize: 26,
          fontWeight: 800,
          marginBottom: 2
        }}>
          <AnimatedValue value={value} />
        </div>

        {/* LABEL */}
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {label}
        </div>

        {/* SUB */}
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
