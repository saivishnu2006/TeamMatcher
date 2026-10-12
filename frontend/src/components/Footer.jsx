import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          AI Team Matcher &bull; Intelligent Multi-Level Project Teammate Discovery
        </p>
        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
          Powered by React, Vite, Spring Boot, Spring Security, JWT, MySQL &amp; Google Gemini AI
        </p>
      </div>
    </footer>
  );
};

export default Footer;
