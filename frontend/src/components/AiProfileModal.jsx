import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, Plus } from 'lucide-react';
import api from '../api/axios';

const AiProfileModal = ({ bio, previousProjects, onApply, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [interests, setInterests] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    api.post('/ai/analyze-profile', { bio, previousProjects })
      .then((res) => {
        setSkills(res.data.suggestedSkills || []);
        setRoles(res.data.possibleRoles || []);
        setInterests(res.data.suggestedInterests || []);
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to analyze profile.');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [bio, previousProjects]);

  const handleApply = () => {
    onApply({
      suggestedSkills: skills,
      preferredRole: roles[0] || null,
      interests: interests,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="card-title">AI Profile Analyzer</h3>
              <p className="card-subtitle">AI extracted skills &amp; roles from your bio. Review before applying.</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Parsing bio, technologies, and project experience...
            </p>
          </div>
        ) : (
          <div>
            {/* Suggested Skills */}
            <div className="form-group">
              <label className="form-label">Identified Skills</label>
              <div className="tags-wrap" style={{ marginBottom: '0.5rem' }}>
                {skills.map((s, idx) => (
                  <span key={idx} className="tag-item matched">
                    {s}
                    <button onClick={() => setSkills(skills.filter((_, i) => i !== idx))} style={{ color: '#065f46', marginLeft: '0.2rem' }}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  placeholder="Add another skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSkill.trim() && setSkills([...skills, newSkill.trim()]), setNewSkill(''))}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (newSkill.trim()) {
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill('');
                    }
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Possible Roles */}
            <div className="form-group">
              <label className="form-label">Possible Roles</label>
              <div className="tags-wrap">
                {roles.map((r, idx) => (
                  <span key={idx} className="tag-item" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Interests */}
            <div className="form-group">
              <label className="form-label">Suggested Domain Interests</label>
              <div className="tags-wrap" style={{ marginBottom: '0.5rem' }}>
                {interests.map((it, idx) => (
                  <span key={idx} className="tag-item">
                    {it}
                    <button onClick={() => setInterests(interests.filter((_, i) => i !== idx))} style={{ color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApply}>
                <Check size={16} />
                Approve &amp; Add to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiProfileModal;
