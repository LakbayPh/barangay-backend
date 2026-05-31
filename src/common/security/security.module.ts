import { Module } from '@nestjs/common';
import { SensitiveDataService } from './sensitive-data.service';

@Module({
  providers: [SensitiveDataService],
  exports: [SensitiveDataService],
})
export class SecurityModule {}
