import fs from 'node:fs';
import manual from '../data/videos.json';
import pillars from '../data/pillars.json';
import site from '../data/site.json';

export interface Video {
  id: string;
  title: string;
  published: string;
  category: string;
}

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');

/** 제목의 키워드로 기둥을 추정한다. 못 맞추면 기본 카테고리. */
function classify(title: string): string {
  let best = site.youtube.defaultCategory;
  let bestScore = 0;
  for (const p of pillars) {
    const score = p.keywords.filter((k) => title.toLowerCase().includes(k.toLowerCase())).length;
    if (score > bestScore) {
      best = p.id;
      bestScore = score;
    }
  }
  return best;
}

/** 유튜브 RSS에서 최신 영상을 읽는다. 실패하면 빈 배열(빌드는 계속된다). */
async function fetchFeed(): Promise<Omit<Video, 'category'>[]> {
  const id = site.youtube.channelId;
  // UULF… 재생목록은 쇼츠를 뺀 일반 영상만 담고 있다. 안 되면 채널 전체 피드로.
  const urls = [
    `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${id.slice(2)}`,
    `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
        .map(([, e]) => ({
          id: e.match(/<yt:videoId>([^<]+)/)?.[1] ?? '',
          title: decode(e.match(/<title>([^<]*)/)?.[1] ?? '').trim(),
          published: e.match(/<published>([^<]+)/)?.[1] ?? '',
        }))
        .filter((v) => v.id && v.title && !Number.isNaN(Date.parse(v.published)));
      if (items.length) return items;
    } catch {
      // 다음 주소 시도
    }
  }
  console.warn('[videos] 유튜브 피드를 읽지 못해 src/data/videos.json 목록만 사용합니다.');
  return [];
}

let cache: Promise<Video[]> | undefined;

/** 피드 + 수동 목록을 합친 전체 영상 (최신순). 수동 목록의 category / hide 가 우선한다. */
export function getVideos(): Promise<Video[]> {
  return (cache ??= (async () => {
    const byId = new Map<string, Video & { hide?: boolean }>();
    for (const v of manual.videos as (Video & { hide?: boolean })[]) byId.set(v.id, { ...v });
    for (const f of await fetchFeed()) {
      const m = byId.get(f.id);
      byId.set(f.id, { ...f, category: m?.category ?? classify(f.title), hide: m?.hide });
    }
    const valid = new Set(pillars.map((p) => p.id));
    return [...byId.values()]
      .filter((v) => !v.hide)
      .map(({ hide, ...v }) => ({
        ...v,
        category: valid.has(v.category) ? v.category : site.youtube.defaultCategory,
      }))
      .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  })());
}

export const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }).format(
    new Date(iso),
  );

/** public/ 아래에 파일이 있으면 그 경로를, 없으면 null 을 돌려준다 (로고·표지·사진 자동 교체용). */
export function publicAsset(path: string): string | null {
  // 빌드는 항상 프로젝트 폴더에서 실행되므로 현재 폴더 기준으로 찾는다
  return fs.existsSync(`${process.cwd()}/public/${path}`) ? `/${path}` : null;
}
