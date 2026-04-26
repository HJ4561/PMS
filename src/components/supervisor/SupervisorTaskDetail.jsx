import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Pin } from "lucide-react";

import {
  PROJECTS,
  TASKS,
  COMMENTS,
  TEAM_MEMBERS,
  getTeamMemberById,
  getUserById,
  statusConfig,
  priorityConfig,
} from "../../data/mockData";

import { Avatar, PriorityBadge } from "../shared/UIComponents";
import toast from "react-hot-toast";

export default function SupervisorTaskDetail() {
  const { id, taskId } = useParams();
  const navigate = useNavigate();

  const projectId = parseInt(id);
  const tId = parseInt(taskId);

  const project = PROJECTS.find((p) => p.p_id === projectId);
  const task = TASKS.find((t) => t.t_id === tId);

  const [comments, setComments] = useState(COMMENTS);
  const [newComment, setNewComment] = useState("");

  if (!project || !task) {
    return <div style={{ padding: 40 }}>Task not found</div>;
  }

  const assignee = task.assign_to
    ? getTeamMemberById(task.assign_to)
    : null;

  const taskComments = comments.filter((c) => c.t_id === task.t_id);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newC = {
      c_id: Date.now(),
      t_id: task.t_id,
      u_id: 1,
      desc: newComment,
      created_at: new Date().toLocaleString(),
      priority: "medium",
      pin: false,
    };

    COMMENTS.push(newC);
    setComments([...COMMENTS]);
    setNewComment("");
    toast.success("Comment added");
  };

  const togglePin = (id) => {
    const idx = COMMENTS.findIndex((c) => c.c_id === id);
    COMMENTS[idx].pin = !COMMENTS[idx].pin;
    setComments([...COMMENTS]);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT */}
      <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>

        <button className="btn btn-ghost btn-sm" onClick={() =>
          navigate(`/supervisor/projects/${projectId}`)
        }>
          <ArrowLeft size={14} /> Back
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 15 }}>
          {task.title}
        </h1>

        <p style={{ marginTop: 6 }}>{task.desc}</p>

        <div style={{ marginTop: 20 }}>
          <strong>Status:</strong> {statusConfig[task.status]?.label}
        </div>

        <div style={{ marginTop: 10 }}>
          <strong>Priority:</strong> {priorityConfig[task.priority]?.label}
        </div>

        <div style={{ marginTop: 10 }}>
          <strong>Assignee:</strong> {assignee?.name || "Unassigned"}
        </div>

        {/* COMMENTS */}
        <div style={{ marginTop: 30 }}>
          <h3>Comments</h3>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ width: "100%", marginTop: 10, padding: 10 }}
          />

          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddComment}
            style={{ marginTop: 10 }}
          >
            <MessageSquare size={14} /> Add Comment
          </button>

          <div style={{ marginTop: 20 }}>
            {taskComments.map((c) => {
              const user = getUserById(c.u_id);

              return (
                <div key={c.c_id} style={{ padding: 10, border: "1px solid #ddd", marginTop: 10 }}>
                  <strong>{user?.u_name}</strong>
                  <p>{c.desc}</p>
                  <button onClick={() => togglePin(c.c_id)}>
                    <Pin size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ width: 320, borderLeft: "1px solid #ddd", padding: 20 }}>
        <h3>Project Info</h3>
        <p>{project.p_name}</p>

        <h4 style={{ marginTop: 20 }}>Team</h4>
        {TEAM_MEMBERS.slice(0, 5).map((m) => (
          <div key={m.tm_id}>
            {m.name}
          </div>
        ))}
      </div>
    </div>
  );
}