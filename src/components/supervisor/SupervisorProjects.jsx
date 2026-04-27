import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react';

import Topbar from '../shared/Topbar';
import {
  PROJECTS,
  TASKS as INITIAL_TASKS,
  P_TEAMS,
  TEAM_MEMBERS,
  getProjectProgress,
  getUserById,
  priorityConfig,
  statusConfig
} from '../../data/mockData';

import {
  PriorityBadge,
  StatusBadge,
  AvatarGroup,
  EmptyState
} from '../shared/UIComponents';

export default function SupervisorProjects() {
  const navigate = useNavigate();
  const { onMenuClick } = useOutletContext();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [projects, setProjects] = useState(PROJECTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const [projectModal, setProjectModal] = useState(false);
  const [taskModalProject, setTaskModalProject] = useState(null);
  const [editProject, setEditProject] = useState(null);

  const [form, setForm] = useState({
    p_name: '',
    desc: '',
    priority: 'medium',
    status: 'todo',
    deadline: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    assignedTo: ''
  });

  const filtered = projects.filter(p => {
    const matchSearch =
      p.p_name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'all' || p.status === filterStatus;

    const matchPriority =
      filterPriority === 'all' || p.priority === filterPriority;

    return matchSearch && matchStatus && matchPriority;
  });

  const openNewProject = () => {
    setEditProject(null);
    setForm({
      p_name: '',
      desc: '',
      priority: 'medium',
      status: 'todo',
      deadline: ''
    });
    setProjectModal(true);
  };

  const saveProject = () => {
    if (!form.p_name) return;

    if (editProject) {
      setProjects(prev =>
        prev.map(p =>
          p.p_id === editProject.p_id ? { ...p, ...form } : p
        )
      );
    } else {
      setProjects(prev => [
        { p_id: Date.now(), created_by: 1, ...form },
        ...prev
      ]);
    }

    setProjectModal(false);
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.p_id !== id));
  };

  const openTaskModal = (project) => {
    setTaskModalProject(project);
    setTaskForm({ title: '', assignedTo: '' });
  };

  const addTask = () => {
    if (!taskForm.title) return;

    setTasks(prev => [
      {
        t_id: Date.now(),
        p_id: taskModalProject.p_id,
        status: 'todo',
        is_deleted: false,
        ...taskForm
      },
      ...prev
    ]);

    setTaskModalProject(null);
  };

  return (
    <div>
      <Topbar title="All Projects" onMenuClick={onMenuClick} />

      <div className="page-container">

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openNewProject}>
            <Plus size={16} /> New Project
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>

          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }} />
          </div>

          <select className="input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: 160 }}>
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>

          <select className="input"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            style={{ width: 160 }}>
            <option value="all">All Priority</option>
            {Object.entries(priorityConfig).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>

        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects found" desc="Try adjusting filters." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

            {filtered.map(project => {
              const progress = getProjectProgress(project.p_id);
              const lead = getUserById(project.created_by);

              const members = TEAM_MEMBERS.filter(tm =>
                P_TEAMS.some(pt => pt.p_id === project.p_id && pt.tm_id === tm.tm_id)
              );

              const projectTasks = tasks.filter(t => t.p_id === project.p_id && !t.is_deleted);
              const doneTasks = projectTasks.filter(t => t.status === 'done').length;

              const healthColor =
                progress >= 70 ? '#10b981' :
                  progress >= 40 ? '#fbbf24' : '#f43f5e';

              return (
                <div
                  key={project.p_id}
                  className="card animate-fade-in"
                  style={{ padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}
                  onClick={() => navigate(`/supervisor/projects/${project.p_id}`)}
                >

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <PriorityBadge priority={project.priority} />
                      <StatusBadge status={project.status} />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
                      <Pencil size={15} onClick={() => { setEditProject(project); setForm(project); setProjectModal(true); }} />
                      <Plus size={15} onClick={() => openTaskModal(project)} />
                      <Trash2 size={15} style={{ color: '#f43f5e' }} onClick={() => deleteProject(project.p_id)} />
                    </div>

                  </div>

                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{project.p_name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.desc}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span>Progress</span>
                      <span style={{ color: healthColor, fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: healthColor }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <div>
                      <p style={{ fontSize: 10 }}>Lead</p>
                      <p>{lead?.u_name}</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 10 }}>Tasks</p>
                      <p>{doneTasks}/{projectTasks.length}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                    <AvatarGroup members={members} max={4} />
                    <span style={{ fontSize: 11 }}>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>

                </div>
              );
            })}

          </div>
        )}
      </div>
      
{/* =========================
   PROJECT MODAL
========================= */}

{projectModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      padding: 16,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        padding: 24,
        borderRadius: 18,
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
      }}
    >
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        {editProject ? "Update Project" : "Create New Project"}
      </h2>

      {/* PROJECT NAME */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Project Name *
        </label>

        <input
          className="input"
          placeholder="Enter project name"
          value={form.p_name}
          onChange={(e) =>
            setForm({
              ...form,
              p_name: e.target.value,
            })
          }
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* DESCRIPTION */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Description *
        </label>

        <textarea
          className="input"
          rows={4}
          placeholder="Write project description..."
          value={form.desc}
          onChange={(e) =>
            setForm({
              ...form,
              desc: e.target.value,
            })
          }
          style={{
            resize: "none",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* PRIORITY + STATUS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* PRIORITY */}
        <div>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              display: "block",
              color: "var(--text-secondary)",
            }}
          >
            Priority *
          </label>

          <select
            className="input"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              colorScheme:
                document.documentElement.getAttribute("data-theme") === "light"
                  ? "light"
                  : "dark",
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              display: "block",
              color: "var(--text-secondary)",
            }}
          >
            Status *
          </label>

          <select
            className="input"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value,
              })
            }
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              colorScheme:
                document.documentElement.getAttribute("data-theme") === "light"
                  ? "light"
                  : "dark",
            }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      {/* DEADLINE */}
      <div style={{ marginBottom: 18 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Deadline *
        </label>

        <input
          type="date"
          className="input"
          value={form.deadline}
          onChange={(e) =>
            setForm({
              ...form,
              deadline: e.target.value,
            })
          }
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            colorScheme:
              document.documentElement.getAttribute("data-theme") === "light"
                ? "light"
                : "dark",
          }}
        />
      </div>

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          className="btn btn-secondary"
          style={{
            flex: 1,
            justifyContent: "center",
            padding: "12px",
          }}
          onClick={() => setProjectModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          style={{
            flex: 1,
            justifyContent: "center",
            padding: "12px",
            fontWeight: 700,
          }}
          onClick={saveProject}
        >
          {editProject ? "Update Project" : "Create Project"}
        </button>
      </div>
    </div>
  </div>
)}

{/* =========================
   TASK MODAL
========================= */}

{taskModalProject && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      padding: 16,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        padding: 24,
        borderRadius: 18,
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
      }}
    >
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Add Task to: {taskModalProject.p_name}
      </h2>

      {/* TASK TITLE */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Task Title *
        </label>

        <input
          className="input"
          placeholder="Enter task title"
          value={taskForm.title}
          onChange={(e) =>
            setTaskForm({
              ...taskForm,
              title: e.target.value,
            })
          }
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* ASSIGN MEMBER */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Assign Team Member *
        </label>

        <select
          className="input"
          value={taskForm.assignedTo}
          onChange={(e) =>
            setTaskForm({
              ...taskForm,
              assignedTo: e.target.value,
            })
          }
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            colorScheme:
              document.documentElement.getAttribute("data-theme") === "light"
                ? "light"
                : "dark",
          }}
        >
          <option value="">Select Member</option>

          {TEAM_MEMBERS.map((m) => (
            <option
              key={m.tm_id}
              value={m.tm_id}
              style={{
                background:
                  document.documentElement.getAttribute("data-theme") ===
                  "light"
                    ? "#ffffff"
                    : "#111520",
                color:
                  document.documentElement.getAttribute("data-theme") ===
                  "light"
                    ? "#111111"
                    : "#eef0ff",
              }}
            >
              {m.name || m.tm_name}
            </option>
          ))}
        </select>
      </div>

      {/* TASK STATUS */}
      <div style={{ marginBottom: 18 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Task Status
        </label>

        <select
          className="input"
          value={taskForm.status || "todo"}
          onChange={(e) =>
            setTaskForm({
              ...taskForm,
              status: e.target.value,
            })
          }
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            colorScheme:
              document.documentElement.getAttribute("data-theme") === "light"
                ? "light"
                : "dark",
          }}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          className="btn btn-secondary"
          style={{
            flex: 1,
            justifyContent: "center",
            padding: "12px",
          }}
          onClick={() => setTaskModalProject(null)}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          style={{
            flex: 1,
            justifyContent: "center",
            padding: "12px",
            fontWeight: 700,
          }}
          onClick={addTask}
        >
          Add Task
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}