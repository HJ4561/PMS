import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Plus, Users, CheckSquare, MessageSquare, Pin, Search,
  Trash2, Edit3, X, MoreHorizontal, Calendar, User, Flag, ChevronDown
} from 'lucide-react';
import Topbar from '../shared/Topbar';
import {
  PROJECTS, TASKS, COMMENTS, P_TEAMS, TEAM_MEMBERS, getProjectProgress,
  priorityConfig, statusConfig, getTeamMemberById, getUserById
} from '../../data/mockData';
import { PriorityBadge, StatusBadge, Avatar, AvatarGroup, ProgressRing, EmptyState, Modal } from '../shared/UIComponents';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const projectId = parseInt(id);

  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState(TASKS);
  const [comments, setComments] = useState(COMMENTS);
  const [pTeams, setPTeams] = useState(P_TEAMS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentPriority, setCommentPriority] = useState('medium');
  const [taskForm, setTaskForm] = useState({ title: '', desc: '', priority: 'medium', status: 'todo', assign_to: '', due_date: '' });

  const project = PROJECTS.find(p => p.p_id === projectId);
  if (!project) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Project not found</div>;

  const projectTasks = tasks.filter(t => t.p_id === projectId && !t.is_deleted);
  const projectComments = comments.filter(c => c.t_id === selectedTask?.t_id);
  const ptEntries = pTeams.filter(pt => pt.p_id === projectId);
  const memberIds = [...new Set(ptEntries.map(pt => pt.tm_id))];
  const projectMembers = TEAM_MEMBERS.filter(tm => memberIds.includes(tm.tm_id));
  const availableMembers = TEAM_MEMBERS.filter(tm => !memberIds.includes(tm.tm_id) && !tm.is_deleted);
  const progress = getProjectProgress(projectId);

  // Group tasks by status
  const taskGroups = {
    todo: projectTasks.filter(t => t.status === 'todo'),
    'in-progress': projectTasks.filter(t => t.status === 'in-progress'),
    review: projectTasks.filter(t => t.status === 'review'),
    done: projectTasks.filter(t => t.status === 'done')
  };

  const handleAddTask = () => {
    if (!taskForm.title.trim()) return toast.error('Task title required');
    const newTask = {
      t_id: Date.now(),
      ...taskForm,
      assign_to: taskForm.assign_to ? parseInt(taskForm.assign_to) : null,
      assign_by: user.u_id,
      created_by: user.u_id,
      created_at: new Date().toISOString().split('T')[0],
      update_last: new Date().toISOString().split('T')[0],
      p_id: projectId,
      is_deleted: false
    };
    TASKS.push(newTask);
    setTasks([...TASKS]);
    setShowAddTask(false);
    setTaskForm({ title: '', desc: '', priority: 'medium', status: 'todo', assign_to: '', due_date: '' });
    toast.success('Task created!');
  };

  const handleAddMember = (tm_id) => {
    const newEntry = { pt_id: Date.now(), p_id: projectId, t_id: projectId, tm_id };
    P_TEAMS.push(newEntry);
    setPTeams([...P_TEAMS]);
    toast.success('Team member added to project!');
    setShowAddMember(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    const newCmt = {
      c_id: Date.now(),
      t_id: selectedTask.t_id,
      u_id: user.u_id,
      desc: newComment.trim(),
      created_at: new Date().toLocaleString(),
      updated_at: new Date().toLocaleString(),
      priority: commentPriority,
      pin: false
    };
    COMMENTS.push(newCmt);
    setComments([...COMMENTS]);
    setNewComment('');
    toast.success('Comment added!');
  };

  const togglePin = (c_id) => {
    const idx = COMMENTS.findIndex(c => c.c_id === c_id);
    if (idx >= 0) {
      COMMENTS[idx].pin = !COMMENTS[idx].pin;
      setComments([...COMMENTS]);
    }
  };

  const updateTaskStatus = (t_id, newStatus) => {
    const idx = TASKS.findIndex(t => t.t_id === t_id);
    if (idx >= 0) {
      TASKS[idx].status = newStatus;
      setTasks([...TASKS]);
      if (selectedTask?.t_id === t_id) setSelectedTask({ ...selectedTask, status: newStatus });
      toast.success(`Task moved to ${statusConfig[newStatus]?.label}`);
    }
  };

  const COLORS = { purple: '#6c63ff', teal: '#2dd4bf', amber: '#fbbf24', rose: '#f43f5e', green: '#10b981' };
  const healthColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#fbbf24' : '#f43f5e';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title={project.p_name}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/lead/projects')}>
            <ArrowLeft size={14} /> Back
          </button>
        }
      />

      {/* Project header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <ProgressRing progress={progress} size={56} strokeWidth={5} color={healthColor} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <PriorityBadge priority={project.priority} />
              <StatusBadge status={project.status} />
              <span className="badge badge-gray"><Calendar size={10} /> {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{project.desc}</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            {[
              { label: 'Tasks', value: projectTasks.length },
              { label: 'Done', value: projectTasks.filter(t => t.status === 'done').length },
              { label: 'Members', value: projectMembers.length }
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        {[
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'members', label: 'Team Members', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', background: activeTab === tab.id ? 'rgba(108,99,255,0.12)' : 'transparent', color: activeTab === tab.id ? 'var(--accent-secondary)' : 'var(--text-secondary)', transition: 'all 0.15s' }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {activeTab === 'tasks' && (
          <>
            {/* Kanban board */}
            <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '20px 32px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {Object.entries(taskGroups).map(([status, statusTasks]) => {
                const cfg = statusConfig[status];
                return (
                  <div key={status} style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg?.color || '#6c63ff' }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cfg?.label}</span>
                        <span style={{ fontSize: 12, background: 'var(--bg-hover)', padding: '1px 7px', borderRadius: 100, color: 'var(--text-muted)' }}>{statusTasks.length}</span>
                      </div>
                      {status === 'todo' && (
                        <button className="btn btn-ghost btn-icon" style={{ padding: 4 }} onClick={() => setShowAddTask(true)}>
                          <Plus size={14} />
                        </button>
                      )}
                    </div>

                    {/* Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', paddingRight: 4 }}>
                      {statusTasks.map(task => {
                        const assignee = task.assign_to ? getTeamMemberById(task.assign_to) : null;
                        const taskCommentCount = COMMENTS.filter(c => c.t_id === task.t_id).length;
                        const isSelected = selectedTask?.t_id === task.t_id;

                        return (
                          <div
                            key={task.t_id}
                            onClick={() => setSelectedTask(isSelected ? null : task)}
                            style={{ padding: '14px', background: isSelected ? 'rgba(108,99,255,0.08)' : 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border-subtle)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-default)')}
                            onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                          >
                            <PriorityBadge priority={task.priority} />
                            <p style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 4px', lineHeight: 1.4 }}>{task.title}</p>
                            {task.desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.desc}</p>}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                              {assignee ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Avatar name={assignee.name} color={assignee.avatar_color || '#6c63ff'} size="sm" />
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{assignee.name.split(' ')[0]}</span>
                                </div>
                              ) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unassigned</span>}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {taskCommentCount > 0 && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                                    <MessageSquare size={11} /> {taskCommentCount}
                                  </span>
                                )}
                                {task.due_date && (
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task detail panel */}
            {selectedTask && (
              <div style={{ width: 380, borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', animation: 'slideInRight 0.3s ease' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Task Detail</h3>
                  <button className="btn btn-ghost btn-icon" onClick={() => setSelectedTask(null)}><X size={16} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {/* Task info */}
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{selectedTask.title}</h2>
                  {selectedTask.desc && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{selectedTask.desc}</p>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, padding: 14, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
                      <select
                        className="badge"
                        value={selectedTask.status}
                        onChange={e => updateTaskStatus(selectedTask.t_id, e.target.value)}
                        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: statusConfig[selectedTask.status]?.color, cursor: 'pointer', borderRadius: 100, fontSize: 12, outline: 'none' }}
                      >
                        {Object.entries(statusConfig).map(([v, c]) => (
                          <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority</span>
                      <PriorityBadge priority={selectedTask.priority} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assignee</span>
                      {selectedTask.assign_to ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {(() => {
                            const m = getTeamMemberById(selectedTask.assign_to);
                            return m ? <><Avatar name={m.name} color={m.avatar_color || '#6c63ff'} size="sm" /><span style={{ fontSize: 12 }}>{m.name}</span></> : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unknown</span>;
                          })()}
                        </div>
                      ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>}
                    </div>
                    {selectedTask.due_date && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due</span>
                        <span style={{ fontSize: 12 }}>{new Date(selectedTask.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                        Comments <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>({projectComments.length})</span>
                      </h4>
                    </div>

                    {/* Pinned comments first */}
                    {[...projectComments].sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0)).map(cmt => {
                      const author = getUserById(cmt.u_id);
                      const priCfg = priorityConfig[cmt.priority];
                      return (
                        <div key={cmt.c_id} style={{ marginBottom: 10, padding: 12, background: cmt.pin ? 'rgba(251,191,36,0.05)' : 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: `1px solid ${cmt.pin ? 'rgba(251,191,36,0.2)' : 'var(--border-subtle)'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Avatar name={author?.u_name || 'U'} color={author?.avatar_color || '#6c63ff'} size="sm" />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{author?.u_name}</span>
                            <span className={`badge ${priCfg?.badge}`} style={{ fontSize: 10, padding: '2px 6px' }}>{priCfg?.label}</span>
                            {cmt.pin && <span style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}><Pin size={10} /> Pinned</span>}
                            <button
                              onClick={() => togglePin(cmt.c_id)}
                              className="btn btn-ghost btn-icon"
                              style={{ marginLeft: 'auto', padding: 3, color: cmt.pin ? '#fbbf24' : 'var(--text-muted)' }}
                              title={cmt.pin ? 'Unpin' : 'Pin'}
                            >
                              <Pin size={12} />
                            </button>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cmt.desc}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{cmt.created_at}</p>
                        </div>
                      );
                    })}

                    {projectComments.length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No comments yet. Add the first one!</p>
                    )}
                  </div>
                </div>

                {/* Add comment */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ marginBottom: 10, resize: 'none' }}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddComment(); }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      className="input"
                      value={commentPriority}
                      onChange={e => setCommentPriority(e.target.value)}
                      style={{ flex: 1, appearance: 'none', cursor: 'pointer', fontSize: 13 }}
                    >
                      {Object.entries(priorityConfig).map(([v, c]) => (
                        <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label} Priority</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      style={{ opacity: !newComment.trim() ? 0.5 : 1 }}
                    >
                      <MessageSquare size={14} /> Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'members' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{projectMembers.length} members in this project</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
                <Plus size={14} /> Add Member
              </button>
            </div>
            {projectMembers.length === 0 ? (
              <EmptyState icon={Users} title="No members yet" desc="Add team members to start assigning tasks." action={<button className="btn btn-primary" onClick={() => setShowAddMember(true)}><Plus size={16} /> Add Member</button>} />
            ) : (
              <div className="grid-auto stagger-children">
                {projectMembers.map((member, i) => {
                  const memberTasks = tasks.filter(t => t.assign_to === member.tm_id && t.p_id === projectId);
                  const doneTasks = memberTasks.filter(t => t.status === 'done').length;
                  return (
                    <div key={member.tm_id} className="card animate-fade-in" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                        <Avatar name={member.name} color={member.avatar_color || '#6c63ff'} size="lg" />
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{member.name}</h3>
                          <span className="badge badge-purple" style={{ fontSize: 11 }}>{member.role}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{member.qualification} · {member.experience} yrs</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                        {member.skills.split(', ').slice(0, 3).map(s => (
                          <span key={s} className="badge badge-gray" style={{ fontSize: 11 }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{memberTasks.length}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tasks</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: '#10b981' }}>{doneTasks}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Done</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Create New Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label>Task Title *</label>
            <input className="input" placeholder="e.g. Setup authentication module" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input" rows={3} placeholder="Task details..." value={taskForm.desc} onChange={e => setTaskForm(f => ({ ...f, desc: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Priority</label>
              <select className="input" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} style={{ appearance: 'none', cursor: 'pointer' }}>
                {Object.entries(priorityConfig).map(([v, c]) => <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select className="input" value={taskForm.status} onChange={e => setTaskForm(f => ({ ...f, status: e.target.value }))} style={{ appearance: 'none', cursor: 'pointer' }}>
                {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Assign To</label>
              <select className="input" value={taskForm.assign_to} onChange={e => setTaskForm(f => ({ ...f, assign_to: e.target.value }))} style={{ appearance: 'none', cursor: 'pointer' }}>
                <option value="" style={{ background: 'var(--bg-card)' }}>Unassigned</option>
                {projectMembers.map(m => <option key={m.tm_id} value={m.tm_id} style={{ background: 'var(--bg-card)' }}>{m.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Due Date</label>
              <input className="input" type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowAddTask(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddTask}><Plus size={16} /> Create Task</button>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Team Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {availableMembers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>All team members are already in this project!</p>
          ) : availableMembers.map(m => (
            <div key={m.tm_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Avatar name={m.name} color={m.avatar_color || '#6c63ff'} size="md" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.role} · {m.experience} yrs</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(m.tm_id)}>
                <Plus size={13} /> Add
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}