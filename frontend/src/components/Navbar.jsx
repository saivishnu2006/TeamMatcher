import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Sparkles, FolderKanban, Mail, Shield, User, LogOut, PlusCircle } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/team-requests/received')
        .then((res) => {
          const pending = res.data.filter((r) => r.status === 'PENDING').length;
          setPendingCount(pending);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <span>AI Team Matcher</span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav>
              <ul className="nav-links">
                <li>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-projects"
                    className={`nav-link ${location.pathname.startsWith('/my-projects') || location.pathname.startsWith('/projects') ? 'active' : ''}`}
                  >
                    <FolderKanban size={16} />
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/team-requests"
                    className={`nav-link ${location.pathname === '/team-requests' ? 'active' : ''}`}
                  >
                    <Mail size={16} />
                    Requests
                    {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-teams"
                    className={`nav-link ${location.pathname === '/my-teams' ? 'active' : ''}`}
                  >
                    <Users size={16} />
                    My Teams
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                      style={{ color: '#8b5cf6' }}
                    >
                      <Shield size={16} />
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="user-menu">
              <Link to="/create-project" className="btn btn-primary btn-sm">
                <PlusCircle size={15} />
                New Project
              </Link>

              <Link to="/profile" className="user-avatar-btn" title="View Profile">
                <div className="avatar-circle">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span>{user?.fullName?.split(' ')[0] || 'User'}</span>
              </Link>

              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log Out">
                <LogOut size={15} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
