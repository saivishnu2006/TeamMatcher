import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderKanban, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import TeamChatWidget from '../components/TeamChatWidget';
import api from '../api/axios';

const TeamChatPage = () => {
  const { teamId, projectId } = useParams();
  const navigate = useNavigate();

  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = teamId
      ? `/teams/${teamId}/chat/info`
      : `/projects/${projectId}/chat/info`;

    api.get(url)
      .then((res) => {
        setChatInfo(res.data);
      })
      .catch((err) => {
        console.error('Failed to load chat info:', err);
      })
      .finally(() => setLoading(false));
  }, [teamId, projectId]);

  return (
    <div className="container" style={{ maxWidth: '1180px', marginTop: '1.75rem' }}>
      {/* Navigation header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {chatInfo?.projectName ? `${chatInfo.projectName} Team Chat` : 'Project Team Chat'}
            </h1>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.15rem' }}>
              Real-time collaboration group chat for team members
            </p>
          </div>
        </div>

        {chatInfo?.projectId && (
          <Link to={`/projects/${chatInfo.projectId}`} className="btn btn-outline btn-sm">
            <FolderKanban size={14} /> View Project Page
          </Link>
        )}
      </div>

      {/* Main Grid: Sidebar + Chat Widget */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 290px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="team-chat-grid"
      >
        {/* Main Chat Widget Container */}
        <div>
          <TeamChatWidget
            teamId={teamId ? Number(teamId) : undefined}
            projectId={projectId ? Number(projectId) : undefined}
            height="640px"
            showHeader={true}
            onOpenProject={(pId) => navigate(`/projects/${pId}`)}
          />
        </div>

        {/* Team Members Roster Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Users size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Team Roster ({chatInfo?.memberCount || 0})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chatInfo?.members?.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <div className="avatar-circle" style={{ width: '2rem', height: '2rem', fontSize: '0.85rem' }}>
                    {member.fullName?.charAt(0) || 'U'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {member.fullName}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {member.roleName || 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={14} color="var(--success)" />
              <span>Only verified team members can access this chat</span>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.15rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Real-Time WebSocket
              </h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
              Messages sync instantly across all online team members via Spring Boot WebSocket and are permanently stored in MySQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChatPage;
