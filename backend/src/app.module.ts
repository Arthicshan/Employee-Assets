import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { AssetModule } from './asset/asset.module';

@Module({
  imports: [
    PrismaModule,
    EmployeeModule,
    AssetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}