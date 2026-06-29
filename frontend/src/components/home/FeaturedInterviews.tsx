'use client';

import Link from 'next/link';
import { useInterviewList } from '@/hooks/useInterviews';

export default function FeaturedInterviews() {
  const { data, isLoading } = useInterviewList();

  const interviews = data?.interviews.slice(0, 4) || [];

  return (
    <section>
      <h2 className="section-heading">Featured Interview Questions</h2>
      
      <div className="grid-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '140px' }} />
          ))
        ) : interviews.length === 0 ? (
          <p>No interviews yet. Check back soon.</p>
        ) : (
          interviews.map((interview) => (
            <div key={interview.id} className="card card-accent-left interview-card">
              <div className="card-header">
                <span className="badge badge-accent">{interview.topic}</span>
              </div>
              <h3>{interview.title}</h3>
              <p>{interview.questions?.length || 0} questions</p>
              <div className="card-footer">
                <Link href={`/interviews/${interview.id}`} className="interview-link">
                  View Questions &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
