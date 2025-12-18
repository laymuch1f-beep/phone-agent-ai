import { Module } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { AIModule } from '../ai/ai.module';
import { SearchModule } from '../search/search.module';
import { DomainModule } from '../domain/domain.module';
import { VoiceModule } from '../voice/voice.module';

@Module({
  imports: [AIModule, SearchModule, DomainModule, VoiceModule],
  exports: [PhoneService],
  providers: [PhoneService],
})
export class PhoneModule {}
