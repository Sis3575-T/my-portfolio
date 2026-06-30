import React from 'react';

function LoadingSkeleton({ variant = 'card', count = 1 }) {
  if (variant === 'text') {
    return (
      <div className="skeleton-text">
        <div className="skeleton-line skeleton-pulse" style={{ width: '100%' }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '85%' }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '60%' }} />
      </div>
    );
  }

  if (variant === 'image') {
    return <div className="skeleton-image skeleton-pulse" />;
  }

  if (variant === 'avatar') {
    return <div className="skeleton-avatar skeleton-pulse" />;
  }

  if (variant === 'chart') {
    return (
      <div className="skeleton-chart">
        <div className="skeleton-chart-bar skeleton-pulse" style={{ height: '60%' }} />
        <div className="skeleton-chart-bar skeleton-pulse" style={{ height: '80%' }} />
        <div className="skeleton-chart-bar skeleton-pulse" style={{ height: '45%' }} />
        <div className="skeleton-chart-bar skeleton-pulse" style={{ height: '70%' }} />
        <div className="skeleton-chart-bar skeleton-pulse" style={{ height: '55%' }} />
      </div>
    );
  }

  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card-image skeleton-pulse" />
          <div className="skeleton-card-body">
            <div className="skeleton-line skeleton-pulse" style={{ width: '80%' }} />
            <div className="skeleton-line skeleton-pulse" style={{ width: '60%' }} />
            <div className="skeleton-line skeleton-pulse" style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
