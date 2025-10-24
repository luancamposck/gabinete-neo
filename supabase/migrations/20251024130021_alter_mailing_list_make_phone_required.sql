-- Migration: 20251023_alter_mailing_list_make_phone_required.sql

-- Primeiro, garante que não há linhas nulas
update public.mailing_list
set phone_number = 0
where phone_number is null;

-- Agora altera a coluna para NOT NULL
alter table public.mailing_list
alter column phone_number set not null;
