'use client';

import { useState } from 'react';
import { useReleaseNoteFolders } from '@/hooks/useReleaseNotes';
import { ChevronDown, ChevronUp, Folder, FileText, Download } from 'lucide-react';

export default function PublicReleaseNotesPage() {
  const { data: folders = [], isLoading } = useReleaseNoteFolders();
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--brand-dark)' }}>Veeva Vault Release Notes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Stay updated with the latest features, enhancements, and API updates from Veeva Vault.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading release notes...</div>
      ) : folders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>No release notes have been posted yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {folders.map((folder: any) => {
            const isExpanded = expandedFolderId === folder.id;
            return (
              <div key={folder.id} className="card" style={{ padding: '1.5rem', transition: 'all 0.2s' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedFolderId(isExpanded ? null : folder.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      backgroundColor: 'var(--brand-primary)', 
                      color: 'white', 
                      borderRadius: '8px', 
                      width: '3.5rem', 
                      height: '3.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.25rem'
                    }}>
                      {folder.name}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{folder.name} Update</h3>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {folder.description || 'General release highlights'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {isExpanded ? <ChevronUp size={24} style={{ color: 'var(--brand-primary)' }} /> : <ChevronDown size={24} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--brand-dark)' }}>
                      Key Features & Documentation
                    </h4>
                    {(!folder.documents || folder.documents.length === 0) ? (
                      <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No document notes attached to this release.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {folder.documents.map((doc: any) => (
                          <div 
                            key={doc.id} 
                            style={{ 
                              padding: '1.25rem', 
                              backgroundColor: 'var(--surface-soft)', 
                              borderRadius: '6px',
                              borderLeft: '4px solid var(--brand-accent)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{doc.title}</h5>
                              {doc.file_url && (
                                <a 
                                  href={doc.file_url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem', 
                                    fontSize: '0.8rem',
                                    color: 'var(--brand-primary)',
                                    fontWeight: 600
                                  }}
                                >
                                  <Download size={14} /> PDF Link
                                </a>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-body)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                              {doc.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
