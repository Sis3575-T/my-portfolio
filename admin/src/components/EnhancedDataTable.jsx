import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Icons, Icon } from '../lib/icons';

const SAVED_VIEWS_KEY = 'et_saved_views';

function loadSavedViews() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY) || '[]');
  } catch { return []; }
}

function saveViews(views) {
  localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
}

export default function EnhancedDataTable({
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
  onAddNew,
  searchable = true,
  searchPlaceholder = 'Search...',
  actions = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = Icons['file-text'],
  resizableColumns = false,
  columnVisibility = false,
  savedViews = false,
  inlineEdit = false,
  contextMenu = false,
  treeMode = false,
  treeKey = 'children',
  treeIndent = 24,
  stickyHeader = true,
}) {
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortDir, setInternalSortDir] = useState('asc');
  const [internalPage, setInternalPage] = useState(1);
  const [internalSelected, setInternalSelected] = useState([]);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [visibleCols, setVisibleCols] = useState(() => columns.map(c => c.key));
  const [colVisOpen, setColVisOpen] = useState(false);
  const [colDropdown, setColDropdown] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [resizing, setResizing] = useState(null);
  const [colWidths, setColWidths] = useState(() => {
    const w = {};
    columns.forEach(c => { if (c.width) w[c.key] = c.width; });
    return w;
  });
  const [viewPresets, setViewPresets] = useState(loadSavedViews);
  const [activeView, setActiveView] = useState(null);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [treeExpanded, setTreeExpanded] = useState({});
  const [savingView, setSavingView] = useState(false);

  const tableRef = useRef(null);

  const isControlled = externalSelected !== undefined;
  const selected = isControlled ? externalSelected : internalSelected;
  const sortKey = externalSortBy !== undefined ? externalSortBy : internalSortKey;
  const sortDir = externalSortOrder !== undefined ? externalSortOrder : internalSortDir;

  useEffect(() => {
    setVisibleCols(columns.map(c => c.key));
  }, [columns]);

  useEffect(() => {
    const handleClick = () => { setCtxMenu(null); setColDropdown(null); setColVisOpen(false); setViewsOpen(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e) => {
      if (!resizing) return;
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(40, resizing.startWidth + diff);
      setColWidths(prev => ({ ...prev, [resizing.key]: newWidth }));
    };
    const handleMouseUp = () => setResizing(null);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [resizing]);

  const flattenTree = useCallback((items, depth = 0) => {
    let result = [];
    (items || []).forEach(item => {
      result.push({ ...item, _depth: depth, _hasChildren: item[treeKey] && item[treeKey].length > 0 });
      if (treeMode && item[treeKey] && treeExpanded[item._id || item.id]) {
        result = result.concat(flattenTree(item[treeKey], depth + 1));
      }
    });
    return result;
  }, [treeMode, treeKey, treeExpanded]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (treeMode) items = flattenTree(items);
    if (!internalSearch) return items;
    const q = internalSearch.toLowerCase();
    return items.filter(row =>
      columns.some(col => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, internalSearch, columns, treeMode, flattenTree]);

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
    if (onSelect) { onSelect(id); }
    else { setInternalSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  };

  const toggleSelectAll = () => {
    if (externalOnSelectAll) { externalOnSelectAll(selected.length === paged.length ? [] : paged.map(r => r._id)); }
    else if (onSelect) { onSelect(selected.length === paged.length ? [] : paged.map(r => r._id)); }
    else {
      if (internalSelected.length === paged.length) { setInternalSelected([]); }
      else { setInternalSelected(paged.map(r => r._id)); }
    }
  };

  const handleBulkAction = (action) => {
    if (onBulkAction && selected.length > 0) onBulkAction(action, selected);
  };

  const handleContextMenu = (e, row) => {
    e.preventDefault();
    e.stopPropagation();
    const items = [];
    if (onEdit) items.push({ label: 'Edit', icon: Icons.edit, onClick: () => onEdit(row) });
    if (onDuplicate) items.push({ label: 'Duplicate', icon: Icons.copy, onClick: () => onDuplicate(row) });
    if (onReorder) {
      items.push({ label: 'Move Up', icon: Icons['chevron-up'], onClick: () => onReorder(row, 'up') });
      items.push({ label: 'Move Down', icon: Icons['chevron-down'], onClick: () => onReorder(row, 'down') });
    }
    if (onToggle) items.push({ label: row.isActive ? 'Hide' : 'Show', icon: row.isActive ? Icons['eye-off'] : Icons.eye, onClick: () => onToggle(row) });
    items.push({ label: 'Copy ID', icon: Icons.copy, onClick: () => navigator.clipboard?.writeText(row._id || row.id || '') });
    if (onDelete) items.push({ label: 'Delete', icon: Icons.trash2, onClick: () => onDelete(row), danger: true });
    if (items.length > 0) setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  const startResize = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startWidth = colWidths[key] || 100;
    setResizing({ key, startX: e.clientX, startWidth: typeof startWidth === 'number' ? startWidth : 100 });
  };

  const startEdit = (row, col) => {
    if (!inlineEdit || col.inlineEdit === false) return;
    setEditingCell({ id: row._id || row.id, key: col.key });
    setEditValue(row[col.key] ?? '');
  };

  const commitEdit = () => {
    if (!editingCell || !onEdit) return;
    const row = (data || []).find(r => (r._id || r.id) === editingCell.id);
    if (row) onEdit({ ...row, [editingCell.key]: editValue });
    setEditingCell(null);
    setEditValue('');
  };

  const applyView = (view) => {
    setActiveView(view.id);
    const cols = view.columns || columns.map(c => c.key);
    setVisibleCols(cols);
    setColVisOpen(false);
  };

  const deleteView = (viewId) => {
    const updated = viewPresets.filter(v => v.id !== viewId);
    setViewPresets(updated);
    saveViews(updated);
    if (activeView === viewId) { setActiveView(null); setVisibleCols(columns.map(c => c.key)); }
  };

  const saveCurrentView = () => {
    const name = prompt('View name:');
    if (!name) return;
    const view = { id: Date.now().toString(), name, columns: visibleCols };
    const updated = [...viewPresets, view];
    setViewPresets(updated);
    saveViews(updated);
    setActiveView(view.id);
  };

  const toggleTreeExpand = (id) => {
    setTreeExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const displayColumns = columns.filter(c => visibleCols.includes(c.key));

  const getCellValue = (row, col) => {
    if (col.render) return col.render(row);
    return row[col.key];
  };

  const actionArray = Array.isArray(actions) ? actions : [];
  const showActions = Array.isArray(actions) ? actionArray.length > 0 : !!actions;

  if (loading) {
    return (
      <div className="et-container">
        <div className="et-toolbar">
          <div className="et-skeleton-row" style={{ width: 240, height: 36 }} />
          <div className="et-skeleton-row" style={{ width: 120, height: 36 }} />
        </div>
        <div style={{ padding: '20px 24px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="et-skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="et-container" ref={tableRef} style={{ position: 'relative' }}>
      <div className="et-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {searchable && (
            <div className="et-search-wrap">
              <Icon path={Icons.search} size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                className="et-search-input"
                type="text"
                placeholder={searchPlaceholder}
                value={internalSearch}
                onChange={(e) => { setInternalSearch(e.target.value); setInternalPage(1); }}
              />
              {internalSearch && (
                <button onClick={() => { setInternalSearch(''); setInternalPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}>
                  <Icon path={Icons.x} size={14} />
                </button>
              )}
            </div>
          )}
          {selected.length > 0 && (
            <span className="et-selected-count">{selected.length} selected</span>
          )}
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{sorted.length} total</span>
        </div>

        <div className="et-toolbar-right">
          {selected.length > 0 && onBulkAction && (
            <>
              <button className="et-col-vis-btn" onClick={() => handleBulkAction('delete')} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                <Icon path={Icons.trash2} size={14} /> Delete
              </button>
              <button className="et-col-vis-btn" onClick={() => handleBulkAction('toggle')}>
                <Icon path={Icons['toggle-right']} size={14} /> Toggle
              </button>
            </>
          )}

          {onAddNew && (
            <button className="et-col-vis-btn" onClick={onAddNew} style={{ background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}>
              <Icon path={Icons.plus} size={14} /> Add New
            </button>
          )}

          {(columnVisibility || savedViews) && (
            <div style={{ position: 'relative' }}>
              <button className="et-col-vis-btn" onClick={(e) => { e.stopPropagation(); setColVisOpen(!colVisOpen); }}>
                <Icon path={Icons.settings} size={14} /> View Settings
              </button>
              {colVisOpen && (
                <div className="et-col-vis-dropdown" onClick={(e) => e.stopPropagation()}>
                  {columnVisibility && columns.map(col => (
                    <label key={col.key} className="et-col-vis-item">
                      <input
                        type="checkbox"
                        checked={visibleCols.includes(col.key)}
                        onChange={() => {
                          setVisibleCols(prev =>
                            prev.includes(col.key) ? prev.filter(k => k !== col.key) : [...prev, col.key]
                          );
                        }}
                      />
                      {col.label}
                    </label>
                  ))}
                  {savedViews && (
                    <>
                      <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.35rem 0' }} />
                      <div className="et-col-vis-item" onClick={saveCurrentView}>
                        <Icon path={Icons.save} size={14} />
                        Save current view
                      </div>
                      {viewPresets.length > 0 && viewPresets.map(v => (
                        <div key={v.id} className="et-col-vis-item" style={{ justifyContent: 'space-between' }}>
                          <span onClick={() => { applyView(v); setColVisOpen(false); }} style={{ flex: 1, cursor: 'pointer' }}>{v.name}</span>
                          <span className="et-views-delete" onClick={() => deleteView(v.id)}>
                            <Icon path={Icons.x} size={12} />
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="et-table-wrap">
        <table className={`et-table${stickyHeader ? ' et-sticky-header' : ''}`} style={{ width: '100%' }}>
          <thead>
            <tr>
              {onBulkAction && (
                <th style={{ width: 40, padding: '0.65rem 0.85rem', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    className="et-checkbox"
                    checked={selected.length === paged.length && paged.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              {displayColumns.map(col => (
                <th
                  key={col.key}
                  style={{
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    width: colWidths[col.key] || col.width,
                    textAlign: col.align || 'left',
                    position: 'relative',
                    padding: '0.65rem 0.85rem',
                  }}
                >
                  <span className="et-th-content" onClick={() => col.sortable !== false && handleSort(col.key)}>
                    {col.label}
                    {sortKey === col.key && (
                      <Icon path={sortDir === 'asc' ? Icons['chevron-up'] : Icons['chevron-down']} size={12} style={{ flexShrink: 0 }} />
                    )}
                  </span>
                  {colDropdown === col.key && (
                    <div className="et-col-dropdown" onClick={(e) => e.stopPropagation()}>
                      <div className="et-col-dropdown-item" onClick={() => { handleSort(col.key); setColDropdown(null); }}>
                        <Icon path={Icons['arrow-up']} size={12} /> Sort Asc
                      </div>
                      <div className="et-col-dropdown-item" onClick={() => { handleSort(col.key); setColDropdown(null); }}>
                        <Icon path={Icons['arrow-down']} size={12} /> Sort Desc
                      </div>
                      {columnVisibility && (
                        <div className="et-col-dropdown-item" onClick={() => { setVisibleCols(prev => prev.filter(k => k !== col.key)); setColDropdown(null); }}>
                          <Icon path={Icons['eye-off']} size={12} /> Hide
                        </div>
                      )}
                    </div>
                  )}
                  {resizableColumns && (
                    <div
                      className={`et-resize-handle${resizing?.key === col.key ? ' resizing' : ''}`}
                      onMouseDown={(e) => startResize(col.key, e)}
                    />
                  )}
                </th>
              ))}
              {showActions && (
                <th style={{ width: 80, padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length + (showActions ? 1 : 0) + (onBulkAction ? 1 : 0)}>
                  <div className="et-empty-state">
                    <Icon path={emptyIcon} size={40} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>{emptyMessage}</h3>
                    {onAddNew && (
                      <button className="et-col-vis-btn" onClick={onAddNew}>
                        <Icon path={Icons.plus} size={14} /> Add New
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => {
                const rowId = row._id || row.id || idx;
                const isSelected = selected.includes(rowId);
                const depth = row._depth || 0;
                const hasChildren = row._hasChildren;
                return (
                  <tr
                    key={rowId}
                    className={`et-row${isSelected ? ' selected' : ''}`}
                    onClick={() => { if (onRowClick) onRowClick(row); }}
                    onContextMenu={(e) => contextMenu && handleContextMenu(e, row)}
                    style={{ cursor: onRowClick ? 'pointer' : undefined }}
                  >
                    {onBulkAction && (
                      <td style={{ padding: '0.75rem 0.85rem', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          className="et-checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(rowId)}
                        />
                      </td>
                    )}
                    {displayColumns.map(col => {
                      const isEditing = inlineEdit && editingCell?.id === rowId && editingCell?.key === col.key;
                      return (
                        <td
                          key={col.key}
                          onClick={() => startEdit(row, col)}
                          style={{
                            textAlign: col.align || 'left',
                            width: colWidths[col.key] || col.width,
                            padding: '0.75rem 0.85rem',
                            verticalAlign: 'middle',
                            ...(col.style || {}),
                          }}
                        >
                          {col.key === displayColumns[0]?.key && treeMode && (
                            <span className="et-tree-row" style={{ paddingLeft: depth * treeIndent }}>
                              {hasChildren ? (
                                <button className="et-tree-toggle" onClick={(e) => { e.stopPropagation(); toggleTreeExpand(rowId); }}>
                                  <Icon path={treeExpanded[rowId] ? Icons['chevron-down'] : Icons['chevron-right']} size={12} />
                                </button>
                              ) : (
                                <span className="et-tree-leaf" />
                              )}
                              {isEditing ? (
                                <input
                                  className="et-inline-input"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : getCellValue(row, col)}
                            </span>
                          ) : isEditing ? (
                            <input
                              className="et-inline-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : getCellValue(row, col)}
                        </td>
                      );
                    })}
                    {showActions && (
                      <td style={{ padding: '0.75rem 0.85rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          {actionArray.length > 0 ? (
                            actionArray.map((action, i) => (
                              <button
                                key={i}
                                onClick={() => action.onClick(row)}
                                data-tooltip={action.label}
                                style={{
                                  width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  border: 'none', borderRadius: 6, cursor: 'pointer',
                                  color: action.variant === 'danger' ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                                  background: 'transparent', transition: 'background 0.15s',
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
                                <button onClick={() => onEdit(row)} data-tooltip="Edit" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent' }}>
                                  <Icon path={Icons.edit} size={14} />
                                </button>
                              )}
                              {onDuplicate && (
                                <button onClick={() => onDuplicate(row)} data-tooltip="Duplicate" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent' }}>
                                  <Icon path={Icons.copy} size={14} />
                                </button>
                              )}
                              {onToggle && (
                                <button onClick={() => onToggle(row)} data-tooltip={row.isActive ? 'Hide' : 'Show'} style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent' }}>
                                  <Icon path={row.isActive ? Icons['eye-off'] : Icons.eye} size={14} />
                                </button>
                              )}
                              {onDelete && (
                                <button onClick={() => onDelete(row)} data-tooltip="Delete" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent' }}>
                                  <Icon path={Icons.trash2} size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="et-pagination">
          <span style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
            Showing {(internalPage - 1) * pageSize + 1} to {Math.min(internalPage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={() => setInternalPage(p => Math.max(1, p - 1))}
              disabled={internalPage === 1}
              style={{
                width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: internalPage === 1 ? 0.4 : 1, border: 'none', borderRadius: 6, cursor: 'pointer',
                background: 'transparent', color: 'var(--color-text-secondary)',
              }}
            >
              <Icon path={Icons['chevron-left']} size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) pageNum = i + 1;
              else if (internalPage <= 4) pageNum = i + 1;
              else if (internalPage >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = internalPage - 3 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setInternalPage(pageNum)}
                  style={{
                    width: 34, height: 34, border: 'none', borderRadius: 6,
                    fontSize: '0.84rem',
                    fontWeight: internalPage === pageNum ? 700 : 500,
                    color: internalPage === pageNum ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                    background: internalPage === pageNum ? 'var(--color-primary)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setInternalPage(p => Math.min(totalPages, p + 1))}
              disabled={internalPage === totalPages}
              style={{
                width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: internalPage === totalPages ? 0.4 : 1, border: 'none', borderRadius: 6, cursor: 'pointer',
                background: 'transparent', color: 'var(--color-text-secondary)',
              }}
            >
              <Icon path={Icons['chevron-right']} size={14} />
            </button>
          </div>
        </div>
      )}

      {ctxMenu && (
        <div className="et-context-menu" style={{ top: ctxMenu.y, left: ctxMenu.x }} onClick={() => setCtxMenu(null)}>
          {ctxMenu.items.map((item, i) => (
            <div
              key={i}
              className={`et-context-item${item.danger ? ' danger' : ''}`}
              onClick={() => { item.onClick(); setCtxMenu(null); }}
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
