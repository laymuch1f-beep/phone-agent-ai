import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';

@Module({
  exports: [DomainService],
  providers: [DomainService],
})
export class DomainModule {}
