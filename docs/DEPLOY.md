# 배포와 aicraftlog.com 연결 안내

순서는 네 단계입니다: GitHub에 올리기 → 호스팅에 연결 → 임시 주소에서 확인 → 도메인 연결.

호스팅은 Cloudflare Pages와 Vercel 중 하나를 고르면 됩니다. 둘 다 무료이고 이 사이트는 어느 쪽에서도 그대로 동작합니다. 도메인의 DNS를 이미 Cloudflare에서 관리하고 있다면 Cloudflare Pages가 가장 간단합니다.

## 1. GitHub에 올리기

1. GitHub에서 새 저장소를 만듭니다 (예: `aicraftlog-homepage`).
2. 이 폴더에서 아래를 실행합니다.

```bash
git init
git add .
git commit -m "AI Craft Log 홈페이지 첫 버전"
git branch -M main
git remote add origin https://github.com/<내 계정>/aicraftlog-homepage.git
git push -u origin main
```

## 2. 호스팅에 연결

두 서비스 모두 설정값은 같습니다.

| 항목 | 값 |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js 버전 | 20 이상 |

### Cloudflare Pages

1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git
2. 저장소를 고르고 위 표의 값을 입력한 뒤 Save and Deploy
3. `https://<프로젝트 이름>.pages.dev` 주소가 생깁니다.

### Vercel

1. vercel.com → Add New → Project → 저장소 Import
2. Astro가 자동으로 인식됩니다. Deploy를 누릅니다.
3. `https://<프로젝트 이름>.vercel.app` 주소가 생깁니다.

이후에는 GitHub `main` 브랜치에 올릴 때마다 자동으로 다시 배포됩니다.

## 3. 임시 주소에서 확인

- 홈, `/videos`, `/books`, `/about`, `/links`가 모두 열리는지
- 휴대폰에서 열어 봤을 때 깔끔한지
- 유튜브·크몽·킨들·인스타 버튼이 올바른 곳으로 가는지

## 4. aicraftlog.com 연결

현재 이 도메인에 연결된 기존 블로그는 새 사이트로 교체됩니다. 연결을 바꾸기 전에 기존 블로그의 글을 백업해 두세요.

### Cloudflare Pages인 경우

1. Pages 프로젝트 → Custom domains → Set up a custom domain
2. `aicraftlog.com`을 입력합니다.
   - 도메인의 DNS가 Cloudflare에 있으면 레코드가 자동으로 만들어집니다.
   - 다른 곳에 있으면 화면에 나오는 CNAME 값을 도메인 등록 업체의 DNS 설정에 넣습니다. 루트 도메인(`aicraftlog.com`)을 쓰려면 네임서버를 Cloudflare로 옮기는 것이 가장 확실합니다.
3. `www.aicraftlog.com`도 같은 방법으로 추가합니다.

### Vercel인 경우

1. 프로젝트 → Settings → Domains → `aicraftlog.com` 추가
2. 화면에 나오는 값을 도메인 등록 업체의 DNS 설정에 넣습니다. 보통 아래와 같지만, Vercel 화면에 표시된 값을 그대로 쓰세요.
   - 루트 도메인: A 레코드
   - `www`: CNAME 레코드
3. 기존 블로그를 가리키던 A / CNAME 레코드는 지웁니다.

DNS가 바뀌는 데는 몇 분에서 길게는 하루가 걸립니다. HTTPS 인증서는 자동으로 발급됩니다.

## 5. 새 영상 자동 반영 (하루 1회 재빌드)

새 영상은 사이트를 빌드할 때 가져오므로, 하루에 한 번 자동으로 다시 빌드하게 해 둡니다. 파일은 이미 들어 있습니다: `.github/workflows/daily-rebuild.yml` (매일 한국 시간 오전 6시).

1. 호스팅에서 Deploy Hook 주소를 만듭니다.
   - Cloudflare Pages: 프로젝트 → Settings → Builds & deployments → Deploy hooks → Add deploy hook (브랜치 `main`)
   - Vercel: 프로젝트 → Settings → Git → Deploy Hooks → Create Hook (브랜치 `main`)
2. 만들어진 주소를 복사합니다. 이 주소는 비밀번호처럼 다뤄야 합니다.
3. GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
   - Name: `CF_DEPLOY_HOOK_URL`
   - Secret: 복사한 주소
4. 저장소의 Actions 탭 → Daily rebuild → Run workflow로 한 번 실행해 동작을 확인합니다.

시크릿을 넣지 않으면 이 작업은 아무것도 하지 않고 조용히 끝납니다.

## 6. 방문 분석 켜기 (선택)

호스팅의 환경 변수(Settings → Environment variables)에 아래 중 쓰려는 것을 넣고 다시 배포합니다.

- `PUBLIC_GA_ID` — Google Analytics 4 측정 ID (`G-`로 시작)
- `PUBLIC_CF_BEACON_TOKEN` — Cloudflare Web Analytics 토큰

## 7. 배포 후 할 일

- 인스타그램 프로필 링크를 `https://aicraftlog.com/links`로 바꿉니다.
- Google Search Console과 네이버 서치어드바이저에 사이트를 등록하고 `https://aicraftlog.com/sitemap-index.xml`을 제출합니다.
- PageSpeed Insights(https://pagespeed.web.dev)에서 Lighthouse 점수를 확인합니다.
