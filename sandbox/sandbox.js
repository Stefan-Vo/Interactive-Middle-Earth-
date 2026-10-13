/* Citymaker Sandbox: an editor for designing maps. Sculpt the land, carve water, place structures, nature and people, save
   maps to the page's shared database, and export them to turn into city pages (tools/sandbox_city.py).
   The land is a height grid (N x N over SIZE x SIZE, north is -z) with a painted ground layer and one water level.
   Structures and nature are records built by engine/objects.js with the engine's recipes and the city styles, so a map
   looks the same here and in the city made from it. */
(function(){
"use strict";
if(!window.THREE||!THREE.MapControls){ document.getElementById("scene").textContent="The 3D library didn't load. Check your connection and reload the page."; return; }
const $=id=>document.getElementById(id);
const DEG=Math.PI/180, SIZE=2000, N=201, CELL=SIZE/(N-1), HALF=SIZE/2;
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
let uid=()=>Math.random().toString(36).slice(2,10);

/* ---------- the land ---------- */
let heights=new Float32Array(N*N), paint=new Uint8Array(N*N), level=0;
const GROUND=[["Auto","#8aa763"],["Grass","#7ea253"],["Meadow","#a9bf6a"],["Sand","#d9c99a"],["Earth","#9a7d58"],["Rock","#8e8a82"],["Snow","#eef2f4"]];
function heightAt(x,z){
  const fx=clamp((x+HALF)/CELL,0,N-1.001), fz=clamp((z+HALF)/CELL,0,N-1.001), ix=Math.floor(fx), iz=Math.floor(fz), tx=fx-ix, tz=fz-iz, i=iz*N+ix;
  return (heights[i]*(1-tx)+heights[i+1]*tx)*(1-tz)+(heights[i+N]*(1-tx)+heights[i+N+1]*tx)*tz;
}
// value noise for the presets and the mountain brush
const NS=(()=>{ const p=new Float32Array(512); let s=12345; for(let i=0;i<512;i++){ s=(s*16807)%2147483647; p[i]=s/2147483647; }
  const g=(ix,iz)=>p[((ix*73856093)^(iz*19349663))&511];
  return (x,z)=>{ const ix=Math.floor(x), iz=Math.floor(z), tx=x-ix, tz=z-iz, sx=tx*tx*(3-2*tx), sz=tz*tz*(3-2*tz);
    return (g(ix,iz)*(1-sx)+g(ix+1,iz)*sx)*(1-sz)+(g(ix,iz+1)*(1-sx)+g(ix+1,iz+1)*sx)*sz; }; })();
const fbm=(x,z,o)=>{ let v=0,a=.5,f=1; for(let i=0;i<(o||5);i++){ v+=a*NS(x*f,z*f); a*=.5; f*=2.03; } return v; };
const ridged=(x,z)=>{ let v=0,a=.55,f=1; for(let i=0;i<5;i++){ v+=a*(1-Math.abs(NS(x*f,z*f)*2-1)); a*=.5; f*=2.1; } return v; };

const PRESETS={
  valley:{name:"River valley",desc:"Mountains on either side, a river down the middle.",lvl:0,
    h:(x,z)=>{ const rx=60*Math.sin(z*.003)+30*Math.sin(z*.011), d=Math.abs(x-rx); return 4+3*fbm(x*.01,z*.01)-9*smooth(40,10,d)+smooth(380,720,d)*(150+140*ridged(x*.004,z*.004)); }},
  plain:{name:"Open plain",desc:"Gentle grassland to build on anywhere.",lvl:-4,h:(x,z)=>2+4*fbm(x*.006,z*.006)},
  coast:{name:"Coast",desc:"Land sloping to the sea in the east, hills behind.",lvl:0,
    h:(x,z)=>{ const sh=260+80*Math.sin(z*.004)+40*Math.sin(z*.013); return (x<sh?6+12*smooth(sh,sh-500,x)*fbm(x*.008,z*.008)+smooth(-200,-900,x)*140*ridged(x*.004,z*.004):6-40*smooth(sh,sh+220,x)); }},
  island:{name:"Island",desc:"An island in the sea with a peak at its heart.",lvl:0,
    h:(x,z)=>{ const d=Math.hypot(x,z*1.2)+50*fbm(x*.005,z*.005); return d<620?8+170*smooth(330,0,d)*(.5+.6*ridged(x*.005,z*.005))+6*fbm(x*.01,z*.01):8-40*smooth(620,780,d); }},
  highlands:{name:"Highlands",desc:"Rolling hills and peaks with lakes between.",lvl:6,
    h:(x,z)=>2+110*Math.pow(fbm(x*.0025+7,z*.0025-3),1.6)+90*ridged(x*.003,z*.003)*smooth(.35,.7,fbm(x*.0018,z*.0018))},
};
function applyPreset(key){ const P=PRESETS[key]; for(let iz=0;iz<N;iz++) for(let ix=0;ix<N;ix++){ const x=-HALF+ix*CELL, z=-HALF+iz*CELL; heights[iz*N+ix]=P.h(x,z); } paint.fill(0); level=P.lvl; }

/* ---------- renderer, camera, light ---------- */
const host=$("scene");
let renderer;
try{ renderer=new THREE.WebGLRenderer({antialias:true}); }catch(e){ host.textContent="This browser couldn't start WebGL, so the editor can't be shown."; return; }
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=false;
const shadowsDirty=()=>{ renderer.shadowMap.needsUpdate=true; };
host.appendChild(renderer.domElement);
const scene=new THREE.Scene(), SKY=new THREE.Color("#bfd2df"); scene.background=SKY; scene.fog=new THREE.Fog(SKY,1800,5200);
const camera=new THREE.PerspectiveCamera(24,1,1,12000);
const controls=new THREE.MapControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.09; controls.minDistance=10; controls.maxDistance=3600; controls.minPolarAngle=.2; controls.maxPolarAngle=1.5; controls.screenSpacePanning=false;
controls.mouseButtons={LEFT:-1,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.ROTATE};
const TILT=.8, HOME={t:new THREE.Vector3(-60,0,0),d:1750,phi:TILT,th:(180-135)*DEG};
camera.position.setFromSpherical(new THREE.Spherical(HOME.d,HOME.phi,HOME.th)).add(HOME.t); controls.target.copy(HOME.t); controls.update();
function resize(){ const w=host.clientWidth||1,h=host.clientHeight||1; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(host); resize();
scene.add(new THREE.HemisphereLight(0xe4eef6,0x6d7d58,.62)); scene.add(new THREE.AmbientLight(0x48505a,.18));
const sun=new THREE.DirectionalLight(0xfff1da,.8); sun.position.set(-700,1200,600); sun.castShadow=true; sun.shadow.mapSize.set(4096,4096);
Object.assign(sun.shadow.camera,{left:-1100,right:1100,top:1100,bottom:-1100,near:10,far:3200}); sun.shadow.bias=-.0006; sun.shadow.normalBias=.4; scene.add(sun,sun.target);

/* ---------- the ground mesh and the water ---------- */
const gGeo=new THREE.BufferGeometry(), gPos=new Float32Array(N*N*3), gCol=new Float32Array(N*N*3);
for(let iz=0;iz<N;iz++) for(let ix=0;ix<N;ix++){ const i=iz*N+ix; gPos[i*3]=-HALF+ix*CELL; gPos[i*3+2]=-HALF+iz*CELL; }
{ const idx=[]; for(let iz=0;iz<N-1;iz++) for(let ix=0;ix<N-1;ix++){ const a=iz*N+ix; idx.push(a,a+N,a+1, a+1,a+N,a+N+1); } gGeo.setIndex(idx); }
gGeo.setAttribute("position",new THREE.BufferAttribute(gPos,3)); gGeo.setAttribute("color",new THREE.BufferAttribute(gCol,3));
const ground=new THREE.Mesh(gGeo,new THREE.MeshLambertMaterial({vertexColors:true})); ground.receiveShadow=true; ground.castShadow=true; scene.add(ground);
const apron=new THREE.Mesh(new THREE.PlaneGeometry(14000,14000).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x7f9c5b})); apron.position.y=-.6; scene.add(apron);
const waterMat=new THREE.MeshLambertMaterial({color:0x3f6f8c,emissive:0x0a1c28}); const waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(SIZE,SIZE).rotateX(-Math.PI/2),waterMat); scene.add(waterMesh);
const WATERS=[waterMat];
const _c=new THREE.Color(), cA=new THREE.Color("#8aa763"), cB=new THREE.Color("#6c8d4c"), cRock=new THREE.Color("#8a877e"), cSnow=new THREE.Color("#f1f4f6"), cSand=new THREE.Color("#d6c79a"), cPaint=GROUND.map(g=>new THREE.Color(g[1]));
function shade(ix,iz){ const i=iz*N+ix, y=heights[i], x=-HALF+ix*CELL, z=-HALF+iz*CELL;
  const hx=heights[iz*N+Math.min(N-1,ix+1)]-heights[iz*N+Math.max(0,ix-1)], hz=heights[Math.min(N-1,iz+1)*N+ix]-heights[Math.max(0,iz-1)*N+ix], slope=Math.hypot(hx,hz)/(2*CELL);
  const p=paint[i];
  const n=.5+.5*Math.sin(x*.011+2*Math.cos(z*.009))*Math.cos(z*.006-x*.004);   // broad patches: finer would alias on a 10-unit grid
  if(p){ _c.copy(cPaint[p]); _c.multiplyScalar(.93+.1*n); }
  else { _c.copy(cA).lerp(cB,n);
    _c.lerp(cSand,smooth(level+3.5,level+.6,y)*(1-smooth(.35,.6,slope))); _c.lerp(cRock,Math.max(smooth(.55,1,slope),smooth(70,130,y))); _c.lerp(cSnow,smooth(200,260,y)*(1-smooth(.9,1.4,slope))); }
  gCol[i*3]=_c.r; gCol[i*3+1]=_c.g; gCol[i*3+2]=_c.b; }
function refreshGround(x0,z0,x1,z1){   // grid bounds (inclusive); recolors a margin for the slope
  for(let iz=Math.max(0,z0);iz<=Math.min(N-1,z1);iz++) for(let ix=Math.max(0,x0);ix<=Math.min(N-1,x1);ix++) gPos[(iz*N+ix)*3+1]=heights[iz*N+ix];
  for(let iz=Math.max(0,z0-1);iz<=Math.min(N-1,z1+1);iz++) for(let ix=Math.max(0,x0-1);ix<=Math.min(N-1,x1+1);ix++) shade(ix,iz);
  gGeo.attributes.position.needsUpdate=true; gGeo.attributes.color.needsUpdate=true; gGeo.computeVertexNormals(); gGeo.computeBoundingSphere(); shadowsDirty(); }
function refreshAll(){ refreshGround(0,0,N-1,N-1); waterMesh.position.y=level; window.CITY.terrain.water.level=level; window.CITY.terrain.water.bed=level-5; }

/* ---------- the engine's stand-in for the recipes, the styles and engine/objects.js: one per style ---------- */
window.CITY={terrain:{water:{level:0,bed:-5}}};
const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:new THREE.Color(c)},o||{}));
const SH={UNIT_BOX:new THREE.BoxGeometry(1,1,1).translate(0,.5,0),PYRAMID:new THREE.ConeGeometry(Math.SQRT1_2,1,4).rotateY(Math.PI/4).translate(0,.5,0),CYL:new THREE.CylinderGeometry(1,1,1,12).translate(0,.5,0),
  CONE:new THREE.ConeGeometry(1,1,12).translate(0,.5,0),BLOB:new THREE.IcosahedronGeometry(1,0),OCT:new THREE.CylinderGeometry(1,1,1,8).rotateY(Math.PI/8).translate(0,.5,0),
  HDOME:new THREE.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),DISC:new THREE.CylinderGeometry(1,1,1,56).translate(0,.5,0),BALL:new THREE.SphereGeometry(1,16,10),
  GABLE:new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-.5,0),new THREE.Vector2(.5,0),new THREE.Vector2(0,1)]),{depth:1,bevelEnabled:false}).translate(0,0,-.5)};
const _e=new THREE.Euler(), _q=new THREE.Quaternion();
const M=(x,y,z,yaw,sx,sy,sz)=>{ _e.set(0,yaw,0); _q.setFromEuler(_e); return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone(),new THREE.Vector3(sx,sy,sz)); };
const adder=g=>(geo,mat,x,y,z,sx,sy,sz,ry)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); if(ry) m.rotation.y=ry; g.add(m); return m; };
function glowSprite(rgba,size){ const c=document.createElement("canvas"); c.width=c.height=128; const x=c.getContext("2d"), gr=x.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,rgba); gr.addColorStop(1,"rgba(0,0,0,0)"); x.fillStyle=gr; x.fillRect(0,0,128,128);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); s.scale.set(size,size,1); s.raycast=()=>{}; return s; }
const curtainMat=new THREE.MeshLambertMaterial({color:0xdff1ff,transparent:true,opacity:.36,side:THREE.DoubleSide,depthWrite:false});
const sprayMat=new THREE.MeshLambertMaterial({color:0xeaf6ff,transparent:true,opacity:.55,depthWrite:false});
const KITS={};
function kit(style){ if(KITS[style]) return KITS[style];
  const E={THREE,STYLE:window.STYLES[style]||window.STYLES.noldor,lam,M,adder,surfaceY:heightAt,DEG,H:0,P:(b,r,y)=>new THREE.Vector3(r*Math.sin(b*DEG),y===undefined?0:y,-r*Math.cos(b*DEG)),
    glowSprite,curtainMat,sprayMat,waterMat:()=>lam("#4f9fcf",{emissive:new THREE.Color("#163e58")}),goldMat:()=>lam("#d8b34a",{emissive:new THREE.Color("#2a1e04")}),
    octTaper:t=>new THREE.CylinderGeometry(t,1,1,8).rotateY(Math.PI/8).translate(0,.5,0),
    flat:(geo,mat,y)=>{ const m=new THREE.Mesh(geo,mat); m.position.y=y; m.receiveShadow=true; return m; },
    paveMat:(c,o)=>lam(c,{polygonOffset:true,polygonOffsetFactor:-(o||1),polygonOffsetUnits:-(o||1)}),
    addWater:m=>{ WATERS.push(m); return m; }, addLantern:()=>{}, addFountainPOI:()=>{}, addGardenPOI:()=>{}, addHome:()=>{},
    target:null, scene:{add:o=>E.target.add(o)}, own:(id,g)=>{ E.target.add(g); return g; },
    instanced:(geo,mat,items,shadow)=>{ if(!items.length) return null; const m=new THREE.InstancedMesh(geo,mat,items.length);
      items.forEach((it,i)=>{ m.setMatrixAt(i,it.m); m.setColorAt(i,new THREE.Color(it.c)); }); m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true;
      m.castShadow=shadow!==false; m.receiveShadow=true; m.frustumCulled=false; E.target.add(m); return m; }};
  Object.assign(E,SH); Object.assign(E,window.CITYMAKER_RECIPES(E));
  return KITS[style]={E,OBJ:window.CITYMAKER_OBJECTS(E)}; }
const TYPES=kit("noldor").OBJ.TYPES;

// many small meshes that share a material are baked into one, as the city engine does, so a town costs a few draw calls
const _inv=new THREE.Matrix4(), _rel=new THREE.Matrix4();
function compact(obj){ obj.updateMatrixWorld(true); _inv.copy(obj.matrixWorld).invert(); const byMat=new Map();
  obj.traverse(o=>{ if(o===obj||!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.transparent||!o.geometry.attributes.position) return; (byMat.get(o.material)||byMat.set(o.material,[]).get(o.material)).push(o); });
  byMat.forEach((list,mat)=>{ if(list.length<2) return; let n=0;
    const parts=list.map(o=>{ _rel.multiplyMatrices(_inv,o.matrixWorld); const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(_rel); if(!g.attributes.normal) g.computeVertexNormals();
      if(_rel.determinant()<0){ for(const att of [g.attributes.position,g.attributes.normal]){ const a=att.array; for(let i=0;i<att.count;i+=3) for(let k=0;k<3;k++){ const t=a[(i+1)*3+k]; a[(i+1)*3+k]=a[(i+2)*3+k]; a[(i+2)*3+k]=t; } } }
      n+=g.attributes.position.count; return g; });
    const pos=new Float32Array(n*3), nor=new Float32Array(n*3); let k=0;
    parts.forEach(g=>{ pos.set(g.attributes.position.array,k*3); nor.set(g.attributes.normal.array,k*3); k+=g.attributes.position.count; g.dispose(); });
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("normal",new THREE.BufferAttribute(nor,3)); geo.computeBoundingSphere();
    list.forEach(o=>o.parent.remove(o)); obj.add(new THREE.Mesh(geo,mat)); }); }

/* ---------- objects on the map ---------- */
let recs=[];                                   // the map's object records
const views=new Map();                         // record id -> its group in the scene
const SPRITES=window.SANDBOX_SPRITES||{}, FOLKS=Object.keys(SPRITES);
const RADIUS_TYPES=new Set(Object.keys(TYPES).filter(k=>TYPES[k].place==="radius"));
function buildRec(rec){
  unbuild(rec.id);
  const g=new THREE.Group(); g.userData.recId=rec.id;
  if(rec.t==="people") buildPeople(rec,g);
  else if(rec.t==="hero") buildHero(rec,g);
  else if(rec.t==="centre"){ const a=adder(g), y=heightAt(rec.x,rec.z), red=lam("#b3373f"); a(SH.CYL,lam("#6a6152"),rec.x,y,rec.z,.25,16,.25); a(SH.UNIT_BOX,red,rec.x+1.8,y+12.6,rec.z,3.4,2.4,.15); a(SH.CYL,red,rec.x,y,rec.z,5,.3,5); }
  else { const K=kit(rec.style||"noldor"); K.E.target=g; try{ K.OBJ.build(rec,adder(g),rec.id,g); }catch(err){ console.warn("citymaker sandbox: couldn't build",rec.t,err); } compact(g); }
  if(RADIUS_TYPES.has(rec.t)||rec.t==="people"||rec.t==="hero"||TYPES[rec.t].flat){ const pr=TYPES[rec.t].flat?TYPES[rec.t].flat*(rec.s||1):rec.r||30, pick=new THREE.Mesh(new THREE.CylinderGeometry(pr,pr,4,24),new THREE.MeshBasicMaterial({visible:false})); pick.position.set(rec.x,heightAt(rec.x,rec.z),rec.z); g.add(pick); }
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=o.castShadow!==false; o.receiveShadow=true; } });
  scene.add(g); views.set(rec.id,g); shadowsDirty();
}
function unbuild(id){ const g=views.get(id); if(!g) return; scene.remove(g); g.traverse(o=>{ if(o.isInstancedMesh) o.dispose(); }); views.delete(id); walkers=walkers.filter(w=>{ if(w.rec===id){ scene.remove(w.s); return false; } return true; });
  for(let i=heroLabels.length-1;i>=0;i--) if(heroLabels[i].rec===id){ heroLabels[i].el.remove(); heroLabels.splice(i,1); } }
function rebuildAll(){ [...views.keys()].forEach(unbuild); recs.forEach(buildRec); }
function recBox(rec){ const pts=rec.pts||[[rec.x,rec.z],...(rec.p2?[rec.p2]:[])], r=(TYPES[rec.t]&&TYPES[rec.t].flat?TYPES[rec.t].flat*(rec.s||1):rec.r||30)+20; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  pts.forEach(([x,z])=>{ x0=Math.min(x0,x-r); x1=Math.max(x1,x+r); z0=Math.min(z0,z-r); z1=Math.max(z1,z+r); }); return [x0,z0,x1,z1]; }

/* ---------- people: library sprites who wander about their spot ---------- */
let walkers=[];
const SHEETS=[];
function sheet(src,n,ms){ const img=new Image(), vars=[];
  for(const flip of [0,1]){ const tex=new THREE.Texture(img); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.repeat.set(flip?-1/n:1/n,1);
    vars.push({flip,tex,mat:new THREE.SpriteMaterial({map:tex,alphaTest:.5})}); }
  img.onload=()=>vars.forEach(v=>v.tex.needsUpdate=true); img.src=src; const sh={n,ms,acc:0,tick:0,vars}; SHEETS.push(sh); return sh; }
const SPR={}; FOLKS.forEach(f=>{ SPR[f]=SPRITES[f].map(sp=>({idle:sheet(sp.src,2,520),walk:sp.anims&&sp.anims.walk?sheet(sp.anims.walk.src,sp.anims.walk.frames||4,sp.anims.walk.ms||150):null})); });
const CHARS=window.SANDBOX_CHARACTERS||[], CHAR={};
CHARS.forEach(c=>{ CHAR[c.key]={c,sp:{idle:sheet(c.src,2,520),walk:c.anims&&c.anims.walk?sheet(c.anims.walk.src,c.anims.walk.frames||4,c.anims.walk.ms||150):null}}; });
const ageName=a=>a==="First Age"?"First Age · Beleriand":"Third Age · Middle-earth";
$("heroIn").innerHTML=[...new Set(CHARS.map(c=>c.age))].map(a=>`<optgroup label="${ageName(a)}">${CHARS.filter(c=>c.age===a).map(c=>`<option value="${c.key}">${c.n.replace(/[<&]/g,"")}</option>`).join("")}</optgroup>`).join("");
const heroLabels=[];
function buildHero(rec,g){ const h=CHAR[rec.hero]; if(!h) return; const s=new THREE.Sprite(h.sp.idle.vars[0].mat); s.center.set(.5,.04);
  walkers.push({rec:rec.id,sp:h.sp,s,cx:rec.x,cz:rec.z,r:rec.r||14,x:rec.x,z:rec.z,tx:rec.x,tz:rec.z,wait:1,speed:2.2,flip:0,hero:true}); scene.add(s);
  const el=document.createElement("div"); el.className="lbl t1"; el.textContent=rec.name||h.c.n.split(",")[0]; $("labels").appendChild(el); heroLabels.push({rec:rec.id,el,s}); }
function buildPeople(rec,g){ const list=SPR[rec.folk]||SPR[FOLKS[0]]; if(!list||!list.length) return;
  const n=rec.n||10, r=rec.r||30; let seed=(rec.seed||7)*9301;
  const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  for(let k=0;k<n;k++){ const sp=list[Math.floor(rnd()*list.length)], s=new THREE.Sprite(sp.idle.vars[0].mat); s.center.set(.5,.04);
    const w={rec:rec.id,sp,s,cx:rec.x,cz:rec.z,r,x:rec.x,z:rec.z,tx:rec.x,tz:rec.z,wait:rnd()*4,speed:2.4+rnd()*1.6,flip:0,walking:false};
    pickSpot(w,rnd); w.x=w.tx; w.z=w.tz; scene.add(s); walkers.push(w); } }
function pickSpot(w,rnd){ for(let t=0;t<12;t++){ const a=(rnd||Math.random)()*Math.PI*2, rr=Math.sqrt((rnd||Math.random)())*w.r, x=w.cx+Math.cos(a)*rr, z=w.cz+Math.sin(a)*rr; if(heightAt(x,z)>level+.4){ w.tx=x; w.tz=z; return; } } w.tx=w.cx; w.tz=w.cz; }
const _p0=new THREE.Vector3(), _p1=new THREE.Vector3();
function stepPeople(dt){ const dist=camera.position.distanceTo(controls.target), k=Math.min(2.4,Math.max(1,dist/320)), size=4.4*k;
  for(const w of walkers){ let moving=false;
    if(w.wait>0) w.wait-=dt; else { const dx=w.tx-w.x, dz=w.tz-w.z, d=Math.hypot(dx,dz);
      if(d<.5){ w.wait=2+Math.random()*6; pickSpot(w); } else { const st=Math.min(d,w.speed*dt); _p0.set(w.x,0,w.z).project(camera); w.x+=dx/d*st; w.z+=dz/d*st; _p1.set(w.x,0,w.z).project(camera); moving=true;
        const f=_p1.x<_p0.x?1:0; if(f!==w.flip) w.flip=f; } }
    const sh=(moving&&w.sp.walk)||w.sp.idle; w.s.material=sh.vars[w.flip].mat;
    const wx=w.x+(w.ox||0), wz=w.z+(w.oz||0); w.s.position.set(wx,heightAt(wx,wz),wz); w.s.scale.set(size,size,1); } }
function stepSheets(ms){ for(const sh of SHEETS){ sh.acc+=ms; if(sh.acc>=sh.ms){ sh.tick+=Math.floor(sh.acc/sh.ms); sh.acc%=sh.ms; sh.vars.forEach(v=>{ const f=sh.tick%sh.n; v.tex.offset.x=v.flip?(f+1)/sh.n:f/sh.n; }); } } }

/* ---------- history ---------- */
let undoStack=[], redoStack=[];
function snapshot(){ return {h:heights.slice(),p:paint.slice(),l:level,o:JSON.stringify(recs)}; }
function pushUndo(){ undoStack.push(snapshot()); if(undoStack.length>30) undoStack.shift(); redoStack=[]; updUndo(); markDirty(); }
function restore(s){ heights=s.h.slice(); paint=s.p.slice(); level=s.l; recs=JSON.parse(s.o); $("levelIn").value=level; $("levelOut").textContent=level; refreshAll(); rebuildAll(); select(null); }
function undo(){ if(!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); updUndo(); markDirty(); }
function redo(){ if(!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); updUndo(); markDirty(); }
function updUndo(){ $("undoBtn").disabled=!undoStack.length; $("redoBtn").disabled=!redoStack.length; }

/* ---------- tools ---------- */
const IC={raise:"M4 18l6-9 4 5 3-4 3 8z",lower:"M4 6h16l-5 9-3-3-4 6z",flatten:"M3 15h18M6 15V9h12v6",smooth:"M3 15c3-5 6-5 9 0s6 5 9 0",mountain:"M2 19l7-12 4 6 2-3 7 9z",paint:"M5 19c3 0 4-2 4-4l9-9-3-3-9 9c-2 0-4 1-4 4",
  select:"M6 3l12 9-6 1 3 7-3 1-3-7-4 4z",carve:"M3 9c3 3 6 3 9 0s6-3 9 0M3 15c3 3 6 3 9 0s6-3 9 0",fill:"M4 18h16M7 14h10l-2-6H9z",
  building:"M4 20V10l8-6 8 6v10zM10 20v-6h4v6",line:"M4 18L10 8l4 6 6-10",two:"M5 17h14M5 17V9M19 17V9",tree:"M12 3l6 10H6zM12 13v8",hero:"M12 3l2 4 4 .5-3 3 .8 4.5-3.8-2-3.8 2 .8-4.5-3-3 4-.5zM6 21c1-3 3-4.5 6-4.5s5 1.5 6 4.5",dome:"M4 19h16M6 19v-6a6 6 0 0 1 12 0v6M12 7V3M9 19v-4h6v4",people:"M9 8a3 3 0 1 0 0-.01M4 20c1-4 3-6 5-6s4 2 5 6M17 9a2.4 2.4 0 1 0 0-.01M15.6 13.6c2.4 0 4.2 2 4.6 5.4"};
const TOOLS={
  land:[["select","Select",IC.select,"Drag an object to move it; click it to name, describe or delete it. Drag empty ground to pan."],["raise","Raise",IC.raise,"Drag to raise the land."],["lower","Lower",IC.lower,"Drag to dig the land down."],
    ["flatten","Flatten",IC.flatten,"Drag to level the land to the height where you started."],["smooth","Smooth",IC.smooth,"Drag to soften bumps and edges."],
    ["mountain","Mountains",IC.mountain,"Drag to raise rugged peaks and ridges."],["paint","Paint",IC.paint,"Drag to paint the ground: grass, meadow, sand, earth, rock or snow. Auto colors it by height and steepness."]],
  water:[["select","Select",IC.select,"Drag an object to move it; click it to name, describe or delete it."],["carve","Carve water",IC.carve,"Drag to dig below the water level: lakes, rivers and bays fill with water."],
    ["fill","Fill land",IC.fill,"Drag to raise the ground just above the water: islands, shores and fords."],...["waterfall","quay","pier","boat"].map(k=>[k,TYPES[k].label,TYPES[k].place==="line"?IC.line:TYPES[k].place==="two"?IC.two:IC.building,TYPES[k].hint])],
  build:[["select","Select",IC.select,"Drag an object to move it; click it to name, describe or delete it."],...Object.keys(TYPES).filter(k=>TYPES[k].group==="build").map(k=>[k,TYPES[k].label,TYPES[k].place==="line"?IC.line:TYPES[k].place==="two"?IC.two:IC.building,TYPES[k].hint])],
  nature:[["select","Select",IC.select,"Drag an object to move it; click it to name, describe or delete it."],...Object.keys(TYPES).filter(k=>TYPES[k].group==="nature").map(k=>[k,TYPES[k].label,IC.tree,TYPES[k].hint])],
  people:[["select","Select",IC.select,"Drag an object to move it; click it to name, describe or delete it."],["people","People",IC.people,TYPES.people.hint+" Size sets how far they wander."],["hero","Character",IC.hero,TYPES.hero.hint]],
  great:[["select","Select",IC.select,"Drag an object to move it; click it to name, describe or delete it."],...Object.keys(TYPES).filter(k=>TYPES[k].group==="great").map(k=>[k,TYPES[k].label,TYPES[k].place==="two"?IC.two:IC.dome,TYPES[k].hint])],
};
const BRUSHES=new Set(["raise","lower","flatten","smooth","mountain","paint","carve","fill"]);
let brushSize=70, tab="land", tool="select", groundType=1, placeYaw=0, pending=null;   // pending: the first end of a two-point object, or the points of a line
function setTab(t){ tab=t; document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===t)));
  $("toolGrid").innerHTML=TOOLS[t].map(([k,label,ic])=>`<button class="tool" data-tool="${k}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ic}"/></svg>${label}</button>`).join("");
  setTool(TOOLS[t].some(x=>x[0]===tool)?tool:TOOLS[t][1]?TOOLS[t][1][0]:"select"); }
function setTool(k){ tool=k; pending=null; linePreview.visible=false; endMark.visible=false;
  document.querySelectorAll("#toolGrid .tool").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===k)));
  const def=TOOLS[tab].find(x=>x[0]===k); $("toolHint").textContent=def?def[3]:"";
  const T=TYPES[k], brush=BRUSHES.has(k), radius=T&&T.place==="radius";
  $("optBrush").hidden=!(brush||radius); $("strIn").parentElement.hidden=!brush;
  $("optGround").hidden=k!=="paint"; $("optWater").hidden=tab!=="water";
  $("optPlace").hidden=!T; $("styleRow").hidden=!(T&&T.group==="build"); $("folkRow").hidden=k!=="people"; $("heroRow").hidden=k!=="hero"; $("countRow").hidden=k!=="people";
  $("lineHint").hidden=!(T&&T.place==="line");
  const sz=radius&&!brush?TYPES[k].r:brushSize; $("sizeIn").value=sz; $("sizeOut").textContent=sz;   // brushes remember their own size
  controls.mouseButtons.LEFT=k==="select"?THREE.MOUSE.PAN:-1; }
$("toolGrid").addEventListener("click",e=>{ const b=e.target.closest(".tool"); if(b) setTool(b.dataset.tool); });
document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
$("groundSw").innerHTML=GROUND.slice(1).map((g,i)=>`<button style="background:${g[1]}" data-g="${i+1}" title="${g[0]}" aria-label="${g[0]}" aria-pressed="${i===0}"></button>`).join("")+`<button data-g="0" title="Auto: by height and steepness" aria-label="Auto" aria-pressed="false" style="background:linear-gradient(135deg,#8aa763 50%,#8e8a82 50%)"></button>`;
$("groundSw").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; groundType=+b.dataset.g; $("groundSw").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); });
$("folkIn").innerHTML=FOLKS.map(f=>`<option value="${f}">${{noldor:"Noldor",rohirrim:"Rohirrim",edain:"Edain (Men)",sindar:"Sindar (Grey-elves)"}[f]||f}</option>`).join("");
const bindOut=(i,o,fmt)=>$(i).addEventListener("input",()=>{ $(o).textContent=fmt?fmt($(i).value):$(i).value; });
bindOut("sizeIn","sizeOut"); $("sizeIn").addEventListener("input",()=>{ if(BRUSHES.has(tool)) brushSize=+$("sizeIn").value; }); bindOut("strIn","strOut"); bindOut("countIn","countOut"); bindOut("scaleIn","scaleOut",v=>(+v).toFixed(1)+"×");
const turn=d=>{ if(selected){ const r=recs.find(x=>x.id===selected); if(r&&r.x!==undefined){ pushUndo(); r.yaw=((r.yaw||0)+d+360)%360; buildRec(r); showInspect(); return; } } placeYaw=(placeYaw+d+360)%360; $("rotOut").textContent=placeYaw+"°"; };
$("rotMinus").addEventListener("click",()=>turn(-15)); $("rotPlus").addEventListener("click",()=>turn(15));
$("levelIn").addEventListener("input",()=>{ level=+$("levelIn").value; $("levelOut").textContent=level; refreshAll(); });
$("levelIn").addEventListener("change",()=>{ pushUndo(); rebuildAll(); });

/* ---------- pointing at the land: march along the view ray to where it meets the ground ---------- */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function groundHit(ev){ const r=renderer.domElement.getBoundingClientRect(); ndc.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1); ray.setFromCamera(ndc,camera);
  const o=ray.ray.origin, d=ray.ray.direction; let t=0, prev=null;
  for(let i=0;i<1600;i++){ const p=o.clone().addScaledVector(d,t), h=Math.max(heightAt(p.x,p.z),level);
    if(p.y<=h){ if(!prev) return p; let a=t-Math.max(4,t*.004), b=t; for(let k=0;k<12;k++){ const m=(a+b)/2, q=o.clone().addScaledVector(d,m); if(q.y<=Math.max(heightAt(q.x,q.z),level)) b=m; else a=m; } return o.clone().addScaledVector(d,b); }
    prev=p; t+=Math.max(2,t*.004); if(t>14000) break; }
  return null; }
const inMap=p=>p&&Math.abs(p.x)<HALF-2&&Math.abs(p.z)<HALF-2;

/* ---------- brushes ---------- */
const brushRing=new THREE.Mesh(new THREE.RingGeometry(.96,1,96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthTest:false}));
brushRing.renderOrder=10; brushRing.visible=false; scene.add(brushRing);
let stroke=null, cursor=null;
function applyBrush(p,dt){ const R=+$("sizeIn").value, k=+$("strIn").value/100, ix0=Math.floor((p.x-R+HALF)/CELL), ix1=Math.ceil((p.x+R+HALF)/CELL), iz0=Math.floor((p.z-R+HALF)/CELL), iz1=Math.ceil((p.z+R+HALF)/CELL);
  const src=tool==="smooth"?heights.slice():null;
  for(let iz=Math.max(0,iz0);iz<=Math.min(N-1,iz1);iz++) for(let ix=Math.max(0,ix0);ix<=Math.min(N-1,ix1);ix++){
    const x=-HALF+ix*CELL, z=-HALF+iz*CELL, d=Math.hypot(x-p.x,z-p.z); if(d>R) continue;
    const f=smooth(R,R*.2,d), i=iz*N+ix; let h=heights[i];
    switch(tool){
      case "raise": h+=k*70*dt*f; break;
      case "lower": h-=k*70*dt*f; break;
      case "flatten": h+=(stroke.ref-h)*Math.min(1,k*5*dt)*f; break;
      case "smooth": { let s=0,c=0; for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const jx=ix+a, jz=iz+b; if(jx<0||jz<0||jx>=N||jz>=N) continue; s+=src[jz*N+jx]; c++; } h+=(s/c-h)*Math.min(1,k*6*dt)*f; break; }
      case "mountain": h+=k*110*dt*f*(.35+1.2*ridged(x*.012,z*.012)); break;
      case "paint": if(f>.25) paint[i]=groundType; break;
      case "carve": { const tg=level-5; if(h>tg) h+=(tg-h)*Math.min(1,k*5*dt)*f; break; }
      case "fill": { const tg=level+1.6; if(h<tg) h+=(tg-h)*Math.min(1,k*5*dt)*f; break; }
    }
    heights[i]=clamp(h,-80,700); }
  refreshGround(ix0,iz0,ix1,iz1);
  stroke.box=[Math.min(stroke.box[0],p.x-R),Math.min(stroke.box[1],p.z-R),Math.max(stroke.box[2],p.x+R),Math.max(stroke.box[3],p.z+R)]; }
function endStroke(){ if(!stroke) return; const [x0,z0,x1,z1]=stroke.box; stroke=null; controls.enabled=true;
  recs.forEach(r=>{ const [a0,b0,a1,b1]=recBox(r); if(a1>x0&&a0<x1&&b1>z0&&b0<z1) buildRec(r); }); }   // whatever stands on the changed ground settles onto it

/* ---------- placing objects ---------- */
const linePreview=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffffff,depthTest:false})); linePreview.renderOrder=11; linePreview.visible=false; scene.add(linePreview);
const endMark=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,10,12).translate(0,5,0),new THREE.MeshBasicMaterial({color:0xffd060,depthTest:false})); endMark.renderOrder=11; endMark.visible=false; scene.add(endMark);
function showLine(extra){ const pts=[...(pending&&pending.pts||[]),...(extra?[extra]:[])].map(([x,z])=>new THREE.Vector3(x,heightAt(x,z)+2,z)); linePreview.geometry.setFromPoints(pts); linePreview.visible=pts.length>1; }
// while placing a two-point object, show where it will run: a stair shows its real course, switchbacks and all
function showTwo(b){ let pts;
  if(tool==="stair") pts=kit($("styleIn").value).OBJ.stairPath(pending.a,b,+$("scaleIn").value).out.map(([x,z,y])=>new THREE.Vector3(x,y+1.2,z));
  else pts=[pending.a,b].map(([x,z])=>new THREE.Vector3(x,heightAt(x,z)+2,z));
  linePreview.geometry.setFromPoints(pts); linePreview.visible=true; }
function newRec(t,o){ return Object.assign({id:uid(),t,s:+$("scaleIn").value,yaw:placeYaw,seed:Math.floor(Math.random()*1e6)},
  TYPES[t].group==="build"?{style:$("styleIn").value}:{},o); }
function addRec(rec){ pushUndo();
  if(TYPES[rec.t].single) recs.filter(r=>r.t===rec.t).forEach(r=>{ unbuild(r.id); recs=recs.filter(x=>x!==r); });
  levelUnder(rec); recs.push(rec); buildRec(rec); toast(TYPES[rec.t].label+" placed"); }
function levelUnder(rec){ if(!(rec.t==="town"||TYPES[rec.t].flat)) return;   // a walled town or a great building needs level ground
  const R=rec.t==="town"?rec.r+8:TYPES[rec.t].flat*(rec.s||1), y0=heightAt(rec.x,rec.z);
  for(let iz=0;iz<N;iz++) for(let ix=0;ix<N;ix++){ const x=-HALF+ix*CELL, z=-HALF+iz*CELL, d=Math.hypot(x-rec.x,z-rec.z); if(d<R+14){ const i=iz*N+ix; heights[i]+=(y0-heights[i])*smooth(R+14,R,d); } }
  refreshGround(Math.floor((rec.x-R-20+HALF)/CELL),Math.floor((rec.z-R-20+HALF)/CELL),Math.ceil((rec.x+R+20+HALF)/CELL),Math.ceil((rec.z+R+20+HALF)/CELL));
  recs.forEach(o=>{ if(o!==rec&&o.x!==undefined&&Math.hypot(o.x-rec.x,o.z-rec.z)<R+60) buildRec(o); }); }   // neighbours settle onto the levelled ground
function placeAt(p){ const T=TYPES[tool]; if(!T) return;
  if(tool==="hero"){ const k=$("heroIn").value; if(recs.some(r=>r.t==="hero"&&r.hero===k)){ toast(CHAR[k].c.n.split(",")[0]+" is already on the map. Select them to move them."); return; } addRec(newRec(tool,{x:p.x,z:p.z,r:14,hero:k})); }
  else if(T.place==="point") addRec(newRec(tool,{x:p.x,z:p.z}));
  else if(T.place==="radius") addRec(newRec(tool,{x:p.x,z:p.z,r:+$("sizeIn").value},tool==="people"?{folk:$("folkIn").value,n:+$("countIn").value}:{}));
  else if(T.place==="two"){ if(!pending){ pending={a:[p.x,p.z]}; endMark.position.set(p.x,heightAt(p.x,p.z),p.z); endMark.visible=true; }
    else { addRec(newRec(tool,{x:pending.a[0],z:pending.a[1],p2:[p.x,p.z]})); pending=null; endMark.visible=false; linePreview.visible=false; } }
  else if(T.place==="line"){ pending=pending||{pts:[]}; pending.pts.push([p.x,p.z]); showLine(); } }
function finishLine(){ if(pending&&pending.pts&&pending.pts.length>1){ const pts=pending.pts; addRec(newRec(tool,{x:pts[0][0],z:pts[0][1],pts})); } pending=null; linePreview.visible=false; }

/* ---------- selecting and editing ---------- */
let selected=null, moving=false;
const selRing=new THREE.Mesh(new THREE.RingGeometry(.92,1,72).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:.95,depthTest:false})); selRing.renderOrder=12; selRing.visible=false; scene.add(selRing);
function pickRec(ev){ const r=renderer.domElement.getBoundingClientRect(); ndc.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1); ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects([...views.values()],true); for(const h of hits){ let o=h.object; while(o&&!o.userData.recId) o=o.parent; if(o) return o.userData.recId; } return null; }
function select(id){ selected=id; moving=false; const r=recs.find(x=>x.id===id);
  if(!r){ selRing.visible=false; $("inspect").hidden=true; return; }
  const [x0,z0,x1,z1]=recBox(r), cx=(x0+x1)/2, cz=(z0+z1)/2, rad=Math.max(x1-x0,z1-z0)/2-8; selRing.position.set(cx,heightAt(cx,cz)+.6,cz); selRing.userData.x=cx; selRing.userData.z=cz; selRing.scale.setScalar(Math.max(8,rad)); selRing.visible=true; showInspect(); }
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function showInspect(){ const r=recs.find(x=>x.id===selected); if(!r) return; const T=TYPES[r.t], el=$("inspect");
  el.innerHTML=`<div class="info-head"><div><p class="kicker">${esc(T.group==="nature"?"Nature":T.group==="people"?"People":T.group==="water"?"Water":T.group==="great"?"Great building":"Structure")}</p><h2>${esc(r.name||(r.t==="hero"&&CHAR[r.hero]?CHAR[r.hero].c.n.split(",")[0]:T.label))}</h2></div><button id="insClose" class="mini" aria-label="Close">&times;</button></div>
    ${r.t==="hero"&&CHAR[r.hero]?`<div class="portrait"><span role="img" aria-label="${esc(CHAR[r.hero].c.n)}" style="background-image:url(${CHAR[r.hero].c.src})"></span></div><p class="alt">${esc(CHAR[r.hero].c.n)}</p>`:""}
    <div class="field"><label for="insName">Name</label><input id="insName" value="${esc(r.name)}" placeholder="${esc(T.label)}" maxlength="80"></div>
    <div class="field"><label for="insDesc">Description</label><textarea id="insDesc" rows="3" maxlength="600" placeholder="Shown on its card when the map becomes a city">${esc(r.desc)}</textarea></div>
    ${T.group==="build"&&r.t!=="centre"?`<div class="field row"><label for="insStyle" class="olabel">Style</label><select id="insStyle">${[["noldor","Noldor"],["eldarin","High Elven"],["rohan","Rohan"]].map(([v,l])=>`<option value="${v}"${(r.style||"noldor")===v?" selected":""}>${l}</option>`).join("")}</select></div>`:""}
    ${r.t==="people"?`<div class="field row"><label for="insFolk" class="olabel">Folk</label><select id="insFolk">${FOLKS.map(f=>`<option value="${f}"${r.folk===f?" selected":""}>${f}</option>`).join("")}</select></div>
      <div class="row field"><label for="insN" class="olabel">How many</label><input type="range" id="insN" min="2" max="40" value="${r.n||10}"><output id="insNOut">${r.n||10}</output></div>`:""}
    ${RADIUS_TYPES.has(r.t)||r.t==="people"?`<div class="row field"><label for="insR" class="olabel">Size</label><input type="range" id="insR" min="8" max="320" value="${r.r||30}"><output id="insROut">${r.r||30}</output></div>`:""}
    ${r.t!=="people"&&r.t!=="centre"?`<div class="row field"><label for="insS" class="olabel">Scale</label><input type="range" id="insS" min=".5" max="2.5" step=".1" value="${r.s||1}"><output id="insSOut">${(r.s||1).toFixed(1)}×</output></div>`:""}
    <div class="acts">${r.x!==undefined&&!r.pts&&!r.p2?`<button id="insTurnL">&minus;15&deg;</button><button id="insTurnR">+15&deg;</button>`:""}<button id="insMove">Move</button><button id="insDel" class="danger">Delete</button></div>
    <p class="thint" id="insMoveHint" hidden>Click where it should go. Esc cancels.</p>`;
  el.hidden=false;
  $("insClose").onclick=()=>select(null);
  const live=(id,fn,rebuild)=>{ const e=$(id); if(!e) return; let pushed=false; e.addEventListener("input",()=>{ if(!pushed){ pushUndo(); pushed=true; } fn(e.value); if(rebuild) buildRec(r); else markDirty(); }); e.addEventListener("change",()=>{ pushed=false; }); };
  live("insName",v=>{ r.name=v.trim()||undefined; el.querySelector("h2").textContent=r.name||T.label; });
  live("insDesc",v=>{ r.desc=v.trim()||undefined; });
  live("insStyle",v=>{ r.style=v; },true);
  live("insFolk",v=>{ r.folk=v; },true);
  live("insN",v=>{ r.n=+v; $("insNOut").textContent=v; },true);
  live("insR",v=>{ r.r=+v; $("insROut").textContent=v; },true);
  live("insS",v=>{ r.s=+v; $("insSOut").textContent=(+v).toFixed(1)+"×"; },true);
  const tl=$("insTurnL"), tr=$("insTurnR"); if(tl){ tl.onclick=()=>turn(-15); tr.onclick=()=>turn(15); }
  $("insMove").onclick=()=>{ moving=true; $("insMoveHint").hidden=false; };
  $("insDel").onclick=()=>deleteSelected(); }
function deleteSelected(){ const r=recs.find(x=>x.id===selected); if(!r) return; pushUndo(); unbuild(r.id); recs=recs.filter(x=>x!==r); select(null); toast("Deleted. Undo brings it back."); }
function moveSelected(p){ const r=recs.find(x=>x.id===selected); if(r) moveBy(r,p.x-r.x,p.z-r.z); }
function moveBy(r,dx,dz){ if(!dx&&!dz) return; pushUndo();
  r.x+=dx; r.z+=dz; if(r.p2) r.p2=[r.p2[0]+dx,r.p2[1]+dz]; if(r.pts) r.pts=r.pts.map(([x,z])=>[x+dx,z+dz]); levelUnder(r); buildRec(r); select(r.id); }

/* ---------- dragging: with Select, press on an object and drag it; release to set it down ---------- */
let drag=null, hoverAt=0;
renderer.domElement.addEventListener("pointerdown",ev=>{   // capture phase: runs before the map controls, so the view doesn't pan while an object is dragged
  if(ev.button!==0||spaceDown||tool!=="select"||moving) return;
  const id=pickRec(ev), p=id&&groundHit(ev); if(!id||!inMap(p)) return;
  ev.stopImmediatePropagation(); renderer.domElement.setPointerCapture(ev.pointerId);
  const r=recs.find(x=>x.id===id); select(id);
  drag={id,r,x0:ev.clientX,y0:ev.clientY,start:p,dx:0,dz:0,y0g:heightAt(r.x,r.z),live:false};
},{capture:true});
function dragTo(ev){ const p=groundHit(ev); if(!inMap(p)) return; const d=drag; d.live=d.live||Math.hypot(ev.clientX-d.x0,ev.clientY-d.y0)>5; if(!d.live) return;
  d.dx=p.x-d.start.x; d.dz=p.z-d.start.z; const g=views.get(d.id); renderer.domElement.style.cursor="grabbing";
  if(g) g.position.set(d.dx,heightAt(d.r.x+d.dx,d.r.z+d.dz)-d.y0g,d.dz);   // the built object slides along with the pointer
  walkers.forEach(w=>{ if(w.rec===d.id){ w.ox=d.dx; w.oz=d.dz; } });
  selRing.position.set(selRing.userData.x+d.dx,heightAt(selRing.userData.x+d.dx,selRing.userData.z+d.dz)+.6,selRing.userData.z+d.dz); }
function dropDrag(){ const d=drag; drag=null; renderer.domElement.style.cursor="";
  if(!d.live) return; const g=views.get(d.id); if(g) g.position.set(0,0,0); walkers.forEach(w=>{ if(w.rec===d.id){ w.ox=w.oz=0; } });
  moveBy(d.r,d.dx,d.dz); toast(TYPES[d.r.t].label+" moved. Undo puts it back."); }

/* ---------- pointer and keyboard ---------- */
let spaceDown=false, downAt=null;
renderer.domElement.addEventListener("pointerdown",ev=>{ if(ev.button!==0||spaceDown) return; downAt={x:ev.clientX,y:ev.clientY};
  if(BRUSHES.has(tool)){ const p=groundHit(ev); if(!inMap(p)) return; pushUndo(); controls.enabled=false; stroke={p,ref:heightAt(p.x,p.z),box:[p.x,p.z,p.x,p.z],last:performance.now()}; renderer.domElement.setPointerCapture(ev.pointerId); } });
renderer.domElement.addEventListener("pointermove",ev=>{ if(drag){ dragTo(ev); return; } const p=groundHit(ev); cursor=inMap(p)?p:null;
  if(tool==="select"&&!ev.buttons&&performance.now()-(hoverAt||0)>100){ hoverAt=performance.now(); renderer.domElement.style.cursor=pickRec(ev)?"grab":""; }   // a hand over things that can be dragged
  if(stroke&&cursor) stroke.p=cursor;
  if(pending&&pending.pts&&cursor) showLine([cursor.x,cursor.z]);
  if(pending&&pending.a&&cursor) showTwo([cursor.x,cursor.z]); });
renderer.domElement.addEventListener("pointerup",ev=>{ if(ev.button!==0) return; if(drag){ dropDrag(); downAt=null; return; } if(stroke){ endStroke(); return; }
  if(!downAt||Math.hypot(ev.clientX-downAt.x,ev.clientY-downAt.y)>6||spaceDown) return; downAt=null;
  if(moving){ const p=groundHit(ev); if(inMap(p)) moveSelected(p); return; }
  if(tool==="select"){ select(pickRec(ev)); return; }
  const p=groundHit(ev); if(inMap(p)) placeAt(p); });
renderer.domElement.addEventListener("dblclick",()=>{ if(pending&&pending.pts){ pending.pts.pop(); finishLine(); } });
renderer.domElement.addEventListener("pointerleave",()=>{ cursor=null; });
renderer.domElement.addEventListener("contextmenu",e=>e.preventDefault());
document.addEventListener("keydown",e=>{
  const ae=document.activeElement, typing=ae&&(/^(TEXTAREA|SELECT)$/.test(ae.tagName)||(ae.tagName==="INPUT"&&!/^(range|checkbox|button)$/.test(ae.type)));
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key.toLowerCase()==="s"){ e.preventDefault(); saveMap(); return; }
  if(typing) return;
  if(mod&&e.key.toLowerCase()==="z"){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
  if(mod&&e.key.toLowerCase()==="y"){ e.preventDefault(); redo(); return; }
  if(e.code==="Space"){ e.preventDefault(); if(!spaceDown){ spaceDown=true; controls.mouseButtons.LEFT=THREE.MOUSE.PAN; } return; }
  if(e.key==="Escape"){ if(pending){ pending=null; linePreview.visible=false; endMark.visible=false; } else if(moving){ moving=false; showInspect(); } else select(null); return; }
  if(e.key==="Enter"){ finishLine(); return; }
  if((e.key==="Delete"||e.key==="Backspace")&&selected){ e.preventDefault(); deleteSelected(); return; }
  if(e.key.toLowerCase()==="q") turn(-15); if(e.key.toLowerCase()==="e") turn(15); });
document.addEventListener("keyup",e=>{ if(e.code==="Space"){ spaceDown=false; controls.mouseButtons.LEFT=tool==="select"?THREE.MOUSE.PAN:-1; } });

/* ---------- camera buttons (as on the city pages) ---------- */
let tween=null;
const sph=()=>new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
function flyTo(t,d,o){ o=o||{}; const s=sph(); tween={t0:performance.now(),fromT:controls.target.clone(),toT:t.clone(),fromD:s.radius,toD:clamp(d,controls.minDistance,controls.maxDistance),fromPhi:s.phi,toPhi:o.phi??s.phi,fromTh:s.theta,toTh:o.theta??s.theta}; }
function stepTween(now){ let k=(now-tween.t0)/(reduced?1:1000); if(k>1) k=1; const e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, T=tween;
  controls.target.lerpVectors(T.fromT,T.toT,e); camera.position.setFromSpherical(new THREE.Spherical(Math.exp(Math.log(T.fromD)+(Math.log(T.toD)-Math.log(T.fromD))*e),T.fromPhi+(T.toPhi-T.fromPhi)*e,T.fromTh+(T.toTh-T.fromTh)*e)).add(controls.target); if(k===1) tween=null; }
controls.addEventListener("start",()=>{ tween=null; });
$("zin").onclick=()=>flyTo(controls.target,sph().radius*.6); $("zout").onclick=()=>flyTo(controls.target,sph().radius/.6);
$("home").onclick=()=>flyTo(HOME.t,HOME.d,{phi:HOME.phi,theta:HOME.th});
const snap=d=>{ const q=Math.PI/2, s=sph(); flyTo(controls.target,s.radius,{theta:Math.round((s.theta-HOME.th)/q)*q+HOME.th+d*q}); };
$("rotL").onclick=()=>snap(-1); $("rotR").onclick=()=>snap(1);
let eyeBack=null; $("eyeView").onclick=()=>{ if(sph().phi<1.15){ eyeBack=sph().radius; const t=controls.target.clone(); t.y=Math.max(heightAt(t.x,t.z),level)+4; flyTo(t,70,{phi:1.36}); } else flyTo(controls.target,eyeBack||900,{phi:TILT}); };

/* ---------- saving: the page's shared database (collections "maps" and "mapinfo"), or this browser ---------- */
let db=null, mapId=null, dirty=false, saving=false;
const LS="citymaker-sandbox";
const lsGet=k=>{ try{ return JSON.parse(localStorage.getItem(LS+k)||"null"); }catch(e){ return null; } };
const lsSet=(k,v)=>{ try{ localStorage.setItem(LS+k,JSON.stringify(v)); return true; }catch(e){ return false; } };
const b64=u8=>{ let s=""; for(let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s); };
const unb64=s=>{ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; };
function serialize(){ const q=new Uint16Array(N*N); for(let i=0;i<N*N;i++) q[i]=clamp(Math.round((heights[i]+100)*64),0,65535);
  return {v:1,app:"citymaker-sandbox",name:$("mapName").value.trim()||"Untitled land",size:SIZE,n:N,level,h:b64(new Uint8Array(q.buffer)),p:b64(paint),objs:recs}; }
function deserialize(d){ if(!d||d.app!=="citymaker-sandbox"||d.n!==N||!d.h) throw new Error("This file isn't a Citymaker Sandbox map.");
  const q=new Uint16Array(unb64(d.h).buffer); for(let i=0;i<N*N;i++) heights[i]=q[i]/64-100; paint=d.p?unb64(d.p):new Uint8Array(N*N); level=d.level||0; recs=Array.isArray(d.objs)?d.objs:[];
  $("mapName").value=d.name||"Untitled land"; $("levelIn").value=level; $("levelOut").textContent=level;
  refreshAll(); rebuildAll(); select(null); undoStack=[]; redoStack=[]; updUndo(); }
function setState(s){ $("saveState").textContent=s; }
function markDirty(){ dirty=true; setState(db?"Unsaved changes":"Unsaved changes"); clearTimeout(markDirty.t); markDirty.t=setTimeout(()=>lsSet("-draft",Object.assign(serialize(),{mapId})),1500); }
async function saveMap(){ if(saving) return; const data=serialize(), id=mapId||uid(); saving=true; setState("Saving…");
  try{ if(db){ await db.collection("maps").doc(id).set(data); await db.collection("mapinfo").doc(id).set({name:data.name,updated:Date.now(),objects:recs.length}); }
    else { const idx=lsGet("-index")||{}; if(!lsSet("-map-"+id,data)) throw {code:"quota_exceeded"}; idx[id]={name:data.name,updated:Date.now(),objects:recs.length}; lsSet("-index",idx); }
    mapId=id; dirty=false; setState(db?"Saved":"Saved in this browser"); toast("Saved "+data.name); }
  catch(e){ setState("Not saved"); toast(e&&e.code==="quota_exceeded"?"There's no room left to save maps. Delete one you no longer need.":e&&e.code==="invalid_argument"?"This map is too large to save. Smooth away some detail or remove objects.":"Couldn't save. Check your connection and try again."); }
  saving=false; }
async function listMaps(){ if(db){ const s=await db.collection("mapinfo").get(); return s.docs.map(d=>Object.assign({id:d.id},d.data())); } const idx=lsGet("-index")||{}; return Object.entries(idx).map(([id,v])=>Object.assign({id},v)); }
async function openMap(id){ try{ let d; if(db){ const s=await db.collection("maps").doc(id).get(); d=s.exists?s.data():null; } else d=lsGet("-map-"+id);
    if(!d) throw new Error("gone"); deserialize(d); mapId=id; dirty=false; setState(db?"Saved":"Saved in this browser"); $("mapsDlg").hidden=true; flyTo(HOME.t,HOME.d,{phi:HOME.phi,theta:HOME.th}); }
  catch(e){ toast("Couldn't open that map. It may have been deleted."); } }
async function deleteMap(id){ try{ if(db){ await db.collection("maps").doc(id).delete(); await db.collection("mapinfo").doc(id).delete(); } else { const idx=lsGet("-index")||{}; delete idx[id]; lsSet("-index",idx); try{ localStorage.removeItem(LS+"-map-"+id); }catch(e){} }
    if(mapId===id) mapId=null; renderMaps(); toast("Map deleted"); } catch(e){ toast("Couldn't delete that map. Try again."); } }
let confirmDel=null;
async function renderMaps(){ const el=$("mapList"); el.innerHTML=`<p class="thint">Loading your maps…</p>`;
  let list=[]; try{ list=await listMaps(); }catch(e){ el.innerHTML=`<p class="thint">Couldn't load the saved maps. Check your connection.</p>`; return; }
  list.sort((a,b)=>(b.updated||0)-(a.updated||0));
  el.innerHTML=list.length?list.map(m=>`<div class="maprow"><span class="nm">${esc(m.name)}</span><span class="when">${m.objects||0} objects · ${new Date(m.updated||0).toLocaleDateString()}</span>
    <button class="mini" data-open="${m.id}">Open</button>${confirmDel===m.id?`<button class="mini danger" data-del="${m.id}">Delete for good</button><button class="mini" data-keep="1">Keep</button>`:`<button class="mini" data-ask="${m.id}">Delete</button>`}</div>`).join("")
    :`<p class="thint">No saved maps yet. Start one below, or press Save to keep the one on screen.${db?"":" Maps are kept in this browser only."}</p>`; }
$("mapList").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
  if(b.dataset.open) openMap(b.dataset.open); else if(b.dataset.ask){ confirmDel=b.dataset.ask; renderMaps(); } else if(b.dataset.del){ confirmDel=null; deleteMap(b.dataset.del); } else if(b.dataset.keep){ confirmDel=null; renderMaps(); } });
$("presets").innerHTML=Object.entries(PRESETS).map(([k,p])=>`<button class="preset" data-preset="${k}"><b>${p.name}</b><span>${p.desc}</span></button>`).join("");
$("presets").addEventListener("click",e=>{ const b=e.target.closest(".preset"); if(!b) return; newMap(b.dataset.preset); $("mapsDlg").hidden=true; });
function newMap(preset){ pushUndo(); applyPreset(preset); recs.forEach(r=>unbuild(r.id)); recs=[]; mapId=null; $("mapName").value=PRESETS[preset].name; $("levelIn").value=level; $("levelOut").textContent=level; refreshAll(); select(null); markDirty(); }
$("mapsBtn").onclick=()=>{ const d=$("mapsDlg"); d.hidden=!d.hidden; if(!d.hidden){ confirmDel=null; renderMaps(); } };
$("closeMaps").onclick=()=>{ $("mapsDlg").hidden=true; };
$("saveBtn").onclick=saveMap; $("undoBtn").onclick=undo; $("redoBtn").onclick=redo;
$("mapName").addEventListener("input",markDirty);
// export: a .json file the viewer saves, to share or to turn into a city with tools/sandbox_city.py; import reads one back
$("exportBtn").onclick=async()=>{ const data=JSON.stringify(serialize()), name=($("mapName").value.trim()||"map").replace(/[^\w\- ]+/g,"").slice(0,60)+".citymap.json";
  let dl=null; try{ dl=window.claude&&await window.claude.use("downloads"); }catch(e){}
  if(!dl){ try{ await navigator.clipboard.writeText(data); toast("Saving files isn't available here, so the map was copied to the clipboard instead."); }catch(e){ toast("Saving files isn't available in this view."); } return; }
  try{ await dl.save({filename:name,data}); toast("Exported "+name); }catch(e){ if(e&&e.code!=="declined") toast("Couldn't export the map ("+(e&&e.code||"error")+")."); } };
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").addEventListener("change",()=>{ const f=$("importFile").files[0]; if(!f) return; const rd=new FileReader();
  rd.onload=()=>{ try{ pushUndo(); deserialize(JSON.parse(rd.result)); mapId=null; markDirty(); toast("Opened "+f.name+". Press Save to keep it here."); }catch(e){ toast(e.message||"That file couldn't be read."); } $("importFile").value=""; };
  rd.readAsText(f); });

window.citymakerSandboxMap=()=>serialize();   // the map as an exported file would hold it (read-only; for tools and tests)

/* ---------- toast ---------- */
let toastT=null; function toast(m){ const t=$("toast"); t.textContent=m; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{ t.hidden=true; },3600); }

/* ---------- the loop ---------- */
let last=performance.now();
function frame(now){ requestAnimationFrame(frame); const dt=Math.min(.1,(now-last)/1000); last=now;
  if(tween) stepTween(now); controls.update();
  { const p=camera.position, gy=Math.max(heightAt(p.x,p.z),level)+2.2; if(p.y<gy){ p.y=gy; camera.lookAt(controls.target); } }
  $("eyeView").setAttribute("aria-pressed",String(sph().phi>1.15));
  if(stroke) applyBrush(stroke.p,dt);
  const R=+$("sizeIn").value, showRing=cursor&&(BRUSHES.has(tool)||(TYPES[tool]&&TYPES[tool].place==="radius"));
  brushRing.visible=!!showRing; if(showRing){ brushRing.position.set(cursor.x,Math.max(heightAt(cursor.x,cursor.z),level)+.8,cursor.z); brushRing.scale.setScalar(R); }
  stepPeople(dt); stepSheets(dt*1000);
  { const w=host.clientWidth, h=host.clientHeight, v=new THREE.Vector3(); heroLabels.forEach(l=>{ v.copy(l.s.position); v.y+=l.s.scale.y*1.05; v.project(camera);
      const show=v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05&&sph().radius<1400; l.el.hidden=!show;
      if(show) l.el.style.transform=`translate(${((v.x+1)/2*w).toFixed(1)}px,${((1-v.y)/2*h).toFixed(1)}px) translate(-50%,-100%)`; }); }
  { const wi=reduced?1:1+.25*Math.sin(now/420); WATERS.forEach(m=>m.emissiveIntensity=wi); }
  renderer.render(scene,camera); }

/* ---------- start: the draft left in this browser, else an example map ---------- */
function exampleMap(){ applyPreset("valley"); $("mapName").value="Example: a river valley";
  const R=(t,o)=>Object.assign({id:uid(),t,s:1,yaw:0,seed:Math.floor(Math.random()*1e6)},TYPES[t].group==="build"?{style:"noldor"}:{},o);
  recs=[R("village",{x:-150,z:-60,r:55,style:"eldarin",name:"Riverside village"}),R("hall",{x:-150,z:-140,yaw:0,style:"eldarin"}),R("tower",{x:-230,z:40,style:"eldarin"}),
    R("road",{x:-150,z:-60,pts:[[-150,-60],[-60,-20],[40,40],[120,160]]}),R("bridge",{x:20,z:28,p2:[100,60]}),R("forest",{x:230,z:-200,r:110}),R("forest",{x:-320,z:260,r:90}),
    R("fields",{x:-260,z:-260,r:90}),R("people",{x:-150,z:-60,r:45,folk:FOLKS[0],n:12}),R("pines",{x:520,z:100,r:140}),R("reeds",{x:40,z:200,r:40})]; }
(async function start(){
  setTab("land"); setTool("raise");
  const draft=lsGet("-draft"); let loaded=false;
  if(draft){ try{ deserialize(draft); mapId=draft.mapId||null; loaded=true; setState("Draft restored"); }catch(e){} }
  if(!loaded){ exampleMap(); refreshAll(); rebuildAll(); setState("Example map"); }
  requestAnimationFrame(frame);
  try{ db=window.claude&&typeof window.claude.use==="function"?await window.claude.use("db"):null; }catch(e){ db=null; }
  if(!db&&!loaded) setState("Example map · saves stay in this browser");
})();
})();
