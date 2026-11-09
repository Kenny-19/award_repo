// Shared portraits supplied by the group. No substitution between agents.
export const PORTRAITS = { 3: '/portraits/jean-mkb.jpg', 6: '/portraits/kenny.jpg', 9: '/portraits/kevin-milenda.jpg' };
const NAMES = { 'Jean Mkb': 3, Kenny: 6, 'Kevin Milenda': 9 };
export function portraitFor(agent) { return PORTRAITS[typeof agent === 'number' ? agent : NAMES[agent]] || null; }
export async function loadPortrait(agent) {
  const src=portraitFor(agent);if(!src)return null;
  return new Promise(resolve=>{const img=new Image();const timeout=setTimeout(()=>resolve(null),8000);img.onload=()=>{clearTimeout(timeout);resolve(img);};img.onerror=()=>{clearTimeout(timeout);resolve(null);};img.src=src;});
}
export function drawPortrait(ctx,image,x,y,width,height) {
  const ratio=Math.max(width/image.naturalWidth,height/image.naturalHeight);
  const sw=width/ratio,sh=height/ratio;
  ctx.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)*.25,sw,sh,x,y,width,height);
}
