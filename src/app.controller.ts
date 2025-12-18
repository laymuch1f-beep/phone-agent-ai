import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  Req,
  Get,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Controller()
export class AppController {
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

  @Post('incoming-call')
  @HttpCode(200)
  handleIncomingCall(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ): void {
    console.log('📞 ========== TWILIO INCOMING CALL ==========');
    console.log('📱 CallSid:', body.CallSid);
    console.log('📱 From:', body.From);
    console.log('📱 To:', body.To);

    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 
                   process.env.RAILWAY_STATIC_URL ||
                   `${req.protocol}://${req.get('host')}`;
    
    console.log('🌐 Base URL:', baseUrl);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! Connecting you to the AI assistant now.</Say>
  <Connect>
    <Stream url="wss://${baseUrl.replace(/^https?:\/\//, '')}/media-stream">
      <Parameter name="callSid" value="${body.CallSid}" />
      <Parameter name="from" value="${body.From}" />
      <Parameter name="to" value="${body.To}" />
    </Stream>
  </Connect>
</Response>`;

    console.log('✅ Sending TwiML response to Twilio');
    
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleOpenAIWebhook(
    @Body() body: any,
  ): Promise<any> {
    console.log('🤖 OpenAI webhook received:', body.type);
    
    // Handle OpenAI Realtime API webhook
    if (body.type === 'realtime.call.incoming') {
      const callId = body.data?.call_id || body.data?.id;
      console.log(`📞 OpenAI call ID: ${callId}`);
      
      // Return acceptance response for OpenAI
      return {
        control: {
          action: 'accept',
          parameters: {
            voice: 'alloy',
            instructions: 'Hello! I am an AI assistant. How can I help you today?',
            turn_detection: { type: 'server_vad' }
          }
        }
      };
    }
    
    return { received: true };
  }

  @Post('status-callback')
  @HttpCode(200)
  handleStatusCallback(@Body() body: any): any {
    console.log('📊 Twilio status:', body.CallStatus);
    console.log('📱 CallSid:', body.CallSid);
    
    return { received: true };
  }

  @Get('test-webhook')
  testWebhook(): { message: string; timestamp: string; env: any } {
    return {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      env: {
        openaiKeySet: !!process.env.OPENAI_API_KEY,
        twilioSidSet: !!process.env.TWILIO_ACCOUNT_SID,
        port: process.env.PORT,
        railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN,
      }
    };
  }
}