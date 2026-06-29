'use client';

import { useState } from 'react';
import { useSubmitQuery } from '@/hooks/useInterviews';
import { X } from 'lucide-react';

interface QueryModalProps {
  interviewId: string;
  interviewTitle: string;
  onClose: () => void;
}

export default function QueryModal({ interviewId, interviewTitle, onClose }: QueryModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { mutateAsync } = useSubmitQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('loading');
    try {
      await mutateAsync({ interviewId, data: { sender_name: name, sender_email: email, message } });
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>Send a Query</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{interviewTitle}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        {status === 'success' ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h3 style={{ color: 'var(--brand-primary)' }}>Query sent!</h3>
            <p>We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {status === 'error' && (
                <div className="form-error" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#FFEBE6' }}>
                  Failed to send. Please try again.
                </div>
              )}
              
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  minLength={2}
                />
              </div>
              
              <div className="form-group">
                <label>Your Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  rows={4} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  minLength={10}
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Query'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
