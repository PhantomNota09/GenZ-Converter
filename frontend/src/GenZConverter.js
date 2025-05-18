import React, { useState, useEffect, useCallback } from 'react';
// For a cool terminal-like font (optional, install if you like it: npm install typeface-source-code-pro)
// import 'typeface-source-code-pro'; 

// Simple SVG Icons (replace with actual images/icons if you have them)
const IconBrain = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C9.243 2 7 4.243 7 7c0 1.44.585 2.745 1.526 3.69L7.293 12.09c-1.052.38-1.793 1.425-1.793 2.577V17c0 1.103.897 2 2 2h1c.552 0 1-.449 1-1v-1h4v1c0 .551.448 1 1 1h1c1.103 0 2-.897 2-2v-2.333c0-1.152-.741-2.197-1.793-2.577L15.474 10.69C16.415 9.745 17 8.44 17 7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm-2 8h4v2H10v-2z"/>
  </svg>
);

const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2l1.09 2.78L16 6l-2.78 1.09L12 10l-1.22-2.91L8 6l2.91-1.22L12 2zm0 14l-1.09 2.78L8 20l2.78-1.09L12 16l1.22 2.91L16 20l-2.91 1.22L12 24zm6-11l.62 1.58L20.25 12l-1.58.62L18 14.25l-.62-1.58L15.75 12l1.58-.62L18 9.75zM6 13l-.62-1.58L3.75 12l1.58-.62L6 9.75l.62 1.58L8.25 12l-1.58.62L6 14.25z"/>
  </svg>
);


const GenZConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [slangLevel, setSlangLevel] = useState(50); // 0-100
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  // Apply theme to body for global styles if needed (like scrollbar)
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Funky title effect
  useEffect(() => {
    const titles = ["GenZify"];
    let i = 0;
    const intervalId = setInterval(() => {
      document.title = titles[i % titles.length];
      i++;
    }, 2500);
    return () => clearInterval(intervalId);
  }, []);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    if (!inputText.trim()) {
      setError('Ayo, drop some text first! 🙄 No cap.');
      setOutputText('');
      return;
    }
    setError('');
    setIsLoading(true);
    setOutputText('');
    setIsCopied(false);

    try {
      // Ensure your backend is running on port 5001
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      // const API_URL = 'https://genz-converter-api.onrender.com/api/convert';
      const response = await fetch(`${API_URL}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Keep this if your frontend and backend are on different ports
        body: JSON.stringify({
          text: inputText,
          slangLevel: slangLevel, 
        }),
      });

      if (!response.ok) {
        // Try to parse error from backend, otherwise use generic message
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setOutputText(data.converted_text);
    } catch (e) {
      console.error("Fetch error:", e);
      setError(`Yikes! ${e.message || 'Something went sideways. Try again?'}`);
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, slangLevel]); // Dependencies for useCallback

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
    setIsCopied(false);
  };

  const handleCopyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setError('Sheesh, couldn\'t copy. My bad.');
      });
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`app-container theme-${theme}`}>
      {/* CSS Particle Background */}
      <div className="particles">
        {[...Array(30)].map((_, i) => <div key={i} className="particle"></div>)}
      </div>

      <div className="page-content">
        <header className="app-header">
          <div className="logo-placeholder">
            {/* Replace with your actual logo or a cooler SVG */}
            <span role="img" aria-label="logo" style={{ fontSize: '2rem' }}>🤖</span>
          </div>
          <h1 className="main-title">
            GΣΠZ <span className="title-accent">CΦΠVΣЯTΣЯ</span>
          </h1>
          <button onClick={toggleTheme} className="theme-switcher" aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="converter-main">
          <div className="interface-card">
            <div className="card-header">
              <div className="card-title-group">
                <IconBrain />
                <h2>Drop the Boomer Speak</h2>
              </div>
              <span className="card-badge boomer-badge">FORMAL</span>
            </div>
            <textarea
              className="text-area input-area"
              value={inputText}
              onChange={handleInputChange}
              placeholder="e.g., I am exceptionally pleased with this advantageous outcome..."
              rows="6"
              disabled={isLoading}
            />

            <div className="controls-area">
              <div className="slang-level-control">
                <label htmlFor="slangLevel">Vibe Intensity:</label>
                <input
                  type="range"
                  id="slangLevel"
                  min="0"
                  max="100"
                  value={slangLevel}
                  onChange={(e) => setSlangLevel(parseInt(e.target.value))}
                  className="slang-slider"
                  disabled={isLoading}
                />
                <span className="slang-level-value">{slangLevel}%</span>
              </div>
              <div className="action-buttons">
                <button
                  className="action-button convert-button"
                  onClick={handleSubmit}
                  disabled={isLoading || !inputText.trim()}
                >
                  {isLoading ? (
                    <span className="loader" />
                  ) : (
                    <>Make it <span className="button-accent">Vibe</span> ✨</>
                  )}
                </button>
                {inputText && (
                  <button
                    className="action-button clear-button"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    Yeet Text
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span> {error}
              </div>
            )}

            {outputText && (
              <div className="output-display">
                <div className="card-header">
                   <div className="card-title-group">
                    <IconSparkles />
                    <h2>Ayo, Peep This Drip:</h2>
                  </div>
                  <span className="card-badge genz-badge">GEN-Z</span>
                </div>
                <div className="text-area output-area">
                  {outputText}
                </div>
                <button
                  className={`action-button copy-button ${isCopied ? 'copied' : ''}`}
                  onClick={handleCopyToClipboard}
                >
                  {isCopied ? 'Copied! ✅ Period.' : 'Copy Dis 📋'}
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="app-footer">
          <p>Crafted with 💻 & questionable GenZ knowledge. No cap.</p>
        </footer>
      </div>

      {/* Using a template literal for CSS-in-JS for better organization */}
      <style jsx global>{`
        /* Global Font (Example: Source Code Pro for a techy feel) */
        /* You might want to import this via a CDN in your public/index.html for better performance */
        @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap');

        :root {
          --font-primary: 'Poppins', sans-serif;
          --font-mono: 'Source Code Pro', monospace;

          /* Dark Theme */
          --bg-dark: #0d0d1a; /* Deeper space blue/purple */
          --card-bg-dark: rgba(20, 20, 40, 0.65); /* More translucent */
          --text-dark: #e0e0ff; /* Slightly bluer white */
          --text-muted-dark: #a0a0cc;
          --border-dark: rgba(100, 100, 220, 0.3);
          --shadow-dark: 0 8px 32px rgba(123, 92, 255, 0.2);
          --accent1-dark: #7b5cff; /* Vibrant Purple */
          --accent2-dark: #00f5d4; /* Bright Teal/Cyan */
          --accent3-dark: #ff4081; /* Hot Pink */
          --error-dark: #ff5252;
          --success-dark: var(--accent2-dark);

          /* Light Theme */
          --bg-light: #f0f2f5;
          --card-bg-light: rgba(255, 255, 255, 0.8);
          --text-light: #2c3e50;
          --text-muted-light: #7f8c8d;
          --border-light: rgba(0, 0, 0, 0.1);
          --shadow-light: 0 8px 24px rgba(0, 0, 0, 0.1);
          --accent1-light: #5e35b1; /* Deeper Purple */
          --accent2-light: #00bfa5; /* Teal */
          --accent3-light: #e91e63; /* Pink */
          --error-light: #d32f2f;
          --success-light: var(--accent2-light);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: var(--font-primary);
          transition: background-color 0.4s ease, color 0.4s ease;
          overflow-x: hidden; /* Prevent horizontal scroll */
        }
        body.dark {
          background-color: var(--bg-dark);
          color: var(--text-dark);
        }
        body.light {
          background-color: var(--bg-light);
          color: var(--text-light);
        }
      `}</style>
      <style jsx>{`
        .app-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start; /* Align content to top */
          padding: 20px;
          position: relative;
        }
        .theme-dark {
          --current-bg: var(--bg-dark);
          --current-card-bg: var(--card-bg-dark);
          --current-text: var(--text-dark);
          --current-text-muted: var(--text-muted-dark);
          --current-border: var(--border-dark);
          --current-shadow: var(--shadow-dark);
          --current-accent1: var(--accent1-dark);
          --current-accent2: var(--accent2-dark);
          --current-accent3: var(--accent3-dark);
          --current-error: var(--error-dark);
          --current-success: var(--success-dark);
        }
        .theme-light {
          --current-bg: var(--bg-light);
          --current-card-bg: var(--card-bg-light);
          --current-text: var(--text-light);
          --current-text-muted: var(--text-muted-light);
          --current-border: var(--border-light);
          --current-shadow: var(--shadow-light);
          --current-accent1: var(--accent1-light);
          --current-accent2: var(--accent2-light);
          --current-accent3: var(--accent3-light);
          --current-error: var(--error-light);
          --current-success: var(--success-light);
        }

        /* Particle Background - CSS Only */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        .particle {
          position: absolute;
          background-color: var(--current-accent1);
          border-radius: 50%;
          opacity: 0; /* Start invisible */
          animation: floatParticle 20s infinite ease-in-out;
        }
        .theme-dark .particle { background-color: var(--current-accent1); }
        .theme-light .particle { background-color: var(--current-accent2); }

        @keyframes floatParticle {
          0% { transform: translateY(100vh) translateX(var(--x-start)) scale(0.5); opacity: 0; }
          10%, 90% { opacity: 0.3; } /* Fade in and out */
          50% { transform: translateY(var(--y-mid)) translateX(var(--x-mid)) scale(1); opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(var(--x-end)) scale(0.5); opacity: 0; }
        }

        /* Assign random positions and delays to particles (example for 30) */
        ${[...Array(30)].map((_, i) => `
          .particle:nth-child(${i + 1}) {
            width: ${Math.random() * 3 + 2}px;
            height: ${Math.random() * 3 + 2}px;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 20}s;
            --x-start: ${Math.random() * 100 - 50}vw;
            --x-mid: ${Math.random() * 100 - 50}vw;
            --x-end: ${Math.random() * 100 - 50}vw;
            --y-mid: ${Math.random() * 80 + 10}vh; /* Ensure they float mostly in view */
          }
        `).join('')}


        .page-content {
          width: 100%;
          max-width: 800px; /* Max width for main content card */
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 30px; /* Space between header, main, footer */
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          width: 100%;
          border-bottom: 1px solid var(--current-border);
        }
        .logo-placeholder { /* Simple styling for the emoji logo */
          font-size: 2rem;
          animation: spinLogo 10s linear infinite;
        }
        @keyframes spinLogo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .main-title {
          font-family: var(--font-mono); /* Techy font for title */
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          font-weight: 700;
          text-align: center;
          flex-grow: 1;
          color: var(--current-text);
          letter-spacing: 1px;
          text-shadow: 0 0 5px var(--current-accent1), 0 0 10px var(--current-accent1);
        }
        .title-accent {
          background: linear-gradient(90deg, var(--current-accent1), var(--current-accent2), var(--current-accent3));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textGlow 3s ease-in-out infinite alternate;
        }
        @keyframes textGlow {
          from { text-shadow: 0 0 5px var(--current-accent1), 0 0 10px var(--current-accent2), 0 0 15px var(--current-accent3); }
          to { text-shadow: 0 0 15px var(--current-accent1), 0 0 25px var(--current-accent2), 0 0 35px var(--current-accent3); }
        }

        .theme-switcher {
          background: transparent;
          border: 1px solid var(--current-border);
          color: var(--current-text);
          font-size: 1.5rem;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .theme-switcher:hover {
          background-color: var(--current-accent1);
          color: var(--current-bg); /* Invert text color for contrast */
          border-color: var(--current-accent1);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 4px 10px var(--current-shadow);
        }

        .converter-main {
          width: 100%;
        }
        .interface-card {
          background-color: var(--current-card-bg);
          border: 1px solid var(--current-border);
          border-radius: 16px;
          padding: 30px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: var(--current-shadow);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .interface-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(123, 92, 255, 0.25);
        }
        .theme-light .interface-card:hover {
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }


        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px dashed var(--current-border);
        }
        .card-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--current-text);
        }
        .card-title-group h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        .card-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px; /* Pill shape */
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .boomer-badge {
          background-color: var(--current-accent3);
          color: var(--current-bg);
        }
        .genz-badge {
          background-color: var(--current-accent2);
          color: var(--current-bg);
        }

        .text-area {
          width: 100%;
          background-color: rgba(0,0,0,0.1); /* Subtle dark background for text area */
          border: 1px solid var(--current-border);
          border-radius: 8px;
          padding: 15px;
          font-family: var(--font-primary);
          font-size: 1rem;
          line-height: 1.6;
          color: var(--current-text);
          transition: all 0.3s ease;
          resize: vertical;
          min-height: 120px;
        }
        .theme-light .text-area {
           background-color: rgba(255,255,255,0.5);
        }
        .input-area:focus {
          border-color: var(--current-accent1);
          box-shadow: 0 0 0 3px rgba(123, 92, 255, 0.2);
          outline: none;
        }
        .input-area::placeholder {
          color: var(--current-text-muted);
        }
        .output-area {
          background-color: rgba(0,0,0,0.2); /* Slightly different for output */
          border-color: var(--current-accent2);
          white-space: pre-wrap; /* Preserve formatting */
          word-wrap: break-word;
        }
         .theme-light .output-area {
           background-color: rgba(230,255,250,0.5);
        }

        .controls-area {
          margin-top: 25px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap; /* Allow wrapping on smaller screens */
        }
        .slang-level-control {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--current-text-muted);
        }
        .slang-level-control label {
          font-weight: 500;
        }
        .slang-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 150px; /* Adjust as needed */
          height: 6px;
          background: rgba(123, 92, 255, 0.2);
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }
        .slang-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: var(--current-accent1);
          border-radius: 50%;
          border: 2px solid var(--current-bg);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .slang-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--current-accent1);
          border-radius: 50%;
          border: 2px solid var(--current-bg);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .slang-slider:hover::-webkit-slider-thumb, .slang-slider:hover::-moz-range-thumb {
          transform: scale(1.1);
          box-shadow: 0 0 8px var(--current-accent1);
        }
        .slang-level-value {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--current-accent1);
          min-width: 35px; /* Ensure space for 100% */
          text-align: right;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
        }
        .action-button {
          padding: 10px 20px;
          font-family: var(--font-primary);
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative; /* For pseudo-elements if needed */
          box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .convert-button {
          background: linear-gradient(135deg, var(--current-accent1) 0%, var(--current-accent3) 100%);
          color: white;
        }
        .convert-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 6px 12px rgba(123, 92, 255, 0.3);
        }
        .button-accent { /* For the emoji/text inside button */
          display: inline-block;
          animation: buttonWiggle 0.5s ease-in-out 3 alternate; /* Wiggle on hover if desired */
        }
        @keyframes buttonWiggle {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(2deg); }
        }
        .loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spinLoader 0.8s linear infinite;
        }
        @keyframes spinLoader { to { transform: rotate(360deg); } }

        .clear-button {
          background-color: transparent;
          color: var(--current-text-muted);
          border: 1px solid var(--current-border);
        }
        .clear-button:hover:not(:disabled) {
          background-color: rgba(128,128,128,0.1);
          border-color: var(--current-text-muted);
          color: var(--current-text);
        }

        .error-banner {
          background-color: rgba(255, 82, 82, 0.1); /* Match --current-error */
          border: 1px solid var(--current-error);
          border-left-width: 4px;
          color: var(--current-error);
          padding: 12px 15px;
          margin-top: 20px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          animation: fadeInError 0.5s ease-out;
        }
        @keyframes fadeInError { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .error-icon { font-size: 1.2rem; }

        .output-display {
          margin-top: 30px;
          position: relative; /* For copy button positioning */
        }
        .copy-button {
          position: absolute;
          top: -15px; /* Position it nicely relative to output area's top border */
          right: 0px;
          background-color: var(--current-accent2);
          color: var(--current-bg); /* For contrast */
          padding: 6px 12px;
          font-size: 0.8rem;
          border-radius: 6px;
          z-index: 2; /* Ensure it's above output area */
        }
        .copy-button.copied {
          background-color: var(--current-success); /* Use theme success */
          color: var(--current-bg);
        }
        .copy-button:hover:not(:disabled) {
          opacity: 0.85;
          transform: scale(1.05);
        }
        
        .app-footer {
          text-align: center;
          padding: 20px 0;
          font-size: 0.85rem;
          color: var(--current-text-muted);
          border-top: 1px solid var(--current-border);
          margin-top: auto; /* Push to bottom if content is short */
        }
        .app-footer p {
          font-family: var(--font-mono);
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .page-content {
            gap: 20px;
          }
          .app-header {
            flex-direction: column;
            gap: 15px;
            padding-bottom: 20px;
          }
          .main-title {
            font-size: clamp(1.5rem, 6vw, 2rem);
          }
          .theme-switcher {
            position: absolute; /* Example: top right for mobile header */
            top: 25px;
            right: 20px;
          }
          .interface-card {
            padding: 20px;
          }
          .controls-area {
            flex-direction: column;
            align-items: stretch; /* Make controls full width */
          }
          .slang-level-control {
            width: 100%;
          }
          .slang-slider {
            flex-grow: 1; /* Slider takes available space */
          }
          .action-buttons {
            width: 100%;
            flex-direction: column;
          }
          .action-button {
            width: 100%;
          }
          .copy-button {
            position: relative; /* Stack below output on mobile */
            display: block;
            width: fit-content;
            margin: 15px auto 0 auto; /* Center it */
            top: auto; right: auto;
          }
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
        @media (max-width: 480px) {
          .main-title {
            letter-spacing: 0px;
          }
          .text-area {
            min-height: 100px;
          }
        }

      `}</style>
    </div>
  );
};

export default GenZConverter;