import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default function VisitorDetail({ visitorId, onBack }) {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visitorId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      adminApi.getVisitorById(visitorId).catch(() => ({ data: { data: null } })),
      adminApi.getVisitorEvents(visitorId).catch(() => ({ data: { data: [] } })),
    ])
      .then(([sessionRes, eventsRes]) => {
        setSession(sessionRes.data?.data || null);
        setEvents(eventsRes.data?.data || []);
        if (!sessionRes.data?.data) {
          setError('Visitor session not found');
        }
      })
      .catch(err => setError(err.message || 'Failed to load visitor details'))
      .finally(() => setLoading(false));
  }, [visitorId]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon path={Icons['chevron-left']} size={14} /> Back
        </button>
        <div className="error-state">
          <Icon path={Icons['alert-circle']} size={48} />
          <h3>Visitor Not Found</h3>
          <p>{error || 'This visitor session does not exist or has been deleted.'}</p>
        </div>
      </div>
    );
  }

  const detailItems = [
    { label: 'Session ID', value: session.sessionId },
    { label: 'Visitor ID', value: session.visitorId },
    { label: 'Started', value: formatDate(session.startedAt) },
    { label: 'Last Active', value: formatDate(session.lastActiveAt) },
    { label: 'Duration', value: formatDuration(session.duration) },
    { label: 'Country', value: session.country || '—' },
    { label: 'City', value: session.city || '—' },
    { label: 'Timezone', value: session.timezone || '—' },
    { label: 'Language', value: session.language || '—' },
    { label: 'Browser', value: session.browser ? `${session.browser} ${session.browserVersion || ''}` : '—' },
    { label: 'OS', value: session.os || '—' },
    { label: 'Device', value: session.deviceType || '—' },
    { label: 'Screen', value: session.screenResolution || '—' },
    { label: 'Viewport', value: session.viewportSize || '—' },
    { label: 'Referrer', value: session.referrer || 'Direct' },
    { label: 'Landing Page', value: session.landingPage || '/' },
    { label: 'Exit Page', value: session.exitPage || '—' },
    { label: 'Max Scroll', value: session.maxScrollDepth ? `${session.maxScrollDepth}%` : '0%' },
    { label: 'Page Views', value: session.pageViews || 0 },
    { label: 'Clicks', value: session.clicks || 0 },
    { label: 'Project Clicks', value: session.projectClicks || 0 },
    { label: 'GitHub Clicks', value: session.githubClicks || 0 },
    { label: 'Demo Clicks', value: session.liveDemoClicks || 0 },
    { label: 'Resume Downloads', value: session.resumeDownloads || 0 },
    { label: 'Contact Submissions', value: session.contactSubmissions || 0 },
    { label: 'Returning', value: session.isReturning ? 'Yes' : 'No' },
    { label: 'Active', value: session.isActive ? 'Yes' : 'No' },
  ];

  const eventTypeColors = {
    page_view: 'var(--color-primary)',
    page_exit: 'var(--color-danger)',
    click: 'var(--color-warning)',
    project_click: 'var(--color-purple)',
    github_click: 'var(--color-gray)',
    live_demo_click: 'var(--color-success)',
    resume_download: 'var(--color-info)',
    contact_submit: 'var(--color-success)',
    scroll_depth: 'var(--color-teal)',
    theme_change: 'var(--color-pink)',
    language_change: 'var(--color-orange)',
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={onBack} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
        <Icon path={Icons['chevron-left']} size={14} /> Back to Analytics
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
          <Icon path={Icons.users} size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Visitor Details</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
            Session {session.sessionId?.slice(0, 16)}...
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Session Details */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem' }}>Session Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {detailItems.map((item, i) => (
              <div key={i} style={{ padding: '0.5rem', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', wordBreak: 'break-all' }}>{String(item.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Timeline */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem' }}>
            Event Timeline ({events.length} events)
          </h3>
          {events.length === 0 ? (
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No events recorded</p>
          ) : (
            <div style={{ maxHeight: 500, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {events.map((evt, i) => (
                <div key={evt._id || i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                    background: eventTypeColors[evt.eventType] || 'var(--color-text-tertiary)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {evt.eventType?.replace(/_/g, ' ')}
                      </span>
                      {evt.element && (
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                          {evt.element}
                        </span>
                      )}
                    </div>
                    {evt.url && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.url}</div>}
                    {evt.value && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>Value: {evt.value}</div>}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {formatDate(evt.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pages Visited */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem' }}>Pages Visited ({session.pages?.length || 0})</h3>
          {(!session.pages || session.pages.length === 0) ? (
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No pages recorded</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {session.pages.map((page, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {page.url || '/'}
                    </div>
                    {page.title && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{page.title}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{formatDuration(page.duration)}</div>
                    {page.scrollDepth > 0 && <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>{page.scrollDepth}%</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem' }}>Activity Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Page Views', value: session.pageViews || 0, color: 'var(--color-primary)' },
              { label: 'Total Clicks', value: session.clicks || 0, color: 'var(--color-warning)' },
              { label: 'Project Clicks', value: session.projectClicks || 0, color: 'var(--color-purple)' },
              { label: 'GitHub Clicks', value: session.githubClicks || 0, color: 'var(--color-gray)' },
              { label: 'Demo Clicks', value: session.liveDemoClicks || 0, color: 'var(--color-success)' },
              { label: 'Resume Downloads', value: session.resumeDownloads || 0, color: 'var(--color-info)' },
              { label: 'Contact Submissions', value: session.contactSubmissions || 0, color: 'var(--color-success)' },
              { label: 'Max Scroll', value: session.maxScrollDepth ? `${session.maxScrollDepth}%` : '0%', color: 'var(--color-teal)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', marginTop: '0.15rem' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
