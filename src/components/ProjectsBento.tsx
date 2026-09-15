import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS_DATA } from '../data/portfolioData';
import type { Project } from '../data/portfolioData';
import { ArrowRight, X, Layers } from 'lucide-react';

export const ProjectsBento: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="projects" className="bento-section">
      <h2 className="bento-section-title">
        <span className="accent-dot"></span> Featured Software Projects
      </h2>

      <div className="bento-grid">
        {PROJECTS_DATA.map((project, idx) => (
          <motion.div
            key={project.id}
            className="bento-card col-span-6 project-bento-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div>
              <div className="project-bento-header">
                <div className="project-bento-tags">
                  {project.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="project-bento-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="project-bento-title">{project.title}</h3>
                <p className="project-bento-excerpt">{project.excerpt}</p>
              </div>

              <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                {project.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} style={{ marginBottom: '6px' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button
                className="btn-project-explore"
                onClick={() => setSelectedProject(project)}
              >
                <Layers size={16} />
                <span>Explore Architecture Diagram</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Architecture Modal Overlay */}
      {selectedProject && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button className="modal-close" onClick={() => setSelectedProject(null)}>
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                {selectedProject.architectureDetails.subtitle}
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginTop: '4px', color: 'var(--text-main)' }}>
                {selectedProject.title}
              </h2>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.65' }}>
              <p style={{ marginBottom: '16px' }}>{selectedProject.architectureDetails.description}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {selectedProject.architectureDetails.detailsList.map((item, dIdx) => (
                  <li key={dIdx} style={{ marginBottom: '12px', position: 'relative', paddingLeft: '20px' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--primary)' }}>➔</span>
                    <strong style={{ color: 'var(--text-main)' }}>{item.label}:</strong> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};
