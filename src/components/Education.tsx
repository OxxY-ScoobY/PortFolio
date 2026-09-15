import React from 'react';
import { EDUCATION_DATA } from '../data/portfolioData';

export const Education: React.FC = () => {
  return (
    <section id="education" className="education-section scroll-reveal">
      <div className="section-header">
        <h2 className="section-title">Education</h2>
        <div className="section-divider"></div>
      </div>
      <div className="education-container-wrapper">
        <div className="education-container">
          <div className="education-timeline">
            {EDUCATION_DATA.map((item, idx) => (
              <div key={idx} className="edu-card scroll-reveal-item">
                <div className="edu-dot"></div>
                <div className="edu-header">
                  <span className="edu-duration">{item.duration}</span>
                  <h4 className="edu-degree">{item.degree}</h4>
                </div>
                <p className="edu-school">{item.school}</p>
                <p className="edu-score">{item.score}</p>
                {item.coursework && (
                  <div className="edu-coursework">
                    <strong>Coursework:</strong> {item.coursework}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
