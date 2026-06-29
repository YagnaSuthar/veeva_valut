'use client';

import Link from 'next/link';
import { useState, Fragment } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Interview } from '@/types';
import { truncate } from '@/lib/utils';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import QueryModal from './QueryModal';

interface InterviewsTableProps {
  interviews: Interview[];
  isLoading: boolean;
}

export default function InterviewsTable({ interviews, isLoading }: InterviewsTableProps) {
  const { isAdmin } = useAuth();
  const [queryModalData, setQueryModalData] = useState<{ id: string, title: string } | null>(null);
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);

  const toggleQuestions = (id: string) => {
    setExpandedInterviewId(prev => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Questions</th>
              <th>About</th>
              <th>Action</th>
              {isAdmin && <th>Admin</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={isAdmin ? 6 : 5}>
                  <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="table-container empty-state">
        <p>No interviews found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Questions</th>
              <th>About</th>
              <th>Action</th>
              {isAdmin && <th>Admin</th>}
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => {
              const isExpanded = expandedInterviewId === interview.id;
              const hasQuestions = interview.questions && interview.questions.length > 0;

              return (
                <Fragment key={interview.id}>
                  <tr className={isExpanded ? 'expanded-row-parent' : ''}>
                    <td>
                      <Link href={`/interviews/${interview.id}`} className="interview-title-link">
                        {interview.title}
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-accent">{interview.topic}</span>
                    </td>
                    <td>
                      {hasQuestions ? (
                        <button
                          onClick={() => toggleQuestions(interview.id)}
                          className="btn-link-toggle"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            fontWeight: 600,
                            color: 'var(--brand-primary)',
                            cursor: 'pointer',
                          }}
                          aria-expanded={isExpanded}
                        >
                          <span>{interview.questions.length} questions</span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0 questions</span>
                      )}
                    </td>
                    <td>{interview.about ? truncate(interview.about, 80) : '-'}</td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => setQueryModalData({ id: interview.id, title: interview.title })}
                      >
                        Ask a Question
                      </button>
                    </td>
                    {isAdmin && (
                      <td>
                        <Link href={`/admin/interviews`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Manage
                        </Link>
                      </td>
                    )}
                  </tr>

                  {isExpanded && hasQuestions && (
                    <tr className="expanded-row-child">
                      <td colSpan={isAdmin ? 6 : 5} style={{ padding: '0 1rem 1rem 1rem', background: '#F8FAFC' }}>
                        <div className="expanded-questions-container" style={{
                          padding: '1.25rem',
                          backgroundColor: 'var(--surface-white)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          marginTop: '0.25rem',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          <h4 style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.9rem', 
                            color: 'var(--brand-dark)', 
                            marginBottom: '1rem',
                            borderBottom: '1px solid var(--border)',
                            paddingBottom: '0.5rem'
                          }}>
                            <HelpCircle size={16} style={{ color: 'var(--brand-primary)' }} />
                            Questions List for "{interview.title}"
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[...(interview.questions || [])]
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((q, idx) => (
                                <div key={q.id || idx} style={{ 
                                  display: 'flex', 
                                  gap: '0.75rem', 
                                  alignItems: 'flex-start',
                                  fontSize: '0.875rem',
                                  color: 'var(--text-body)'
                                }}>
                                  <span style={{ 
                                    fontWeight: 700, 
                                    color: 'var(--brand-accent)', 
                                    minWidth: '1.5rem',
                                    textAlign: 'right' 
                                  }}>
                                    {(idx + 1).toString().padStart(2, '0')}.
                                  </span>
                                  <span style={{ flexGrow: 1, lineHeight: '1.4' }}>{q.question_text}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {queryModalData && (
        <QueryModal 
          interviewId={queryModalData.id} 
          interviewTitle={queryModalData.title}
          onClose={() => setQueryModalData(null)} 
        />
      )}
    </>
  );
}
