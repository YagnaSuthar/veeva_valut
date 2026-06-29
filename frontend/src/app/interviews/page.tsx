'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInterviewList } from '@/hooks/useInterviews';
import InterviewsTable from '@/components/interviews/InterviewsTable';
import InterviewFilters from '@/components/interviews/InterviewFilters';
import '@/css/Interviews.css';

export default function InterviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTopic = searchParams.get('topic') || '';

  const [search, setSearch] = useState('');
  
  // Use URL param for topic filter, to allow direct linking
  const { data, isLoading } = useInterviewList(urlTopic || undefined);

  // Derive all unique topics for the dropdown
  // Wait, if we fetch with `?topic=`, we only get that topic's results, 
  // so we can't derive ALL topics from the filtered list. 
  // We'll fetch the unfiltered list just to get topics.
  const { data: allData } = useInterviewList();
  
  const uniqueTopics = Array.from(new Set((allData?.interviews || []).map(i => i.topic))).sort();

  const handleTopicChange = (newTopic: string) => {
    if (newTopic) {
      router.push(`/interviews?topic=${encodeURIComponent(newTopic)}`);
    } else {
      router.push('/interviews');
    }
  };

  // Filter by search client-side
  const filteredInterviews = (data?.interviews || []).filter((interview) => 
    interview.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container interviews-page">
      <div className="interviews-header">
        <h1>Interviews</h1>
        <p>Explore our database of Veeva Vault interview questions by topic.</p>
      </div>

      <InterviewFilters 
        search={search}
        setSearch={setSearch}
        topic={urlTopic}
        setTopic={handleTopicChange}
        uniqueTopics={uniqueTopics}
      />

      <InterviewsTable 
        interviews={filteredInterviews}
        isLoading={isLoading}
      />
    </div>
  );
}
