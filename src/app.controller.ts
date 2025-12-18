import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  Req,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PhoneService } from './phone/phone.service';
import OpenAI from 'openai';

// Add RawBodyRequest interface
interface RawBodyRequest<T = any> extends Request {
  rawBody?: Buffer;
}

@Controller()
export class AppController {
  private readonly client: OpenAI;
  private readonly webhookSecret: string;

  constructor(private readonly phoneService: PhoneService) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.webhookSecret = process.env.OPENAI_WEBHOOK_VERIFICATION_KEY || '';
  }

  @Get()
  getHello(): string {
    return 'Realtime AI Phone Agent is running!';
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // Main webhook endpoint for both Twilio and OpenAI
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: RawBodyRequest<Request>): Promise<any> {
    console.log('📞 Webhook received at:', new Date().toISOString());

    const rawBody = req.rawBody!.toString();
    console.log('📞 Raw body (first 500 chars):', rawBody.substring(0, 500));

    try {
      const body = JSON.parse(rawBody);
      console.log('✅ Parsed as JSON');
      console.log('✅ JSON keys:', Object.keys(body));

      // Handle OpenAI Realtime API format
      if (body.type === 'realtime.call.incoming') {
        console.log('🤖 OPENAI REALTIME DETECTED - Event type:', body.type);

        // Get call ID from either field
        let callId = '';
        if (body.data && body.data.call_id) {
          callId = body.data.call_id;
        } else if (body.data && body.data.id) {
          callId = body.data.id;
        }

        if (callId) {
          console.log('📱 OpenAI call ID:', callId);
          console.log('🟢 Calling phoneService.handleIncomingCall()...');

          const result = await this.phoneService.handleIncomingCall(callId);
          console.log('✅ phoneService returned');
          return result;
        } else {
          console.error('❌ No call ID found in OpenAI event');
          console.error('❌ Data object:', body.data);
          return 'pong';
        }
      }

      // Handle Twilio format
      if (body.CallSid) {
        console.log('📱 TWILIO FORMAT - CallSid:', body.CallSid);
        console.log('📱 CallStatus:', body.CallStatus);

        if (body.CallStatus === 'ringing') {
          console.log('🟢 Twilio incoming call detected');
          console.log('🟢 Calling phoneService.handleIncomingCall()...');

          const result = await this.phoneService.handleIncomingCall(
            body.CallSid,
          );
          console.log('✅ phoneService returned');
          return result;
        }

        console.log('ℹ️ Twilio call with status:', body.CallStatus);
        return 'pong';
      }

      console.log('ℹ️ Unknown JSON format');
      return 'pong';
    } catch (jsonError) {
      // Not JSON - try OpenAI webhook verification
      const error = jsonError as Error;
      console.log('❌ Not valid JSON:', error.message);

      if (!this.webhookSecret) {
        console.error('❌ Missing OPENAI_WEBHOOK_VERIFICATION_KEY');
        throw new BadRequestException('Invalid webhook format');
      }

      try {
        const event = await this.client.webhooks.unwrap(
          rawBody,
          req.headers as Record<string, string>,
          this.webhookSecret,
        );

        console.log('✅ OpenAI webhook verified, type:', event.type);

        // Get call ID from unwrapped event
        let callId = '';
        if (event.data && typeof event.data === 'object') {
          const data = event.data as any;
          if (data.call_id) {
            callId = data.call_id;
          } else if (data.id) {
            callId = data.id;
          }
        }

        if (event.type === 'realtime.call.incoming' && callId) {
          const result = await this.phoneService.handleIncomingCall(callId);
          console.log('✅ phoneService returned');
          return result;
        }

        console.log('ℹ️ Non-call OpenAI event');
        return 'pong';
      } catch (openaiError) {
        const error = openaiError as Error;
        console.error('❌ OpenAI verification failed:', error.message);
        throw new BadRequestException('Invalid webhook format');
      }
    }
  }

  // Twilio incoming call webhook (TwiML response)
  @Post('incoming-call')
  @HttpCode(200)
  async handleIncomingCall(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    console.log('📞 Twilio incoming call webhook received');
    console.log('📱 CallSid:', body.CallSid);
    console.log('📱 From:', body.From);
    console.log('📱 To:', body.To);

    // Get the Railway URL from environment or construct it
    const baseUrl =
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.RAILWAY_STATIC_URL ||
      `${req.protocol}://${req.get('host')}`;

    const streamUrl = `wss://${baseUrl.replace(/^https?:\/\//, '')}/media-stream`;

    console.log('🔗 Stream URL:', streamUrl);

    // Return TwiML to connect the call to your WebSocket
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl}">
      <Parameter name="callSid" value="${body.CallSid}" />
      <Parameter name="from" value="${body.From}" />
      <Parameter name="to" value="${body.To}" />
    </Stream>
  </Connect>
</Response>`;

    console.log('✅ Sending TwiML response');
    res.type('text/xml');
    res.send(twiml);
  }

  // Alternative endpoint for testing
  @Get('test')
  async testEndpoint(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
    };
  }
}