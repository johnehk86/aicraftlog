# 게시판 켜기 (Supabase 연결)

게시판(`/board`)의 로그인·글·사진은 [Supabase](https://supabase.com)라는 무료 서비스에 저장됩니다. 아래 설정을 마치기 전까지 게시판에는 "준비하고 있습니다"라는 안내만 보입니다. 처음 한 번만 하면 되고, 20분 정도 걸립니다.

## 1. Supabase 프로젝트 만들기

1. supabase.com에 가입하고 **New project**를 누릅니다.
2. 이름은 자유롭게 정하고, Region은 **Northeast Asia (Seoul)**을 고릅니다.
3. Database password는 따로 적어 둡니다. (사이트에는 넣지 않습니다.)

## 2. 표와 권한 만들기

1. 왼쪽 메뉴 **SQL Editor** → New query
2. 이 저장소의 `supabase/schema.sql` 내용을 전부 붙여 넣고 **Run**을 누릅니다.

글·댓글·닉네임 표, 사진 저장소, 그리고 "비공개 글은 쓴 사람과 운영자만 본다"는 규칙이 한 번에 만들어집니다.

## 3. 로그인 방법 켜기

**Authentication → URL Configuration**

- Site URL: `https://aicraftlog.com`
- Redirect URLs에 추가: `https://aicraftlog.com/board`, `http://localhost:4321/board`

**이메일 링크 로그인**은 기본으로 켜져 있습니다. 다만 Supabase 기본 메일 발송은 시간당 몇 통으로 제한되어 있어, 사용자가 늘면 Authentication → Emails → SMTP Settings에서 메일 발송 서비스(예: Resend)를 연결해야 합니다.

**Google 로그인** (권장)

1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → OAuth 클라이언트 ID 만들기 (유형: 웹 애플리케이션)
2. "승인된 리디렉션 URI"에 Supabase의 Authentication → Sign In / Providers → Google 화면에 나오는 Callback URL을 넣습니다.
3. 발급된 Client ID와 Client Secret을 같은 Supabase 화면에 넣고 켭니다.

Google 로그인을 쓰지 않으려면 `src/data/site.json`의 `boardPage.providers`를 `[]`로 비우세요. 카카오 로그인을 추가하려면 Supabase에서 Kakao를 켠 뒤 같은 목록에 `{ "id": "kakao", "label": "카카오로 로그인" }`을 넣으면 됩니다.

## 4. 사이트에 주소와 키 넣기

Supabase의 **Project Settings → API**(또는 API Keys)에서 두 값을 복사합니다.

| 환경 변수 | 값 |
|---|---|
| `PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` 키 (또는 Publishable key) |

- 배포된 사이트: Cloudflare Pages → 프로젝트 → Settings → Environment variables에 두 값을 넣고 다시 배포합니다.
- 내 컴퓨터: `.env.example`을 `.env`로 복사해 두 값을 넣습니다.

주의: `service_role` 키(또는 Secret key)는 절대 넣지 마세요. 그 키는 모든 권한 규칙을 무시합니다.

## 5. 나를 운영자로 지정하기

1. 사이트 게시판에서 한 번 로그인하고 닉네임을 정합니다.
2. Supabase SQL Editor에서 아래를 실행합니다. 이메일은 방금 로그인한 주소로 바꿉니다.

```sql
insert into public.admins (user_id)
select id from auth.users where email = '내 로그인 이메일'
on conflict do nothing;
```

운영자는 비공개 글(협업 문의 등)을 볼 수 있고, 어떤 글·댓글이든 지울 수 있으며, 이름 옆에 "운영자" 표시가 붙습니다.

## 6. 확인할 것

- 로그인 → 닉네임 정하기 → 사진을 붙여 글쓰기
- 비공개로 쓴 글이 로그아웃 상태(또는 다른 계정)에서 보이지 않는지
- 운영자 계정에서는 그 비공개 글이 보이는지

## 게시판의 동작

- 분류: 자유 / 질문 / 협업 문의. 이름은 `src/data/site.json`의 `boardPage.categories`에서 바꿉니다. (`id`는 바꾸지 마세요.)
- 공개 범위는 글쓴이가 고릅니다. 협업 문의는 비공개가 기본이고, 쓴 뒤에도 글 화면에서 바꿀 수 있습니다.
- 사진은 글마다 4장까지이며, 올리기 전에 긴 변 1600px로 줄입니다. 비공개 글의 사진도 비공개입니다.
- 글 내용 수정 기능은 없습니다. 지우고 다시 쓰는 방식입니다.
- 새 글 알림은 없습니다. 협업 문의가 왔는지는 게시판에 들어가 확인해야 합니다.

## 운영할 때 알아 둘 것

- 로그인한 사람의 이메일 주소를 저장하게 되므로, 사이트에 개인정보 처리방침을 두어야 합니다.
- Supabase 무료 요금제는 일주일 동안 사용이 없으면 프로젝트가 일시 정지됩니다. 대시보드에서 다시 켤 수 있습니다.
- 무료 저장 용량은 사진 1GB, 데이터베이스 500MB입니다.
