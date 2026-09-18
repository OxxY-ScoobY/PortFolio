import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const SkillsBento: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'backend' | 'frontend' | 'ai'>('all');

  const categorizedSkills = [
    { name: 'Python', category: 'backend', icon: '🐍' },
    { name: 'FastAPI', category: 'backend', icon: '⚡' },
    { name: 'Flask', category: 'backend', icon: '🌶️' },
    { name: 'Java', category: 'backend', icon: '☕' },
    { name: 'C / C++', category: 'backend', icon: '💻' },

    { name: 'Angular', category: 'frontend', icon: '🅰️' },
    { name: 'HTML5', category: 'frontend', icon: '🌐' },
    { name: 'CSS3', category: 'frontend', icon: '🎨' },
    { name: 'JavaScript', category: 'frontend', icon: '✨' },

    { name: 'YOLOv8', category: 'ai', icon: '👁️' },
    { name: 'OpenCV', category: 'ai', icon: '📷' },
    { name: 'Raspberry Pi', category: 'ai', icon: '🍓' },
    { name: 'MongoDB Atlas', category: 'ai', icon: '🍃' },
    { name: 'Firebase', category: 'ai', icon: '🔥' },
    { name: 'Git & GitHub', category: 'ai', icon: '🐙' }
  ];

  const filteredSkills = categorizedSkills.filter((s) => {
    if (activeTab === 'all') return true;
    return s.category === activeTab;
  });

  return (
    <section id="skills" className="bento-section">
      <h2 className="bento-section-title">
        <span className="accent-dot"></span> Technical Skills & Stack
      </h2>

      <div className="bento-grid">
        <motion.div
          className="bento-card col-span-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="skill-tabs">
            <button
              className={`skill-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Technologies
            </button>
            <button
              className={`skill-tab-btn ${activeTab === 'backend' ? 'active' : ''}`}
              onClick={() => setActiveTab('backend')}
            >
              Backend & Core
            </button>
            <button
              className={`skill-tab-btn ${activeTab === 'frontend' ? 'active' : ''}`}
              onClick={() => setActiveTab('frontend')}
            >
              Frontend Web
            </button>
            <button
              className={`skill-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI, IoT & Databases
            </button>
          </div>

          <div className="skills-badge-grid">
            {filteredSkills.map((skill, idx) => (
              <motion.div
                key={idx}
                className="bento-skill-pill"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                whileHover={{ scale: 1.05 }}
              >
                <span>{skill.icon}</span>
                <span>{skill.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
