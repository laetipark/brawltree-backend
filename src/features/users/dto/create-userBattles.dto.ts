export class CreateUserBattlesDto {
  userID: string;
  playerID: string;
  brawlerID: string;
  battleTime: Date;
  mapID: string;
  modeCode: number;
  matchType: number;
  matchGrade: number;
  duration: number;
  gameRank: number;
  gameResult: number;
  trophyChange: number;
  duelsTrophyChange: number;
  playerName: string;
  teamNumber: number;
  isStarPlayer: boolean;
  brawlerPower: number;
  brawlerTrophies: number;
}
