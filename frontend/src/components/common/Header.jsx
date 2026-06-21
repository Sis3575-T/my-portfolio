import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon, FaGithub, FaLinkedin, FaTwitter, FaTerminal } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

function Header({ onToggleTerminal }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
      setScrolled(window.scrollY > 50);
      const ids = navLinks.map(l => l.href.slice(1));
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    const id = href.slice(1);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLight = theme === 'light';

  return (
    <>
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 shadow-lg'
            : 'py-5'
        }`}
        style={{
          background: scrolled
            ? isLight
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(2,6,23,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
          boxShadow: scrolled ? `0 8px 32px ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.5)'}` : 'none',
        }}
      >
        <div className="max-w-container mx-auto px-6 flex items-center justify-between">
          <a
            href="#home"
            onClick={(e) => handleClick(e, '#home')}
            className="text-xl font-bold no-underline"
            style={{
              color: 'var(--primary-color)',
              letterSpacing: '1px',
            }}
          >
            Sisay Temesgen
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="relative px-4 py-2 text-sm font-medium rounded transition-colors duration-200 no-underline"
                style={{
                  color: activeSection === link.href.slice(1)
                    ? 'var(--primary-color)'
                    : 'var(--text-light)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== link.href.slice(1)) {
                    e.target.style.color = 'var(--text-light)';
                  }
                }}
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    width: activeSection === link.href.slice(1) ? '20px' : '0px',
                    background: 'var(--primary-color)',
                  }}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Sis3575-T"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 no-underline"
              style={{
                color: 'var(--text-light)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--primary-color)';
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-light)';
                e.target.style.borderColor = 'var(--glass-border)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="GitHub"
            >
              <FaGithub size={16} />
            </a>
            <a
              href="https://linkedin.com/in/sisay-temesgen"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 no-underline"
              style={{
                color: 'var(--text-light)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--primary-color)';
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-light)';
                e.target.style.borderColor = 'var(--glass-border)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="LinkedIn"
            >
              <FaLinkedin size={16} />
            </a>

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <FaSun size={15} /> : <FaMoon size={15} />}
            </button>

            <button
              className="md:hidden text-2xl p-1"
              style={{ color: 'var(--text-white)' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed top-0 right-0 h-screen w-[70%] flex flex-col justify-center items-center gap-8 z-50"
              style={{
                background: isLight ? 'var(--secondary-color)' : '#111827',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              }}
            >
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-lg font-medium no-underline transition-colors"
                  style={{
                    color: activeSection === link.href.slice(1)
                      ? 'var(--primary-color)'
                      : 'var(--text-light)',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default Header;
