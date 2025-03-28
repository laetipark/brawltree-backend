import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';
import { FailureResponseEnum } from '~/common/enums/failure-response.enum';

@Controller('brawlian')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userProfileService: UserProfileService,
    private readonly userBattlesService: UserBattlesService,
    private readonly userBrawlersService: UserBrawlersService
  ) {}

  /** 키워드(닉네임 또는 태그)에 입력값이 포함된 사용자 조회
   * @param keyword 입력값 */
  @Get('/keyword')
  @HttpCode(200)
  selectUsersByNickname(@Query('keyword') keyword: string) {
    return this.usersService.selectUsersByKeyword(keyword);
  }

  /** 태그에 포함된 사용자 조회
   * @param userIDs 유저 아이디 */
  @Get('/ids')
  @HttpCode(200)
  selectUsersByUserIDs(@Query('userIDs') userIDs: string[]) {
    return this.usersService.selectUsersByUserIDs(userIDs);
  }

  /** 사용자 ID에 대한 상세 조회
   * @param id 사용자 ID */
  @Get('/:id')
  @HttpCode(200)
  async selectUser(@Param('id') id: string) {
    const user = await this.usersService.selectUser(id);
    const { insert, update } = await this.usersService.updateUserFromCrawler(
      user,
      id
    );

    if (!user && !insert && !update) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`
      );
    }

    return {
      user: await this.usersService.selectUser(id)
    };
  }

  /** 사용자 ID에 대한 상세 조회
   * @param id 사용자 ID */
  @Get('/:id/profile')
  @HttpCode(200)
  async selectUserProfile(@Param('id') id: string) {
    const user = await this.usersService.selectUser(id);

    if (!user) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`
      );
    }

    return {
      profile: await this.userProfileService.selectUserProfile(id)
    };
  }

  /** 사용자 소유 브롤러 한 종 정보 조회
   * @param id 사용자 ID
   * @param brawlerID */
  @Get('/:id/brawler/:brawler')
  async selectUserBrawler(
    @Param('id') id: string,
    @Param('brawler') brawlerID: string
  ) {
    // return await this.userBrawlersService.selectUserBrawler(id, brawlerID);
  }

  /** 사용자 소유 모든 브롤러 정보 조회
   * @param id 사용자 ID */
  @Get('/:id/brawlers')
  async selectUserBrawlers(@Param('id') id: string) {
    const {
      userWithoutBrawlers,
      userOwnedBrawlers,
      brawlerItems,
      brawlerGraphs
    } = await this.userBrawlersService.selectUserBrawlers(id);

    return {
      userWithoutBrawlers,
      userOwnedBrawlers,
      brawlerItems,
      brawlerGraphs
    };
  }

  /** 사용자 전투 정보 조회
   * @param id 사용자 ID
   * @param type 전투 타입
   * @param mode 전투 모드  */
  @Get('/:id/battles/stats')
  @HttpCode(200)
  async selectUserBattleStats(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string
  ) {
    const { season, modeTL, modePL } =
      await this.userBattlesService.selectUserBattleModes(id);
    const { summaryBattles, dailyBrawlers } =
      await this.userBattlesService.selectUserDailyBattles(
        id,
        type,
        mode,
        season
      );

    return {
      summaryBattles: summaryBattles,
      dailyBrawlers: dailyBrawlers,
      modeTL,
      modePL,
      season: season
    };
  }

  /** 사용자 전투 정보 조회
   * @param id 사용자 ID
   * @param type 전투 타입
   * @param mode 전투 모드
   * @param stack  */
  @Get('/:id/battles/logs')
  @HttpCode(200)
  async selectUserBattleLogs(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string,
    @Query('stack', ParseIntPipe) stack: number
  ) {
    const { recentUserBattles, userBrawlerBattles, userBattleLogs } =
      await this.userBattlesService.selectUserBattleLogs(
        id,
        type,
        mode,
        stack || 1
      );

    return {
      recentBattles: recentUserBattles,
      recentBrawlers: userBrawlerBattles,
      battles: userBattleLogs
    };
  }
}
