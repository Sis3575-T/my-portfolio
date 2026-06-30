import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: null },
  { key: 'github', label: 'GitHub', icon: null },
  { key: 'twitter', label: 'Twitter', icon: null },
  { key: 'facebook', label: 'Facebook', icon: null },
  { key: 'instagram', label: 'Instagram', icon: null },
  { key: 'youtube', label: 'YouTube', icon: null },
  { key: 'telegram', label: 'Telegram', icon: null },
  { key: 'whatsapp', label: 'WhatsApp', icon: null },
  { key: 'portfolio', label: 'Portfolio', icon: null },
];

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon',
  'Canada','Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador',
  'Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau',
  'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia',
  'Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro',
  'Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','North Macedonia','Norway','Oman','Pakistan','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Samoa','San Marino','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia',
  'Slovenia','Solomon Islands','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Suriname',
  'Sweden','Switzerland','Syria','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Tunisia',
  'Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const TIMEZONES = [
  'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Anchorage',
  'America/Halifax','America/Phoenix','America/Puerto_Rico','America/Sao_Paulo','America/Argentina/Buenos_Aires',
  'Europe/London','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome','Europe/Amsterdam',
  'Europe/Moscow','Europe/Istanbul','Europe/Stockholm','Europe/Zurich','Europe/Vienna','Europe/Warsaw',
  'Asia/Tokyo','Asia/Seoul','Asia/Shanghai','Asia/Hong_Kong','Asia/Singapore','Asia/Kolkata','Asia/Dubai',
  'Asia/Bangkok','Asia/Jakarta','Asia/Taipei','Asia/Karachi','Asia/Dhaka','Asia/Riyadh','Asia/Manila',
  'Africa/Cairo','Africa/Lagos','Africa/Casablanca','Africa/Johannesburg','Africa/Nairobi',
  'Australia/Sydney','Australia/Melbourne','Australia/Perth','Australia/Brisbane','Australia/Adelaide',
  'Pacific/Auckland','Pacific/Fiji','Pacific/Honolulu',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'tr', label: 'Turkish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
];

const ACCENT_COLORS = [
  { value: 'blue', color: '#3b82f6', label: 'Blue' },
  { value: 'indigo', color: '#6366f1', label: 'Indigo' },
  { value: 'purple', color: '#8b5cf6', label: 'Purple' },
  { value: 'green', color: '#22c55e', label: 'Green' },
  { value: 'red', color: '#ef4444', label: 'Red' },
  { value: 'orange', color: '#f97316', label: 'Orange' },
];

const initialProfile = {
  firstName: '', lastName: '', displayName: '', username: '',
  email: '', secondaryEmail: '',
  phone: '', alternativePhone: '',
  bio: '',
  jobTitle: '', company: '', website: '',
  country: '', state: '', city: '', postalCode: '', address: '',
  timezone: 'UTC', language: 'en', dateFormat: 'MM/DD/YYYY', timeFormat: '12h',
  linkedin: '', github: '', twitter: '', facebook: '', instagram: '',
  youtube: '', telegram: '', whatsapp: '', portfolio: '',
  publicProfile: true,
  recoveryEmail: '',
};

const initialPreferences = {
  theme: 'light',
  accentColor: 'indigo',
  sidebarStyle: 'default',
  tableDensity: 'comfortable',
  animations: true,
  defaultDashboard: 'dashboard',
  landingPage: 'hero',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: 'UTC',
  language: 'en',
  itemsPerPage: 25,
};

const initialNotifications = {
  email: {
    securityAlerts: true,
    visitorAlerts: true,
    contactFormAlerts: true,
    backupAlerts: true,
    deploymentAlerts: true,
    systemAlerts: true,
    weeklyReport: false,
    monthlyReport: false,
  },
  browser: {
    securityAlerts: true,
    visitorAlerts: false,
    contactFormAlerts: true,
    backupAlerts: false,
    deploymentAlerts: true,
    systemAlerts: false,
    weeklyReport: false,
    monthlyReport: false,
  },
  sound: true,
  desktop: true,
  marketing: false,
};

function Skeleton({ width, height, style }) {
  return (
    <div
      style={{
        width: width || '100%',
        height: height || 20,
        borderRadius: 8,
        background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

function computePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  const levels = [
    { label: 'Weak', color: '#ef4444', min: 0 },
    { label: 'Fair', color: '#f97316', min: 1 },
    { label: 'Strong', color: '#22c55e', min: 3 },
    { label: 'Very Strong', color: '#16a34a', min: 4 },
  ];
  const level = levels.reduce((a, l) => score >= l.min ? l : a, levels[0]);
  return { score, label: level.label, color: level.color, percent: Math.min(score / 5 * 100, 100) };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return !phone || /^[\d\s+\-()]{7,20}$/.test(phone);
}

function isValidUrl(url) {
  return !url || /^https?:\/\/.+/.test(url);
}

const labelStyles = { fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.4rem', display: 'block' };
const inputStyles = { padding: '0.7rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: 10, fontSize: '0.88rem', fontFamily: 'inherit', color: 'var(--color-text)', background: 'var(--color-bg-subtle)', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none', width: '100%', boxSizing: 'border-box' };
const selectStyles = { ...inputStyles, cursor: 'pointer' };
const textareaStyles = { ...inputStyles, resize: 'vertical', minHeight: 80 };
const cardStyle = { padding: '1.5rem', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const sectionTitleStyle = { fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.25rem' };
const sectionDescStyle = { fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem' };
const fieldRow2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const fieldRow3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' };
const toggleTrack = (on) => ({ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 });
const toggleThumb = { width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 2, transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' };
const dangerBtn = { padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all 0.2s', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
const badgeGreen = { display: 'inline-flex', alignItems: 'center', padding: '0.22rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' };
const badgeRed = { display: 'inline-flex', alignItems: 'center', padding: '0.22rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
const badgeGray = { display: 'inline-flex', alignItems: 'center', padding: '0.22rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };

const STORAGE_KEY = 'profile_draft';

export default function ProfileManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [originalPreferences, setOriginalPreferences] = useState(null);
  const [originalNotifications, setOriginalNotifications] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
  const [showResetPrefsModal, setShowResetPrefsModal] = useState(false);
  const [showClearNotifsModal, setShowClearNotifsModal] = useState(false);
  const [showClearLogsModal, setShowClearLogsModal] = useState(false);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [showTerminateAllModal, setShowTerminateAllModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getMe();
      const u = data.data || data || {};
      setUser(u);
      const p = u.profile || {};
      setProfile({
        firstName: p.firstName || u.firstName || '',
        lastName: p.lastName || u.lastName || '',
        displayName: p.displayName || u.name || '',
        username: p.username || u.username || '',
        email: p.email || u.email || '',
        secondaryEmail: p.secondaryEmail || '',
        phone: p.phone || u.phone || '',
        alternativePhone: p.alternativePhone || '',
        bio: p.bio || '',
        jobTitle: p.jobTitle || '',
        company: p.company || '',
        website: p.website || '',
        country: p.country || '',
        state: p.state || '',
        city: p.city || '',
        postalCode: p.postalCode || '',
        address: p.address || '',
        timezone: p.timezone || u.timezone || 'UTC',
        language: p.language || 'en',
        dateFormat: p.dateFormat || 'MM/DD/YYYY',
        timeFormat: p.timeFormat || '12h',
        linkedin: p.linkedin || '',
        github: p.github || '',
        twitter: p.twitter || '',
        facebook: p.facebook || '',
        instagram: p.instagram || '',
        youtube: p.youtube || '',
        telegram: p.telegram || '',
        whatsapp: p.whatsapp || '',
        portfolio: p.portfolio || '',
        publicProfile: p.publicProfile !== undefined ? p.publicProfile : true,
        recoveryEmail: p.recoveryEmail || '',
      });
      setOriginalProfile({ ...p });
      const prefs = u.preferences || {};
      setPreferences({
        theme: prefs.theme || 'light',
        accentColor: prefs.accentColor || 'indigo',
        sidebarStyle: prefs.sidebarStyle || 'default',
        tableDensity: prefs.tableDensity || 'comfortable',
        animations: prefs.animations !== undefined ? prefs.animations : true,
        defaultDashboard: prefs.defaultDashboard || 'dashboard',
        landingPage: prefs.landingPage || 'hero',
        dateFormat: prefs.dateFormat || 'MM/DD/YYYY',
        timeFormat: prefs.timeFormat || '12h',
        timezone: prefs.timezone || 'UTC',
        language: prefs.language || 'en',
        itemsPerPage: prefs.itemsPerPage || 25,
      });
      setOriginalPreferences({ ...prefs });
      const notifs = u.notifications || {};
      setNotifications({
        email: { ...initialNotifications.email, ...(notifs.email || {}) },
        browser: { ...initialNotifications.browser, ...(notifs.browser || {}) },
        sound: notifs.sound !== undefined ? notifs.sound : true,
        desktop: notifs.desktop !== undefined ? notifs.desktop : true,
        marketing: notifs.marketing !== undefined ? notifs.marketing : false,
      });
      setOriginalNotifications({ ...notifs });
      setLastUpdated(u.updatedAt || u.updated_at || null);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const handleTabChange = (tabId) => {
    if (hasUnsaved && activeTab !== tabId) {
      setPendingTab(tabId);
      setShowUnsavedModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  const confirmTabChange = () => {
    setShowUnsavedModal(false);
    setHasUnsaved(false);
    if (pendingTab) setActiveTab(pendingTab);
    setPendingTab(null);
  };

  const cancelTabChange = () => {
    setShowUnsavedModal(false);
    setPendingTab(null);
  };

  const markDirty = useCallback(() => {
    setHasUnsaved(true);
  }, []);

  const triggerAutoSave = (type, data) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus('unsaved');
    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        if (type === 'preferences') {
          await adminApi.updatePreferences(data);
        } else if (type === 'notifications') {
          await adminApi.updateNotifications(data);
        }
        setAutoSaveStatus('saved');
        setLastUpdated(new Date().toISOString());
      } catch {
        setAutoSaveStatus('error');
        toast.error('Auto-save failed');
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const renderField = (label, key, opts = {}) => {
    const value = profile[key] || '';
    const required = opts.required;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyles}>
          {label}{required ? <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span> : null}
        </label>
        {opts.type === 'textarea' ? (
          <textarea
            style={textareaStyles}
            rows={opts.rows || 3}
            value={value}
            onChange={(e) => { setProfile({ ...profile, [key]: e.target.value }); markDirty(); }}
            placeholder={opts.placeholder}
            maxLength={opts.maxLength}
          />
        ) : opts.type === 'select' ? (
          <select
            style={selectStyles}
            value={value}
            onChange={(e) => { setProfile({ ...profile, [key]: e.target.value }); markDirty(); }}
          >
            {opts.options?.map(o => (
              <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
            ))}
          </select>
        ) : (
          <input
            style={inputStyles}
            type={opts.inputType || 'text'}
            value={value}
            onChange={(e) => { setProfile({ ...profile, [key]: e.target.value }); markDirty(); }}
            placeholder={opts.placeholder}
            maxLength={opts.maxLength}
          />
        )}
        {opts.error && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{opts.error}</span>}
      </div>
    );
  };

  const validateProfile = () => {
    const errors = {};
    if (!profile.firstName.trim()) errors.firstName = 'First name is required';
    if (!profile.lastName.trim()) errors.lastName = 'Last name is required';
    if (!profile.email.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(profile.email)) errors.email = 'Invalid email format';
    if (profile.secondaryEmail && !isValidEmail(profile.secondaryEmail)) errors.secondaryEmail = 'Invalid email format';
    if (profile.phone && !isValidPhone(profile.phone)) errors.phone = 'Invalid phone format';
    if (profile.alternativePhone && !isValidPhone(profile.alternativePhone)) errors.alternativePhone = 'Invalid phone format';
    if (profile.website && !isValidUrl(profile.website)) errors.website = 'Invalid URL format';
    SOCIAL_PLATFORMS.forEach(s => {
      if (profile[s.key] && !isValidUrl(profile[s.key])) errors[s.key] = 'Invalid URL format';
    });
    if (profile.bio && profile.bio.length > 500) errors.bio = 'Bio must be under 500 characters';
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }
    setSaving(s => ({ ...s, profile: true }));
    try {
      await adminApi.updateProfile(profile);
      toast.success('Profile saved successfully');
      setHasUnsaved(false);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(s => ({ ...s, profile: false }));
    }
  };

  const handleChangePassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(s => ({ ...s, password: true }));
    try {
      await adminApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(s => ({ ...s, password: false }));
    }
  };

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const passwordStrength = computePasswordStrength(passwordForm.new);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoSelect = (file) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload PNG, JPG, JPEG, or WEBP files only');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setSaving(s => ({ ...s, photo: true }));
    try {
      const fd = new FormData();
      fd.append('file', photoFile);
      const { data: uploadData } = (await import('../services/api')).default.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = uploadData.data?.url || uploadData.url || '';
      await adminApi.updateProfile({ ...profile, avatar: url });
      setUser(prev => ({ ...prev, avatar: url }));
      setPhotoPreview(null);
      setPhotoFile(null);
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setSaving(s => ({ ...s, photo: false }));
    }
  };

  const handleRemovePhoto = async () => {
    setSaving(s => ({ ...s, photo: true }));
    try {
      await adminApi.updateProfile({ ...profile, avatar: '' });
      setUser(prev => ({ ...prev, avatar: '' }));
      setPhotoPreview(null);
      setPhotoFile(null);
      toast.success('Profile photo removed');
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setSaving(s => ({ ...s, photo: false }));
      setShowRemovePhotoModal(false);
    }
  };

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data } = await adminApi.getSessions();
      const list = data.data || data || [];
      setSessions(list);
      const current = list.find(s => s.isCurrent) || list[0];
      if (current) setCurrentSessionId(current._id || current.id);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') loadSessions();
  }, [activeTab]);

  const handleTerminateSession = async (sessionId) => {
    try {
      await adminApi.terminateSession(sessionId);
      toast.success('Session terminated');
      setSessions(prev => prev.filter(s => (s._id || s.id) !== sessionId));
    } catch {
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      await adminApi.logoutAllSessions();
      toast.success('All other sessions terminated');
      loadSessions();
    } catch {
      toast.error('Failed to terminate sessions');
    }
    setShowTerminateAllModal(false);
  };

  const handleLogoutAllDevices = async () => {
    try {
      await adminApi.logoutAllSessions();
      toast.success('Logged out of all devices');
      loadSessions();
    } catch {
      toast.error('Failed to logout all devices');
    }
    setShowLogoutAllModal(false);
  };

  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPerPage] = useState(15);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsDateFrom, setLogsDateFrom] = useState('');
  const [logsDateTo, setLogsDateTo] = useState('');

  const loadActivityLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const params = { page, limit: logsPerPage };
      if (logsSearch) params.action = logsSearch;
      if (logsDateFrom) params.from = logsDateFrom;
      if (logsDateTo) params.to = logsDateTo;
      const { data } = await adminApi.getActivityLogs(params);
      const d = data.data || data || {};
      setActivityLogs(Array.isArray(d) ? d : d.logs || []);
      setLogsTotal(d.total || d.count || 0);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') loadActivityLogs(logsPage);
  }, [activeTab, logsPage]);

  const handleSearchLogs = () => {
    setLogsPage(1);
    loadActivityLogs(1);
  };

  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const loadConnectedAccounts = async () => {
    setAccountsLoading(true);
    try {
      const { data } = await adminApi.getMe();
      const u = data.data || data || {};
      const accounts = u.connectedAccounts || u.connected_accounts || [];
      setConnectedAccounts(accounts);
    } catch {
      toast.error('Failed to load connected accounts');
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'connected-accounts') loadConnectedAccounts();
  }, [activeTab]);

  const handleConnectAccount = async (provider, providerData = {}) => {
    try {
      await adminApi.connectAccount(provider, providerData);
      toast.success(`${provider} connected successfully`);
      loadConnectedAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to connect ${provider}`);
    }
  };

  const handleDisconnectAccount = async (provider) => {
    try {
      await adminApi.disconnectAccount(provider);
      toast.success(`${provider} disconnected`);
      loadConnectedAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to disconnect ${provider}`);
    }
  };

  const [cloudinaryConfig, setCloudinaryConfig] = useState({ cloudName: '', apiKey: '', apiSecret: '' });
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);

  const [securityQuestions, setSecurityQuestions] = useState([]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Icons.user },
    { id: 'personal-info', label: 'Personal Information', icon: Icons['file-text'] },
    { id: 'photo', label: 'Profile Photo', icon: Icons.image },
    { id: 'security', label: 'Security', icon: Icons.shield },
    { id: 'preferences', label: 'Preferences', icon: Icons.settings },
    { id: 'notifications', label: 'Notifications', icon: Icons.bell },
    { id: 'sessions', label: 'Sessions', icon: Icons.monitor },
    { id: 'activity', label: 'Activity Logs', icon: Icons.activity },
    { id: 'connected-accounts', label: 'Connected Accounts', icon: Icons.globe },
    { id: 'danger-zone', label: 'Danger Zone', icon: Icons['alert-triangle'] },
  ];

  const profileCompletionItems = [
    { key: 'photo', label: 'Photo uploaded', done: !!user?.avatar },
    { key: 'name', label: 'Name completed', done: !!(profile.firstName && profile.lastName) },
    { key: 'email', label: 'Email verified', done: !!user?.emailVerified },
    { key: '2fa', label: '2FA enabled', done: !!user?.twoFactorEnabled },
    { key: 'social', label: 'Social added', done: SOCIAL_PLATFORMS.some(s => !!profile[s.key]) },
    { key: 'bio', label: 'Bio filled', done: !!profile.bio },
  ];
  const completionPercent = Math.round((profileCompletionItems.filter(i => i.done).length / profileCompletionItems.length) * 100);

  const renderSection = (title, desc, children, danger) => (
    <div style={{ ...cardStyle, ...(danger ? { border: '1px solid #fecaca', background: '#fef2f2' } : {}) }}>
      <h3 style={sectionTitleStyle}>{title}</h3>
      {desc && <p style={sectionDescStyle}>{desc}</p>}
      {children}
    </div>
  );

  const renderToggle = (label, desc, checked, onChange) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', gap: '1rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={toggleTrack(checked)} onClick={() => onChange(!checked)}>
        <div style={{ ...toggleThumb, transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </div>
    </div>
  );

  const renderModal = (open, title, children, onClose, wide) => {
    if (!open) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: wide ? 800 : 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{ width: 32, height: 32, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}>&times;</button>
          </div>
          <div style={{ padding: '1.75rem' }}>{children}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '1rem' }}><Skeleton width={200} height={16} /></div>
        <div style={{ marginBottom: '1.5rem' }}>
          <Skeleton width={300} height={28} />
          <div style={{ marginTop: 8 }}><Skeleton width={450} height={14} /></div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(i => <Skeleton key={i} height={36} />)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map(i => <Skeleton key={i} height={120} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>
        <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>Dashboard</span>
        <Icon path={Icons['chevron-right']} size={12} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Profile</span>
      </nav>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>Profile Management</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: '0.3rem 0 0', margin: 0 }}>Manage your account, preferences, and security settings</p>
          {lastUpdated && (
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-tertiary)', marginTop: '0.3rem', margin: 0 }}>
              Last updated: {formatDateTime(lastUpdated)}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {autoSaveStatus === 'saving' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
              <span style={{ width: 12, height: 12, border: '2px solid var(--color-gray-300)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
              Saving...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--color-success)' }}>
              <Icon path={Icons.check} size={12} />
              All changes saved
            </span>
          )}
          {autoSaveStatus === 'unsaved' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--color-warning)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
              Unsaved changes
            </span>
          )}
          {autoSaveStatus === 'error' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--color-danger)' }}>
              <Icon path={Icons['alert-circle']} size={12} />
              Save failed
            </span>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={sectionTitleStyle}>Profile Completion</h3>
          <p style={sectionDescStyle}>Complete your profile to get the most out of your portfolio</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div style={{ width: `${completionPercent}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>{completionPercent}%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {profileCompletionItems.map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: item.done ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                <Icon path={item.done ? Icons['check-circle'] : Icons['x-circle']} size={14} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem',
                border: 'none', borderRadius: 8, background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 600 : 500,
                textAlign: 'left', width: '100%', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) e.target.style.background = 'var(--color-gray-100)'; }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) e.target.style.background = 'transparent'; }}
            >
              <Icon path={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ════════════════════════════════════ TAB 1 - OVERVIEW ════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {user?.avatar ? (
                      <img src={imageUrl(user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                        {(profile.firstName?.[0] || profile.email?.[0] || 'A').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      {profile.displayName || `${profile.firstName} ${profile.lastName}` || user?.name || 'User'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.15rem 0' }}>
                      {profile.jobTitle || 'No role set'} &middot; {profile.email || user?.email}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', margin: '0.15rem 0' }}>
                      @{profile.username || user?.username || 'username'}
                    </p>
                  </div>
                  <div>
                    <span style={user?.status === 'active' || !user?.status ? badgeGreen : badgeRed}>
                      {user?.status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  <div>Member since <strong style={{ color: 'var(--color-text)' }}>{formatDate(user?.createdAt)}</strong></div>
                  <div>Last login <strong style={{ color: 'var(--color-text)' }}>{formatDateTime(user?.lastLogin)}</strong></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Login Count', value: user?.loginCount || 0, icon: Icons['log-out'] },
                  { label: 'Active Sessions', value: sessions.filter(s => !s.isCurrent).length + 1 || '—', icon: Icons.monitor },
                  { label: 'Storage Used', value: user?.storageUsed ? `${(user.storageUsed / 1024 / 1024).toFixed(1)} MB` : '—', icon: Icons.database },
                  { label: 'Profile Completion', value: `${completionPercent}%`, icon: Icons.user },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '1.25rem', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <Icon path={stat.icon} size={18} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>Recent Devices</h3>
                <p style={sectionDescStyle}>Devices that have accessed your account recently</p>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                    No session data available
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sessions.slice(0, 5).map((session, i) => (
                      <div key={session._id || session.id || i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                          <Icon path={session.isCurrent ? Icons.monitor : Icons.smartphone} size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {session.browser || 'Unknown'} {session.isCurrent && <span style={badgeGreen}>Current</span>}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                            {session.os || 'Unknown'} &middot; {session.device || 'Unknown'}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'right' }}>
                          {session.lastActivity ? formatDateTime(session.lastActivity) : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════════════════════════════════ TAB 2 - PERSONAL INFORMATION ════════════════════════════════════ */}
          {activeTab === 'personal-info' && (
            <>
              {renderSection('Basic Information', 'Your personal details', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow2}>
                    {renderField('First Name', 'firstName', { required: true, placeholder: 'John' })}
                    {renderField('Last Name', 'lastName', { required: true, placeholder: 'Doe' })}
                  </div>
                  <div style={fieldRow2}>
                    {renderField('Display Name', 'displayName', { placeholder: 'John Doe' })}
                    {renderField('Username', 'username', { placeholder: 'johndoe' })}
                  </div>
                  <div style={fieldRow2}>
                    {renderField('Email', 'email', { required: true, placeholder: 'john@example.com' })}
                    {renderField('Secondary Email', 'secondaryEmail', { placeholder: 'john.backup@example.com' })}
                  </div>
                  <div style={fieldRow2}>
                    {renderField('Phone', 'phone', { placeholder: '+1 234 567 890' })}
                    {renderField('Alternative Phone', 'alternativePhone', { placeholder: '+1 987 654 321' })}
                  </div>
                  {renderField('Bio', 'bio', { type: 'textarea', rows: 4, placeholder: 'Tell us about yourself...', maxLength: 500 })}
                </div>
              ))}

              {renderSection('Professional Information', 'Your work details', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow3}>
                    {renderField('Job Title', 'jobTitle', { placeholder: 'Software Engineer' })}
                    {renderField('Company', 'company', { placeholder: 'Acme Inc.' })}
                    {renderField('Website', 'website', { placeholder: 'https://example.com' })}
                  </div>
                </div>
              ))}

              {renderSection('Location', 'Your address', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow3}>
                    {renderField('Country', 'country', { type: 'select', options: COUNTRIES })}
                    {renderField('State', 'state', { placeholder: 'California' })}
                    {renderField('City', 'city', { placeholder: 'San Francisco' })}
                  </div>
                  <div style={fieldRow2}>
                    {renderField('Postal Code', 'postalCode', { placeholder: '94105' })}
                    {renderField('Address', 'address', { placeholder: '123 Main St' })}
                  </div>
                </div>
              ))}

              {renderSection('Regional Settings', 'Your locale preferences', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow3}>
                    {renderField('Timezone', 'timezone', { type: 'select', options: TIMEZONES })}
                    {renderField('Language', 'language', { type: 'select', options: LANGUAGES })}
                    {renderField('Date Format', 'dateFormat', { type: 'select', options: [
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]})}
                  </div>
                  <div style={fieldRow2}>
                    {renderField('Time Format', 'timeFormat', { type: 'select', options: [
                      { value: '12h', label: '12-hour' },
                      { value: '24h', label: '24-hour' },
                    ]})}
                  </div>
                </div>
              ))}

              {renderSection('Social Links', 'Your social media profiles', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow2}>
                    {SOCIAL_PLATFORMS.slice(0, 4).map(s => renderField(s.label, s.key, { placeholder: `https://${s.key}.com/username` }))}
                  </div>
                  <div style={fieldRow2}>
                    {SOCIAL_PLATFORMS.slice(4, 8).map(s => renderField(s.label, s.key, { placeholder: `https://${s.key}.com/username` }))}
                  </div>
                  {renderField(SOCIAL_PLATFORMS[8].label, SOCIAL_PLATFORMS[8].key, { placeholder: 'https://your-site.com' })}
                </div>
              ))}

              {renderSection('Profile Visibility', '', (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={toggleTrack(profile.publicProfile)} onClick={() => { setProfile({ ...profile, publicProfile: !profile.publicProfile }); markDirty(); }}>
                    <div style={{ ...toggleThumb, transform: profile.publicProfile ? 'translateX(20px)' : 'translateX(0)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>Public Profile</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Allow others to view your public profile</div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving.profile}>
                  <Icon path={Icons.save} size={14} /> {saving.profile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}

          {/* ════════════════════════════════════ TAB 3 - PROFILE PHOTO ════════════════════════════════════ */}
          {activeTab === 'photo' && (
            <>
              {renderSection('Profile Photo', 'Upload a photo to personalize your account', (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: 128, height: 128, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid var(--color-border)' }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : user?.avatar ? (
                      <img src={imageUrl(user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800 }}>
                        {(profile.firstName?.[0] || profile.email?.[0] || 'A').toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      width: '100%', maxWidth: 400, minHeight: 140, borderRadius: 12,
                      border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isDragging ? 'rgba(99,102,241,0.05)' : 'var(--color-bg-subtle)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handlePhotoSelect(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon path={Icons.upload} size={28} style={{ color: 'var(--color-text-tertiary)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>Drop your photo here, or click to browse</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>PNG, JPG, JPEG, WEBP up to 5MB</div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    style={{ display: 'none' }}
                    onChange={(e) => { handlePhotoSelect(e.target.files[0]); e.target.value = ''; }}
                  />

                  {photoPreview && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-primary" onClick={handlePhotoUpload} disabled={saving.photo}>
                        {saving.photo ? 'Uploading...' : 'Save Photo'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}>
                        Cancel
                      </button>
                    </div>
                  )}

                  {user?.avatar && !photoPreview && (
                    <button
                      onClick={() => setShowRemovePhotoModal(true)}
                      style={dangerBtn}
                    >
                      <Icon path={Icons.trash2} size={14} /> Remove Photo
                    </button>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ════════════════════════════════════ TAB 4 - SECURITY ════════════════════════════════════ */}
          {activeTab === 'security' && (
            <>
              {renderSection('Change Password', 'Update your account password', (
                <div style={{ maxWidth: 450, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyles}>Current Password</label>
                    <input
                      style={inputStyles}
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyles}>New Password</label>
                    <input
                      style={inputStyles}
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      placeholder="Enter new password (min 8 chars)"
                    />
                    {passwordForm.new && (
                      <div style={{ marginTop: 4 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= passwordStrength.score ? passwordStrength.color : 'var(--color-border)' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: passwordStrength.color }}>{passwordStrength.label}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyles}>Confirm New Password</label>
                    <input
                      style={inputStyles}
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleChangePassword(passwordForm.current, passwordForm.new, passwordForm.confirm)}
                    disabled={saving.password}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Icon path={Icons.save} size={14} /> {saving.password ? 'Changing...' : 'Change Password'}
                  </button>
                  <div style={{ padding: '0.75rem', background: 'var(--color-bg-subtle)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    <strong>Requirements:</strong>
                    <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0 0', lineHeight: 1.6 }}>
                      <li>Minimum 8 characters</li>
                      <li>Use a mix of letters, numbers, and symbols</li>
                    </ul>
                  </div>
                </div>
              ))}

              {renderSection('Two-Factor Authentication', 'Add an extra layer of security to your account', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Secure your account with 2FA</div>
                    </div>
                    <div
                      style={toggleTrack(user?.twoFactorEnabled || false)}
                      onClick={async () => {
                        try {
                          const newVal = !user?.twoFactorEnabled;
                          await adminApi.updateProfile({ twoFactorEnabled: newVal });
                          setUser(prev => ({ ...prev, twoFactorEnabled: newVal }));
                          toast.success(newVal ? '2FA enabled' : '2FA disabled');
                        } catch {
                          toast.error('Failed to update 2FA');
                        }
                      }}
                    >
                      <div style={{ ...toggleThumb, transform: user?.twoFactorEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
                    </div>
                  </div>
                  {user?.twoFactorEnabled && (
                    <div style={{ padding: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Recovery Codes</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>Store these codes in a secure location. They can be used to access your account if you lose your 2FA device.</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--color-text)', background: '#fff', padding: '0.75rem', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                        {['ABCD-1234-EFGH-5678', 'IJKL-9012-MNOP-3456', 'QRST-7890-UVWX-1234', 'YZAB-5678-CDEF-9012'].join('\n')}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {renderSection('Recovery Email', 'An email to recover access to your account', (
                <div style={{ maxWidth: 450 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyles}>Recovery Email</label>
                    <input
                      style={inputStyles}
                      type="email"
                      value={profile.recoveryEmail}
                      onChange={(e) => { setProfile({ ...profile, recoveryEmail: e.target.value }); markDirty(); }}
                      placeholder="recovery@example.com"
                    />
                  </div>
                </div>
              ))}

              {renderSection('Login Alerts', 'Get notified of new login attempts', (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>Email Me on New Login</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Receive an email alert when a new device logs into your account</div>
                  </div>
                  <div
                    style={toggleTrack(user?.loginAlerts !== false)}
                    onClick={async () => {
                      try {
                        const newVal = user?.loginAlerts === false;
                        await adminApi.updateProfile({ loginAlerts: newVal });
                        setUser(prev => ({ ...prev, loginAlerts: newVal }));
                        toast.success(newVal ? 'Login alerts enabled' : 'Login alerts disabled');
                      } catch {
                        toast.error('Failed to update login alerts');
                      }
                    }}
                  >
                    <div style={{ ...toggleThumb, transform: user?.loginAlerts !== false ? 'translateX(20px)' : 'translateX(0)' }} />
                  </div>
                </div>
              ))}

              {renderSection('Security Questions', 'Add security questions for account recovery', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {securityQuestions.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <input style={inputStyles} placeholder="Question" value={q.question} onChange={(e) => {
                          const next = [...securityQuestions];
                          next[i] = { ...next[i], question: e.target.value };
                          setSecurityQuestions(next);
                          markDirty();
                        }} />
                        <input style={inputStyles} placeholder="Answer" type="password" value={q.answer} onChange={(e) => {
                          const next = [...securityQuestions];
                          next[i] = { ...next[i], answer: e.target.value };
                          setSecurityQuestions(next);
                          markDirty();
                        }} />
                      </div>
                      <button
                        style={{ ...dangerBtn, marginTop: 2 }}
                        onClick={() => {
                          setSecurityQuestions(prev => prev.filter((_, j) => j !== i));
                          markDirty();
                        }}
                      >
                        <Icon path={Icons.x} size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setSecurityQuestions([...securityQuestions, { question: '', answer: '' }]);
                      markDirty();
                    }}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Icon path={Icons.plus} size={14} /> Add Question
                  </button>
                </div>
              ))}

              {renderSection('Force Logout', '', (
                <div>
                  <button
                    onClick={() => setShowForceLogoutModal(true)}
                    style={dangerBtn}
                  >
                    <Icon path={Icons['log-out']} size={14} /> Force Logout All Devices
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ════════════════════════════════════ TAB 5 - PREFERENCES ════════════════════════════════════ */}
          {activeTab === 'preferences' && (
            <>
              {renderSection('Theme', 'Choose your interface theme', (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { value: 'light', label: 'Light', icon: Icons.sun },
                    { value: 'dark', label: 'Dark', icon: Icons.monitor },
                    { value: 'system', label: 'System', icon: Icons.monitor },
                  ].map(theme => (
                    <div
                      key={theme.value}
                      onClick={() => {
                        setPreferences({ ...preferences, theme: theme.value });
                        triggerAutoSave('preferences', { ...preferences, theme: theme.value });
                      }}
                      style={{
                        flex: 1, padding: '1rem 1.25rem', borderRadius: 12, cursor: 'pointer',
                        border: preferences.theme === theme.value ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                        background: preferences.theme === theme.value ? 'rgba(99,102,241,0.05)' : 'var(--color-card)',
                        textAlign: 'center', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}><Icon path={theme.icon} size={24} /></div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{theme.label}</div>
                    </div>
                  ))}
                </div>
              ))}

              {renderSection('Accent Color', 'Choose your accent color', (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {ACCENT_COLORS.map(c => (
                    <div
                      key={c.value}
                      onClick={() => {
                        setPreferences({ ...preferences, accentColor: c.value });
                        triggerAutoSave('preferences', { ...preferences, accentColor: c.value });
                      }}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', background: c.color, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: preferences.accentColor === c.value ? '3px solid var(--color-card)' : '3px solid transparent',
                        boxShadow: preferences.accentColor === c.value ? `0 0 0 2px ${c.color}` : 'none',
                        transition: 'all 0.2s',
                      }}
                      title={c.label}
                    >
                      {preferences.accentColor === c.value && (
                        <Icon path={Icons.check} size={14} color="#fff" style={{ color: '#fff' }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {renderSection('Layout', 'Customize your interface', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Sidebar Style</label>
                      <select
                        style={selectStyles}
                        value={preferences.sidebarStyle}
                        onChange={(e) => {
                          setPreferences({ ...preferences, sidebarStyle: e.target.value });
                          triggerAutoSave('preferences', { ...preferences, sidebarStyle: e.target.value });
                        }}
                      >
                        <option value="default">Default</option>
                        <option value="collapsed">Collapsed</option>
                        <option value="icons-only">Icons Only</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Table Density</label>
                      <select
                        style={selectStyles}
                        value={preferences.tableDensity}
                        onChange={(e) => {
                          setPreferences({ ...preferences, tableDensity: e.target.value });
                          triggerAutoSave('preferences', { ...preferences, tableDensity: e.target.value });
                        }}
                      >
                        <option value="comfortable">Comfortable</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>
                  </div>
                  {renderToggle('Animations', 'Enable smooth animations throughout the interface', preferences.animations, (v) => {
                    setPreferences({ ...preferences, animations: v });
                    triggerAutoSave('preferences', { ...preferences, animations: v });
                  })}
                </div>
              ))}

              {renderSection('Default Pages', 'Set your default landing pages', (
                <div style={fieldRow2}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyles}>Default Dashboard</label>
                    <select
                      style={selectStyles}
                      value={preferences.defaultDashboard}
                      onChange={(e) => {
                        setPreferences({ ...preferences, defaultDashboard: e.target.value });
                        triggerAutoSave('preferences', { ...preferences, defaultDashboard: e.target.value });
                      }}
                    >
                      <option value="dashboard">Main Dashboard</option>
                      <option value="analytics">Analytics</option>
                      <option value="projects">Projects</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyles}>Landing Page</label>
                    <select
                      style={selectStyles}
                      value={preferences.landingPage}
                      onChange={(e) => {
                        setPreferences({ ...preferences, landingPage: e.target.value });
                        triggerAutoSave('preferences', { ...preferences, landingPage: e.target.value });
                      }}
                    >
                      <option value="hero">Hero Section</option>
                      <option value="projects">Projects</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>
                </div>
              ))}

              {renderSection('Regional Settings', 'Date, time, and language preferences', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={fieldRow3}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Date Format</label>
                      <select
                        style={selectStyles}
                        value={preferences.dateFormat}
                        onChange={(e) => {
                          setPreferences({ ...preferences, dateFormat: e.target.value });
                          triggerAutoSave('preferences', { ...preferences, dateFormat: e.target.value });
                        }}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Time Format</label>
                      <select
                        style={selectStyles}
                        value={preferences.timeFormat}
                        onChange={(e) => {
                          setPreferences({ ...preferences, timeFormat: e.target.value });
                          triggerAutoSave('preferences', { ...preferences, timeFormat: e.target.value });
                        }}
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Timezone</label>
                      <select
                        style={selectStyles}
                        value={preferences.timezone}
                        onChange={(e) => {
                          setPreferences({ ...preferences, timezone: e.target.value });
                          triggerAutoSave('preferences', { ...preferences, timezone: e.target.value });
                        }}
                      >
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={fieldRow2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Language</label>
                      <select
                        style={selectStyles}
                        value={preferences.language}
                        onChange={(e) => {
                          setPreferences({ ...preferences, language: e.target.value });
                          triggerAutoSave('preferences', { ...preferences, language: e.target.value });
                        }}
                      >
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyles}>Items Per Page</label>
                      <select
                        style={selectStyles}
                        value={preferences.itemsPerPage}
                        onChange={(e) => {
                          setPreferences({ ...preferences, itemsPerPage: Number(e.target.value) });
                          triggerAutoSave('preferences', { ...preferences, itemsPerPage: Number(e.target.value) });
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    await adminApi.updatePreferences(preferences);
                    toast.success('Preferences saved');
                    setAutoSaveStatus('saved');
                  } catch {
                    toast.error('Failed to save preferences');
                  }
                }}>
                  <Icon path={Icons.save} size={14} /> Save Preferences
                </button>
              </div>
            </>
          )}

          {/* ════════════════════════════════════ TAB 6 - NOTIFICATIONS ════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <>
              {renderSection('Email Notifications', 'Configure which emails you receive', (
                <div>
                  {Object.entries(notifications.email).map(([key, val]) => (
                    <div key={key}>
                      {renderToggle(
                        key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
                        `Receive ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} via email`,
                        val,
                        (v) => {
                          const next = { ...notifications, email: { ...notifications.email, [key]: v } };
                          setNotifications(next);
                          triggerAutoSave('notifications', next);
                        }
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {renderSection('Browser Notifications', 'Configure in-app notifications', (
                <div>
                  {Object.entries(notifications.browser).map(([key, val]) => (
                    <div key={key}>
                      {renderToggle(
                        key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
                        `Show ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} in-app`,
                        val,
                        (v) => {
                          const next = { ...notifications, browser: { ...notifications.browser, [key]: v } };
                          setNotifications(next);
                          triggerAutoSave('notifications', next);
                        }
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {renderSection('Other Notifications', '', (
                <div>
                  {renderToggle('Sound Notifications', 'Play a sound when notifications arrive', notifications.sound, (v) => {
                    const next = { ...notifications, sound: v };
                    setNotifications(next);
                    triggerAutoSave('notifications', next);
                  })}
                  {renderToggle('Desktop Notifications', 'Show desktop notifications', notifications.desktop, (v) => {
                    const next = { ...notifications, desktop: v };
                    setNotifications(next);
                    triggerAutoSave('notifications', next);
                  })}
                  {renderToggle('Marketing Emails', 'Receive marketing and promotional emails', notifications.marketing, (v) => {
                    const next = { ...notifications, marketing: v };
                    setNotifications(next);
                    triggerAutoSave('notifications', next);
                  })}
                </div>
              ))}
            </>
          )}

          {/* ════════════════════════════════════ TAB 7 - SESSIONS ════════════════════════════════════ */}
          {activeTab === 'sessions' && (
            <>
              {sessionsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1,2,3].map(i => <Skeleton key={i} height={80} />)}
                </div>
              ) : (
                <>
                  {sessions.filter(s => s.isCurrent).map(session => (
                    <div key={session._id || session.id} style={{ ...cardStyle, border: '2px solid var(--color-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                          <Icon path={Icons.monitor} size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>{session.browser || 'Unknown Browser'}</span>
                            <span style={badgeGreen}>Current</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            {session.os || 'Unknown OS'} &middot; {session.device || 'Unknown Device'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                            IP: {session.ip ? session.ip.replace(/\.\d+$/, '.xxx') : 'N/A'} &middot; {session.country || 'Unknown'} {session.city ? `, ${session.city}` : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                          <div>Logged in: {formatDateTime(session.loginTime || session.createdAt)}</div>
                          <div>Last activity: {formatDateTime(session.lastActivity)}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sessions.filter(s => !s.isCurrent).length > 0 && (
                    <div style={cardStyle}>
                      <h3 style={sectionTitleStyle}>Other Sessions ({sessions.filter(s => !s.isCurrent).length})</h3>
                      <p style={sectionDescStyle}>Active sessions on other devices</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sessions.filter(s => !s.isCurrent).map(session => (
                          <div key={session._id || session.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                              <Icon path={session.device?.toLowerCase().includes('mobile') ? Icons.smartphone : Icons.monitor} size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                {session.browser || 'Unknown Browser'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                                {session.os || 'Unknown OS'} &middot; {session.device || 'Unknown'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                IP: {session.ip ? session.ip.replace(/\.\d+$/, '.xxx') : 'N/A'} &middot; {session.country || 'Unk'} {session.city ? `, ${session.city}` : ''}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                              <div>{formatDateTime(session.loginTime || session.createdAt)}</div>
                              <div>{formatDateTime(session.lastActivity)}</div>
                            </div>
                            <button
                              className="btn btn-ghost"
                              style={{ color: '#dc2626', flexShrink: 0 }}
                              onClick={() => handleTerminateSession(session._id || session.id)}
                            >
                              <Icon path={Icons.x} size={14} /> Terminate
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => setShowTerminateAllModal(true)}>
                      <Icon path={Icons['log-out']} size={14} /> Terminate All Other Sessions
                    </button>
                    <button onClick={() => setShowLogoutAllModal(true)} style={dangerBtn}>
                      <Icon path={Icons['log-out']} size={14} /> Logout All Devices
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ════════════════════════════════════ TAB 8 - ACTIVITY LOGS ════════════════════════════════════ */}
          {activeTab === 'activity' && (
            <>
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: 150 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Search Action</label>
                    <input
                      style={inputStyles}
                      placeholder="e.g. login, logout..."
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchLogs()}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>From</label>
                    <input
                      style={inputStyles}
                      type="date"
                      value={logsDateFrom}
                      onChange={(e) => setLogsDateFrom(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>To</label>
                    <input
                      style={inputStyles}
                      type="date"
                      value={logsDateTo}
                      onChange={(e) => setLogsDateTo(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleSearchLogs} style={{ marginBottom: 0 }}>
                    <Icon path={Icons.search} size={14} /> Search
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setLogsSearch(''); setLogsDateFrom(''); setLogsDateTo(''); setLogsPage(1); loadActivityLogs(1); }}>
                    Clear
                  </button>
                </div>

                {logsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} height={40} />)}
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)' }}>
                    <Icon path={Icons.activity} size={32} style={{ marginBottom: '0.75rem' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>No activity logs found</div>
                    <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Activity will appear here as you use the system</div>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Action</th>
                          <th>Browser</th>
                          <th>OS</th>
                          <th>Device</th>
                          <th>Location</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((log, i) => (
                          <tr key={log._id || log.id || i}>
                            <td style={{ whiteSpace: 'nowrap' }}>{log.date ? formatDate(log.date) : '—'}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {log.time || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—')}
                            </td>
                            <td>
                              <span style={{
                                display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 6,
                                fontSize: '0.75rem', fontWeight: 600,
                                background: log.action?.includes('login') ? '#eff6ff' : log.action?.includes('logout') ? '#fef2f2' : '#f5f3ff',
                                color: log.action?.includes('login') ? '#2563eb' : log.action?.includes('logout') ? '#dc2626' : '#7c3aed',
                              }}>
                                {log.action || '—'}
                              </span>
                            </td>
                            <td>{log.browser || '—'}</td>
                            <td>{log.os || '—'}</td>
                            <td>{log.device || '—'}</td>
                            <td>{log.country || log.location || '—'}</td>
                            <td>
                              <span style={log.status === 'success' || log.status === 'completed' ? badgeGreen : log.status === 'failed' ? badgeRed : badgeGray}>
                                {log.status || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Showing {activityLogs.length} of {logsTotal} logs
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-ghost"
                      disabled={logsPage <= 1}
                      onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                    >
                      <Icon path={Icons['chevron-left']} size={14} /> Previous
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={activityLogs.length < logsPerPage}
                      onClick={() => setLogsPage(p => p + 1)}
                    >
                      Next <Icon path={Icons['chevron-right']} size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowClearLogsModal(true)} style={dangerBtn}>
                <Icon path={Icons.trash2} size={14} /> Clear All Logs
              </button>
            </>
          )}

          {/* ════════════════════════════════════ TAB 9 - CONNECTED ACCOUNTS ════════════════════════════════════ */}
          {activeTab === 'connected-accounts' && (
            <>
              {accountsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1,2,3,4].map(i => <Skeleton key={i} height={100} />)}
                </div>
              ) : (
                <>
                  {[
                    { provider: 'github', label: 'GitHub', icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
                    { provider: 'linkedin', label: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                    { provider: 'google', label: 'Google', icon: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z' },
                    { provider: 'cloudinary', label: 'Cloudinary', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v4H7v2h4v4h2v-4h4v-2h-4V7h-2z' },
                  ].map(provider => {
                    const account = connectedAccounts.find(a => a.provider === provider.provider);
                    const isConnected = !!account;
                    return (
                      <div key={provider.provider} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d={provider.icon} /></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>{provider.label}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            {isConnected ? `Connected as ${account.email || account.username || account.handle || 'User'}` : 'Not connected'}
                          </div>
                        </div>
                        <div>
                          <span style={isConnected ? badgeGreen : badgeGray}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        {provider.provider === 'cloudinary' ? (
                          isConnected ? (
                            <button className="btn btn-ghost" onClick={() => handleDisconnectAccount('cloudinary')}>
                              Disconnect
                            </button>
                          ) : (
                            <button className="btn btn-primary" onClick={() => setShowCloudinaryModal(true)}>
                              Configure
                            </button>
                          )
                        ) : (
                          <button
                            className={isConnected ? 'btn btn-ghost' : 'btn btn-primary'}
                            onClick={() => isConnected ? handleDisconnectAccount(provider.provider) : handleConnectAccount(provider.provider)}
                          >
                            {isConnected ? 'Disconnect' : 'Connect'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* ════════════════════════════════════ TAB 10 - DANGER ZONE ════════════════════════════════════ */}
          {activeTab === 'danger-zone' && (
            <>
              <div style={{ ...cardStyle, border: '2px solid #fecaca', background: '#fef2f2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Icon path={Icons['alert-triangle']} size={20} style={{ color: '#dc2626' }} />
                  <h3 style={{ ...sectionTitleStyle, color: '#dc2626', margin: 0 }}>Danger Zone</h3>
                </div>
                <p style={{ ...sectionDescStyle, color: '#b91c1c' }}>Irreversible and destructive actions</p>
              </div>

              <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>Delete Account</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Permanently delete your account and all associated data</div>
                  </div>
                  <button onClick={() => setShowDeleteModal(true)} style={dangerBtn}>
                    <Icon path={Icons.trash2} size={14} /> Delete Account
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>Deactivate Account</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Temporarily disable your account. You can reactivate later.</div>
                  </div>
                  <button onClick={() => setShowDeactivateModal(true)} style={dangerBtn}>
                    <Icon path={Icons['log-out']} size={14} /> Deactivate
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>Remove Profile Photo</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Remove your current profile photo</div>
                  </div>
                  <button onClick={() => setShowRemovePhotoModal(true)} style={dangerBtn}>
                    <Icon path={Icons.image} size={14} /> Remove Photo
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>Reset All Preferences</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Reset all preferences to their default values</div>
                  </div>
                  <button onClick={() => setShowResetPrefsModal(true)} style={dangerBtn}>
                    <Icon path={Icons['refresh-cw']} size={14} /> Reset
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>Clear All Notifications</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Clear all notification settings to defaults</div>
                  </div>
                  <button onClick={() => setShowClearNotifsModal(true)} style={dangerBtn}>
                    <Icon path={Icons.bell} size={14} /> Clear
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>Clear Activity Logs</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Clear all activity log entries</div>
                  </div>
                  <button onClick={() => setShowClearLogsModal(true)} style={dangerBtn}>
                    <Icon path={Icons.trash2} size={14} /> Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════ MODALS ════════════════════════════════════ */}

      {renderModal(showUnsavedModal, 'Unsaved Changes', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            You have unsaved changes. Are you sure you want to leave this tab? Your changes will be lost.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={cancelTabChange}>Stay</button>
            <button className="btn btn-danger" onClick={confirmTabChange}>Discard Changes</button>
          </div>
        </div>
      ), () => setShowUnsavedModal(false))}

      {renderModal(showDeleteModal, 'Delete Account', (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
            <Icon path={Icons['alert-triangle']} size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 500 }}>
              This action is permanent and cannot be undone. All your data will be deleted.
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Please type <strong style={{ color: '#dc2626' }}>DELETE</strong> to confirm.
          </p>
          <input
            style={inputStyles}
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>Cancel</button>
            <button
              style={dangerBtn}
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={async () => {
                try {
                  await adminApi.deleteAccount();
                  toast.success('Account deleted');
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_user');
                  window.location.href = '/admin/login';
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to delete account');
                }
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
            >
              <Icon path={Icons.trash2} size={14} /> Delete My Account
            </button>
          </div>
        </div>
      ), () => { setShowDeleteModal(false); setDeleteConfirmText(''); })}

      {renderModal(showDeactivateModal, 'Deactivate Account', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Are you sure you want to deactivate your account? You can reactivate by logging in again.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
            <button
              style={dangerBtn}
              onClick={async () => {
                try {
                  await adminApi.deactivateAccount();
                  toast.success('Account deactivated');
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_user');
                  window.location.href = '/admin/login';
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to deactivate');
                }
                setShowDeactivateModal(false);
              }}
            >
              Deactivate
            </button>
          </div>
        </div>
      ), () => setShowDeactivateModal(false))}

      {renderModal(showRemovePhotoModal, 'Remove Profile Photo', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Are you sure you want to remove your profile photo? This action can be undone by uploading a new photo.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowRemovePhotoModal(false)}>Cancel</button>
            <button style={dangerBtn} onClick={handleRemovePhoto}>
              <Icon path={Icons.trash2} size={14} /> Remove Photo
            </button>
          </div>
        </div>
      ), () => setShowRemovePhotoModal(false))}

      {renderModal(showResetPrefsModal, 'Reset Preferences', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Are you sure you want to reset all preferences to their default values?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowResetPrefsModal(false)}>Cancel</button>
            <button
              style={dangerBtn}
              onClick={async () => {
                try {
                  await adminApi.updatePreferences(initialPreferences);
                  setPreferences(initialPreferences);
                  toast.success('Preferences reset');
                } catch {
                  toast.error('Failed to reset preferences');
                }
                setShowResetPrefsModal(false);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      ), () => setShowResetPrefsModal(false))}

      {renderModal(showClearNotifsModal, 'Clear Notifications', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Are you sure you want to reset all notification settings to defaults?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowClearNotifsModal(false)}>Cancel</button>
            <button
              style={dangerBtn}
              onClick={async () => {
                try {
                  await adminApi.updateNotifications(initialNotifications);
                  setNotifications(initialNotifications);
                  toast.success('Notification settings reset');
                } catch {
                  toast.error('Failed to reset notification settings');
                }
                setShowClearNotifsModal(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      ), () => setShowClearNotifsModal(false))}

      {renderModal(showClearLogsModal, 'Clear Activity Logs', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Are you sure you want to clear all activity logs? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowClearLogsModal(false)}>Cancel</button>
            <button
              style={dangerBtn}
              onClick={async () => {
                try {
                  await adminApi.getActivityLogs({ clear: true });
                  setActivityLogs([]);
                  setLogsTotal(0);
                  toast.success('Activity logs cleared');
                } catch {
                  toast.error('Failed to clear logs');
                }
                setShowClearLogsModal(false);
              }}
            >
              Clear Logs
            </button>
          </div>
        </div>
      ), () => setShowClearLogsModal(false))}

      {renderModal(showForceLogoutModal, 'Force Logout All Devices', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Are you sure you want to force logout all devices? You will be logged out of all active sessions.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowForceLogoutModal(false)}>Cancel</button>
            <button
              style={dangerBtn}
              onClick={async () => {
                try {
                  await adminApi.logoutAllSessions();
                  toast.success('All devices logged out');
                  loadSessions();
                } catch {
                  toast.error('Failed to logout all devices');
                }
                setShowForceLogoutModal(false);
              }}
            >
              Force Logout
            </button>
          </div>
        </div>
      ), () => setShowForceLogoutModal(false))}

      {renderModal(showTerminateAllModal, 'Terminate All Other Sessions', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            This will terminate all active sessions except your current one. You will need to re-authenticate on those devices.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowTerminateAllModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleTerminateAllSessions}>
              Terminate All
            </button>
          </div>
        </div>
      ), () => setShowTerminateAllModal(false))}

      {renderModal(showLogoutAllModal, 'Logout All Devices', (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            This will log you out of all devices including your current session. You will be redirected to the login page.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowLogoutAllModal(false)}>Cancel</button>
            <button
              style={dangerBtn}
              onClick={handleLogoutAllDevices}
            >
              Logout All
            </button>
          </div>
        </div>
      ), () => setShowLogoutAllModal(false))}

      {renderModal(showCloudinaryModal, 'Configure Cloudinary', (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyles}>Cloud Name</label>
            <input
              style={inputStyles}
              value={cloudinaryConfig.cloudName}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, cloudName: e.target.value })}
              placeholder="your-cloud-name"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyles}>API Key</label>
            <input
              style={inputStyles}
              value={cloudinaryConfig.apiKey}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, apiKey: e.target.value })}
              placeholder="123456789012345"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyles}>API Secret</label>
            <input
              style={inputStyles}
              type="password"
              value={cloudinaryConfig.apiSecret}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, apiSecret: e.target.value })}
              placeholder="your-api-secret"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowCloudinaryModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await handleConnectAccount('cloudinary', cloudinaryConfig);
                setShowCloudinaryModal(false);
              }}
              disabled={!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey}
            >
              Connect
            </button>
          </div>
        </div>
      ), () => setShowCloudinaryModal(false), true)}
    </div>
  );
}