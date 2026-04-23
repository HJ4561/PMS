import { useState } from 'react';
import { Search, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { TEAM_MEMBERS, PROJECTS, P_TEAMS, getMemberStats, getUserById } from '../../data/mockData';
import { Avatar, ProgressRing } from '../shared/UIComponents';

export default function LeadTeamMembers() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.toLowerCase().includes(search.toLowerCase())
  );

  const colors = ['#6c63ff', '#2dd4bf', '#f43f5e', '#fbbf24', '#10b981', '#f97316', '#ec4899', '#a78bfa'];

  return (
    <div className="page-container">

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>
          Team Members
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          View your assigned team members and their performance
        </p>
      </div>

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36, maxWidth: 400 }}
        />
      </div>

      {/* CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {filtered.map((member, i) => {
          const stats = getMemberStats(member.tm_id);
          const color = member.avatar_color || colors[i % colors.length];
          const addedBy = getUserById(member.added_by);
          const memberProjects = P_TEAMS
            .filter(pt => pt.tm_id === member.tm_id)
            .map(pt => PROJECTS.find(p => p.p_id === pt.p_id))
            .filter(Boolean);

          const isExpanded = expanded === member.tm_id;

          const onTimeRate =
            stats.completedTasks > 0
              ? Math.round((stats.completedOnTime / stats.completedTasks) * 100)
              : 0;

          return (
            <div key={member.tm_id} className="card">

              {/* TOP ROW */}
              <div
                onClick={() => setExpanded(isExpanded ? null : member.tm_id)}
                style={{
                  padding: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer'
                }}
              >

                <Avatar name={member.name} color={color} size="md" />

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700 }}>{member.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {member.role} • {member.experience} yrs
                  </p>
                </div>

                {/* QUICK STATS */}
                <div style={{ display: 'flex', gap: 18 }}>
                  <div>
                    <p style={{ fontWeight: 700 }}>{stats.totalTasks}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tasks</p>
                  </div>

                  <div>
                    <p style={{ fontWeight: 700, color: '#10b981' }}>
                      {stats.completedTasks}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Done</p>
                  </div>

                  <div>
                    <p style={{ fontWeight: 700, color: '#6c63ff' }}>
                      {stats.inProgressTasks}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active</p>
                  </div>
                </div>

                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* EXPANDED SECTION */}
              {isExpanded && (
                <div style={{ padding: 18, borderTop: '1px solid var(--border-subtle)' }}>

                  {/* SKILLS */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {member.skills.split(', ').map(skill => (
                        <span key={skill} className="badge badge-purple">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* PERFORMANCE */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                    <ProgressRing
                      progress={onTimeRate}
                      size={55}
                      strokeWidth={4}
                      color={onTimeRate > 70 ? '#10b981' : '#fbbf24'}
                    />

                    <div>
                      <p style={{ fontWeight: 600 }}>{onTimeRate}% On-time Delivery</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {stats.completedOnTime}/{stats.completedTasks} tasks
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Added by: {addedBy?.u_name}
                      </p>
                    </div>
                  </div>

                  {/* PROJECTS */}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                      Projects
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {memberProjects.map(p => (
                        <span
                          key={p.p_id}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: 'var(--bg-hover)',
                            fontSize: 12
                          }}
                        >
                          {p.p_name}
                        </span>
                      ))}

                      {memberProjects.length === 0 && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          No projects assigned
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}