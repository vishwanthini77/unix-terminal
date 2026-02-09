import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Terminal from './Terminal';
import './SplitLayout.css';
import { loadCurrentSession, saveCurrentSession, loadTheme, saveTheme, resetAll } from '../storage';
import { resetFileSystem } from '../fileSystem';
import session0 from '../lessons/session0.md?raw';
import session1 from '../lessons/session1.md?raw';
import session2 from '../lessons/session2.md?raw';
import session3 from '../lessons/session3.md?raw';
import session4 from '../lessons/session4.md?raw';
import session5 from '../lessons/session5.md?raw';
import { useForm, ValidationError } from '@formspree/react';

function FeedbackForm({ onClose }) {
  const [state, handleSubmit] = useForm("xykdylan"); // ← Replace with your Formspree form ID from the snippet

  if (state.succeeded) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ fontSize: '18px', marginBottom: '16px', color: '#e0e0e0' }}>✅ Thanks for your feedback!</p>
        <button className="feedback-submit" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        id="message"
        name="message"
        placeholder="What's on your mind? Suggestions, bugs, or anything else..."
        rows={5}
        required
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #555',
          background: '#2d2d2d',
          color: '#e0e0e0',
          fontSize: '14px',
          resize: 'vertical',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      <ValidationError prefix="Message" field="message" errors={state.errors} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
        <button type="button" className="feedback-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="feedback-submit" disabled={state.submitting}>
          {state.submitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </form>
  );
}
function SplitLayout() {
  const [contentWidth, setContentWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSession, setCurrentSession] = useState(() => loadCurrentSession() ?? 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [theme, setTheme] = useState(() => loadTheme() ?? 'dark');
  const [activeTab, setActiveTab] = useState('lesson');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  // Shared ref so Terminal can read current session without re-rendering
  const sessionRef = useRef({ current: 1, set: null });
  sessionRef.current.current = currentSession;
  sessionRef.current.set = setCurrentSession;

const lessons = {
  0: session0,
  1: session1,
  2: session2,
  3: session3,
  4: session4,
  5: session5
};

  const lessonContentRef = useRef(null);

  useEffect(() => {
    if (lessonContentRef.current) {
      lessonContentRef.current.scrollTop = 0;
    }
  }, [currentSession]);

  // Persist session and theme to localStorage
  useEffect(() => {
    saveCurrentSession(currentSession);
  }, [currentSession]);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleReset = () => {
    resetAll();
    resetFileSystem();
    window.location.reload();
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
      className={`split-layout theme-${theme}${isMobile ? ' mobile' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {isMobile && (
        <div className="mobile-tab-bar">
          <button
            className={activeTab === 'lesson' ? 'active' : ''}
            onClick={() => setActiveTab('lesson')}
          >
            📖 Lesson
          </button>
          <button
            className={activeTab === 'terminal' ? 'active' : ''}
            onClick={() => setActiveTab('terminal')}
          >
            💻 Terminal
          </button>
        </div>
      )}
      <div
        className={`content-panel${isMobile && activeTab !== 'lesson' ? ' mobile-hidden' : ''}`}
        style={isMobile ? undefined : { width: `${contentWidth}%` }}
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
                Lesson {num}
                </button>
            ))}
            </div>
          <div className="nav-actions">
            <button className="feedback-button" onClick={() => setShowFeedback(true)}>
            💬 Feedback
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button className="reset-button" onClick={handleReset}>
            ⟲ Reset Session
            </button>

          </div>
        </div>
        <div className="lesson-content" ref={lessonContentRef}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {lessons[currentSession]}
          </ReactMarkdown>
        </div>
      </div>
      
      <div 
        className="divider"
        onMouseDown={handleMouseDown}
      />
      {showFeedback && (
        <div className="feedback-overlay" onClick={() => setShowFeedback(false)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>
            <h3>Send Feedback</h3>
            <FeedbackForm onClose={() => setShowFeedback(false)} />
          </div>
        </div>
      )}
      <div
        className={`terminal-panel${isMobile && activeTab !== 'terminal' ? ' mobile-hidden' : ''}`}
        style={isMobile ? undefined : { width: `${100 - contentWidth}%` }}
      >
        <Terminal sessionRef={sessionRef} />
      </div>
    </div>
  );
}

export default SplitLayout;