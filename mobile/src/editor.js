import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const API = 'https://api.github.com';
const REPO = 'KaykyFerro/The-Bullshit-Bureau';
const FILE = 'docs/data/posts.json';
const ALLOWED = new Set(['P','H2','H3','H4','STRONG','B','EM','I','UL','OL','LI','BLOCKQUOTE','HR','BR','A','IMG','FIGURE','FIGCAPTION','TABLE','THEAD','TBODY','TR','TH','TD','SUP','SUB','CODE','PRE']);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugify = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90);
const today = () => { const d = new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
const encode64 = value => { const b = new TextEncoder().encode(value); let s=''; for(let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode(...b.subarray(i,i+0x8000)); return btoa(s); };
const decode64 = value => new TextDecoder().decode(Uint8Array.from(atob(String(value||'').replace(/\s/g,'')),c=>c.charCodeAt(0)));
const cleanBody = markup => {
  const doc = new DOMParser().parseFromString(String(markup||''),'text/html');
  const walk = parent => [...parent.children].forEach(node => {
    if (!ALLOWED.has(node.tagName)) {
      if (['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','SVG'].includes(node.tagName)) node.remove();
      else node.replaceWith(...node.childNodes);
      return;
    }
    const keep = node.tagName==='A' ? ['href','title'] : node.tagName==='IMG' ? ['src','alt','title'] : ['TH','TD'].includes(node.tagName) ? ['colspan','rowspan'] : [];
    [...node.attributes].forEach(a => { if(!keep.includes(a.name.toLowerCase())) node.removeAttribute(a.name); });
    if(node.tagName==='A') { const href=node.getAttribute('href')||''; if(!/^https:\/\//i.test(href)) node.removeAttribute('href'); else {node.setAttribute('target','_blank');node.setAttribute('rel','noopener noreferrer');} }
    if(node.tagName==='IMG') { const src=node.getAttribute('src')||''; if(!/^https:\/\//i.test(src) && !src.startsWith('/The-Bullshit-Bureau/docs/')) node.remove(); }
    walk(node);
  });
  walk(doc.body);
  return doc.body.innerHTML;
};

export function createNewsroom({root,onPublished,toast}) {
  let token='', remotePosts=[], localDrafts=[], tab='new', editingSlug='', selectedImage=null, loaded=false, busy=false;
  async function secureReady() {
    if(!Capacitor.isNativePlatform()) throw new Error('A conexão editorial protegida só pode ser configurada no aplicativo instalado.');
    await SecureStorage.setKeyPrefix('the-bullshit-bureau-editor');
  }
  async function readToken() {
    try { await secureReady(); token=String(await SecureStorage.get('github-token')||''); } catch { token=''; }
    return token;
  }
  async function api(path,options={}) {
    const { operation = 'acessar o GitHub', ...fetchOptions } = options;
    const response=await fetch(API+path,{...fetchOptions,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28',...(fetchOptions.body?{'Content-Type':'application/json'}:{}),...(fetchOptions.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) {
      const required=response.headers.get('X-Accepted-GitHub-Permissions') || '';
      if(response.status===403 && /Resource not accessible by personal access token|Resource not accessible by integration/i.test(data.message||'')) {
        const permission=required || 'contents=write';
        throw new Error('O GitHub recusou a operação de '+operation+' porque o token não tem acesso suficiente. Permissão exigida pela API: '+permission+'. Crie um Fine-grained token para o repositório KaykyFerro/The-Bullshit-Bureau, habilite Repository permissions → Contents → Read and write, mantenha Metadata → Read-only e confira se o repositório está marcado em Repository access. Depois toque em “Trocar token” e conecte novamente. O erro não é causado pela imagem ou pelo texto.');
      }
      if(response.status===404) throw new Error('O GitHub não encontrou o arquivo ou o repositório. Confirme o acesso do token ao repositório KaykyFerro/The-Bullshit-Bureau.');
      throw new Error(data.message||('GitHub respondeu HTTP '+response.status+' ao '+operation+'.'));
    }
    return data;
  }
  async function fetchPosts() {
    const file=await api('/repos/'+REPO+'/contents/'+FILE+'?ref=main',{operation:'ler a lista de matérias'});
    const data=JSON.parse(decode64(file.content));
    if(!Array.isArray(data)) throw new Error('O arquivo de matérias não contém uma lista válida.');
    remotePosts=data; loaded=true; return data;
  }
  async function savePosts(next,message) {
    const file=await api('/repos/'+REPO+'/contents/'+FILE+'?ref=main',{operation:'ler a versão atual do arquivo editorial'});
    await api('/repos/'+REPO+'/contents/'+FILE,{method:'PUT',operation:'gravar docs/data/posts.json',body:JSON.stringify({message,content:encode64(JSON.stringify(next,null,2)+'\n'),sha:file.sha,branch:'main'})});
    remotePosts=next; loaded=true;
    await onPublished(next.filter(p=>p.status==='published').sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||''))));
  }
  async function uploadCover(slug) {
    if(!selectedImage) return '';
    const f=selectedImage;
    if(!/^image\/(jpeg|png|webp|gif)$/i.test(f.type)) throw new Error('Use uma imagem JPG, PNG, WEBP ou GIF.');
    if(f.size>5*1024*1024) throw new Error('A capa precisa ter no máximo 5 MB.');
    const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=reject;reader.readAsDataURL(f);});
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'})[f.type]||'jpg';
    const name=slugify(slug)+'-'+Date.now()+'.'+ext;
    await api('/repos/'+REPO+'/contents/docs/assets/images/uploads/'+name,{method:'PUT',operation:'enviar a imagem de capa',body:JSON.stringify({message:'media(mobile): adiciona capa '+slugify(slug),content:base64,branch:'main'})});
    return '/The-Bullshit-Bureau/docs/assets/images/uploads/'+name;
  }
  function login(message='') {
    root.innerHTML='<section class="screen-heading"><p class="section-kicker">Área restrita</p><h1>Redação</h1><p>Crie, edite e publique matérias diretamente pelo aplicativo.</p></section>'+
      '<section class="editor-connect"><div class="editor-brand"><img src="./assets/images/app-mark.svg" alt=""><div><strong>Acesso editorial</strong><span>GitHub · repositório do jornal</span></div></div>'+
      '<p>O token fica protegido no Android Keystore ou no iOS Keychain. Ele é enviado somente ao GitHub para validar e gravar matérias.</p>'+
      '<label class="editor-label" for="github-token">Token de acesso pessoal</label><input id="github-token" class="editor-input" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_..." />'+
      '<button class="editor-primary" data-editor="connect">Conectar à redação</button><p class="editor-message">'+esc(message)+'</p>'+
      '<details class="editor-help" open><summary>Como criar o token com a permissão correta</summary><ol><li>Abra GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.</li><li>Em <strong>Resource owner</strong>, escolha KaykyFerro; em <strong>Repository access</strong>, marque <strong>Only select repositories</strong> e selecione <strong>'+REPO+'</strong>.</li><li>Em <strong>Repository permissions</strong>, habilite <strong>Contents → Read and write</strong>. Deixe <strong>Metadata → Read-only</strong>.</li><li>Gere um token novo com validade curta e cole aqui. Não use um token configurado apenas para leitura ou sem o repositório selecionado.</li></ol><p>O erro “Resource not accessible by personal access token” normalmente indica exatamente falta de permissão ou de acesso ao repositório. A publicação usa a permissão <code>contents=write</code>.</p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Criar novo token no GitHub ↗</a></details></section>'+
      '<p class="settings-note">O token pode ser removido deste aparelho a qualquer momento. Não configure o acesso editorial em aparelhos compartilhados.</p>';
  }
  function list() {
    const filtered=remotePosts.filter(p=>tab==='drafts'?p.status!=='published':p.status==='published');
    const rows=filtered.map(p=>'<article class="editor-story"><div><span class="editor-status '+(p.status==='published'?'published':'draft')+'">'+(p.status==='published'?'Publicada':'Rascunho')+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.author||'Redação')+' · '+esc(p.publishedAt||'Sem data')+'</p></div><div class="editor-row-actions"><button class="paper-button secondary" data-editor="edit" data-slug="'+esc(p.slug)+'">Editar</button><button class="paper-button editor-delete-button" data-editor="delete" data-slug="'+esc(p.slug)+'">Excluir</button></div></article>').join('');
    const local=tab==='drafts'?localDrafts.map((p,i)=>'<article class="editor-story"><div><span class="editor-status local">Neste aparelho</span><h3>'+esc(p.title||'Sem título')+'</h3><p>Rascunho local</p></div><div class="editor-row-actions"><button class="paper-button secondary" data-editor="edit-local" data-index="'+i+'">Abrir</button><button class="paper-button editor-delete-button" data-editor="delete-local" data-index="'+i+'">Excluir</button></div></article>').join(''):'';
    root.innerHTML='<section class="screen-heading"><p class="section-kicker">Painel editorial</p><h1>Redação</h1><p>Publicações sincronizadas com o portal e o Pages CMS.</p></section>'+
      '<div class="editor-toolbar-top"><button class="editor-primary" data-editor="new">＋ Nova matéria</button><button class="paper-button secondary" data-editor="reload">Sincronizar</button></div>'+
      '<div class="editor-tabs"><button class="'+(tab==='new'?'active':'')+'" data-editor="tab" data-tab="new">Painel</button><button class="'+(tab==='drafts'?'active':'')+'" data-editor="tab" data-tab="drafts">Rascunhos ('+(remotePosts.filter(p=>p.status!=='published').length+localDrafts.length)+')</button><button class="'+(tab==='published'?'active':'')+'" data-editor="tab" data-tab="published">Publicadas ('+remotePosts.filter(p=>p.status==='published').length+')</button></div>'+
      (tab==='new'?'<section class="editor-overview"><div><strong>'+remotePosts.filter(p=>p.status==='published').length+'</strong><span>Publicadas</span></div><div><strong>'+remotePosts.filter(p=>p.status!=='published').length+'</strong><span>Rascunhos no GitHub</span></div><div><strong>main</strong><span>Branch editorial</span></div></section><p class="editor-note">As matérias são gravadas em <code>docs/data/posts.json</code>. O GitHub Pages atualiza o portal após o commit.</p>':'<div class="editor-list">'+(rows+local||'<div class="empty-state">Nenhuma matéria nesta lista.</div>')+'</div>')+
      '<div class="editor-account-actions"><button class="editor-link-button" data-editor="change-token">Trocar token de acesso</button><button class="editor-link-button" data-editor="disconnect">Desconectar este aparelho</button></div>';
  }
  function form(post={}) {
    editingSlug=post.slug||'';selectedImage=null;
    const sections=[['noticias','Notícias'],['artigos','Artigos'],['editoriais','Editorial'],['opiniao','Opinião']];
    const options=sections.map(s=>'<option value="'+s[0]+'" '+(post.section===s[0]?'selected':'')+'>'+s[1]+'</option>').join('');
    root.innerHTML='<section class="screen-heading"><p class="section-kicker">Estúdio editorial</p><h1>'+(editingSlug?'Editar matéria':'Nova matéria')+'</h1><p>Preencha os campos, revise e escolha entre rascunhar ou publicar.</p></section>'+
      '<form id="newsroom-form" class="editor-form"><label class="editor-label" for="post-title">Título *</label><input class="editor-input" id="post-title" required maxlength="180" value="'+esc(post.title||'')+'" placeholder="Título da matéria"/>'+
      '<label class="editor-label" for="post-slug">Endereço (slug)</label><input class="editor-input" id="post-slug" maxlength="100" value="'+esc(post.slug||'')+'" placeholder="gerado-a-partir-do-titulo"/>'+
      '<label class="editor-label" for="post-subtitle">Subtítulo</label><input class="editor-input" id="post-subtitle" maxlength="240" value="'+esc(post.subtitle||'')+'" placeholder="Linha fina da matéria"/>'+
      '<label class="editor-label" for="post-excerpt">Resumo</label><textarea class="editor-input" id="post-excerpt" rows="3" maxlength="400" placeholder="Resumo exibido nos cartões">'+esc(post.excerpt||'')+'</textarea>'+
      '<div class="editor-two-col"><div><label class="editor-label" for="post-section">Editoria *</label><select class="editor-input" id="post-section" required>'+options+'</select></div><div><label class="editor-label" for="post-category">Categoria</label><input class="editor-input" id="post-category" maxlength="60" value="'+esc(post.category||'Jornalismo')+'"/></div></div>'+
      '<div class="editor-two-col"><div><label class="editor-label" for="post-author">Autor</label><input class="editor-input" id="post-author" maxlength="100" value="'+esc(post.author||'Redação The Bullshit Bureau')+'"/></div><div><label class="editor-label" for="post-date">Data</label><input class="editor-input" id="post-date" type="date" value="'+esc(post.publishedAt||today())+'"/></div></div>'+
      '<label class="editor-label" for="post-cover">URL da capa (opcional)</label><input class="editor-input" id="post-cover" type="url" value="'+esc(post.cover||'')+'" placeholder="https://..."/>'+
      '<label class="editor-label" for="post-image-file">Ou enviar capa do aparelho (máx. 5 MB)</label><input class="editor-input editor-file" id="post-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif"/><p id="cover-file-name" class="editor-hint">A galeria/seleção do sistema só será aberta ao tocar aqui. Não pedimos acesso geral às fotos ou arquivos.</p>'+
      '<label class="editor-label">Conteúdo da matéria *</label><div class="rich-tools"><button type="button" data-editor="format" data-format="bold"><strong>N</strong></button><button type="button" data-editor="format" data-format="italic"><em>I</em></button><button type="button" data-editor="format" data-format="formatBlock" data-value="H2">H2</button><button type="button" data-editor="format" data-format="formatBlock" data-value="P">P</button><button type="button" data-editor="format" data-format="insertUnorderedList">• Lista</button><button type="button" data-editor="format" data-format="createLink">Link</button></div>'+
      '<div id="post-body" class="editor-body" contenteditable="true" data-placeholder="Escreva a matéria aqui...">'+cleanBody(post.body||'<p></p>')+'</div>'+
      '<div class="editor-guidance">Antes de publicar: confirme fontes, datas, nomes e dados. Diferencie fato, análise e opinião. Registre correções com transparência.</div>'+
      '<div class="editor-form-actions"><button type="button" class="paper-button secondary" data-editor="cancel">Cancelar</button><button type="button" class="paper-button secondary" data-editor="save-local">Guardar rascunho</button><button type="submit" class="editor-primary">Publicar matéria</button></div><p class="editor-message" id="editor-form-message"></p></form>';
    const title=root.querySelector('#post-title'),slug=root.querySelector('#post-slug');
    title.addEventListener('input',()=>{if(!editingSlug||!slug.dataset.touched)slug.value=slugify(title.value);});
    slug.addEventListener('input',e=>{e.target.dataset.touched='1';e.target.value=slugify(e.target.value);});
    root.querySelector('#post-image-file').addEventListener('change',e=>{selectedImage=e.target.files?.[0]||null;root.querySelector('#cover-file-name').textContent=selectedImage?selectedImage.name+' · '+(selectedImage.size/1024/1024).toFixed(2)+' MB':'Nenhuma imagem selecionada.';});
  }
  function value() {
    const title=root.querySelector('#post-title').value.trim();
    const body=cleanBody(root.querySelector('#post-body').innerHTML);
    if(!title||!body.replace(/<[^>]+>/g,'').trim()) throw new Error('Preencha o título e o conteúdo da matéria.');
    const old=remotePosts.find(p=>p.slug===editingSlug)||{};
    return {...old,title,slug:slugify(root.querySelector('#post-slug').value||title),subtitle:root.querySelector('#post-subtitle').value.trim(),excerpt:root.querySelector('#post-excerpt').value.trim()||root.querySelector('#post-subtitle').value.trim(),section:root.querySelector('#post-section').value,category:root.querySelector('#post-category').value.trim()||'Jornalismo',author:root.querySelector('#post-author').value.trim()||'Redação The Bullshit Bureau',publishedAt:root.querySelector('#post-date').value||today(),status:'draft',featured:Boolean(old.featured),cover:root.querySelector('#post-cover').value.trim(),coverAlt:old.coverAlt||title,body,updatedAt:new Date().toISOString()};
  }
  async function saveLocal() {
    try {const post=value();const i=localDrafts.findIndex(p=>p.slug===post.slug);if(i>=0)localDrafts[i]=post;else localDrafts.unshift(post);await Preferences.set({key:'newsroom-local-drafts',value:JSON.stringify(localDrafts)});toast('Rascunho guardado neste aparelho.');tab='drafts';list();}
    catch(e){toast(e.message);}
  }
  async function publish() {
    if(busy)return;busy=true;
    try {
      const post=value();
      post.status='published';
      if(selectedImage) {
        post.cover=await uploadCover(post.slug);
        const coverField=root.querySelector('#post-cover');
        if(coverField) coverField.value=post.cover;
        selectedImage=null;
        const fileField=root.querySelector('#post-image-file');
        if(fileField) fileField.value='';
        const fileLabel=root.querySelector('#cover-file-name');
        if(fileLabel) fileLabel.textContent='Capa enviada ao repositório. Se a publicação falhar, tente novamente sem reenviar a imagem.';
      }
      if(!post.cover)throw new Error('Adicione uma URL de capa ou selecione uma imagem.');
      const next=[...remotePosts],i=next.findIndex(p=>p.slug===editingSlug||p.slug===post.slug);if(i>=0)next[i]=post;else next.unshift(post);
      await savePosts(next,(editingSlug?'editor(mobile): atualiza ':'editor(mobile): publica ')+post.slug);
      localDrafts=localDrafts.filter(p=>p.slug!==post.slug);await Preferences.set({key:'newsroom-local-drafts',value:JSON.stringify(localDrafts)});
      toast('Matéria publicada. O portal será atualizado pelo GitHub Pages.');tab='published';list();
    } catch(e){
      const message=root.querySelector('#editor-form-message');
      if(message) {
        message.textContent='';
        message.innerHTML=esc(e.message)+'<br><button type="button" class="editor-link-button" data-editor="change-token">Corrigir / trocar token do GitHub</button>';
      }
      toast('Falha ao publicar: '+e.message);
    }
    finally{busy=false;}
  }
  async function deletePost(slug) {
    if(!confirm('Excluir esta matéria do repositório? Será criado um commit.'))return;
    try{await savePosts(remotePosts.filter(p=>p.slug!==slug),'editor(mobile): remove '+slug);toast('Matéria removida.');list();}
    catch(e){toast('Falha ao excluir: '+e.message);}
  }
  async function deleteLocalDraft(index) {
    const post=localDrafts[index];
    if(!post) return;
    if(!confirm('Excluir este rascunho salvo apenas neste aparelho? Esta ação não altera o portal.')) return;
    localDrafts.splice(index,1);
    await Preferences.set({key:'newsroom-local-drafts',value:JSON.stringify(localDrafts)});
    toast('Rascunho local removido.');
    tab='drafts';
    list();
  }
  async function connect() {
    if(!Capacitor.isNativePlatform())return login('Configure a chave somente no app instalado.');
    const candidate=root.querySelector('#github-token')?.value.trim()||'';
    if(!candidate)return login('Cole o token criado no GitHub.');
    try{await secureReady();token=candidate;const file=await api('/repos/'+REPO+'/contents/'+FILE+'?ref=main');const parsed=JSON.parse(decode64(file.content));if(!Array.isArray(parsed))throw new Error('O arquivo editorial possui formato inválido.');
      await SecureStorage.set('github-token',candidate);remotePosts=parsed;loaded=true;localDrafts=JSON.parse((await Preferences.get({key:'newsroom-local-drafts'})).value||'[]');tab='new';toast('Acesso editorial conectado.');list();
    }catch(e){token='';login('Não foi possível conectar: '+e.message);}
  }
  async function load() {
    if(!(await readToken()))return login();
    try{await fetchPosts();localDrafts=JSON.parse((await Preferences.get({key:'newsroom-local-drafts'})).value||'[]');list();}
    catch(e){token='';try{await SecureStorage.remove('github-token');}catch{}login('Acesso recusado ou token expirado: '+e.message);}
  }
  async function refresh() {try{await fetchPosts();toast('Redação sincronizada.');list();}catch(e){toast('Falha na sincronização: '+e.message);}}
  root.addEventListener('click',async event=>{
    const b=event.target.closest('[data-editor]');if(!b)return;const action=b.dataset.editor;
    if(action==='connect')return connect();
    if(action==='change-token') { token=''; try { await SecureStorage.remove('github-token'); } catch {} loaded=false; return login('Crie um token com Contents: Read and write e conecte novamente.'); }
    if(action==='disconnect'){try{await SecureStorage.remove('github-token');}catch{}token='';loaded=false;remotePosts=[];return login('Acesso removido deste aparelho.');}
    if(action==='reload')return refresh();
    if(action==='new'){tab='new';return form();}
    if(action==='cancel')return list();
    if(action==='tab'){tab=b.dataset.tab;return list();}
    if(action==='edit'){const p=remotePosts.find(x=>x.slug===b.dataset.slug);if(p)form(p);return;}
    if(action==='edit-local'){const p=localDrafts[Number(b.dataset.index)];if(p)form(p);return;}
    if(action==='save-local')return saveLocal();
    if(action==='format'){const f=b.dataset.format;if(f==='createLink'){const url=prompt('Cole o endereço HTTPS da fonte:');if(url&&/^https:\/\//i.test(url))document.execCommand('createLink',false,url);}else if(f==='formatBlock')document.execCommand('formatBlock',false,b.dataset.value);else document.execCommand(f,false,null);return;}
    if(action==='delete')return deletePost(b.dataset.slug);
    if(action==='delete-local')return deleteLocalDraft(Number(b.dataset.index));
  });
  root.addEventListener('submit',event=>{if(event.target.id==='newsroom-form'){event.preventDefault();publish();}});
  return {render:async()=>{if(!loaded&&!token)return load();if(token&&!loaded)return refresh();list();}};
}
