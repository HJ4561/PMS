// Mock data store simulating backend
export const USERS = [
  {
    u_id: 1,
    u_name: "Alex Morgan",
    email: "supervisor@pms.com",
    password: "supervisor123",
    role: "supervisor",
    is_active: true,
    is_verified: true,
    created_at: "2024-01-01",
    avatar_color: "#6c63ff"
  },
  {
    u_id: 2,
    u_name: "Jordan Lee",
    email: "lead1@pms.com",
    password: "lead123",
    role: "lead",
    is_active: true,
    is_verified: true,
    created_at: "2024-01-05",
    avatar_color: "#2dd4bf"
  },
  {
    u_id: 3,
    u_name: "Sam Rivera",
    email: "lead2@pms.com",
    password: "lead456",
    role: "lead",
    is_active: true,
    is_verified: true,
    created_at: "2024-01-10",
    avatar_color: "#f43f5e"
  }
];

export const TEAM_MEMBERS = [
  { tm_id: 1, name: "Aria Chen", desc: "Senior Dev", skills: "React, Node.js, TypeScript", role: "Developer", added_by: 2, qualification: "BS Computer Science", experience: 4, updated_at: "2024-03-01", is_deleted: 0, avatar_color: "#fbbf24" },
  { tm_id: 2, name: "Ben Torres", desc: "UI/UX", skills: "Figma, CSS, React", role: "Designer", added_by: 2, qualification: "BA Design", experience: 3, updated_at: "2024-03-02", is_deleted: 0, avatar_color: "#10b981" },
  { tm_id: 3, name: "Clara Moss", desc: "Backend Dev", skills: "Python, Django, PostgreSQL", role: "Developer", added_by: 2, qualification: "MS Software Engineering", experience: 5, updated_at: "2024-03-03", is_deleted: 0, avatar_color: "#a78bfa" },
  { tm_id: 4, name: "Dev Patel", desc: "QA Engineer", skills: "Selenium, Jest, Cypress", role: "QA", added_by: 3, qualification: "BS Computer Science", experience: 2, updated_at: "2024-03-04", is_deleted: 0, avatar_color: "#f97316" },
  { tm_id: 5, name: "Eva Kim", desc: "Full Stack", skills: "Vue, Express, MongoDB", role: "Developer", added_by: 3, qualification: "BS Information Technology", experience: 3, updated_at: "2024-03-05", is_deleted: 0, avatar_color: "#ec4899" },
  { tm_id: 6, name: "Felix Wang", desc: "DevOps", skills: "Docker, K8s, AWS", role: "DevOps", added_by: 2, qualification: "BS Computer Engineering", experience: 6, updated_at: "2024-03-06", is_deleted: 0, avatar_color: "#2dd4bf" },
  { tm_id: 7, name: "Grace Liu", desc: "Product Manager", skills: "Agile, Scrum, Jira", role: "PM", added_by: 3, qualification: "MBA", experience: 5, updated_at: "2024-03-07", is_deleted: 0, avatar_color: "#6c63ff" },
  { tm_id: 8, name: "Henry Brown", desc: "Data Analyst", skills: "Python, SQL, Tableau", role: "Analyst", added_by: 2, qualification: "BS Statistics", experience: 2, updated_at: "2024-03-08", is_deleted: 0, avatar_color: "#fb7185" }
];

export const PROJECTS = [
  { p_id: 1, p_name: "Apollo CRM Platform", desc: "Enterprise CRM system with real-time analytics", priority: "high", created_by: 2, deadline: "2024-06-30", status: "in-progress", created_at: "2024-01-15", start_at: "2024-01-20", updated_at: "2024-03-10", is_deleted: false },
  { p_id: 2, p_name: "Nebula E-Commerce", desc: "Multi-vendor e-commerce marketplace", priority: "critical", created_by: 2, deadline: "2024-05-15", status: "in-progress", created_at: "2024-02-01", start_at: "2024-02-05", updated_at: "2024-03-12", is_deleted: false },
  { p_id: 3, p_name: "Vortex Analytics Dashboard", desc: "Business intelligence and reporting tool", priority: "medium", created_by: 3, deadline: "2024-07-31", status: "planning", created_at: "2024-02-10", start_at: "2024-03-01", updated_at: "2024-03-08", is_deleted: false },
  { p_id: 4, p_name: "Pulse Mobile App", desc: "Cross-platform mobile health tracker", priority: "high", created_by: 3, deadline: "2024-08-31", status: "planning", created_at: "2024-02-20", start_at: "2024-03-15", updated_at: "2024-03-05", is_deleted: false },
  { p_id: 5, p_name: "Horizon Auth Service", desc: "Centralized authentication microservice", priority: "low", created_by: 2, deadline: "2024-04-30", status: "completed", created_at: "2023-12-01", start_at: "2023-12-05", updated_at: "2024-03-01", is_deleted: false }
];

export const P_TEAMS = [
  { pt_id: 1, p_id: 1, t_id: 1, tm_id: 1 },
  { pt_id: 2, p_id: 1, t_id: 1, tm_id: 2 },
  { pt_id: 3, p_id: 1, t_id: 1, tm_id: 6 },
  { pt_id: 4, p_id: 2, t_id: 2, tm_id: 3 },
  { pt_id: 5, p_id: 2, t_id: 2, tm_id: 4 },
  { pt_id: 6, p_id: 2, t_id: 2, tm_id: 5 },
  { pt_id: 7, p_id: 3, t_id: 3, tm_id: 7 },
  { pt_id: 8, p_id: 3, t_id: 3, tm_id: 8 },
  { pt_id: 9, p_id: 4, t_id: 4, tm_id: 4 },
  { pt_id: 10, p_id: 4, t_id: 4, tm_id: 7 },
  { pt_id: 11, p_id: 5, t_id: 5, tm_id: 1 },
  { pt_id: 12, p_id: 5, t_id: 5, tm_id: 3 }
];

export const TASKS = [
  { t_id: 1, title: "Setup project architecture", desc: "Initialize repo, configure CI/CD pipeline, setup environments", status: "done", assign_to: 1, assign_by: 2, created_by: 2, created_at: "2024-01-20", due_date: "2024-02-05", start_date: "2024-01-20", update_last: "2024-02-04", p_id: 1, priority: "high", is_deleted: false },
  { t_id: 2, title: "Design database schema", desc: "ERD design, PostgreSQL setup, migrations", status: "done", assign_to: 3, assign_by: 2, created_by: 2, created_at: "2024-01-22", due_date: "2024-02-10", start_date: "2024-01-22", update_last: "2024-02-09", p_id: 1, priority: "high", is_deleted: false },
  { t_id: 3, title: "Build authentication module", desc: "JWT auth, OAuth2, email verification flow", status: "in-progress", assign_to: 1, assign_by: 2, created_by: 2, created_at: "2024-02-05", due_date: "2024-03-20", start_date: "2024-02-05", update_last: "2024-03-10", p_id: 1, priority: "critical", is_deleted: false },
  { t_id: 4, title: "Dashboard UI components", desc: "Reusable component library, design system", status: "in-progress", assign_to: 2, assign_by: 2, created_by: 2, created_at: "2024-02-10", due_date: "2024-03-25", start_date: "2024-02-10", update_last: "2024-03-11", p_id: 1, priority: "medium", is_deleted: false },
  { t_id: 5, title: "Product catalog backend", desc: "CRUD APIs, search, filtering, pagination", status: "in-progress", assign_to: 3, assign_by: 2, created_by: 2, created_at: "2024-02-05", due_date: "2024-03-15", start_date: "2024-02-05", update_last: "2024-03-09", p_id: 2, priority: "critical", is_deleted: false },
  { t_id: 6, title: "Shopping cart & checkout", desc: "Cart logic, payment integration, order management", status: "todo", assign_to: 5, assign_by: 2, created_by: 2, created_at: "2024-02-15", due_date: "2024-04-10", start_date: "2024-03-15", update_last: "2024-02-15", p_id: 2, priority: "high", is_deleted: false },
  { t_id: 7, title: "Vendor onboarding flow", desc: "Registration, verification, dashboard for vendors", status: "todo", assign_to: 4, assign_by: 2, created_by: 2, created_at: "2024-02-20", due_date: "2024-04-20", start_date: "2024-03-20", update_last: "2024-02-20", p_id: 2, priority: "medium", is_deleted: false },
  { t_id: 8, title: "Data visualization components", desc: "Charts, graphs, KPI widgets using D3.js", status: "todo", assign_to: 7, assign_by: 3, created_by: 3, created_at: "2024-03-01", due_date: "2024-05-01", start_date: "2024-04-01", update_last: "2024-03-01", p_id: 3, priority: "high", is_deleted: false },
  { t_id: 9, title: "Report generation engine", desc: "PDF/Excel export, scheduled reports", status: "todo", assign_to: 8, assign_by: 3, created_by: 3, created_at: "2024-03-01", due_date: "2024-05-15", start_date: "2024-04-15", update_last: "2024-03-01", p_id: 3, priority: "medium", is_deleted: false },
  { t_id: 10, title: "Mobile UI design mockups", desc: "Figma designs for all screens, prototyping", status: "todo", assign_to: 7, assign_by: 3, created_by: 3, created_at: "2024-02-20", due_date: "2024-04-15", start_date: "2024-03-15", update_last: "2024-02-20", p_id: 4, priority: "high", is_deleted: false },
  { t_id: 11, title: "OAuth implementation", desc: "Google, Apple sign-in integration", status: "done", assign_to: 1, assign_by: 2, created_by: 2, created_at: "2023-12-05", due_date: "2024-01-15", start_date: "2023-12-05", update_last: "2024-01-14", p_id: 5, priority: "critical", is_deleted: false },
  { t_id: 12, title: "Security audit & testing", desc: "Penetration testing, vulnerability assessment", status: "done", assign_to: 3, assign_by: 2, created_by: 2, created_at: "2024-01-01", due_date: "2024-01-30", start_date: "2024-01-01", update_last: "2024-01-28", p_id: 5, priority: "critical", is_deleted: false }
];

export const COMMENTS = [
  { c_id: 1, t_id: 3, u_id: 2, desc: "Please make sure to implement refresh token rotation for better security.", created_at: "2024-03-10 09:30", updated_at: "2024-03-10 09:30", priority: "high", pin: true },
  { c_id: 2, t_id: 3, u_id: 1, desc: "Good point. Also ensure we comply with OWASP top 10 guidelines throughout the implementation.", created_at: "2024-03-10 10:15", updated_at: "2024-03-10 10:15", priority: "medium", pin: false },
  { c_id: 3, t_id: 3, u_id: 2, desc: "Approved. Let's also add rate limiting on the auth endpoints.", created_at: "2024-03-11 11:00", updated_at: "2024-03-11 11:00", priority: "medium", pin: false },
  { c_id: 4, t_id: 4, u_id: 2, desc: "Focus on accessibility — all components must meet WCAG 2.1 AA standards.", created_at: "2024-03-10 14:00", updated_at: "2024-03-10 14:00", priority: "high", pin: true },
  { c_id: 5, t_id: 5, u_id: 3, desc: "API response time must be under 200ms for all product listing endpoints.", created_at: "2024-03-09 16:00", updated_at: "2024-03-09 16:00", priority: "critical", pin: false },
  { c_id: 6, t_id: 1, u_id: 1, desc: "Great work on the initial setup! The CI/CD pipeline looks solid.", created_at: "2024-02-04 10:00", updated_at: "2024-02-04 10:00", priority: "low", pin: false }
];

export const NOTIFICATIONS = [
  { n_id: 1, u_id: 1, type: "project_update", message: "Project 'Apollo CRM' was updated by Jordan Lee", is_read: false, created_at: "2024-03-12 09:00", read_at: null, is_deleted: null },
  { n_id: 2, u_id: 1, type: "task_complete", message: "Task 'Setup project architecture' marked as completed", is_read: false, created_at: "2024-03-11 15:30", read_at: null, is_deleted: null },
  { n_id: 3, u_id: 1, type: "comment", message: "New comment added on 'Build authentication module' by Jordan Lee", is_read: true, created_at: "2024-03-11 11:00", read_at: "2024-03-11 12:00", is_deleted: null },
  { n_id: 4, u_id: 2, type: "task_assigned", message: "Task 'Dashboard UI components' assigned to Ben Torres", is_read: false, created_at: "2024-03-10 14:00", read_at: null, is_deleted: null },
  { n_id: 5, u_id: 2, type: "comment", message: "Supervisor Alex Morgan commented on 'Build authentication module'", is_read: false, created_at: "2024-03-10 10:15", read_at: null, is_deleted: null },
  { n_id: 6, u_id: 3, type: "project_created", message: "New project 'Pulse Mobile App' created", is_read: true, created_at: "2024-02-20 09:00", read_at: "2024-02-20 10:00", is_deleted: null }
];

// Helper functions
export const getProjectProgress = (p_id) => {
  const tasks = TASKS.filter(t => t.p_id === p_id && !t.is_deleted);
  if (!tasks.length) return 0;
  const done = tasks.filter(t => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
};

export const getProjectTeamMembers = (p_id) => {
  const ptEntries = P_TEAMS.filter(pt => pt.p_id === p_id);
  const tmIds = [...new Set(ptEntries.map(pt => pt.tm_id))];
  return TEAM_MEMBERS.filter(tm => tmIds.includes(tm.tm_id) && !tm.is_deleted);
};

export const getMemberStats = (tm_id) => {
  const assignedTasks = TASKS.filter(t => t.assign_to === tm_id);
  const completedOnTime = assignedTasks.filter(t => {
    if (t.status !== 'done') return false;
    return new Date(t.update_last) <= new Date(t.due_date);
  }).length;
  const projectIds = [...new Set(P_TEAMS.filter(pt => pt.tm_id === tm_id).map(pt => pt.p_id))];
  const activeProjects = PROJECTS.filter(p => projectIds.includes(p.p_id) && p.status !== 'completed');
  const completedProjects = PROJECTS.filter(p => projectIds.includes(p.p_id) && p.status === 'completed');
  return {
    totalTasks: assignedTasks.length,
    completedTasks: assignedTasks.filter(t => t.status === 'done').length,
    completedOnTime,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    inProgressTasks: assignedTasks.filter(t => t.status === 'in-progress').length
  };
};

export const getUserByEmail = (email) => USERS.find(u => u.email === email);
export const getUserById = (id) => USERS.find(u => u.u_id === id);
export const getTeamMemberById = (id) => TEAM_MEMBERS.find(tm => tm.tm_id === id);

export const priorityConfig = {
  critical: { label: 'Critical', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', badge: 'badge-rose' },
  high: { label: 'High', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', badge: 'badge-amber' },
  medium: { label: 'Medium', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)', badge: 'badge-purple' },
  low: { label: 'Low', color: '#10b981', bg: 'rgba(16,185,129,0.12)', badge: 'badge-emerald' }
};

export const statusConfig = {
  'todo': { label: 'To Do', color: '#9ba3c0', badge: 'badge-gray' },
  'in-progress': { label: 'In Progress', color: '#6c63ff', badge: 'badge-purple' },
  'review': { label: 'In Review', color: '#fbbf24', badge: 'badge-amber' },
  'done': { label: 'Done', color: '#10b981', badge: 'badge-emerald' },
  'planning': { label: 'Planning', color: '#2dd4bf', badge: 'badge-teal' },
  'completed': { label: 'Completed', color: '#10b981', badge: 'badge-emerald' }
};