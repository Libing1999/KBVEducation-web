export interface AuditTrailEntry {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditTrailQuery {
  actorId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
