import React, { useState } from 'react';
import { notificationApi } from '../services/api';

const pageTitles = {
  dashboard: 'Dashboard',
  homes: 'My Homes',
  devices: 'Devices',
  energy: 'Energy Usage',
  chat: 'Chat Assistant',
  voice: 'Voice Assistant',
  reports: 'Reports',
  settings: 'Settings',
};

export default function Topbar({ 
  t, 
  activePage, 
  selectedHome, 
  user, 
  setActivePage, 
  homesList = [], 
  setSelectedHome,
  notifications = [],
  fetchNotifications
}) {
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      if (fetchNotifications) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{pageTitles[activePage] || 'Dashboard'}</div>
      </div>

      <div className="topbar-right">
        {/* Home Selector */}
        <div style={{ position: 'relative' }}>
          <div className="home-selector" onClick={() => setShowHomeMenu(v => !v)}>
            <div className="home-dot"></div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedHome?.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>▼</span>
          </div>
          {showHomeMenu && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '8px', minWidth: 200,
              zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
              {homesList.map(h => (
                <div
                  key={h.id}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 500,
                    background: selectedHome?.id === h.id ? 'var(--teal-glow)' : 'transparent',
                    color: selectedHome?.id === h.id ? 'var(--teal)' : 'var(--text-primary)',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => { 
                    setSelectedHome(h);
                    setShowHomeMenu(false); 
                  }}
                >
                  {h.home_type === 'Office' ? '🏢' : h.home_type === 'Villa' ? '🏡' : '🏠'} {h.name}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{h.location}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            title="Notifications" 
            style={{ fontSize: 16, position: 'relative', cursor: 'pointer', border: 'none', background: 'transparent' }}
            onClick={() => {
              setShowNotifMenu(v => !v);
              setShowProfile(false);
              setShowHomeMenu(false);
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2,
                background: 'var(--red, #ef4444)', color: 'white',
                fontSize: 9, fontWeight: 700, borderRadius: '50%',
                width: 14, height: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 6px rgba(239,68,68,0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute', top: '125%', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '12px 0', minWidth: 320,
              maxWidth: 380, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: '0 16px 8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Alerts & Notifications</span>
                {unreadCount > 0 && <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 500 }}>{unreadCount} New</span>}
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    📭 No notifications at this time.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: n.is_read ? 'transparent' : n.type === 'warning' ? 'rgba(239,68,68,0.07)' : 'rgba(20,184,166,0.05)',
                        cursor: n.is_read ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex', gap: 12
                      }}
                      onClick={() => !n.is_read && handleMarkRead(n.id)}
                    >
                      <div style={{ fontSize: 18 }}>
                        {n.type === 'warning' ? '⚠️' : 'ℹ️'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <div style={{ 
                          fontSize: 12, 
                          fontWeight: n.is_read ? 500 : 700, 
                          color: n.type === 'warning' ? 'var(--red, #ef4444)' : 'var(--text-primary)' 
                        }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {!n.is_read && (
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: n.type === 'warning' ? 'var(--red, #ef4444)' : 'var(--teal)',
                          alignSelf: 'center'
                        }} title="Mark read"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div 
            className="avatar" 
            title={user.name} 
            onClick={() => {
              setShowProfile(v => !v);
              setShowNotifMenu(false);
              setShowHomeMenu(false);
            }}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {user.avatar}
          </div>
          {showProfile && (
            <div style={{
              position: 'absolute', top: '115%', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '20px', minWidth: 260,
              zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              {/* Header with Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white'
                }}>
                  {user.avatar}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>User Account</span>
                </div>
              </div>
              
              {/* Detailed fields: Email & House */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📧 Email Address</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏠 Active House</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {selectedHome ? `${selectedHome.name} (${selectedHome.home_type})` : 'No house selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 House Location</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedHome?.location || 'N/A'}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button 
                  onClick={() => {
                    setActivePage('settings');
                    setShowProfile(false);
                  }}
                  style={{
                    flex: 1, padding: '8px 12px', background: 'var(--teal-glow)',
                    border: '1px solid var(--border-active)', borderRadius: 6,
                    fontSize: 12, color: 'var(--teal)', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  ⚙️ Settings
                </button>
                <button 
                  onClick={() => setShowProfile(false)}
                  style={{
                    padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
