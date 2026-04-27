// components/lead/LeadTeamMembers.jsx

import { useState } from 'react';
import { Search, UserPlus, Trash2, Pencil } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

import Topbar from '../shared/Topbar';
import {
  TEAM_MEMBERS,
  PROJECTS,
  P_TEAMS,
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

  //ADD MEMBER
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

  return (
    <div>

      {/* TOPBAR */}
      <Topbar
        title="Team Members"
        onMenuClick={onMenuClick}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <UserPlus size={14} /> Add Member
          </button>
        }
      />

      <div className="page-container">

        {/* SEARCH */}
        <div style={{ position: 'relative', marginBottom: 22, maxWidth: 380 }}>
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
            style={{ paddingLeft: 34 }}
          />
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

      {/* ADD MODAL */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Team Member">

  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

    {/* SECTION: BASIC INFO */}
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>
        BASIC INFORMATION
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }}>

        <input className="input" placeholder="Full Name *"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />

        <input className="input" placeholder="Role *"
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
        />

      </div>
    </div>

    {/* SECTION: CONTACT */}
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>
        CONTACT DETAILS
      </p>

      <input className="input" placeholder="Email *"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
      />
    </div>

    {/* SECTION: PROFESSIONAL */}
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>
        PROFESSIONAL DETAILS
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }}>

        <input className="input" placeholder="Qualification *"
          value={form.qualification}
          onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
        />

        <input className="input" type="number" placeholder="Experience (years) *"
          value={form.experience}
          onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
        />

      </div>
    </div>

    {/* SECTION: SKILLS */}
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>
        SKILLS
      </p>

      <input className="input" placeholder="e.g. React, Node.js, UI Design *"
        value={form.skills}
        onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
      />

      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
        Separate skills with commas
      </p>
    </div>

    {/* SUBMIT BUTTON */}
    <button
      className="btn btn-primary"
      onClick={handleAdd}
      style={{
        padding: '10px 14px',
        fontWeight: 600,
        borderRadius: 10,
        marginTop: 4
      }}
    >
      + Add Member
    </button>

  </div>

</Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Member">
        <input className="input"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input className="input"
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
        />
        <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
      </Modal>

      {/* DRAWER */}
      {drawer && (
        <div
          className="drawer"
          onClick={() => setDrawer(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 9999
          }}
        >
          <div className="drawer-content">
            <h2>{drawer.name}</h2>
            <p>{drawer.role}</p>
          </div>
        </div>
      )}

    </div>
  );
}