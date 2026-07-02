'use client';

import { useState } from 'react';
import {
  useArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from '@/hooks/useArticles';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminArticlesPage() {
  const { data: articles = [], isLoading } = useArticles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [readTime, setReadTime] = useState('5 min read');

  // Mutations
  const createArtMut = useCreateArticle();
  const updateArtMut = useUpdateArticle();
  const deleteArtMut = useDeleteArticle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim() || !topic.trim()) {
      toast.warning('Please fill in all mandatory fields');
      return;
    }

    try {
      if (editingId) {
        await updateArtMut.mutateAsync({
          id: editingId,
          data: { title, excerpt, content, topic, read_time: readTime },
        });
        toast.success('Article updated successfully');
      } else {
        await createArtMut.mutateAsync({ title, excerpt, content, topic, read_time: readTime });
        toast.success('Article created successfully');
      }
      closeModal();
    } catch (err) {
      toast.error('Failed to save article');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setTopic('');
    setReadTime('5 min read');
  };

  const openEdit = (art: any) => {
    setEditingId(art.id);
    setTitle(art.title);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setTopic(art.topic);
    setReadTime(art.read_time);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (confirm(`Are you sure you want to delete article "${titleStr}"?`)) {
      try {
        await deleteArtMut.mutateAsync(id);
        toast.success('Article deleted successfully');
      } catch (err) {
        toast.error('Failed to delete article');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Manage Articles</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Article
        </button>
      </div>

      {isLoading ? (
        <div>Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No articles found. Create one to get started!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Excerpt</th>
                <th>Read Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art: any) => (
                <tr key={art.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={16} style={{ color: 'var(--brand-primary)' }} />
                      {art.title}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accent">{art.topic}</span>
                  </td>
                  <td>{art.excerpt}</td>
                  <td>{art.read_time}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.6rem' }} onClick={() => openEdit(art)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', color: 'red' }} onClick={() => handleDelete(art.id, art.title)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Article Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Article' : 'Create Article'}</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Excerpt / Summary</label>
                  <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required placeholder="Short summary for homepage card" />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Write the full article content here..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Topic</label>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g. Vault Config" />
                  </div>
                  <div className="form-group">
                    <label>Read Time</label>
                    <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
