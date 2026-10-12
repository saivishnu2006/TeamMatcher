import React, { useState } from 'react';
import { X, Send, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const JoinRequestModal = ({ project, onClose, onSuccess }) => {
  const { user } = useAuth();
  const defaultRole = (project?.requiredRoles && project.requiredRoles.length > 0)
    ? project.requiredRoles[0]
    : (user?.profile?.preferredRole || 'Developer');

  const [preferredRole, setPreferredRole] = useState(defaultRole);
  const [customRole, setCustomRole] = useState('');
  const [message, setMessage] = useState(
    `Hello! I saw ${project?.name} and would love to join the team as a ${defaultRole}. I have relevant experience and am ready to contribute!`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalRole = preferredRole === 'OTHER' ? customRole.trim() : preferredRole;

    try {
      await api.post(`/projects/${project.id}/join-request`, {
        preferredRole: finalRole || 'Teammate',
        message: message.trim()
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to send join request:', err);
      setError(err.response?.data?.message || 'Failed to submit request to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Request to Join Project
              </h3>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', margin: 0 }}>
                {project?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Project Summary */}
          <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <strong>Project Lead:</strong> {project?.ownerName || 'Project Owner'}
            </p>
            {project?.requiredSkills && project.requiredSkills.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Seeking skills:</span>
                {project.requiredSkills.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="tag-item" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Role Selector */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">
              What role would you like to take on?
            </label>
            <select
              className="form-input"
              value={preferredRole}
              onChange={(e) => {
                setPreferredRole(e.target.value);
                if (e.target.value !== 'OTHER') {
                  setMessage(`Hello! I saw ${project?.name} and would love to join the team as a ${e.target.value}. I have relevant experience and am ready to contribute!`);
                }
              }}
            >
              {project?.requiredRoles && project.requiredRoles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="QA / Tester">QA / Tester</option>
              <option value="OTHER">Other (specify below)</option>
            </select>
          </div>

          {preferredRole === 'OTHER' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Specify Your Preferred Role</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. DevOps Engineer, Machine Learning Engineer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                required
              />
            </div>
          )}

          {/* Message / Cover Note */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Pitch to Project Lead (Message)
            </label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Explain why you're a great fit, your relevant skills and availability..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner-sm" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Join Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRequestModal;
