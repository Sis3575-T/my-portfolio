import React from 'react';
import { Icons, Icon } from '../lib/icons';
import StatCard from './StatCard';

export default function PageLayout({
  breadcrumbs,
  title,
  description,
  lastUpdated,
  quickActions,
  stats,
  children,
}) {
  return (
    <div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <Icon path={Icons['chevron-right']} size={12} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                )}
                {isLast ? (
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{crumb.label}</span>
                ) : (
                  <span
                    onClick={crumb.onClick}
                    style={{
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                    {...(crumb.href ? { as: 'a', href: crumb.href } : {})}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem', margin: 0 }}>
              {description}
            </p>
          )}
          {lastUpdated && (
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-tertiary)', marginTop: '0.3rem', margin: 0 }}>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        {quickActions && quickActions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                className={action.primary ? 'btn btn-primary' : `btn btn-ghost${action.variant ? ` btn-${action.variant}` : ''}`}
                onClick={action.onClick}
              >
                {action.icon && (
                  <Icon path={typeof action.icon === 'string' ? Icons[action.icon] || action.icon : action.icon} size={14} />
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="admin-stats" style={{ marginBottom: '1.5rem' }}>
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              icon={typeof stat.icon === 'string' ? Icons[stat.icon] || stat.icon : stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              color={stat.color}
              onClick={stat.onClick}
              miniChart={stat.miniChart}
            />
          ))}
        </div>
      )}

      <div style={{ animation: 'slideUp 0.25s ease' }}>
        {children}
      </div>
    </div>
  );
}
