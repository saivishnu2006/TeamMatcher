import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Filter, Search, ArrowLeft, Sliders, CheckCircle, User } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';
import api from '../api/axios';

const FindTeammates = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetSkill = searchParams.get('skill') || '';

  const [project, setProject] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiMode, setIsAiMode] = useState(true);

  // Filters
  const [skillFilter, setSkillFilter] = useState(presetSkill);
  const [roleFilter, setRoleFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);

  // Profile View Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchMatches = async (useAi) => {
    setLoading(true);
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);

      const endpoint = useAi ? `/projects/${id}/ai-matches` : `/projects/${id}/matches`;
      const matchRes = await api.get(endpoint);
      setCandidates(matchRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load matching candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(isAiMode);
  }, [id, isAiMode]);

  const handleToggleMode = (mode) => {
    setIsAiMode(mode);
  };

  const handleInvite = async (userId, message) => {
    try {
      await api.post('/team-requests', {
        projectId: id,
        receiverId: userId,
        message: message || `We would love to have you on the team for ${project?.name}!`,
      });

      // Update candidate's state locally
      setCandidates((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, hasPendingInvite: true } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation.');
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const score = Math.round(c.finalScore || c.ruleScore || 0);
    if (score < minScore) return false;

    if (skillFilter.trim()) {
      const query = skillFilter.toLowerCase();
      const hasSkill = c.skills?.some((s) => (s.name || s).toLowerCase().includes(query));
      if (!hasSkill) return false;
    }

    if (roleFilter !== 'All') {
      if (
        c.preferredRole?.toLowerCase() !== roleFilter.toLowerCase() &&
        c.recommendedRole?.toLowerCase() !== roleFilter.toLowerCase()
      ) {
        return false;
      }
    }

    if (availabilityFilter !== 'All') {
      if (!c.availability?.toLowerCase().includes(availabilityFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <Link to={`/projects/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} /> Back to Project Details
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Candidate Matching &amp; Recommendations
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {project?.name} &bull; Required Skills: {project?.requiredSkills?.join(', ')}
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            className={`btn btn-sm ${isAiMode ? 'btn-ai' : ''}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={() => handleToggleMode(true)}
          >
            <Sparkles size={14} /> AI Recommendations (Hybrid)
          </button>
          <button
            className={`btn btn-sm ${!isAiMode ? 'btn-primary' : ''}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={() => handleToggleMode(false)}
          >
            Rule-Based Scoring
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
          <Filter size={16} /> Filter Candidates
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Search Skill</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Spring Boot..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Role</label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="QA Tester">QA Tester</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Availability</label>
            <select
              className="form-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="All">All Availabilities</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Weekends">Weekends only</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 0 }}>Min Match Score</label>
              <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{minScore}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            {isAiMode ? 'Evaluating candidates with Gemini AI...' : 'Calculating rule-based scores...'}
          </p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            No candidates matched the current filter criteria.
          </p>
          <button
            onClick={() => {
              setSkillFilter('');
              setRoleFilter('All');
              setAvailabilityFilter('All');
              setMinScore(0);
            }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '1rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredCandidates.map((c) => (
            <CandidateCard
              key={c.userId}
              candidate={c}
              onInvite={handleInvite}
              onViewProfile={(cand) => setSelectedCandidate(cand)}
            />
          ))}
        </div>
      )}

      {/* Profile Detail View Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar-circle" style={{ width: '2.75rem', height: '2.75rem', fontSize: '1.2rem' }}>
                  {selectedCandidate.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="card-title">{selectedCandidate.fullName}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    {selectedCandidate.preferredRole} &bull; {selectedCandidate.experienceLevel}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCandidate(null)}>&times;</button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Bio
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedCandidate.bio || 'No bio provided.'}
              </p>
            </div>

            {selectedCandidate.previousProjects && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Past Project Experience
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {selectedCandidate.previousProjects}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Technical Skills
              </h4>
              <div className="tags-wrap">
                {selectedCandidate.skills?.map((s, idx) => (
                  <span key={idx} className="tag-item matched">
                    {s.name || s} {s.proficiencyLevel ? `(${s.proficiencyLevel})` : ''}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Interests &amp; Domains
              </h4>
              <div className="tags-wrap">
                {selectedCandidate.interests?.map((i, idx) => (
                  <span key={idx} className="tag-item">
                    {i}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedCandidate(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTeammates;
