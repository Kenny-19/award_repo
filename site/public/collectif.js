import { openDrawFilm } from './draw-film.js';
'use strict';
const $ = id => document.getElementById(id);
const SESSION = 'agents-secrets-session';
let code = '', state = null;
const STATUS = { idea: 'Cadrage', building: 'En construction', ready: 'Prêt à présenter' };
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function link(text, url) { const a=el('a','',text); a.href=url; a.target='_blank'; a.rel='noopener noreferrer'; return a; }
async function api(path, data) {
  const response = await fetch('/api/improving/' + path, { method: data === undefined ? 'GET' : 'POST', headers: { 'x-agent-code': code, ...(data === undefined ? {} : { 'content-type': 'application/json' }) }, body: data === undefined ? undefined : JSON.stringify(data) });
  let result; try { result = await response.json(); } catch { throw Error('Le Service ne répond pas. Réessaie dans un instant.'); }
  if (!response.ok) { if (response.status === 401) logout(); throw Error(result.erreur || 'Impossible de terminer cette action.'); }
  return result;
}
function storeCode(value) { try { if(value) sessionStorage.setItem(SESSION,value); else sessionStorage.removeItem(SESSION); } catch {} }
function logout() { code='';state=null;storeCode('');$('private-view').hidden=true;$('login-view').hidden=false;$('logout').hidden=true;$('code').value=''; }
function route() {
  if (!state) { if(location.hash === '#improving') loadPublic(); return; }
  let section=location.hash.slice(1)||'home';
  if (!['home','improving','divertissement'].includes(section)) section='improving';
  for(const name of ['home','improving','divertissement']) $(name+'-view').hidden=name!==section;
  document.querySelectorAll('[data-tab]').forEach(a=>a.classList.toggle('active',a.dataset.tab===section));
}
function render() {
  $('login-view').hidden=true;$('private-view').hidden=false;$('logout').hidden=!state.me;
  $('identity').textContent=state.me ? 'Connecté · '+state.me.nom : 'Visiteur · accès libre';
  $('project-count').textContent=state.projects.length;
  const drawn=Boolean(state.draw);
  $('draw-title').textContent=drawn?'Les langages sont attribués.':'Le tirage se prépare.';
  $('draw-description').textContent=drawn?'Dix agents, dix langages tirés parmi quinze. Cinq restent en réserve. Les attributions sont communes et définitives pour cette édition.':'Une attribution commune, sans doublon. Une fois lancé, le tirage est définitif pour cette édition.';
  const action=$('draw-action');action.replaceChildren();
  if(!drawn&&state.me?.numero===6) { const b=el('button','button','Lancer le tirage ↗');b.addEventListener('click',()=>$('draw-dialog').showModal());action.append(b); }
  else action.append(el('span','draw-status',drawn?'ÉDITION 01 / LANCÉE':'EN ATTENTE DU LANCEMENT'));
  if(drawn){const video=el('button','button','Voir le tirage / Télécharger la vidéo ↗');video.addEventListener('click',()=>openDrawFilm(state).catch(error=>{$('action-message').textContent=error.message;}));action.append(video);}
  const langOf=n=>state.languages.find(l=>l.id===state.draw?.assignments.find(a=>a.numero===n)?.language);
  const mine=langOf(state.me?.numero);$('my-language').hidden=!mine;
  if(mine){const box=el('div');box.append(el('p','eyebrow','TON LANGAGE ATTRIBUÉ'),el('h3','',mine.name),el('p','',mine.brief));$('my-language').replaceChildren(box,link('Documentation officielle ↗',mine.url));}
  $('participants-list').replaceChildren();
  state.participants.forEach(a=>{
    const card=el('article','participant'),top=el('div','participant-top');top.append(el('h3','',a.nom),el('span','agent-number',String(a.numero).padStart(2,'0')));card.append(top);
    card.append(el('span','lang',langOf(a.numero)?.name||'Langage à attribuer'));
    const project=state.projects.find(p=>p.agent===a.numero);
    if(project){card.append(el('span','status-tag', ' · '+STATUS[project.status]),el('h4','',project.title),el('p','',project.problem));const detail=el('details');detail.append(el('summary','','Comprendre le projet'),el('p','',project.technical));if(project.demo)detail.append(el('p','',project.demo));const links=el('div','project-links');if(project.repo)links.append(link('Code source ↗',project.repo));if(project.demoUrl)links.append(link('Démonstration ↗',project.demoUrl));detail.append(links);card.append(detail);}
    else card.append(el('p','',drawn?'Intitulé du projet à annoncer.':'En attente du tirage commun.'));
    $('participants-list').append(card);
  });
  $('language-list').replaceChildren();state.languages.forEach((l,i)=>{const row=el('article','language'),content=el('div');content.append(el('h3','',l.name),el('p','',l.field+' — '+l.brief),link('Explorer le langage ↗',l.url));row.append(el('span','',String(i+1).padStart(2,'0')),content);$('language-list').append(row);});
  $('project-form').hidden=!drawn || !state.me;
  $('identify-project').hidden=Boolean(state.me);
  $('project-notice').textContent=!state.me ? 'La consultation est libre. Ton code permet uniquement de gérer ton projet.' : drawn?'Annonce l’intitulé de ton projet et son objectif pour que le groupe sache à quoi s’attendre. Tu pourras modifier ta fiche ensuite.':'Le formulaire s’ouvre une fois le tirage effectué.';
  const project=state.projects.find(p=>p.agent===state.me?.numero);
  if(project) for(const name of ['title','status','problem','technical','demo','repo','demoUrl']) $('project-form').elements[name].value=project[name]||'';
  route();
}
async function loadPublic() { try { state=await api('state'); render(); } catch(error) { $('login-error').textContent=error.message; } }
$('identify-project').addEventListener('click',()=>{state=null;$('private-view').hidden=true;$('login-view').hidden=false;$('code').focus();});
$('login-form').addEventListener('submit',async e=>{e.preventDefault();$('login-error').textContent='';$('login-submit').disabled=true;code=$('code').value.trim().toUpperCase();try{state=await api('state');storeCode(code);render();}catch(error){$('login-error').textContent=error.message;}finally{$('login-submit').disabled=false;}});
$('logout').addEventListener('click',logout);window.addEventListener('hashchange',route);
$('cancel-draw').addEventListener('click',()=>$('draw-dialog').close());
$('confirm-draw').addEventListener('click',async()=>{const b=$('confirm-draw');b.disabled=true;try{state=await api('draw',{});$('draw-dialog').close();render();$('my-language').classList.add('draw-reveal');$('action-message').textContent='Le tirage est officiel. À vous de jouer.';await openDrawFilm(state);}catch(error){$('draw-dialog').close();$('action-message').textContent=error.message;}finally{b.disabled=false;}});
$('project-form').addEventListener('submit',async e=>{e.preventDefault();$('project-submit').disabled=true;$('project-message').textContent='';const data=Object.fromEntries(new FormData(e.currentTarget));try{state=await api('project',data);render();$('project-message').textContent='Projet enregistré. Les dix agents peuvent découvrir ta fiche.';}catch(error){$('project-message').textContent=error.message;}finally{$('project-submit').disabled=false;}});
try{code=sessionStorage.getItem(SESSION)||'';}catch{}
if(code)api('state').then(s=>{state=s;render();}).catch(error=>{logout();$('login-error').textContent=error.message;});
else loadPublic();
// Refresh shared updates without replacing the project form while someone is writing.
setInterval(async()=>{if(!state||document.hidden||$('improving-view').hidden||$('project-form').contains(document.activeElement))return;try{const next=await api('state');if(JSON.stringify(next.draw)!==JSON.stringify(state.draw)||JSON.stringify(next.projects)!==JSON.stringify(state.projects)){const draft=new FormData($('project-form'));state=next;render();for(const [name,value]of draft)if($('project-form').elements[name])$('project-form').elements[name].value=value;}}catch{}},30000);
