import { motion } from 'framer-motion';
import profilePhoto from '../assets/images/profile-photo.jpg';
import './About.css';

const cvUrl = 'https://portfolio2-sigma-pink.vercel.app/cv.pdf';
const googleViewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}`;

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const About = () => {
  const facts = [
    { icon: '🎓', label: 'Degree', value: 'B.Sc. Computer Science' },
    { icon: '🏫', label: 'University', value: 'Bahir Dar University' },
    { icon: '📍', label: 'Location', value: 'Bahir Dar, Ethiopia' },
    { icon: '💼', label: 'Focus', value: 'Full Stack Development' },
    { icon: '🤖', label: 'Interest', value: 'AI & Machine Learning' },
    { icon: '🌐', label: 'Languages', value: 'Amharic · English' },
  ];

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-layout">
          {/* Photo column */}
          <motion.div className="about-photo-col" {...inView(0)}>
            <div className="about-photo-frame">
              <img src={profilePhoto} alt="Sisay Temesgen" />
              <div className="about-photo-overlay" />
            </div>
            <div className="about-photo-card">
              <span className="about-photo-card-icon">👋</span>
              <div>
                <p className="about-photo-card-title">Open to Work</p>
                <p className="about-photo-card-sub">Internships & Full-time</p>
              </div>
            </div>
          </motion.div>

          {/* Content column */}
          <div className="about-content-col">
            <motion.div {...inView(0.05)}>
              <p className="section-tag">Who I Am</p>
              <h2 className="section-title">Passionate developer,<br />lifelong learner.</h2>
            </motion.div>

            <motion.p className="about-bio" {...inView(0.1)}>
              I'm a Computer Science student at Bahir Dar University with a deep passion for
              building modern, accessible web applications. My journey started with curiosity
              about how the web works — and has grown into a commitment to crafting software
              that makes a real difference.
            </motion.p>

            <motion.p className="about-bio" {...inView(0.15)}>
              I'm actively exploring AI and machine learning to expand my technical expertise.
              I believe great software is not just functional — it's intuitive, fast, and
              accessible to everyone, everywhere.
            </motion.p>

            {/* Facts grid */}
            <motion.div className="about-facts" {...inView(0.2)}>
              {facts.map((f, i) => (
                <div className="about-fact" key={i}>
                  <span className="fact-icon">{f.icon}</span>
                  <div>
                    <p className="fact-label">{f.label}</p>
                    <p className="fact-value">{f.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Actions */}
            <motion.div className="about-actions" {...inView(0.25)}>
              <a href="mailto:sisay3575@gmail.com" className="btn btn-primary">Hire Me</a>
              <a
                href="https://github.com/Sis3575-T"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                GitHub Profile
              </a>
              <div className="cv-inline">
                <span>📄</span>
                <a href={googleViewUrl} target="_blank" rel="noopener noreferrer">View CV</a>
                <span className="cv-sep">·</span>
                <a href={cvUrl} download="Sisay_Temesgen_CV.pdf">Download</a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
