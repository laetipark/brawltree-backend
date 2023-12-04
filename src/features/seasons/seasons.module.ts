import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seasons } from '~/seasons/entities/seasons.entity';
import { SeasonsService } from '~/seasons/seasons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Seasons])],
  providers: [SeasonsService],
  exports: [SeasonsService],
})
export class SeasonsModule {}
