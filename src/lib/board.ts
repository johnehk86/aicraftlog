// 노트(/notes)와 커뮤니티(/board) 화면. 브라우저에서만 실행된다.
// 데이터·로그인·사진은 Supabase가 맡고, 누가 무엇을 할 수 있는지는 supabase/schema.sql 의 규칙(RLS)이 지킨다.
// 사용자가 쓴 글은 항상 텍스트로만 넣는다 (HTML로 해석하지 않음).
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface Post {
  id: string;
  board: string;
  category: string;
  title: string;
  body?: string;
  images: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
  author_id: string;
  profiles: { nickname: string } | null;
}
interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { nickname: string } | null;
}

const PAGE = 20;
const POST_FIELDS = 'id,board,category,title,images,is_public,created_at,updated_at,author_id,profiles(nickname)';
const FIELD =
  'w-full rounded-[0.625rem] border border-line-strong bg-paper px-3.5 py-2.5 text-[15px] text-fg placeholder:text-dim';

let sb: SupabaseClient;
let root: HTMLElement;
let t: any;
let BOARD: 'note' | 'community';
let BASE: string;
let user: User | null = null;
let nickname: string | null = null;
let admins = new Set<string>();
let renderId = 0;

// ───────────────────────── 작은 도구 ─────────────────────────

type Child = Node | string | null | undefined | false | Child[];
function h(tag: string, attrs: Record<string, any> = {}, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  const add = (c: Child) => {
    if (Array.isArray(c)) c.forEach(add);
    else if (c || c === '') el.append(c as Node | string);
  };
  children.forEach(add);
  return el;
}

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
const category = (id: string) => t.categories.find((c: any) => c.id === id);
const isAdmin = () => !!user && admins.has(user.id);
const canWrite = () => !!user && !!nickname && (BOARD === 'community' || isAdmin());

function go(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  history.pushState(null, '', qs ? `${BASE}?${qs}` : BASE);
  render();
  window.scrollTo({ top: 0 });
}
/** 새로고침 없이 이동하는 링크 */
function link(params: Record<string, string>, attrs: Record<string, any>, ...children: Child[]) {
  const qs = new URLSearchParams(params).toString();
  return h(
    'a',
    {
      href: qs ? `${BASE}?${qs}` : BASE,
      ...attrs,
      onclick: (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        go(params);
      },
    },
    ...children,
  );
}
const backLink = () =>
  link({}, { class: 'inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-fg' }, h('span', { 'aria-hidden': 'true' }, '←'), t.back);

const notice = (text: string) => h('p', { class: 'card px-5 py-10 text-center text-mute' }, text);
const alertBox = () => h('p', { class: 'mt-3 hidden text-sm font-medium text-[#b42318]', role: 'alert' });
function showError(box: HTMLElement, text: string) {
  box.textContent = text;
  box.classList.toggle('hidden', !text);
}

/** 글 속 http(s) 주소만 링크로 바꾼다. 나머지는 그대로 텍스트. */
function linkify(text: string) {
  const frag = document.createDocumentFragment();
  let last = 0;
  for (const m of text.matchAll(/https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]]/g)) {
    frag.append(text.slice(last, m.index));
    frag.append(h('a', { href: m[0], target: '_blank', rel: 'noopener noreferrer nofollow ugc', class: 'break-all text-blue underline underline-offset-2' }, m[0]));
    last = m.index! + m[0].length;
  }
  frag.append(text.slice(last));
  return frag;
}

function tags(p: Post) {
  const c = category(p.category);
  return [
    h('span', { class: 'tag', style: `--p:${c?.color ?? ''}` }, c?.name ?? p.category),
    !p.is_public && h('span', { class: 'tag' }, lockIcon(), t.privateBadge),
  ];
}
function lockIcon() {
  const span = h('span', { 'aria-hidden': 'true' });
  span.innerHTML =
    '<svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';
  return span;
}
function author(row: { author_id: string; profiles: { nickname: string } | null }) {
  return [
    row.profiles?.nickname ?? t.unknownAuthor,
    admins.has(row.author_id) && h('span', { class: 'tag ml-1.5', style: '--p:var(--color-blue)' }, t.adminBadge),
  ];
}
const sep = () => h('span', { 'aria-hidden': 'true' }, '·');

/** 비공개 저장소의 사진 주소를 1시간짜리 서명 주소로 바꾼다 */
async function signed(paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!paths.length) return out;
  const { data } = await sb.storage.from('board').createSignedUrls(paths, 3600);
  for (const u of data ?? []) if (u.signedUrl && u.path) out.set(u.path, u.signedUrl);
  return out;
}

// ───────────────────────── 로그인 ─────────────────────────

async function setUser(u: User | null) {
  user = u;
  nickname = null;
  if (u) {
    const { data } = await sb.from('profiles').select('nickname').eq('id', u.id).maybeSingle();
    nickname = data?.nickname ?? null;
  }
}

/** 로그인 버튼 + 펼쳐지는 로그인 방법 */
function loginBox(lead: string) {
  const err = alertBox();
  const info = h('p', { class: 'mt-3 hidden text-sm font-medium text-accent', role: 'status' });
  // 로그인 후 지금 보던 페이지로 돌아온다
  const redirectTo = location.origin + location.pathname + location.search;
  const email = h('input', { class: FIELD, type: 'email', name: 'email', required: true, autocomplete: 'email', placeholder: t.emailPlaceholder, 'aria-label': t.emailLabel });
  const panelId = `login-${Math.random().toString(36).slice(2, 8)}`;
  const panel = h(
    'div',
    { class: 'mt-4 hidden border-t border-line pt-4', id: panelId },
    t.providers.length > 0 &&
      h(
        'div',
        { class: 'grid gap-2 sm:grid-cols-2' },
        t.providers.map((p: any) =>
          h(
            'button',
            {
              type: 'button',
              class: 'btn',
              onclick: async () => {
                const { error } = await sb.auth.signInWithOAuth({ provider: p.id, options: { redirectTo } });
                if (error) showError(err, t.error);
              },
            },
            p.label,
          ),
        ),
      ),
    t.emailLogin &&
      h(
        'form',
        {
          class: 'mt-3 flex flex-col gap-2 sm:flex-row',
          onsubmit: async (e: SubmitEvent) => {
            e.preventDefault();
            showError(err, '');
            const { error } = await sb.auth.signInWithOtp({
              email: (email as HTMLInputElement).value.trim(),
              options: { emailRedirectTo: redirectTo },
            });
            if (error) return showError(err, t.emailError);
            info.textContent = t.emailSent;
            info.classList.remove('hidden');
          },
        },
        email,
        h('button', { class: 'btn shrink-0' }, t.emailButton),
      ),
    info,
    err,
    h('p', { class: 'mt-3 text-[13px] leading-relaxed text-dim' }, t.privacyNote),
  );
  const toggle = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-dark !min-h-10 !py-2',
      'aria-expanded': 'false',
      'aria-controls': panelId,
      onclick: () => {
        const open = panel.classList.toggle('hidden') === false;
        toggle.setAttribute('aria-expanded', String(open));
      },
    },
    t.login,
  );
  return h(
    'div',
    {},
    h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, h('p', { class: 'text-[15px] text-mute' }, lead), toggle),
    panel,
  );
}

function nicknameForm() {
  const err = alertBox();
  const input = h('input', { class: FIELD, name: 'nickname', required: true, minlength: 2, maxlength: 20, autocomplete: 'nickname', placeholder: t.nicknamePlaceholder, 'aria-label': t.nicknameLabel }) as HTMLInputElement;
  return h(
    'div',
    {},
    h('p', { class: 'font-semibold text-fg' }, t.nicknameTitle),
    h('p', { class: 'mt-1 text-sm text-mute' }, t.nicknameLead),
    h(
      'form',
      {
        class: 'mt-3 flex flex-col gap-2 sm:flex-row',
        onsubmit: async (e: SubmitEvent) => {
          e.preventDefault();
          const value = input.value.trim();
          const { error } = await sb.from('profiles').upsert({ id: user!.id, nickname: value });
          if (error) return showError(err, error.code === '23505' ? t.nicknameTaken : t.error);
          nickname = value;
          render();
        },
      },
      input,
      h('button', { class: 'btn btn-dark shrink-0' }, t.nicknameSave),
      h('button', { type: 'button', class: 'btn shrink-0', onclick: () => sb.auth.signOut() }, t.logout),
    ),
    err,
  );
}

/** 맨 위 상자: 로그인 상태와 글쓰기 버튼. 노트에서는 로그인한 경우에만 보인다. */
function authBar(): HTMLElement | null {
  if (user && !nickname) return h('div', { class: 'card mb-6 p-4 sm:p-5' }, nicknameForm());
  if (user) {
    return h(
      'div',
      { class: 'card mb-6 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5' },
      h('p', { class: 'text-[15px] text-fg' }, h('strong', {}, nickname!), t.greeting),
      h(
        'div',
        { class: 'flex gap-2' },
        canWrite() && link({ write: '1' }, { class: 'btn btn-dark !min-h-10 !py-2' }, t.write),
        h('button', { type: 'button', class: 'btn !min-h-10 !py-2', onclick: () => sb.auth.signOut() }, t.logout),
      ),
    );
  }
  if (BOARD === 'note') return null;
  return h('div', { class: 'card mb-6 p-4 sm:p-5' }, loginBox(t.loginLead));
}

// ───────────────────────── 목록 ─────────────────────────

function categoryTabs(current: string | null) {
  return h(
    'div',
    { class: 'mb-4 flex flex-wrap gap-1.5', role: 'group', 'aria-label': t.categoryLabel },
    [{ id: '', name: t.all }, ...t.categories].map((c: any) => {
      const on = (current ?? '') === c.id;
      return link(
        c.id ? { category: c.id } : {},
        {
          class: `rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? 'border-navy bg-navy text-white' : 'border-line-strong bg-paper text-mute hover:text-fg'}`,
          'aria-current': on ? 'true' : null,
        },
        c.name,
      );
    }),
  );
}

function communityRow(p: Post) {
  return h(
    'li',
    {},
    link(
      { post: p.id },
      { class: 'card block p-4 transition-colors hover:border-line-strong sm:p-5' },
      h('span', { class: 'flex flex-wrap items-center gap-1.5' }, tags(p)),
      h('span', { class: 'mt-2 block text-[17px] font-semibold leading-snug text-fg' }, p.title),
      h(
        'span',
        { class: 'mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-dim' },
        h('span', { class: 'flex items-center' }, author(p)),
        sep(),
        fmt(p.created_at),
        p.images.length > 0 && [sep(), t.photoCount.replace('{n}', String(p.images.length))],
      ),
    ),
  );
}

function noteRow(p: Post, thumbs: Map<string, string>) {
  const thumb = p.images[0] && thumbs.get(p.images[0]);
  const excerpt = (p.body ?? '').replace(/\s+/g, ' ').trim().slice(0, 140);
  return h(
    'li',
    {},
    link(
      { post: p.id },
      { class: 'card group flex gap-4 p-4 transition-colors hover:border-line-strong sm:gap-5 sm:p-5' },
      h(
        'span',
        { class: 'min-w-0 flex-1' },
        h('span', { class: 'flex flex-wrap items-center gap-1.5' }, tags(p), h('span', { class: 'ml-1 text-[13px] text-dim' }, fmt(p.created_at))),
        h('span', { class: 'mt-2 block font-display text-xl leading-snug text-fg group-hover:underline group-hover:underline-offset-4 sm:text-[22px]' }, p.title),
        excerpt && h('span', { class: 'mt-1.5 line-clamp-2 block text-[15px] leading-relaxed text-mute' }, excerpt),
      ),
      thumb && h('img', { src: thumb, alt: '', loading: 'lazy', class: 'h-20 w-20 shrink-0 rounded-lg border border-line object-cover sm:h-24 sm:w-32' }),
    ),
  );
}

async function listView(box: HTMLElement, cat: string | null, id: number) {
  const list = h('ul', { class: 'space-y-2.5' });
  const more = h('button', { type: 'button', class: 'btn mt-4 hidden w-full sm:w-auto' }, t.more);
  const status = h('p', { class: 'mt-4 text-mute' }, t.loading);
  box.append(categoryTabs(cat), list, status, more);

  let from = 0;
  const load = async () => {
    let q = sb
      .from('posts')
      .select(BOARD === 'note' ? `${POST_FIELDS},body` : POST_FIELDS)
      .eq('board', BOARD)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (cat) q = q.eq('category', cat);
    const { data, error } = await q;
    if (id !== renderId) return;
    if (error) {
      status.textContent = t.error;
      return;
    }
    const rows = (data ?? []) as unknown as Post[];
    const thumbs = BOARD === 'note' ? await signed(rows.map((p) => p.images[0]).filter(Boolean)) : new Map();
    if (id !== renderId) return;
    list.append(...rows.map((p) => (BOARD === 'note' ? noteRow(p, thumbs) : communityRow(p))));
    from += rows.length;
    status.textContent = from === 0 ? t.empty : '';
    status.classList.toggle('hidden', from !== 0);
    more.classList.toggle('hidden', rows.length < PAGE);
  };
  more.addEventListener('click', load);
  await load();
}

// ───────────────────────── 글 보기 ─────────────────────────

async function fetchPost(postId: string) {
  const { data } = await sb.from('posts').select(`${POST_FIELDS},body`).eq('id', postId).eq('board', BOARD).maybeSingle();
  return data as unknown as Post | null;
}

async function detailView(box: HTMLElement, postId: string, id: number) {
  box.append(h('p', { class: 'text-mute' }, t.loading));
  const p = await fetchPost(postId);
  if (id !== renderId) return;
  if (!p) {
    box.replaceChildren(backLink(), h('div', { class: 'mt-4' }, notice(t.notFound)));
    return;
  }
  document.title = `${p.title} | ${t.title} | AI Craft Log`;

  const mine = user?.id === p.author_id;
  const err = alertBox();
  const article = h(
    'article',
    { class: 'card mt-4 p-5 sm:p-8' },
    h('div', { class: 'flex flex-wrap items-center gap-1.5' }, tags(p)),
    h('h2', { class: 'mt-3 font-display text-2xl leading-snug text-fg md:text-[2rem]' }, p.title),
    h(
      'p',
      { class: 'mt-2 flex flex-wrap items-center gap-x-2 text-sm text-dim' },
      h('span', { class: 'flex items-center' }, author(p)),
      sep(),
      fmt(p.created_at),
      p.updated_at && [sep(), t.edited],
    ),
    h('div', { class: 'mt-6 whitespace-pre-wrap border-t border-line pt-6 text-[16px] leading-[1.85] text-fg' }, linkify(p.body ?? '')),
  );

  if (p.images.length) {
    const grid = h('div', { class: BOARD === 'note' ? 'mt-8 space-y-4' : 'mt-6 grid gap-3 sm:grid-cols-2' });
    article.append(grid);
    signed(p.images).then((urls) => {
      for (const path of p.images) {
        const url = urls.get(path);
        if (!url) continue;
        grid.append(
          h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: 'block' }, h('img', { src: url, alt: t.photoAlt, loading: 'lazy', class: 'w-full rounded-lg border border-line' })),
        );
      }
    });
  }

  if (mine || isAdmin()) {
    article.append(
      h(
        'div',
        { class: 'mt-8 flex flex-wrap gap-2 border-t border-line pt-5' },
        mine && link({ edit: p.id }, { class: 'btn !min-h-10 !py-2' }, t.edit),
        mine &&
          h(
            'button',
            {
              type: 'button',
              class: 'btn !min-h-10 !py-2',
              onclick: async () => {
                const { error } = await sb.from('posts').update({ is_public: !p.is_public }).eq('id', p.id);
                if (error) return showError(err, t.error);
                render();
              },
            },
            p.is_public ? t.makePrivate : t.makePublic,
          ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn !min-h-10 !py-2 !text-[#b42318]',
            onclick: async () => {
              if (!confirm(t.deleteConfirm)) return;
              if (p.images.length) await sb.storage.from('board').remove(p.images);
              const { error } = await sb.from('posts').delete().eq('id', p.id);
              if (error) return showError(err, t.error);
              go();
            },
          },
          t.delete,
        ),
      ),
      err,
    );
  }

  box.replaceChildren(backLink(), article, commentsSection(p, id));
}

function commentsSection(p: Post, id: number) {
  const list = h('ul', { class: 'mt-3 divide-y divide-line' });
  const section = h('section', { class: 'card mt-4 p-5 sm:p-8' }, h('h3', { class: 'text-lg font-semibold text-fg' }, t.comments), list);
  const load = async () => {
    const { data: rows } = await sb.from('comments').select('id,body,created_at,author_id,profiles(nickname)').eq('post_id', p.id).order('created_at');
    if (id !== renderId) return;
    const items = ((rows ?? []) as unknown as Comment[]).map((c) =>
      h(
        'li',
        { class: 'py-3.5' },
        h(
          'p',
          { class: 'flex flex-wrap items-center gap-x-2 text-[13px] text-dim' },
          h('strong', { class: 'flex items-center font-semibold text-fg' }, author(c)),
          fmt(c.created_at),
          (user?.id === c.author_id || isAdmin()) &&
            h(
              'button',
              {
                type: 'button',
                class: 'ml-auto text-[13px] font-medium text-dim underline-offset-2 hover:text-[#b42318] hover:underline',
                onclick: async () => {
                  if (!confirm(t.deleteCommentConfirm)) return;
                  await sb.from('comments').delete().eq('id', c.id);
                  load();
                },
              },
              t.delete,
            ),
        ),
        h('p', { class: 'mt-1 whitespace-pre-wrap text-[15px] text-fg' }, linkify(c.body)),
      ),
    );
    list.replaceChildren(...(items.length ? items : [h('li', { class: 'py-3 text-sm text-mute' }, t.noComments)]));
  };

  if (user && nickname) {
    const err = alertBox();
    const ta = h('textarea', { class: FIELD, rows: 3, required: true, maxlength: 1000, placeholder: t.commentPlaceholder, 'aria-label': t.commentPlaceholder }) as HTMLTextAreaElement;
    section.append(
      h(
        'form',
        {
          class: 'mt-3',
          onsubmit: async (e: SubmitEvent) => {
            e.preventDefault();
            const body = ta.value.trim();
            if (!body) return;
            const { error } = await sb.from('comments').insert({ post_id: p.id, body });
            if (error) return showError(err, t.error);
            ta.value = '';
            showError(err, '');
            load();
          },
        },
        ta,
        h('button', { class: 'btn btn-dark mt-2 !min-h-10 !py-2' }, t.commentSubmit),
        err,
      ),
    );
  } else if (user) {
    section.append(h('div', { class: 'mt-4 border-t border-line pt-4' }, nicknameForm()));
  } else {
    section.append(h('div', { class: 'mt-4 border-t border-line pt-4' }, loginBox(t.commentLogin)));
  }
  load();
  return section;
}

// ───────────────────────── 글쓰기 · 고치기 ─────────────────────────

/** 사진을 긴 변 1600px 이하의 WebP(안 되면 JPEG)로 줄인다 */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = (type: string) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, 0.85));
  const webp = await blob('image/webp');
  const out = webp?.type === 'image/webp' ? webp : await blob('image/jpeg');
  if (!out) throw new Error('image');
  return out;
}

async function writeView(box: HTMLElement, preset: string | null, editId: string | null, id: number) {
  if (!canWrite()) {
    box.append(backLink(), h('div', { class: 'mt-4' }, notice(user && nickname ? t.notAllowed : t.writeLogin)));
    return;
  }
  let post: Post | null = null;
  if (editId) {
    post = await fetchPost(editId);
    if (id !== renderId) return;
    if (!post || post.author_id !== user!.id) {
      box.append(backLink(), h('div', { class: 'mt-4' }, notice(t.notFound)));
      return;
    }
  }

  const max = t.maxImages as number;
  const start = post?.category ?? (t.categories.some((c: any) => c.id === preset) ? preset! : t.categories[0].id);
  const err = alertBox();
  const label = (text: string, ...children: Child[]) =>
    h('label', { class: 'block' }, h('span', { class: 'mb-1.5 block text-sm font-semibold text-fg' }, text), ...children);

  const cat = h('select', { class: FIELD, name: 'category' }, t.categories.map((c: any) => h('option', { value: c.id, selected: c.id === start }, c.name))) as HTMLSelectElement;
  const title = h('input', { class: FIELD, name: 'title', required: true, maxlength: 100, placeholder: t.titlePlaceholder }) as HTMLInputElement;
  const body = h('textarea', { class: `${FIELD} leading-relaxed`, name: 'body', rows: BOARD === 'note' ? 18 : 10, required: true, maxlength: t.maxBody, placeholder: t.bodyPlaceholder }) as HTMLTextAreaElement;
  if (post) {
    title.value = post.title;
    body.value = post.body ?? '';
  }

  // 사진: 이미 올린 것(고칠 때) + 새로 고른 것
  let kept = [...(post?.images ?? [])];
  const removed: string[] = [];
  let picked: File[] = [];
  const photoHelp = () => t.photoHelp.replace('{n}', String(max));
  const previews = h('div', { class: 'mt-3 flex flex-wrap gap-2' });
  const files = h('input', { type: 'file', name: 'photos', accept: 'image/*', multiple: true, class: 'block w-full text-sm text-mute file:mr-3 file:rounded-lg file:border file:border-line-strong file:bg-paper file:px-3.5 file:py-2 file:font-semibold file:text-fg' }) as HTMLInputElement;
  const thumbBox = (src: string, onRemove: () => void) =>
    h(
      'div',
      { class: 'relative' },
      h('img', { src, alt: '', class: 'h-20 w-20 rounded-lg border border-line object-cover' }),
      h('button', { type: 'button', class: 'absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-navy text-xs font-bold text-white', 'aria-label': t.photoRemove, onclick: onRemove }, '×'),
    );
  const drawPreviews = async () => {
    const urls = await signed(kept);
    previews.replaceChildren(
      ...kept.map((path) =>
        thumbBox(urls.get(path) ?? '', () => {
          kept = kept.filter((k) => k !== path);
          removed.push(path);
          drawPreviews();
        }),
      ),
      ...picked.map((f, i) => {
        const src = URL.createObjectURL(f);
        return thumbBox(src, () => {
          picked.splice(i, 1);
          drawPreviews();
        });
      }),
    );
    showError(err, kept.length + picked.length > max ? t.tooManyPhotos.replace('{n}', String(max)) : '');
  };
  files.addEventListener('change', () => {
    picked = [...picked, ...(files.files ?? [])];
    files.value = '';
    drawPreviews();
  });
  if (kept.length) drawPreviews();

  // 공개 / 비공개 — 협업 문의는 비공개를 기본으로 하되, 직접 고르면 그 선택을 따른다
  let touched = !!post;
  const radio = (value: string, name: string, desc: string) => {
    const input = h('input', { type: 'radio', name: 'visibility', value, class: 'mt-1 accent-[#131b2e]', onchange: () => (touched = true) }) as HTMLInputElement;
    return {
      input,
      el: h(
        'label',
        { class: 'flex cursor-pointer gap-2.5 rounded-[0.625rem] border border-line-strong bg-paper p-3.5 has-[:checked]:border-navy has-[:checked]:bg-tint' },
        input,
        h('span', {}, h('span', { class: 'block font-semibold text-fg' }, name), h('span', { class: 'block text-[13px] leading-snug text-mute' }, desc)),
      ),
    };
  };
  const pub = radio('public', t.publicName, t.publicDesc);
  const priv = radio('private', t.privateName, t.privateDesc);
  if (post) {
    pub.input.checked = post.is_public;
    priv.input.checked = !post.is_public;
  }
  const syncVisibility = () => {
    if (touched) return;
    priv.input.checked = cat.value === 'collab';
    pub.input.checked = !priv.input.checked;
  };
  cat.addEventListener('change', syncVisibility);
  syncVisibility();

  const submitLabel = post ? t.save : t.submit;
  const submit = h('button', { class: 'btn btn-primary w-full sm:w-auto' }, submitLabel) as HTMLButtonElement;
  const form = h(
    'form',
    {
      class: 'card mt-4 space-y-5 p-5 sm:p-8',
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        if (kept.length + picked.length > max) return showError(err, t.tooManyPhotos.replace('{n}', String(max)));
        submit.disabled = true;
        submit.textContent = t.submitting;
        showError(err, '');
        const fail = (text: string) => {
          showError(err, text);
          submit.disabled = false;
          submit.textContent = submitLabel;
        };

        let blobs: Blob[];
        try {
          blobs = await Promise.all(picked.map(shrink));
        } catch {
          return fail(t.photoError);
        }
        const fields = { category: cat.value, title: title.value.trim(), body: body.value.trim(), is_public: pub.input.checked };
        let postId = post?.id;
        if (!postId) {
          const { data, error } = await sb.from('posts').insert({ ...fields, board: BOARD }).select('id').single();
          if (error || !data) return fail(t.error);
          postId = data.id as string;
        }

        const uploaded: string[] = [];
        for (const blob of blobs) {
          const path = `${user!.id}/${postId}/${crypto.randomUUID().slice(0, 12)}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
          const up = await sb.storage.from('board').upload(path, blob, { contentType: blob.type });
          if (!up.error) uploaded.push(path);
        }
        const images = [...kept, ...uploaded];
        const { error } = post
          ? await sb.from('posts').update({ ...fields, images, updated_at: new Date().toISOString() }).eq('id', postId)
          : uploaded.length
            ? await sb.from('posts').update({ images }).eq('id', postId)
            : { error: null };
        if (error) return fail(t.error);
        if (removed.length) await sb.storage.from('board').remove(removed);
        if (uploaded.length < blobs.length) alert(t.photoPartial);
        go({ post: postId });
      },
    },
    h('h2', { class: 'font-display text-2xl text-fg' }, post ? t.editTitle : t.writeTitle),
    label(t.categoryLabel, cat),
    label(t.titleLabel, title),
    label(t.bodyLabel, body),
    h('div', {}, label(t.photoLabel, files), h('p', { class: 'mt-1.5 text-[13px] text-dim' }, photoHelp()), previews),
    h('fieldset', {}, h('legend', { class: 'mb-1.5 text-sm font-semibold text-fg' }, t.visibilityLabel), h('div', { class: 'grid gap-2 sm:grid-cols-2' }, pub.el, priv.el)),
    h('div', {}, submit, err),
  );
  box.append(backLink(), form);
}

// ───────────────────────── 시작 ─────────────────────────

function render() {
  const id = ++renderId;
  const q = new URLSearchParams(location.search);
  const box = h('div', {});
  root.replaceChildren(...[authBar(), box].filter(Boolean) as HTMLElement[]);
  if (q.has('write') || q.has('edit')) writeView(box, q.get('write'), q.get('edit'), id);
  else if (q.get('post')) detailView(box, q.get('post')!, id);
  else {
    document.title = root.dataset.title ?? document.title;
    listView(box, q.get('category'), id);
  }
}

export async function initBoard() {
  root = document.getElementById('board')!;
  t = JSON.parse(root.dataset.copy!);
  BOARD = root.dataset.board === 'note' ? 'note' : 'community';
  BASE = location.pathname;
  root.dataset.title = document.title;
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    root.replaceChildren(notice(t.notReady));
    return;
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    sb = createClient(url, key);
    const [{ data }, ids] = await Promise.all([sb.auth.getSession(), sb.rpc('admin_ids')]);
    admins = new Set(((ids.data ?? []) as string[]).map(String));
    await setUser(data.session?.user ?? null);
    sb.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      if (next?.id === user?.id) return;
      // 콜백 안에서 바로 Supabase를 다시 부르면 멈출 수 있어 한 박자 늦춘다
      setTimeout(async () => {
        await setUser(next);
        render();
      });
    });
    window.addEventListener('popstate', render);
    render();
  } catch {
    root.replaceChildren(notice(t.error));
  }
}
