import React from 'react';
import { Icon } from '../lib/icons';

const iconColors = {
  blue: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  green: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  yellow: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  red: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' },
  purple: { bg: '#F5F3FF', color: '#7C3AED' },
  gray: { bg: 'var(--color-gray-100)', color: 'var(--color-gray-600)' },
};

export default function StatCard({ icon, label, value, change, color = 'blue', onClick, miniChart }) {
  const palette = iconColors[color] || iconColors.blue;
  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');

  return (
    <div
      className="stat-card"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="stat-card-icon" style={{ background: palette.bg, color: palette.color }}>
          <Icon path={icon} size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="stat-card-l">{label}</div>
          <div className="stat-card-n">{value ?? '—'}</div>
        </div>
        {change != null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-danger)' : 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {isPositive ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
            ) : isNegative ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
            ) : null}
            {change}
          </div>
        )}
      </div>
      {miniChart && miniChart.length > 1 && (
        <div style={{ marginTop: 12, height: 32 }}>
          <svg width="100%" height="32" viewBox={`0 0 ${miniChart.length - 1} 32`} preserveAspectRatio="none">
            <polyline
              points={miniChart.map((v, i) => `${i},${32 - (v / Math.max(...miniChart)) * 28}`).join(' ')}
              fill="none"
              stroke={palette.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
