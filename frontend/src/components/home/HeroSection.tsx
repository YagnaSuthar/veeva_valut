'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <h1>Ace Your Veeva Vault Interview</h1>
          <p>
            The most comprehensive resource for Veeva Vault professionals.
            Explore interview questions, track releases, and stay ahead.
          </p>
          <div className="hero-actions">
            <Link href="/interviews" className="btn btn-accent">
              Explore Interviews
            </Link>
            <Link href="/interviews" className="btn btn-outline-white">
              Browse Topics
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">120+</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">Topics</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Weekly</span>
            <span className="stat-label">Updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
