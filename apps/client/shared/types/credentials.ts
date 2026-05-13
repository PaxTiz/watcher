export type CredentialsType = "google" | "twitch";

export type ServiceCredentials = {
  service: CredentialsType;

  service_id: string;

  userId: string;

  access_token: string;

  access_token_expires_at: Date;

  refresh_token: string;

  refresh_token_expires_at: Date;
};
