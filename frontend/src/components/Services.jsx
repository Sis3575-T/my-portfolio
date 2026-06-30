import React from 'react';

function Services({ services }) {
  if (!services || services.length === 0) return null;

  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Services</h2>
          <div className="section-divider" />
        </div>
        <div className="services-grid">
          {services.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-icon">
                {service.icon ? (
                  <img src={service.icon.startsWith('http') ? service.icon : service.icon} alt={service.title} className="service-icon-img" />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
