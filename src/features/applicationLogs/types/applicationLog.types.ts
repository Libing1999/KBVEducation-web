export type LogSeverity = 'ERROR' | 'WARNING';

export interface ApplicationLogEntry {
  id: string;
  severity: LogSeverity;
  source: string;
  message: string | null;
  endpoint: string | null;
  httpMethod: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface ApplicationLogQuery {
  severity?: LogSeverity;
  page?: number;
  size?: number;
}
