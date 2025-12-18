import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Starting Phone Agent application...');
  
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // This is important for webhook signature verification
  });
  
  // Enable CORS for Twilio and OpenAI webhooks
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`✅ Application running on port: ${port}`);
  console.log(`🌐 Health: http://0.0.0.0:${port}/health`);
  console.log(`📞 Webhook: http://0.0.0.0:${port}/webhook`);
  console.log(`📱 Incoming Call: http://0.0.0.0:${port}/incoming-call`);
}

bootstrap();