---
name: write-blog
description: "AICRAFTER 블로그 글 작성 스킬. aicraftlog.com(영어)과 티스토리(한국어) 블로그 글을 작성할 때 사용. Build Log 시리즈, 튜토리얼, AI 서비스 개발 여정 관련 글 작성 시 자동 호출."
---

# AICRAFTER 블로그 글쓰기 스킬

## 글의 정체성

- 작성자: Toby (AICRAFTER)
- 정체: 자동차산업 임베디드 소프트웨어 개발자 → AI 서비스 빌더
- 독자: 코딩을 모르지만 AI로 뭔가 만들어보고 싶은 사람
- 톤: 친근하되 전문적, 쉬운 설명, 실제 경험 기반

---

## 글 구조 (한국어)

### 제목
- 형식: `Build Log #N: [핵심 내용]`
- SEO 키워드 포함 필수
- 예: `Build Log #8: 블로그를 구글 검색에 노출시키는 방법 (SEO)`

### 도입부 (Hook)
- 이전 글과의 연결로 시작: "이전 글에서 ~했습니다."
- 바로 문제 제기 또는 질문 던지기
- 이번 글에서 다룰 내용을 한 줄로 요약
- **볼드체**로 핵심 메시지 강조

```
예시:
"이전 글에서 구글 애드센스를 신청했습니다.
하지만 한 가지 문제가 있습니다. 아무리 좋은 글을 써도,
**구글에서 검색했을 때 내 블로그가 나오지 않으면** 방문자가 없습니다."
```

### 본문
- `---`로 섹션 구분
- `##`로 대제목, `###`로 소제목
- 어려운 개념은 **비유로 먼저 설명** → 기술적 설명
- 코드 블록은 실제 사용한 코드 포함
- 순서가 있는 과정은 `### 1단계:`, `### 2단계:` 형식

### 비유 패턴 (Toby 스타일)
- 기술 개념을 일상 비유로 설명하는 것이 핵심
- Git → "보고서_v1, 보고서_최종, 보고서_진짜최종 대신 자동 버전 관리"
- GitHub → "Git 기록을 클라우드에 저장하는 장소"
- SEO 크롤러 → "구글의 로봇이 전 세계 웹사이트를 돌아다님"
- Search Console → "구글과 나의 블로그 사이의 소통 창구"
- AdSense → "내 블로그에 광고를 달아서 돈을 버는 서비스"
- 새로운 개념이 나올 때마다 반드시 비유를 하나 넣을 것

### 수치/데이터 활용
- 추상적 설명 대신 구체적 숫자 사용
- "빠르게 만들었다" (X) → "1시간 만에 만들었다" (O)
- "적은 비용" (X) → "월 $21" (O)
- "몇 번의 프롬프트" (X) → "24개 프롬프트" (O)
- 비교 테이블로 before/after 보여주기

### 정리 섹션
- 글 마무리에 "이번 글에서 한 일을 정리하면" 포함
- 번호 목록으로 핵심 내용 요약
- 전체 여정 흐름도 (코드 화살표 형식)

```
예시:
코드 생성 (Claude Code)
→ 코드 관리 (Git + GitHub)  
→ 빌드 + 배포 (Cloudflare Pages)
→ 도메인 연결 (aicraftlog.com)
→ 수익화 (Google AdSense)
→ 검색 노출 (Google Search Console + SEO)
```

### 다음 글 예고
- "다음 글에서는 ~에 대해 이야기하겠습니다."
- "Build Log #N에서 만나겠습니다."

### 서명
```
나는 임베디드 소프트웨어 개발자이면서 AI로 서비스를 만드는 AICRAFTER입니다.
이 여정을 aicraftlog.com에서 기록하고 있습니다.
```

---

## 글 구조 (영어 - aicraftlog.com)

### 메타 정보 (반드시 포함)
```
**Slug:** build-log-08-getting-blog-on-google-search-seo
**Description:** 1~2줄 요약
**Tags:** build-log, 관련키워드1, 관련키워드2, tutorial
**Category:** Build Log
```

### 도입부
- 한국어와 동일한 구조
- "In the previous post, I ~"로 시작
- 문제 제기 → 이번 글 소개

### 본문
- 한국어 글의 직역이 아니라 **영어 독자에 맞게 재작성**
- 같은 구조, 같은 비유, 같은 코드이지만 자연스러운 영어

### 서명
```
I'm an embedded software developer building AI-powered services
with zero web experience. Follow the journey at aicraftlog.com.
```

---

## 이미지 규칙

- 모든 이미지에 **alt 텍스트(설명 텍스트)** 필수
- 형식: `![설명 텍스트](image.png)`
- 예: `![Google Search Console 속성 추가 화면](image.png)`
- 스크린샷 위치를 `(image.png)`로 표시, Toby가 나중에 실제 이미지로 교체

---

## 글쓰기 원칙

### DO (해야 할 것)
- 실제 경험한 것만 쓰기 (추측이나 이론 X)
- 초보자가 따라할 수 있도록 단계별 설명
- 비유를 적극 활용 (모든 새로운 개념마다 1개)
- 숫자와 구체적 데이터 포함 ("1시간", "24개 프롬프트", "월 $21")
- 코드 블록에 실제 사용한 코드/명령어 포함
- **볼드체**로 핵심 키워드 강조
- 한/영 동시 작성 (같은 구조, 다른 표현)

### DON'T (하면 안 되는 것)
- 해보지 않은 것을 아는 척하지 않기
- 전문 용어를 설명 없이 쓰지 않기
- 글이 너무 길어지면 분리 (글당 1500~2500자 한국어 기준)
- 도입부에서 잡담하지 않기 (바로 본론)
- 이모지 과다 사용 금지 (게임 목록 등 특수한 경우만)

### 파일 명명 규칙
- 한국어: `build-log-NN-kr-final.md`
- 영어: `build-log-NN-en-final.md`
- 초안: `build-log-NN-kr-draft.md`

---

## 블로그 플랫폼별 차이

### aicraftlog.com (영어)
- Build Log 시리즈 (번호 연속)
- Slug, Description, Tags, Category 메타 정보 필수
- 글로벌 독자 타겟
- Notion → 웹사이트 워크플로우

### 티스토리 (한국어)
- Build Log 시리즈 + 독립 시리즈 (Claude 심화 활용 등)
- 대중 타겟, 1500~2000자
- SEO 키워드 중심 제목

---

## 시리즈 목록

### aicraftlog.com Build Log 시리즈
1. How I Built aicraftlog.com in 3 Days
2. Building an AI Blog with Claude Code
3. How a Car Engineer Builds Web Apps
4. 24 Prompts That Built My Blog
5. From Code to World
6. Connecting a Custom Domain
7. Monetizing with Google AdSense
8. Getting Your Blog on Google Search (SEO)
9. How I Built a 6-Game Retro Arcade Site in Under 1 Hour (진행중)

### 티스토리 Claude 심화 활용 시리즈
1. Skills — AI에게 매뉴얼을 주는 법
2. Agent Teams — AI가 팀으로 일하는 시대
3. Artifacts — 코딩 없이 앱 만들기
4. Cowork + MCP — AI가 내 컴퓨터에서 일한다
5. Claude Code 실전 — 2일 만에 풀스택 앱
6. 모델 비교 — Opus vs Sonnet vs Haiku
