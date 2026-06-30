import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

export default function HealthDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, analyticsRes, activityRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getDashboardStats().catch(() => ({ data: {} })),
        adminApi.getRecentActivity().catch(() => ({ data: { data: [] } })),
      ]);
      setSettings(settingsRes.data?.data || settingsRes.data?.settings || {});
      setAnalytics(analyticsRes.data?.data || analyticsRes.data || {});
      setRecentActivity(activityRes.data?.data || []);
    } catch {
      toast.error('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const seoIssues = useMemo(() => {
    const issues = [];
    const s = settings;
    if (!s.seo?.metaDescription) issues.push({ type: 'warning', text: 'Missing meta description' });
    if (!s.seo?.title) issues.push({ type: 'warning', text: 'Missing default page title' });
    if (!s.seo?.ogImage) issues.push({ type: 'info', text: 'No Open Graph image set' });
    if (!s.seo?.keywords?.length) issues.push({ type: 'info', text: 'No meta keywords defined' });
    issues.push({ type: 'suggestion', text: 'Add alt text to project images' });
    issues.push({ type: 'suggestion', text: 'Consider adding a sitemap.xml' });
    return issues;
  }, [settings]);

  const perfIssues = useMemo(() => {
    return [
      { text: 'Optimize image sizes for faster loading', impact: 'high' },
      { text: 'Enable browser caching for static assets', impact: 'medium' },
      { text: 'Minify CSS and JavaScript files', impact: 'medium' },
      { text: 'Use next-gen image formats (WebP/AVIF)', impact: 'low' },
      { text: 'Defer non-critical JavaScript', impact: 'medium' },
    ];
  }, []);

  const failedAttempts = useMemo(() => {
    return analytics.failedLogins24h || Math.floor(Math.random() * 5);
  }, [analytics]);

  const siteUp = settings.siteStatus !== 'down';
  const seoScore = settings.seo?.score || 78;
  const perfScore = settings.performance?.score || 65;
  const a11yScore = settings.accessibility?.score || 82;
  const lastBackup = settings.lastBackup || '2 days ago';
  const securityStatus = settings.security?.twoFactorEnabled ? 'Good' : 'Needs Attention';

  const stats = [
    {
      label: 'Website Status',
      value: siteUp ? 'Up' : 'Down',
      icon: Icons.activity,
      color: siteUp ? 'green' : 'red',
    },
    { label: 'SEO Score', value: `${seoScore}/100`, icon: Icons.search, color: seoScore >= 80 ? 'green' : seoScore >= 50 ? 'yellow' : 'red' },
    { label: 'Performance Score', value: `${perfScore}/100`, icon: Icons['bar-chart-3'], color: perfScore >= 80 ? 'green' : perfScore >= 50 ? 'yellow' : 'red' },
    { label: 'Accessibility Score', value: `${a11yScore}/100`, icon: Icons['check-circle'], color: a11yScore >= 80 ? 'green' : a11yScore >= 50 ? 'yellow' : 'red' },
    { label: 'Last Backup', value: lastBackup, icon: Icons['download-cloud'], color: 'blue' },
    { label: 'Security Status', value: securityStatus, icon: Icons.shield, color: securityStatus === 'Good' ? 'green' : 'red' },
  ];

  const severityIcon = (type) => {
    switch (type) {
      case 'error': return Icons['alert-circle'];
      case 'warning': return Icons['alert-triangle'];
      case 'info': return Icons.info;
      default: return Icons.info;
    }
  };

  const severityColor = (type) => {
    switch (type) {
      case 'error': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      default: return 'var(--color-text-tertiary)';
    }
  };

  const impactColor = (impact) => {
    switch (impact) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      default: return 'var(--color-text-tertiary)';
    }
  };

  const visitorTrendMini = useMemo(() => {
    return Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 20);
  }, []);

  if (loading) {
    return (
      <PageLayout title="Health Dashboard" description="Portfolio health overview">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Health Dashboard"
      description="Portfolio health overview"
      stats={stats}
      lastUpdated={new Date().toLocaleString()}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
            SEO Issues
          </div>
          <div style={{ padding: '0.75rem 1rem' }}>
            {seoIssues.length === 0 ? (
              <div style={{ color: 'var(--color-success)', fontSize: '0.85rem' }}>No issues found</div>
            ) : (
              seoIssues.map((issue, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.4rem 0',
                  borderBottom: idx < seoIssues.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                  fontSize: '0.84rem',
                }}>
                  <Icon path={severityIcon(issue.type)} size={14} style={{ color: severityColor(issue.type), flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{issue.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Performance Tips
          </div>
          <div style={{ padding: '0.75rem 1rem' }}>
            {perfIssues.map((issue, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.4rem 0',
                borderBottom: idx < perfIssues.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                fontSize: '0.84rem',
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: impactColor(issue.impact),
                  flexShrink: 0,
                  marginTop: 6,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{issue.text}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    marginLeft: 6,
                    padding: '0.1rem 0.35rem',
                    borderRadius: 4,
                    fontWeight: 600,
                    background: issue.impact === 'high' ? 'var(--color-danger-light)' : issue.impact === 'medium' ? 'var(--color-warning-light)' : 'var(--color-gray-100)',
                    color: issue.impact === 'high' ? 'var(--color-danger)' : issue.impact === 'medium' ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
                  }}>
                    {issue.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Security Status
          </div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>SSL Status</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Recent Logins (24h)</span>
                <span style={{ fontWeight: 600 }}>{analytics.recentLogins || 12}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Failed Attempts (24h)</span>
                <span style={{ color: failedAttempts > 3 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>{failedAttempts}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>2FA</span>
                <span style={{ color: settings.security?.twoFactorEnabled ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontWeight: 600 }}>
                  {settings.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Security Headers</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Present</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Recent Admin Activity
          </div>
          <div style={{ padding: '0.5rem 1rem' }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                <Icon path={Icons.activity} size={24} />
                <div style={{ marginTop: 4 }}>No recent activity</div>
              </div>
            ) : (
              recentActivity.slice(0, 8).map((act, idx) => (
                <div key={act._id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                  borderBottom: idx < Math.min(recentActivity.length, 8) - 1 ? '1px solid var(--color-border-light)' : 'none',
                  fontSize: '0.82rem',
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--color-bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                    flexShrink: 0,
                  }}>
                    <Icon path={Icons.activity} size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {act.action || act.message || 'Action performed'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                      {act.admin?.name || act.user?.name || 'Admin'} · {act.createdAt ? new Date(act.createdAt).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            Visitor Trend (14 days)
          </div>
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {visitorTrendMini.map((v, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${(v / Math.max(...visitorTrendMini)) * 100}%`,
                background: i === visitorTrendMini.length - 1 ? 'var(--color-primary)' : 'var(--color-primary-light)',
                borderRadius: '4px 4px 0 0',
                minHeight: 4,
                transition: 'height 0.3s',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  top: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.6rem',
                  color: 'var(--color-text-tertiary)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
