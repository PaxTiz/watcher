import type {
  CredentialsType,
  PasskeyTransport,
  SessionLoginWith,
  SubscriptionType,
  VideoPalette,
} from "@watcher/common";
import type { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export type UserTable = {
  id: Generated<string>;

  name: string;

  is_onboarded: boolean;

  created_at: ColumnType<string, string | undefined, never>;

  last_login_at: ColumnType<string, string | undefined, never>;
};

export type SubscriptionTable = {
  id: Generated<string>;

  service_id: string;

  service: SubscriptionType;

  name: string;

  url: string;

  logo: string;

  logo_etag: string;

  last_synced_at: string;

  slug: ColumnType<string, string, never>;
};

export type CredentialTable = {
  service: CredentialsType;

  service_id: string;

  access_token: string;

  access_token_expires_at: Date;

  refresh_token: string;

  refresh_token_expires_at: Date | null;

  user_id: string;
};

export type VideoTable = {
  id: Generated<string>;

  service: SubscriptionType;

  service_id: string;

  subscription_id: string;

  title: string;

  description: string;

  duration: number;

  url: string;

  thumbnail_small: string;

  thumbnail_small_etag: string;

  // Generated the first time it's displayed: empty until then
  thumbnail_large: string;

  thumbnail_large_source: string;

  // jsonb: parsed on read, written as a JSON string
  palette: ColumnType<VideoPalette | null, string | null, string | null>;

  // Generated from the title and the description: tsvector, used through search_query()
  search: ColumnType<string, never, never>;

  created_at: string;

  last_synced_at: string;
};

export type UserSubscriptionTable = {
  user_id: string;

  subscription_id: string;

  is_favorite: ColumnType<boolean, boolean | undefined, boolean | undefined>;

  is_hidden: ColumnType<boolean, boolean | undefined, boolean | undefined>;
};

export type HiddenUsersVideosTable = {
  user_id: string;

  video_id: string;
};

export type VideosGuestsTable = {
  video_id: string;

  // Identifies a person whatever the way it's written ("@SuperYoutuber", "Super Youtuber")
  key: string;

  // As written in the title
  name: string;

  subscription_id: string | null;
};

export type UsersVideosProgressionTable = {
  user_id: string;

  video_id: string;

  progression: number;

  updated_at: ColumnType<string, string | undefined, string>;
};

export type PasskeyTable = {
  id: string;

  user_id: string;

  name: string;

  public_key: string;

  counter: number;

  backed_up: boolean;

  // jsonb: parsed on read, written as a JSON string
  transports: ColumnType<Array<PasskeyTransport>, string, string>;

  aaguid: string | null;

  created_at: ColumnType<string, string | undefined, never>;

  last_used_at: ColumnType<string | null, string | undefined, string>;
};

export type SessionTable = {
  id: Generated<string>;

  user_id: string;

  login_with: SessionLoginWith;

  login_with_id: string;

  user_agent: string | null;

  created_at: ColumnType<string, string | undefined, never>;

  expires_at: ColumnType<string, string, never>;

  last_seen_at: ColumnType<string, string | undefined, string>;

  authenticated_at: ColumnType<string, string | undefined, string>;
};

export type RateLimitTable = {
  type: string;

  key: string;

  attempts: number;

  expires_at: ColumnType<string, string, string>;
};

export type WebauthnChallengeTable = {
  id: string;

  challenge: string;

  expires_at: ColumnType<string, string, never>;
};

export type DatabaseInterface = {
  users: UserTable;
  sessions: SessionTable;
  passkeys: PasskeyTable;
  subscriptions: SubscriptionTable;
  user_subscriptions: UserSubscriptionTable;
  credentials: CredentialTable;
  videos: VideoTable;
  hidden_users_videos: HiddenUsersVideosTable;
  videos_guests: VideosGuestsTable;
  users_videos_progression: UsersVideosProgressionTable;
  rate_limits: RateLimitTable;
  webauthn_challenges: WebauthnChallengeTable;
};

export type DatabaseSchema = {
  [K in keyof DatabaseInterface]: Selectable<DatabaseInterface[K]>;
};

export type DatabaseSchemaInsert = {
  [K in keyof DatabaseInterface]: Insertable<DatabaseInterface[K]>;
};

export type DatabaseSchemaUpdate = {
  [K in keyof DatabaseInterface]: Updateable<DatabaseInterface[K]>;
};
