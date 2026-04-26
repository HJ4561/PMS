import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { LayoutDashboard, FolderKanban, Users, Bell } from 'lucide-react';

const navItems = [
  { path: '/lead', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/lead/projects', label: 'My Projects', icon: FolderKanban },
  { path: '/lead/team-members', label: 'Team Members', icon: Users },
  { path: '/lead/notifications', label: 'Notifications', icon: Bell }
];

export default function LeadLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        items={navItems}
        role="lead"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}