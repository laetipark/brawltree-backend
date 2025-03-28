import { Controller, Get, Param } from '@nestjs/common';

import { CrewService } from './crew.service';

import { SelectUserFriendDto } from '~/crew/dto/select-user-friend.dto';
import { SelectUserSeasonDto } from '~/crew/dto/select-user-season.dto';

@Controller('crew')
export class CrewController {
  constructor(private crewService: CrewService) {}

  @Get('/members')
  async selectMembersTable() {
    return await this.crewService.selectMemberTable();
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string): Promise<{
    friendList: {
      friends: SelectUserFriendDto[];
      friendsUpdatedAt: Date;
    };
    seasonList: SelectUserSeasonDto[];
  }> {
    const { friendList } = await this.crewService.selectMemberFriends(id);
    return {
      friendList,
      seasonList: await this.crewService.selectMemberSeasons(id)
    };
  }
}
