import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate or fetch fresh profile
      api.get('/profile')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = response.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);

    // Fetch full profile info
    const profileRes = await api.get('/profile');
    const fullUser = profileRes.data;
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  };

  const register = async (email, password, fullName, role = 'ROLE_USER') => {
    const response = await api.post('/auth/register', { email, password, fullName, role });
    const { token: jwtToken, ...userData } = response.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);

    const profileRes = await api.get('/profile');
    const fullUser = profileRes.data;
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
