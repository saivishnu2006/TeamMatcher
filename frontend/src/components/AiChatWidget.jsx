import React, { useState } from 'react';
import { Sparkles, Send, MessageSquare, Bot, User } from 'lucide-react';
import api from '../api/axios';

const AiChatWidget = ({ projectId, projectName }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Team Assistant for "${projectName}". Ask me about team gaps, candidate suitability, or who you should invite next based on stored project data.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'What type of teammate am I missing?',
    'Why is Rahul a good match?',
    'Which skills are missing from my team?',
    'Who should I invite first?',
  ];

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        projectId,
        message: textToSend,
      });

      const aiMsg = {
        sender: 'ai',
        text: res.data.answer,
        followUps: res.data.suggestedFollowUps,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I encountered an issue analyzing your team data. Please ensure the project data is intact.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '2rem', border: '1px solid #c7d2fe', background: '#fafbff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Project AI Assistant
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Grounded strictly in project data and verified candidate profiles
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: '#ffffff', borderRadius: 'var(--radius-full)' }}
            onClick={() => handleSend(prompt)}
            disabled={loading}
          >
            <Sparkles size={11} color="#8b5cf6" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        maxHeight: '320px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        marginBottom: '1rem',
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            {m.sender === 'ai' && (
              <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={12} />
              </div>
            )}

            <div style={{
              background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
              color: m.sender === 'user' ? 'white' : 'var(--text-main)',
              padding: '0.65rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              lineHeight: 1.45,
            }}>
              {m.text}

              {/* Follow up suggestions */}
              {m.followUps && m.followUps.length > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Follow-up options:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {m.followUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: '#94a3b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={12} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.813rem' }}>
            <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
            <span>Analyzing project context...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Ask a question about your project, team composition, or candidates..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-ai" disabled={loading || !input.trim()}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default AiChatWidget;
