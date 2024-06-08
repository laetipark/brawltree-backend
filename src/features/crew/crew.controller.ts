import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';

import { CrewService } from './crew.service';
import { FailureResponseEnum } from '../../common/enums/failure-response.enum';

@Controller('crew')
export class CrewController {
  constructor(private crewService: CrewService) {}

  @Get('/main')
  async selectMain() {
    const [brawlersTL, brawlersPL] =
      await this.crewService.selectBrawlerSummary();

    return {
      members: await this.crewService.selectMembersSummary(),
      battles: await this.crewService.selectBattlesSummary(),
      season: await this.crewService.selectSeasonSummary(),
      brawlersTL: brawlersTL,
      brawlersPL: brawlersPL,
    };
  }

  @Get('/members')
  async selectMembersTable() {
    return await this.crewService.selectMemberTable();
  }

  @Get('/brawlers')
  async selectBrawlersTable(@Query('brawler') brawler: string) {
    return await this.crewService.findBrawlerTable(brawler);
  }

  @Get('/battles')
  async selectBattlesTable(
    @Query('date') date: Date,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);
    const { rotationTL, rotationPL } = this.crewService.getModes();
    const season = await this.crewService.getSeason();

    return {
      rotationTL: await rotationTL,
      rotationPL: await rotationPL,
      members: await this.crewService.selectBattlesTable(
        date,
        nextDate,
        type,
        mode,
      ),
      season: season,
    };
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string) {
    const isPatch = await this.crewService.updateCrewMember(id);

    if (!isPatch) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`,
      );
    }

    return {
      friends: await this.crewService.selectMemberFriends(id),
      seasonRecords: await this.crewService.selectMemberSeason(id),
    };
  }
}
