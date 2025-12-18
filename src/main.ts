import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  
  // Use PORT from environment or default to 8080 (to match your logs)
  const port = process.env.PORT || 8080;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on port: ${port}`);
  console.log(`🌐 Accessible at: http://0.0.0.0:${port}`);
  console.log(`📋 Using PORT from env: ${process.env.PORT}`);
}
bootstrap();