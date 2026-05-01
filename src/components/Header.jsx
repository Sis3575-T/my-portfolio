import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

const NAV = ['Home', 'About', 'Skills', 'Projects', 'Contact'];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = NAV.map(n => document.getElementById(n.toLowerCase())).filter(Boolean);
      const current = sections.find(s => {
        const rect = s.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      if (current) setActive(current.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <motion.header
      className={`header${scrolled ? ' header--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="header-inner">
        <a href="#home" className="brand" onClick={close}>
          <span className="brand-mark">ST</span>
          <div className="brand-text">
            <span className="brand-name">Sisay Temesgen</span>
            <span className="brand-role">Full Stack Developer</span>
          </div>
        </a>

        <nav className={`nav${menuOpen ? ' nav--open' : ''}`} aria-label="Main navigation">
          {NAV.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`nav-link${active === item.toLowerCase() ? ' nav-link--active' : ''}`}
              onClick={close}
            >
              {item}
            </a>
          ))}
          <a
            href="mailto:sisay3575@gmail.com"
            className="nav-hire"
            onClick={close}
          >
            Hire Me
          </a>
        </nav>

        <button
          className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
