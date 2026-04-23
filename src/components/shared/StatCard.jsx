export default function StatCard({ label, value, icon: Icon, color = 'var(--accent-primary)', change, sub }) {
  return (
    <div className="card animate-fade-in" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, background: `${color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {change !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 500, color: change >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', background: change >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', padding: '3px 8px', borderRadius: 100 }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}