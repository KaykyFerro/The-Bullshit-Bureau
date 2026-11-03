# The Bullshit Bureau

> **A verdade acima da ideologia.**

Jornal digital independente com estética de jornal impresso. O site público usa HTML, CSS e JavaScript puros, com conteúdo editorial em JSON e publicação pelo GitHub Pages.

**Site:** https://kaykyferro.github.io/The-Bullshit-Bureau/  
**Repositório:** https://github.com/KaykyFerro/The-Bullshit-Bureau

## Estrutura enxuta

O repositório mantém somente o que participa do jornal, da edição ou da publicação:

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml       # Publica o site no GitHub Pages
├── .pages.yml               # Configuração do editor Pages CMS
├── docs/                    # Site público publicado
│   ├── index.html
│   ├── 404.html
│   ├── .nojekyll
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── assets/
│   │   ├── css/newspaper.css
│   │   ├── js/newspaper.js
│   │   └── images/
│   │       ├── favicon.svg
│   │       ├── press-engraving.svg
│   │       └── uploads/     # Imagens enviadas pelo CMS
│   └── data/
│       ├── posts.json       # Notícias, artigos e editoriais
│       └── site.json        # Nome, slogan e descrição
└── README.md
```

Não há framework de frontend, compilador, dependência Node, API editorial ou banco de dados próprio. O GitHub é a fonte oficial dos textos, imagens e histórico.

## O que o site oferece

- Página inicial com manchete principal, chamadas e últimas publicações.
- Seções de Notícias, Artigos, Editorial e Opinião.
- Página de leitura individual para cada matéria.
- Busca por título, resumo, categoria, autor e conteúdo.
- Filtro por editoria e categoria.
- Página institucional Sobre.
- Layout responsivo para celular, tablet e computador.
- SEO básico, metadados Open Graph, robots.txt e sitemap.xml.
- Página 404 personalizada.

## Editar o jornal

A edição é feita no [Pages CMS](https://app.pagescms.org/), usando login com GitHub.

1. Entre no Pages CMS com a conta GitHub autorizada.
2. Abra `KaykyFerro/The-Bullshit-Bureau`, branch `main`.
3. Abra a coleção **Publicações**.
4. Crie uma matéria ou selecione uma existente.
5. Edite os campos e o texto no editor visual.
6. Escolha `draft` para manter em rascunho ou `published` para exibir no jornal.
7. Salve. O CMS grava as alterações no repositório.

Na primeira utilização, é necessário autorizar o aplicativo Pages CMS para este repositório. Para manter um único editor, deixe somente a conta proprietária com permissão de escrita e não adicione colaboradores editoriais.

### Campos das matérias

| Campo | Finalidade |
| --- | --- |
| Título e linha fina | Manchete e subtítulo |
| Slug | Identificador único da matéria |
| Resumo | Texto dos cards e resultados de busca |
| Editoria e categoria | Organização do conteúdo |
| Autor e data | Crédito editorial |
| Status | Rascunho ou publicado |
| Manchete principal | Define o destaque da capa |
| Imagem de capa | Fotografia ou ilustração |
| Texto alternativo | Acessibilidade |
| Crédito, fonte e licença | Atribuição das imagens |
| Texto da matéria | Editor visual rico |

### Imagens

- Uploads do CMS: `docs/assets/images/uploads/`.
- Endereço público dos uploads: `/The-Bullshit-Bureau/assets/images/uploads/`.
- Formatos aceitos: JPG, JPEG, PNG, WebP e AVIF.
- As matérias atuais usam fotografias externas do Wikimedia Commons, com crédito e link de licença registrados em cada publicação.
- O SVG `press-engraving.svg` é a imagem local de reserva caso uma fotografia externa não carregue.

### Rascunhos e publicação

O site só exibe matérias com `status: "published"`. Rascunhos permanecem no JSON do repositório, mas não aparecem aos visitantes.

## Hospedagem e atualização automática

O GitHub Pages recebe o conteúdo da pasta `docs/` por meio do workflow:

`.github/workflows/deploy.yml`

A cada alteração em `docs/` ou no próprio workflow, o GitHub Actions:

1. Verifica os arquivos HTML, CSS, JavaScript e JSON.
2. Empacota a pasta `docs/`.
3. Publica o artefato no GitHub Pages.

Não há build de aplicação. A página publicada é o próprio `docs/index.html`.

**Origem do GitHub Pages:** GitHub Actions.  
**Endereço público:** https://kaykyferro.github.io/The-Bullshit-Bureau/

Acompanhe as publicações em [GitHub Actions](https://github.com/KaykyFerro/The-Bullshit-Bureau/actions).

## Conteúdo atual

O portal contém sete matérias de demonstração/editoriais, entre elas textos sobre inteligência artificial, verificação de informações, cidades caminháveis e educação. São conteúdos explicativos, não notícias factuais sobre acontecimentos recentes.

## Identidade editorial

**Nome:** The Bullshit Bureau  
**Slogan:** A verdade acima da ideologia.

A proposta é distinguir fatos, análises e opiniões, apresentar contexto, indicar fontes e corrigir erros de forma transparente. O slogan é um compromisso editorial, não uma alegação de infalibilidade.

## Histórico da limpeza

- Removido o protótipo antigo e seus arquivos de build, configuração e dependências.
- Removidas cópias de mídia que não eram referenciadas pelo site público.
- Mantidos o portal estático, os dados, o CMS, as imagens utilizadas, o fallback e o workflow de publicação.
- Nenhuma matéria, configuração ativa do CMS ou arquivo usado pelo site foi removido.

## Responsabilidade editorial

Antes de publicar uma matéria factual, verifique fontes, datas, contexto, direitos de uso das imagens e eventuais contrapontos. Identifique claramente textos explicativos, análises e opiniões.
