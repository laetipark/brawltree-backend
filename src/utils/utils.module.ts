import { Module } from '@nestjs/common';
import { AppConfigService } from './services/app-config.service';
import { BattleService } from './services/battle.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('axios.baseURL'),
        headers: configService.get<any>('axios.headers'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BattleService, AppConfigService],
  exports: [HttpModule, BattleService, AppConfigService],
})
export class UtilsModule {}
