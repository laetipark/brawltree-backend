export class CreateUserBattlesDto {
  userID: string;
  playerID: string;
  brawlerID: string;
  matchDate: Date;
  mapID: string;
  modeCode: number;
  matchType: number;
  matchTypeRaw: number;
  matchGrade: number;
  duration: number;
  matchRank: number;
  matchResult: number;
  matchChange: number;
  matchChangeRaw: number;
  playerName: string;
  teamNumber: number;
  isStarPlayer: boolean;
  brawlerPower: number;
  brawlerTrophies: number;
}
