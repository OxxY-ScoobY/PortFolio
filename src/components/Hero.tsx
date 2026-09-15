import React, { useState, useEffect } from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { InteractiveTerminal } from './InteractiveTerminal';
import { Mail, Phone, ArrowRight, Download } from 'lucide-react';

export const Hero: React.FC = () => {
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
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">{PERSONAL_INFO.name}</h1>
        <div className="hero-subtitle-container">
          <span className="hero-subtitle-static">I am a </span>
          <span className="hero-subtitle-dynamic" id="typing-text">
            {displayText}
          </span>
          <span className="cursor">|</span>
        </div>
        <p className="hero-description">{PERSONAL_INFO.bio}</p>

        <div className="print-only-contact">
          +91 8943544897 &nbsp;|&nbsp; athilhishamcym@gmail.com &nbsp;|&nbsp; Wayanad, Kerala &nbsp;|&nbsp;
          linkedin.com/in/athil-hisham &nbsp;|&nbsp; github.com/OxxY-ScoobY
        </div>

        <div className="hero-ctas">
          <a href="#projects" className="btn btn-primary">
            <span>View Projects</span>
            <ArrowRight size={20} className="btn-icon" />
          </a>
          <a
            href="/Athil_Hisham_Resume.pdf"
            download="Athil_Hisham_Resume.pdf"
            className="btn btn-secondary cv-download-btn"
          >
            <span>Download CV</span>
            <Download size={18} />
          </a>
        </div>

        <div className="hero-socials">
          <a
            href={PERSONAL_INFO.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="social-icon-wrapper"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a
            href={PERSONAL_INFO.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="social-icon-wrapper"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
          <a
            href={`mailto:${PERSONAL_INFO.contact.email}`}
            aria-label="Email"
            className="social-icon-wrapper"
          >
            <Mail size={22} />
          </a>
          <a
            href={`tel:${PERSONAL_INFO.contact.phone}`}
            aria-label="Phone"
            className="social-icon-wrapper"
          >
            <Phone size={22} />
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <InteractiveTerminal />
      </div>
    </section>
  );
};
