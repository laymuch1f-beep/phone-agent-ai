import { Module } from '@nestjs/common';
import { InternetSearchService } from './search.service';

@Module({
  exports: [InternetSearchService],
  providers: [InternetSearchService],
})
export class SearchModule {}
