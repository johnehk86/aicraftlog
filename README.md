# AI Craft Log 홈페이지

Toby의 유튜브·책·인스타그램을 한곳에 모은 베이스캠프 사이트입니다. (https://aicraftlog.com)

Astro + Tailwind CSS로 만든 정적 사이트라서 서버가 필요 없습니다.

## 내 컴퓨터에서 보기

Node.js 22 이상이 필요합니다.

```bash
npm install     # 처음 한 번만
npm run dev     # http://localhost:4321 에서 확인 (파일을 고치면 바로 반영)
```

배포될 결과물을 그대로 확인하려면:

```bash
npm run build   # dist/ 폴더에 사이트 생성
npm run preview # 생성된 사이트 미리 보기
```

## 페이지

| 주소 | 내용 |
|---|---|
| `/` | 홈 |
| `/videos` | 영상 모음 (`/videos?category=build` 처럼 주제별로 바로 열 수 있음) |
| `/books` | 책 소개 |
| `/about` | Toby 소개 |
| `/links` | 인스타그램 프로필에 걸 링크 모음 |

## 내용 고치기 — 코드를 몰라도 됩니다

글과 링크는 전부 `src/data/` 폴더의 파일 네 개에 있습니다. 메모장이나 VS Code로 열어서 **따옴표 안의 글자만** 고치고 저장하면 됩니다.

| 파일 | 들어 있는 것 |
|---|---|
| `src/data/site.json` | 사이트 이름, 슬로건, 유튜브·인스타 주소, 메뉴, 각 페이지의 제목과 문구, 소개 페이지 내용, 링크 모음 버튼 |
| `src/data/books.json` | 책 5권과 킨들판의 제목, 설명, 추천 대상, 구매 주소 |
| `src/data/pillars.json` | BUILD / EARN / LEARN / TREND 네 주제의 이름, 설명, 색, 자동 분류 키워드 |
| `src/data/videos.json` | 영상 목록과 주제 분류 |

고칠 때 주의할 점:

- 따옴표(`"`), 쉼표(`,`), 괄호는 지우지 마세요. 하나라도 빠지면 사이트가 만들어지지 않습니다.
- 고친 뒤 `npm run dev` 화면에 오류가 뜨면 방금 고친 줄의 따옴표와 쉼표를 확인하세요.

### 책 설명 채우기

`books.json`에서 각 책의 `description`(한 줄 설명)과 `recommendedFor`(이런 분께 추천)는 비워 두었거나 임시 문구입니다. 직접 채워 주세요.

```json
"description": "여기에 한 줄 설명",
"recommendedFor": ["첫 번째 추천 대상", "두 번째 추천 대상"],
```

내용을 확정한 책은 `"todo": true,` 줄을 지우세요. 그러면 개발 화면(`npm run dev`)에 보이는 노란색 `TODO: Toby 확인` 표시가 사라집니다. 이 표시는 실제 사이트에는 나오지 않습니다.

### 영상

새 영상은 사이트를 빌드할 때 유튜브에서 자동으로 가져옵니다. 보통은 아무것도 할 필요가 없습니다.

- **주제 분류**: 새 영상은 제목에 들어 있는 단어로 자동 분류됩니다. 단어 목록은 `pillars.json`의 `keywords`입니다. 맞는 단어가 없으면 TREND로 들어갑니다.
- **분류가 틀렸을 때**: `videos.json`에 그 영상을 추가하고 `category`를 `build` / `earn` / `learn` / `trend` 중 하나로 적습니다. 여기 적힌 분류가 자동 분류보다 우선합니다. `id`는 유튜브 주소 `watch?v=` 뒤의 11글자입니다.

  ```json
  { "id": "YGHEYMRr7qQ", "title": "영상 제목", "published": "2026-11-08T10:30:29.000Z", "category": "earn" }
  ```

- **영상 숨기기**: 해당 영상 항목에 `"hide": true`를 추가합니다.
- 유튜브 피드는 최신 15개만 알려 줍니다. 그보다 오래된 영상은 `videos.json`에 적혀 있어야 사이트에 나옵니다. 현재 68개가 들어 있습니다.
- 유튜브에 연결하지 못해도 빌드는 실패하지 않고 `videos.json` 목록만으로 만들어집니다.
- 쇼츠는 제외하고 일반 영상만 가져옵니다.

### 이미지 넣기

아래 위치에 파일을 넣으면 임시 그림이 자동으로 바뀝니다. 코드를 고칠 필요가 없습니다.

| 넣을 파일 | 바뀌는 곳 |
|---|---|
| `public/logo.png` | 헤더·푸터·링크 모음의 로고 |
| `public/profile.jpg` (또는 `profile.png`) | 홈과 소개 페이지의 Toby 사진 |
| `public/books/vol1.webp` ~ `vol4.webp`, `bundle.webp`, `kindle.webp` | 책 표지. 파일명이나 비율을 바꾸려면 `books.json`의 `cover`, `coverRatio`를 고칩니다 |

파비콘은 `public/favicon.svg`, 공유할 때 보이는 이미지는 `public/og.png`입니다. 공유 이미지의 문구를 바꾸려면 `scripts/make-og.mjs`를 고친 뒤 `npm run og`를 실행합니다.

### 색과 서체

`src/styles/global.css` 맨 위 `@theme` 안에 모여 있습니다. 주제별 색은 `pillars.json`의 `color`입니다.

## 게시판

`/board` 게시판은 로그인·글·사진을 Supabase에 저장합니다. 연결하기 전에는 "준비하고 있습니다" 안내만 보입니다. 켜는 방법은 [docs/BOARD.md](docs/BOARD.md)에 있습니다. 화면의 문구와 분류 이름은 `src/data/site.json`의 `boardPage`에서 바꿉니다.

## 방문 분석 (선택)

`.env.example`을 `.env`로 복사해서 값을 넣거나, 호스팅 서비스의 환경 변수에 넣으면 켜집니다. 비워 두면 아무것도 로드하지 않습니다.

- `PUBLIC_GA_ID` — Google Analytics 4 측정 ID
- `PUBLIC_CF_BEACON_TOKEN` — Cloudflare Web Analytics 토큰

GA4를 켜면 유튜브·책·인스타 버튼 클릭이 `cta_click` 이벤트로 기록됩니다. 어떤 버튼인지는 `cta` 값(`youtube-hero`, `book-bundle` 등)으로 구분합니다.

## 배포와 도메인 연결

[docs/DEPLOY.md](docs/DEPLOY.md)를 보세요.

## 폴더 구조

```
src/data/        글·링크·책·영상 데이터 (여기만 고치면 됨)
src/pages/       페이지 (index, videos, books, about, links, 404)
src/components/  헤더, 푸터, 영상 카드, 책 표지 등
src/layouts/     공통 틀 (SEO 태그, 분석 스크립트)
src/lib/         유튜브 영상 불러오기
src/styles/      색·서체 토큰
public/          로고, 표지, 파비콘 등 그대로 올라가는 파일
```
