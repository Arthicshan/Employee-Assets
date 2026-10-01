import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { AssetModule } from './asset/asset.module';
import { CategoriesModule } from './categories/categories.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ReturnsModule } from './returns/returns.module';
import { AssetHistoryModule } from './asset-history/asset-history.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    PrismaModule,
    EmployeeModule,
    AssetModule,
    CategoriesModule,
    AssignmentsModule,
    ReturnsModule,
    AssetHistoryModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}