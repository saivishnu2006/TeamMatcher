import React, { useState } from 'react';
import { Sparkles, Users, CheckCircle, Send, Check } from 'lucide-react';
import api from '../api/axios';

const TeamBuilderModal = ({ projectId, project, onClose, onInviteSuccess }) => {
  const [teamSize, setTeamSize] = useState(project.teamSize || 4);
  const [rolesInput, setRolesInput] = useState(
    project.requiredRoles && project.requiredRoles.length > 0
      ? project.requiredRoles.join(', ')
      : 'Frontend Developer, Backend Developer, UI/UX Designer, QA Tester'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [invitedMap, setInvitedMap] = useState({});

  const handleBuild = async () => {
    setLoading(true);
    try {
      const rolesArray = rolesInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await api.post('/ai/build-team', {
        projectId,
        teamSize: parseInt(teamSize, 10),
        requiredRoles: rolesArray,
      });

      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to build team with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCandidate = async (userId, role) => {
    try {
      await api.post('/team-requests', {
        projectId,
        receiverId: userId,
        message: `You were selected by our AI Team Builder for the ${role} position on ${project.name}!`,
      });
      setInvitedMap((prev) => ({ ...prev, [userId]: true }));
      if (onInviteSuccess) onInviteSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invite.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="card-title">Build My Team with AI</h3>
              <p className="card-subtitle">AI balances complementary skills and roles with zero duplicate assignments</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {!result ? (
          <div>
            <div className="form-group">
              <label className="form-label">Desired Team Size</label>
              <input
                type="number"
                min="2"
                max="10"
                className="form-input"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Roles (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Frontend Developer, Backend Developer, UI/UX Designer, QA Tester"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                AI will match top verified candidates uniquely across these roles without exceeding your target size.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-ai" onClick={handleBuild} disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                    Analyzing Candidates...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Assemble Balanced Team
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="ai-banner" style={{ marginBottom: '1.25rem' }}>
              <div className="ai-banner-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  AI Team Blueprint
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {result.summary}
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Recommended Role Assignments ({result.assignments?.length} members):
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {result.assignments?.map((assignment, idx) => {
                const c = assignment.candidate;
                const isInvited = invitedMap[c.userId];

                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      background: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                          {assignment.role}
                        </span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {c.fullName}
                        </strong>
                        <span className="badge badge-excellent">
                          {Math.round(c.finalScore)}% Match
                        </span>
                      </div>

                      <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {assignment.rationale}
                      </p>

                      <div className="tags-wrap" style={{ marginTop: '0.4rem' }}>
                        {c.skills?.slice(0, 4).map((s, sIdx) => (
                          <span key={sIdx} className="tag-item" style={{ fontSize: '0.75rem' }}>
                            {s.name || s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      {isInvited ? (
                        <span className="badge badge-good" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Check size={13} /> Invited
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleInviteCandidate(c.userId, assignment.role)}
                        >
                          <Send size={13} />
                          Invite
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setResult(null)}>
                Adjust Parameters
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilderModal;
