/** Admin view of the SMTP configuration. The password is never returned —
 * only whether one is stored (`passwordSet`). All SMTP fields are nullable:
 * a blank value falls back to the backend's env-configured spring.mail.*
 * defaults, so `configured` reflects the *effective* state, not just this row. */
export interface EmailSettings {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsername: string | null;
  passwordSet: boolean;
  senderName: string | null;
  senderEmail: string | null;
  useTls: boolean;
  useSsl: boolean;
  configured: boolean;
}

/** A blank/undefined `smtpPassword` keeps the currently stored one. */
export interface UpdateEmailSettingsRequest {
  smtpHost?: string;
  smtpPort: number;
  smtpUsername?: string;
  smtpPassword?: string;
  senderName?: string;
  senderEmail?: string;
  useTls: boolean;
  useSsl: boolean;
}

export interface SendTestEmailRequest {
  recipient: string;
}
