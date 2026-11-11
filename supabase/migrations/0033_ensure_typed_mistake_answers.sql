-- Ensure typed-answer metadata exists in databases where migration 0023
-- was recorded but its schema changes are missing. Version 0033 is used to
-- avoid colliding with 0029_remove_refund_flow_and_stack_renewals.sql.
alter table public.mistakes
  add column if not exists question_type text,
  add column if not exists accepted_answers jsonb,
  add column if not exists response_text text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'mistakes_question_type_check'
      and conrelid = 'public.mistakes'::regclass
  ) then
    alter table public.mistakes
      add constraint mistakes_question_type_check
      check (question_type is null or question_type in ('mcq', 'fill_blank'));
  end if;
end $$;
