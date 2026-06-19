import React, { useState, useEffect } from 'react';
import './index.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import ChatPage from './pages/ChatPage';

import EnergyPage from './pages/EnergyPage';
import HomesPage from './pages/HomesPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { authApi, homeApi, notificationApi } from './services/api';
import { translations } from './data/mockData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', avatar: '' });
  const [activePage, setActivePage] = useState('dashboard');
  const [homesList, setHomesList] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [language, setLanguage] = useState('en');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Password Reset Redirect
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);

  const t = translations[language] || translations['en'];

  useEffect(() => {
    // Check if token exists on load
    const checkAuth = async () => {
      // Parse token from URL hash or query parameters (Google OAuth / Recovery callback redirect)
      const hash = window.location.hash;
      const search = window.location.search;
      let accessToken = null;
      let type = null;
      
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        accessToken = params.get('access_token');
        type = params.get('type');
      }
      if (!accessToken && search) {
        const params = new URLSearchParams(search);
        accessToken = params.get('access_token') || params.get('token');
        type = params.get('type');
      }
      
      let isRecoveryToken = false;
      let isSignupVerification = false;
      
      if (accessToken) {
        if (type === 'recovery') {
          localStorage.setItem('reset_token', accessToken);
          isRecoveryToken = true;
          setShowResetPassword(true);
        } else if (type === 'signup') {
          isSignupVerification = true;
          try {
            const res = await authApi.verifyEmail(accessToken);
            if (res.success) {
              window.emailVerificationSuccess = "Email verified successfully! You can now log in.";
            } else {
              window.emailVerificationError = res.message || "Email verification failed.";
            }
          } catch (err) {
            console.error("Verification failed:", err);
            window.emailVerificationError = "Email verification failed.";
          }
        } else {
          localStorage.setItem('token', accessToken);
        }
        // Remove parameters from address bar for visual cleanliness
        window.history.replaceState(null, null, ' ');
      }

      // If this is a password-recovery or signup token, skip the profile check.
      if (isRecoveryToken || isSignupVerification) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          if (profile && profile.user) {
            setUser({
              name: profile.user.name || profile.user.email.split('@')[0],
              email: profile.user.email,
              avatar: (profile.user.name || profile.user.email).substring(0, 2).toUpperCase()
            });
            setIsLoggedIn(true);
            await fetchHomes();
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchHomes = async () => {
    try {
      const list = await homeApi.getHomes();
      setHomesList(list);
      if (list.length > 0) {
        setSelectedHome(list[0]);
      }
    } catch (err) {
      console.error("Failed to load homes:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!selectedHome) return;
    try {
      const list = await notificationApi.getNotifications(selectedHome.id);
      setNotifications(list);
      
      // Trigger Web Push Notifications for unread WARNINGS
      const unreadWarnings = list.filter(n => !n.is_read && n.type === 'warning');
      unreadWarnings.forEach(notif => {
        const seenKey = `seen_notif_${notif.id}`;
        if (!localStorage.getItem(seenKey)) {
          if (Notification.permission === 'granted') {
            new Notification(notif.title, {
              body: notif.message,
              icon: '/favicon.ico'
            });
          }
          localStorage.setItem(seenKey, 'true');
        }
      });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Poll notifications
  useEffect(() => {
    if (isLoggedIn && selectedHome) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // 20 sec polling
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, selectedHome]);

  // Request browser Notification permissions
  useEffect(() => {
    if (isLoggedIn && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [isLoggedIn]);

  const handleLogin = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success) {
      const profile = await authApi.getProfile();
      setUser({
        name: profile.user.name || profile.user.email.split('@')[0],
        email: profile.user.email,
        avatar: (profile.user.name || profile.user.email).substring(0, 2).toUpperCase()
      });
      setIsLoggedIn(true);
      await fetchHomes();
      setActivePage('dashboard');
      return res;
    } else {
      throw new Error(res.message || "Login failed");
    }
  };

  const handleRegister = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (!res.success) {
      throw new Error(res.message || "Registration failed");
    }
    return res;
  };


  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setSelectedHome(null);
    setHomesList([]);
    setNotifications([]);
  };

  // Enforce selecting/creating an active home after login
  useEffect(() => {
    if (isLoggedIn && !selectedHome && activePage !== 'homes' && !loading) {
      setActivePage('homes');
    }
  }, [isLoggedIn, selectedHome, activePage, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--teal)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, animation: 'spin 1.5s linear infinite', marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>LOADING VIDHYUTH NETRA...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || showResetPassword) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        showSignup={showSignup} 
        setShowSignup={setShowSignup} 
        showResetPassword={showResetPassword}
        setShowResetPassword={setShowResetPassword}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': 
        return <Dashboard t={t} selectedHome={selectedHome} language={language} homesList={homesList} setSelectedHome={setSelectedHome} />;
      case 'homes': 
        return <HomesPage t={t} homesList={homesList} fetchHomes={fetchHomes} selectedHome={selectedHome} setSelectedHome={setSelectedHome} />;
      case 'devices': 
        return <DevicesPage t={t} selectedHome={selectedHome} />;
      case 'energy': 
        return <EnergyPage t={t} selectedHome={selectedHome} />;
      case 'chat': 
        return <ChatPage t={t} language={language} selectedHome={selectedHome} />;

      case 'reports': 
        return <ReportsPage t={t} selectedHome={selectedHome} />;
      case 'settings': 
        return <SettingsPage t={t} language={language} setLanguage={setLanguage} user={user} />;
      default: 
        return <Dashboard t={t} selectedHome={selectedHome} language={language} homesList={homesList} setSelectedHome={setSelectedHome} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} t={t} language={language} setLanguage={setLanguage} onLogout={handleLogout} />
      <div className="main-content">
        <Topbar 
          t={t} 
          activePage={activePage} 
          selectedHome={selectedHome} 
          user={user} 
          setActivePage={setActivePage} 
          homesList={homesList} 
          setSelectedHome={setSelectedHome}
          notifications={notifications}
          fetchNotifications={fetchNotifications}
        />
        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}
