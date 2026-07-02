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

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteInterview(id);
    }
  };

  const toggleQueries = (id: string) => {
    setExpandedQueriesId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Manage Interviews Questions</h1>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Interview Questions
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading interviews...</td>
                </tr>
              ) : !data?.interviews?.length ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No interviews yet. Create your first one!
                  </td>
                </tr>
              ) : (
                data.interviews.map((interview) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
