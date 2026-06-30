import React from 'react';
import { getImageUrl } from '../api';

function About({ settings }) {
  if (!settings) return null;
  const { profilePhoto, shortBio, longBio, professionalTitle, name, city, country, yearsOfExperience, freelanceAvailable, email } = settings;

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">About Me</h2>
          <div className="section-divider" />
        </div>
        <div className="about-content">
          <div className="about-image-col">
            <div className="about-image-wrapper">
              {profilePhoto ? (
                <img src={getImageUrl(profilePhoto)} alt={name || 'About'} className="about-image" />
              ) : (
                <div className="about-image-placeholder">
                  {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ME'}
                </div>
              )}
            </div>
          </div>
          <div className="about-text-col">
            {name && <h3 className="about-name">{name}</h3>}
            {professionalTitle && <p className="about-role">{professionalTitle}</p>}
            {longBio ? <p className="about-bio">{longBio}</p> : shortBio && <p className="about-bio">{shortBio}</p>}
            <div className="about-stats-grid">
              {yearsOfExperience && (
                <div className="about-stat">
                  <span className="about-stat-number">{yearsOfExperience}</span>
                  <span className="about-stat-label">Years Experience</span>
                </div>
              )}
              {freelanceAvailable !== undefined && (
                <div className="about-stat">
                  <span className="about-stat-number">{freelanceAvailable ? 'Yes' : 'No'}</span>
                  <span className="about-stat-label">Freelance</span>
                </div>
              )}
              {city && country && (
                <div className="about-stat">
                  <span className="about-stat-number">{city}</span>
                  <span className="about-stat-label">{country}</span>
                </div>
              )}
              {email && (
                <div className="about-stat">
                  <span className="about-stat-number">Contact</span>
                  <span className="about-stat-label">Email Me</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
