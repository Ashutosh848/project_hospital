import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';
import { User } from '../../types';

const schema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
    otherwise: (schema) => schema.optional().test('password-length', 'Password must be at least 6 characters', function(value) {
      // Only validate length if password is provided and not empty
      if (!value || value.trim() === '') {
        return true; // Skip validation for empty passwords
      }
      return value.length >= 6;
    })
  }),
  role: yup.string().required('Role is required').test('valid-role', 'Please enter either "dataentry" or "manager"', function(value) {
    if (!value) return false;
    const validRoles = ['dataentry', 'manager'];
    return validRoles.includes(value.toLowerCase().trim());
  })
});

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<User>) => void;
  initialData?: User | null;
  title: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}) => {
  const isEdit = !!initialData;
  const [roleInput, setRoleInput] = useState(initialData?.role || '');
  const [showRoleSuggestion, setShowRoleSuggestion] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit },
    defaultValues: initialData ? {
      username: initialData.username,
      email: initialData.email,
      password: '',
      role: initialData.role
    } : {
      username: '',
      email: '',
      password: '',
              role: 'dataentry'
    }
  });



  useEffect(() => {
    if (initialData) {
      reset({
        username: initialData.username,
        email: initialData.email,
        password: '',
        role: initialData.role
      });
      setRoleInput(initialData.role);
    } else {
      reset({
        username: '',
        email: '',
        password: '',
            role: 'dataentry'
  });
      setRoleInput('dataentry');
    }
    setShowRoleSuggestion(false);
  }, [initialData, reset]);

  const handleRoleChange = (value: string) => {
    setRoleInput(value);
    setValue('role', value);
    
    // Show suggestion if input doesn't match valid roles
    const validRoles = ['dataentry', 'manager'];
    const normalizedValue = value.toLowerCase().trim();
    setShowRoleSuggestion(value.length > 0 && !validRoles.includes(normalizedValue));
  };

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      ...data,
      role: data.role.toLowerCase().trim(), // Normalize role input
      status: initialData?.status || 'active',
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    
    // Remove password if it's empty or only whitespace
    if (!data.password || data.password.trim() === '') {
      delete formattedData.password;
    }
    
    onSubmit(formattedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  {...register('username')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {isEdit ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isEdit ? 'Enter new password (optional)' : 'Enter password'}
                />
                {isEdit && (
                  <p className="mt-1 text-sm text-gray-500">
                    Leave this field empty to keep the current password unchanged.
                  </p>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role (dataentry or manager)"
                />
                {showRoleSuggestion && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 font-medium mb-1">Suggested roles:</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('dataentry')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        dataentry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('manager')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        manager
                      </button>
                    </div>
                  </div>
                )}
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEdit ? 'Update' : 'Create'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};