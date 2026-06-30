import React, { useState, useMemo } from 'react';

function Skills({ skills, sectionTitle, sectionSubtitle }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    return ['All', ...new Set(skills.map((s) => s.category).filter(Boolean))];
  }, [skills]);

  const filtered = useMemo(() => {
    if (!skills) return [];
    if (activeCategory === 'All') return skills;
    return skills.filter((s) => s.category === activeCategory);
  }, [skills, activeCategory]);

  if (!skills || skills.length === 0) return null;

  return (
    <section className="skills section" id="skills">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Skills & Technologies'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        {categories.length > 1 && (
          <div className="skills-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`skills-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="skills-grid">
          {filtered.map((skill) => (
            <div key={skill._id} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percent">{skill.proficiency}%</span>
              </div>
              <div className="skill-bar">
                <div className="skill-bar-fill" style={{ width: `${skill.proficiency}%` }} />
              </div>
              <p className="skill-description">
                {skill.description || `Practical experience with ${skill.name} in modern web development workflows.`}
              </p>
              {skill.projectsUsed && (
                <span className="skill-projects">Used in: {skill.projectsUsed}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
