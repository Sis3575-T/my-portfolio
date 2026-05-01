import { motion } from 'framer-motion';
import projectImg from '../assets/images/project.jpg';
import './Projects.css';

const projects = [
  {
    title: 'Ethiopian Tourist Destination',
    category: 'Full Stack Web App',
    status: 'Live',
    description:
      'A full-featured web application showcasing Ethiopia\'s most breathtaking tourist destinations — from ancient Lalibela to the Danakil Depression. Users can browse destinations, view rich imagery, and plan their visits.',
    tech: ['React', 'Node.js', 'MongoDB', 'Express.js', 'CSS3'],
    link: 'https://tourist-destination-2.onrender.com/',
    image: projectImg,
    highlights: [
      'Interactive destination explorer',
      'Fully responsive across all devices',
      'Rich imagery & detailed location info',
      'Smooth navigation & modern UI',
    ],
  },
];

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const Projects = () => (
  <section className="projects" id="projects">
    <div className="container">
      <motion.div {...inView()}>
        <p className="section-tag">My Work</p>
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">
          Real-world applications I've built and deployed.
        </p>
      </motion.div>

      <div className="projects-list">
        {projects.map((p, i) => (
          <motion.article
            key={i}
            className={`project-item${i % 2 === 1 ? ' project-item--reverse' : ''}`}
            {...inView(0.1)}
          >
            {/* Image */}
            <div className="project-img-wrap">
              {p.image ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="project-img-link">
                  <img src={p.image} alt={p.title} className="project-img" />
                  <div className="project-img-overlay">
                    <span>View Live ↗</span>
                  </div>
                </a>
              ) : (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="project-img-link project-img-placeholder">
                  <div className="placeholder-inner">
                    <span className="placeholder-icon">🌐</span>
                    <span className="placeholder-text">{p.title}</span>
                    <span className="placeholder-cta">Visit Site ↗</span>
                  </div>
                </a>
              )}
            </div>

            {/* Info */}
            <div className="project-info">
              <div className="project-meta">
                <span className="project-cat">{p.category}</span>
                <span className="project-live">
                  <span className="live-dot" />
                  {p.status}
                </span>
              </div>

              <h3 className="project-name">{p.title}</h3>
              <p className="project-desc">{p.description}</p>

              <ul className="project-highlights">
                {p.highlights.map((h, j) => (
                  <li key={j}><span className="hi-check">✓</span>{h}</li>
                ))}
              </ul>

              <div className="project-tech">
                {p.tech.map((t, j) => (
                  <span key={j} className="tech-pill">{t}</span>
                ))}
              </div>

              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary project-btn"
              >
                🌐 View Live Project
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default Projects;
