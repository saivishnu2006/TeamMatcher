import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, ArrowRight, UserPlus, CheckCircle, Hourglass } from 'lucide-react';

const ProjectCard = ({
  project,
  isOwner = false,
  isMember = false,
  hasPendingRequest = false,
  onRequestJoin,
}) => {
  const currentMembers = project.currentTeamSize || 1;
  const targetMembers = project.teamSize || 4;
  const isFull = currentMembers >= targetMembers;
  const progressPercent = Math.min(100, Math.round((currentMembers / targetMembers) * 100));

  return (
    <div className="card project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header" style={{ marginBottom: '0.5rem' }}>
        <div>
          <span className={`badge ${project.status === 'COMPLETED' ? 'badge-good' : project.status === 'IN_PROGRESS' || isFull ? 'badge-moderate' : 'badge-excellent'}`} style={{ marginBottom: '0.4rem' }}>
            {isFull ? 'Team Full' : project.status === 'OPEN' ? 'Recruiting' : project.status}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {project.name}
          </h3>
        </div>

        {project.complexity && (
          <span className="badge badge-secondary">
            {project.complexity}
          </span>
        )}
      </div>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {project.description}
      </p>

      {/* Team Size Progress */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} /> Team Fill:
          </span>
          <strong style={{ color: 'var(--text-main)' }}>
            {currentMembers} / {targetMembers} members
          </strong>
        </div>
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: progressPercent === 100 ? 'var(--success)' : 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Required Skills */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Required Skills:
        </p>
        <div className="tags-wrap">
          {project.requiredSkills && project.requiredSkills.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="tag-item">
              {skill}
            </span>
          ))}
          {project.requiredSkills && project.requiredSkills.length > 4 && (
            <span className="tag-item" style={{ color: 'var(--text-muted)' }}>
              +{project.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={13} />
          <span>{project.duration || 'Flexible'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isOwner && (
            isMember ? (
              <span className="badge badge-good" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={12} /> Member
              </span>
            ) : hasPendingRequest ? (
              <span className="badge badge-moderate" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Hourglass size={12} /> Pending
              </span>
            ) : isFull ? (
              <span className="badge badge-secondary">Full</span>
            ) : onRequestJoin ? (
              <button
                type="button"
                onClick={() => onRequestJoin(project)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem' }}
              >
                <UserPlus size={13} /> Join
              </button>
            ) : null
          )}

          <Link to={`/projects/${project.id}`} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
            {isOwner ? 'Manage' : 'View'}
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
