// components/shared/StatCard.jsx
export default function StatCard({ label, value, icon: Icon, colorKey = 'purple', change, sub }) {
  // colorKey: 'purple' | 'teal' | 'amber' | 'emerald' | 'rose'
  return (
    <div className={`stat-card ${colorKey}`}>
      {change !== undefined && (
        <span className={`stat-change ${change >= 0 ? 'pos' : 'neg'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      )}
      <div className={`stat-icon ${colorKey}`}>
        <Icon size={19} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}