'use client';

import { useState } from 'react';
import {
  useReleaseNoteFolders,
  useCreateReleaseNoteFolder,
  useUpdateReleaseNoteFolder,
  useDeleteReleaseNoteFolder,
  useCreateReleaseNoteDocument,
  useUpdateReleaseNoteDocument,
  useDeleteReleaseNoteDocument,
} from '@/hooks/useReleaseNotes';
import { Plus, Edit2, Trash2, FilePlus, ChevronDown, ChevronUp, Folder, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminReleaseNotesPage() {
  const { data: folders = [], isLoading } = useReleaseNoteFolders();
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  // Folder states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  // Document states
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Mutations
  const createFolderMut = useCreateReleaseNoteFolder();
  const updateFolderMut = useUpdateReleaseNoteFolder();
  const deleteFolderMut = useDeleteReleaseNoteFolder();

  const createDocMut = useCreateReleaseNoteDocument();
  const updateDocMut = useUpdateReleaseNoteDocument();
  const deleteDocMut = useDeleteReleaseNoteDocument();

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      if (editingFolderId) {
        await updateFolderMut.mutateAsync({
          id: editingFolderId,
          data: { name: folderName, description: folderDesc },
        });
        toast.success('Folder updated successfully');
      } else {
        await createFolderMut.mutateAsync({ name: folderName, description: folderDesc });
        toast.success('Folder created successfully');
      }
      closeFolderModal();
    } catch (err) {
      toast.error('Failed to save folder');
    }
  };

  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
    setFolderName('');
    setFolderDesc('');
    setEditingFolderId(null);
  };

  const openEditFolder = (folder: any) => {
    setEditingFolderId(folder.id);
    setFolderName(folder.name);
    setFolderDesc(folder.description || '');
    setIsFolderModalOpen(true);
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete folder "${name}"? This will delete all its documents.`)) {
      try {
        await deleteFolderMut.mutateAsync(id);
        toast.success('Folder deleted successfully');
      } catch (err) {
        toast.error('Failed to delete folder');
      }
    }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    try {
      if (editingDocId && targetFolderId) {
        await updateDocMut.mutateAsync({
          id: editingDocId,
          folderId: targetFolderId,
          data: { title: docTitle, content: docContent, file_url: docFileUrl },
        });
        toast.success('Document updated successfully');
      } else if (targetFolderId) {
        await createDocMut.mutateAsync({
          folderId: targetFolderId,
          data: { title: docTitle, content: docContent, file_url: docFileUrl },
        });
        toast.success('Document created successfully');
      }
      closeDocModal();
    } catch (err) {
      toast.error('Failed to save document');
    }
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setDocTitle('');
    setDocContent('');
    setDocFileUrl('');
    setTargetFolderId(null);
    setEditingDocId(null);
  };

  const openAddDoc = (folderId: string) => {
    setTargetFolderId(folderId);
    setIsDocModalOpen(true);
  };

  const openEditDoc = (folderId: string, doc: any) => {
    setTargetFolderId(folderId);
    setEditingDocId(doc.id);
    setDocTitle(doc.title);
    setDocContent(doc.content);
    setDocFileUrl(doc.file_url || '');
    setIsDocModalOpen(true);
  };

  const handleDeleteDoc = async (folderId: string, id: string, title: string) => {
    if (confirm(`Are you sure you want to delete document "${title}"?`)) {
      try {
        await deleteDocMut.mutateAsync({ id, folderId });
        toast.success('Document deleted successfully');
      } catch (err) {
        toast.error('Failed to delete document');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Manage Release Notes</h1>
        <button className="btn btn-primary" onClick={() => setIsFolderModalOpen(true)}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Folder
        </button>
      </div>

      {isLoading ? (
        <div>Loading folders...</div>
      ) : folders.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No release note folders found. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {folders.map((folder: any) => {
            const isExpanded = expandedFolderId === folder.id;
            return (
              <div key={folder.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setExpandedFolderId(isExpanded ? null : folder.id)}>
                    <Folder size={24} style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{folder.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{folder.description || 'No description'}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => openAddDoc(folder.id)} title="Add Document">
                      <FilePlus size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => openEditFolder(folder)} title="Edit Folder">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'red' }} onClick={() => handleDeleteFolder(folder.id, folder.name)} title="Delete Folder">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', paddingLeft: '2rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Documents ({folder.documents?.length || 0})</h4>
                    {(!folder.documents || folder.documents.length === 0) ? (
                      <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No documents added yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {folder.documents.map((doc: any) => (
                          <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: '1px dashed var(--border)' }}>
                            <div>
                              <h5 style={{ margin: 0, fontSize: '0.9rem' }}>{doc.title}</h5>
                              <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>{doc.content}</p>
                              {doc.file_url && (
                                <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)' }}>
                                  View Document Attachment
                                </a>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => openEditDoc(folder.id, doc)}>
                                <Edit2 size={12} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'red' }} onClick={() => handleDeleteDoc(folder.id, doc.id, doc.title)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
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

      {/* Folder Modal */}
      {isFolderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleFolderSubmit}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{editingFolderId ? 'Edit Release Folder' : 'Create Release Folder'}</h2>
                <button type="button" className="btn-icon" onClick={closeFolderModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Folder Name (e.g. 24R3)</label>
                  <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description / Month</label>
                  <input type="text" value={folderDesc} onChange={(e) => setFolderDesc(e.target.value)} placeholder="e.g. Dec 2026 Release" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeFolderModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {isDocModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleDocSubmit}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{editingDocId ? 'Edit Document' : 'Add Document'}</h2>
                <button type="button" className="btn-icon" onClick={closeDocModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Document Title</label>
                  <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Content Highlights</label>
                  <textarea rows={4} value={docContent} onChange={(e) => setDocContent(e.target.value)} required placeholder="Add bullet points or description..." />
                </div>
                <div className="form-group">
                  <label>Document Link / Attachment URL (Optional)</label>
                  <input type="text" value={docFileUrl} onChange={(e) => setDocFileUrl(e.target.value)} placeholder="https://example.com/docs/release.pdf" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeDocModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
