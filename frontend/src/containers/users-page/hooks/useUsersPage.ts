'use client';

import { useState, useEffect, useCallback } from 'react';
import { usersService } from '@/services/users/users.service';
import { SystemUser, CreateSystemUserDto, UpdateSystemUserDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';

export function useUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Search filter
  const [search, setSearch] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const initialForm: CreateSystemUserDto = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    position: '',
    role: 'EMPLOYEE',
    isActive: true,
  };
  const [formData, setFormData] = useState<CreateSystemUserDto>(initialForm);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch system users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setFormData(initialForm);
    setError(null);
    setValidationErrors([]);
    setIsCreateOpen(true);
  };

  const openEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position || '',
      role: user.role,
      isActive: user.isActive,
    });
    setError(null);
    setValidationErrors([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      if (editingUser) {
        const updatePayload: UpdateSystemUserDto = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await usersService.updateUser(editingUser.id, updatePayload);
        setEditingUser(null);
      } else {
        await usersService.createUser(formData);
        setIsCreateOpen(false);
      }
      await fetchUsers();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(err?.message || 'Failed to save user account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    try {
      await usersService.toggleStatus(user.id);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await usersService.deleteUser(deletingUser.id);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      fullName.includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.position && u.position.toLowerCase().includes(term)) ||
      u.role.toLowerCase().includes(term)
    );
  });

  return {
    users: filteredUsers,
    isLoading,
    error,
    validationErrors,
    search,
    setSearch,
    isCreateOpen,
    setIsCreateOpen,
    editingUser,
    setEditingUser,
    deletingUser,
    setDeletingUser,
    formData,
    setFormData,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSave,
    handleToggleStatus,
    handleDelete,
    refresh: fetchUsers,
  };
}
