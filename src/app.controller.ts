import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { OpenAI } from 'openai';
import { Request } from 'express';
import { PhoneService } from './phone/phone.service';
import { AIService } from './ai/ai.service';
import { InternetSearchService } from './search/search.service';
import { DomainService } from './domain/domain.service';
import { VoiceRecognitionService } from './voice/voice.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly phoneService: PhoneService,
    private readonly aiService: AIService,
    private readonly searchService: InternetSearchService,
    private readonly domainService: DomainService,
    private readonly voiceService: VoiceRecognitionService,
  ) {}
  private readonly client = new OpenAI();
  private readonly webhookSecret = process.env.OPENAI_WEBHOOK_VERIFICATION_KEY;

  @Get()
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'phone-agent',
    };
  }

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: RawBodyRequest<Request>) {
    console.log('📞 Webhook received at:', new Date().toISOString());
    
    try {
      const event = await this.client.webhooks.unwrap(
        req.rawBody!.toString(),
        req.headers,
        this.webhookSecret!,
      );

      console.log('✅ Webhook verified, event type:', event.type);

      if (event.type === 'realtime.call.incoming' && event?.data?.call_id) {
        console.log('📱 Incoming call ID:', event.data.call_id);
        return this.phoneService.handleIncomingCall(event.data.call_id);
      }

      return 'pong';
    } catch (e) {
      console.error('❌ Webhook error:', e);
      if (e instanceof OpenAI.InvalidWebhookSignatureError) {
        throw new UnauthorizedException('Invalid signature');
      } else {
        throw new BadRequestException(e.message);
      }
    }
  }

  @Get('/search/:query')
  async search(@Param('query') query: string) {
    console.log(`🔍 Search endpoint - Query: ${query}`);
    const results = await this.searchService.search(query, 5);
    return {
      query,
      resultsCount: results.length,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/search')
  @HttpCode(200)
  async searchPost(@Body() body: { query: string; maxResults?: number }) {
    console.log(`🔍 POST Search - Query: ${body.query}`);
    const results = await this.searchService.search(body.query, body.maxResults || 5);
    return {
      query: body.query,
      resultsCount: results.length,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/domain/check/:domain')
  async checkDomain(@Param('domain') domain: string) {
    console.log(`🌐 Domain check - Domain: ${domain}`);
    const availability = await this.domainService.checkDomainAvailability(domain);
    const quote = availability.available ? await this.domainService.getDomainQuote(domain) : null;
    return {
      ...availability,
      quote,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/domain/check')
  @HttpCode(200)
  async checkDomainPost(@Body() body: { domain: string }) {
    console.log(`🌐 Domain check - Domain: ${body.domain}`);
    const availability = await this.domainService.checkDomainAvailability(body.domain);
    const quote = availability.available ? await this.domainService.getDomainQuote(body.domain) : null;
    return {
      ...availability,
      quote,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/domain/suggest/:keyword')
  async suggestDomains(@Param('keyword') keyword: string) {
    console.log(`💡 Domain suggestions - Keyword: ${keyword}`);
    const suggestions = await this.domainService.getDomainSuggestions(keyword);
    return {
      keyword,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/voice/quality')
  async getVoiceQualityParams() {
    const params = this.voiceService.getOptimalVoiceParameters();
    return {
      ...params,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/voice/analyze')
  @HttpCode(200)
  async analyzeVoice(@Body() body: { transcription: string; audioMetrics?: any }) {
    console.log(`🎤 Voice analysis - Transcription: ${body.transcription.substring(0, 50)}...`);
    const analysis = this.voiceService.analyzeSpeech(body.transcription, body.audioMetrics);
    const report = this.voiceService.generateQualityReport(analysis);
    return {
      analysis,
      report,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/conversation/:callId')
  async getConversation(@Param('callId') callId: string) {
    console.log(`💬 Retrieving conversation - Call ID: ${callId}`);
    const memory = this.aiService.getMemory(callId);
    if (!memory) {
      throw new BadRequestException(`No conversation found for call ID: ${callId}`);
    }
    return {
      callId,
      summary: this.aiService.getConversationSummary(callId),
      memory,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/conversation/:callId/message')
  @HttpCode(200)
  async addConversationMessage(
    @Param('callId') callId: string,
    @Body() body: { role: 'user' | 'assistant'; content: string },
  ) {
    console.log(`💬 Adding message to conversation - Call ID: ${callId}`);
    this.aiService.addConversationTurn(callId, body.role, body.content);
    const memory = this.aiService.getMemory(callId);
    return {
      callId,
      messageAdded: true,
      memory,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/conversation/:callId/summary')
  async getConversationSummary(@Param('callId') callId: string) {
    console.log(`📋 Getting conversation summary - Call ID: ${callId}`);
    const summary = this.aiService.getConversationSummary(callId);
    if (!summary) {
      throw new BadRequestException(`No conversation found for call ID: ${callId}`);
    }
    return {
      callId,
      summary,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/conversation/:callId/context')
  @HttpCode(200)
  async updateConversationContext(
    @Param('callId') callId: string,
    @Body() body: Record<string, any>,
  ) {
    console.log(`🔧 Updating conversation context - Call ID: ${callId}`);
    this.aiService.updateContext(callId, body);
    const memory = this.aiService.getMemory(callId);
    return {
      callId,
      contextUpdated: true,
      memory,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('/conversation/:callId')
  @HttpCode(200)
  async deleteConversation(@Param('callId') callId: string) {
    console.log(`🗑️ Deleting conversation - Call ID: ${callId}`);
    this.aiService.clearMemory(callId);
    return {
      callId,
      deleted: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/status')
  async getServiceStatus() {
    return {
      status: 'operational',
      services: {
        phoneAgent: 'active',
        aiConversation: 'active',
        internetSearch: 'active',
        domainCheck: 'active',
        voiceRecognition: 'active',
      },
      timestamp: new Date().toISOString(),
    };
  }
}