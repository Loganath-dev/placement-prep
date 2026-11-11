-- StudyBench: typed-answer exercise metadata for the mistake notebook.
-- Existing multiple-choice rows remain valid; new columns are nullable.

alter table public.mistakes
  add column if not exists question_type text,
  add column if not exists accepted_answers jsonb,
  add column if not exists response_text text;

alter table public.mistakes
  add constraint mistakes_question_type_check
  check (question_type is null or question_type in ('mcq', 'fill_blank'));
