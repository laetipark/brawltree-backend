import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '~/users/users.module';
import { CrewModule } from '~/crew/crew.module';
import { MapsModule } from '~/maps/maps.module';
import { BrawlersModule } from '~/brawlers/brawlers.module';
import { UtilsModule } from '~/utils/utils.module';
import AppConfig from './configs/app.config';
import DatabaseConfig from './configs/database.config';
import { RankingsModule } from './features/rankings/rankings.module';
import { NewsModule } from './features/news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
      load: [AppConfig]
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig
    }),
    BrawlersModule,
    MapsModule,
    UsersModule,
    CrewModule,
    RankingsModule,
    NewsModule,
    UtilsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
