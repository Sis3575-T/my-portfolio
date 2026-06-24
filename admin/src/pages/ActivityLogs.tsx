import React, { useState, useEffect } from 'react';
import { FiActivity, FiClock, FiUser, FiShield, FiArrowUpRight } from 'react-icons/fi';
import { timeAgo } from '../lib/utils';

interface LogEntry {
  _id: string;
  action: string;
  description: string;
  user: { name: string };
  createdAt: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const sampleLogs: LogEntry[] = [
  { _id: '1', action: 'Login', description: 'Admin logged in', user: { name: 'Admin' }, createdAt: new Date().toISOString(), color: 'green' },
  { _id: '2', action: 'Update', description: 'Project "ShopFlow" was updated', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 600000).toISOString(), color: 'blue' },
  { _id: '3', action: 'Create', description: 'New blog post "React 19 Features" created', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 1800000).toISOString(), color: 'purple' },
  { _id: '4', action: 'Upload', description: 'Certificate "AWS Certified" uploaded', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 3600000).toISOString(), color: 'orange' },
  { _id: '5', action: 'Delete', description: 'Message from spam deleted', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 7200000).toISOString(), color: 'orange' },
  { _id: '6', action: 'Update', description: 'Skill "React" proficiency updated to 95%', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 14400000).toISOString(), color: 'blue' },
  { _id: '7', action: 'Create', description: 'New project "DataPulse" added', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 28800000).toISOString(), color: 'purple' },
  { _id: '8', action: 'Login', description: 'Admin logged in', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 86400000).toISOString(), color: 'green' },
];

const actionIcons: Record<string, React.ReactNode> = {
  Login: React.createElement(FiShield, { size: 16 }),
  Create: React.createElement(FiArrowUpRight, { size: 16 }),
  Update: React.createElement(FiActivity, { size: 16 }),
  Upload: React.createElement(FiArrowUpRight, { size: 16 }),
  Delete: React.createElement(FiActivity, { size: 16 }),
};

export default function ActivityLogs() {
  const [logs] = useState<LogEntry[]>(sampleLogs);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action.toLowerCase() === filter.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Activity Logs</h2>
          <p>Track all admin actions ({logs.length} entries)</p>
        </div>
        <div className="page-actions">
          <div className="tabs">
            {['all', 'login', 'create', 'update', 'delete', 'upload'].map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Action</th><th>Description</th><th>User</th><th>Time</th></tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log._id}>
                <td>
                  <span className={`badge ${
                    log.action === 'Login' ? 'badge-green' :
                    log.action === 'Create' ? 'badge-blue' :
                    log.action === 'Update' ? 'badge-purple' :
                    log.action === 'Upload' ? 'badge-orange' : 'badge-gray'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{log.description}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiUser size={12} style={{ color: 'var(--gray-400)' }} />
                    <span style={{ fontSize: 13 }}>{log.user.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiClock size={12} />
                    {timeAgo(log.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4}><div className="empty-state"><FiActivity size={40} /><h3>No activity logs</h3><p>No matching entries found.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
