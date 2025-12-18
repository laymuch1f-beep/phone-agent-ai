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
import { PhoneService } from './phone/phone.service';

@Controller()
export class AppController {
  constructor(private readonly phoneService: PhoneService) {}

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

  /**
   * ✅ CRITICAL: This is the endpoint Twilio calls when someone dials your number
   * Twilio sends application/x-www-form-urlencoded, not JSON!
   */
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
    console.log('📱 Direction:', body.Direction);
    console.log('📱 CallStatus:', body.CallStatus);

    // Get your Railway public URL
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 
                   process.env.RAILWAY_STATIC_URL ||
                   `${req.protocol}://${req.get('host')}`;
    
    console.log('🌐 Base URL:', baseUrl);

    // ✅ Generate proper TwiML response for Twilio
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
    console.log('📄 TwiML:', twiml);
    
    res.type('text/xml');
    res.send(twiml);
  }

  /**
   * Handle OpenAI webhooks (separate from Twilio)
   */
  @Post('webhook')
  @HttpCode(200)
  async handleOpenAIWebhook(
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    console.log('🤖 OpenAI webhook received');
    
    // Check if it's from OpenAI Realtime API
    if (body.type === 'realtime.call.incoming') {
      const callId = body.data?.call_id || body.data?.id;
      if (callId) {
        console.log(`📞 OpenAI Realtime call: ${callId}`);
        return await this.phoneService.handleIncomingCall(callId);
      }
    }
    
    return { received: true };
  }

  /**
   * Status callback for Twilio call events
   */
  @Post('status-callback')
  @HttpCode(200)
  handleStatusCallback(@Body() body: any): any {
    console.log('📊 Twilio status callback:', body.CallStatus);
    console.log('📱 CallSid:', body.CallSid);
    
    if (body.CallStatus === 'completed' || body.CallStatus === 'failed') {
      console.log(`📞 Call ${body.CallSid} ended with status: ${body.CallStatus}`);
      // Clean up resources if needed
    }
    
    return { received: true };
  }
}