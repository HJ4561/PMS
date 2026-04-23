import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { LayoutDashboard, FolderKanban, Users, Bell } from 'lucide-react';

const navItems = [
  { path: '/supervisor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/supervisor/projects', label: 'All Projects', icon: FolderKanban },
  { path: '/supervisor/teams', label: 'Teams & Members', icon: Users },
  { path: '/supervisor/notifications', label: 'Notifications', icon: Bell }
];

export default function SupervisorLayout() {
  return (
    <div className="app-layout">
      <Sidebar items={navItems} role="supervisor" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}