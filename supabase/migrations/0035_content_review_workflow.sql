-- StudyBench V11.6: transactional content review and publishing workflow.
-- The API performs MFA/admin authorization before invoking these service-role-only RPCs.

alter table public.content_questions
  add column if not exists published_by uuid references auth.users(id) on delete set null,
  add column if not exists published_at timestamptz;

create or replace function public.admin_review_content_question(
  p_question_id text,
  p_reviewer_id uuid,
  p_decision text,
  p_answer_key_checked boolean,
  p_explanation_checked boolean,
  p_source_checked boolean,
  p_difficulty_checked boolean,
  p_duplicate_checked boolean,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.content_questions%rowtype;
  review_id bigint;
begin
  if p_decision not in ('approved', 'changes_requested', 'rejected') then
    raise exception 'Invalid review decision' using errcode = '22023';
  end if;

  select * into q
  from public.content_questions
  where id = p_question_id
  for update;

  if not found then
    raise exception 'Question not found' using errcode = 'P0002';
  end if;

  if q.status <> 'draft' then
    raise exception 'Only draft questions can enter academic review' using errcode = '22023';
  end if;

  if p_decision = 'approved' and q.author_id is null then
    raise exception 'Record the content author before requesting independent approval' using errcode = '23514';
  end if;

  if q.author_id is not null and q.author_id = p_reviewer_id then
    raise exception 'The author cannot independently review their own question' using errcode = '42501';
  end if;

  if p_decision = 'approved' and not (
    p_answer_key_checked and p_explanation_checked and p_source_checked
    and p_difficulty_checked and p_duplicate_checked
  ) then
    raise exception 'All five academic checks are required for approval' using errcode = '22023';
  end if;

  insert into public.content_question_reviews (
    question_id, question_version, reviewer_id, decision,
    answer_key_checked, explanation_checked, source_checked,
    difficulty_checked, duplicate_checked, notes
  ) values (
    q.id, q.version, p_reviewer_id, p_decision,
    p_answer_key_checked, p_explanation_checked, p_source_checked,
    p_difficulty_checked, p_duplicate_checked, nullif(left(coalesce(p_notes, ''), 4000), '')
  ) returning id into review_id;

  update public.content_questions
  set status = case when p_decision = 'approved' then 'reviewed' else 'draft' end,
      reviewer_id = p_reviewer_id,
      reviewed_at = now(),
      review_notes = nullif(left(coalesce(p_notes, ''), 4000), '')
  where id = q.id;

  return jsonb_build_object('ok', true, 'review_id', review_id, 'status',
    case when p_decision = 'approved' then 'reviewed' else 'draft' end);
end;
$$;

create or replace function public.admin_publish_content_question(
  p_question_id text,
  p_publisher_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.content_questions%rowtype;
  latest_review public.content_question_reviews%rowtype;
begin
  select * into q
  from public.content_questions
  where id = p_question_id
  for update;

  if not found then
    raise exception 'Question not found' using errcode = 'P0002';
  end if;

  if q.status <> 'reviewed' then
    raise exception 'Only an approved reviewed question can be published' using errcode = '22023';
  end if;

  select * into latest_review
  from public.content_question_reviews
  where question_id = q.id
  order by created_at desc, id desc
  limit 1;

  if not found
    or latest_review.question_version <> q.version
    or latest_review.decision <> 'approved'
    or not (latest_review.answer_key_checked and latest_review.explanation_checked
      and latest_review.source_checked and latest_review.difficulty_checked
      and latest_review.duplicate_checked)
    or (q.author_id is not null and latest_review.reviewer_id = q.author_id)
  then
    raise exception 'A current, independent, fully checked approval is required before publishing'
      using errcode = '42501';
  end if;

  if q.content_kind = 'verified_previous_year'
    and (q.source_id is null or q.source_url is null or q.source_checked_at is null)
  then
    raise exception 'Verified previous-year content requires an exact source and checked date'
      using errcode = '23514';
  end if;

  update public.content_questions
  set status = 'live', published_by = p_publisher_id, published_at = now()
  where id = q.id;

  return jsonb_build_object('ok', true, 'status', 'live', 'question_id', q.id);
end;
$$;

revoke all on function public.admin_review_content_question(text, uuid, text, boolean, boolean, boolean, boolean, boolean, text) from public, anon, authenticated;
revoke all on function public.admin_publish_content_question(text, uuid) from public, anon, authenticated;
grant execute on function public.admin_review_content_question(text, uuid, text, boolean, boolean, boolean, boolean, boolean, text) to service_role;
grant execute on function public.admin_publish_content_question(text, uuid) to service_role;

comment on function public.admin_review_content_question is
  'Transactional independent academic review; approval requires five explicit checks and writes immutable versioned evidence.';
comment on function public.admin_publish_content_question is
  'Publishes only the current version with a fully checked independent approval.';


-- Any substantive content edit invalidates the previous review and publication.
-- A new version must be independently reviewed again before it can go live.
create or replace function public.invalidate_content_question_review()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if row(new.section, new.company_id, new.topic, new.difficulty, new.prompt,
         new.options, new.answer, new.explanation, new.option_notes,
         new.source_id, new.content_kind, new.source_url, new.source_checked_at,
         new.tier, new.author_id)
     is distinct from
     row(old.section, old.company_id, old.topic, old.difficulty, old.prompt,
         old.options, old.answer, old.explanation, old.option_notes,
         old.source_id, old.content_kind, old.source_url, old.source_checked_at,
         old.tier, old.author_id)
  then
    new.version := old.version + 1;
    new.status := 'draft';
    new.reviewer_id := null;
    new.reviewed_at := null;
    new.review_notes := null;
    new.published_by := null;
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_invalidate_content_question_review on public.content_questions;
create trigger trg_invalidate_content_question_review
  before update on public.content_questions
  for each row execute function public.invalidate_content_question_review();
