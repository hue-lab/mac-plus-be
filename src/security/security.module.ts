import { Global, Module } from '@nestjs/common';

import { SecurityController } from './security.controller';
import { PublicFormProtectionGuard } from './public-form-protection.guard';
import { PublicFormProtectionService } from './public-form-protection.service';

@Global()
@Module({
  controllers: [SecurityController],
  providers: [PublicFormProtectionGuard, PublicFormProtectionService],
  exports: [PublicFormProtectionGuard, PublicFormProtectionService],
})
export class SecurityModule {}
