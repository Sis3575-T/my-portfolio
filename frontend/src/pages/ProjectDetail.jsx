import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { websiteApi, getImageUrl } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ProjectDetail() {
  const { slug } = useParams();
  const [data, setData] = useState({ loading: true, error: null, project: null, related: [] });

  useEffect(() => {
    setData({ loading: true, error: null, project: null, related: [] });
    Promise.all([
      websiteApi.getProjects(),
    ])
      .then(([projRes]) => {
        const projects = projRes.data.data || [];
        const project = projects.find(p => p._id === slug || p.slug === slug);
        if (!project) {
          setData({ loading: false, error: 'Project not found', project: null, related: [] });
          return;
        }
        const related = projects
          .filter(p => p._id !== project._id && p.category === project.category)
          .slice(0, 3);
        setData({ loading: false, error: null, project, related });
      })
      .catch(err => {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      });
  }, [slug]);

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

  const { project, related } = data;

  return (
    <div className="page">
      <Navbar />
      <main className="project-detail-page">
        <div className="container">
          <div className="project-detail-header">
            <Link to="/" className="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Home
            </Link>
            <span className="project-category">{project.category}</span>
          </div>

          <h1 className="project-detail-title">{project.title}</h1>

          {project.thumbnail && (
            <div className="project-detail-image">
              <img src={getImageUrl(project.thumbnail)} alt={project.title} />
            </div>
          )}

          <div className="project-detail-body">
            <div className="project-detail-description">
              <h2>About This Project</h2>
              <p>{project.description}</p>
            </div>

            <div className="project-detail-sidebar">
              {project.technologies && project.technologies.length > 0 && (
                <div className="project-detail-tech">
                  <h3>Technologies</h3>
                  <div className="project-detail-tags">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="project-detail-links">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    View on GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Live Demo
                  </a>
                )}
              </div>

              {project.featured && (
                <div className="project-detail-featured">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Featured Project
                </div>
              )}
            </div>
          </div>

          {project.images && project.images.length > 0 && (
            <div className="project-detail-gallery">
              <h2>Gallery</h2>
              <div className="gallery-grid">
                {project.images.map((img, i) => (
                  <div key={i} className="gallery-item">
                    <img src={getImageUrl(img)} alt={`${project.title} ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="related-projects">
              <h2>Related Projects</h2>
              <div className="related-grid">
                {related.map(rp => (
                  <Link to={`/projects/${rp._id}`} key={rp._id} className="related-card">
                    {rp.thumbnail && <img src={getImageUrl(rp.thumbnail)} alt={rp.title} />}
                    <h3>{rp.title}</h3>
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

export default ProjectDetail;
