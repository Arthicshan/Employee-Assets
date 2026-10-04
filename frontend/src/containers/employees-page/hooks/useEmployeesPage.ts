'use client';

import { useState, useEffect, useCallback } from 'react';
import { employeesService } from '@/services/employees/employees.service';
import { Employee, CreateEmployeeDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';
import { toast } from '@/components/Toast';

export function useEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee && formData.isActive === false && editingEmployee.isActive !== false) {
      const activeCount = (editingEmployee._count?.assignments ?? 0) + (editingEmployee._count?.assets ?? 0);
      if (activeCount > 0) {
        const msg = `Cannot deactivate employee "${editingEmployee.firstName} ${editingEmployee.lastName}" because they have ${activeCount} active assigned asset(s). Return all assigned assets first.`;
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      if (editingEmployee) {
        await employeesService.updateEmployee(editingEmployee.id, formData);
        toast.success(`Employee "${formData.firstName} ${formData.lastName}" updated successfully`);
        setEditingEmployee(null);
      } else {
        await employeesService.createEmployee(formData);
        toast.success(`Employee "${formData.firstName} ${formData.lastName}" registered successfully`);
        setIsCreateOpen(false);
      }
      await fetchEmployees();
    } catch (err: unknown) {
      const msg = (err instanceof ApiError ? err.message : undefined) || (err instanceof Error ? err.message : undefined) || 'Failed to save employee';
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(msg);
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    const activeCount = (deletingEmployee._count?.assignments ?? 0) + (deletingEmployee._count?.assets ?? 0);
    if (activeCount > 0) {
      const msg = `Cannot delete employee "${deletingEmployee.firstName} ${deletingEmployee.lastName}" because they have ${activeCount} active assigned asset(s). Return all assigned assets first.`;
      setError(msg);
      toast.error(msg);
      setDeletingEmployee(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = (await employeesService.deleteEmployee(deletingEmployee.id)) as unknown as { deactivated?: boolean } | undefined;
      if (res && res.deactivated) {
        toast.info(`Employee "${deletingEmployee.firstName} ${deletingEmployee.lastName}" has historical records and was deactivated instead of deleted.`);
      } else {
        toast.success(`Employee "${deletingEmployee.firstName} ${deletingEmployee.lastName}" deleted successfully`);
      }
      setDeletingEmployee(null);
      await fetchEmployees();
    } catch (err: unknown) {
      const msg = (err instanceof ApiError ? err.message : undefined) || (err instanceof Error ? err.message : undefined) || 'Failed to delete employee';
      setError(msg);
      toast.error(msg);
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
