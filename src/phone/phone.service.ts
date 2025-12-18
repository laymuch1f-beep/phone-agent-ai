import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

// ⭐ ABSOLUTE BULLETPROOF IMPORT - No TypeScript issues
let WebSocket: any;

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY!;
  private sockets = new Map<string, any>();

  constructor() {
    // ⭐ Dynamically require at runtime
    WebSocket = require('ws');
  }

  private get authHeader() {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  async acceptCall(callId: string, opts?: { instructions?: string; model?: string }) {
    const body = {
      type: 'realtime',
      model: opts?.model || 'gpt-realtime',
      output_modalities: ['audio'],
      audio: {
        input: { format: 'pcm16', turn_detection: { type: 'semantic_vad', create_response: true } },
        output: { format: 'g711_ulaw', voice: 'coral', speed: 1.0 },
      },
      instructions: opts?.instructions || `Hello! Thanks for calling our restaurant. How can I help you today?`,
    };

    try {
      const response = await axios.post(
        `https://api.openai.com/v1/realtime/calls/${callId}/accept`,
        body,
        { headers: { ...this.authHeader, 'Content-Type': 'application/json' } },
      );
      this.logger.log(`✅ Call ${callId} accepted`);
      return response.data;
    } catch (e: any) {
      this.logger.error(`❌ Error:`, e.message);
      throw e;
    }
  }

  async connect(callId: string) {
    const url = `wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(callId)}`;

    // ⭐ WebSocket is now guaranteed to be defined
    const ws = new WebSocket(url, {
      headers: this.authHeader,
    });

    this.sockets.set(callId, ws);

    ws.on('open', () => {
      this.logger.log(`✅ WebSocket OPEN for ${callId}`);
      // No greeting needed - OpenAI handles it
    });

    ws.on('message', (data: any) => {
      this.logger.debug(`📨 Message from ${callId}:`, data.toString());
    });

    ws.on('close', () => {
      this.logger.log(`🔌 WebSocket CLOSED for ${callId}`);
      this.sockets.delete(callId);
    });

    ws.on('error', (err: any) => {
      this.logger.error(`❌ WebSocket ERROR:`, err.message);
    });
  }

  async handleIncomingCall(callId: string) {
    this.logger.log(`📞 Handling call: ${callId}`);
    
    await this.acceptCall(callId);
    
    setImmediate(() => {
      this.connect(callId).catch((e: any) =>
        this.logger.error(`❌ WebSocket failed:`, e.message)
      );
    });

    return {
      control: {
        action: 'accept',
        parameters: {
          voice: 'coral',
          instructions: `You are a friendly restaurant assistant. Greet callers warmly and help with reservations, menu questions, or hours.`,
          turn_detection: { type: 'server_vad' }
        }
      }
    };
  }

  async terminateCall(callId: string) {
    try {
      await axios.post(
        `https://api.openai.com/v1/realtime/calls/${callId}/hangup`,
        null,
        { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' } },
      );
      this.logger.log(`✅ Call ${callId} terminated`);
      return { ok: true };
    } catch (e: any) {
      this.logger.error(`❌ Hangup failed:`, e.message);
      return { ok: false, error: e.message };
    }
  }

  close(callId: string) {
    const sock = this.sockets.get(callId);
    if (sock && sock.readyState === 1) sock.close(1000, 'done');
    this.sockets.delete(callId);
  }
}