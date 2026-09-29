-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "employeeNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "purchaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
