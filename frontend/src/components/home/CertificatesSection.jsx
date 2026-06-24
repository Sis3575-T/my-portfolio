import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiDownload, FiAward, FiCheck } from 'react-icons/fi';
import { publicApi, imageUrl } from '../../utils/api';

const fallbackCertificates = [
  {
    _id: '1',
    title: 'JavaScript Algorithms and Data Structures',
    issuer: 'freeCodeCamp',
    image: null,
    credentialUrl: 'https://www.freecodecamp.org/certification/',
    date: '2024',
  },
  {
    _id: '2',
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    image: null,
    credentialUrl: 'https://www.freecodecamp.org/certification/',
    date: '2023',
  },
];

function CertificatesSection() {
  const [certificates, setCertificates] = useState(fallbackCertificates);

  useEffect(() => {
    publicApi.getCertificates().then((res) => {
      if (res.data?.data?.length > 0) {
        setCertificates(res.data.data.map(c => ({
          ...c,
          image: c.image ? imageUrl(c.image) : null,
        })));
      }
    }).catch(() => {});
  }, []);

  if (!certificates.length) return null;

  return (
    <section id="certificates" className="section">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <span className="section-tag">Certificates</span>
          <h2 className="section-title">Certifications</h2>
          <p className="section-subtitle">
            Professional certifications that validate my skills and knowledge.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, idx) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="hover-card"
            >
              <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-200">
                {cert.image ? (
                  <img src={cert.image} alt={cert.title} className="w-full h-full object-contain p-4" />
                ) : (
                  <FiAward size={48} className="text-gray-300" />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{cert.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{cert.issuer}</p>
                {cert.date && (
                  <p className="text-xs text-gray-400 mb-3">{cert.date}</p>
                )}
                <div className="flex items-center gap-2">
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="btn btn-ghost text-xs !py-1 !px-2.5">
                      <FiExternalLink size={11} /> Verify
                    </a>
                  )}
                  {cert.fileUrl && (
                    <a href={cert.fileUrl} download className="btn btn-ghost text-xs !py-1 !px-2.5">
                      <FiDownload size={11} /> Download
                    </a>
                  )}
                  {!cert.credentialUrl && !cert.fileUrl && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <FiCheck size={12} /> Completed
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificatesSection;
