import { Module } from '@nestjs/common';
import { AppConfigService } from './services/app-config.service';
import { BattleService } from './services/battle.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { URLService } from '~/utils/services/url.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('axios.baseURL')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AppConfigService, BattleService, URLService],
  exports: [HttpModule, AppConfigService, BattleService, URLService]
})
export class UtilsModule {}
