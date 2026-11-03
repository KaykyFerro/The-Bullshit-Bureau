(() => {
  'use strict';

  const contentRoot = document.getElementById('main-content');
  const baseUrl = new URL('./', document.baseURI);
  const contentBaseUrl = new URL(document.documentElement.dataset.contentBase || './', baseUrl);
  const fallbackCover = new URL('assets/images/press-engraving.svg', contentBaseUrl).href;
  const editorUrl = 'https://app.pagescms.org/';
  const params = new URLSearchParams(window.location.search);

  const sectionNames = {
    noticias: 'Notícias',
    artigos: 'Artigos & análises',
    editoriais: 'Editorial',
    opiniao: 'Opinião'
  };

  const allowedTags = new Set([
    'P', 'H2', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I',
    'UL', 'OL', 'LI', 'BLOCKQUOTE', 'HR', 'BR',
    'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'TABLE',
    'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'SUP',
    'SUB', 'CODE', 'PRE'
  ]);

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  function assetUrl(value) {
    const path = String(value ?? '').trim();
    if (!path) return fallbackCover;
    if (/^(https?:|data:image\\/)/i.test(path)) return path;

    const repositoryPrefix = '/The-Bullshit-Bureau/';
    if (path.startsWith(repositoryPrefix)) {
      let relativePath = path.slice(repositoryPrefix.length);
      if (relativePath.startsWith('docs/')) {
        relativePath = relativePath.slice('docs/'.length);
      }
      return new URL(relativePath, contentBaseUrl).href;
    }

    if (path.startsWith('/')) return new URL(path.slice(1), contentBaseUrl).href;
    return new URL(path, contentBaseUrl).href;
  }

  function safeHref(value) {
    const href = String(value ?? '').trim();
    if (!href) return '';
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
    if (href.startsWith('/')) return assetUrl(href);
    if (href.startsWith('./') || href.startsWith('../')) {
      return new URL(href, contentBaseUrl).href;
    }
    return '';
  }

  function cleanRichText(markup) {
    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(String(markup ?? ''), 'text/html');

    const cleanChildren = (parent) => {
      [...parent.children].forEach((element) => {
        const tag = element.tagName;
        if (!allowedTags.has(tag)) {
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'OBJECT') {
            element.remove();
          } else {
            element.replaceWith(...[...element.childNodes]);
          }
          return;
        }

        const allowedAttributes = tag === 'A'
          ? new Set(['href', 'title'])
          : tag === 'IMG'
            ? new Set(['src', 'alt', 'title'])
            : tag === 'TH' || tag === 'TD'
              ? new Set(['colspan', 'rowspan'])
              : new Set();

        [...element.attributes].forEach((attribute) => {
          if (!allowedAttributes.has(attribute.name.toLowerCase())) {
            element.removeAttribute(attribute.name);
          }
        });

        if (tag === 'A') {
          const href = safeHref(element.getAttribute('href'));
          if (href) {
            element.setAttribute('href', href);
            if (/^https?:/i.test(href)) {
              element.setAttribute('target', '_blank');
              element.setAttribute('rel', 'noopener noreferrer');
            }
          } else {
            element.removeAttribute('href');
          }
        }

        if (tag === 'IMG') {
          const source = element.getAttribute('src');
          if (source) {
            element.setAttribute('src', assetUrl(source));
            element.setAttribute('loading', 'lazy');
          } else {
            element.remove();
            return;
          }
        }

        cleanChildren(element);
      });
    };

    cleanChildren(documentFragment.body);
    return documentFragment.body.innerHTML;
  }

  function formatDate(value) {
    if (!value) return 'Data não informada';
    const raw = String(value).slice(0, 10);
    const date = new Date(raw + 'T12:00:00');
    if (Number.isNaN(date.getTime())) return escapeHtml(raw);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  function updatePageTitle(title, description) {
    const name = siteInfo.name || 'The Bullshit Bureau';
    document.title = title ? `${title} | ${name}` : `${name} | ${siteInfo.slogan || 'A verdade acima da ideologia.'}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description || siteInfo.description || '');
  }

  function storyCard(post, compact = false) {
    const cover = assetUrl(post.cover);
    const title = escapeHtml(post.title);
    const alt = escapeHtml(post.coverAlt || post.title || 'Imagem da matéria');
    const category = escapeHtml(post.category || sectionNames[post.section] || 'Publicação');
    const author = escapeHtml(post.author || 'Redação');
    const date = escapeHtml(formatDate(post.publishedAt));
    const excerpt = escapeHtml(post.excerpt || post.subtitle || '');
    return `
      <a class="story-card${compact ? ' compact' : ''}" href="?post=${encodeURIComponent(post.slug)}">
        <img class="story-image" src="${cover}" alt="${alt}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallbackCover}'">
        <div class="story-copy">
          <span class="story-category">${category}</span>
          <h2 class="story-title">${title}</h2>
          ${compact ? '' : `<p class="story-excerpt">${excerpt}</p>`}
          <div class="story-meta"><span>${author}</span><span>${date}</span></div>
        </div>
      </a>`;
  }

  function emptyState(message) {
    return `<p class="empty-state">${escapeHtml(message)}</p>`;
  }

  function categoryCloud(posts) {
    const values = [...new Set(posts.map((post) => post.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (!values.length) return '';
    return `
      <div class="category-cloud" aria-label="Categorias">
        ${values.map((value) => `<a href="?category=${encodeURIComponent(value)}">${escapeHtml(value)}</a>`).join('')}
      </div>`;
  }

  function renderHome(posts) {
    updatePageTitle('', siteInfo.description);
    if (!posts.length) {
      contentRoot.innerHTML = `
        <section class="editor-panel">
          <p class="section-kicker">Primeira edição</p>
          <h1 class="section-title">A redação está preparando a próxima edição.</h1>
          <p>As publicações aparecerão nesta página assim que forem aprovadas e publicadas.</p>
          <a class="paper-button" href="${editorUrl}" target="_blank" rel="noopener noreferrer">Acessar a redação ↗</a>
        </section>`;
      return;
    }

    const featured = posts.find((post) => post.featured) || posts[0];
    const secondary = posts.filter((post) => post.slug !== featured.slug).slice(0, 4);
    const latest = posts.filter((post) => post.slug !== featured.slug).slice(0, 6);

    contentRoot.innerHTML = `
      <section class="hero-grid" aria-label="Manchete e chamadas">
        <div class="hero-main">
          <p class="section-kicker">Manchete principal</p>
          ${storyCard(featured)}
        </div>
        <aside class="hero-aside" aria-label="Outras chamadas">
          ${secondary.length
            ? secondary.map((post) => storyCard(post, true)).join('')
            : '<div class="sidebar-box"><h2>Uma redação em construção</h2><p>Novas publicações aparecerão aqui. Acompanhe as próximas edições.</p></div>'}
        </aside>
      </section>
      <section class="content-section">
        <p class="section-kicker">Últimas publicações</p>
        ${latest.length
          ? `<div class="news-grid">${latest.map((post) => storyCard(post)).join('')}</div>`
          : emptyState('Esta é a edição de estreia. Mais conteúdo em breve.')}
      </section>
      <section class="content-section">
        <p class="section-kicker">Explore por assunto</p>
        ${categoryCloud(posts)}
      </section>`;
  }

  function renderListing(posts, title, description) {
    updatePageTitle(title, description);
    contentRoot.innerHTML = `
      <header class="listing-header">
        <p class="section-kicker">Arquivo do jornal</p>
        <h1 class="section-title">${escapeHtml(title)}</h1>
        <p class="section-description">${escapeHtml(description)}</p>
      </header>
      ${posts.length
        ? `<div class="news-grid">${posts.map((post) => storyCard(post)).join('')}</div>`
        : emptyState('Ainda não há publicações nesta seção.')}
      ${categoryCloud(posts)}`;
  }

  function renderArticle(post, allPosts) {
    updatePageTitle(post.title, post.excerpt || post.subtitle);
    const cover = assetUrl(post.cover);
    const coverAlt = escapeHtml(post.coverAlt || post.title);
    const body = cleanRichText(post.body || '<p>O texto desta publicação ainda não foi preenchido.</p>');
    const creditSource = safeHref(post.coverCreditUrl || '');
    const creditLicense = safeHref(post.coverLicenseUrl || '');
    const imageCredit = post.coverCredit
      ? `<p class="image-credit">Imagem: ${creditSource ? `<a href="${escapeHtml(creditSource)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.coverCredit)}</a>` : escapeHtml(post.coverCredit)}${creditLicense ? ` · <a href="${escapeHtml(creditLicense)}" target="_blank" rel="noopener noreferrer">licença</a>` : ''}</p>`
      : '';
    const related = allPosts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);

    contentRoot.innerHTML = `
      <a class="back-link" href="./">← Voltar à primeira página</a>
      <article>
        <header class="article-header">
          <span class="story-category">${escapeHtml(post.category || sectionNames[post.section] || 'Publicação')} · ${escapeHtml(sectionNames[post.section] || 'Jornal')}</span>
          <h1 class="article-title">${escapeHtml(post.title)}</h1>
          ${post.subtitle ? `<p class="article-subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
          <div class="article-byline">
            <span>Por ${escapeHtml(post.author || 'Redação')}</span>
            <time datetime="${escapeHtml(String(post.publishedAt || '').slice(0, 10))}">${escapeHtml(formatDate(post.publishedAt))}</time>
          </div>
        </header>
        <img class="article-cover" src="${cover}" alt="${coverAlt}" decoding="async" onerror="this.onerror=null;this.src='${fallbackCover}'">
        ${imageCredit}
        <div class="article-body">${body}</div>
        <p class="article-endnote">The Bullshit Bureau · A verdade acima da ideologia. Ao compartilhar, cite a publicação e o autor.</p>
      </article>
      ${related.length ? `
        <section class="content-section">
          <p class="section-kicker">Leia também</p>
          <div class="news-grid">${related.map((item) => storyCard(item)).join('')}</div>
        </section>` : ''}`;
  }

  function renderSearch(posts) {
    updatePageTitle('Busca', 'Pesquise publicações do The Bullshit Bureau.');
    contentRoot.innerHTML = `
      <header class="listing-header">
        <p class="section-kicker">Arquivo do jornal</p>
        <h1 class="section-title">Busca</h1>
        <p class="section-description">Encontre publicações por título, resumo, categoria, autor ou conteúdo.</p>
      </header>
      <form id="search-form" class="search-form" role="search">
        <label class="skip-link" for="search-input">Buscar no jornal</label>
        <input id="search-input" type="search" value="${escapeHtml(params.get('q') || '')}" placeholder="Digite uma palavra ou assunto..." autocomplete="off">
        <button type="submit">Pesquisar</button>
      </form>
      <p id="search-status" class="search-status" aria-live="polite"></p>
      <div id="search-results" class="search-result-list"></div>`;

    const input = document.getElementById('search-input');
    const form = document.getElementById('search-form');
    const status = document.getElementById('search-status');
    const results = document.getElementById('search-results');

    const performSearch = () => {
      const term = String(input.value || '').trim().toLocaleLowerCase('pt-BR');
      const matches = posts.filter((post) => {
        const haystack = [post.title, post.subtitle, post.excerpt, post.category, post.author, post.body]
          .join(' ').replace(/<[^>]*>/g, ' ').toLocaleLowerCase('pt-BR');
        return !term || haystack.includes(term);
      });
      status.textContent = term
        ? `${matches.length} resultado(s) para “${input.value.trim()}”.`
        : `${matches.length} publicações disponíveis.`;
      results.innerHTML = matches.length
        ? matches.map((post) => storyCard(post)).join('')
        : emptyState('Nenhuma publicação encontrada. Tente outro termo.');
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = new URLSearchParams();
      query.set('view', 'search');
      if (input.value.trim()) query.set('q', input.value.trim());
      window.history.replaceState({}, '', `?${query.toString()}`);
      performSearch();
    });
    input.addEventListener('input', performSearch);
    performSearch();
  }

  function renderAbout() {
    updatePageTitle('Sobre o Bureau', 'Conheça a proposta editorial do The Bullshit Bureau.');
    const baseArt = assetUrl('assets/images/press-engraving.svg');
    contentRoot.innerHTML = `
      <header class="listing-header">
        <p class="section-kicker">Quem somos</p>
        <h1 class="section-title">A verdade acima da ideologia.</h1>
        <p class="section-description">Um jornal não precisa escolher um lado para fazer perguntas difíceis a todos eles.</p>
      </header>
      <div class="about-grid">
        <div class="about-copy">
          <p>O <strong>The Bullshit Bureau</strong> nasce com uma proposta simples de dizer e exigente de cumprir: tratar informação com rigor, contexto e responsabilidade.</p>
          <p>Não prometemos infalibilidade. Prometemos método: identificar a origem das informações, distinguir fatos de interpretações, contextualizar números, ouvir perspectivas relevantes e corrigir erros de forma transparente.</p>
          <h2>O que nos orienta</h2>
          <p><strong>Fato é fato.</strong> Notícia deve apresentar o que foi apurado e indicar suas fontes. <strong>Análise é análise.</strong> Deve expor argumentos e contexto. <strong>Opinião é opinião.</strong> Deve ser identificada como tal.</p>
          <p>O slogan não significa ausência de critérios ou de valores. Significa que nenhuma ideologia deve substituir a verificação dos fatos.</p>
        </div>
        <img class="about-art" src="${baseArt}" alt="Ilustração editorial de uma prensa tipográfica.">
      </div>`;
  }

  function renderCategory(posts, category) {
    const filtered = posts.filter((post) => post.category === category);
    renderListing(filtered, category, `Publicações sobre ${category}.`);
  }

  function renderSection(posts, section) {
    const filtered = posts.filter((post) => post.section === section);
    renderListing(filtered, sectionNames[section] || 'Publicações', `Publicações da editoria ${sectionNames[section] || section}.`);
  }

  let siteInfo = {
    name: 'The Bullshit Bureau',
    slogan: 'A verdade acima da ideologia.',
    description: 'Jornalismo independente, fatos, análises e contexto.'
  };

  async function init() {
    try {
      const [siteResponse, postsResponse] = await Promise.all([
        fetch(new URL('data/site.json', contentBaseUrl), { cache: 'no-cache' }),
        fetch(new URL('data/posts.json', contentBaseUrl), { cache: 'no-cache' })
      ]);

      if (!postsResponse.ok) throw new Error('Não foi possível carregar as publicações.');
      if (siteResponse.ok) siteInfo = { ...siteInfo, ...(await siteResponse.json()) };

      const items = await postsResponse.json();
      if (!Array.isArray(items)) throw new Error('O arquivo de publicações precisa conter uma lista JSON.');

      const published = items
        .filter((post) => post && post.status === 'published' && post.title && post.slug)
        .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

      document.getElementById('masthead-slogan').textContent = siteInfo.slogan;
      document.getElementById('footer-slogan').textContent = siteInfo.slogan;
      document.getElementById('year').textContent = new Date().getFullYear();
      document.getElementById('today').textContent = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date());
      document.getElementById('edition-date').textContent = `EDIÇÃO DIGITAL · ${published.length} PUBLICAÇÕES`;

      const slug = params.get('post');
      const section = params.get('section');
      const category = params.get('category');
      const view = params.get('view');

      if (slug) {
        const selected = published.find((post) => post.slug === slug);
        if (selected) renderArticle(selected, published);
        else {
          updatePageTitle('Página não encontrada', '');
          contentRoot.innerHTML = `<section class="editor-panel"><p class="section-kicker">Arquivo</p><h1 class="section-title">Esta publicação não está nesta edição.</h1><a class="paper-button" href="./">Voltar à primeira página</a></section>`;
        }
      } else if (section) renderSection(published, section);
      else if (category) renderCategory(published, category);
      else if (view === 'search') renderSearch(published);
      else if (view === 'about') renderAbout();
      else renderHome(published);
    } catch (error) {
      console.error('Erro ao carregar a edição:', error);
      contentRoot.innerHTML = `
        <section class="editor-panel">
          <p class="section-kicker">Falha ao carregar a edição</p>
          <h1 class="section-title">O jornal não conseguiu abrir o arquivo de publicações.</h1>
          <p>Confira se <code>data/posts.json</code> existe e contém uma lista JSON válida.</p>
          <a class="paper-button" href="./">Tentar novamente</a>
        </section>`;
    }
  }

  init();
})();
