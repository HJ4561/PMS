// components/supervisor/SupervisorTeams.jsx
import { useState } from 'react';
import { Search, Users, Plus, Trash2, UserPlus } from 'lucide-react';
import Topbar from '../shared/Topbar';
import { TEAM_MEMBERS, PROJECTS, TASKS, P_TEAMS, getMemberStats, getUserById } from '../../data/mockData';
import { ProgressRing, Modal } from '../shared/UIComponents';
import toast from 'react-hot-toast';

const defaultForm = { name: '', role: '', qualification: '', experience: '', skills: '', email: '' };

export default function SupervisorTeams() {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState(TEAM_MEMBERS.filter(m => !m.is_deleted));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.toLowerCase().includes(search.toLowerCase())
  );

  const colors = ['#6366f1', '#2dd4bf', '#f43f5e', '#f59e0b', '#10b981', '#f97316', '#ec4899', '#a78bfa'];

  const handleAdd = () => {
    if (!form.name.trim() || !form.role.trim()) return toast.error('Name and role are required');
    const newM = {
      tm_id: Date.now(), ...form,
      experience: parseInt(form.experience) || 0,
      added_by: 1, is_deleted: false,
      avatar_color: colors[Math.floor(Math.random() * colors.length)]
    };
    TEAM_MEMBERS.push(newM);
    setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
    setShowAdd(false);
    setForm(defaultForm);
    toast.success('Member added!');
  };

  const handleDelete = (tm_id) => {
    const idx = TEAM_MEMBERS.findIndex(m => m.tm_id === tm_id);
    if (idx >= 0) {
      TEAM_MEMBERS[idx].is_deleted = true;
      setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
      toast.success('Member removed');
    }
  };

  return (
    <div>
      <Topbar
        title="Teams & Members"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <UserPlus size={14} />Add Member
          </button>
        }
      />
      <div className="page-container">

        {/* Overview stats */}
        <div className="grid-4 stagger-children" style={{ marginBottom: 26 }}>
          {[
            { label: 'Total Members', value: members.length, color: '#6366f1' },
            { label: 'Unique Roles', value: [...new Set(members.map(m => m.role))].length, color: '#2dd4bf' },
            { label: 'Avg Experience', value: `${(members.reduce((a, m) => a + (m.experience || 0), 0) / (members.length || 1)).toFixed(1)}yr`, color: '#f59e0b' },
            { label: 'Active Now', value: members.length, color: '#10b981' }
          ].map(s => (
            <div key={s.label} className="card animate-fade-in" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, background: `${s.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.02em', color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 380 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by name, role, or skills…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>

        <div className="grid-auto stagger-children">
          {filtered.map((member, i) => {
            const stats = getMemberStats(member.tm_id);
            const color = member.avatar_color || colors[i % colors.length];
            const addedBy = getUserById(member.added_by);
            const memberProjects = P_TEAMS.filter(pt => pt.tm_id === member.tm_id).map(pt => PROJECTS.find(p => p.p_id === pt.p_id)).filter(Boolean);
            const onTimeRate = stats.completedTasks > 0 ? Math.round((stats.completedOnTime / stats.completedTasks) * 100) : 0;
            const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

            return (
              <div key={member.tm_id} className="member-card animate-fade-in" style={{ position: 'relative' }}>
                <button
                  className="btn btn-danger btn-icon"
                  style={{ position: 'absolute', top: 12, right: 12, padding: '4px', zIndex: 2 }}
                  onClick={() => handleDelete(member.tm_id)}
                  title="Remove member"
                >
                  <Trash2 size={12} />
                </button>

                {/* Header */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingRight: 28 }}>
                  <div className="avatar avatar-lg" style={{ background: color + '22', color, border: `2px solid ${color}40`, width: 50, height: 50, fontSize: 17 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14.5, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</h3>
                    <span className="badge badge-purple" style={{ fontSize: 10.5 }}>{member.role}</span>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{member.qualification} · {member.experience} yrs exp</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {member.skills?.split(', ').slice(0, 4).map(s => (
                    <span key={s} className="badge badge-gray" style={{ fontSize: 10.5 }}>{s}</span>
                  ))}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 0, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  {[
                    { label: 'Tasks', value: stats.totalTasks, color: 'var(--text-primary)' },
                    { label: 'Done', value: stats.completedTasks, color: '#10b981' },
                    { label: 'Active', value: stats.inProgressTasks, color: '#6366f1' },
                  ].map((s, idx, arr) => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRight: idx < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <p style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-display)', color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
                      <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Performance */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <ProgressRing progress={onTimeRate} size={42} strokeWidth={4} color={onTimeRate >= 70 ? '#10b981' : '#f59e0b'} />
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700 }}>{onTimeRate}% On-time</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stats.completedOnTime}/{stats.completedTasks} on schedule</p>
                    {addedBy && <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>Added by {addedBy.u_name}</p>}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <p style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Projects ({memberProjects.length})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {memberProjects.slice(0, 3).map(p => (
                      <span key={p.p_id} style={{ padding: '3px 9px', borderRadius: 6, background: 'var(--bg-hover)', fontSize: 11, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.status === 'completed' ? '#10b981' : '#6366f1', display: 'inline-block' }} />
                        {p.p_name}
                      </span>
                    ))}
                    {memberProjects.length === 0 && <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>No projects yet</p>}
                    {memberProjects.length > 3 && <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 0' }}>+{memberProjects.length - 3} more</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Team Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="grid-2">
            <div className="input-group">
              <label>Full Name *</label>
              <input className="input" placeholder="e.g. Jordan Lee" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Role *</label>
              <input className="input" placeholder="e.g. Frontend Developer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Qualification</label>
              <input className="input" placeholder="e.g. BSc Computer Science" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Experience (years)</label>
              <input className="input" type="number" min="0" placeholder="e.g. 3" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>
          </div>
          <div className="input-group">
            <label>Skills (comma-separated)</label>
            <input className="input" placeholder="e.g. React, TypeScript, Node.js" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input className="input" type="email" placeholder="e.g. jordan@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end', marginTop: 6 }}>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd}><UserPlus size={14} />Add Member</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}