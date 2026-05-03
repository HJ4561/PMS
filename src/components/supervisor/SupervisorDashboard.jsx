// components/supervisor/SupervisorDashboard.jsx
import { useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

import {
  FolderKanban,
  Users,
  CheckCircle2,
  Activity
} from "lucide-react";

import Topbar from "../shared/Topbar";
import StatCard from "../shared/StatCard";

import {
  PROJECTS,
  TASKS,
  TEAM_MEMBERS,
  getProjectProgress,
  getUserById,
  priorityConfig,
  statusConfig
} from "../../data/mockData";

import {
  PriorityBadge,
  StatusBadge,
  ProgressRing
} from "../shared/UIComponents";

import { useOutletContext } from "react-router-dom";

export default function SupervisorDashboard() {
  const { onMenuClick } = useOutletContext();

  const totalProjects = PROJECTS.filter((p) => !p.is_deleted).length;
  const activeProjects = PROJECTS.filter(
    (p) => p.status === "in-progress"
  ).length;

  const totalTasks = TASKS.filter((t) => !t.is_deleted).length;
  const doneTasks = TASKS.filter(
    (t) => t.status === "done" && !t.is_deleted
  ).length;

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
    fill: statusConfig[name]?.color || "#6366f1"
  }));

  const priorityData = Object.entries(
    PROJECTS.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: priorityConfig[name]?.label || name,
    value,
    fill: priorityConfig[name]?.color || "#6366f1"
  }));

  const taskTrendData = [
    { month: "Jan", completed: 8, created: 12 },
    { month: "Feb", completed: 14, created: 16 },
    { month: "Mar", completed: 11, created: 10 },
    { month: "Apr", completed: 19, created: 15 },
    { month: "May", completed: 7, created: 9 },
    { month: "Jun", completed: 13, created: 14 }
  ];

  const teamProductivity = TEAM_MEMBERS.map((tm) => {
    const tasks = TASKS.filter((t) => t.assign_to === tm.tm_id);

    return {
      name: tm.name.split(" ")[0],
      tasks: tasks.length,
      completed: tasks.filter((t) => t.status === "done").length
    };
  });

  // TOOLTIP
  const TT = ({ active, payload, label }) =>
    active && payload?.length ? (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13
        }}
      >
        <p style={{ marginBottom: 6, fontWeight: 700 }}>{label}</p>

        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name || p.dataKey}: {p.value}
          </p>
        ))}
      </div>
    ) : null;

  return (
    <div>
      <Topbar
        title="Supervisor Dashboard"
        onMenuClick={onMenuClick}
      />

      <div className="page-container supervisor-dashboard">
        {/* STATS */}
        <div
          className="dashboard-stats-grid stagger-children"
          style={{ marginBottom: 28 }}
        >
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

        {/* ROW 1 */}
        <div
          className="dashboard-grid-2"
          style={{ marginBottom: 20 }}
        >
          {/* AREA CHART */}
          <div className="card dashboard-card">
            <h3 className="dashboard-title">
              Task Completion Trend
            </h3>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskTrendData}>
                  <XAxis dataKey="month" fontSize={11.5} />
                  <YAxis fontSize={11.5} />
                  <Tooltip content={<TT />} />
                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#6366f1"
                    fillOpacity={0.2}
                    fill="#6366f1"
                  />

                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#2dd4bf"
                    fillOpacity={0.2}
                    fill="#2dd4bf"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="card dashboard-card">
            <h3 className="dashboard-title">
              Project Status
            </h3>

            <div className="status-layout">
              {/* PIE */}
              <div className="status-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
  data={statusData}
  innerRadius="45%"
  outerRadius="75%"
  paddingAngle={3}
  dataKey="value"
  cx="50%"
  cy="50%"
  onMouseEnter={(_, index) => setActiveIndex(index)}
  onMouseLeave={() => setActiveIndex(null)}
>
                      {statusData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.fill}
                          style={{
                            opacity:
                              activeIndex === null ||
                              activeIndex === index
                                ? 1
                                : 0.4,
                            transform:
                              activeIndex === index
                                ? "scale(1.05)"
                                : "scale(1)",
                            transformOrigin: "center",
                            transition: "all 0.25s ease"
                          }}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<TT />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* CENTER */}
                <div className="pie-center">
                  <p className="pie-total">
                    {statusData.reduce(
                      (a, b) => a + b.value,
                      0
                    )}
                  </p>

                  <p className="pie-label">
                    Total Projects
                  </p>
                </div>
              </div>

              {/* LEGEND */}
              <div className="status-legend">
                {statusData.map((s, i) => {
                  const total = statusData.reduce(
                    (a, b) => a + b.value,
                    0
                  );

                  const percent = total
                    ? Math.round((s.value / total) * 100)
                    : 0;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() =>
                        setActiveIndex(null)
                      }
                      className="legend-item"
                    >
                      <div
                        className="legend-dot"
                        style={{
                          background: s.fill
                        }}
                      />

                      <span className="legend-name">
                        {s.name}
                      </span>

                      <span className="legend-value">
                        {s.value} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div
          className="dashboard-grid-2"
          style={{ marginBottom: 20 }}
        >
          {/* PRODUCTIVITY */}
          <div className="card dashboard-card">
            <h3 className="dashboard-title">
              Team Productivity
            </h3>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamProductivity}>
                  <XAxis dataKey="name" fontSize={11.5} />
                  <YAxis fontSize={11.5} />
                  <Tooltip content={<TT />} />

                  <Bar dataKey="tasks" fill="#6366f1" />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PRIORITY */}
          <div className="card dashboard-card">
            <h3 className="dashboard-title">
              Priority Distribution
            </h3>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityData}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    fontSize={11.5}
                  />

                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={11.5}
                    width={70}
                  />

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
        </div>

        {/* PROJECT HEALTH */}
        <div
          className="card dashboard-card"
          style={{ marginBottom: 20 }}
        >
          <h3 className="dashboard-title">
            All Projects Health
          </h3>

          <div className="project-health-list">
            {PROJECTS.map((project) => {
              const progress = getProjectProgress(
                project.p_id
              );

              const lead = getUserById(
                project.created_by
              );

              const tasks = TASKS.filter(
                (t) =>
                  t.p_id === project.p_id &&
                  !t.is_deleted
              );

              const done = tasks.filter(
                (t) => t.status === "done"
              ).length;

              const hc =
                progress >= 70
                  ? "#10b981"
                  : progress >= 40
                  ? "#f59e0b"
                  : "#f43f5e";

              return (
                <div
                  key={project.p_id}
                  className="project-health-item"
                >
                  {/* PROGRESS */}
                  <div
                    style={{
                      position: "relative",
                      width: 48,
                      height: 48,
                      flexShrink: 0
                    }}
                  >
                    <ProgressRing
                      progress={progress}
                      size={48}
                      strokeWidth={4}
                      color={hc}
                    />

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: hc
                      }}
                    >
                      {progress}%
                    </div>
                  </div>

                  <div className="project-info">
                    <p className="project-name">
                      {project.p_name}
                    </p>

                    <p className="project-sub">
                      Lead: {lead?.u_name} · {done}/
                      {tasks.length} tasks
                    </p>
                  </div>

                  <div className="project-badges">
                    <PriorityBadge
                      priority={project.priority}
                    />

                    <StatusBadge
                      status={project.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        .dashboard-stats-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:20px;
        }

        .dashboard-grid-2{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:20px;
        }

        .dashboard-card{
          padding:22px;
          overflow:hidden;
        }

        .dashboard-title{
          font-size:15px;
          font-weight:800;
          margin-bottom:18px;
        }

        .chart-wrapper{
          width:100%;
          height:240px;
        }

        .status-layout{
          display:flex;
          align-items:center;
          gap:24px;
        }

        .status-chart {
  position: relative;
  flex: 1;
  min-width: 180px;   /* 👈 prevents collapse */
  aspect-ratio: 1 / 1; /* 👈 keeps it perfectly square */
}

        .pie-center{
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-direction:column;
          pointer-events:none;
        }

        .pie-total{
          font-size:20px;
          font-weight:900;
        }

        .pie-label{
          font-size:11px;
          color:var(--text-muted);
        }

        .status-legend{
          min-width:160px;
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .legend-item{
          display:flex;
          align-items:center;
          gap:10px;
          cursor:pointer;
          padding:6px 8px;
          border-radius:8px;
          transition:0.2s;
        }

        .legend-item:hover{
          background:var(--bg-secondary);
        }

        .legend-dot{
          width:10px;
          height:10px;
          border-radius:3px;
          flex-shrink:0;
        }

        .legend-name{
          font-size:12px;
          color:var(--text-secondary);
        }

        .legend-value{
          margin-left:auto;
          font-size:12px;
          font-weight:700;
          white-space:nowrap;
        }

        .project-health-list{
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .project-health-item{
          display:flex;
          align-items:center;
          gap:14px;
          padding:14px;
          background:var(--bg-secondary);
          border-radius:var(--radius-md);
          border:1px solid var(--border-subtle);
          flex-wrap:wrap;
        }

        .project-info{
          flex:1;
          min-width:220px;
        }

        .project-name{
          font-weight:700;
          word-break:break-word;
        }

        .project-sub{
          font-size:11.5px;
          color:var(--text-secondary);
          margin-top:3px;
        }

        .project-badges{
          display:flex;
          align-items:center;
          gap:8px;
          flex-wrap:wrap;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width:768px){

  .status-chart{
    height:220px;
  }

}

@media (max-width:480px){

  .status-chart{
    height:200px;
  }

}
@media (max-width:900px){
  .status-layout{
    flex-direction:column;
    align-items:center;
  }

  .status-chart{
    width:100%;
    max-width:260px; /* keeps it clean */
  }
}
        @media (max-width:1200px){

          .dashboard-stats-grid{
            grid-template-columns:repeat(2,1fr);
          }

          // .status-layout{
          //   flex-direction:column;
          // }

          .status-legend{
            width:100%;
            min-width:unset;
          }
        }

        @media (max-width:992px){

          .dashboard-grid-2{
            grid-template-columns:1fr;
          }

          .dashboard-card{
            padding:18px;
          }
        }

        @media (max-width:768px){

          .page-container.supervisor-dashboard{
            padding:16px;
          }

          .dashboard-stats-grid{
            grid-template-columns:1fr;
          }

          .chart-wrapper{
            height:220px;
          }

          .dashboard-title{
            font-size:14px;
          }

          .project-health-item{
            align-items:flex-start;
          }

          .project-badges{
            width:100%;
            margin-top:8px;
          }
        }

        @media (max-width:480px){

          .page-container.supervisor-dashboard{
            padding:12px;
          }

          .dashboard-card{
            padding:14px;
            border-radius:14px;
          }

          .chart-wrapper{
            height:200px;
          }

          .pie-total{
            font-size:18px;
          }

          .legend-item{
            gap:8px;
            padding:5px 6px;
          }

          .legend-name,
          .legend-value{
            font-size:11px;
          }

          .project-info{
            min-width:100%;
          }

          .project-name{
            font-size:13px;
          }

          .project-sub{
            font-size:11px;
          }
        }
      `}</style>
    </div>
  );
}