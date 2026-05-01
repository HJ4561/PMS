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
    <header className="topbar responsive-topbar">

      {/* LEFT */}
      <div className="topbar-left">
        <button className="hamburger" onClick={onMenuClick}>
          <Menu size={18} />
        </button>

        <h1 className="topbar-title">{title}</h1>
      </div>

      {/* CENTER */}
      <div className="topbar-center">
        {searchBar}
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        {actions}

        <button onClick={toggle} className="btn btn-ghost btn-icon">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          className="btn btn-ghost btn-icon notif-btn"
          onClick={handleNotificationClick}
        >
          <Bell size={17} />
          {unreadCount > 0 && <span className="notif-dot pulse" />}
        </button>

        {/* PROFILE */}
        <div ref={profileRef} className="profile-wrapper">

          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="profile-btn"
          >
            <div
              className="avatar-box"
              style={{
                background: avatarColor + '25',
                color: avatarColor
              }}
            >
              {initials}
            </div>

            <div className="profile-text">
              <div className="name">
                {user?.u_name?.split(' ')[0]}
              </div>
              <div className="role">
                {user?.role}
              </div>
            </div>
          </div>

          {showProfileMenu && (
            <div className="profile-menu">
              <div
                onClick={() => window.location.href = `/${user.role}/profile`}
              >
                Profile
              </div>
              <div
                onClick={() => {
                  logout?.();
                  window.location.href = "/login";
                }}
              >
                Logout
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        .responsive-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        /* LEFT */
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .topbar-title {
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
        }

        /* CENTER */
        .topbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 500px;
        }

        /* RIGHT */
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* PROFILE */
        .profile-wrapper {
          position: relative;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-hover);
          cursor: pointer;
          height: 34px;
        }

        .avatar-box {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .profile-text .name {
          font-size: 12px;
          font-weight: 600;
        }

        .profile-text .role {
          font-size: 10px;
          color: var(--text-muted);
        }

        .profile-menu {
          position: absolute;
          right: 0;
          top: 42px;
          width: 160px;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .profile-menu div {
          padding: 10px;
          font-size: 13px;
          cursor: pointer;
        }

        .profile-menu div:hover {
          background: var(--bg-secondary);
        }

        /* ================= MOBILE ================= */
        @media (max-width: 768px) {

          .topbar-center {
            display: none; /* hide search bar */
          }

          .topbar-title {
            font-size: 14px;
          }

          .profile-text {
            display: none; /* save space */
          }

          .profile-btn {
            padding: 4px;
          }
        }

        @media (max-width: 480px) {

          .responsive-topbar {
            padding: 8px 10px;
          }

          .topbar-right {
            gap: 6px;
          }

          .btn.btn-ghost.btn-icon {
            padding: 6px;
          }

          .hamburger {
            padding: 6px;
          }

          .profile-menu {
            width: 140px;
            right: -10px;
          }
        }

        @media (max-width: 360px) {

          .topbar-title {
            font-size: 12px;
          }

          .responsive-topbar {
            gap: 8px;
          }
        }
      `}</style>

    </header>
  );
}