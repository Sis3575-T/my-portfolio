import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { websiteApi, getImageUrl } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function BlogPost() {
  const { slug } = useParams();
  const [data, setData] = useState({ loading: true, error: null, post: null, related: [] });

  useEffect(() => {
    setData({ loading: true, error: null, post: null, related: [] });
    Promise.all([
      websiteApi.getBlog(),
    ])
      .then(([blogRes]) => {
        const posts = blogRes.data.data || [];
        const post = posts.find(p => p.slug === slug);
        if (!post) {
          setData({ loading: false, error: 'Post not found', post: null, related: [] });
          return;
        }
        const related = posts
          .filter(p => p.slug !== slug && p.category === post.category)
          .slice(0, 3);
        setData({ loading: false, error: null, post, related });
      })
      .catch(err => {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      });
  }, [slug]);

  const shareUrl = window.location.href;

  if (data.loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0' }}>
          <LoadingSkeleton variant="card" count={1} />
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

  const { post, related } = data;

  return (
    <div className="page">
      <Navbar />
      <main className="blog-post-page">
        <div className="container">
          <div className="blog-post-header">
            <Link to="/blog" className="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Blog
            </Link>
          </div>

          <article className="blog-post-article">
            <div className="blog-post-meta">
              {post.category && <span className="blog-post-category">{post.category}</span>}
              {post.publishedAt && (
                <span className="blog-post-date">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {post.readingTime && <span className="blog-post-read">{post.readingTime} min read</span>}
            </div>

            <h1 className="blog-post-title">{post.title}</h1>

            {post.coverImage && (
              <div className="blog-post-image">
                <img src={getImageUrl(post.coverImage)} alt={post.title} />
              </div>
            )}

            <div className="blog-post-content">
              {post.content?.split('\n').map((paragraph, i) => {
                if (paragraph.trim().startsWith('#')) {
                  const level = paragraph.match(/^#+/)[0].length;
                  const text = paragraph.replace(/^#+\s*/, '');
                  const Tag = `h${Math.min(level + 1, 4)}`;
                  return <Tag key={i}>{text}</Tag>;
                }
                if (paragraph.trim().startsWith('- ')) {
                  return <li key={i}>{paragraph.replace(/^- /, '')}</li>;
                }
                if (paragraph.trim() === '') return <br key={i} />;
                return <p key={i}>{paragraph}</p>;
              })}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="blog-post-tags">
                <h3>Tags</h3>
                <div className="blog-post-tag-list">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="blog-post-share">
              <h3>Share this post</h3>
              <div className="share-buttons">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="share-btn" title="Share on Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-btn" title="Share on LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`} className="share-btn" title="Share via Email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </a>
              </div>
            </div>
          </article>

          {related.length > 0 && (
            <div className="related-posts">
              <h2>Related Posts</h2>
              <div className="related-grid">
                {related.map(rp => (
                  <Link to={`/blog/${rp.slug}`} key={rp._id} className="blog-card">
                    <div className="blog-card-image">
                      {rp.coverImage && <img src={getImageUrl(rp.coverImage)} alt={rp.title} />}
                    </div>
                    <div className="blog-card-body">
                      <h3 className="blog-card-title">{rp.title}</h3>
                      <p className="blog-card-excerpt">{rp.excerpt?.substring(0, 100)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default BlogPost;
