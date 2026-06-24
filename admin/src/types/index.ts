export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  avatar: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  category: string;
  order: number;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'Tools' | 'Other';
  icon: string;
  proficiency: number;
  order: number;
  isActive: boolean;
}

export interface Experience {
  _id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  isActive: boolean;
  order: number;
}

export interface Education {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  achievements: string[];
  isActive: boolean;
  order: number;
}

export interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  visible: boolean;
  order: number;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  featured: boolean;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  repliedAt: string;
  replyContent: string;
  createdAt: string;
}

export interface Media {
  _id: string;
  name: string;
  originalName: string;
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
  category: string;
  uploadedBy: { _id: string; name: string };
  createdAt: string;
}

export interface Setting {
  _id: string;
  siteTitle: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  logo: string;
  favicon: string;
  footerText: string;
  copyrightText: string;
  email: string;
  phone: string;
  address: string;
  github: string;
  linkedin: string;
  twitter: string;
  telegram: string;
  maintenanceMode: boolean;
}

export interface Hero {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  avatar: string;
  socialLinks: { platform: string; url: string }[];
  buttons: { label: string; url: string; variant: string }[];
  isActive: boolean;
}

export interface About {
  _id: string;
  content: string;
  summary: string;
  image: string;
  skills: string[];
  isActive: boolean;
}

export interface DashboardStats {
  messages: { total: number; unread: number };
  projects: { total: number; active: number };
  blogs: { total: number; published: number };
  media: { total: number };
  downloads: number;
  skills: number;
  certificates: number;
  experiences: number;
  education: number;
}

export interface VisitorData {
  month: string;
  count: number;
}

export interface ActivityLog {
  _id: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  user: { _id: string; name: string };
  createdAt: string;
}
