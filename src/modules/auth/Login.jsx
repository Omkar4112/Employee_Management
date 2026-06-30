import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import api from '../../services/api';
import '../../index.css';

export default function Login() {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      // Authenticate with MySQL backend
      const response = await api.get(`/employees/email/${email}`);
      const user = response.data;
      
      // Role mapping based on accessLevel
      let role = 'EMPLOYEE';
      if (user.accessLevel === 'Admin') role = 'ADMIN';
      if (user.accessLevel === 'HR') role = 'HR';
      
      const sessionUser = { id: user.id, name: user.name, role: role, email: user.email, department: user.department };
      
      dispatch({ type: 'LOGIN', payload: sessionUser });
    } catch (err) {
      setError('Invalid email or password. (User not found in database)');
    }
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

          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <p>Login with an existing database email (e.g. alice@company.com). Any password works for now.</p>
        </div>
      </div>
    </div>
  );
}
