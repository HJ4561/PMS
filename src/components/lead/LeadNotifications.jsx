import { useAuth } from '../../context/AuthContext';
import Topbar from '../shared/Topbar';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { EmptyState } from '../shared/UIComponents';

const typeColors = {
  project_update: '#6c63ff',
  task_complete: '#10b981',
  comment: '#2dd4bf',
  task_assigned: '#fbbf24',
  project_created: '#f43f5e'
};

export default function LeadNotifications() {

  // ✅ FIXED (was outside before)
  const { onMenuClick } = useOutletContext();

  const { notifications, markNotifRead, markAllRead, unreadCount } = useAuth();

  return (
    <div>
      <Topbar
        title="Notifications"
        onMenuClick={onMenuClick}
        actions={
          unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )
        }
      />

      <div className="page-container">

        {notifications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="All caught up!"
            desc="No notifications yet."
          />
        ) : (
          <div className="stagger-children">

            {notifications.map(n => (
              <div
                key={n.n_id}
                className="card"
                onClick={() => markNotifRead(n.n_id)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: `${typeColors[n.type] || '#6c63ff'}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bell size={16} style={{ color: typeColors[n.type] || '#6c63ff' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14 }}>{n.message}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.created_at}</p>
                </div>

                {!n.is_read && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)'
                  }} />
                )}
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}