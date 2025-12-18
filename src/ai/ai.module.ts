import { Module } from '@nestjs/common';
import { AIService } from './ai.service';

@Module({
  exports: [AIService],
  providers: [AIService],
})
export class AIModule {}
