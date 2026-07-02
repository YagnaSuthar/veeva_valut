'use client';

import Link from 'next/link';
import { useState, Fragment, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useReplyToQuery } from '@/hooks/useInterviews';
import { Interview } from '@/types';
import { truncate } from '@/lib/utils';
import { ChevronDown, ChevronUp, HelpCircle, MessageSquare, CornerDownRight, User } from 'lucide-react';
import { toast } from 'react-toastify';
import QueryModal from './QueryModal';

interface InterviewsTableProps {
  interviews: Interview[];
  isLoading: boolean;
}

export default function InterviewsTable({ interviews, isLoading }: InterviewsTableProps) {
  const { user, isAdmin } = useAuth();
  const [queryModalData, setQueryModalData] = useState<{ id: string, title: string } | null>(null);
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const replyMut = useReplyToQuery();

  const handleCloseQueryModal = () => {
    setQueryModalData(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('ask');
    const newQuery = params.toString() ? `?${params.toString()}` : '';
    router.push(`/interviews${newQuery}`);
  };

  useEffect(() => {
    const askParam = searchParams.get('ask') === 'true';
    if (askParam && interviews.length > 0 && !queryModalData) {
      setQueryModalData({ id: interviews[0].id, title: interviews[0].title });
    }
  }, [searchParams, interviews, queryModalData]);

  const toggleQuestions = (id: string) => {
    setExpandedInterviewId(prev => (prev === id ? null : id));
  };

  const handleReplySubmit = async (e: React.FormEvent, queryId: string) => {
    e.preventDefault();
    const text = replyTexts[queryId];
    if (!text || !text.trim()) return;

    try {
      await replyMut.mutateAsync({ queryId, data: { message: text } });
      toast.success('Answer posted successfully!');
      setReplyTexts(prev => ({ ...prev, [queryId]: '' }));
    } catch (err) {
      toast.error('Failed to post answer.');
    }
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
              const hasQueries = interview.queries && interview.queries.length > 0;
              const isExpandable = hasQuestions || hasQueries;

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
                      {isExpandable ? (
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
                          <span>
                            {interview.questions?.length || 0} questions ({interview.queries?.length || 0} queries)
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0 questions (0 queries)</span>
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

                  {isExpanded && isExpandable && (
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
                          {/* Questions List Section */}
                          {hasQuestions && (
                            <>
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
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
                                      <div style={{ flex: 1 }}>{q.question_text}</div>
                                    </div>
                                  ))}
                              </div>
                            </>
                          )}

                          {/* Asked Queries Section */}
                          <h4 style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.9rem', 
                            color: 'var(--brand-dark)', 
                            marginTop: hasQuestions ? '1.5rem' : '0',
                            marginBottom: '1rem',
                            borderBottom: '1px solid var(--border)',
                            paddingBottom: '0.5rem'
                          }}>
                            <MessageSquare size={16} style={{ color: 'var(--brand-primary)' }} />
                            Asked Queries & Discussion ({interview.queries?.length || 0})
                          </h4>

                          {(!interview.queries || interview.queries.length === 0) ? (
                            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              No queries have been asked yet. Be the first to ask!
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {interview.queries.map((query: any) => {
                                const isQueryExpanded = expandedQueryId === query.id;
                                return (
                                  <div key={query.id} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', backgroundColor: '#fafbfc' }}>
                                    <div 
                                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                      onClick={() => setExpandedQueryId(isQueryExpanded ? null : query.id)}
                                    >
                                      <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                                        <strong>{query.sender_name}</strong> asked: <span style={{ color: 'var(--text-muted)' }}>"{query.message}"</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span>{query.replies?.length || 0} answers</span>
                                        {isQueryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                      </div>
                                    </div>

                                    {/* Attachments rendering */}
                                    {isQueryExpanded && (query.image_url || query.file_url) && (
                                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--surface-soft)', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                        {query.image_url && (
                                          <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Attached Image:</p>
                                            <img 
                                              src={query.image_url.startsWith('http') ? query.image_url : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${query.image_url}`} 
                                              alt="Query attachment" 
                                              style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', border: '1px solid var(--border)' }} 
                                            />
                                          </div>
                                        )}
                                        {query.file_url && (
                                          <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-end' }}>
                                            <a 
                                              href={query.file_url.startsWith('http') ? query.file_url : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${query.file_url}`} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="btn btn-outline"
                                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                                            >
                                              Download Attachment
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {isQueryExpanded && (
                                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                        {/* Replies list */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                          {query.replies && query.replies.length > 0 ? (
                                            query.replies.map((reply: any) => (
                                              <div key={reply.id} style={{ display: 'flex', gap: '0.5rem', paddingLeft: '0.5rem', fontSize: '0.8rem' }}>
                                                <CornerDownRight size={14} style={{ color: 'var(--text-muted)', marginTop: '0.2' }} />
                                                <div style={{ backgroundColor: 'var(--surface-soft)', padding: '0.5rem 0.75rem', borderRadius: '6px', flexGrow: 1 }}>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                      <User size={10} /> {reply.user_name}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                  </div>
                                                  <p style={{ margin: 0, color: 'var(--text-body)' }}>{reply.message}</p>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <p style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                                              No answers yet.
                                            </p>
                                          )}
                                        </div>

                                        {/* Reply submission form */}
                                        {user ? (
                                          <form onSubmit={(e) => handleReplySubmit(e, query.id)} style={{ display: 'flex', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                                            <input 
                                              type="text" 
                                              placeholder="Write your answer..." 
                                              value={replyTexts[query.id] || ''} 
                                              onChange={(e) => setReplyTexts(prev => ({ ...prev, [query.id]: e.target.value }))}
                                              required 
                                              style={{ flexGrow: 1, padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                                            />
                                            <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                                              Reply
                                            </button>
                                          </form>
                                        ) : (
                                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.5rem', fontStyle: 'italic' }}>
                                            Please <Link href="/login" style={{ textDecoration: 'underline' }}>Login</Link> to answer this query.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
          onClose={handleCloseQueryModal} 
        />
      )}
    </>
  );
}
