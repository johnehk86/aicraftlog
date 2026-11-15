-- AI Craft Log 게시판 — Supabase 설정 SQL
-- Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여 넣고 Run 을 한 번 누르면 됩니다.
-- (여러 번 실행해도 안전합니다.)

-- ───────────────────────── 표 ─────────────────────────

-- 닉네임. 이메일은 여기에 저장하지 않으므로 다른 사람에게는 닉네임만 보입니다.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 2 and 20),
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_nickname_key on public.profiles (lower(btrim(nickname)));

-- 운영자 목록. 맨 아래 안내대로 본인 계정을 한 줄 넣습니다.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category text not null check (category in ('free', 'question', 'collab')),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  images text[] not null default '{}' check (cardinality(images) <= 4),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

-- ───────────────────────── 운영자 확인 함수 ─────────────────────────

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- 화면에 "운영자" 표시를 붙이기 위한 목록 (계정 ID만 돌려줍니다)
create or replace function public.admin_ids()
returns setof uuid language sql stable security definer set search_path = ''
as $$ select user_id from public.admins $$;

-- ───────────────────────── 권한 (RLS) ─────────────────────────

alter table public.profiles enable row level security;
alter table public.admins enable row level security; -- 정책 없음: 아무도 직접 읽거나 고칠 수 없음
alter table public.posts enable row level security;
alter table public.comments enable row level security;

grant select on public.profiles, public.posts, public.comments to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, delete on public.posts, public.comments to authenticated;
grant update (is_public, images) on public.posts to authenticated;
grant execute on function public.is_admin(), public.admin_ids() to anon, authenticated;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- 공개 글은 누구나, 비공개 글은 쓴 사람과 운영자만
drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts for select
  using (is_public or author_id = auth.uid() or public.is_admin());
drop policy if exists "posts insert own" on public.posts;
create policy "posts insert own" on public.posts for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "posts update own" on public.posts;
create policy "posts update own" on public.posts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
drop policy if exists "posts delete own or admin" on public.posts;
create policy "posts delete own or admin" on public.posts for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- 댓글은 그 글을 볼 수 있는 사람만 읽고 쓸 수 있음
drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments for select
  using (exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "comments insert own" on public.comments;
create policy "comments insert own" on public.comments for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "comments delete own or admin" on public.comments;
create policy "comments delete own or admin" on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- ───────────────────────── 사진 저장소 ─────────────────────────
-- 비공개 버킷. 파일 경로는 "<내 계정 ID>/<글 ID>/<파일 이름>" 입니다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('board', 'board', false, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 사진은 그 글을 볼 수 있는 사람만 볼 수 있음 (비공개 글의 사진도 비공개)
drop policy if exists "board images read" on storage.objects;
create policy "board images read" on storage.objects for select
  using (
    bucket_id = 'board'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.posts p where p.id::text = (storage.foldername(name))[2])
    )
  );
drop policy if exists "board images upload own" on storage.objects;
create policy "board images upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'board' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "board images delete own or admin" on storage.objects;
create policy "board images delete own or admin" on storage.objects for delete to authenticated
  using (bucket_id = 'board' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ───────────────────────── 운영자 지정 ─────────────────────────
-- 사이트에서 한 번 로그인한 뒤, 아래 줄의 이메일을 본인 것으로 바꿔 따로 실행하세요.
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = '내 로그인 이메일'
--   on conflict do nothing;
