import { useState } from 'react';
import { Search, Users, ChevronDown, ChevronUp, Briefcase, CheckCircle2, Clock, Star } from 'lucide-react';
import Topbar from '../shared/Topbar';
import { TEAM_MEMBERS, PROJECTS, TASKS, P_TEAMS, getMemberStats, getUserById } from '../../data/mockData';
import { Avatar, ProgressRing } from '../shared/UIComponents';

export default function SupervisorTeams() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.toLowerCase().includes(search.toLowerCase())
  );

  const colors = ['#6c63ff', '#2dd4bf', '#f43f5e', '#fbbf24', '#10b981', '#f97316', '#ec4899', '#a78bfa'];

  return (
    <div>
      <Topbar title="Teams & Members" />
      <div className="page-container">
        {/* Overview stats */}
        <div className="grid-4 stagger-children" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Members', value: TEAM_MEMBERS.length, color: '#6c63ff' },
            { label: 'Roles', value: [...new Set(TEAM_MEMBERS.map(m => m.role))].length, color: '#2dd4bf' },
            { label: 'Avg Experience', value: `${(TEAM_MEMBERS.reduce((a, m) => a + m.experience, 0) / TEAM_MEMBERS.length).toFixed(1)}yr`, color: '#fbbf24' },
            { label: 'Active Now', value: TEAM_MEMBERS.filter(m => !m.is_deleted).length, color: '#10b981' }
          ].map(s => (
            <div key={s.label} className="card animate-fade-in" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: `${s.color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by name, role, or skills..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, maxWidth: 400 }} />
        </div>

        {/* Member cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger-children">
          {filtered.map((member, i) => {
            const stats = getMemberStats(member.tm_id);
            const color = member.avatar_color || colors[i % colors.length];
            const addedBy = getUserById(member.added_by);
            const memberProjects = P_TEAMS.filter(pt => pt.tm_id === member.tm_id).map(pt => PROJECTS.find(p => p.p_id === pt.p_id)).filter(Boolean);
            const isExpanded = expanded === member.tm_id;
            const onTimeRate = stats.completedTasks > 0 ? Math.round((stats.completedOnTime / stats.completedTasks) * 100) : 0;

            return (
              <div key={member.tm_id} className="card animate-fade-in">
                <div
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                  onClick={() => setExpanded(isExpanded ? null : member.tm_id)}
                >
                  <Avatar name={member.name} color={color} size="lg" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{member.name}</h3>
                      <span className="badge badge-purple" style={{ fontSize: 11 }}>{member.role}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{member.qualification} · {member.experience} yrs exp</p>
                  </div>
                  {/* Quick stats */}
                  <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                    {[
                      { label: 'Tasks', value: stats.totalTasks, color: 'var(--text-secondary)' },
                      { label: 'Done', value: stats.completedTasks, color: '#10b981' },
                      { label: 'Active', value: stats.inProgressTasks, color: '#6c63ff' },
                      { label: 'On Time', value: `${onTimeRate}%`, color: onTimeRate >= 70 ? '#10b981' : onTimeRate >= 40 ? '#fbbf24' : '#f43f5e' }
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginLeft: 12 }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)', paddingTop: 20, animation: 'fadeIn 0.3s ease' }}>
                    <div className="grid-3" style={{ marginBottom: 20 }}>
                      <div className="card" style={{ padding: 16 }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>SKILLS</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {member.skills.split(', ').map(s => (
                            <span key={s} className="badge badge-purple" style={{ fontSize: 11 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="card" style={{ padding: 16 }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>PERFORMANCE</p>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <ProgressRing progress={onTimeRate} size={52} strokeWidth={4} color={onTimeRate >= 70 ? '#10b981' : '#fbbf24'} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{onTimeRate}% on-time</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stats.completedOnTime}/{stats.completedTasks} tasks</p>
                          </div>
                        </div>
                      </div>
                      <div className="card" style={{ padding: 16 }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>PROJECTS</p>
                        <p style={{ fontSize: 13 }}><span style={{ fontWeight: 600, color: '#6c63ff' }}>{stats.activeProjects}</span> active, <span style={{ fontWeight: 600, color: '#10b981' }}>{stats.completedProjects}</span> completed</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Added by: {addedBy?.u_name}</p>
                      </div>
                    </div>

                    {/* Projects list */}
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project History</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {memberProjects.map(p => (
                        <span key={p.p_id} style={{ padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 8, fontSize: 12, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.status === 'completed' ? '#10b981' : '#6c63ff', display: 'inline-block' }} />
                          {p.p_name}
                        </span>
                      ))}
                      {memberProjects.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No projects assigned yet</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}