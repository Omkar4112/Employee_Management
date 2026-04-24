import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import '../../index.css';

export default function Login() {
  const { dispatch } = useApp();
  const [role, setRole] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    // Mock authentication
    dispatch({ type: 'LOGIN', payload: { role, email } });
  };

  return (
    <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--bg-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="sidebar-logo-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem', margin: '0 auto 1rem' }}>⚡</div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 700 }}>WorkforceAI</h2>
          <p className="text-muted text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="form-group" style={{ gap: '1.25rem' }}>
          {error && <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@workforce.ai" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label className="form-label">Login As (Demo)</label>
            <div className="flex gap-sm">
              {['ADMIN', 'HR', 'EMPLOYEE'].map(r => (
                <button key={r} type="button" className={`btn ${role === r ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }} onClick={() => setRole(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <p>Demo Credentials: Any email/password will work.</p>
        </div>
      </div>
    </div>
  );
}
