import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  console.log('🚀 Starting Phone Agent application...');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Basic middleware
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    
    // Enable CORS
    app.enableCors();
    
    const port = process.env.PORT || 3000;
    
    console.log(`📡 Starting server on port ${port}...`);
    
    await app.listen(port, '0.0.0.0');
    
    console.log(`✅ Application running on port: ${port}`);
    console.log(`🌐 Health: http://0.0.0.0:${port}/health`);
    console.log(`🎯 Ready: http://0.0.0.0:${port}/ready`);
    console.log(`📞 Webhook: http://0.0.0.0:${port}/incoming-call`);
    
  } catch (error: any) {
    console.error('💥 Failed to start application:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Handle process errors
process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

bootstrap();