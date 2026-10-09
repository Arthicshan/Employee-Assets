'use client';

import { useState, useEffect, useCallback } from 'react';
import { usersService } from '@/services/users/users.service';
import { SystemUser, CreateSystemUserDto, UpdateSystemUserDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';
import { toast } from '@/components/Toast';
import { useDebounce } from '@/hooks';

export function useUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});

  // Search filter
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

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
      const data = await usersService.getUsers({
        search: debouncedSearch || undefined,
      });
      setUsers(data);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : undefined) || 'Failed to fetch system users');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchUsers(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const openCreateModal = () => {
    setFormData(initialForm);
    setError(null);
    setValidationErrors([]);
    setFieldErrors({});
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
      isActive: user.role === 'ADMIN' ? true : user.isActive,
    });
    setError(null);
    setValidationErrors([]);
    setFieldErrors({});
  };

  const validateNameField = (name: string, fieldLabel: string = 'Name'): string | null => {
    const trimmed = (name || '').trim();
    if (!trimmed) return `${fieldLabel} is required`;
    if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters long`;
    if (trimmed.length > 50) return `${fieldLabel} cannot exceed 50 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes`;
    if (!/[a-zA-Z]/.test(trimmed)) return `${fieldLabel} must contain at least one letter`;
    return null;
  };

  const handleFieldChange = (field: 'firstName' | 'lastName', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      const err = validateNameField(value, field === 'firstName' ? 'First name' : 'Last name');
      setFieldErrors((prev) => ({ ...prev, [field]: err || undefined }));
    }
  };

  const handleFieldBlur = (field: 'firstName' | 'lastName') => {
    const err = validateNameField(formData[field], field === 'firstName' ? 'First name' : 'Last name');
    setFieldErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstNameError = validateNameField(formData.firstName, 'First name');
    const lastNameError = validateNameField(formData.lastName, 'Last name');

    if (firstNameError || lastNameError) {
      setFieldErrors({
        firstName: firstNameError || undefined,
        lastName: lastNameError || undefined,
      });
      setError('Please fix the validation errors for First Name and Last Name.');
      toast.error('First Name or Last Name is invalid.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);
    setFieldErrors({});

    try {
      if (editingUser) {
        const updatePayload: UpdateSystemUserDto = {
          email: formData.email,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          position: formData.position,
          role: formData.role,
          isActive: formData.role === 'ADMIN' ? true : formData.isActive,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await usersService.updateUser(editingUser.id, updatePayload);
        toast.success(`User ${updatePayload.firstName} ${updatePayload.lastName} updated successfully.`, 'User Updated');
        setEditingUser(null);
      } else {
        const createPayload: CreateSystemUserDto = {
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          isActive: formData.role === 'ADMIN' ? true : formData.isActive,
        };
        await usersService.createUser(createPayload);
        toast.success(`User ${createPayload.firstName} ${createPayload.lastName} created successfully.`, 'User Created');
        setIsCreateOpen(false);
      }
      await fetchUsers();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message, 'Failed to Save');
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        const msg = (err instanceof Error ? err.message : undefined) || 'Failed to save user account';
        setError(msg);
        toast.error(msg, 'Failed to Save');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    if (user.role === 'ADMIN') {
      toast.warning('Admin accounts cannot be deactivated.', 'Action Not Allowed');
      return;
    }
    try {
      await usersService.toggleStatus(user.id);
      toast.success(
        `User ${user.firstName} ${user.lastName} is now ${!user.isActive ? 'Active' : 'Deactivated'}.`,
        'Status Updated'
      );
      await fetchUsers();
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : undefined) || 'Failed to update user status';
      setError(msg);
      toast.error(msg, 'Status Update Failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    if (deletingUser.role === 'ADMIN') {
      toast.error('Admin accounts cannot be deleted.', 'Action Not Allowed');
      setDeletingUser(null);
      return;
    }
    setIsSubmitting(true);
    try {
      await usersService.deleteUser(deletingUser.id);
      toast.success(`User ${deletingUser.firstName} ${deletingUser.lastName} deleted successfully.`, 'User Deleted');
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : undefined) || 'Failed to delete user account';
      setError(msg);
      toast.error(msg, 'Delete Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
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
    fieldErrors,
    handleFieldChange,
    handleFieldBlur,
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
