import { useState } from 'react';
import { Search, Filter, FolderOpen } from 'lucide-react';
import Topbar from '../shared/Topbar';
import { PROJECTS, TASKS, P_TEAMS, TEAM_MEMBERS, getProjectProgress, getUserById, priorityConfig, statusConfig } from '../../data/mockData';
import { PriorityBadge, StatusBadge, ProgressRing, AvatarGroup, EmptyState } from '../shared/UIComponents';

export default function SupervisorProjects() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = PROJECTS.filter(p => {
    if (!p) return false;
    const matchSearch = p.p_name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchPriority = filterPriority === 'all' || p.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div>
      <Topbar title="All Projects" />
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
          <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 160, appearance: 'none', cursor: 'pointer' }}>
            <option value="all" style={{ background: 'var(--bg-card)' }}>All Priority</option>
            {Object.entries(priorityConfig).map(([v, c]) => <option key={v} value={v} style={{ background: 'var(--bg-card)' }}>{c.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects found" desc="Try adjusting your search or filters." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger-children">
            {filtered.map(project => {
              const progress = getProjectProgress(project.p_id);
              const lead = getUserById(project.created_by);
              const ptEntries = P_TEAMS.filter(pt => pt.p_id === project.p_id);
              const memberIds = [...new Set(ptEntries.map(pt => pt.tm_id))];
              const members = TEAM_MEMBERS.filter(tm => memberIds.includes(tm.tm_id));
              const tasks = TASKS.filter(t => t.p_id === project.p_id && !t.is_deleted);
              const doneTasks = tasks.filter(t => t.status === 'done').length;
              const healthColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#fbbf24' : '#f43f5e';

              return (
                <div key={project.p_id} className="card animate-fade-in" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <ProgressRing progress={progress} size={64} strokeWidth={5} color={healthColor} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{project.p_name}</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{project.desc}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <PriorityBadge priority={project.priority} />
                          <StatusBadge status={project.status} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Progress</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 120 }}>
                              <div className="progress-fill" style={{ width: `${progress}%`, background: healthColor }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: healthColor }}>{progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Lead</p>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{lead?.u_name}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Tasks</p>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{doneTasks}/{tasks.length} done</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Deadline</p>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Team</p>
                          <AvatarGroup members={members} max={5} />
                        </div>
                      </div>

                      {/* Task status breakdown */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                        {['todo', 'in-progress', 'review', 'done'].map(s => {
                          const count = tasks.filter(t => t.status === s).length;
                          if (!count) return null;
                          return (
                            <span key={s} className={`badge ${statusConfig[s]?.badge}`} style={{ fontSize: 11 }}>
                              {statusConfig[s]?.label}: {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                    <span>Started: {new Date(project.start_at).toLocaleDateString()}</span>
                    <span>Last updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}