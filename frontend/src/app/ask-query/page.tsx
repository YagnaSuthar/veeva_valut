'use client';

import { useState } from 'react';
import { useInterviewList } from '@/hooks/useInterviews';
import QueryModal from '@/components/interviews/QueryModal';
import { HelpCircle, MessageSquare } from 'lucide-react';
import '@/css/Interviews.css';

export default function AskQueryPage() {
  const { data, isLoading } = useInterviewList();
  const [queryModalData, setQueryModalData] = useState<{ id: string; title: string } | null>(null);

  const interviews = data?.interviews || [];

  return (
    <div className="container" style={{ padding: '3rem 0 5rem' }}>
      <div className="interviews-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <MessageSquare size={36} style={{ color: 'var(--brand-primary)' }} />
          Ask a Query
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>
          Select any interview title below to submit your query or suggestion directly to us.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>No interviews found. Please check back later.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-container desktop-view">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Interview Title</th>
                  <th>Topic</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td style={{ fontWeight: 600 }}>{interview.title}</td>
                    <td>
                      <span className="badge badge-accent">{interview.topic}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setQueryModalData({ id: interview.id, title: interview.title })}
                      >
                        Ask Query
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card list view */}
          <div className="mobile-slider-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {interviews.map((interview) => (
              <div key={interview.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>{interview.topic}</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--brand-dark)' }}>{interview.title}</h3>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => setQueryModalData({ id: interview.id, title: interview.title })}
                >
                  Ask Query
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {queryModalData && (
        <QueryModal 
          interviewId={queryModalData.id} 
          interviewTitle={queryModalData.title}
          onClose={() => setQueryModalData(null)} 
        />
      )}
    </div>
  );
}
