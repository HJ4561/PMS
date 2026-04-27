// components/lead/LeadDashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, CheckCircle2, Users, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import Topbar from '../shared/Topbar';
import StatCard from '../shared/StatCard';
import { useOutletContext } from 'react-router-dom';

import { PROJECTS, TASKS, TEAM_MEMBERS, P_TEAMS, getProjectProgress } from '../../data/mockData';
import { PriorityBadge, StatusBadge, ProgressRing, AvatarGroup } from '../shared/UIComponents';

export default function LeadDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // sidebar toggle fix (no UI change)
  const { onMenuClick } = useOutletContext();

  const myProjects = PROJECTS.filter(p => p.created_by === user.u_id && !p.is_deleted);
  const myTasks = TASKS.filter(t => myProjects.some(p => p.p_id === t.p_id) && !t.is_deleted);
  const doneTasks = myTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;

  const myMemberIds = [...new Set(P_TEAMS.filter(pt => myProjects.some(p => p.p_id === pt.p_id)).map(pt => pt.tm_id))];
  const myMembers = TEAM_MEMBERS.filter(tm => myMemberIds.includes(tm.tm_id));

  const upcoming = myTasks
    .filter(t => t.status !== 'done' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const taskStatusData = [
    { name: 'To Do', value: myTasks.filter(t => t.status === 'todo').length, fill: '#8b93b5' },
    { name: 'In Progress', value: inProgressTasks, fill: '#6366f1' },
    { name: 'In Review', value: myTasks.filter(t => t.status === 'review').length, fill: '#f59e0b' },
    { name: 'Done', value: doneTasks, fill: '#10b981' }
  ];

  const TT = ({ active, payload, label }) =>
    active && payload?.length ? (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '9px 13px', fontSize: 12.5 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.fill }}>{p.name}: {p.value}</p>)}
      </div>
    ) : null;

  return (
    <div>
      <Topbar
        title={`Good morning, ${user.u_name.split(' ')[0]} 👋`}
        onMenuClick={onMenuClick}
      />

      <div className="page-container">

        {/* Stats */}
        <div className="grid-4 stagger-children" style={{ marginBottom: 28 }}>
          <StatCard label="My Projects" value={myProjects.length} icon={FolderKanban} colorKey="purple" />
          <StatCard label="Total Tasks" value={myTasks.length} icon={CheckCircle2} colorKey="teal" sub={`${doneTasks} completed`} />
          <StatCard label="Team Members" value={myMembers.length} icon={Users} colorKey="amber" />
          <StatCard label="In Progress" value={inProgressTasks} icon={Clock} colorKey="rose" />
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>

          {/* My Projects */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>
                My Projects
              </h3>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12.5, color: 'var(--text-muted)', padding: '5px 9px' }}
                onClick={() => navigate('/lead/projects')}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {myProjects.slice(0, 4).map(p => {
                const progress = getProjectProgress(p.p_id);
                const ptEntries = P_TEAMS.filter(pt => pt.p_id === p.p_id);
                const memberIds = [...new Set(ptEntries.map(pt => pt.tm_id))];
                const members = TEAM_MEMBERS.filter(tm => memberIds.includes(tm.tm_id));
                const hc = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#f43f5e';

                return (
                  <div
                    key={p.p_id}
                    onClick={() => navigate(`/lead/projects/${p.p_id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 13px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <ProgressRing progress={progress} size={42} strokeWidth={4} color={hc} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: 3
                      }}>
                        {p.p_name}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <StatusBadge status={p.status} />
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <AvatarGroup members={members} max={3} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Overview */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>
              Task Overview
            </h3>

            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={taskStatusData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11.5} />
                <YAxis stroke="var(--text-muted)" fontSize={11.5} />
                <Tooltip content={<TT />} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {taskStatusData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Upcoming Deadlines */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 18 }}>
            Upcoming Deadlines
          </h3>

          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, textAlign: 'center', padding: 20 }}>
              No upcoming deadlines 🎉
            </p>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 13,
                      padding: '11px 14px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${
                        isOverdue
                          ? 'rgba(244,63,94,0.28)'
                          : isUrgent
                          ? 'rgba(245,158,11,0.28)'
                          : 'var(--border-subtle)'
                      }`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {project?.p_name}
                      </p>
                    </div>

                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />

                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: isOverdue
                          ? '#f43f5e'
                          : isUrgent
                          ? '#f59e0b'
                          : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {isOverdue
                        ? `${Math.abs(daysLeft)}d overdue`
                        : daysLeft === 0
                        ? 'Due today'
                        : `${daysLeft}d left`}
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