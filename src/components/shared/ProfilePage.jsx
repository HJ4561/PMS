import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Search,
  Pencil,
  Save,
  X,
  Lock,
  Activity,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

export default function ProfilePage() {
  const ctx = useOutletContext?.() || {};
  const onMenuClick = ctx.onMenuClick;

  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: user?.u_name || "",
    email: user?.email || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activities] = useState([
    { id: 1, text: "Logged in", time: "2 hours ago" },
    { id: 2, text: "Updated profile email", time: "Yesterday" },
    { id: 3, text: "Completed task: UI Design", time: "2 days ago" },
    { id: 4, text: "Joined project Alpha", time: "3 days ago" },
  ]);

  const initials =
    user?.u_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const handleSave = () => {
    toast.success("Profile updated");
    setEditMode(false);
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill all fields");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const filteredFields = [
    { label: "Name", value: form.name },
    { label: "Email", value: form.email },
    { label: "User ID", value: user?.u_id },
    { label: "Role", value: user?.role },
  ].filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const pwStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: "Weak", color: "#ef4444", width: "30%" };
    if (pw.length < 10) return { label: "Fair", color: "#fbbf24", width: "60%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  };

  const strength = pwStrength(passwords.new);

  return (
    <div className="profile-bg">

      <Topbar title="Profile Settings" onMenuClick={onMenuClick} />

      <div className="page-container">

        {/* SEARCH */}
        <div className="search-bar">
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            placeholder="Search settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* PROFILE CARD */}
        <div className="profile-card glass">

          <div className="profile-header">
            <div className="avatar-ring">
              <div className="avatar-glow">{initials}</div>
            </div>

            <div>
              <h2 className="profile-name">{form.name}</h2>
              <p className="profile-role">{user?.role}</p>
            </div>

            <div className="header-actions">
              {!editMode ? (
                <button className="pp-btn pp-btn-ghost" onClick={() => setEditMode(true)}>
                  <Pencil size={13} /> Edit
                </button>
              ) : (
                <>
                  <button className="pp-btn pp-btn-primary" onClick={handleSave}>
                    <Save size={13} /> Save
                  </button>
                  <button className="pp-btn pp-btn-ghost pp-btn-icon" onClick={() => setEditMode(false)}>
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="divider" />

          <div className="info-grid">
            {filteredFields.map((item, i) => (
              <div key={i} className="info-card">
                <div className="info-label">{item.label}</div>
                {editMode && (item.label === "Name" || item.label === "Email") ? (
                  <input
                    className="pp-input"
                    value={item.label === "Name" ? form.name : form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [item.label === "Name" ? "name" : "email"]: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="info-value">{item.value}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PASSWORD CARD */}
        <div className="profile-card glass">
          <div className="section-header">
            <div className="section-icon-wrap">
              <KeyRound size={15} />
            </div>
            <div>
              <h3 className="section-title">Change Password</h3>
              <p className="section-sub">Keep your account secure with a strong password</p>
            </div>
          </div>

          <div className="pw-grid">
            {/* Current */}
            <div className="pw-field-group">
              <label className="pw-label">Current Password</label>
              <div className="pw-input-wrap">
                <Lock size={14} className="pw-icon" />
                <input
                  type={showPw.current ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
                <button className="pw-eye" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}>
                  {showPw.current ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* New */}
            <div className="pw-field-group">
              <label className="pw-label">New Password</label>
              <div className="pw-input-wrap">
                <Lock size={14} className="pw-icon" />
                <input
                  type={showPw.new ? "text" : "password"}
                  placeholder="Enter new password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                <button className="pw-eye" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}>
                  {showPw.new ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {strength && (
                <div className="pw-strength">
                  <div className="pw-strength-track">
                    <div className="pw-strength-fill" style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="pw-field-group">
              <label className="pw-label">Confirm Password</label>
              <div className="pw-input-wrap">
                <Lock size={14} className="pw-icon" />
                <input
                  type={showPw.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
                <button className="pw-eye" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                  {showPw.confirm ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {passwords.confirm && passwords.new && (
                <p className="pw-match" style={{ color: passwords.new === passwords.confirm ? "#10b981" : "#ef4444" }}>
                  {passwords.new === passwords.confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <button className="pp-btn pp-btn-primary pp-btn-full" onClick={handlePasswordChange}>
              <KeyRound size={14} /> Update Password
            </button>
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="profile-card glass">
          <div className="section-header">
            <div className="section-icon-wrap">
              <Activity size={15} />
            </div>
            <div>
              <h3 className="section-title">Activity History</h3>
              <p className="section-sub">Your recent account activity</p>
            </div>
          </div>

          <div className="timeline">
            {activities.map((a) => (
              <div key={a.id} className="timeline-item">
                <div className="dot" />
                <div className="timeline-content">
                  <p>{a.text}</p>
                  <span>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .profile-bg {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .page-container {
          max-width: 950px;
          margin: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(14px);
          border: 1px solid var(--border-subtle);
        }

        /* SEARCH */
        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
        }

        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          color: var(--text-primary);
          font-size: 13px;
        }

        /* CARD */
        .profile-card {
          padding: 20px;
          border-radius: 16px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-actions {
          margin-left: auto;
          display: flex;
          gap: 8px;
        }

        .avatar-ring {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #2dd4bf);
          padding: 2px;
          flex-shrink: 0;
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
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
        }

        .profile-role {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
          text-transform: capitalize;
        }

        .divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 16px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-card {
          padding: 12px;
          border-radius: 10px;
          background: var(--bg-secondary);
        }

        .info-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .pp-input {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          margin-top: 2px;
        }

        .pp-input:focus {
          border-color: var(--accent-primary);
        }

        /* ── THEMED BUTTONS ── */
        .pp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          outline: none;
          white-space: nowrap;
        }

        .pp-btn-primary {
          background: var(--accent-primary);
          color: #fff;
        }

        .pp-btn-primary:hover {
          opacity: 0.88;
        }

        .pp-btn-ghost {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
        }

        .pp-btn-ghost:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .pp-btn-icon {
          padding: 7px 9px;
        }

        .pp-btn-full {
          width: 100%;
          margin-top: 4px;
        }

        /* ── SECTION HEADER ── */
        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .section-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
        }

        .section-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }

        /* ── PASSWORD SECTION ── */
        .pw-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pw-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pw-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .pw-input-wrap {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          padding: 0 12px;
          transition: border-color 0.15s;
          overflow: hidden;
        }

        .pw-input-wrap:focus-within {
          border-color: var(--accent-primary);
          background: var(--bg-card);
        }

        .pw-icon {
          color: var(--text-muted);
          flex-shrink: 0;
          margin-right: 8px;
        }

        .pw-input-wrap input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 10px 0;
          font-size: 13px;
          color: var(--text-primary);
        }

        .pw-eye {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 0 0 0 8px;
          transition: color 0.14s;
        }

        .pw-eye:hover { color: var(--accent-primary); }

        .pw-strength {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .pw-strength-track {
          flex: 1;
          height: 4px;
          border-radius: 4px;
          background: var(--border-subtle);
          overflow: hidden;
        }

        .pw-strength-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s, background 0.3s;
        }

        .pw-strength span {
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pw-match {
          font-size: 11px;
          font-weight: 600;
          margin: 0;
        }

        /* TIMELINE */
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--accent-primary);
          margin-top: 7px;
          flex-shrink: 0;
          box-shadow: 0 0 8px var(--accent-primary);
        }

        .timeline-content {
          background: var(--bg-secondary);
          padding: 10px 12px;
          border-radius: 10px;
          flex: 1;
        }

        .timeline-content p {
          margin: 0 0 2px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .timeline-content span {
          font-size: 11px;
          color: var(--text-muted);
        }

        @media (max-width: 600px) {
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}