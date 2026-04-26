// components/shared/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LogOut, X } from 'lucide-react';

export default function Sidebar({ items, role, isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay backdrop on mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay open"
          onClick={onClose}
        />
      )}

      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px var(--accent-glow)',
              flexShrink: 0
            }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, lineHeight: 1, letterSpacing: '-0.02em' }}>FlowDesk</p>
              <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1, textTransform: 'capitalize' }}>{role} Portal</p>
            </div>
            {/* Close button — only visible on mobile */}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{ display: 'none', color: 'var(--text-muted)', flexShrink: 0 }}
              id="sidebar-close-btn"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.09em',
            padding: '8px 4px 6px', marginBottom: 2
          }}>
            Navigation
          </p>
          {items.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Sign out */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-secondary)', fontSize: 13, padding: '8px 10px' }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}