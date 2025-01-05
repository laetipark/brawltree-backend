import {
  BadRequestException,
  Controller,
  Get,
  HttpCode, NotFoundException,
  Query
} from '@nestjs/common';
import { FailureResponseEnum } from '../../common/enums/failure-response.enum';
import { RankingsService } from './rankings.service';

@Controller('rankings')
export class RankingsController{
  constructor(private readonly rankingsService:RankingsService){}

  /** 플레이어 랭킹 조회
   * @param countryCode
   */
  @Get('/players')
  @HttpCode(200)
  getPlayersRanking(@Query('countryCode') countryCode:string = 'global'){
    const response = this.rankingsService.getRankingsFromAPI(`rankings/${countryCode}/players`);

    if(!response){
      throw new BadRequestException(
        `${FailureResponseEnum.BAD_REQUEST}`
      );
    }

    return response;
  }

  /** 클럽 랭킹 조회
   * @param countryCode
   */
  @Get('/clubs')
  @HttpCode(200)
  getClubsRanking(@Query('countryCode') countryCode:string = 'global'){
    const response = this.rankingsService.getRankingsFromAPI(`rankings/${countryCode}/clubs`);

    if(!response){
      throw new BadRequestException(
        `${FailureResponseEnum.BAD_REQUEST}`
      );
    }

    return response;
  }

  /** 브롤러별 랭킹 조회
   * @param countryCode
   * @param brawlerID
   */
  @Get('/brawlers')
  @HttpCode(200)
  getBrawlersRanking(@Query('countryCode') countryCode:string = 'global',
                     @Query('brawlerID') brawlerID:string = '16000000'){
    const response = this.rankingsService.getRankingsFromAPI(`rankings/${countryCode}/brawlers/${brawlerID}`);

    if(!response){
      throw new BadRequestException(
        `${FailureResponseEnum.BAD_REQUEST}`
      );
    }

    return response;
  }
}
