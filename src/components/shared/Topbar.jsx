// components/shared/Topbar.jsx
import { useState } from 'react';
import { Bell, X, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ title, actions, onMenuClick }) {
  const { unreadCount, notifications, markNotifRead, markAllRead, user } = useAuth();
  const { theme, toggle } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);

  const initials = user?.u_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const colors = ['#6366f1', '#2dd4bf', '#f43f5e', '#f59e0b', '#10b981'];
  const avatarColor = user?.avatar_color || colors[(user?.u_id || 0) % colors.length] || '#6366f1';

  return (
    <header className="topbar">
      {/* Hamburger — shown on mobile via CSS */}
      <button
        className="hamburger"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 800,
        flex: 1,
        letterSpacing: '-0.01em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {actions}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="btn btn-ghost btn-icon"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          style={{ color: 'var(--text-secondary)' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ position: 'relative', color: unreadCount > 0 ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notif-dot pulse" />}
          </button>

          {showNotifs && (
            <div className="animate-scale-in" style={{
              position: 'fixed',
              right: 12,
              top: 62,
              width: 'min(348px, calc(100vw - 24px))',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 300,
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14 }}>Notifications</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {unreadCount > 0 && (
                    <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '3px 9px' }} onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                  <button className="btn btn-ghost btn-icon" onClick={() => setShowNotifs(false)}>
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</p>
                ) : notifications.map(n => (
                  <div
                    key={n.n_id}
                    onClick={() => markNotifRead(n.n_id)}
                    style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.05)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(99,102,241,0.05)'}
                  >
                    <div style={{ display: 'flex', gap: 9 }}>
                      {!n.is_read && (
                        <div style={{ width: 6, height: 6, background: 'var(--accent-primary)', borderRadius: '50%', flexShrink: 0, marginTop: 5 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{n.created_at}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar — hide name/role on very small screens */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 8px 5px 5px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-hover)',
          cursor: 'default'
        }}>
          <div
            className="avatar avatar-sm"
            style={{ background: avatarColor + '28', color: avatarColor, border: `1.5px solid ${avatarColor}45`, width: 30, height: 30, fontSize: 11 }}
          >
            {initials}
          </div>
          <div className="topbar-user-info">
            <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2, color: 'var(--text-primary)', display: 'block' }}>{user?.u_name?.split(' ')[0]}</span>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'capitalize', display: 'block' }}>{user?.role}</span>
          </div>
        </div>
      </div>

      {showNotifs && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setShowNotifs(false)} />
      )}
    </header>
  );
}