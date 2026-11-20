import { sql } from "kysely";

import type {
  AddManyInput,
  AddManyOutput,
  ClaimInput,
  ClaimOutput,
  RecordFailureInput,
  RecordFailureOutput,
  RemoveInput,
  RemoveOutput,
} from "../../types/pending_video_images";
import { resolveDatabase, useDatabase } from "../database";

export async function add_many({ video_ids, options }: AddManyInput): Promise<AddManyOutput> {
  const database = resolveDatabase(options);

  if (video_ids.length === 0) {
    return;
  }

  await database
    .insertInto("pending_video_images")
    .values(video_ids.map((video_id) => ({ video_id })))
    .onConflict((oc) => oc.column("video_id").doNothing())
    .execute();
}

export async function claim({ limit, lease_seconds }: ClaimInput): Promise<ClaimOutput> {
  return useDatabase()
    .with("claimed", (db) =>
      db
        .updateTable("pending_video_images")
        .set({ next_attempt_at: sql<string>`now() + make_interval(secs => ${lease_seconds})` })
        .where("video_id", "in", (eb) =>
          eb
            .selectFrom("pending_video_images")
            .select("video_id")
            .where("next_attempt_at", "<=", sql<string>`now()`)
            .orderBy("next_attempt_at")
            .limit(limit)
            .forUpdate()
            .skipLocked(),
        )
        .returning(["video_id", "attempts"]),
    )
    .selectFrom("claimed")
    .innerJoin("videos", "videos.id", "claimed.video_id")
    .select([
      "videos.id",
      "videos.service",
      "videos.service_id",
      "videos.subscription_id",
      "videos.thumbnail_small",
      "videos.ready_at",
      "claimed.attempts",
    ])
    .execute();
}

export async function remove({ video_id, options }: RemoveInput): Promise<RemoveOutput> {
  const database = resolveDatabase(options);

  await database.deleteFrom("pending_video_images").where("video_id", "=", video_id).execute();
}

export async function record_failure({
  video_id,
  next_attempt_at,
}: RecordFailureInput): Promise<RecordFailureOutput> {
  await useDatabase()
    .updateTable("pending_video_images")
    .set((eb) => ({ next_attempt_at, attempts: eb("attempts", "+", 1) }))
    .where("video_id", "=", video_id)
    .execute();
}
