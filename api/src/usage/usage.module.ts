import { Module } from '@nestjs/common'
import { UsageController } from './usage.controller'
import { UsageService } from './usage.service'
import { SupabaseClientProvider } from '../supabase.provider'
import { AuthModule } from '../auth/auth.module'  // need auth service for user validation

@Module({
  imports: [AuthModule],
  controllers: [UsageController],
  providers: [SupabaseClientProvider, UsageService],
})
export class UsageModule {}
