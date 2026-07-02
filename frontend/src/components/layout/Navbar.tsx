'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import '@/css/Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/interviews', label: 'Interviews' },
    { href: '/articles', label: 'Articles' },
    { href: '/release-notes', label: 'Release Notes' },
    { href: '/ask-query', label: 'Ask Query' },
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
        </div>
      )}
    </header>
  );
}
