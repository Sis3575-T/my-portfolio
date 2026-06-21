import { motion } from 'framer-motion';
import './Projects.css';
import ethiopianTouristImg from '../assets/images/ethiopian-tourist.jpg';
import projectPlaceholder from '../assets/images/project.jpg';

const projects = [
  {
    title: 'Ethiopian Tourist Destination',
    description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peak - Ras Dashen (4,560m). Features include destination exploration, smart matching, interactive dashboard, and booking system. Discover ancient civilizations, dramatic landscapes, and vibrant cultures across the Horn of Africa.',
    image: ethiopianTouristImg,
    link: 'https://tourist-destination-2.onrender.com/',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
    features: ['41+ Destinations', '14 Countries', '500+ Happy Travelers', '10+ Years Experience'],
  },
  {
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with product management, shopping cart, secure checkout, and payment integration. Built with modern technologies and best practices for scalability and performance.',
    image: projectPlaceholder,
    link: '#',
    technologies: ['React', 'Redux', 'Node.js', 'Stripe', 'PostgreSQL'],
    features: ['Secure Payments', 'Real-time Inventory', 'Admin Dashboard', 'Order Tracking'],
  },
  {
    title: 'Task Management System',
    description: 'Collaborative task management application with real-time updates, team collaboration features, project boards, and analytics. Designed to boost productivity and streamline team workflows.',
    image: projectPlaceholder,
    link: '#',
    technologies: ['React', 'TypeScript', 'Socket.io', 'MongoDB', 'Tailwind'],
    features: ['Real-time Sync', 'Team Collaboration', 'Kanban Boards', 'Analytics'],
  },
  {
    title: 'Weather Dashboard',
    description: 'Interactive weather application displaying current conditions, forecasts, and weather alerts. Features location search, favorites, and detailed weather metrics with beautiful visualizations.',
    image: projectPlaceholder,
    link: '#',
    technologies: ['React', 'API Integration', 'Chart.js', 'CSS3'],
    features: ['Live Weather Data', 'Location Search', '7-Day Forecast', 'Weather Alerts'],
  },
  {
    title: 'Social Media Platform',
    description: 'Modern social networking platform with user profiles, posts, comments, likes, and real-time messaging. Built with scalability and user experience in mind.',
    image: projectPlaceholder,
    link: '#',
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'AWS S3'],
    features: ['Real-time Chat', 'Media Sharing', 'User Profiles', 'Notifications'],
  },
  {
    title: 'Portfolio CMS',
    description: 'Content management system for portfolio websites with drag-and-drop editor, media library, SEO optimization, and analytics. Perfect for creatives and professionals.',
    image: projectPlaceholder,
    link: '#',
    technologies: ['React', 'Express', 'MongoDB', 'Cloudinary', 'JWT'],
    features: ['Drag & Drop Editor', 'Media Management', 'SEO Tools', 'Analytics'],
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

      </motion.div>

      <div className="projects-grid">
        {projects.map((p, i) => (
          <motion.div
            key={i}
            className="project-card"
            {...inView(0.1)}
          >
            <div className="project-image-container">
              <img src={p.image} alt={p.title} className="project-image" />
              <div className="project-overlay">
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-button"
                >
                  Visit Site ↗
                </a>
              </div>
            </div>
            <div className="project-info">
              <h3 className="project-title">{p.title}</h3>
              <p className="project-description">{p.description}</p>
              {p.technologies && (
                <div className="project-tech-stack">
                  {p.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-badge">{tech}</span>
                  ))}
                </div>
              )}
              {p.features && (
                <div className="project-features">
                  {p.features.map((feature, idx) => (
                    <span key={idx} className="feature-badge">✓ {feature}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Projects;
