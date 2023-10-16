import { Controller, Get, Param, Query } from '@nestjs/common';

import { BlossomService } from './blossom.service';
import { EventsService } from '~/maps/services/events.service';
import { SeasonsService } from '~/seasons/seasons.service';

@Controller('blossom')
export class BlossomController {
  constructor(
    private blossomService: BlossomService,
    private eventsService: EventsService,
    private seasonService: SeasonsService,
  ) {}

  @Get('/main')
  async selectMain() {
    const [brawlersTL, brawlersPL] =
      await this.blossomService.findBrawlerSummary();

    return {
      members: await this.blossomService.findMembersSummary(),
      battles: await this.blossomService.findBattlesSummary(),
      season: await this.blossomService.findSeasonSummary(),
      events: await this.eventsService.findRotationTLDaily(),
      brawlersTL: brawlersTL,
      brawlersPL: brawlersPL,
    };
  }

  @Get('/members')
  async selectMembersTable() {
    return await this.blossomService.findMemberTable();
  }

  @Get('/brawlers')
  async selectBrawlersTable(@Query('brawler') brawler: string) {
    return await this.blossomService.findBrawlerTable(brawler);
  }

  @Get('/battles')
  async selectBattlesTable(
    @Query('date') date: Date,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);

    return {
      rotationTL: await this.eventsService.findModeTL(),
      rotationPL: await this.eventsService.findModePL(),
      members: await this.blossomService.findBattlesTable(
        date,
        nextDate,
        type,
        mode,
      ),
      season: await this.seasonService.findSeason(),
    };
  }

  @Get('/season')
  async selectSeasonTable(
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    return {
      rotationTL: await this.eventsService.findModeTL(),
      rotationPL: await this.eventsService.findModePL(),
      members: await this.blossomService.findSeasonTable(type, mode),
    };
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string) {
    return {
      friends: await this.blossomService.findMemberFriends(id),
      seasonRecords: await this.blossomService.findMemberSeasonRecords(id),
    };
  }
}
