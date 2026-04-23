import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, actions }) {
  const { unreadCount, notifications, markNotifRead, markAllRead } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, flex: 1 }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ position: 'relative', color: unreadCount > 0 ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-dot pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="animate-scale-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>Notifications</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {unreadCount > 0 && <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={markAllRead}>Mark all read</button>}
                  <button className="btn btn-ghost btn-icon" onClick={() => setShowNotifs(false)}><X size={14} /></button>
                </div>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No notifications</p>
                ) : notifications.map(n => (
                  <div
                    key={n.n_id}
                    onClick={() => markNotifRead(n.n_id)}
                    style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: n.is_read ? 'transparent' : 'rgba(108,99,255,0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(108,99,255,0.05)'}
                  >
                    <div style={{ display: 'flex', gap: 10 }}>
                      {!n.is_read && <div style={{ width: 7, height: 7, background: 'var(--accent-primary)', borderRadius: '50%', flexShrink: 0, marginTop: 5 }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, lineHeight: 1.5, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.created_at}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showNotifs && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotifs(false)} />}
    </header>
  );
}