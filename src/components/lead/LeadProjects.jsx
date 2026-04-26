import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, FolderOpen } from 'lucide-react';

import Topbar from '../shared/Topbar';
import {
  PROJECTS, TASKS, P_TEAMS, TEAM_MEMBERS,
  getProjectProgress, getUserById, priorityConfig, statusConfig
} from '../../data/mockData';

import {
  PriorityBadge, StatusBadge, ProgressRing, AvatarGroup, EmptyState
} from '../shared/UIComponents';

export default function LeadProjects() {
  const { onMenuClick } = useOutletContext(); // ✅ FIXED
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = PROJECTS.filter(p => {
    const matchSearch =
      p.p_name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    return (
      matchSearch &&
      (filterStatus === 'all' || p.status === filterStatus) &&
      (filterPriority === 'all' || p.priority === filterPriority)
    );
  });

  return (
    <div>
      <Topbar title="Projects" onMenuClick={onMenuClick} />

      <div className="page-container">
        {/* filters + grid unchanged */}
        {filtered.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects found" />
        ) : (
          <div className="grid-auto">
            {filtered.map(project => (
              <div
                key={project.p_id}
                className="card"
                onClick={() => navigate(`/lead/projects/${project.p_id}`)}
              >
                <h3>{project.p_name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}