import React, { useState, useEffect } from 'react';
import { websiteApi, getImageUrl } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Gallery() {
  const [data, setData] = useState({ loading: true, error: null, projects: [] });

  useEffect(() => {
    websiteApi.getProjects()
      .then(res => {
        const projects = res.data.data || [];
        const images = projects.filter(p => p.thumbnail || (p.images && p.images.length > 0));
        setData({ loading: false, error: null, projects: images });
      })
      .catch(err => setData({ loading: false, error: err.message, projects: [] }));
  }, []);

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

  const allImages = data.projects.flatMap(p => {
    const images = [];
    if (p.thumbnail) images.push({ url: p.thumbnail, title: p.title, type: 'thumbnail' });
    if (p.images) p.images.forEach(img => images.push({ url: img, title: p.title, type: 'gallery' }));
    return images;
  });

  if (allImages.length === 0) {
    return (
      <div className="page">
        <Navbar />
        <main className="gallery-page">
          <div className="container">
            <div className="section-header">
              <h1 className="section-title">Gallery</h1>
              <div className="section-divider" />
            </div>
            <div className="empty-state">
              <p>No images available yet.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main className="gallery-page">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Gallery</h1>
            <div className="section-divider" />
          </div>
          <div className="gallery-masonry">
            {allImages.map((item, i) => (
              <div key={i} className="gallery-masonry-item">
                <img src={getImageUrl(item.url)} alt={item.title} loading="lazy" />
                <div className="gallery-masonry-overlay">
                  <span>{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Gallery;
