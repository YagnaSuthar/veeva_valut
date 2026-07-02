'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu } from 'lucide-react';
import '@/css/Admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Loading Admin...</div>;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="admin-layout">
      {/* Mobile Top Header */}
      <div className="admin-mobile-header">
        <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </button>
        <span className="admin-header-title">Admin Dashboard</span>
      </div>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay to close sidebar on click outside */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
