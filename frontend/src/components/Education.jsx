import React from 'react';

function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function Education({ education, sectionTitle, sectionSubtitle }) {
  if (!education || education.length === 0) return null;

  return (
    <section className="education section" id="education">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Education'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="education-grid">
          {education.map(item => (
            <div key={item._id} className="education-card">
              <div className="education-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="education-degree">{item.degree}</h3>
              <p className="education-field">{item.field}</p>
              <p className="education-school">{item.institution}</p>
              <div className="education-meta">
                <span className="education-date">
                  {formatDate(item.startDate)} — {item.current ? 'Present' : formatDate(item.endDate)}
                </span>
                {item.gpa && <span className="education-gpa">GPA: {item.gpa}</span>}
              </div>
              {item.description && <p className="education-desc">{item.description}</p>}
              {item.achievements && item.achievements.length > 0 && (
                <ul className="education-achievements">
                  {item.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Education;
