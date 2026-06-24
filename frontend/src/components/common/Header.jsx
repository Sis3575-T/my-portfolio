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

  useEffect(() => {
    const onScroll = () => {
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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
        style={{
          background: '#000000',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between">
          <a
            href="#home"
            onClick={(e) => handleClick(e, '#home')}
            className="flex items-center gap-3 font-bold no-underline"
            style={{
              color: '#FFFFFF',
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: '#2563EB',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 36 32">
                <text x="18" y="25" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="22" fill="white" text-anchor="middle" letter-spacing="-1">ST</text>
              </svg>
            </div>
            <span style={{ fontWeight: 600 }}>Sisay Temesgen</span>
          </a>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 no-underline"
                style={{
                  color: activeSection === link.href.slice(1) ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  background: activeSection === link.href.slice(1) ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== link.href.slice(1)) {
                    e.target.style.color = '#FFFFFF';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== link.href.slice(1)) {
                    e.target.style.color = 'rgba(255,255,255,0.6)';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    width: activeSection === link.href.slice(1) ? '18px' : '0px',
                    background: '#FFFFFF',
                  }}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
              style={{
                color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
            </button>

            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.08)',
              }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
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
                background: '#000000',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              }}
            >
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-base font-medium no-underline transition-colors"
                  style={{
                    color: activeSection === link.href.slice(1) ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
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
