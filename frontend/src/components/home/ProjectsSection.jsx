import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub, FaFolder, FaArrowRight, FaSearch } from 'react-icons/fa';
import touristImg from '../../assets/tourist.png';
import abayHotelImg from '../../assets/hero2.jpg';

const projectsData = [
  {
    _id: '1',
    title: 'Ethiopian Tourist Destination',
    description: 'Full-stack web application built with React frontend and Node.js backend. Features real-time data management with MongoDB, RESTful API architecture, responsive design with CSS3, and interactive user interface. Implements destination search functionality, dynamic content rendering, user authentication, and booking system integration. Deployed with modern DevOps practices.',
    thumbnail: touristImg,
    liveUrl: 'https://tourist-destination-2.onrender.com/',
    githubUrl: 'https://github.com/Sis3575-T/ethiopian-tourist-destination',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
    category: 'Full Stack',
  },
  {
    _id: '2',
    title: 'Abay Grand Hotel',
    description: 'Elegant hotel booking and management system with stunning design and seamless user experience. Features include room reservations, availability calendar, guest management, and online booking with real-time updates. A modern hospitality solution built for luxury accommodations.',
    thumbnail: abayHotelImg,
    liveUrl: 'https://abay-grand-hotel-1.vercel.app/',
    githubUrl: 'https://github.com/Sis3575-T/abay-grand-hotel',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
    category: 'Frontend',
  },
];

const categories = ['All', 'Full Stack', 'Frontend', 'Backend'];

function ProjectsSection() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = projectsData.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

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

        <div className="project-filters">
          <div className="project-search-wrapper">
            <FaSearch className="project-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="project-search-input"
            />
          </div>
          <div className="project-category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
            No projects found.
          </p>
        ) : (
          <div className="projects-grid">
            {filtered.map((project, idx) => (
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
                    <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : project.images && project.images.length > 0 ? (
                    <img src={project.images[0]} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    {project.liveUrl && project.liveUrl !== '#' && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link project-link-primary">
                        <FaExternalLinkAlt size={13} /> Visit Site
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link">
                        <FaGithub size={14} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
