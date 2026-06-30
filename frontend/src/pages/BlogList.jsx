import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { websiteApi, getImageUrl } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function BlogList() {
  const [data, setData] = useState({ loading: true, error: null, posts: [] });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    websiteApi.getBlog()
      .then(res => setData({ loading: false, error: null, posts: res.data.data || [] }))
      .catch(err => setData({ loading: false, error: err.message, posts: [] }));
  }, []);

  const categories = useMemo(() => {
    if (!data.posts.length) return ['All'];
    return ['All', ...new Set(data.posts.map(p => p.category).filter(Boolean))];
  }, [data.posts]);

  const filtered = useMemo(() => {
    return data.posts.filter(p => {
      const matchesSearch = !search || 
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.posts, search, activeCategory]);

  if (data.loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0' }}>
          <LoadingSkeleton variant="card" count={6} />
        </div>
        <Footer />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0' }}>
          <ErrorState message={data.error} onRetry={() => window.location.reload()} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main className="blog-list-page">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Blog</h1>
            <div className="section-divider" />
          </div>

          <div className="blog-toolbar">
            <div className="blog-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="blog-categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`blog-cat-btn${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No posts found matching your criteria.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {filtered.map(post => (
                <Link to={`/blog/${post.slug}`} key={post._id} className="blog-card">
                  <div className="blog-card-image">
                    {post.coverImage ? (
                      <img src={getImageUrl(post.coverImage)} alt={post.title} loading="lazy" />
                    ) : (
                      <div className="blog-card-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      {post.category && <span className="blog-card-category">{post.category}</span>}
                      {post.readingTime && <span className="blog-card-read">{post.readingTime} min read</span>}
                    </div>
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">{post.excerpt?.substring(0, 150)}{post.excerpt?.length > 150 ? '...' : ''}</p>
                    <div className="blog-card-footer">
                      <span className="blog-card-date">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                      </span>
                      <span className="blog-card-readmore">Read More →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default BlogList;
