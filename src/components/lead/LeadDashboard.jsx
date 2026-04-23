import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, CheckCircle2, Users, Clock, Plus, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Topbar from '../shared/Topbar';
import StatCard from '../shared/StatCard';
import { PROJECTS, TASKS, TEAM_MEMBERS, P_TEAMS, getProjectProgress, statusConfig } from '../../data/mockData';
import { PriorityBadge, StatusBadge, ProgressRing, AvatarGroup } from '../shared/UIComponents';

export default function LeadDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myProjects = PROJECTS.filter(p => p.created_by === user.u_id && !p.is_deleted);
  const allMyTaskIds = TASKS.filter(t => myProjects.some(p => p.p_id === t.p_id) && !t.is_deleted);
  const myTasks = allMyTaskIds;
  const doneTasks = myTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;

  // Get all unique team members across my projects
  const myMemberIds = [...new Set(
    P_TEAMS.filter(pt => myProjects.some(p => p.p_id === pt.p_id)).map(pt => pt.tm_id)
  )];
  const myMembers = TEAM_MEMBERS.filter(tm => myMemberIds.includes(tm.tm_id));

  // Upcoming deadlines
  const upcoming = myTasks
    .filter(t => t.status !== 'done' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const taskStatusData = [
    { name: 'To Do', value: myTasks.filter(t => t.status === 'todo').length, fill: '#9ba3c0' },
    { name: 'In Progress', value: inProgressTasks, fill: '#6c63ff' },
    { name: 'In Review', value: myTasks.filter(t => t.status === 'review').length, fill: '#fbbf24' },
    { name: 'Done', value: doneTasks, fill: '#10b981' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
          {payload.map(p => <p key={p.name} style={{ color: p.fill }}>{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Topbar
        title={`Good morning, ${user.u_name.split(' ')[0]} 👋`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/lead/projects')}>
            <Plus size={14} /> New Project
          </button>
        }
      />
      <div className="page-container">
        {/* Stats */}
        <div className="grid-4 stagger-children" style={{ marginBottom: 32 }}>
          <StatCard label="My Projects" value={myProjects.length} icon={FolderKanban} color="var(--accent-primary)" />
          <StatCard label="Total Tasks" value={myTasks.length} icon={CheckCircle2} color="var(--accent-teal)" sub={`${doneTasks} completed`} />
          <StatCard label="Team Members" value={myMembers.length} icon={Users} color="var(--accent-amber)" />
          <StatCard label="In Progress" value={inProgressTasks} icon={Clock} color="var(--accent-rose)" />
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* My Projects */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>My Projects</h3>
              <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--text-muted)' }} onClick={() => navigate('/lead/projects')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myProjects.slice(0, 4).map(p => {
                const progress = getProjectProgress(p.p_id);
                const ptEntries = P_TEAMS.filter(pt => pt.p_id === p.p_id);
                const memberIds = [...new Set(ptEntries.map(pt => pt.tm_id))];
                const members = TEAM_MEMBERS.filter(tm => memberIds.includes(tm.tm_id));
                const healthColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#fbbf24' : '#f43f5e';
                return (
                  <div
                    key={p.p_id}
                    onClick={() => navigate(`/lead/projects/${p.p_id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  >
                    <ProgressRing progress={progress} size={44} strokeWidth={4} color={healthColor} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{p.p_name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={p.status} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{progress}%</span>
                      </div>
                    </div>
                    <AvatarGroup members={members} max={3} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Status Chart */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Task Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={taskStatusData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6,6,0,0]} name="Tasks">
                  {taskStatusData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Upcoming Deadlines</h3>
          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>No upcoming deadlines 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map(task => {
                const project = myProjects.find(p => p.p_id === task.p_id);
                const dueDate = new Date(task.due_date);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;
                const isUrgent = daysLeft >= 0 && daysLeft <= 3;

                return (
                  <div
                    key={task.t_id}
                    onClick={() => project && navigate(`/lead/projects/${project.p_id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.3)' : isUrgent ? 'rgba(251,191,36,0.3)' : 'var(--border-subtle)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{task.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project?.p_name}</p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: isOverdue ? '#f43f5e' : isUrgent ? '#fbbf24' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}