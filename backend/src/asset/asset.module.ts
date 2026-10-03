import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetHistoryModule } from '../asset-history/asset-history.module';

@Module({
  imports: [PrismaModule, AssetHistoryModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}