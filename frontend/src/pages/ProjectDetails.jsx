import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, UserPlus, Cpu, Clock, CheckCircle, Trash2, ArrowLeft, Hourglass, Mail, Check, MessageSquare, Lock } from 'lucide-react';
import TeamBuilderModal from '../components/TeamBuilderModal';
import TeamAnalysisModal from '../components/TeamAnalysisModal';
import JoinRequestModal from '../components/JoinRequestModal';
import AiChatWidget from '../components/AiChatWidget';
import TeamChatWidget from '../components/TeamChatWidget';
import api from '../api/axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const [showTeamAnalysis, setShowTeamAnalysis] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  const fetchProjectAndTeam = async () => {
    try {
      const [projRes, teamRes, statusRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/team`),
        api.get(`/projects/${id}/status`).catch(() => ({ data: null })),
      ]);
      setProject(projRes.data);
      setTeam(teamRes.data);
      if (statusRes.data) {
        setUserStatus(statusRes.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load project details.');
      navigate('/my-projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTeam();
  }, [id]);

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/my-projects');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project.');
      }
    }
  };

  const handleAcceptInvite = async () => {
    if (!userStatus?.pendingRequestId) return;
    setAcceptingInvite(true);
    try {
      await api.put(`/team-requests/${userStatus.pendingRequestId}/accept`);
      await fetchProjectAndTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setAcceptingInvite(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading project details...</p>
      </div>
    );
  }

  const isOwner = user?.userId === project.ownerId || user?.role === 'ROLE_ADMIN';
  const members = team?.members || [];
  const currentCount = members.length;
  const targetCount = project.teamSize || 4;
  const isFull = currentCount >= targetCount;
  const progressPercent = Math.min(100, Math.round((currentCount / targetCount) * 100));

  return (
    <div className="container" style={{ maxWidth: '960px', marginTop: '2rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Project Overview Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${project.status === 'COMPLETED' ? 'badge-good' : project.status === 'IN_PROGRESS' || isFull ? 'badge-moderate' : 'badge-excellent'}`}>
                {isFull ? 'Team Full' : project.status === 'OPEN' ? 'Recruiting Teammates' : project.status}
              </span>
              <span className="badge badge-secondary">{project.complexity || 'Medium'} Complexity</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {project.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Created by <strong style={{ color: 'var(--text-main)' }}>{project.ownerName}</strong> &bull; {project.ownerEmail}
            </p>
          </div>

          {/* Action buttons on top right */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {(isOwner || userStatus?.isMember) && (
              <Link
                to={`/projects/${project.id}/chat`}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                title="Open Team Group Chat"
              >
                <MessageSquare size={15} /> Team Chat
              </Link>
            )}

            {isOwner && (
              <button onClick={handleDeleteProject} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: '#fca5a5' }} title="Delete Project">
                <Trash2 size={15} /> Delete
              </button>
            )}

            {!isOwner && userStatus && (
              userStatus.isMember ? (
                <span className="badge badge-good" style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={15} /> You are a Team Member
                </span>
              ) : userStatus.hasPendingRequest ? (
                userStatus.requestType === 'INVITATION' ? (
                  <button
                    onClick={handleAcceptInvite}
                    className="btn btn-primary btn-sm"
                    disabled={acceptingInvite}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Check size={15} /> Accept Team Invitation
                  </button>
                ) : (
                  <span className="badge badge-moderate" style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Hourglass size={15} /> Request to Join Pending
                  </span>
                )
              ) : isFull ? (
                <span className="badge badge-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}>
                  Team Full
                </span>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <UserPlus size={16} /> Request to Join Project
                </button>
              )
            )}
          </div>
        </div>

        {/* Informative Banner for non-owners with pending status */}
        {!isOwner && userStatus?.hasPendingRequest && (
          <div style={{
            background: userStatus.requestType === 'INVITATION' ? '#eff6ff' : '#fffbeb',
            border: `1px solid ${userStatus.requestType === 'INVITATION' ? '#bfdbfe' : '#fde68a'}`,
            color: userStatus.requestType === 'INVITATION' ? '#1e40af' : '#92400e',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {userStatus.requestType === 'INVITATION' ? <Mail size={16} /> : <Hourglass size={16} />}
              <span>
                {userStatus.requestType === 'INVITATION'
                  ? 'The project owner has invited you to join this team!'
                  : 'Your request to join this project has been submitted and is currently awaiting the project owner’s review.'}
              </span>
            </div>
            {userStatus.requestType === 'INVITATION' && (
              <button
                onClick={handleAcceptInvite}
                className="btn btn-primary btn-sm"
                disabled={acceptingInvite}
              >
                Accept &amp; Join
              </button>
            )}
          </div>
        )}

        <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          {project.description}
        </p>

        {/* Requirements & Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Required Skills
            </h4>
            <div className="tags-wrap">
              {project.requiredSkills?.map((s, idx) => (
                <span key={idx} className="tag-item matched">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Required Roles
            </h4>
            <div className="tags-wrap">
              {project.requiredRoles?.map((r, idx) => (
                <span key={idx} className="tag-item" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Logistics
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <strong>Duration:</strong> {project.duration || 'Flexible'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <strong>Availability:</strong> {project.availabilityRequirement || 'Flexible'}
            </p>
          </div>
        </div>

        {/* Team Fill Progress */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} /> Team Roster ({currentCount} / {targetCount} spots filled)
            </span>
            <span className="badge badge-primary">{progressPercent}% Filled</span>
          </div>

          <div style={{ height: '8px', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1rem' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Members List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {members.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="avatar-circle" style={{ width: '2.25rem', height: '2.25rem', fontSize: '0.95rem' }}>
                  {m.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {m.fullName}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {m.roleName || 'Team Member'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Action Toolbelt for Owner */}
        {isOwner && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <Link to={`/projects/${project.id}/find-teammates`} className="btn btn-primary">
              <UserPlus size={16} />
              Find Teammates with AI
            </Link>

            <button onClick={() => setShowTeamBuilder(true)} className="btn btn-ai">
              <Sparkles size={16} />
              Build My Team with AI
            </button>

            <button onClick={() => setShowTeamAnalysis(true)} className="btn btn-outline">
              <Cpu size={16} />
              Analyze Team
            </button>
          </div>
        )}

        {/* Action Button for Non-Owner (at bottom if not already applied) */}
        {!isOwner && userStatus && !userStatus.isMember && !userStatus.hasPendingRequest && !isFull && (
          <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <UserPlus size={18} /> Request to Join this Team
            </button>
          </div>
        )}
      </div>

      {/* Team Group Chat Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <MessageSquare size={20} color="var(--primary)" /> Team Group Chat
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.15rem' }}>
              Real-time collaboration and chat for all joined team members
            </p>
          </div>
          {(isOwner || userStatus?.isMember) && (
            <Link to={`/projects/${project.id}/chat`} className="btn btn-outline btn-sm">
              Open Fullscreen Chat
            </Link>
          )}
        </div>

        {isOwner || userStatus?.isMember ? (
          <TeamChatWidget projectId={project.id} height="480px" showHeader={false} />
        ) : (
          <div
            className="card"
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px dashed var(--border)',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Lock size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Team Group Chat is Reserved for Members
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Only members who have joined this project team can view previous conversations or send real-time messages.
            </p>
            {!userStatus?.hasPendingRequest && !isFull && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UserPlus size={15} /> Request to Join Team to Unlock Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Embedded Project AI Chatbot / Assistant */}
      <AiChatWidget projectId={project.id} projectName={project.name} />

      {/* Modals */}
      {showTeamBuilder && (
        <TeamBuilderModal
          projectId={project.id}
          project={project}
          onClose={() => setShowTeamBuilder(false)}
          onInviteSuccess={fetchProjectAndTeam}
        />
      )}

      {showTeamAnalysis && (
        <TeamAnalysisModal
          projectId={project.id}
          projectName={project.name}
          onClose={() => setShowTeamAnalysis(false)}
        />
      )}

      {showJoinModal && (
        <JoinRequestModal
          project={project}
          onClose={() => setShowJoinModal(false)}
          onSuccess={fetchProjectAndTeam}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
