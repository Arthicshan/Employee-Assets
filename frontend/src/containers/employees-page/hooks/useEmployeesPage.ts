'use client';

import { useState, useEffect, useCallback } from 'react';
import { employeesService } from '@/services/employees/employees.service';
import { Employee, CreateEmployeeDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';
import { toast } from '@/components/Toast';

export function validateName(name: string, fieldLabel: string = 'Name'): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return `${fieldLabel} is required`;
  }
  if (trimmed.length < 2) {
    return `${fieldLabel} must be at least 2 characters long`;
  }
  if (trimmed.length > 50) {
    return `${fieldLabel} cannot exceed 50 characters`;
  }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return `${fieldLabel} must contain at least one letter`;
  }
  return null;
}

export function useEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [activeFilter, setActiveFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm: CreateEmployeeDto = {
    employeeNo: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    isActive: true,
  };
  const [formData, setFormData] = useState<CreateEmployeeDto>(initialForm);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeesService.getEmployees();
      setEmployees(data);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : undefined) || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchEmployees(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const departments = [...new Set(employees.map(emp => emp.department))].sort();
  const filteredEmployees = employees.filter((emp) => {
    if (activeFilter && (emp.isActive !== false) !== (activeFilter === "ACTIVE")) return false;
    if (departmentFilter && emp.department !== departmentFilter) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      emp.employeeNo.toLowerCase().includes(term) ||
      emp.firstName.toLowerCase().includes(term) ||
      emp.lastName.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term)
    );
  });

  const openCreateModal = () => {
    setFormData(initialForm);
    setError(null);
    setValidationErrors([]);
    setFieldErrors({});
    setIsCreateOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      employeeNo: emp.employeeNo,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      isActive: emp.isActive !== false,
    });
    setError(null);
    setValidationErrors([]);
    setFieldErrors({});
  };

  const handleFieldChange = (field: 'firstName' | 'lastName', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      const err = validateName(value, field === 'firstName' ? 'First name' : 'Last name');
      setFieldErrors((prev) => ({ ...prev, [field]: err || undefined }));
    }
  };

  const handleFieldBlur = (field: 'firstName' | 'lastName') => {
    const err = validateName(formData[field], field === 'firstName' ? 'First name' : 'Last name');
    setFieldErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstNameError = validateName(formData.firstName, 'First name');
    const lastNameError = validateName(formData.lastName, 'Last name');

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
      const payload: CreateEmployeeDto = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      if (editingEmployee) {
        await employeesService.updateEmployee(editingEmployee.id, payload);
        toast.success(`Employee ${payload.firstName} ${payload.lastName} updated successfully.`, 'Employee Updated');
        setEditingEmployee(null);
      } else {
        await employeesService.createEmployee(payload);
        toast.success(`Employee ${payload.firstName} ${payload.lastName} created successfully.`, 'Employee Created');
        setIsCreateOpen(false);
      }
      await fetchEmployees();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message, 'Failed to save employee');
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        const msg = (err instanceof Error ? err.message : undefined) || 'Failed to save employee';
        setError(msg);
        toast.error(msg, 'Failed to save employee');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    setIsSubmitting(true);
    try {
      await employeesService.deleteEmployee(deletingEmployee.id);
      toast.success(`Employee ${deletingEmployee.firstName} ${deletingEmployee.lastName} deleted.`, 'Employee Deleted');
      setDeletingEmployee(null);
      await fetchEmployees();
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : undefined) || 'Failed to delete employee';
      setError(msg);
      toast.error(msg, 'Failed to delete employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    employees: filteredEmployees,
    departments, departmentFilter, setDepartmentFilter, activeFilter, setActiveFilter,
    isLoading,
    error,
    validationErrors,
    fieldErrors,
    setFieldErrors,
    handleFieldChange,
    handleFieldBlur,
    validateName,
    search,
    setSearch,
    isCreateOpen,
    setIsCreateOpen,
    editingEmployee,
    setEditingEmployee,
    deletingEmployee,
    setDeletingEmployee,
    formData,
    setFormData,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
    refresh: fetchEmployees,
  };
}
