"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type EntityType = 'home' | 'society' | 'industry'

export const ENTITY_LIMITS = {
  home: {
    daily: 500,
    monthly: 15000,
    label: 'Home',
    description: 'Residential household',
    icon: 'home',
  },
  society: {
    daily: 5000,
    monthly: 150000,
    label: 'Society',
    description: 'Housing society/complex',
    icon: 'apartment',
  },
  industry: {
    daily: 20000,
    monthly: 600000,
    label: 'Industry',
    description: 'Industrial facility',
    icon: 'factory',
  },
} as const

export const ALERT_THRESHOLDS = {
  normal: { max: 80, color: 'emerald', label: 'Normal', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  warning: { min: 80, max: 100, color: 'amber', label: 'Warning', bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  critical: { min: 100, color: 'red', label: 'Critical', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' },
} as const

export function getAlertLevel(percent: number) {
  if (percent >= 100) return ALERT_THRESHOLDS.critical
  if (percent >= 80) return ALERT_THRESHOLDS.warning
  return ALERT_THRESHOLDS.normal
}

export function formatWaterAmount(amount: number, entityType: EntityType = 'home'): string {
  if (entityType === 'industry' && amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k L`
  }
  return `${amount.toFixed(0)} L`
}

type EntityLimits = {
  daily: number
  monthly: number
  label: string
  description: string
  icon: string
}

interface EntityContextType {
  entityType: EntityType
  setEntityType: (type: EntityType) => void
  limits: EntityLimits
  formatAmount: (amount: number) => string
}

const EntityContext = createContext<EntityContextType | null>(null)

export function EntityProvider({ children }: { children: ReactNode }) {
  const [entityType, setEntityType] = useState<EntityType>('home')
  
  const limits = ENTITY_LIMITS[entityType]
  
  const formatAmount = useCallback((amount: number) => {
    return formatWaterAmount(amount, entityType)
  }, [entityType])

  return (
    <EntityContext.Provider value={{ entityType, setEntityType, limits, formatAmount }}>
      {children}
    </EntityContext.Provider>
  )
}

export function useEntity() {
  const context = useContext(EntityContext)
  if (!context) {
    throw new Error('useEntity must be used within EntityProvider')
  }
  return context
}

export function useEntityLimits(entityType: EntityType = 'home') {
  return ENTITY_LIMITS[entityType]
}
