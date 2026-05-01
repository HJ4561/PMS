import { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, actions, onMenuClick, searchBar }) {
  const { unreadCount, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const initials =
    user?.u_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const colors = ['#6366f1', '#2dd4bf', '#f43f5e', '#f59e0b', '#10b981'];
  const avatarColor =
    user?.avatar_color || colors[(user?.u_id || 0) % colors.length] || '#6366f1';

  const handleNotificationClick = () => {
    if (user?.role === 'supervisor') {
      navigate('/supervisor/notifications');
    } else if (user?.role === 'lead') {
      navigate('/lead/notifications');
    } else {
      navigate('/notifications');
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="topbar">

      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="hamburger" onClick={onMenuClick}>
          <Menu size={18} />
        </button>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          {title}
        </h1>
      </div>

      {/* CENTER */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px'
      }}>
        {searchBar}
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {actions}

        {/* THEME */}
        <button onClick={toggle} className="btn btn-ghost btn-icon">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* NOTIFICATIONS */}
        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          onClick={handleNotificationClick}
        >
          <Bell size={17} />
          {unreadCount > 0 && <span className="notif-dot pulse" />}
        </button>

        {/* PROFILE */}
        <div ref={profileRef} style={{ position: 'relative' }}>

          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-hover)',
              cursor: 'pointer',
              height: 34
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: avatarColor + '25',
                color: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700
              }}
            >
              {initials}
            </div>

            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                {user?.u_name?.split(' ')[0]}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {user?.role}
              </div>
            </div>
          </div>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 42,
              width: 160,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 400
            }}>
              <div
                onClick={() => window.location.href = `/${user.role}/profile`}
                style={{ padding: 10, cursor: 'pointer', fontSize: 13 }}
              >
                Profile
              </div>
              <div
                onClick={() => {
                  logout?.();
                  window.location.href = "/login";
                }}
                style={{ padding: 10, cursor: 'pointer', fontSize: 13 }}
              >
                Logout
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}