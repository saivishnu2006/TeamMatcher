import React, { useState } from 'react';
import { Sparkles, Check, Plus, X } from 'lucide-react';
import api from '../api/axios';

const AiProjectModal = ({ projectName, description, onApply, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState(null);

  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teamSize, setTeamSize] = useState(4);
  const [complexity, setComplexity] = useState('Medium');
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');

  React.useEffect(() => {
    api.post('/ai/analyze-project', { projectName, description })
      .then((res) => {
        setSuggestions(res.data);
        setSkills(res.data.requiredSkills || []);
        setRoles(res.data.suggestedRoles || []);
        setTeamSize(res.data.suggestedTeamSize || 4);
        setComplexity(res.data.projectComplexity || 'Medium');
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to analyze project with AI');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [projectName, description]);

  const handleRemoveSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveRole = (idx) => {
    setRoles(roles.filter((_, i) => i !== idx));
  };

  const handleAddRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleApply = () => {
    onApply({
      requiredSkills: skills,
      requiredRoles: roles,
      teamSize,
      complexity,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="card-title">AI Project Analysis</h3>
              <p className="card-subtitle">Review, edit, and apply AI architectural suggestions</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Deconstructing requirements and engineering stack...
            </p>
          </div>
        ) : (
          <div>
            {/* Suggested Skills */}
            <div className="form-group">
              <label className="form-label">Suggested Required Skills</label>
              <div className="tags-wrap" style={{ marginBottom: '0.5rem' }}>
                {skills.map((s, idx) => (
                  <span key={idx} className="tag-item matched">
                    {s}
                    <button onClick={() => handleRemoveSkill(idx)} style={{ color: '#065f46', marginLeft: '0.2rem' }}>
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
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAddSkill}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Suggested Roles */}
            <div className="form-group">
              <label className="form-label">Suggested Team Roles</label>
              <div className="tags-wrap" style={{ marginBottom: '0.5rem' }}>
                {roles.map((r, idx) => (
                  <span key={idx} className="tag-item" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: '#c7d2fe' }}>
                    {r}
                    <button onClick={() => handleRemoveRole(idx)} style={{ color: 'var(--primary)', marginLeft: '0.2rem' }}>
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
                  placeholder="Add role..."
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAddRole}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Suggested Team Size</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="form-input"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Project Complexity</label>
                <select
                  className="form-select"
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApply}>
                <Check size={16} />
                Apply Suggestions to Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiProjectModal;
