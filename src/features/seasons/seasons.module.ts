import { Module } from '@nestjs/common';
import { SeasonsService } from '~/seasons/seasons.service';

@Module({
  providers: [SeasonsService],
  exports: [SeasonsService]
})
export class SeasonsModule {}
