import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  console.log('🚀 Starting Phone Agent application...');
  console.log('📋 Environment:', process.env.NODE_ENV || 'development');
  
  try {
    const app = await NestFactory.create(AppModule, {
      rawBody: true,
      logger: ['error', 'warn', 'log']
    });
    
    const port = process.env.PORT || 8080;
    console.log(`📡 Will listen on port: ${port}`);
    
    // Add request logging middleware with proper typing
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
    
    await app.listen(port, '0.0.0.0');
    
    console.log(`✅ Application started successfully on port ${port}`);
    console.log(`🌐 Health check: http://0.0.0.0:${port}/`);
    console.log(`🌐 Hello endpoint: http://0.0.0.0:${port}/hello`);
    console.log(`🌐 Webhook: http://0.0.0.0:${port}/webhook`);
    console.log('🔔 READY: Application is ready to receive requests');
    
  } catch (error) {
    console.error('💥 CRITICAL: Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();