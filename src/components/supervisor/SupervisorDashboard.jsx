import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { FolderKanban, Users, CheckCircle2, Clock, TrendingUp, Activity, AlertTriangle, Star } from 'lucide-react';
import Topbar from '../shared/Topbar';
import StatCard from '../shared/StatCard';
import { PROJECTS, TASKS, TEAM_MEMBERS, P_TEAMS, getProjectProgress, getUserById, priorityConfig, statusConfig } from '../../data/mockData';
import { PriorityBadge, StatusBadge, Avatar, ProgressRing, AvatarGroup } from '../shared/UIComponents';

const COLORS = ['#6c63ff', '#2dd4bf', '#fbbf24', '#f43f5e', '#10b981'];

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Compute stats
  const totalProjects = PROJECTS.filter(p => !p.is_deleted).length;
  const activeProjects = PROJECTS.filter(p => p.status === 'in-progress').length;
  const completedProjects = PROJECTS.filter(p => p.status === 'completed').length;
  const totalTasks = TASKS.filter(t => !t.is_deleted).length;
  const doneTasks = TASKS.filter(t => t.status === 'done' && !t.is_deleted).length;

  // Chart data
  const statusData = Object.entries(
    PROJECTS.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: statusConfig[name]?.label || name, value, fill: statusConfig[name]?.color || '#6c63ff' }));

  const priorityData = Object.entries(
    PROJECTS.reduce((acc, p) => { acc[p.priority] = (acc[p.priority] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: priorityConfig[name]?.label || name, value, fill: priorityConfig[name]?.color || '#6c63ff' }));

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
          <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>
          {payload.map(p => (
            <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Topbar title="Supervisor Dashboard" />
      <div className="page-container">

        {/* Stats */}
        <div className="grid-4 stagger-children" style={{ marginBottom: 32 }}>
          <StatCard label="Total Projects" value={totalProjects} icon={FolderKanban} color="var(--accent-primary)" change={12} />
          <StatCard label="Active Projects" value={activeProjects} icon={Activity} color="var(--accent-teal)" sub="Currently in progress" />
          <StatCard label="Team Members" value={TEAM_MEMBERS.length} icon={Users} color="var(--accent-amber)" change={8} />
          <StatCard label="Tasks Done" value={`${doneTasks}/${totalTasks}`} icon={CheckCircle2} color="var(--accent-emerald)" sub={`${Math.round(doneTasks/totalTasks*100)}% completion rate`} />
        </div>

        {/* Charts row 1 */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={taskTrendData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                <Area type="monotone" dataKey="completed" stroke="#6c63ff" fill="url(#colorCompleted)" strokeWidth={2} name="Completed" />
                <Area type="monotone" dataKey="created" stroke="#2dd4bf" fill="url(#colorCreated)" strokeWidth={2} name="Created" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Project Status Breakdown</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ minWidth: 130, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusData.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: s.fill, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Team Productivity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={teamProductivity} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                <Bar dataKey="tasks" fill="#6c63ff" radius={[4,4,0,0]} name="Assigned" />
                <Bar dataKey="completed" fill="#10b981" radius={[4,4,0,0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Project Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0,4,4,0]} name="Projects">
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All Projects Health Table */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>All Projects Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PROJECTS.map(project => {
              const progress = getProjectProgress(project.p_id);
              const lead = getUserById(project.created_by);
              const members = P_TEAMS.filter(pt => pt.p_id === project.p_id);
              const uniqueMembers = [...new Set(members.map(m => m.tm_id))];
              const tasks = TASKS.filter(t => t.p_id === project.p_id && !t.is_deleted);
              const doneTasks = tasks.filter(t => t.status === 'done').length;
              const healthColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#fbbf24' : '#f43f5e';

              return (
                <div key={project.p_id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <ProgressRing progress={progress} size={52} strokeWidth={4} color={healthColor} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.p_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lead: {lead?.u_name} · {doneTasks}/{tasks.length} tasks · {uniqueMembers.length} members</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <PriorityBadge priority={project.priority} />
                    <StatusBadge status={project.status} />
                  </div>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: healthColor }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: healthColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { user: 'Jordan Lee', action: 'updated task', target: 'Build authentication module', time: '2 hours ago', type: 'update' },
              { user: 'Sam Rivera', action: 'created project', target: 'Pulse Mobile App', time: '1 day ago', type: 'create' },
              { user: 'Jordan Lee', action: 'completed task', target: 'Setup project architecture', time: '2 days ago', type: 'complete' },
              { user: 'Sam Rivera', action: 'added comment on', target: 'Product catalog backend', time: '3 days ago', type: 'comment' },
              { user: 'Jordan Lee', action: 'assigned task to', target: 'Aria Chen', time: '4 days ago', type: 'assign' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.type === 'complete' ? 'var(--accent-emerald)' : item.type === 'create' ? 'var(--accent-teal)' : 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.user}</span> {item.action} <span style={{ color: 'var(--accent-secondary)' }}>{item.target}</span>
                </p>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}