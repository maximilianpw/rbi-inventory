import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [ClerkAuthGuard],
})
export class AuthModule {}
