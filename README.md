# The Bullshit Bureau

> **A verdade acima da ideologia.**

Jornal digital independente com identidade visual de jornal impresso, portal estático e edição visual de conteúdo por GitHub.

**Repositório:** [github.com/KaykyFerro/The-Bullshit-Bureau](https://github.com/KaykyFerro/The-Bullshit-Bureau)  
**Última atualização da documentação:** 03/11/2026

---

## Estado do projeto

### Implementado no repositório

- [x] Projeto Astro + TypeScript com saída estática.
- [x] Identidade visual editorial: papel off-white, tipografia serifada, masthead grande, filetes e colunas.
- [x] Layout responsivo para desktop, tablet e celular.
- [x] Página inicial com manchete, chamadas e últimas publicações.
- [x] Editorias: Notícias, Artigos, Editorial e Opinião.
- [x] Página individual de cada publicação.
- [x] Arquivo por categoria e busca no conteúdo publicado.
- [x] Página Sobre e página 404 personalizada.
- [x] Metadados SEO, canonical, Open Graph, `robots.txt` e `sitemap.xml`.
- [x] Conteúdo em arquivos Markdown com frontmatter YAML.
- [x] Filtro de publicação: somente `status: published` entra no build público.
- [x] Pages CMS configurado com editor visual rich-text, campos editoriais e upload de imagens.
- [x] Entrada `/admin/` para acessar o CMS hospedado.
- [x] Workflow GitHub Actions para verificar tipos e gerar build em pushes e pull requests.
- [x] Documentação de desenvolvimento, publicação e hospedagem.

### Configurações externas pendentes

- [ ] Instalar/autorizar o GitHub App do Pages CMS para este repositório.
- [ ] Entrar no Pages CMS com GitHub e confirmar que a coleção **Publicações** aparece.
- [ ] Criar a aplicação Cloudflare Pages conectada ao repositório.
- [ ] Confirmar o primeiro resultado verde do workflow e o primeiro deploy público.
- [ ] Ajustar o domínio em `astro.config.mjs` caso seja utilizado um domínio próprio ou um endereço Pages diferente do padrão documentado.

> O código e as configurações estão no GitHub. O CMS e a hospedagem exigem autorização inicial nas respectivas plataformas. Não há senha, token ou segredo hardcoded no projeto.

## Visão do produto

O projeto tem duas áreas:

1. **Portal público:** manchetes, notícias, artigos, editoriais, opinião, categorias, busca e página institucional.
2. **Edição privada:** Pages CMS, acessado por GitHub. O CMS edita arquivos Markdown e imagens diretamente no repositório.

O GitHub é a fonte oficial do conteúdo e do histórico. O projeto não mantém banco de dados próprio nem API editorial. O Pages CMS hospedado pode manter cache interno gerenciado pelo serviço, mas os arquivos e commits do repositório continuam sendo a fonte de verdade.

## Stack

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Site | Astro 7 + TypeScript | Páginas estáticas, rotas e SEO |
| Estilos | CSS próprio | Identidade visual editorial responsiva |
| Conteúdo | Markdown + frontmatter YAML | Publicações versionadas |
| CMS | [Pages CMS](https://pagescms.org/) | Editor visual e mídia |
| Login do CMS | GitHub OAuth via Pages CMS | Identificação e acesso ao repositório |
| Versionamento | GitHub | Arquivos, histórico e permissões |
| Hospedagem | Cloudflare Pages | Build e publicação automática |
| CI | GitHub Actions | Verificação Astro/TypeScript e build |

## Começar localmente

Requisitos: Node.js 22.12 ou superior e npm.

```bash
git clone https://github.com/KaykyFerro/The-Bullshit-Bureau.git
cd The-Bullshit-Bureau
npm install
npm run dev
```

Abra `http://localhost:4321`.

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor local |
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Visualiza a build local |
| `npm run check` | Verificação Astro e TypeScript |

## Como publicar uma matéria pelo editor visual

### Primeira configuração do CMS

1. Acesse [Pages CMS](https://app.pagescms.org/).
2. Entre com a conta GitHub que é proprietária ou tem permissão de escrita no repositório.
3. Instale/autorize o GitHub App do Pages CMS para **somente** `KaykyFerro/The-Bullshit-Bureau`.
4. Abra o repositório `KaykyFerro/The-Bullshit-Bureau` na branch `main`.
5. A coleção **Publicações** será carregada a partir de `.pages.yml`.

### Criar ou editar

1. Abra **Publicações**.
2. Clique em criar ou escolha uma publicação existente.
3. Preencha título, linha fina, resumo, editoria, categoria, autor e data.
4. Escolha a imagem de capa e escreva o texto usando o editor visual.
5. Defina **Rascunho** para guardar sem publicar ou **Publicado** para liberar no portal.
6. Salve. O Pages CMS grava as alterações no GitHub como commit.
7. Com o Cloudflare Pages conectado, o commit em `main` dispara uma nova publicação do site.

O editor usa rich-text em Markdown e esconde o alternador de código para manter a edição visual simples. É possível formatar texto e enviar imagens pelo próprio editor.

### Acesso de um único administrador

O controle de escrita é feito pelas permissões do GitHub, não por uma senha embutida no site:

- `KaykyFerro` deve ser a única conta com permissão de escrita no repositório.
- Não adicione outros colaboradores com permissão de escrita.
- Não convide colaboradores extras no Pages CMS.
- Não compartilhe tokens pessoais.
- Ative autenticação em dois fatores na conta GitHub.

O repositório é público para leitura. Isso não concede permissão para editar diretamente o conteúdo. A página `/admin/` apenas direciona ao Pages CMS; a autenticação acontece no serviço do CMS por GitHub.

## Modelo dos arquivos de publicação

Cada matéria é um arquivo Markdown em `src/content/noticias/`:

```yaml
---
title: "Título da publicação"
slug: "titulo-da-publicacao"
subtitle: "Linha fina"
excerpt: "Resumo para cards e mecanismos de busca."
section: "noticias"
category: "Política"
author: "Redação The Bullshit Bureau"
publishedAt: "2026-11-03"
status: "draft"
featured: false
cover: "/images/uploads/capa.webp"
coverAlt: "Descrição objetiva da imagem"
---

Texto da matéria em Markdown...
```

Valores permitidos para `section`:

- `noticias`
- `artigos`
- `editoriais`
- `opiniao`

Valores permitidos para `status`: `draft` e `published`.

**Importante:** apenas itens com `status: published` são gerados nas páginas públicas. Um rascunho não é apenas escondido por CSS: ele é excluído durante a geração estática.

### Imagens

- Uploads do CMS: `public/images/uploads/`
- Caminho público: `/images/uploads/`
- Formatos aceitos: JPG, JPEG, PNG, WebP e AVIF.
- Imagens e textos alternativos devem ser escolhidos/preenchidos pelo editor.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Página inicial |
| `/noticias/` | Notícias |
| `/artigos/` | Artigos e análises |
| `/editoriais/` | Editorial |
| `/opiniao/` | Opinião |
| `/:section/:slug/` | Publicação individual |
| `/categoria/:categoria/` | Arquivo por categoria |
| `/busca/` | Busca no conteúdo publicado |
| `/sobre/` | Apresentação e compromisso editorial |
| `/admin/` | Acesso externo ao Pages CMS |

## Hospedar no Cloudflare Pages

1. Abra **Workers & Pages** no painel Cloudflare.
2. Crie um projeto conectado ao GitHub.
3. Selecione `KaykyFerro/The-Bullshit-Bureau`.
4. Configure:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js:** `22.12+`
5. Salve e execute o primeiro deploy.
6. Cada commit em `main` passa a acionar build e deploy automático.

Não são necessárias variáveis de ambiente para gerar o portal.

O endereço padrão configurado no projeto é `https://the-bullshit-bureau.pages.dev`. Caso o Cloudflare atribua outro subdomínio ou seja configurado um domínio próprio, atualize a propriedade `site` de `astro.config.mjs` para que canonical e sitemap apontem para o endereço correto.

## CI e validação

O workflow `.github/workflows/ci.yml` executa:

1. Checkout do repositório.
2. Instalação do Node.js 22.12.
3. Instalação das dependências.
4. `npm run check`.
5. `npm run build`.

O workflow está configurado para push e pull request em `main`. Consulte a aba **Actions** do GitHub para confirmar o resultado de cada execução. A presença do workflow não substitui a confirmação de um build concluído com sucesso.

## Estrutura principal

```text
.
├── .github/workflows/ci.yml
├── .pages.yml
├── public/
│   ├── _headers
│   ├── favicon.svg
│   └── images/
│       ├── bureau-engraving.svg
│       └── uploads/
├── src/
│   ├── components/
│   ├── content/noticias/
│   ├── env.d.ts
│   ├── layouts/
│   ├── lib/articles.ts
│   ├── pages/
│   └── styles/global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Conteúdo inicial

Foram adicionados três textos de apresentação, identificados como conteúdo editorial/educativo:

- **A verdade acima da ideologia: o compromisso do Bureau** — editorial de apresentação e manchete inicial.
- **Fato, análise e opinião não são a mesma coisa** — texto explicativo sobre gêneros editoriais.
- **Três perguntas antes de compartilhar uma informação** — guia de leitura crítica.

Eles não são reportagens sobre acontecimentos externos. Revise, adapte ou substitua esses textos antes de considerar a primeira edição oficial.

## Identidade editorial

**Nome:** The Bullshit Bureau  
**Slogan:** A verdade acima da ideologia.

A proposta é questionar narrativas de todos os lados, distinguir fato, análise e opinião, apresentar contexto e deixar explícita a natureza de cada publicação. O slogan representa um compromisso editorial, não uma alegação de infalibilidade.

Ao publicar matérias factuais, inclua fontes verificáveis, datas, contexto, contrapontos relevantes e correções transparentes.

## Registro de atualizações

### 03/11/2026 — Primeira implementação

- Criação da estrutura do portal e do design inspirado em jornal impresso.
- Implementação das rotas públicas e páginas institucionais.
- Configuração do Pages CMS para edição visual e upload de imagens.
- Inclusão de conteúdos de apresentação e de metadados SEO.
- Inclusão do workflow de CI e documentação de implantação.
- Ajustes de compatibilidade do Astro, URLs canônicas, ordenação do conteúdo e configuração do CMS.
- Padronização do upload de imagens para a raiz `public/images/uploads/`, servida em `/images/uploads/`.

## Licença e responsabilidade

Este repositório ainda está em fase de configuração inicial. O responsável editorial deve revisar textos, imagens, direitos de uso, fontes e correções antes de cada publicação.
