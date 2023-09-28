import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Users } from './entities/users.entity';
import { UsersService } from './services/users.service';
import { SeasonsService } from '../seasons/seasons.service';
import { UserProfile } from './entities/users.entity';
import { UserProfileService } from './services/userProfile.service';
import { UserBattlesService } from './services/userBattles.service';
import { UserBrawlersService } from './services/userBrawlers.service';
import { RotationService } from '../maps/services/rotation.service';

@Controller('brawlian')
export class UsersController {
  constructor(
    private rotationService: RotationService,
    private usersService: UsersService,
    private userProfileService: UserProfileService,
    private userBattlesService: UserBattlesService,
    private userBrawlersService: UserBrawlersService,
    private seasonsService: SeasonsService,
  ) {}

  @Get('/:id')
  @HttpCode(200)
  async selectUser(@Param('id') id: string): Promise<Users> {
    const user = await this.usersService.findUser(id);

    if (
      !user ||
      new Date(new Date(user.USER_LST_CK).getTime() + 5 * 60 * 1000) <
        new Date()
    ) {
      await this.insertUser(id, user);
    }
    return user || (await this.usersService.findUser(id));
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
    const [userBrawlers, userBrawlerItems, userBrawlerGraphs] =
      await this.userBrawlersService.findUserBrawlers(id, season);

    return {
      userBrawlers: userBrawlers,
      userBrawlerItems: userBrawlerItems,
      userBrawlerGraphs: userBrawlerGraphs,
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
    const [userBattles, userBrawlers] =
      await this.userBattlesService.findUserBattles(id, type, mode, season);
    const rotationTL = await this.rotationService.findModeTL();
    const rotationPL = await this.rotationService.findModePL();

    return {
      userBattles: userBattles,
      userBrawlers: userBrawlers,
      rotationTL: rotationTL,
      rotationPL: rotationPL,
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
    const [userRecentBattles, userRecentBrawlers, userBattles] =
      await this.userBattlesService.findUserBattleLogs(id, type, mode, season);

    return {
      userRecentBattles: userRecentBattles,
      userRecentBrawlers: userRecentBrawlers,
      userBattles: userBattles,
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
    await this.userBattlesService.getUserBattles({ userID: id, cycle: false });
  }
}
