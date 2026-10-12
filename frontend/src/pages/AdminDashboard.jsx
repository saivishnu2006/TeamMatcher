import React, { useState, useEffect } from 'react';
import { Shield, Users, FolderKanban, Mail, CheckCircle, Trash2, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, projRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/projects'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProjects(projRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Delete user "${name}"? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        await fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteProject = async (projId, name) => {
    if (window.confirm(`Delete project "${name}"? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/projects/${projId}`);
        await fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading administrative portal...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1080px', marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            System Administration
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Global platform metrics, user access management, and project oversight
          </p>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Users</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {stats?.totalUsers || 0}
          </h3>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Projects Created</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {stats?.totalProjects || 0}
          </h3>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Project Teams</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>
            {stats?.totalTeams || 0}
          </h3>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Team Invites</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
            {stats?.pendingRequests || 0}
          </h3>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Manage Projects ({projects.length})
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>User</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Preferred Specialty</th>
                <th style={{ padding: '0.75rem' }}>Skills Count</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {u.fullName}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>
                    {u.preferredRole || 'Contributor'}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {u.skills?.length || 0} skills
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleToggleRole(u.userId, u.role)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        {u.role === 'ROLE_ADMIN' ? 'Demote to Member' : 'Promote to Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.userId, u.fullName)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', borderColor: '#fca5a5', padding: '0.2rem 0.5rem' }}
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Project Name</th>
                <th style={{ padding: '0.75rem' }}>Owner</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Team Capacity</th>
                <th style={{ padding: '0.75rem' }}>Required Skills</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.ownerName}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-excellent">{p.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {p.currentTeamSize} / {p.teamSize} members
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.requiredSkills?.join(', ')}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteProject(p.id, p.name)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: '#fca5a5', padding: '0.2rem 0.5rem' }}
                      title="Delete Project"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
