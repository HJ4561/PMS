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
  const project = PROJECTS.find((p) => p.p_id === projectId);

  const [comments, setComments] = useState(COMMENTS);
  const [text, setText] = useState("");

  if (!project) return <div>Project not found</div>;

  const tasks = TASKS.filter((t) => t.p_id === projectId);
  const progress = getProjectProgress(projectId);

  const members = TEAM_MEMBERS.filter((m) =>
    P_TEAMS.some((p) => p.p_id === projectId && p.tm_id === m.tm_id)
  );

  const done = tasks.filter((t) => t.status === "done").length;

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
        <div className="header-top-row">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
          >
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
            <h3 className="section-title">Tasks</h3>

            <div className="task-list">
              {tasks.map((t) => (
                <div key={t.t_id} className="task-card themed-card-inner">
                  <div className="task-top">
                    <strong>{t.title}</strong>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="muted">{t.desc}</p>
                  <div style={{ marginTop: 10 }}>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
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
              {comments.slice(-5).map((c) => (
                <div key={c.c_id} className="comment-item">
                  <p>{c.desc}</p>
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

        /* ── TASKS ── */
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
        }

        .task-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
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

        /* ═══════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ═══════════════════════════════════ */

        /* ── Large tablets / small laptops (max 1024px) ── */
        @media (max-width: 1024px) {
          .project-body {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            padding: 16px;
          }
        }

        /* ── Tablets portrait (max 768px) ── */
        @media (max-width: 768px) {
          .project-header {
            padding: 16px;
          }

          .project-title { font-size: 19px; }

          .project-body {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 14px;
          }

          /* On tablet, put Overview + Comments side-by-side inside right panel */
          .right-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          /* Team members: 2-column grid */
          .team-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          /* Tasks: 2-column grid */
          .task-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }

        /* ── Large phones (max 600px) ── */
        @media (max-width: 600px) {
          .project-body { padding: 12px; }

          /* Stack right panel back to single column */
          .right-panel {
            grid-template-columns: 1fr;
          }

          /* Tasks back to single column */
          .task-list {
            grid-template-columns: 1fr;
          }

          /* Team members back to single column */
          .team-list {
            grid-template-columns: 1fr;
          }

          .stats-row { gap: 10px; }

          .stat-item {
            padding: 12px 10px;
            font-size: 13px;
          }
        }

        /* ── Small phones (max 480px) ── */
        @media (max-width: 480px) {
          .project-header { padding: 12px; gap: 10px; }

          .project-title { font-size: 16px; }
          .project-desc  { font-size: 11px; }

          .progress-value { font-size: 18px; }

          .project-progress {
            padding: 8px 12px;
            min-width: 80px;
          }

          .card {
            padding: 14px;
            border-radius: 12px;
          }

          .section-title { font-size: 13px; margin-bottom: 10px; }

          .task-card { padding: 12px; }

          .task-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .member-name { font-size: 13px; }
          .member-row  { padding: 8px; gap: 10px; }

          .stats-row { flex-direction: column; gap: 8px; }

          .stat-item { padding: 12px; }

          textarea.themed-input { min-height: 80px; font-size: 13px; }

          .comment-item p { font-size: 13px; }

          .btn-sm { font-size: 12px; padding: 6px 12px; }
        }

        /* ── Very small phones (max 360px) ── */
        @media (max-width: 360px) {
          .project-title { font-size: 14px; }
          .project-desc  { font-size: 10px; }

          .project-body { padding: 10px; gap: 10px; }

          .card { padding: 12px; border-radius: 10px; }

          .section-title { font-size: 12px; }

          .task-top strong { font-size: 13px; }

          .member-name { font-size: 12px; }
        }

        /* ── Wide / ultrawide (min 1400px) ── */
        @media (min-width: 1400px) {
          .project-body {
            grid-template-columns: 2fr 1fr;
            max-width: 1600px;
            margin: 0 auto;
            padding: 24px;
            gap: 24px;
          }

          .project-header {
            padding: 24px 32px;
          }

          .card { padding: 22px; }

          .project-title { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}