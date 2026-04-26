// components/lead/LeadTeamMembers.jsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

import Topbar from '../shared/Topbar';
import {
  TEAM_MEMBERS,
  PROJECTS,
  P_TEAMS,
  getMemberStats,
  getUserById
} from '../../data/mockData';

import { ProgressRing } from '../shared/UIComponents';

export default function LeadTeamMembers() {
  const [search, setSearch] = useState('');

  // ✅ FIX: hook must be inside component
  const { onMenuClick } = useOutletContext();

  const filtered = TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.toLowerCase().includes(search.toLowerCase())
  );

  const colors = ['#6366f1', '#2dd4bf', '#f43f5e', '#f59e0b', '#10b981', '#f97316', '#ec4899', '#a78bfa'];

  return (
    <div>
      <Topbar
        title="Team Members"
        onMenuClick={onMenuClick}
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

        {/* CARDS */}
        <div className="grid-auto stagger-children">
          {filtered.map((member, i) => {
            const stats = getMemberStats(member.tm_id);
            const color = member.avatar_color || colors[i % colors.length];
            const addedBy = getUserById(member.added_by);

            const memberProjects = P_TEAMS
              .filter(pt => pt.tm_id === member.tm_id)
              .map(pt => PROJECTS.find(p => p.p_id === pt.p_id))
              .filter(Boolean);

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
              <div key={member.tm_id} className="member-card animate-fade-in">

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

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 14.5,
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
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
                  {member.skills.split(', ').slice(0, 4).map(s => (
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
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {[
                    { label: 'Tasks', value: stats.totalTasks, color: 'var(--text-primary)' },
                    { label: 'Done', value: stats.completedTasks, color: '#10b981' },
                    { label: 'Active', value: stats.inProgressTasks, color: '#6366f1' },
                  ].map((s, idx, arr) => (
                    <div
                      key={s.label}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '10px 4px',
                        borderRight: idx < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                      }}
                    >
                      <p style={{
                        fontSize: 18,
                        fontWeight: 900,
                        fontFamily: 'var(--font-display)',
                        color: s.color,
                        lineHeight: 1
                      }}>
                        {s.value}
                      </p>
                      <p style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* PERFORMANCE */}
                <div style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <ProgressRing
                    progress={onTimeRate}
                    size={44}
                    strokeWidth={4}
                    color={
                      onTimeRate >= 70
                        ? '#10b981'
                        : onTimeRate >= 40
                        ? '#f59e0b'
                        : '#f43f5e'
                    }
                  />

                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {onTimeRate}% On-time
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {stats.completedOnTime}/{stats.completedTasks} tasks on schedule
                    </p>

                    {addedBy && (
                      <p style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        Added by {addedBy.u_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* PROJECTS */}
                {memberProjects.length > 0 && (
                  <div>
                    <p style={{
                      fontSize: 10.5,
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 6
                    }}>
                      Projects
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {memberProjects.slice(0, 3).map(p => (
                        <span
                          key={p.p_id}
                          style={{
                            padding: '4px 9px',
                            borderRadius: 6,
                            background: 'var(--bg-hover)',
                            fontSize: 11,
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background:
                                p.status === 'completed'
                                  ? '#10b981'
                                  : '#6366f1'
                            }}
                          />
                          {p.p_name}
                        </span>
                      ))}

                      {memberProjects.length > 3 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          +{memberProjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}