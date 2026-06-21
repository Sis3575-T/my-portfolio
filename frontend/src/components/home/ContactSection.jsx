import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaPaperPlane, FaCheck, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_w8l2h6v';
const EMAILJS_TEMPLATE_ID = 'template_kj2fx4o';
const EMAILJS_PUBLIC_KEY = 'ovBEFSKgggx5XF6Qk';

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          from_phone: form.phone,
          subject: 'Contact Form Submission',
          message: form.message,
          to_email: 'sisay3575@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError('Failed to send. Please email me directly at sisay3575@gmail.com');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">Contact</span>
          <h2 className="section-title">Get In Touch</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            Open to internships, freelance work, and development roles. Reach out to discuss how
            I can contribute to your next project.
          </p>
        </motion.div>

        <div className="contact-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="contact-info"
          >
            <h3 className="contact-heading">Let's Work Together</h3>
            <p className="contact-text">
              Have a project in mind or just want to say hello? Feel free to reach out.
              I'm always open to discussing new opportunities, collaborations, or
              interesting tech conversations.
            </p>

            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <span className="detail-label">Email</span>
                  <a href="mailto:sisay3575@gmail.com" className="detail-value link">
                    sisay3575@gmail.com
                  </a>
                </div>
              </div>
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <FaPhone size={16} />
                </div>
                <div>
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">+251 935 756 054</span>
                </div>
              </div>
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <FaMapMarkerAlt size={16} />
                </div>
                <div>
                  <span className="detail-label">Location</span>
                  <span className="detail-value">Bahir Dar, Ethiopia</span>
                </div>
              </div>
            </div>

            <div className="social-links">
              <a href="https://github.com/Sis3575-T" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
                <FaGithub size={18} />
              </a>
              <a href="https://linkedin.com/in/sisay-temesgen" target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
                <FaLinkedin size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Twitter">
                <FaTwitter size={18} />
              </a>
              <a href="mailto:sisay3575@gmail.com" className="social-link" aria-label="Email">
                <FaEnvelope size={18} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="contact-form-wrapper"
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+251 XXX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell me about your project or opportunity..."
                  rows={5}
                />
              </div>
              {error && (
                <div className="form-status error">{error}</div>
              )}
              <button
                type="submit"
                disabled={sending}
                className="submit-btn"
              >
                {sending ? (
                  <><FaSpinner className="spinner" /> Sending...</>
                ) : submitted ? (
                  <><FaCheck /> Message Sent</>
                ) : (
                  <><FaPaperPlane /> Send Message</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
