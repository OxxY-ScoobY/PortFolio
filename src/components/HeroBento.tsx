import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PERSONAL_INFO } from '../data/portfolioData';
import { InteractiveTerminal } from './InteractiveTerminal';
import { ArrowRight, Download, Mail, Phone } from 'lucide-react';

export const HeroBento: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [professionIndex, setProfessionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentProf = PERSONAL_INFO.subtitles[professionIndex];
    let timeoutMs = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentProf.length) {
      timeoutMs = 1800;
    } else if (isDeleting && charIndex === 0) {
      timeoutMs = 500;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentProf.length) {
        setDisplayText(currentProf.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (!isDeleting && charIndex === currentProf.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentProf.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setProfessionIndex((prev) => (prev + 1) % PERSONAL_INFO.subtitles.length);
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, professionIndex]);

  return (
    <section id="home" className="bento-section">
      <div className="bento-grid">
        {/* Main Intro Bento Card (Span 8) */}
        <motion.div
          className="bento-card col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -3 }}
        >
          <div className="status-badge">
            <span className="status-dot"></span>
            Available for Full-Time Developer Roles
          </div>

          <h1 className="hero-bento-title">{PERSONAL_INFO.name}</h1>
          <div className="hero-subtitle-bento">
            I am a <span>{displayText}</span>
            <span style={{ color: '#6366f1' }}>|</span>
          </div>

          <p className="hero-bento-bio">{PERSONAL_INFO.bio}</p>

          <div className="bento-ctas">
            <a href="#projects" className="btn-bento-primary">
              <span>Explore Featured Projects</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="/Athil_Hisham_Resume.pdf"
              download="Athil_Hisham_Resume.pdf"
              className="btn-bento-secondary"
            >
              <span>Download CV</span>
              <Download size={18} />
            </a>
          </div>
        </motion.div>

        {/* Quick Social Contacts Bento Card (Span 4) */}
        <motion.div
          className="bento-card col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -3 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '16px' }}>
            Quick Links
          </h3>

          <div className="social-bento-grid">
            <a
              href={PERSONAL_INFO.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-bento-item"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span>LinkedIn</span>
            </a>
            <a
              href={PERSONAL_INFO.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="social-bento-item"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span>GitHub</span>
            </a>
            <a href={`mailto:${PERSONAL_INFO.contact.email}`} className="social-bento-item">
              <Mail size={22} color="#10b981" />
              <span>Email</span>
            </a>
            <a href={`tel:${PERSONAL_INFO.contact.phone}`} className="social-bento-item">
              <Phone size={22} color="#f43f5e" />
              <span>Call</span>
            </a>
          </div>
        </motion.div>

        {/* Embedded Interactive CLI Terminal Bento Card (Span 12) */}
        <motion.div
          className="bento-card col-span-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ padding: 0 }}
        >
          <InteractiveTerminal />
        </motion.div>
      </div>
    </section>
  );
};
