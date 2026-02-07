import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Terminal from './Terminal';
import './SplitLayout.css';
import session0 from '../lessons/session0.md?raw';
import session1 from '../lessons/session1.md?raw';
import session2 from '../lessons/session2.md?raw';
import session3 from '../lessons/session3.md?raw';
import session4 from '../lessons/session4.md?raw';
import session5 from '../lessons/session5.md?raw';

function SplitLayout() {
  const [contentWidth, setContentWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  // Shared ref so Terminal can read current session without re-rendering
  const sessionRef = useRef({ current: 1, set: null });
  sessionRef.current.current = currentSession;
  sessionRef.current.set = setCurrentSession;

const lessons = {
  0.: session0,
  1: session1,
  2: session2,
  3: session3,
  4: session4,
  5: session5
};

  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setContentWidth(newWidth);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div 
      className={`split-layout theme-${theme}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        className="content-panel"
        style={{ width: `${contentWidth}%` }}
      >
        <div className="session-nav">
            <div className="session-buttons">
            <button
                className={currentSession === 0 ? 'active' : ''}
                onClick={() => setCurrentSession(0)}
            >
                Overview
            </button>
            {[1, 2, 3, 4, 5].map(num => (
                <button
                key={num}
                className={currentSession === num ? 'active' : ''}
                onClick={() => setCurrentSession(num)}
                >
                Session {num}
                </button>
            ))}
            </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div className="lesson-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {lessons[currentSession]}
          </ReactMarkdown>
        </div>
      </div>
      
      <div 
        className="divider"
        onMouseDown={handleMouseDown}
      />
      
      <div 
        className="terminal-panel"
        style={{ width: `${100 - contentWidth}%` }}
      >
        <Terminal sessionRef={sessionRef} />
      </div>
    </div>
  );
}

export default SplitLayout;