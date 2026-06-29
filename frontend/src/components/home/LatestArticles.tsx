'use client';

import Link from 'next/link';

const ARTICLES = [
  { id: '1', title: "Mastering Vault Object Metadata", excerpt: "An in-depth look at managing and querying metadata on Vault objects efficiently.", topic: "Vault Config", date: "Jan 12, 2024", readTime: "5 min read" },
  { id: '2', title: "Lifecycle vs Workflow: Key Differences", excerpt: "When to use state lifecycles versus complex workflows in your document processing.", topic: "Architecture", date: "Feb 03, 2024", readTime: "4 min read" },
  { id: '3', title: "Preparing for Vault Pro Certification", excerpt: "Tips, tricks, and study guides for passing your Veeva Vault Pro cert on the first try.", topic: "Career", date: "Mar 15, 2024", readTime: "6 min read" },
];

export default function LatestArticles() {
  return (
    <section>
      <h2 className="section-heading">Latest Articles</h2>
      
      <div className="grid-3">
        {ARTICLES.map((article) => (
          <div key={article.id} className="card article-card">
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <div className="article-meta">
              <span className="badge badge-outline">{article.topic}</span>
              <div className="article-meta-info">
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <Link href="#" className="interview-link">
          View All Articles &rarr;
        </Link>
      </div>
    </section>
  );
}
