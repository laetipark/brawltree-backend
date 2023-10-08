import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserProfile } from './entities/users.entity';
import { UserProfileService } from './services/userProfile.service';
import { UserBattlesService } from './services/userBattles.service';
import { UserBrawlersService } from './services/userBrawlers.service';
import { EventsService } from '~/maps/services/events.service';
import { SeasonsService } from '~/seasons/seasons.service';

@Controller('brawlian')
export class UsersController {
  constructor(
    private eventsService: EventsService,
    private usersService: UsersService,
    private userProfileService: UserProfileService,
    private userBattlesService: UserBattlesService,
    private userBrawlersService: UserBrawlersService,
    private seasonsService: SeasonsService,
  ) {}

  @Get('/:id')
  @HttpCode(200)
  async selectUser(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const user = await this.usersService.findUser(id);

    if (
      !user ||
      new Date(new Date(user.USER_LST_CK).getTime() + 5 * 60 * 1000) <
        new Date()
    ) {
      await this.insertUser(id, user);
    }

    const season = await this.seasonsService.findSeason();
    const rotationTL = await this.eventsService.findModeTL();
    const rotationPL = await this.eventsService.findModePL();
    const [battlesSummary, brawlersSummary] =
      await this.userBattlesService.findUserBattles(id, type, mode, season);
    const [recentBattles, recentBrawlers, battles] =
      await this.userBattlesService.findUserBattleLogs(id, type, mode, season);
    const [brawlers, brawlerItems, brawlerGraphs] =
      await this.userBrawlersService.findUserBrawlers(id, season);

    return {
      user: user || (await this.usersService.findUser(id)),
      profile: await this.userProfileService.findUserProfile(id),
      rotationTL: rotationTL,
      rotationPL: rotationPL,
      battlesSummary: battlesSummary,
      brawlersSummary: brawlersSummary,
      recentBattles: recentBattles,
      recentBrawlers: recentBrawlers,
      battles: battles,
      brawlers: brawlers,
      brawlerItems: brawlerItems,
      brawlerGraphs: brawlerGraphs,
      season: season,
    };
  }

  @Get('/:id/profile')
  @HttpCode(200)
  async selectUserProfile(@Param('id') id: string): Promise<UserProfile> {
    return await this.userProfileService.findUserProfile(id);
  }

  @Get('/:id/brawlers')
  @HttpCode(200)
  async selectUserBrawlers(@Param('id') id: string) {
    const season = await this.seasonsService.findSeason();
    const [brawlers, brawlerItems, brawlerGraphs] =
      await this.userBrawlersService.findUserBrawlers(id, season);

    return {
      brawlers: brawlers,
      brawlerItems: brawlerItems,
      brawlerGraphs: brawlerGraphs,
    };
  }

  @Get('/:id/battles/summary')
  @HttpCode(200)
  async selectUserBattles(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const season = await this.seasonsService.findSeason();
    const [battlesSummary, brawlersSummary] =
      await this.userBattlesService.findUserBattles(id, type, mode, season);
    const rotationTL = await this.eventsService.findModeTL();
    const rotationPL = await this.eventsService.findModePL();

    return {
      rotationTL: rotationTL,
      rotationPL: rotationPL,
      battlesSummary: battlesSummary,
      brawlersSummary: brawlersSummary,
      season: season,
    };
  }

  @Get('/:id/battles/logs')
  @HttpCode(200)
  async selectUserBattleLogs(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const season = await this.seasonsService.findSeason();
    const [recentBattles, recentBrawlers, battles] =
      await this.userBattlesService.findUserBattleLogs(id, type, mode, season);

    return {
      recentBattles: recentBattles,
      recentBrawlers: recentBrawlers,
      battles: battles,
    };
  }

  @Post('/:id')
  async insertUser(@Param('id') id: string, data) {
    const user = await this.usersService.getUser(id);

    if (!user) {
      return;
    }
    if (!data) {
      await this.usersService.createUser({
        USER_ID: user.tag,
        USER_LST_CK: new Date(0),
        USER_LST_BT: new Date(0),
        USER_CR: null,
        USER_CR_NM: null,
      });
    }

    await this.updateUser(id, user);

    return user;
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, user: any) {
    const season = await this.seasonsService.findSeason();
    await this.userProfileService.updateUserProfile(user, season);
    await this.userBattlesService.getUserBattles(id);
  }
}
