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
      {/* EXPANDED MEMBER POPUP */}
<AnimatePresence>
  {drawer && (() => {
    const stats = getMemberStats(drawer.tm_id);

    // MOCK PROJECT DATA
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
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          padding: 24,
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            borderRadius: 28,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.45)'
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: 30,
              background:
                'linear-gradient(135deg, rgba(99,102,241,.15), rgba(45,212,191,.08))',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: drawer.avatar_color + '22',
                    border: `3px solid ${drawer.avatar_color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 28,
                    color: drawer.avatar_color
                  }}
                >
                  {initials}
                </div>

                <div>
                  <h1
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      marginBottom: 8
                    }}
                  >
                    {drawer.name}
                  </h1>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginBottom: 10
                    }}
                  >
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

                  <p style={{ color: 'var(--text-secondary)' }}>
                    {drawer.email}
                  </p>

                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: 'var(--text-secondary)'
                    }}
                  >
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
          <div
            style={{
              padding: 26,
              display: 'grid',
              gridTemplateColumns: '1.2fr .8fr',
              gap: 24
            }}
          >
            {/* LEFT SIDE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* CURRENT PROJECTS */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ marginBottom: 18, fontWeight: 900 }}>
                  Current Projects
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentProjects.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 10
                        }}
                      >
                        <div>
                          <h4 style={{ fontWeight: 800 }}>{p.name}</h4>
                          <p style={{ fontSize: 12 }}>{p.role}</p>
                        </div>

                        <span className="badge badge-blue">
                          {p.status}
                        </span>
                      </div>

                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          overflow: 'hidden',
                          background: '#23263a'
                        }}
                      >
                        <div
                          style={{
                            width: `${p.progress}%`,
                            height: '100%',
                            background:
                              'linear-gradient(90deg,#6366f1,#2dd4bf)'
                          }}
                        />
                      </div>

                      <p
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          textAlign: 'right'
                        }}
                      >
                        {p.progress}% Completed
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMPLETED PROJECTS */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ marginBottom: 18, fontWeight: 900 }}>
                  Project History
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {completedProjects.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 14,
                        borderRadius: 14,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <h4 style={{ fontWeight: 800 }}>{p.name}</h4>
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
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ marginBottom: 20, fontWeight: 900 }}>
                  Work Timeline
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {workHistory.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 14,
                        alignItems: 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          minWidth: 70,
                          fontWeight: 800,
                          color: '#6366f1'
                        }}
                      >
                        {item.year}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          padding: 14,
                          borderRadius: 14,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* PERFORMANCE */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ marginBottom: 18, fontWeight: 900 }}>
                  Performance
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12
                  }}
                >
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
                      style={{
                        padding: 18,
                        borderRadius: 16,
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <h2 style={{ fontWeight: 900 }}>{s.value}</h2>
                      <p style={{ fontSize: 12 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SKILLS */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ marginBottom: 16, fontWeight: 900 }}>
                  Skills & Expertise
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  {(drawer.skills || '').split(',').map((s, i) => (
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
              <div
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ marginBottom: 16, fontWeight: 900 }}>
                  Workload Overview
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    ['Assigned Tasks', 18],
                    ['Completed Sprint Tasks', 12],
                    ['Pending Reviews', 4],
                    ['Bug Fixes', 7]
                  ].map(([label, val], i) => (
                    <div key={i}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 6
                        }}
                      >
                        <span>{label}</span>
                        <b>{val}</b>
                      </div>

                      <div
                        style={{
                          height: 7,
                          borderRadius: 999,
                          overflow: 'hidden',
                          background: '#23263a'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(val * 5, 100)}%`,
                            height: '100%',
                            background:
                              'linear-gradient(90deg,#6366f1,#8b5cf6)'
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