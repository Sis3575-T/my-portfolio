import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

function Projects({ projects }) {
  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => {
    if (!projects || projects.length === 0) return ['All'];
    return ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (filter === 'All') return projects;
    return projects.filter(p => p.category === filter);
  }, [projects, filter]);

  if (!projects || projects.length === 0) return null;

  return (
    <section className="projects section" id="projects">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Projects</h2>
          <div className="section-divider" />
        </div>
        {categories.length > 1 && (
          <div className="projects-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`projects-filter-btn${filter === cat ? ' active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="projects-grid">
          {filtered.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className="project-card" data-track="project-card" data-track-value={project.title}>
              <div className="project-card-image">
                {project.thumbnail ? (
                  <img src={getImageUrl(project.thumbnail)} alt={project.title} />
                ) : (
                  <div className="project-card-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <div className="project-card-overlay">
                  <span className="project-card-view">View Details</span>
                </div>
                {project.featured && (
                  <span className="project-card-badge featured">Featured</span>
                )}
              </div>
              <div className="project-card-body">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.description?.substring(0, 120)}{project.description?.length > 120 ? '...' : ''}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-card-tags">
                    {project.technologies.slice(0, 4).map((tech, i) => (
                      <span key={i} className="tag">{tech}</span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="tag tag-more">+{project.technologies.length - 4}</span>
                    )}
                  </div>
                )}
                <div className="project-card-links" onClick={e => e.stopPropagation()}>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                      Code
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Live
                    </a>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
