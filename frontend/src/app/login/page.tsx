'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/css/Login.css';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') router.push('/admin');
      else router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.ok) {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoading && user) return null; // Wait for redirect

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="navbar-accent-square"></div>
            Veeva Vault Hub
          </div>
          <h1>Sign in to your account</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
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
          </div>

          {error && <div className="form-error" style={{marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}
          
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-note">
          <p>Don&apos;t have an account? Contact your administrator.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>
            First time setup? <Link href="/setup" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Initialize Admin Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
