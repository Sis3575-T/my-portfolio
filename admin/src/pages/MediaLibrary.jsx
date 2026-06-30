import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';

const FILE_TYPES = ['image', 'video', 'document'];

export default function MediaLibrary() {
  const toast = useToast();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ type: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mediaRes, statsRes] = await Promise.all([
        adminApi.getMedia({ limit: 200 }),
        adminApi.getMediaStats(),
      ]);
      setMedia(mediaRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = media.filter(item => {
    const q = searchVal.toLowerCase();
    if (q && !item.originalName?.toLowerCase().includes(q) && !item.name?.toLowerCase().includes(q)) return false;
    if (filterVal.type === 'images' && !item.mimeType?.startsWith('image/')) return false;
    if (filterVal.type === 'videos' && !item.mimeType?.startsWith('video/')) return false;
    if (filterVal.type === 'documents' && (item.mimeType?.startsWith('image/') || item.mimeType?.startsWith('video/'))) return false;
    return true;
  });

  const totalImages = media.filter(m => m.mimeType?.startsWith('image/')).length;
  const totalVideos = media.filter(m => m.mimeType?.startsWith('video/')).length;
  const totalDocs = media.filter(m => !m.mimeType?.startsWith('image/') && !m.mimeType?.startsWith('video/')).length;
  const totalSize = media.reduce((acc, m) => acc + (m.size || 0), 0);

  const statItems = [
    { label: 'Total Files', value: media.length, icon: Icons.file, color: 'blue' },
    { label: 'Images', value: totalImages, icon: Icons.image, color: 'green' },
    { label: 'Videos', value: totalVideos, icon: Icons['smartphone'], color: 'purple' },
    { label: 'Documents', value: totalDocs, icon: Icons['file-text'], color: 'yellow' },
    { label: 'Total Size', value: totalSize ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB` : '0 B', icon: Icons.database, color: 'gray' },
  ];

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeIcon = (mime) => {
    if (!mime) return Icons.file;
    if (mime.startsWith('image/')) return Icons.image;
    if (mime.startsWith('video/')) return Icons['smartphone'];
    return Icons['file-text'];
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadFiles(files);
      setShowUploadModal(true);
    }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setUploadFiles(files);
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    let uploaded = 0;
    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', uploadFiles[i]);
        if (uploadFiles[i].type.startsWith('image/')) formData.append('category', 'image');
        else if (uploadFiles[i].type.startsWith('video/')) formData.append('category', 'video');
        else formData.append('category', 'document');
        await adminApi.uploadMedia(formData);
        uploaded++;
        setUploadProgress(Math.round((uploaded / uploadFiles.length) * 100));
      }
      toast.success(`${uploaded} file(s) uploaded`);
      setShowUploadModal(false);
      setUploadFiles([]);
      await fetchData();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteMedia(deleteTarget._id);
      toast.success('File deleted');
      setMedia(prev => prev.filter(m => m._id !== deleteTarget._id));
      if (previewItem?._id === deleteTarget._id) { setShowPreviewModal(false); setPreviewItem(null); }
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await adminApi.updateMedia(renameTarget._id, { name: renameValue });
      toast.success('File renamed');
      setMedia(prev => prev.map(m => m._id === renameTarget._id ? { ...m, name: renameValue, originalName: renameValue } : m));
      if (previewItem?._id === renameTarget._id) setPreviewItem({ ...previewItem, name: renameValue, originalName: renameValue });
      setRenameTarget(null);
      setRenameValue('');
    } catch {
      toast.error('Failed to rename');
    }
  };

  const handleBulkAction = async (action) => {
    if (bulkSelected.length === 0) return;
    try {
      for (const id of bulkSelected) {
        if (action === 'delete') await adminApi.deleteMedia(id);
      }
      toast.success(`${bulkSelected.length} files ${action === 'delete' ? 'deleted' : 'processed'}`);
      await fetchData();
      setBulkSelected([]);
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const openPreview = (item) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  const statSize = { label: 'Total Size', value: totalSize ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB` : '0 B', icon: Icons.database, color: 'gray' };

  return (
    <PageLayout
      title="Media Library"
      description="Manage your uploaded files"
      stats={statItems}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search files..."
        filters={[
          { key: 'type', label: 'Type', type: 'select', options: ['', 'images', 'videos', 'documents'], labels: { '': 'All', images: 'Images', videos: 'Videos', documents: 'Documents' } },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterVal({ type: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onRefresh={fetchData}
        onAddNew={() => { fileInputRef.current?.click(); }}
        extraActions={[
          { label: 'Delete Selected', icon: Icons.trash2, onClick: () => handleBulkAction('delete') },
        ]}
      />

      <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple style={{ display: 'none' }} />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '100%', height: 160, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ padding: '0.75rem' }}>
                <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '4rem 2rem', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.image} size={48} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No files found</h3>
          <p style={{ fontSize: '0.84rem', margin: 0, textAlign: 'center' }}>Upload images, videos, and documents to use across your site.</p>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            <Icon path={Icons.upload} size={14} /> Upload Files
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {filteredData.map(item => {
            const isSelected = bulkSelected.includes(item._id);
            return (
              <div
                key={item._id}
                style={{
                  background: 'var(--color-card)', border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                onClick={() => {
                  if (isSelected) setBulkSelected(prev => prev.filter(id => id !== item._id));
                  else setBulkSelected([...bulkSelected, item._id]);
                }}
                onDoubleClick={() => openPreview(item)}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <Icon path={Icons.check} size={14} />
                  </div>
                )}
                <div style={{ width: '100%', height: 160, background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.mimeType?.startsWith('image/') && item.url ? (
                    <img src={imageUrl(item.url)} alt={item.originalName || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : item.mimeType?.startsWith('video/') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-tertiary)' }}>
                      <Icon path={getTypeIcon(item.mimeType)} size={48} />
                      <span style={{ fontSize: '0.72rem' }}>Video</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-tertiary)' }}>
                      <Icon path={getTypeIcon(item.mimeType)} size={48} />
                      <span style={{ fontSize: '0.72rem' }}>Document</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.originalName || item.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4, fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                    <span>{formatSize(item.size)}</span>
                    <span>·</span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadFiles([]); } }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Upload Files</h3>
              <button className="modal-close" onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadFiles([]); } }}>&times;</button>
            </div>
            <div className="modal-body">
              <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 12, padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'var(--color-primary-subtle)' : 'var(--color-bg-subtle)',
                  transition: 'all 0.2s', marginBottom: '1rem',
                }}
              >
                <Icon path={Icons.upload} size={40} style={{ color: 'var(--color-text-tertiary)' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', margin: '0.75rem 0 0.25rem' }}>
                  {dragOver ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', margin: 0 }}>or click to browse</p>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                  Supported: Images, Videos, PDFs, Documents
                </div>
              </div>

              {uploadFiles.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                    {uploadFiles.length} file(s) selected
                  </p>
                  <div style={{ maxHeight: 120, overflow: 'auto' }}>
                    {uploadFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <Icon path={getTypeIcon(f.type)} size={14} />
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.72rem' }}>{formatSize(f.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--color-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadFiles([]); } }} disabled={uploading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading}>
                {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} file(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewItem && (
        <div className="modal-overlay" onClick={() => { setShowPreviewModal(false); setPreviewItem(null); }}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <h3>{previewItem.originalName || previewItem.name}</h3>
              <button className="modal-close" onClick={() => { setShowPreviewModal(false); setPreviewItem(null); }}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
              <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, overflow: 'hidden' }}>
                {previewItem.mimeType?.startsWith('image/') && previewItem.url ? (
                  <img src={imageUrl(previewItem.url)} alt={previewItem.originalName || previewItem.name} style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: 8 }} />
                ) : previewItem.mimeType?.startsWith('video/') && previewItem.url ? (
                  <video controls style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8 }}>
                    <source src={imageUrl(previewItem.url)} type={previewItem.mimeType} />
                  </video>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-tertiary)', padding: '2rem' }}>
                    <Icon path={Icons['file-text']} size={64} />
                    <p style={{ fontSize: '0.9rem' }}>No preview available</p>
                    <a href={imageUrl(previewItem.url)} target="_blank" rel="noopener noreferrer" className="btn btn-primary" download>
                      <Icon path={Icons.download} size={14} /> Download File
                    </a>
                  </div>
                )}
              </div>
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>File Name</label>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text)', margin: 0, wordBreak: 'break-all' }}>{previewItem.originalName || previewItem.name}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Type</label>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text)', margin: 0 }}>{previewItem.mimeType || 'Unknown'}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Size</label>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text)', margin: 0 }}>{formatSize(previewItem.size)}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Dimensions</label>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text)', margin: 0 }}>{previewItem.width && previewItem.height ? `${previewItem.width} x ${previewItem.height}` : '-'}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Upload Date</label>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text)', margin: 0 }}>{previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Alt Text</label>
                  <input
                    value={previewItem.alt || ''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setPreviewItem({ ...previewItem, alt: val });
                      try { await adminApi.updateMedia(previewItem._id, { alt: val }); } catch { /* ignore */ }
                    }}
                    placeholder="Describe the image..."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)', color: 'var(--color-text)', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Caption</label>
                  <input
                    value={previewItem.caption || ''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setPreviewItem({ ...previewItem, caption: val });
                      try { await adminApi.updateMedia(previewItem._id, { caption: val }); } catch { /* ignore */ }
                    }}
                    placeholder="Add a caption..."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)', color: 'var(--color-text)', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a href={imageUrl(previewItem.url)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" download>
                    <Icon path={Icons.download} size={14} /> Download
                  </a>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setRenameTarget(previewItem); setRenameValue(previewItem.originalName || previewItem.name || ''); }}>
                    <Icon path={Icons.edit} size={14} /> Rename
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(imageUrl(previewItem.url)); toast.success('URL copied'); }}>
                    <Icon path={Icons.copy} size={14} /> Copy URL
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteTarget(previewItem)}>
                    <Icon path={Icons.trash2} size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="modal-overlay" onClick={() => { setRenameTarget(null); setRenameValue(''); }}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rename File</h3>
              <button className="modal-close" onClick={() => { setRenameTarget(null); setRenameValue(''); }}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>File Name</label>
                <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="Enter new name" autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setRenameTarget(null); setRenameValue(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRename} disabled={!renameValue.trim()}>Rename</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete File"
        message={`Delete "${deleteTarget?.originalName || deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}
