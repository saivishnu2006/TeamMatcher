import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FolderKanban, Users, Mail, PlusCircle, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import JoinRequestModal from '../components/JoinRequestModal';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [openProjects, setOpenProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectForJoin, setSelectedProjectForJoin] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [myRes, joinedRes, openRes, recRes, sentRes] = await Promise.all([
        api.get('/projects/my-projects'),
        api.get('/projects/joined'),
        api.get('/projects'),
        api.get('/team-requests/received'),
        api.get('/team-requests/sent'),
      ]);

      setMyProjects(myRes.data);
      setJoinedProjects(joinedRes.data);
      setOpenProjects(openRes.data.filter((p) => p.ownerId !== user?.userId));
      setPendingRequests(recRes.data.filter((r) => r.status === 'PENDING'));
      setSentRequests(sentRes.data.filter((r) => r.status === 'PENDING'));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Derive dynamic AI insights based on profile and projects
  const getAiInsight = () => {
    const skills = user?.skills?.map((s) => s.name?.toLowerCase()) || [];
    const hasBackend = skills.some((s) => s.includes('spring') || s.includes('java') || s.includes('sql'));
    const hasFrontend = skills.some((s) => s.includes('react') || s.includes('javascript') || s.includes('css'));

    if (hasBackend && !hasFrontend) {
      return {
        title: "Strong Backend Profile",
        desc: "Your strongest verified skill is backend development with Java and database persistence. When building teams, search for dedicated React and UI/UX designers to balance your architecture."
      };
    } else if (hasFrontend && !hasBackend) {
      return {
        title: "Frontend & UI Focus",
        desc: "You have strong frontend capabilities in React. Consider partnering with Spring Boot and database architects for end-to-end full-stack velocity."
      };
    } else {
      return {
        title: "Full-Stack Versatility",
        desc: "You currently possess balanced full-stack coverage across frontend and backend technologies. Consider inviting QA Testing and specialized UX designers to finalize your release pipeline."
      };
    }
  };

  const insight = getAiInsight();

  // Helper sets to check status in constant time
  const joinedProjectIds = new Set(joinedProjects.map((p) => p.id));
  const pendingSentProjectIds = new Set(sentRequests.map((r) => r.projectId));

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div>
          <span style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.813rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={14} /> AI-Powered Team Matching
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Welcome, {user?.fullName || 'Teammate'}!
          </h1>
          <p style={{ color: '#c7d2fe', marginTop: '0.35rem', maxWidth: '600px', fontSize: '0.95rem' }}>
            Find the most suitable teammates for your projects with hybrid rule-based and Gemini AI matching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/create-project" className="btn btn-ai" style={{ padding: '0.75rem 1.25rem' }}>
            <PlusCircle size={18} />
            Create Project
          </Link>
          <Link to="/profile" className="btn" style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
            My Profile
          </Link>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Projects</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{myProjects.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Joined Projects</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{joinedProjects.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Requests</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{pendingRequests.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Verified Skills</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.skills?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="ai-banner" style={{ marginBottom: '2.5rem' }}>
        <div className="ai-banner-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            AI Insights: {insight.title}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            "{insight.desc}"
          </p>
        </div>
      </div>

      {/* My Projects Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              My Projects
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Projects you lead and manage
            </p>
          </div>
          <Link to="/create-project" className="btn btn-outline btn-sm">
            <PlusCircle size={14} /> New Project
          </Link>
        </div>

        {myProjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <FolderKanban size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>You haven't created any projects yet</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Create a project now and let AI match you with top engineers!
            </p>
            <Link to="/create-project" className="btn btn-primary btn-sm">
              Create My First Project
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {myProjects.map((p) => (
              <ProjectCard key={p.id} project={p} isOwner={true} />
            ))}
          </div>
        )}
      </div>

      {/* Open Recommended Projects Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recommended Projects for You
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Projects looking for your skills &bull; Click "Join" to send a request to the project lead
            </p>
          </div>
        </div>

        {openProjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No other active projects recruiting at this moment.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {openProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isOwner={false}
                isMember={joinedProjectIds.has(p.id)}
                hasPendingRequest={pendingSentProjectIds.has(p.id)}
                onRequestJoin={(project) => setSelectedProjectForJoin(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {selectedProjectForJoin && (
        <JoinRequestModal
          project={selectedProjectForJoin}
          onClose={() => setSelectedProjectForJoin(null)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;
