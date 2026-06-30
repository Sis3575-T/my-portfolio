import React, { useState } from 'react';
import { Icons, Icon } from '../lib/icons';
import FilterPanel from './FilterPanel';

export default function Toolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  filterValues = {},
  onFilterChange,
  onRefresh,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onImport,
  onBulkAction,
  viewMode,
  onViewModeChange,
  onAddNew,
  extraActions,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const hasFilters = filters && filters.length > 0;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: 200,
            maxWidth: 360,
            padding: '0.45rem 0.75rem',
            border: '1.5px solid var(--color-border)',
            borderRadius: 8,
            background: 'var(--color-bg-subtle)',
            transition: 'border-color 0.2s',
          }}
        >
          <Icon path={Icons.search} size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--color-text)',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}
            >
              <Icon path={Icons.x} size={14} />
            </button>
          )}
        </div>

        {hasFilters && (
          <button
            className="btn btn-ghost"
            onClick={() => setShowFilters((v) => !v)}
            style={{
              background: showFilters ? 'var(--color-primary-subtle)' : 'transparent',
              color: showFilters ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            <Icon path={Icons.filter} size={14} />
            Filters
            {Object.values(filterValues).filter(Boolean).length > 0 && (
              <span
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {Object.values(filterValues).filter(Boolean).length}
              </span>
            )}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
          {onAddNew && (
            <button className="btn btn-primary" onClick={onAddNew}>
              <Icon path={Icons.plus} size={14} /> Add New
            </button>
          )}

          {onRefresh && (
            <button className="btn btn-ghost btn-icon" onClick={onRefresh} title="Refresh">
              <Icon path={Icons['refresh-cw']} size={14} />
            </button>
          )}

          {(onExportCSV || onExportExcel || onExportPDF) && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowExportMenu((v) => !v)}
                title="Export"
                style={{ gap: 2 }}
              >
                <Icon path={Icons.download} size={14} /> Export
              </button>
              {showExportMenu && (
                <div
                  className="dropdown-menu"
                  style={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {onExportCSV && <div className="dropdown-item" onClick={() => { onExportCSV(); setShowExportMenu(false); }}>Export as CSV</div>}
                  {onExportExcel && <div className="dropdown-item" onClick={() => { onExportExcel(); setShowExportMenu(false); }}>Export as Excel</div>}
                  {onExportPDF && <div className="dropdown-item" onClick={() => { onExportPDF(); setShowExportMenu(false); }}>Export as PDF</div>}
                </div>
              )}
            </div>
          )}

          {onImport && (
            <button className="btn btn-ghost" onClick={onImport} title="Import">
              <Icon path={Icons.upload} size={14} /> Import
            </button>
          )}

          {onViewModeChange && (
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => onViewModeChange('table')}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: viewMode === 'table' ? 'var(--color-primary-subtle)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon path={Icons.list} size={14} />
              </button>
              <button
                onClick={() => onViewModeChange('cards')}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: viewMode === 'cards' ? 'var(--color-primary-subtle)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'cards' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon path={Icons.grid} size={14} />
              </button>
            </div>
          )}

          {extraActions && extraActions.map((action, i) => (
            <button key={i} className="btn btn-ghost" onClick={action.onClick} title={action.label}>
              {action.icon && <Icon path={typeof action.icon === 'string' ? Icons[action.icon] || action.icon : action.icon} size={14} />}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <FilterPanel
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onReset={() => onFilterChange && onFilterChange('__reset__', null)}
          visible={showFilters}
        />
      )}
    </div>
  );
}
