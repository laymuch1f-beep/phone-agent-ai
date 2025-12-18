import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhoneModule } from './phone/phone.module';
import { AIModule } from './ai/ai.module';
import { SearchModule } from './search/search.module';
import { DomainModule } from './domain/domain.module';
import { VoiceModule } from './voice/voice.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PhoneModule, AIModule, SearchModule, DomainModule, VoiceModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
