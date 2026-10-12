import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, Send, User, CheckCircle2, Clock } from 'lucide-react';

const CandidateCard = ({ candidate, onInvite, onViewProfile }) => {
  const [inviteMessage, setInviteMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);

  const getScoreBadgeClass = (category) => {
    switch (category) {
      case 'Excellent Match':
        return 'badge-excellent';
      case 'Good Match':
        return 'badge-good';
      case 'Moderate Match':
        return 'badge-moderate';
      default:
        return 'badge-low';
    }
  };

  const getScorePillClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'low';
  };

  const handleSendInvite = async () => {
    if (inviting) return;
    setInviting(true);
    try {
      await onInvite(candidate.userId, inviteMessage);
      setShowInviteModal(false);
    } finally {
      setInviting(false);
    }
  };

  const score = Math.round(candidate.finalScore || candidate.ruleScore || 0);

  return (
    <>
      <div className="card candidate-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {candidate.fullName}
            </h3>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              {candidate.preferredRole || 'Contributor'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className={`score-pill ${getScorePillClass(score)}`}>
              <Sparkles size={16} />
              <span>{score}% Match</span>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <span className={`badge ${getScoreBadgeClass(candidate.matchCategory)}`}>
                {candidate.matchCategory || 'Match'}
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown (Level 1 Rule vs Level 2 AI) */}
        {candidate.aiScore > 0 && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            background: 'var(--bg-surface)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem'
          }}>
            <span>Rule-based: <strong style={{ color: 'var(--text-main)' }}>{Math.round(candidate.ruleScore)}%</strong> (60%)</span>
            <span>&bull;</span>
            <span>AI Score: <strong style={{ color: 'var(--text-main)' }}>{Math.round(candidate.aiScore)}%</strong> (40%)</span>
          </div>
        )}

        {/* Why AI Recommends */}
        {candidate.aiReason && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(168, 85, 247, 0.06))',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            <p style={{ fontWeight: 700, color: '#6366f1', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} /> Why AI recommends this person:
            </p>
            <p style={{ color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{candidate.aiReason}"
            </p>
          </div>
        )}

        {/* Recommended Role */}
        {candidate.recommendedRole && (
          <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Recommended Role: </span>
            <strong style={{ color: 'var(--text-main)' }}>{candidate.recommendedRole}</strong>
          </div>
        )}

        {/* Candidate Skills Overview */}
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Skills:
          </p>
          <div className="tags-wrap">
            {candidate.skills && candidate.skills.map((s, idx) => (
              <span key={idx} className="tag-item">
                {s.name || s}
              </span>
            ))}
          </div>
        </div>

        {/* Matched vs Missing Skills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
              Matched Skills:
            </p>
            {candidate.matchedSkills && candidate.matchedSkills.length > 0 ? (
              candidate.matchedSkills.map((ms, idx) => (
                <div key={idx} style={{ fontSize: '0.813rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem' }}>
                  <Check size={13} color="#10b981" /> {ms}
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>None</span>
            )}
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
              Missing Skills:
            </p>
            {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
              candidate.missingSkills.map((mis, idx) => (
                <div key={idx} style={{ fontSize: '0.813rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem' }}>
                  <AlertCircle size={13} color="#ef4444" /> {mis}
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>All matched!</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onViewProfile(candidate)}
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
          >
            <User size={14} />
            View Profile
          </button>

          {candidate.isTeamMember ? (
            <span className="badge badge-good" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} /> Team Member
            </span>
          ) : candidate.hasPendingInvite ? (
            <span className="badge badge-moderate" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} /> Invite Sent
            </span>
          ) : (
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <Send size={14} />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Invite {candidate.fullName} to Team</h3>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>&times;</button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Send an invitation message for the <strong>{candidate.recommendedRole || 'Teammate'}</strong> role.
            </p>

            <div className="form-group">
              <label className="form-label">Invitation Message (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder={`Hi ${candidate.fullName}, we think your experience with ${candidate.matchedSkills?.join(', ') || 'software development'} makes you an ideal match for our project!`}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSendInvite} disabled={inviting}>
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateCard;
