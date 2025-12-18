import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AIService } from '../ai/ai.service';
import { InternetSearchService } from '../search/search.service';
import { DomainService } from '../domain/domain.service';
import { VoiceRecognitionService } from '../voice/voice.service';
import WebSocket from 'ws'; // ✅ Fixed import

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY!;
  private sockets = new Map<string, any>();
  private activeInstructions = new Map<string, string>();

  constructor(
    private readonly aiService: AIService,
    private readonly searchService: InternetSearchService,
    private readonly domainService: DomainService,
    private readonly voiceService: VoiceRecognitionService,
  ) {
    // WebSocket is already imported, no need for dynamic require
  }

  // ... rest of your existing code ...
}