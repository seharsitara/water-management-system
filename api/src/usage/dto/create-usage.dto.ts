export type EntityType = 'home' | 'society' | 'industry'

export class CreateUsageDto {
  date?: string
  usageType: string
  amount: number
  notes?: string
  duration?: number
  entityType?: EntityType  // home, society, or industry
  entityName?: string      // House A, Block B, Factory 1, etc.
}
