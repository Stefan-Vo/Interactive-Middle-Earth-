/* Landmark recipes for citymaker: ready-made pieces a city's landmarks(E) can call, so a new city doesn't have to build
   bridges, falls, herds or whole satellite towns from boxes. The engine adds them to E before the landmarks are built.
   They take their colors from the style's look (styles/<style>.js), so the same recipe suits Elves or Rohirrim.

     E.bridge(add, [x,z], [x,z], {y | y0,y1, w, span, arches, spires, cutwaters, lamps})   a bridge on piers and arches
     E.waterfall(add, [x,y,z] top, [x,y,z] bottom, width, {cave})                          a fall of white water
     E.stair(add, [x,y,z] from, [x,y,z] to, width)                                          steps built up from the ground
     E.lamp(add, x, y, z, height)                                                           a lamp the lamplighters light
     E.arcRing(add, material, x, y, z, radius, count, height)                               a ring of arch panels
     E.scatter({kind, n, area, size, colors, owner, seed, keep})                            trees, cypresses, pines, rocks, reeds, snow
     E.herd(add, x, z, count, {spread, seed})                                               a herd of horses
     E.distantPeaks(add, x, z, {heights, smoke})                                            dark peaks on the horizon (Thangorodrim)
     E.fields({area, cell, avoid, owner, seed})                                             a patchwork of farmland with hedgerows
     E.town({c, y0, radii, levelH, gate, keep, seed, tower})                                a small terraced town on a shelf of rock
     E.quay(add, [[x,z],...], {y, w, bed, bollardEvery, lamps, lampEvery})                  a stone embankment along a shore
     E.pier(add, [x,z] from, [x,z] to, {y, w, bed, stone})                                   a jetty on posts (or stone piers) out into the water
     E.boat(add, x, z, yaw, {len, y, sail, color, sailColor})                                a small boat; yaw 0 points it along +x
     E.mist({n, area, y, size, opacity, flat, seed, keep})                                    soft banks of mist over water or low ground
     E.camp({c, n, r, stretch, size, colors, banner, fires, seed, owner, keep})               a camp of tents and pavilions, with fires and banners
     E.huts({c, n, r, size, wall, thatch, stilts, racks, fire, seed, owner, keep})            round thatched huts (on stilts at the water's edge)
     E.track([[x,z],...], {w, color, owner})                                                 a beaten path over the land, following the ground
     E.hall(add, x, z, {w, d, h, yaw, porch, tower, wall, roof, doors})                      a big building on the land: a hall, a barn, a storehouse
     E.tower(add, x, z, {r, h, roof, beacon, banner})                                        a round watchtower, with a beacon if asked

   Terrain recipes live in the city's terrain settings instead, because they shape the ground before anything is built:
     terrain.shelves: [{x, z, r, y, side}]   cut the land level, e.g. a shelf on a mountain or a pinnacle of rock
     terrain.water:   {level, bed, rivers:[{points, width:[w0,w1]}], pools:[{x,z,r}], carve(x,z), color, place}
                      carves rivers and pools below the water and lays one sheet of water at its level (owned by place) */
(function(){
window.CITYMAKER_RECIPES=function(E){
  const {THREE}=E, DEG=Math.PI/180;
  const hash=(i,k)=>{ const v=Math.sin(i*127.1+k*311.7+(i*k)%7*.13)*43758.5453; return v-Math.floor(v); };
  const L=Object.assign({stone:"#f4f1ea",shade:"#cfc9ba",marble:"#e6e0d2",roof:"#6f8ea8",spire:"#c9d1d8",gold:"#d8b34a",wood:"#6b4a2e",paving:"#ebe6d8",leaf:"#4a7b3a",spires:false},E.STYLE.look||{});
  const mats={}, mat=(k,c,o)=>mats[k]||(mats[k]=E.lam(c,o));   // one material per color, shared by every recipe
  const M=()=>({stone:mat("stone",L.stone),shade:mat("shade",L.shade),marble:mat("marble",L.marble),roof:mat("roof",L.roof),spire:mat("spire",L.spire),
    gold:mat("gold",L.gold,{emissive:new THREE.Color("#2a1e04")}),wood:mat("wood",L.wood),glass:mat("glass","#3b4654"),leaf:mats.leaf||(mats.leaf=new THREE.MeshPhongMaterial({color:new THREE.Color(L.leaf),flatShading:true,shininess:4}))});
  // an arch panel: the style's own (eldarin's pointed lancet), or a round arch
  let ROUND=null;
  const archGeo=()=>{ if(E.STYLE.arcadeGeo) return E.STYLE.arcadeGeo(THREE); if(ROUND) return ROUND;
    const s=new THREE.Shape(); s.moveTo(-.5,0); s.lineTo(.5,0); s.lineTo(.5,1); s.lineTo(-.5,1); s.lineTo(-.5,0);
    const h=new THREE.Path(); h.moveTo(-.32,.06); h.lineTo(.32,.06); h.lineTo(.32,.6); h.absarc(0,.6,.32,0,Math.PI,false); h.lineTo(-.32,.06);
    s.holes.push(h); return ROUND=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:8}).translate(0,0,-.5); };
  const along=(p0,p1)=>{ const dx=p1[0]-p0[0], dz=p1[1]-p0[1], len=Math.hypot(dx,dz)||1; return {len,ux:dx/len,uz:dz/len,yaw:Math.atan2(-dz,dx),px:-dz/len,pz:dx/len}; };

  function lamp(add,x,y,z,h){ h=h||4; add(E.CYL,mat("post","#6a6152"),x,y,z,.13,h,.13);
    E.addLantern(add(E.UNIT_BOX,E.lam("#ffd88a",{emissive:new THREE.Color("#b8741e")}),x,y+h,z,.55,.75,.55),x,z); }
  function arcRing(add,m,cx,y,cz,r,n,h){ const G=archGeo(); for(let k=0;k<n;k++){ const a=(k+.5)/n*Math.PI*2, len=2*r*Math.sin(Math.PI/n)+.1;
    add(G,m,cx+Math.sin(a)*r,y,cz+Math.cos(a)*r,len,h,.5).rotation.y=a; } }

  // a bridge: piers every span, arches between them sized to the ground below, a deck (level, or sloping from y0 to y1), parapets
  function bridge(add,p0,p1,o){ o=o||{}; const m=M(), {len,ux,uz,yaw,px,pz}=along(p0,p1), W=o.w||7, y0=o.y0??o.y, y1=o.y1??o.y;
    const P=t=>[p0[0]+ux*t,p0[1]+uz*t], deckY=t=>y0+(y1-y0)*t/len, base=t=>{ const [x,z]=P(t); return Math.max(-6,E.surfaceY(x,z)); };
    const n=Math.max(1,Math.round(len/(o.span||14))), S=[...Array(n+1)].map((_,i)=>i*len/n), spires=o.spires??L.spires, wl=o.waterLevel;
    S.forEach(t=>{ const [x,z]=P(t), D=deckY(t), b0=base(t)-1; if(D-b0<2.5) return;
      add(E.UNIT_BOX,m.marble,x,b0,z,3,D-1.2-b0,W+.6,yaw);
      if(o.cutwaters&&wl!==undefined&&b0<wl) for(const k of [-1,1]) add(E.UNIT_BOX,m.shade,x+px*k*(W/2+.4),b0,z+pz*k*(W/2+.4),2.6,Math.min(D-1.2,wl+2.4)-b0,2.6,yaw+Math.PI/4);
      if(spires) for(const k of [-1,1]) add(E.CONE,m.spire,x+px*k*W/2,D+.9,z+pz*k*W/2,.42,2.8,.42); });
    if(o.arches!==false) for(let i=0;i<n;i++){ const t0=S[i]+1.5, t1=S[i+1]-1.5, [x,z]=P((t0+t1)/2), D=Math.min(deckY(t0),deckY(t1))-1.2, b0=Math.min(base(t0),base(t1))-1;
      if(D-b0<3.5) continue; add(archGeo(),m.stone,x,b0,z,t1-t0+.3,D-b0,W-.8,yaw); }
    for(let i=0;i<n;i++){ const t0=S[i], t1=S[i+1], [x,z]=P((t0+t1)/2), a=deckY(t0), b=deckY(t1), tilt=Math.atan2(b-a,t1-t0), l=Math.hypot(t1-t0,b-a)+.1;
      add(E.UNIT_BOX,m.marble,x,(a+b)/2-1.2,z,l,1.2,W+.2,yaw).rotation.z=tilt;
      for(const k of [-1,1]) add(E.UNIT_BOX,m.stone,x+px*k*W/2,(a+b)/2,z+pz*k*W/2,l,.9,.45,yaw).rotation.z=tilt; }
    if(o.lamps!==false) for(let t=26;t<len-10;t+=o.lampEvery||44){ const [x,z]=P(t); lamp(add,x+px*(W/2-.3),deckY(t),z+pz*(W/2-.3)); } }

  // a sheet of falling water between a top edge and a bottom edge (each centered, with a half-width), across direction tan
  function sheet(add,material,top,tw,bot,bw,tan){ const [tx,tz]=tan, v=new Float32Array([top[0]-tx*tw,top[1],top[2]-tz*tw, top[0]+tx*tw,top[1],top[2]+tz*tw, bot[0]+tx*bw,bot[1],bot[2]+tz*bw, bot[0]-tx*bw,bot[1],bot[2]-tz*bw]);
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(v,3)); geo.setIndex([0,1,2,0,2,3]); geo.computeVertexNormals(); return add(geo,material,0,0,0,1,1,1); }
  let FOAM=null;
  function waterfall(add,top,bot,w,o){ o=o||{};
    if(!FOAM){ FOAM=E.lam("#dceef6",{emissive:new THREE.Color("#30505e"),transparent:true,opacity:.85}); FOAM.side=THREE.DoubleSide; E.addWater(FOAM); }
    const dx=bot[0]-top[0], dz=bot[2]-top[2], l=Math.hypot(dx,dz)||1, tan=[-dz/l,dx/l];
    if(o.cave!==false) add(archGeo(),mat("cave","#2a2724"),top[0],top[1]-2,top[2],w+2,6,1.5,Math.atan2(-tan[1],tan[0]));   // the dark arch the water breaks from
    sheet(add,E.curtainMat,top,w*.5,bot,w*.7,tan); sheet(add,FOAM,[top[0],top[1]-.2,top[2]],w*.28,bot,w*.4,tan);
    for(let k=0;k<6;k++){ const a=k*1.1; add(E.CONE,E.sprayMat,bot[0]+Math.cos(a)*w*.4,bot[1],bot[2]+Math.sin(a)*w*.4,1.2,2.4+(k%3),1.2); } }

  // a stair: steps from one point to another, each built up from the ground below it
  function stair(add,a,b,w,o){ o=o||{}; const m=M(), n=o.steps||Math.max(4,Math.round(Math.hypot(b[0]-a[0],b[2]-a[2])/1.1)), yaw=Math.atan2(b[0]-a[0],b[2]-a[2]);
    for(let i=0;i<n;i++){ const f=(i+.5)/n, x=a[0]+(b[0]-a[0])*f, y=a[1]+(b[1]-a[1])*f, z=a[2]+(b[2]-a[2])*f, base=Math.min(E.surfaceY(x,z),y)-1.5;
      add(E.UNIT_BOX,m.marble,x,base,z,w,y-base,Math.hypot(b[0]-a[0],b[2]-a[2])/n+.15,yaw); } }

  // things scattered over ground: one instanced mesh per call. area: {x,z,r} | {x0,x1,z0,z1} | a function i -> [x,z]
  const KINDS={tree:{geo:()=>E.BLOB,phong:true,s:[2.4,3],lift:1,colors:["#3f7535","#5b8c44","#4f7a3a"]},
    cypress:{geo:()=>E.CONE,s:[1.1,6.5],colors:["#3f7535","#4f8040"]}, pine:{geo:()=>E.CONE,s:[4.6,15],colors:["#2f4a33","#365538","#26402b"]},
    rock:{geo:()=>E.BLOB,s:[9,12],sink:2,colors:["#8e8a82","#7a776f"]}, reed:{geo:()=>E.CONE,s:[.9,2.8],colors:["#9aa65a","#7f8f4a"]},
    snow:{geo:()=>E.BLOB,s:[16,10],sink:6,colors:["#f1f4f6"]}};
  function scatter(o){ const K=KINDS[o.kind]||KINDS.tree, items=[], seed=o.seed||1, A=o.area;
    for(let i=0;i<o.n;i++){ let x,z;
      if(typeof A==="function"){ const p=A(i,hash(i,seed),hash(i,seed+1)); if(!p) continue; [x,z]=p; }
      else if(A.r!==undefined){ const a=hash(i,seed)*Math.PI*2, r=Math.sqrt(hash(i,seed+1))*A.r; x=A.x+Math.cos(a)*r; z=A.z+Math.sin(a)*r; }
      else { x=A.x0+hash(i,seed)*(A.x1-A.x0); z=A.z0+hash(i,seed+1)*(A.z1-A.z0); }
      const y=E.surfaceY(x,z); if(o.keep&&!o.keep(x,z,y)) continue;
      const k=(o.size?o.size[0]+hash(i,seed+2)*(o.size[1]-o.size[0]):.8+hash(i,seed+2)*.6), [sx,sy]=K.s, cs=o.colors||K.colors;
      items.push({m:E.M(x,y+(K.lift?sy*k*.75:0)-(K.sink||0),z,hash(i,seed+3)*6,sx*k,sy*k,sx*k),c:cs[Math.floor(hash(i,seed+4)*cs.length)],o:o.owner}); }
    return E.instanced(K.geo(),K.phong?new THREE.MeshPhongMaterial({color:0xffffff,flatShading:true,shininess:4}):E.lam("#ffffff"),items,o.kind!=="reed"&&o.kind!=="snow"); }

  // a herd of horses, a little larger than life so they read from above
  const COATS=["#6b4a2e","#8a5a34","#3a2a20","#c9c4bc","#a3784e","#2e2622","#d8d2c6","#7a5638","#5a3a26","#b39070","#e6e0d6","#43302a","#9a7a5a","#f1ede6"];
  function herd(add,cx,cz,n,o){ o=o||{}; const sp=o.spread||40, seed=o.seed||20, tail=mat("tail","#2a201a");
    for(let i=0;i<n;i++){ const x=cx+(hash(i,seed)-.5)*2*sp, z=cz+(hash(i,seed+1)-.5)*2*sp*.8, y=E.surfaceY(x,z), m=mat("coat"+i%COATS.length,COATS[i%COATS.length]);
      const yaw=hash(i,seed+2)*6.28, c=Math.cos(yaw), s=Math.sin(yaw), k=1.7, part=(px,py,pz,sx,sy,sz,rz)=>{ const q=add(E.UNIT_BOX,m,x+(px*c+pz*s)*k,y+py*k,z+(-px*s+pz*c)*k,sx*k,sy*k,sz*k,yaw); if(rz) q.rotation.z=rz; return q; };
      part(0,1.3,0,2.4,1,.9); for(const lx of [-.9,.9]) for(const lz of [-.3,.3]) part(lx,0,lz,.22,1.35,.22);
      part(1.2,1.9,0,.45,1.2,.5,-.6); part(1.85,2.35,0,.9,.4,.4,i%3?-.9:-.2);
      add(E.UNIT_BOX,tail,x+(-1.35*c)*k,y+1.3*k,z+(1.35*s)*k,.2*k,.9*k,.2*k,yaw); } }

  // dark peaks far off, drawn without fog so they stand out against the sky, with smoke above
  function distantPeaks(add,x,z,o){ o=o||{}; const dark=new THREE.MeshLambertMaterial({color:0x2a2324,fog:false});
    (o.peaks||[[0,0,150,640],[-150,90,110,500],[140,70,100,460]]).forEach(([dx,dz,r,h])=>add(E.CONE,dark,x+dx,0,z+dz,r,h,r));
    if(o.smoke!==false){ const sm=new THREE.MeshLambertMaterial({color:0x4a4446,transparent:true,opacity:.5,depthWrite:false,fog:false}), top=Math.max(...(o.peaks||[[0,0,0,640]]).map(p=>p[3]));
      for(let k=0;k<6;k++) add(new THREE.IcosahedronGeometry(1,1),sm,x+(k-2.5)*40,top+k*70,z-k*30,90+k*16,50+k*8,90+k*16); } }

  // a patchwork of fields with hedgerows and the odd tree, as instanced slabs. area: {x0,x1,z0,z1}; avoid(x,z) skips a field
  function fields(o){ const A=o.area, [cw,cd]=o.cell||[52,42], seed=o.seed||30, COL=o.colors||["#d8c06a","#c9b45a","#b9b06a","#93ad5e","#8a6a48","#a5bd6a","#d1b95e"];
    const slabs=[], hedges=[], trees=[];
    for(let gx=Math.floor(A.x0/cw);gx<=Math.ceil(A.x1/cw);gx++) for(let gz=Math.floor(A.z0/cd);gz<=Math.ceil(A.z1/cd);gz++){
      const i=(gx+500)*1000+gz+500, w=cw*(.88+hash(i,seed)*.27), d=cd*(.8+hash(i,seed+1)*.24), x=gx*cw+hash(i,seed+2)*6, z=gz*cd+hash(i,seed+3)*6;
      if(o.avoid&&o.avoid(x,z,w,d)) continue; const y=E.surfaceY(x,z);
      slabs.push({m:E.M(x,y-.32,z,0,w,.5,d),c:COL[Math.floor(hash(i,seed+4)*COL.length)],o:o.owner});
      if(hash(i,seed+5)<.75) hedges.push({m:E.M(x,E.surfaceY(x,z-d/2-2),z-d/2-2,0,w+3,1.1,1.1),c:"#4f7a3a",o:o.owner});
      if(hash(i,seed+6)<.75) hedges.push({m:E.M(x-w/2-2,E.surfaceY(x-w/2-2,z),z,0,1.1,1.1,d+3),c:"#4f7a3a",o:o.owner});
      if(hash(i,seed+7)<.3) trees.push({m:E.M(x+w/2,E.surfaceY(x+w/2,z+d/2)+3,z+d/2,0,3.4,3.6,3.4),c:hash(i,seed+8)<.5?"#5f8f45":"#4d7c3a",o:o.owner}); }
    E.instanced(E.UNIT_BOX,E.lam("#ffffff"),slabs,false); E.instanced(E.UNIT_BOX,E.lam("#ffffff"),hedges);
    E.instanced(E.BLOB,new THREE.MeshPhongMaterial({color:0xffffff,flatShading:true,shininess:4}),trees); }

  // a small terraced town on a shelf of rock: terraces faced with arches climbing to a tower, houses in rings, its own wall,
  // a gate with a stair down the rock. radii: [outer wall, then each terrace inward]; each terrace stands levelH higher.
  function town(o){ const g=new THREE.Group(), add=E.adder(g), m=M(), [cx,cz]=o.c, Y0=o.y0, H=o.levelH||9, radii=o.radii, RW=radii[0], seed=o.seed||40;
    const gate=o.gate??70, keep=o.keep||[], clear=(b,pad)=>keep.some(k=>Math.abs(((b-k)%360+540)%360-180)<pad)||Math.abs(((b-gate)%360+540)%360-180)<pad;
    const atN=(b,r)=>[cx+r*Math.sin(b*DEG),cz-r*Math.cos(b*DEG)], top=Y0+(radii.length-1)*H;
    radii.forEach((r,i)=>{ const d=new THREE.CircleGeometry(i?r:r-1,64); d.rotateX(-Math.PI/2); const pv=E.flat(d,E.paveMat(i===radii.length-1?L.paving:i?"#ebe3d0":"#e6dcc6",3+i),Y0+i*H+.03); pv.position.set(cx,Y0+i*H+.03,cz); g.add(pv); });
    for(let i=1;i<radii.length;i++){ const r=radii[i], y0=Y0+(i-1)*H, y1=y0+H, n=Math.round(r*2*Math.PI/2.6);       // the terrace walls
      add(E.CYL,m.shade,cx,y0,cz,r,H,r); arcRing(add,m.stone,cx,y0,cz,r+.3,n,H/2); arcRing(add,m.stone,cx,y0+H/2,cz,r+.3,n,H/2);
      for(let k=0;k<n;k++){ const a=(k+.5)/n*Math.PI*2; add(E.UNIT_BOX,m.stone,cx+Math.sin(a)*(r-.3),y1,cz+Math.cos(a)*(r-.3),.3,1,.3); }
      if(L.spires) for(let k=0;k<14;k++){ const a=(k+.5)/14*Math.PI*2; add(E.CONE,m.spire,cx+Math.sin(a)*(r+.5),y1,cz+Math.cos(a)*(r+.5),.42,3.4,.42); }
      const N=10; for(let s=0;s<N;s++){ const [x,z]=atN(gate,r+1+(N-s-.5)*1.1); add(E.UNIT_BOX,m.marble,x,y0,z,4,(s+1)*H/N,1.15,-gate*DEG); }   // a stair up, in line with the gate
      const [ax,az]=atN(gate,r+.4); add(archGeo(),m.stone,ax,y1,az,6,7,1.4,-gate*DEG); }
    if(o.wall!==false){ const n=Math.round(RW*2*Math.PI/2.4);                                                      // the outer wall and the gate
      for(let k=0;k<n;k++){ const b=(k+.5)/n*360; if(Math.abs(((b-gate)%360+540)%360-180)<6) continue; const [x,z]=atN(b,RW), len=2*RW*Math.sin(Math.PI/n)+.3;
        add(E.UNIT_BOX,m.shade,x,Y0,z,len,6,1.6,-b*DEG); add(archGeo(),m.stone,x+Math.sin(b*DEG)*.9,Y0+1.2,z-Math.cos(b*DEG)*.9,len,4.8,.4,-b*DEG); add(E.UNIT_BOX,m.stone,x,Y0+6,z,len,.5,2.2,-b*DEG); }
      for(let b=20;b<360;b+=40){ if(Math.abs(((b-gate)%360+540)%360-180)<14) continue; const [x,z]=atN(b,RW); add(E.CYL,m.stone,x,Y0,z,1.6,13,1.6); add(E.CONE,m.spire,x,Y0+13,z,1.9,L.spires?8:4,1.9); }
      for(const s of [-1,1]){ const [x,z]=atN(gate+s*7,RW); add(E.CYL,m.stone,x,Y0,z,2.3,17,2.3); add(E.CONE,m.spire,x,Y0+17,z,2.6,L.spires?12:5,2.6); add(E.CONE,m.gold,x,Y0+(L.spires?28:21.5),z,.4,2.4,.4); }
      const [gx,gz]=atN(gate,RW); add(archGeo(),m.stone,gx,Y0,gz,8,12,2.4,-gate*DEG); add(E.UNIT_BOX,m.shade,gx,Y0+11,gz,8,2,2,-gate*DEG);
      if(o.stair!==false){ const [a,b]=[atN(gate,RW+1.5),atN(gate,RW+1.5+(o.stairLength||37))]; stair(add,[a[0],Y0,a[1]],[b[0],o.stairTo??2,b[1]],4.2); } }
    // houses in rings on every terrace but the top: tall and narrow, steep roofs, arched windows outward, pinnacles, domed rotundas, trees
    const roofC=new THREE.Color(L.roof), bodyA=new THREE.Color(L.stone).lerp(new THREE.Color(L.shade),.15), bodyB=new THREE.Color(L.shade); let i=0;
    for(let t=0;t<radii.length-1;t++){ const outer=radii[t]-(t?3.4:2.5), inner=radii[t+1]+3.4, y=Y0+t*H;
      for(let rr=inner;rr<=outer;rr+=5.6){ const step=5.4/rr/DEG;
        for(let b=hash(rr,seed)*step;b<360;b+=step,i++){ if(clear(b,13)) continue;
          const [x,z]=atN(b,rr), k=hash(i,seed+1), yaw=-b*DEG, out=[Math.sin(b*DEG),-Math.cos(b*DEG)];
          if(k<.16){ add(E.CONE,m.leaf,x,y,z,1.1,6+hash(i,seed+2)*2,1.1); continue; }
          if(k<.26){ add(E.CYL,m.shade,x,y,z,2.4,6,2.4); arcRing(add,m.stone,x,y,z,2.6,8,5.6); add(E.HDOME,mat("dome","#f7f2e6"),x,y+6,z,2.5,2.4,2.5); add(E.CONE,m.gold,x,y+8.3,z,.25,1.4,.25); continue; }
          const w=3.2+hash(i,seed+3)*1.8, d=4+hash(i,seed+4)*1.4, ht=5+hash(i,seed+5)*4+(rr>outer-3?3:0), rh=3+hash(i,seed+6)*3;
          add(E.UNIT_BOX,mat("house"+(i%4),"#"+bodyA.clone().lerp(bodyB,(i%4)/4).getHexString()),x,y,z,w,ht,d,yaw);
          add(E.PYRAMID,mat("hroof"+(i%3),"#"+roofC.clone().lerp(new THREE.Color("#2f5b8c"),(i%3)*.1).getHexString()),x,y+ht,z,w+.3,rh,d+.3,yaw);
          add(archGeo(),m.stone,x+out[0]*(d/2+.12),y+ht*.12,z+out[1]*(d/2+.12),w*.9,ht*.78,.25,yaw);
          if(L.spires&&hash(i,seed+7)<.4) for(const s of [-1,1]) add(E.CONE,m.spire,x+Math.cos(b*DEG)*s*w*.45+out[0]*d*.42,y+ht,z+Math.sin(b*DEG)*s*w*.45+out[1]*d*.42,.3,2.6,.3); } } }
    { const [fx,fz]=atN(gate,radii[1]+6); add(E.CYL,m.marble,fx,Y0,fz,2.4,.8,2.4); const w=add(E.CYL,E.waterMat(),fx,Y0+.72,fz,2.1,.12,2.1); E.addWater(w.material); E.addFountainPOI(fx,fz); }
    [gate-25,gate+25,gate+180].forEach(b=>{ const [x,z]=atN(b,radii[1]+2.5); lamp(add,x,Y0,z); });
    if(o.tower!==false){ const Y=top;                                                                              // the tower on the top terrace
      add(E.OCT,m.shade,cx,Y,cz,6.5,9,6.5); arcRing(add,m.stone,cx,Y,cz,6.9,12,8.6); add(E.OCT,m.stone,cx,Y+9,cz,7.4,.7,7.4);
      add(E.CYL,m.stone,cx,Y+9.7,cz,3.2,40,3.2);
      for(let j=0;j<6;j++) for(let k=0;k<4;k++){ const a=k*Math.PI/2+.4; add(E.UNIT_BOX,m.glass,cx+Math.sin(a)*3.22,Y+14+j*5.6,cz+Math.cos(a)*3.22,.7,2.6,.2,a); }
      add(E.OCT,m.marble,cx,Y+49.7,cz,4.4,.6,4.4);
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(E.CYL,m.stone,cx+Math.sin(a)*2.8,Y+50.3,cz+Math.cos(a)*2.8,.22,4.4,.22); }
      const beacon=add(E.BALL,E.lam("#fff1c4",{emissive:new THREE.Color("#c99a2e")}),cx,Y+52.4,cz,1.1,1.1,1.1);
      const glow=E.glowSprite("rgba(255,215,130,.45)",12); glow.position.copy(beacon.position); g.add(glow); E.addLantern(beacon,cx,cz);
      add(E.OCT,m.marble,cx,Y+54.7,cz,3.4,.5,3.4); add(E.CONE,m.spire,cx,Y+55.2,cz,3.4,24,3.4); add(E.CONE,m.gold,cx,Y+77,cz,.45,3.6,.45);
      for(let k=0;k<6;k++){ const b=k*60+30; if(clear(b,12)) continue; const [x,z]=atN(b,radii[radii.length-1]-2.5); add(E.CONE,m.leaf,x,Y,z,1,5.5,1); } }
    for(let k=0;k<26;k++){ const b=hash(k,seed+9)*360; if(Math.abs(((b-gate)%360+540)%360-180)<10) continue; const [x,z]=atN(b,RW+4+hash(k,seed+10)*8), y=E.surfaceY(x,z);   // green below the wall
      if(y<4) continue; if(hash(k,seed+11)<.4) add(E.CONE,m.leaf,x,y,z,1.1,6,1.1); else add(E.BLOB,m.leaf,x,y+2.2,z,2.4,2.8,2.4); }
    return g; }

  // the water a city's terrain.water asks for: one sheet at its level (the rivers and pools are carved into the land by the engine)
  function initWater(){ const W=window.CITY.terrain.water; if(!W) return;
    const g=new THREE.Group(), w=E.lam(W.color||"#3a6d90",{emissive:new THREE.Color(W.glow||"#081c2a")}); E.addWater(w);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(W.size?W.size[0]:2400,W.size?W.size[1]:2400).rotateX(-Math.PI/2),w); s.position.set(W.center?W.center[0]:0,W.level,W.center?W.center[1]:0); g.add(s);
    if(W.place) E.own(W.place,g); else E.scene.add(g); }

  // a harbour's pieces. The bed defaults to the city's terrain.water bed, so posts and walls reach down into the water.
  const BED=()=>{ const W=window.CITY.terrain.water; return W?(W.bed??W.level-4.4):-5; };
  function quay(add,pts,o){ o=o||{}; const m=M(), y=o.y??1, W=o.w||5, bed=o.bed??BED(), post=mat("post","#6a6152");
    let run=0;
    for(let i=0;i<pts.length-1;i++){ const {len,ux,uz,yaw,px,pz}=along(pts[i],pts[i+1]), [x0,z0]=pts[i];
      add(E.UNIT_BOX,m.shade,x0+ux*len/2,bed,z0+uz*len/2,len+.6,y-bed,W,yaw);                       // the wall and its fill
      add(E.UNIT_BOX,m.marble,x0+ux*len/2+px*(W/2-.5),y,z0+uz*len/2+pz*(W/2-.5),len+.6,.35,1.1,yaw); // the coping on the water side
      for(let t=(o.bollardEvery||9)-run%(o.bollardEvery||9);t<len;t+=o.bollardEvery||9) add(E.CYL,post,x0+ux*t+px*(W/2-.6),y+.35,z0+uz*t+pz*(W/2-.6),.32,.9,.32);
      if(o.lamps!==false) for(let t=12;t<len-4;t+=o.lampEvery||34) lamp(add,x0+ux*t-px*(W/2-.6),y,z0+uz*t-pz*(W/2-.6),4);
      run+=len; } }
  function pier(add,p0,p1,o){ o=o||{}; const m=M(), {len,ux,uz,yaw,px,pz}=along(p0,p1), y=o.y??.8, W=o.w||3.6, bed=o.bed??BED();
    const deck=o.stone?m.marble:mat("deck","#8a6a48"), legs=o.stone?m.shade:m.wood;
    add(E.UNIT_BOX,deck,p0[0]+ux*len/2,y-.35,p0[1]+uz*len/2,len,.35,W,yaw);
    for(let t=0;t<=len;t+=o.stone?9:4.5) for(const k of o.stone?[0]:[-1,1]){ const x=p0[0]+ux*t+px*k*(W/2-.2), z=p0[1]+uz*t+pz*k*(W/2-.2);
      if(o.stone) add(E.UNIT_BOX,legs,x,bed,z,2.2,y-.35-bed,W-.4,yaw); else add(E.CYL,legs,x,bed,z,.22,y+.5-bed,.22); } }
  function boat(add,x,z,yaw,o){ o=o||{}; const n=o.len||7, w=n*.32, W=window.CITY.terrain.water, y=o.y??(W?W.level:0);
    const hull=mat("hull:"+(o.color||L.wood),o.color||L.wood), c=Math.cos(yaw), s=-Math.sin(yaw), at=t=>[x+c*t,z+s*t];
    add(E.UNIT_BOX,hull,x,y-.45,z,n*.72,.95,w,yaw);                                                  // the hull
    for(const k of [-1,1]){ const [bx,bz]=at(k*n*.36); add(E.UNIT_BOX,hull,bx,y-.45,bz,w*.72,.95,w*.72,yaw+Math.PI/4); }   // the bow and the stern
    const [px,pz]=at(n*.5); add(E.CONE,hull,px,y-.2,pz,.16,1.6,.16);                                // a raised stem post at the bow
    add(E.UNIT_BOX,mat("thwart","#c9b48a"),x,y+.45,z,.5,.12,w*.9,yaw);
    if(o.sail){ add(E.CYL,m0().wood,x,y+.4,z,.12,n*.85,.12);
      const sail=add(E.UNIT_BOX,mat("sail:"+(o.sailColor||"#f1ede2"),o.sailColor||"#f1ede2"),x,y+n*.25,z,n*.42,n*.52,.08,yaw); sail.castShadow=false; } }
  const m0=()=>M();
  let MIST=null;
  function mist(o){ o=o||{}; const g=new THREE.Group(), A=o.area||{x:0,z:0,r:600}, seed=o.seed||70, n=o.n||40, op=o.opacity??.32;
    if(!MIST){ const c=document.createElement("canvas"); c.width=c.height=128; const x=c.getContext("2d"), gr=x.createRadialGradient(64,64,0,64,64,64);
      gr.addColorStop(0,"rgba(240,243,246,1)"); gr.addColorStop(.55,"rgba(240,243,246,.45)"); gr.addColorStop(1,"rgba(240,243,246,0)"); x.fillStyle=gr; x.fillRect(0,0,128,128);
      MIST=new THREE.CanvasTexture(c); }
    const mm=new THREE.SpriteMaterial({map:MIST,color:0xeef1f4,transparent:true,opacity:op,depthWrite:false});
    for(let i=0;i<n;i++){ const u=hash(i,seed), v=hash(i,seed+1), k=(o.size||160)*(.6+.8*hash(i,seed+2));
      const [x,z]=A.r?[A.x+Math.cos(u*6.283)*A.r*Math.sqrt(v),A.z+Math.sin(u*6.283)*A.r*Math.sqrt(v)]:[A.x0+u*(A.x1-A.x0),A.z0+v*(A.z1-A.z0)];
      if(o.keep&&!o.keep(x,z)) continue;
      const sp=new THREE.Sprite(mm); sp.scale.set(k*1.8,k*(o.flat??.3),1); sp.position.set(x,(o.y??2)+k*.06,z); sp.renderOrder=2; sp.raycast=()=>{}; g.add(sp); }
    E.scene.add(g); return g; }

  const WATER=()=>window.CITY.terrain.water, dry=(x,z,y)=>{ const W=WATER(); return !W||y>W.level+.6; };
  // scatter n spots of radius ~size in a disc (stretched across x by stretch), apart from each other: [x,z,size,i]
  function spots(o,size,pad,test){ const out=[], seed=o.seed||90, [cx,cz]=o.c, R=o.r||40;
    for(let t=0;t<(o.n||12)*40&&out.length<(o.n||12);t++){ const a=hash(t,seed)*6.2832, r=Math.sqrt(hash(t,seed+1))*R, x=cx+Math.cos(a)*r*(o.stretch||1), z=cz+Math.sin(a)*r;
      const k=size*(.8+hash(t,seed+2)*.5); if(out.some(p=>Math.hypot(p[0]-x,p[1]-z)<p[2]+k+pad)) continue;
      if((o.keep&&!o.keep(x,z))||(test&&!test(x,z))) continue; out.push([x,z,k,t]); }
    return out; }
  function camp(o){ const g=new THREE.Group(), add=E.adder(g), seed=o.seed||90, cols=(o.colors||["#f1ede2","#dfe4ea","#c9d4de"]).map(c=>mat("tent:"+c,c));
    const S=spots(o,o.size||4,1.6,(x,z)=>dry(x,z,E.surfaceY(x,z)));
    S.forEach(([x,z,k,t],i)=>{ const y=E.surfaceY(x,z), yaw=hash(t,seed+4)*3.14, m=cols[i%cols.length];
      if(hash(t,seed+3)<.18){ add(E.UNIT_BOX,m,x,y,z,k*2.4,k*.8,k*1.5,yaw); add(E.GABLE,cols[(i+1)%cols.length],x,y+k*.8,z,k*2.5,k*.85,k*1.6,yaw); }   // a pavilion
      else add(E.CONE,m,x,y,z,k*.75,k*1.25,k*.75); });                                              // a tent
    const ban=mat("banner:"+(o.banner||"#3b5fa8"),o.banner||"#3b5fa8"), pole=mat("post","#6a6152");
    for(let i=0;i<(o.banners??3)&&i<S.length;i++){ const [x,z,k]=S[(i*5)%S.length], bx=x+k+1.6, y=E.surfaceY(bx,z);
      add(E.CYL,pole,bx,y,z,.14,k*2.6,.14); add(E.UNIT_BOX,ban,bx+1,y+k*2.6-2.6,z,2,2.4,.1); }
    const ember=mat("ember","#ffb35c",{emissive:new THREE.Color("#c0601a")});
    for(let i=0;i<(o.fires??Math.ceil(S.length/6));i++){ const a=hash(i,seed+9)*6.28, r=Math.sqrt(hash(i,seed+10))*(o.r||40)*.8, x=o.c[0]+Math.cos(a)*r*(o.stretch||1), z=o.c[1]+Math.sin(a)*r, y=E.surfaceY(x,z);
      if(!dry(x,z,y)) continue; add(E.CYL,mat("ring","#6d6a63"),x,y,z,1.3,.35,1.3); add(E.CONE,ember,x,y+.3,z,.7,1.2,.7);
      const f=E.glowSprite("rgba(255,170,80,.85)",o.glow||10); f.position.set(x,y+1.6,z); g.add(f); }
    if(o.owner) E.own(o.owner,g); else E.scene.add(g); return g; }
  function huts(o){ const g=new THREE.Group(), add=E.adder(g), seed=o.seed||60, W=WATER();
    const wall=mat("hutwall:"+(o.wall||"#8a7656"),o.wall||"#8a7656"), thatch=mat("thatch:"+(o.thatch||"#a08c5c"),o.thatch||"#a08c5c"), post=m0().wood;
    const S=spots(o,o.size||3.2,2.2,o.stilts?null:(x,z)=>dry(x,z,E.surfaceY(x,z)));
    S.forEach(([x,z,k,t])=>{ let y=E.surfaceY(x,z);
      if(o.stilts){ const deck=Math.max(y,W?W.level:y)+1.4; for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) add(E.CYL,post,x+dx*k*.7,y-1,z+dz*k*.7,.16,deck-y+1,.16);
        add(E.CYL,mat("deck","#8a6a48"),x,deck-.3,z,k*1.15,.3,k*1.15); y=deck; }
      add(E.CYL,wall,x,y,z,k,k*.85,k); add(E.CONE,thatch,x,y+k*.85,z,k*1.28,k*1.05,k*1.28);
      add(E.UNIT_BOX,mat("door","#3a2a1c"),x+Math.cos(t)*k*.98,y,z+Math.sin(t)*k*.98,.9,1.7,.9,-t);
      if(o.racks&&hash(t,seed+5)<.6){ const rx=x+k*1.8, rz=z+k*.6, ry=E.surfaceY(rx,rz);          // a drying rack for nets and fish
        for(const s of [-1,1]) add(E.CYL,post,rx,ry,rz+s*1.4,.1,2.2,.1); add(E.UNIT_BOX,mat("net","#b8ab8c"),rx,ry+1.1,rz,.12,1,2.8); } });
    if(o.fire){ const [x,z]=o.c, y=E.surfaceY(x,z); add(E.CYL,mat("ring","#6d6a63"),x,y,z,1.4,.35,1.4); add(E.CONE,mat("ember","#ffb35c",{emissive:new THREE.Color("#c0601a")}),x,y+.3,z,.7,1.2,.7);
      const f=E.glowSprite("rgba(255,170,80,.85)",10); f.position.set(x,y+1.6,z); g.add(f); }
    if(o.owner) E.own(o.owner,g); else E.scene.add(g); return g; }
  function track(pts,o){ o=o||{}; const items=[], w=o.w||3.2, c=o.color||"#b8a27c";
    for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(L/7)), yaw=Math.atan2(-(bz-az),bx-ax);
      for(let k=0;k<n;k++){ const x=ax+(bx-ax)*(k+.5)/n, z=az+(bz-az)*(k+.5)/n, y=E.surfaceY(x,z); if(!dry(x,z,y)) continue;
        items.push({m:E.M(x,y-.22,z,yaw,L/n+.8,.4,w),c,o:o.owner}); } }
    E.instanced(E.UNIT_BOX,E.lam("#ffffff"),items,false); }

  // a big building out on the land, its long side along yaw (0: along +x); a footing takes up slopes. porch: pillars on the front (+z side
  // before turning); tower: a round tower at one end. Colors from the style's look unless wall/roof are given.
  function hall(add,x,z,o){ o=o||{}; const m=M(), w=o.w||22, d=o.d||12, h=o.h||8, yaw=o.yaw||0, y=o.y??E.surfaceY(x,z);
    const wall=o.wall?mat("hw:"+o.wall,o.wall):m.stone, roof=o.roof?mat("hr:"+o.roof,o.roof):m.roof, c=Math.cos(yaw), s=-Math.sin(yaw);
    const at=(u,v)=>[x+c*u-s*v,z+s*u+c*v];                                                   // u along the hall, v across it (front is +v)
    add(E.UNIT_BOX,m.shade,x,y-2,z,w+1.2,2.4,d+1.2,yaw);
    add(E.UNIT_BOX,wall,x,y,z,w,h,d,yaw);
    add(E.GABLE,roof,x,y+h,z,d+1.2,Math.max(3,d*.5),w+1.2,yaw+Math.PI/2);
    const glass=m.glass, n=Math.max(2,Math.floor(w/4));
    for(let k=0;k<n;k++){ const u=-w/2+(k+.5)*w/n; for(const v of [-1,1]){ const [wx,wz]=at(u,v*(d/2+.05)); add(E.UNIT_BOX,glass,wx,y+h*.35,wz,1,h*.4,.15,yaw); } }
    if(o.doors!==false){ const [dx,dz]=at(0,d/2+.06); add(E.UNIT_BOX,mat("door","#3a2a1c"),dx,y,dz,2.6,Math.min(4.4,h*.6),.2,yaw); }
    if(o.porch){ const pd=3.4; for(let k=0;k<5;k++){ const [px,pz]=at(-w*.3+k*w*.15,d/2+pd); add(E.CYL,m.marble,px,y,pz,.45,h*.8,.45); }
      const [rx,rz]=at(0,d/2+pd/2); add(E.UNIT_BOX,m.marble,rx,y+h*.8,rz,w*.7,.6,pd+1,yaw); add(E.UNIT_BOX,roof,rx,y+h*.8+.6,rz,w*.72,.5,pd+1.2,yaw); }
    if(o.tower){ const [tx,tz]=at(-w/2-2,0), tr=Math.min(d*.38,4), th=h*2.4; add(E.CYL,wall,tx,y,tz,tr,th,tr); add(E.CONE,roof,tx,y+th,tz,tr*1.25,tr*2.4,tr*1.25);
      add(E.BALL,m.gold,tx,y+th+tr*2.4,tz,.35,.35,.35); }
    return y+h; }
  function tower(add,x,z,o){ o=o||{}; const m=M(), r=o.r||3.2, h=o.h||22, y=E.surfaceY(x,z);
    add(E.CYL,m.shade,x,y-1.5,z,r+.8,2.2,r+.8); add(E.CYL,m.stone,x,y,z,r,h,r);
    for(let k=0;k<3;k++) for(let j=0;j<4;j++){ const a=j*Math.PI/2+k*.6; add(E.UNIT_BOX,m.glass,x+Math.sin(a)*(r+.02),y+h*(.3+k*.22),z+Math.cos(a)*(r+.02),.7,1.5,.15,a); }
    add(E.CYL,m.marble,x,y+h,z,r+.7,.8,r+.7);
    for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; add(E.UNIT_BOX,m.stone,x+Math.sin(a)*(r+.4),y+h+.8,z+Math.cos(a)*(r+.4),.9,1,.6,a); }
    if(o.beacon){ const b=add(E.BALL,mat("beacon","#fff1c4",{emissive:new THREE.Color("#d08a2a")}),x,y+h+1.6,z,1.1,1.1,1.1); E.addLantern(b,x,z);
      const gl=E.glowSprite("rgba(255,200,110,.55)",12); gl.position.set(x,y+h+1.8,z); b.parent.add(gl); }
    else add(E.CONE,o.roof?mat("hr:"+o.roof,o.roof):m.roof,x,y+h+.8,z,r+.9,r*1.6,r+.9);
    if(o.banner){ add(E.CYL,mat("post","#6a6152"),x,y+h+.8,z,.1,5,.1); add(E.UNIT_BOX,mat("banner:"+o.banner,o.banner),x+1,y+h+4.2,z,2,1.4,.08); }
    return y+h; }

  return {hash,look:L,quay,pier,boat,mist,camp,huts,track,hall,tower,archGeo,lamp,arcRing,bridge,waterfall,stair,scatter,herd,distantPeaks,fields,town,initRecipes:initWater};
};
})();
