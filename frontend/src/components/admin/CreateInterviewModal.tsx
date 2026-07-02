'use client';

import { useState } from 'react';
import { useCreateInterview } from '@/hooks/useAdmin';
import { X, Plus, Trash2 } from 'lucide-react';

import { toast } from 'react-toastify';

interface CreateInterviewModalProps {
  onClose: () => void;
}

export default function CreateInterviewModal({ onClose }: CreateInterviewModalProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [about, setAbout] = useState('');
  const [questions, setQuestions] = useState([{ text: '', order_index: 0 }]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const { mutateAsync } = useCreateInterview();

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', order_index: questions.length }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i })));
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topic || questions.some(q => !q.text)) return;

    setStatus('loading');
    try {
      await mutateAsync({
        title,
        topic,
        about: about || null,
        questions: questions.map(q => ({ question_text: q.text, order_index: q.order_index }))
      });
      toast.success('Interview Questions created successfully!');
      onClose();
    } catch (err) {
      setStatus('error');
      toast.error('Failed to create interview. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Interview</h2>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {status === 'error' && (
              <div className="form-error" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#FFEBE6' }}>
                Failed to create interview.
              </div>
            )}
            
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>About (Optional)</label>
              <textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value)}></textarea>
            </div>
            
            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />
            
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Questions
                <button type="button" onClick={handleAddQuestion} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add
                </button>
              </label>
              
              {questions.map((q, index) => (
                <div key={index} className="question-item">
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-accent)' }}>{index + 1}.</span>
                  <input 
                    type="text" 
                    value={q.text} 
                    onChange={(e) => handleQuestionChange(index, e.target.value)} 
                    required 
                    placeholder="Question text"
                  />
                  {questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(index)} className="btn-icon">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Saving...' : 'Create Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
