// components/lead/LeadTeamMembers.jsx
import { useState } from 'react';
import { Search, UserPlus, Trash2, Pencil, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Topbar from '../shared/Topbar';
import {
  TEAM_MEMBERS,
  getMemberStats,
  getUserById
} from '../../data/mockData';
import { ProgressRing, Modal } from '../shared/UIComponents';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '',
  role: '',
  qualification: '',
  experience: '',
  skills: '',
  email: ''
};

export default function LeadTeamMembers() {
  const [search, setSearch] = useState('');
  const { onMenuClick } = useOutletContext();

  const [members, setMembers] = useState(
    TEAM_MEMBERS.filter(m => !m.is_deleted)
  );

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const colors = [
    '#6366f1','#2dd4bf','#f43f5e','#f59e0b',
    '#10b981','#f97316','#ec4899','#a78bfa'
  ];

  const filtered = members.filter(m => {
    const skills = m.skills || '';
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      skills.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAdd = () => {
    const { name, role, email, qualification, experience, skills } = form;
    if (!name.trim()) return toast.error('Name is required');
    if (!role.trim()) return toast.error('Role is required');
    if (!email.trim()) return toast.error('Email is required');
    if (!qualification.trim()) return toast.error('Qualification is required');
    if (!experience.toString().trim()) return toast.error('Experience is required');
    if (!skills.trim()) return toast.error('Skills are required');

    const newMember = {
      tm_id: Date.now(),
      ...form,
      experience: parseInt(experience) || 0,
      added_by: 1,
      is_deleted: false,
      avatar_color: colors[Math.floor(Math.random() * colors.length)]
    };

    TEAM_MEMBERS.push(newMember);
    setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
    setShowAdd(false);
    setForm(defaultForm);
    toast.success('Member added successfully');
  };

  const handleDelete = (id) => {
    const index = TEAM_MEMBERS.findIndex(m => m.tm_id === id);
    if (index !== -1) {
      TEAM_MEMBERS[index].is_deleted = true;
      setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
      toast.success('Member removed');
    }
  };

  const openEdit = (member) => {
    setSelected(member);
    setForm(member);
    setShowEdit(true);
  };

  const handleUpdate = () => {
    const index = TEAM_MEMBERS.findIndex(m => m.tm_id === selected.tm_id);
    if (index !== -1) {
      TEAM_MEMBERS[index] = {
        ...TEAM_MEMBERS[index],
        ...form,
        experience: parseInt(form.experience) || 0
      };
      setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
      setShowEdit(false);
      toast.success('Updated successfully');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const closeAddModal = () => { setShowAdd(false); setForm(defaultForm); };
  const closeEditModal = () => { setShowEdit(false); setSelected(null); setForm(defaultForm); };

  return (
    <div>
      <Topbar
        title="Team Members"
        onMenuClick={onMenuClick}
        searchBar={
          <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search by name, role, or skills…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: '100%' }} />
          </div>
        }
      />

      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <UserPlus size={14} /> Add Member
          </button>
        </div>

        <div className="grid-auto stagger-children">
          {filtered.map((member, i) => {
            const stats = getMemberStats(member.tm_id);
            const color = member.avatar_color || colors[i % colors.length];
            const addedBy = getUserById(member.added_by);
            const skills = member.skills || '';
            const onTimeRate = stats.completedTasks > 0
              ? Math.round((stats.completedOnTime / stats.completedTasks) * 100) : 0;
            const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

            return (
              <motion.div
                key={member.tm_id}
                className="member-card animate-fade-in"
                whileHover={{ scale: 1.03 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => { if (info.offset.x < -120) handleDelete(member.tm_id); }}
                onClick={() => setDrawer(member)}
              >
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(member); }}>
                    <Pencil size={12} />
                  </button>
                  <button className="btn btn-danger btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(member.tm_id); }}>
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar avatar-lg" style={{ background: color + '22', color, border: `2px solid ${color}40`, width: 50, height: 50, fontSize: 17 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 14.5 }}>{member.name}</h3>
                    <span className="badge badge-purple" style={{ fontSize: 10.5 }}>{member.role}</span>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {member.qualification} · {member.experience} yrs exp
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {skills.split(', ').slice(0, 4).map(s => (
                    <span key={s} className="badge badge-gray" style={{ fontSize: 10.5 }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  {[{ label: 'Tasks', value: stats.totalTasks }, { label: 'Done', value: stats.completedTasks }, { label: 'Active', value: stats.inProgressTasks }].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: 10 }}>
                      <p style={{ fontWeight: 900 }}>{s.value}</p>
                      <p style={{ fontSize: 10 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ProgressRing progress={onTimeRate} size={44} strokeWidth={4} />
                  <div>
                    <p>{onTimeRate}% On-time</p>
                    {addedBy && <p style={{ fontSize: 11 }}>Added by {addedBy.u_name}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MEMBER DETAIL MODAL ── */}
      <AnimatePresence>
        {drawer && (() => {
          const stats = getMemberStats(drawer.tm_id);
          const onTimeRate = stats.completedTasks > 0
            ? Math.round((stats.completedOnTime / stats.completedTasks) * 100) : 0;

          const currentProjects = [
            { name: 'AI Travel Genie', role: 'Frontend Developer', progress: 82, status: 'In Progress' },
            { name: 'PMS Dashboard', role: 'UI Engineer', progress: 65, status: 'Ongoing' }
          ];

          const completedProjects = [
            { name: 'HR Management System', duration: '4 Months', performance: 'Excellent' },
            { name: 'CRM Portal', duration: '2 Months', performance: 'Very Good' },
            { name: 'Inventory System', duration: '3 Months', performance: 'Excellent' }
          ];

          const workHistory = [
            { year: '2026', text: 'Assigned to AI Travel Genie under Lead Ahmed' },
            { year: '2025', text: 'Completed CRM Portal successfully' },
            { year: '2025', text: 'Promoted to Senior Frontend Developer' },
            { year: '2024', text: 'Joined Development Team' }
          ];

          const initials = drawer.name.split(' ').map(n => n[0]).join('').toUpperCase();
          const color = drawer.avatar_color || '#6366f1';

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(null)}
              className="mm-overlay"
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ duration: 0.22 }}
                onClick={e => e.stopPropagation()}
                className="mm-modal"
              >
                {/* HEADER */}
                <div className="mm-header">
                  <div className="mm-header-inner">
                    <div className="mm-avatar" style={{ background: color + '22', border: `2px solid ${color}55`, color }}>
                      {initials}
                    </div>
                    <div className="mm-info">
                      <h2 className="mm-name">{drawer.name}</h2>
                      <div className="mm-badges">
                        <span className="badge badge-purple">{drawer.role}</span>
                        <span className="badge badge-green">Active</span>
                        <span className="badge badge-gray">{drawer.experience} yrs exp</span>
                      </div>
                      <p className="mm-email">{drawer.email}</p>
                    </div>
                  </div>
                  <button className="mm-close" onClick={() => setDrawer(null)}><X size={16} /></button>
                </div>

                {/* STATS ROW */}
                <div className="mm-stats-row">
                  {[
                    { label: 'Total Tasks', value: stats.totalTasks },
                    { label: 'Completed', value: stats.completedTasks },
                    { label: 'Active', value: stats.inProgressTasks },
                    { label: 'On-Time', value: onTimeRate + '%' }
                  ].map((s, i) => (
                    <div key={i} className="mm-stat-item">
                      <span className="mm-stat-val">{s.value}</span>
                      <span className="mm-stat-lbl">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* BODY */}
                <div className="mm-body">

                  {/* LEFT */}
                  <div className="mm-col">

                    {/* Skills */}
                    <div className="mm-section">
                      <p className="mm-section-title">Skills</p>
                      <div className="mm-skills">
                        {(drawer.skills || '').split(',').map((s, i) => (
                          <span key={i} className="badge badge-gray mm-skill-badge">{s.trim()}</span>
                        ))}
                      </div>
                    </div>

                    {/* Current Projects */}
                    <div className="mm-section">
                      <p className="mm-section-title">Current Projects</p>
                      <div className="mm-list">
                        {currentProjects.map((p, i) => (
                          <div key={i} className="mm-proj-card">
                            <div className="mm-proj-top">
                              <div>
                                <p className="mm-proj-name">{p.name}</p>
                                <p className="mm-proj-role">{p.role}</p>
                              </div>
                              <span className="badge badge-blue">{p.status}</span>
                            </div>
                            <div className="mm-bar-track">
                              <div className="mm-bar-fill" style={{ width: `${p.progress}%` }} />
                            </div>
                            <p className="mm-bar-pct">{p.progress}%</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="mm-col">

                    {/* Workload */}
                    <div className="mm-section">
                      <p className="mm-section-title">Workload</p>
                      <div className="mm-list">
                        {[['Assigned Tasks', 18], ['Sprint Done', 12], ['Pending Reviews', 4], ['Bug Fixes', 7]].map(([lbl, val], i) => (
                          <div key={i} className="mm-workload-item">
                            <div className="mm-workload-top">
                              <span>{lbl}</span><strong>{val}</strong>
                            </div>
                            <div className="mm-bar-track">
                              <div className="mm-bar-fill mm-bar-purple" style={{ width: `${Math.min(val * 5, 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project History */}
                    <div className="mm-section">
                      <p className="mm-section-title">Project History</p>
                      <div className="mm-list">
                        {completedProjects.map((p, i) => (
                          <div key={i} className="mm-hist-card">
                            <div>
                              <p className="mm-proj-name">{p.name}</p>
                              <p className="mm-proj-role">{p.duration}</p>
                            </div>
                            <span className="badge badge-green">{p.performance}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mm-section">
                      <p className="mm-section-title">Work Timeline</p>
                      <div className="mm-list">
                        {workHistory.map((item, i) => (
                          <div key={i} className="mm-timeline-item">
                            <span className="mm-tl-year">{item.year}</span>
                            <span className="mm-tl-text">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>

              <style>{`
                .mm-overlay {
                  position: fixed;
                  inset: 0;
                  background: rgba(0,0,0,0.65);
                  backdrop-filter: blur(6px);
                  z-index: 99999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 16px;
                  overflow-y: auto;
                }

                .mm-modal {
                  width: 100%;
                  max-width: 780px;
                  max-height: 90vh;
                  overflow-y: auto;
                  background: var(--bg-card);
                  border: 1px solid var(--border-subtle);
                  border-radius: 20px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                  display: flex;
                  flex-direction: column;
                  scrollbar-width: thin;
                  scrollbar-color: var(--border-default) transparent;
                }

                /* HEADER */
                .mm-header {
                  padding: 18px 20px 16px;
                  border-bottom: 1px solid var(--border-subtle);
                  display: flex;
                  align-items: flex-start;
                  justify-content: space-between;
                  gap: 12px;
                  position: sticky;
                  top: 0;
                  z-index: 2;
                  background: var(--bg-secondary);
                  border-radius: 20px 20px 0 0;
                }

                .mm-header-inner {
                  display: flex;
                  align-items: center;
                  gap: 14px;
                  flex: 1;
                  min-width: 0;
                  flex-wrap: wrap;
                }

                .mm-avatar {
                  width: 52px;
                  height: 52px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 900;
                  font-size: 18px;
                  flex-shrink: 0;
                }

                .mm-info { flex: 1; min-width: 0; }

                .mm-name {
                  font-size: 17px;
                  font-weight: 800;
                  color: var(--text-primary);
                  margin: 0 0 6px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .mm-badges {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                  margin-bottom: 6px;
                }

                .mm-email {
                  font-size: 12px;
                  color: var(--text-muted);
                  margin: 0;
                  word-break: break-all;
                }

                .mm-close {
                  width: 30px;
                  height: 30px;
                  border-radius: 8px;
                  border: 1px solid var(--border-default);
                  background: var(--bg-secondary);
                  color: var(--text-secondary);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                  transition: all 0.14s;
                }

                .mm-close:hover {
                  border-color: var(--accent-primary);
                  color: var(--accent-primary);
                }

                /* STATS ROW */
                .mm-stats-row {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  border-bottom: 1px solid var(--border-subtle);
                }

                .mm-stat-item {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  padding: 12px 8px;
                  border-right: 1px solid var(--border-subtle);
                  gap: 2px;
                }

                .mm-stat-item:last-child { border-right: none; }

                .mm-stat-val {
                  font-size: 20px;
                  font-weight: 900;
                  color: var(--accent-primary);
                  line-height: 1;
                }

                .mm-stat-lbl {
                  font-size: 10px;
                  color: var(--text-muted);
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }

                /* BODY */
                .mm-body {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 0;
                  padding: 16px;
                  gap: 12px;
                }

                .mm-col {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                  min-width: 0;
                }

                /* SECTION */
                .mm-section {
                  background: var(--bg-secondary);
                  border: 1px solid var(--border-subtle);
                  border-radius: 12px;
                  padding: 14px;
                }

                .mm-section-title {
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.6px;
                  color: var(--text-muted);
                  margin: 0 0 10px;
                }

                /* SKILLS */
                .mm-skills {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                }

                .mm-skill-badge {
                  font-size: 11px !important;
                  padding: 4px 9px !important;
                }

                /* LIST */
                .mm-list {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                }

                /* PROJECT CARDS */
                .mm-proj-card, .mm-hist-card {
                  background: var(--bg-card);
                  border: 1px solid var(--border-subtle);
                  border-radius: 10px;
                  padding: 10px 12px;
                }

                .mm-proj-top, .mm-hist-card {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  gap: 8px;
                  margin-bottom: 8px;
                }

                .mm-hist-card { margin-bottom: 0; }

                .mm-proj-name {
                  font-size: 13px;
                  font-weight: 700;
                  color: var(--text-primary);
                  margin: 0 0 2px;
                }

                .mm-proj-role {
                  font-size: 11px;
                  color: var(--text-muted);
                  margin: 0;
                }

                /* PROGRESS BAR */
                .mm-bar-track {
                  height: 5px;
                  border-radius: 99px;
                  background: var(--border-subtle);
                  overflow: hidden;
                }

                .mm-bar-fill {
                  height: 100%;
                  border-radius: 99px;
                  background: linear-gradient(90deg, #6366f1, #2dd4bf);
                  transition: width 0.3s;
                }

                .mm-bar-purple {
                  background: linear-gradient(90deg, #6366f1, #a78bfa);
                }

                .mm-bar-pct {
                  font-size: 11px;
                  color: var(--text-muted);
                  text-align: right;
                  margin: 4px 0 0;
                }

                /* WORKLOAD */
                .mm-workload-item { display: flex; flex-direction: column; gap: 5px; }

                .mm-workload-top {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  color: var(--text-secondary);
                }

                /* TIMELINE */
                .mm-timeline-item {
                  display: flex;
                  gap: 10px;
                  align-items: baseline;
                }

                .mm-tl-year {
                  font-size: 11px;
                  font-weight: 800;
                  color: var(--accent-primary);
                  flex-shrink: 0;
                  min-width: 36px;
                }

                .mm-tl-text {
                  font-size: 12px;
                  color: var(--text-secondary);
                  line-height: 1.4;
                }

                /* RESPONSIVE */
                @media (max-width: 640px) {
                  .mm-overlay { padding: 8px; align-items: flex-end; }

                  .mm-modal {
                    max-height: 92vh;
                    border-radius: 18px 18px 12px 12px;
                    max-width: 100%;
                  }

                  .mm-stats-row { grid-template-columns: repeat(2, 1fr); }

                  .mm-stat-item:nth-child(2) { border-right: none; }

                  .mm-stat-item:nth-child(3),
                  .mm-stat-item:nth-child(4) {
                    border-top: 1px solid var(--border-subtle);
                  }

                  .mm-body {
                    grid-template-columns: 1fr;
                    padding: 12px;
                  }

                  .mm-name { font-size: 15px; }
                }

                @media (max-width: 420px) {
                  .mm-header { padding: 14px; }
                  .mm-avatar { width: 44px; height: 44px; font-size: 15px; }
                  .mm-stat-val { font-size: 17px; }
                  .mm-section { padding: 12px; }
                }
              `}</style>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ADD MODAL */}
      <Modal isOpen={showAdd} onClose={closeAddModal} title="Add New Team Member">
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="role" placeholder="Role" value={form.role} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="experience" type="number" placeholder="Years of Experience" value={form.experience} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleFormChange} className="input" style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary flex-1" onClick={closeAddModal}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={handleAdd}>Add Member</button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEdit} onClose={closeEditModal} title="Edit Team Member">
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="role" placeholder="Role" value={form.role} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="experience" type="number" placeholder="Years of Experience" value={form.experience} onChange={handleFormChange} className="input" style={{ marginBottom: 12 }} />
        <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleFormChange} className="input" style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary flex-1" onClick={closeEditModal}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={handleUpdate}>Update Member</button>
        </div>
      </Modal>
    </div>
  );
}