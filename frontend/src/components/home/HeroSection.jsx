import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiMail, FiDownload, FiChevronDown } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import profilePhoto from '../../assets/profile-photo.jpg';
import CommandBar from '../CommandBar';
import HeroTerminal from './HeroTerminal';
import { publicApi, imageUrl } from '../../utils/api';

const roles = [
  'Full Stack Developer',
  'AI Enthusiast',
  'Computer Science Student',
  'Problem Solver',
];

function TypeWriter({ phrases }) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[idx];
    let timeout;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 80);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2500);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, 40);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, phrases]);

  return (
    <span>
      {text}<span className="typing-cursor">|</span>
    </span>
  );
}

function HeroSection() {
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    publicApi.getHero().then(({ data }) => {
      if (data?.data?.avatar) {
        setAvatarUrl(imageUrl(data.data.avatar));
      }
    }).catch(() => {});
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero">
      <Helmet>
        <title>Sisay Temesgen | Full Stack Developer</title>
        <meta name="description" content="Sisay Temesgen - Full Stack Developer & Computer Science student at Bahir Dar University. Building modern web applications." />
      </Helmet>

      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div className="hero-inner hero-layout">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-photo-wrapper"
        >
          <div className="photo-ring-outer" />
          <div className="photo-ring-inner" />
          <div className="hero-photo-frame">
            <img src={avatarUrl || profilePhoto} alt="Sisay Temesgen" className="hero-photo-img" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-intro"
        >
          <span className="hero-greeting">Hi, I'm</span>
          <h1 className="hero-name">Sisay Temesgen</h1>
          <p className="hero-role"><TypeWriter phrases={roles} /></p>
          <p className="hero-desc">
            Computer Science student at Bahir Dar University — building modern,
            accessible web applications with React, Node.js &amp; MongoDB.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-terminal-col"
        >
          <HeroTerminal />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="hero-bottom"
        >
          <div className="hero-buttons">
            <button onClick={() => scrollToSection('projects')} className="btn btn-secondary">
              View Projects <FiArrowRight />
            </button>
            <button onClick={() => scrollToSection('contact')} className="btn btn-primary">
              Contact Me <FiMail />
            </button>
            <a
              href="/cv-s.pdf"
              download
              className="btn btn-primary"
              style={{ background: 'transparent', border: '1.5px solid var(--accent-color)', color: 'var(--accent-color)' }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(34, 211, 238, 0.1)';
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px var(--glow-accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Download CV <FiDownload />
            </a>
          </div>

          <div className="hero-social">
            <a href="https://github.com/Sis3575-T" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="GitHub">
              <FaGithub size={18} />
            </a>
            <a href="https://linkedin.com/in/sisay-temesgen" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="LinkedIn">
              <FaLinkedin size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="Twitter">
              <FaTwitter size={18} />
            </a>
            <a href="mailto:sisay3575@gmail.com" className="hero-social-link" aria-label="Email">
              <FiMail size={18} />
            </a>
          </div>

          <div className="hero-command-area">
            <CommandBar />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="scroll-indicator"
        onClick={() => scrollToSection('about')}
      >
        <FiChevronDown size={20} />
      </motion.div>
    </section>
  );
}

export default HeroSection;
