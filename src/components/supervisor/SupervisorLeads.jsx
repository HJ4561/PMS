import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, FolderKanban, Activity, CheckCircle2,
  X, MessageSquare, Trash2, Pin, PinOff, Send,
  BarChart2, TrendingUp, AlertCircle, Clock,
  Award, ChevronRight, Briefcase,
} from "lucide-react";

import Topbar from "../shared/Topbar";
import {
  PROJECTS, TASKS, TEAM_MEMBERS, P_TEAMS, getUserById,
} from "../../data/mockData";
import { StatusBadge, PriorityBadge } from "../shared/UIComponents";

/* ── data helper ── */
const getLeadData = (leadId) => {
  const user        = getUserById(leadId);
  const projects    = PROJECTS.filter((p) => p.created_by === leadId);
  const projectIds  = projects.map((p) => p.p_id);
  const tasks       = TASKS.filter((t) => projectIds.includes(t.p_id));
  const completed   = tasks.filter((t) => t.status === "done").length;
  const inProgress  = tasks.filter((t) => t.status === "in_progress").length;
  const todo        = tasks.filter((t) => t.status === "todo").length;
  const memberPts   = P_TEAMS.filter((pt) => projectIds.includes(pt.p_id));
  const uniqueMemberIds = [...new Set(memberPts.map((m) => m.tm_id))];
  const members     = TEAM_MEMBERS.filter((m) => uniqueMemberIds.includes(m.tm_id));
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  const performance =
    completionRate >= 80 ? "Excellent" :
    completionRate >= 60 ? "Good" :
    completionRate >= 40 ? "Average" : "Needs Attention";
  const perfColor =
    completionRate >= 80 ? "#10b981" :
    completionRate >= 60 ? "#2dd4bf" :
    completionRate >= 40 ? "#f59e0b" : "#f43f5e";
  return { user, projects, tasks, completed, inProgress, todo, members, uniqueMemberIds, completionRate, performance, perfColor };
};

const KPI_META = {
  projects:   { label: "All Projects",      icon: FolderKanban, color: "#6366f1" },
  completed:  { label: "Completed Tasks",   icon: CheckCircle2, color: "#10b981" },
  inProgress: { label: "In-Progress Tasks", icon: Clock,        color: "#f59e0b" },
  todo:       { label: "To-Do Tasks",       icon: AlertCircle,  color: "#94a3b8" },
  team:       { label: "Team Members",      icon: Users,        color: "#2dd4bf" },
};

export default function SupervisorLeads() {
  const ctx = useOutletContext?.() || {};
  const onMenuClick = ctx.onMenuClick;

  const leads = [...new Set(PROJECTS.map((p) => p.created_by))];

  const [leadList,     setLeadList]     = useState(leads);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeKpi,    setActiveKpi]    = useState(null);
  const [comments,     setComments]     = useState({});
  const [commentText,  setCommentText]  = useState("");
  const [deleteLeadId, setDeleteLeadId] = useState(null);

  const getComments = (id) => comments[id] || [];

  const addComment = (leadId) => {
    if (!commentText.trim()) return;
    const c = { c_id: Date.now(), text: commentText.trim(), created_at: new Date().toLocaleString(), pinned: false };
    setComments((p) => ({ ...p, [leadId]: [...(p[leadId] || []), c] }));
    setCommentText("");
  };

  const togglePin = (leadId, c_id) =>
    setComments((p) => ({ ...p, [leadId]: (p[leadId] || []).map((c) => c.c_id === c_id ? { ...c, pinned: !c.pinned } : c) }));

  const deleteComment = (leadId, c_id) =>
    setComments((p) => ({ ...p, [leadId]: (p[leadId] || []).filter((c) => c.c_id !== c_id) }));

  const deleteLead = (leadId) => {
    setLeadList((p) => p.filter((id) => id !== leadId));
    setDeleteLeadId(null); setSelectedLead(null); setActiveKpi(null);
  };

  const handleKpiClick = (key) => setActiveKpi((prev) => prev === key ? null : key);
  const openLead       = (id)  => { setSelectedLead(id); setActiveKpi(null); };

  const getDrillData = (key, d) => {
  switch (key) {
    case "projects":
      return d.projects;

    case "completed":
      return d.tasks.filter((t) => t.status === "done");

    case "inProgress":
      return d.tasks.filter((t) => t.status === "in_progress");

    case "todo":
      return d.tasks.filter((t) => t.status === "todo");

    case "team":
      return d.members;

    default:
      return [];
  }
};
  return (
    <div>
      <Topbar title="Leads Overview" onMenuClick={onMenuClick} />

      <div className="page-container">
        <div className="sl-grid">
          {leadList.map((leadId) => {
            const d      = getLeadData(leadId);
            const cCount = getComments(leadId).length;
            return (
              <motion.div key={leadId} className="card sl-card"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                onClick={() => openLead(leadId)}>
                <div className="sl-strip" style={{ background: d.perfColor }} />
                <div className="sl-card-header">
                  <div className="sl-avatar">{(d.user?.u_name || "?")[0].toUpperCase()}</div>
                  <div className="sl-card-title">
                    <h3>{d.user?.u_name || "Unknown"}</h3>
                    <span className="sl-perf-badge" style={{ color: d.perfColor, borderColor: d.perfColor }}>{d.performance}</span>
                  </div>
                  <ChevronRight size={16} className="sl-chevron" />
                </div>
                <div className="sl-stats-mini">
                  <MiniStat icon={FolderKanban} label="Projects" value={d.projects.length} />
                  <MiniStat icon={CheckCircle2} label="Done"     value={d.completed} />
                  <MiniStat icon={Activity}     label="Tasks"    value={d.tasks.length} />
                  <MiniStat icon={Users}        label="Team"     value={d.uniqueMemberIds.length} />
                </div>
                <div>
                  <div className="sl-progress-row">
                    <span>Completion</span>
                    <span style={{ color: d.perfColor, fontWeight: 700 }}>{d.completionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${d.completionRate}%`, background: d.perfColor }} />
                  </div>
                </div>
                <div className="sl-card-footer">
                  <div className="sl-project-tags">
                    {d.projects.slice(0, 2).map((p) => (
                      <span key={p.p_id} className="badge badge-gray sl-proj-tag">{p.p_name}</span>
                    ))}
                    {d.projects.length > 2 && <span className="badge badge-gray sl-proj-tag">+{d.projects.length - 2}</span>}
                  </div>
                  {cCount > 0 && <span className="sl-comment-count"><MessageSquare size={11} /> {cCount}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ══════════ LEAD DETAIL MODAL ══════════ */}
      <AnimatePresence>
        {selectedLead && (() => {
          const d            = getLeadData(selectedLead);
          const leadComments = [...getComments(selectedLead)].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
          const drillItems   = {
            projects:   d.projects,
            completed:  d.tasks.filter((t) => t.status === "done"),
            inProgress: d.tasks.filter((t) => t.status === "in_progress"),
            todo:       d.tasks.filter((t) => t.status === "todo"),
            team:       d.members,
          };

          return (
            <motion.div className="sl-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelectedLead(null); setActiveKpi(null); }}>

              <motion.div className="sl-modal"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}>

                <div className="sl-modal-strip" style={{ background: d.perfColor }} />

                {/* header */}
                <div className="sl-modal-header">
                  <div className="sl-modal-avatar" style={{ borderColor: d.perfColor, color: d.perfColor }}>
                    {(d.user?.u_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="sl-modal-title-block">
                    <h2 className="sl-modal-name">{d.user?.u_name || "Unknown Lead"}</h2>
                    <span className="sl-perf-badge lg" style={{ color: d.perfColor, borderColor: d.perfColor }}>
                      <Award size={11} /> {d.performance}
                    </span>
                  </div>
                  <div className="sl-modal-header-actions">
                    <button className="sl-icon-btn danger" title="Delete Lead" onClick={() => setDeleteLeadId(selectedLead)}>
                      <Trash2 size={15} />
                    </button>
                    <button className="sl-icon-btn" onClick={() => { setSelectedLead(null); setActiveKpi(null); }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* scrollable body */}
                <div className="sl-modal-body">

                  {/* ── KPI CARDS ── */}
                  <div className="sl-kpi-row">
                    {[
                      { key: "projects",   icon: FolderKanban, label: "Projects",    value: d.projects.length,        color: "#6366f1" },
                      { key: "completed",  icon: CheckCircle2, label: "Completed",   value: d.completed,              color: "#10b981" },
                      { key: "inProgress", icon: Clock,        label: "In Progress", value: d.inProgress,             color: "#f59e0b" },
                      { key: "todo",       icon: AlertCircle,  label: "To Do",       value: d.todo,                   color: "#94a3b8" },
                      { key: "team",       icon: Users,        label: "Team Size",   value: d.uniqueMemberIds.length, color: "#2dd4bf" },
                    ].map(({ key, icon: Icon, label, value, color }) => (
                      <motion.div key={key}
                        className={`sl-kpi-card${activeKpi === key ? " kpi-active" : ""}`}
                        style={{ "--kpi-color": color }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleKpiClick(key)}>
                        <div className="sl-kpi-icon" style={{ background: `${color}20` }}>
                          <Icon size={15} style={{ color }} />
                        </div>
                        <div className="sl-kpi-value">{value}</div>
                        <div className="sl-kpi-label">{label}</div>
                        {activeKpi === key && <div className="sl-kpi-dot" style={{ background: color }} />}
                      </motion.div>
                    ))}
                  </div>

                  {/* ── DRILL-DOWN PANEL ── */}
                  <AnimatePresence mode="wait">
                    {activeKpi && (
                      <motion.div className="sl-drilldown"
                        key={activeKpi}
                        style={{ "--drill-color": KPI_META[activeKpi].color }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}>

                        <div className="sl-drill-header">
                          <span className="sl-drill-title">
                            {(() => { const M = KPI_META[activeKpi]; return <><M.icon size={14} style={{ color: M.color }}/> {M.label}</>; })()}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="sl-drill-count">{drillItems[activeKpi].length}</span>
                            <button className="sl-icon-btn sm" onClick={() => setActiveKpi(null)}><X size={12}/></button>
                          </div>
                        </div>

                        <div className="sl-drill-list">
                          {drillItems[activeKpi].length === 0 ? (
                            <p className="sl-drill-empty">Nothing here yet.</p>
                          ) : activeKpi === "projects" ? (
                            d.projects.map((p) => (
                              <div key={p.p_id} className="sl-drill-row">
                                <div className="sl-drill-icon-wrap" style={{ background: "#6366f120" }}>
                                  <Briefcase size={13} style={{ color: "#6366f1" }}/>
                                </div>
                                <div className="sl-drill-info">
                                  <span className="sl-drill-name">{p.p_name}</span>
                                  {p.desc && <span className="sl-drill-sub">{p.desc}</span>}
                                </div>
                                <div className="sl-drill-badges">
                                  <StatusBadge status={p.status}/>
                                  <PriorityBadge priority={p.priority}/>
                                </div>
                              </div>
                            ))
                          ) : activeKpi === "team" ? (
                            d.members.map((m) => (
                              <div key={m.tm_id} className="sl-drill-row">
                                <div className="sl-drill-avatar-sm">{(m.name || m.tm_name || "?")[0].toUpperCase()}</div>
                                <div className="sl-drill-info">
                                  <span className="sl-drill-name">{m.name || m.tm_name}</span>
                                  {m.role  && <span className="sl-drill-sub">{m.role}</span>}
                                </div>
                                {m.email && <span className="sl-drill-email">{m.email}</span>}
                              </div>
                            ))
                          ) : (
                            drillItems[activeKpi].map((t) => {
                              const accentColor = KPI_META[activeKpi].color;
                              const proj = d.projects.find((p) => p.p_id === t.p_id);
                              const pct  = t.progress ?? (t.status === "done" ? 100 : t.status === "in_progress" ? 50 : 0);
                              return (
                                <div key={t.t_id} className="sl-drill-row">
                                  <div className="sl-drill-icon-wrap" style={{ background: `${accentColor}20` }}>
                                    <CheckCircle2 size={13} style={{ color: accentColor }}/>
                                  </div>
                                  <div className="sl-drill-info">
                                    <span className="sl-drill-name">{t.title}</span>
                                    {t.desc && <span className="sl-drill-sub">{t.desc}</span>}
                                    {proj && (
                                      <span className="sl-drill-proj-tag">
                                        <FolderKanban size={9}/> {proj.p_name}
                                      </span>
                                    )}
                                    <div className="sl-drill-prog-row">
                                      <div className="sl-drill-prog-track">
                                        <div className="sl-drill-prog-fill" style={{ width: `${pct}%`, background: accentColor }}/>
                                      </div>
                                      <span className="sl-drill-prog-pct">{pct}%</span>
                                    </div>
                                  </div>
                                  <div className="sl-drill-badges">
                                    <PriorityBadge priority={t.priority}/>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* COMPLETION */}
                  <div className="sl-section">
                    <h4 className="sl-section-title"><TrendingUp size={14}/> Completion Rate</h4>
                    <div className="sl-progress-row">
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Overall</span>
                      <span style={{ fontWeight: 700, color: d.perfColor }}>{d.completionRate}%</span>
                    </div>
                    <div className="sl-fat-track">
                      <motion.div className="sl-fat-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${d.completionRate}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ background: d.perfColor }}/>
                    </div>
                  </div>

                  {/* PROJECTS */}
                  <div className="sl-section">
                    <h4 className="sl-section-title"><FolderKanban size={14}/> Projects ({d.projects.length})</h4>
                    <div className="sl-project-list">
                      {d.projects.map((p) => (
                        <div key={p.p_id} className="sl-project-row">
                          <div className="sl-project-info">
                            <span className="sl-project-name">{p.p_name}</span>
                            {p.desc && <span className="sl-project-desc">{p.desc}</span>}
                          </div>
                          <div className="sl-project-badges">
                            <StatusBadge status={p.status}/>
                            <PriorityBadge priority={p.priority}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TASK BREAKDOWN */}
                  <div className="sl-section">
                    <h4 className="sl-section-title"><BarChart2 size={14}/> Task Breakdown</h4>
                    <div className="sl-task-breakdown">
                      <BreakdownBar label="Done"        value={d.completed}  total={d.tasks.length} color="#10b981"/>
                      <BreakdownBar label="In Progress" value={d.inProgress} total={d.tasks.length} color="#f59e0b"/>
                      <BreakdownBar label="To Do"       value={d.todo}       total={d.tasks.length} color="#94a3b8"/>
                    </div>
                  </div>

                  {/* TEAM */}
                  {d.members.length > 0 && (
                    <div className="sl-section">
                      <h4 className="sl-section-title"><Users size={14}/> Team Members ({d.members.length})</h4>
                      <div className="sl-team-grid">
                        {d.members.map((m) => (
                          <div key={m.tm_id} className="sl-member-chip">
                            <div className="sl-member-avatar">{(m.name || m.tm_name || "?")[0].toUpperCase()}</div>
                            <div>
                              <div className="sl-member-name">{m.name || m.tm_name}</div>
                              {m.role && <div className="sl-member-role">{m.role}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMMENTS */}
                  <div className="sl-section">
                    <h4 className="sl-section-title"><MessageSquare size={14}/> Comments</h4>
                    <div className="sl-comment-input-row">
                      <textarea className="sl-comment-input"
                        placeholder="Send a comment to this lead… (Ctrl+Enter to send)"
                        value={commentText} rows={2}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) addComment(selectedLead); }}/>
                      <button className="sl-send-btn" onClick={() => addComment(selectedLead)}>
                        <Send size={14}/> Send
                      </button>
                    </div>
                    {leadComments.length === 0
                      ? <p className="sl-no-comments">No comments yet. Be the first!</p>
                      : (
                        <div className="sl-comment-list">
                          {leadComments.map((c) => (
                            <div key={c.c_id} className={`sl-comment-item${c.pinned ? " pinned" : ""}`}>
                              {c.pinned && <div className="sl-pin-label"><Pin size={10}/> Pinned</div>}
                              <p className="sl-comment-text">{c.text}</p>
                              <div className="sl-comment-footer">
                                <small className="sl-comment-time">{c.created_at}</small>
                                <div className="sl-comment-actions">
                                  <button className={`sl-icon-btn sm${c.pinned ? " active" : ""}`}
                                    title={c.pinned ? "Unpin" : "Pin"}
                                    onClick={() => togglePin(selectedLead, c.c_id)}>
                                    {c.pinned ? <PinOff size={11}/> : <Pin size={11}/>}
                                  </button>
                                  <button className="sl-icon-btn sm danger"
                                    onClick={() => deleteComment(selectedLead, c.c_id)}>
                                    <Trash2 size={11}/>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ══ DELETE LEAD CONFIRM ══ */}
      <AnimatePresence>
        {deleteLeadId !== null && (
          <motion.div className="sl-overlay" style={{ zIndex: 1100 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteLeadId(null)}>
            <motion.div className="sl-confirm-box"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}>
              <Trash2 size={28} style={{ color: "#f43f5e", marginBottom: 10 }}/>
              <h3 className="sl-confirm-title">Remove Lead?</h3>
              <p className="sl-confirm-desc">This lead will be removed from the overview. Their projects and tasks remain in the system.</p>
              <div className="sl-confirm-actions">
                <button className="sl-btn sl-btn-danger" onClick={() => deleteLead(deleteLeadId)}>Yes, Remove</button>
                <button className="sl-btn sl-btn-ghost"  onClick={() => setDeleteLeadId(null)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px,1fr)); gap: 18px; }

        .sl-card {
          padding: 18px; position: relative; overflow: hidden; cursor: pointer;
          display: flex; flex-direction: column; gap: 14px; transition: box-shadow 0.2s;
        }
        .sl-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.12); }
        .sl-strip { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
        .sl-card-header { display: flex; align-items: center; gap: 10px; padding-top: 4px; }
        .sl-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--bg-secondary); border: 2px solid var(--border-subtle);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: var(--text-primary); flex-shrink: 0;
        }
        .sl-card-title { flex: 1; min-width: 0; }
        .sl-card-title h3 { font-size: 14px; font-weight: 700; color: var(--text-primary); }
        .sl-chevron { color: var(--text-muted); flex-shrink: 0; }
        .sl-perf-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; border: 1px solid; border-radius: 20px;
          padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.4px;
        }
        .sl-perf-badge.lg { font-size: 11px; padding: 3px 10px; }
        .sl-stats-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .sl-progress-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 5px; color: var(--text-secondary); }
        .sl-card-footer {
          display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
          border-top: 1px solid var(--border-subtle); padding-top: 10px;
        }
        .sl-project-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .sl-proj-tag { font-size: 10px !important; padding: 2px 8px !important; }
        .sl-comment-count { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }

        .sl-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
        }
        .sl-modal {
          width: 100%; max-width: 640px; max-height: 90vh;
          background: var(--bg-card); border: 1px solid var(--border-default); border-radius: 22px;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }
        .sl-modal-strip { height: 4px; width: 100%; flex-shrink: 0; }
        .sl-modal-header {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px 14px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0;
        }
        .sl-modal-avatar {
          width: 52px; height: 52px; border-radius: 50%; border: 2px solid;
          background: var(--bg-secondary);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800; flex-shrink: 0;
        }
        .sl-modal-title-block { flex: 1; min-width: 0; }
        .sl-modal-name { font-size: 19px; font-weight: 800; color: var(--text-primary); margin-bottom: 5px; }
        .sl-modal-header-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .sl-modal-body {
          overflow-y: auto; padding: 18px 20px 24px; display: flex; flex-direction: column; gap: 20px;
          scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;
        }

        /* kpi */
        .sl-kpi-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
        .sl-kpi-card {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 12px 8px; border-radius: 12px; border: 1px solid var(--border-subtle);
          background: var(--bg-secondary); text-align: center; cursor: pointer;
          position: relative; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          user-select: none;
        }
        .sl-kpi-card:hover {
          border-color: var(--kpi-color, var(--accent-primary));
          box-shadow: 0 2px 12px rgba(0,0,0,0.09);
        }
        .sl-kpi-card.kpi-active {
          border-color: var(--kpi-color, var(--accent-primary));
          background: color-mix(in srgb, var(--kpi-color, var(--accent-primary)) 10%, var(--bg-secondary));
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--kpi-color, var(--accent-primary)) 25%, transparent);
        }
        .sl-kpi-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .sl-kpi-value { font-size: 20px; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .sl-kpi-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .sl-kpi-dot {
          position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
          width: 5px; height: 5px; border-radius: 50%;
        }

        /* drill-down */
        .sl-drilldown {
          border: 1px solid color-mix(in srgb, var(--drill-color, var(--accent-primary)) 35%, var(--border-subtle));
          border-radius: 14px; overflow: hidden;
          background: color-mix(in srgb, var(--drill-color, var(--accent-primary)) 4%, var(--bg-secondary));
        }
        .sl-drill-header {
          display: flex; align-items: center; justify-content: space-between; padding: 10px 14px;
          border-bottom: 1px solid color-mix(in srgb, var(--drill-color, var(--accent-primary)) 20%, var(--border-subtle));
          background: color-mix(in srgb, var(--drill-color, var(--accent-primary)) 8%, var(--bg-card));
        }
        .sl-drill-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--text-primary); }
        .sl-drill-count {
          font-size: 11px; font-weight: 700;
          background: color-mix(in srgb, var(--drill-color, var(--accent-primary)) 18%, transparent);
          color: var(--drill-color, var(--accent-primary));
          border-radius: 20px; padding: 2px 9px;
        }
        .sl-drill-list {
          display: flex; flex-direction: column; max-height: 320px; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;
        }
        .sl-drill-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-bottom: 1px solid color-mix(in srgb, var(--drill-color, var(--accent-primary)) 10%, var(--border-subtle));
          transition: background 0.12s;
        }
        .sl-drill-row:last-child { border-bottom: none; }
        .sl-drill-row:hover { background: color-mix(in srgb, var(--drill-color, var(--accent-primary)) 6%, transparent); }
        .sl-drill-icon-wrap {
          width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sl-drill-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .sl-drill-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sl-drill-sub  { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sl-drill-proj-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; color: var(--text-muted); margin-top: 2px; }
        .sl-drill-prog-row { display: flex; align-items: center; gap: 7px; margin-top: 5px; }
        .sl-drill-prog-track { flex: 1; height: 5px; background: var(--border-subtle); border-radius: 10px; overflow: hidden; }
        .sl-drill-prog-fill { height: 100%; border-radius: 10px; }
        .sl-drill-prog-pct { font-size: 10px; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }
        .sl-drill-badges { display: flex; gap: 5px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .sl-drill-avatar-sm {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: var(--bg-card); border: 1px solid var(--border-default);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: var(--text-primary);
        }
        .sl-drill-email { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
        .sl-drill-empty { text-align: center; color: var(--text-muted); font-size: 13px; padding: 18px 0; }

        .sl-section { display: flex; flex-direction: column; gap: 10px; }
        .sl-section-title {
          display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700;
          color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;
        }
        .sl-fat-track { width: 100%; height: 12px; background: var(--border-subtle); border-radius: 20px; overflow: hidden; }
        .sl-fat-fill  { height: 100%; border-radius: 20px; }

        .sl-project-list { display: flex; flex-direction: column; gap: 8px; }
        .sl-project-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 10px 14px; border-radius: 10px; background: var(--bg-secondary);
          border: 1px solid var(--border-subtle); flex-wrap: wrap;
        }
        .sl-project-info { flex: 1; min-width: 0; }
        .sl-project-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sl-project-desc { font-size: 11px; color: var(--text-muted); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sl-project-badges { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; }

        .sl-task-breakdown { display: flex; flex-direction: column; gap: 8px; }
        .sl-breakdown-row  { display: flex; align-items: center; gap: 10px; }
        .sl-breakdown-label { font-size: 12px; color: var(--text-secondary); width: 90px; flex-shrink: 0; }
        .sl-breakdown-track { flex: 1; height: 7px; background: var(--border-subtle); border-radius: 10px; overflow: hidden; }
        .sl-breakdown-fill  { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
        .sl-breakdown-val   { font-size: 12px; font-weight: 700; color: var(--text-primary); width: 28px; text-align: right; flex-shrink: 0; }

        .sl-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 8px; }
        .sl-member-chip {
          display: flex; align-items: center; gap: 9px; padding: 9px 12px;
          border-radius: 10px; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
        }
        .sl-member-avatar {
          width: 30px; height: 30px; border-radius: 50%; background: var(--bg-card);
          border: 1px solid var(--border-default); display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: var(--text-primary); flex-shrink: 0;
        }
        .sl-member-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
        .sl-member-role { font-size: 10px; color: var(--text-muted); }

        .sl-comment-input-row { display: flex; flex-direction: column; gap: 8px; }
        .sl-comment-input {
          width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px;
          border: 1px solid var(--border-default); background: var(--bg-secondary);
          color: var(--text-primary); font-size: 13px; resize: none; line-height: 1.5;
        }
        .sl-comment-input:focus { outline: none; border-color: var(--accent-primary); }
        .sl-send-btn {
          align-self: flex-end; display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; border: none;
          background: var(--accent-primary); color: #fff;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
        }
        .sl-send-btn:hover { opacity: 0.85; }
        .sl-no-comments { font-size: 13px; color: var(--text-muted); text-align: center; padding: 16px 0; }
        .sl-comment-list { display: flex; flex-direction: column; gap: 8px; }
        .sl-comment-item {
          padding: 11px 13px; border-radius: 10px; border: 1px solid var(--border-subtle);
          background: var(--bg-secondary); word-break: break-word; transition: border-color 0.15s;
        }
        .sl-comment-item.pinned {
          border-color: var(--accent-primary);
          background: color-mix(in srgb, var(--accent-primary) 5%, var(--bg-secondary));
        }
        .sl-pin-label {
          display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700;
          color: var(--accent-primary); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px;
        }
        .sl-comment-text   { font-size: 13px; color: var(--text-primary); line-height: 1.5; }
        .sl-comment-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .sl-comment-time   { font-size: 11px; color: var(--text-muted); }
        .sl-comment-actions { display: flex; gap: 4px; }

        .sl-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 6px 8px; border-radius: 8px; border: 1px solid var(--border-subtle);
          background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer; transition: all 0.14s;
        }
        .sl-icon-btn.sm { padding: 4px 6px; }
        .sl-icon-btn:hover { background: var(--bg-primary); color: var(--accent-primary); border-color: var(--accent-primary); }
        .sl-icon-btn.danger:hover { color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,0.08); }
        .sl-icon-btn.active { color: var(--accent-primary); border-color: var(--accent-primary); }

        .sl-confirm-box {
          background: var(--bg-card); border: 1px solid var(--border-default); border-radius: 20px;
          padding: 32px 28px 24px; max-width: 380px; width: 100%; text-align: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
        }
        .sl-confirm-title { font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
        .sl-confirm-desc  { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 22px; }
        .sl-confirm-actions { display: flex; gap: 10px; justify-content: center; }
        .sl-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
        .sl-btn-danger { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
        .sl-btn-danger:hover { background: rgba(239,68,68,0.2); }
        .sl-btn-ghost  { background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-default); }
        .sl-btn-ghost:hover { border-color: var(--accent-primary); }

        @media (max-width: 600px) {
          .sl-kpi-row { grid-template-columns: repeat(3,1fr); }
          .sl-modal { max-height: 95vh; border-radius: 18px; }
          .sl-team-grid { grid-template-columns: 1fr 1fr; }
          .sl-modal-name { font-size: 16px; }
          .sl-drill-list { max-height: 260px; }
        }
        @media (max-width: 420px) {
          .sl-kpi-row { grid-template-columns: repeat(2,1fr); }
          .sl-team-grid { grid-template-columns: 1fr; }
          .sl-modal-header { padding: 14px 14px 12px; }
          .sl-modal-body { padding: 14px 14px 20px; }
          .sl-modal-avatar { width: 42px; height: 42px; font-size: 16px; }
          .sl-drill-list { max-height: 200px; }
        }
      `}</style>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", background:"var(--bg-secondary)", padding:"8px 10px", borderRadius:8, border:"1px solid var(--border-subtle)" }}>
      <Icon size={13} style={{ color:"var(--text-muted)", flexShrink:0 }} />
      <div>
        <p style={{ fontSize:10, color:"var(--text-muted)" }}>{label}</p>
        <p style={{ fontWeight:700, fontSize:13 }}>{value}</p>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, total, color }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="sl-breakdown-row">
      <span className="sl-breakdown-label">{label}</span>
      <div className="sl-breakdown-track">
        <div className="sl-breakdown-fill" style={{ width:`${pct}%`, background:color }}/>
      </div>
      <span className="sl-breakdown-val">{value}</span>
    </div>
  );
}