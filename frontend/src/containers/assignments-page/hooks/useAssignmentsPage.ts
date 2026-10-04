'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { assignmentsService } from '@/services/assignments/assignments.service';
import { returnsService } from '@/services/returns/returns.service';
import { assetsService } from '@/services/assets/assets.service';
import { employeesService } from '@/services/employees/employees.service';
import { AssetAssignment, Asset, Employee, CreateAssignmentDto, CreateReturnDto, PaginatedMeta } from '@/types';
import { ApiError } from '@/libs/api/api-error';

export function useAssignmentsPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

  const requestVersion = useRef(0);
  const fetchAssignments = useCallback(async () => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await assignmentsService.getAssignments({
        search: search || undefined, sortBy, sortOrder,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: meta.page,
        limit: meta.limit,
      });
      if (version !== requestVersion.current) return;
      setAssignments(response.data || []);
      if (response.meta) setMeta(response.meta);
    } catch (err: unknown) {
      if (version === requestVersion.current) setError((err instanceof Error ? err.message : undefined) || 'Failed to fetch assignments');
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [statusFilter, meta.page, meta.limit, search, sortBy, sortOrder]);

  const loadResources = useCallback(async () => {
    try {
      const [assetsData, empsData] = await Promise.all([
        assetsService.getAssets({ status: 'available' }),
        employeesService.getEmployees(),
      ]);
      setAvailableAssets(assetsData);
      setEmployees((empsData || []).filter((e) => e.isActive !== false));
    } catch {
      // Ignore background load failures
    }
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => { void fetchAssignments(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchAssignments]);

  useEffect(() => {
    const timer = setTimeout(() => { void loadResources(); }, 0);
    return () => clearTimeout(timer);
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
        assignedAt: assignForm.assignedAt ? new Date(assignForm.assignedAt).toISOString() : undefined,
      });
      setIsAssignOpen(false);
      await Promise.all([fetchAssignments(), loadResources()]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError((err instanceof Error ? err.message : undefined) || 'Failed to create assignment');
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
        returnedAt: returnForm.returnedAt ? new Date(returnForm.returnedAt).toISOString() : undefined,
      });
      setReturnTarget(null);
      await Promise.all([fetchAssignments(), loadResources()]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError((err instanceof Error ? err.message : undefined) || 'Failed to process return');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    assignments,
    search, setSearch: (value: string) => {setSearch(value); setMeta(current => ({...current, page:1}));},
    sortBy, setSortBy: (value: string) => {setSortBy(value); setMeta(current => ({...current, page:1}));},
    sortOrder, setSortOrder: (value: 'asc' | 'desc') => {setSortOrder(value); setMeta(current => ({...current, page:1}));},
    meta,
    availableAssets,
    employees,
    isLoading,
    error,
    validationErrors,
    statusFilter,
    setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'RETURNED') => {setStatusFilter(status); setMeta(current => ({...current, page: 1}));},
    setPage: (page: number) => setMeta(current => ({...current, page})),
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
