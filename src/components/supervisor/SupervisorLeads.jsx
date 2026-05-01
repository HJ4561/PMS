import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  FolderKanban,
  Activity,
  Star,
  CheckCircle2
} from "lucide-react";

import Topbar from "../shared/Topbar";

import {
  PROJECTS,
  TASKS,
  TEAM_MEMBERS,
  P_TEAMS,
  getUserById
} from "../../data/mockData";

export default function SupervisorLeads() {

  // ✅ SAFE CONTEXT (NO CRASH)
  const ctx = useOutletContext?.() || {};
  const onMenuClick = ctx.onMenuClick;

  // 🎯 GET ALL LEADS
  const leads = [...new Set(PROJECTS.map(p => p.created_by))];

  const getLeadData = (leadId) => {
    const user = getUserById(leadId);

    const projects = PROJECTS.filter(p => p.created_by === leadId);
    const projectIds = projects.map(p => p.p_id);

    const tasks = TASKS.filter(t => projectIds.includes(t.p_id));
    const completed = tasks.filter(t => t.status === "done").length;

    const members = P_TEAMS.filter(pt => projectIds.includes(pt.p_id));
    const uniqueMembers = [...new Set(members.map(m => m.tm_id))];

    const completionRate =
      tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

    // ⭐ PERFORMANCE SCORE (premium logic)
    const performance =
      completionRate >= 80 ? "Excellent" :
      completionRate >= 60 ? "Good" :
      completionRate >= 40 ? "Average" :
      "Needs Attention";

    const perfColor =
      completionRate >= 80 ? "#10b981" :
      completionRate >= 60 ? "#2dd4bf" :
      completionRate >= 40 ? "#f59e0b" :
      "#f43f5e";

    return {
      user,
      projects,
      tasks,
      completed,
      uniqueMembers,
      completionRate,
      performance,
      perfColor
    };
  };

  return (
    <div>
      <Topbar title="Leads Overview" onMenuClick={onMenuClick} />

      <div className="page-container">

        {/* GRID */}
        <div className="grid-auto stagger-children">

          {leads.map((leadId) => {
            const data = getLeadData(leadId);

            return (
              <motion.div
                key={leadId}
                className="card"
                style={{
                  padding: 20,
                  position: "relative",
                  overflow: "hidden"
                }}
                whileHover={{ scale: 1.02 }}
              >

                {/* 🔥 TOP STRIP (PREMIUM) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: data.perfColor
                  }}
                />

                {/* HEADER */}
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 800 }}>
                    {data.user?.u_name || "Unknown"}
                  </h3>

                  <span
                    style={{
                      fontSize: 11,
                      color: data.perfColor,
                      fontWeight: 600
                    }}
                  >
                    {data.performance}
                  </span>
                </div>

                {/* STATS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,1fr)",
                    gap: 10,
                    marginBottom: 12
                  }}
                >
                  <Stat icon={FolderKanban} label="Projects" value={data.projects.length} />
                  <Stat icon={CheckCircle2} label="Tasks Done" value={data.completed} />
                  <Stat icon={Activity} label="Total Tasks" value={data.tasks.length} />
                  <Stat icon={Users} label="Team Size" value={data.uniqueMembers.length} />
                </div>

                {/* PROGRESS BAR */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: 4
                  }}>
                    <span>Completion</span>
                    <span style={{ color: data.perfColor }}>
                      {data.completionRate}%
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${data.completionRate}%`,
                        background: data.perfColor
                      }}
                    />
                  </div>
                </div>

                {/* PROJECTS LIST */}
                <div>
                  <p style={{ fontSize: 11, marginBottom: 6 }}>
                    Active Projects
                  </p>

                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6
                  }}>
                    {data.projects.slice(0, 3).map(p => (
                      <span
                        key={p.p_id}
                        className="badge badge-gray"
                        style={{ fontSize: 10 }}
                      >
                        {p.p_name}
                      </span>
                    ))}
                  </div>
                </div>

              </motion.div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

/* MINI STAT COMPONENT */
function Stat({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "var(--bg-secondary)",
        padding: 8,
        borderRadius: 8,
        border: "1px solid var(--border-subtle)"
      }}
    >
      <Icon size={14} />
      <div>
        <p style={{ fontSize: 11 }}>{label}</p>
        <p style={{ fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}