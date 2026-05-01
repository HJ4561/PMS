// components/lead/LeadTeamMembers.jsx
import { useState } from 'react';
import { Search, UserPlus, Trash2, Pencil } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Topbar from '../shared/Topbar';
import {
  TEAM_MEMBERS,
  getMemberStats,
  getUserById
} from '../../data/mockData';
import { ProgressRing, Modal } from '../shared/UIComponents';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '',
  role: '',
  qualification: '',
  experience: '',
  skills: '',
  email: ''
};

export default function LeadTeamMembers() {
  const [search, setSearch] = useState('');
  const { onMenuClick } = useOutletContext();

  const [members, setMembers] = useState(
    TEAM_MEMBERS.filter(m => !m.is_deleted)
  );

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const colors = [
    '#6366f1',
    '#2dd4bf',
    '#f43f5e',
    '#f59e0b',
    '#10b981',
    '#f97316',
    '#ec4899',
    '#a78bfa'
  ];

  const filtered = members.filter(m => {
    const skills = m.skills || '';
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      skills.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ADD MEMBER
  const handleAdd = () => {
    const { name, role, email, qualification, experience, skills } = form;

    if (!name.trim()) return toast.error('Name is required');
    if (!role.trim()) return toast.error('Role is required');
    if (!email.trim()) return toast.error('Email is required');
    if (!qualification.trim()) return toast.error('Qualification is required');
    if (!experience.toString().trim()) return toast.error('Experience is required');
    if (!skills.trim()) return toast.error('Skills are required');

    const newMember = {
      tm_id: Date.now(),
      ...form,
      experience: parseInt(experience) || 0,
      added_by: 1,
      is_deleted: false,
      avatar_color: colors[Math.floor(Math.random() * colors.length)]
    };

    TEAM_MEMBERS.push(newMember);
    setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
    setShowAdd(false);
    setForm(defaultForm);
    toast.success('Member added successfully');
  };

  // DELETE
  const handleDelete = (id) => {
    const index = TEAM_MEMBERS.findIndex(m => m.tm_id === id);
    if (index !== -1) {
      TEAM_MEMBERS[index].is_deleted = true;
      setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
      toast.success('Member removed');
    }
  };

  // EDIT
  const openEdit = (member) => {
    setSelected(member);
    setForm(member);
    setShowEdit(true);
  };

  // UPDATE
  const handleUpdate = () => {
    const index = TEAM_MEMBERS.findIndex(m => m.tm_id === selected.tm_id);
    if (index !== -1) {
      TEAM_MEMBERS[index] = {
        ...TEAM_MEMBERS[index],
        ...form,
        experience: parseInt(form.experience) || 0
      };
      setMembers(TEAM_MEMBERS.filter(m => !m.is_deleted));
      setShowEdit(false);
      toast.success('Updated successfully');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const closeAddModal = () => {
    setShowAdd(false);
    setForm(defaultForm);
  };

  const closeEditModal = () => {
    setShowEdit(false);
    setSelected(null);
    setForm(defaultForm);
  };

  return (
    <div>
      {/* TOPBAR */}
     <Topbar
  title="Team Members"
  onMenuClick={onMenuClick}
  searchBar={
    <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
      <Search
        size={14}
        style={{
          position: 'absolute',
          left: 11,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }}
      />
      <input
        className="input"
        placeholder="Search by name, role, or skills…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ paddingLeft: 34, width: '100%' }}
      />
    </div>
  }
/>

      <div className="page-container">
        {/* ADD MEMBER BUTTON */}
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
  <button
    className="btn btn-primary btn-sm"
    onClick={() => setShowAdd(true)}
  >
    <UserPlus size={14} /> Add Member
  </button>
</div>

        {/* GRID */}
        <div className="grid-auto stagger-children">
          {filtered.map((member, i) => {
            const stats = getMemberStats(member.tm_id);
            const color = member.avatar_color || colors[i % colors.length];
            const addedBy = getUserById(member.added_by);
            const skills = member.skills || '';
            const onTimeRate =
              stats.completedTasks > 0
                ? Math.round((stats.completedOnTime / stats.completedTasks) * 100)
                : 0;
            const initials = member.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase();

            return (
              <motion.div
                key={member.tm_id}
                className="member-card animate-fade-in"
                whileHover={{ scale: 1.03 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -120) handleDelete(member.tm_id);
                }}
                onClick={() => setDrawer(member)}
              >
                {/* ACTIONS */}
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-secondary btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(member);
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="btn btn-danger btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member.tm_id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* HEADER */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    className="avatar avatar-lg"
                    style={{
                      background: color + '22',
                      color,
                      border: `2px solid ${color}40`,
                      width: 50,
                      height: 50,
                      fontSize: 17
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 14.5 }}>
                      {member.name}
                    </h3>
                    <span className="badge badge-purple" style={{ fontSize: 10.5 }}>
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {member.qualification} · {member.experience} yrs exp
                </p>

                {/* SKILLS */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {skills.split(', ').slice(0, 4).map(s => (
                    <span key={s} className="badge badge-gray" style={{ fontSize: 10.5 }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* STATS */}
                <div style={{
                  display: 'flex',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {[
                    { label: 'Tasks', value: stats.totalTasks },
                    { label: 'Done', value: stats.completedTasks },
                    { label: 'Active', value: stats.inProgressTasks }
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: 10 }}>
                      <p style={{ fontWeight: 900 }}>{s.value}</p>
                      <p style={{ fontSize: 10 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* PERFORMANCE */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ProgressRing progress={onTimeRate} size={44} strokeWidth={4} />
                  <div>
                    <p>{onTimeRate}% On-time</p>
                    {addedBy && (
                      <p style={{ fontSize: 11 }}>
                        Added by {addedBy.u_name}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* DRAWER */}
{/* DRAWER */}
<AnimatePresence>
  {drawer && (() => {
    const stats = getMemberStats(drawer.tm_id);

    const currentProjects = [
      {
        name: 'AI Travel Genie',
        role: 'Frontend Developer',
        progress: 82,
        status: 'In Progress'
      },
      {
        name: 'PMS Dashboard',
        role: 'UI Engineer',
        progress: 65,
        status: 'Ongoing'
      }
    ];

    const completedProjects = [
      {
        name: 'HR Management System',
        duration: '4 Months',
        performance: 'Excellent'
      },
      {
        name: 'CRM Portal',
        duration: '2 Months',
        performance: 'Very Good'
      },
      {
        name: 'Inventory System',
        duration: '3 Months',
        performance: 'Excellent'
      }
    ];

    const workHistory = [
      {
        year: '2026',
        text: 'Assigned to AI Travel Genie under Lead Ahmed'
      },
      {
        year: '2025',
        text: 'Completed CRM Portal successfully'
      },
      {
        year: '2025',
        text: 'Promoted to Senior Frontend Developer'
      },
      {
        year: '2024',
        text: 'Joined Development Team'
      }
    ];

    const initials = drawer.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setDrawer(null)}
        className="member-modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.28 }}
          onClick={(e) => e.stopPropagation()}
          className="member-modal"
        >
          {/* HEADER */}
          <div className="member-modal-header">
            <div className="member-header-top">
              
              <div className="member-header-left">
                <div
                  className="member-avatar-large"
                  style={{
                    background: drawer.avatar_color + '22',
                    border: `3px solid ${drawer.avatar_color}55`,
                    color: drawer.avatar_color
                  }}
                >
                  {initials}
                </div>

                <div className="member-header-info">
                  <h1 className="member-name">
                    {drawer.name}
                  </h1>

                  <div className="member-badges">
                    <span className="badge badge-purple">
                      {drawer.role}
                    </span>

                    <span className="badge badge-green">
                      Active Employee
                    </span>

                    <span className="badge badge-gray">
                      {drawer.experience} Years Experience
                    </span>
                  </div>

                  <p className="member-email">
                    {drawer.email}
                  </p>

                  <p className="member-lead">
                    Currently working under Lead:
                    <b> Ahmed Hassan</b>
                  </p>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setDrawer(null)}
                style={{ height: 'fit-content' }}
              >
                Close
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="member-modal-body">
            
            {/* LEFT */}
            <div className="member-left-column">

              {/* CURRENT PROJECTS */}
              <div className="member-section">
                <h3 className="member-section-title">
                  Current Projects
                </h3>

                <div className="member-flex-col">
                  {currentProjects.map((p, i) => (
                    <div
                      key={i}
                      className="member-inner-card"
                    >
                      <div className="member-project-top">
                        <div>
                          <h4 style={{ fontWeight: 800 }}>
                            {p.name}
                          </h4>

                          <p style={{ fontSize: 12 }}>
                            {p.role}
                          </p>
                        </div>

                        <span className="badge badge-blue">
                          {p.status}
                        </span>
                      </div>

                      <div className="member-progress-bg">
                        <div
                          className="member-progress-fill"
                          style={{
                            width: `${p.progress}%`
                          }}
                        />
                      </div>

                      <p className="member-progress-text">
                        {p.progress}% Completed
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* HISTORY */}
              <div className="member-section">
                <h3 className="member-section-title">
                  Project History
                </h3>

                <div className="member-flex-col">
                  {completedProjects.map((p, i) => (
                    <div
                      key={i}
                      className="member-history-card"
                    >
                      <div>
                        <h4 style={{ fontWeight: 800 }}>
                          {p.name}
                        </h4>

                        <p style={{ fontSize: 12 }}>
                          Duration: {p.duration}
                        </p>
                      </div>

                      <span className="badge badge-green">
                        {p.performance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIMELINE */}
              <div className="member-section">
                <h3 className="member-section-title">
                  Work Timeline
                </h3>

                <div className="member-flex-col">
                  {workHistory.map((item, i) => (
                    <div
                      key={i}
                      className="timeline-item"
                    >
                      <div className="timeline-year">
                        {item.year}
                      </div>

                      <div className="timeline-content">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="member-right-column">

              {/* PERFORMANCE */}
              <div className="member-section">
                <h3 className="member-section-title">
                  Performance
                </h3>

                <div className="performance-grid">
                  {[
                    {
                      label: 'Tasks',
                      value: stats.totalTasks
                    },
                    {
                      label: 'Completed',
                      value: stats.completedTasks
                    },
                    {
                      label: 'Active',
                      value: stats.inProgressTasks
                    },
                    {
                      label: 'On-Time',
                      value:
                        stats.completedTasks > 0
                          ? Math.round(
                              (stats.completedOnTime /
                                stats.completedTasks) *
                                100
                            ) + '%'
                          : '0%'
                    }
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="performance-card"
                    >
                      <h2 style={{ fontWeight: 900 }}>
                        {s.value}
                      </h2>

                      <p style={{ fontSize: 12 }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SKILLS */}
              <div className="member-section">
                <h3 className="member-section-title">
                  Skills & Expertise
                </h3>

                <div className="skills-wrap">
                  {(drawer.skills || '')
                    .split(',')
                    .map((s, i) => (
                      <span
                        key={i}
                        className="badge badge-gray"
                        style={{
                          padding: '8px 12px',
                          fontSize: 12
                        }}
                      >
                        {s.trim()}
                      </span>
                    ))}
                </div>
              </div>

              {/* WORKLOAD */}
              <div className="member-section">
                <h3 className="member-section-title">
                  Workload Overview
                </h3>

                <div className="member-flex-col">
                  {[
                    ['Assigned Tasks', 18],
                    ['Completed Sprint Tasks', 12],
                    ['Pending Reviews', 4],
                    ['Bug Fixes', 7]
                  ].map(([label, val], i) => (
                    <div key={i}>
                      <div className="workload-top">
                        <span>{label}</span>
                        <b>{val}</b>
                      </div>

                      <div className="member-progress-bg">
                        <div
                          className="member-progress-fill workload-fill"
                          style={{
                            width: `${Math.min(val * 5, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* RESPONSIVE CSS */}

<style>{`
  .member-modal-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.75);
    backdrop-filter:blur(8px);
    z-index:999999;
    padding:clamp(8px,2vw,28px);
    overflow-y:auto;
  }

  .member-modal{
    width:100%;
    max-width:min(1400px,96vw);
    margin:0 auto;
    border-radius:clamp(16px,2vw,30px);
    background:var(--bg-card);
    border:1px solid var(--border-subtle);
    overflow:hidden;
    box-shadow:0 20px 80px rgba(0,0,0,0.45);
  }

  /* =========================
     HEADER
  ========================= */

  .member-modal-header{
    padding:clamp(16px,2.5vw,34px);
    background:linear-gradient(
      135deg,
      rgba(99,102,241,.15),
      rgba(45,212,191,.08)
    );
    border-bottom:1px solid var(--border-subtle);
  }

  .member-header-top{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:20px;
    flex-wrap:wrap;
  }

  .member-header-left{
    display:flex;
    gap:clamp(14px,2vw,24px);
    align-items:center;
    flex-wrap:wrap;
    flex:1;
    min-width:0;
  }

  .member-avatar-large{
    width:clamp(64px,8vw,96px);
    height:clamp(64px,8vw,96px);
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:900;
    font-size:clamp(20px,2.5vw,30px);
    flex-shrink:0;
  }

  .member-header-info{
    flex:1;
    min-width:220px;
  }

  .member-name{
    font-size:clamp(20px,3vw,34px);
    font-weight:900;
    margin-bottom:10px;
    line-height:1.15;
    word-break:break-word;
  }

  .member-badges{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    margin-bottom:10px;
  }

  .member-email{
    color:var(--text-secondary);
    font-size:clamp(12px,1.2vw,15px);
    word-break:break-word;
  }

  .member-lead{
    margin-top:6px;
    font-size:clamp(11px,1vw,13px);
    color:var(--text-secondary);
  }

  /* =========================
     BODY
  ========================= */

  .member-modal-body{
    padding:clamp(14px,2vw,30px);
    display:grid;
    grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);
    gap:clamp(14px,2vw,28px);
  }

  .member-left-column,
  .member-right-column,
  .member-flex-col{
    display:flex;
    flex-direction:column;
    gap:clamp(14px,1.5vw,22px);
    min-width:0;
  }

  /* =========================
     SECTIONS
  ========================= */

  .member-section{
    padding:clamp(14px,1.8vw,24px);
    border-radius:clamp(14px,1.5vw,24px);
    background:var(--bg-secondary);
    border:1px solid var(--border-subtle);
  }

  .member-section-title{
    margin-bottom:clamp(14px,1.5vw,20px);
    font-weight:900;
    font-size:clamp(14px,1.4vw,18px);
  }

  /* =========================
     INNER CARDS
  ========================= */

  .member-inner-card,
  .member-history-card,
  .timeline-content,
  .performance-card{
    padding:clamp(12px,1.4vw,18px);
    border-radius:clamp(12px,1.3vw,18px);
    background:var(--bg-card);
    border:1px solid var(--border-subtle);
  }

  .member-project-top,
  .member-history-card,
  .workload-top{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:12px;
  }

  .member-project-top h4,
  .member-history-card h4{
    font-size:clamp(13px,1.3vw,16px);
    line-height:1.3;
  }

  .member-project-top p,
  .member-history-card p{
    font-size:clamp(11px,1vw,13px) !important;
  }

  /* =========================
     PROGRESS
  ========================= */

  .member-progress-bg{
    height:clamp(6px,.8vw,8px);
    border-radius:999px;
    overflow:hidden;
    background:#23263a;
    margin-top:10px;
  }

  .member-progress-fill{
    height:100%;
    background:linear-gradient(
      90deg,
      #6366f1,
      #2dd4bf
    );
  }

  .workload-fill{
    background:linear-gradient(
      90deg,
      #6366f1,
      #8b5cf6
    );
  }

  .member-progress-text{
    margin-top:8px;
    font-size:clamp(11px,1vw,13px);
    text-align:right;
  }

  /* =========================
     TIMELINE
  ========================= */

  .timeline-item{
    display:flex;
    gap:14px;
    align-items:flex-start;
  }

  .timeline-year{
    min-width:clamp(55px,6vw,80px);
    font-weight:800;
    color:#6366f1;
    font-size:clamp(12px,1vw,14px);
  }

  .timeline-content{
    flex:1;
    font-size:clamp(12px,1vw,14px);
    line-height:1.5;
  }

  /* =========================
     PERFORMANCE GRID
  ========================= */

  .performance-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:12px;
  }

  .performance-card{
    text-align:center;
  }

  .performance-card h2{
    font-size:clamp(18px,2vw,28px);
    line-height:1.1;
  }

  .performance-card p{
    font-size:clamp(11px,1vw,13px) !important;
  }

  /* =========================
     SKILLS
  ========================= */

  .skills-wrap{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
  }

  .skills-wrap .badge{
    font-size:clamp(10px,1vw,12px) !important;
    padding:clamp(6px,.8vw,9px) clamp(10px,1vw,14px) !important;
  }

  /* =========================
     RESPONSIVE
  ========================= */

  @media (max-width:1200px){

    .member-modal{
      max-width:98vw;
    }

    .member-modal-body{
      grid-template-columns:1fr;
    }

    .member-right-column{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:18px;
      align-items:start;
    }
  }

  @media (max-width:900px){

    .member-modal-overlay{
      padding:12px;
    }

    .member-header-top{
      flex-direction:column;
      align-items:flex-start;
    }

    .member-right-column{
      grid-template-columns:1fr;
    }

    .member-modal-body{
      gap:18px;
    }
  }

  @media (max-width:768px){

    .member-header-left{
      align-items:flex-start;
    }

    .member-modal{
      border-radius:18px;
    }

    .timeline-item{
      flex-direction:column;
      gap:8px;
    }

    .timeline-year{
      min-width:unset;
    }
  }

  @media (max-width:560px){

    .member-modal-overlay{
      padding:6px;
    }

    .member-modal{
      border-radius:14px;
      max-width:100%;
    }

    .member-modal-header{
      padding:14px;
    }

    .member-modal-body{
      padding:12px;
      gap:14px;
    }

    .member-header-left{
      flex-direction:column;
      align-items:flex-start;
    }

    .member-header-info{
      min-width:100%;
    }

    .performance-grid{
      grid-template-columns:1fr;
    }

    .member-project-top,
    .member-history-card,
    .workload-top{
      flex-direction:column;
      align-items:flex-start;
    }

    .member-project-top .badge,
    .member-history-card .badge{
      align-self:flex-start;
    }

    .member-section{
      padding:12px;
    }

    .member-badges{
      gap:6px;
    }

    .member-badges .badge{
      font-size:10px !important;
    }

    .btn{
      min-height:40px;
    }
  }

  @media (max-width:380px){

    .member-name{
      font-size:18px;
    }

    .member-avatar-large{
      width:58px;
      height:58px;
      font-size:18px;
    }

    .member-section-title{
      font-size:13px;
    }

    .performance-card h2{
      font-size:18px;
    }

    .member-project-top h4,
    .member-history-card h4{
      font-size:12px;
    }
  }
`}</style>
      </motion.div>
    );
  })()}
</AnimatePresence>

      {/* ADD MODAL */}
      <Modal
        isOpen={showAdd}
        onClose={closeAddModal}
        title="Add New Team Member"
      >
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="qualification"
          placeholder="Qualification"
          value={form.qualification}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="experience"
          type="number"
          placeholder="Years of Experience"
          value={form.experience}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="skills"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary flex-1" onClick={closeAddModal}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1" onClick={handleAdd}>
            Add Member
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={showEdit}
        onClose={closeEditModal}
        title="Edit Team Member"
      >
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="qualification"
          placeholder="Qualification"
          value={form.qualification}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="experience"
          type="number"
          placeholder="Years of Experience"
          value={form.experience}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 12 }}
        />
        <input
          name="skills"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={handleFormChange}
          className="input"
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary flex-1" onClick={closeEditModal}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1" onClick={handleUpdate}>
            Update Member
          </button>
        </div>
      </Modal>
    </div>
  );
}