import React, { useState, useRef, useEffect } from 'react';
import { PERSONAL_INFO, PROJECTS_DATA, SKILLS_ROW_1, SKILLS_ROW_2 } from '../data/portfolioData';

interface TerminalHistoryItem {
  command: string;
  output: React.ReactNode;
}

export const InteractiveTerminal: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim().toLowerCase();
    if (!trimmed) return;

    let response: React.ReactNode = null;

    switch (trimmed) {
      case 'help':
        response = (
          <div className="term-help-output">
            <p>Available commands:</p>
            <ul>
              <li><span className="term-highlight">about</span> - Read bio summary</li>
              <li><span className="term-highlight">skills</span> - List primary technical stack</li>
              <li><span className="term-highlight">projects</span> - View highlighted projects</li>
              <li><span className="term-highlight">contact</span> - Display contact details</li>
              <li><span className="term-highlight">clear</span> - Clear terminal window</li>
            </ul>
          </div>
        );
        break;

      case 'about':
        response = <p className="term-text-output">{PERSONAL_INFO.bio}</p>;
        break;

      case 'skills':
        const allSkills = [...SKILLS_ROW_1, ...SKILLS_ROW_2].map((s) => s.name).join(', ');
        response = (
          <p className="term-text-output">
            <strong>Core Tech Stack:</strong> {allSkills}
          </p>
        );
        break;

      case 'projects':
        response = (
          <div className="term-projects-output">
            {PROJECTS_DATA.map((p) => (
              <div key={p.id} style={{ marginBottom: '8px' }}>
                <span className="term-highlight">[{p.title}]</span>: {p.excerpt}
              </div>
            ))}
          </div>
        );
        break;

      case 'contact':
        response = (
          <div className="term-contact-output">
            <p>📧 Email: <a href={`mailto:${PERSONAL_INFO.contact.email}`} style={{ color: '#6FD6FF' }}>{PERSONAL_INFO.contact.email}</a></p>
            <p>📞 Phone: {PERSONAL_INFO.contact.phone}</p>
            <p>💼 LinkedIn: <a href={PERSONAL_INFO.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: '#6FD6FF' }}>{PERSONAL_INFO.contact.linkedin}</a></p>
            <p>🐙 GitHub: <a href={PERSONAL_INFO.contact.github} target="_blank" rel="noreferrer" style={{ color: '#6FD6FF' }}>{PERSONAL_INFO.contact.github}</a></p>
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        response = (
          <p className="term-error">
            Command not recognized: '<span className="term-highlight">{trimmed}</span>'. Type <span className="term-highlight">help</span> for commands.
          </p>
        );
        break;
    }

    setHistory((prev) => [...prev, { command: inputVal, output: response }]);
    setInputVal('');
  };

  return (
    <div className="terminal-window" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="t-btn close"></span>
          <span className="t-btn minimize"></span>
          <span className="t-btn maximize"></span>
        </div>
        <div className="terminal-title">guest@athilhisham: ~</div>
      </div>
      <div className="terminal-body" id="terminalBody">
        <div className="terminal-line welcome-txt">
          Welcome to Athil Hisham's interactive terminal portfolio!
        </div>
        <div className="terminal-line welcome-sub">
          Type <span className="term-highlight">help</span> to list available commands.
        </div>

        <div className="terminal-output-container">
          {history.map((item, idx) => (
            <div key={idx} className="terminal-history-entry" style={{ marginBottom: '12px' }}>
              <div className="terminal-prompt-line">
                <span className="terminal-prompt">guest@athilhisham:~$</span>
                <span>{item.command}</span>
              </div>
              <div className="terminal-command-result" style={{ marginTop: '4px' }}>
                {item.output}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCommandSubmit} className="terminal-prompt-line" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="terminal-prompt" style={{ flexShrink: 0 }}>guest@athilhisham:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              flexGrow: 1,
              marginLeft: '8px'
            }}
            spellCheck={false}
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
