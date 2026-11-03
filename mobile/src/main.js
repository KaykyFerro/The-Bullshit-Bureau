import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

const SITE_URL = 'https://kaykyferro.github.io/The-Bullshit-Bureau/';
const CONTENT_URL = new URL('docs/', SITE_URL);
const main = document.querySelector('#main-content');
const toastNode = document.querySelector('#toast');
const native = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

const state = {
  posts: [],
  favorites: [],
  offlineSlugs: [],
  offlinePosts: {},
  tab: 'home',
  section: 'all',
  view: 'home',
  currentPost: null,
  search: '',
  readerMode: false,
  notificationsEnabled: false,
  site: { name: 'The Bullshit Bureau', slogan: 'A verdade acima da ideologia.', description: '' },
  config: {},
  pushToken: ''
};

const allowedTags = new Set([
  'P','H2','H3','H4','STRONG','B','EM','I','UL','OL','LI',
  'BLOCKQUOTE','HR','BR','A','IMG','FIGURE','FIGCAPTION',
  'TABLE','THEAD','TBODY','TR','TH','TD','SUP','SUB','CODE','PRE'
]);

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function slugNumber(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 2147483647) || 1;
}

async function getPref(key, fallback) {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

async function setPref(key, value) {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

function localAsset(path) {
  return new URL(path.replace(/^\/+/, ''), import.meta.env.BASE_URL || './').href;
}

function coverUrl(value) {
  const path = String(value || '').trim();
  if (!path) return localAsset('assets/site-images/press-engraving.svg');
  if (/^https?:\/\//i.test(path) || path.startsWith('data:image/')) return path;
  const repoPrefix = '/The-Bullshit-Bureau/';
  if (path.startsWith(repoPrefix)) {
    let relative = path.slice(repoPrefix.length);
    if (relative.startsWith('docs/')) relative = relative.slice(5);
    return new URL(relative, CONTENT_URL).href;
  }
  if (path.startsWith('/')) return new URL(path.slice(1), CONTENT_URL).href;
  return new URL(path, CONTENT_URL).href;
}

function dateLabel(value) {
  if (!value) return 'Data não informada';
  const date = new Date(String(value).slice(0, 10) + 'T12:00:00');
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function toast(message) {
  toastNode.textContent = message;
  toastNode.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastNode.classList.remove('visible'), 2600);
}

function updateHeader() {
  document.querySelector('#edition-date').textContent =
    `EDIÇÃO DIGITAL · ${state.posts.length} PUBLICAÇÕES`;
  document.querySelector('#connection-state').textContent =
    navigator.onLine ? 'ONLINE' : 'MODO OFFLINE';
  document.querySelector('.masthead-slogan').textContent = state.site.slogan || 'A verdade acima da ideologia.';
  document.title = state.site.name || 'The Bullshit Bureau';
}

function safeRichText(markup) {
  const parsed = new DOMParser().parseFromString(String(markup || ''), 'text/html');
  const clean = (parent) => {
    [...parent.children].forEach((element) => {
      const tag = element.tagName;
      if (!allowedTags.has(tag)) {
        if (['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM'].includes(tag)) element.remove();
        else element.replaceWith(...[...element.childNodes]);
        return;
      }
      const keep = tag === 'A' ? new Set(['href','title'])
        : tag === 'IMG' ? new Set(['src','alt','title'])
        : ['TH','TD'].includes(tag) ? new Set(['colspan','rowspan']) : new Set();
      [...element.attributes].forEach((attribute) => {
        if (!keep.has(attribute.name.toLowerCase())) element.removeAttribute(attribute.name);
      });
      if (tag === 'A') {
        const href = String(element.getAttribute('href') || '').trim();
        if (/^https:\/\//i.test(href)) {
          element.setAttribute('href', href);
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noopener noreferrer');
        } else {
          element.removeAttribute('href');
        }
      }
      if (tag === 'IMG') {
        const src = element.getAttribute('src');
        if (!src) element.remove();
        else {
          element.setAttribute('src', coverUrl(src));
          element.setAttribute('loading', 'lazy');
        }
      }
      clean(element);
    });
  };
  clean(parsed.body);
  return parsed.body.innerHTML;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
  return response.json();
}

async function loadInitialContent() {
  const [cachedPosts, cachedSite, bundledPosts, bundledSite, config] = await Promise.all([
    getPref('news-cache', null),
    getPref('site-cache', null),
    fetch('./data/posts.json').then((r) => r.ok ? r.json() : []).catch(() => []),
    fetch('./data/site.json').then((r) => r.ok ? r.json() : null).catch(() => null),
    fetch('./app-config.json').then((r) => r.ok ? r.json() : {}).catch(() => ({}))
  ]);
  state.config = config || {};
  state.posts = (cachedPosts || bundledPosts || []).filter((post) => post?.status === 'published');
  state.site = cachedSite || bundledSite || state.site;
  state.favorites = await getPref('favorites', []);
  state.offlineSlugs = await getPref('offline-slugs', []);
  state.readerMode = await getPref('reader-mode', false);
  state.notificationsEnabled = await getPref('notifications-enabled', false);
  state.offlinePosts = await readOfflinePosts();
  document.body.classList.toggle('reader-mode', state.readerMode);
  updateHeader();
  render();
}

async function readOfflinePosts() {
  const slugs = await getPref('offline-slugs', []);
  const saved = {};
  for (const slug of slugs) {
    try {
      const file = await Filesystem.readFile({ path: `offline/${slug}.json`, directory: Directory.Data });
      const raw = typeof file.data === 'string' ? file.data : '';
      if (!raw) continue;
      const post = JSON.parse(raw);
      try {
        const cover = await Filesystem.readFile({ path: `offline/covers/${slug}.jpg`, directory: Directory.Data });
        if (typeof cover.data === 'string') post.offlineCover = `data:image/jpeg;base64,${cover.data}`;
      } catch { /* A matéria permanece offline mesmo sem a fotografia. */ }
      saved[slug] = post;
    } catch { /* Ignora arquivos offline removidos ou incompletos. */ }
  }
  return saved;
}

async function refreshFeed({ silent = false } = {}) {
  if (!navigator.onLine) {
    if (!silent) toast('Sem conexão. Mostrando o conteúdo salvo.');
    return;
  }
  try {
    const [remotePosts, remoteSite] = await Promise.all([
      fetchJson(state.config.feedUrl || new URL('data/posts.json', CONTENT_URL).href + `?v=${Date.now()}`),
      fetchJson(state.config.siteInfoUrl || new URL('data/site.json', CONTENT_URL).href + `?v=${Date.now()}`).catch(() => state.site)
    ]);
    const published = Array.isArray(remotePosts)
      ? remotePosts.filter((post) => post?.status === 'published' && post.slug)
        .sort((a,b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
      : [];
    const known = await getPref('known-published-slugs', null);
    if (known === null) {
      await setPref('known-published-slugs', published.map((post) => post.slug));
    } else {
      const previous = new Set(known);
      const newPosts = published.filter((post) => !previous.has(post.slug));
      if (newPosts.length && state.notificationsEnabled) await notifyNewPosts(newPosts);
      await setPref('known-published-slugs', published.map((post) => post.slug));
    }
    state.posts = published;
    state.site = remoteSite || state.site;
    await Promise.all([
      setPref('news-cache', published),
      setPref('site-cache', state.site),
      setPref('last-sync', new Date().toISOString())
    ]);
    updateHeader();
    render();
    if (!silent) toast('Jornal atualizado.');
  } catch (error) {
    console.warn('Não foi possível atualizar o jornal:', error);
    if (!silent) toast('Não foi possível atualizar. Mantendo a última edição salva.');
  }
}

function postUrl(post) {
  return `${SITE_URL}?post=${encodeURIComponent(post.slug)}`;
}

function storyCard(post, compact = false) {
  const isFavorite = state.favorites.includes(post.slug);
  const cover = post.offlineCover || coverUrl(post.cover);
  return `
    <article class="story-card ${compact ? 'compact' : ''}" data-open="${escapeHtml(post.slug)}">
      <button class="story-image-button" data-open="${escapeHtml(post.slug)}" aria-label="Abrir ${escapeHtml(post.title)}">
        <img class="story-image" src="${cover}" alt="${escapeHtml(post.coverAlt || post.title)}" loading="lazy"
          onerror="this.onerror=null;this.src='${localAsset('assets/site-images/press-engraving.svg')}'">
      </button>
      <div class="story-copy">
        <span class="story-category">${escapeHtml(post.category || 'Jornal')}</span>
        <button class="story-title-button" data-open="${escapeHtml(post.slug)}">${escapeHtml(post.title)}</button>
        ${compact ? '' : `<p class="story-excerpt">${escapeHtml(post.excerpt || post.subtitle || '')}</p>`}
        <div class="story-meta"><span>${escapeHtml(post.author || 'Redação')}</span><span>${dateLabel(post.publishedAt)}</span></div>
        <div class="story-actions">
          <button class="small-action ${isFavorite ? 'selected' : ''}" data-action="favorite" data-slug="${escapeHtml(post.slug)}" aria-label="Favoritar matéria">${isFavorite ? '♥ Salvo' : '♡ Favoritar'}</button>
          <button class="small-action" data-action="share" data-slug="${escapeHtml(post.slug)}">↗ Compartilhar</button>
        </div>
      </div>
    </article>`;
}

function renderHome() {
  const selected = state.posts.filter((post) => state.section === 'all' || post.section === state.section);
  const featured = selected.find((post) => post.featured) || selected[0];
  const rest = selected.filter((post) => post.slug !== featured?.slug);
  const label = state.section === 'all' ? 'Manchete principal' : (state.section || '').toUpperCase();
  main.innerHTML = `
    <div class="search-row">
      <label class="search-box">
        <span aria-hidden="true">⌕</span>
        <input id="news-search" type="search" placeholder="Buscar no jornal..." value="${escapeHtml(state.search)}">
      </label>
      <span class="article-count">${selected.length} matérias</span>
    </div>
    ${featured ? `
      <section class="front-page">
        <p class="section-kicker">${escapeHtml(label)}</p>
        ${storyCard(featured)}
      </section>
      <section class="latest-section">
        <div class="section-heading"><span>Últimas publicações</span><i></i></div>
        <div class="story-list">${rest.map((post) => storyCard(post, true)).join('')}</div>
      </section>` : '<div class="empty-state">Nenhuma publicação nesta editoria.</div>'}
  `;
  const search = document.querySelector('#news-search');
  search?.addEventListener('input', () => {
    state.search = search.value;
    renderSearchResults();
  });
  if (state.search) renderSearchResults();
}

function renderSearchResults() {
  const section = main.querySelector('.front-page');
  const latest = main.querySelector('.latest-section');
  const q = state.search.trim().toLocaleLowerCase('pt-BR');
  const found = state.posts.filter((post) => {
    if (state.section !== 'all' && post.section !== state.section) return false;
    const content = [post.title, post.subtitle, post.excerpt, post.category, post.author, post.body]
      .join(' ').replace(/<[^>]+>/g, ' ').toLocaleLowerCase('pt-BR');
    return !q || content.includes(q);
  });
  if (section) section.hidden = Boolean(q);
  if (latest) {
    latest.innerHTML = `
      <div class="section-heading"><span>${q ? 'Resultados da busca' : 'Últimas publicações'}</span><i></i></div>
      <p class="search-count">${found.length} resultado(s)</p>
      <div class="story-list">${found.map((post) => storyCard(post, true)).join('')}</div>`;
  }
}

function renderCollection(kind) {
  const slugs = kind === 'favorites' ? state.favorites : state.offlineSlugs;
  const posts = slugs.map((slug) => state.offlinePosts[slug] || state.posts.find((post) => post.slug === slug)).filter(Boolean);
  const title = kind === 'favorites' ? 'Suas matérias favoritas' : 'Leitura offline';
  const subtitle = kind === 'favorites'
    ? 'Publicações que você marcou para encontrar depois.'
    : 'Matérias guardadas neste aparelho para ler sem internet.';
  main.innerHTML = `
    <header class="screen-heading"><p class="section-kicker">Minha biblioteca</p><h1>${title}</h1><p>${subtitle}</p></header>
    ${posts.length ? `<div class="story-list">${posts.map((post) => storyCard(post, true)).join('')}</div>`
      : `<div class="empty-state"><strong>${kind === 'favorites' ? 'Nenhum favorito ainda.' : 'Nenhuma matéria salva offline.'}</strong><p>${kind === 'favorites' ? 'Use o coração em uma matéria para guardá-la aqui.' : 'Abra uma matéria e toque em “Salvar offline”.'}</p></div>`}
  `;
}

function renderSettings() {
  main.innerHTML = `
    <header class="screen-heading"><p class="section-kicker">Preferências</p><h1>Ajustes do jornal</h1><p>Configure a leitura e os avisos de novas publicações.</p></header>
    <section class="settings-card">
      <div class="setting-row">
        <div><strong>Modo leitura</strong><p>Texto maior, coluna mais estreita e menos distrações.</p></div>
        <button class="toggle ${state.readerMode ? 'on' : ''}" data-action="reader-mode" aria-pressed="${state.readerMode}"><span></span></button>
      </div>
      <div class="setting-row">
        <div><strong>Notificações de novas matérias</strong><p>Receba avisos quando uma nova publicação for disponibilizada.</p></div>
        <button class="paper-button" data-action="enable-notifications">${state.notificationsEnabled ? 'Desativar' : 'Ativar'}</button>
      </div>
      <div class="setting-row">
        <div><strong>Atualização do jornal</strong><p>As notícias são sincronizadas com o site e o Pages CMS.</p></div>
        <button class="paper-button secondary" data-action="refresh">Atualizar agora</button>
      </div>
      <div class="setting-row">
        <div><strong>Armazenamento offline</strong><p>${state.offlineSlugs.length} matéria(s) salva(s) neste aparelho.</p></div>
        <button class="paper-button secondary" data-action="clear-offline">Limpar</button>
      </div>
    </section>
    <p class="settings-note">The Bullshit Bureau · A verdade acima da ideologia.</p>
    <p class="settings-version">Aplicativo 1.0.0 · ${native ? platform.toUpperCase() : 'WEB PREVIEW'}</p>
  `;
}

function renderArticle(post) {
  state.currentPost = post;
  state.view = 'article';
  const favorite = state.favorites.includes(post.slug);
  const offline = state.offlineSlugs.includes(post.slug);
  const cover = post.offlineCover || coverUrl(post.cover);
  const source = post.coverCreditUrl && /^https:\/\//i.test(post.coverCreditUrl)
    ? `<a href="${escapeHtml(post.coverCreditUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.coverCredit || 'Fonte da imagem')}</a>`
    : escapeHtml(post.coverCredit || '');
  const license = post.coverLicenseUrl && /^https:\/\//i.test(post.coverLicenseUrl)
    ? ` · <a href="${escapeHtml(post.coverLicenseUrl)}" target="_blank" rel="noopener noreferrer">licença</a>` : '';
  main.innerHTML = `
    <button class="back-button" data-action="back">← Voltar à edição</button>
    <article class="reader-article">
      <header class="reader-header">
        <span class="story-category">${escapeHtml(post.category || 'Jornalismo')} · ${escapeHtml(post.section || '')}</span>
        <h1>${escapeHtml(post.title)}</h1>
        ${post.subtitle ? `<p class="reader-subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
        <div class="reader-byline">Por ${escapeHtml(post.author || 'Redação')} · ${dateLabel(post.publishedAt)}</div>
      </header>
      <img class="reader-cover" src="${cover}" alt="${escapeHtml(post.coverAlt || post.title)}"
        onerror="this.onerror=null;this.src='${localAsset('assets/site-images/press-engraving.svg')}'">
      ${source ? `<p class="image-credit">Imagem: ${source}${license}</p>` : ''}
      <div class="reader-toolbar">
        <button data-action="favorite" data-slug="${escapeHtml(post.slug)}" class="${favorite ? 'selected' : ''}">${favorite ? '♥ Favoritada' : '♡ Favoritar'}</button>
        <button data-action="share" data-slug="${escapeHtml(post.slug)}">↗ Compartilhar</button>
        <button data-action="offline" data-slug="${escapeHtml(post.slug)}">${offline ? '✓ Salva offline' : '↓ Salvar offline'}</button>
        <button data-action="reader-mode">${state.readerMode ? 'Sair do modo leitura' : 'Modo leitura'}</button>
      </div>
      <div class="reader-body">${safeRichText(post.body)}</div>
      <p class="article-endnote">The Bullshit Bureau · A verdade acima da ideologia.</p>
    </article>`;
}

function render() {
  document.body.classList.toggle('reader-mode', state.readerMode);
  document.querySelectorAll('.bottom-item').forEach((button) => button.classList.toggle('active', button.dataset.tab === state.tab));
  document.querySelectorAll('.section-tab').forEach((button) => button.classList.toggle('active', button.dataset.section === state.section));
  if (state.view === 'article' && state.currentPost) renderArticle(state.currentPost);
  else if (state.tab === 'favorites') renderCollection('favorites');
  else if (state.tab === 'offline') renderCollection('offline');
  else if (state.tab === 'settings') renderSettings();
  else renderHome();
}

async function toggleFavorite(slug) {
  state.favorites = state.favorites.includes(slug)
    ? state.favorites.filter((item) => item !== slug)
    : [...state.favorites, slug];
  await setPref('favorites', state.favorites);
  render();
  toast(state.favorites.includes(slug) ? 'Matéria adicionada aos favoritos.' : 'Matéria removida dos favoritos.');
}

function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function saveOffline(slug) {
  const post = state.posts.find((item) => item.slug === slug) || state.offlinePosts[slug];
  if (!post) return;
  toast('Salvando matéria neste aparelho...');
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-');
  const stored = { ...post, offlineCover: undefined };
  await Filesystem.writeFile({
    path: `offline/${safeSlug}.json`,
    data: JSON.stringify(stored),
    directory: Directory.Data,
    recursive: true
  });
  try {
    const response = await fetch(coverUrl(post.cover), { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size < 8 * 1024 * 1024) {
        const base64 = await toBase64(blob);
        await Filesystem.writeFile({
          path: `offline/covers/${safeSlug}.jpg`,
          data: base64,
          directory: Directory.Data,
          recursive: true
        });
      }
    }
  } catch (error) {
    console.info('Capa não foi armazenada offline:', error);
  }
  if (!state.offlineSlugs.includes(slug)) state.offlineSlugs.push(slug);
  state.offlinePosts = await readOfflinePosts();
  await setPref('offline-slugs', state.offlineSlugs);
  render();
  toast('Matéria salva para leitura offline.');
}

async function removeOffline(slug) {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-');
  for (const path of [`offline/${safeSlug}.json`, `offline/covers/${safeSlug}.jpg`]) {
    try { await Filesystem.deleteFile({ path, directory: Directory.Data }); } catch { /* Arquivo já removido. */ }
  }
  state.offlineSlugs = state.offlineSlugs.filter((item) => item !== slug);
  delete state.offlinePosts[slug];
  await setPref('offline-slugs', state.offlineSlugs);
  render();
  toast('Matéria removida do armazenamento offline.');
}

async function clearOffline() {
  for (const slug of [...state.offlineSlugs]) await removeOffline(slug);
  toast('Armazenamento offline limpo.');
}

async function sharePost(slug) {
  const post = state.posts.find((item) => item.slug === slug) || state.offlinePosts[slug];
  if (!post) return;
  const url = postUrl(post);
  try {
    if (native || (await Share.canShare()).value) {
      await Share.share({
        title: post.title,
        text: `${post.title}\n${post.excerpt || post.subtitle || ''}`,
        url,
        dialogTitle: 'Compartilhar matéria'
      });
    } else if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt || post.subtitle || '', url });
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copiado.');
    }
  } catch (error) {
    if (error?.name !== 'AbortError') toast('Não foi possível abrir o compartilhamento.');
  }
}

async function notifyNewPosts(posts) {
  if (!native || !posts.length) return;
  try {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return;
    await LocalNotifications.schedule({
      notifications: posts.slice(0, 3).map((post) => ({
        id: slugNumber(post.slug),
        title: 'Nova edição do The Bullshit Bureau',
        body: post.title,
        schedule: { at: new Date(Date.now() + 1800) },
        extra: { slug: post.slug }
      }))
    });
  } catch (error) {
    console.warn('Notificação local não foi agendada:', error);
  }
}

let pushListenersReady = false;
async function setupPushListeners() {
  if (!native || pushListenersReady) return;
  pushListenersReady = true;
  await PushNotifications.addListener('registration', async (token) => {
    state.pushToken = token.value;
    await setPref('pending-push-token', { token: token.value, platform });
    const endpoint = String(state.config.pushApiUrl || '').replace(/\/$/, '');
    if (!endpoint) {
      toast('Permissão concedida. O serviço de envio push ainda precisa ser configurado.');
      return;
    }
    try {
      await fetch(`${endpoint}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value, platform })
      });
      toast('Dispositivo inscrito para receber novas notícias.');
    } catch {
      toast('Permissão ativada; não foi possível registrar o dispositivo no servidor.');
    }
  });
  await PushNotifications.addListener('registrationError', (error) => {
    console.error('Falha no registro push:', error);
    toast('Não foi possível registrar as notificações.');
  });
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    toast(notification.title || 'Nova notícia disponível.');
  });
  await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {\n    const slug = event.notification?.extra?.slug;\n    const post = state.posts.find((item) => item.slug === slug) || state.offlinePosts[slug];\n    if (post) { state.tab = 'home'; renderArticle(post); }\n  });\n  await PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
    const slug = event.notification?.data?.slug;
    const post = state.posts.find((item) => item.slug === slug) || state.offlinePosts[slug];
    if (post) {
      state.tab = 'home';
      renderArticle(post);
      render();
    } else {
      refreshFeed({ silent: true });
    }
  });
}

async function enableNotifications() {
  if (!native) {
    toast('Notificações push exigem a versão instalada do aplicativo.');
    return;
  }
  try {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      toast('Permissão de notificações não concedida.');
      return;
    }
    const localPermission = await LocalNotifications.checkPermissions();
    if (localPermission.display !== 'granted') await LocalNotifications.requestPermissions();
    await setPref('notifications-enabled', true);
    state.notificationsEnabled = true;
    await setupPushListeners();
    await PushNotifications.register();
    render();
    toast('Notificações ativadas neste aparelho.');
  } catch (error) {
    console.error(error);
    toast('Não foi possível ativar as notificações.');
  }
}


async function disableNotifications() {
  const stored = await getPref('pending-push-token', null);
  const token = state.pushToken || stored?.token;
  const endpoint = String(state.config.pushApiUrl || '').replace(/\\/$/, '');
  if (token && endpoint) {
    try {
      await fetch(`${endpoint}/register`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.warn('Não foi possível remover o token push:', error);
    }
  }
  try { if (native) await PushNotifications.unregister(); } catch { /* O token será revogado no servidor quando possível. */ }
  await setPref('notifications-enabled', false);
  state.notificationsEnabled = false;
  state.pushToken = '';
  render();
  toast('Notificações desativadas neste aparelho.');
}

async function handleAction(button) {
  const action = button.dataset.action;
  const slug = button.dataset.slug;
  if (action === 'favorite') return toggleFavorite(slug);
  if (action === 'share') return sharePost(slug);
  if (action === 'offline') {
    if (state.offlineSlugs.includes(slug)) return removeOffline(slug);
    return saveOffline(slug);
  }
  if (action === 'reader-mode') {
    state.readerMode = !state.readerMode;
    await setPref('reader-mode', state.readerMode);
    render();
    return;
  }
  if (action === 'enable-notifications') return enableNotifications();
  if (action === 'toggle-notifications') return state.notificationsEnabled ? disableNotifications() : enableNotifications();
  if (action === 'refresh') return refreshFeed();
  if (action === 'back' || action === 'home') {
    state.view = 'home';
    state.currentPost = null;
    state.tab = 'home';
    render();
    return;
  }
  if (action === 'clear-offline') return clearOffline();
}

main.addEventListener('click', async (event) => {
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    event.preventDefault();
    await handleAction(actionButton);
    return;
  }
  const openButton = event.target.closest('[data-open]');
  if (openButton) {
    const slug = openButton.dataset.open;
    const post = state.posts.find((item) => item.slug === slug) || state.offlinePosts[slug];
    if (post) renderArticle(post);
  }
});

document.querySelector('.bottom-nav').addEventListener('click', (event) => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  state.tab = button.dataset.tab;
  state.view = 'home';
  state.currentPost = null;
  render();
});

document.querySelector('.section-tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-section]');
  if (!button) return;
  state.section = button.dataset.section;
  state.tab = 'home';
  state.view = 'home';
  state.currentPost = null;
  render();
});

document.querySelector('.app-header').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="refresh"],[data-action="home"]');
  if (!button) return;
  event.preventDefault();
  if (button.dataset.action === 'refresh') refreshFeed();
  else {
    state.tab = 'home';
    state.section = 'all';
    state.view = 'home';
    render();
  }
});

window.addEventListener('online', () => {
  document.querySelector('#connection-state').textContent = 'ONLINE';
  refreshFeed({ silent: true });
});
window.addEventListener('offline', () => {
  document.querySelector('#connection-state').textContent = 'MODO OFFLINE';
  toast('Você está sem conexão. As matérias salvas continuam disponíveis.');
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && navigator.onLine) refreshFeed({ silent: true });
});

async function start() {
  await loadInitialContent();
  await setupPushListeners();
  await refreshFeed({ silent: true });
  updateHeader();
  if (!native) {
    document.querySelector('#connection-state').textContent = 'PRÉVIA WEB';
  }
}

start().catch((error) => {
  console.error('Falha ao iniciar The Bullshit Bureau:', error);
  main.innerHTML = '<div class="empty-state">Não foi possível abrir o jornal. Verifique o conteúdo local ou tente atualizar.</div>';
});
