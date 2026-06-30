import React from 'react';

function Services({ services, sectionTitle, sectionSubtitle }) {
  if (!services || services.length === 0) return null;

  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Services'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service._id} className="service-card">
              <div className="service-icon">
                {service.icon ? (
                  <span>{service.icon}</span>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                )}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
              {service.features && service.features.length > 0 && (
                <ul className="service-features">
                  {service.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
              {service.technologyStack && service.technologyStack.length > 0 && (
                <div className="service-stack">
                  {service.technologyStack.map((tech) => (
                    <span key={tech} className="service-stack-pill">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
