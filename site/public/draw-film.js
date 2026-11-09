// A replay of the recorded assignment, never another draw.
const WIDTH = 720, HEIGHT = 960, INTRO = 1.6, STEP = 1.7, OUTRO = 5;
export function filmRows(state) {
  if (!state?.draw?.assignments?.length) throw new Error('Le tirage officiel doit être lancé avant de créer la vidéo.');
  return state.participants.map(a=>{
    const id=state.draw.assignments.find(x=>x.numero===a.numero)?.language;
    const language=state.languages.find(l=>l.id===id);
    if(!language)throw new Error('Attribution introuvable : actualise la page.');
    return {name:a.nom,language:language.name,title:state.projects.find(p=>p.agent===a.numero)?.title||''};
  });
}
export const filmDuration = rows => INTRO + STEP * rows.length + OUTRO;
export function filmPhase(time,rows) {
  if(time<INTRO)return {type:'intro'};
  const i=Math.floor((time-INTRO)/STEP);
  if(i>=rows.length)return {type:'recap'};
  return {type:'agent',index:i,progress:Math.min(1,(time-INTRO-i*STEP)/STEP)};
}
function text(ctx,value,y,size=44,color='#20211e',align='center',x=WIDTH/2,maxWidth=WIDTH-90) {
  ctx.font=`600 ${size}px Manrope, Arial, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;
  while(ctx.measureText(value).width>maxWidth&&size>15){size--;ctx.font=`600 ${size}px Manrope, Arial, sans-serif`;}
  ctx.fillText(value,x,y);
}
export function paintFrame(ctx,time,rows,languages) {
  const paper='#eee7da',ink='#20211e',muted='#747569',lime='#c2cc9a';
  ctx.globalAlpha=1;ctx.fillStyle=paper;ctx.fillRect(0,0,WIDTH,HEIGHT);
  text(ctx,'AS',88,46,ink,'left',45);text(ctx,'IMPROVING / ÉDITION 01',78,15,ink,'right',WIDTH-45);
  ctx.strokeStyle='#cec6b7';ctx.beginPath();ctx.moveTo(45,115);ctx.lineTo(WIDTH-45,115);ctx.stroke();
  const phase=filmPhase(time,rows);
  if(phase.type==='intro'){
    ctx.globalAlpha=Math.min(1,time*2);text(ctx,'10 agents.',340,77);text(ctx,'15 langages.',435,77);text(ctx,'Le hasard a choisi.',550,43,muted);text(ctx,'À VOUS DE CONSTRUIRE.',665,19);ctx.globalAlpha=1;
  } else if(phase.type==='agent'){
    const row=rows[phase.index],reveal=phase.progress>=.34;
    text(ctx,`AGENT ${String(phase.index+1).padStart(2,'0')} / ${rows.length}`,205,18,muted);
    text(ctx,row.name,300,55);
    ctx.fillStyle=ink;ctx.fillRect(45,362,WIDTH-90,195);
    if(reveal){const p=Math.min(1,(phase.progress-.34)/.16);ctx.globalAlpha=p;text(ctx,row.language,482,76,lime);ctx.globalAlpha=1;}
    else { const cycle=Math.floor(phase.progress*35);text(ctx,languages[(cycle+phase.index)%languages.length].name,482,64,'#8a8d7e'); }
    text(ctx,reveal?'LANGAGE ATTRIBUÉ':'ATTRIBUTION EN COURS',607,16,muted);
    if(row.title){text(ctx,'LE PROJET',695,14,muted);text(ctx,row.title,740,30);}
    else{text(ctx,'Son défi reste à annoncer.',729,26,muted);}
    for(let i=0;i<rows.length;i++){ctx.fillStyle=i<=phase.index?ink:'#cec6b7';ctx.fillRect(45+i*63,825,47,5);}
  }else{
    text(ctx,'Le tirage officiel.',192,48);text(ctx,'10 LANGAGES DIFFÉRENTS. À VOUS DE JOUER.',237,14,muted);
    rows.forEach((row,i)=>{const y=304+i*48;text(ctx,row.name,y,25,ink,'left',48,335);text(ctx,row.language,y,23,ink,'right',WIDTH-48,250);ctx.strokeStyle='#d8d0c1';ctx.beginPath();ctx.moveTo(48,y+15);ctx.lineTo(WIDTH-48,y+15);ctx.stroke();});
    text(ctx,'DÉFIS LIBRES. EXIGENCE COMMUNE.',854,16,muted);
  }
  text(ctx,'AGENTS SECRETS',921,14,ink,'left',45);text(ctx,'secret-award.netlify.app',921,14,muted,'right',WIDTH-45);
}
let active=null;
export async function openDrawFilm(state) {
  const rows=filmRows(state),dialog=document.getElementById('film-dialog'),canvas=document.getElementById('film-canvas');
  active?.stop();
  canvas.width=WIDTH;canvas.height=HEIGHT;
  const ctx=canvas.getContext('2d'),duration=filmDuration(rows);
  let frame=0,recorder=null,stream=null,exporting=false,url=null;
  const status=document.getElementById('film-status'),exportButton=document.getElementById('film-export'),download=document.getElementById('film-download'),replay=document.getElementById('film-replay');
  const summary=document.getElementById('film-summary');summary.replaceChildren();rows.forEach(r=>{const li=document.createElement('li');li.textContent=r.name+' — '+r.language;summary.append(li);});
  const cleanup=()=>{cancelAnimationFrame(frame);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());if(url)URL.revokeObjectURL(url);};
  active={stop:cleanup};
  const play=(done,force=false)=>{cancelAnimationFrame(frame);if(matchMedia('(prefers-reduced-motion: reduce)').matches&&!force){paintFrame(ctx,duration,rows,state.languages);return;}
    const start=performance.now();const tick=now=>{const time=Math.min(duration,(now-start)/1000);paintFrame(ctx,time,rows,state.languages);if(time<duration)frame=requestAnimationFrame(tick);else done?.();};frame=requestAnimationFrame(tick);
  };
  status.textContent='Une courte vidéo, avec les dix attributions officielles et le récapitulatif final.';download.hidden=true;exportButton.disabled=false;exportButton.textContent='Préparer la vidéo';replay.disabled=false;
  replay.onclick=()=>{if(!exporting)play();};
  document.getElementById('film-close').onclick=()=>dialog.close();
  dialog.onclose=()=>{cleanup();active=null;};
  exportButton.onclick=async()=>{
    if(exporting)return;
    if(!canvas.captureStream||typeof MediaRecorder==='undefined'){status.textContent='L’enregistrement vidéo n’est pas disponible dans ce navigateur. Essaie Chrome ou Edge récent sur ordinateur.';return;}
    const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    if(!mime){status.textContent='Ce navigateur ne propose pas de format vidéo compatible.';return;}
    exporting=true;exportButton.disabled=true;replay.disabled=true;download.hidden=true;
    status.textContent='Création de la vidéo… garde cet onglet ouvert et visible pendant environ 24 secondes.';
    const chunks=[];
    try{
      await document.fonts.ready;
      stream=canvas.captureStream(25);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2200000});
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>{status.textContent='L’enregistrement a échoué. Réessaie.';exporting=false;exportButton.disabled=false;replay.disabled=false;};
      recorder.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop());exporting=false;exportButton.disabled=false;replay.disabled=false;
        if(!dialog.open||!chunks.length)return;
        if(url)URL.revokeObjectURL(url);const type=recorder.mimeType||mime,mp4=type.includes('mp4');url=URL.createObjectURL(new Blob(chunks,{type}));
        download.href=url;download.download='agents-secrets-tirage-edition-01.'+(mp4?'mp4':'webm');download.textContent='Télécharger la vidéo '+(mp4?'MP4':'WebM')+' ↓';download.hidden=false;
        status.textContent=mp4?'Vidéo prête. Télécharge-la pour l’envoyer dans le groupe WhatsApp.':'Vidéo WebM prête. Pour obtenir un MP4 directement, essaie un navigateur récent compatible MP4.';
      };
      recorder.start(200);play(()=>{if(recorder.state==='recording')recorder.stop();},true);
    }catch{stream?.getTracks().forEach(t=>t.stop());exporting=false;exportButton.disabled=false;replay.disabled=false;status.textContent='Impossible de créer la vidéo. Réessaie dans un navigateur récent.';}
  };
  dialog.showModal();play();
}
