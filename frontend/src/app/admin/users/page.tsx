'use client';

import { useState } from 'react';
import { useAdminUsers, useDeleteUser } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2 } from 'lucide-react';
import CreateUserModal from '@/components/admin/CreateUserModal';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers();
  const { mutate: deleteUser } = useDeleteUser();
  const { user: currentUser } = useAuth();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteUser(id);
    }
  };

  const users = data?.users || [];
  const adminCount = users.filter(u => u.role === 'admin').length;
  const regularCount = users.filter(u => u.role === 'user').length;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Manage Users</h1>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, padding: '1rem 1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Users</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-dark)' }}>{users.length}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '1rem 1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Admins</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{adminCount}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '1rem 1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Regular Users</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-body)' }}>{regularCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td>
                </tr>
              ) : !users.length ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  
                  return (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 600 }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-outline'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-icon" 
                          title={isSelf ? "Cannot delete your own account" : "Delete User"} 
                          onClick={() => !isSelf && handleDelete(user.id, user.name)}
                          style={{ opacity: isSelf ? 0.3 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                          disabled={isSelf}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && <CreateUserModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}
