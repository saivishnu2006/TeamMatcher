import React, { useState, useEffect } from 'react';
import { Mail, Check, X, Clock, FolderKanban, ArrowRight, User, UserPlus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const TeamRequests = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const [recRes, sentRes] = await Promise.all([
        api.get('/team-requests/received'),
        api.get('/team-requests/sent'),
      ]);
      setReceivedRequests(recRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/team-requests/${id}/accept`);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/team-requests/${id}/reject`);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="badge badge-excellent">Accepted</span>;
      case 'REJECTED':
        return <span className="badge badge-low">Rejected</span>;
      default:
        return <span className="badge badge-moderate">Pending</span>;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '880px', marginTop: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Team Requests &amp; Invitations
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Review join requests for your projects and manage project invitations
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading team requests...</p>
        </div>
      ) : activeTab === 'received' ? (
        receivedRequests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <Mail size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Received Requests</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              When teammates request to join your projects or invite you to theirs, they will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receivedRequests.map((req) => {
              const isJoinRequest = req.requestType === 'JOIN_REQUEST';
              return (
                <div key={req.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className={`badge ${isJoinRequest ? 'badge-primary' : 'badge-secondary'}`}>
                          {isJoinRequest ? 'Candidate Join Request' : 'Project Invitation'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {req.projectName}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {isJoinRequest ? (
                          <>
                            Applicant: <strong>{req.senderName}</strong> &bull; {req.senderEmail} {req.senderRole && `(${req.senderRole})`}
                          </>
                        ) : (
                          <>
                            Invited by project lead: <strong>{req.senderName}</strong> &bull; {req.senderEmail}
                          </>
                        )}
                      </p>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '1rem', fontStyle: 'italic', border: '1px solid var(--border)' }}>
                    "{req.message || (isJoinRequest ? 'I would like to join this project team.' : 'You are invited to join the project team!')}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Received on {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {req.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                            disabled={actionLoading}
                          >
                            <X size={14} /> Reject
                          </button>
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="btn btn-primary btn-sm"
                            disabled={actionLoading}
                          >
                            <Check size={14} />
                            {isJoinRequest ? 'Accept Candidate into Team' : 'Accept & Join Team'}
                          </button>
                        </>
                      ) : (
                        <Link to={`/projects/${req.projectId}`} className="btn btn-outline btn-sm">
                          View Project <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        sentRequests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <Mail size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Sent Requests</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              You haven't sent any invitations or join requests yet. Explore recommended projects to request to join!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sentRequests.map((req) => {
              const isJoinRequest = req.requestType === 'JOIN_REQUEST';
              return (
                <div key={req.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge ${isJoinRequest ? 'badge-primary' : 'badge-secondary'}`}>
                          {isJoinRequest ? 'Join Application Sent' : 'Team Invitation Sent'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {isJoinRequest ? `Requested to join ${req.projectName}` : `Invited ${req.receiverName}`}
                      </h4>
                      <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                        {isJoinRequest
                          ? `Project Lead: ${req.receiverName} (${req.receiverEmail})`
                          : `Project: ${req.projectName} • Recipient: ${req.receiverEmail}`}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {getStatusBadge(req.status)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default TeamRequests;
