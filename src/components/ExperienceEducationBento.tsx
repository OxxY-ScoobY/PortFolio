import React from 'react';
import { motion } from 'framer-motion';
import { EXPERIENCE_DATA, EDUCATION_DATA } from '../data/portfolioData';
import { Briefcase, GraduationCap } from 'lucide-react';

export const ExperienceEducationBento: React.FC = () => {
  return (
    <section id="experience" className="bento-section">
      <div className="bento-grid">
        {/* Work Experience Bento Card (Span 7) */}
        <motion.div
          className="bento-card col-span-7"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -3 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Briefcase color="#6366f1" size={22} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
              Work Experience
            </h3>
          </div>

          {EXPERIENCE_DATA.map((exp, idx) => (
            <div key={idx} className="bento-timeline-item">
              <div className="bento-timeline-dot"></div>
              <div className="bento-timeline-date">{exp.duration} • {exp.location}</div>
              <div className="bento-timeline-title">{exp.title}</div>
              <div className="bento-timeline-subtitle">{exp.company} ({exp.badge})</div>

              <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} style={{ marginBottom: '6px' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Education History Bento Card (Span 5) */}
        <motion.div
          id="education"
          className="bento-card col-span-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -3 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <GraduationCap color="#10b981" size={22} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
              Education
            </h3>
          </div>

          {EDUCATION_DATA.map((edu, idx) => (
            <div key={idx} className="bento-timeline-item">
              <div className="bento-timeline-dot" style={{ background: '#10b981', boxShadow: '0 0 15px #10b981' }}></div>
              <div className="bento-timeline-date">{edu.duration}</div>
              <div className="bento-timeline-title">{edu.degree}</div>
              <div className="bento-timeline-subtitle">{edu.school}</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{edu.score}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
