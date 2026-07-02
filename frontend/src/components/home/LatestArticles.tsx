'use client';

import { useArticles } from '@/hooks/useArticles';
import Link from 'next/link';

export default function LatestArticles() {
  const { data: articles = [], isLoading } = useArticles();

  // Show top 3 articles
  const latestArticles = articles.slice(0, 3);

  return (
    <section>
      <h2 className="section-heading">Latest Articles</h2>
      
      {isLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading articles...</div>
      ) : latestArticles.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No articles posted yet.</p>
      ) : (
        <div className="grid-3">
          {latestArticles.map((article: any) => (
            <div key={article.id} className="card article-card">
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <div className="article-meta">
                <span className="badge badge-outline">{article.topic}</span>
                <div className="article-meta-info">
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{article.read_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <Link href="/articles" className="interview-link">
          View All Articles &rarr;
        </Link>
      </div>
    </section>
  );
}
