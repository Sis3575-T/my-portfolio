import React, { useState, useMemo } from 'react';
import { Icons, Icon } from '../lib/icons';

export default function DataTable({
  columns,
  data,
  selected: externalSelected,
  onSelect,
  onSelectAll: externalOnSelectAll,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
  onSort: externalOnSort,
  onRowClick,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onReorder,
  onBulkAction,
  searchable = true,
  searchPlaceholder = 'Search...',
  actions = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = Icons['file-text'],
}) {
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortDir, setInternalSortDir] = useState('asc');
  const [internalPage, setInternalPage] = useState(1);
  const [internalSelected, setInternalSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

  const isControlled = externalSelected !== undefined;
  const selected = isControlled ? externalSelected : internalSelected;
  const sortKey = externalSortBy !== undefined ? externalSortBy : internalSortKey;
  const sortDir = externalSortOrder !== undefined ? externalSortOrder : internalSortDir;

  const filtered = useMemo(() => {
    if (!internalSearch) return data || [];
    const q = internalSearch.toLowerCase();
    return (data || []).filter(row =>
      columns.some(col => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, internalSearch, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((internalPage - 1) * pageSize, internalPage * pageSize);

  const handleSort = (key) => {
    if (externalOnSort) {
      const newOrder = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      externalOnSort(key, newOrder);
    } else {
      if (internalSortKey === key) {
        setInternalSortDir(d => d === 'asc' ? 'desc' : 'asc');
      } else {
        setInternalSortKey(key);
        setInternalSortDir('asc');
      }
    }
  };

  const toggleSelect = (id) => {
    if (onSelect) {
      onSelect(id);
    } else {
      setInternalSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  const toggleSelectAll = () => {
    if (externalOnSelectAll) {
      externalOnSelectAll(selected.length === paged.length ? [] : paged.map(r => r._id));
    } else if (onSelect) {
      onSelect(selected.length === paged.length ? [] : paged.map(r => r._id));
    } else {
      if (internalSelected.length === paged.length) {
        setInternalSelected([]);
      } else {
        setInternalSelected(paged.map(r => r._id));
      }
    }
  };

  const handleBulkAction = (action) => {
    if (onBulkAction && selected.length > 0) {
      onBulkAction(action, selected);
    }
  };

  const handleContextMenu = (e, row) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownItems = [];
    if (onEdit) dropdownItems.push({ label: 'Edit', icon: Icons.edit, onClick: () => onEdit(row) });
    if (onDuplicate) dropdownItems.push({ label: 'Duplicate', icon: Icons.copy, onClick: () => onDuplicate(row) });
    if (onToggle) dropdownItems.push({ label: row.isActive ? 'Hide' : 'Show', icon: row.isActive ? Icons['eye-off'] : Icons.eye, onClick: () => onToggle(row) });
    if (onDelete) dropdownItems.push({ label: 'Delete', icon: Icons.trash2, onClick: () => onDelete(row), danger: true });
    if (dropdownItems.length > 0) {
      setContextMenu({ x: e.clientX, y: e.clientY, items: dropdownItems });
    }
  };

  const actionArray = Array.isArray(actions) ? actions : [];
  const showActions = Array.isArray(actions) ? actionArray.length > 0 : !!actions;

  const commonRowEvents = (row) => ({
    onClick: onRowClick ? () => onRowClick(row) : undefined,
    onContextMenu: (e) => handleContextMenu(e, row),
    style: { cursor: onRowClick ? 'pointer' : undefined },
  });

  if (loading) {
    return (
      <div className="table-container" style={{ position: 'relative', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
        <div className="table-toolbar" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ width: 240, height: 36, borderRadius: 8, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 8, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </div>
        <div style={{ padding: '20px 24px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{
                width: '100%',
                height: 48,
                marginBottom: 8,
                borderRadius: 6,
                background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="table-container"
      style={{
        position: 'relative',
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
      onClick={() => contextMenu && setContextMenu(null)}
    >
      <div className="table-toolbar" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div className="table-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {searchable && (
            <div className="table-search" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
              <Icon path={Icons.search} size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={internalSearch}
                onChange={(e) => { setInternalSearch(e.target.value); setInternalPage(1); }}
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--color-text)', fontFamily: 'inherit', width: 200 }}
              />
            </div>
          )}
          {selected.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {selected.length} selected
            </span>
          )}
        </div>
        <div className="table-toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {selected.length > 0 && onBulkAction && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => handleBulkAction('delete')} style={{ color: 'var(--color-danger)' }}>
                <Icon path={Icons.trash2} size={14} /> Delete
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleBulkAction('toggle')}>
                <Icon path={Icons['toggle-right']} size={14} /> Toggle
              </button>
            </>
          )}
          <span className="pagination-info" style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            {sorted.length} total
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              {onBulkAction && (
                <th style={{ width: 40, padding: '0.75rem 1rem', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={selected.length === paged.length && paged.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    width: col.width,
                    textAlign: col.align || 'left',
                    padding: '0.75rem 1rem',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--color-border)',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {sortKey === col.key && (
                      <Icon path={sortDir === 'asc' ? Icons['chevron-up'] : Icons['chevron-down']} size={12} style={{ flexShrink: 0 }} />
                    )}
                  </span>
                </th>
              ))}
              {showActions && (
                <th style={{ width: 100, padding: '0.75rem 1rem', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0) + (onBulkAction ? 1 : 0)} style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                  <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-tertiary)' }}>
                    <Icon path={emptyIcon} size={40} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>{emptyMessage}</h3>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  {...commonRowEvents(row)}
                  style={{
                    transition: 'background 0.15s',
                    cursor: onRowClick ? 'pointer' : undefined,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  {onBulkAction && (
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(row._id)}
                        onChange={() => toggleSelect(row._id)}
                        style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        textAlign: col.align || 'left',
                        width: col.width,
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--color-border-light)',
                        color: 'var(--color-text)',
                        verticalAlign: 'middle',
                        ...(col.style || {}),
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div className="table-actions" style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {actionArray.length > 0 ? (
                          actionArray.map((action, i) => (
                            <button
                              key={i}
                              className={`btn-${action.variant || 'ghost'}`}
                              onClick={() => action.onClick(row)}
                              data-tooltip={action.label}
                              style={{
                                width: 32,
                                height: 32,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                color: action.variant === 'danger' ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                                background: 'transparent',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-gray-100)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Icon path={typeof action.icon === 'string' ? Icons[action.icon] || action.icon : action.icon} size={14} />
                            </button>
                          ))
                        ) : (
                          <>
                            {onEdit && (
                              <button className="btn-edit" onClick={() => onEdit(row)} data-tooltip="Edit" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }}>
                                <Icon path={Icons.edit} size={14} />
                              </button>
                            )}
                            {onDuplicate && (
                              <button className="btn-duplicate" onClick={() => onDuplicate(row)} data-tooltip="Duplicate" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }}>
                                <Icon path={Icons.copy} size={14} />
                              </button>
                            )}
                            {onToggle && (
                              <button className="btn-view" onClick={() => onToggle(row)} data-tooltip={row.isActive ? 'Hide' : 'Show'} style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }}>
                                <Icon path={row.isActive ? Icons['eye-off'] : Icons.eye} size={14} />
                              </button>
                            )}
                            {onDelete && (
                              <button className="btn-delete" onClick={() => onDelete(row)} data-tooltip="Delete" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', transition: 'background 0.15s' }}>
                                <Icon path={Icons.trash2} size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="pagination-info" style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
            Showing {(internalPage - 1) * pageSize + 1} to {Math.min(internalPage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="pagination-buttons" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={() => setInternalPage(p => Math.max(1, p - 1))}
              disabled={internalPage === 1}
              className="btn btn-ghost"
              style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: internalPage === 1 ? 0.4 : 1, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)' }}
            >
              <Icon path={Icons['chevron-left']} size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (internalPage <= 4) {
                pageNum = i + 1;
              } else if (internalPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = internalPage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setInternalPage(pageNum)}
                  style={{
                    width: 34,
                    height: 34,
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '0.84rem',
                    fontWeight: internalPage === pageNum ? 700 : 500,
                    color: internalPage === pageNum ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                    background: internalPage === pageNum ? 'var(--color-primary)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (internalPage !== pageNum) e.currentTarget.style.background = 'var(--color-gray-100)'; }}
                  onMouseLeave={(e) => { if (internalPage !== pageNum) e.currentTarget.style.background = 'transparent'; }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setInternalPage(p => Math.min(totalPages, p + 1))}
              disabled={internalPage === totalPages}
              className="btn btn-ghost"
              style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: internalPage === totalPages ? 0.4 : 1, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)' }}
            >
              <Icon path={Icons['chevron-right']} size={14} />
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            minWidth: 160,
            padding: '0.35rem',
            animation: 'fadeIn 0.1s ease',
          }}
        >
          {contextMenu.items.map((item, i) => (
            <div
              key={i}
              className="dropdown-item"
              onClick={() => { item.onClick(); setContextMenu(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.75rem',
                borderRadius: 6,
                fontSize: '0.84rem',
                color: item.danger ? 'var(--color-danger)' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-gray-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
            >
              {item.icon && <Icon path={item.icon} size={14} />}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
