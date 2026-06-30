import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PageBuilder from './pages/PageBuilder';
import ComponentBuilder from './pages/ComponentBuilder';
import ProjectsManagement from './pages/ProjectsManagement';
import SkillsManagement from './pages/SkillsManagement';
import ExperienceManagement from './pages/ExperienceManagement';
import EducationManagement from './pages/EducationManagement';
import CertificatesManagement from './pages/CertificatesManagement';
import BlogManagement from './pages/BlogManagement';
import ServicesManagement from './pages/ServicesManagement';
import TestimonialsManagement from './pages/TestimonialsManagement';
import MessagesManagement from './pages/MessagesManagement';
import MediaLibrary from './pages/MediaLibrary';
import AnalyticsPage from './pages/AnalyticsPage';
import SEOManagement from './pages/SEOManagement';
import ThemeBuilder from './pages/ThemeBuilder';
import ResumeManagement from './pages/ResumeManagement';
import SettingsPage from './pages/SettingsPage';
import ActivityLogs from './pages/ActivityLogs';
import BackupRestore from './pages/BackupRestore';
import ChangePassword from './pages/ChangePassword';
import HeroManagement from './pages/HeroManagement';
import AboutManagement from './pages/AboutManagement';
import ProfileManagement from './pages/ProfileManagement';
import NotificationsPage from './pages/NotificationsPage';
import UsersPage from './pages/UsersPage';
import NavigationBuilder from './pages/NavigationBuilder';
import TimelineManager from './pages/TimelineManager';
import SecurityCenter from './pages/SecurityCenter';
import SystemMonitoring from './pages/SystemMonitoring';
import IntegrationsPage from './pages/IntegrationsPage';
import HealthDashboard from './pages/HealthDashboard';
import AIAssistant from './pages/AIAssistant';
import LayoutManager from './pages/LayoutManager';
import WebsiteBuilder from './pages/WebsiteBuilder';
import { AutoSaveProvider } from './components/AutoSaveProvider';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ThemeLivePreview from './components/ThemeLivePreview';
import './styles/properties-panel.css';
import './styles/enhanced-table.css';
import './styles/analytics.css';
import './styles/component-builder.css';
import VisitorDetail from './pages/VisitorDetail';
import PageStub from './pages/PageStub';

const navSections = [
  {
    section: 'Dashboard',
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    children: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
      { id: 'health-dashboard', label: 'Health Dashboard', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
    ]
  },
  {
    section: 'Analytics',
    icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4',
    children: [
      { id: 'analytics', label: 'Overview', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4' },
      { id: 'analytics-live', label: 'Live Visitors', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.4 6.4a9 9 0 000 11.2M21.6 6.4a9 9 0 010 11.2' },
      { id: 'analytics-map', label: 'Visitor Map', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z' },
      { id: 'analytics-traffic', label: 'Traffic Sources', icon: 'M12 20V10M18 20V4M6 20v-4' },
      { id: 'analytics-devices', label: 'Device Analytics', icon: 'M4 4h16v12H4z M8 20h8M12 16v4' },
      { id: 'analytics-browsers', label: 'Browser Analytics', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v3' },
      { id: 'analytics-pages', label: 'Page Analytics', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6M16 13H8M16 17H8M10 9H8' },
      { id: 'analytics-resume', label: 'Resume Downloads', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M8 7h8M8 11h6M8 15h4' },
      { id: 'analytics-contact', label: 'Contact Analytics', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
      { id: 'analytics-reports', label: 'Reports', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4' },
      { id: 'analytics-visitors', label: 'Visitor Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ]
  },
  {
    section: 'Website Builder',
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 18v-6 M9 15h6',
    children: [
      { id: 'page-builder', label: 'Pages', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 18v-6 M9 15h6' },
      { id: 'website-builder', label: 'Visual Builder', icon: 'M14 2l4 4-4 4M10 18l-4-4 4-4' },
      { id: 'website-sections', label: 'Sections', icon: 'M4 6h16M4 12h16M4 18h16' },
      { id: 'component-builder', label: 'Components', icon: 'M4 7h3V4a2 2 0 012-2h2a2 2 0 012 2v3h3a2 2 0 012 2v2a2 2 0 01-2 2h-3v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3H4a2 2 0 01-2-2V9a2 2 0 012-2z' },
      { id: 'website-templates', label: 'Templates', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
      { id: 'navigation-builder', label: 'Navigation Builder', icon: 'M12 4v16M4 12h16' },
      { id: 'footer-builder', label: 'Footer Builder', icon: 'M4 16h16M4 20h16' },
      { id: 'layout-builder', label: 'Layout Builder', icon: 'M4 4h16v16H4z M4 12h16' },
      { id: 'global-components', label: 'Global Components', icon: 'M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z' },
    ]
  },
  {
    section: 'Portfolio',
    icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z M6 9h12 M6 13h8 M6 17h4',
    children: [
      { id: 'projects', label: 'Projects', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z M6 9h12 M6 13h8 M6 17h4' },
      { id: 'portfolio-categories', label: 'Categories', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      { id: 'technologies', label: 'Technologies', icon: 'M18 8h-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2z M6 12h12 M6 16h12' },
      { id: 'skills', label: 'Skills', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6' },
      { id: 'experience', label: 'Experience', icon: 'M12 4v16M4 12h16' },
      { id: 'education', label: 'Education', icon: 'M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5' },
      { id: 'certificates', label: 'Certificates', icon: 'M8 21l4-2 4 2-1-4.36L19 12h-5l-2-5-2 5H5l4 4.64L8 21z' },
      { id: 'services', label: 'Services', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' },
      { id: 'hero', label: 'Hero Section', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v3 M3 16l5-5 4 4 3-3 6 6' },
      { id: 'about', label: 'About Section', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
      { id: 'awards', label: 'Awards', icon: 'M12 15a4 4 0 100-8 4 4 0 000 8z M12 15v6 M8 21h8' },
      { id: 'testimonials', label: 'Testimonials', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      { id: 'timeline-manager', label: 'Timeline', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
    ]
  },
  {
    section: 'Blog',
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    children: [
      { id: 'blog', label: 'Posts', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
      { id: 'blog-categories', label: 'Categories', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      { id: 'blog-tags', label: 'Tags', icon: 'M4 5h6l10 10-6 6L4 11V5z' },
      { id: 'blog-comments', label: 'Comments', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
    ]
  },
  {
    section: 'Media',
    icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6',
    children: [
      { id: 'media-images', label: 'Images', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6' },
      { id: 'media-videos', label: 'Videos', icon: 'M22 6v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2z M10 9l5 3-5 3V9z' },
      { id: 'media-documents', label: 'Documents', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
      { id: 'media-icons', label: 'Icons', icon: 'M4 7h3V4a2 2 0 012-2h2a2 2 0 012 2v3h3a2 2 0 012 2v2a2 2 0 01-2 2h-3v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3H4a2 2 0 01-2-2V9a2 2 0 012-2z' },
      { id: 'media', label: 'Media Library', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6' },
      { id: 'resume', label: 'Resume / CV', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 12a3 3 0 100-6 3 3 0 000 6z M8 20v-1a3 3 0 013-3h2a3 3 0 013 3v1' },
    ]
  },
  {
    section: 'Forms',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    children: [
      { id: 'messages', label: 'Contact Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
      { id: 'forms-custom', label: 'Custom Forms', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { id: 'forms-responses', label: 'Form Responses', icon: 'M9 12l2 2 4-4' },
      { id: 'forms-email-templates', label: 'Email Templates', icon: 'M4 4h16v16H4z M4 10h16' },
    ]
  },
  {
    section: 'SEO',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 3v4 M3 10h4',
    children: [
      { id: 'seo', label: 'Meta Tags', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 3v4 M3 10h4' },
      { id: 'seo-opengraph', label: 'Open Graph', icon: 'M4 6h16M4 12h16M4 18h16' },
      { id: 'seo-sitemap', label: 'Sitemap', icon: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z M7 10v4 M17 10v4' },
      { id: 'seo-robots', label: 'Robots', icon: 'M12 2a10 10 0 1010 10M2 12h20' },
      { id: 'seo-structured-data', label: 'Structured Data', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
      { id: 'seo-redirects', label: 'Redirects', icon: 'M5 12h14M12 5l7 7-7 7' },
    ]
  },
  {
    section: 'Appearance',
    icon: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 8a4 4 0 100 8 4 4 0 000-8z M12 8V4 M12 20v-4',
    children: [
      { id: 'theme', label: 'Theme', icon: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 8a4 4 0 100 8 4 4 0 000-8z M12 8V4 M12 20v-4' },
      { id: 'appearance-colors', label: 'Colors', icon: 'M14 9l3-3m-3 3a3 3 0 11-6 0 3 3 0 016 0z M9 15l-3 3' },
      { id: 'appearance-typography', label: 'Typography', icon: 'M4 7V4h16v3M9 20h6M12 4v16' },
      { id: 'appearance-buttons', label: 'Buttons', icon: 'M12 4v16m4-16h-2M10 4H8' },
      { id: 'appearance-cards', label: 'Cards', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
      { id: 'appearance-animations', label: 'Animations', icon: 'M14 2l4 4-4 4M10 18l-4-4 4-4' },
      { id: 'appearance-spacing', label: 'Spacing', icon: 'M20 12H4M12 4v16' },
      { id: 'appearance-responsive', label: 'Responsive Settings', icon: 'M4 4h16v16H4z M8 2v2 M16 2v2 M6 22h12' },
    ]
  },
  {
    section: 'Languages',
    icon: 'M12 2a10 10 0 1010 10M2 12h20M12 2c2.76 0 5 4.48 5 10s-2.24 10-5 10c-2.76 0-5-4.48-5-10S9.24 2 12 2z',
    children: [
      { id: 'lang-en', label: 'English', icon: 'M12 2a10 10 0 1010 10M2 12h20M12 2c2.76 0 5 4.48 5 10s-2.24 10-5 10c-2.76 0-5-4.48-5-10S9.24 2 12 2z' },
      { id: 'lang-am', label: 'Amharic', icon: 'M12 2a10 10 0 1010 10M2 12h20M12 2c2.76 0 5 4.48 5 10s-2.24 10-5 10c-2.76 0-5-4.48-5-10S9.24 2 12 2z' },
      { id: 'lang-translations', label: 'Translation Manager', icon: 'M4 5h16M4 12h16M4 19h8' },
      { id: 'lang-settings', label: 'Language Settings', icon: 'M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z' },
    ]
  },
  {
    section: 'Settings',
    icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
    children: [
      { id: 'settings', label: 'General', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' },
      { id: 'backup', label: 'Backup & Restore', icon: 'M4 6c0 1.66 4 3 8 3s8-1.34 8-3 M4 12c0 1.66 4 3 8 3s8-1.34 8-3 M4 18c0 1.66 4 3 8 3s8-1.34 8-3 M4 6v12 M20 6v12' },
      { id: 'password', label: 'Change Password', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { id: 'settings-contact', label: 'Contact Information', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'settings-social', label: 'Social Media', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
      { id: 'settings-email', label: 'Email', icon: 'M4 6h16M12 12h0M4 10h16M4 14h16M4 18h16' },
      { id: 'settings-integrations', label: 'Integrations', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      { id: 'security-center', label: 'Security Center', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4' },
      { id: 'settings-api-keys', label: 'API Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.74 5.74L10 20H8v-2l3.74-3.74A6 6 0 0121 9z' },
      { id: 'settings-security', label: 'Security', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { id: 'settings-performance', label: 'Performance', icon: 'M14 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z' },
    ]
  },
  {
    section: 'Users',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    children: [
      { id: 'users-administrators', label: 'Administrators', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { id: 'users-roles', label: 'Roles', icon: 'M4 7h16M4 12h16M4 17h12' },
      { id: 'users-permissions', label: 'Permissions', icon: 'M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'users-login-history', label: 'Login History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ]
  },
  {
    section: 'System',
    icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
    children: [
      { id: 'activity', label: 'Activity Logs', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
      { id: 'system-notifications', label: 'Notifications', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
      { id: 'system-monitoring', label: 'System Monitoring', icon: 'M12 2a10 10 0 1010 10M2 12h20M12 2v20' },
      { id: 'health-dashboard', label: 'Health Dashboard', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'ai-assistant', label: 'AI Assistant', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z M9 7v4 M15 7v4 M12 11v2' },
      { id: 'system-help', label: 'Help & Documentation', icon: 'M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3 M12 17h.01' },
    ]
  },
];

const allNavItems = navSections.flatMap(s => s.children);

const pageLabels = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  'page-builder': 'Pages',
    'website-sections': 'Sections',
    'website-builder': 'Visual Builder',
  'component-builder': 'Components',
  'website-templates': 'Templates',
  'navigation-builder': 'Navigation Builder',
  'footer-builder': 'Footer Builder',
  'layout-builder': 'Layout Builder',
  'global-components': 'Global Components',
  projects: 'Projects',
  'portfolio-categories': 'Categories',
  technologies: 'Technologies',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  certificates: 'Certificates',
  services: 'Services',
  hero: 'Hero Section',
  about: 'About Section',
  awards: 'Awards',
  testimonials: 'Testimonials',
  blog: 'Blog',
  'blog-categories': 'Blog Categories',
  'blog-tags': 'Tags',
  'blog-comments': 'Comments',
  'media-images': 'Images',
  'media-videos': 'Videos',
  'media-documents': 'Documents',
  'media-icons': 'Icons',
  media: 'Media Library',
  resume: 'Resume / CV',
  messages: 'Contact Messages',
  'forms-custom': 'Custom Forms',
  'forms-responses': 'Form Responses',
  'forms-email-templates': 'Email Templates',
  analytics: 'Analytics Overview',
  'analytics-live': 'Live Visitors',
  'analytics-map': 'Visitor Map',
  'analytics-traffic': 'Traffic Sources',
  'analytics-devices': 'Device Analytics',
  'analytics-browsers': 'Browser Analytics',
  'analytics-pages': 'Page Analytics',
  'analytics-resume': 'Resume Downloads',
    'analytics-contact': 'Contact Analytics',
    'analytics-reports': 'Reports',
    'analytics-visitors': 'Visitor Details',
  seo: 'SEO - Meta Tags',
  'seo-opengraph': 'Open Graph',
  'seo-sitemap': 'Sitemap',
  'seo-robots': 'Robots',
  'seo-structured-data': 'Structured Data',
  'seo-redirects': 'Redirects',
  theme: 'Theme',
  'appearance-colors': 'Colors',
  'appearance-typography': 'Typography',
  'appearance-buttons': 'Buttons',
  'appearance-cards': 'Cards',
  'appearance-animations': 'Animations',
  'appearance-spacing': 'Spacing',
  'appearance-responsive': 'Responsive Settings',
  'lang-en': 'English',
  'lang-am': 'Amharic',
  'lang-translations': 'Translation Manager',
  'lang-settings': 'Language Settings',
  settings: 'General Settings',
  backup: 'Backup & Restore',
  password: 'Change Password',
  'settings-contact': 'Contact Information',
  'settings-social': 'Social Media',
  'settings-email': 'Email',
  'settings-integrations': 'Integrations',
  'settings-api-keys': 'API Keys',
  'settings-security': 'Security',
  'settings-performance': 'Performance',
  'users-administrators': 'Administrators',
  'users-roles': 'Roles',
  'users-permissions': 'Permissions',
  'users-login-history': 'Login History',
  activity: 'Activity Logs',
  'system-notifications': 'Notifications',
  'system-monitoring': 'System Monitoring',
  'health-dashboard': 'Health Dashboard',
  'ai-assistant': 'AI Assistant',
  'timeline-manager': 'Timeline',
  'security-center': 'Security Center',
  'system-help': 'Help & Documentation',
};

function Icon({ path, size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function Sidebar({ activePage, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar_expanded') || '{}');
    } catch {
      return {};
    }
  });

  const toggleSection = useCallback((section) => {
    setExpanded(prev => {
      const next = { ...prev, [section]: !prev[section] };
      localStorage.setItem('sidebar_expanded', JSON.stringify(next));
      return next;
    });
  }, []);

  const isExpanded = (section) => {
    if (expanded[section] === undefined) return true;
    return expanded[section];
  };

  return (
    <>
      {mobileOpen && <div className="right-panel-overlay open" onClick={onMobileClose} />}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">P</div>
          <div className="sidebar-brand-text">
            <h3>Portfolio CMS</h3>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <div className="sidebar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search..." readOnly />
        </div>

        <nav className="sidebar-nav">
          {navSections.map(({ section, icon, children }) => {
            const open = isExpanded(section);
            const hasActive = children.some(c => c.id === activePage);
            return (
              <div key={section} className="sidebar-section">
                <div
                  className={`sidebar-nav-item${hasActive ? ' active' : ''}`}
                  onClick={() => { if (!collapsed) toggleSection(section); }}
                  data-tooltip={collapsed ? section : undefined}
                >
                  <Icon path={icon} />
                  {!collapsed && (
                    <>
                      <span>{section}</span>
                      <svg
                        className={`sidebar-chevron${open ? ' open' : ''}`}
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </>
                  )}
                </div>
                {!collapsed && open && children.map(child => (
                  <div
                    key={child.id}
                    className={`sidebar-nav-item sidebar-nav-child${activePage === child.id ? ' active' : ''}`}
                    onClick={() => { onNavigate(child.id); onMobileClose(); }}
                    data-tooltip={child.label}
                  >
                    <Icon path={child.icon} size={14} />
                    <span>{child.label}</span>
                  </div>
                ))}
              </div>
            );
          })}
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
          <button className="sidebar-toggle" onClick={onToggle} data-tooltip={collapsed ? 'Expand' : 'Collapse'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, activePage, onToggleMobile, onOpenCmd, onTogglePanel }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost btn-icon" onClick={onToggleMobile} style={{ display: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div className="topbar-breadcrumb">
          <a onClick={() => {}}>Dashboard</a>
          {activePage !== 'dashboard' && <><span>/</span><span>{title}</span></>}
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-global-search" onClick={onOpenCmd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search anything..." readOnly />
          <div className="topbar-search-shortcut">
            <kbd>Ctrl</kbd> <kbd>K</kbd>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn" data-tooltip="Notifications" onClick={onTogglePanel}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span className="notif-dot" />
        </button>
        <button className="topbar-btn" data-tooltip="Quick Actions" onClick={onOpenCmd}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20a8 8 0 100-16 8 8 0 000 16z M12 8v4l3 3"/></svg>
        </button>

        <div style={{ position: 'relative' }} ref={profileRef}>
          <div className="topbar-profile" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="topbar-profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div className="topbar-profile-info">
              <div className="topbar-profile-name">{user?.name || 'Admin'}</div>
              <div className="topbar-profile-email">{user?.email || 'admin@portfolio.com'}</div>
            </div>
          </div>
          {profileOpen && (
            <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 220, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 6, boxShadow: 'var(--shadow-lg)' }}>
              <div className="dropdown-item" onClick={() => { setProfileOpen(false); }}>Profile</div>
              <div className="dropdown-item" onClick={() => { setProfileOpen(false); }}>Settings</div>
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <div className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={() => { logout(); setProfileOpen(false); }}>Sign out</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function RightPanel({ open, onClose }) {
  return (
    <>
      <div className={`right-panel-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`right-panel${open ? ' open' : ''}`}>
        <div className="right-panel-header">
          <h3>Activity Panel</h3>
          <button className="right-panel-close" onClick={onClose}>&times;</button>
        </div>
        <div className="right-panel-body">
          <div className="right-panel-section">
            <div className="right-panel-section-title">Live Visitors</div>
            <div className="right-panel-item">
              <div className="right-panel-dot online" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>2 active visitors</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>On your portfolio site</div>
              </div>
            </div>
          </div>

          <div className="right-panel-section">
            <div className="right-panel-section-title">Recent Activity</div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="right-panel-item">
                <div className="right-panel-dot" style={{ background: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>Dashboard updated</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>A few minutes ago</div>
                </div>
              </div>
            ))}
          </div>

          <div className="right-panel-section">
            <div className="right-panel-section-title">System Status</div>
            <div className="right-panel-item">
              <div className="right-panel-dot online" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>All Systems Normal</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>100% uptime</div>
              </div>
            </div>
          </div>

          <div className="right-panel-section">
            <div className="right-panel-section-title">Upcoming Tasks</div>
            {['Review messages', 'Update projects', 'Check analytics'].map((task, i) => (
              <div key={i} className="right-panel-item">
                <div className="right-panel-dot" style={{ background: 'var(--warning)' }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{task}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Today</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setQuery('');
  }, [open]);

  const items = allNavItems.filter(i =>
    !query || i.label.toLowerCase().includes(query.toLowerCase()) || i.id.includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input ref={inputRef} type="text" placeholder="Search pages and actions..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div style={{ display: 'flex', gap: 2 }}>
            <kbd style={{ padding: '2px 6px', background: 'var(--gray-100)', borderRadius: 4, fontSize: 11, color: 'var(--gray-500)', fontFamily: 'var(--font)', fontWeight: 600 }}>ESC</kbd>
          </div>
        </div>
        <div className="cmd-results">
          {items.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No results found</div>
          )}
          {items.length > 0 && (
            <div className="cmd-group-label">Pages</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="cmd-item" onClick={() => { onNavigate(item.id); onClose(); }}>
              <div className="cmd-item-left">
                <Icon path={item.icon} />
                <span>{item.label}</span>
              </div>
              <div className="cmd-item-shortcut">
                <kbd>Enter</kbd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminRouter({ activePage, onNavigate }) {
  const components = {
    dashboard: <Dashboard />,
    profile: <ProfileManagement />,
    'page-builder': <PageBuilder />,
    'website-builder': <WebsiteBuilder />,
    'website-sections': <PageBuilder />,
    'component-builder': <ComponentBuilder />,
    projects: <ProjectsManagement />,
    skills: <SkillsManagement />,
    services: <ServicesManagement />,
    experience: <ExperienceManagement />,
    education: <EducationManagement />,
    testimonials: <TestimonialsManagement />,
    certificates: <CertificatesManagement />,
    hero: <HeroManagement />,
    about: <AboutManagement />,
    blog: <BlogManagement />,
    messages: <MessagesManagement />,
    media: <MediaLibrary />,
    resume: <ResumeManagement />,
    analytics: <AnalyticsPage />,
    seo: <SEOManagement />,
    theme: <ThemeBuilder />,
    settings: <SettingsPage onNavigate={onNavigate} />,
    activity: <ActivityLogs />,
    backup: <BackupRestore />,
    password: <ChangePassword />,
    'system-notifications': <NotificationsPage />,
    'users-administrators': <UsersPage />,
    'navigation-builder': <NavigationBuilder />,
    'layout-builder': <LayoutManager />,
    'timeline-manager': <TimelineManager />,
    'security-center': <SecurityCenter />,
    'system-monitoring': <SystemMonitoring />,
    'settings-integrations': <IntegrationsPage />,
    'health-dashboard': <HealthDashboard />,
    'ai-assistant': <AIAssistant />,
    'analytics-visitors': <VisitorDetail />,
  };
  const page = components[activePage];
  if (page) return page;
  return <PageStub title={pageLabels[activePage] || activePage} />;
}

function AdminLayout() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('admin_page') || 'dashboard');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [themePreviewOpen, setThemePreviewOpen] = useState(false);
  const title = pageLabels[activePage] || 'Dashboard';

  const handleNavigate = useCallback((id) => {
    localStorage.setItem('admin_page', id);
    setActivePage(id);
  }, []);

  const handleToggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.target.closest('input,textarea,select')) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setPanelOpen(false);
        setShortcutsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="admin-main">
        <Topbar
          title={title}
          activePage={activePage}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          onOpenCmd={() => setCmdOpen(true)}
          onTogglePanel={() => setPanelOpen(!panelOpen)}
          onOpenThemePreview={() => setThemePreviewOpen(true)}
        />
        <div className="admin-content">
          <AutoSaveProvider onSave={() => Promise.resolve()}>
            <AdminRouter activePage={activePage} onNavigate={handleNavigate} />
            <div className="auto-save-bar">
              <AutoSaveIndicator status="saved" />
            </div>
          </AutoSaveProvider>
        </div>
      </div>
      <RightPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={handleNavigate} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ThemeLivePreview open={themePreviewOpen} onClose={() => setThemePreviewOpen(false)} onSave={(theme) => {
        console.log('Theme saved:', theme);
        setThemePreviewOpen(false);
      }} />
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
