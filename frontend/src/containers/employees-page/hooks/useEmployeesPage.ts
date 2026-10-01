'use client';

import { useState, useEffect, useCallback } from 'react';
import { employeesService } from '@/services/employees/employees.service';
import { Employee, CreateEmployeeDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';

export function useEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
  };
  const [formData, setFormData] = useState<CreateEmployeeDto>(initialForm);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeesService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter((emp) => {
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
      if (editingEmployee) {
        await employeesService.updateEmployee(editingEmployee.id, formData);
        setEditingEmployee(null);
      } else {
        await employeesService.createEmployee(formData);
        setIsCreateOpen(false);
      }
      await fetchEmployees();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(err?.message || 'Failed to save employee');
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
      setDeletingEmployee(null);
      await fetchEmployees();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    employees: filteredEmployees,
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
