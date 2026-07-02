'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useInterview, useReplyToQuery } from '@/hooks/useInterviews';
import { useAuth } from '@/hooks/useAuth';
import QueryModal from '@/components/interviews/QueryModal';
import EditInterviewModal from '@/components/admin/EditInterviewModal';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, CornerDownRight, User } from 'lucide-react';
import { toast } from 'react-toastify';
import '@/css/Interviews.css';

export default function InterviewDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  const { data: interview, isLoading, isError } = useInterview(id);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const replyMut = useReplyToQuery();

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
  const queries = interview.queries || [];

  const handleReplySubmit = async (e: React.FormEvent, queryId: string) => {
    e.preventDefault();
    const text = replyTexts[queryId];
    if (!text || !text.trim()) return;

    try {
      await replyMut.mutateAsync({ queryId, data: { message: text } });
      toast.success('Answer posted successfully!');
      setReplyTexts((prev) => ({ ...prev, [queryId]: '' }));
    } catch (err) {
      toast.error('Failed to post answer.');
    }
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1>{interview.title}</h1>
            {isAdmin && (
              <button className="btn btn-accent" onClick={() => setIsEditModalOpen(true)}>
                Edit Interview
              </button>
            )}
          </div>
          <p className="detail-about">{interview.about}</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="detail-layout">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-heading" style={{ marginTop: 0, marginBottom: 0 }}>
                Most Likely Interview Questions ({sortedQuestions.length})
              </h2>
            </div>
            
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

            {/* Asked Queries section */}
            <div style={{ marginTop: '3rem' }}>
              <h2 className="section-heading">Asked Queries & Discussion ({queries.length})</h2>
              
              {queries.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No queries have been asked yet. Be the first to ask!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {queries.map((query: any) => {
                    const isExpanded = expandedQueryId === query.id;
                    return (
                      <div key={query.id} className="card" style={{ padding: '1rem' }}>
                        <div 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => setExpandedQueryId(isExpanded ? null : query.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HelpCircle size={20} style={{ color: 'var(--brand-primary)' }} />
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem' }}>
                                {query.sender_name} asked:
                              </h4>
                              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                                {query.message}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {query.replies?.length || 0} answers
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Attachments rendering */}
                        {isExpanded && (query.image_url || query.file_url) && (
                          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--surface-soft)', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {query.image_url && (
                              <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Attached Image:</p>
                                <img 
                                  src={query.image_url.startsWith('http') ? query.image_url : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${query.image_url}`} 
                                  alt="Query attachment" 
                                  style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '4px', border: '1px solid var(--border)' }} 
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
                                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                >
                                  Download Attached File
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {isExpanded && (
                          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            {/* Replies List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                              {query.replies && query.replies.length > 0 ? (
                                query.replies.map((reply: any) => (
                                  <div key={reply.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', paddingLeft: '1rem' }}>
                                    <CornerDownRight size={16} style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }} />
                                    <div style={{ backgroundColor: 'var(--surface-soft)', padding: '0.75rem 1rem', borderRadius: '8px', flexGrow: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                          <User size={12} /> {reply.user_name} (Registered User)
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                          {new Date(reply.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-body)' }}>{reply.message}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1rem' }}>
                                  No answers yet.
                                </p>
                              )}
                            </div>

                            {/* Reply Input Form */}
                            {user ? (
                              <form onSubmit={(e) => handleReplySubmit(e, query.id)} style={{ display: 'flex', gap: '0.5rem', paddingLeft: '1rem' }}>
                                <input 
                                  type="text" 
                                  placeholder="Write your answer..." 
                                  value={replyTexts[query.id] || ''} 
                                  onChange={(e) => setReplyTexts((prev) => ({ ...prev, [query.id]: e.target.value }))}
                                  required 
                                  style={{ flexGrow: 1, padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                                  Reply
                                </button>
                              </form>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1rem', fontStyle: 'italic' }}>
                                Only registered users can reply. Please <Link href="/login" style={{ textDecoration: 'underline' }}>Login</Link> to reply.
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

      {isEditModalOpen && (
        <EditInterviewModal 
          interview={interview} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </div>
  );
}
