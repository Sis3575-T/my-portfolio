import React from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiSmartphone, FiServer, FiLayout } from 'react-icons/fi';

const services = [
  {
    icon: <FiLayout size={24} />,
    title: 'Frontend Development',
    desc: 'Responsive, accessible UIs built with React and modern CSS. Pixel-perfect implementations from Figma or any design system.',
  },
  {
    icon: <FiServer size={24} />,
    title: 'Backend Development',
    desc: 'RESTful APIs and server-side logic with Node.js, Express, and MongoDB. Authentication, validation, and data modeling.',
  },
  {
    icon: <FiCode size={24} />,
    title: 'Full Stack Projects',
    desc: 'End-to-end web applications from concept to deployment. Architecture planning, database design, and cloud hosting.',
  },
  {
    icon: <FiSmartphone size={24} />,
    title: 'Responsive Design',
    desc: 'Mobile-first layouts that work seamlessly across all devices. Performance optimized with modern tooling.',
  },
];

function ServicesSection() {
  return (
    <section id="services" className="skills">
      <div className="skills-container" style={{ maxWidth: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">What I Do</span>
          <h2 className="section-title">Services</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            From concept to deployment — building modern web solutions.
          </p>
        </motion.div>

        <div className="about-cards" style={{ marginTop: '3rem' }}>
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="about-card"
            >
              <div className="card-icon-wrap">{service.icon}</div>
              <h4 className="card-title">{service.title}</h4>
              <p className="card-content">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
