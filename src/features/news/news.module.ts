import { Module } from '@nestjs/common';
import { UtilsModule } from '~/utils/utils.module';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [UtilsModule],
  controllers: [NewsController],
  providers: [NewsService]
})
export class NewsModule {}
