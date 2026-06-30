import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';
import DataTable from '../components/DataTable';

const ACTION_OPTIONS = ['All', 'Created', 'Updated', 'Deleted', 'Login', 'Logout', 'Upload'];

const getActionColor = (action) => {
  if (!action) return 'gray';
  const a = action.toLowerCase();
  if (a.includes('created') || a.includes('upload')) return '#10B981';
  if (a.includes('updated') || a.includes('edited')) return '#3B82F6';
  if (a.includes('deleted')) return '#EF4444';
  if (a.includes('login')) return '#8B5CF6';
  if (a.includes('logout')) return '#6B7280';
  return '#6B7280';
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ActivityLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ action: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { limit, offset: (page - 1) * limit };
      if (filterVal.action) params.action = filterVal.action.toLowerCase();
      const { data } = await adminApi.getActivityLogs(params);
      setLogs(data.data || []);
      setTotal(data.total || data.data?.length || 0);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User', 'Action', 'Details', 'IP', 'Browser', 'Timestamp'];
    const rows = logs.map(log => [
      log.user?.name || 'System',
      log.action || '',
      typeof log.details === 'string' ? log.details : JSON.stringify(log.details || ''),
      log.ip || '',
      log.userAgent || '',
      formatDate(log.timestamp || log.createdAt),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const today = logs.filter(l => {
    const d = new Date(l.timestamp || l.createdAt);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const thisWeek = logs.filter(l => {
    const d = new Date(l.timestamp || l.createdAt);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  }).length;

  const thisMonth = logs.filter(l => {
    const d = new Date(l.timestamp || l.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Total Events', value: total, icon: Icons.activity, color: 'blue' },
    { label: 'Today', value: today, icon: Icons.clock, color: 'green' },
    { label: 'This Week', value: thisWeek, icon: Icons.calendar, color: 'purple' },
    { label: 'This Month', value: thisMonth, icon: Icons['bar-chart-3'], color: 'yellow' },
  ];

  const columns = [
    {
      key: 'user', label: 'User', sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
            {(row.user?.name || 'S')[0].toUpperCase()}
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.84rem' }}>{row.user?.name || 'System'}</span>
        </div>
      ),
    },
    {
      key: 'action', label: 'Action', sortable: true,
      render: (row) => (
        <span style={{
          display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600,
          background: `${getActionColor(row.action)}18`, color: getActionColor(row.action),
        }}>
          {row.action ? row.action.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'details', label: 'Details', sortable: false,
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.details ? (typeof row.details === 'string' ? row.details : JSON.stringify(row.details).slice(0, 60)) : '-'}
        </span>
      ),
    },
    {
      key: 'ip', label: 'IP', sortable: true,
      render: (row) => <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{row.ip || '-'}</span>,
    },
    {
      key: 'userAgent', label: 'Browser', sortable: false,
      render: (row) => {
        const ua = row.userAgent || '';
        const icon = ua.includes('Chrome') ? Icons.globe : ua.includes('Firefox') ? Icons.globe : ua.includes('Safari') ? Icons.globe : Icons.monitor;
        return <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Icon path={icon} size={12} /> {ua ? ua.split('/')[0]?.split(' ')[0] || 'Unknown' : '-'}
        </span>;
      },
    },
    {
      key: 'timestamp', label: 'Timestamp', sortable: true,
      render: (row) => <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{formatDate(row.timestamp || row.createdAt)}</span>,
    },
  ];

  return (
    <PageLayout
      title="Activity Logs"
      description="Track all admin actions and system events"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={(val) => { setSearchVal(val); setPage(1); }}
        searchPlaceholder="Search logs..."
        filters={[
          { key: 'action', label: 'Action Type', type: 'select', options: ACTION_OPTIONS },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (key === '__reset__' || val === '__reset__') setFilterVal({ action: '' });
          else setFilterVal({ ...filterVal, [key]: val === 'All' ? '' : val });
        }}
        onRefresh={fetchLogs}
        onExportCSV={handleExportCSV}
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No activity logs found"
        emptyIcon={Icons.activity}
        pageSize={limit}
        actions={false}
        searchable={false}
      />

      {!loading && logs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
          <span>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1, color: 'var(--color-text-secondary)' }}
            >
              Previous
            </button>
            <span style={{ padding: '0.4rem 0.75rem', fontWeight: 600 }}>Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)', cursor: page * limit >= total ? 'default' : 'pointer', opacity: page * limit >= total ? 0.4 : 1, color: 'var(--color-text-secondary)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
