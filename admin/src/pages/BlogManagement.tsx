import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api.ts';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiFileText } from 'react-icons/fi';
import type { Blog } from '../types';
import { formatDate } from '../lib/utils';

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  featured: boolean;
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<BlogForm>({ title: '', slug: '', excerpt: '', content: '', category: 'General', tags: '', featured: false });
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    adminApi.getBlogs()
      .then(({ data }) => setBlogs(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', category: 'General', tags: '', featured: false });
    setShowModal(true);
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'General',
      tags: (blog.tags || []).join(', '),
      featured: blog.featured || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
      if (editing) await adminApi.updateBlog(editing._id, payload);
      else await adminApi.createBlog(payload);
      const { data } = await adminApi.getBlogs();
      setBlogs(data.data || []);
      setShowModal(false);
    } catch (err) { console.error('Failed to save blog', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await adminApi.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) { console.error('Failed to delete', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Blog Posts</h2>
          <p>Manage your blog ({blogs.length} posts)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><FiPlus size={16} /> New Post</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th style={{ width: 80 }}>Actions</th></tr></thead>
          <tbody>
            {paged.map(b => (
              <tr key={b._id}>
                <td>
                  <div className="cell-title">{b.title}</div>
                  {b.featured && <span className="badge badge-blue">Featured</span>}
                </td>
                <td><span className="badge badge-gray">{b.category}</span></td>
                <td><span className={`badge ${b.isActive ? 'badge-green' : 'badge-orange'}`}>{b.isActive ? 'Published' : 'Draft'}</span></td>
                <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatDate(b.publishedAt)}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => openEdit(b)} data-tooltip="Edit"><FiEdit size={14} /></button>
                    <button className="btn-delete" onClick={() => handleDelete(b._id)} data-tooltip="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state"><FiFileText size={40} /><h3>No blog posts</h3><p>Create your first blog post.</p></div></td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > perPage && (
          <div className="pagination">
            <span className="pagination-info">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Post' : 'New Post'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Leave empty to auto-generate" /></div>
              <div className="form-group"><label>Excerpt</label><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
              <div className="form-group"><label>Content (Markdown)</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} /></div>
              <div className="form-row">
                <div className="form-group"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="form-group"><label>Tags (comma-separated)</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
              </div>
              <div className="form-group">
                <label className="form-check">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  <span>Featured post</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
