import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import ConfirmDialog from '../components/ConfirmDialog';

const getRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  const icons = {
    info: Icons.info,
    success: Icons['check-circle'],
    warning: Icons['alert-triangle'],
    error: Icons['x-circle'],
    message: Icons['message-square'],
    update: Icons['refresh-cw'],
    login: Icons['log-in'],
    backup: Icons.database,
  };
  return icons[type] || Icons.bell;
};

const getNotificationColor = (type) => {
  const colors = {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    message: '#8B5CF6',
    update: '#3B82F6',
    login: '#8B5CF6',
    backup: '#10B981',
  };
  return colors[type] || '#6B7280';
};

export default function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getNotifications();
      setNotifications(data.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteNotification(deleteTarget._id);
      setNotifications(prev => prev.filter(n => n._id !== deleteTarget._id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const stats = [
    { label: 'Total Notifications', value: notifications.length, icon: Icons.bell, color: 'blue' },
    { label: 'Unread', value: unreadCount, icon: Icons.bell, color: 'purple' },
    { label: 'Read', value: readCount, icon: Icons['check-circle'], color: 'green' },
  ];

  return (
    <PageLayout
      title="Notifications"
      description="View and manage your notifications"
      stats={stats}
      quickActions={[
        { label: 'Mark All Read', icon: Icons['check-circle'], onClick: handleMarkAllRead, variant: 'outline' },
        { label: 'Refresh', icon: Icons['refresh-cw'], onClick: fetchNotifications },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          [1,2,3,4,5].map(i => (
            <div key={i} style={{ padding: '1rem', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '50%', height: 16, marginBottom: 6, borderRadius: 4, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 4, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
            <Icon path={Icons.bell} size={48} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No notifications</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              style={{
                padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--color-border)',
                background: notification.read ? 'var(--color-card)' : 'var(--color-primary-subtle)',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `${getNotificationColor(notification.type)}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon path={getNotificationIcon(notification.type)} size={16} style={{ color: getNotificationColor(notification.type) }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{notification.title || 'Notification'}</span>
                  {!notification.read && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 0.25rem', lineHeight: 1.4 }}>
                  {notification.message || notification.body || ''}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                  {getRelativeTime(notification.timestamp || notification.createdAt)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkRead(notification._id)}
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-primary)', background: 'transparent' }}
                    title="Mark as read"
                  >
                    <Icon path={Icons.check} size={14} />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(notification)}
                  style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent' }}
                  title="Delete"
                >
                  <Icon path={Icons.x} size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message={`Delete "${deleteTarget?.title || 'this notification'}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}
