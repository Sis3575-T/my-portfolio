import React from 'react';

function EmptyState({ message = 'No data available', icon }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        )}
      </div>
      <p className="empty-state-message">{message}</p>
    </div>
  );
}

export default EmptyState;
