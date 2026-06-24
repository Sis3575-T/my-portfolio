import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ProjectsManagement from './pages/ProjectsManagement.tsx';
import SkillsManagement from './pages/SkillsManagement.tsx';
import ExperienceManagement from './pages/ExperienceManagement.tsx';
import EducationManagement from './pages/EducationManagement.tsx';
import BlogManagement from './pages/BlogManagement.tsx';
import MessagesManagement from './pages/MessagesManagement.tsx';
import MediaLibrary from './pages/MediaLibrary.tsx';
import AnalyticsPage from './pages/AnalyticsPage.tsx';
import CertificatesManagement from './pages/CertificatesManagement.tsx';
import ResumeManagement from './pages/ResumeManagement.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import ActivityLogs from './pages/ActivityLogs.tsx';
import ChangePassword from './pages/ChangePassword.tsx';

// Icons
import {
  FiGrid, FiFolder, FiCode, FiBriefcase, FiBook,
  FiFileText, FiMessageSquare, FiImage, FiBarChart2, FiAward,
  FiSettings, FiActivity, FiShield, FiChevronDown, FiBell, FiSearch, FiLogOut,
  FiMenu, FiX, FiUser,
} from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: React.createElement(FiGrid, { size: 18 }) },
  { id: 'projects', label: 'Projects', icon: React.createElement(FiFolder, { size: 18 }), section: 'Content' },
  { id: 'skills', label: 'Skills', icon: React.createElement(FiCode, { size: 18 }) },
  { id: 'experience', label: 'Experience', icon: React.createElement(FiBriefcase, { size: 18 }) },
  { id: 'education', label: 'Education', icon: React.createElement(FiBook, { size: 18 }) },
  { id: 'certificates', label: 'Certificates', icon: React.createElement(FiAward, { size: 18 }) },
  { id: 'blog', label: 'Blog', icon: React.createElement(FiFileText, { size: 18 }), section: 'Communication' },
  { id: 'messages', label: 'Messages', icon: React.createElement(FiMessageSquare, { size: 18 }) },
  { id: 'analytics', label: 'Analytics', icon: React.createElement(FiBarChart2, { size: 18 }), section: 'Data' },
  { id: 'media', label: 'Media Library', icon: React.createElement(FiImage, { size: 18 }) },
  { id: 'resume', label: 'Resume', icon: React.createElement(FiFileText, { size: 18 }) },
  { id: 'settings', label: 'Settings', icon: React.createElement(FiSettings, { size: 18 }), section: 'System' },
  { id: 'activity', label: 'Activity Logs', icon: React.createElement(FiActivity, { size: 18 }) },
];

const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  certificates: 'Certificates',
  blog: 'Blog Posts',
  messages: 'Messages',
  analytics: 'Analytics',
  media: 'Media Library',
  resume: 'Resume / CV',
  settings: 'Settings',
  activity: 'Activity Logs',
  password: 'Change Password',
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="admin-loading"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function Sidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (id: string) => void }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'Main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">P</div>
        <div className="sidebar-brand-text">
          <h3>Portfolio CMS</h3>
          <p>Admin Dashboard</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="sidebar-section">
              <div className="sidebar-section-label">{section}</div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  data-tooltip={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout} data-tooltip="Logout">
          <FiLogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, onToggleSidebar }: { title: string; onToggleSidebar: () => void }) {
  const [search, setSearch] = useState('');

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar} style={{ display: 'none' }}>
          <FiMenu size={18} />
        </button>
        <h2>{title}</h2>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <FiSearch size={14} style={{ color: 'var(--gray-400)' }} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost btn-icon" data-tooltip="Notifications">
          <FiBell size={18} />
        </button>
        <button className="btn btn-ghost btn-icon" data-tooltip="Account">
          <FiUser size={18} />
        </button>
      </div>
    </header>
  );
}

function AdminRouter({ activePage, onNavigate }: { activePage: string; onNavigate: (id: string) => void }) {
  const components: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    projects: <ProjectsManagement />,
    skills: <SkillsManagement />,
    experience: <ExperienceManagement />,
    education: <EducationManagement />,
    certificates: <CertificatesManagement />,
    blog: <BlogManagement />,
    messages: <MessagesManagement />,
    analytics: <AnalyticsPage />,
    media: <MediaLibrary />,
    resume: <ResumeManagement />,
    settings: <SettingsPage onNavigate={onNavigate} />,
    activity: <ActivityLogs />,
    password: <ChangePassword />,
  };

  return <>{components[activePage] || <Dashboard />}</>;
}

function AdminLayout() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('admin_page') || 'dashboard');
  const title = pageLabels[activePage] || 'Dashboard';

  const handleNavigate = useCallback((id: string) => {
    localStorage.setItem('admin_page', id);
    setActivePage(id);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <div className="admin-main">
        <Topbar title={title} onToggleSidebar={() => {}} />
        <div className="admin-content">
          <AdminRouter activePage={activePage} onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
