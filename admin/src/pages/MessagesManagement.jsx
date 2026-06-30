import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';

export default function MessagesManagement() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '' });
  const [bulkSelected, setBulkSelected] = useState([]);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getMessages({ limit: 200 });
      setMessages(data.data || []);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const { data } = await adminApi.getMessage(id);
      setSelected(data.data || data);
    } catch {
      toast.error('Failed to load message');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelect = async (msg) => {
    setReplyText('');
    fetchMessageDetail(msg._id);
    if (!msg.isRead) {
      try {
        await adminApi.markAsRead(msg._id);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch { /* ignore */ }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      await adminApi.replyMessage(selected._id, { replyContent: replyText });
      setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, isReplied: true, replyContent: replyText } : m));
      setSelected({ ...selected, isReplied: true, replyContent: replyText });
      toast.success('Reply sent');
      setReplyText('');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (id, read) => {
    try {
      if (read) {
        await adminApi.markAsRead(id);
      }
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: read } : m));
      if (selected?._id === id) setSelected({ ...selected, isRead: read });
      toast.success(read ? 'Marked as read' : 'Marked as unread');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleStar = async (id) => {
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isStarred: !m.isStarred } : m));
    if (selected?._id === id) setSelected({ ...selected, isStarred: !selected.isStarred });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteMessage(deleteTarget._id);
      toast.success('Message deleted');
      setMessages(prev => prev.filter(m => m._id !== deleteTarget._id));
      if (selected?._id === deleteTarget._id) setSelected(null);
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        if (action === 'delete') await adminApi.deleteMessage(id);
        else if (action === 'read') await adminApi.markAsRead(id);
      }
      toast.success(`${selectedIds.length} messages ${action === 'delete' ? 'deleted' : 'updated'}`);
      await fetchMessages();
      if (selected && selectedIds.includes(selected._id)) setSelected(null);
      setBulkSelected([]);
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const filtered = messages.filter(m => {
    const q = searchVal.toLowerCase();
    if (q && !m.name?.toLowerCase().includes(q) && !m.email?.toLowerCase().includes(q) && !(m.message || '').toLowerCase().includes(q) && !(m.subject || '').toLowerCase().includes(q)) return false;
    if (filterVal.status === 'unread' && m.isRead) return false;
    if (filterVal.status === 'read' && !m.isRead) return false;
    if (filterVal.status === 'starred' && !m.isStarred) return false;
    return true;
  });

  const totalUnread = messages.filter(m => !m.isRead).length;
  const totalRead = messages.filter(m => m.isRead).length;
  const totalStarred = messages.filter(m => m.isStarred).length;

  const stats = [
    { label: 'Total Messages', value: messages.length, icon: Icons['message-square'], color: 'blue' },
    { label: 'Unread', value: totalUnread, icon: Icons.mail, color: 'red' },
    { label: 'Read', value: totalRead, icon: Icons['check-circle'], color: 'green' },
    { label: 'Starred', value: totalStarred, icon: Icons.star, color: 'yellow' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <PageLayout
      title="Messages"
      description="Manage contact form submissions"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search messages..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['all', 'unread', 'read', 'starred'], labels: { all: 'All', unread: 'Unread', read: 'Read', starred: 'Starred' } },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterVal({ status: '' });
          else setFilterVal({ ...filterVal, [key]: val === 'all' ? '' : val });
        }}
        onRefresh={fetchMessages}
        extraActions={[
          { label: 'Mark Read', icon: Icons['check-circle'], onClick: () => { if (bulkSelected.length > 0) handleBulkAction('read', bulkSelected); } },
          { label: 'Delete', icon: Icons.trash2, onClick: () => { if (bulkSelected.length > 0) handleBulkAction('delete', bulkSelected); } },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1rem', minHeight: 'calc(100vh - 280px)' }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 2, background: 'var(--color-bg-subtle)', borderRadius: 8 }}>
              {['all', 'unread', 'starred'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterVal({ status: f === 'all' ? '' : f })}
                  style={{
                    padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: (f === 'all' && !filterVal.status) || filterVal.status === f ? 'var(--color-primary)' : 'transparent',
                    color: (f === 'all' && !filterVal.status) || filterVal.status === f ? '#fff' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{ padding: '1rem' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6, borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '3rem 1rem', color: 'var(--color-text-tertiary)' }}>
                <Icon path={Icons['message-square']} size={40} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No messages yet</h3>
                <p style={{ fontSize: '0.84rem', textAlign: 'center', margin: 0 }}>Messages from your portfolio contact form will appear here.</p>
              </div>
            ) : (
              filtered.map(msg => (
                <div
                  key={msg._id}
                  onClick={() => handleSelect(msg)}
                  style={{
                    display: 'flex', gap: '0.75rem', padding: '0.85rem 1rem', cursor: 'pointer', transition: 'background 0.15s',
                    background: selected?._id === msg._id ? 'var(--color-primary-subtle)' : 'transparent',
                    borderBottom: '1px solid var(--color-border-light)',
                    opacity: msg.isRead ? 0.7 : 1,
                    borderLeft: `3px solid ${msg.isRead ? 'transparent' : 'var(--color-primary)'}`,
                  }}
                  onMouseEnter={(e) => { if (selected?._id !== msg._id) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
                  onMouseLeave={(e) => { if (selected?._id !== msg._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                  }}>
                    {getInitials(msg.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: msg.isRead ? 500 : 700, fontSize: '0.84rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msg.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.subject || (msg.message || '').substring(0, 80)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStar(msg._id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: msg.isStarred ? '#F59E0B' : 'var(--color-text-tertiary)', transition: 'color 0.2s' }}
                      >
                        <Icon path={Icons.star} size={12} />
                      </button>
                      {msg.isReplied && <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)' }}>Replied</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'auto' }}>
          {loadingDetail ? (
            <div style={{ padding: '2rem' }}>
              <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 20, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 120, width: '100%', borderRadius: 8, marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 80, width: '100%', borderRadius: 8 }} />
            </div>
          ) : selected ? (
            <div style={{ padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {getInitials(selected.name)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{selected.name}</h3>
                    <a href={`mailto:${selected.email}`} style={{ fontSize: '0.84rem', color: 'var(--color-primary)', textDecoration: 'none' }}>{selected.email}</a>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleMarkRead(selected._id, !selected.isRead)}
                    className="btn btn-ghost btn-sm"
                    title={selected.isRead ? 'Mark unread' : 'Mark read'}
                  >
                    <Icon path={selected.isRead ? Icons.mail : Icons['check-circle']} size={14} />
                  </button>
                  <button
                    onClick={() => handleStar(selected._id)}
                    className="btn btn-ghost btn-sm"
                    title={selected.isStarred ? 'Unstar' : 'Star'}
                    style={{ color: selected.isStarred ? '#F59E0B' : undefined }}
                  >
                    <Icon path={Icons.star} size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(selected)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} title="Delete">
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </div>
              </div>

              {selected.subject && (
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', marginTop: 0 }}>{selected.subject}</h2>
              )}

              <div style={{
                padding: '1.25rem', background: 'var(--color-bg-subtle)', borderRadius: 10, fontSize: '0.88rem',
                lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap',
              }}>
                {selected.message}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--color-text-tertiary)' }}>
                {selected.isRead && <span>Read</span>}
                {selected.isReplied && <span>Replied</span>}
                {selected.isStarred && <span>Starred</span>}
              </div>

              {selected.isReplied && selected.replyContent && (
                <div style={{
                  marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--color-primary-subtle)',
                  borderRadius: 10, border: '1px solid var(--color-primary-light)',
                }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4, margin: 0 }}>Your reply:</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap', margin: 0 }}>{selected.replyContent}</p>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 8 }}>
                  Reply to {selected.name}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-subtle)', color: 'var(--color-text)', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={handleReply} disabled={!replyText.trim() || sending}>
                    {sending ? 'Sending...' : <><Icon path={Icons.send} size={14} /> Send Reply</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)', height: '100%' }}>
              <Icon path={Icons['message-square']} size={48} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>Select a message</h3>
              <p style={{ fontSize: '0.84rem', margin: 0, textAlign: 'center' }}>Choose a message from the inbox to read and reply.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message={`Delete message from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}
