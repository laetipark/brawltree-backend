import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly rankingsService: NewsService) {}

  /** 뉴스 목록 조회
   * @param regionCode
   */
  @Get('/')
  @HttpCode(200)
  async getNews(@Query('region') regionCode: string = 'ko') {
    return await this.rankingsService.getNews(regionCode);
  }

  /** 뉴스 목록 조회
   * @param regionCode
   * @param title
   */
  @Get('/:title')
  @HttpCode(200)
  async getNewsItem(
    @Query('region') regionCode: string = 'ko',
    @Param('title') title: string
  ) {
    return await this.rankingsService.getNewsItem(regionCode, title);
  }
}
