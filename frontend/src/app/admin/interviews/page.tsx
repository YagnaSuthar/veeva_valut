'use client';

import React, { useState } from 'react';
import { useInterviewList } from '@/hooks/useInterviews';
import { useDeleteInterview, useInterviewQueries } from '@/hooks/useAdmin';
import { Interview, Query } from '@/types';
import { Plus, Edit2, Trash2, MessageSquare } from 'lucide-react';
import CreateInterviewModal from '@/components/admin/CreateInterviewModal';
import EditInterviewModal from '@/components/admin/EditInterviewModal';
import { formatDate } from '@/lib/utils';

export default function AdminInterviewsPage() {
  const { data, isLoading } = useInterviewList();
  const { mutate: deleteInterview, isPending: isDeleting } = useDeleteInterview();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [expandedQueriesId, setExpandedQueriesId] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteInterview(id);
      // Reset slide index if out of bounds after deletion
      if (data?.interviews && activeSlideIndex >= data.interviews.length - 1) {
        setActiveSlideIndex(Math.max(0, data.interviews.length - 2));
      }
    }
  };

  const toggleQueries = (id: string) => {
    setExpandedQueriesId(prev => (prev === id ? null : id));
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    if (data?.interviews) {
      setActiveSlideIndex((prev) => Math.min(data.interviews.length - 1, prev + 1));
    }
  };

  const interviews = data?.interviews || [];
  const currentInt = interviews[activeSlideIndex];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Manage Interviews Questions</h1>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Interview Questions
        </button>
      </div>

      {isLoading ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading interviews...</div>
      ) : !interviews.length ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No interviews yet. Create your first one!
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="card desktop-view" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topic</th>
                    <th>Questions</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <React.Fragment key={interview.id}>
                      <tr>
                        <td style={{ fontWeight: 600 }}>{interview.title}</td>
                        <td><span className="badge badge-accent">{interview.topic}</span></td>
                        <td>{interview.questions?.length || 0}</td>
                        <td>{formatDate(interview.created_at)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn-icon"
                              title="View Queries"
                              onClick={() => toggleQueries(interview.id)}
                              style={{ color: expandedQueriesId === interview.id ? 'var(--brand-primary)' : undefined }}
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button className="btn-icon" title="Edit" onClick={() => setEditingInterview(interview)}>
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              title="Delete"
                              onClick={() => handleDelete(interview.id, interview.title)}
                              disabled={isDeleting}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedQueriesId === interview.id && (
                        <tr>
                          <td colSpan={5} style={{ padding: 0, background: 'var(--surface-2, #f8f9fa)' }}>
                            <QueriesViewer interviewId={interview.id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Slider View */}
          {currentInt && (
            <div className="mobile-slider-view">
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>{currentInt.topic}</span>
                <h3 style={{ margin: '0.25rem 0 0.75rem', fontSize: '1.25rem' }}>{currentInt.title}</h3>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  <div><strong>Questions Count:</strong> {currentInt.questions?.length || 0}</div>
                  <div><strong>Created At:</strong> {formatDate(currentInt.created_at)}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => toggleQueries(currentInt.id)}
                    title="View Queries"
                  >
                    <MessageSquare size={14} style={{ marginRight: '0.25rem' }} /> Queries
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                    onClick={() => setEditingInterview(currentInt)}
                  >
                    <Edit2 size={14} style={{ marginRight: '0.25rem' }} /> Edit
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }} 
                    onClick={() => handleDelete(currentInt.id, currentInt.title)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} style={{ marginRight: '0.25rem' }} /> Delete
                  </button>
                </div>

                {expandedQueriesId === currentInt.id && (
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.25rem', paddingTop: '1rem' }}>
                    <QueriesViewer interviewId={currentInt.id} />
                  </div>
                )}
              </div>

              {/* Slider Pagination Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-outline" onClick={handlePrevSlide} disabled={activeSlideIndex === 0} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  Prev
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {activeSlideIndex + 1} of {interviews.length}
                </span>
                <button className="btn btn-outline" onClick={handleNextSlide} disabled={activeSlideIndex === interviews.length - 1} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && <CreateInterviewModal onClose={() => setIsCreateModalOpen(false)} />}
      {editingInterview && <EditInterviewModal interview={editingInterview} onClose={() => setEditingInterview(null)} />}
    </div>
  );
}

function QueriesViewer({ interviewId }: { interviewId: string }) {
  const { data: queries, isLoading } = useInterviewQueries(interviewId);

  return (
    <div className="queries-container">
      <h4 style={{ marginBottom: '0.75rem', color: 'var(--brand-dark)', padding: '1rem 1rem 0' }}>
        Submitted Queries
      </h4>
      {isLoading ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0 1rem 1rem' }}>Loading queries...</p>
      ) : !queries?.length ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0 1rem 1rem' }}>No queries submitted for this interview yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="queries-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Sender</th>
                <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Message</th>
                <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {(queries as Query[]).map((q) => (
                <tr key={q.id}>
                  <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>{q.sender_name}</td>
                  <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>{q.sender_email}</td>
                  <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', maxWidth: 300 }}>{q.message}</td>
                  <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
