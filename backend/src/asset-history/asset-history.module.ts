import { Module } from '@nestjs/common';
import { AssetHistoryService } from './asset-history.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetHistoryController } from './asset-history.controller';

@Module({
  imports: [PrismaModule],
  providers: [AssetHistoryService],
  exports: [AssetHistoryService],
  controllers: [AssetHistoryController],
})
export class AssetHistoryModule {} 