// 방문자 수 세기·표시. Supabase 의 track_visit 함수(supabase/schema.sql)를 부른다.
// supabase-js 를 모든 페이지에 싣지 않으려고 fetch 로 직접 부른다.
const KEY_ID = 'acl-visitor';
const KEY_CACHE = 'acl-visits';
const CACHE_MS = 2 * 60 * 1000;

interface Counts {
  today: number;
  total: number;
}

const store = (s: () => Storage) => {
  try {
    return s();
  } catch {
    return null;
  }
};

function visitorId(): string {
  const ls = store(() => localStorage);
  let id: string | null | undefined = ls?.getItem(KEY_ID);
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    id = crypto.randomUUID();
    try {
      ls?.setItem(KEY_ID, id);
    } catch {}
  }
  return id;
}

function show({ today, total }: Counts) {
  const box = document.querySelector<HTMLElement>('[data-visits]');
  if (!box) return;
  const n = new Intl.NumberFormat('ko-KR');
  box.querySelector('[data-visits-today]')!.textContent = n.format(today);
  box.querySelector('[data-visits-total]')!.textContent = n.format(total);
  box.hidden = false;
}

export async function trackVisit() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !crypto.randomUUID) return;

  const ss = store(() => sessionStorage);
  try {
    const cached = JSON.parse(ss?.getItem(KEY_CACHE) ?? 'null');
    if (cached && Date.now() - cached.at < CACHE_MS) return show(cached);
  } catch {}

  // 자동화 도구(검색 로봇 등)와 내 컴퓨터에서 미리 보기는 세지 않고 숫자만 읽는다
  const count = !navigator.webdriver && !/^(localhost|127\.)/.test(location.hostname);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/track_visit`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor: count ? visitorId() : null }),
      keepalive: true,
    });
    if (!res.ok) return;
    const [row] = (await res.json()) as Counts[];
    if (!row) return;
    const counts = { today: Number(row.today), total: Number(row.total) };
    try {
      ss?.setItem(KEY_CACHE, JSON.stringify({ ...counts, at: Date.now() }));
    } catch {}
    show(counts);
  } catch {
    // 숫자를 못 받아도 사이트는 그대로
  }
}
