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
} from "lucide-react";

import { Avatar, StatusBadge, PriorityBadge } from "../shared/UIComponents";
import toast from "react-hot-toast";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectId = Number(id);
  const project = PROJECTS.find(p => p.p_id === projectId);

  const [comments, setComments] = useState(COMMENTS);
  const [text, setText] = useState("");

  if (!project) return <div>Project not found</div>;

  const tasks = TASKS.filter(t => t.p_id === projectId);
  const progress = getProjectProgress(projectId);

  const members = TEAM_MEMBERS.filter(m =>
    P_TEAMS.some(p => p.p_id === projectId && p.tm_id === m.tm_id)
  );

  const done = tasks.filter(t => t.status === "done").length;

  const addComment = () => {
    if (!text.trim()) return;
    COMMENTS.push({
      c_id: Date.now(),
      t_id: null,
      u_id: 1,
      desc: text,
      created_at: new Date().toLocaleString(),
    });
    setComments([...COMMENTS]);
    setText("");
    toast.success("Comment added");
  };

  return (
    <div className="project-page">

      {/* HEADER */}
      <div className="project-header">
        <div className="header-row">
          <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
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
            <h3 className="section-title">Tasks</h3>
            <div className="task-list">
              {tasks.map(t => (
                <div key={t.t_id} className="task-card themed-card-inner">
                  <div className="task-top">
                    <strong className="task-title">{t.title}</strong>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="muted task-desc">{t.desc}</p>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </div>

          {/* TEAM */}
          <div className="card themed-card">
            <h3 className="section-title">
              <Users size={16} /> Team Members
            </h3>
            <div className="team-list">
              {members.map(m => (
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

          {/* STATS */}
          <div className="card themed-card">
            <h3 className="section-title">Overview</h3>
            <div className="stats-row">
              <div className="stat-item">
                <CheckCircle2 size={16} />
                <p>{done}/{tasks.length} Done</p>
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
              <MessageSquare size={16} /> Comments
            </h3>
            <textarea
              className="input themed-input comment-textarea"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
            />
            <button className="btn btn-primary btn-sm post-btn" onClick={addComment}>
              Post Comment
            </button>
            <div className="comment-list">
              {comments.slice(-5).map(c => (
                <div key={c.c_id} className="comment-item">
                  <p className="comment-text">{c.desc}</p>
                  <small className="muted">{c.created_at}</small>
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
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        /* ── HEADER ── */
        .project-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }

        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .project-title-block { width: 100%; }

        .project-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .project-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .project-progress {
          text-align: center;
          padding: 8px 14px;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-card);
          flex-shrink: 0;
        }

        .progress-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--accent-primary);
          line-height: 1.2;
        }

        /* ── BODY ── */
        .project-body {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          gap: 16px;
          padding: 20px;
          flex: 1;
          align-items: start;
        }

        .left-panel,
        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        /* ── CARDS ── */
        .card {
          border: 1px solid var(--border-default);
          border-radius: 14px;
          padding: 16px;
          background: var(--bg-card);
          min-width: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }

        /* ── TASKS ── */
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .task-card {
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          min-width: 0;
        }

        .task-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 6px;
        }

        .task-title {
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.4;
          word-break: break-word;
        }

        .task-desc {
          margin: 0 0 8px 0;
          line-height: 1.5;
          word-break: break-word;
        }

        /* ── TEAM ── */
        .team-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .member-row {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 8px;
          border-radius: 8px;
          background: var(--bg-secondary);
        }

        .member-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* ── STATS ── */
        .stats-row {
          display: flex;
          gap: 10px;
        }

        .stat-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 10px;
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          min-width: 0;
        }

        .stat-item p { margin: 0; white-space: nowrap; }

        /* ── COMMENTS ── */
        .comment-textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 90px;
          resize: vertical;
          margin-bottom: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          display: block;
        }

        .post-btn {
          width: 100%;
          justify-content: center;
        }

        .comment-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comment-item {
          padding: 10px 12px;
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          background: var(--bg-secondary);
          word-break: break-word;
        }

        .comment-text { margin: 0 0 4px 0; font-size: 13px; }

        /* ── UTILS ── */
        .muted { font-size: 11px; color: var(--text-muted); }
        .themed-input { background: var(--bg-secondary); border: 1px solid var(--border-default); color: var(--text-primary); }
        .themed-card { background: var(--bg-card); }
        .themed-card-inner { background: var(--bg-secondary); }

        /* ════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════════ */

        /* Ultrawide (≥1400px) */
        @media (min-width: 1400px) {
          .project-body {
            grid-template-columns: 2fr 1fr;
            max-width: 1600px;
            margin: 0 auto;
            padding: 24px 32px;
            gap: 20px;
          }
          .project-header { padding: 20px 32px; }
          .project-title  { font-size: 24px; }
          .card           { padding: 20px; }
        }

        /* Tablet landscape (≤1024px) */
        @media (max-width: 1024px) {
          .project-body {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            padding: 16px;
          }
        }

        /* Tablet portrait (≤768px) */
        @media (max-width: 768px) {
          .project-header { padding: 14px 16px; }
          .project-title  { font-size: 18px; }

          .project-body {
            grid-template-columns: 1fr;
            padding: 14px;
            gap: 14px;
          }

          /* Overview + Comments side by side */
          .right-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          /* Tasks 2-col */
          .task-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          /* Team 2-col */
          .team-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }

        /* Large phones (≤600px) */
        @media (max-width: 600px) {
          .right-panel        { grid-template-columns: 1fr; }
          .task-list          { grid-template-columns: 1fr; }
          .team-list          { grid-template-columns: 1fr; }
        }

        /* Small phones (≤480px) */
        @media (max-width: 480px) {
          .project-header     { padding: 12px 14px; gap: 8px; }
          .project-title      { font-size: 16px; }
          .project-desc       { font-size: 11px; }
          .progress-value     { font-size: 17px; }
          .project-progress   { padding: 6px 10px; border-radius: 10px; }
          .project-body       { padding: 12px; gap: 12px; }
          .card               { padding: 13px; border-radius: 12px; }
          .section-title      { font-size: 13px; margin-bottom: 10px; }
          .task-top           { flex-direction: column; align-items: flex-start; }
          .stat-item          { padding: 10px 8px; font-size: 12px; }
          .stats-row          { flex-direction: column; gap: 8px; }
          .comment-textarea   { min-height: 75px; font-size: 12px; }
          .comment-text       { font-size: 12px; }
          .member-name        { font-size: 12px; }
        }

        /* Very small phones (≤360px) */
        @media (max-width: 360px) {
          .project-title  { font-size: 14px; }
          .project-desc   { font-size: 10px; }
          .project-body   { padding: 10px; gap: 10px; }
          .card           { padding: 11px; }
          .section-title  { font-size: 12px; }
          .task-title     { font-size: 12px; }
          .member-name    { font-size: 11px; }
        }
      `}</style>

    </div>
  );
}