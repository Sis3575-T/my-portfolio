import React, { useState, useEffect } from 'react';
import { websiteApi } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Contact from '../components/Contact';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ContactPage() {
  const [data, setData] = useState({ loading: true, error: null, settings: null });

  useEffect(() => {
    websiteApi.getSettings()
      .then(res => setData({ loading: false, error: null, settings: res.data.data }))
      .catch(err => setData({ loading: false, error: err.message, settings: null }));
  }, []);

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

  return (
    <div className="page">
      <Navbar />
      <main className="contact-page">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Contact Me</h1>
            <div className="section-divider" />
          </div>
          <div className="contact-page-content">
            <Contact settings={data.settings} />
          </div>
          <div className="contact-map-placeholder">
            <div className="map-placeholder-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p>{data.settings?.address || 'Location available on request'}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ContactPage;
