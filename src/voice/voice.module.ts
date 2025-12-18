import { Module } from '@nestjs/common';
import { VoiceRecognitionService } from './voice.service';

@Module({
  exports: [VoiceRecognitionService],
  providers: [VoiceRecognitionService],
})
export class VoiceModule {}
