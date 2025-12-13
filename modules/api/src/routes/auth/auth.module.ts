import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [ClerkAuthGuard],
})
export class AuthModule {}
