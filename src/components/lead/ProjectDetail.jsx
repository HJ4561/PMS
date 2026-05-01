import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PROJECTS,
  TASKS,
  COMMENTS,
  P_TEAMS,
  TEAM_MEMBERS,
  getProjectProgress,
} from "../../data/mockData";

import {
  ArrowLeft,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  Flag,
  Milestone,
  X,
  Pin,
  PinOff,
  ChevronDown,
  BarChart2,
} from "lucide-react";

import { Avatar, StatusBadge, PriorityBadge } from "../shared/UIComponents";
import toast from "react-hot-toast";

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
const STATUS_OPTIONS = ["todo", "in_progress", "review", "done"];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectId = Number(id);
  const project = PROJECTS.find((p) => p.p_id === projectId);

  const [comments, setComments] = useState(
    COMMENTS.map((c) => ({ ...c, pinned: false }))
  );
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState(
    TASKS.filter((t) => t.p_id === projectId).map((t) => ({
      ...t,
      progress: t.progress ?? (t.status === "done" ? 100 : t.status === "in_progress" ? 50 : t.status === "review" ? 75 : 0),
      milestone: t.milestone ?? "",
    }))
  );

  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  if (!project) return <div>Project not found</div>;

  const progress = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
    : 0;

  const members = TEAM_MEMBERS.filter((m) =>
    P_TEAMS.some((p) => p.p_id === projectId && p.tm_id === m.tm_id)
  );

  const done = tasks.filter((t) => t.status === "done").length;

  const addComment = () => {
    if (!text.trim()) return;
    const newComment = {
      c_id: Date.now(),
      t_id: null,
      u_id: 1,
      desc: text,
      created_at: new Date().toLocaleString(),
      pinned: false,
    };
    setComments((prev) => [...prev, newComment]);
    setText("");
    toast.success("Comment added");
  };

  const togglePin = (c_id) => {
    setComments((prev) =>
      prev.map((c) => (c.c_id === c_id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const deleteComment = (c_id) => {
    setComments((prev) => prev.filter((c) => c.c_id !== c_id));
    toast.success("Comment deleted");
  };

  const handleDeleteTask = (t_id) => {
    setTasks((prev) => prev.filter((t) => t.t_id !== t_id));
    setShowDeleteConfirm(null);
    setSelectedTask(null);
    toast.success("Task deleted");
  };

  const handleUpdateTask = (updated) => {
    setTasks((prev) =>
      prev.map((t) => (t.t_id === updated.t_id ? { ...t, ...updated } : t))
    );
    setEditTask(null);
    setSelectedTask(updated);
    toast.success("Task updated");
  };

  const sortedComments = [...comments].sort((a, b) =>
    b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1
  );

  return (
    <div className="project-page">
      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedTask.title}</h2>
              <button className="icon-btn" onClick={() => setSelectedTask(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">{selectedTask.desc}</p>

              <div className="modal-meta-row">
                <StatusBadge status={selectedTask.status} />
                <PriorityBadge priority={selectedTask.priority} />
              </div>

              {selectedTask.milestone && (
                <div className="milestone-tag">
                  <Milestone size={13} />
                  {selectedTask.milestone}
                </div>
              )}

              <div className="progress-section">
                <div className="progress-label-row">
                  <span className="progress-label">Progress</span>
                  <span className="progress-pct">{selectedTask.progress}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditTask({ ...selectedTask });
                  setSelectedTask(null);
                }}
              >
                <Pencil size={13} /> Edit Task
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setShowDeleteConfirm(selectedTask.t_id);
                  setSelectedTask(null);
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editTask && (
        <div className="modal-overlay" onClick={() => setEditTask(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Task</h2>
              <button className="icon-btn" onClick={() => setEditTask(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body edit-form">
              <label className="form-label">Title</label>
              <input
                className="input themed-input form-input"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              />

              <label className="form-label">Description</label>
              <textarea
                className="input themed-input form-textarea"
                value={editTask.desc}
                onChange={(e) => setEditTask({ ...editTask, desc: e.target.value })}
              />

              <div className="form-row-2">
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="input themed-input form-select"
                    value={editTask.priority}
                    onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="input themed-input form-select"
                    value={editTask.status}
                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="form-label">Milestone</label>
              <input
                className="input themed-input form-input"
                placeholder="e.g. Phase 1 Release"
                value={editTask.milestone}
                onChange={(e) => setEditTask({ ...editTask, milestone: e.target.value })}
              />

              <label className="form-label">
                Progress: <strong>{editTask.progress}%</strong>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={editTask.progress}
                className="range-input"
                onChange={(e) =>
                  setEditTask({ ...editTask, progress: Number(e.target.value) })
                }
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleUpdateTask(editTask)}
              >
                Save Changes
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditTask(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm !== null && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="modal-box confirm-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="confirm-title">Delete Task?</h3>
            <p className="muted" style={{ marginBottom: 20 }}>
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteTask(showDeleteConfirm)}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="project-header">
        <div className="header-top-row">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="project-progress">
            <div className="progress-value">{progress}%</div>
            <small className="muted">Progress</small>
          </div>
        </div>

        <div className="project-title-block">
          <h1 className="project-title">{project.p_name}</h1>
          <p className="project-desc">{project.desc}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="project-body">
        {/* LEFT PANEL */}
        <div className="left-panel">
          {/* TASKS */}
          <div className="card themed-card">
            <div className="section-title-row">
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                <BarChart2 size={16} /> Tasks
              </h3>
              <span className="task-count-badge">{tasks.length}</span>
            </div>

            <div className="task-scroll-container">
              <div className="task-list">
                {tasks.map((t) => (
                  <div
                    key={t.t_id}
                    className="task-card themed-card-inner"
                    onClick={() => setSelectedTask(t)}
                  >
                    <div className="task-top">
                      <strong className="task-title">{t.title}</strong>
                      <div className="task-badges">
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>

                    <p className="muted task-desc">{t.desc}</p>

                    {t.milestone && (
                      <div className="milestone-tag small-tag">
                        <Milestone size={11} />
                        {t.milestone}
                      </div>
                    )}

                    <div className="task-bottom">
                      <StatusBadge status={t.status} />
                      <div className="task-progress-mini">
                        <div className="mini-track">
                          <div
                            className="mini-fill"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="mini-pct">{t.progress}%</span>
                      </div>
                    </div>

                    <div
                      className="task-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => setEditTask({ ...t })}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => setShowDeleteConfirm(t.t_id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TEAM MEMBERS */}
          <div className="card themed-card">
            <h3 className="section-title">
              <Users size={16} />
              Team Members
            </h3>

            <div className="team-list">
              {members.map((m) => (
                <div key={m.tm_id} className="member-row">
                  <Avatar name={m.name} size="sm" />
                  <div>
                    <div className="member-name">{m.name}</div>
                    <div className="muted">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {/* OVERVIEW */}
          <div className="card themed-card">
            <h3 className="section-title">Overview</h3>

            <div className="stats-row">
              <div className="stat-item">
                <CheckCircle2 size={16} />
                <p>
                  {done}/{tasks.length} Done
                </p>
              </div>

              <div className="stat-item">
                <Clock3 size={16} />
                <p>Active</p>
              </div>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="card themed-card">
            <h3 className="section-title">
              <MessageSquare size={16} />
              Comments
            </h3>

            <textarea
              className="input themed-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
            />

            <button
              className="btn btn-primary btn-sm post-btn"
              onClick={addComment}
            >
              Post Comment
            </button>

            <div className="comment-list">
              {sortedComments.slice(-10).map((c) => (
                <div
                  key={c.c_id}
                  className={`comment-item${c.pinned ? " pinned-comment" : ""}`}
                >
                  {c.pinned && (
                    <div className="pin-indicator">
                      <Pin size={10} /> Pinned
                    </div>
                  )}
                  <p>{c.desc}</p>
                  <div className="comment-footer">
                    <small className="muted">{c.created_at}</small>
                    <div className="comment-actions">
                      <button
                        className={`icon-btn${c.pinned ? " pinned" : ""}`}
                        title={c.pinned ? "Unpin" : "Pin"}
                        onClick={() => togglePin(c.c_id)}
                      >
                        {c.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => deleteComment(c.c_id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── BASE ── */
        .project-page {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .project-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }

        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .project-title-block { flex: 1; }

        .project-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .project-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .project-progress {
          min-width: 100px;
          text-align: center;
          padding: 10px 16px;
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          background: var(--bg-card);
          white-space: nowrap;
        }

        .progress-value {
          font-size: 22px;
          font-weight: 800;
          color: var(--accent-primary);
        }

        /* ── BODY GRID ── */
        .project-body {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          gap: 18px;
          padding: 20px;
          flex: 1;
          align-items: start;
        }

        .left-panel,
        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── CARD ── */
        .card {
          border: 1px solid var(--border-default);
          border-radius: 16px;
          padding: 18px;
          background: var(--bg-card);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 14px;
          color: var(--text-primary);
        }

        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .task-count-badge {
          font-size: 11px;
          font-weight: 700;
          background: var(--accent-primary);
          color: #fff;
          border-radius: 20px;
          padding: 2px 10px;
          opacity: 0.85;
        }

        /* ── TASKS SCROLL ── */
        .task-scroll-container {
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--border-default) transparent;
        }

        .task-scroll-container::-webkit-scrollbar {
          width: 5px;
        }

        .task-scroll-container::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 10px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-card {
          padding: 14px;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-secondary);
          cursor: pointer;
          transition: box-shadow 0.18s, border-color 0.18s;
          position: relative;
        }

        .task-card:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        .task-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 6px;
        }

        .task-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .task-desc {
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-badges {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .task-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
        }

        .task-progress-mini {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .mini-track {
          width: 80px;
          height: 6px;
          background: var(--border-subtle);
          border-radius: 10px;
          overflow: hidden;
        }

        .mini-fill {
          height: 100%;
          background: var(--accent-primary);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .mini-pct {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .task-actions {
          display: flex;
          gap: 6px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }

        /* ── MILESTONE TAG ── */
        .milestone-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-primary);
          background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
          border-radius: 8px;
          padding: 3px 9px;
          margin-bottom: 8px;
        }

        .small-tag {
          font-size: 11px;
          padding: 2px 7px;
          margin-bottom: 6px;
        }

        /* ── ICON BTNS ── */
        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 7px;
          border-radius: 7px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
          font-size: 12px;
          gap: 4px;
        }

        .icon-btn:hover {
          background: var(--bg-primary);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .icon-btn.danger:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239,68,68,0.06);
        }

        .icon-btn.pinned {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        /* ── MODALS ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-box {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 20px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: modal-in 0.2s ease;
        }

        @keyframes modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 14px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-body {
          padding: 18px 20px;
        }

        .modal-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 14px;
        }

        .modal-meta-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          padding: 14px 20px 20px;
          border-top: 1px solid var(--border-subtle);
          justify-content: flex-end;
        }

        /* Progress section inside modal */
        .progress-section {
          margin-top: 16px;
        }

        .progress-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .progress-pct {
          font-size: 15px;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .progress-track {
          width: 100%;
          height: 10px;
          background: var(--border-subtle);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 60%, #a78bfa));
          border-radius: 10px;
          transition: width 0.4s ease;
        }

        /* ── EDIT FORM ── */
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 3px;
          display: block;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 13px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .range-input {
          width: 100%;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        /* ── CONFIRM BOX ── */
        .confirm-box {
          max-width: 360px;
          text-align: center;
        }

        .confirm-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        /* ── BUTTONS ── */
        .btn-danger {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3);
        }

        .btn-danger:hover {
          background: rgba(239,68,68,0.2);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
        }

        .btn-secondary:hover {
          border-color: var(--accent-primary);
        }

        /* ── TEAM ── */
        .team-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .member-row {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 10px;
          border-radius: 10px;
          background: var(--bg-secondary);
        }

        .member-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* ── STATS ── */
        .stats-row {
          display: flex;
          gap: 14px;
        }

        .stat-item {
          flex: 1;
          padding: 14px;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          min-width: 0;
        }

        /* ── COMMENTS ── */
        textarea.themed-input {
          width: 100%;
          box-sizing: border-box;
          min-height: 100px;
          resize: vertical;
          margin-bottom: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.5;
        }

        .post-btn {
          width: 100%;
          justify-content: center;
          margin-bottom: 4px;
        }

        .comment-list {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .comment-item {
          padding: 12px;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-secondary);
          word-break: break-word;
          transition: border-color 0.15s;
        }

        .comment-item.pinned-comment {
          border-color: var(--accent-primary);
          background: color-mix(in srgb, var(--accent-primary) 5%, var(--bg-secondary));
        }

        .pin-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .comment-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }

        .comment-actions {
          display: flex;
          gap: 4px;
        }

        /* ── UTILS ── */
        .muted {
          font-size: 12px;
          color: var(--text-muted);
        }

        .themed-input {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
        }

        .themed-card   { background: var(--bg-card); }
        .themed-card-inner { background: var(--bg-secondary); }

        /* ═════════════ RESPONSIVE ═════════════ */

        @media (max-width: 1024px) {
          .project-body {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            padding: 16px;
          }
        }

        @media (max-width: 768px) {
          .project-header { padding: 16px; }
          .project-title  { font-size: 19px; }
          .project-body {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 14px;
          }
          .right-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .team-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .task-scroll-container { max-height: 360px; }
        }

        @media (max-width: 600px) {
          .project-body { padding: 12px; }
          .right-panel  { grid-template-columns: 1fr; }
          .team-list    { grid-template-columns: 1fr; }
          .stats-row    { gap: 10px; }
          .stat-item    { padding: 12px 10px; font-size: 13px; }
          .form-row-2   { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .project-header  { padding: 12px; gap: 10px; }
          .project-title   { font-size: 16px; }
          .project-desc    { font-size: 11px; }
          .progress-value  { font-size: 18px; }
          .project-progress { padding: 8px 12px; min-width: 80px; }
          .card            { padding: 14px; border-radius: 12px; }
          .section-title   { font-size: 13px; margin-bottom: 10px; }
          .task-card       { padding: 12px; }
          .task-top        { flex-direction: column; align-items: flex-start; gap: 6px; }
          .member-name     { font-size: 13px; }
          .member-row      { padding: 8px; gap: 10px; }
          .stats-row       { flex-direction: column; gap: 8px; }
          .stat-item       { padding: 12px; }
          textarea.themed-input { min-height: 80px; font-size: 13px; }
          .comment-item p  { font-size: 13px; }
          .btn-sm          { font-size: 12px; padding: 6px 12px; }
          .mini-track      { width: 56px; }
        }

        @media (max-width: 360px) {
          .project-title  { font-size: 14px; }
          .project-desc   { font-size: 10px; }
          .project-body   { padding: 10px; gap: 10px; }
          .card           { padding: 12px; border-radius: 10px; }
          .section-title  { font-size: 12px; }
          .task-top strong { font-size: 13px; }
          .member-name    { font-size: 12px; }
        }

        @media (min-width: 1400px) {
          .project-body {
            grid-template-columns: 2fr 1fr;
            max-width: 1600px;
            margin: 0 auto;
            padding: 24px;
            gap: 24px;
          }
          .project-header { padding: 24px 32px; }
          .card           { padding: 22px; }
          .project-title  { font-size: 26px; }
          .task-scroll-container { max-height: 600px; }
        }
      `}</style>
    </div>
  );
}