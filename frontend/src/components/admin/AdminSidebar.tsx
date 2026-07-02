'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, FileText, Users, LogOut, X } from 'lucide-react';
import '@/css/Admin.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Return to Site', icon: LayoutDashboard },
    { href: '/admin/interviews', label: 'Manage Interview Questions', icon: FileText },
    { href: '/admin/release-notes', label: 'Manage Release Notes', icon: FileText },
    { href: '/admin/articles', label: 'Manage Articles', icon: FileText },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <h3>Admin Portal</h3>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close Sidebar">
          <X size={20} />
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-name">{user?.name}</div>
          <div className="admin-sidebar-email">{user?.email}</div>
        </div>
        <button 
          onClick={() => {
            onClose();
            logout();
          }} 
          className="btn btn-outline-white" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
