import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT'

export const SupabaseClientProvider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): SupabaseClient => {
    const url = config.get<string>('SUPABASE_URL')
    const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) {
      throw new Error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    }
    return createClient(url, key)
  },
}
