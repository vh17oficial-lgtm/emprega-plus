-- Migration: adds the `escolaridade` column to jobs if missing.
-- Safe to run multiple times (idempotent).
-- Apply this in the Supabase SQL Editor.

alter table public.jobs
  add column if not exists escolaridade text default '';

-- Backfill existing rows with empty string where null
update public.jobs set escolaridade = '' where escolaridade is null;

-- Reload PostgREST schema cache so new column is visible via the API immediately
notify pgrst, 'reload schema';
