import { AssignmentsModule } from '../assignments/assignments.module';
import { ReturnsModule } from '../returns/returns.module';
import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AssignmentsModule, ReturnsModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}