import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      email: 'admin@assetflow.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@assetflow.com' },
    update: {},
    create: {
      email: 'manager@assetflow.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
      firstName: 'Asset',
      lastName: 'Manager',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@assetflow.com' },
    update: {},
    create: {
      email: 'employee@assetflow.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  console.log('Users created:', { admin: admin.email, manager: manager.email, employee: employee.email });

  // Create categories
  const categories = [
    { name: 'Laptops', description: 'Portable computing devices' },
    { name: 'Monitors', description: 'Display screens and monitors' },
    { name: 'Mobile Phones', description: 'Smartphones and mobile devices' },
    { name: 'Accessories', description: 'Peripherals and accessories' },
  ];

  for (const cat of categories) {
    await prisma.assetCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('Categories created:', categories.map(c => c.name));

  // Create employees
  const employees = [
    { employeeNo: 'EMP-001', firstName: 'Alice', lastName: 'Johnson', email: 'alice@company.com', department: 'Engineering', position: 'Software Developer' },
    { employeeNo: 'EMP-002', firstName: 'Bob', lastName: 'Smith', email: 'bob@company.com', department: 'Design', position: 'UI Designer' },
    { employeeNo: 'EMP-003', firstName: 'Carol', lastName: 'Williams', email: 'carol@company.com', department: 'Marketing', position: 'Marketing Manager' },
    { employeeNo: 'EMP-004', firstName: 'David', lastName: 'Brown', email: 'david@company.com', department: 'Engineering', position: 'DevOps Engineer' },
    { employeeNo: 'EMP-005', firstName: 'Eve', lastName: 'Davis', email: 'eve@company.com', department: 'HR', position: 'HR Specialist' },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { employeeNo: emp.employeeNo },
      update: {},
      create: emp,
    });
  }

  console.log('Employees created:', employees.map(e => e.employeeNo));

  // Create assets
  const assets = [
    { assetTag: 'LAP-001', name: 'MacBook Pro 16"', category: 'Laptops', brand: 'Apple', model: 'MacBook Pro 2024', serialNumber: 'SN-LAP-001', status: 'available' },
    { assetTag: 'LAP-002', name: 'ThinkPad X1 Carbon', category: 'Laptops', brand: 'Lenovo', model: 'X1 Carbon Gen 11', serialNumber: 'SN-LAP-002', status: 'available' },
    { assetTag: 'LAP-003', name: 'Dell XPS 15', category: 'Laptops', brand: 'Dell', model: 'XPS 15 9530', serialNumber: 'SN-LAP-003', status: 'available' },
    { assetTag: 'MON-001', name: 'Dell UltraSharp 27"', category: 'Monitors', brand: 'Dell', model: 'U2723QE', serialNumber: 'SN-MON-001', status: 'available' },
    { assetTag: 'MON-002', name: 'LG 32" 4K Monitor', category: 'Monitors', brand: 'LG', model: '32UN880', serialNumber: 'SN-MON-002', status: 'available' },
    { assetTag: 'PHN-001', name: 'iPhone 15 Pro', category: 'Mobile Phones', brand: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'SN-PHN-001', status: 'available' },
    { assetTag: 'PHN-002', name: 'Samsung Galaxy S24', category: 'Mobile Phones', brand: 'Samsung', model: 'Galaxy S24', serialNumber: 'SN-PHN-002', status: 'available' },
    { assetTag: 'ACC-001', name: 'Logitech MX Master 3S', category: 'Accessories', brand: 'Logitech', model: 'MX Master 3S', serialNumber: 'SN-ACC-001', status: 'available' },
    { assetTag: 'ACC-002', name: 'Apple Magic Keyboard', category: 'Accessories', brand: 'Apple', model: 'Magic Keyboard', serialNumber: 'SN-ACC-002', status: 'available' },
    { assetTag: 'ACC-003', name: 'Sony WH-1000XM5 Headphones', category: 'Accessories', brand: 'Sony', model: 'WH-1000XM5', serialNumber: 'SN-ACC-003', status: 'available' },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { assetTag: asset.assetTag },
      update: {},
      create: asset,
    });
  }

  console.log('Assets created:', assets.map(a => a.assetTag));

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
