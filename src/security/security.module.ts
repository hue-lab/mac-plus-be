import { Global, Module } from '@nestjs/common';

import { PublicFormProtectionGuard } from './public-form-protection.guard';
import { PublicFormProtectionService } from './public-form-protection.service';

@Global()
@Module({
  providers: [PublicFormProtectionGuard, PublicFormProtectionService],
  exports: [PublicFormProtectionGuard, PublicFormProtectionService],
})
export class SecurityModule {}
