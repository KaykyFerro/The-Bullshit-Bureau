# The Bullshit Bureau

> **A verdade acima da ideologia.**

Jornal digital independente com estética de jornal impresso, feito em HTML, CSS e JavaScript puros. O portal é publicado diretamente a partir dos arquivos versionados no GitHub.

**Repositório:** https://github.com/KaykyFerro/The-Bullshit-Bureau  
**Site:** https://kaykyferro.github.io/The-Bullshit-Bureau/  
**Última atualização:** 03/11/2026

---

## Como o projeto está hospedado

O site público está em `docs/` e é composto por HTML, CSS e JavaScript puros. Não depende de Astro, Node.js, npm, banco de dados ou compilação.

O GitHub Pages deve publicar diretamente a pasta `docs/` da branch `main`. Cada commit feito nessa pasta será publicado automaticamente.

### O que é publicado

| Arquivo | Função |
| --- | --- |
| `docs/index.html` | Página inicial do jornal |
| `docs/assets/css/newspaper.css` | Identidade visual e responsividade |
| `docs/assets/js/newspaper.js` | Navegação, busca e renderização das matérias |
| `docs/data/posts.json` | Conteúdo editorial |
| `docs/data/site.json` | Nome, slogan e descrição |
| `docs/assets/images/` | Identidade visual e imagens |
| `docs/404.html` | Página de endereço não encontrado |
| `docs/.nojekyll` | Evita processamento Jekyll |

Endereço público esperado:

`https://kaykyferro.github.io/The-Bullshit-Bureau/`

## Estado da publicação

- [x] Site público em HTML/CSS/JavaScript sem framework ou compilador.
- [x] Estética de jornal impresso responsiva.
- [x] Manchete principal e chamadas secundárias.
- [x] Seções: Notícias, Artigos, Editorial e Opinião.
- [x] Página individual de matéria por parâmetro `?post=slug`.
- [x] Filtro por seção e categoria.
- [x] Busca por título, resumo, categoria, autoria e conteúdo.
- [x] Página Sobre e página 404.
- [x] SEO básico, canonical, Open Graph, robots e sitemap.
- [x] Conteúdo em JSON versionado no GitHub.
- [x] Pages CMS configurado com editor visual, campos editoriais e upload de imagens.
- [ ] Em Settings → Pages, selecionar **Deploy from a branch**, branch `main`, pasta `/docs`, e salvar.
- [ ] Confirmar que o endereço público está acessível após a publicação.

## Como funciona a atualização do jornal

```text
Hugo entra no Pages CMS com GitHub
                |
                v
       Edita a publicação
                |
                v
     Salva no repositório GitHub
                |
                v
     Atualiza docs/data/posts.json
                |
                v
 GitHub Actions envia os arquivos HTML
                |
                v
       GitHub Pages publica
```

O GitHub é a fonte oficial do conteúdo e do histórico. Não há banco de dados próprio do jornal nem API editorial. O Pages CMS é a interface de edição e grava os arquivos no repositório.

## Painel editorial

Acesse **[Pages CMS](https://app.pagescms.org/)** e entre com a conta GitHub que possui permissão de escrita neste repositório.

Na primeira entrada:

1. Entre com GitHub.
2. Autorize/instale o GitHub App do Pages CMS no repositório `KaykyFerro/The-Bullshit-Bureau`.
3. Abra a branch `main`.
4. Acesse **Publicações**.
5. Edite uma matéria existente ou crie uma nova.

A página `/admin/` não é necessária para a administração: o link de edição fica no menu do próprio jornal, em **Redação**.

**Para manter apenas um editor:** mantenha `KaykyFerro` como única conta com permissão de escrita no repositório e não convide outros colaboradores para editar.

### Editor visual

O Pages CMS está configurado para editar o arquivo `docs/data/posts.json` como uma lista de publicações. O campo **Texto da matéria** usa rich-text em HTML. O editor permite formatação de texto e upload de imagens.

Campos da publicação:

| Campo | Uso |
| --- | --- |
| Título | Manchete da matéria |
| URL amigável | Identificador único, sem espaços |
| Linha fina | Subtítulo |
| Resumo | Texto dos cards e da busca |
| Editoria | Notícias, Artigos, Editorial ou Opinião |
| Categoria | Assunto da matéria |
| Autor | Responsável pelo texto |
| Data de publicação | Data exibida no jornal |
| Status | Rascunho ou Publicado |
| Manchete principal | Marca o destaque da página inicial |
| Imagem de capa | Foto ou ilustração da matéria |
| Texto alternativo | Descrição para acessibilidade |
| Texto da matéria | Editor visual rich-text |

### Rascunho e publicação

- `draft`: não aparece na página pública.
- `published`: aparece no jornal após a atualização do site.

O JavaScript filtra as publicações por `status` antes de renderizar o conteúdo. O rascunho continua no JSON, mas não é exibido aos visitantes.

### Uploads

- Pasta no GitHub: `docs/assets/images/uploads/`
- Caminho público: `/The-Bullshit-Bureau/assets/images/uploads/`
- Formatos aceitos: JPG, JPEG, PNG, WebP e AVIF.

O Pages CMS grava o caminho público nas informações da publicação. O portal reconhece esse caminho e o carrega sob o endereço do projeto.

## Editar conteúdo sem CMS

Também é possível editar diretamente `docs/data/posts.json`, mas o caminho recomendado é o editor visual.

Exemplo de publicação:

```json
{
  "title": "Título da matéria",
  "slug": "titulo-da-materia",
  "subtitle": "Linha fina",
  "excerpt": "Resumo da matéria.",
  "section": "noticias",
  "category": "Política",
  "author": "Redação The Bullshit Bureau",
  "publishedAt": "2026-11-03",
  "status": "draft",
  "featured": false,
  "cover": "/The-Bullshit-Bureau/assets/images/uploads/capa.webp",
  "coverAlt": "Descrição da imagem",
  "body": "<p>Texto da matéria...</p>"
}
```

Valores aceitos para `section`:

- `noticias`
- `artigos`
- `editoriais`
- `opiniao`

O valor de `slug` deve ser único e usar letras minúsculas, números e hífens.

## Hospedagem direta pelo GitHub Pages

A publicação é feita diretamente dos arquivos versionados, sem workflow próprio e sem etapa de compilação.

### Ativação necessária no GitHub

1. Abra [Settings → Pages](https://github.com/KaykyFerro/The-Bullshit-Bureau/settings/pages).
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Em **Branch**, selecione `main`.
4. Na pasta, selecione `/docs`.
5. Clique em **Save**.
6. Aguarde o primeiro deploy e abra o endereço público.

O GitHub Pages procura `index.html` na raiz da pasta escolhida. Neste repositório, ele está em `docs/index.html`, exatamente na raiz da fonte `main /docs`. O arquivo `.nojekyll` nessa pasta desativa o processamento Jekyll. A cada commit em `docs/`, o GitHub publica as alterações automaticamente.

Não escolha **GitHub Actions**, Jekyll ou outro fluxo de build para este modo direto. O site já está pronto dentro de `docs/`.

## Endereços do portal

| Página | Endereço |
| --- | --- |
| Início | `/` |
| Notícias | `?section=noticias` |
| Artigos | `?section=artigos` |
| Editorial | `?section=editoriais` |
| Opinião | `?section=opiniao` |
| Busca | `?view=search` |
| Sobre | `?view=about` |
| Matéria | `?post=slug-da-materia` |

Todas as rotas são atendidas por `docs/index.html`. Não há dependência de roteamento no servidor.

## Arquivos antigos do protótipo Astro

Os arquivos `src/`, `package.json`, `astro.config.mjs` e `tsconfig.json` pertencem à primeira implementação experimental em Astro. Eles foram preservados no repositório como referência, mas **não participam da hospedagem atual**. O GitHub Pages publica somente `docs/`.

## Identidade editorial

**Nome:** The Bullshit Bureau  
**Slogan:** A verdade acima da ideologia.

A proposta é questionar narrativas de todos os lados, distinguir fato, análise e opinião, apresentar contexto e deixar clara a natureza de cada publicação. O slogan representa um compromisso editorial, não uma alegação de infalibilidade.

Reportagens factuais devem incluir fontes verificáveis, datas, contexto, contrapontos relevantes e correções transparentes. Textos demonstrativos devem ser revisados antes de serem tratados como notícia.

## Registro de atualizações

### 03/11/2026 — Migração para HTML estático e publicação direta pela branch

- Criado portal público em HTML, CSS e JavaScript puros dentro de `docs/`.
- Migração do conteúdo editorial para `docs/data/posts.json`.
- Configurado o Pages CMS para editar a lista JSON com rich-text HTML e mídia.
- Removido o workflow Astro que impedia a publicação por incompatibilidade de Node.
- Escolhida publicação direta pelo GitHub Pages usando a branch `main` e pasta `/docs`, sem Node, npm ou compilação.
- Criadas páginas de fallback 404, robots.txt e sitemap.xml.
- Mantido o protótipo Astro em `src/` apenas como referência, fora do caminho de publicação.

## Licença e responsabilidade

O conteúdo inicial é editorial e educativo, não reportagem sobre acontecimentos externos. O responsável editorial deve revisar textos, imagens, direitos de uso, fontes e correções antes de cada publicação.
