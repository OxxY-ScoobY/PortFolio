import React from 'react';
import { EXPERIENCE_DATA } from '../data/portfolioData';
import { Calendar, MapPin } from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="experience-section scroll-reveal">
      <div className="section-header">
        <h2 className="section-title">Work Experience</h2>
        <div className="section-divider"></div>
      </div>

      <div className="experience-timeline-container">
        {EXPERIENCE_DATA.map((exp, idx) => (
          <div key={idx} className="exp-timeline-item">
            <div className="exp-badge">{exp.badge}</div>
            <div className="exp-details-card scroll-reveal-item">
              <div className="exp-header">
                <div>
                  <h3 className="exp-title">{exp.title}</h3>
                  <a href={exp.companyUrl || '#'} className="exp-company">
                    {exp.company}
                  </a>
                </div>
                <div className="exp-date-loc">
                  <span className="exp-date">
                    <Calendar size={14} style={{ marginRight: '4px' }} />
                    {exp.duration}
                  </span>
                  <span className="exp-loc">
                    <MapPin size={14} style={{ marginRight: '4px' }} />
                    {exp.location}
                  </span>
                </div>
              </div>

              <ul className="exp-bullets">
                {exp.bullets.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>

              <div className="exp-tech-tags">
                {exp.techTags.map((t, tIdx) => (
                  <span key={tIdx} className="tech-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
