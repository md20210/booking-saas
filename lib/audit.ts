import { prisma } from './db'
import * as Sentry from '@sentry/nextjs'

export interface AuditLogData {
  userId?: string
  action: string
  entity?: string
  entityId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    Sentry.captureException(error, {
      tags: { component: 'audit-log' },
      extra: { auditData: JSON.stringify(data) },
    })
  }
}

export async function getAuditLogs(userId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
