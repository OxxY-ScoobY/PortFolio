import React from 'react';
import { SKILLS_ROW_1, SKILLS_ROW_2 } from '../data/portfolioData';

export const Skills: React.FC = () => {
  // Duplicate arrays to create flawless infinite marquee loop
  const marquee1 = [...SKILLS_ROW_1, ...SKILLS_ROW_1];
  const marquee2 = [...SKILLS_ROW_2, ...SKILLS_ROW_2];

  return (
    <section id="skills" className="skills-section scroll-reveal">
      <div className="section-header">
        <h2 className="section-title">Technical Skills</h2>
        <div className="section-divider"></div>
      </div>

      <div className="skills-marquee-container scroll-reveal-item">
        {/* Row 1: Left scrolling */}
        <div className="skills-marquee-wrapper">
          <div className="skills-marquee-track">
            {marquee1.map((skill, idx) => (
              <div key={idx} className="skill-logo-card">
                <div className="skill-logo-icon">
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: skill.color || '#6FD6FF'
                    }}
                  >
                    ⚡
                  </span>
                </div>
                <span className="skill-logo-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Right scrolling */}
        <div className="skills-marquee-wrapper">
          <div className="skills-marquee-track-reverse">
            {marquee2.map((skill, idx) => (
              <div key={idx} className="skill-logo-card">
                <div className="skill-logo-icon">
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: skill.color || '#BFF098'
                    }}
                  >
                    🚀
                  </span>
                </div>
                <span className="skill-logo-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
