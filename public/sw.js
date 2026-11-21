// AI Craft Log 서비스 워커 — 앱으로 설치할 수 있게 하고, 한 번 본 페이지는 인터넷이 끊겨도 열리게 한다.
// 페이지는 항상 새 버전을 먼저 받아 오고(네트워크 우선), 실패할 때만 저장해 둔 것을 보여 준다.
// 다른 사이트(유튜브 썸네일, Supabase 게시판 등) 요청에는 손대지 않는다.
const CACHE = 'aicraftlog-v1';
const PRECACHE = ['/', '/videos', '/books', '/about', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (req, res) => {
  if (res && res.ok && res.type === 'basic') {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 페이지: 네트워크 우선 → 저장본 → 홈
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => put(req, res))
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) || (await caches.match('/')) || Response.error()),
    );
    return;
  }

  // 빌드 결과물(파일 이름에 해시가 붙어 바뀌지 않음): 저장본 우선
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
    return;
  }

  // 그 밖의 이미지·아이콘: 저장본을 바로 쓰고 뒤에서 새로 받아 둔다
  event.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => put(req, res))
        .catch(() => hit);
      return hit || net;
    }),
  );
});
