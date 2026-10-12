import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Save, User, Award, Check, Plus, Trash2, Heart } from 'lucide-react';
import AiProfileModal from '../components/AiProfileModal';
import api from '../api/axios';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [preferredRole, setPreferredRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [availability, setAvailability] = useState('Full-time');
  const [bio, setBio] = useState('');
  const [previousProjects, setPreviousProjects] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  const [showAiModal, setShowAiModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPreferredRole(user.preferredRole || 'Full Stack Developer');
      setExperienceLevel(user.experienceLevel || 'Intermediate');
      setAvailability(user.availability || 'Full-time');
      setBio(user.bio || '');
      setPreviousProjects(user.previousProjects || '');
      setSkills(user.skills || []);
      setInterests(user.interests?.map((i) => i.name) || []);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/profile', {
        fullName,
        bio,
        preferredRole,
        experienceLevel,
        availability,
        previousProjects,
        interests,
      });

      updateUser(res.data);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;

    try {
      const res = await api.post('/profile/skills', {
        skillName: newSkillName.trim(),
        category: newSkillCategory,
        proficiencyLevel: newSkillLevel,
      });
      updateUser(res.data);
      setSkills(res.data.skills || []);
      setNewSkillName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await api.delete(`/profile/skills/${skillId}`);
      updateUser(res.data);
      setSkills(res.data.skills || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove skill.');
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestName) => {
    setInterests(interests.filter((i) => i !== interestName));
  };

  const handleApplyAiSuggestions = async (suggestions) => {
    if (suggestions.preferredRole) {
      setPreferredRole(suggestions.preferredRole);
    }
    if (suggestions.interests) {
      const merged = Array.from(new Set([...interests, ...suggestions.interests]));
      setInterests(merged);
    }

    // Add suggested skills to backend
    if (suggestions.suggestedSkills && suggestions.suggestedSkills.length > 0) {
      for (const sName of suggestions.suggestedSkills) {
        try {
          await api.post('/profile/skills', {
            skillName: sName,
            category: 'Technical',
            proficiencyLevel: 'Intermediate',
          });
        } catch (e) {}
      }
      // Reload profile
      const updated = await api.get('/profile');
      updateUser(updated.data);
      setSkills(updated.data.skills || []);
    }

    setSuccessMsg('AI suggestions approved and merged into your profile!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="container" style={{ maxWidth: '860px', marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            User Profile
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Keep your skills, experience, and interests updated for optimal AI matching
          </p>
        </div>

        <button
          type="button"
          className="btn btn-ai"
          onClick={() => setShowAiModal(true)}
        >
          <Sparkles size={16} />
          Analyze My Profile with AI
        </button>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--success-bg)',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontWeight: 600,
        }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
          Personal &amp; Professional Details
        </h3>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: 'var(--bg-surface)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Preferred Role</label>
              <select
                className="form-select"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="QA Tester">QA Tester</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                className="form-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Beginner">Beginner (0-1 yrs)</option>
                <option value="Intermediate">Intermediate (2-4 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
                <option value="Lead">Lead / Architect</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="Full-time">Full-time (40 hrs/wk)</option>
                <option value="Part-time (20 hrs/week)">Part-time (20 hrs/wk)</option>
                <option value="Part-time (10 hrs/week)">Part-time (10 hrs/wk)</option>
                <option value="Weekends only">Weekends only</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Bio</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. I am a Java developer interested in web development. I have built two Spring Boot projects and know MySQL."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Previous Project Experience</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="e.g. Smart Clinic API, Doctor Appointment Portal"
              value={previousProjects}
              onChange={(e) => setPreviousProjects(e.target.value)}
            />
          </div>

          {/* Interests */}
          <div className="form-group">
            <label className="form-label">Domain Interests</label>
            <div className="tags-wrap" style={{ marginBottom: '0.6rem' }}>
              {interests.map((intName, idx) => (
                <span key={idx} className="tag-item">
                  <Heart size={12} color="#ec4899" />
                  {intName}
                  <button type="button" onClick={() => handleRemoveInterest(intName)} style={{ color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                placeholder="Add interest (e.g. Healthcare, AI)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAddInterest}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Profile...' : (
                <>
                  <Save size={16} /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Manager Section */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
          My Verified Technical Skills
        </h3>
        <p className="card-subtitle" style={{ marginBottom: '1.25rem' }}>
          Add verified proficiencies used by both rule-based and AI matching algorithms
        </p>

        <div className="tags-wrap" style={{ marginBottom: '1.5rem', minHeight: '40px' }}>
          {skills.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No skills added yet.</p>
          ) : (
            skills.map((skill) => (
              <span key={skill.id} className="tag-item matched" style={{ padding: '0.35rem 0.75rem' }}>
                <strong>{skill.name}</strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({skill.proficiencyLevel || 'Intermediate'})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  style={{ color: '#065f46', marginLeft: '0.35rem' }}
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Skill Form */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1.5fr auto',
          gap: '0.75rem',
          alignItems: 'flex-end',
          background: 'var(--bg-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
        }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Skill Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Spring Boot, MySQL"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
            <select
              className="form-select"
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="Design">Design</option>
              <option value="Testing">Testing</option>
              <option value="DevOps">DevOps</option>
              <option value="AI/Data">AI / Data</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Proficiency</label>
            <select
              className="form-select"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ height: '38px', padding: '0 1rem' }}
            onClick={handleAddSkill}
          >
            <Plus size={16} /> Add Skill
          </button>
        </div>
      </div>

      {/* AI Profile Analyzer Modal */}
      {showAiModal && (
        <AiProfileModal
          bio={bio}
          previousProjects={previousProjects}
          onApply={handleApplyAiSuggestions}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;
