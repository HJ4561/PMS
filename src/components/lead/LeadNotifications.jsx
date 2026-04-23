import { useAuth } from '../../context/AuthContext';
import Topbar from '../shared/Topbar';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { EmptyState } from '../shared/UIComponents';

const typeColors = {
  project_update: '#6c63ff',
  task_complete: '#10b981',
  comment: '#2dd4bf',
  task_assigned: '#fbbf24',
  project_created: '#f43f5e'
};

export default function LeadNotifications() {
  const { notifications, markNotifRead, markAllRead, unreadCount } = useAuth();

  return (
    <div>
      <Topbar
        title="Notifications"
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
            desc="No notifications yet. Updates from your supervisor and team will appear here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="stagger-children">

            {notifications.map(n => (
              <div
                key={n.n_id}
                className="card animate-fade-in"
                onClick={() => markNotifRead(n.n_id)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  background: n.is_read ? 'var(--bg-card)' : 'rgba(108,99,255,0.05)',
                  borderColor: n.is_read ? 'var(--border-subtle)' : 'var(--border-active)'
                }}
              >

                {/* ICON */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: `${typeColors[n.type] || '#6c63ff'}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bell size={16} style={{ color: typeColors[n.type] || '#6c63ff' }} />
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: 14,
                    color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)',
                    lineHeight: 1.5
                  }}>
                    {n.message}
                  </p>

                  <p style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginTop: 4
                  }}>
                    {n.created_at}
                  </p>
                </div>

                {/* UNREAD DOT */}
                {!n.is_read && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    flexShrink: 0,
                    marginTop: 4
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