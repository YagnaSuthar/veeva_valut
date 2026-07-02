'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useInterviewList } from '@/hooks/useInterviews';
import '@/css/Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileQueryOpen, setIsMobileQueryOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileQueryOpen(false);
  };

  const { data: allData } = useInterviewList();
  const uniqueTopics = Array.from(
    new Set((allData?.interviews || []).map((i) => i.topic))
  ).sort();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/interviews', label: 'Interviews' },
    { href: '/articles', label: 'Articles' },
    { href: '/release-notes', label: 'Release Notes' },
  ];

  if (isAdmin) {
    links.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.svg" alt="Veeva Vault Hub Logo" style={{ width: '28px', height: '28px' }} />
          Veeva Vault Hub
        </Link>

        <nav className="navbar-links" style={{ alignItems: 'center' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {uniqueTopics.length > 0 && (
            <div className="nav-dropdown">
              <button className="nav-dropdown-btn">
                Ask Query <ChevronDown size={14} />
              </button>
              <div className="nav-dropdown-content">
                {uniqueTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/interviews?topic=${encodeURIComponent(topic)}&ask=true`}
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-outline'}`}>
                {user.role}
              </span>
              <button onClick={logout} className="btn btn-outline">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-outline">
              Login
            </Link>
          )}

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {uniqueTopics.length > 0 && (
            <div>
              <button 
                className="nav-dropdown-btn" 
                onClick={() => setIsMobileQueryOpen(!isMobileQueryOpen)}
                style={{ padding: '0.75rem 0', width: '100%', justifyContent: 'space-between' }}
              >
                <span>Ask Query Topics</span>
                <ChevronDown size={14} style={{ transform: isMobileQueryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {isMobileQueryOpen && (
                <div className="mobile-dropdown-list">
                  {uniqueTopics.map((topic) => (
                    <Link
                      key={topic}
                      href={`/interviews?topic=${encodeURIComponent(topic)}&ask=true`}
                      className="nav-link"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ fontSize: '0.9rem', color: 'var(--brand-primary)' }}
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
