import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, FolderOpen, Calendar, ArrowRight } from 'lucide-react';
import Topbar from '../shared/Topbar';
import { PROJECTS, TASKS, TEAM_MEMBERS, P_TEAMS, getProjectProgress, priorityConfig, statusConfig } from '../../data/mockData';
import { PriorityBadge, StatusBadge, ProgressRing, AvatarGroup, EmptyState, Modal, Select } from '../shared/UIComponents';
import toast from 'react-hot-toast';

export default function LeadProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState(PROJECTS);
  const [form, setForm] = useState({ p_name: '', desc: '', priority: 'medium', deadline: '', status: 'planning' });

  const myProjects = projects.filter(p => p.created_by === user.u_id && !p.is_deleted);
  const filtered = myProjects.filter(p => {
    const matchSearch = p.p_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    if (!form.p_name.trim() || !form.deadline) return toast.error('Please fill in project name and deadline');
    const newProject = {
      p_id: Date.now(),
      ...form,
      created_by: user.u_id,
      created_at: new Date().toISOString().split('T')[0],
      start_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      is_deleted: false
    };
    PROJECTS.push(newProject);
    setProjects([...PROJECTS]);
    setShowCreate(false);
    setForm({ p_name: '', desc: '', priority: 'medium', deadline: '', status: 'planning' });
    toast.success('Project created successfully!');
  };

  return (
    <div>
      <Topbar
        title="My Projects"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New Project
          </button>
        }
      />
      <div className="page-container">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160, appearance: 'none', cursor: 'pointer' }}>
            <option value="all" style={{ background: 'var(--bg-card)' }}>All Status</option>
            {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            desc="Create your first project and start managing your team's work."
            action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Project</button>}
          />
        ) : (
          <div className="grid-auto stagger-children">
            {filtered.map(project => {
              const progress = getProjectProgress(project.p_id);
              const ptEntries = P_TEAMS.filter(pt => pt.p_id === project.p_id);
              const memberIds = [...new Set(ptEntries.map(pt => pt.tm_id))];
              const members = TEAM_MEMBERS.filter(tm => memberIds.includes(tm.tm_id));
              const tasks = TASKS.filter(t => t.p_id === project.p_id && !t.is_deleted);
              const healthColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#fbbf24' : '#f43f5e';

              return (
                <div
                  key={project.p_id}
                  className="card animate-fade-in"
                  style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16 }}
                  onClick={() => navigate(`/lead/projects/${project.p_id}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <PriorityBadge priority={project.priority} />
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{project.p_name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.desc}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: healthColor }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: healthColor }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AvatarGroup members={members} max={4} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Calendar size={12} />
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tasks.length} tasks · {members.length} members</span>
                    <ArrowRight size={14} style={{ color: 'var(--accent-secondary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label>Project Name *</label>
            <input className="input" placeholder="e.g. Apollo CRM Platform" value={form.p_name} onChange={e => setForm(f => ({ ...f, p_name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input" rows={3} placeholder="Describe the project goals..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ appearance: 'none', cursor: 'pointer' }}>
                {Object.entries(priorityConfig).map(([v, c]) => <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ appearance: 'none', cursor: 'pointer' }}>
                {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Deadline *</label>
            <input className="input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}><Plus size={16} /> Create Project</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}