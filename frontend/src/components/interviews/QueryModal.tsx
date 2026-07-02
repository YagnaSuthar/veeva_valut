'use client';

import { useState } from 'react';
import { useSubmitQuery } from '@/hooks/useInterviews';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface QueryModalProps {
  interviewId: string;
  interviewTitle: string;
  onClose: () => void;
}

export default function QueryModal({ interviewId, interviewTitle, onClose }: QueryModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { mutateAsync } = useSubmitQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      toast.warning('Please fill in all mandatory fields');
      return;
    }

    const formData = new FormData();
    formData.append('sender_name', name);
    formData.append('sender_email', email);
    formData.append('phone_number', phone);
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }
    if (file) {
      formData.append('file', file);
    }

    setStatus('loading');
    try {
      await mutateAsync({ interviewId, formData });
      setStatus('success');
      toast.success('Query sent successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setStatus('error');
      toast.error('Failed to send query. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
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
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {status === 'error' && (
                <div className="form-error" style={{ padding: '0.5rem', backgroundColor: '#FFEBE6', color: 'red', borderRadius: '4px' }}>
                  Failed to send. Please try again.
                </div>
              )}
              
              <div className="form-group">
                <label>Your Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  minLength={2}
                />
              </div>
              
              <div className="form-group">
                <label>Your Email *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Your Phone Number *</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Message *</label>
                <textarea 
                  rows={4} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  minLength={10}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Upload Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div className="form-group">
                <label>Upload Document File (Optional)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
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
