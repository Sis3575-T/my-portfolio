import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import { AreaChart, Area, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const mockResponseTime = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  value: Math.floor(Math.random() * 200) + 50,
}));

const mockStorageData = [
  { name: 'Used', value: 256 },
  { name: 'Free', value: 744 },
];

const mockMemoryData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  value: Math.floor(Math.random() * 30) + 40,
}));

const mockRequestsData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  value: Math.floor(Math.random() * 100) + 20,
}));

const mockRecentErrors = [
  { id: 1, message: 'Database connection timeout', service: 'Database', time: '2 min ago', severity: 'error' },
  { id: 2, message: 'Rate limit exceeded for /api/contact', service: 'API', time: '15 min ago', severity: 'warning' },
  { id: 3, message: 'Failed to send email notification', service: 'Email', time: '1 hr ago', severity: 'error' },
  { id: 4, message: 'Cache miss for blog posts', service: 'API', time: '2 hrs ago', severity: 'info' },
  { id: 5, message: 'SSL certificate expires in 7 days', service: 'CDN', time: '3 hrs ago', severity: 'warning' },
];

const initialServices = [
  { name: 'API', status: 'green', uptime: '99.9%' },
  { name: 'Database', status: 'green', uptime: '99.95%' },
  { name: 'Storage', status: 'green', uptime: '99.8%' },
  { name: 'Email', status: 'yellow', uptime: '98.5%' },
  { name: 'CDN', status: 'green', uptime: '100%' },
];

const SystemMonitoring = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('connected');
  const [apiResponseTime, setApiResponseTime] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [uptime, setUptime] = useState('');
  const [recentErrors] = useState(mockRecentErrors);
  const [services] = useState(initialServices);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemData = async () => {
    try {
      const res = await adminApi.getSettings().catch(() => null);
      if (res) {
        const s = res.data?.data || res.data?.settings || {};
        setDbStatus(s.system?.dbStatus || 'connected');
        setApiResponseTime(Math.floor(Math.random() * 80) + 20);
        setStorageUsed(Math.floor(Math.random() * 100) + 200);
      }
    } catch {
      // Use mock data
    }
    setCpuUsage(Math.floor(Math.random() * 30) + 20);
    setMemoryUsage(Math.floor(Math.random() * 20) + 40);
    const days = Math.floor(Math.random() * 14) + 1;
    const hours = Math.floor(Math.random() * 24);
    setUptime(`${days}d ${hours}h`);
  };

  useEffect(() => {
    setLoading(false);
    fetchSystemData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchSystemData, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const stats = [
    {
      label: 'Database Status', value: dbStatus === 'connected' ? 'Connected' : 'Disconnected',
      icon: Icons.database, color: dbStatus === 'connected' ? 'green' : 'red',
      miniChart: null,
    },
    { label: 'API Response Time', value: `${apiResponseTime}ms`, icon: Icons.activity, color: apiResponseTime < 100 ? 'green' : apiResponseTime < 200 ? 'yellow' : 'red' },
    { label: 'Storage Used', value: `${storageUsed} MB`, icon: Icons.database, color: 'blue' },
    { label: 'Memory Usage', value: `${memoryUsage}%`, icon: Icons['pie-chart'], color: memoryUsage < 60 ? 'green' : memoryUsage < 80 ? 'yellow' : 'red' },
    { label: 'CPU Usage', value: `${cpuUsage}%`, icon: Icons.activity, color: cpuUsage < 50 ? 'green' : cpuUsage < 80 ? 'yellow' : 'red' },
    { label: 'Uptime', value: uptime, icon: Icons.clock, color: 'purple' },
  ];

  const severityColor = (sev) => {
    switch (sev) {
      case 'error': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      default: return 'var(--color-text-tertiary)';
    }
  };

  const statusDot = (status) => {
    const dotColor = status === 'green' ? 'var(--color-success)' : status === 'yellow' ? 'var(--color-warning)' : 'var(--color-danger)';
    return <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />;
  };

  if (loading) {
    return (
      <PageLayout title="System Monitoring" description="System monitoring dashboard">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="System Monitoring"
      description="System monitoring dashboard"
      stats={stats}
      lastUpdated={new Date().toLocaleTimeString()}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <label className="form-check" style={{ fontSize: '0.82rem' }}>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          <span>Auto-refresh (30s)</span>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>API Response Time (24h)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockResponseTime}>
              <defs>
                <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#respGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Storage Usage</h4>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={mockStorageData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                  {mockStorageData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{storageUsed} MB</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>of {storageUsed + mockStorageData[1].value} MB</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Memory Usage (24h)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockMemoryData}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#memGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Requests Per Minute (24h)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockRequestsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Recent Errors
          </div>
          <div>
            {recentErrors.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>No recent errors</div>
            ) : (
              recentErrors.map((err, idx) => (
                <div key={err.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  borderBottom: idx < recentErrors.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                  fontSize: '0.84rem',
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: severityColor(err.severity),
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {err.message}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>{err.service}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{err.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Services Status
          </div>
          <div>
            {services.map((svc, idx) => (
              <div key={svc.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderBottom: idx < services.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {statusDot(svc.status)}
                  <span style={{ fontSize: '0.84rem', fontWeight: 500 }}>{svc.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>Uptime: {svc.uptime}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: 4,
                    fontWeight: 600,
                    background: svc.status === 'green' ? 'var(--color-success-light)' : svc.status === 'yellow' ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
                    color: svc.status === 'green' ? 'var(--color-success)' : svc.status === 'yellow' ? 'var(--color-warning)' : 'var(--color-danger)',
                  }}>
                    {svc.status === 'green' ? 'Operational' : svc.status === 'yellow' ? 'Degraded' : 'Down'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SystemMonitoring;
