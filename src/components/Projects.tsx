import React, { useState } from 'react';
import { PROJECTS_DATA } from '../data/portfolioData';
import type { Project } from '../data/portfolioData';
import { ArrowRight, X } from 'lucide-react';

export const Projects: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'iot' | 'web'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = PROJECTS_DATA.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  return (
    <section id="projects" className="projects-section scroll-reveal">
      <div className="section-header">
        <h2 className="section-title">Projects</h2>
        <div className="section-divider"></div>
      </div>

      {/* Projects Filter Bar */}
      <div className="projects-filter-bar scroll-reveal-item">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Projects
        </button>
        <button
          className={`filter-btn ${activeFilter === 'iot' ? 'active' : ''}`}
          onClick={() => setActiveFilter('iot')}
        >
          IoT & CV
        </button>
        <button
          className={`filter-btn ${activeFilter === 'web' ? 'active' : ''}`}
          onClick={() => setActiveFilter('web')}
        >
          Web & Full-Stack
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card scroll-reveal-item" data-category={project.category}>
            <div className="project-img-container">
              <div className={`project-glow-accent ${project.id === 'grabngo' ? 'yellow-glow' : ''}`}></div>
              <svg className="project-card-svg" viewBox="0 0 120 120" width="100%" height="100%">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="rgba(191, 240, 152, 0.05)"
                  stroke="rgba(191, 240, 152, 0.15)"
                  strokeWidth="2"
                />
                {project.id === 'cartify' ? (
                  <>
                    <path
                      d="M35 40h10l10 35h30l8-25H50"
                      fill="none"
                      stroke="#BFF098"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="58" cy="83" r="5" fill="#6FD6FF" />
                    <circle cx="82" cy="83" r="5" fill="#6FD6FF" />
                    <line
                      x1="45"
                      y1="50"
                      x2="95"
                      y2="50"
                      stroke="#6FD6FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </>
                ) : (
                  <>
                    <rect x="42" y="30" width="36" height="60" rx="6" fill="none" stroke="#6FD6FF" strokeWidth="3" />
                    <line x1="50" y1="36" x2="70" y2="36" stroke="#BFF098" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="60" cy="55" r="5" fill="#BFF098" />
                    <path d="M60 60v8" stroke="#BFF098" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </div>

            <div className="project-body">
              <div className="project-tags">
                {project.tags.map((tag, idx) => (
                  <span key={idx}>{tag}</span>
                ))}
              </div>
              <h3 className="project-card-title">{project.title}</h3>
              <p className="project-card-excerpt">{project.excerpt}</p>

              <button
                className="btn btn-card-details"
                onClick={() => setSelectedProject(project)}
              >
                <span>Explore Architecture</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive System Architecture Modal */}
      {selectedProject && (
        <div className="modal-overlay active" style={{ display: 'flex' }}>
          <div className="modal-container">
            <button
              className="modal-close"
              aria-label="Close Modal"
              onClick={() => setSelectedProject(null)}
            >
              <X size={20} />
            </button>
            <div className="modal-header-section">
              <span className="modal-subtitle">{selectedProject.architectureDetails.subtitle}</span>
              <h2 className="modal-title">{selectedProject.title}</h2>
              <div className="modal-tags">
                {selectedProject.tags.map((tag, idx) => (
                  <span key={idx} className="tech-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-body-section">
              <div className="modal-description">
                <h3>Project Details</h3>
                <p>{selectedProject.architectureDetails.description}</p>
                <ul>
                  {selectedProject.architectureDetails.detailsList.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.label}:</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
