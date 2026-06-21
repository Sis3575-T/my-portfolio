import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub, FaFolder, FaArrowRight } from 'react-icons/fa';
import { publicApi, imageUrl } from '../../utils/api';

function ProjectsSection() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await publicApi.getProjects({ limit: 6 });
        console.log('Projects data:', JSON.stringify(res.data?.data?.map(p => ({ id: p._id, title: p.title, thumb: p.thumbnail, images: p.images }))));
        setProjects(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load projects:', err?.response?.status, err?.message);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="projects">
      <div className="projects-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">Projects</span>
          <h2 className="section-title">Featured Projects</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            Applications built with modern technologies and development best practices.
          </p>
        </motion.div>

        <div className="projects-grid">
          {projects.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="project-card"
            >
              <div className="project-image">
                {project.thumbnail ? (
                  <img src={imageUrl(project.thumbnail)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : project.images && project.images.length > 0 ? (
                  <img src={imageUrl(project.images[0])} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="project-image-placeholder">
                    <FaFolder size={48} style={{ color: 'var(--primary-color)', opacity: 0.4 }} />
                  </div>
                )}
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {(project.technologies || []).slice(0, 4).map((tech) => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </div>
                <div className="project-links">
                  <Link to={`/project/${project._id}`} className="project-link project-link-primary">
                    <FaArrowRight size={13} /> View Details
                  </Link>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link">
                      <FaGithub size={14} /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link">
                      <FaExternalLinkAlt size={13} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
