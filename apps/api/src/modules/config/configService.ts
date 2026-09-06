import { db } from '@dealflow360/db';
import { BusinessThresholds, DEFAULT_BUSINESS_THRESHOLDS } from '@dealflow360/domain';
import { recordAuditEvent } from '../../services/auditService.js';
import { JwtPayload } from '../../auth/token.js';

export class ConfigService {
  async getBusinessThresholds(): Promise<BusinessThresholds> {
    const config = await db.systemConfig.findUnique({
      where: { configKey: 'BUSINESS_THRESHOLDS' },
    });

    if (!config) {
      return DEFAULT_BUSINESS_THRESHOLDS;
    }

    return config.configValue as unknown as BusinessThresholds;
  }

  async updateBusinessThresholds(newThresholds: BusinessThresholds, actor: JwtPayload) {
    const updated = await db.systemConfig.upsert({
      where: { configKey: 'BUSINESS_THRESHOLDS' },
      update: { configValue: newThresholds as any },
      create: {
        id: 'default',
        configKey: 'BUSINESS_THRESHOLDS',
        configValue: newThresholds as any,
      },
    });

    // Record audit event
    await recordAuditEvent({
      eventType: 'SYSTEM_CONFIG_UPDATED',
      actor: { id: actor.sub, role: actor.role },
      entityType: 'SystemConfig',
      entityId: updated.id,
      metadata: { configKey: 'BUSINESS_THRESHOLDS', newValues: newThresholds },
    });

    return updated.configValue as unknown as BusinessThresholds;
  }
}
