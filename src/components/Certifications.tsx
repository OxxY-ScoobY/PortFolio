import React from 'react';
import { CERTIFICATIONS_DATA, ACHIEVEMENTS_DATA } from '../data/portfolioData';
import { Award, Box, ShieldCheck, Monitor } from 'lucide-react';

export const Certifications: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'award':
        return <Award size={24} color="#00f2fe" />;
      case 'box':
        return <Box size={24} color="#00f2fe" />;
      case 'shield':
        return <ShieldCheck size={24} color="#00f2fe" />;
      case 'monitor':
        return <Monitor size={24} color="#00f2fe" />;
      default:
        return <Award size={24} color="#00f2fe" />;
    }
  };

  return (
    <>
      <section id="certifications" className="certifications-section scroll-reveal">
        <div className="section-header">
          <h2 className="section-title">Certifications</h2>
          <div className="section-divider"></div>
        </div>

        <div className="certifications-grid">
          {CERTIFICATIONS_DATA.map((cert, idx) => (
            <div key={idx} className="cert-card scroll-reveal-item">
              <div className="cert-icon-wrapper">{getIcon(cert.iconType)}</div>
              <div className="cert-content">
                <h4>{cert.title}</h4>
                <p className="cert-issuer">{cert.issuer}</p>
                <span className="cert-tag-detail">{cert.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="achievements" className="achievements-section scroll-reveal">
        <div className="section-header">
          <h2 className="section-title">Achievements & Activities</h2>
          <div className="section-divider"></div>
        </div>
        <div className="achievements-content scroll-reveal-item">
          <ul className="achievements-list">
            {ACHIEVEMENTS_DATA.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};
