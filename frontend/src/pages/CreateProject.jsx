import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, X, FolderPlus } from 'lucide-react';
import AiProjectModal from '../components/AiProjectModal';
import api from '../api/axios';

const CreateProject = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [duration, setDuration] = useState('3 months');
  const [availabilityRequirement, setAvailabilityRequirement] = useState('Full-time');
  const [complexity, setComplexity] = useState('Medium');

  const [requiredSkills, setRequiredSkills] = useState(['React', 'Spring Boot', 'MySQL']);
  const [newSkill, setNewSkill] = useState('');

  const [requiredRoles, setRequiredRoles] = useState(['Frontend Developer', 'Backend Developer', 'UI/UX Designer']);
  const [newRole, setNewRole] = useState('');

  const [showAiModal, setShowAiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddRole = () => {
    if (newRole.trim() && !requiredRoles.includes(newRole.trim())) {
      setRequiredRoles([...requiredRoles, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setRequiredRoles(requiredRoles.filter((r) => r !== roleToRemove));
  };

  const handleApplyAiSuggestions = (suggestions) => {
    if (suggestions.requiredSkills && suggestions.requiredSkills.length > 0) {
      setRequiredSkills(suggestions.requiredSkills);
    }
    if (suggestions.suggestedRoles && suggestions.suggestedRoles.length > 0) {
      setRequiredRoles(suggestions.suggestedRoles);
    }
    if (suggestions.teamSize) {
      setTeamSize(suggestions.teamSize);
    }
    if (suggestions.complexity) {
      setComplexity(suggestions.complexity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!description.trim()) {
      setError('Project description is required');
      return;
    }
    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/projects', {
        name: name.trim(),
        description: description.trim(),
        teamSize: parseInt(teamSize, 10),
        duration,
        availabilityRequirement,
        complexity,
        requiredSkills,
        requiredRoles,
      });

      // Navigate to project details or matching page
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '840px', marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Create New Project
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Define project specifications or let Gemini AI analyze your description
          </p>
        </div>

        <button
          type="button"
          className="btn btn-ai"
          onClick={() => {
            if (!description.trim()) {
              alert('Please enter a project description first so AI can analyze it.');
              return;
            }
            setShowAiModal(true);
          }}
        >
          <Sparkles size={16} />
          Analyze Project with AI
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid #fecaca',
          color: 'var(--danger)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Project Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Smart Healthcare Platform"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Project Description</label>
            <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
              AI uses this to suggest skills, roles, and match candidates
            </span>
          </div>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="e.g. Build a web application that allows patients to find nearby doctors, view availability, and book appointments securely."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Required Skills */}
        <div className="form-group">
          <label className="form-label">Required Skills</label>
          <div className="tags-wrap" style={{ marginBottom: '0.6rem' }}>
            {requiredSkills.map((skill, idx) => (
              <span key={idx} className="tag-item matched">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ color: '#065f46', marginLeft: '0.2rem' }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '360px' }}>
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              placeholder="Add skill (e.g. React)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddSkill}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Required Roles */}
        <div className="form-group">
          <label className="form-label">Required Roles</label>
          <div className="tags-wrap" style={{ marginBottom: '0.6rem' }}>
            {requiredRoles.map((role, idx) => (
              <span key={idx} className="tag-item" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: '#c7d2fe' }}>
                {role}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  style={{ color: 'var(--primary)', marginLeft: '0.2rem' }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '360px' }}>
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              placeholder="Add role (e.g. Frontend Developer)..."
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddRole}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Project Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Team Size</label>
            <input
              type="number"
              min="2"
              max="15"
              className="form-input"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Duration</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 3 months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Availability Requirement</label>
            <select
              className="form-select"
              value={availabilityRequirement}
              onChange={(e) => setAvailabilityRequirement(e.target.value)}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Complexity</label>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Project...' : (
              <>
                <FolderPlus size={16} /> Create Project
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Analysis Modal */}
      {showAiModal && (
        <AiProjectModal
          projectName={name}
          description={description}
          onApply={handleApplyAiSuggestions}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
};

export default CreateProject;
