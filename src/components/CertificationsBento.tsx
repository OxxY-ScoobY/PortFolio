import React from 'react';
import { motion } from 'framer-motion';
import { CERTIFICATIONS_DATA, ACHIEVEMENTS_DATA } from '../data/portfolioData';
import { Award, Trophy } from 'lucide-react';

export const CertificationsBento: React.FC = () => {
  return (
    <section id="certifications" className="bento-section">
      <div className="bento-grid">
        {/* Certifications Bento Card (Span 8) */}
        <motion.div
          className="bento-card col-span-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -3 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Award color="#38bdf8" size={22} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
              Certifications & Qualifications
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {CERTIFICATIONS_DATA.map((cert, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px'
                }}
              >
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {cert.title}
                </h4>
                <div style={{ color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  {cert.issuer}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cert.detail}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Bento Card (Span 4) */}
        <motion.div
          id="achievements"
          className="bento-card col-span-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -3 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Trophy color="#f59e0b" size={22} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
              Achievements
            </h3>
          </div>

          <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.65' }}>
            {ACHIEVEMENTS_DATA.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};
