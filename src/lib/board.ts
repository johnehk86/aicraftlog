// 게시판 (브라우저에서만 실행). 데이터·로그인·사진은 Supabase가 맡고, 권한은 supabase/schema.sql 의 RLS가 지킨다.
// 사용자가 쓴 글은 항상 textContent 로만 넣는다 (HTML로 해석하지 않음).
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface Post {
  id: string;
  category: string;
  title: string;
  body?: string;
  images: string[];
  is_public: boolean;
  created_at: string;
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
const MAX_IMAGES = 4;
const COLORS: Record<string, string> = {
  free: 'var(--color-blue)',
  question: 'var(--color-accent)',
  collab: 'var(--color-gold)',
};
const FIELD =
  'w-full rounded-[0.625rem] border border-line-strong bg-paper px-3.5 py-2.5 text-[15px] text-fg placeholder:text-dim';

let sb: SupabaseClient;
let root: HTMLElement;
let t: any;
let user: User | null = null;
let nickname: string | null = null;
let admins = new Set<string>();
let renderId = 0;

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
const catName = (id: string) => t.categories.find((c: any) => c.id === id)?.name ?? id;
const isAdmin = () => !!user && admins.has(user.id);

function go(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  history.pushState(null, '', qs ? `/board?${qs}` : '/board');
  render();
  window.scrollTo({ top: 0 });
}
/** 새로고침 없이 이동하는 링크 */
function link(params: Record<string, string>, attrs: Record<string, any>, ...children: Child[]) {
  const qs = new URLSearchParams(params).toString();
  return h(
    'a',
    {
      href: qs ? `/board?${qs}` : '/board',
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

const notice = (text: string) => h('p', { class: 'card px-5 py-10 text-center text-mute' }, text);
const alertBox = () => h('p', { class: 'mt-3 hidden text-sm font-medium text-[#b42318]', role: 'alert' });
function showError(box: HTMLElement, text: string) {
  box.textContent = text;
  box.classList.toggle('hidden', !text);
}

function tags(p: Post) {
  return [
    h('span', { class: 'tag', style: `--p:${COLORS[p.category] ?? ''}` }, catName(p.category)),
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

// ───────────────────────── 로그인 영역 ─────────────────────────

async function setUser(u: User | null) {
  user = u;
  nickname = null;
  if (u) {
    const { data } = await sb.from('profiles').select('nickname').eq('id', u.id).maybeSingle();
    nickname = data?.nickname ?? null;
  }
}

function authBar() {
  const bar = h('div', { class: 'card mb-6 p-4 sm:p-5' });

  if (user && nickname) {
    bar.append(
      h(
        'div',
        { class: 'flex flex-wrap items-center justify-between gap-3' },
        h('p', { class: 'text-[15px] text-fg' }, h('strong', {}, nickname), t.greeting),
        h(
          'div',
          { class: 'flex gap-2' },
          link({ write: '1' }, { class: 'btn btn-dark !min-h-10 !py-2' }, t.write),
          h('button', { type: 'button', class: 'btn !min-h-10 !py-2', onclick: () => sb.auth.signOut() }, t.logout),
        ),
      ),
    );
    return bar;
  }

  if (user) {
    // 첫 로그인: 닉네임 정하기
    const err = alertBox();
    const input = h('input', { class: FIELD, name: 'nickname', required: true, minlength: 2, maxlength: 20, autocomplete: 'nickname', placeholder: t.nicknamePlaceholder, 'aria-label': t.nicknameLabel });
    bar.append(
      h('p', { class: 'font-semibold text-fg' }, t.nicknameTitle),
      h('p', { class: 'mt-1 text-sm text-mute' }, t.nicknameLead),
      h(
        'form',
        {
          class: 'mt-3 flex flex-col gap-2 sm:flex-row',
          onsubmit: async (e: SubmitEvent) => {
            e.preventDefault();
            const value = (input as HTMLInputElement).value.trim();
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
    return bar;
  }

  // 로그인 전
  const err = alertBox();
  const info = h('p', { class: 'mt-3 hidden text-sm font-medium text-accent', role: 'status' });
  const redirectTo = `${location.origin}/board`;
  const email = h('input', { class: FIELD, type: 'email', name: 'email', required: true, autocomplete: 'email', placeholder: t.emailPlaceholder, 'aria-label': t.emailLabel });
  const panel = h(
    'div',
    { class: 'mt-4 hidden border-t border-line pt-4', id: 'login-panel' },
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
      'aria-controls': 'login-panel',
      onclick: () => {
        const open = panel.classList.toggle('hidden') === false;
        toggle.setAttribute('aria-expanded', String(open));
        if (open) (email as HTMLInputElement).focus?.();
      },
    },
    t.login,
  );
  bar.append(
    h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, h('p', { class: 'text-[15px] text-mute' }, t.loginLead), toggle),
    panel,
  );
  return bar;
}

// ───────────────────────── 목록 ─────────────────────────

async function listView(box: HTMLElement, category: string | null, id: number) {
  const tabs = h(
    'div',
    { class: 'flex flex-wrap gap-1.5', role: 'group', 'aria-label': t.categoryLabel },
    [{ id: '', name: t.all }, ...t.categories].map((c: any) => {
      const on = (category ?? '') === c.id;
      return link(c.id ? { category: c.id } : {}, {
        class: `rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? 'border-navy bg-navy text-white' : 'border-line-strong bg-paper text-mute hover:text-fg'}`,
        'aria-current': on ? 'true' : null,
      }, c.name);
    }),
  );
  const list = h('ul', { class: 'mt-4 space-y-2.5' });
  const more = h('button', { type: 'button', class: 'btn mt-4 hidden w-full sm:w-auto' }, t.more);
  const status = h('p', { class: 'mt-4 text-mute' }, t.loading);
  box.append(tabs, list, status, more);

  let from = 0;
  const load = async () => {
    let q = sb
      .from('posts')
      .select('id,category,title,images,is_public,created_at,author_id,profiles(nickname)')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (id !== renderId) return;
    if (error) {
      status.textContent = t.error;
      return;
    }
    const rows = (data ?? []) as unknown as Post[];
    for (const p of rows) {
      list.append(
        h(
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
              h('span', { 'aria-hidden': 'true' }, '·'),
              fmt(p.created_at),
              p.images.length > 0 && [h('span', { 'aria-hidden': 'true' }, '·'), t.photoCount.replace('{n}', String(p.images.length))],
            ),
          ),
        ),
      );
    }
    from += rows.length;
    status.textContent = from === 0 ? t.empty : '';
    status.classList.toggle('hidden', from !== 0);
    more.classList.toggle('hidden', rows.length < PAGE);
  };
  more.addEventListener('click', load);
  await load();
}

// ───────────────────────── 글 보기 ─────────────────────────

async function detailView(box: HTMLElement, postId: string, id: number) {
  box.append(h('p', { class: 'text-mute' }, t.loading));
  const { data } = await sb
    .from('posts')
    .select('id,category,title,body,images,is_public,created_at,author_id,profiles(nickname)')
    .eq('id', postId)
    .maybeSingle();
  if (id !== renderId) return;
  const back = link({}, { class: 'inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-fg' }, h('span', { 'aria-hidden': 'true' }, '←'), t.back);
  const p = data as unknown as Post | null;
  if (!p) {
    box.replaceChildren(back, h('div', { class: 'mt-4' }, notice(t.notFound)));
    return;
  }

  const mine = user?.id === p.author_id;
  const err = alertBox();
  const article = h(
    'article',
    { class: 'card mt-4 p-5 sm:p-8' },
    h('div', { class: 'flex flex-wrap items-center gap-1.5' }, tags(p)),
    h('h2', { class: 'mt-3 font-display text-2xl leading-snug text-fg md:text-3xl' }, p.title),
    h('p', { class: 'mt-2 flex flex-wrap items-center gap-x-2 text-sm text-dim' }, h('span', { class: 'flex items-center' }, author(p)), h('span', { 'aria-hidden': 'true' }, '·'), fmt(p.created_at)),
    h('p', { class: 'mt-6 whitespace-pre-wrap border-t border-line pt-6 leading-[1.8] text-fg' }, p.body ?? ''),
  );

  if (p.images.length) {
    const grid = h('div', { class: 'mt-6 grid gap-3 sm:grid-cols-2' });
    article.append(grid);
    sb.storage
      .from('board')
      .createSignedUrls(p.images, 3600)
      .then(({ data: urls }) => {
        for (const u of urls ?? []) {
          if (!u.signedUrl) continue;
          grid.append(
            h('a', { href: u.signedUrl, target: '_blank', rel: 'noopener noreferrer' }, h('img', { src: u.signedUrl, alt: t.photoAlt, loading: 'lazy', class: 'w-full rounded-lg border border-line' })),
          );
        }
      });
  }

  if (mine || isAdmin()) {
    article.append(
      h(
        'div',
        { class: 'mt-8 flex flex-wrap gap-2 border-t border-line pt-5' },
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

  // 댓글
  const list = h('ul', { class: 'mt-3 divide-y divide-line' });
  const section = h('section', { class: 'card mt-4 p-5 sm:p-8' }, h('h3', { class: 'text-lg font-semibold text-fg' }, t.comments), list);
  const loadComments = async () => {
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
                  loadComments();
                },
              },
              t.delete,
            ),
        ),
        h('p', { class: 'mt-1 whitespace-pre-wrap text-[15px] text-fg' }, c.body),
      ),
    );
    list.replaceChildren(...(items.length ? items : [h('li', { class: 'py-3 text-sm text-mute' }, t.noComments)]));
  };
  if (user && nickname) {
    const cErr = alertBox();
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
            if (error) return showError(cErr, t.error);
            ta.value = '';
            showError(cErr, '');
            loadComments();
          },
        },
        ta,
        h('button', { class: 'btn btn-dark mt-2 !min-h-10 !py-2' }, t.commentSubmit),
        cErr,
      ),
    );
  } else {
    section.append(h('p', { class: 'mt-3 text-sm text-mute' }, t.commentLogin));
  }

  box.replaceChildren(back, article, section);
  loadComments();
}

// ───────────────────────── 글쓰기 ─────────────────────────

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

function writeView(box: HTMLElement, preset: string | null) {
  const back = link({}, { class: 'inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-fg' }, h('span', { 'aria-hidden': 'true' }, '←'), t.back);
  if (!user || !nickname) {
    box.append(back, h('div', { class: 'mt-4' }, notice(t.writeLogin)));
    return;
  }
  const start = t.categories.some((c: any) => c.id === preset) ? preset! : t.categories[0].id;
  const err = alertBox();
  const label = (text: string, ...children: Child[]) => h('label', { class: 'block' }, h('span', { class: 'mb-1.5 block text-sm font-semibold text-fg' }, text), ...children);

  const category = h('select', { class: FIELD, name: 'category' }, t.categories.map((c: any) => h('option', { value: c.id, selected: c.id === start }, c.name))) as HTMLSelectElement;
  const title = h('input', { class: FIELD, name: 'title', required: true, maxlength: 100, placeholder: t.titlePlaceholder }) as HTMLInputElement;
  const body = h('textarea', { class: FIELD, name: 'body', rows: 10, required: true, maxlength: 5000, placeholder: t.bodyPlaceholder }) as HTMLTextAreaElement;
  const files = h('input', { type: 'file', name: 'photos', accept: 'image/*', multiple: true, class: 'block w-full text-sm text-mute file:mr-3 file:rounded-lg file:border file:border-line-strong file:bg-paper file:px-3.5 file:py-2 file:font-semibold file:text-fg' }) as HTMLInputElement;
  const previews = h('div', { class: 'mt-3 flex flex-wrap gap-2' });
  files.addEventListener('change', () => {
    previews.replaceChildren();
    const picked = [...(files.files ?? [])];
    showError(err, picked.length > MAX_IMAGES ? t.tooManyPhotos : '');
    for (const f of picked.slice(0, MAX_IMAGES)) {
      const img = h('img', { src: URL.createObjectURL(f), alt: f.name, class: 'h-20 w-20 rounded-lg border border-line object-cover' }) as HTMLImageElement;
      img.onload = () => URL.revokeObjectURL(img.src);
      previews.append(img);
    }
  });

  // 공개 / 비공개 — 협업 문의는 비공개를 기본으로 하되, 직접 고르면 그 선택을 따른다
  let touched = false;
  const radio = (value: string, name: string, desc: string) => {
    const input = h('input', { type: 'radio', name: 'visibility', value, class: 'mt-1 accent-[#131b2e]', onchange: () => (touched = true) }) as HTMLInputElement;
    return { input, el: h('label', { class: 'flex cursor-pointer gap-2.5 rounded-[0.625rem] border border-line-strong bg-paper p-3.5 has-[:checked]:border-navy has-[:checked]:bg-tint' }, input, h('span', {}, h('span', { class: 'block font-semibold text-fg' }, name), h('span', { class: 'block text-[13px] leading-snug text-mute' }, desc))) };
  };
  const pub = radio('public', t.publicName, t.publicDesc);
  const priv = radio('private', t.privateName, t.privateDesc);
  const syncVisibility = () => {
    if (touched) return;
    priv.input.checked = category.value === 'collab';
    pub.input.checked = !priv.input.checked;
  };
  category.addEventListener('change', syncVisibility);
  syncVisibility();

  const submit = h('button', { class: 'btn btn-primary w-full sm:w-auto' }, t.submit) as HTMLButtonElement;
  const form = h(
    'form',
    {
      class: 'card mt-4 space-y-5 p-5 sm:p-8',
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        const picked = [...(files.files ?? [])];
        if (picked.length > MAX_IMAGES) return showError(err, t.tooManyPhotos);
        submit.disabled = true;
        submit.textContent = t.submitting;
        showError(err, '');
        const fail = (text: string) => {
          showError(err, text);
          submit.disabled = false;
          submit.textContent = t.submit;
        };

        let blobs: Blob[];
        try {
          blobs = await Promise.all(picked.map(shrink));
        } catch {
          return fail(t.photoError);
        }
        const { data: post, error } = await sb
          .from('posts')
          .insert({ category: category.value, title: title.value.trim(), body: body.value.trim(), is_public: pub.input.checked })
          .select('id')
          .single();
        if (error || !post) return fail(t.error);

        const paths: string[] = [];
        for (const [i, blob] of blobs.entries()) {
          const path = `${user!.id}/${post.id}/${i}-${crypto.randomUUID().slice(0, 8)}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
          const up = await sb.storage.from('board').upload(path, blob, { contentType: blob.type });
          if (!up.error) paths.push(path);
        }
        if (paths.length) await sb.from('posts').update({ images: paths }).eq('id', post.id);
        if (paths.length < blobs.length) alert(t.photoPartial);
        go({ post: post.id });
      },
    },
    h('h2', { class: 'font-display text-2xl text-fg' }, t.writeTitle),
    label(t.categoryLabel, category),
    label(t.titleLabel, title),
    label(t.bodyLabel, body),
    h('div', {}, label(t.photoLabel, files), h('p', { class: 'mt-1.5 text-[13px] text-dim' }, t.photoHelp), previews),
    h('fieldset', {}, h('legend', { class: 'mb-1.5 text-sm font-semibold text-fg' }, t.visibilityLabel), h('div', { class: 'grid gap-2 sm:grid-cols-2' }, pub.el, priv.el)),
    h('div', {}, submit, err),
  );
  box.append(back, form);
}

// ───────────────────────── 시작 ─────────────────────────

function render() {
  const id = ++renderId;
  const q = new URLSearchParams(location.search);
  const box = h('div', {});
  root.replaceChildren(authBar(), box);
  if (q.has('write')) writeView(box, q.get('write'));
  else if (q.get('post')) detailView(box, q.get('post')!, id);
  else listView(box, q.get('category'), id);
}

export async function initBoard() {
  root = document.getElementById('board')!;
  t = JSON.parse(root.dataset.copy!);
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
