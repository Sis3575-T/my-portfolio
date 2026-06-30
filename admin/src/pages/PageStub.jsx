import React from 'react';

function PageStub({ title, description }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary, #6366f1)', opacity: 0.4 }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6" />
          <path d="M9 15h6" />
        </svg>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
        {description || 'This page is under development and will be available soon.'}
      </p>
      <span style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #d97706)', border: '1px solid var(--color-warning-subtle, #fde68a)' }}>
        Coming Soon
      </span>
    </div>
  );
}

export default PageStub;
