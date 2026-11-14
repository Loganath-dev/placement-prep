-- Cover foreign-key columns used by review and content ownership metadata.
-- The live production inspection on 2026-11-14 found no existing index with
-- these columns as a leading key and zero rows in the affected tables.
-- Keep each index narrow; do not remove existing indexes based on advisor
-- usage counters alone.

create index if not exists idx_affiliate_commissions_reviewed_by
  on public.affiliate_commissions (reviewed_by);

create index if not exists idx_content_question_reviews_reviewer_id
  on public.content_question_reviews (reviewer_id);

create index if not exists idx_content_questions_author_id
  on public.content_questions (author_id);

create index if not exists idx_content_questions_published_by
  on public.content_questions (published_by);

create index if not exists idx_content_questions_reviewer_id
  on public.content_questions (reviewer_id);
