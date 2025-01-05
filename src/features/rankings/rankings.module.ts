import { Module } from '@nestjs/common';
import { UtilsModule } from '~/utils/utils.module';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports:[UtilsModule],
  controllers:[RankingsController],
  providers:[RankingsService]
})
export class RankingsModule{}
