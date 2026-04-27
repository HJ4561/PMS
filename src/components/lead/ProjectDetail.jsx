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
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="project-title-block">
          <h1 className="project-title">{project.p_name}</h1>
          <p className="project-desc">{project.desc}</p>
        </div>

        <div className="project-progress">
          <div className="progress-value">{progress}%</div>
          <small className="muted">Progress</small>
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
                <div
                  key={t.t_id}
                  className="task-card themed-card-inner"
                >
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
              <div>
                <CheckCircle2 size={16} />
                <p>
                  {done}/{tasks.length} Done
                </p>
              </div>

              <div>
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
              className="btn btn-primary btn-sm"
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

      {/* STYLES */}
      <style>{`
        .project-page {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }

        .project-title-block {
          flex: 1;
        }

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
          min-width: 120px;
          text-align: center;
          padding: 16px;
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          background: var(--bg-card);
        }

        .progress-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .project-body {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          gap: 18px;
          padding: 20px;
          flex: 1;
        }

        .left-panel,
        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

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

        .stats-row {
          display: flex;
          gap: 14px;
        }

        .stats-row > div {
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
        }

        textarea.themed-input {
          min-height: 120px;
          resize: vertical;
          margin-bottom: 12px;
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
        }

        .muted {
          font-size: 12px;
          color: var(--text-muted);
        }

        .themed-input {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
        }

        .themed-card {
          background: var(--bg-card);
        }

        .themed-card-inner {
          background: var(--bg-secondary);
        }

        /* ============================= */
        /* RESPONSIVE DESIGN */
        /* ============================= */

        @media (max-width: 1024px) {
          .project-body {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 16px;
          }

          .project-header {
            flex-wrap: wrap;
            align-items: flex-start;
          }

          .project-progress {
            width: 100%;
            text-align: left;
          }

          .stats-row {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 768px) {
          .project-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 14px;
          }

          .project-title {
            font-size: 18px;
          }

          .project-desc {
            font-size: 12px;
          }

          .project-progress {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .project-body {
            padding: 14px;
          }

          .task-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-row {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .project-title {
            font-size: 16px;
          }

          .project-desc {
            font-size: 11px;
          }

          .card {
            padding: 14px;
          }

          .section-title {
            font-size: 13px;
          }

          .member-name {
            font-size: 13px;
          }

          .comment-item p {
            font-size: 13px;
          }

          .btn-sm {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}