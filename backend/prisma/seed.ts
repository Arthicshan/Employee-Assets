import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with enriched dummy data (employees, assigned, damaged, available)...');

  // 1. Create or update system users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@assetflow.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@assetflow.com' },
    update: { passwordHash: managerPassword },
    create: {
      email: 'manager@assetflow.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
      firstName: 'Asset',
      lastName: 'Manager',
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee@assetflow.com' },
    update: { passwordHash: employeePassword },
    create: {
      email: 'employee@assetflow.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  console.log('Users verified/created.');

  // Clean existing transactional and inventory records for clean seeding
  console.log('Cleaning existing inventory records...');
  await prisma.assetHistory.deleteMany({});
  await prisma.assetAssignment.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.assetCategory.deleteMany({});

  // 2. Create Asset Categories
  const categoriesData = [
    { name: 'Laptops', description: 'Enterprise laptops, ultrabooks, and mobile workstations' },
    { name: 'Monitors', description: '4K, UltraWide, and dual-monitor displays' },
    { name: 'Mobile Phones', description: 'Company-issued smartphones and testing devices' },
    { name: 'Accessories', description: 'Keyboards, ergonomic mice, and docking stations' },
    { name: 'Audio & Video', description: 'Noise-canceling headsets, webcams, and speakerphones' },
    { name: 'Networking', description: 'Managed switches, routers, and PoE adapters' },
  ];

  for (const cat of categoriesData) {
    await prisma.assetCategory.create({
      data: cat,
    });
  }
  console.log(`Created ${categoriesData.length} categories.`);

  // 3. Create Employees across various departments
  const employeesData = [
    { employeeNo: 'EMP-001', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@company.com', department: 'Engineering', position: 'Lead Software Architect' },
    { employeeNo: 'EMP-002', firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@company.com', department: 'Product Design', position: 'Senior UX Designer' },
    { employeeNo: 'EMP-003', firstName: 'Carol', lastName: 'Williams', email: 'carol.williams@company.com', department: 'Marketing', position: 'VP of Marketing' },
    { employeeNo: 'EMP-004', firstName: 'David', lastName: 'Brown', email: 'david.brown@company.com', department: 'Engineering', position: 'DevOps / SRE Lead' },
    { employeeNo: 'EMP-005', firstName: 'Eve', lastName: 'Davis', email: 'eve.davis@company.com', department: 'Human Resources', position: 'People Operations Manager' },
    { employeeNo: 'EMP-006', firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@company.com', department: 'Finance', position: 'Senior Financial Analyst' },
    { employeeNo: 'EMP-007', firstName: 'Grace', lastName: 'Hopper', email: 'grace.hopper@company.com', department: 'Engineering', position: 'QA Automation Lead' },
    { employeeNo: 'EMP-008', firstName: 'Henry', lastName: 'Wilson', email: 'henry.wilson@company.com', department: 'Product', position: 'Senior Product Manager' },
    { employeeNo: 'EMP-009', firstName: 'Irene', lastName: 'Adler', email: 'irene.adler@company.com', department: 'IT Operations', position: 'IT Support Specialist' },
    { employeeNo: 'EMP-010', firstName: 'Jack', lastName: 'Robinson', email: 'jack.robinson@company.com', department: 'Sales', position: 'Enterprise Account Executive' },
  ];

  const createdEmployees: Record<string, any> = {};
  for (const emp of employeesData) {
    const record = await prisma.employee.create({
      data: emp,
    });
    createdEmployees[emp.employeeNo] = record;
  }
  console.log(`Created ${employeesData.length} employees.`);

  // 4. Create Assets with various states (assigned, damaged, available, under_repair, retired)
  const assetsData = [
    // Assigned Assets (Status: 'assigned')
    {
      assetTag: 'LAP-001',
      name: 'MacBook Pro 16" M3 Max',
      category: 'Laptops',
      brand: 'Apple',
      model: 'MacBook Pro 2024 (36GB RAM / 1TB SSD)',
      serialNumber: 'SN-LAP-001',
      status: 'assigned',
      purchaseDate: new Date('2024-01-15'),
      assignedTo: 'EMP-001',
      assignmentNotes: 'Assigned for primary development and cloud architecture.',
    },
    {
      assetTag: 'LAP-002',
      name: 'ThinkPad X1 Carbon Gen 11',
      category: 'Laptops',
      brand: 'Lenovo',
      model: 'X1 Carbon (Intel i7, 32GB RAM)',
      serialNumber: 'SN-LAP-002',
      status: 'assigned',
      purchaseDate: new Date('2023-11-20'),
      assignedTo: 'EMP-004',
      assignmentNotes: 'Assigned for infrastructure deployments and on-call rotation.',
    },
    {
      assetTag: 'LAP-003',
      name: 'Dell XPS 15 9530 OLED',
      category: 'Laptops',
      brand: 'Dell',
      model: 'XPS 15 9530 (4K Touch, RTX 4060)',
      serialNumber: 'SN-LAP-003',
      status: 'assigned',
      purchaseDate: new Date('2024-02-10'),
      assignedTo: 'EMP-002',
      assignmentNotes: 'High-color accuracy workstation assigned for UI/UX design.',
    },
    {
      assetTag: 'MON-001',
      name: 'Dell UltraSharp 27" 4K USB-C Hub',
      category: 'Monitors',
      brand: 'Dell',
      model: 'U2723QE IPS Black',
      serialNumber: 'SN-MON-001',
      status: 'assigned',
      purchaseDate: new Date('2024-01-20'),
      assignedTo: 'EMP-001',
      assignmentNotes: 'Dual monitor desk setup for engineering lead.',
    },
    {
      assetTag: 'MON-002',
      name: 'LG 32" UltraFine 4K Ergo',
      category: 'Monitors',
      brand: 'LG',
      model: '32UN880-B Ergo Stand',
      serialNumber: 'SN-MON-002',
      status: 'assigned',
      purchaseDate: new Date('2024-02-15'),
      assignedTo: 'EMP-002',
      assignmentNotes: 'Ergonomic display for creative workflows.',
    },
    {
      assetTag: 'PHN-001',
      name: 'iPhone 15 Pro 256GB',
      category: 'Mobile Phones',
      brand: 'Apple',
      model: 'Natural Titanium A3101',
      serialNumber: 'SN-PHN-001',
      status: 'assigned',
      purchaseDate: new Date('2023-10-05'),
      assignedTo: 'EMP-003',
      assignmentNotes: 'Executive corporate communications and customer demos.',
    },
    {
      assetTag: 'PHN-002',
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Mobile Phones',
      brand: 'Samsung',
      model: 'Titanium Gray SM-S928B',
      serialNumber: 'SN-PHN-002',
      status: 'assigned',
      purchaseDate: new Date('2024-03-01'),
      assignedTo: 'EMP-010',
      assignmentNotes: 'Sales territory travel device and client meetings.',
    },
    {
      assetTag: 'ACC-001',
      name: 'Logitech MX Master 3S Wireless',
      category: 'Accessories',
      brand: 'Logitech',
      model: 'MX Master 3S Graphite',
      serialNumber: 'SN-ACC-001',
      status: 'assigned',
      purchaseDate: new Date('2024-01-16'),
      assignedTo: 'EMP-001',
      assignmentNotes: 'Standard ergonomic peripheral bundle.',
    },
    {
      assetTag: 'AV-001',
      name: 'Sony WH-1000XM5 ANC Headphones',
      category: 'Audio & Video',
      brand: 'Sony',
      model: 'WH-1000XM5 Black',
      serialNumber: 'SN-AV-001',
      status: 'assigned',
      purchaseDate: new Date('2024-02-01'),
      assignedTo: 'EMP-008',
      assignmentNotes: 'Assigned for stakeholder remote calls and focused work.',
    },

    // Damaged Assets (Status: 'damaged')
    {
      assetTag: 'LAP-004',
      name: 'MacBook Air 13" M2',
      category: 'Laptops',
      brand: 'Apple',
      model: 'MacBook Air M2 (Midnight, 16GB)',
      serialNumber: 'SN-LAP-004',
      status: 'damaged',
      purchaseDate: new Date('2023-05-12'),
      damagedNotes: 'Accidental drop during offsite travel. Cracked retina screen & bent hinge.',
      returnedBy: 'EMP-006',
    },
    {
      assetTag: 'MON-003',
      name: 'Dell 24" Professional Monitor',
      category: 'Monitors',
      brand: 'Dell',
      model: 'P2419H IPS',
      serialNumber: 'SN-MON-003',
      status: 'damaged',
      purchaseDate: new Date('2022-08-19'),
      damagedNotes: 'Vertical line artifact across panel and severe backlight flickering.',
      returnedBy: 'EMP-007',
    },
    {
      assetTag: 'PHN-003',
      name: 'Google Pixel 7 Pro',
      category: 'Mobile Phones',
      brand: 'Google',
      model: 'Obsidian 128GB (GA03423)',
      serialNumber: 'SN-PHN-003',
      status: 'damaged',
      purchaseDate: new Date('2022-11-10'),
      damagedNotes: 'Battery swelling detected; rear glass separated. Placed in safe containment.',
      returnedBy: 'EMP-009',
    },

    // Under Repair Assets
    {
      assetTag: 'LAP-005',
      name: 'ThinkPad T14s Gen 3',
      category: 'Laptops',
      brand: 'Lenovo',
      model: 'T14s AMD Ryzen 7 PRO',
      serialNumber: 'SN-LAP-005',
      status: 'under_repair',
      purchaseDate: new Date('2023-04-18'),
      damagedNotes: 'At Lenovo Authorized Depot for USB-C power rail diagnostics.',
    },

    // Available Assets
    {
      assetTag: 'LAP-006',
      name: 'HP EliteBook 840 G10',
      category: 'Laptops',
      brand: 'HP',
      model: 'EliteBook 840 (Intel Core i5, 16GB)',
      serialNumber: 'SN-LAP-006',
      status: 'available',
      purchaseDate: new Date('2024-04-01'),
    },
    {
      assetTag: 'LAP-007',
      name: 'MacBook Pro 14" M3 Pro',
      category: 'Laptops',
      brand: 'Apple',
      model: 'MacBook Pro 14" Space Black (18GB / 512GB)',
      serialNumber: 'SN-LAP-007',
      status: 'available',
      purchaseDate: new Date('2024-05-10'),
    },
    {
      assetTag: 'MON-004',
      name: 'Asus ProArt 27" Calibrated Monitor',
      category: 'Monitors',
      brand: 'Asus',
      model: 'PA278CV 100% sRGB',
      serialNumber: 'SN-MON-004',
      status: 'available',
      purchaseDate: new Date('2024-03-15'),
    },
    {
      assetTag: 'ACC-002',
      name: 'Apple Magic Keyboard with Touch ID',
      category: 'Accessories',
      brand: 'Apple',
      model: 'MK293LL/A Silver/White',
      serialNumber: 'SN-ACC-002',
      status: 'available',
      purchaseDate: new Date('2024-02-28'),
    },
    {
      assetTag: 'ACC-003',
      name: 'CalDigit TS4 Thunderbolt 4 Station',
      category: 'Accessories',
      brand: 'CalDigit',
      model: 'TS4-US-AMZ (18 Ports)',
      serialNumber: 'SN-ACC-003',
      status: 'available',
      purchaseDate: new Date('2024-03-20'),
    },
    {
      assetTag: 'AV-002',
      name: 'Jabra Speak 710 Wireless Speakerphone',
      category: 'Audio & Video',
      brand: 'Jabra',
      model: 'Speak 710 MS',
      serialNumber: 'SN-AV-002',
      status: 'available',
      purchaseDate: new Date('2023-09-14'),
    },
    {
      assetTag: 'NET-001',
      name: 'Cisco Catalyst 1000 Gigabit Switch',
      category: 'Networking',
      brand: 'Cisco',
      model: 'C1000-8FP-E-2G-L (8 Port PoE+)',
      serialNumber: 'SN-NET-001',
      status: 'available',
      purchaseDate: new Date('2023-07-22'),
    },

    // Retired Assets
    {
      assetTag: 'LAP-008',
      name: 'MacBook Pro 15" Touch Bar (2018)',
      category: 'Laptops',
      brand: 'Apple',
      model: 'MacBookPro15,1 Core i7',
      serialNumber: 'SN-LAP-008',
      status: 'retired',
      purchaseDate: new Date('2018-09-01'),
      damagedNotes: 'End of life reached. Storage wiped; recycled per environmental policy.',
    },
  ];

  console.log(`Seeding ${assetsData.length} assets with assignments and history...`);

  for (const item of assetsData) {
    const assignedEmp = item.assignedTo ? createdEmployees[item.assignedTo] : null;

    // Create Asset
    const asset = await prisma.asset.create({
      data: {
        assetTag: item.assetTag,
        name: item.name,
        category: item.category,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        status: item.status,
        purchaseDate: item.purchaseDate,
        employeeId: assignedEmp ? assignedEmp.id : null,
      },
    });

    // History: Creation
    await prisma.assetHistory.create({
      data: {
        assetId: asset.id,
        action: 'CREATED',
        notes: `Asset ${asset.assetTag} registered into inventory catalog.`,
        createdAt: item.purchaseDate || new Date(),
      },
    });

    // Active assignment
    if (item.status === 'assigned' && assignedEmp) {
      await prisma.assetAssignment.create({
        data: {
          assetId: asset.id,
          employeeId: assignedEmp.id,
          assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          notes: item.assignmentNotes || 'Standard employee equipment assignment',
        },
      });

      await prisma.assetHistory.create({
        data: {
          assetId: asset.id,
          employeeId: assignedEmp.id,
          action: 'ASSIGNED',
          notes: item.assignmentNotes || `Assigned to ${assignedEmp.firstName} ${assignedEmp.lastName} (${assignedEmp.employeeNo})`,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Damaged return history
    if (item.status === 'damaged' && item.returnedBy) {
      const pastEmp = createdEmployees[item.returnedBy];
      if (pastEmp) {
        const assignedTime = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const returnedTime = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        await prisma.assetAssignment.create({
          data: {
            assetId: asset.id,
            employeeId: pastEmp.id,
            assignedAt: assignedTime,
            returnedAt: returnedTime,
            status: 'RETURNED',
            notes: item.damagedNotes || 'Returned in damaged state',
          },
        });

        await prisma.assetHistory.create({
          data: {
            assetId: asset.id,
            employeeId: pastEmp.id,
            action: 'ASSIGNED',
            notes: `Initial issuance to ${pastEmp.firstName} ${pastEmp.lastName}`,
            createdAt: assignedTime,
          },
        });

        await prisma.assetHistory.create({
          data: {
            assetId: asset.id,
            employeeId: pastEmp.id,
            action: 'RETURNED',
            notes: `Returned with damage: ${item.damagedNotes}`,
            createdAt: returnedTime,
          },
        });
      }
    }
  }

  // Summary counts
  const [totalEmployees, totalAssets, availableAssets, assignedAssets, damagedAssets, totalCategories] = await Promise.all([
    prisma.employee.count(),
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'available' } }),
    prisma.asset.count({ where: { status: 'assigned' } }),
    prisma.asset.count({ where: { status: 'damaged' } }),
    prisma.assetCategory.count(),
  ]);

  console.log('\n=============================================');
  console.log(' SEEDING COMPLETED SUCCESSFULLY!');
  console.log('=============================================');
  console.log(`- Total Categories: ${totalCategories}`);
  console.log(`- Total Employees:  ${totalEmployees}`);
  console.log(`- Total Assets:     ${totalAssets}`);
  console.log(`- Assigned Assets:  ${assignedAssets}`);
  console.log(`- Damaged Assets:   ${damagedAssets}`);
  console.log(`- Available Assets: ${availableAssets}`);
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
