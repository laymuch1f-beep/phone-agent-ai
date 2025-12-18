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
  @HttpCode(200)
  healthCheck(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  @Get('ready')
  @HttpCode(200)
  readinessCheck(): { status: string; checks: any } {
    const checks = {
      app: 'running',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      env: {
        port: process.env.PORT || '3000',
        nodeEnv: process.env.NODE_ENV || 'development',
        openaiKey: process.env.OPENAI_API_KEY ? 'set' : 'not set',
        twilioSid: process.env.TWILIO_ACCOUNT_SID ? 'set' : 'not set',
        railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN || 'not set',
      }
    };
    
    return {
      status: 'ready',
      checks
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
    console.log('📱 CallStatus:', body.CallStatus);

    // Get Railway public URL
    let baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 
                 process.env.RAILWAY_STATIC_URL;
    
    if (!baseUrl) {
      // Fallback to request host
      const host = req.get('host');
      const protocol = req.protocol;
      baseUrl = `${protocol}://${host}`;
    }
    
    // Clean the URL for WebSocket
    const cleanUrl = baseUrl.replace(/^https?:\/\//, '');
    
    console.log('🌐 Base URL:', baseUrl);
    console.log('🔗 WebSocket URL: wss://' + cleanUrl + '/media-stream');

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! Connecting you to the AI assistant now.</Say>
  <Connect>
    <Stream url="wss://${cleanUrl}/media-stream">
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
    console.log('🤖 OpenAI webhook received');
    
    // Simple response for OpenAI Realtime API
    if (body.type === 'realtime.call.incoming') {
      const callId = body.data?.call_id || body.data?.id;
      console.log(`📞 OpenAI call detected: ${callId}`);
      
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
    
    return { 
      received: true, 
      message: 'Webhook processed',
      timestamp: new Date().toISOString()
    };
  }

  @Post('status-callback')
  @HttpCode(200)
  handleStatusCallback(@Body() body: any): any {
    console.log('📊 Twilio status callback:', {
      callSid: body.CallSid,
      status: body.CallStatus,
      direction: body.Direction,
      timestamp: new Date().toISOString()
    });
    
    return { 
      received: true,
      processed: true,
      timestamp: new Date().toISOString()
    };
  }

  @Get('test')
  testEndpoint(): { 
    message: string; 
    timestamp: string; 
    endpoints: string[];
    env: any 
  } {
    return {
      message: 'API is working',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/health - Health check',
        '/ready - Readiness check',
        '/incoming-call - Twilio webhook (POST)',
        '/webhook - OpenAI webhook (POST)',
        '/status-callback - Twilio status (POST)',
        '/test - Test endpoint'
      ],
      env: {
        port: process.env.PORT || '3000',
        nodeEnv: process.env.NODE_ENV || 'development',
        railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost',
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
      }
    };
  }

  @Post('test-call')
  @HttpCode(200)
  testCallSimulation(
    @Res() res: Response,
  ): void {
    console.log('🧪 Testing Twilio call simulation');
    
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:3000';
    const cleanUrl = baseUrl.replace(/^https?:\/\//, '');
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Test successful! Your webhook is working correctly.</Say>
  <Connect>
    <Stream url="wss://${cleanUrl}/media-stream">
      <Parameter name="callSid" value="test_${Date.now()}" />
      <Parameter name="from" value="+15551234567" />
      <Parameter name="to" value="+15557654321" />
    </Stream>
  </Connect>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  }
}