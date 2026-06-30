import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function NotFound() {
  return (
    <div className="page">
      <Navbar />
      <main className="not-found-page">
        <div className="container">
          <div className="not-found-content">
            <div className="not-found-code">404</div>
            <h1 className="not-found-title">Page Not Found</h1>
            <p className="not-found-text">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="not-found-actions">
              <Link to="/" className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Go Home
              </Link>
              <Link to="/blog" className="btn btn-outline">
                Browse Blog
              </Link>
            </div>
            <div className="not-found-search">
              <p>Try searching for what you need:</p>
              <div className="search-suggestions">
                <Link to="/" className="search-suggestion">Home</Link>
                <Link to="/blog" className="search-suggestion">Blog</Link>
                <Link to="/contact" className="search-suggestion">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
