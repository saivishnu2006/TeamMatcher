import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Search, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TeamAnalysisModal = ({ projectId, projectName, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.post('/ai/analyze-team', { projectId })
      .then((res) => setAnalysis(res.data))
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to analyze team.');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleFindMissingSkill = (skill) => {
    onClose();
    // Navigate to find teammates with the missing skill preset in filter
    navigate(`/projects/${projectId}/find-teammates?skill=${encodeURIComponent(skill)}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
            <div>
              <h3 className="card-title">AI Team Skills Analysis</h3>
              <p className="card-subtitle">{projectName}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Auditing combined team capabilities and gaps...
            </p>
          </div>
        ) : analysis ? (
          <div>
            {/* Coverage Meter */}
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Project Requirements Coverage</span>
                <strong style={{ color: 'var(--primary)' }}>{analysis.coveragePercentage}%</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${analysis.coveragePercentage}%`,
                    background: analysis.coveragePercentage > 75 ? 'var(--success)' : 'var(--warning)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>

            {/* Team Strengths */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Team Strengths
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {analysis.teamStrengths && analysis.teamStrengths.length > 0 ? (
                  analysis.teamStrengths.map((str, idx) => (
                    <div key={idx} style={{ fontSize: '0.875rem', color: '#065f46', background: '#ecfdf5', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      &bull; {str}
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Baseline capabilities detected</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} color="#ef4444" /> Missing Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.813rem',
                        color: '#991b1b',
                      }}
                    >
                      <span>⚠ {sk}</span>
                      <button
                        onClick={() => handleFindMissingSkill(sk)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem', background: '#ffffff', borderColor: '#fca5a5', color: '#b91c1c' }}
                      >
                        <Search size={11} /> Find
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>All project skills covered!</span>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div className="ai-banner" style={{ marginBottom: '1.5rem' }}>
              <div className="ai-banner-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  AI Recommendation
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  "{analysis.recommendation}"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TeamAnalysisModal;
