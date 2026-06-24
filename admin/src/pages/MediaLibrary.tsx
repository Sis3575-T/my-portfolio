import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api.ts';
import { FiUpload, FiTrash2, FiImage, FiFileText, FiFile, FiSearch } from 'react-icons/fi';
import type { Media } from '../types';
import { formatDate } from '../lib/utils';

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const perPage = 12;

  useEffect(() => {
    adminApi.getMedia({ limit: 50 })
      .then(({ data }) => setMedia(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', file.type.startsWith('image/') ? 'image' : 'document');
    try {
      await adminApi.uploadMedia(formData);
      const { data } = await adminApi.getMedia({ limit: 50 });
      setMedia(data.data || []);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await adminApi.deleteMedia(id);
      setMedia(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const totalPages = Math.ceil(media.length / perPage);
  const paged = media.slice((page - 1) * perPage, page * perPage);

  const getIcon = (mime: string) => {
    if (mime?.startsWith('image/')) return React.createElement(FiImage, { size: 36 });
    if (mime?.includes('pdf')) return React.createElement(FiFileText, { size: 36 });
    return React.createElement(FiFile, { size: 36 });
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Media Library</h2>
          <p>Upload and manage your files ({media.length} files)</p>
        </div>
        <div className="page-actions">
          <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} />
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <FiUpload size={16} /> {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      <div className="media-grid">
        {paged.map((item) => (
          <div key={item._id} className="media-card">
            <div className="media-preview">
              {item.mimeType?.startsWith('image/') ? (
                <img src={imageUrl(item.url)} alt={item.name} style={{ objectFit: 'cover' }} />
              ) : (
                getIcon(item.mimeType)
              )}
            </div>
            <div className="media-info">
              <div className="media-name">{item.originalName || item.name}</div>
              <div className="media-meta">
                {(item.size / 1024 / 1024).toFixed(1)} MB · {formatDate(item.createdAt)}
              </div>
            </div>
            <button className="media-delete-btn" onClick={() => handleDelete(item._id)} data-tooltip="Delete">
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
        <div className="media-upload-card" onClick={() => fileRef.current?.click()}>
          <FiUpload size={36} />
          <p>Drop files here or click to upload</p>
          <span>Supports images, PDFs, and documents</span>
        </div>
      </div>

      {media.length > perPage && (
        <div className="pagination" style={{ marginTop: 16 }}>
          <span className="pagination-info">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, media.length)} of {media.length}
          </span>
          <div className="pagination-buttons">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
