import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSkeleton from './components/LoadingSkeleton';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Gallery = lazy(() => import('./pages/Gallery'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingFallback() {
  return (
    <div className="page">
      <div className="navbar-placeholder" />
      <div className="container" style={{ padding: '4rem 0' }}>
        <LoadingSkeleton variant="card" count={4} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
