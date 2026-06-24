import React, { useState, useEffect } from 'react';
import {
  FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaArrowUp,
  FaRocket, FaMapMarkerAlt, FaPhone,
  FaExternalLinkAlt
} from 'react-icons/fa';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

const quickLinks = [
  { label: 'GitHub', href: 'https://github.com/Sis3575-T', icon: <FaGithub size={14} /> },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/sisay-temesgen', icon: <FaLinkedin size={14} /> },
  { label: 'Email', href: 'mailto:sisay3575@gmail.com', icon: <FaEnvelope size={14} /> },
];

function Footer() {
  const [showScroll, setShowScroll] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-waves">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--primary-color)" opacity="0.08" />
            <path d="M0,80 C360,40 1080,100 1440,80 L1440,120 L0,120 Z" fill="var(--primary-color)" opacity="0.05" />
          </svg>
        </div>

        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col-brand">
              <div className="footer-brand">
                <span className="footer-logo">
                  <svg width={22} height={22} viewBox="0 0 36 32">
                    <text x="18" y="25" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="22" fill="white" text-anchor="middle" letter-spacing="-1">ST</text>
                  </svg>
                </span>
                <div>
                  <p className="footer-name">Sisay Temesgen</p>
                  <p className="footer-role">Full Stack Developer</p>
                </div>
              </div>
              <p className="footer-bio">
                Building modern, scalable web applications with cutting-edge technologies.
                Passionate about creating impactful digital experiences.
              </p>
              <div className="footer-stats">
                <div className="footer-stat">
                  <span className="footer-stat-num">2+</span>
                  <span className="footer-stat-label">Years Learning</span>
                </div>
                <div className="footer-stat">
                  <span className="footer-stat-num">10+</span>
                  <span className="footer-stat-label">Projects</span>
                </div>
                <div className="footer-stat">
                  <span className="footer-stat-num">5+</span>
                  <span className="footer-stat-label">Technologies</span>
                </div>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Navigation</h4>
              <nav className="footer-nav">
                {navLinks.map(link => (
                  <a key={link.href} href={link.href} className="footer-nav-link">
                    <span className="footer-nav-dot" />
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <div className="footer-quick-links">
                {quickLinks.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="footer-quick-link">
                    {link.icon}
                    {link.label}
                    <FaExternalLinkAlt size={9} className="footer-external-icon" />
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Get In Touch</h4>
              <div className="footer-contact-items">
                <div className="footer-contact-item">
                  <FaEnvelope size={14} className="footer-contact-icon" />
                  <a href="mailto:sisay3575@gmail.com" className="footer-contact-text">sisay3575@gmail.com</a>
                </div>
                <div className="footer-contact-item">
                  <FaPhone size={14} className="footer-contact-icon" />
                  <span className="footer-contact-text">+251 935 756 054</span>
                </div>
                <div className="footer-contact-item">
                  <FaMapMarkerAlt size={14} className="footer-contact-icon" />
                  <span className="footer-contact-text">Bahir Dar, Ethiopia</span>
                </div>
              </div>
              <div className="footer-social">
                <a href="https://github.com/Sis3575-T" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="GitHub">
                  <FaGithub size={18} />
                </a>
                <a href="https://linkedin.com/in/sisay-temesgen" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="LinkedIn">
                  <FaLinkedin size={18} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Twitter">
                  <FaTwitter size={18} />
                </a>
                <a href="mailto:sisay3575@gmail.com" className="footer-social-link" aria-label="Email">
                  <FaEnvelope size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-container footer-bottom-inner">
            <p className="footer-copyright">
              &copy; {year} Sisay Temesgen. All rights reserved.
            </p>
            <p className="footer-tech-stack">
              <FaRocket size={12} /> Always learning, always building.
            </p>
          </div>
        </div>
      </footer>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="scroll-top-btn"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={18} />
        </button>
      )}
    </>
  );
}

export default Footer;
