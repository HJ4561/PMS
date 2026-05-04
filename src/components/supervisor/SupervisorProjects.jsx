// components/supervisor/SupervisorProjects.jsx

import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search, FolderOpen, Plus, Pencil, Trash2,
  X, ListTodo, Milestone, ChevronDown,
  Users, Check
} from 'lucide-react';

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

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS   = ['todo', 'in_progress', 'review', 'done'];

const progressFromStatus = (s) =>
  s === 'done' ? 100 : s === 'review' ? 75 : s === 'in_progress' ? 50 : 0;

/* ─── Multi-member picker ─── */
function MemberPicker({ selected = [], onChange, label = 'Members' }) {
  const [open, setOpen] = useState(false);

  const toggle = (tm_id) => {
    const next = selected.includes(tm_id)
      ? selected.filter(id => id !== tm_id)
      : [...selected, tm_id];
    onChange(next);
  };

  const selectedMembers = TEAM_MEMBERS.filter(m => selected.includes(m.tm_id));

  return (
    <div style={{ position: 'relative' }}>
      <label className="lp-label">{label}</label>
      <button type="button" className="lp-member-trigger" onClick={() => setOpen(o => !o)}>
        {selectedMembers.length === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>Select members...</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {selectedMembers.map(m => (
              <span key={m.tm_id} className="lp-member-chip">
                <span className="lp-member-avatar-sm">{(m.name || m.tm_name || '?')[0].toUpperCase()}</span>
                {m.name || m.tm_name}
                <button type="button" className="lp-chip-remove"
                  onClick={e => { e.stopPropagation(); toggle(m.tm_id); }}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--text-muted)', marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          <div className="lp-picker-backdrop" onClick={() => setOpen(false)} />
          <div className="lp-member-dropdown">
            {TEAM_MEMBERS.length === 0
              ? <p style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>No members available.</p>
              : TEAM_MEMBERS.map(m => {
                const isSelected = selected.includes(m.tm_id);
                return (
                  <button key={m.tm_id} type="button"
                    className={`lp-member-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggle(m.tm_id)}>
                    <span className="lp-member-avatar">{(m.name || m.tm_name || '?')[0].toUpperCase()}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{m.name || m.tm_name}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
                  </button>
                );
              })
            }
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Members panel ─── */
function ProjectMembersPanel({ members, onEdit }) {
  return (
    <div className="lp-members-panel">
      <div className="lp-members-panel-header">
        <Users size={14} />
        <span>Project Members ({members.length})</span>
        <button className="lp-icon-btn" style={{ marginLeft: 'auto' }} onClick={onEdit} title="Edit members">
          <Pencil size={11} />
        </button>
      </div>
      {members.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>No members assigned.</p>
        : (
          <div className="lp-members-list">
            {members.map(m => (
              <div key={m.tm_id} className="lp-member-row">
                <span className="lp-member-avatar">{(m.name || m.tm_name || '?')[0].toUpperCase()}</span>
                <span style={{ fontSize: 13 }}>{m.name || m.tm_name}</span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

export default function LeadProjects() {
  const navigate        = useNavigate();
  const { onMenuClick } = useOutletContext();

  const [search,          setSearch]          = useState('');
  const [filterStatus,    setFilterStatus]    = useState('all');
  const [filterPriority,  setFilterPriority]  = useState('all');

  const [projects, setProjects] = useState(() =>
    PROJECTS.map(p => ({
      ...p,
      members: P_TEAMS.filter(pt => pt.p_id === p.p_id).map(pt => pt.tm_id),
    }))
  );

  const [tasks, setTasks] = useState(
    INITIAL_TASKS.map(t => ({
      ...t,
      progress : t.progress ?? progressFromStatus(t.status),
      milestone: t.milestone ?? '',
    }))
  );

  const [projectModal,    setProjectModal]    = useState(false);
  const [taskAddModal,    setTaskAddModal]    = useState(null);
  const [editProject,     setEditProject]     = useState(null);
  const [taskListModal,   setTaskListModal]   = useState(null);
  const [selectedTask,    setSelectedTask]    = useState(null);
  const [editTask,        setEditTask]        = useState(null);
  const [deleteTaskId,    setDeleteTaskId]    = useState(null);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [editMembersFor,  setEditMembersFor]  = useState(null);

  const [form, setForm] = useState({
    p_name: '', desc: '', priority: 'medium',
    status: 'todo', start_date: '', end_date: '', members: []
  });

  const [taskForm, setTaskForm] = useState({
    title: '', desc: '', assignedTo: [],
    status: 'todo', priority: 'medium', milestone: '', progress: 0
  });

  const filtered = projects.filter(p => {
    const s  = p.p_name.toLowerCase().includes(search.toLowerCase()) || p.desc?.toLowerCase().includes(search.toLowerCase());
    const st = filterStatus   === 'all' || p.status   === filterStatus;
    const pr = filterPriority === 'all' || p.priority === filterPriority;
    return s && st && pr;
  });

  const openNewProject = () => {
    setEditProject(null);
    setForm({ p_name:'', desc:'', priority:'medium', status:'todo', start_date:'', end_date:'', members:[] });
    setProjectModal(true);
  };

  const saveProject = () => {
    if (!form.p_name.trim()) return;
    if (editProject) {
      setProjects(prev => prev.map(p => p.p_id === editProject.p_id ? { ...p, ...form } : p));
    } else {
      setProjects(prev => [{ p_id: Date.now(), created_by: 1, ...form }, ...prev]);
    }
    setProjectModal(false);
  };

  const saveProjectMembers = (p_id, members) => {
    setProjects(prev => prev.map(p => p.p_id === p_id ? { ...p, members } : p));
    setTaskListModal(prev => prev ? { ...prev, members } : prev);
    setEditMembersFor(null);
  };

  const openAddTask = (project, e) => {
    e?.stopPropagation();
    setTaskAddModal(project);
    setTaskForm({ title:'', desc:'', assignedTo:[], status:'todo', priority:'medium', milestone:'', progress:0 });
  };

  const addTask = () => {
    if (!taskForm.title.trim()) return;
    setTasks(prev => [{ t_id: Date.now(), p_id: taskAddModal.p_id, is_deleted: false, ...taskForm }, ...prev]);
    setTaskAddModal(null);
  };

  const handleUpdateTask = (updated) => {
    setTasks(prev => prev.map(t => t.t_id === updated.t_id ? { ...t, ...updated } : t));
    setEditTask(null);
    setSelectedTask(updated);
  };

  const handleDeleteTask = (t_id) => {
    setTasks(prev => prev.filter(t => t.t_id !== t_id));
    setDeleteTaskId(null);
    setSelectedTask(null);
  };

  const changeTaskPriority = (t_id, priority) =>
    setTasks(prev => prev.map(t => t.t_id === t_id ? { ...t, priority } : t));

  const getProjectMembers = (project) =>
    TEAM_MEMBERS.filter(m => (project.members || []).includes(m.tm_id));

  const getMemberObjects = (ids = []) =>
    TEAM_MEMBERS.filter(m => ids.includes(m.tm_id));

  return (
    <div>
      <Topbar
        title="All Projects"
        onMenuClick={onMenuClick}
        searchBar={
          <div style={{ position:'relative', width:'100%', maxWidth:380 }}>
            <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
            <input className="input" placeholder="Search projects..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft:40, width:'100%' }} />
          </div>
        }
      />

      <div className="page-container">

        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
          <button className="btn btn-primary btn-sm" onClick={openNewProject}>
            <Plus size={14} /> New Project
          </button>
        </div>

        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width:160 }}>
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
          <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width:160 }}>
            <option value="all">All Priority</option>
            {Object.entries(priorityConfig).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>

        {filtered.length === 0
          ? <EmptyState icon={FolderOpen} title="No projects found" desc="Try adjusting filters." />
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {filtered.map(project => {
                const progress  = getProjectProgress(project.p_id);
                const lead      = getUserById(project.created_by);
                const members   = getProjectMembers(project);
                const pTasks    = tasks.filter(t => t.p_id === project.p_id && !t.is_deleted);
                const doneTasks = pTasks.filter(t => t.status === 'done').length;
                const health    = progress >= 70 ? '#10b981' : progress >= 40 ? '#fbbf24' : '#f43f5e';

                return (
                  <div key={project.p_id} className="card animate-fade-in lp-project-card"
                    onClick={() => navigate(`/supervisor/projects/${project.p_id}`)}>

                    {/* ── TOP ROW: badges LEFT · actions RIGHT — never overlap ── */}
                    <div className="lp-card-top" onClick={e => e.stopPropagation()}>
                      <div className="lp-card-badges">
                        <PriorityBadge priority={project.priority} />
                        <StatusBadge   status={project.status} />
                      </div>
                      <div className="lp-card-actions">
                        <button className="lp-icon-btn" title="View Tasks"
                          onClick={() => setTaskListModal(project)}>
                          <ListTodo size={13}/>
                        </button>
                        <button className="lp-icon-btn" title="Edit Project"
                          onClick={() => { setEditProject(project); setForm({ ...project, members: project.members || [] }); setProjectModal(true); }}>
                          <Pencil size={13}/>
                        </button>
                        <button className="lp-icon-btn" title="Add Task"
                          onClick={e => openAddTask(project, e)}>
                          <Plus size={13}/>
                        </button>
                        <button className="lp-icon-btn danger" title="Delete Project"
                          onClick={() => setDeleteProjectId(project.p_id)}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>

                    {/* title + desc */}
                    <div className="lp-card-body">
                      <h3 style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{project.p_name}</h3>
                      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{project.desc}</p>
                    </div>

                    {/* progress */}
                    <div className="lp-card-body">
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                        <span>Progress</span>
                        <span style={{ fontWeight:600, color:health }}>{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width:`${progress}%`, background:health }}/>
                      </div>
                    </div>

                    {/* lead + tasks */}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'0 16px' }}>
                      <div><p style={{ fontSize:10 }}>Lead</p><p>{lead?.u_name}</p></div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:10 }}>Tasks</p>
                        <p>{doneTasks}/{pTasks.length}</p>
                      </div>
                    </div>

                    {/* members footer */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border-subtle)', paddingTop:10, margin:'0 16px' }}>
                      <AvatarGroup members={members} max={4}/>
                      {members.length > 0 && (
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                          {members.length} member{members.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {/* TASK LIST MODAL */}
      {taskListModal && !selectedTask && !editTask && (
        <div className="lp-overlay" onClick={() => { setTaskListModal(null); setEditMembersFor(null); }}>
          <div className="lp-modal lp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <div>
                <h2 className="lp-modal-title"><ListTodo size={17}/> {taskListModal.p_name}</h2>
                <p className="lp-modal-sub">All tasks · click a task to view details</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={e => openAddTask(taskListModal, e)}>
                  <Plus size={13}/> Add Task
                </button>
                <button className="lp-icon-btn" onClick={() => { setTaskListModal(null); setEditMembersFor(null); }}><X size={16}/></button>
              </div>
            </div>

            <div className="lp-modal-body-split">
              <div className="lp-task-scroll">
                {tasks.filter(t => t.p_id === taskListModal.p_id && !t.is_deleted).length === 0
                  ? <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'32px 0' }}>No tasks yet.</p>
                  : tasks.filter(t => t.p_id === taskListModal.p_id && !t.is_deleted).map(t => (
                    <div key={t.t_id} className="lp-task-row" onClick={() => setSelectedTask(t)}>
                      <div className="lp-task-info">
                        <strong className="lp-task-title">{t.title}</strong>
                        {t.milestone && <span className="lp-milestone-tag"><Milestone size={10}/>{t.milestone}</span>}
                        {(t.assignedTo || []).length > 0 && (
                          <div style={{ display:'flex', gap:4, marginTop:2 }}>
                            {getMemberObjects(Array.isArray(t.assignedTo) ? t.assignedTo : [t.assignedTo]).map(m => (
                              <span key={m.tm_id} className="lp-task-assignee">
                                {(m.name || m.tm_name || '?')[0].toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="lp-task-meta">
                        <StatusBadge status={t.status}/>
                        <select className="lp-priority-select" value={t.priority}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); changeTaskPriority(t.t_id, e.target.value); }}>
                          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="lp-mini-progress">
                          <div className="lp-mini-track"><div className="lp-mini-fill" style={{ width:`${t.progress}%` }}/></div>
                          <span className="lp-mini-pct">{t.progress}%</span>
                        </div>
                      </div>
                      <div className="lp-task-actions" onClick={e => e.stopPropagation()}>
                        <button className="lp-icon-btn" title="Edit"
                          onClick={() => setEditTask({ ...t, assignedTo: Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []) })}>
                          <Pencil size={12}/>
                        </button>
                        <button className="lp-icon-btn danger" title="Delete" onClick={() => setDeleteTaskId(t.t_id)}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className="lp-members-sidebar">
                {editMembersFor === taskListModal.p_id ? (
                  <div>
                    <div className="lp-members-panel-header" style={{ marginBottom: 10 }}>
                      <Users size={14} /><span>Edit Members</span>
                    </div>
                    <MemberPicker
                      selected={taskListModal.members || []}
                      onChange={(nm) => setTaskListModal(prev => ({ ...prev, members: nm }))}
                      label=""
                    />
                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex:1 }}
                        onClick={() => saveProjectMembers(taskListModal.p_id, taskListModal.members || [])}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditMembersFor(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <ProjectMembersPanel
                    members={getProjectMembers(taskListModal)}
                    onEdit={() => setEditMembersFor(taskListModal.p_id)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="lp-overlay" onClick={() => setSelectedTask(null)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">{selectedTask.title}</h2>
              <button className="lp-icon-btn" onClick={() => setSelectedTask(null)}><X size={16}/></button>
            </div>
            <div className="lp-modal-body">
              <p className="lp-modal-desc">{selectedTask.desc || <em style={{ color:'var(--text-muted)' }}>No description.</em>}</p>
              <div className="lp-meta-row">
                <StatusBadge status={selectedTask.status}/>
                <PriorityBadge priority={selectedTask.priority}/>
              </div>
              {selectedTask.milestone && <div className="lp-milestone-tag lg"><Milestone size={12}/>{selectedTask.milestone}</div>}
              {(Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : (selectedTask.assignedTo ? [selectedTask.assignedTo] : [])).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Assigned To</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {getMemberObjects(Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : [selectedTask.assignedTo]).map(m => (
                      <span key={m.tm_id} className="lp-member-chip" style={{ cursor: 'default' }}>
                        <span className="lp-member-avatar-sm">{(m.name || m.tm_name || '?')[0].toUpperCase()}</span>
                        {m.name || m.tm_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="lp-progress-section">
                <div className="lp-progress-label-row">
                  <span className="lp-progress-label">Progress</span>
                  <span className="lp-progress-pct">{selectedTask.progress}%</span>
                </div>
                <div className="lp-progress-track">
                  <div className="lp-progress-fill" style={{ width:`${selectedTask.progress}%` }}/>
                </div>
              </div>
            </div>
            <div className="lp-modal-footer">
              <button className="btn btn-secondary btn-sm"
                onClick={() => { setEditTask({ ...selectedTask, assignedTo: Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : (selectedTask.assignedTo ? [selectedTask.assignedTo] : []) }); setSelectedTask(null); }}>
                <Pencil size={12}/> Edit
              </button>
              <button className="btn btn-danger btn-sm"
                onClick={() => { setDeleteTaskId(selectedTask.t_id); setSelectedTask(null); }}>
                <Trash2 size={12}/> Delete
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTask(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editTask && (
        <div className="lp-overlay" onClick={() => setEditTask(null)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">Edit Task</h2>
              <button className="lp-icon-btn" onClick={() => setEditTask(null)}><X size={16}/></button>
            </div>
            <div className="lp-modal-body lp-edit-form">
              <label className="lp-label">Title</label>
              <input className="input lp-input" value={editTask.title}
                onChange={e => setEditTask({ ...editTask, title: e.target.value })}/>
              <label className="lp-label">Description</label>
              <textarea className="input lp-input lp-textarea" value={editTask.desc || ''}
                onChange={e => setEditTask({ ...editTask, desc: e.target.value })}/>
              <div className="lp-form-2col">
                <div>
                  <label className="lp-label">Priority</label>
                  <select className="input lp-input" value={editTask.priority}
                    onChange={e => setEditTask({ ...editTask, priority: e.target.value })}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lp-label">Status</label>
                  <select className="input lp-input" value={editTask.status}
                    onChange={e => setEditTask({ ...editTask, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <MemberPicker
                selected={Array.isArray(editTask.assignedTo) ? editTask.assignedTo : (editTask.assignedTo ? [editTask.assignedTo] : [])}
                onChange={ids => setEditTask({ ...editTask, assignedTo: ids })}
                label="Assign To"
              />
              <label className="lp-label">Milestone</label>
              <input className="input lp-input" placeholder="e.g. Phase 1 Release"
                value={editTask.milestone || ''} onChange={e => setEditTask({ ...editTask, milestone: e.target.value })}/>
              <label className="lp-label">Progress: <strong>{editTask.progress}%</strong></label>
              <input type="range" min={0} max={100} className="lp-range" value={editTask.progress}
                onChange={e => setEditTask({ ...editTask, progress: Number(e.target.value) })}/>
            </div>
            <div className="lp-modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => handleUpdateTask(editTask)}>Save Changes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {taskAddModal && (
        <div className="lp-overlay" onClick={() => setTaskAddModal(null)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">Add Task · {taskAddModal.p_name}</h2>
              <button className="lp-icon-btn" onClick={() => setTaskAddModal(null)}><X size={16}/></button>
            </div>
            <div className="lp-modal-body lp-edit-form">
              <label className="lp-label">Task Title *</label>
              <input className="input lp-input" placeholder="Enter task title" value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}/>
              <label className="lp-label">Description</label>
              <textarea className="input lp-input lp-textarea" placeholder="Brief description..." value={taskForm.desc}
                onChange={e => setTaskForm({ ...taskForm, desc: e.target.value })}/>
              <div className="lp-form-2col">
                <div>
                  <label className="lp-label">Priority *</label>
                  <select className="input lp-input" value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lp-label">Status</label>
                  <select className="input lp-input" value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <MemberPicker selected={taskForm.assignedTo}
                onChange={ids => setTaskForm({ ...taskForm, assignedTo: ids })} label="Assign Members"/>
              <label className="lp-label">Milestone</label>
              <input className="input lp-input" placeholder="e.g. Phase 1 Release" value={taskForm.milestone}
                onChange={e => setTaskForm({ ...taskForm, milestone: e.target.value })}/>
              <label className="lp-label">Initial Progress: <strong>{taskForm.progress}%</strong></label>
              <input type="range" min={0} max={100} className="lp-range" value={taskForm.progress}
                onChange={e => setTaskForm({ ...taskForm, progress: Number(e.target.value) })}/>
            </div>
            <div className="lp-modal-footer">
              <button className="btn btn-primary btn-sm" onClick={addTask}>Add Task</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setTaskAddModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TASK */}
      {deleteTaskId !== null && (
        <div className="lp-overlay" onClick={() => setDeleteTaskId(null)}>
          <div className="lp-modal lp-confirm" onClick={e => e.stopPropagation()}>
            <h3 className="lp-confirm-title">Delete Task?</h3>
            <p style={{ color:'var(--text-muted)', marginBottom:20, fontSize:13 }}>This cannot be undone.</p>
            <div className="lp-modal-footer" style={{ justifyContent:'center' }}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(deleteTaskId)}>Yes, Delete</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTaskId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PROJECT */}
      {deleteProjectId !== null && (
        <div className="lp-overlay" onClick={() => setDeleteProjectId(null)}>
          <div className="lp-modal lp-confirm" onClick={e => e.stopPropagation()}>
            <h3 className="lp-confirm-title">Delete Project?</h3>
            <p style={{ color:'var(--text-muted)', marginBottom:20, fontSize:13 }}>All tasks will also be removed.</p>
            <div className="lp-modal-footer" style={{ justifyContent:'center' }}>
              <button className="btn btn-danger btn-sm" onClick={() => {
                setProjects(prev => prev.filter(p => p.p_id !== deleteProjectId));
                setTasks(prev => prev.filter(t => t.p_id !== deleteProjectId));
                setDeleteProjectId(null);
              }}>Yes, Delete</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteProjectId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {projectModal && (
        <div className="lp-overlay" onClick={() => setProjectModal(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">{editProject ? 'Update Project' : 'Create New Project'}</h2>
              <button className="lp-icon-btn" onClick={() => setProjectModal(false)}><X size={16}/></button>
            </div>
            <div className="lp-modal-body lp-edit-form">
              <label className="lp-label">Project Name *</label>
              <input className="input lp-input" placeholder="Enter project name" value={form.p_name}
                onChange={e => setForm({ ...form, p_name: e.target.value })}/>
              <label className="lp-label">Description</label>
              <textarea className="input lp-input lp-textarea" rows={3} placeholder="Write project description..."
                value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}/>
              <div className="lp-form-2col">
                <div>
                  <label className="lp-label">Priority *</label>
                  <select className="input lp-input" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="lp-label">Status *</label>
                  <select className="input lp-input" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>
              <MemberPicker selected={form.members}
                onChange={ids => setForm({ ...form, members: ids })} label="Project Members"/>
              <div className="lp-form-2col">
                <div>
                  <label className="lp-label">Start Date</label>
                  <input type="date" className="input lp-input" value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}/>
                </div>
                <div>
                  <label className="lp-label">End Date</label>
                  <input type="date" className="input lp-input" value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}/>
                </div>
              </div>
            </div>
            <div className="lp-modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setProjectModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveProject}>
                {editProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lp-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }

        .lp-modal {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 20px;
          width: 100%; max-width: 520px; max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
          animation: lp-in 0.2s ease;
          scrollbar-width: thin;
          scrollbar-color: var(--border-default) transparent;
        }

        .lp-modal-wide { max-width: 800px; }

        @keyframes lp-in {
          from { opacity:0; transform: translateY(14px) scale(0.97); }
          to   { opacity:1; transform: none; }
        }

        .lp-modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; padding: 20px 20px 14px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .lp-modal-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 17px; font-weight: 700; color: var(--text-primary);
        }

        .lp-modal-sub { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

        .lp-modal-body-split {
          display: grid;
          grid-template-columns: 1fr 220px;
          min-height: 300px;
          max-height: calc(90vh - 130px);
          overflow: hidden;
        }

        .lp-modal-body  { padding: 18px 20px; }

        .lp-modal-footer {
          display: flex; gap: 10px; padding: 14px 20px 20px;
          border-top: 1px solid var(--border-subtle); justify-content: flex-end;
        }

        .lp-modal-desc {
          font-size: 14px; color: var(--text-secondary);
          line-height: 1.6; margin-bottom: 14px;
        }

        /* ══ PROJECT CARD ══ */
        .lp-project-card {
          padding: 0 0 14px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
          overflow: hidden;
          cursor: pointer;
        }

        /* KEY: top row — badges flex-left, actions flex-right, no overlap */
        .lp-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px 0;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .lp-card-badges {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }

        .lp-card-badges > * {
          font-size: 10.5px !important;
          padding: 2px 7px !important;
          height: auto !important;
          line-height: 1.4 !important;
          border-radius: 7px !important;
          white-space: nowrap !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 3px !important;
          flex-shrink: 1 !important;
          box-sizing: border-box !important;
          max-width: 96px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        /* Action buttons — never shrink, always visible */
        .lp-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .lp-card-body { padding: 0 16px; }

        /* task scroll */
        .lp-task-scroll {
          max-height: 100%; overflow-y: auto;
          padding: 14px 20px;
          display: flex; flex-direction: column; gap: 10px;
          scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;
          border-right: 1px solid var(--border-subtle);
        }

        .lp-task-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          border: 1px solid var(--border-subtle); border-radius: 12px;
          background: var(--bg-secondary); cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s; flex-wrap: wrap;
        }

        .lp-task-row:hover { border-color: var(--accent-primary); box-shadow: 0 2px 10px rgba(0,0,0,0.08); }

        .lp-task-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

        .lp-task-title {
          font-size: 13px; font-weight: 600; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .lp-task-assignee {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 50%;
          background: color-mix(in srgb, var(--accent-primary) 20%, transparent);
          color: var(--accent-primary); font-size: 10px; font-weight: 700;
          border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent);
        }

        .lp-task-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .lp-task-actions { display: flex; gap: 5px; flex-shrink: 0; }

        .lp-priority-select {
          font-size: 11px; font-weight: 600; padding: 3px 8px;
          border-radius: 8px; border: 1px solid var(--border-default);
          background: var(--bg-card); color: var(--text-primary);
          cursor: pointer; outline: none;
        }

        .lp-priority-select:focus { border-color: var(--accent-primary); }

        .lp-mini-progress { display: flex; align-items: center; gap: 6px; }
        .lp-mini-track { width: 70px; height: 5px; background: var(--border-subtle); border-radius: 10px; overflow: hidden; }
        .lp-mini-fill { height: 100%; background: var(--accent-primary); border-radius: 10px; transition: width 0.3s; }
        .lp-mini-pct { font-size: 11px; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }

        .lp-milestone-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; color: var(--accent-primary);
          background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
          border-radius: 7px; padding: 2px 8px;
        }

        .lp-milestone-tag.lg { font-size: 12px; padding: 4px 10px; margin-bottom: 12px; }

        .lp-progress-section { margin-top: 16px; }
        .lp-progress-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .lp-progress-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .lp-progress-pct   { font-size: 15px; font-weight: 800; color: var(--accent-primary); }
        .lp-progress-track { width: 100%; height: 10px; background: var(--border-subtle); border-radius: 10px; overflow: hidden; }
        .lp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 60%, #a78bfa));
          border-radius: 10px; transition: width 0.4s ease;
        }

        .lp-meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }

        .lp-edit-form { display: flex; flex-direction: column; gap: 10px; }

        .lp-label {
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
          margin-bottom: 3px; display: block;
        }

        .lp-input {
          width: 100%; box-sizing: border-box; padding: 9px 12px;
          border-radius: 9px; font-size: 13px;
          background: var(--bg-secondary); border: 1px solid var(--border-default);
          color: var(--text-primary);
        }

        .lp-textarea { min-height: 80px; resize: vertical; }
        .lp-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .lp-range { width: 100%; accent-color: var(--accent-primary); cursor: pointer; }

        .lp-confirm { max-width: 360px; text-align: center; padding-top: 28px; }
        .lp-confirm-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }

        .lp-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 5px 6px; border-radius: 7px;
          border: 1px solid var(--border-subtle); background: var(--bg-card);
          color: var(--text-secondary); cursor: pointer; transition: all 0.14s;
        }

        .lp-icon-btn:hover { background: var(--bg-primary); color: var(--accent-primary); border-color: var(--accent-primary); }
        .lp-icon-btn.danger:hover { color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,0.07); }

        .btn-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
        .btn-danger:hover { background: rgba(239,68,68,0.2); }
        .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-default); }
        .btn-secondary:hover { border-color: var(--accent-primary); }

        /* member picker */
        .lp-member-trigger {
          display: flex; align-items: center; gap: 8px; width: 100%; min-height: 42px;
          padding: 8px 12px; border-radius: 9px; border: 1px solid var(--border-default);
          background: var(--bg-secondary); color: var(--text-primary);
          cursor: pointer; text-align: left; font-size: 13px;
          transition: border-color 0.15s; flex-wrap: wrap;
        }

        .lp-member-trigger:hover,
        .lp-member-trigger:focus { border-color: var(--accent-primary); outline: none; }

        .lp-picker-backdrop { position: fixed; inset: 0; z-index: 10; }

        .lp-member-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: var(--bg-card); border: 1px solid var(--border-default);
          border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          z-index: 20; max-height: 220px; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;
        }

        .lp-member-option {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 10px 14px; border: none; background: transparent;
          color: var(--text-primary); cursor: pointer; transition: background 0.12s; text-align: left;
        }

        .lp-member-option:hover { background: var(--bg-secondary); }
        .lp-member-option.selected { background: color-mix(in srgb, var(--accent-primary) 8%, transparent); }

        .lp-member-avatar {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: color-mix(in srgb, var(--accent-primary) 20%, transparent);
          color: var(--accent-primary); font-size: 12px; font-weight: 700; flex-shrink: 0;
        }

        .lp-member-avatar-sm {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 50%;
          background: color-mix(in srgb, var(--accent-primary) 20%, transparent);
          color: var(--accent-primary); font-size: 10px; font-weight: 700; flex-shrink: 0;
        }

        .lp-member-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px 3px 4px; border-radius: 20px;
          background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent);
          color: var(--text-primary); font-size: 12px; font-weight: 500;
        }

        .lp-chip-remove {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 1px; border: none; background: transparent; color: var(--text-muted);
          cursor: pointer; border-radius: 50%; transition: color 0.12s, background 0.12s; margin-left: 2px;
        }

        .lp-chip-remove:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

        .lp-members-sidebar {
          padding: 16px; overflow-y: auto; background: var(--bg-secondary);
          scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;
        }

        .lp-members-panel-header {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; color: var(--text-secondary);
          text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px;
        }

        .lp-members-list { display: flex; flex-direction: column; gap: 8px; }

        .lp-member-row {
          display: flex; align-items: center; gap: 8px; padding: 6px 8px;
          border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border-subtle);
        }

        @media (max-width: 600px) {
          .lp-modal-body-split { grid-template-columns: 1fr; grid-template-rows: auto auto; }
          .lp-members-sidebar { border-top: 1px solid var(--border-subtle); }
          .lp-task-scroll { border-right: none; max-height: 300px; }
        }

        @media (max-width: 480px) {
          .lp-form-2col { grid-template-columns: 1fr; }
          .lp-task-meta { gap: 6px; }
          .lp-mini-track { width: 50px; }
          .lp-card-actions { gap: 3px; }
          .lp-icon-btn { padding: 4px 5px; }
          .lp-card-badges > * { max-width: 76px !important; font-size: 10px !important; }
        }
      `}</style>
    </div>
  );
}