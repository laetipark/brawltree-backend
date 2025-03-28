import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '~/utils/services/app-config.service';
import { URLService } from '~/utils/services/url.service';

@Injectable()
export class NewsService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly httpService: HttpService,
    private readonly urlService: URLService
  ) {}

  /** 사용자 ID를 통한 사용자 정보 변경 및 결과 반환
   * @param region
   */
  async getNews(region: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`/data/${region}/news/content.json`, {
          baseURL: this.configService.getNewsUrl(),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const newsResponse = res.data.articles || [];
      if (newsResponse.length < 1) {
        return newsResponse;
      }

      return newsResponse.map((item: any) => {
        let category: string;

        if (item.categories?.length) {
          switch (item.categories[0].title) {
            case '새 소식':
            case 'Release Notes':
              category = 'release-notes';
              break;
            case '뉴스':
            case 'News':
              category = 'news';
              break;
            case '커뮤니티':
            case 'Community':
              category = 'community';
              break;
            case '이스포츠':
            case 'Esports':
              category = 'esports';
              break;
          }
        }

        return {
          id: item.id,
          type: item.type,
          category: category,
          title: item.title,
          thumbnailPath: item.thumbnail.largeRetina.path,
          postDate: item.postDate,
          url: item.url || item.embed?.url || null
        };
      });
    } catch (error) {
      Logger.error(error, 'getNews');
    }

    return null;
  }

  /** 사용자 ID를 통한 사용자 정보 변경 및 결과 반환
   * @param region
   * @param title
   */
  async getNewsItem(region: string, title: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`/data/${region}/news/content.json`, {
          baseURL: this.configService.getNewsUrl(),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const newsResponse = res.data.articles || [];
      if (newsResponse.length < 1) {
        return newsResponse;
      }

      const newsItem = newsResponse.find(
        (item: any) => this.urlService.transformString(item.title) === title
      );

      return {
        title: newsItem.title,
        details: newsItem.details
      };
    } catch (error) {
      Logger.error(error, 'getNews');
    }

    return null;
  }
}
