import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Mail, FolderKanban } from 'lucide-react';
import api from '../api/axios';

const MyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teams/my-teams')
      .then((res) => setTeams(res.data))
      .catch((err) => console.error('Failed to load teams:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your teams...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '960px', marginTop: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          My Active Teams
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Collaborate with your teammates across active projects
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Users size={44} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Active Teams</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            You haven't joined or created any active teams yet.
          </p>
          <Link to="/create-project" className="btn btn-primary btn-sm">
            Create a Project Team
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {teams.map((t) => (
            <div key={t.id} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
                    Project Team
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {t.projectName}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Team Roster: <strong>{t.members?.length || 0}</strong> of <strong>{t.targetTeamSize}</strong> positions filled
                  </p>
                </div>

                <Link to={`/projects/${t.projectId}`} className="btn btn-outline btn-sm">
                  View Project <ArrowRight size={14} />
                </Link>
              </div>

              {/* Members Roster */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {t.members?.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="avatar-circle" style={{ width: '2.25rem', height: '2.25rem', fontSize: '0.9rem' }}>
                        {m.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {m.fullName}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {m.roleName || 'Teammate'}
                        </p>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={12} /> {m.email}
                    </p>

                    {m.skills && m.skills.length > 0 && (
                      <div className="tags-wrap" style={{ marginTop: '0.2rem' }}>
                        {m.skills.slice(0, 3).map((sk, idx) => (
                          <span key={idx} className="tag-item" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTeams;
