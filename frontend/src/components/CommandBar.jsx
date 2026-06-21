import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../utils/api';
import { FiTerminal, FiSearch, FiExternalLink } from 'react-icons/fi';

const NAV_COMMANDS = [
  { cmd: 'about', desc: 'Scroll to About section', action: 'scroll', target: 'about' },
  { cmd: 'skills', desc: 'Scroll to Skills section', action: 'scroll', target: 'skills' },
  { cmd: 'projects', desc: 'Scroll to Projects section', action: 'scroll', target: 'projects' },
  { cmd: 'contact', desc: 'Scroll to Contact section', action: 'scroll', target: 'contact' },
  { cmd: 'experience', desc: 'Scroll to Experience section', action: 'scroll', target: 'experience' },
  { cmd: 'services', desc: 'Scroll to Services section', action: 'scroll', target: 'services' },
  { cmd: 'home', desc: 'Scroll to top', action: 'scroll', target: 'home' },
  { cmd: 'search', desc: 'Go to search page', action: 'navigate', target: '/search' },
  { cmd: 'help', desc: 'Show this help', action: 'help' },
  { cmd: 'clear', desc: 'Clear input', action: 'clear' },
];

function CommandBar() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!projectsLoaded) {
      const load = async () => {
        try {
          const { data } = await publicApi.getProjects();
          setProjects(data.data || []);
        } catch { /* ignore */ }
        setProjectsLoaded(true);
      };
      load();
    }
  }, [projectsLoaded]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
        setHelpVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const projectCommands = useMemo(() => {
    if (!projects.length) return [];
    return projects.map(p => ({
      cmd: p.title.toLowerCase(),
      desc: p.title,
      action: 'navigate',
      target: p._id,
    }));
  }, [projects]);

  const allSuggestions = useMemo(() => {
    return [...NAV_COMMANDS, ...projectCommands];
  }, [projectCommands]);

  const filtered = useMemo(() => {
    if (!input.trim() || !focused) return [];
    const q = input.toLowerCase().trim();
    return allSuggestions.filter(s => s.cmd.startsWith(q)).slice(0, 8);
  }, [input, allSuggestions, focused]);

  const execute = (suggestion) => {
    setInput('');
    setFocused(false);
    setHelpVisible(false);
    inputRef.current?.blur();

    if (suggestion.action === 'scroll') {
      scrollTo(suggestion.target);
    } else if (suggestion.action === 'navigate') {
      if (suggestion.target.startsWith('/')) {
        navigate(suggestion.target);
      } else {
        navigate(`/project/${suggestion.target}`);
      }
    } else if (suggestion.action === 'help') {
      setHelpVisible(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = input.trim().toLowerCase();
      if (!trimmed) return;
      if (trimmed === 'clear') { setInput(''); return; }
      if (trimmed === 'help') { setHelpVisible(!helpVisible); setInput(''); return; }
      const match = allSuggestions.find(s => s.cmd === trimmed);
      if (match) { execute(match); return; }
      const partial = allSuggestions.find(s => s.cmd.startsWith(trimmed));
      if (partial) { execute(partial); return; }
    }
    if (e.key === 'Escape') {
      setFocused(false);
      setHelpVisible(false);
      inputRef.current?.blur();
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    setHelpVisible(false);
  };

  return (
    <div className="command-bar-wrapper" ref={wrapperRef}>
      <div className={`command-bar ${focused ? 'command-bar-focused' : ''}`}>
        <FiTerminal className="command-bar-icon" size={14} />
        <input
          ref={inputRef}
          type="text"
          className="command-bar-input"
          value={input}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search projects, type 'help' for commands..."
          spellCheck={false}
          autoComplete="off"
        />
        {input && (
          <FiSearch className="command-bar-search-icon" size={13} />
        )}
      </div>

      {filtered.length > 0 || (focused && input.trim()) ? (
        <div className="command-bar-dropdown">
          {filtered.map((s, i) => (
            <div key={s.cmd + i} className="command-bar-item" onClick={() => execute(s)}>
              <span className="command-bar-item-cmd">{s.cmd}</span>
              <span className="command-bar-item-desc">{s.desc}</span>
              <span className="command-bar-item-action">{s.action === 'navigate' ? '→' : s.action === 'scroll' ? '↓' : ''}</span>
            </div>
          ))}
          {input.trim() && (
            <div className="command-bar-item" onClick={() => { navigate(`/search?q=${encodeURIComponent(input.trim())}`); setInput(''); setFocused(false); inputRef.current?.blur(); }}>
              <span className="command-bar-item-cmd" style={{ color: 'var(--primary-color)' }}>Search all</span>
              <span className="command-bar-item-desc">View all results for "{input.trim()}"</span>
              <span className="command-bar-item-action"><FiExternalLink size={12} /></span>
            </div>
          )}
        </div>
      ) : null}

      {helpVisible && (
        <div className="command-bar-dropdown command-bar-help">
          <div className="command-bar-help-title">Available commands</div>
          {NAV_COMMANDS.map((s, i) => (
            <div key={s.cmd + i} className="command-bar-item" onClick={() => execute(s)}>
              <span className="command-bar-item-cmd">{s.cmd}</span>
              <span className="command-bar-item-desc">{s.desc}</span>
              <span className="command-bar-item-action">{s.action === 'scroll' ? '↓' : ''}</span>
            </div>
          ))}
          {projectCommands.length > 0 && (
            <>
              <div className="command-bar-help-title">Projects</div>
              {projectCommands.map((s, i) => (
                <div key={s.cmd + i} className="command-bar-item" onClick={() => execute(s)}>
                  <span className="command-bar-item-cmd">{s.cmd}</span>
                  <span className="command-bar-item-desc">{s.desc}</span>
                  <span className="command-bar-item-action">→</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CommandBar;
