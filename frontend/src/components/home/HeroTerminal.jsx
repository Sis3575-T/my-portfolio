import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTerminal } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../../utils/api';

const aboutData = {
  name: 'Sisay Temesgen',
  role: 'Full Stack Developer & AI Enthusiast',
  education: 'B.Sc. Computer Science at Bahir Dar University',
  bio: 'Passionate about building modern web applications with clean architecture. I specialize in the MERN stack and love exploring AI/ML technologies.',
};

const skillsData = {
  Frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
  Backend: ['Node.js', 'Express', 'REST APIs'],
  Database: ['MongoDB', 'PostgreSQL'],
  Tools: ['Git', 'GitHub', 'Vite', 'VS Code', 'Docker'],
};

const bootLines = [
  { text: '> Initializing portfolio...', delay: 300 },
  { text: '> Loading developer profile...', delay: 600 },
  { text: '> Connection established.', delay: 900 },
  { text: '', delay: 150 },
  { text: '  Name:     Sisay Temesgen', delay: 1100 },
  { text: '  Role:     Full Stack Developer', delay: 1300 },
  { text: '  Location: Bahir Dar, Ethiopia', delay: 1500 },
  { text: '  Email:    sisay3575@gmail.com', delay: 1700 },
  { text: '', delay: 150 },
  { text: '> Type "help" for available commands', delay: 2000 },
];

function HeroTerminal() {
  const navigate = useNavigate();
  const [bootLines_, setBootLines_] = useState([]);
  const [bootDone, setBootDone] = useState(false);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [projects, setProjects] = useState([]);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    let totalDelay = 0;
    const timers = [];
    bootLines.forEach((line) => {
      totalDelay += line.delay;
      const timer = setTimeout(() => {
        setBootLines_(prev => [...prev, line.text]);
      }, totalDelay);
      timers.push(timer);
    });
    const doneTimer = setTimeout(() => {
      setBootDone(true);
      setLines([{ text: '> Terminal ready. Type a command.', type: 'output' }]);
    }, totalDelay + 300);
    timers.push(doneTimer);
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [bootLines_, lines]);

  useEffect(() => {
    if (bootDone && inputRef.current) {
      inputRef.current.focus();
    }
  }, [bootDone]);

  useEffect(() => {
    if (!bootDone) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await publicApi.getProjects();
        if (!cancelled) setProjects(data.data || []);
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, [bootDone]);

  const addLine = useCallback((text, type = 'output') => {
    setLines(prev => [...prev, { text, type }]);
  }, []);

  const openProject = (project) => {
    if (project?._id) {
      navigate(`/project/${project._id}`);
    }
  };

  const commands = {
    help: () => {
      addLine('Available commands:', 'highlight');
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
      cmdList.forEach((c) => addLine(`  ${c.cmd.padEnd(14)}${c.desc}`, 'output'));
    },
    about: () => {
      addLine('About Me', 'highlight');
      addLine(`Name:     ${aboutData.name}`, 'output');
      addLine(`Role:     ${aboutData.role}`, 'output');
      addLine(`Education: ${aboutData.education}`, 'output');
      addLine('', 'output');
      addLine(aboutData.bio, 'output');
    },
    skills: () => {
      addLine('Technical Skills', 'highlight');
      Object.entries(skillsData).forEach(([category, items]) => {
        addLine(`  ${category}:  ${items.join(', ')}`, 'output');
      });
    },
    projects: () => {
      addLine('Projects', 'highlight');
      if (projects.length === 0) {
        addLine('  No projects found.', 'output');
      } else {
        projects.forEach((p, i) => {
          addLine(`  ${i + 1}. ${p.title}`, 'project-link');
          addLine(`     ${p.description}`, 'output');
          addLine(`     Tech: ${(p.technologies || []).join(', ')}`, 'dim');
        });
      }
      addLine('', 'output');
      addLine('  Type "open &lt;number&gt;" to view project details.', 'dim');
    },
    contact: () => {
      addLine('Contact Information', 'highlight');
      addLine('  Email:    sisay3575@gmail.com', 'output');
      addLine('  GitHub:   https://github.com/Sis3575-T', 'output');
      addLine('  LinkedIn: linkedin.com/in/sisay-temesgen', 'output');
    },
    social: () => {
      addLine('Social Links', 'highlight');
      addLine('  GitHub   -> https://github.com/Sis3575-T', 'output');
      addLine('  LinkedIn -> linkedin.com/in/sisay-temesgen', 'output');
      addLine('  Email    -> sisay3575@gmail.com', 'output');
    },
    whoami: () => {
      addLine(`${aboutData.name}`, 'highlight');
      addLine(`${aboutData.role}`, 'output');
      addLine(`${aboutData.education}`, 'output');
    },
    banner: () => {
      addLine('╔════════════════════════════════════════╗', 'banner');
      addLine('║    S I S A Y   T E M E S G E N       ║', 'banner');
      addLine('║  Full Stack Developer & AI Enthusiast ║', 'banner');
      addLine('╚════════════════════════════════════════╝', 'banner');
    },
    clear: () => {
      setLines([]);
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
      setLines([]);
      return;
    }

    if (base === 'open') {
      const num = parseInt(parts[1]);
      if (!isNaN(num) && num >= 1 && num <= projects.length) {
        openProject(projects[num - 1]);
      } else {
        addLine(`Usage: open <number> (1-${projects.length || 0})`, 'error');
      }
      return;
    }

    if (commands[base]) {
      commands[base]();
    } else {
      addLine(`Command not found: '${base}'. Type 'help'`, 'error');
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

  return (
    <div className="hero-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="hero-terminal-header">
        <div className="hero-terminal-dots">
          <span className="hero-terminal-dot red" />
          <span className="hero-terminal-dot yellow" />
          <span className="hero-terminal-dot green" />
        </div>
        <span className="hero-terminal-title">
          <FaTerminal size={11} /> sisay@portfolio:~
        </span>
      </div>
      <div className="hero-terminal-body" ref={bodyRef}>
        {bootLines_.map((text, i) => (
          <div key={`boot-${i}`} className={`hero-terminal-line ${text.startsWith('>') ? 'hero-terminal-prompt' : 'hero-terminal-output'}`}>
            {text}
          </div>
        ))}
        {bootDone && lines.map((line, i) => (
          <div
            key={`line-${i}`}
            className={`hero-terminal-line ${line.type === 'command' ? 'hero-terminal-command' : line.type === 'highlight' ? 'hero-terminal-highlight' : line.type === 'dim' ? 'hero-terminal-dim' : line.type === 'error' ? 'hero-terminal-error' : line.type === 'project-link' ? 'hero-terminal-project' : line.type === 'banner' ? 'hero-terminal-banner' : 'hero-terminal-output'}`}
            onClick={line.type === 'project-link' ? () => {
              const idx = lines.filter(l => l.type === 'project-link').indexOf(line);
              if (idx >= 0 && idx < projects.length) openProject(projects[idx]);
            } : undefined}
            style={line.type === 'project-link' ? { cursor: 'pointer' } : undefined}
          >
            {line.text}
          </div>
        ))}
        {bootDone && (
          <div className="hero-terminal-input-line">
            <span className="hero-terminal-prompt-symbol">$ </span>
            <input
              ref={inputRef}
              type="text"
              className="hero-terminal-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroTerminal;
