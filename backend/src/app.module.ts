import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { AssetModule } from './asset/asset.module';
import { CategoriesModule } from './categories/categories.module';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    PrismaModule,
    EmployeeModule,
    AssetModule,
    CategoriesModule,
    AssignmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}