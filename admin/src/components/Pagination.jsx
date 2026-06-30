import React from 'react';
import { Icons, Icon } from '../lib/icons';

export default function Pagination({ page = 1, totalPages = 1, total = 0, pageSize = 10, onPageChange, onPageSizeChange }) {
  if (total <= 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--color-border)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
        <span>
          Showing {from} to {to} of {total} results
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              fontSize: '0.82rem',
              color: 'var(--color-text)',
              background: 'var(--color-bg-subtle)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn btn-ghost"
            style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page <= 1 ? 0.4 : 1 }}
          >
            <Icon path={Icons['chevron-left']} size={14} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (page <= 4) {
              pageNum = i + 1;
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = page - 3 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange && onPageChange(pageNum)}
                style={{
                  width: 34,
                  height: 34,
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '0.84rem',
                  fontWeight: page === pageNum ? 700 : 500,
                  color: page === pageNum ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                  background: page === pageNum ? 'var(--color-primary)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (page !== pageNum) e.currentTarget.style.background = 'var(--color-gray-100)'; }}
                onMouseLeave={(e) => { if (page !== pageNum) e.currentTarget.style.background = 'transparent'; }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn btn-ghost"
            style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page >= totalPages ? 0.4 : 1 }}
          >
            <Icon path={Icons['chevron-right']} size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
