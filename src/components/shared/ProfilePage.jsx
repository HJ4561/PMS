import { useOutletContext } from "react-router-dom";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const ctx = useOutletContext?.() || {};
  const onMenuClick = ctx.onMenuClick;

  const { user } = useAuth();

  const initials =
    user?.u_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="profile-bg">

      <Topbar title="My Profile" onMenuClick={onMenuClick} />

      <div className="page-container">

        {/* MAIN CARD */}
        <div className="profile-card">

          {/* HEADER */}
          <div className="profile-header">

            <div className="avatar-ring">
              <div className="avatar-glow">
                {initials}
              </div>
            </div>

            <div>
              <h2 className="profile-name">
                {user?.u_name}
              </h2>
              <p className="profile-role">
                {user?.role}
              </p>

              <div className="badge-row">
                <span className="badge">Active User</span>
                <span className="badge secondary">ID: {user?.u_id}</span>
              </div>
            </div>

          </div>

          {/* DIVIDER */}
          <div className="divider" />

          {/* INFO GRID */}
          <div className="info-grid">

            <Info label="Email" value={user?.email || "Not available"} />
            <Info label="User ID" value={user?.u_id} />
            <Info label="Role" value={user?.role} />
            <Info label="Account Status" value="Active" />

          </div>

        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .profile-bg {
          min-height: 100vh;
          background: radial-gradient(circle at top, rgba(99,102,241,0.08), transparent 40%),
                      radial-gradient(circle at bottom, rgba(45,212,191,0.08), transparent 40%);
        }

        .profile-card {
          max-width: 640px;
          margin: 0 auto;
          padding: 28px;
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 18px;
        }

        .avatar-ring {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #2dd4bf);
          padding: 2px;
        }

        .avatar-glow {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          color: var(--text-primary);
        }

        .profile-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .profile-role {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .badge-row {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .badge {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(99,102,241,0.12);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.2);
        }

        .badge.secondary {
          background: rgba(45,212,191,0.12);
          color: #2dd4bf;
          border: 1px solid rgba(45,212,191,0.2);
        }

        .divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 18px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .info-card {
          padding: 14px;
          border-radius: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          transition: 0.2s ease;
        }

        .info-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-default);
        }

        .info-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .info-value {
          font-weight: 600;
          font-size: 13.5px;
        }
      `}</style>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-card">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
}