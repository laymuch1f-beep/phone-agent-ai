import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AIService } from '../ai/ai.service';
import { InternetSearchService } from '../search/search.service';
import { DomainService } from '../domain/domain.service';
import { VoiceRecognitionService } from '../voice/voice.service';

// ⭐ ABSOLUTE BULLETPROOF IMPORT - No TypeScript issues
let WebSocket: any;

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
    // ⭐ Dynamically require at runtime
    WebSocket = require('ws');
  }

  private get authHeader() {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  async acceptCall(callId: string, opts?: { instructions?: string; model?: string }) {
    console.log('📞 [PhoneService.acceptCall] Starting...', { callId });
    
    // Get enhanced instructions using AI service
    const enhancedInstructions = await this.getEnhancedInstructions(
      callId,
      opts?.instructions || `Hello! Thanks for calling. How can I help you today?`,
    );

    const body = {
      type: 'realtime',
      model: opts?.model || 'gpt-4-realtime-preview-2024-12-17',
      output_modalities: ['audio'],
      audio: {
        input: { format: 'pcm16', turn_detection: { type: 'semantic_vad', create_response: true } },
        output: { format: 'g711_ulaw', voice: 'coral', speed: 1.0 },
      },
      instructions: enhancedInstructions,
    };

    try {
      console.log('📞 [PhoneService.acceptCall] Sending to OpenAI API...');
      const response = await axios.post(
        `https://api.openai.com/v1/realtime/calls/${callId}/accept`,
        body,
        { headers: { ...this.authHeader, 'Content-Type': 'application/json' } },
      );
      this.activeInstructions.set(callId, enhancedInstructions);
      console.log('✅ [PhoneService.acceptCall] Call accepted successfully');
      return response.data;
    } catch (e: any) {
      console.error('❌ [PhoneService.acceptCall] Error:', e.message);
      console.error('❌ [PhoneService.acceptCall] Full error:', e);
      throw e;
    }
  }

  /**
   * Get AI-enhanced instructions with all capabilities
   */
  private async getEnhancedInstructions(callId: string, baseInstructions: string): Promise<string> {
    console.log('🤖 [PhoneService.getEnhancedInstructions] Creating instructions...');
    
    this.aiService.initializeConversation(callId, {
      startTime: new Date(),
      capabilities: ['search', 'domain_check', 'voice_analysis'],
    });

    const instructions = `${baseInstructions}

IMPORTANT CAPABILITIES:
1. HUMAN-LIKE CONVERSATION: Engage naturally, show empathy, remember context from this conversation.
2. INTERNET SEARCH: When asked about current events, weather, news, or unknown information, mention you can search for real-time data.
3. DOMAIN ASSISTANCE: If caller asks about domain availability, registration, or suggestions, offer to check domain status.
4. VOICE ANALYSIS: Continuously monitor conversation sentiment and intent.
5. MEMORY: Remember all details shared in this conversation and reference them naturally.

INSTRUCTIONS:
- Be conversational and natural, like talking to a helpful friend
- Ask clarifying questions when needed
- Remember and reference information from earlier in the conversation
- Offer relevant services based on caller needs
- Provide accurate, helpful information
- Be professional but warm and friendly
- Handle multiple topics smoothly
- Keep responses concise for phone conversation`;

    console.log('✅ [PhoneService.getEnhancedInstructions] Instructions created');
    return instructions;
  }

  async connect(callId: string) {
    console.log('🔗 [PhoneService.connect] Connecting WebSocket...', { callId });
    const url = `wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(callId)}`;

    // ⭐ WebSocket is now guaranteed to be defined
    const ws = new WebSocket(url, {
      headers: this.authHeader,
    });

    this.sockets.set(callId, ws);

    ws.on('open', () => {
      console.log('✅ [PhoneService.connect] WebSocket OPEN for', callId);
      // No greeting needed - OpenAI handles it
    });

    ws.on('message', (data: any) => {
      console.log('📨 [PhoneService.connect] Message from', callId, ':', data.toString());
    });

    ws.on('close', () => {
      console.log('🔌 [PhoneService.connect] WebSocket CLOSED for', callId);
      this.sockets.delete(callId);
    });

    ws.on('error', (err: any) => {
      console.error('❌ [PhoneService.connect] WebSocket ERROR:', err.message);
      console.error('❌ [PhoneService.connect] Error details:', err);
    });
  }

  async handleIncomingCall(callId: string) {
    console.log('📱 [PhoneService.handleIncomingCall] STARTED for call:', callId);
    
    try {
      // Initialize AI conversation memory
      console.log('🤖 [PhoneService.handleIncomingCall] Initializing AI conversation...');
      this.aiService.initializeConversation(callId, {
        startTime: new Date(),
        callId,
        features: {
          searchEnabled: true,
          domainCheckEnabled: true,
          voiceAnalysisEnabled: true,
          memoryEnabled: true,
        },
      });
      
      console.log('📞 [PhoneService.handleIncomingCall] Accepting call...');
      await this.acceptCall(callId);
      
      console.log('🔗 [PhoneService.handleIncomingCall] Setting up WebSocket...');
      setImmediate(() => {
        this.connect(callId).catch((e: any) => {
          console.error('❌ [PhoneService.handleIncomingCall] WebSocket failed:', e.message);
          console.error('❌ [PhoneService.handleIncomingCall] WebSocket error stack:', e.stack);
        });
      });

      const result = {
        control: {
          action: 'accept',
          parameters: {
            voice: 'coral',
            instructions: await this.getEnhancedInstructions(
              callId,
              `Welcome! I'm an AI assistant with advanced capabilities. I can help you search for information, check domain availability, and more. How can I assist you today?`,
            ),
            turn_detection: { type: 'server_vad' }
          }
        }
      };

      console.log('✅ [PhoneService.handleIncomingCall] COMPLETED successfully');
      console.log('✅ [PhoneService.handleIncomingCall] Returning:', result);
      return result;
      
    } catch (error) {
      console.error('💥 [PhoneService.handleIncomingCall] ERROR:', error.message);
      console.error('💥 [PhoneService.handleIncomingCall] Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Search for information during call
   */
  async searchDuringCall(callId: string, query: string): Promise<string> {
    console.log(`🔍 [PhoneService.searchDuringCall] Searching for: "${query}" during call ${callId}`);
    
    const results = await this.searchService.getRelevantInfo(query, 3);
    
    // Update conversation context
    this.aiService.updateContext(callId, {
      lastSearch: query,
      searchResults: results,
      searchTime: new Date(),
    });

    return results;
  }

  /**
   * Check domain during call
   */
  async checkDomainDuringCall(callId: string, domain: string): Promise<string> {
    console.log(`🌐 [PhoneService.checkDomainDuringCall] Checking domain: "${domain}" during call ${callId}`);
    
    const summary = await this.domainService.getDomainSummary(domain);
    
    // Update conversation context
    this.aiService.updateContext(callId, {
      lastDomainCheck: domain,
      domainStatus: summary,
      domainCheckTime: new Date(),
    });

    return summary;
  }

  /**
   * Analyze voice during call
   */
  async analyzeVoiceDuringCall(
    callId: string,
    transcription: string,
    audioMetrics?: any,
  ): Promise<string> {
    console.log(`🎤 [PhoneService.analyzeVoiceDuringCall] Analyzing voice for call ${callId}`);
    
    const analysis = this.voiceService.analyzeSpeech(transcription, audioMetrics);
    const recommendations = this.voiceService.getVoiceRecommendations(analysis);
    
    // Update conversation context
    this.aiService.updateContext(callId, {
      lastAnalysis: analysis,
      voiceRecommendations: recommendations,
      sentiment: analysis.sentiment,
      intent: analysis.intent,
      analysisTime: new Date(),
    });

    console.log(`🎤 [PhoneService.analyzeVoiceDuringCall] Analysis - Intent: ${analysis.intent}, Sentiment: ${analysis.sentiment}`);
    
    if (recommendations.length > 0) {
      console.log(`🎤 [PhoneService.analyzeVoiceDuringCall] Recommendations: ${recommendations.join(', ')}`);
    }

    return JSON.stringify(analysis, null, 2);
  }

  /**
   * Get call summary
   */
  getCallSummary(callId: string): string {
    const memory = this.aiService.getMemory(callId);
    if (!memory) return 'No call data available';

    const summary = this.aiService.getConversationSummary(callId);
    const duration = new Date().getTime() - memory.startTime.getTime();
    const durationMinutes = (duration / 1000 / 60).toFixed(2);

    return `
=== CALL SUMMARY ===
Call ID: ${callId}
Duration: ${durationMinutes} minutes
Started: ${memory.startTime.toISOString()}

CONVERSATION:
${summary}

CONTEXT:
${JSON.stringify(memory.context, null, 2)}
    `;
  }

  async terminateCall(callId: string) {
    try {
      // Generate call summary
      const summary = this.getCallSummary(callId);
      console.log(`\n${summary}`);

      // Clean up conversation memory
      this.aiService.clearMemory(callId);
      this.activeInstructions.delete(callId);

      await axios.post(
        `https://api.openai.com/v1/realtime/calls/${callId}/hangup`,
        null,
        { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' } },
      );
      console.log(`✅ [PhoneService.terminateCall] Call ${callId} terminated`);
      return { ok: true, summary };
    } catch (e: any) {
      console.error(`❌ [PhoneService.terminateCall] Hangup failed:`, e.message);
      return { ok: false, error: e.message };
    }
  }

  close(callId: string) {
    const sock = this.sockets.get(callId);
    if (sock && sock.readyState === 1) sock.close(1000, 'done');
    this.sockets.delete(callId);
  }
}