import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, ShieldAlert, Wifi, WifiOff, Clock, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr}, ${timeStr}`;
};

const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const TeamChatWidget = ({ teamId, projectId, height = '560px', showHeader = true, onOpenProject }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const currentTeamIdRef = useRef(teamId);

  // Keep ref updated
  useEffect(() => {
    currentTeamIdRef.current = teamId || chatInfo?.teamId;
  }, [teamId, chatInfo]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Fetch Chat Info & Initial History from MySQL
  const loadChatData = async () => {
    setLoading(true);
    setAccessDenied(false);
    setErrorMessage('');

    const infoUrl = teamId
      ? `/teams/${teamId}/chat/info`
      : `/projects/${projectId}/chat/info`;

    const messagesUrl = teamId
      ? `/teams/${teamId}/chat/messages`
      : `/projects/${projectId}/chat/messages`;

    try {
      const infoRes = await api.get(infoUrl);
      setChatInfo(infoRes.data);

      if (!infoRes.data.member) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const msgRes = await api.get(messagesUrl);
      setMessages(msgRes.data);
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
    } catch (err) {
      if (err.response?.status === 403) {
        setAccessDenied(true);
        setErrorMessage(err.response?.data?.message || 'Access restricted to active team members.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to load group chat.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [teamId, projectId]);

  // 2. Setup Real-Time WebSocket via STOMP & SockJS
  useEffect(() => {
    const activeTeamId = teamId || chatInfo?.teamId;
    if (!activeTeamId || accessDenied) return;

    const token = localStorage.getItem('token');
    let wsEndpoint = '/ws-chat';
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (import.meta.env.VITE_WS_URL) {
      wsEndpoint = import.meta.env.VITE_WS_URL.replace(/\/+$/, '') + '/ws-chat';
    } else if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const backendOrigin = new URL(apiUrl).origin;
        wsEndpoint = `${backendOrigin}/ws-chat`;
      } catch (e) {
        // fallback to /ws-chat
      }
    }

    const socketUrl = token
      ? `${wsEndpoint}?token=${encodeURIComponent(token)}`
      : wsEndpoint;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setWsConnected(true);
        // Subscribe to real-time team messages
        client.subscribe(`/topic/teams/${activeTeamId}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) {
                return prev;
              }
              return [...prev, payload];
            });
            setTimeout(() => scrollToBottom(true), 50);
          } catch (e) {
            console.error('Error parsing chat frame:', e);
          }
        });
      },
      onDisconnect: () => {
        setWsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP broker error:', frame.headers['message']);
        setWsConnected(false);
      },
      onWebSocketClose: () => {
        setWsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [teamId, chatInfo?.teamId, accessDenied]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  // 3. Send message handler (atomic REST call + WebSocket broadcast)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    const activeTeamId = teamId || chatInfo?.teamId;
    if (!activeTeamId) return;

    setSending(true);
    try {
      // Sending via REST ensures DB persistence and immediate error verification
      const res = await api.post(`/teams/${activeTeamId}/chat/messages`, { content });
      const savedMsg = res.data;

      // Optimistically add to messages if not already arrived from WS
      setMessages((prev) => {
        if (prev.some((m) => m.id === savedMsg.id)) return prev;
        return [...prev, savedMsg];
      });

      setNewMessage('');
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      if (err.response?.status === 403) {
        setAccessDenied(true);
        setErrorMessage('You are no longer authorized to send messages to this team chat.');
      } else {
        alert(err.response?.data?.message || 'Failed to send message.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // State: Loading
  if (loading) {
    return (
      <div
        className="card"
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Connecting to Team Chat...
        </p>
      </div>
    );
  }

  // State: Access Denied (Non-member protection)
  if (accessDenied) {
    return (
      <div
        className="card"
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #fff 0%, #fef2f2 100%)',
          border: '1px solid #fecaca',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-full)',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldAlert size={32} />
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Members-Only Team Chat
        </h3>
        <p
          style={{
            maxWidth: '460px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            lineHeight: 1.55,
            marginBottom: '1.5rem',
          }}
        >
          {errorMessage ||
            `This group chat is restricted strictly to active members of "${chatInfo?.projectName || 'this project'}". You must be a member of the team to view previous discussions or send real-time messages.`}
        </p>
        {chatInfo?.projectId && onOpenProject && (
          <button onClick={() => onOpenProject(chatInfo.projectId)} className="btn btn-primary btn-sm">
            View Project &amp; Request to Join
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Chat Header */}
      {showHeader && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {chatInfo?.projectName ? `${chatInfo.projectName} Chat` : 'Team Group Chat'}
                </h3>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                  Team #{chatInfo?.teamId || teamId}
                </span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.15rem' }}>
                {chatInfo?.memberCount || 0} active {chatInfo?.memberCount === 1 ? 'member' : 'members'} in room
              </p>
            </div>
          </div>

          {/* WebSocket Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className={`badge ${wsConnected ? 'badge-good' : 'badge-moderate'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
              }}
              title={wsConnected ? 'Real-time WebSocket connection active' : 'Connecting to real-time WebSocket...'}
            >
              {wsConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
              {wsConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          background: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-muted)',
              maxWidth: '340px',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Sparkles size={24} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Welcome to Team Chat!
            </h4>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
              This group chat is saved to MySQL and synced in real time. Send your first message to greet your team.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.senderId === user?.userId ||
              msg.senderEmail === user?.email;

            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                }}
              >
                {/* Sender Metadata Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    padding: isMe ? '0 0.4rem 0 0' : '0 0 0 0.4rem',
                  }}
                >
                  <strong style={{ color: isMe ? 'var(--primary)' : 'var(--text-main)', fontWeight: 700 }}>
                    {isMe ? 'You' : msg.senderName}
                  </strong>
                  {msg.senderRole && (
                    <span
                      style={{
                        background: isMe ? 'var(--primary-light)' : 'var(--bg-surface)',
                        color: isMe ? 'var(--primary)' : 'var(--text-muted)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.675rem',
                        fontWeight: 600,
                      }}
                    >
                      {msg.senderRole}
                    </span>
                  )}
                  <span title={formatFullDate(msg.timestamp)} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-light)' }}>
                    &bull; {formatMessageTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: isMe
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    background: isMe
                      ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)'
                      : '#ffffff',
                    color: isMe ? '#ffffff' : 'var(--text-main)',
                    boxShadow: isMe ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'var(--shadow-sm)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '0.85rem 1rem',
          background: '#ffffff',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Type your message to the team... (Press Enter to send)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          style={{
            flex: 1,
            borderRadius: 'var(--radius-full)',
            padding: '0.65rem 1.15rem',
            fontSize: '0.9rem',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!newMessage.trim() || sending}
          style={{
            borderRadius: 'var(--radius-full)',
            width: '2.5rem',
            height: '2.5rem',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Send message"
        >
          {sending ? <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};

export default TeamChatWidget;
