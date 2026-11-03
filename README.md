# The Bullshit Bureau

> **A verdade acima da ideologia.**

Jornal digital independente com estética de jornal impresso, feito em HTML, CSS e JavaScript puros. O portal é publicado diretamente a partir dos arquivos versionados no GitHub.

**Repositório:** https://github.com/KaykyFerro/The-Bullshit-Bureau  
**Site:** https://kaykyferro.github.io/The-Bullshit-Bureau/  
**Última atualização:** 03/11/2026

---

## Como o projeto está hospedado

O site público está em `docs/` e é composto por HTML, CSS e JavaScript puros. Não depende de Astro, Node.js, npm, banco de dados ou compilação.

O GitHub Pages publica a pasta `docs/` por meio de um workflow GitHub Actions leve. O workflow não compila nada: apenas valida os arquivos prontos, empacota a pasta `docs/` e a publica.

### O que é publicado

| Arquivo | Função |
| --- | --- |
| `docs/index.html` | Página inicial do jornal |
| `docs/assets/css/newspaper.css` | Identidade visual e responsividade |
| `docs/assets/js/newspaper.js` | Navegação, busca e renderização das matérias |
| `docs/data/posts.json` | Conteúdo editorial |
| `docs/data/site.json` | Nome, slogan e descrição |
| `docs/assets/images/` | Identidade visual e capas editoriais |
| `docs/404.html` | Página de endereço não encontrado |
| `docs/.nojekyll` | Evita processamento Jekyll |

Endereço público publicado:

`https://kaykyferro.github.io/The-Bullshit-Bureau/`

## Estado da publicação

- [x] Site estático implementado em HTML/CSS/JavaScript sem framework ou compilador.
- [x] Estética de jornal impresso responsiva.
- [x] Manchete principal e chamadas secundárias.
- [x] Seções: Notícias, Artigos, Editorial e Opinião.
- [x] Página individual de matéria por parâmetro `?post=slug`.
- [x] Filtro por seção e categoria.
- [x] Busca por título, resumo, categoria, autoria e conteúdo.
- [x] Página Sobre e página 404.
- [x] SEO básico, canonical, Open Graph, robots e sitemap.
- [x] Conteúdo em JSON versionado no GitHub.
- [x] Quatro matérias explicativas adicionadas com capas editoriais.
- [x] Fotografias de capa configuradas nas sete matérias, com créditos e links de licença.
- [x] Fallback local caso alguma imagem externa não carregue.
- [x] Configuração do Pages CMS criada com editor visual, campos editoriais e upload de imagens.
- [x] Workflow de publicação HTML configurado para GitHub Actions, sem Node.js ou compilação.
- [x] Primeira execução do workflow concluída com sucesso.
- [x] GitHub Pages confirmou a implantação do endereço público.

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
     GitHub Actions empacota docs/
                |
                v
       GitHub Pages publica
```

O GitHub é a fonte oficial do conteúdo e do histórico. Não há banco de dados próprio do jornal nem API editorial. O Pages CMS é a interface de edição e grava os arquivos no repositório. O GitHub Pages recebe a pasta `docs/` pelo workflow GitHub Actions. A execução de publicação de 03/11/2026 terminou com sucesso: validação dos arquivos, upload do artefato e etapa `Deploy website` concluídos. O GitHub retornou `Reported success` e confirmou o endereço do ambiente.

## Painel editorial

Acesse **[Pages CMS](https://app.pagescms.org/)** e entre com a conta GitHub que possui permissão de escrita neste repositório.

Na primeira entrada:

1. Entre com GitHub.
2. Autorize/instale o GitHub App do Pages CMS no repositório `KaykyFerro/The-Bullshit-Bureau`.
3. Abra a branch `main`.
4. Acesse **Publicações**.
5. Edite uma matéria existente ou crie uma nova.

A página `/admin/` não é necessária para a administração: o link de edição fica no menu do próprio jornal, em **Redação**. Esse link abre o CMS hospedado, onde você entra com GitHub.

**Para manter apenas um editor:** mantenha `KaykyFerro` como única conta com permissão de escrita no repositório e não convide outros colaboradores para editar.

### Editor visual

O Pages CMS está configurado para editar o arquivo `docs/data/posts.json` como uma lista de publicações (`type: file`, `format: json`, `list: true`). O campo **Texto da matéria** usa o editor rich-text em HTML, com o modo Source oculto. O editor permite formatação de texto e upload de imagens.

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

O JavaScript filtra as publicações por `status` antes de renderizar o conteúdo. O rascunho continua no JSON, mas não é exibido aos visitantes. Salvar no CMS grava um commit no GitHub; com `main /docs` ativado em Settings → Pages, a publicação do site ocorre automaticamente.

### Imagens e créditos

As sete publicações possuem fotografias de capa hospedadas no Wikimedia Commons e carregadas por URL HTTPS. Cada publicação armazena `coverCredit`, `coverCreditUrl` e `coverLicenseUrl`; a página da matéria exibe o crédito e o link da licença.

| Publicação | Crédito | Licença |
| --- | --- | --- |
| A verdade acima da ideologia | Roman Kraft / Unsplash | CC0 1.0 |
| Fato, análise e opinião | Niabot | CC BY-SA 3.0 |
| Três perguntas antes de compartilhar | Ka Kit Pang | CC BY-SA 4.0 |
| Inteligência artificial no cotidiano | Mark Cruz / Unsplash | CC0 1.0 |
| Checar antes de compartilhar | Michael Slaten | CC BY-SA 4.0 |
| Cidades caminháveis | Natur243 | CC BY-SA 4.0 |
| Ensino técnico e aprendizagem contínua | Esthee2010 | CC BY-SA 4.0 |

Os links da fonte e das licenças estão gravados em cada item de `docs/data/posts.json` e aparecem junto à imagem na página da matéria.

O portal também usa uma ilustração SVG local como fallback caso uma imagem externa esteja indisponível. Para novas imagens, preencha os campos de crédito e licença no CMS quando exigidos pela licença escolhida.

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

## Publicação pelo GitHub Pages

A publicação usa **Settings → Pages → Build and deployment → Source: GitHub Actions**.

O workflow `.github/workflows/deploy.yml`:

1. Baixa o repositório.
2. Verifica se HTML, CSS, JavaScript, JSON e `.nojekyll` existem e estão válidos.
3. Envia a pasta `docs/` como artefato, incluindo arquivos ocultos.
4. Publica o artefato no GitHub Pages.

Não há instalação de Node.js, npm, Astro ou compilação. O site já está pronto dentro de `docs/`. Cada alteração em `docs/` ou no workflow dispara uma publicação. Mantenha **GitHub Actions** selecionado como fonte em Settings → Pages.

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

## Matérias adicionadas em 03/11/2026

Foram adicionadas quatro matérias curtas, ilustradas e identificadas como **especiais explicativos**. Elas são conteúdos perenes de preenchimento/editorial, não notícias sobre acontecimentos recentes inventados.

| Matéria | Editoria | Capa |
| --- | --- | --- |
| Inteligência artificial no cotidiano: o que vale automatizar? | Tecnologia | `ai-workspace.svg` |
| Checar antes de compartilhar: um hábito simples para a vida digital | Jornalismo | `media-literacy.svg` |
| Cidades caminháveis começam com calçadas seguras e espaços públicos | Sociedade | `walkable-city.svg` |
| Ensino técnico e aprendizagem contínua: caminhos para ampliar oportunidades | Educação | `education-classroom.svg` |

A matéria sobre inteligência artificial está configurada como manchete principal. As quatro publicações estão marcadas como `published` no arquivo `docs/data/posts.json`.

## Identidade editorial

**Nome:** The Bullshit Bureau  
**Slogan:** A verdade acima da ideologia.

A proposta é questionar narrativas de todos os lados, distinguir fato, análise e opinião, apresentar contexto e deixar clara a natureza de cada publicação. O slogan representa um compromisso editorial, não uma alegação de infalibilidade.

Reportagens factuais devem incluir fontes verificáveis, datas, contexto, contrapontos relevantes e correções transparentes. Textos demonstrativos devem ser revisados antes de serem tratados como notícia.

## Registro de atualizações

### 03/11/2026 — Como editar e publicar matérias

1. Abra [Pages CMS](https://app.pagescms.org/) e entre com a conta GitHub autorizada.
2. Selecione `KaykyFerro/The-Bullshit-Bureau` e a branch `main`.
3. Abra **Publicações** para editar uma matéria ou criar uma nova.
4. Preencha título, slug, editoria, categoria, autor, data, capa e corpo no editor visual.
5. Use `draft` para rascunho ou `published` para colocar no jornal.
6. Salve. O CMS grava no `docs/data/posts.json`; o GitHub Pages publica quando a origem `main /docs` está ativa.

### 03/11/2026 — Publicação confirmada no GitHub Pages

- Restaurado o workflow de publicação do HTML estático para compatibilidade com a fonte GitHub Actions.
- Corrigido o teste do arquivo `.nojekyll`, que é intencionalmente vazio e deve ser verificado com `test -f`.
- Execução de publicação concluída com sucesso: validação, artefato e deploy.
- GitHub Pages confirmou o endereço `https://kaykyferro.github.io/The-Bullshit-Bureau/`.

### 03/11/2026 — Migração para HTML estático e publicação direta pela branch

- Criado portal público em HTML, CSS e JavaScript puros dentro de `docs/`.
- Migração do conteúdo editorial para `docs/data/posts.json`.
- Inclusão de quatro matérias explicativas curtas e quatro capas editoriais SVG originais.
- Substituição das capas por fotografias do Wikimedia Commons, com identificação de autoria e licença em cada matéria.
- Adicionados fallback de imagem, exibição de créditos no artigo e campos de crédito/fonte/licença no Pages CMS.
- Configurado o Pages CMS para editar a lista JSON com rich-text HTML e mídia.
- Removido o workflow Astro que impedia a publicação por incompatibilidade de Node.
- Workflow GitHub Actions restaurado para publicar o HTML pronto de `docs/`, sem Node, npm ou compilação.
- Criadas páginas de fallback 404, robots.txt e sitemap.xml.
- Mantido o protótipo Astro em `src/` apenas como referência, fora do caminho de publicação.

## Licença e responsabilidade

O conteúdo inicial é editorial e educativo, não reportagem sobre acontecimentos externos. O responsável editorial deve revisar textos, imagens, direitos de uso, fontes e correções antes de cada publicação.
