import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LogOut, Bell } from 'lucide-react';

export default function Sidebar({ items, role }) {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.u_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const colors = ['#6c63ff', '#2dd4bf', '#f43f5e', '#fbbf24', '#10b981'];
  const avatarColor = user?.avatar_color || colors[user?.u_id % colors.length] || '#6c63ff';

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px var(--accent-glow)', flexShrink: 0 }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>FlowDesk</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 4px', marginBottom: 4 }}>Navigation</p>
        {items.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent-rose)', color: 'white', borderRadius: '100px', padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User section */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 'var(--radius-md)', marginBottom: 4 }}>
          <div className="avatar avatar-md" style={{ background: avatarColor + '30', color: avatarColor, border: `1px solid ${avatarColor}50` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.u_name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-secondary)', fontSize: 13, padding: '8px 8px' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </nav>
  );
}