'use client';

import Link from 'next/link';
import { useInterviewList } from '@/hooks/useInterviews';

export default function PopularTopics() {
  const { data, isLoading } = useInterviewList();

  // Derive topics and counts
  const topicCounts: Record<string, number> = {};
  if (data?.interviews) {
    data.interviews.forEach((interview) => {
      topicCounts[interview.topic] = (topicCounts[interview.topic] || 0) + 1;
    });
  }
  
  const topics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

  return (
    <section>
      <h2 className="section-heading">Browse by Topic</h2>
      
      <div className="topics-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '120px', height: '40px', borderRadius: '9999px' }} />
          ))
        ) : topics.length === 0 ? (
          <p>No topics found.</p>
        ) : (
          topics.map(([topic, count]) => (
            <Link key={topic} href={`/interviews?topic=${encodeURIComponent(topic)}`} className="topic-pill">
              {topic}
              <span className="topic-count">{count}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
