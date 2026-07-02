'use client';

import { useReleaseNoteFolders } from '@/hooks/useReleaseNotes';
import Link from 'next/link';

export default function RecentReleases() {
  const { data: folders = [], isLoading } = useReleaseNoteFolders();
  
  // Show only top 3 releases
  const recentFolders = folders.slice(0, 3);

  return (
    <section>
      <h2 className="section-heading">Recent Veeva Releases</h2>
      
      {isLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading releases...</div>
      ) : recentFolders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No releases posted yet.</p>
      ) : (
        <div className="timeline">
          {recentFolders.map((folder: any) => (
            <div key={folder.id} className="timeline-item">
              <div className="timeline-marker">
                <span className="timeline-pill">{folder.name}</span>
                <div className="timeline-line"></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-date">{folder.description || 'Release Highlights'}</div>
                <ul className="timeline-list">
                  {folder.documents?.slice(0, 3).map((doc: any, i: number) => (
                    <li key={doc.id || i}>
                      <strong>{doc.title}</strong>: {doc.content}
                    </li>
                  ))}
                  {(!folder.documents || folder.documents.length === 0) && (
                    <li>No details added yet.</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/release-notes" className="interview-link" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          View All Release Notes &rarr;
        </Link>
      </div>
    </section>
  );
}
