import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PROJECTS,
  TASKS,
  COMMENTS,
  TEAM_MEMBERS,
  P_TEAMS,
  getProjectProgress,
  getUserById,
} from "../../data/mockData";

import {
  ProgressRing,
  Avatar,
  AvatarGroup,
  StatusBadge,
  PriorityBadge,
} from "../shared/UIComponents";

import { MessageSquare, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectId = Number(id);

  const project = PROJECTS.find((p) => p.p_id === projectId);

  const [tasks] = useState(TASKS);
  const [comments, setComments] = useState(COMMENTS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState("");

  if (!project) {
    return <div style={{ padding: 40 }}>Project not found</div>;
  }

  const projectTasks = tasks.filter((t) => t.p_id === projectId);

  const progress = getProjectProgress(projectId);

  const ptEntries = P_TEAMS.filter((p) => p.p_id === projectId);
  const members = TEAM_MEMBERS.filter((m) =>
    ptEntries.some((p) => p.tm_id === m.tm_id)
  );

  const addComment = () => {
    if (!newComment.trim()) return;

    const newC = {
      c_id: Date.now(),
      t_id: selectedTask?.t_id || null,
      u_id: 1,
      desc: newComment,
      created_at: new Date().toLocaleString(),
    };

    COMMENTS.push(newC);
    setComments([...COMMENTS]);
    setNewComment("");
    toast.success("Comment added");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)" }}>

      {/* LEFT SIDE */}
      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>

        {/* PROJECT HEADER */}
        <div className="card" style={{ padding: 18, marginBottom: 16 }}>
          <h2 style={{ fontWeight: 900 }}>{project.p_name}</h2>
          <p style={{ color: "var(--text-secondary)" }}>{project.desc}</p>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <PriorityBadge priority={project.priority} />
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* TASK LIST */}
        <h3 style={{ marginBottom: 10 }}>Tasks</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projectTasks.map((task) => (
            <div
              key={task.t_id}
              className="card"
              style={{
                padding: 14,
                cursor: "pointer",
                border:
                  selectedTask?.t_id === task.t_id
                    ? "2px solid var(--accent-primary)"
                    : "1px solid var(--border-subtle)",
              }}
              onClick={() => setSelectedTask(task)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{task.title}</strong>
                <PriorityBadge priority={task.priority} />
              </div>

              <p style={{ fontSize: 12, color: "gray" }}>{task.desc}</p>

              <StatusBadge status={task.status} />
            </div>
          ))}
        </div>

        {/* TASK DETAILS */}
        {selectedTask && (
          <div className="card" style={{ marginTop: 20, padding: 18 }}>
            <h3>Task Details</h3>

            <p><b>Title:</b> {selectedTask.title}</p>
            <p><b>Description:</b> {selectedTask.desc}</p>
            <p><b>Status:</b> {selectedTask.status}</p>
            <p><b>Priority:</b> {selectedTask.priority}</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div
        style={{
          width: 360,
          borderLeft: "1px solid var(--border-subtle)",
          padding: 18,
          background: "var(--bg-secondary)",
          overflowY: "auto",
        }}
      >

        {/* PROGRESS */}
        <div className="card" style={{ padding: 14 }}>
          <h4>Progress</h4>
          <ProgressRing progress={progress} size={70} />
        </div>

        {/* TEAM */}
        <div className="card" style={{ padding: 14, marginTop: 12 }}>
          <h4><Users size={14} /> Team</h4>
          <AvatarGroup members={members} max={6} />
        </div>

        {/* MEMBER DETAILS */}
        <div style={{ marginTop: 10 }}>
          {members.map((m) => (
            <div key={m.tm_id} className="card" style={{ padding: 10, marginBottom: 8 }}>
              <Avatar name={m.name} size="sm" />
              <div>
                <strong>{m.name}</strong>
                <p style={{ fontSize: 11 }}>{m.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* COMMENTS */}
        <div className="card" style={{ padding: 14, marginTop: 12 }}>
          <h4><MessageSquare size={14} /> Comments</h4>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write comment..."
            style={{ width: "100%", padding: 8 }}
          />

          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 8 }}
            onClick={addComment}
          >
            Add Comment
          </button>

          <div style={{ marginTop: 10 }}>
            {comments.slice(0, 5).map((c) => (
              <p key={c.c_id} style={{ fontSize: 12 }}>
                • {c.desc}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}