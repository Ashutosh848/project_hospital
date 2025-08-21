import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { UserTable } from '../components/Users/UserTable';
import { UserForm } from '../components/Users/UserForm';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { useToast } from '../hooks/useToast';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  const { showToast } = useToast();

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const handleCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
      showToast('User deleted successfully', 'success');
    }
  };

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : user
    ));
    const user = users.find(u => u.id === id);
    const newStatus = user?.status === 'active' ? 'inactive' : 'active';
    showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
  };

  const handleResetPassword = (id: string) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      // In a real app, this would trigger a password reset email
      showToast('Password reset email sent successfully', 'success');
    }
  };

  const handleSubmit = (userData: Partial<User>) => {
    if (formMode === 'create') {
      const newUser: User = {
        id: `user_${Date.now()}`,
        ...userData as User
      };
      setUsers(prev => [newUser, ...prev]);
      showToast('User created successfully', 'success');
    } else if (selectedUser) {
      const updatedUser = { ...selectedUser, ...userData };
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      showToast('User updated successfully', 'success');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
      />

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedUser}
        title={formMode === 'create' ? 'Create New User' : 'Edit User'}
      />
    </div>
  );
};