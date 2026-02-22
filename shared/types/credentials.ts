export type CredentialsType = "google" | "twitch";

export type ServiceCredentials = {
  service: CredentialsType;
  access_token: string;
  refresh_token: string;
  expires_at: string;
};
