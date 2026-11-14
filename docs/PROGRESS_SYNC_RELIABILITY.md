# Progress synchronization reliability

## Behaviour

- Every student mutation that previously requested a Supabase write now queues a complete account-scoped state snapshot.
- The snapshot is written to `localStorage` before network I/O. If that write fails, the UI is explicitly told that local queue persistence could not be confirmed.
- Snapshots are coalesced for 350 ms, then synchronized through one idempotent full-snapshot operation.
- A successful server acknowledgement is the only condition that removes a queued snapshot.
- Failed writes remain queued indefinitely; retry uses exponential backoff, the browser `online` and `focus` events, a 30-second foreground check, and the explicit Retry action.
- A pending snapshot is restored and retried before remote hydration. If it remains pending, stale remote data is not allowed to overwrite it.
- Queue processing is scoped to the authenticated user. A queued snapshot for a signed-out account is never sent using another account's session.
- Account deletion attempts to drain the active queue before invoking the server deletion endpoint, then removes the local queue entry only after server confirmation.

## Tables covered by a full sync

- `profiles`
- `user_state` (excluding server-owned premium entitlement columns)
- `daily_challenges`
- `company_progress` (mock-score history only; `chapters` is never sent by browser clients)
- `mistakes`
- `drive_outcomes`

Mistakes and drive outcomes are upserted by their stable keys. Remote IDs are read before stale rows are deleted. If either read fails, synchronization fails and the snapshot remains queued; no destructive reconciliation is attempted without both successful reads.

## Operational requirements

- Supabase RLS must permit an authenticated user to select, insert/update, and delete only their own rows in the tables above.
- Keep the typed mistake migration (`0033_ensure_typed_mistake_answers.sql` in this source tree) applied before relying on typed-answer fields across devices.
- Do not clear `studybench.progress-sync-queue.v1` from browser storage to troubleshoot a sync issue. It may contain the only unacknowledged copy of recent progress.
- The queue is a browser durability mechanism, not a substitute for server-side backups, database point-in-time recovery, or cross-device conflict resolution.

## Known boundary

The application stores one latest snapshot per account and serializes requests within a browser tab. It is safe against retries, duplicate requests, refreshes, offline periods, and in-flight updates in the same tab. Concurrent edits from multiple devices/tabs still require a future server revision/merge strategy if the product needs conflict-free simultaneous editing.

## V11.5 correction: bounded snapshots and explicit deletions

The student client intentionally loads a bounded notebook (the latest 60 mistakes and 50 drive outcomes). Those lists are not complete replicas of the database. A full-state sync must therefore never infer that an older remote row was deleted merely because it is absent from the client snapshot.

V11.5 removes absence-based deletion reconciliation. Intentional destructive actions are now represented as durable operations in the per-user queue:

- deleting one mistake queues its question ID;
- clearing the notebook queues an explicit clear-all-mistakes operation;
- deleting one drive outcome queues its outcome ID;
- resetting the account's local learning state queues explicit clear-all operations for mistakes and drive outcomes.

These operations are merged into newer pending snapshots and remain queued until `syncAll` acknowledges the complete snapshot. If a deleted mistake is re-added before acknowledgement, its pending single-item deletion is removed from the merged queue. A bulk clear runs before the current local records are upserted, so records created after the clear are retained.

No database migration is required for this correction. It changes client-side sync semantics only. The Vitest regression suite includes queue-level coverage for operation retention, account isolation, legacy queue migration, acknowledgement, retry retention, and ensuring a bounded snapshot does not generate inferred deletion operations.


## V11.10 correction: restricted legacy progress writes and ordered card acknowledgement

- Browser sync updates only the `mock_scores` column in `company_progress`. It uses a column-scoped UPDATE and a separate INSERT fallback instead of UPSERT, because UPSERT requires UPDATE privileges on conflict-key columns. The protected `chapters` JSONB snapshot is never written by the browser.
- Lesson-card completion is acknowledged by `/api/learning/progress` before the learner can navigate to the next card. A failed or rejected save keeps the learner on the current card and displays the error; the client no longer races multiple sequential card submissions.
- The server continues to validate canonical card order against server-authored `learning_progress_events`. No RLS or permission relaxation is part of this fix.
