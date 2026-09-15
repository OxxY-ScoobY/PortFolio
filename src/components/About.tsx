import React from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';

export const About: React.FC = () => {
  return (
    <section id="about" className="about-section scroll-reveal">
      <div className="section-header">
        <h2 className="section-title">About Me</h2>
        <div className="section-divider"></div>
      </div>

      <div className="about-info-container">
        <div className="about-info">
          <h3 className="about-subtitle print-hide">Professional Summary</h3>
          <p className="about-text">
            I am a dedicated Computer Science & Engineering graduate (2026) with a passion for designing and
            implementing full-stack software solutions. My experience ranges from crafting responsive client
            interfaces to architecting high-performance backend pipelines, working extensively with
            frameworks like <strong>FastAPI</strong>, <strong>Flask</strong>, and <strong>Angular</strong>.
          </p>
          <p className="about-text">
            I enjoy working at the intersection of web technology and the physical world—having successfully
            implemented IoT systems powered by Raspberry Pi, loaded with Computer Vision models (YOLOv8) and
            weight sensors to automate supermarket shopping workflows.
          </p>

          <div className="languages-box">
            <span className="languages-title">Languages:</span>
            <div className="languages-list">
              {PERSONAL_INFO.languages.map((lang) => (
                <span key={lang.name} className="lang-badge">
                  {lang.name} ({lang.level})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
