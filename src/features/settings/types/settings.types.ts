export interface SystemSettings {
  applicationName: string;
  institutionName: string;
  logoPath: string | null;
  primaryColorHex: string;
  secondaryColorHex: string;
  accentColorHex: string;
  timezone: string;
  dateFormat: string;
  maxFileSizeMb: number;
  allowedFileTypes: string;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireDigit: boolean;
  passwordRequireSpecial: boolean;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  certificateEnabled: boolean;
  exportEnabled: boolean;
}

export type UpdateSystemSettingsRequest = Omit<SystemSettings, 'logoPath'> & { logoPath?: string };

export interface PublicSettings {
  applicationName: string;
  institutionName: string;
  logoPath: string | null;
  primaryColorHex: string;
  secondaryColorHex: string;
  accentColorHex: string;
  maintenanceMode: boolean;
}
