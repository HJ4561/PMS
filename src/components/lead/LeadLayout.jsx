import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { LayoutDashboard, FolderKanban, Users, Bell } from 'lucide-react';

const navItems = [
  { path: '/lead', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/lead/projects', label: 'My Projects', icon: FolderKanban },
  { path: '/lead/team-members', label: 'Team Members', icon: Users },
  { path: '/lead/notifications', label: 'Notifications', icon: Bell }
];

export default function LeadLayout() {
  return (
    <div className="app-layout">
      <Sidebar items={navItems} role="lead" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}