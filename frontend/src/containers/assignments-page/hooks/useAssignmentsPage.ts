'use client';

import { useState, useEffect, useCallback } from 'react';
import { assignmentsService } from '@/services/assignments/assignments.service';
import { returnsService } from '@/services/returns/returns.service';
import { assetsService } from '@/services/assets/assets.service';
import { employeesService } from '@/services/employees/employees.service';
import { AssetAssignment, Asset, Employee, CreateAssignmentDto, CreateReturnDto, PaginatedMeta } from '@/types';
import { ApiError } from '@/libs/api/api-error';

export function useAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED'>('ACTIVE');

  // Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<CreateAssignmentDto>({
    assetId: 0,
    employeeId: 0,
    notes: '',
  });

  // Return Modal
  const [returnTarget, setReturnTarget] = useState<AssetAssignment | null>(null);
  const [returnForm, setReturnForm] = useState<CreateReturnDto>({
    assignmentId: 0,
    condition: 'GOOD',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assignmentsService.getAssignments({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: meta.page,
        limit: meta.limit,
      });
      setAssignments(response.data || []);
      if (response.meta) setMeta(response.meta);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, meta.page, meta.limit]);

  const loadResources = useCallback(async () => {
    try {
      const [assetsData, empsData] = await Promise.all([
        assetsService.getAssets({ status: 'available' }),
        employeesService.getEmployees(),
      ]);
      setAvailableAssets(assetsData);
      setEmployees(empsData);
    } catch {
      // Ignore background load failures
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const openAssignModal = () => {
    setAssignForm({
      assetId: availableAssets[0]?.id || 0,
      employeeId: employees[0]?.id || 0,
      notes: '',
    });
    setError(null);
    setValidationErrors([]);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.assetId || !assignForm.employeeId) {
      setError('Please select both an available asset and an employee');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      await assignmentsService.createAssignment({
        assetId: Number(assignForm.assetId),
        employeeId: Number(assignForm.employeeId),
        notes: assignForm.notes,
      });
      setIsAssignOpen(false);
      await Promise.all([fetchAssignments(), loadResources()]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(err?.message || 'Failed to create assignment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReturnModal = (assignment: AssetAssignment) => {
    setReturnTarget(assignment);
    setReturnForm({
      assignmentId: assignment.id,
      condition: 'GOOD',
      notes: '',
    });
    setError(null);
    setValidationErrors([]);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      await returnsService.createReturn({
        assignmentId: returnTarget.id,
        condition: returnForm.condition,
        notes: returnForm.notes,
      });
      setReturnTarget(null);
      await Promise.all([fetchAssignments(), loadResources()]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(err?.message || 'Failed to process return');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    assignments,
    meta,
    availableAssets,
    employees,
    isLoading,
    error,
    validationErrors,
    statusFilter,
    setStatusFilter,
    isAssignOpen,
    setIsAssignOpen,
    assignForm,
    setAssignForm,
    returnTarget,
    setReturnTarget,
    returnForm,
    setReturnForm,
    isSubmitting,
    openAssignModal,
    handleAssignSubmit,
    openReturnModal,
    handleReturnSubmit,
    refresh: () => Promise.all([fetchAssignments(), loadResources()]),
  };
}
