import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const colorMap = {
  purple: { accent: '#6366f1' },
  teal: { accent: '#14b8a6' },
  amber: { accent: '#f59e0b' },
  emerald: { accent: '#10b981' },
  rose: { accent: '#f43f5e' },
};

/* ================= VALUE ANIMATION ================= */

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

/* ================= CARD ================= */

export default function StatCard({
  label,
  value,
  icon: Icon,
  colorKey = 'purple',
  change,
  sub,
  index = 0,
  to,
}) {
  const navigate = useNavigate();
  const c = colorMap[colorKey] || colorMap.purple;
  const isPositive = change >= 0;

  return (
    <motion.div
      onClick={() => to && navigate(to)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderRadius: 16,
        padding: 20,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        cursor: to ? 'pointer' : 'default',
      }}
    >
      {/* TOP */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 10
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)'
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
              background: isPositive
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(244,63,94,0.12)',
              color: isPositive ? '#10b981' : '#f43f5e',
              border: `1px solid ${
                isPositive
                  ? 'rgba(16,185,129,0.25)'
                  : 'rgba(244,63,94,0.25)'
              }`,
            }}
          >
            <span style={{ fontSize: 10 }}>
              {isPositive ? '▲' : '▼'}
            </span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {/* VALUE */}
      <div style={{
        fontSize: 26,
        fontWeight: 800,
        marginBottom: 2,
        color: c.accent   // ✅ ONLY value colored
      }}>
        <AnimatedValue value={value} />
      </div>

      {/* LABEL */}
      <div style={{
        fontSize: 12,
        color: 'var(--text-secondary)'
      }}>
        {label}
      </div>

      {/* SUB */}
      {sub && (
        <div style={{
          fontSize: 11,
          marginTop: 6,
          color: 'var(--text-muted)'
        }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}