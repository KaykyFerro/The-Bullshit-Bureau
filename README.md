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
| Publicação do portal | GitHub Pages | Entrega direta dos arquivos da branch `main` |
| App Android/iOS | Capacitor 8.6 + Vite | WebView local e recursos nativos |
| Persistência mobile | Preferences + Filesystem | Favoritos, preferências e leitura offline |
| Compartilhamento mobile | Capacitor Share | Folha nativa de compartilhamento |
| Push mobile | Firebase Messaging + Cloudflare Worker | Tokens FCM e alertas de novas matérias |
| Armazenamento técnico de push | Cloudflare D1 | Tokens de instalação, sem conteúdo editorial |

### Sem backend e sem banco de dados próprio

O portal público é estático. Não utiliza servidor de aplicação, API editorial ou banco de dados para armazenar matérias. O GitHub é a fonte oficial do código, das matérias, das imagens enviadas e do histórico. O navegador carrega `docs/data/site.json` e `docs/data/posts.json` por requisições `fetch`.

O Pages CMS autentica com GitHub e grava alterações no repositório. O app mobile sincroniza o mesmo JSON publicado; não mantém uma segunda redação.

**Exceção técnica:** notificações push remotas usam um Cloudflare Worker e Cloudflare D1 para registrar tokens de dispositivos. Essa tabela não armazena notícias, usuários editoriais ou dados do CMS. O push é opcional e só funciona depois de configurar Firebase, APNs, Worker e secrets.

## 4. Estrutura atual do repositório

O repositório mantém o portal público, o editor Pages CMS e o aplicativo mobile:

```text
The-Bullshit-Bureau/
├── .github/
│   └── workflows/
│       ├── build-mobile-android.yml
│       ├── build-mobile-ios-simulator.yml
│       └── notify-mobile-push.yml
├── .nojekyll
├── 404.html
├── index.html
├── robots.txt
├── sitemap.xml
├── .pages.yml
├── README.md
├── mobile/
│   ├── .gitignore
│   ├── README.md
│   ├── capacitor.config.json
│   ├── package.json
│   ├── vite.config.js
│   ├── scripts/
│   │   ├── sync-content.mjs
│   │   ├── configure-android-fcm.mjs
│   │   ├── patch-ios-push.mjs
│   │   └── configure-ios-project.mjs
│   ├── src/
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── styles.css
│   │   └── public/assets/images/app-mark.svg
│   ├── native/
│   │   ├── android/ic_stat_bureau.xml
│   │   ├── android/README.md
│   │   └── ios/PrivacyInfo.xcprivacy
│   └── push/
│       ├── README.md
│       ├── schema.sql
│       ├── worker.js
│       └── wrangler.toml
└── docs/
    ├── .nojekyll
    ├── 404.html
    ├── index.html
    ├── robots.txt
    ├── sitemap.xml
    ├── assets/
    │   ├── css/newspaper.css
    │   ├── js/newspaper.js
    │   └── images/
    │       ├── favicon.svg
    │       ├── press-engraving.svg
    │       └── uploads/
    └── data/
        ├── posts.json
        └── site.json
```

### Responsabilidade dos arquivos principais

| Caminho | Finalidade |
| --- | --- |
| `.pages.yml` | Campos, coleções e uploads do Pages CMS |
| `index.html` | Entrada pública do portal no GitHub Pages |
| `docs/assets/css/newspaper.css` | Identidade visual e responsividade do jornal web |
| `docs/assets/js/newspaper.js` | Navegação, busca e renderização do portal |
| `docs/data/posts.json` | Notícias, artigos, editoriais e opiniões |
| `docs/data/site.json` | Nome, slogan e descrição do jornal |
| `mobile/package.json` | Capacitor, plugins nativos e scripts do aplicativo |
| `mobile/src/main.js` | Interface mobile, leitura, favoritos, offline e push |
| `mobile/scripts/sync-content.mjs` | Copia o conteúdo do CMS para o bundle do app |
| `mobile/push/worker.js` | Registro de tokens e entrega de notificações FCM |
| `mobile/push/schema.sql` | Tabela técnica D1 para tokens de instalação |
| `.github/workflows/build-mobile-android.yml` | Gera APK debug de testes |
| `.github/workflows/build-mobile-ios-simulator.yml` | Gera app para simulador iOS, sem assinatura |
| `.github/workflows/notify-mobile-push.yml` | Detecta matérias novas e solicita o envio FCM |

As plataformas nativas `mobile/android/` e `mobile/ios/`, o bundle compilado `mobile/www/` e as dependências `node_modules/` são gerados durante os builds e não são versionados.

O site público continua estático e independente do build mobile. A pasta `mobile/` usa Capacitor e Vite para criar os aplicativos nativos.

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


## 15. Aplicativo Android e iOS

O projeto inclui o aplicativo **The Bullshit Bureau Mobile**, construído com Capacitor 8.6.0. Ele tem uma interface própria para celular, mas consome as mesmas notícias do portal e do Pages CMS.

### Recursos do aplicativo

| Recurso | Implementação |
| --- | --- |
| Compartilhamento | Capacitor Share abre o menu nativo do aparelho |
| Favoritos | Preferences salva as matérias marcadas no dispositivo |
| Leitura offline | Filesystem guarda o texto da matéria e tenta baixar a capa |
| Notificações locais | Avisa sobre novos slugs detectados durante a sincronização |
| Notificações remotas | Firebase Messaging com tokens FCM, quando o backend push está configurado |
| Modo leitura | Aumenta tipografia e limita a coluna do texto |
| Atualização | Busca `docs/data/posts.json` e `docs/data/site.json` publicados pelo GitHub Pages |

Favoritos e matérias offline ficam no aparelho e não exigem login. Quando o aplicativo está online, sincroniza a edição mais recente. Quando fica offline, usa o cache e as matérias que o usuário salvou.

### Integração com o CMS

O fluxo editorial permanece único:

1. A redação edita uma matéria no Pages CMS.
2. O CMS grava a atualização em `docs/data/posts.json`.
3. O GitHub Pages publica o jornal.
4. O app sincroniza o mesmo JSON na abertura e na retomada.
5. Se FCM/Worker estiverem configurados, GitHub Actions detecta matérias recém-publicadas e solicita o envio de notificação.

Não existe cópia separada de notícias para o app e ele não altera o conteúdo do CMS.

### Redação mobile e permissões

A versão 1.1.0 inclui uma área **Redação** na navegação inferior. Ela cria e edita matérias, permite rascunhos locais, upload de capas e publicação direta em `docs/data/posts.json`. Para conectar, use um Fine-grained GitHub token restrito ao repositório, com `Contents: Read and write`; a credencial é guardada no Android Keystore/iOS Keychain, nunca dentro do bundle. A tela inicial explica as permissões: notificações são opcionais, imagens são selecionadas pelo sistema apenas quando solicitadas e os recursos offline usam armazenamento privado sem pedir acesso amplo ao aparelho. Localização, contatos e microfone não são solicitados.

### Tecnologias mobile

- Capacitor 8.6.0 para Android/iOS.
- Vite 8 para empacotar a interface local do app.
- Capacitor Preferences e Filesystem para dados no aparelho.
- Capacitor Share para o compartilhamento nativo.
- Local Notifications para alertas locais.
- `@capacitor-firebase/messaging 8.6.0` + Firebase JS SDK 12.19.0 para tokens FCM em Android/iOS.
- Cloudflare Worker e D1 para registro técnico de instalações e envio remoto FCM.

### Gerar o aplicativo Android

Requisitos: Node.js 22+, JDK 21 e Android Studio 2025.2.1+.

```powershell
cd mobile
npm install
npm run build
npx cap add android
npm run android:sync
npm run android:open
```

No Android Studio, execute em um emulador ou aparelho conectado. Para APK debug:

```powershell
cd android
.\\gradlew.bat assembleDebug
```

O arquivo fica em `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

Também existe o workflow **Build The Bullshit Bureau Android APK** na aba [GitHub Actions](https://github.com/KaykyFerro/The-Bullshit-Bureau/actions). Após a execução, baixe o artifact `the-bullshit-bureau-android-debug`.

O APK debug serve para teste. Para Play Store, gere um AAB de release assinado com chave própria e verifique targetSdk 36 ou superior.

### Gerar o aplicativo iOS

Requisitos: macOS e Xcode 26+.

```bash
cd mobile
npm install
npm run ios:add
npm run ios:sync
npm run ios:open
```

O workflow **Build The Bullshit Bureau iOS Simulator App** gera um app para iOS Simulator e o compacta em ZIP. Esse artefato não é IPA distribuível.

Para instalar em iPhone físico via TestFlight ou publicar na App Store, são necessários Apple Developer account, Bundle ID, certificado Apple Distribution, provisioning profile, Team ID e assinatura. O target também precisa habilitar Push Notifications e o Firebase deve receber a chave APNs.

A Apple avalia se apps que encapsulam conteúdo web oferecem utilidade suficiente além de um site. O app inclui favoritos persistentes, leitura offline, compartilhamento nativo, modo leitura e push, mas isso não garante aprovação na App Store. Consulte a [diretriz 4.2 da Apple](https://developer.apple.com/app-store/review/guidelines/).

### Configuração de notificações remotas

O cliente Firebase está implementado, mas o serviço de envio remoto depende de configuração externa:

1. Criar um projeto Firebase.
2. Registrar Android `br.com.thebullshitbureau.app` e o mesmo Bundle ID no iOS.
3. Baixar `google-services.json` e `GoogleService-Info.plist`.
4. Enviar a chave APNs para Firebase.
5. Criar o D1 e implantar `mobile/push/worker.js` no Cloudflare.
6. Cadastrar as variáveis e secrets descritos em [mobile/push/README.md](mobile/push/README.md).

O D1 armazena apenas tokens de instalação e metadados técnicos, não matérias nem dados do CMS. Sem essas credenciais, o app continua oferecendo compartilhamento, favoritos, modo leitura e leitura offline; push remoto permanece desativado.

### Documentação mobile

- [Guia completo de instalação e operação](mobile/README.md)
- [Configuração do Firebase e push](mobile/push/README.md)
- [Workflow de APK Android](.github/workflows/build-mobile-android.yml)
- [Workflow de app iOS Simulator](.github/workflows/build-mobile-ios-simulator.yml)

**The Bullshit Bureau — A verdade acima da ideologia.**
