import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api.ts';
import { FiTrash2, FiReply, FiMail, FiSend, FiX, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import type { Message } from '../types';
import { formatDateTime } from '../lib/utils';

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getMessages({ limit: 50 })
      .then(({ data }) => setMessages(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (msg: Message) => {
    setSelected(msg);
    setReply('');
    if (!msg.isRead) {
      try {
        await adminApi.markAsRead(msg._id);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (err) { /* ignore */ }
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await adminApi.replyMessage(selected!._id, { replyContent: reply });
      setMessages(prev => prev.map(m => m._id === selected!._id ? { ...m, isReplied: true, replyContent: reply } : m));
      setSelected({ ...selected!, isReplied: true, replyContent: reply });
      setReply('');
    } catch (err) { console.error('Failed to reply', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminApi.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) { console.error('Failed to delete', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Messages</h2>
          <p>Contact form submissions ({messages.length} total, {unreadCount} unread)</p>
        </div>
      </div>
      <div className="messages-layout">
        <div className="messages-list">
          <div className="messages-list-header">
            <span>Inbox</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-500)' }}>{messages.length}</span>
          </div>
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`message-item ${selected?._id === msg._id ? 'active' : ''} ${!msg.isRead ? 'unread' : ''}`}
              onClick={() => handleSelect(msg)}
            >
              <div className="message-item-header">
                <span className="message-item-name">{msg.name}</span>
                <span className="message-item-date">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="message-item-subject">
                {msg.subject || msg.message?.substring(0, 80)}
              </p>
            </div>
          ))}
          {messages.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
              <FiMail size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 13 }}>No messages yet</p>
            </div>
          )}
        </div>
        <div className="messages-detail">
          {selected ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--darker)' }}>{selected.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{selected.email}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected._id)}>
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
              {selected.subject && (
                <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12, fontWeight: 500 }}>
                  Subject: {selected.subject}
                </p>
              )}
              <div style={{
                padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)',
                fontSize: 13, lineHeight: 1.7, border: '1px solid var(--gray-200)', marginBottom: 16,
              }}>
                {selected.message}
              </div>
              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 16 }}>
                Received {formatDateTime(selected.createdAt)}
                {selected.isRead && <span> · Read</span>}
              </p>
              {selected.isReplied && (
                <div style={{
                  padding: 12, background: 'var(--green-light)', borderRadius: 'var(--radius)',
                  marginBottom: 16,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>Your reply:</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>{selected.replyContent}</p>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>Reply</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your reply..."
                  style={{
                    width: '100%', padding: 10, border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius)', fontSize: 13, minHeight: 80,
                    resize: 'vertical', fontFamily: 'var(--font)', color: 'var(--dark)',
                  }}
                />
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleReply} disabled={!reply.trim()}>
                  <FiSend size={14} /> Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-detail-empty">
              <FiMessageSquare size={48} />
              <h3>Select a message</h3>
              <p>Choose a message from the inbox to read and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
