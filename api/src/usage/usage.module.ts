import { Module } from '@nestjs/common'
import { UsageController } from './usage.controller'
import { UsageService } from './usage.service'
import { SupabaseClientProvider } from '../supabase.provider'

@Module({
  controllers: [UsageController],
  providers: [SupabaseClientProvider, UsageService],
})
export class UsageModule {}
