import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, PlusCircle, Users, Sparkles } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import api from '../api/axios';

const MyProjects = () => {
  const [activeTab, setActiveTab] = useState('owned');
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [ownedRes, joinedRes] = await Promise.all([
          api.get('/projects/my-projects'),
          api.get('/projects/joined'),
        ]);
        setOwnedProjects(ownedRes.data);
        setJoinedProjects(joinedRes.data);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="container" style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Project Directory
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage the projects you own or collaborate on
          </p>
        </div>

        <Link to="/create-project" className="btn btn-primary">
          <PlusCircle size={16} /> Create Project
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          My Created Projects ({ownedProjects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Joined Teams ({joinedProjects.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading projects...</p>
        </div>
      ) : activeTab === 'owned' ? (
        ownedProjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <FolderKanban size={44} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Created Projects Yet</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Create a project to find teammates with AI matching.
            </p>
            <Link to="/create-project" className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Create a Project
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {ownedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} isOwner={true} />
            ))}
          </div>
        )
      ) : (
        joinedProjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Users size={44} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Joined Teams</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              You haven't joined any other project teams yet. Accept pending invitations to join teams!
            </p>
            <Link to="/team-requests" className="btn btn-outline btn-sm">
              Check Invitations
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {joinedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} isOwner={false} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyProjects;
