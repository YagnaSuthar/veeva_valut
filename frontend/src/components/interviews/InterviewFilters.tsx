'use client';

interface InterviewFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  topic: string;
  setTopic: (t: string) => void;
  uniqueTopics: string[];
}

export default function InterviewFilters({ search, setSearch, topic, setTopic, uniqueTopics }: InterviewFiltersProps) {
  const hasFilters = search !== '' || topic !== '';

  return (
    <div className="filter-bar">
      <input 
        type="text" 
        placeholder="Search interviews..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      
      <div className="filter-actions">
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All Topics</option>
          {uniqueTopics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        
        {hasFilters && (
          <button className="btn btn-outline" onClick={() => { setSearch(''); setTopic(''); }}>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
