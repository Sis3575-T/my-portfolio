import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaTerminal, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../utils/api';

const aboutData = {
  name: 'Sisay Temesgen',
  role: 'Full Stack Developer & AI Enthusiast',
  education: 'B.Sc. Computer Science at Bahir Dar University',
  bio: 'Passionate about building modern web applications with clean architecture. I specialize in the MERN stack and love exploring AI/ML technologies. Currently focused on creating impactful digital experiences through code.',
};

const skillsData = {
  frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
  backend: ['Node.js', 'Express', 'REST APIs'],
  database: ['MongoDB', 'PostgreSQL'],
  tools: ['Git', 'GitHub', 'Vite', 'VS Code', 'Docker'],
};

function Terminal({ onClose }) {
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [bootDone, setBootDone] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addLine = useCallback((text, type = 'output', onClick) => {
    setLines(prev => [...prev, { text, type, onClick }]);
  }, []);

  const addTypedLine = useCallback((text, type = 'output', cb) => {
    let idx = 0;
    setLines(prev => [...prev, { text: '', type, typing: true, id: Date.now() + Math.random() }]);
    const interval = setInterval(() => {
      idx++;
      setLines(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.typing) {
          copy[copy.length - 1] = { ...last, text: text.slice(0, idx) };
        }
        return copy;
      });
      if (idx >= text.length) {
        clearInterval(interval);
        setLines(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.typing) {
            copy[copy.length - 1] = { text, type };
          }
          return copy;
        });
        cb?.();
      }
    }, 8);
    return () => clearInterval(interval);
  }, []);

  const showBanner = useCallback(() => {
    const banner = [
      '╔══════════════════════════════════════════════════════╗',
      '║                                                     ║',
      '║         S I S A Y   T E M E S G E N                 ║',
      '║     Full Stack Developer & AI Enthusiast            ║',
      '║                                                     ║',
      '╚══════════════════════════════════════════════════════╝',
      '',
      'Welcome to my interactive terminal portfolio.',
      'Type \'help\' to see available commands.',
      '',
    ];
    banner.forEach((line, i) => {
      setTimeout(() => addLine(line, i === 0 ? 'banner' : 'output'), i * 60);
    });
    return banner.length * 60;
  }, [addLine]);

  useEffect(() => {
    const bootMsgs = [
      'Initializing portfolio...',
      'Loading modules...',
      'Establishing connection...',
      'Welcome, user!',
    ];
    let delay = 0;
    bootMsgs.forEach((msg, i) => {
      delay += 350;
      setTimeout(() => addLine(msg, 'boot'), delay);
    });
    delay += 500;
    setTimeout(() => {
      setBootDone(true);
      showBanner();
    }, delay);
  }, [addLine, showBanner]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (bootDone && !projectsLoaded) {
      const loadProjects = async () => {
        try {
          const { data } = await publicApi.getProjects();
          setProjects(data.data || []);
        } catch {
          // silently fail
        } finally {
          setProjectsLoaded(true);
        }
      };
      loadProjects();
    }
  }, [bootDone, projectsLoaded]);

  const openProject = (project) => {
    if (project?._id) {
      navigate(`/project/${project._id}`);
      onClose();
    }
  };

  const commands = {
    help: () => {
      addTypedLine('Available commands:', 'highlight');
      const cmdList = [
        { cmd: 'about', desc: 'About me' },
        { cmd: 'banner', desc: 'Show banner' },
        { cmd: 'clear', desc: 'Clear terminal' },
        { cmd: 'contact', desc: 'Contact info' },
        { cmd: 'help', desc: 'Show this help' },
        { cmd: 'open', desc: 'View project detail' },
        { cmd: 'projects', desc: 'Show projects' },
        { cmd: 'skills', desc: 'Show skills' },
        { cmd: 'social', desc: 'Social links' },
        { cmd: 'whoami', desc: 'Who I am' },
      ];
      cmdList.forEach((c, i) => {
        setTimeout(() => addLine(`  ${c.cmd.padEnd(14)}${c.desc}`, 'output'), 100 + i * 40);
      });
    },
    about: () => {
      addTypedLine('About Me', 'highlight');
      setTimeout(() => addLine(`Name:     ${aboutData.name}`, 'output'), 200);
      setTimeout(() => addLine(`Role:     ${aboutData.role}`, 'output'), 300);
      setTimeout(() => addLine(`Education: ${aboutData.education}`, 'output'), 400);
      setTimeout(() => addLine('', 'output'), 450);
      setTimeout(() => addTypedLine(aboutData.bio, 'output'), 550);
    },
    skills: () => {
      addTypedLine('Technical Skills', 'highlight');
      let delay = 200;
      Object.entries(skillsData).forEach(([category, items]) => {
        setTimeout(() => {
          addLine(`  ${category.charAt(0).toUpperCase() + category.slice(1)}:  ${items.join(', ')}`, 'output');
        }, delay);
        delay += 120;
      });
    },
    projects: () => {
      addTypedLine('Projects', 'highlight');
      if (!projectsLoaded) {
        setTimeout(() => addLine('  Loading projects...', 'dim'), 200);
      } else if (projects.length === 0) {
        setTimeout(() => addLine('  No projects found.', 'output'), 200);
      } else {
        projects.forEach((p, i) => {
          const delay = 200 + i * 300;
          setTimeout(() => addLine(`  ${i + 1}. ${p.title}`, 'project-link', () => openProject(p)), delay);
          setTimeout(() => addLine(`     ${p.description}`, 'output'), delay + 80);
          setTimeout(() => addLine(`     Tech: ${(p.technologies || p.techs || []).join(', ')}`, 'dim'), delay + 160);
          if (i < projects.length - 1) setTimeout(() => addLine('', 'output'), delay + 200);
        });
      }
      const len = projects.length || 0;
      setTimeout(() => addLine('', 'output'), 200 + len * 300 + 300);
      setTimeout(() => addLine("  Type 'open <number>' or click a project to view details.", 'dim'), 200 + len * 300 + 350);
    },
    contact: () => {
      addTypedLine('Contact Information', 'highlight');
      setTimeout(() => addLine('  Email:    sisay3575@gmail.com', 'output'), 200);
      setTimeout(() => addLine('  GitHub:   https://github.com/Sis3575-T', 'output'), 300);
      setTimeout(() => addLine('  LinkedIn: linkedin.com/in/sisay-temesgen', 'output'), 400);
    },
    social: () => {
      addTypedLine('Social Links', 'highlight');
      setTimeout(() => addLine('  GitHub   -> https://github.com/Sis3575-T', 'output'), 200);
      setTimeout(() => addLine('  LinkedIn -> linkedin.com/in/sisay-temesgen', 'output'), 300);
      setTimeout(() => addLine('  Twitter  -> twitter.com', 'output'), 400);
      setTimeout(() => addLine('  Email    -> sisay3575@gmail.com', 'output'), 500);
    },
    whoami: () => {
      addTypedLine(`${aboutData.name}`, 'highlight');
      setTimeout(() => addLine(`${aboutData.role}`, 'output'), 200);
      setTimeout(() => addLine(`${aboutData.education}`, 'output'), 300);
    },
    banner: () => {
      showBanner();
    },
    clear: () => {
      setLines([]);
      setBootDone(true);
      setTimeout(() => showBanner(), 100);
    },
  };

  const execute = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    addLine(`> ${trimmed}`, 'command');
    setCmdHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.toLowerCase().split(/\s+/);
    const base = parts[0];

    if (base === 'clear') {
      setTimeout(() => {
        setLines([]);
        setBootDone(true);
        setTimeout(() => showBanner(), 100);
      }, 100);
      return;
    }

    if (base === 'open') {
      const num = parseInt(parts[1]);
      if (!isNaN(num) && num >= 1 && num <= projects.length) {
        openProject(projects[num - 1]);
      } else {
        addTypedLine(`Usage: open <number> (1-${projects.length || 0})`, 'error');
      }
      return;
    }

    if (commands[base]) {
      commands[base]();
    } else {
      addTypedLine(`Command not found: '${base}'. Type 'help'`, 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(newIdx);
      setInput(cmdHistory[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <motion.div
      className="terminal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleContainerClick}
    >
      <div className="terminal-window" onClick={e => e.stopPropagation()}>
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
          </div>
          <span className="terminal-title">
            <FaTerminal size={12} /> Terminal — sisay@portfolio:~$
          </span>
          <button className="terminal-close" onClick={onClose} aria-label="Close terminal">
            <FaTimes size={14} />
          </button>
        </div>

        <div className="terminal-body">
          {lines.map((line, i) => (
            <div key={i} className={`terminal-line terminal-line-${line.type || 'output'}`} onClick={line.onClick} style={line.onClick ? { cursor: 'pointer' } : undefined}>
              {line.text}
              {line.typing && <span className="terminal-cursor-blink">▊</span>}
            </div>
          ))}

          {!bootDone && (
            <div className="terminal-line terminal-line-boot">
              <span className="terminal-cursor-blink">▊</span>
            </div>
          )}

          {bootDone && (
            <div className="terminal-input-line">
              <span className="terminal-prompt">$ </span>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>
    </motion.div>
  );
}

export default Terminal;
