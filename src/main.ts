import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  console.log('🚀 Starting Phone Agent application...');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    bodyParser: false, // Disable default to handle raw body
  });
  
  // ✅ Handle Twilio's application/x-www-form-urlencoded format
  app.use(urlencoded({
    extended: true,
    verify: (req: any, res, buf) => {
      if (req.originalUrl === '/webhook' || req.originalUrl === '/incoming-call') {
        req.rawBody = buf;
        console.log(`📦 Received Twilio webhook for ${req.originalUrl}`);
      }
    },
    limit: '10mb'
  }));
  
  // Also handle JSON for OpenAI
  app.use(json({
    verify: (req: any, res, buf) => {
      if (req.originalUrl === '/webhook') {
        req.rawBody = buf;
      }
    },
    limit: '10mb'
  }));
  
  // Enable CORS
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`✅ Application running on port: ${port}`);
  console.log(`📞 Webhook endpoints ready:`);
  console.log(`   - POST /incoming-call  (for Twilio)`);
  console.log(`   - POST /webhook        (for OpenAI)`);
  console.log(`   - GET  /health`);
  
  // Log the public URL
  const publicUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 
                   process.env.RAILWAY_STATIC_URL || 
                   `http://localhost:${port}`;
  console.log(`🌐 Public URL: ${publicUrl}`);
  console.log(`📱 Twilio Webhook should be: ${publicUrl}/incoming-call`);
}

bootstrap();