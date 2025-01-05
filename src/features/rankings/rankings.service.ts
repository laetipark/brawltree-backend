import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '~/utils/services/app-config.service';

@Injectable()
export class RankingsService{
  constructor(
    private readonly configService:AppConfigService,
    private readonly httpService:HttpService
  ){}

  /** 사용자 ID를 통한 사용자 정보 변경 및 결과 반환
   * @param url
   */
  async getRankingsFromAPI(url:string){
    try{
      const res = await firstValueFrom(
        this.httpService.get(`api/data?query=${url}`, {
          baseURL:this.configService.getAPIUrl(),
          headers:{
            'Content-Type':'application/json'
          }
        }));

      return res.data?.items || [];
    }catch(error){
      Logger.error(error, 'SelectUser');
    }

    return null;
  }
}
