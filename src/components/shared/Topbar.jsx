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
    if (user?.role === 'supervisor') navigate('/supervisor/notifications');
    else if (user?.role === 'lead') navigate('/lead/notifications');
    else navigate('/notifications');
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
    <header className="tb-root">

      {/* LEFT: hamburger + title */}
      <div className="tb-left">
        <button className="tb-icon-btn tb-menu-btn" onClick={onMenuClick} aria-label="Menu">
          <Menu size={18} />
        </button>
        <h1 className="tb-title">{title}</h1>
      </div>

      {/* CENTER: search — hidden on mobile */}
      {searchBar && (
        <div className="tb-center">
          {searchBar}
        </div>
      )}

      {/* RIGHT: actions + theme + bell + avatar */}
      <div className="tb-right">
        {actions && <div className="tb-actions">{actions}</div>}

        <button className="tb-icon-btn" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="tb-icon-btn tb-notif" onClick={handleNotificationClick} aria-label="Notifications">
          <Bell size={16} />
          {unreadCount > 0 && <span className="tb-dot pulse" />}
        </button>

        {/* PROFILE */}
        <div ref={profileRef} className="tb-profile-wrap">
          <button
            className="tb-profile-btn"
            onClick={() => setShowProfileMenu(v => !v)}
            aria-label="Profile menu"
          >
            <div
              className="tb-avatar"
              style={{ background: avatarColor + '25', color: avatarColor }}
            >
              {initials}
            </div>
            <div className="tb-profile-text">
              <span className="tb-name">{user?.u_name?.split(' ')[0]}</span>
              <span className="tb-role">{user?.role}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="tb-menu">
              <div className="tb-menu-item" onClick={() => window.location.href = `/${user.role}/profile`}>
                Profile
              </div>
              <div className="tb-menu-item tb-menu-logout" onClick={() => { logout?.(); window.location.href = '/login'; }}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ── ROOT ── */
        .tb-root {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          height: 52px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          box-sizing: border-box;
          overflow: visible;
        }

        /* ── LEFT ── */
        .tb-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;          /* allow it to take available space */
  min-width: 0;     /* REQUIRED for ellipsis to work properly */
}
          

        .tb-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  max-width: 100%;   /* no fixed limit */
}
  /* Large screens (default) */
@media (min-width: 1024px) {
  .tb-title {
    font-size: 16px;
  }
}

/* Tablets */
@media (max-width: 1024px) {
  .tb-title {
    font-size: 15px;
  }
}

/* Small tablets */
@media (max-width: 768px) {
  .tb-title {
    font-size: 14px;
    max-width: 200px; /* controlled trimming */
  }
}

/* Mobile */
@media (max-width: 540px) {
  .tb-title {
    font-size: 13px;
    max-width: 140px;
  }
}

/* Very small devices */
@media (max-width: 360px) {
  .tb-title {
    font-size: 12px;
    max-width: 100px;
  }
}

        /* ── CENTER ── */
        .tb-center {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
        }

        .tb-center > * {
          width: 100%;
          max-width: 420px;
        }

        /* ── RIGHT ── */
        .tb-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

        .tb-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 768px) {
  .tb-title {
    max-width: 140px;
  }
}

@media (max-width: 480px) {
  .tb-title {
    max-width: 100px;
  }
}
        /* ── ICON BUTTONS ── */
        .tb-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.14s;
          padding: 0;
        }

        .tb-icon-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        /* ── NOTIFICATION DOT ── */
        .tb-notif {
          position: relative;
        }

        .tb-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f43f5e;
          border: 1.5px solid var(--bg-secondary);
        }

        /* ── PROFILE ── */
        .tb-profile-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .tb-profile-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 34px;
          padding: 0 8px 0 4px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          cursor: pointer;
          transition: border-color 0.14s;
          white-space: nowrap;
        }

        .tb-profile-btn:hover {
          border-color: var(--accent-primary);
        }

        .tb-avatar {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .tb-profile-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .tb-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tb-role {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        /* ── DROPDOWN MENU ── */
        .tb-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          width: 150px;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          overflow: hidden;
          z-index: 200;
        }

        .tb-menu-item {
          padding: 10px 14px;
          font-size: 13px;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.12s;
        }

        .tb-menu-item:hover {
          background: var(--bg-secondary);
        }

        .tb-menu-logout {
          color: #f43f5e;
          border-top: 1px solid var(--border-subtle);
        }

        /* ── RESPONSIVE ── */

        /* Tablet: hide search, keep everything else */
        @media (max-width: 768px) {
          .tb-center { display: none; }
          .tb-title { max-width: 120px; font-size: 14px; }
        }

        /* Small mobile: tighten gaps, hide profile text */
        @media (max-width: 540px) {
          .tb-root { padding: 0 10px; gap: 6px; }
          .tb-right { gap: 4px; }
          .tb-profile-text { display: none; }
          .tb-profile-btn { padding: 0 4px; gap: 0; }
          .tb-title { max-width: 100px; font-size: 13px; }
          .tb-icon-btn { width: 30px; height: 30px; }
        }

        /* Very small: further compress */
        @media (max-width: 360px) {
          .tb-root { padding: 0 8px; gap: 4px; }
          .tb-title { max-width: 80px; font-size: 12px; }
          .tb-icon-btn { width: 28px; height: 28px; border-radius: 7px; }
          .tb-profile-btn { height: 30px; }
          .tb-avatar { width: 22px; height: 22px; font-size: 9px; }
        }
          /* 🚫 Hide hamburger by default (desktop first approach) */
.tb-menu-btn {
  display: none !important;
}

/* ✅ Show only on small screens */
@media (max-width: 768px) {
  .tb-menu-btn {
    display: flex !important;
  }
}
      `}</style>
    </header>
  );
}