import React, { useState } from 'react';
import { authApi } from '../services/api';

export default function LoginPage({ onLogin, onRegister, showSignup, setShowSignup, showResetPassword, setShowResetPassword }) {
  // Navigation View Control: 'landing' | 'auth'
  const [view, setView] = useState('landing');
  // Toggle between Login and Signup inside the auth card
  const [isSignup, setIsSignup] = useState(false);
  
  // Separate states for Login and Signup
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password flow
  const [forgotMode, setForgotMode] = useState(null); // 'request' | null
  const [newPassword, setNewPassword] = useState('');

  React.useEffect(() => {
    if (window.emailVerificationSuccess) {
      setSuccessMsg(window.emailVerificationSuccess);
      window.emailVerificationSuccess = null;
      setView('auth');
      setIsSignup(false);
    }
    if (window.emailVerificationError) {
      setError(window.emailVerificationError);
      window.emailVerificationError = null;
      setView('auth');
      setIsSignup(false);
    }
  }, []);

  const handleResetPasswordDirect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.resetPasswordDirect(newPassword);
      if (res.success) {
        localStorage.removeItem('reset_token');
        setShowResetPassword(false);
        setSuccessMsg("Password reset successfully! Please log in with your new password.");
        setNewPassword('');
        setView('auth');
        setIsSignup(false);
      } else {
        throw new Error(res.message || "Reset failed");
      }
    } catch (err) {
      setError(err.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await onLogin(loginEmail, loginPassword);
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await onRegister(registerName, registerEmail, registerPassword);
      setSuccessMsg(res.message || "Registration successful! Please verify your email via the link sent to your inbox.");
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setIsSignup(false); // Go to login so they can log in after verification
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.forgotPassword(loginEmail);
      if (res.success) {
        setForgotMode(null);
        setSuccessMsg(`Reset link sent to ${loginEmail}`);
      } else {
        throw new Error(res.message || "Email request failed");
      }
    } catch (err) {
      setError(err.message || "Error requesting password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = encodeURIComponent(window.location.origin + '/');
    window.location.href = `https://ngfkgavqefymfgfvgsps.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
  };

  return (
    <div className="login-wrapper">
      {/* Top Header Navigation */}
      <nav className="login-nav">
        <div className="login-nav-brand" onClick={() => setView('landing')}>
          <div className="logo-bolt">⚡</div>
          <div>
            <div className="login-nav-brand-text">VIDYUTH NETRA</div>
            <div className="login-nav-brand-sub">AI Smart Energy Optimization</div>
          </div>
        </div>
        <div className="login-nav-links">
          <a href="#" className="login-nav-link" onClick={(e) => { e.preventDefault(); setView('landing'); }}>Dashboard</a>
          <a href="#" className="login-nav-link" onClick={(e) => { e.preventDefault(); setView('landing'); }}>My Homes</a>
          <a href="#" className="login-nav-link" onClick={(e) => { e.preventDefault(); setView('landing'); }}>AI Usage</a>
          <a href="#" className="login-nav-link" onClick={(e) => { e.preventDefault(); setView('landing'); }}>Voice Control</a>
          <a href="#" className="login-nav-link" onClick={(e) => { e.preventDefault(); setView('landing'); }}>Case Energy</a>
          
          {view === 'landing' ? (
            <button className="login-nav-btn" onClick={() => { setView('auth'); setIsSignup(false); }}>Get Started</button>
          ) : (
            <button className="login-nav-btn" onClick={() => { setView('landing'); setForgotMode(null); }}>Back Home</button>
          )}
        </div>
      </nav>

      {/* Main Container depending on View */}
      {view === 'landing' ? (
        /* ==================== 1. LANDING VIEW ==================== */
        <div className="landing-content">
          <div className="landing-left animate-fadeIn">
            <h1 className="landing-headline">
              Smarter Energy.<br /><span>Better Tomorrow.</span>
            </h1>
            <p className="landing-desc">
              Smarter energy energy and cour power new A.J. Smarter total mpss, and created anittual recommendations for your smartmatte.
            </p>

            <div className="landing-features">
              {[
                { icon: '🤖', label: 'AI Assistant', desc: 'Personal energy chat' },
                { icon: '🎙️', label: 'Voice Control', desc: 'Hands-free device command' },
                { icon: '⚙️', label: 'Energy Design', desc: 'Optimized loads scheduling' },
                { icon: '⚡', label: 'Case Energy', desc: 'Interactive grid cases' },
              ].map(f => (
                <div key={f.label} className="landing-feature-item" onClick={() => { setView('auth'); setIsSignup(true); }}>
                  <div className="landing-feature-icon-wrapper">
                    {f.icon}
                  </div>
                  <div className="landing-feature-label">{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-right animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div style={{ width: '100%', maxWidth: 520, height: 400 }}>
              {/* Animated Light Mode Isometric SVG Graphic */}
              <svg viewBox="0 0 550 420" width="100%" height="100%" fill="none" style={{ filter: 'drop-shadow(0 4px 15px rgba(162, 179, 198, 0.15))' }}>
                {/* Isometric Grid Lines */}
                <g opacity="0.12">
                  <path d="M 50 210 L 275 97 L 500 210 L 275 322 Z" stroke="var(--teal)" strokeWidth="1.5" />
                  <path d="M 106 182 L 331 69 M 162 154 L 387 41 M 218 126 L 443 13" stroke="var(--teal)" strokeWidth="1" />
                  <path d="M 106 238 L 331 351 M 162 266 L 387 379 M 218 294 L 443 407" stroke="var(--teal)" strokeWidth="1" />
                  <path d="M 162 154 L 50 210 M 275 97 L 162 154" stroke="var(--teal)" strokeWidth="1" />
                </g>

                {/* Glow Filter */}
                <defs>
                  <filter id="light-blue-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Transmission Tower / Electric Pole (Back Right) */}
                <g transform="translate(370, 70)">
                  <path d="M 20 180 L 40 40 L 60 180 M 40 40 L 40 180" stroke="var(--teal)" strokeWidth="1.5" opacity="0.5" />
                  <path d="M 25 140 L 55 140 M 30 100 L 50 100 M 35 60 L 45 60" stroke="var(--teal)" strokeWidth="1.2" opacity="0.5" />
                  <path d="M 20 180 L 60 140 M 60 180 L 20 140 M 25 140 L 55 100 M 55 140 L 25 100" stroke="var(--teal)" strokeWidth="0.8" opacity="0.3" />
                  <path d="M 15 60 L 65 60 M 10 100 L 70 100" stroke="var(--teal)" strokeWidth="2" />
                  <circle cx="15" cy="70" r="3.5" fill="var(--teal)" />
                  <circle cx="65" cy="70" r="3.5" fill="var(--teal)" />
                  <circle cx="10" cy="110" r="3.5" fill="var(--teal)" />
                  <circle cx="70" cy="110" r="3.5" fill="var(--teal)" />
                  <path d="M 40 40 L 40 20" stroke="var(--teal)" strokeWidth="1.5" />
                  <circle cx="40" cy="20" r="4" fill="var(--teal-light)" className="svg-pulse-glow" />
                </g>

                {/* Solar Panel Array (Left Side) */}
                <g transform="translate(90, 160)">
                  <path d="M 40 45 L 40 75 M 30 45 L 30 70 M 50 45 L 50 80" stroke="var(--teal)" strokeWidth="2" opacity="0.5" />
                  <polygon points="10,40 70,10 80,45 20,75" fill="rgba(75, 163, 227, 0.05)" stroke="var(--teal)" strokeWidth="2" filter="url(#light-blue-glow)" />
                  <line x1="30" y1="30" x2="40" y2="65" stroke="var(--teal)" strokeWidth="1.2" opacity="0.6" />
                  <line x1="50" y1="20" x2="60" y2="55" stroke="var(--teal)" strokeWidth="1.2" opacity="0.6" />
                  <line x1="20" y1="45" x2="75" y2="18" stroke="var(--teal)" strokeWidth="1.2" opacity="0.6" />
                  <line x1="15" y1="58" x2="78" y2="28" stroke="var(--teal)" strokeWidth="1.2" opacity="0.6" />
                </g>

                {/* Smart House (Center) */}
                <g transform="translate(200, 140)">
                  <polygon points="10,120 90,80 170,120 90,160" fill="rgba(255, 255, 255, 0.9)" stroke="rgba(75, 163, 227, 0.2)" strokeWidth="1" />
                  <polygon points="10,120 90,160 90,210 10,170" fill="rgba(255, 255, 255, 0.95)" stroke="var(--teal)" strokeWidth="1.5" />
                  <polygon points="90,160 170,120 170,170 90,210" fill="rgba(240, 244, 249, 0.95)" stroke="var(--teal)" strokeWidth="1.5" />
                  <polygon points="10,120 90,70 170,120 90,160" fill="rgba(75, 163, 227, 0.03)" stroke="var(--teal)" strokeWidth="2" filter="url(#light-blue-glow)" />
                  <line x1="50" y1="95" x2="130" y2="135" stroke="var(--teal)" strokeWidth="1" opacity="0.5" />
                  <line x1="30" y1="105" x2="110" y2="145" stroke="var(--teal)" strokeWidth="1" opacity="0.5" />
                  <polygon points="40,160 65,172 65,200 40,188" fill="var(--teal-glow)" stroke="var(--teal-light)" strokeWidth="1.5" className="svg-pulse-glow" />
                  <polygon points="110,150 145,132 145,152 110,170" fill="var(--teal-glow)" stroke="var(--teal-light)" strokeWidth="1.2" className="svg-pulse-glow" />
                </g>

                {/* Smart Battery Bank (Front Right) */}
                <g transform="translate(370, 240)">
                  <polygon points="10,30 50,10 90,30 50,50" fill="rgba(255, 255, 255, 0.9)" stroke="rgba(75, 163, 227, 0.2)" strokeWidth="1" />
                  <polygon points="10,30 50,50 50,90 10,70" fill="rgba(255, 255, 255, 0.9)" stroke="var(--teal)" strokeWidth="1.5" />
                  <polygon points="50,50 90,30 90,70 50,90" fill="rgba(240, 244, 249, 0.9)" stroke="var(--teal)" strokeWidth="1.5" />
                  <polygon points="10,30 50,10 90,30 50,50" fill="rgba(75, 163, 227, 0.05)" stroke="var(--teal)" strokeWidth="1.5" />
                  <polygon points="20,42 45,52 45,58 20,48" fill="var(--teal-light)" opacity="0.9" className="svg-pulse-glow" />
                  <polygon points="20,54 45,64 45,70 20,60" fill="var(--teal-light)" opacity="0.9" className="svg-pulse-glow" />
                  <polygon points="20,66 45,76 45,82 20,72" fill="var(--teal-light)" opacity="0.3" />
                  <polygon points="55,52 80,42 80,48 55,58" fill="var(--teal-light)" opacity="0.9" className="svg-pulse-glow" />
                  <polygon points="55,64 80,54 80,60 55,70" fill="var(--teal)" opacity="0.5" />
                </g>

                {/* Glowing Energy Flow Lines */}
                <path d="M 170 205 L 230 235" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" className="svg-flow-line" filter="url(#light-blue-glow)" />
                <path d="M 390 160 L 350 200 L 320 215" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" className="svg-flow-line" filter="url(#light-blue-glow)" />
                <path d="M 320 310 L 370 280" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" className="svg-flow-line" filter="url(#light-blue-glow)" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== 2. AUTHENTICATION VIEW ==================== */
        <div className="auth-container">
          <div className="auth-card-wide animate-fadeIn">
            {/* System Status / Error Alerts */}
            {successMsg && (
              <div style={{ color: '#0f766e', background: 'rgba(75, 163, 227, 0.1)', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 24, border: '1px solid var(--border-active)' }}>
                ✅ {successMsg}
              </div>
            )}
            {error && (
              <div style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.04)', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Direct Password Reset Mode */}
            {showResetPassword ? (
              <div className="auth-column">
                <h2>Set New Password</h2>
                <p>Please enter your new account password</p>
                <form onSubmit={handleResetPasswordDirect}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Updating...' : 'Update Password'}
                  </button>
                </form>
                <div className="login-switch">
                  <a href="#" onClick={e => { e.preventDefault(); setShowResetPassword(false); }}>Cancel & Back</a>
                </div>
              </div>
            ) : forgotMode === 'request' ? (
              /* Forgot Password Request Mode */
              <div className="auth-column">
                <h2>Reset Password</h2>
                <p>Enter your email address to receive a recovery link</p>
                <form onSubmit={handleSendForgotOtp}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Sending...' : 'Send Reset Link'}
                  </button>
                </form>
                <div className="login-switch">
                  <a href="#" onClick={e => { e.preventDefault(); setForgotMode(null); }}>Back to Sign In</a>
                </div>
              </div>
            ) : !isSignup ? (
              /* ==================== A. LOGIN CARD VIEW ==================== */
              <div className="auth-column">
                <h2>Welcome Back</h2>
                <p>Sign in to determine your account settings</p>
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="Email addresses"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        type={showPass ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        style={{ paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}
                      >
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <label className="custom-checkbox">
                      <input type="checkbox" />
                      Remember me
                    </label>
                    <a href="#" onClick={e => { e.preventDefault(); setForgotMode('request'); }} style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>Forget password?</a>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="login-switch">
                  Don't have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); setError(''); setSuccessMsg(''); }}>
                    Sign up
                  </a>
                </div>

                <div className="auth-divider">
                  <div className="auth-divider-emblem">☀️</div>
                </div>

                {/* Social Login buttons */}
                <div className="auth-social-buttons" style={{ justifyContent: 'center' }}>
                  <button className="auth-social-btn" onClick={handleGoogleLogin} title="Continue with Google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </button>
                  <button className="auth-social-btn" onClick={() => alert("Apple Auth is coming soon!")} title="Continue with Apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.96-1.41z" />
                    </svg>
                  </button>
                  <button className="auth-social-btn" onClick={() => alert("GitHub Auth is coming soon!")} title="Continue with GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              /* ==================== B. SIGNUP CARD VIEW ==================== */
              <div className="auth-column">
                <h2>Create Account</h2>
                <p>Sign up to get started</p>
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full name</label>
                    <input
                      className="form-input"
                      placeholder="Enter your full name"
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label className="custom-checkbox">
                      <input type="checkbox" required />
                      I agree to your Terms & Privacy Policy
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Creating...' : 'Get Started'}
                  </button>
                </form>

                <div className="login-switch">
                  Already have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(false); setError(''); setSuccessMsg(''); }}>
                    Login
                  </a>
                </div>

                <div className="auth-divider">
                  <div className="auth-divider-emblem">☀️</div>
                </div>

                {/* Social Login buttons */}
                <div className="auth-social-buttons" style={{ justifyContent: 'center' }}>
                  <button className="auth-social-btn" onClick={handleGoogleLogin} title="Continue with Google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </button>
                  <button className="auth-social-btn" onClick={() => alert("Apple Auth is coming soon!")} title="Continue with Apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.96-1.41z" />
                    </svg>
                  </button>
                  <button className="auth-social-btn" onClick={() => alert("GitHub Auth is coming soon!")} title="Continue with GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
