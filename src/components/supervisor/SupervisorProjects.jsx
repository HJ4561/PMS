import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderOpen } from 'lucide-react';

import Topbar from '../shared/Topbar';
import {
  PROJECTS, TASKS, P_TEAMS, TEAM_MEMBERS,
  getProjectProgress, getUserById, priorityConfig, statusConfig
} from '../../data/mockData';

import {
  PriorityBadge, StatusBadge, ProgressRing, AvatarGroup, EmptyState
} from '../shared/UIComponents';

export default function SupervisorProjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = PROJECTS.filter(p => {
    const matchSearch =
      p.p_name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc?.toLowerCase().includes(search.toLowerCase());
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
          <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 150, appearance: 'none', cursor: 'pointer' }}>
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
          <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 150, appearance: 'none', cursor: 'pointer' }}>
            <option value="all">All Priority</option>
            {Object.entries(priorityConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects found" desc="Try adjusting your search or filters." />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16
          }}>
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
                <div
                  key={project.p_id}
                  className="card animate-fade-in"
                  style={{ padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                  onClick={() => navigate(`/supervisor/projects/${project.p_id}`)}
                >
                  {/* Top row: badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <PriorityBadge priority={project.priority} />
                    <StatusBadge status={project.status} />
                  </div>

                  {/* Title & desc */}
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{project.p_name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>{project.desc}</p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: 600, color: healthColor }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: healthColor }} />
                    </div>
                  </div>

                  {/* Lead & Tasks */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Lead</p>
                      <p style={{ fontWeight: 500 }}>{lead?.u_name ?? '—'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Tasks</p>
                      <p style={{ fontWeight: 500 }}>{doneTasks}/{tasks.length} done</p>
                    </div>
                  </div>

                  {/* Footer: team + deadline */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <AvatarGroup members={members} max={4} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
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