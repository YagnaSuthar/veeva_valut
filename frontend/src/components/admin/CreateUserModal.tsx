'use client';

import { useState } from 'react';
import { useCreateUser } from '@/hooks/useAdmin';
import { X, Mail } from 'lucide-react';

interface CreateUserModalProps {
  onClose: () => void;
}

export default function CreateUserModal({ onClose }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [autoPassword, setAutoPassword] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { mutateAsync } = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    if (!autoPassword && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');
    setErrorMsg('');
    try {
      await mutateAsync({
        name,
        email,
        role,
        password: autoPassword ? undefined : password,
      });
      setSubmitStatus('success');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMsg(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to create user. Please try again.'
      );
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center' }}>
          <div style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>User Created!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Login credentials have been sent to <strong>{email}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>Create User</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Credentials will be emailed to the user automatically.
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {submitStatus === 'error' && (
              <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 6, background: '#FFEBE6' }}>
                {errorMsg}
              </div>
            )}
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoPassword}
                  onChange={(e) => setAutoPassword(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                Auto-generate password (recommended)
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                A temporary password will be generated and emailed to the user.
              </p>
            </div>
            
            {!autoPassword && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!autoPassword}
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? (
                'Creating...'
              ) : (
                <>
                  <Mail size={16} style={{ marginRight: '0.4rem' }} />
                  Create &amp; Email Credentials
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
