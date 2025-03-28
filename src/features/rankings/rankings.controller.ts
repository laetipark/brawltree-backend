import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Query
} from '@nestjs/common';
import { FailureResponseEnum } from '~/common/enums/failure-response.enum';
import { RankingsService } from './rankings.service';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  /** 플레이어 랭킹 조회
   * @param countryCode
   */
  @Get('/players')
  @HttpCode(200)
  async getPlayersRanking(
    @Query('countryCode') countryCode: string = 'global'
  ) {
    const response = await this.rankingsService.getRankingsFromAPI(
      `rankings/${countryCode}/players`
    );

    if (!response) {
      throw new BadRequestException(`${FailureResponseEnum.BAD_REQUEST}`);
    }

    return {
      items: response,
      date: new Date().toLocaleString()
    };
  }

  /** 클럽 랭킹 조회
   * @param countryCode
   */
  @Get('/clubs')
  @HttpCode(200)
  async getClubsRanking(@Query('countryCode') countryCode: string = 'global') {
    const response = await this.rankingsService.getRankingsFromAPI(
      `rankings/${countryCode}/clubs`
    );

    if (!response) {
      throw new BadRequestException(`${FailureResponseEnum.BAD_REQUEST}`);
    }

    return {
      items: response,
      date: new Date().toLocaleString()
    };
  }

  /** 브롤러별 랭킹 조회
   * @param countryCode
   * @param brawlerID
   */
  @Get('/brawlers')
  @HttpCode(200)
  async getBrawlersRanking(
    @Query('countryCode') countryCode: string = 'global',
    @Query('brawlerID') brawlerID: string = '16000000'
  ) {
    const response = await this.rankingsService.getRankingsFromAPI(
      `rankings/${countryCode}/brawlers/${brawlerID}`
    );

    if (!response) {
      throw new BadRequestException(`${FailureResponseEnum.BAD_REQUEST}`);
    }

    return {
      items: response,
      date: new Date().toLocaleString()
    };
  }
}
