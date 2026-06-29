'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useInterview } from '@/hooks/useInterviews';
import QueryModal from '@/components/interviews/QueryModal';
import '@/css/Interviews.css';

export default function InterviewDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: interview, isLoading, isError } = useInterview(id);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  if (isLoading) {
    return <div className="container" style={{ padding: '4rem 0' }}>Loading...</div>;
  }

  if (isError || !interview) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Interview not found</h2>
        <button onClick={() => router.back()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  const sortedQuestions = [...(interview.questions || [])].sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <div className="detail-header">
        <div className="container">
          <Link href="/interviews" style={{ color: 'var(--brand-accent)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
            &larr; All Interviews
          </Link>
          <div>
            <span className="badge badge-accent" style={{ marginBottom: '1rem' }}>{interview.topic}</span>
          </div>
          <h1>{interview.title}</h1>
          <p className="detail-about">{interview.about}</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="detail-layout">
          <div>
            <h2 className="section-heading" style={{ marginTop: 0 }}>Most Likely Interview Questions ({sortedQuestions.length})</h2>
            
            <div className="question-list">
              {sortedQuestions.length === 0 ? (
                <p>No questions added to this interview yet.</p>
              ) : (
                sortedQuestions.map((q, index) => (
                  <div key={q.id} className="question-card">
                    <div className="question-number">{(index + 1).toString().padStart(2, '0')}</div>
                    <div className="question-text">{q.question_text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <div className="card sidebar-card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Have a question about this interview?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                If you need clarification on any of the questions or want to suggest an edit, please send us a query.
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsQueryModalOpen(true)}>
                Ask a Query
              </button>

              <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Topic</h4>
              <Link href={`/interviews?topic=${encodeURIComponent(interview.topic)}`} className="btn btn-outline" style={{ display: 'inline-flex', width: 'auto' }}>
                {interview.topic}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isQueryModalOpen && (
        <QueryModal 
          interviewId={interview.id} 
          interviewTitle={interview.title}
          onClose={() => setIsQueryModalOpen(false)} 
        />
      )}
    </div>
  );
}
