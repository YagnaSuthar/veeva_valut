'use client';

import { useState } from 'react';
import { useArticles } from '@/hooks/useArticles';
import { BookOpen, Calendar, Clock, X } from 'lucide-react';

export default function PublicArticlesPage() {
  const { data: articles = [], isLoading } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--brand-dark)' }}>Articles & Tutorials</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Deep dives, config tips, and preparation guides for Veeva Vault administrators and developers.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>No articles posted yet. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid-3">
          {articles.map((art: any) => (
            <div key={art.id} className="card article-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <span className="badge badge-accent" style={{ marginBottom: '0.75rem' }}>{art.topic}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>{art.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {art.excerpt}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {art.read_time}
                </div>
                <button 
                  className="btn-link" 
                  onClick={() => setSelectedArticle(art)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--brand-primary)', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Read More &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>{selectedArticle.topic}</span>
                <h2 style={{ fontSize: '1.75rem', marginTop: 0 }}>{selectedArticle.title}</h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {selectedArticle.read_time}</span>
                  {selectedArticle.creator_name && <span>By {selectedArticle.creator_name}</span>}
                </div>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-body)', whiteSpace: 'pre-line', padding: '1.5rem 0' }}>
              {selectedArticle.content}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedArticle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
