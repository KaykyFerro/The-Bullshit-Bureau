# The Bullshit Bureau

> **A verdade acima da ideologia.**

Jornal digital independente com estética de jornal impresso, páginas estáticas rápidas e edição visual de conteúdo pelo GitHub.

## Estado do projeto

- [x] Repositório GitHub criado: `KaykyFerro/The-Bullshit-Bureau`
- [x] Estrutura editorial e identidade visual implementadas
- [x] Portal responsivo em Astro
- [x] Conteúdo editorial em Markdown com frontmatter
- [x] CMS visual configurado com Pages CMS
- [x] Fluxo de publicação por commits no GitHub
- [x] Documentação de desenvolvimento, CMS e implantação
- [ ] Instalar o GitHub App do Pages CMS no repositório
- [ ] Conectar o repositório ao Cloudflare Pages
- [ ] Validar o primeiro deploy público

> **Importante:** o código e a configuração estão no repositório. A autenticação do CMS e a hospedagem precisam de uma autorização/instalação inicial feita na interface dos respectivos serviços. Nenhuma senha, token ou segredo foi incluído no código.

## Visão do produto

O portal tem duas áreas separadas:

1. **Portal público**: manchetes, notícias, artigos, editoriais, categorias, busca e página institucional.
2. **Edição privada**: Pages CMS, acessado com GitHub. O CMS edita arquivos Markdown e imagens diretamente no repositório.

O repositório GitHub é a fonte de verdade do conteúdo. Não existe banco de dados próprio, API editorial ou senha administrativa hardcoded.

## Stack

| Camada | Tecnologia | Papel |
| --- | --- | --- |
| Site | Astro + TypeScript | Geração estática de páginas e SEO |
| Estilos | CSS próprio | Identidade visual editorial responsiva |
| Conteúdo | Markdown + frontmatter YAML | Notícias, artigos e editoriais versionados |
| CMS | [Pages CMS](https://pagescms.org/) | Editor visual (WYSIWYG) e upload de imagens |
| Login do CMS | GitHub OAuth via Pages CMS | Identidade e acesso ao repositório |
| Versionamento | GitHub | Histórico, conteúdo e mídia |
| Hospedagem | Cloudflare Pages | Build e publicação automática |

## Começar localmente

Requisitos: Node.js 22.12 ou superior e npm.

```bash
git clone https://github.com/KaykyFerro/The-Bullshit-Bureau.git
cd The-Bullshit-Bureau
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:4321`.

Comandos:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor local |
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Visualiza a build local |
| `npm run check` | Verificação de tipos e erros Astro |

## Publicação de conteúdo

### Pelo editor visual

1. Acesse [Pages CMS](https://app.pagescms.org/).
2. Entre com a conta GitHub que possui permissão de escrita neste repositório.
3. Autorize/instale o GitHub App do Pages CMS somente neste repositório.
4. Abra `KaykyFerro/The-Bullshit-Bureau`, branch `main`.
5. Entre na coleção **Publicações**.
6. Crie ou edite a matéria com o editor visual.
7. Salve com status **draft** para manter como rascunho ou **published** para exibir no portal.
8. O commit no GitHub dispara o deploy automático quando o Cloudflare Pages estiver conectado.

O acesso de edição é controlado pelas permissões GitHub do repositório. Para manter um único editor, não adicione outros colaboradores com permissão de escrita e não convide colaboradores do Pages CMS. A conta proprietária `KaykyFerro` deve continuar como única pessoa com escrita.

### Modelo de publicação

Cada publicação é um arquivo em `src/content/noticias/`:

```yaml
---
title: "Título da publicação"
slug: "titulo-da-publicacao"
subtitle: "Linha fina"
excerpt: "Resumo para os cards e mecanismos de busca."
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

Valores permitidos para `section`: `noticias`, `artigos`, `editoriais` e `opiniao`.

Valores permitidos para `status`: `draft` e `published`. Apenas publicações com `status: published` são incluídas no site gerado.

Imagens enviadas no CMS ficam em `public/images/uploads/` e são servidas em `/images/uploads/`.

## Rotas do site

| Rota | Conteúdo |
| --- | --- |
| `/` | Página inicial e manchete |
| `/noticias/` | Todas as notícias |
| `/artigos/` | Artigos e análises |
| `/editoriais/` | Editorial do jornal |
| `/opiniao/` | Opinião |
| `/:section/:slug/` | Publicação individual |
| `/categoria/:categoria/` | Arquivo por categoria |
| `/busca/` | Busca no conteúdo publicado |
| `/sobre/` | Manifesto e apresentação |

## Configuração do Cloudflare Pages

1. Entre no painel Cloudflare e abra **Workers & Pages**.
2. Crie uma aplicação Pages conectada ao GitHub.
3. Selecione `KaykyFerro/The-Bullshit-Bureau`.
4. Configure:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js:** `22.12+`
5. Salve e execute o primeiro deploy.
6. Cada commit novo em `main` será publicado automaticamente.

Não são necessárias variáveis de ambiente para gerar o portal público.

## Segurança e limites

- Não existe painel administrativo próprio dentro do frontend público.
- O CMS é hospedado em Pages CMS e autentica a conta por GitHub.
- A permissão de escrita do repositório é o controle de acesso editorial. O repositório pode ser público para leitura, mas somente colaboradores autorizados podem gravar diretamente nele.
- Não coloque Personal Access Tokens, client secrets ou senhas em arquivos do projeto.
- Não habilite colaboradores do Pages CMS para manter o modelo de um único editor.
- Rascunhos não são gerados nas rotas públicas; a filtragem ocorre durante o build.
- Este projeto não implementa comentários, newsletter, cadastro público ou agendamento de publicação.

## Organização dos arquivos

```text
.
├── .pages.yml                 # Configuração do editor visual Pages CMS
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── bureau-engraving.svg
│       └── uploads/            # Mídias enviadas pelo CMS
├── src/
│   ├── components/             # Cabeçalho, cartões e rodapé
│   ├── content/
│   │   └── noticias/           # Publicações em Markdown
│   ├── layouts/                # Layout editorial
│   ├── lib/                    # Leitura, filtros e rotas do conteúdo
│   ├── pages/                  # Rotas Astro
│   └── styles/                 # Estilos globais
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Identidade editorial

**Nome:** The Bullshit Bureau  
**Slogan:** A verdade acima da ideologia.

A marca deve questionar narrativas de todos os lados, distinguir fato, análise e opinião, apresentar contexto e deixar explícita a natureza de cada publicação. O slogan representa um compromisso editorial, não uma alegação de infalibilidade.

## Licença e responsabilidade editorial

O conteúdo de demonstração é material de apresentação e deve ser revisado pela redação antes de ser tratado como reportagem. Ao publicar matérias factuais, inclua fontes verificáveis, datas, contexto, correções transparentes e identificação clara de opinião e análise.
