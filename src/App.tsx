import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { InteractiveBackground } from './components/InteractiveBackground';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { HeroBento } from './components/HeroBento';
import { SkillsBento } from './components/SkillsBento';
import { ExperienceEducationBento } from './components/ExperienceEducationBento';
import { ProjectsBento } from './components/ProjectsBento';
import { CertificationsBento } from './components/CertificationsBento';
import { ContactBento } from './components/ContactBento';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="portfolio-app">
        <CustomCursor />
        <InteractiveBackground />
        <Header />

        <main className="bento-container">
          <HeroBento />
          <SkillsBento />
          <ExperienceEducationBento />
          <ProjectsBento />
          <CertificationsBento />
          <ContactBento />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
