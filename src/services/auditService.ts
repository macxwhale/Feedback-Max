
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  user_id: string;
  organization_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  static async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const logEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        ip_address: entry.ip_address || 'unknown',
        user_agent: entry.user_agent || navigator?.userAgent || 'unknown'
      };

      // For now, just log to console. In production, you'd send to audit table
      console.log('AUDIT LOG:', logEntry);

      // You could also send to external logging service
      // await fetch('/api/audit-log', { method: 'POST', body: JSON.stringify(logEntry) });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  static async logPermissionCheck(
    userId: string,
    permission: string,
    organizationId?: string,
    allowed: boolean = false,
    reason?: string
  ): Promise<void> {
    await this.logAction({
      user_id: userId,
      organization_id: organizationId,
      action: allowed ? 'permission_granted' : 'permission_denied',
      resource_type: 'permission',
      resource_id: permission,
      details: { reason }
    });
  }

  static async logRoleChange(
    actorId: string,
    targetUserId: string,
    organizationId: string,
    oldRole: string,
    newRole: string
  ): Promise<void> {
    await this.logAction({
      user_id: actorId,
      organization_id: organizationId,
      action: 'role_changed',
      resource_type: 'user_role',
      resource_id: targetUserId,
      details: { old_role: oldRole, new_role: newRole }
    });
  }

  static async logUserInvite(
    inviterId: string,
    inviteeEmail: string,
    organizationId: string,
    role: string
  ): Promise<void> {
    await this.logAction({
      user_id: inviterId,
      organization_id: organizationId,
      action: 'user_invited',
      resource_type: 'organization_user',
      resource_id: inviteeEmail,
      details: { role }
    });
  }

  static async logUserRemoval(
    actorId: string,
    removedUserId: string,
    organizationId: string
  ): Promise<void> {
    await this.logAction({
      user_id: actorId,
      organization_id: organizationId,
      action: 'user_removed',
      resource_type: 'organization_user',
      resource_id: removedUserId
    });
  }
}
