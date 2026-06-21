import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiLayers, FiDatabase, FiTrendingUp } from 'react-icons/fi';
import profilePhoto from '../../assets/profile-photo.jpg';
import { publicApi, imageUrl } from '../../utils/api';

const stats = [
  { number: '2+', label: 'Years Learning' },
  { number: '3+', label: 'Projects Built' },
  { number: '5+', label: 'Technologies' },
  { number: '∞', label: 'Curiosity' },
];

const detailCards = [
  { icon: <FiCode size={22} />, title: 'Focus', content: 'Full-Stack Web Development with modern JavaScript/TypeScript ecosystems.' },
  { icon: <FiLayers size={22} />, title: 'Approach', content: 'Break problems down, research solutions, iterate to quality, and ship with confidence.' },
  { icon: <FiDatabase size={22} />, title: 'Education', content: 'B.Sc. Computer Science at Bahir Dar University — building a strong CS foundation.' },
  { icon: <FiTrendingUp size={22} />, title: 'Goal', content: 'Create software that makes a meaningful impact through clean architecture.' },
];

function AboutSection() {
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    publicApi.getHero().then(({ data }) => {
      if (data?.data?.avatar) setAvatarUrl(imageUrl(data.data.avatar));
    }).catch(() => {});
  }, []);

  return (
    <section id="about" className="about">
      <div className="about-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <span className="section-tag">About Me</span>
          <h2 className="section-title">Get to Know Me</h2>
          <div className="section-line" />
        </motion.div>

        <div className="about-content">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="about-image-wrapper"
          >
            <div className="about-img-frame">
              <img src={avatarUrl || profilePhoto} alt="Sisay Temesgen" className="about-img" />
              <div className="img-corner img-corner-tl" />
              <div className="img-corner img-corner-br" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="about-text"
          >
            <h3 className="about-heading">
              Full Stack Developer with a passion for{' '}
              <span className="text-gradient">building exceptional</span> digital experiences
            </h3>
            <p>
              I am a <span className="highlight">Full-Stack Developer</span> and Computer Science student
              at Bahir Dar University with a genuine passion for building software that solves real problems.
              My journey into technology started with pure curiosity about how websites work and has evolved
              into a dedicated pursuit of software development excellence.
            </p>
            <p>
              I chose Computer Science because I wanted to understand the fundamental principles behind the
              technology we use every day. Through coursework and hands-on projects, I've developed practical
              skills in frontend and backend development, database management, API design, and responsive UI.
              Each project teaches me something new about architecture, performance, and the art of clean code.
            </p>
            <p>
              What drives me is the ability to transform ideas into working products. I enjoy the complete
              development cycle — from planning and design to implementation and deployment. Full-stack
              development appeals to me because it combines the logic of backend systems with the creativity
              of frontend interfaces, giving me a holistic view of how modern applications are built.
            </p>
            <div className="about-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-item">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="about-cards">
          {detailCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="about-card"
            >
              <div className="card-icon-wrap">{card.icon}</div>
              <h4 className="card-title">{card.title}</h4>
              <p className="card-content">{card.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
