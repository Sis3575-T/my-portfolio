import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub, FaFolder, FaArrowRight } from 'react-icons/fa';
import { publicApi, imageUrl } from '../../utils/api';
import touristImg from '../../assets/tourist.png';
import abayHotelImg from '../../assets/hero2.jpg';

// Hardcoded projects (fallback when API is not available)
const hardcodedProjects = [
  {
    _id: '1',
    title: 'Ethiopian Tourist Destination',
    description: 'Full-stack web application built with React frontend and Node.js backend. Features real-time data management with MongoDB, RESTful API architecture, responsive design with CSS3, and interactive user interface. Implements destination search functionality, dynamic content rendering, user authentication, and booking system integration. Deployed with modern DevOps practices.',
    thumbnail: touristImg,
    liveUrl: 'https://tourist-destination-2.onrender.com/',
    githubUrl: '',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
  },
  {
    _id: '2',
    title: 'Abay Grand Hotel',
    description: 'Elegant hotel booking and management system with stunning design and seamless user experience. Features include room reservations, availability calendar, guest management, and online booking with real-time updates. A modern hospitality solution built for luxury accommodations.',
    thumbnail: abayHotelImg,
    liveUrl: 'https://abay-grand-hotel-1.vercel.app/',
    githubUrl: '',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
  },
];

function ProjectsSection() {
  const [projects, setProjects] = useState(hardcodedProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await publicApi.getProjects({ limit: 6 });
        console.log('Projects data:', JSON.stringify(res.data?.data?.map(p => ({ id: p._id, title: p.title, thumb: p.thumbnail, images: p.images }))));
        if (res.data?.data && res.data.data.length > 0) {
          setProjects(res.data.data);
        }
        // If API fails or returns no data, keep hardcoded projects
      } catch (err) {
        console.error('Failed to load projects, using hardcoded data:', err?.response?.status, err?.message);
        // Keep hardcoded projects on error
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
                  typeof project.thumbnail === 'string' && project.thumbnail.startsWith('http') ? (
                    <img src={imageUrl(project.thumbnail)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
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
      </div>
    </section>
  );
}

export default ProjectsSection;
