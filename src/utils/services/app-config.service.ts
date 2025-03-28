import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  async getTypeList() {
    return this.configService.get<number[]>('game.typeList');
  }

  /** api 주소 반환 */
  getAPIUrl(): string {
    return this.configService.get<string>('axios.apiURL');
  }

  /** api 주소 반환 */
  getNewsUrl(): string {
    return this.configService.get<string>('axios.newsURL');
  }
}
