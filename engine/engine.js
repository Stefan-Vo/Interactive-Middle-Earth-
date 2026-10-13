(function(){
"use strict";
if(!window.THREE || !THREE.MapControls){ return fail("The 3D library didn't load. Check your connection and reload the page."); }
if(!window.CITY){ return fail("No city data was loaded."); }
if(!(window.STYLES&&window.STYLES[window.CITY.style])){ return fail("The building style \""+window.CITY.style+"\" was not loaded."); }

const CITY=window.CITY;                       // set by cities/<id>/city.js
const STYLE=window.STYLES[CITY.style];        // how this culture builds (styles/<style>.js)
/* ---------- helpers ---------- */
const H = CITY.terrain.height;                // height of the summit the city stands on
const DEG = Math.PI/180;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rand = mulberry32(CITY.seed);   // the same seed always lays out the same city
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const angDist=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
const bearingOf=(x,z)=>(Math.atan2(x,-z)/DEG+360)%360;
// compass bearing (0 = north, clockwise) + radius -> world position. North is -z.
function P(b,r,y){ return new THREE.Vector3(r*Math.sin(b*DEG), y===undefined?H:y, -r*Math.cos(b*DEG)); }
// irregular outline of the leveled summit
function edgeR(b){ const t=b*DEG, S=CITY.terrain.summit; let v=1; for(const [n,amp,ph] of S.waves) v+=amp*Math.sin(n*t+ph); return S.radius*v; }
const CAM=CITY.camera||{};
const SCALE=CAM.scale||CITY.terrain.summit.radius/172;   // camera, shadows and limits were tuned on a summit of radius 172
const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:new THREE.Color(c)},o||{}));
const UNIT_BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);
const PYRAMID=new THREE.ConeGeometry(Math.SQRT1_2,1,4).rotateY(Math.PI/4).translate(0,.5,0);
const CYL=new THREE.CylinderGeometry(1,1,1,12).translate(0,.5,0);
const CONE=new THREE.ConeGeometry(1,1,12).translate(0,.5,0);
const BLOB=new THREE.IcosahedronGeometry(1,0);
const _e=new THREE.Euler(), _q=new THREE.Quaternion();
function M(x,y,z,yaw,sx,sy,sz){ _e.set(0,yaw,0); _q.setFromEuler(_e); return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone(),new THREE.Vector3(sx,sy,sz)); }
function fail(msg){ const d=document.createElement("div"); d.id="fallback"; d.textContent=msg; document.getElementById("scene").appendChild(d); }

/* ---------- the city's data (cities/<id>/city.js) ---------- */
const GATE_B=CITY.gate.bearing;                 // the bearing of the outer gate (0 = north, clockwise)
const edgeS=edgeR(GATE_B);
// E: what a city's data and landmark builders can use. It grows as the engine builds the scene.
const E={THREE,H,DEG,P,edgeR,edgeS,smooth,angDist,bearingOf,lam,UNIT_BOX,PYRAMID,CYL,CONE,BLOB,M,GATE_B};
const HOUSES=CITY.districts;
HOUSES.forEach(h=>{ h.span=((h.sector[1]-h.sector[0])+360)%360||360; h.center=(h.sector[0]+h.span/2)%360; });
const PLACES=CITY.places(E);
HOUSES.forEach(h=>{
  const pos=P(h.hall[0],h.hall[1]);
  PLACES[h.id]={name:h.name,kicker:CITY.text.districtKicker,alt:null,lord:h.lord,heraldry:h.heraldry,color:h.color,
    desc:h.desc,fall:h.fall,src:h.src,pos,zoom:150,ring:13,label:pos.clone().setY(H+17),tier:2,house:true};
});
// a link back to the world map, if the city is on one: in the panel, and as a button floating at the top of the map
if(CITY.worldUrl){ const label=CITY.worldLabel||"the world map";
  const link=(cls,text)=>{ const a=document.createElement("a"); a.className=cls; a.href=CITY.worldUrl; a.target="_blank"; a.rel="noopener"; a.textContent=text; return a; };
  const bt=document.querySelector(".brand-text"); if(bt) bt.appendChild(link("worldlink","← Back to "+label.charAt(0).toLowerCase()+label.slice(1)));
  document.getElementById("app").appendChild(link("worldback panel","← Back to "+label.charAt(0).toLowerCase()+label.slice(1))); }
const GROUPS=CITY.groups.map(([title,ids])=>[title,ids==="@districts"?HOUSES.map(h=>h.id):ids]);
for(const id in PLACES){ PLACES[id].id=id; PLACES[id].mats=[]; }
Object.assign(E,{PLACES,HOUSES});

/* ---------- renderer, camera, controls ---------- */
const host=document.getElementById("scene");
let renderer;
try{ renderer=new THREE.WebGLRenderer({antialias:true}); }catch(err){ return fail("This browser couldn't start WebGL, so the 3D map can't be shown."); }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;    // the sun never moves: redraw shadows only when something changes
const shadowsDirty=()=>{ renderer.shadowMap.needsUpdate=true; };
host.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const SKY=new THREE.Color((CITY.look&&CITY.look.sky)||"#bcd3e2");
scene.background=SKY; scene.fog=new THREE.Fog(SKY,1500*SCALE,3600*SCALE);
// Narrow lens + fixed tilt, angled like a city-builder game; close to isometric
const camera=new THREE.PerspectiveCamera(24,1,1,8000);
const TILT=0.8, ZK=1.85; // TILT = angle from straight down (rad); ZK scales framing distances for the narrow lens
const controls=new THREE.MapControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=0.09;
controls.minDistance=8; controls.maxDistance=1600*SCALE;
controls.minPolarAngle=.2; controls.maxPolarAngle=1.5;   // right-drag tilts from nearly straight down to nearly level (TILT is the default view)
const EYE_PHI=1.36, FOG0=[scene.fog.near,scene.fog.far], FOG_LOW=[Math.min(FOG0[0],1300),Math.min(FOG0[1],3200)];   // looking level, the fog closes in before the land ends
controls.zoomSpeed=1.1; controls.screenSpacePanning=false;
const HOME={target:CAM.target?new THREE.Vector3(CAM.target[0],CAM.target[1],CAM.target[2]):new THREE.Vector3(0,H,6),dist:CAM.dist||960*SCALE,phi:TILT,theta:(180-(CAM.from!==undefined?CAM.from:135))*DEG};   // CAM.from: the compass bearing the camera looks from (135 = south-east)
camera.position.setFromSpherical(new THREE.Spherical(HOME.dist,HOME.phi,HOME.theta)).add(HOME.target);
controls.target.copy(HOME.target); controls.update();
function resize(){ const w=host.clientWidth||1,h=host.clientHeight||1; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(host); resize();

/* ---------- light ---------- */
scene.add(new THREE.HemisphereLight(0xe4eef6,0x6d7d58,0.62));
scene.add(new THREE.AmbientLight(0x48505a,0.18));
const sun=new THREE.DirectionalLight(0xfff1da,0.8);
sun.position.set(-230,400,200); sun.target.position.set(0,H,0);
sun.castShadow=true; sun.shadow.mapSize.set(4096,4096);
Object.assign(sun.shadow.camera,{left:-270*SCALE,right:270*SCALE,top:270*SCALE,bottom:-270*SCALE,near:10,far:1100*SCALE});
sun.shadow.bias=-0.0006; sun.shadow.normalBias=0.3;
scene.add(sun,sun.target);

/* ---------- the plain around the hill, and a ring of mountains ---------- */
let groundMesh, hillMesh;   // kept for finding where the builder places things
const SHAPE=CITY.terrain.shape, MT=CITY.terrain.mountains, PF=CITY.terrain.plainFrom||300*SCALE;
const SHELVES=CITY.terrain.shelves||[], WAT=CITY.terrain.water;   // terrain recipes: shelves cut level; water carved below its level
function segDist(x,z,pts){ let best=1e9, f=0;   // distance from a point to a polyline, and how far along it (0..1)
  for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], dx=bx-ax, dz=bz-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)), d=Math.hypot(x-ax-dx*t,z-az-dz*t);
    if(d<best){ best=d; f=(i+t)/(pts.length-1); } }
  return [best,f]; }
function wetness(x,z){ let w=0;   // 0 dry .. 1 under water
  for(const r of WAT.rivers||[]){ const [d,f]=segDist(x,z,r.points), [w0,w1]=r.width||[10,10], hw=(w0+(w1-w0)*f)/2; w=Math.max(w,smooth(hw+6,hw,d)); }
  for(const p of WAT.pools||[]) w=Math.max(w,smooth(p.r+6,p.r,Math.hypot(x-p.x,z-p.z)));
  if(WAT.carve) w=Math.max(w,WAT.carve(x,z));
  return w; }
// the height of the land around the hill at any point: the ring of mountains, the rolling plain, the city's own shape(x,z),
// then any shelves cut level and any water carved out
function landH(x,z){
  const d=Math.hypot(x,z), a=Math.atan2(z,x);
  const m=smooth(MT.from,MT.to,d)*(MT.height+60*Math.sin(a*7+1)+40*Math.sin(a*13+d*0.012)+30*Math.sin(x*0.013)*Math.cos(z*0.011));
  const u=smooth(PF,PF+90*SCALE,d)*(1.1*Math.sin(x*0.018)*Math.cos(z*0.021)+0.7*Math.sin((x+z)*0.009));
  let y=Math.max(0,m)+u+(SHAPE?SHAPE(x,z):0);
  for(const s of SHELVES) y+=(s.y-y)*smooth(s.r+(s.side||10),s.r,Math.hypot(x-s.x,z-s.z));
  if(WAT){ const w=wetness(x,z); if(w>0) y+=((WAT.bed??WAT.level-4.4)-y)*w; }
  return y;
}
(function ground(){
  // a polar grid: rings as fine as terrain.detail out to terrain.fine, then each ring a little wider, out past the old square's corners
  const TINT=CITY.terrain.tint, s0=4800/(CITY.terrain.detail||260), RF=CITY.terrain.fine||Math.max(600,1200*SCALE), RMAX=3400;
  const radii=[]; for(let r=s0,dr=s0;r<RMAX+dr;r+=dr){ radii.push(Math.min(r,RMAX)); if(r>RF) dr*=1.045; if(r>=RMAX) break; }
  const SEG=Math.max(96,Math.min(1440,Math.round(2*Math.PI*RF/s0))), NV=1+radii.length*SEG;
  const pos=new Float32Array(NV*3), col=new Float32Array(NV*3), c=new THREE.Color();
  const gA=new THREE.Color("#8aa763"), gB=new THREE.Color("#6c8d4c"), rock=new THREE.Color("#8a877e"), snow=new THREE.Color("#f1f4f6");
  const put=(i,x,z)=>{ const y=landH(x,z); pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    const n=0.5+0.5*Math.sin(x*0.045+2*Math.cos(z*0.038))*Math.cos(z*0.02-x*0.01);
    c.copy(gA).lerp(gB,n); c.lerp(rock,smooth(30,85,y)); c.lerp(snow,smooth(150,195,y));
    if(TINT) TINT(x,z,y,c);                                                  // a city can recolor its land (a burned plain, a desert)
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; };
  put(0,0,0);
  radii.forEach((r,ri)=>{ for(let j=0;j<SEG;j++){ const a=(j+(ri%2)*.5)/SEG*Math.PI*2; put(1+ri*SEG+j,Math.cos(a)*r,Math.sin(a)*r); } });
  const idx=[];
  for(let j=0;j<SEG;j++) idx.push(0,1+(j+1)%SEG,1+j);
  for(let ri=0;ri<radii.length-1;ri++){ const A=1+ri*SEG, B=A+SEG;
    for(let j=0;j<SEG;j++){ const j1=(j+1)%SEG; idx.push(A+j,A+j1,B+j, A+j1,B+j1,B+j); } }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("color",new THREE.BufferAttribute(col,3));
  g.setIndex(idx); g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));
  mesh.receiveShadow=true; scene.add(mesh); groundMesh=mesh;
})();

/* ---------- the hill: flat summit, sheer sides ---------- */
// the hill's profile: [radius as a fraction of the summit edge, height as a fraction of H]
const RINGS=CITY.terrain.profile||[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.015,.93],[1.05,.64],[1.1,.34],[1.18,.15],[1.28,.05],[1.42,0]];
function cliffCalm(b){ return smooth(8,20,angDist(b,GATE_B)); } // keep the slope smooth where the stair climbs
const ROUGH=CITY.terrain.rough??1;                                 // 0: a smooth grassy slope instead of broken rock
function cliffJit(b,i){ return 1+ROUGH*cliffCalm(b)*(0.035*Math.sin(b*0.9+i*1.7)+0.02*Math.sin(b*2.3+i*0.6)); }
(function hill(){
  const SEG=288, R=RINGS.length, pos=new Float32Array(R*SEG*3), col=new Float32Array(R*SEG*3), c=new THREE.Color();
  const HC=Object.assign({top:"#dad5c8",topB:"#cfc9ba",rock1:"#a29d92",rock2:"#6f6b64",base:"#7f9c5b"},CITY.terrain.colors||{});
  const top=new THREE.Color(HC.top), topB=new THREE.Color(HC.topB), rk1=new THREE.Color(HC.rock1), rk2=new THREE.Color(HC.rock2), grass=new THREE.Color(HC.base);
  for(let i=0;i<R;i++) for(let j=0;j<SEG;j++){
    const b=j/SEG*360, f=RINGS[i][0], e=edgeR(b);
    const r=e*f*(f>1?cliffJit(b,i):1);
    let y=H*RINGS[i][1]; if(f>1&&i<R-1) y+=ROUGH*cliffCalm(b)*1.2*Math.sin(b*3.1+i); if(i===R-1) y=0.03;
    const k=(i*SEG+j)*3, q=P(b,r,y);
    pos[k]=q.x; pos[k+1]=q.y; pos[k+2]=q.z;
    if(f<=1) c.copy(top).lerp(topB,0.5+0.5*Math.sin(b*0.4+f*9));
    else if(i<R-2) c.copy(rk1).lerp(rk2,(i-6)/4+0.15*Math.sin(b*1.7));
    else c.copy(rk2).lerp(grass,i===R-1?1:0.55);
    col[k]=c.r; col[k+1]=c.g; col[k+2]=c.b;
  }
  const idx=[];
  for(let i=0;i<R-1;i++) for(let j=0;j<SEG;j++){
    const a=i*SEG+j, b2=i*SEG+(j+1)%SEG, c2=(i+1)*SEG+j, d=(i+1)*SEG+(j+1)%SEG;
    idx.push(a,b2,c2, b2,d,c2);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.BufferAttribute(pos,3));
  g.setAttribute("color",new THREE.BufferAttribute(col,3));
  g.setIndex(idx); g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));
  mesh.receiveShadow=true; mesh.castShadow=true; scene.add(mesh); hillMesh=mesh;
  if(CITY.terrain.flat) mesh.visible=false;   // terrain.flat: a town on level ground; the hill is kept only for finding the ground
})();

/* ---------- walled levels: the summit rises in rings toward the center ---------- */
// CITY.levels.radii are the walls between levels; each ring inside a wall stands one level higher.
// A stair climbs each wall wherever an avenue crosses it.
const LV=CITY.levels||{height:0,radii:[],ramp:12};
const LVL=LV.height, RAMP=LV.ramp, LEVEL_R=[...LV.radii].sort((a,b)=>a-b);
const R1=LEVEL_R.length?LEVEL_R[0]:0;                                // the innermost level
function groundY(r){ let n=0; for(const R of LEVEL_R) if(r<R) n++; return H+n*LVL; }   // for points on the summit
const levelOff=(x,z)=>groundY(Math.hypot(x,z))-H;
const WALLS=LEVEL_R.map(R=>({R,yUp:groundY(R-1e-6),yLow:groundY(R+1e-6)}));
// height along an avenue, including the stairs that run down the outside of each wall
function streetY(r){ for(const w of WALLS) if(r>=w.R&&r<=w.R+RAMP) return w.yUp-(r-w.R)/RAMP*(w.yUp-w.yLow); return groundY(r); }
const TIERS=[];
(function tiers(){
  const top=lam(STYLE.palette.tier);
  [...LEVEL_R].reverse().map(R=>[R,groundY(R+1e-6),LVL]).forEach(([R,y,h])=>{
    const m=new THREE.Mesh(new THREE.CylinderGeometry(R,R,h,240).translate(0,h/2,0),top);
    m.position.y=y; m.receiveShadow=true; m.castShadow=true; scene.add(m); m.updateMatrixWorld(); TIERS.push(m);
  });
})();
// the height of the ground (hill, levels or plain) at a point
// It is worked out from the same shapes the meshes are built from, which is thousands of times faster than casting a ray
// at the terrain (the hill's small wobbles are ignored). surfaceYExact casts the ray, for the rare case that needs it.
const _down=new THREE.Raycaster(), _dn=new THREE.Vector3(0,-1,0), _from=new THREE.Vector3();
function surfaceYExact(x,z){ _down.set(_from.set(x,2000,z),_dn); const h=_down.intersectObjects([hillMesh,groundMesh,...TIERS],false)[0]; return h?h.point.y:0; }
const RLAST=RINGS[RINGS.length-1][0];
function hillY(x,z){
  const r=Math.hypot(x,z), e=edgeR(bearingOf(x,z)), f=r/e;
  if(f<=1) return groundY(r);
  if(f>=RLAST) return -Infinity;
  for(let i=0;i<RINGS.length-1;i++) if(f<=RINGS[i+1][0]){ const [f0,y0]=RINGS[i], [f1,y1]=RINGS[i+1], t=(f-f0)/(f1-f0); return H*(y0+(y1-y0)*t); }
  return -Infinity;
}
function surfaceY(x,z){ return Math.max(hillY(x,z),landH(x,z)); }

/* ---------- picking registry ---------- */
const pickables=[], INST=[];
// A landmark built from hundreds of boxes and cones would cost one draw call per piece (two with shadows). Pieces that share
// a material are baked into a single mesh, so the GPU draws each material once. See-through materials are left alone (they
// must be sorted one by one), and so is anything marked userData.keep.
const _inv=new THREE.Matrix4(), _rel=new THREE.Matrix4();
function compact(obj){
  obj.updateMatrixWorld(true); _inv.copy(obj.matrixWorld).invert();
  const byMat=new Map();
  obj.traverse(o=>{ if(o===obj||!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.transparent||o.userData.keep||!o.geometry.attributes.position) return;
    (byMat.get(o.material)||byMat.set(o.material,[]).get(o.material)).push(o); });
  byMat.forEach((list,mat)=>{ if(list.length<2) return;
    let n=0;
    const parts=list.map(o=>{ _rel.multiplyMatrices(_inv,o.matrixWorld); const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      g.applyMatrix4(_rel); if(!g.attributes.normal) g.computeVertexNormals();
      if(_rel.determinant()<0){ for(const att of [g.attributes.position,g.attributes.normal]){ const a=att.array;   // a mirrored piece: keep its faces facing out
        for(let i=0;i<att.count;i+=3) for(let k=0;k<3;k++){ const t=a[(i+1)*3+k]; a[(i+1)*3+k]=a[(i+2)*3+k]; a[(i+2)*3+k]=t; } } }
      n+=g.attributes.position.count; return g; });
    const pos=new Float32Array(n*3), nor=new Float32Array(n*3); let k=0;
    parts.forEach(g=>{ pos.set(g.attributes.position.array,k*3); nor.set(g.attributes.normal.array,k*3); k+=g.attributes.position.count; g.dispose(); });
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("normal",new THREE.BufferAttribute(nor,3));
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    list.forEach(o=>o.parent.remove(o));
    obj.add(new THREE.Mesh(geo,mat)); });
}
function own(id,obj){
  compact(obj);
  obj.traverse(o=>{ o.userData.placeId=id; if(o.isMesh){ o.castShadow=true; o.receiveShadow=true;
    (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ if(m.emissive&&!PLACES[id].mats.includes(m)){ m.userData.em=m.emissive.clone(); PLACES[id].mats.push(m);} }); } });
  pickables.push(obj); scene.add(obj); return obj;
}
function instanced(geo,mat,items,shadow){
  if(!items.length) return null;
  const m=new THREE.InstancedMesh(geo,mat,items.length), base=[];
  items.forEach((it,i)=>{ m.setMatrixAt(i,it.m); const c=new THREE.Color(it.c); m.setColorAt(i,c); base.push(c); });
  m.instanceMatrix.needsUpdate=true; m.instanceColor.needsUpdate=true;
  m.castShadow=shadow!==false; m.receiveShadow=true; m.frustumCulled=false;
  m.userData.owners=items.map(it=>it.o);
  m.userData.lots=items.map(it=>it.l||null); m.userData.mats=items.map(it=>it.m);
  scene.add(m); pickables.push(m); INST.push({mesh:m,base}); return m;
}
const paveMat=(c,o)=>lam(c,{polygonOffset:true,polygonOffsetFactor:-(o||1),polygonOffsetUnits:-(o||1)});
function flat(geo,mat,y){ const m=new THREE.Mesh(geo,mat); m.position.y=y; m.receiveShadow=true; return m; }

/* ---------- streets ---------- */
// ring roads [radius, width]; avenues run out from r0 to the outer wall. "main" avenues are the great ones.
const RING_ROADS=CITY.streets.rings;
const AVENUES=CITY.streets.avenues.map(a=>Object.assign({},a));
(function streets(){
  const g=new THREE.Group();
  const stone=paveMat(STYLE.palette.paving,2);
  RING_ROADS.forEach(([r,w])=>{ const ring=new THREE.RingGeometry(r-w/2,r+w/2,220); ring.rotateX(-Math.PI/2); g.add(flat(ring,stone,groundY(r)+0.02)); });
  AVENUES.forEach(({b,r0,w})=>{
    // one stretch of paving per level; the stairs below each wall are built with the walls
    const cuts=[]; let s0=r0; LEVEL_R.forEach(R=>{ if(R>s0){ cuts.push([s0,R]); s0=R+RAMP; } }); cuts.push([s0,edgeR(b)-2]);
    cuts.forEach(([s0,s1])=>{
      const len=s1-s0; if(len<1) return;
      const geo=new THREE.PlaneGeometry(w,len); geo.rotateX(-Math.PI/2);
      const y=groundY((s0+s1)/2)+0.02, m=flat(geo,stone,y), mid=P(b,(s0+s1)/2,y);
      m.position.set(mid.x,mid.y,mid.z); m.rotation.y=-b*DEG; g.add(m);
    });
  });
  scene.add(g);
})();

/* ---------- shapes and helpers for landmarks ---------- */
const OCT=new THREE.CylinderGeometry(1,1,1,8).rotateY(Math.PI/8).translate(0,.5,0);
const octTaper=top=>new THREE.CylinderGeometry(top,1,1,8).rotateY(Math.PI/8).translate(0,.5,0);
const HDOME=new THREE.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2);
const GABLE=new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-.5,0),new THREE.Vector2(.5,0),new THREE.Vector2(0,1)]),{depth:1,bevelEnabled:false}).translate(0,0,-.5);
const DISC=new THREE.CylinderGeometry(1,1,1,56).translate(0,.5,0);
const CURTAIN=new THREE.CylinderGeometry(1,1,1,40,1,true).translate(0,.5,0);
const BASIN=new THREE.CylinderGeometry(1,.42,1,32).translate(0,.5,0);
const BALL=new THREE.SphereGeometry(1,16,10);
const UP=new THREE.Vector3(0,1,0);
function adder(g){ return (geo,mat,x,y,z,sx,sy,sz,ry)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); if(ry) m.rotation.y=ry; g.add(m); return m; }; }
const waterMat=()=>lam("#4f9fcf",{emissive:new THREE.Color("#163e58")});
const curtainMat=new THREE.MeshLambertMaterial({color:0xdff1ff,transparent:true,opacity:.36,side:THREE.DoubleSide,depthWrite:false});
const sprayMat=new THREE.MeshLambertMaterial({color:0xeaf6ff,transparent:true,opacity:.55,depthWrite:false});
const goldMat=()=>lam("#d8b34a",{emissive:new THREE.Color("#2a1e04")});
function glowSprite(rgba,size){
  const c=document.createElement("canvas"); c.width=c.height=128;
  const x=c.getContext("2d"), gr=x.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,rgba); gr.addColorStop(1,"rgba(0,0,0,0)"); x.fillStyle=gr; x.fillRect(0,0,128,128);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  s.scale.set(size,size,1); s.raycast=()=>{};   // a glow is not something to click
  return s;
}
// a ring of boxes standing on the edges of an octagon (for basins and balconies with a hollow middle)
const WATER=[], LANTERNS=[], REVEALS=[];
const CITY_POI={homes:[],gardens:[],fountains:[],plazas:[]};   // places people use in their daily routines
function addWater(m){ WATER.push(m); return m; }                     // water that shimmers
function addLantern(mesh,x,z){ LANTERNS.push({mesh,x,z}); }        // a lantern the lamplighters light
function reveal(id,obj){ obj.visible=false; REVEALS.push({id,obj}); } // shown only while that place is selected
const addHome=(x,z)=>CITY_POI.homes.push({x,z,l:null});              // somewhere people sleep (a cave, a barracks...)
const addFountainPOI=(x,z)=>CITY_POI.fountains.push({x,z});           // somewhere people fetch water
const addGardenPOI=(x,z,R)=>CITY_POI.gardens.push({x,z,R});
function octWall(add,mat,cx,y,cz,R,h,t){
  const side=2*R*Math.sin(Math.PI/8)+t*.4, ap=R*Math.cos(Math.PI/8);
  for(let k=0;k<8;k++){ const a=k*Math.PI/4; add(UNIT_BOX,mat,cx+Math.cos(a)*ap,y,cz+Math.sin(a)*ap,side,h,t,-(a+Math.PI/2)); }
}

Object.assign(E,{scene,own,instanced,paveMat,flat,groundY,levelOff,LVL,LEVEL_R,WALLS,streetY,RING_ROADS,AVENUES,cliffJit,RAMP,R1,surfaceY,surfaceYExact,landH,STYLE,
  V:(x,z)=>new THREE.Vector3(x,groundY(Math.hypot(x,z)),z),
  OCT,octTaper,HDOME,GABLE,DISC,CURTAIN,BASIN,BALL,UP,adder,waterMat,curtainMat,sprayMat,goldMat,glowSprite,octWall,addWater,addLantern,reveal,
  addHome,addFountainPOI,addGardenPOI,CITY});
Object.assign(E,{CITY},window.CITYMAKER_RECIPES?window.CITYMAKER_RECIPES(E):{});   // landmark recipes (engine/recipes.js)
if(E.initRecipes) E.initRecipes();
/* ---------- the city's own landmarks (defined in its city.js) ---------- */
CITY.landmarks(E);

/* ---------- the hall of each district (drawn by the style) ---------- */
function makeHall(h){ return STYLE.hall(h,E); }
HOUSES.forEach(h=>own(h.id,makeHall(h)));

/* ---------- the outer wall and gate, and the walls between levels (drawn by the style) ---------- */
if(CITY.walls!==false) STYLE.outerWall(E);   // walls:false: an open town, no wall round the summit
STYLE.levelWalls(E);

/* ---------- the city's buildings, gardens and towers ---------- */
// Buildings stand shoulder to shoulder in curved rows that follow the walls; rows come in back-to-back
// pairs with a narrow lane between pairs, broken by alleys, small gardens and the odd tower.
(function city(){
  const occ=[];
  const reserve=(x,z,r)=>occ.push({x,z,r});
  const free=(x,z,r)=>{ for(let i=0;i<occ.length;i++){ const o=occ[i], dx=o.x-x, dz=o.z-z, rr=o.r+r; if(dx*dx+dz*dz<rr*rr) return false; } return true; };
  const onStreet=(x,z,r)=>{
    const rr=Math.hypot(x,z);
    for(const [rad,w] of RING_ROADS) if(Math.abs(rr-rad)<w/2+r+0.3) return true;
    for(const W of WALLS) if(Math.abs(rr-W.R)<2.4+r) return true;
    const b=bearingOf(x,z);
    for(const a of AVENUES){ if(rr<a.r0-r) continue; const d=angDist(b,a.b); if(d<90&&rr*Math.sin(d*DEG)<a.w/2+r+0.3) return true; }
    return false;
  };
  const houseAt=b=>HOUSES.find(h=>angDist(b,h.center)<=h.span/2)||HOUSES[0];
  CITY.reserves(E).forEach(a=>reserve(...a));              // ground the city's landmarks need kept clear
  HOUSES.forEach(h=>{ const q=P(h.hall[0],h.hall[1]); reserve(q.x,q.z,h.motif==="low"?12:11.5); if(h.motif==="pool"||h.motif==="arch"){ const f=P(h.hall[0],h.hall[1]-11); reserve(f.x,f.z,6);} if(h.motif==="tree"){ const t=P(h.hall[0]+6,h.hall[1]-1); reserve(t.x,t.z,6);} });
  { const q=P(GATE_B,edgeS-8); reserve(q.x,q.z,12); }
  // instanced shapes the style draws into: the standard ones, then any extra the style declares
  const B={bodies:[],roofs:[],towers:[],caps:[],trees:[],cyl:[],box:[],water:[],jets:[],cones:[]};
  const EXTRA=(STYLE.buckets||[]).map(bk=>{ B[bk.name]=[]; return bk; });
  const ALL=Object.keys(B).map(k=>B[k]); let LOTN=0;
  // every lot (a house, a garden, a fountain...) gets a key so the sandbox can demolish it as one piece.
  // keys start with "T" for the terraced city, so demolitions saved from the flat city no longer match anything
  function lot(fn){ const lens=ALL.map(a=>a.length); fn(); const key="T"+(LOTN++); ALL.forEach((a,i)=>{ for(let j=lens[i];j<a.length;j++) a[j].l=key; }); }
  Object.assign(B,{THREE,M,H,P,DEG,rand,HOUSES,poi:CITY_POI,pick:a=>a[Math.floor(rand()*a.length)],tangentYaw:a=>-(a+Math.PI/2)});
  const S=STYLE.pieces(B,E);
  // fountain squares where avenues meet the ring roads
  AVENUES.forEach(a=>RING_ROADS.forEach(([rad])=>{
    if(a.r0>rad+1) return;
    const q=P(a.b,rad), o=houseAt(a.b).id, main=!!a.main, PR=main?8.5:6.4;
    CITY_POI.plazas.push({b:a.b,R:rad,PR});
    lot(()=>S.plaza(q,PR,main,a,o));
    reserve(q.x,q.z,PR+.4);
  }));
  // avenue dressing: street trees along the great avenues; statues, banners and a water channel on the way from the gate
  AVENUES.filter(a=>a.main).forEach(a=>{
    const e=edgeR(a.b)-12, tx=Math.cos(a.b*DEG), tz=Math.sin(a.b*DEG), off=a.w/2+1.3, o=houseAt(a.b).id;
    let k=0;
    for(let r=34;r<e;r+=a.b===GATE_B?10:8.5,k++){
      if(RING_ROADS.some(([rad])=>Math.abs(r-rad)<10)||WALLS.some(W=>r>W.R-6&&r<W.R+RAMP+4)) continue;
      const q=P(a.b,r);
      for(const side of [-1,1]){
        const x=q.x+tx*off*side, z=q.z+tz*off*side;
        lot(()=>S.avenueDecor({x,z,tx,tz,side,k,a,isGate:a.b===GATE_B,o}));
        reserve(x,z,a.b===GATE_B?1.8:1.4);
      }
    }
  });
  if(CITY.gate.channel){ // a channel of running water down the gate avenue, with basins along it
    const o=houseAt(GATE_B).id, stretches=[]; let s0=CITY.gate.channelFrom||30;
    LEVEL_R.forEach(R=>{ stretches.push([s0,R-4]); s0=R+RAMP+2; }); stretches.push([s0,edgeS-10]);
    // one stretch of channel per level (unit cylinders stretched long and thin), each with a basin
    stretches.forEach(([a,b])=>{ if(b-a<4) return;
      const c=P(GATE_B,(a+b)/2); B.water.push({m:M(c.x,H+.05,c.z,-GATE_B*DEG,1.3,.14,(b-a)/2),c:"#5aa8d6",o});
      const mid=(a+b)/2, f=P(GATE_B,RING_ROADS.every(([rr])=>Math.abs(mid-rr)>10)?mid:a+(b-a)*.25); S.fountain(f.x,f.z,1.7,o); });
  }
  // statues around the central square
  (CITY.squareStatues||[]).forEach(([b,r,owner])=>{ const q=P(b,r); lot(()=>S.statue(q.x,q.z,-b*DEG,owner)); });
  // courtyards and gardens in every district
  const FILL=CITY.fill||{};
  if(FILL.yards!==false) HOUSES.forEach(h=>{
    let c=0, g=0; const Y=Object.assign({},STYLE.yards,typeof FILL.yards==="object"?FILL.yards:{});   // fill.yards can change the style's counts for one city
    for(let t=0;t<600&&(c<Y.courts||g<Y.gardens);t++){
      const b=(h.sector[0]+rand()*h.span)%360, e=edgeR(b)-12, r=36+rand()*(e-36), q=P(b,r);
      const isGarden=g<Y.gardens&&(c>=Y.courts||rand()<Y.gardenChance), R=isGarden?Y.gardenR[0]+rand()*Y.gardenR[1]:Y.courtR[0]+rand()*Y.courtR[1];
      if(r+R>e+5||onStreet(q.x,q.z,R)||!free(q.x,q.z,R+1.8)) continue;
      reserve(q.x,q.z,R+.5);
      lot(()=>isGarden?S.garden(q.x,q.z,R,h.id):S.courtyard(q.x,q.z,R,h.id)); if(isGarden) g++; else c++;
    }
  });
  // rows of houses: the style sets their size and spacing
  const RW=STYLE.rows, ROW=RW.depth, LANE=RW.lane, rows=[];
  const ROWS_TO=Math.max(215,CITY.terrain.summit.radius*1.25);   // 215 on a summit of 172 or less, as it always was
  for(let r=RW.start;r<ROWS_TO;r+=ROW*2+LANE){ rows.push(r+ROW/2, r+ROW*1.5); }
  if(FILL.rows!==false) rows.forEach(rc=>{
    const circ=Math.PI*2*rc; let sArc=rand()*5;
    while(sArc<circ){
      const w=RW.w[0]+rand()*RW.w[1]; let gap=(RW.gap[0]+rand()*RW.gap[1])*(FILL.gap||1); if(rand()<RW.alley[0]) gap+=RW.alley[1];   // occasional alley; fill.gap spaces a city's houses out
      const b=((sArc+w/2)/rc/DEG)%360; sArc+=w+gap;
      const e=edgeR(b)-6.5, q=P(b,rc), yaw=-b*DEG, h=houseAt(b), hc=new THREE.Color(h.color);
      const d=ROW-RW.cut[0]-rand()*RW.cut[1], rad=0.5*Math.hypot(w,d);
      if(rc+d/2>e||onStreet(q.x,q.z,Math.min(w,d)/2+0.2)||!free(q.x,q.z,rad)) continue;
      const kind=rand();
      lot(()=>S.lot({q,b,w,d,rc,e,yaw,h,hc,kind}));
    }
  });
  // lift everything onto the level it stands on
  ALL.forEach(arr=>arr.forEach(it=>{ const e=it.m.elements; e[13]+=levelOff(e[12],e[14]); }));
  B.bodies.forEach(it=>{ if(it.l) CITY_POI.homes.push({x:it.m.elements[12],z:it.m.elements[14],l:it.l}); });
  // settlements: loose clusters (around a green) or rows (along a shore or road) of the style's own houses, out on the
  // land around the hill. CITY.settlements(E) lists them; they stand on the ground, not on the hill's levels.
  const lens0=ALL.map(a=>a.length);
  (CITY.settlements?CITY.settlements(E):[]).forEach(st=>{
    const hh=HOUSES[st.district||0], h=Object.assign({},hh,{id:st.owner||hh.id}), hc=new THREE.Color(st.color||hh.color);
    const W=st.w||RW.w, D=st.d||[ROW-RW.cut[0]-RW.cut[1],RW.cut[1]], gap=st.spacing??3, spots=[];
    const ok=(x,z,r)=>spots.every(p=>Math.hypot(p.x-x,p.z-z)>p.r+r+gap)&&!(st.avoid&&st.avoid(x,z))&&(!WAT||surfaceY(x,z)>WAT.level+.8);
    const put=(x,z,bl,w,d)=>{ spots.push({x,z,r:Math.hypot(w,d)/2}); lot(()=>S.lot({q:new THREE.Vector3(x,H,z),b:bl,w,d,rc:100,e:100,yaw:-bl*DEG,h,hc,kind:rand()})); };
    if(st.along){ // rows along a line, set back by offset on one side (side: 1 or -1), facing the line
      const pts=st.along, rows=st.rows||1;
      for(let row=0;row<rows;row++) for(let i=0;i<pts.length-1;i++){
        const [ax,az]=pts[i], [bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az), ux=(bx-ax)/L, uz=(bz-az)/L, nx=-uz*(st.side||1), nz=ux*(st.side||1);
        const bl=(Math.atan2(-nx,nz)/DEG+360)%360;                                   // the bearing the house faces: back toward the line
        for(let t=rand()*4;t<L;){ const w=W[0]+rand()*W[1], d=D[0]+rand()*D[1], off=(st.offset||8)+row*(st.rowGap||12)+d/2+(rand()-.5)*2;
          const x=ax+ux*(t+w/2)+nx*off, z=az+uz*(t+w/2)+nz*off;
          if(t+w<=L&&ok(x,z,Math.min(w,d)/2)) put(x,z,bl,w,d);
          t+=w+gap*(.5+rand()); } }
    } else {      // a cluster: houses scattered between clear and r around a green at c, facing it
      const [cx,cz]=st.c, R=st.r||40, clear=st.clear??8, N=st.n||12;
      for(let t=0,n=0;t<N*30&&n<N;t++){
        const a=rand()*Math.PI*2, r=clear+Math.sqrt(rand())*(R-clear), x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r, w=W[0]+rand()*W[1], d=D[0]+rand()*D[1];
        if(!ok(x,z,Math.hypot(w,d)/2)) continue;
        put(x,z,(Math.atan2(x-cx,-(z-cz))/DEG+360+(rand()-.5)*24)%360,w,d); n++; }
      if(st.well!==false&&S.fountain){ lot(()=>S.fountain(cx,cz,1.5,h.id)); CITY_POI.fountains.push({x:cx,z:cz}); }
      if(st.green!==false) CITY_POI.gardens.push({x:cx,z:cz,R:Math.max(4,clear-2)});
    }
  });
  ALL.forEach((arr,i)=>{ for(let j=lens0[i];j<arr.length;j++){ const e=arr[j].m.elements; e[13]+=surfaceY(e[12],e[14])-H-.15; } });
  for(let j=lens0[0];j<B.bodies.length;j++){ const it=B.bodies[j]; if(it.l) CITY_POI.homes.push({x:it.m.elements[12],z:it.m.elements[14],l:it.l}); }   // people live out there too
  instanced(UNIT_BOX,lam("#ffffff"),B.bodies);
  instanced(PYRAMID,lam("#ffffff"),B.roofs);
  instanced(CYL,lam("#ffffff"),B.towers);
  instanced(CONE,lam("#ffffff"),B.caps);
  instanced(BLOB,new THREE.MeshPhongMaterial({color:0xffffff,flatShading:true,shininess:4}),B.trees);
  instanced(CYL,lam("#ffffff"),B.cyl);
  instanced(UNIT_BOX,lam("#ffffff"),B.box);
  instanced(CONE,lam("#ffffff"),B.cones);
  const waterMesh=instanced(CYL,lam("#ffffff",{emissive:new THREE.Color("#123a55")}),B.water,false);
  instanced(CONE,new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}),B.jets,false);
  EXTRA.forEach(bk=>instanced(bk.geo(E),bk.mat(E),B[bk.name],bk.shadow));
  if(waterMesh) addWater(waterMesh.material);
})();

// markers and labels of places inside the walls move up with their level
for(const id in PLACES){ if(PLACES[id].fixedY) continue;
  const p=PLACES[id]; p.pos.y+=levelOff(p.pos.x,p.pos.z); if(p.label) p.label.y+=levelOff(p.label.x,p.label.z); }

/* ---------- selection marker ---------- */
const ringGeo=new THREE.RingGeometry(.88,1,96); ringGeo.rotateX(-Math.PI/2);
const marker=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:.95,depthWrite:false}));
const marker2=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:.5,depthWrite:false}));
marker.visible=marker2.visible=false; marker.renderOrder=marker2.renderOrder=5; scene.add(marker,marker2);

/* ---------- highlight ---------- */
const HL=new THREE.Color("#f2c14e"), HL_EM=new THREE.Color("#5c4306");
function highlight(id,on){
  const p=PLACES[id]; if(!p) return;
  p.mats.forEach(m=>{ if(on) m.emissive.copy(m.userData.em).add(HL_EM); else m.emissive.copy(m.userData.em); });
  INST.forEach(({mesh,base})=>{
    const owners=mesh.userData.owners; let hit=false;
    for(let i=0;i<owners.length;i++) if(owners[i]===id){ mesh.setColorAt(i,on?base[i].clone().lerp(HL,.45):base[i]); hit=true; }
    if(hit) mesh.instanceColor.needsUpdate=true;
  });
}

/* ---------- camera flights ---------- */
let tween=null;
function nearestAngle(from,to){ let d=(to-from)%(Math.PI*2); if(d>Math.PI) d-=Math.PI*2; if(d<-Math.PI) d+=Math.PI*2; return from+d; }
function flyTo(target,dist,opt){
  opt=opt||{};
  const fromT=controls.target.clone(), s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(fromT));
  dist=Math.min(controls.maxDistance,Math.max(controls.minDistance,dist));
  tween={t0:performance.now(),dur:reduced?1:1100,fromT,toT:target.clone(),
    fromD:s.radius,toD:dist,fromPhi:s.phi,toPhi:opt.phi!==undefined?opt.phi:TILT,
    fromTh:s.theta,toTh:opt.theta!==undefined?nearestAngle(s.theta,opt.theta):s.theta};
}
function stepTween(now){
  let k=(now-tween.t0)/tween.dur; if(!(k<1)) k=1;
  const e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, T=tween;
  const tt=new THREE.Vector3().lerpVectors(T.fromT,T.toT,e);
  const d=Math.exp(Math.log(T.fromD)+(Math.log(T.toD)-Math.log(T.fromD))*e);
  controls.target.copy(tt);
  camera.position.setFromSpherical(new THREE.Spherical(d,T.fromPhi+(T.toPhi-T.fromPhi)*e,T.fromTh+(T.toTh-T.fromTh)*e)).add(tt);
  if(k===1) tween=null;
}
controls.addEventListener("start",()=>{ tween=null; });
controls.addEventListener("change",()=>{ // keep the view over the valley
  const t=controls.target, d=Math.hypot(t.x,t.z), lim=CAM.limit||440;   // camera.limit: how far from the center the view may wander
  if(d>lim){ const k=lim/d, nx=t.x*k, nz=t.z*k; camera.position.x+=nx-t.x; camera.position.z+=nz-t.z; t.x=nx; t.z=nz; }
});

/* ---------- UI: list, info card, labels ---------- */
const $=id=>document.getElementById(id);
const listEl=$("list"), infoEl=$("info"), labelsEl=$("labels"), tip=$("tip"), q=$("q");
let selected=null, labelsOn=true;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function renderList(){
  const term=q.value.trim().toLowerCase(); let html="", any=false;
  GROUPS.forEach(([title,ids])=>{
    const rows=ids.filter(id=>{ const p=PLACES[id]; return !term||[p.name,p.alt,p.lord,p.kicker,p.heraldry].join(" ").toLowerCase().includes(term); });
    if(!rows.length) return; any=true;
    html+=`<div class="group"><h2>${esc(title)}</h2>`+rows.map(id=>{ const p=PLACES[id];
      return `<button class="item" data-id="${id}" aria-current="${id===selected}"><span class="dot" style="background:${p.color}"></span><span class="nm">${esc(p.name)}</span><span class="sub">${esc(p.lord||p.alt||"")}</span></button>`; }).join("")+`</div>`;
  });
  const folk=HEROES.filter(h=>!term||[h.name,h.kicker].join(" ").toLowerCase().includes(term));
  if(folk.length){ any=true;
    html+=`<div class="group"><h2>People</h2>`+folk.map(h=>{ const id=h.w.s.userData.personId; return `<button class="item" data-person="${id}" aria-current="${id===selPerson}"><span class="dot" style="background:${PLACES[h.house].color}"></span><span class="nm">${esc(h.name)}</span><span class="sub">${esc(h.kicker)}</span></button>`; }).join("")+`</div>`; }
  const mine=[...PIECES.entries()].filter(([,v])=>!term||[pieceName(v.d),CAT_BY[v.d.t].name,v.d.note].join(" ").toLowerCase().includes(term))
    .sort((a,b)=>a[1].d.at-b[1].d.at);
  if(mine.length){ any=true;
    html+=`<div class="group"><h2>Your buildings</h2>`+mine.map(([id,v])=>`<button class="item" data-piece="${id}" aria-current="${id===selPiece}"><span class="dot" style="background:${v.d.c}"></span><span class="nm">${esc(pieceName(v.d))}</span><span class="sub">${esc(v.d.n?CAT_BY[v.d.t].name:"Built by you")}</span></button>`).join("")+`</div>`; }
  listEl.innerHTML=any?html:`<p class="empty">No place matches “${esc(q.value)}”. ${esc(CITY.text.searchHint)}</p>`;
}
listEl.addEventListener("click",e=>{ const b=e.target.closest(".item"); if(!b) return; if(b.dataset.person) selectPerson(+b.dataset.person,true); else if(b.dataset.piece) selectPiece(b.dataset.piece,true); else select(b.dataset.id); if(matchMedia("(max-width:760px)").matches) setPlacesOpen(false); });
q.addEventListener("input",renderList);
function setPlacesOpen(o){ $("places").classList.toggle("open",o); $("togglePlaces").setAttribute("aria-expanded",String(o)); }
$("togglePlaces").addEventListener("click",()=>setPlacesOpen(!$("places").classList.contains("open")));

function renderInfo(p){
  let facts="";
  if(p.lord) facts+=`<dt>Lord</dt><dd>${esc(p.lord)}</dd>`;
  if(p.heraldry) facts+=`<dt>Arms</dt><dd><span class="sw" style="background:${p.color}"></span>${esc(p.heraldry)}</dd>`;
  infoEl.innerHTML=`<div class="info-head"><div><p class="kicker">${esc(p.kicker)}</p><h2>${esc(p.name)}</h2>${p.alt?`<p class="alt">${esc(p.alt)}</p>`:""}</div>
    <button id="closeInfo" aria-label="Close">&times;</button></div>
    ${facts?`<dl class="facts">${facts}</dl>`:""}
    <p class="desc">${esc(p.desc)}</p>
    ${p.fall?`<section class="fall"><h3>${esc(CITY.text.storyHeading)}</h3><p>${esc(p.fall)}</p></section>`:""}
    <p class="src">Source: ${esc(p.src)}</p>`;
  infoEl.hidden=false; infoEl.scrollTop=0;
  $("closeInfo").addEventListener("click",()=>select(null));
}
function select(id,fly){
  if(selected) highlight(selected,false);
  if(id&&selPiece){ pieceHL(selPiece,false); selPiece=null; }
  if(id&&selPerson!==null) selPerson=null;
  selected=id&&PLACES[id]?id:null;
  refreshLabelOn();
  REVEALS.forEach(r=>r.obj.visible=r.id===selected);
  if(!selected){ infoEl.hidden=true; marker.visible=marker2.visible=false; renderList(); try{history.replaceState(null,"",location.pathname+location.search);}catch(e){} return; }
  const p=PLACES[selected];
  highlight(selected,true); renderInfo(p); renderList();
  if(p.ring){ marker.visible=marker2.visible=true; marker.position.copy(p.pos).setY(p.pos.y+.5); marker2.position.copy(marker.position); marker.scale.setScalar(p.ring); }
  else marker.visible=marker2.visible=false;
  if(fly!==false){
    const tgt=p.view||p.pos;
    flyTo(tgt,p.zoom*ZK);
  }
  const cur=listEl.querySelector(`[data-id="${selected}"]`); if(cur) cur.scrollIntoView({block:"nearest"});
  try{history.replaceState(null,"","#"+selected);}catch(e){}
}

const labels=[];
for(const id in PLACES){ const p=PLACES[id]; if(!p.label) continue;
  const el=document.createElement("button"); el.className="lbl t"+p.tier; el.textContent=p.name.replace(/^House of the /,"").replace(/^The /,""); el.title=p.name;
  if(p.house) el.textContent=p.name.replace(/^House of the /,"");
  el.addEventListener("click",()=>select(id));
  labelsEl.appendChild(el); labels.push({id,el,pos:p.label,tier:p.tier});
}
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>labels.forEach(l=>{l.w=0;}));
const TIER_MAX={1:1e9,2:1150,3:560};
const _v=new THREE.Vector3();
function updateLabels(){
  const w=host.clientWidth,h=host.clientHeight, dist=camera.position.distanceTo(controls.target);
  // place labels in priority order (selected, then tier 1, 2, 3); skip any that would overlap one already placed
  const sk=selKey();
  const order=labels.slice().sort((a,b)=>(a.id===sk?-1:0)-(b.id===sk?-1:0)||a.tier-b.tier);
  const placed=[];
  for(const l of order){
    let show=labelsOn&&!l.off&&!(l.id.startsWith("person:")&&!peopleOn)&&(dist<TIER_MAX[l.tier]||l.id===sk), x=0, y=0;
    if(show){ _v.copy(l.pos).project(camera); if(_v.z>1||Math.abs(_v.x)>1.1||Math.abs(_v.y)>1.1) show=false; }
    if(show){
      if(!l.w){ l.el.hidden=false; l.w=l.el.offsetWidth; l.h=l.el.offsetHeight; }
      x=(_v.x+1)/2*w; y=(1-_v.y)/2*h;
      const r={x0:x-l.w/2-3,x1:x+l.w/2+3,y0:y-l.h-2,y1:y+2};
      if(placed.some(o=>r.x0<o.x1&&r.x1>o.x0&&r.y0<o.y1&&r.y1>o.y0)) show=false; else placed.push(r);
    }
    if(l.el.hidden===show) l.el.hidden=!show;
    if(show) l.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
  }
}

/* ---------- picking ---------- */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();

/* ---------- map controls ---------- */
$("zin").addEventListener("click",()=>flyTo(controls.target,camera.position.distanceTo(controls.target)*.6,{phi:new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).phi}));
$("zout").addEventListener("click",()=>flyTo(controls.target,camera.position.distanceTo(controls.target)/.6,{phi:new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).phi}));
$("home").addEventListener("click",()=>flyTo(HOME.target,HOME.dist,{phi:HOME.phi,theta:HOME.theta}));
$("compass").addEventListener("click",()=>flyTo(controls.target,camera.position.distanceTo(controls.target),{theta:HOME.theta}));
const curTheta=()=>new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).theta;
const snap=d=>{ const q=Math.PI/2, base=Math.round((curTheta()-HOME.theta)/q)*q+HOME.theta; flyTo(controls.target,camera.position.distanceTo(controls.target),{theta:base+d*q}); };
$("rotL").addEventListener("click",()=>snap(-1));
$("rotR").addEventListener("click",()=>snap(1));
// eye level: drop to a walker's height looking along the ground; click again to rise back to the usual view from above
const curPhi=()=>new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).phi;
let eyeBack=null;
$("eyeView").addEventListener("click",()=>{
  if(curPhi()<1.15){ eyeBack=camera.position.distanceTo(controls.target); const t=controls.target.clone(); t.y=surfaceY(t.x,t.z)+4; flyTo(t,70,{phi:EYE_PHI}); }   // look at the ground actually there (a raised level, a cliff top)
  else flyTo(controls.target,eyeBack||420*SCALE,{phi:TILT});
});
$("lblToggle").addEventListener("click",e=>{ labelsOn=!labelsOn; e.currentTarget.setAttribute("aria-pressed",String(labelsOn)); });
const needle=$("needle");

/* keep the selected place in the part of the map the lore card doesn't cover */
const narrowMQ=matchMedia("(max-width:760px)"); let offX=0, offY=0;
function shiftView(){
  let tx=0, ty=0;
  if(narrowMQ.matches){ if(!infoEl.hidden) ty=infoEl.offsetHeight/2; }
  else { // center the view in the open space between the places panel and the card
    const hr=host.getBoundingClientRect(), L=$("places").getBoundingClientRect().right-hr.left;
    const R=infoEl.hidden?hr.width:infoEl.getBoundingClientRect().left-hr.left;
    tx=hr.width/2-(L+R)/2; }
  const k=reduced?1:0.12; offX+=(tx-offX)*k; offY+=(ty-offY)*k;
  if(Math.abs(offX-tx)<.5) offX=tx; if(Math.abs(offY-ty)<.5) offY=ty;
  const w=host.clientWidth||1, h=host.clientHeight||1;
  if(offX||offY) camera.setViewOffset(w,h,offX,offY,w,h); else if(camera.view&&camera.view.enabled) camera.clearViewOffset();
}

/* ---------- sandbox: build your own buildings in the city ---------- */
const CATALOG=[
  {t:"house",name:"House",cat:"Homes",c:"#6f8ea8"},
  {t:"cottage",name:"Cottage",cat:"Homes",c:"#8e3f2c"},
  {t:"townhouse",name:"Townhouse",cat:"Homes",c:"#6f8ea8"},
  {t:"rowhouses",name:"Row houses",cat:"Homes",c:"#4b4a8c"},
  {t:"manor",name:"Manor",cat:"Homes",c:"#b3373f"},
  {t:"stall",name:"Market stall",cat:"Homes",c:"#d6a32a"},
  {t:"hall",name:"Great hall",cat:"Grand buildings",c:"#3b7dc1"},
  {t:"temple",name:"Domed temple",cat:"Grand buildings",c:"#d8b34a"},
  {t:"tower",name:"Tower",cat:"Grand buildings",c:"#6f8ea8"},
  {t:"spire",name:"Spire",cat:"Grand buildings",c:"#d8b34a"},
  {t:"gatehouse",name:"Gatehouse",cat:"Grand buildings",c:"#d8b34a"},
  {t:"wall",name:"Wall",cat:"Grand buildings",c:"#e7e0cc"},
  {t:"fountain",name:"Fountain",cat:"Water and gardens",c:"#efe9dc"},
  {t:"pond",name:"Pond",cat:"Water and gardens",c:"#efe9dc"},
  {t:"tree",name:"Tree",cat:"Water and gardens",c:"#4c7d3c"},
  {t:"garden",name:"Garden",cat:"Water and gardens",c:"#d9534f"},
  {t:"gazebo",name:"Pavilion",cat:"Water and gardens",c:"#c9a43a"},
  {t:"plaza",name:"Plaza",cat:"Water and gardens",c:"#e7e0cc"},
  {t:"statue",name:"Statue",cat:"Monuments",c:"#f7f5ef"},
  {t:"obelisk",name:"Obelisk",cat:"Monuments",c:"#d8b34a"},
  {t:"banner",name:"Banner",cat:"Monuments",c:"#b3373f"},
];
const CAT_BY={}; CATALOG.forEach(c=>CAT_BY[c.t]=c);
const SWATCHES=[...new Set(["#f4f1ea","#e7e0cc","#6f8ea8","#d8b34a","#4c7d3c","#5aa8d6",...HOUSES.map(h=>h.color)])];
const userWater=lam("#5aa8d6",{emissive:new THREE.Color("#123a55")}); userWater.userData.shared=true;
addWater(userWater);
const jetMat=new THREE.MeshLambertMaterial({color:0xeaf6ff,transparent:true,opacity:.55,depthWrite:false}); jetMat.userData.shared=true;
const DOME=new THREE.SphereGeometry(1,28,12,0,Math.PI*2,0,Math.PI/2);
const BOWL=new THREE.CylinderGeometry(1,.4,1,20).translate(0,.5,0);
const SHAFT=new THREE.CylinderGeometry(Math.SQRT1_2*.72,Math.SQRT1_2,1,4).rotateY(Math.PI/4).translate(0,.5,0);
const BAD=new THREE.Color("#e0533f");

// builds one piece at the origin, base on y=0, front facing +z
function makePiece(t,color){
  const g=new THREE.Group(), stone=lam("#f4f1ea"), acc=lam(color), wood=lam("#7a6650"), dark=lam("#4d5866");
  const accDark=lam(new THREE.Color(color).multiplyScalar(.86));
  const leaf=c=>new THREE.MeshPhongMaterial({color:new THREE.Color(c),flatShading:true,shininess:4});
  const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=m.receiveShadow=true; g.add(m); return m;};
  const ring=(n,r,fn)=>{ for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; fn(Math.cos(a)*r,Math.sin(a)*r,a); } };
  const door=(z,w,h)=>add(UNIT_BOX,wood,0,0,z,w||1.1,h||2.1,.14);
  const tree=(x,z,s,mat)=>{ add(CYL,wood,x,0,z,.22*s,1.6*s,.22*s); add(BLOB,mat||leaf("#4c7d3c"),x,2.6*s,z,1.3*s,1.45*s,1.3*s); };
  switch(t){
    case "house": add(UNIT_BOX,stone,0,0,0,5,4.5,5); add(PYRAMID,acc,0,4.5,0,5.7,2.8,5.7); door(2.5);
      add(UNIT_BOX,dark,1.6,2.5,2.52,.8,.8,.1); add(UNIT_BOX,dark,-1.6,2.5,2.52,.8,.8,.1); break;
    case "cottage": add(UNIT_BOX,stone,0,0,0,4.4,3,3.8); add(PYRAMID,acc,0,3,0,5,3.2,4.4); door(1.9,1,1.8);
      add(UNIT_BOX,stone,1.4,3,-.8,.7,2.6,.7); break;
    case "townhouse": add(UNIT_BOX,stone,0,0,0,4.2,9,6); add(PYRAMID,acc,0,9,0,4.8,2.6,6.6); door(3);
      for(const y of [3.6,6.2]) for(const x of [-1,1]) add(UNIT_BOX,dark,x,y,3.02,.8,1.1,.1);
      add(UNIT_BOX,stone,1.2,9,-1.6,.8,3,.8); break;
    case "rowhouses": [[-3.6,6,acc],[0,7.6,accDark],[3.6,5.4,acc]].forEach(([x,h,m])=>{ add(UNIT_BOX,stone,x,0,0,3.5,h,5); add(PYRAMID,m,x,h,0,3.8,2.2,5.4); add(UNIT_BOX,wood,x,0,2.5,.9,1.9,.14); add(UNIT_BOX,dark,x,h-2,2.52,.8,.9,.1); }); break;
    case "manor": add(UNIT_BOX,stone,0,0,0,11,6.5,6); add(PYRAMID,acc,0,6.5,0,11.6,3.2,6.6);
      add(UNIT_BOX,stone,3.5,0,4.5,4,6.5,4); add(PYRAMID,acc,3.5,6.5,4.5,4.6,3.2,4.6); door(3,1.4,2.6);
      add(CYL,stone,-5,0,3,1.3,10,1.3); add(CONE,acc,-5,10,3,1.7,3.6,1.7); break;
    case "stall": for(const x of [-1.9,1.9]) for(const z of [-1.4,1.4]) add(CYL,wood,x,0,z,.14,3.2,.14);
      add(UNIT_BOX,lam("#a08868"),0,0,.4,3.8,1.1,1.6); add(PYRAMID,acc,0,3.2,0,4.8,1.4,3.8);
      [["#d9534f",-1.2],["#f0c419",0],["#73a04f",1.2]].forEach(([c,x])=>add(BLOB,leaf(c),x,1.35,.5,.35,.3,.35)); break;
    case "hall": add(UNIT_BOX,stone,0,0,0,12,7,14); add(PYRAMID,acc,0,7,0,13.4,5,15.4); door(7,2,3.4);
      add(CYL,lam("#8a8378"),7.5,0,6,.16,13,.16); add(UNIT_BOX,acc,9.1,10,6,3.2,2.4,.14); break;
    case "temple": add(CYL,stone,0,0,0,6.4,1,6.4); ring(10,5.4,(x,z)=>add(CYL,stone,x,1,z,.38,6,.38));
      add(CYL,stone,0,1,0,4.2,6,4.2); add(CYL,stone,0,7,0,6,.8,6); add(DOME,acc,0,7.8,0,4.7,4.4,4.7); add(CONE,lam("#d8b34a"),0,12.1,0,.6,1.8,.6); break;
    case "tower": add(CYL,stone,0,0,0,2.7,20,2.7); add(CYL,stone,0,20,0,3.3,1.2,3.3); add(CONE,acc,0,21.2,0,3.5,7,3.5); door(2.6,1.2,2.4);
      for(const y of [8,14]) add(UNIT_BOX,dark,0,y,2.65,.6,1.2,.12); break;
    case "spire": add(UNIT_BOX,stone,0,0,0,5,5,5); add(PYRAMID,accDark,0,5,0,5.4,1.2,5.4); add(CYL,stone,0,5,0,1.7,30,1.7); add(CYL,stone,0,35,0,2.2,.8,2.2); add(CONE,acc,0,35.8,0,2.2,10,2.2); door(2.5); break;
    case "gatehouse": for(const x of [-5.5,5.5]){ add(CYL,stone,x,0,0,2.9,14,2.9); add(CONE,acc,x,14,0,3.5,5,3.5); }
      add(UNIT_BOX,stone,0,8,0,8.4,4.4,4.2); add(UNIT_BOX,accDark,0,12.4,0,8.6,.5,4.4);
      for(const x of [-12,12]) add(UNIT_BOX,stone,x,0,0,10,7,2.6); break;
    case "wall": add(UNIT_BOX,stone,0,0,0,12,7,2.6); add(UNIT_BOX,acc,0,6.6,0,12.2,.4,2.8);
      for(let i=0;i<6;i++) add(UNIT_BOX,stone,-5+i*2,7,0,1.1,1.2,2.7); break;
    case "fountain": add(CYL,acc,0,0,0,4,1,4); add(CYL,userWater,0,.92,0,3.5,.12,3.5); add(CYL,stone,0,0,0,.55,3.4,.55);
      add(BOWL,stone,0,3.2,0,1.7,.6,1.7); add(CONE,jetMat,0,3.8,0,.7,2.4,.7); break;
    case "pond": add(CYL,acc,0,0,0,5.6,.45,5.6); add(CYL,userWater,0,.4,0,5.1,.1,5.1);
      [[1.8,1],[-1.2,2.2],[.4,-2.4]].forEach(([x,z])=>add(CYL,lam("#5d9a4a"),x,.5,z,.65,.05,.65));
      [[4.2,2.6],[-4.4,-1.8],[3.6,-3.4]].forEach(([x,z])=>add(BLOB,leaf("#6d9a4e"),x,.8,z,.6,1,.6)); break;
    case "tree": add(CYL,wood,0,0,0,.55,3.4,.55);
      { const m=leaf(color); add(BLOB,m,0,5.6,0,3,3.2,3); add(BLOB,m,-1.5,4.6,.9,2,2,2); add(BLOB,m,1.4,4.9,-.8,2.1,2.1,2.1); } break;
    case "garden": add(CYL,lam("#7da455"),0,0,0,6.2,.16,6.2);
      { const hedge=lam("#3f6f35"), segs=16; for(let i=0;i<segs;i++){ if(i===4||i===12) continue; const am=(i+.5)/segs*Math.PI*2, rr=5.75, len=2*rr*Math.sin(Math.PI/segs)+.15;
        const h=add(UNIT_BOX,hedge,Math.cos(am)*rr,.16,Math.sin(am)*rr,len,1,.75); h.rotation.y=-(am+Math.PI/2); } }
      ring(6,3.6,(x,z,a)=>{ const b=add(UNIT_BOX,acc,x,.16,z,2.2,.45,.9); b.rotation.y=-(a+Math.PI/2); });
      tree(0,0,1.1); break;
    case "gazebo": add(CYL,stone,0,0,0,3.3,.45,3.3); ring(6,2.7,(x,z)=>add(CYL,stone,x,.45,z,.22,3,.22));
      add(CYL,stone,0,3.45,0,3.2,.35,3.2); add(CONE,acc,0,3.8,0,3.7,2.6,3.7); add(BLOB,lam("#d8b34a"),0,6.5,0,.3,.3,.3); break;
    case "plaza": add(CYL,acc,0,0,0,7.5,.14,7.5); add(CYL,accDark,0,0,0,5,.18,5); add(CYL,acc,0,0,0,3.4,.22,3.4);
      ring(8,6.6,(x,z)=>add(CYL,stone,x,0,z,.35,1.1,.35)); break;
    case "statue": add(UNIT_BOX,stone,0,0,0,1.9,1.7,1.9); add(CONE,acc,0,1.7,0,.72,2.9,.72); add(BLOB,acc,0,4.95,0,.46,.5,.46);
      add(CYL,wood,.65,1.7,0,.06,4.2,.06); break;
    case "obelisk": add(UNIT_BOX,stone,0,0,0,3.2,1,3.2); add(SHAFT,stone,0,1,0,1.9,13,1.9); add(PYRAMID,acc,0,14,0,1.4,1.9,1.4); break;
    case "banner": add(UNIT_BOX,stone,0,0,0,1.2,.6,1.2); add(CYL,lam("#8a8378"),0,.6,0,.17,10.6,.17);
      add(UNIT_BOX,acc,1.85,7.6,0,3.4,2.6,.14); add(BLOB,lam("#d8b34a"),0,11.4,0,.35,.35,.35); break;
  }
  return g;
}

/* --- palette thumbnails, rendered once from the real models --- */
const THUMBS={};
(function thumbs(){
  let r;
  try{ r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true}); }catch(e){ return; }
  r.setPixelRatio(2); r.setSize(64,64,false);
  const sc=new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff,0x8a8f80,.75)); const dl=new THREE.DirectionalLight(0xffffff,.55); dl.position.set(-3,6,4); sc.add(dl);
  const cam=new THREE.PerspectiveCamera(28,1,.1,500), box=new THREE.Box3(), size=new THREE.Vector3(), mid=new THREE.Vector3();
  CATALOG.forEach(c=>{
    const g=makePiece(c.t,c.c); sc.add(g);
    box.setFromObject(g); box.getSize(size); box.getCenter(mid);
    const rad=Math.max(size.x,size.y,size.z)*.62+.5;
    cam.position.set(mid.x+rad*1.9,mid.y+rad*1.5,mid.z+rad*1.9); cam.lookAt(mid);
    r.render(sc,cam); THUMBS[c.t]=r.domElement.toDataURL("image/png"); sc.remove(g);
  });
  r.dispose(); if(r.forceContextLoss) r.forceContextLoss();
})();

/* --- state --- */
const PIECES=new Map();          // id -> {d, g}
const pieceGroups=[];
const LOTMAP=new Map();          // lot key -> [{mesh, i, m}]
INST.forEach(({mesh})=>{ const lots=mesh.userData.lots; if(!lots) return; lots.forEach((k,i)=>{ if(!k) return; if(!LOTMAP.has(k)) LOTMAP.set(k,[]); LOTMAP.get(k).push({mesh,i,m:mesh.userData.mats[i]}); }); });
const ZERO=new THREE.Matrix4().makeScale(0,0,0);
let REMOVED=new Set();
let mode="explore", tool="place", selPiece=null, moving=null, readOnly=false, snapOn=true;
const cur={t:"house",c:CAT_BY.house.c,s:1,r:0};
const STEP=15*DEG;
const pieceName=d=>d.n||CAT_BY[d.t].name;
const selKey=()=>selPiece?"piece:"+selPiece:selPerson!==null?"person:"+selPerson:selected;

function sanitize(d){
  if(!d||typeof d!=="object"||!CAT_BY[d.t]) return null;
  const num=(v,lo,hi,def)=>{ v=Number(v); return isFinite(v)?Math.min(hi,Math.max(lo,v)):def; };
  return {t:d.t,c:/^#[0-9a-f]{6}$/i.test(d.c)?d.c.toLowerCase():CAT_BY[d.t].c,
    x:num(d.x,-700,700,0),y:num(d.y,-5,200,H),z:num(d.z,-700,700,0),r:num(d.r,-100,100,0),s:num(d.s,.5,2.5,1),
    n:typeof d.n==="string"?d.n.slice(0,60):"",note:typeof d.note==="string"?d.note.slice(0,600):"",at:num(d.at,0,1e14,0)};
}
function sanitizePiece(d){
  const o=sanitize(d); if(!o) return null;
  const r=Math.hypot(o.x,o.z);
  if(r<edgeR(bearingOf(o.x,o.z))&&Math.abs(o.y-H)<.6) o.y=groundY(r);   // built before the city had levels
  return o;
}
function buildGroup(id,d){
  const g=makePiece(d.t,d.c); g.position.set(d.x,d.y,d.z); g.rotation.y=d.r; g.scale.setScalar(d.s);
  g.userData.mats=[];
  g.traverse(o=>{ o.userData.pieceId=id; if(o.isMesh&&o.material.emissive&&!o.material.userData.shared){ o.material.userData.em=o.material.emissive.clone(); g.userData.mats.push(o.material); } });
  const b=new THREE.Box3().setFromObject(g), sz=b.getSize(new THREE.Vector3());
  g.userData.ring=Math.max(sz.x,sz.z)/2+1.5; g.userData.top=b.max.y;
  return g;
}
function dropGroup(g){ scene.remove(g); const i=pieceGroups.indexOf(g); if(i>=0) pieceGroups.splice(i,1); g.traverse(o=>{ if(o.isMesh&&!o.material.userData.shared) o.material.dispose(); }); }
function upsertLocal(id,d){
  const ex=PIECES.get(id);
  if(ex&&ex.d.t===d.t&&ex.d.c===d.c){
    ex.g.position.set(d.x,d.y,d.z); ex.g.rotation.y=d.r; ex.g.scale.setScalar(d.s); ex.d=d;
    const b=new THREE.Box3().setFromObject(ex.g), sz=b.getSize(new THREE.Vector3()); ex.g.userData.ring=Math.max(sz.x,sz.z)/2+1.5; ex.g.userData.top=b.max.y;
  } else {
    if(ex) dropGroup(ex.g);
    const g=buildGroup(id,d); scene.add(g); pieceGroups.push(g);
    if(moving===id) g.visible=false;
    PIECES.set(id,{d,g}); if(selPiece===id) pieceHL(id,true);
  }
  syncPieceLabel(id); piecesChanged();
}
function removeLocal(id){
  const ex=PIECES.get(id); if(!ex) return;
  if(selPiece===id) deselectPiece();
  if(moving===id) endMove(false);
  dropGroup(ex.g); PIECES.delete(id); syncPieceLabel(id); piecesChanged();
}
function showLot(k,show){ const es=LOTMAP.get(k); if(!es) return; es.forEach(e=>{ e.mesh.setMatrixAt(e.i,show?e.m:ZERO); e.mesh.instanceMatrix.needsUpdate=true; }); shadowsDirty(); }
function applyRemoved(set){
  set=new Set([...set].filter(k=>LOTMAP.has(k)));
  REMOVED.forEach(k=>{ if(!set.has(k)) showLot(k,true); });
  set.forEach(k=>{ if(!REMOVED.has(k)) showLot(k,false); });
  REMOVED=set; updateCounts();
}

/* --- saving: the artifact's database when the viewer provides one, otherwise this browser --- */
const Store={kind:"pending",db:null,pend:{},chain:{},cityTimer:null,cityBusy:false,cityDirty:false,lsTimer:null};
const LS_KEY=CITY.id+"-sandbox-v1";
const saveEl=$("saveState");
function setSave(s){ saveEl.textContent={saving:"Saving…",saved:"All changes saved",local:"Saved in this browser",unsaved:"Not saved",readonly:"View only"}[s]||""; }
function busy(){ return Object.keys(Store.pend).length||Store.cityBusy||Store.cityDirty; }
const WQ=[]; let wActive=0;
function enqueue(fn){ return new Promise((res,rej)=>{ WQ.push({fn,res,rej}); pumpQ(); }); }
function pumpQ(){ while(wActive<4&&WQ.length){ const j=WQ.shift(); wActive++; Promise.resolve().then(j.fn).then(j.res,j.rej).finally(()=>{ wActive--; pumpQ(); }); } }
function writeErr(e){
  const code=e&&e.code;
  if(code==="invalid_argument"){ if(!readOnly){ readOnly=true; setSave("readonly"); toast("You can look around, but your account can't save changes to this sandbox."); setMode("explore"); updateModeTabs(); } }
  else if(code==="quota_exceeded") toast("The sandbox is full. Demolish some of your buildings before adding more.");
  else if(code==="revoked"||code==="not_granted"||code==="capability_disabled") { readOnly=true; setSave("readonly"); updateModeTabs(); }
  else toast("Couldn't save the last change. Check your connection, then try again.");
}
function dbWrite(id,fn){
  Store.pend[id]=(Store.pend[id]||0)+1; setSave("saving");
  const ref=Store.db.collection("pieces").doc(id);
  Store.chain[id]=(Store.chain[id]||Promise.resolve()).then(()=>enqueue(()=>fn(ref))).catch(writeErr).finally(()=>{
    if(!--Store.pend[id]){ delete Store.pend[id]; delete Store.chain[id]; } if(!busy()&&!readOnly) setSave("saved"); });
}
function saveLocalSoon(){
  clearTimeout(Store.lsTimer);
  Store.lsTimer=setTimeout(()=>{ try{ const pieces={}; PIECES.forEach((v,k)=>pieces[k]=v.d); localStorage.setItem(LS_KEY,JSON.stringify({pieces,removed:[...REMOVED]})); setSave("local"); }catch(e){ setSave("unsaved"); } },300);
}
function canWrite(){ if(readOnly){ toast("This sandbox is view only for you."); return false; } if(Store.kind==="pending"){ toast("Still loading your saved buildings. Try again in a moment."); return false; } return true; }
function commitPiece(id,d){ if(!canWrite()) return false; upsertLocal(id,d); if(Store.kind==="db") dbWrite(id,ref=>ref.set(d)); else saveLocalSoon(); return true; }
function commitDelete(id){ if(!canWrite()) return false; removeLocal(id); if(Store.kind==="db") dbWrite(id,ref=>ref.delete()); else saveLocalSoon(); return true; }
function commitRemoved(set){
  if(!canWrite()) return false; applyRemoved(set);
  if(Store.kind==="db"){ Store.cityDirty=true; setSave("saving"); clearTimeout(Store.cityTimer); Store.cityTimer=setTimeout(flushCity,500); }
  else saveLocalSoon();
  return true;
}
async function flushCity(){
  Store.cityTimer=null;
  if(Store.cityBusy){ Store.cityTimer=setTimeout(flushCity,300); return; }
  Store.cityBusy=true; Store.cityDirty=false;
  try{ await enqueue(()=>Store.db.doc("sandbox/city").set({removed:[...REMOVED]})); }catch(e){ writeErr(e); }
  Store.cityBusy=false;
  if(Store.cityDirty&&!Store.cityTimer) flushCity(); else if(!busy()&&!readOnly) setSave("saved");
}
(async function initStore(){
  let db=null;
  try{ if(window.claude&&typeof window.claude.use==="function") db=await window.claude.use("db"); }catch(e){ db=null; }
  if(db){
    Store.kind="db"; Store.db=db; setSave("saved");
    db.collection("pieces").onSnapshot(snap=>{
      snap.docChanges().forEach(ch=>{
        const id=ch.doc.id; if(Store.pend[id]) return;
        if(ch.type==="removed") removeLocal(id);
        else { const d=sanitizePiece(ch.doc.data()); if(d) upsertLocal(id,d); }
      });
    },()=>toast("Live updates stopped. Reload the page to see the latest buildings."));
    db.doc("sandbox/city").onSnapshot(s=>{
      if(Store.cityBusy||Store.cityDirty||Store.cityTimer) return;
      const arr=s.exists&&Array.isArray(s.data().removed)?s.data().removed.filter(k=>typeof k==="string"):[];
      applyRemoved(new Set(arr));
    },()=>{});
  } else {
    Store.kind="local";
    try{ const j=JSON.parse(localStorage.getItem(LS_KEY)||"null");
      if(j){ Object.entries(j.pieces||{}).forEach(([id,d])=>{ d=sanitizePiece(d); if(d&&/^[\w-]{1,40}$/.test(id)) upsertLocal(id,d); }); applyRemoved(new Set(Array.isArray(j.removed)?j.removed:[])); }
    }catch(e){}
    setSave("local");
  }
  updateModeTabs();
})();

/* --- undo / redo --- */
const undoS=[], redoS=[];
function record(a){ undoS.push(a); if(undoS.length>200) undoS.shift(); redoS.length=0; updUndo(); }
function applyAct(a,dir){
  if(a.k==="add") return dir<0?commitDelete(a.id):commitPiece(a.id,a.d);
  if(a.k==="del") return dir<0?commitPiece(a.id,a.d):commitDelete(a.id);
  if(a.k==="upd"){ const ok=commitPiece(a.id,dir<0?a.before:a.after); if(selPiece===a.id) renderPieceCard(); return ok; }
  if(a.k==="demo"){ const s=new Set(REMOVED); a.keys.forEach(k=>dir<0?s.delete(k):s.add(k)); return commitRemoved(s); }
}
function undo(){ const a=undoS[undoS.length-1]; if(!a) return; if(applyAct(a,-1)===false) return; redoS.push(undoS.pop()); updUndo(); }
function redo(){ const a=redoS[redoS.length-1]; if(!a) return; if(applyAct(a,1)===false) return; undoS.push(redoS.pop()); updUndo(); }
function updUndo(){ $("undoBtn").disabled=!undoS.length; $("redoBtn").disabled=!redoS.length; }
$("undoBtn").addEventListener("click",undo); $("redoBtn").addEventListener("click",redo);

/* --- highlight and selection of your own buildings --- */
function pieceHL(id,on){ const ex=PIECES.get(id); if(!ex) return; ex.g.userData.mats.forEach(m=>{ m.emissive.copy(m.userData.em); if(on) m.emissive.add(HL_EM); }); }
function selectPiece(id,fly){
  if(selected) select(null,false);
  selPerson=null;
  if(selPiece&&selPiece!==id) pieceHL(selPiece,false);
  const ex=PIECES.get(id); if(!ex) return;
  selPiece=id; pieceHL(id,true); refreshLabelOn();
  marker.visible=marker2.visible=true; marker.position.copy(ex.g.position).setY(ex.g.position.y+.5); marker2.position.copy(marker.position); marker.scale.setScalar(ex.g.userData.ring);
  renderPieceCard(); renderList();
  if(fly) flyTo(ex.g.position,Math.max(120,ex.g.userData.ring*14));
}
function deselectPiece(){
  if(!selPiece) return; pieceHL(selPiece,false); selPiece=null;
  marker.visible=marker2.visible=false; infoEl.hidden=true; refreshLabelOn(); renderList();
}
function refreshLabelOn(){ const k=selKey(); labels.forEach(l=>l.el.classList.toggle("on",l.id===k)); }

/* --- labels for buildings you have named --- */
function syncPieceLabel(id){
  const key="piece:"+id, i=labels.findIndex(l=>l.id===key), ex=PIECES.get(id);
  if(!ex||!ex.d.n){ if(i>=0){ labels[i].el.remove(); labels.splice(i,1); } return; }
  let l=labels[i];
  if(!l){ const el=document.createElement("button"); el.className="lbl t3"; el.addEventListener("click",()=>selectPiece(id,true)); labelsEl.appendChild(el); l={id:key,el,pos:new THREE.Vector3(),tier:3}; labels.push(l); }
  if(l.el.textContent!==ex.d.n){ l.el.textContent=ex.d.n; l.el.title=ex.d.n; l.w=0; }
  l.pos.copy(ex.g.position).setY(ex.g.userData.top+3);
  l.el.classList.toggle("on",selPiece===id);
}

/* --- the card for one of your buildings --- */
const degOf=r=>Math.round(((r/DEG)%360+360)%360);
function swatchesHTML(active,prefix){
  return SWATCHES.map(c=>`<button class="sw-b" style="background:${c}" data-c="${c}" aria-pressed="${c===active}" aria-label="Color ${c}"></button>`).join("")+
    `<input type="color" class="sw-c" id="${prefix}Custom" value="${active}" title="Pick any color" aria-label="Pick any color">`;
}
let editBefore=null;
function renderPieceCard(){
  const ex=PIECES.get(selPiece); if(!ex) return;
  const d=ex.d, c=CAT_BY[d.t], editing=mode==="build"&&!readOnly;
  const focusId=document.activeElement&&infoEl.contains(document.activeElement)?document.activeElement.id:null;
  infoEl.innerHTML=`<div class="info-head"><div><p class="kicker">Your building · ${esc(c.name)}</p><h2 id="pcTitle">${esc(pieceName(d))}</h2></div><button id="closeInfo" aria-label="Close">&times;</button></div>`+
  (editing?`
    <div class="field"><label for="pcName">Name</label><input id="pcName" maxlength="60" placeholder="${esc(c.name)}" value="${esc(d.n)}"></div>
    <div class="field"><label for="pcNote">Notes</label><textarea id="pcNote" rows="3" maxlength="600" placeholder="Who lives here? What happened here?">${esc(d.note)}</textarea></div>
    <div class="field"><span class="flabel">Color</span><div class="sws" id="pcSw">${swatchesHTML(d.c,"pc")}</div></div>
    <div class="field row"><label for="pcSize">Size</label><input type="range" id="pcSize" min="0.5" max="2.5" step="0.1" value="${d.s}"><output id="pcSizeOut">${d.s.toFixed(1)}×</output></div>
    <div class="field row"><span class="flabel">Turn</span><button class="mini" data-turn="-1">&minus;15°</button><output>${degOf(d.r)}°</output><button class="mini" data-turn="1">+15°</button></div>
    <div class="acts"><button id="pcMove" class="primary">Move</button><button id="pcDup">Duplicate</button><button id="pcDel" class="danger">Demolish</button></div>`
  :`${d.note?`<p class="desc">${esc(d.note)}</p>`:`<p class="desc muted">No notes yet.</p>`}
    ${readOnly?"":`<div class="acts"><button id="pcEdit" class="primary">Edit in Build mode</button></div>`}`);
  infoEl.hidden=false;
  $("closeInfo").addEventListener("click",deselectPiece);
  if(!editing){ const b=$("pcEdit"); if(b) b.addEventListener("click",()=>{ setMode("build"); setTool("edit"); renderPieceCard(); }); return; }
  const id=selPiece, curD=()=>PIECES.get(id).d;
  const commitUpd=(after,before)=>{ before=before||curD(); if(JSON.stringify(before)===JSON.stringify(after)) return; if(commitPiece(id,after)) record({k:"upd",id,before,after}); };
  // name and notes: show while typing, save and add one undo step when you leave the field
  ["pcName","pcNote"].forEach(fid=>{
    const el=$(fid), key=fid==="pcName"?"n":"note";
    el.addEventListener("focus",()=>{ editBefore=curD(); });
    el.addEventListener("input",()=>{ const d2=Object.assign({},curD(),{[key]:el.value.slice(0,key==="n"?60:600)}); upsertLocal(id,d2); if(key==="n") $("pcTitle").textContent=pieceName(d2); });
    el.addEventListener("change",()=>{ const b=editBefore||curD(); editBefore=null; const after=Object.assign({},curD()); upsertLocal(id,b); commitUpd(after,b); });
  });
  $("pcSw").addEventListener("click",e=>{ const b=e.target.closest(".sw-b"); if(b) commitUpd(Object.assign({},curD(),{c:b.dataset.c})); if(b) renderPieceCard(); });
  $("pcCustom").addEventListener("change",e=>{ commitUpd(Object.assign({},curD(),{c:e.target.value.toLowerCase()})); renderPieceCard(); });
  const size=$("pcSize");
  size.addEventListener("pointerdown",()=>{ editBefore=curD(); });
  size.addEventListener("input",()=>{ if(!editBefore) editBefore=curD(); upsertLocal(id,Object.assign({},curD(),{s:+size.value})); $("pcSizeOut").textContent=(+size.value).toFixed(1)+"×"; marker.scale.setScalar(PIECES.get(id).g.userData.ring); });
  size.addEventListener("change",()=>{ const b=editBefore||curD(); editBefore=null; const after=Object.assign({},curD(),{s:+size.value}); upsertLocal(id,b); commitUpd(after,b); });
  infoEl.querySelectorAll("[data-turn]").forEach(b=>b.addEventListener("click",()=>{ commitUpd(Object.assign({},curD(),{r:curD().r+(+b.dataset.turn)*STEP})); renderPieceCard(); }));
  $("pcMove").addEventListener("click",()=>startMove(id));
  $("pcDup").addEventListener("click",()=>{ const d0=curD(); Object.assign(cur,{t:d0.t,c:d0.c,s:d0.s,r:d0.r}); syncBuildOpts(); deselectPiece(); setTool("place"); toast("Click on the map to place the copy."); });
  $("pcDel").addEventListener("click",()=>demolishPiece(id));
  if(focusId&&$(focusId)) $(focusId).focus();
}
function demolishPiece(id){ const ex=PIECES.get(id); if(!ex) return; const d=ex.d; if(commitDelete(id)) record({k:"del",id,d}); }

/* --- ghost preview that follows the pointer while placing or moving --- */
let ghost=null, ghostKey="", lastSurf=null;
function ensureGhost(){
  const key=cur.t+"|"+cur.c;
  if(!ghost||ghostKey!==key){
    if(ghost) scene.remove(ghost);
    ghost=makePiece(cur.t,cur.c);
    ghost.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.transparent=true; o.material.opacity=.62; o.material.depthWrite=false; o.material.userData.base=o.material.color.clone(); o.castShadow=false; o.receiveShadow=false; o.renderOrder=4; } });
    ghostKey=key; ghost.visible=false; scene.add(ghost);
  }
  ghost.scale.setScalar(cur.s); ghost.rotation.y=cur.r;
  return ghost;
}
function hideGhost(){ if(ghost) ghost.visible=false; }
function surfaceAt(cx,cy){
  const r=cv.getBoundingClientRect();
  ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1); ray.setFromCamera(ndc,camera);
  const h=ray.intersectObjects([hillMesh,groundMesh,...TIERS],false)[0]; if(!h) return null;
  const p=h.point.clone(); if(snapOn){ p.x=Math.round(p.x); p.z=Math.round(p.z); }
  const ok=h.face.normal.y>0.86&&Math.hypot(p.x,p.z)<640;
  return {p,ok};
}
function updateGhost(s){
  if(!(mode==="build"&&(tool==="place"||moving))||!s){ hideGhost(); return; }
  const g=ensureGhost(); g.visible=true; g.position.copy(s.p);
  g.traverse(o=>{ if(o.isMesh) o.material.color.copy(s.ok?o.material.userData.base:BAD); });
}
function placeAt(s){
  if(!s) return;
  if(!s.ok){ toast("That ground is too steep. Build on the summit or out on the plain."); return; }
  const pos={x:+s.p.x.toFixed(2),y:+s.p.y.toFixed(2),z:+s.p.z.toFixed(2)};
  if(moving){
    const id=moving, ex=PIECES.get(id); if(!ex){ endMove(false); return; }
    const before=ex.d, after=Object.assign({},before,pos,{r:cur.r});
    endMove(false); if(commitPiece(id,after)) record({k:"upd",id,before,after}); selectPiece(id,false); return;
  }
  const id="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const d=Object.assign({t:cur.t,c:cur.c,s:cur.s,r:cur.r,n:"",note:"",at:Date.now()},pos);
  if(commitPiece(id,d)) record({k:"add",id,d});
}
let moveRestore=null;
function startMove(id){
  const ex=PIECES.get(id); if(!ex||!canWrite()) return;
  moveRestore={t:cur.t,c:cur.c,s:cur.s,r:cur.r};
  Object.assign(cur,{t:ex.d.t,c:ex.d.c,s:ex.d.s,r:ex.d.r});
  deselectPiece(); moving=id; ex.g.visible=false; setTool("edit"); updateHint();
  ensureGhost(); toast("Click where it should go. Press Esc to cancel.");
}
function endMove(restoreVisible){
  if(!moving) return; const ex=PIECES.get(moving); if(ex) ex.g.visible=true;
  moving=null; if(moveRestore){ Object.assign(cur,moveRestore); moveRestore=null; } hideGhost(); syncBuildOpts(); updateHint();
}

/* --- demolish preview: tint what would be removed --- */
let demoHover=null;
function setDemoHover(h){
  const key=h?(h.kind==="piece"?"p:"+h.id:h.kind==="lot"?"l:"+h.key:null):null;
  if(demoHover&&demoHover.key===key) return;
  if(demoHover){ if(demoHover.kind==="piece") pieceHL(demoHover.id,selPiece===demoHover.id); else tintLot(demoHover.k,false); }
  demoHover=null; if(!key) return;
  if(h.kind==="piece"){ const ex=PIECES.get(h.id); if(ex) ex.g.userData.mats.forEach(m=>m.emissive.set("#7a1a10")); demoHover={key,kind:"piece",id:h.id}; }
  else { tintLot(h.key,true); demoHover={key,kind:"lot",k:h.key}; }
}
function tintLot(k,on){ (LOTMAP.get(k)||[]).forEach(e=>{ const inst=INST.find(x=>x.mesh===e.mesh); e.mesh.setColorAt(e.i,on?BAD:inst.base[e.i]); e.mesh.instanceColor.needsUpdate=true; }); }

/* --- what is under the pointer --- */
function hitAt(cx,cy){
  const r=cv.getBoundingClientRect();
  ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1); ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects(pieceGroups.filter(g=>g.visible).concat(pickables,peopleOn?peopleSprites.filter(s=>s.visible):[]),true);
  for(const h of hits){
    const o=h.object;
    if(o.isSprite&&o.userData.personId!==undefined) return {kind:"person",id:o.userData.personId};
    if(o.userData.pieceId) return {kind:"piece",id:o.userData.pieceId};
    if(o.isInstancedMesh&&o.userData.owners&&h.instanceId!==undefined){
      const k=o.userData.lots&&o.userData.lots[h.instanceId];
      return k?{kind:"lot",key:k,id:o.userData.owners[h.instanceId]}:{kind:"place",id:o.userData.owners[h.instanceId]};
    }
    if(o.userData.placeId) return {kind:"place",id:o.userData.placeId};
  }
  return null;
}
const hitName=h=>h.kind==="person"?personInfo(h.id).name:h.kind==="piece"?pieceName(PIECES.get(h.id).d):PLACES[h.id]?PLACES[h.id].name:"";

/* --- pointer handling for both modes --- */
const cv=renderer.domElement; let down=null, hoverQueued=null;
cv.addEventListener("contextmenu",e=>{ if(mode==="build") e.preventDefault(); });
cv.addEventListener("pointerdown",e=>{ down={x:e.clientX,y:e.clientY,b:e.button}; tip.hidden=true; });
cv.addEventListener("pointerup",e=>{
  if(!down) return; const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y), btn=down.b; down=null;
  if(moved>=6) return;
  if(btn===2){ if(mode==="build"){ if(moving) endMove(false); else if(tool==="place") setTool("edit"); } return; }
  if(btn!==0) return;
  if(mode==="build"&&(tool==="place"||moving)){ placeAt(surfaceAt(e.clientX,e.clientY)); return; }
  const h=hitAt(e.clientX,e.clientY);
  if(mode==="build"&&tool==="demolish"){
    setDemoHover(null);
    if(!h) return;
    if(h.kind==="person") toast("People can't be demolished. They live here.");
    else if(h.kind==="piece") demolishPiece(h.id);
    else if(h.kind==="lot"){ const s=new Set(REMOVED); s.add(h.key); if(commitRemoved(s)) record({k:"demo",keys:[h.key]}); }
    else toast(`${PLACES[h.id]?PLACES[h.id].name:"That"} is part of the story, so it stays standing.`);
    return;
  }
  if(h&&h.kind==="person") selectPerson(h.id,false);
  else if(h&&h.kind==="piece") selectPiece(h.id,false);
  else if(h&&mode==="explore") select(h.id);
  else if(h&&mode==="build") select(h.id,false);
  else { clearPerson(); if(selPiece) deselectPiece(); if(selected) select(null,false); }
});
cv.addEventListener("pointermove",e=>{
  if(e.pointerType==="touch"){ tip.hidden=true; return; }
  if(e.buttons){ tip.hidden=true; if(!(mode==="build"&&(tool==="place"||moving))) return; }
  hoverQueued={x:e.clientX,y:e.clientY};
});
cv.addEventListener("pointerleave",()=>{ hoverQueued=null; tip.hidden=true; cv.style.cursor=""; hideGhost(); setDemoHover(null); });
function doHover(){
  if(!hoverQueued) return; const {x,y}=hoverQueued; hoverQueued=null;
  if(mode==="build"&&(tool==="place"||moving)){ lastSurf=surfaceAt(x,y); updateGhost(lastSurf); tip.hidden=true; cv.style.cursor=lastSurf&&lastSurf.ok?"crosshair":"not-allowed"; return; }
  const h=hitAt(x,y);
  let text=h?hitName(h):"";
  if(mode==="build"&&tool==="demolish"){ setDemoHover(h&&h.kind!=="place"?h:null); text=h?(h.kind==="place"||h.kind==="person"?`${text} can't be demolished`:`Demolish ${h.kind==="lot"?"this building":text}`):""; }
  cv.style.cursor=h?"pointer":"";
  if(text){ const r=$("app").getBoundingClientRect(); tip.textContent=text; tip.hidden=false; tip.style.left=(x-r.left+14)+"px"; tip.style.top=(y-r.top+14)+"px"; }
  else tip.hidden=true;
}

/* --- build panel --- */
const palEl=$("palette");
(function renderPalette(){
  const cats=[...new Set(CATALOG.map(c=>c.cat))];
  palEl.innerHTML=cats.map(cat=>`<h3>${esc(cat)}</h3><div class="pal-grid">`+CATALOG.filter(c=>c.cat===cat).map(c=>
    `<button class="card" data-t="${c.t}" aria-pressed="false">${THUMBS[c.t]?`<img src="${THUMBS[c.t]}" alt="">`:`<span class="ph"></span>`}<span>${esc(c.name)}</span></button>`).join("")+`</div>`).join("");
})();
palEl.addEventListener("click",e=>{ const b=e.target.closest(".card"); if(!b) return; if(moving) endMove(false); cur.t=b.dataset.t; cur.c=CAT_BY[cur.t].c; syncBuildOpts(); setTool("place"); if(narrowMQ.matches) setPlacesOpen(false); });
$("curSw").addEventListener("click",e=>{ const b=e.target.closest(".sw-b"); if(!b) return; cur.c=b.dataset.c; syncBuildOpts(); });
$("curSw").addEventListener("change",e=>{ if(e.target.type==="color"){ cur.c=e.target.value.toLowerCase(); syncBuildOpts(); } });
$("sizeIn").addEventListener("input",e=>{ cur.s=+e.target.value; syncBuildOpts(); });
$("rotMinus").addEventListener("click",()=>turn(-1)); $("rotPlus").addEventListener("click",()=>turn(1));
$("snapIn").addEventListener("change",e=>{ snapOn=e.target.checked; });
function syncBuildOpts(){
  palEl.querySelectorAll(".card").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.t===cur.t&&tool==="place")));
  $("curSw").innerHTML=swatchesHTML(cur.c,"cur");
  $("sizeIn").value=cur.s; $("sizeOut").textContent=cur.s.toFixed(1)+"×"; $("rotOut").textContent=degOf(cur.r)+"°";
  if(ghost&&ghost.visible){ ensureGhost(); updateGhost(lastSurf); }
}
function turn(dir){
  if(mode!=="build") return;
  if(tool==="place"||moving){ cur.r+=dir*STEP; syncBuildOpts(); if(ghost) ghost.rotation.y=cur.r; return; }
  if(selPiece){ const ex=PIECES.get(selPiece), before=ex.d, after=Object.assign({},before,{r:before.r+dir*STEP}); if(commitPiece(selPiece,after)) record({k:"upd",id:selPiece,before,after}); renderPieceCard(); }
}
function resizeBy(ds){
  if(mode!=="build") return;
  if(tool==="place"||moving){ cur.s=Math.min(2.5,Math.max(.5,+(cur.s+ds).toFixed(1))); syncBuildOpts(); return; }
  if(selPiece){ const ex=PIECES.get(selPiece), before=ex.d, after=Object.assign({},before,{s:Math.min(2.5,Math.max(.5,+(before.s+ds).toFixed(1)))}); if(commitPiece(selPiece,after)) record({k:"upd",id:selPiece,before,after}); renderPieceCard(); }
}
$("buildPane").querySelector(".tools").addEventListener("click",e=>{ const b=e.target.closest("[data-tool]"); if(b) setTool(b.dataset.tool); });
function setTool(t){
  if(moving&&t!=="edit") endMove(false);
  tool=t; setDemoHover(null); if(t!=="place") hideGhost();
  $("buildPane").querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===t)));
  syncBuildOpts(); updateHint();
}
function updateHint(){
  const h=$("hint");
  if(mode!=="build") h.innerHTML='<b>Drag</b> to pan · <b>Scroll</b> to zoom · <b>Right-drag</b> or the arrow buttons to rotate · <b>Click</b> a building';
  else if(moving) h.innerHTML='<b>Click</b> to set it down · <b>Q</b>/<b>E</b> to turn · <b>Esc</b> to cancel';
  else if(tool==="place") h.innerHTML=`Placing a <b>${esc(CAT_BY[cur.t].name.toLowerCase())}</b> · <b>Click</b> to place · <b>Q</b>/<b>E</b> to turn · <b>[</b>/<b>]</b> to resize · <b>Esc</b> to stop`;
  else if(tool==="edit") h.innerHTML='<b>Click</b> one of your buildings to edit it · <b>Del</b> demolishes the selected one';
  else h.innerHTML='<b>Click</b> any house, tower, garden or fountain to remove it · <b>Ctrl+Z</b> to undo';
}
function setMode(m){
  if(m==="build"&&(readOnly||Store.kind==="pending")) return;
  mode=m;
  $("modeExplore").setAttribute("aria-selected",String(m==="explore")); $("modeBuild").setAttribute("aria-selected",String(m==="build"));
  $("explorePane").hidden=m!=="explore"; $("buildPane").hidden=m!=="build";
  if(m==="explore"){ endMove(false); hideGhost(); setDemoHover(null); renderList(); }
  else { setTool(tool); updateCounts(); }
  if(selPiece) renderPieceCard();
  updateHint();
}
function updateModeTabs(){
  const b=$("modeBuild"), ready=Store.kind!=="pending";
  b.disabled=!ready||readOnly;
  b.title=readOnly?"This sandbox is view only for you":ready?"Add your own buildings":"Loading your saved buildings";
}
$("modeExplore").addEventListener("click",()=>setMode("explore"));
$("modeBuild").addEventListener("click",()=>{ setMode("build"); if(narrowMQ.matches) setPlacesOpen(true); });
function updateCounts(){
  const n=PIECES.size, k=REMOVED.size;
  $("counts").textContent=n||k?`${n} building${n===1?"":"s"} placed · ${k} city building${k===1?"":"s"} demolished`:"Nothing built yet. Pick something above, then click on the map to place it.";
}
function piecesChanged(){
  shadowsDirty();
  updateCounts();
  if(mode==="explore"&&!$("explorePane").hidden) renderListSoon();
  if(selPiece&&PIECES.has(selPiece)){ const g=PIECES.get(selPiece).g; marker.position.copy(g.position).setY(g.position.y+.5); marker2.position.copy(marker.position); marker.scale.setScalar(g.userData.ring); }
}
let listT=null; function renderListSoon(){ clearTimeout(listT); listT=setTimeout(renderList,120); }

/* reset */
$("resetBtn").addEventListener("click",()=>{
  const n=PIECES.size, k=REMOVED.size;
  if(!n&&!k){ toast("There's nothing to reset yet."); return; }
  $("resetText").textContent=`This removes ${n} building${n===1?"":"s"} you placed and rebuilds ${k} demolished city building${k===1?"":"s"}. You can't undo it.`;
  $("resetConfirm").hidden=false; $("resetNo").focus();
});
$("resetNo").addEventListener("click",()=>{ $("resetConfirm").hidden=true; });
$("resetYes").addEventListener("click",()=>{
  $("resetConfirm").hidden=true; if(!canWrite()) return;
  [...PIECES.keys()].forEach(id=>commitDelete(id)); commitRemoved(new Set());
  undoS.length=0; redoS.length=0; updUndo(); toast("The sandbox is back to the original city.");
});

/* toast */
let toastT=null;
function toast(msg){ const t=$("toast"); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{ t.hidden=true; },3800); }

/* keyboard */
document.addEventListener("keydown",e=>{
  const ae=document.activeElement, typing=ae&&(/^(TEXTAREA|SELECT)$/.test(ae.tagName)||(ae.tagName==="INPUT"&&!/^(range|checkbox|color|button)$/.test(ae.type)));
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&!typing&&e.key.toLowerCase()==="z"){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
  if(mod&&!typing&&e.key.toLowerCase()==="y"){ e.preventDefault(); redo(); return; }
  if(typing||mod||e.altKey) return;
  if(e.key==="Escape"){
    if(!$("resetConfirm").hidden){ $("resetConfirm").hidden=true; return; }
    if(moving){ endMove(false); return; }
    if(mode==="build"&&tool==="place"){ setTool("edit"); return; }
    if(selPerson!==null){ clearPerson(); return; }
    if(selPiece){ deselectPiece(); return; }
    if(selected) select(null,false); return;
  }
  if(mode!=="build") return;
  const k=e.key.toLowerCase();
  if(k==="q") turn(-1); else if(k==="e") turn(1);
  else if(e.key==="[") resizeBy(-.1); else if(e.key==="]") resizeBy(.1);
  else if(e.key==="1") setTool("place"); else if(e.key==="2") setTool("edit"); else if(e.key==="3") setTool("demolish");
  else if((e.key==="Delete"||e.key==="Backspace")&&selPiece){ e.preventDefault(); demolishPiece(selPiece); }
});
syncBuildOpts(); updateCounts(); updUndo();


/* ---------- people: pixel sprites made with sprite_forge, and who they are in this city ---------- */
const SPRITES=CITY.sprites||[];
const CAST=SPRITES.length?CITY.people(E):{lords:[],townsfolk:[],citizens:{count:0,sprites:[]},guards:[]};   // no sprites yet: an empty city
const HEROES=CAST.lords;
HEROES.forEach(h=>{ const p=PLACES[h.house]; if(!h.kicker) h.kicker="Lord of the "+p.name; if(!h.desc) h.desc=p.desc; });
const SOLDIER0=HEROES.length, FOLK0=SOLDIER0+HOUSES.length;   // sprite order: lords, one soldier per district, then townsfolk
const EXTRA0=FOLK0+CAST.townsfolk.length, NEXTRA=(CAST.extras||[]).length;   // then any extras: sprites only locals use (L.extra), such as another people living nearby
if(SPRITES.length&&SPRITES.length!==EXTRA0+NEXTRA) console.warn(`citymaker: ${SPRITES.length} sprites, but the city expects ${EXTRA0+NEXTRA} (${HEROES.length} lords, ${HOUSES.length} soldiers, ${CAST.townsfolk.length} townsfolk${NEXTRA?", "+NEXTRA+" extras":""})`);
const ROLES={}, ROLE_TEXT={};
HOUSES.forEach((h,k)=>ROLES[SOLDIER0+k]=(CAST.soldierNames&&CAST.soldierNames[k])||"Soldier of the "+h.name);
CAST.townsfolk.forEach((f,k)=>{ ROLES[FOLK0+k]=f.name; ROLE_TEXT[f.name]=f.text; });
const folkSprite=role=>FOLK0+CAST.townsfolk.findIndex(f=>f.role===role);

/* textures: each sheet (frames side by side) gets four variants (two animation phases, facing left or right) sharing one
   image. Every sprite has its idle sheet; a sprite whose record has anims.walk also gets a walk sheet, played while moving. */
const SHEETS=[];
function sheet(src,n,ms){
  const img=new Image(), vars=[];
  for(const flip of [0,1]) for(const phase of [0,1]){
    const tex=new THREE.Texture(img); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false;
    tex.repeat.set(flip?-1/n:1/n,1);
    vars.push({flip,phase,tex,mat:new THREE.SpriteMaterial({map:tex,alphaTest:.5})});
  }
  img.onload=()=>vars.forEach(v=>v.tex.needsUpdate=true); img.src=src;
  const sh={n,ms,acc:0,tick:0,vars}; SHEETS.push(sh); return sh;
}
const SPR=SPRITES.map(sp=>{ const w=sp.anims&&sp.anims.walk;
  return {idle:sheet(sp.src,2,520),walk:w&&w.src?sheet(w.src,w.frames||4,w.ms||150):null}; });
const matFor=(i,flip,phase,walking)=>((walking&&SPR[i].walk)||SPR[i].idle).vars[flip*2+phase].mat;   // no walk sheet: idle
// a sheet's frame advances on its own clock; the second phase runs a frame (half a walk cycle) apart, so neighbours don't march in step
function showFrame(sh){ const k=sh.n>2?sh.n/2:1; sh.vars.forEach(v=>{ const f=(sh.tick+v.phase*k)%sh.n; v.tex.offset.x=v.flip?(f+1)/sh.n:f/sh.n; }); }
function stepSheets(ms){ for(const sh of SHEETS){ sh.acc+=ms; if(sh.acc>=sh.ms){ sh.tick+=Math.floor(sh.acc/sh.ms); sh.acc%=sh.ms; showFrame(sh); } } }
SHEETS.forEach(sh=>{ sh.tick=1; showFrame(sh); });

/* ---------- daily life: a city clock, a street map people plan routes on, and a schedule for every role ---------- */
// clock: game minutes since the first midnight. Starts at 08:00. clockRate is game minutes per real second.
let clock=8*60, clockRate=1, clockPaused=false;
const hourOf=m=>(((m%1440)+1440)%1440)/60;
const untilHour=h=>clock+((((h*60-clock)%1440)+1440)%1440||1440);
function phaseOf(m){ const h=hourOf(m); return h<5?"Night":h<7?"Dawn":h<11.5?"Morning":h<14?"Midday":h<18?"Afternoon":h<21.5?"Evening":"Night"; }

/* the street map: junctions where avenues meet ring roads, joined by stretches of road */
const SQ_RING=CITY.routines.squareRing;                       // the ring walk around the central square
const RINGS_WALK=[SQ_RING,...RING_ROADS.map(r=>r[0])];
const aveEnd=a=>edgeR(a.b)-10;
const ringsOn=a=>RINGS_WALK.filter(R=>a.r0<=R+1);
const NODES=[], EDGES=[], NODE_ID={};
const node=key=>{ if(NODE_ID[key]===undefined){ NODE_ID[key]=NODES.length; NODES.push({key,adj:[]}); } return NODE_ID[key]; };
function addEdge(e){ e.id=EDGES.length; EDGES.push(e); NODES[e.u].adj.push(e); NODES[e.v].adj.push(e); }
RINGS_WALK.forEach(R=>{ const js=AVENUES.filter(a=>a.r0<=R+1).map(a=>a.b).sort((x,y)=>x-y);
  js.forEach((b,i)=>{ const b2=js[(i+1)%js.length], d=((b2-b)%360+360)%360||360;
    addEdge({kind:"ring",R,b0:b,d,u:node("J"+R+":"+b),v:node("J"+R+":"+b2),len:R*d*DEG}); }); });
AVENUES.forEach(a=>{ const stops=ringsOn(a).concat([aveEnd(a)]), key=r=>RINGS_WALK.includes(r)?"J"+r+":"+a.b:"E:"+a.b;
  for(let i=0;i<stops.length-1;i++) addEdge({kind:"ave",a,r0:stops[i],r1:stops[i+1],u:node(key(stops[i])),v:node(key(stops[i+1])),len:stops[i+1]-stops[i]}); });
// a footpath is a polyline; its points take the height of the summit or of the land below
const placeY=(x,z)=>{ const r=Math.hypot(x,z); return r<edgeR(bearingOf(x,z))-1?groundY(r):surfaceY(x,z); };
(CITY.streets.paths||[]).forEach((pa,i)=>{
  const pts=pa.points.map(([x,z,y])=>new THREE.Vector3(x,y!==undefined?y:placeY(x,z),z)), cum=[0];   // [x, z] or [x, z, height] (a bridge, a stair)
  for(let k=1;k<pts.length;k++) cum.push(cum[k-1]+pts[k].distanceTo(pts[k-1]));
  addEdge({kind:"path",pts,cum,u:node(pa.from),v:node(pa.to||"PATH:"+i),len:cum[cum.length-1]});
});
function edgePoint(e,t,lane,out){
  if(e.kind==="path"){ const d=t*e.len; let k=1; while(k<e.pts.length-1&&e.cum[k]<d) k++;
    const a=e.pts[k-1], b=e.pts[k], f=(d-e.cum[k-1])/((e.cum[k]-e.cum[k-1])||1);
    out.lerpVectors(a,b,Math.min(1,Math.max(0,f))); const dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1; out.x+=-dz/l*lane*.8; out.z+=dx/l*lane*.8; return out; }
  if(e.kind==="ring"){ const q=P(e.b0+t*e.d,e.R+lane*(e.R===SQ_RING?1:1.6)); return out.set(q.x,groundY(e.R),q.z); }
  const r=e.r0+t*(e.r1-e.r0), q=P(e.a.b,r), s=lane*(e.a.w/2-.7);
  return out.set(q.x+Math.cos(e.a.b*DEG)*s,streetY(r),q.z+Math.sin(e.a.b*DEG)*s);
}
function nearestStreet(x,z){
  const b=bearingOf(x,z); let best=null;
  for(const e of EDGES){
    let t,px,pz;
    if(e.kind==="path"){ let best2=null;
      for(let k=1;k<e.pts.length;k++){ const a=e.pts[k-1], b2=e.pts[k], dx=b2.x-a.x, dz=b2.z-a.z, L=dx*dx+dz*dz||1;
        const f=Math.min(1,Math.max(0,((x-a.x)*dx+(z-a.z)*dz)/L)), qx=a.x+dx*f, qz=a.z+dz*f, d2=(qx-x)**2+(qz-z)**2;
        if(!best2||d2<best2.d2) best2={d2,qx,qz,t:(e.cum[k-1]+f*Math.sqrt(L))/e.len}; }
      t=best2.t; px=best2.qx; pz=best2.qz; }
    else if(e.kind==="ring"){ const rel=((b-e.b0)%360+360)%360; t=rel<=e.d?rel/e.d:(rel-e.d<360-rel?1:0); const q=P(e.b0+t*e.d,e.R); px=q.x; pz=q.z; }
    else { const ux=Math.sin(e.a.b*DEG), uz=-Math.cos(e.a.b*DEG), rr=Math.min(e.r1,Math.max(e.r0,x*ux+z*uz)); t=(rr-e.r0)/(e.r1-e.r0); px=ux*rr; pz=uz*rr; }
    const d=(px-x)**2+(pz-z)**2; if(!best||d<best.d) best={e,t,d};
  }
  return best;
}
function route(from,to){ // shortest way between two points on the streets, as stretches of road
  if(from.e===to.e) return [{e:from.e,t0:from.t,t1:to.t}];
  const n=NODES.length, dist=new Array(n).fill(Infinity), prev=new Array(n).fill(null), done=new Array(n).fill(false);
  dist[from.e.u]=from.t*from.e.len; prev[from.e.u]={start:0};
  const dv=(1-from.t)*from.e.len; if(dv<dist[from.e.v]){ dist[from.e.v]=dv; prev[from.e.v]={start:1}; }
  for(;;){ let k=-1; for(let i=0;i<n;i++) if(!done[i]&&dist[i]<Infinity&&(k<0||dist[i]<dist[k])) k=i; if(k<0) break; done[k]=true;
    for(const e of NODES[k].adj){ const o=e.u===k?e.v:e.u, nd=dist[k]+e.len; if(nd<dist[o]){ dist[o]=nd; prev[o]={node:k,e}; } } }
  const cu=dist[to.e.u]+to.t*to.e.len, cv=dist[to.e.v]+(1-to.t)*to.e.len, end=cu<=cv?to.e.u:to.e.v;
  const segs=[{e:to.e,t0:end===to.e.u?0:1,t1:to.t}];
  let k=end;
  while(prev[k]&&prev[k].node!==undefined){ const {node:pk,e}=prev[k]; segs.unshift({e,t0:pk===e.u?0:1,t1:k===e.u?0:1}); k=pk; }
  segs.unshift({e:from.e,t0:from.t,t1:prev[k]&&prev[k].start===1?1:0});
  return segs;
}

/* places people go */
const V=(x,z)=>new THREE.Vector3(x,placeY(x,z),z);
const ground=v=>{ v.y=groundY(Math.hypot(v.x,v.z)); return v; };
function around(c,r0,r1){ const a=prng()*Math.PI*2, r=r0+prng()*(r1-r0); return V(c.x+Math.cos(a)*r,c.z+Math.sin(a)*r); }
const OUT_PLACES=Object.values(PLACES).filter(q=>q.pos&&Math.hypot(q.pos.x,q.pos.z)>edgeR(bearingOf(q.pos.x,q.pos.z))+6);
const placeName=q=>{ const n=q.showAs||q.name; return n.startsWith("The ")?"the"+n.slice(3):n; };
function quarterOf(p){ const r=Math.hypot(p.x,p.z); if(r<R1) return CITY.text.citadel; const b=bearingOf(p.x,p.z);
  if(r>edgeR(b)+6&&OUT_PLACES.length){ let best=OUT_PLACES[0],bd=1e18; OUT_PLACES.forEach(q=>{ const d=(q.pos.x-p.x)**2+(q.pos.z-p.z)**2; if(d<bd){ bd=d; best=q; } }); return placeName(best); }
  const h=HOUSES.find(h=>angDist(b,h.center)<=h.span/2)||HOUSES[0]; return "the quarter of the "+h.name; }
const SQUARE=V(0,0);
const PLAZAS=CITY_POI.plazas.map(p=>({pos:V(P(p.b,p.R).x,P(p.b,p.R).z),PR:p.PR,b:p.b,R:p.R}));
const GARDENS=CITY_POI.gardens.map(g=>({pos:V(g.x,g.z),R:g.R}));
const FOUNTAINS=CITY_POI.fountains.map(f=>V(f.x,f.z)).concat(PLAZAS.map(p=>p.pos));
const HOMES=CITY_POI.homes;
const MARKET_KEYS=CITY.routines.markets;                       // "ring radius:avenue bearing" of the fountain squares that hold markets
const MARKETS=PLAZAS.filter(p=>MARKET_KEYS.includes(p.R+":"+p.b)).map(p=>Object.assign(p,{n:4,sr:5.2}))
  .concat((CITY.markets||[]).map(m=>({pos:V(m.x,m.z),b:m.b||0,R:0,PR:m.r||10,n:m.stalls||8,sr:m.r||10})));   // a market square of its own, out on the land

// market stalls: set up in the morning, packed away in the evening
const STALL_COLORS=["#d6a32a","#b3373f","#3b7dc1","#3e7b48","#7b5ea8","#d9534f"];
MARKETS.forEach((m,mi)=>{ m.stalls=[];
  for(let k=0;k<m.n;k++){ const ang=(m.b-45+k*360/m.n)*DEG, x=m.pos.x+Math.cos(ang)*m.sr, z=m.pos.z+Math.sin(ang)*m.sr;
    const g=makePiece("stall",STALL_COLORS[(mi*4+k)%STALL_COLORS.length]); g.scale.setScalar(.85); g.position.set(x,placeY(x,z),z);
    g.rotation.y=Math.atan2(m.pos.x-x,m.pos.z-z); g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); scene.add(g);
    m.stalls.push({g,front:V(x+(m.pos.x-x)*.38,z+(m.pos.z-z)*.38)}); } });
const STALLS=MARKETS.flatMap(m=>m.stalls.map(s=>Object.assign(s,{market:m})));
const marketOpen=()=>{ const h=hourOf(clock); return h>=6&&h<18; };
function showStalls(){ const open=marketOpen(); STALLS.forEach(s=>{ if(s.g.visible!==open){ s.g.visible=open; shadowsDirty(); } }); }

// lamps: two at every fountain square, plus any lanterns the landmarks added
const LAMPS=[];
(function lamps(){
  const posts=[], heads=[];
  PLAZAS.forEach(p=>{ for(const s of [-1,1]){ const ang=(p.b-90+s*90)*DEG, x=p.pos.x+Math.cos(ang)*(p.PR-.6), z=p.pos.z+Math.sin(ang)*(p.PR-.6);
    const o=(HOUSES.find(h=>angDist(p.b,h.center)<=h.span/2)||HOUSES[0]).id;
    posts.push({m:M(x,p.pos.y,z,0,.14,4.4,.14),c:STYLE.palette.lampPost,o}); heads.push({m:M(x,p.pos.y+4.4,z,0,.62,.8,.62),c:STYLE.palette.lampUnlit,o});
    LAMPS.push({pos:V(x,z),idx:heads.length-1,lit:false}); } });
  instanced(CYL,lam("#ffffff"),posts);
  LAMPS.headMesh=instanced(UNIT_BOX,lam("#ffffff",{emissive:new THREE.Color("#3a2608")}),heads,false);
  LANTERNS.forEach(l=>LAMPS.push({pos:V(l.x,l.z),mesh:l.mesh,lit:false}));
})();
const LIT=new THREE.Color(STYLE.palette.lampLit), UNLIT=new THREE.Color(STYLE.palette.lampUnlit);
function setLamp(l,lit){ l.lit=lit;
  if(l.mesh) l.mesh.material.emissiveIntensity=lit?1.3:0;
  else { const c=lit?LIT:UNLIT; LAMPS.headMesh.setColorAt(l.idx,c); LAMPS.headMesh.instanceColor.needsUpdate=true;
    const inst=INST.find(x=>x.mesh===LAMPS.headMesh); if(inst) inst.base[l.idx]=c.clone(); } }   // so a district highlight restores the lamp as it is
const lampsShouldBeLit=()=>{ const h=hourOf(clock); return h>=19.5||h<6; };
function settleLamps(){ const on=lampsShouldBeLit(); LAMPS.forEach(l=>setLamp(l,on)); }

/* people */
const people=[], peopleSprites=[];
const prng=mulberry32(1510);
const pickOne=a=>a[Math.floor(prng()*a.length)];
function chooseNear(w,list,k){ let best=null,bd=1e18; for(let i=0;i<(k||3);i++){ const c=pickOne(list), p=c.pos||c, d=p.distanceToSquared(w.pos); if(d<bd){ bd=d; best=c; } } return best; }
function newWalker(i,opt){
  const s=new THREE.Sprite(matFor(i,0,people.length%2,false)); s.center.set(.5,.04); s.userData.personId=people.length;
  scene.add(s); peopleSprites.push(s);
  const w=Object.assign({i,s,pos:new THREE.Vector3(),last:new THREE.Vector3(),flip:0,phase:people.length%2,speed:3.6+prng()*2.2,bobT:prng()*10,
    lane:prng()*2-1,segs:[],sd:0,act:null,doing:"",inside:false,loc:null,offAt:null},opt);
  people.push(w); return w;
}

/* moving: a path is a list of stretches of road and short walks off the road */
const segLen=s=>s.kind==="free"?s.a.distanceTo(s.b):Math.abs(s.t1-s.t0)*s.e.len;
function segPoint(w,s,f,out){ return s.kind==="free"?out.lerpVectors(s.a,s.b,f):edgePoint(s.e,s.t0+(s.t1-s.t0)*f,w.lane,out); }
function goTo(w,target,arrive,going,instant){
  if(!w.loc&&!w.offAt) w.offAt={pos:w.pos.clone(),access:nearestStreet(w.pos.x,w.pos.z)};
  const end=nearestStreet(target.x,target.z);
  const finish=()=>{ w.offAt={pos:target.clone(),access:end}; w.loc=null; arrive(); };
  w.inside=false; w.act=null; w.doing=going;
  if(instant||reduced){ w.segs=[]; w.pos.copy(target); finish(); return; }
  const segs=[]; let start=w.loc;
  if(w.offAt){ start=w.offAt.access; segs.push({kind:"free",a:w.pos.clone(),b:edgePoint(start.e,start.t,w.lane,new THREE.Vector3())}); }
  route(start,end).forEach(r=>segs.push({kind:"edge",e:r.e,t0:r.t0,t1:r.t1}));
  segs.push({kind:"free",a:edgePoint(end.e,end.t,w.lane,new THREE.Vector3()),b:target.clone()});
  w.segs=segs.map(s=>Object.assign(s,{len:segLen(s)})).filter(s=>s.len>1e-3); w.sd=0; w.onArrive=finish;
  if(!w.segs.length){ w.onArrive=null; finish(); }
}
function moveAlong(w,dist){
  while(dist>0&&w.segs.length){
    const s=w.segs[0], left=s.len-w.sd;
    if(dist<left){ w.sd+=dist; segPoint(w,s,w.sd/s.len,w.pos); return; }
    dist-=left; segPoint(w,s,1,w.pos); w.segs.shift(); w.sd=0;
  }
  if(!w.segs.length&&w.onArrive){ const f=w.onArrive; w.onArrive=null; f(); }
}
// go somewhere, then do something there until a given time
function doAt(w,pos,act,going,at,instant){ goTo(w,pos,()=>{ w.act=act; w.inside=act.kind==="inside"; w.doing=at; if(act.onStart) act.onStart(); },going,instant); }
function homeOf(w){ if(!w.home||REMOVED.has(w.home.l)) w.home=chooseNear(w,HOMES.map(h=>({pos:V(h.x,h.z),l:h.l})),6); return w.home; }
function goHome(w,until,at,instant){ doAt(w,homeOf(w).pos,{kind:"inside",until},"Walking home",at||"At home",instant); }
const stay=(until,c,R)=>({kind:"stay",until,wander:c?{c,R}:null,next:0});

// what townsfolk do with their free time
function outing(w,instant){
  const h=hourOf(clock);
  if(h>=21.5||h<6) return goHome(w,untilHour(6)+prng()*90,"Asleep at home",instant);
  if(prng()<.12) return goHome(w,clock+20+prng()*40,"Resting at home",instant);
  const r=prng();
  const market=()=>{ if(!MARKETS.length) return plaza(); const m=chooseNear(w,MARKETS); doAt(w,around(m.pos,3.5,7),stay(clock+20+prng()*40,m.pos,6),"Walking to the market","Shopping at the market in "+quarterOf(m.pos),instant); };
  const garden=()=>{ if(!GARDENS.length) return square(); const g=chooseNear(w,GARDENS); doAt(w,around(g.pos,0,g.R*.5),stay(clock+20+prng()*50,g.pos,g.R*.5),"Going for a walk in a garden","Strolling in a garden in "+quarterOf(g.pos),instant); };
  const plaza=()=>{ if(!PLAZAS.length) return square(); const p=chooseNear(w,PLAZAS); doAt(w,around(p.pos,3.8,p.PR-1),stay(clock+15+prng()*35,p.pos,p.PR-1.2),"Walking to a fountain square","Resting by the fountain in "+quarterOf(p.pos),instant); };
  const SC=CITY.routines.squareCrowd;
  const square=()=>doAt(w,around(SQUARE,SC[0],SC[1]),stay(clock+20+prng()*50,SQUARE,SC[1]-1),"Walking up to "+CITY.text.square,"Gathering in "+CITY.text.square,instant);
  const music=()=>{ const ms=people.filter(m=>m.performing); if(!ms.length) return plaza(); const m=chooseNear(w,ms.map(x=>({pos:x.performing})),4);
    doAt(w,around(m.pos,2.2,4.5),stay(clock+20+prng()*40),"Going to hear a minstrel","Listening to a minstrel play",instant); };
  if(h<7) return r<.6?plaza():garden();
  if(h<11.5) return r<.6&&marketOpen()?market():r<.75?garden():plaza();
  if(h<14) return r<.5?square():r<.75&&marketOpen()?market():plaza();
  if(h<18) return r<.35?garden():r<.6?plaza():r<.75?square():marketOpen()?market():plaza();
  return r<.5?music():r<.8?plaza():square();
}
const ROLE_PLAN={
  citizen:outing,
  water(w,instant){ const h=hourOf(clock);
    if(h<6||h>=20) return goHome(w,untilHour(6)+prng()*60,"Asleep at home",instant);
    if(w.carrying){ w.carrying=false; return goHome(w,clock+15+prng()*25,"At home with the water",instant); }
    w.carrying=true; const f=FOUNTAINS.length?chooseNear(w,FOUNTAINS.map(p=>({pos:p})),4):{pos:SQUARE};
    doAt(w,around(f.pos,1.6,3),stay(clock+3+prng()*5),"Walking to a fountain","Filling water jars at a fountain in "+quarterOf(f.pos),instant); },
  merchant(w,instant){ const h=hourOf(clock);
    if(w.stall&&h>=6&&h<17.5) return doAt(w,w.stall.front.clone(),stay(untilHour(17.5)),"Opening the stall at the market","Selling at the market in "+quarterOf(w.stall.front),instant);
    return outing(w,instant); },
  lore(w,instant){ const h=hourOf(clock);
    if(h>=9&&h<17){ const st=CITY.routines.study;
      if(prng()<.35) return doAt(w,V(st.x0+prng()*(st.x1-st.x0),st.z),stay(clock+60+prng()*60),"Walking up to "+st.name,"Studying in "+st.name,instant);
      const hs=pickOne(HOUSES), p=P(hs.center,hs.hall[1]+14); return doAt(w,V(p.x,p.z),stay(clock+60+prng()*60),"Walking to the hall of the "+hs.name,"Reading in the hall of the "+hs.name,instant); }
    return outing(w,instant); },
  gardener(w,instant){ const h=hourOf(clock);
    if(h>=6&&h<18&&GARDENS.length){ if(!w.gardens) w.gardens=[0,1,2].map(()=>chooseNear(w,GARDENS,5)); const g=pickOne(w.gardens);
      return doAt(w,around(g.pos,0,g.R*.5),stay(clock+60+prng()*60,g.pos,g.R*.55),"Walking to a garden","Tending a garden in "+quarterOf(g.pos),instant); }
    return outing(w,instant); },
  minstrel(w,instant){ const h=hourOf(clock);
    if(h>=11.5&&h<14){ const sp=P(w.squareB,CITY.routines.minstrelRadius), spot=V(sp.x,sp.z);
      return doAt(w,spot,Object.assign(stay(untilHour(14)),{onStart:()=>w.performing=spot}),"Walking to "+CITY.text.square,"Playing for the crowd in "+CITY.text.square,instant); }
    if(h>=18&&h<21.5&&w.plaza){ const p=w.plaza, spot=around(p.pos,4.2,4.6);
      return doAt(w,spot,Object.assign(stay(untilHour(21.5)),{onStart:()=>w.performing=spot}),"Walking to a fountain square to play","Playing by the fountain in "+quarterOf(p.pos),instant); }
    return outing(w,instant); },
  mason(w,instant){ const h=hourOf(clock);
    if(h>=7&&h<17&&!(h>=12&&h<13)){ const b=chooseNear(w,HOMES.filter(x=>!REMOVED.has(x.l)).map(x=>({pos:V(x.x,x.z)})),4);
      return doAt(w,b.pos,stay(clock+60+prng()*90,b.pos,1.5),"Walking to a building that needs work","Mending the stonework of a house in "+quarterOf(b.pos),instant); }
    return outing(w,instant); },
  lamplighter(w,instant){ const h=hourOf(clock), lighting=h>=18, dousing=h>=4&&h<9;
    const todo=w.lamps.filter(l=>lighting?!l.lit:dousing?l.lit:false);
    if(todo.length&&!instant){ let best=todo[0],bd=1e18; todo.forEach(l=>{ const d=l.pos.distanceToSquared(w.pos); if(d<bd){ bd=d; best=l; } });
      const what=lighting?"Lighting the lanterns":"Putting out the lanterns at dawn";
      return doAt(w,around(best.pos,.8,1.2),Object.assign(stay(clock+.5),{onStart:()=>setLamp(best,lighting)}),what,what,instant); }
    if(h>=9&&h<18) return goHome(w,untilHour(18),"Asleep. Lamplighters work at dusk and dawn.",instant);
    if(lighting||dousing) return todo.length?goHome(w,clock+5+prng()*10,"Getting ready for the rounds",instant)
      :goHome(w,lighting?untilHour(4):untilHour(18),"At home, the rounds done",instant);
    return goHome(w,untilHour(4),"Asleep at home",instant); },
};

// townsfolk
const FOLK_ROLES=["merchant","water","lore","gardener","minstrel","mason","lamplighter"]
  .map(role=>{ const f=CAST.townsfolk.find(x=>x.role===role); return f&&[role,folkSprite(role),role==="merchant"?STALLS.length:f.count]; }).filter(Boolean);
FOLK_ROLES.forEach(([role,i,n])=>{ for(let k=0;k<n;k++){ const w=newWalker(i,{role});
  if(role==="merchant") w.stall=STALLS[k];
  if(role==="minstrel"){ const mb=CITY.routines.minstrelBearings; w.squareB=mb[k%mb.length]; w.plaza=PLAZAS[(k*5)%PLAZAS.length]; }
  if(role==="lamplighter") w.lamps=LAMPS.filter(l=>{ const b=bearingOf(l.pos.x,l.pos.z); return Math.floor(b/(360/n))===k; }); } });
const CITIZEN_SPRITES=CAST.citizens.sprites.map(folkSprite);
for(let k=0;k<CAST.citizens.count;k++) newWalker(pickOne(CITIZEN_SPRITES),{role:"citizen"});
people.forEach(w=>{ const h=pickOne(HOMES); w.home={pos:V(h.x,h.z),l:h.l}; w.pos.copy(w.home.pos); });
// lamps in no one's sixth of the city (none expected) go to the nearest lamplighter's list
const anyLamplighter=people.find(w=>w.role==="lamplighter");
if(anyLamplighter) LAMPS.forEach(l=>{ if(!people.some(w=>w.lamps&&w.lamps.includes(l))) anyLamplighter.lamps.push(l); });

// guards work in two shifts, changing at 06:00 and 18:00 (posts and texts come from the city)
const dayShift=()=>{ const h=hourOf(clock); return h>=6&&h<18; };
function guardPlan(w,instant){
  const on=(w.shift==="day")===dayShift(), until=untilHour(dayShift()?18:6);
  if(!on) return doAt(w,w.barracks,{kind:"inside",until},"Going off duty",w.offText,instant);
  doAt(w,w.post,Object.assign(w.postAct(),{until}),"Going on duty",w.onText,instant);
}
for(const shift of ["day","night"]) CAST.guards.forEach(g=>g.posts.forEach(p=>{
  newWalker(SOLDIER0+g.district,{role:"guard",shift,post:p.post.clone(),barracks:p.barracks.clone(),
    postAct:()=>Object.assign({t:0,dir:1,pause:0},p.act),onText:g.onText,offText:g.offText,note:g.note}); }));
// each district patrols its own quarter of a ring road, day and night
if(SPRITES.length) HOUSES.forEach((h,k)=>{ const c=h.center;
  for(let n=0;n<2;n++){ const w=newWalker(SOLDIER0+k,{role:"patrol",speed:2.4+prng(),doing:"On patrol in the quarter of the "+h.name});
    w.act={kind:"patrol",R:CITY.routines.patrolRing,b:(c+(n?6:-6)+360)%360,dir:n?1:-1,c,half:12,until:Infinity,pause:0}; } });
// locals: townsfolk (or a district's soldier, L.soldier) the city sets at places of its own, by day pacing between a and b, at night at home (CAST.locals)
(CAST.locals||[]).forEach(L=>{ for(let k=0;k<(L.count||1);k++){ const off=new THREE.Vector3((prng()-.5)*(L.spread||0),0,(prng()-.5)*(L.spread||0));
  newWalker(L.soldier!==undefined?SOLDIER0+L.soldier:L.extra!==undefined?EXTRA0+L.extra:folkSprite(L.sprite||"citizen"),{role:"local",local:L,speed:2+prng()*1.4,a:L.a.clone().add(off),b:(L.b||L.a).clone().add(off),
    hall:(L.home||L.a).clone(),dayText:L.dayText,nightText:L.nightText||"Asleep at home"}); } });
// the lords: by day near their halls, at night inside (where comes from the city)
const heroWalkers=HEROES.map(h=>{
  const w=newWalker(h.i,{role:"lord",hero:h,speed:2.2+prng(),a:h.a,b:h.b,hall:h.hall,dayText:h.dayText,nightText:h.nightText}); h.w=w; return w;
});
function lordPlan(w,instant){ const h=hourOf(clock);
  if(h>=7&&h<21) return doAt(w,w.a.clone(),{kind:"pace",a:w.a,b:w.b,t:0,dir:1,pause:0,until:untilHour(21)},"Going out",w.dayText,instant);
  doAt(w,w.hall.clone(),{kind:"inside",until:untilHour(7)},"Going home for the night",w.nightText,instant);
}
function think(w,instant){
  if(w.role==="patrol") return;
  w.performing=null;
  if(w.role==="guard") return guardPlan(w,instant);
  if(w.role==="lord"||w.role==="local") return lordPlan(w,instant);
  (ROLE_PLAN[w.role]||outing)(w,instant);
}
heroWalkers.forEach(w=>{ const h=w.hero; labels.push(Object.assign(makePersonLabel(w,h.short),{tier:3})); });
function makePersonLabel(w,text){
  const el=document.createElement("button"); el.className="lbl t3"; el.textContent=text; el.title=w.hero?w.hero.name:text;
  el.addEventListener("click",()=>selectPerson(w.s.userData.personId,true)); labelsEl.appendChild(el);
  return {id:"person:"+w.s.userData.personId,el,pos:new THREE.Vector3()};
}
// put everyone where they would be at this hour
function settleAll(){
  people.forEach(w=>{ w.segs=[]; w.onArrive=null; w.loc=null; w.offAt=null;
    if(w.role==="patrol"){ const a=w.act; a.b=(a.c+(prng()*2-1)*a.half+360)%360; const q=P(a.b,a.R+w.lane*1.6); w.pos.set(q.x,groundY(a.R),q.z); return; }
    if(!w.pos.lengthSq()&&w.home) w.pos.copy(w.home.pos);
    think(w,true); });
  settleLamps(); showStalls();
}

/* each frame */
const _p0=new THREE.Vector3(), _p1=new THREE.Vector3(), _sx=new THREE.Vector3();
function stepAct(w,dist,dt){
  const a=w.act; if(!a) return false;
  if(a.pause>0){ a.pause-=dt; return false; }
  if(a.kind==="pace"){ const len=a.a.distanceTo(a.b)||1; a.t+=a.dir*dist/len;
    if(a.t>=1||a.t<=0){ a.t=Math.min(1,Math.max(0,a.t)); a.dir=-a.dir; a.pause=1.5+prng()*4; }
    w.pos.lerpVectors(a.a,a.b,a.t); return true; }
  if(a.kind==="circle"){ a.b=(a.b+dist/a.R/DEG)%360; const q=P(a.b,a.R+w.lane); w.pos.set(q.x,groundY(a.R),q.z); return true; }
  if(a.kind==="patrol"){ a.b=((a.b+a.dir*dist/a.R/DEG)%360+360)%360; const d=((a.b-a.c)%360+540)%360-180;
    if(Math.abs(d)>a.half){ a.b=((a.c+Math.sign(d)*a.half)%360+360)%360; a.dir=-Math.sign(d); a.pause=1+prng()*3; }
    const q=P(a.b,a.R+w.lane*1.6); w.pos.set(q.x,groundY(a.R),q.z); return true; }
  if(a.kind==="stay"&&a.wander&&!reduced){ a.next-=dt; if(a.next<=0){ a.next=4+prng()*8;   // drift around a little
      const to=around(a.wander.c,0,a.wander.R); w.segs=[{kind:"free",a:w.pos.clone(),b:to,len:w.pos.distanceTo(to)}]; w.sd=0;
      w.onArrive=()=>{ if(w.offAt) w.offAt.pos.copy(w.pos); }; } }
  return false;
}
let peopleOn=true, selPerson=null, lastNow=0, animAcc=0, lastShown="";
const clockTimeEl=$("clkTime"), clockPhaseEl=$("clkPhase");
function showClock(){ const m=Math.floor(((clock%1440)+1440)%1440), t=String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"), day=Math.floor(clock/1440)+1;
  if(t!==lastShown){ lastShown=t; clockTimeEl.textContent=t; clockPhaseEl.textContent=phaseOf(clock)+" · Day "+day; } }
function updatePeople(now){
  const dt=Math.min(.1,(now-(lastNow||now))/1000); lastNow=now;
  stepSheets(dt*1000);
  if(!clockPaused){ const before=hourOf(clock); clock+=dt*clockRate; const after=hourOf(clock);
    if(after<before) LAMPS.forEach(l=>{ if(!l.lit) setLamp(l,true); });              // midnight
    if(before<9&&after>=9) LAMPS.forEach(l=>{ if(l.lit) setLamp(l,false); }); }      // nine in the morning
  showClock(); showStalls();
  if(!peopleOn){ peopleSprites.forEach(s=>s.visible=false); shadowMesh.visible=false; return; }
  shadowMesh.visible=true;
  const pace=Math.min(3,Math.max(1,Math.sqrt(clockRate)));   // people hurry a little when the clock runs fast
  const dist=camera.position.distanceTo(controls.target), k=Math.min(2.4,Math.max(1,dist/320)), size=4.4*k;
  const shadowM=new THREE.Matrix4();
  people.forEach((w,idx)=>{
    w.last.copy(w.pos);
    let moving=false;
    if(w.segs.length){ if(!reduced){ moveAlong(w,w.speed*pace*dt); moving=true; } }
    else { moving=!reduced&&stepAct(w,w.speed*pace*dt,dt);
      if(!w.segs.length&&w.act&&clock>=w.act.until) think(w,false);
      else if(!w.act&&!w.segs.length&&w.role!=="patrol") think(w,false); }
    if(moving){ _p0.copy(w.last).project(camera); _p1.copy(w.pos).project(camera); const dx=_p1.x-_p0.x;
      if(Math.abs(dx)>1e-5) w.flip=dx<0?1:0; }
    if(w.flip!==w.shownFlip||moving!==w.shownWalk){ w.shownFlip=w.flip; w.shownWalk=moving; w.s.material=matFor(w.i,w.flip,w.phase,moving); }   // only when facing or walking changes
    w.bobT+=dt*(moving?9:0);
    const bob=moving?Math.abs(Math.sin(w.bobT))*.28*k:0;
    w.s.visible=!w.inside;
    w.s.position.set(w.pos.x,w.pos.y+bob,w.pos.z); w.s.scale.set(size,size,1);
    shadowM.compose(_sx.set(w.pos.x,w.pos.y+.3,w.pos.z),_q.set(0,0,0,1),_p0.set(w.inside?0:.8*k,1,w.inside?0:.42*k)); shadowMesh.setMatrixAt(idx,shadowM);
  });
  shadowMesh.instanceMatrix.needsUpdate=true;
  heroWalkers.forEach(w=>{ const l=labels.find(x=>x.id==="person:"+w.s.userData.personId); if(l){ l.pos.set(w.pos.x,w.pos.y+size*1.2,w.pos.z); l.off=w.inside; } });   // the name sits clear above the head
  if(selPerson!==null){ const w=people[selPerson];
    if(marker.visible){ marker.position.set(w.pos.x,w.pos.y+.5,w.pos.z); marker2.position.copy(marker.position); }
    const el=$("psNow"); if(el&&el.textContent!==w.doing) el.textContent=w.doing; }
}
const shadowMesh=new THREE.InstancedMesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x1b2530,transparent:true,opacity:.22,depthWrite:false}),people.length);
shadowMesh.frustumCulled=false; shadowMesh.renderOrder=2; scene.add(shadowMesh);
settleAll();

/* the clock in the panel */
$("clkPlay").addEventListener("click",e=>{ clockPaused=!clockPaused; const b=e.currentTarget;
  b.setAttribute("aria-label",clockPaused?"Start the clock":"Pause the clock"); b.setAttribute("aria-pressed",String(clockPaused)); b.textContent=clockPaused?"Play":"Pause"; });
$("clkSpeed").addEventListener("click",e=>{ const b=e.target.closest("[data-rate]"); if(!b) return; clockRate=+b.dataset.rate;
  $("clkSpeed").querySelectorAll("[data-rate]").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); });
$("clkJump").addEventListener("change",e=>{ const v=e.target.value; if(v==="") return; e.target.value="";
  clock=untilHour(+v); lastShown=""; settleAll(); showClock(); toast(`It's ${phaseOf(clock).toLowerCase()} in ${CITY.name}.`); });


/* selecting a person */
function personInfo(id){
  const w=people[id];
  if(w.hero) return {name:w.hero.name,short:w.hero.short,kicker:w.hero.kicker,desc:w.hero.desc,house:w.hero.house};
  if(w.local){ const L=w.local; return {name:L.name||ROLES[w.i]||"Citizen",kicker:L.kicker||"Of "+CITY.name,desc:L.desc||ROLE_TEXT[ROLES[w.i]]||CITY.text.citizen,house:L.house}; }
  const k=w.i-SOLDIER0;
  if(k>=0&&k<12){ const h=HOUSES[k];
    return {name:ROLES[w.i],kicker:h.name,house:h.id,desc:w.note||(CAST.soldierNotes&&CAST.soldierNotes[k])
      ||`On patrol in the quarter of the ${h.name}. Their arms: ${h.heraldry.charAt(0).toLowerCase()+h.heraldry.slice(1)}.`}; }
  return {name:ROLES[w.i]||"Citizen",kicker:"Citizen of "+CITY.name,desc:ROLE_TEXT[ROLES[w.i]]||CITY.text.citizen};
}
function selectPerson(id,fly){
  if(selected) select(null,false);
  if(selPiece) deselectPiece();
  selPerson=id; refreshLabelOn();
  const w=people[id], info=personInfo(id);
  marker.visible=marker2.visible=true; marker.scale.setScalar(3.8);
  infoEl.innerHTML=`<div class="info-head"><div><p class="kicker">${esc(info.kicker)}</p><h2>${esc(info.name)}</h2></div><button id="closeInfo" aria-label="Close">&times;</button></div>
    <div class="portrait"><span role="img" aria-label="${esc(info.name)}" style="background-image:url(${SPRITES[w.i].src})"></span></div>
    <p class="desc">${esc(info.desc)}</p>
    <p class="now"><span class="flabel">Right now</span><span id="psNow">${esc(w.doing)}</span></p>
    ${info.house&&PLACES[info.house]?`<div class="acts"><button id="psHouse" class="primary">Show ${esc(PLACES[info.house].showAs||PLACES[info.house].name)}</button></div>`:""}
    <p class="src">Sprite made with sprite_forge from the Adventurer Workshop.</p>`;
  infoEl.hidden=false;
  $("closeInfo").addEventListener("click",clearPerson);
  const hb=$("psHouse"); if(hb) hb.addEventListener("click",()=>select(info.house));
  renderList();
  if(fly) flyTo(w.pos,95);
}
function clearPerson(){ if(selPerson===null) return; selPerson=null; marker.visible=marker2.visible=false; infoEl.hidden=true; refreshLabelOn(); renderList(); }

$("peopleToggle").addEventListener("click",e=>{
  peopleOn=!peopleOn; e.currentTarget.setAttribute("aria-pressed",String(peopleOn));
  if(!peopleOn) clearPerson();
});


/* ---------- loop ---------- */
const _n1=new THREE.Vector3(), _n2=new THREE.Vector3();
function frame(now){
  requestAnimationFrame(frame);
  if(tween) stepTween(now);
  controls.update();
  { const p=camera.position, gy=surfaceY(p.x,p.z)+2.2;                    // never below the ground (the camera rises, still looking at the same spot)
    if(p.y<gy){ p.y=gy; camera.lookAt(controls.target); }
    const phi=curPhi(), f=Math.min(1,Math.max(0,(phi-TILT)/(1.35-TILT)));
    scene.fog.near=FOG0[0]+(FOG_LOW[0]-FOG0[0])*f; scene.fog.far=FOG0[1]+(FOG_LOW[1]-FOG0[1])*f;
    const eye=$("eyeView"), on=String(phi>1.15); if(eye.getAttribute("aria-pressed")!==on) eye.setAttribute("aria-pressed",on); }
  shiftView();
  updatePeople(now);
  doHover();
  if(marker.visible){
    const s=selPerson!==null?3.4:selPiece&&PIECES.has(selPiece)?PIECES.get(selPiece).g.userData.ring:selected?PLACES[selected].ring:1, ph=reduced?0:((now/1600)%1);
    marker.material.opacity=.75+.2*Math.sin(now/300);
    marker2.scale.setScalar(s*(1+ph*.5)); marker2.material.opacity=.55*(1-ph);
  }
  { const wi=reduced?1:1+.25*Math.sin(now/420); WATER.forEach(m=>m.emissiveIntensity=wi); }
  _n1.copy(controls.target).project(camera); _n2.copy(controls.target).add(new THREE.Vector3(0,0,-10)).project(camera);
  needle.setAttribute("transform",`rotate(${(Math.atan2(_n2.x-_n1.x,_n2.y-_n1.y)/DEG).toFixed(1)} 12 12)`);
  updateLabels();
  if(mode==="build"&&(moving||tool==="place")) shadowsDirty();             // a piece being placed or moved casts its shadow as it goes
  renderer.render(scene,camera);
}
renderList();
const start=(location.hash||"").slice(1);
if(PLACES[start]) setTimeout(()=>select(start),300);
requestAnimationFrame(frame);
})();
