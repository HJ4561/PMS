// components/supervisor/SupervisorDashboard.jsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { FolderKanban, Users, CheckCircle2, Clock, Activity } from 'lucide-react';
import Topbar from '../shared/Topbar';
import StatCard from '../shared/StatCard';
import { PROJECTS, TASKS, TEAM_MEMBERS, P_TEAMS, getProjectProgress, getUserById, priorityConfig, statusConfig } from '../../data/mockData';
import { PriorityBadge, StatusBadge, ProgressRing, AvatarGroup } from '../shared/UIComponents';

export default function SupervisorDashboard() {
  const totalProjects = PROJECTS.filter(p => !p.is_deleted).length;
  const activeProjects = PROJECTS.filter(p => p.status === 'in-progress').length;
  const totalTasks = TASKS.filter(t => !t.is_deleted).length;
  const doneTasks = TASKS.filter(t => t.status === 'done' && !t.is_deleted).length;

  const statusData = Object.entries(
    PROJECTS.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: statusConfig[name]?.label || name, value, fill: statusConfig[name]?.color || '#6366f1' }));

  const priorityData = Object.entries(
    PROJECTS.reduce((acc, p) => { acc[p.priority] = (acc[p.priority] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: priorityConfig[name]?.label || name, value, fill: priorityConfig[name]?.color || '#6366f1' }));

  const taskTrendData = [
    { month: 'Jan', completed: 8, created: 12 },
    { month: 'Feb', completed: 14, created: 16 },
    { month: 'Mar', completed: 11, created: 10 },
    { month: 'Apr', completed: 19, created: 15 },
    { month: 'May', completed: 7, created: 9 },
    { month: 'Jun', completed: 13, created: 14 }
  ];

  const teamProductivity = TEAM_MEMBERS.map(tm => {
    const tasks = TASKS.filter(t => t.assign_to === tm.tm_id);
    return { name: tm.name.split(' ')[0], tasks: tasks.length, completed: tasks.filter(t => t.status === 'done').length };
  });

  const TT = ({ active, payload, label }) => active && payload?.length ? (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '9px 13px', fontSize: 12.5 }}>
      <p style={{ marginBottom: 5, fontWeight: 700 }}>{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  ) : null;

  return (
    <div>
      <Topbar title="Supervisor Dashboard" />
      <div className="page-container">

        {/* Stats */}
        <div className="grid-4 stagger-children" style={{ marginBottom: 28 }}>
          <StatCard label="Total Projects" value={totalProjects} icon={FolderKanban} colorKey="purple" change={12} />
          <StatCard label="Active Projects" value={activeProjects} icon={Activity} colorKey="teal" sub="Currently in progress" />
          <StatCard label="Team Members" value={TEAM_MEMBERS.length} icon={Users} colorKey="amber" change={8} />
          <StatCard label="Tasks Done" value={`${doneTasks}/${totalTasks}`} icon={CheckCircle2} colorKey="emerald" sub={`${Math.round(doneTasks / totalTasks * 100)}% completion`} />
        </div>

        {/* Charts row 1 */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.01em' }}>Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={taskTrendData}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11.5} />
                <YAxis stroke="var(--text-muted)" fontSize={11.5} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" fill="url(#gC)" strokeWidth={2} name="Completed" />
                <Area type="monotone" dataKey="created" stroke="#2dd4bf" fill="url(#gCr)" strokeWidth={2} name="Created" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.01em' }}>Project Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<TT />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ minWidth: 120, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {statusData.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: s.fill, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{s.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.01em' }}>Team Productivity</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={teamProductivity} barSize={11}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11.5} />
                <YAxis stroke="var(--text-muted)" fontSize={11.5} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.01em' }}>Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={priorityData} layout="vertical" barSize={13}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11.5} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11.5} width={65} />
                <Tooltip content={<TT />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Projects">
                  {priorityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Health */}
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.01em' }}>All Projects Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PROJECTS.map(project => {
              const progress = getProjectProgress(project.p_id);
              const lead = getUserById(project.created_by);
              const members = P_TEAMS.filter(pt => pt.p_id === project.p_id);
              const uniqueMembers = [...new Set(members.map(m => m.tm_id))];
              const tasks = TASKS.filter(t => t.p_id === project.p_id && !t.is_deleted);
              const done = tasks.filter(t => t.status === 'done').length;
              const hc = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#f43f5e';

              return (
                <div
                  key={project.p_id}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <ProgressRing progress={progress} size={48} strokeWidth={4} color={hc} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 14 }}>{project.p_name}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Lead: {lead?.u_name} · {done}/{tasks.length} tasks · {uniqueMembers.length} members</p>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <PriorityBadge priority={project.priority} />
                    <StatusBadge status={project.status} />
                  </div>
                  <div style={{ width: 110, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: hc }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: hc }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.01em' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { user: 'Jordan Lee', action: 'updated task', target: 'Build authentication module', time: '2 hours ago', type: 'update' },
              { user: 'Sam Rivera', action: 'created project', target: 'Pulse Mobile App', time: '1 day ago', type: 'create' },
              { user: 'Jordan Lee', action: 'completed task', target: 'Setup project architecture', time: '2 days ago', type: 'complete' },
              { user: 'Sam Rivera', action: 'added comment on', target: 'Product catalog backend', time: '3 days ago', type: 'comment' },
              { user: 'Jordan Lee', action: 'assigned task to', target: 'Aria Chen', time: '4 days ago', type: 'assign' }
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.type === 'complete' ? '#10b981' : item.type === 'create' ? '#2dd4bf' : '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.user}</span> {item.action} <span style={{ color: 'var(--accent-secondary)' }}>{item.target}</span>
                </p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}