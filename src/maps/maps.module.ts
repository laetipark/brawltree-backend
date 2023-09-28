import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller';
import { RotationService } from './services/rotation.service';
import { GameConfigService } from '../config/gameConfig.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapRotation } from './entities/maps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapRotation])],
  controllers: [MapsController],
  providers: [RotationService, GameConfigService],
})
export class MapsModule {}
