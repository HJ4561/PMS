// components/supervisor/SupervisorDashboard.jsx
import { useState } from "react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

import { FolderKanban, Users, CheckCircle2, Activity } from 'lucide-react';
import Topbar from '../shared/Topbar';
import StatCard from '../shared/StatCard';

import {
  PROJECTS,
  TASKS,
  TEAM_MEMBERS,
  P_TEAMS,
  getProjectProgress,
  getUserById,
  priorityConfig,
  statusConfig
} from '../../data/mockData';

import {
  PriorityBadge,
  StatusBadge,
  ProgressRing
} from '../shared/UIComponents';

import { useOutletContext } from 'react-router-dom';

export default function SupervisorDashboard() {

  const { onMenuClick } = useOutletContext();

  const totalProjects = PROJECTS.filter(p => !p.is_deleted).length;
  const activeProjects = PROJECTS.filter(p => p.status === 'in-progress').length;

  const totalTasks = TASKS.filter(t => !t.is_deleted).length;
  const doneTasks = TASKS.filter(t => t.status === 'done' && !t.is_deleted).length;

  const completionPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    const [activeIndex, setActiveIndex] = useState(null);

  const statusData = Object.entries(
    PROJECTS.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: statusConfig[name]?.label || name,
    value,
    fill: statusConfig[name]?.color || '#6366f1'
  }));

  const priorityData = Object.entries(
    PROJECTS.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: priorityConfig[name]?.label || name,
    value,
    fill: priorityConfig[name]?.color || '#6366f1'
  }));

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
    return {
      name: tm.name.split(' ')[0],
      tasks: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length
    };
  });

  // ✅ IMPROVED TOOLTIP
  const TT = ({ active, payload, label }) =>
    active && payload?.length ? (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 13
        }}
      >
        <p style={{ marginBottom: 6, fontWeight: 700 }}>
          {label}
        </p>

        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name || p.dataKey}: {p.value}
          </p>
        ))}
      </div>
    ) : null;

  return (
    <div>
      <Topbar title="Supervisor Dashboard" onMenuClick={onMenuClick} />

      <div className="page-container">

        {/* Stats */}
        {/* Stats */}
<div className="grid-4 stagger-children" style={{ marginBottom: 28 }}>

  <StatCard
    label="Total Projects"
    value={totalProjects}
    icon={FolderKanban}
    colorKey="purple"
    change={12}
    to="/supervisor/projects"
  />

  <StatCard
    label="Active Projects"
    value={activeProjects}
    icon={Activity}
    colorKey="teal"
    sub="Currently in progress"
    to="/supervisor/projects"
  />

  <StatCard
    label="Team Members"
    value={TEAM_MEMBERS.length}
    icon={Users}
    colorKey="amber"
    change={8}
    to="/supervisor/teams"
  />

  <StatCard
    label="Tasks Done"
    value={`${doneTasks}/${totalTasks}`}
    icon={CheckCircle2}
    colorKey="emerald"
    sub={`${completionPercent}% completion`}
    to="/supervisor/projects"
  />

</div>

        {/* Row 1 */}
        <div className="grid-2" style={{ marginBottom: 20 }}>

          {/* AREA */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>
              Task Completion Trend
            </h3>

            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={taskTrendData}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="month" fontSize={11.5} />
                <YAxis fontSize={11.5} />
                <Tooltip content={<TT />} />
                <Legend />

                <Area type="monotone" dataKey="completed" stroke="#6366f1" fillOpacity={0.2} fill="#6366f1" />
                <Area type="monotone" dataKey="created" stroke="#2dd4bf" fillOpacity={0.2} fill="#2dd4bf" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* PIE */}
          <div className="card" style={{ padding: 22 }}>
  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>
    Project Status
  </h3>

  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

    {/* PIE */}
    <div style={{ position: 'relative', width: '100%' }}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={statusData}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {statusData.map((entry, index) => {
              const total = statusData.reduce((a, b) => a + b.value, 0);
              const percent = total ? Math.round((entry.value / total) * 100) : 0;

              return (
                <Cell
                  key={index}
                  fill={entry.fill}
                  style={{
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.25s ease'
                  }}
                />
              );
            })}
          </Pie>

          <Tooltip content={<TT />} />
        </PieChart>
      </ResponsiveContainer>

      {/* ✅ CENTER TOTAL */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        pointerEvents: 'none'
      }}>
        <p style={{ fontSize: 20, fontWeight: 900 }}>
          {statusData.reduce((a, b) => a + b.value, 0)}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Total Projects
        </p>
      </div>
    </div>

    {/* LEGEND */}
    <div style={{
      minWidth: 140,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      {statusData.map((s, i) => {
        const total = statusData.reduce((a, b) => a + b.value, 0);
        const percent = total ? Math.round((s.value / total) * 100) : 0;

        return (
          <div
            key={i}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 6,
              background: activeIndex === i ? 'var(--bg-secondary)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: s.fill
            }} />

            <span style={{
              fontSize: 12,
              color: 'var(--text-secondary)'
            }}>
              {s.name}
            </span>

            <span style={{
              marginLeft: 'auto',
              fontSize: 12,
              fontWeight: 700
            }}>
              {s.value} ({percent}%)
            </span>
          </div>
        );
      })}
    </div>

  </div>
</div>

        </div>

        {/* Row 2 */}
        <div className="grid-2" style={{ marginBottom: 20 }}>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>
              Team Productivity
            </h3>

            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={teamProductivity}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="name" fontSize={11.5} />
                <YAxis fontSize={11.5} />
                <Tooltip content={<TT />} />

                <Bar dataKey="tasks" fill="#6366f1" />
                <Bar dataKey="completed" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>
              Priority Distribution
            </h3>

            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={priorityData} layout="vertical">
                  {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis type="number" fontSize={11.5} />
                <YAxis dataKey="name" type="category" fontSize={11.5} width={70} />
                <Tooltip content={<TT />} />

                <Bar dataKey="value">
                  {priorityData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* PROJECT HEALTH */}
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>
            All Projects Health
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PROJECTS.map(project => {
              const progress = getProjectProgress(project.p_id);
              const lead = getUserById(project.created_by);

              const tasks = TASKS.filter(t => t.p_id === project.p_id && !t.is_deleted);
              const done = tasks.filter(t => t.status === 'done').length;

              const hc =
                progress >= 70 ? '#10b981' :
                progress >= 40 ? '#f59e0b' :
                '#f43f5e';

              return (
                <div key={project.p_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>

                  {/* ✅ PROGRESS WITH CENTER % */}
                  <div style={{ position: 'relative', width: 48, height: 48 }}>
                    <ProgressRing progress={progress} size={48} strokeWidth={4} color={hc} />

                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: hc
                    }}>
                      {progress}%
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700 }}>{project.p_name}</p>
                    <p style={{ fontSize: 11.5 }}>
                      Lead: {lead?.u_name} · {done}/{tasks.length} tasks
                    </p>
                  </div>

                  <PriorityBadge priority={project.priority} />
                  <StatusBadge status={project.status} />

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}