'use client';

import { useState, useEffect, useCallback } from 'react';
import { employeesService } from '@/services/employees/employees.service';
import { assignmentsService } from '@/services/assignments/assignments.service';
import { Employee, AssetAssignment } from '@/types';

export function useEmployeeDetailPage(id: number) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeData = useCallback(async () => {
    if (!id || isNaN(id)) return;
    setIsLoading(true);
    setError(null);
    try {
      const [empData, assignmentsData] = await Promise.all([
        employeesService.getEmployeeById(id),
        assignmentsService.getAssignments({ employeeId: id }),
      ]);
      setEmployee(empData);
      setAssignments(assignmentsData.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  return {
    employee,
    assignments,
    isLoading,
    error,
    refresh: fetchEmployeeData,
  };
}
