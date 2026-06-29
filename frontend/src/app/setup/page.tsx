'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import '@/css/Setup.css';
import '@/css/Login.css'; // Reusing some form styles

export default function SetupPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || password.length < 6) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setLoading(true);
    try {
      await authApi.setupAdmin({ name, email, password, role: 'admin' });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to setup admin account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="setup-page">
        <div className="setup-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--brand-primary)', marginBottom: '1rem' }}>Setup Complete!</h2>
          <p>Initial admin account has been created successfully.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-header">
          <div className="setup-logo">
            <div className="navbar-accent-square"></div>
            Veeva Vault Hub
          </div>
          <h1>Initial System Setup</h1>
          <p>Create the first administrator account to configure the system. This page will be disabled once an admin exists.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Admin Name</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Minimum 6 characters</p>
          </div>

          {error && <div className="form-error" style={{marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}
          
          <button type="submit" className="btn btn-primary setup-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
