-- StudyBench V11: make content provenance and independent review first-class.
-- Additive migration: existing seeded records remain draft/unverified by default.

alter table public.content_questions
  add column if not exists content_kind text not null default 'topic_revision',
  add column if not exists source_url text,
  add column if not exists source_checked_at timestamptz,
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists reviewer_id uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text,
  add column if not exists version integer not null default 1,
  add column if not exists quality_flags jsonb not null default '[]'::jsonb;

-- Existing rows from the legacy seed path may have been marked live without
-- independent review metadata. Fail closed: unpublish those rows before the
-- review constraint is introduced. Properly reviewed live rows remain live.
update public.content_questions
set status = 'draft'
where status = 'live'
  and (
    reviewed_at is null
    or reviewer_id is null
    or (author_id is not null and author_id = reviewer_id)
  );

alter table public.content_questions
  drop constraint if exists content_questions_content_kind_check,
  add constraint content_questions_content_kind_check
    check (content_kind in ('verified_previous_year','company_pattern_practice','topic_revision','mock_question')),
  drop constraint if exists content_questions_review_metadata_check,
  add constraint content_questions_review_metadata_check check (
    status <> 'live' or (
      reviewed_at is not null and reviewer_id is not null and
      (author_id is null or author_id <> reviewer_id)
    )
  ) not valid,
  drop constraint if exists content_questions_version_check,
  add constraint content_questions_version_check check (version >= 1),
  drop constraint if exists content_questions_verified_year_source_check,
  add constraint content_questions_verified_year_source_check check (
    content_kind <> 'verified_previous_year' or (source_id is not null and source_url is not null and source_checked_at is not null)
  );

create table if not exists public.content_question_reviews (
  id bigint generated always as identity primary key,
  question_id text not null references public.content_questions(id) on delete cascade,
  question_version integer not null,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('approved','changes_requested','rejected')),
  answer_key_checked boolean not null default false,
  explanation_checked boolean not null default false,
  source_checked boolean not null default false,
  difficulty_checked boolean not null default false,
  duplicate_checked boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  constraint content_question_reviews_version_check check (question_version >= 1),
  constraint content_question_reviews_approval_checks check (
    decision <> 'approved' or (answer_key_checked and explanation_checked and source_checked and difficulty_checked and duplicate_checked)
  )
);

alter table public.content_question_reviews enable row level security;
revoke all on public.content_question_reviews from anon, authenticated;
-- No client policies: review records are written only by trusted server-side admin workflows.

create index if not exists idx_content_questions_publication_quality
  on public.content_questions (status, content_kind, section, tier);
create index if not exists idx_content_question_reviews_question_version
  on public.content_question_reviews (question_id, question_version, created_at desc);

comment on column public.content_questions.content_kind is
  'Never infer historical provenance: verified_previous_year requires an exact paper source and checked date.';
comment on column public.content_questions.reviewer_id is
  'Independent reviewer; must differ from author_id when author is recorded.';
comment on table public.content_question_reviews is
  'Immutable-by-policy review evidence for each question version; approval requires all five checks.';
