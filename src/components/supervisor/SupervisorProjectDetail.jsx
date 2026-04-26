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

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Back
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

        {/* LEFT SIDE */}
        <div className="left-panel">

          {/* TASKS */}
          <div className="card themed-card">
            <h3 className="section-title">Tasks</h3>

            <div className="task-list">
              {tasks.map(t => (
                <div key={t.t_id} className="task-card themed-card-inner">

                  <div className="task-top">
                    <strong>{t.title}</strong>
                    <PriorityBadge priority={t.priority} />
                  </div>

                  <p className="muted">{t.desc}</p>

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
              <div>
                <CheckCircle2 size={16} />
                <p>{done}/{tasks.length} Done</p>
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
              <MessageSquare size={16} /> Comments
            </h3>

            <textarea
              className="input themed-input"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
            />

            <button className="btn btn-primary btn-sm" onClick={addComment}>
              Post Comment
            </button>

            <div className="comment-list">
              {comments.slice(-5).map(c => (
                <div key={c.c_id} className="comment-item">
                  <p>{c.desc}</p>
                  <small className="muted">{c.created_at}</small>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* STYLE (uses ONLY theme variables) */}
      <style>{`
        .project-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }

        .project-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .project-desc {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .project-body {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          gap: 16px;
          padding: 20px;
          overflow: hidden;
        }

        .left-panel, .right-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .card {
          border: 1px solid var(--border-default);
          border-radius: 14px;
          padding: 16px;
          background: var(--bg-card);
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .task-card {
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
        }

        .task-top {
          display: flex;
          justify-content: space-between;
        }

        .team-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .member-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .member-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
        }

        .comment-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .comment-item {
          padding: 10px;
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          background: var(--bg-secondary);
        }

        .muted {
          font-size: 11px;
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
      `}</style>

    </div>
  );
}