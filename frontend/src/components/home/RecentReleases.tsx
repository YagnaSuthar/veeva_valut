'use client';

const RELEASES = [
  { version: "24R3", date: "Dec 2024", highlights: ["New Vault Objects API", "Lifecycle improvements", "Performance updates"] },
  { version: "24R2", date: "Aug 2024", highlights: ["Multi-document workflows", "SDK enhancements"] },
  { version: "24R1", date: "Apr 2024", highlights: ["Spark Messaging GA", "Vault Java SDK v24.1"] },
];

export default function RecentReleases() {
  return (
    <section>
      <h2 className="section-heading">Recent Veeva Releases</h2>
      
      <div className="timeline">
        {RELEASES.map((release) => (
          <div key={release.version} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-pill">{release.version}</span>
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-date">{release.date}</div>
              <ul className="timeline-list">
                {release.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
