export interface Employee {
  id: number;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  isActive?: boolean;
}

export interface UpdateEmployeeDto {
  employeeNo?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
}

