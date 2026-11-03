# The Bullshit Bureau

> **A verdade acima da ideologia.**

Jornal digital independente com aparência de jornal impresso. O portal é feito em HTML, CSS e JavaScript puros, com matérias armazenadas em JSON, edição visual pelo Pages CMS e publicação automática pelo GitHub Pages.

| | |
| --- | --- |
| **Site publicado** | https://kaykyferro.github.io/The-Bullshit-Bureau/ |
| **Repositório** | https://github.com/KaykyFerro/The-Bullshit-Bureau |
| **CMS editorial** | https://app.pagescms.org/ |
| **Hospedagem** | GitHub Pages |
| **Branch de publicação** | `main` |
| **Pasta publicada** | `/` (raiz do repositório) |

---

## 1. Sobre o jornal

**Nome:** The Bullshit Bureau  
**Slogan:** A verdade acima da ideologia.

A proposta editorial é apresentar informação com contexto, identificar a diferença entre notícia, análise e opinião, indicar as fontes utilizadas e corrigir erros de forma transparente. O slogan representa um compromisso de método, não uma alegação de infalibilidade.

A identidade visual usa referências de jornais impressos: papel em tom marfim, tipografia serifada, manchetes grandes, filetes, colunas, metadados discretos e detalhes em vermelho escuro. O layout se adapta a celulares, tablets e computadores.

## 2. O que existe no site

### Página inicial

- Masthead com o nome do jornal e o slogan.
- Data atual e quantidade de publicações disponíveis.
- Manchete principal, definida pelo campo `featured`.
- Chamadas secundárias para outras matérias.
- Grade de últimas publicações.
- Atalhos de categorias.

### Editorias

O menu principal apresenta quatro editorias:

| Valor salvo no conteúdo | Nome exibido |
| --- | --- |
| `noticias` | Notícias |
| `artigos` | Artigos & análises |
| `editoriais` | Editorial |
| `opiniao` | Opinião |

As páginas são montadas no próprio navegador a partir dos dados publicados. Não existem arquivos HTML individuais para cada matéria.

### Leitura de uma matéria

Cada publicação apresenta:

- Editoria e categoria.
- Título e linha fina.
- Autor e data.
- Imagem de capa.
- Crédito da fotografia, link da fonte e link da licença, quando informados.
- Corpo do texto com formatação.
- Até três sugestões de leitura da mesma categoria, quando existem.

O endereço de leitura usa o parâmetro `?post=` seguido pelo slug da publicação.

### Busca

A busca consulta o conteúdo publicado e procura correspondências em título, linha fina, resumo, categoria, autor e texto da matéria. O resultado apresenta a quantidade encontrada e os cartões das publicações correspondentes.

### Categorias

As categorias são identificadas a partir das publicações disponíveis. O site cria atalhos para cada categoria e permite abrir o respectivo conjunto de matérias.

Categorias disponíveis no editor:

- Política
- Economia
- Brasil
- Mundo
- Tecnologia
- Educação
- Ciência
- Cultura
- Sociedade
- Jornalismo

### Página Sobre

Apresenta a proposta editorial e os princípios do The Bullshit Bureau, incluindo a distinção entre fato, análise e opinião.

### Página 404

O arquivo `docs/404.html` é a página de fallback do GitHub Pages para endereços inexistentes.

## 3. Tecnologias e arquitetura

| Componente | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Estrutura do portal | HTML5 | Cabeçalho, navegação, conteúdo e rodapé |
| Aparência | CSS3 | Identidade visual e responsividade |
| Comportamento | JavaScript | Carregamento dos dados, navegação, busca e renderização |
| Conteúdo | JSON | Matérias e identidade do jornal |
| Edição | Pages CMS | Formulário visual, rich-text e envio de imagens |
| Versionamento | GitHub | Histórico e armazenamento dos arquivos |
| Hospedagem | GitHub Pages | Disponibilização do site |
| Publicação | GitHub Pages | Entrega direta dos arquivos da branch `main` |

### Sem backend e sem banco de dados próprio

O portal é estático. Não utiliza servidor de aplicação, API editorial, Node.js, npm, framework de frontend ou banco de dados próprio.

O GitHub é a fonte oficial do código, das matérias, das imagens enviadas e do histórico. O navegador carrega `docs/data/site.json` e `docs/data/posts.json` por requisições `fetch`.

O Pages CMS é um serviço externo que autentica com GitHub e grava alterações no repositório. O serviço pode ter seus próprios mecanismos internos, mas o jornal não mantém uma base de dados separada.

## 4. Estrutura atual do repositório

A estrutura foi reduzida para manter somente os arquivos utilizados pelo site, pelo editor ou pela publicação:

```text
The-Bullshit-Bureau/
├── .nojekyll                # Entrada raiz sem processamento Jekyll
├── 404.html                 # Fallback da raiz publicada
├── index.html               # Entrada raiz, carrega a aplicação de docs/
├── robots.txt
├── sitemap.xml
├── .pages.yml
├── README.md
└── docs/
    ├── .nojekyll
    ├── 404.html
    ├── index.html
    ├── robots.txt
    ├── sitemap.xml
    ├── assets/
    │   ├── css/
    │   │   └── newspaper.css
    │   ├── js/
    │   │   └── newspaper.js
    │   └── images/
    │       ├── favicon.svg
    │       ├── press-engraving.svg
    │       └── uploads/
    │           └── .gitkeep
    └── data/
        ├── posts.json
        └── site.json
```

### Responsabilidade de cada arquivo

| Arquivo | Finalidade |
| --- | --- |
| `.pages.yml` | Define as coleções, campos do CMS e diretório de mídia |
| `.nojekyll` | Desativa o processamento Jekyll na raiz publicada |
| `404.html` | Página de erro publicada na raiz |
| `robots.txt` | Regras dos robôs de busca na raiz |
| `sitemap.xml` | Sitemap disponível na raiz |
| `index.html` | Entrada pública na raiz do projeto; carrega CSS, JS e conteúdo a partir de `docs/` |
| `docs/index.html` | Estrutura completa alternativa do portal, usada quando a origem do Pages é a pasta `/docs` |
| `docs/assets/css/newspaper.css` | Layout, tipografia, cores e regras responsivas |
| `docs/assets/js/newspaper.js` | Carrega os JSON e monta as telas |
| `docs/data/posts.json` | Lista de notícias, artigos, editoriais e opiniões |
| `docs/data/site.json` | Nome, slogan e descrição do jornal |
| `docs/assets/images/favicon.svg` | Ícone do site |
| `docs/assets/images/press-engraving.svg` | Ilustração local de reserva e imagem da página Sobre |
| `docs/assets/images/uploads/` | Destino das imagens enviadas pelo CMS |
| `docs/404.html` | Cópia da página de endereço não encontrado para a versão interna em `docs/` |
| `docs/robots.txt` | Orientações básicas para robôs de busca |
| `docs/sitemap.xml` | Sitemap XML atual |

Não existe mais protótipo Astro, código TypeScript, pasta de build ou dependência de pacote no projeto ativo.

## 5. Como o conteúdo funciona

### Arquivo de matérias

Todas as publicações ficam em:

`docs/data/posts.json`

O arquivo contém uma lista JSON. Cada objeto representa uma matéria. O site carrega essa lista, mantém apenas os itens com `status: "published"` e ordena as publicações pela data, da mais recente para a mais antiga.

O campo `featured: true` indica a manchete principal da capa. Mantenha somente uma publicação com esse campo ativado para evitar destaque ambíguo.

### Campos de uma publicação

| Campo | Obrigatório no CMS | Descrição |
| --- | --- | --- |
| `title` | Sim | Título da matéria |
| `slug` | Sim | Identificador único usado no endereço da matéria |
| `subtitle` | Não | Linha fina ou subtítulo |
| `excerpt` | Sim | Resumo usado nos cartões e na busca |
| `section` | Sim | Editoria da publicação |
| `category` | Sim | Categoria temática |
| `author` | Sim | Autor ou identificação da redação |
| `publishedAt` | Sim | Data da publicação |
| `status` | Sim | `draft` ou `published` |
| `featured` | Não | Define a manchete principal quando verdadeiro |
| `cover` | Não | URL ou caminho da imagem de capa |
| `coverAlt` | Não | Descrição da imagem para acessibilidade |
| `coverCredit` | Não | Crédito/autoria da imagem |
| `coverCreditUrl` | Não | Link para a página da imagem ou fonte |
| `coverLicenseUrl` | Não | Link para a licença de uso |
| `body` | Sim | Corpo do texto em HTML |

### Exemplo de uma publicação

```json
{
  "title": "Título da matéria",
  "slug": "titulo-da-materia",
  "subtitle": "Linha fina da publicação",
  "excerpt": "Resumo curto para a capa e a busca.",
  "section": "noticias",
  "category": "Brasil",
  "author": "Redação The Bullshit Bureau",
  "publishedAt": "2026-11-03",
  "status": "draft",
  "featured": false,
  "cover": "/The-Bullshit-Bureau/assets/images/uploads/capa.webp",
  "coverAlt": "Descrição objetiva da fotografia.",
  "coverCredit": "Nome do fotógrafo / fonte",
  "coverCreditUrl": "https://exemplo.org/imagem",
  "coverLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
  "body": "<p>Texto da matéria...</p><h2>Subtítulo</h2><p>Continuação do texto...</p>"
}
```

### Formato do corpo do texto

O editor salva o corpo como HTML. O site permite tags editoriais comuns, como parágrafos, títulos, negrito, itálico, listas, citações, links, imagens, tabelas e blocos de código.

Na exibição, o JavaScript sanitiza o HTML: limita as tags e atributos aceitos e remove elementos como scripts, estilos, iframes e objetos incorporados. Links externos são abertos em nova aba com proteção `noopener noreferrer`.

### Rascunho e publicação

- `draft`: permanece salvo no repositório, mas não é mostrado aos visitantes.
- `published`: é carregado e exibido no portal.

O status é aplicado pelo JavaScript durante o carregamento. Portanto, o rascunho continua presente no arquivo JSON do repositório; não é uma área privada separada.

## 6. Como editar pelo Pages CMS

A administração editorial acontece no serviço Pages CMS, não dentro de um painel próprio do site.

**Acessar:** https://app.pagescms.org/

### Primeira autorização

1. Entre no Pages CMS usando a conta GitHub que possui permissão de escrita.
2. Autorize/instale o aplicativo do Pages CMS para o repositório `KaykyFerro/The-Bullshit-Bureau`.
3. Abra o repositório e selecione a branch `main`.
4. A coleção **Publicações** corresponde ao arquivo `docs/data/posts.json`.
5. A coleção **Identidade do jornal** corresponde ao arquivo `docs/data/site.json`.

A autorização do aplicativo é feita na interface do próprio Pages CMS. O arquivo `.pages.yml` já contém a configuração das coleções.

### Criar ou editar uma matéria

1. Abra **Publicações**.
2. Crie uma publicação ou selecione uma existente.
3. Preencha título, slug, resumo, editoria, categoria, autoria e data.
4. Escolha a imagem de capa e preencha texto alternativo e créditos, quando aplicável.
5. Escreva o corpo no editor visual.
6. Selecione `draft` para guardar como rascunho ou `published` para exibir no site.
7. Marque `featured` somente na matéria que deve ser a manchete principal.
8. Salve a publicação.

Ao salvar, o CMS registra a alteração no GitHub. A mudança em `docs/` dispara o workflow de publicação.

### Campos de identidade do jornal

A coleção **Identidade do jornal** edita `docs/data/site.json`:

| Campo | Uso atual |
| --- | --- |
| `name` | Nome utilizado no título da aba/navegador |
| `slogan` | Texto exibido no cabeçalho e no rodapé |
| `description` | Descrição usada nos metadados e no título da página inicial |

O texto visual do masthead — “THE BULLSHIT BUREAU” — também está escrito diretamente em `docs/index.html`. Alterar apenas o campo `name` no JSON não troca esse texto visual.

### Como manter um único editor

O controle de quem pode gravar no conteúdo é feito pelas permissões do GitHub:

- Mantenha `KaykyFerro` como única conta humana com permissão de escrita, se a intenção for ter um único editor.
- Não adicione colaboradores com permissão de escrita.
- Autorize o Pages CMS apenas para este repositório.
- Não compartilhe tokens pessoais nem credenciais.

A configuração do CMS não cria uma senha própria nem substitui as permissões do GitHub. O repositório pode ser público para leitura, enquanto a escrita continua restrita às contas autorizadas.

## 7. Imagens e direitos de uso

### Imagens de capa atuais

As sete matérias cadastradas possuem fotografias de capa externas, carregadas do Wikimedia Commons. Cada publicação guarda os campos de crédito, página da imagem e licença. O crédito e o link da licença são apresentados na página individual da matéria.

As imagens atuais usam as seguintes atribuições:

| Publicação | Crédito informado | Licença indicada |
| --- | --- | --- |
| A verdade acima da ideologia: o compromisso do Bureau | Roman Kraft / Unsplash, via Wikimedia Commons | CC0 1.0 |
| Fato, análise e opinião não são a mesma coisa | Niabot / Wikimedia Commons | CC BY-SA 3.0 |
| Três perguntas antes de compartilhar uma informação | Ka Kit Pang / Wikimedia Commons | CC BY-SA 4.0 |
| Inteligência artificial no cotidiano: o que vale automatizar? | Mark Cruz / Unsplash, via Wikimedia Commons | CC0 1.0 |
| Checar antes de compartilhar: um hábito simples para a vida digital | Michael Slaten / Wikimedia Commons | CC BY-SA 4.0 |
| Cidades caminháveis começam com calçadas seguras e espaços públicos | Natur243 / Wikimedia Commons | CC BY-SA 4.0 |
| Ensino técnico e aprendizagem contínua: caminhos para ampliar oportunidades | Esthee2010 / Wikimedia Commons | CC BY-SA 4.0 |

Os links específicos da fonte e da licença ficam gravados em cada objeto do JSON. Antes de reutilizar ou substituir uma imagem, confira as condições da página original.

### Upload de imagens pelo CMS

A configuração de mídia do Pages CMS utiliza:

- Pasta no repositório: `docs/assets/images/uploads/`
- Caminho salvo pelo CMS: `/The-Bullshit-Bureau/docs/assets/images/uploads/`
- O JavaScript normaliza esse caminho para a origem efetiva do Pages, seja a raiz do repositório ou a pasta `/docs`.
- Extensões aceitas: JPG, JPEG, PNG, WebP e AVIF.

O campo de imagem de capa e as imagens inseridas no rich-text utilizam essa coleção de mídia. Para imagens com licença que exija atribuição, preencha os campos de crédito, fonte e licença.

### Imagem reserva

`docs/assets/images/press-engraving.svg` é a ilustração local usada na página Sobre e como fallback caso uma imagem de capa não carregue. Ela não substitui a fotografia escolhida quando a imagem externa está disponível.

## 8. Publicação e hospedagem

O jornal é hospedado diretamente pelo **GitHub Pages**, a partir da branch `main`. Não há workflow personalizado de deploy nem etapa de compilação.

- Repositório: `KaykyFerro/The-Bullshit-Bureau`
- Branch de publicação: `main`
- Pasta de publicação: `/` (raiz do repositório)
- Endereço: https://kaykyferro.github.io/The-Bullshit-Bureau/

### Configuração do GitHub Pages

Em [Settings → Pages](https://github.com/KaykyFerro/The-Bullshit-Bureau/settings/pages), a origem deve estar assim:

| Campo | Valor |
| --- | --- |
| Source | Deploy from a branch |
| Branch | `main` |
| Folder | `/ (root)` |

A entrada pública é `index.html` na raiz. Ela carrega CSS e JavaScript de `docs/assets/` e dados de `docs/data/`. O README não é utilizado como página inicial.

O marcador raiz `.nojekyll` instrui o GitHub Pages a servir os arquivos sem processamento Jekyll. Também existem arquivos de raiz `404.html`, `robots.txt` e `sitemap.xml`.

### Como as atualizações são publicadas

O Pages acompanha os commits na branch `main`. Quando uma matéria é salva pelo Pages CMS, o commit atualiza `docs/data/posts.json`; o GitHub Pages publica a nova versão automaticamente.

Não há instalação de Node.js, npm, framework, compilador, API editorial ou banco de dados.

### Por que o workflow personalizado foi removido

O repositório estava executando a publicação nativa por branch e também um workflow que chamava `actions/deploy-pages`. Os dois mecanismos tentaram publicar ao mesmo tempo. O log do GitHub confirmou o conflito: uma implantação foi recusada porque outra ainda estava em andamento.

Para manter apenas um mecanismo, o workflow personalizado foi removido. A publicação agora utiliza **GitHub Pages → main → root**.

### Acompanhar a publicação

- [Configurações do GitHub Pages](https://github.com/KaykyFerro/The-Bullshit-Bureau/settings/pages)
- [Commits recentes](https://github.com/KaykyFerro/The-Bullshit-Bureau/commits/main)

Se uma alteração não aparecer:

1. Confirme se o CMS gravou o commit na branch `main`.
2. Abra Settings → Pages e confira `main / (root)`.
3. Aguarde o processamento da publicação pelo GitHub Pages.
4. Atualize o jornal. Se necessário, faça recarga forçada com `Ctrl + F5`.


## 9. Endereços e navegação

Todas as telas são renderizadas a partir de `docs/index.html`; a navegação utiliza parâmetros de consulta na URL.

| Tela | Exemplo de endereço |
| --- | --- |
| Início | `/` |
| Notícias | `/?section=noticias` |
| Artigos | `/?section=artigos` |
| Editorial | `/?section=editoriais` |
| Opinião | `/?section=opiniao` |
| Busca | `/?view=search` |
| Busca com termo | `/?view=search&q=tecnologia` |
| Sobre | `/?view=about` |
| Categoria | `/?category=Tecnologia` |
| Matéria individual | `/?post=inteligencia-artificial-no-cotidiano` |

O slug de cada matéria deve ser único. Como o portal não usa rotas geradas no servidor, não crie diretórios HTML individuais para cada notícia.

## 10. SEO, acessibilidade e compatibilidade

O portal inclui:

- Idioma do documento definido como português do Brasil (`pt-BR`).
- Meta description e metadados Open Graph básicos.
- URL canonical da página inicial.
- Ícone SVG.
- Arquivo `robots.txt`.
- Sitemap XML.
- Página 404 própria.
- Texto alternativo nas imagens de matéria quando preenchido.
- Link para pular diretamente ao conteúdo principal.
- Navegação identificada com rótulo acessível.
- Regra `prefers-reduced-motion` para reduzir animações quando solicitadas pelo sistema.

O sitemap atual contém somente a página inicial. As telas de editoria e matéria usam parâmetros de consulta, não endereços individuais estáticos no sitemap.

O CSS tem ajustes responsivos para telas menores que 850 px e 620 px. O site utiliza recursos nativos do navegador e não exige bibliotecas JavaScript externas para renderizar o conteúdo.

## 11. Edição direta pelo GitHub

Também é possível editar manualmente os arquivos:

- Matérias: `docs/data/posts.json`
- Identidade: `docs/data/site.json`
- HTML principal: `docs/index.html`
- Estilos: `docs/assets/css/newspaper.css`
- Comportamentos: `docs/assets/js/newspaper.js`
- Configuração do CMS: `.pages.yml`

Ao editar `posts.json` manualmente, preserve o formato JSON válido, use aspas duplas, não deixe vírgula após o último item e mantenha todos os campos com seus tipos corretos.

Para alterações de layout ou comportamento, faça commits em `docs/` ou na entrada raiz `index.html`. O GitHub Pages publica a atualização diretamente a partir da branch `main`.

## 12. Conteúdo atualmente cadastrado

O arquivo `docs/data/posts.json` contém sete publicações, todas marcadas como publicadas:

| Título | Editoria | Categoria |
| --- | --- | --- |
| A verdade acima da ideologia: o compromisso do Bureau | Editorial | Jornalismo |
| Fato, análise e opinião não são a mesma coisa | Artigos | Jornalismo |
| Três perguntas antes de compartilhar uma informação | Artigos | Sociedade |
| Inteligência artificial no cotidiano: o que vale automatizar? | Artigos | Tecnologia |
| Checar antes de compartilhar: um hábito simples para a vida digital | Artigos | Jornalismo |
| Cidades caminháveis começam com calçadas seguras e espaços públicos | Artigos | Sociedade |
| Ensino técnico e aprendizagem contínua: caminhos para ampliar oportunidades | Artigos | Educação |

Esses textos são materiais explicativos e editoriais de preenchimento. Não devem ser apresentados como reportagens de acontecimentos recentes.

## 13. Manutenção do projeto

### Alterar a aparência

Edite `docs/assets/css/newspaper.css`. As variáveis de cor estão no início do arquivo:

- `--paper`: papel de fundo.
- `--paper-shadow`: áreas de imagem e superfícies secundárias.
- `--ink`: texto principal.
- `--muted`: texto secundário.
- `--line`: divisórias.
- `--red`: cor de destaque editorial.

### Alterar o comportamento

Edite `docs/assets/js/newspaper.js`. Esse arquivo controla:

- Leitura dos arquivos JSON.
- Filtro de publicações por status.
- Ordenação por data.
- Seleção da manchete.
- Montagem dos cartões e páginas individuais.
- Busca, filtro por editoria e categoria.
- Tratamento de imagens e fallback.
- Sanitização do HTML do corpo das matérias.

### Alterar a estrutura fixa

Edite `docs/index.html` para modificar o masthead, o menu, o cabeçalho ou o rodapé que não dependem dos dados JSON. A marca visual principal está escrita diretamente nesse arquivo.

### Alterar a configuração do editor

Edite `.pages.yml` somente quando precisar mudar as coleções, campos, opções ou locais de mídia do Pages CMS. Essa configuração não altera diretamente o layout público.

## 14. Princípios editoriais e responsabilidade

Antes de publicar uma matéria factual:

- Confira a origem das informações e a data dos acontecimentos.
- Diferencie fatos confirmados, declarações, hipóteses e interpretações.
- Identifique análises e opiniões como tais.
- Inclua links ou referências para fontes verificáveis.
- Confira os direitos de uso das imagens e mantenha os créditos exigidos.
- Atualize a matéria quando houver correção relevante e deixe claro o que foi corrigido.

O objetivo do The Bullshit Bureau é informar com rigor, contexto e transparência. A revisão editorial é parte do processo de publicação.

---

**The Bullshit Bureau — A verdade acima da ideologia.**
