import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { UserTable } from '../components/Users/UserTable';
import { UserForm } from '../components/Users/UserForm';
import { User } from '../types';
import { authService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(true);
  
  const { showToast } = useToast();
  const { user } = useAuth();

        const loadUsers = async () => {
        try {
          setIsLoading(true);
          
          // Check if user is logged in
          if (!user) {
            showToast('Please log in to view users', 'error');
            setUsers([]);
            return;
          }
          
          // Check if user has manager role
          if (user.role !== 'manager') {
            showToast('Access denied. Only managers can view users.', 'error');
            setUsers([]);
            return;
          }
          
          const usersData = await authService.getUsers();
          
          // Handle paginated response
          let usersArray = [];
          if (usersData && typeof usersData === 'object') {
            if (Array.isArray(usersData)) {
              usersArray = usersData;
            } else if ('results' in usersData && Array.isArray((usersData as any).results)) {
              usersArray = (usersData as any).results;
            }
          }
          
          setUsers(usersArray);
        } catch (error: any) {
          console.error('Failed to load users:', error);
          showToast(error.message || 'Failed to load users', 'error');
          setUsers([]); // Set empty array on error
        } finally {
          setIsLoading(false);
        }
      };

  useEffect(() => {
    loadUsers();
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authService.deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
        showToast('User deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete user:', error);
        showToast('Failed to delete user', 'error');
      }
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

  const handleSubmit = async (userData: Partial<User>) => {
    try {
      if (formMode === 'create') {
        const newUser = await authService.createUser(userData);
        setUsers(prev => [newUser, ...prev]);
        showToast('User created successfully', 'success');
      } else if (selectedUser) {
        const updatedUser = await authService.updateUser(selectedUser.id, userData);
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ));
        showToast('User updated successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      showToast('Failed to save user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        {user?.role === 'manager' && (
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
                              <div className="mt-2 text-sm text-yellow-700">
                  <p>Please log in to view and manage users.</p>
                  <p className="mt-1"><strong>Test credentials:</strong> Username: ashutosh, Password: password123</p>
                </div>
            </div>
          </div>
        </div>
      ) : user.role !== 'manager' ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Only managers can view and manage users. Your current role is: {user.role}.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          isLoading={isLoading}
        />
      )}

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