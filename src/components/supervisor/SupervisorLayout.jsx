import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { LayoutDashboard, FolderKanban, Users, Bell } from 'lucide-react';

const navItems = [
  { path: '/supervisor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/supervisor/notifications', label: 'Notifications', icon: Bell },
  { path: '/supervisor/projects', label: 'All Projects', icon: FolderKanban },
  { path: '/supervisor/teams', label: 'Teams & Members', icon: Users },
  {
  label: "Leads",
  path: "/supervisor/leads",
  icon: Users
}
];

export default function SupervisorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        items={navItems}
        role="supervisor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}