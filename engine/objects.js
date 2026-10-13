/* Map objects for citymaker: the structures and nature of a sandbox map, built with the engine's recipes and the styles.
   Shared by the sandbox editor (sandbox/sandbox.js) and the cities exported from it (tools/sandbox_city.py), so a map looks
   the same in both. CITYMAKER_OBJECTS(E) returns {TYPES, build}: E is the engine's helper object (or the sandbox's stand-in)
   with the recipes already added; build(rec, add, owner) draws one object record into a group through add (an adder).
   A record: {id, t:type, x, z, r (radius, for area objects), s (scale), yaw (degrees), style, pts:[[x,z],...] (lines),
   p2:[x,z] (the second end of a two-point object), n (a count), seed}. People are not built here: the sandbox walks them
   itself and an exported city makes them locals. */
(function(){
window.CITYMAKER_OBJECTS=function(E){
  const {THREE}=E, DEG=Math.PI/180;
  const hash=(i,k)=>{ const v=Math.sin(i*127.1+k*311.7+(i*k)%7*.13)*43758.5453; return v-Math.floor(v); };
  const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const G=(x,z)=>E.surfaceY(x,z);
  const water=()=>{ const W=window.CITY&&window.CITY.terrain&&window.CITY.terrain.water; return W?W.level:-1e9; };
  const look=()=>Object.assign({stone:"#f4f1ea",shade:"#cfc9ba",marble:"#e6e0d2",roof:"#6f8ea8",spire:"#6f8ea8",gold:"#d8b34a",paving:"#ebe6d8",leaf:"#4a7b3a",wood:"#6b4a2e"},E.STYLE.look||{});
  const SN=(()=>{ const k=Object.keys(window.STYLES||{}).find(k=>window.STYLES[k]===E.STYLE)||"noldor"; return k==="hornburg"?"rohan":k; })();
  const mats={}, mat=(c,o)=>mats[c+(o?"e":"")]||(mats[c+(o?"e":"")]=E.lam(c,o));

  // the types, how they are placed, and where they sit in the editor's palette
  const TYPES={
    house:{label:"House",group:"build",place:"point",hint:"One house in the chosen style."},
    village:{label:"Village",group:"build",place:"radius",r:40,hint:"Houses round a green with a well."},
    hall:{label:"Hall",group:"build",place:"point",hint:"A great hall with a porch and a tower."},
    tower:{label:"Tower",group:"build",place:"point",hint:"A round watchtower."},
    beacon:{label:"Beacon tower",group:"build",place:"point",hint:"A tower with a beacon that lights at dusk."},
    town:{label:"Walled town",group:"build",place:"radius",r:34,hint:"A walled town in the chosen style: a Noldorin town round a square and a white tower, a High Elven town climbing in arcaded terraces, or a Rohirric burg behind a palisade. Flattens the ground under it."},
    market:{label:"Market",group:"build",place:"point",hint:"A fountain in a ring of stalls, with a market hall."},
    fountain:{label:"Fountain",group:"build",place:"point",hint:"A basin with a jet."},
    camp:{label:"Camp",group:"build",place:"radius",r:40,hint:"Tents and pavilions with camp-fires."},
    huts:{label:"Huts",group:"build",place:"radius",r:30,hint:"Round thatched huts round a fire."},
    wall:{label:"Wall",group:"build",place:"line",hint:"Click points along the wall; double-click or press Enter to finish."},
    road:{label:"Road",group:"build",place:"line",hint:"Click points along the road; double-click or press Enter to finish."},
    bridge:{label:"Bridge",group:"build",place:"two",hint:"Click one end, then the other."},
    stair:{label:"Stair",group:"build",place:"two",hint:"Click one end, then the other. The stair follows the ground, and on a steep mountainside it zig-zags back and forth with landings."},
    waterfall:{label:"Waterfall",group:"water",place:"two",hint:"Click the top of the fall, then where it lands."},
    quay:{label:"Quay",group:"water",place:"line",hint:"Click points along the shore; double-click or press Enter to finish."},
    pier:{label:"Pier",group:"water",place:"two",hint:"Click the shore end, then the end out in the water."},
    boat:{label:"Boat",group:"water",place:"point",hint:"A small boat on the water."},
    forest:{label:"Forest",group:"nature",place:"radius",r:60,hint:"Broad-leaved trees."},
    pines:{label:"Pines",group:"nature",place:"radius",r:60,hint:"A stand of pines."},
    cypresses:{label:"Cypresses",group:"nature",place:"radius",r:30,hint:"Tall dark cypresses."},
    rocks:{label:"Rocks",group:"nature",place:"radius",r:30,hint:"Boulders and fallen stone."},
    reeds:{label:"Reeds",group:"nature",place:"radius",r:30,hint:"Reeds; they grow only at the water's edge."},
    fields:{label:"Fields",group:"nature",place:"radius",r:80,hint:"A patchwork of fields with hedgerows."},
    herd:{label:"Herd",group:"nature",place:"radius",r:30,hint:"A herd of horses."},
    people:{label:"People",group:"people",place:"radius",r:30,hint:"Townsfolk who wander about this spot."},
    hero:{label:"Character",group:"people",place:"point",r:14,hint:"One of the main characters: Fingolfin, Turgon, Túrin, Théoden, Aragorn and the rest. Pick who in the list, then click where they stand."},
    centre:{label:"City centre",group:"build",place:"point",single:true,hint:"Where the city's middle will be when you turn the map into a city."},
    greathall:{label:"Great Hall",group:"great",place:"point",flat:26,hint:"The Great Hall of the Gondothlim: a round hall under a golden dome, ringed with columns."},
    kingstower:{label:"King's Tower",group:"great",place:"point",flat:32,hint:"Turgon's palace on its terrace, with the Tower of the King rising behind its temple front."},
    lore:{label:"House of Lore",group:"great",place:"point",flat:30,hint:"A cloister of studies, a reading hall under a golden dome, and the lore-masters' tower."},
    cloister:{label:"Great Cloister",group:"great",place:"point",flat:30,hint:"Halls round an arcaded garden court, with domed pavilions and a gatehouse."},
    song:{label:"Court of Song",group:"great",place:"point",flat:24,hint:"An open theatre: tiers of seats round a stage with a front of arches."},
    fountains:{label:"Court of Fountains",group:"great",place:"point",flat:30,hint:"A long canal with jets, vine-hung colonnades and a wall of falling water."},
    crafts:{label:"Hall of Crafts",group:"great",place:"point",flat:28,hint:"The smiths' great aisled hall, with twin towers and glowing forges."},
    greatfountain:{label:"King's Fountain",group:"great",place:"point",flat:29,hint:"The Square of the King: a fountain of three bowls in a ring of columns."},
    twotrees:{label:"Two Trees",group:"great",place:"point",flat:20,hint:"Glingal and Belthil, the golden and silver trees made in memory of the Trees of Valinor."},
    whitetower:{label:"White Tower",group:"great",place:"point",flat:7,hint:"One of the tall white towers of the citadel. Place two, then join them with a Sky-bridge."},
    greatgate:{label:"Great Gate",group:"great",place:"point",flat:16,hint:"Two tall towers and a great arch crowned with the moon, the sun and the scarlet heart."},
    skybridge:{label:"Sky-bridge",group:"great",place:"two",hint:"Click one end, then the other: a bridge high in the air, for joining two White Towers."},
  };

  // houses drawn by the style itself (its lot), into instanced shapes like the engine's own generated city
  function styleHouses(list,owner,seed,well,vary){
    const rand=mulberry(seed||1), B={bodies:[],roofs:[],towers:[],caps:[],trees:[],cyl:[],box:[],water:[],jets:[],cones:[],
      THREE,M:E.M,P:E.P,DEG,rand,HOUSES:[{id:owner,color:"#6f8ea8"}],poi:{fountains:[],gardens:[],homes:[]},pick:a=>a[Math.floor(rand()*a.length)],tangentYaw:a=>-(a+Math.PI/2)};
    (E.STYLE.buckets||[]).forEach(bk=>{ B[bk.name]=[]; });
    const hc=new THREE.Color(look().roof);
    list.forEach(h=>{ B.H=G(h.x,h.z)-.15; const S=E.STYLE.pieces(B,E);
      S.lot({q:new THREE.Vector3(h.x,B.H,h.z),b:h.b,w:h.w,d:h.d,rc:.6,e:1,yaw:-h.b*DEG,h:{id:owner,color:look().roof},hc,kind:vary?rand():.5}); E.addHome(h.x,h.z); });   // people can live in it
    if(well){ B.H=G(well[0],well[1]); E.STYLE.pieces(B,E).fountain(well[0],well[1],1.5,owner); }
    const I=(geo,m,items,sh)=>items.length&&E.instanced(geo,m,items,sh);
    I(E.UNIT_BOX,E.lam("#ffffff"),B.bodies); I(E.PYRAMID,E.lam("#ffffff"),B.roofs); I(E.CYL,E.lam("#ffffff"),B.towers); I(E.CONE,E.lam("#ffffff"),B.caps);
    I(E.BLOB,new THREE.MeshPhongMaterial({color:0xffffff,flatShading:true,shininess:4}),B.trees); I(E.CYL,E.lam("#ffffff"),B.cyl); I(E.UNIT_BOX,E.lam("#ffffff"),B.box); I(E.CONE,E.lam("#ffffff"),B.cones);
    const w=I(E.CYL,E.lam("#ffffff",{emissive:new THREE.Color("#123a55")}),B.water,false); if(w) E.addWater(w.material);
    I(E.CONE,new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}),B.jets,false);
    (E.STYLE.buckets||[]).forEach(bk=>I(bk.geo(E),bk.mat(E),B[bk.name],bk.shadow));
  }

  // a wall along a line: a core with a walk and merlons, towers at the corners and along it, in the style's colors
  function wall(add,pts,s,owner){
    const L=look(), H=12*s, core=[], face=[], merl=[], tw=[], caps=[], ARC=E.STYLE.arcadeGeo?E.STYLE.arcadeGeo(THREE):null;
    for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], l=Math.hypot(bx-ax,bz-az)||1, n=Math.max(1,Math.round(l/4)), yaw=Math.atan2(-(bz-az),bx-ax), nx=(bz-az)/l, nz=-(bx-ax)/l;
      for(let k=0;k<n;k++){ const f=(k+.5)/n, x=ax+(bx-ax)*f, z=az+(bz-az)*f, y=G(x,z), len=l/n+.25;
        core.push({m:E.M(x,y-3,z,yaw,len,H+3,4),c:L.shade,o:owner});
        if(ARC) for(const sd of [-1,1]) face.push({m:E.M(x+nx*sd*2.1,y,z+nz*sd*2.1,yaw,len,H-.5,.4),c:L.stone,o:owner});
        merl.push({m:E.M(x+nx*1.7,y+H,z+nz*1.7,yaw,len*.45,1.2,.6),c:L.stone,o:owner}); merl.push({m:E.M(x-nx*1.7,y+H,z-nz*1.7,yaw,len*.45,1.2,.6),c:L.stone,o:owner}); }
      for(let t=0;t<l;t+=40){ if(t<6&&i>0) continue; const x=ax+(bx-ax)*t/l, z=az+(bz-az)*t/l, y=G(x,z); tw.push({m:E.M(x,y-3,z,0,3.4,H+9,3.4),c:L.stone,o:owner}); caps.push({m:E.M(x,y+H+6,z,0,4,L.spires?9:4.6,4),c:L.spire,o:owner}); } }
    { const [x,z]=pts[pts.length-1], y=G(x,z); tw.push({m:E.M(x,y-3,z,0,3.4,H+9,3.4),c:L.stone,o:owner}); caps.push({m:E.M(x,y+H+6,z,0,4,L.spires?9:4.6,4),c:L.spire,o:owner}); }
    E.instanced(E.UNIT_BOX,E.lam("#ffffff"),core); if(face.length) E.instanced(ARC,E.lam("#ffffff"),face); E.instanced(E.UNIT_BOX,E.lam("#ffffff"),merl);
    E.instanced(E.CYL,E.lam("#ffffff"),tw); E.instanced(E.CONE,E.lam("#ffffff"),caps);
  }


  /* ---------- the great buildings of Gondolin, as placeable objects. Each is drawn about its own origin, front toward +z,
     standing at y=0, into a group that build() sets on the ground, turns and scales. They are ports of the landmarks in
     cities/gondolin/city.js (that city keeps its own copies). ---------- */
  const GM=()=>({white:mat("#f8f5ee"),marble:mat("#e9e3d5"),shade:mat("#d9d2c2"),gold:mat("#d8b34a",{emissive:new THREE.Color("#2a1e04")}),glass:mat("#33404f"),slate:mat("#5c7d99"),red:mat("#b3373f"),
    dome:mats.dome||(mats.dome=new THREE.MeshPhongMaterial({color:0xe2b437,shininess:90,emissive:0x3a2a05})),leaf:mats.gleaf||(mats.gleaf=new THREE.MeshPhongMaterial({color:0x4c7d3c,flatShading:true,shininess:4})),pearl:mat("#f4efe2")});
  const OCTG=E.OCT||new THREE.CylinderGeometry(1,1,1,8).rotateY(Math.PI/8).translate(0,.5,0);
  const BASIN=E.BASIN||new THREE.CylinderGeometry(1,.42,1,32).translate(0,.5,0), CURTAIN=E.CURTAIN||new THREE.CylinderGeometry(1,1,1,40,1,true).translate(0,.5,0);
  const UP=new THREE.Vector3(0,1,0), taper=t=>E.octTaper?E.octTaper(t):new THREE.CylinderGeometry(t,1,1,8).rotateY(Math.PI/8).translate(0,.5,0);
  const octWall=(add,m,cx,y,cz,R,h,t)=>{ const side=2*R*Math.sin(Math.PI/8)+t*.4, ap=R*Math.cos(Math.PI/8); for(let k=0;k<8;k++){ const a=k*Math.PI/4; add(E.UNIT_BOX,m,cx+Math.cos(a)*ap,y,cz+Math.sin(a)*ap,side,h,t,-(a+Math.PI/2)); } };
  const wmat=()=>{ const w=E.waterMat(); E.addWater(w); return w; };   // a shimmering water material
  const pave=(g,w,d,x,z,c,o)=>{ const geo=new THREE.PlaneGeometry(w,d); geo.rotateX(-Math.PI/2); const m=new THREE.Mesh(geo,E.paveMat(c,o||2)); m.position.set(x||0,.04,z||0); m.receiveShadow=true; g.add(m); };
  const glow=(g,rgba,size,x,y,z)=>{ const s=E.glowSprite(rgba,size); s.position.set(x,y,z); g.add(s); };
  const HOUSE_COLORS=["#b3373f","#34343b","#4b4a8c","#3b7dc1","#9aa4ad","#d6e2ec","#6f98c6","#3e7b48","#d6a32a","#a7bccb","#7b5ea8","#8e3f2c"];
  // a white tower: plinth, tapering octagonal shaft with windows and two balconies, an open lantern, a tall roof, a gold finial
  function spire(add,m,x,y0,z,o){ const r=o.r, h=o.h, sh=h*.7; let y=y0;
    add(OCTG,m.marble,x,y,z,r+1.2,1.6,r+1.2); add(OCTG,m.gold,x,y+1.45,z,r+1.26,.18,r+1.26); y+=1.6;
    add(taper(.84),m.white,x,y,z,r,sh,r);
    for(let j=0;j<o.rows;j++){ const f=.1+.82*j/o.rows, rr=r*(1-.16*f)*Math.cos(Math.PI/8)+.05;
      for(let k=j%2;k<8;k+=o.thin?2:1){ const a=k*Math.PI/4; add(E.UNIT_BOX,m.glass,x+Math.sin(a)*rr,y+sh*f,z+Math.cos(a)*rr,.7,Math.min(2.6,sh/o.rows*.5),.18,a); } }
    [.46,1].forEach(f=>{ const rr=r*(1-.16*f)+1.05, yy=y+sh*f; add(OCTG,m.marble,x,yy,z,rr,.6,rr); add(OCTG,m.gold,x,yy+.48,z,rr+.06,.14,rr+.06);
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(E.CONE,m.gold,x+Math.sin(a)*rr*.97,yy+.6,z+Math.cos(a)*rr*.97,.2,1.6,.2); } });
    y+=sh+.6; const lr=r*.82, lh=Math.max(3,h*.07);
    for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(E.CYL,m.white,x+Math.sin(a)*lr,y,z+Math.cos(a)*lr,.22,lh,.22); }
    add(OCTG,m.gold,x,y+lh*.35,z,lr*.45,lh*.3,lr*.45); add(OCTG,m.marble,x,y+lh,z,lr+.55,.5,lr+.55); y+=lh+.5;
    add(E.CONE,o.roof||m.slate,x,y,z,lr+.7,h*.22,lr+.7); y+=h*.22;
    add(E.CYL,m.gold,x,y-.6,z,.12,3.4,.12); add(E.BALL,m.gold,x,y+2.9,z,.38,.38,.38);
    if(o.banner) add(E.UNIT_BOX,o.banner,x+1.1,y+1.2,z,1.9,1.1,.08);
    return y; }
  const pavilion=(add,m,x,z,r,h,dome)=>{ add(OCTG,m.marble,x,0,z,r+.5,.8,r+.5); add(OCTG,m.white,x,.8,z,r,h,r); add(OCTG,m.marble,x,h+.8,z,r+.4,.6,r+.4); add(OCTG,m.gold,x,h+1.3,z,r+.45,.14,r+.45);
    if(dome) add(E.HDOME,m.dome,x,h+1.4,z,r*.95,r*1.05,r*.95); else add(E.CONE,m.slate,x,h+1.4,z,r+.5,r*1.6,r+.5); add(E.CONE,m.gold,x,h+1.4+(dome?r*1.05:r*1.6),z,.25,1.8,.25); };
  const gtree=(add,m,x,z,s)=>{ add(OCTG,m.marble,x,0,z,.9*s,.9,.9*s); add(E.BLOB,m.leaf,x,.9+1.9*s,z,1.7*s,2.1*s,1.7*s); };
  const gfountain=(add,m,x,z,r)=>{ octWall(add,m.marble,x,0,z,r,1,.6); add(OCTG,wmat(),x,0,z,r-.3,.85,r-.3); add(E.CYL,m.white,x,0,z,.4,2.6+r*.4,.4); add(E.CONE,m.gold,x,2.6+r*.4,z,.35,1.2,.35); };
  // a quadrangle: four ranges of halls round a garden court, arcades facing in, domed pavilions at the corners, a gatehouse on the front
  function cloister(g,add,m,W,D,o){ o=o||{}; const R=5.5, h=o.h||9, A=E.archGeo(), FL=["#d9534f","#f0c419","#9b59b6","#f7f7f2","#e67e22"].map(c=>mat(c));
    pave(g,W+2,D+2,0,0,"#ece6d6",2);
    [[0,-D/2+R/2,W,R,1],[0,D/2-R/2,W,R,1],[-W/2+R/2,0,R,D-2*R,0],[W/2-R/2,0,R,D-2*R,0]].forEach(([x,z,w,d,alongX])=>{
      add(E.UNIT_BOX,m.white,x,0,z,w,h,d); add(E.UNIT_BOX,m.marble,x,h,z,w+.5,.7,d+.5); add(E.UNIT_BOX,m.gold,x,h+.7,z,w+.6,.16,d+.6);
      if(alongX) add(E.GABLE,m.slate,x,h+.86,z,d+.6,3,w+.6,Math.PI/2); else add(E.GABLE,m.slate,x,h+.86,z,w+.6,3,d+.6); });
    for(let x=-W/2+R+1.8;x<W/2-R-1;x+=3.3) for(const sd of [-1,1]){ add(A,m.marble,x,0,sd*(D/2-R-.3),3.3,6.6,.6); add(E.UNIT_BOX,m.glass,x,2.6,sd*(D/2+.03),1,3,.12); add(E.UNIT_BOX,m.glass,x,6.2,sd*(D/2+.03),1,1.8,.12); }
    for(let z=-D/2+R+1.8;z<D/2-R-1;z+=3.3) for(const sd of [-1,1]){ add(A,m.marble,sd*(W/2-R-.3),0,z,3.3,6.6,.6,Math.PI/2); add(E.UNIT_BOX,m.glass,sd*(W/2+.03),2.6,z,.12,3,1); }
    for(const sd of [-1,1]){ add(E.UNIT_BOX,m.shade,0,6.6,sd*(D/2-R-1.2),W-2*R,.4,2.6); add(E.UNIT_BOX,m.shade,sd*(W/2-R-1.2),6.6,0,2.6,.4,D-2*R); }
    for(const sx of [-1,1]) for(const sz of [-1,1]) if(!(o.skip&&o.skip(sx,sz))) pavilion(add,m,sx*W/2,sz*D/2,3.4,h+4,true);
    add(E.UNIT_BOX,m.white,0,0,D/2-R/2,10,h+5,R+1.6); add(E.UNIT_BOX,m.marble,0,h+5,D/2-R/2,10.6,.8,R+2.2); add(E.GABLE,m.marble,0,h+5.8,D/2-R/2,R+2.2,3.4,10.6,Math.PI/2);
    add(A,m.marble,0,0,D/2+.6,8,12,.9); add(E.UNIT_BOX,m.gold,0,1,D/2+.2,4.4,8.4,.2); add(E.BALL,m.gold,0,h+7.4,D/2+.9,.8,.8,.2);
    const cw=W-2*R-4, cd=D-2*R-4; pave(g,cw,cd,0,0,"#86ab5c",3); pave(g,cw,2.2,0,0,"#e7e0cc",4); pave(g,2.2,cd,0,0,"#e7e0cc",4);
    gfountain(add,m,0,0,2.6);
    for(const sx of [-1,1]) for(const sz of [-1,1]){ gtree(add,m,sx*cw*.3,sz*cd*.28,1); add(E.UNIT_BOX,FL[(sx+1+sz+1)%5],sx*cw*.3,0,sz*cd*.28+sz*-2.4,3.4,.5,.9); } }

  const GREAT={
    greathall(g,add,m){ const R=18, DR=14.5, DH=22, A=E.archGeo(); let y=0;
      [[R+3.4,.8],[R+2.4,.8],[R+1.4,.8]].forEach(([r,h])=>{ add(E.DISC,m.marble,0,y,0,r,h,r); y+=h; }); const y0=y;
      add(E.DISC,m.white,0,y,0,DR,DH,DR); add(E.DISC,m.gold,0,y+DH-1.2,0,DR+.15,.3,DR+.15);
      for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, r=DR+.08; add(E.UNIT_BOX,m.glass,Math.sin(a)*r,y+13.6,Math.cos(a)*r,1.5,6.2,.2,a); add(A,m.marble,Math.sin(a)*(r+.25),y+13,Math.cos(a)*(r+.25),2.6,8,.5,a); }
      for(let k=0;k<4;k++){ const a=k*Math.PI/2, r=DR+.1; add(E.UNIT_BOX,m.gold,Math.sin(a)*r,y,Math.cos(a)*r,3.8,7.4,.25,a); add(A,m.marble,Math.sin(a)*(r+.3),y,Math.cos(a)*(r+.3),6,10,.7,a);
        for(const sd of [-1,1]){ const px=Math.sin(a)*(R+2.8)+Math.cos(a)*sd*3.4, pz=Math.cos(a)*(R+2.8)-Math.sin(a)*sd*3.4;
          add(OCTG,m.marble,px,0,pz,1.3,y0+.6,1.3); add(E.CYL,m.white,px,y0+.6,pz,.75,15,.75); add(E.CONE,m.gold,px,y0+15.6,pz,.9,3.2,.9); add(E.BALL,m.gold,px,y0+19,pz,.4,.4,.4); } }
      for(let k=0;k<32;k++){ if(k%8===0) continue; const a=k/32*Math.PI*2, x=Math.sin(a)*R, z=Math.cos(a)*R; add(OCTG,m.marble,x,y,z,.95,.6,.95); add(E.CYL,m.white,x,y+.6,z,.58,10.4,.58); add(E.UNIT_BOX,m.gold,x,y+11,z,1.3,.5,1.3,a); }
      add(E.DISC,m.marble,0,y+11.5,0,R+1.2,1.6,R+1.2); add(E.DISC,m.gold,0,y+13.1,0,R+1.3,.22,R+1.3);
      for(let k=0;k<32;k++){ const a=(k+.5)/32*Math.PI*2; add(E.CONE,m.gold,Math.sin(a)*(R+.9),y+13.3,Math.cos(a)*(R+.9),.22,1.6,.22); }
      y+=DH; add(E.DISC,m.marble,0,y,0,DR+1.1,1.1,DR+1.1); add(E.DISC,m.gold,0,y+1.05,0,DR+1.2,.2,DR+1.2); y+=1.25;
      const RX=DR+.5, RY=16; add(E.HDOME,m.dome,0,y,0,RX,RY,RX);
      for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; for(let j=1;j<9;j++){ const t=j/9*Math.PI/2*.94, r=RX*Math.cos(t)+.18; add(E.BALL,m.pearl,Math.sin(a)*r,y+RY*Math.sin(t),Math.cos(a)*r,.42,.42,.42); } }
      [.3,.62].forEach(f=>{ const t=f*Math.PI/2, ring=new THREE.Mesh(new THREE.TorusGeometry(RX*Math.cos(t)+.1,.32,6,72),m.pearl); ring.rotation.x=Math.PI/2; ring.position.set(0,y+RY*Math.sin(t),0); g.add(ring); });
      y+=RY; add(OCTG,m.marble,0,y-.6,0,3.4,1.2,3.4); y+=.6;
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(E.CYL,m.white,Math.sin(a)*2.6,y,Math.cos(a)*2.6,.26,4.4,.26); }
      add(E.BALL,mat("#fff1c4",{emissive:new THREE.Color("#d8a43a")}),0,y+2.1,0,1.3,1.3,1.3); glow(g,"rgba(255,210,120,.5)",14,0,y+2.1,0);
      y+=4.4; add(OCTG,m.marble,0,y,0,3.3,.6,3.3); y+=.6; add(E.HDOME,m.dome,0,y,0,3,2.8,3); y+=2.6; add(E.CONE,m.gold,0,y,0,.8,10,.8);
      for(let k=0;k<8;k++){ const a=(k+.5)/8*Math.PI*2; E.lamp(add,Math.sin(a)*(R+4.6),0,Math.cos(a)*(R+4.6),4); } },

    kingstower(g,add,m){ const T=2.5, CZ=0, RX=29, RZ=16, F=17.4;   // the palace on its terrace; its stair and front face +z
      add(E.DISC,m.marble,0,0,CZ,RX+1.3,1.1,RZ+1.1); add(E.DISC,m.white,0,1.1,CZ,RX,1.4,RZ);
      for(let i=0;i<5;i++) add(E.UNIT_BOX,m.white,0,0,F+.3+i*.6,19-i*.3,(5-i)*.5,.62);
      for(const s of [-1,1]){ add(E.UNIT_BOX,m.marble,s*9.8,0,F-1.2,1,3.1,3.6); add(OCTG,m.gold,s*9.8,3.1,F+.1,.55,.9,.55); add(E.BALL,m.gold,s*9.8,4.2,F+.1,.45,.45,.45); }
      const N=72, pts=[]; for(let k=0;k<N;k++){ const a=k/N*Math.PI*2; pts.push([Math.cos(a)*(RX-.45),CZ+Math.sin(a)*(RZ-.45)]); }
      pts.forEach(([x1,z1],k)=>{ const [x2,z2]=pts[(k+1)%N], mx=(x1+x2)/2, mz=(z1+z2)/2; if(mz>13.5&&Math.abs(mx)<10) return;
        add(E.UNIT_BOX,m.marble,mx,T,mz,Math.hypot(x2-x1,z2-z1)+.1,.85,.32,Math.atan2(-(z2-z1),x2-x1)); if(k%3===0) add(E.UNIT_BOX,m.white,x1,T,z1,.55,1.15,.55); });
      add(E.UNIT_BOX,m.white,0,T,CZ,32,9,18); add(E.UNIT_BOX,m.gold,0,T+8.8,CZ,32.4,.25,18.4); add(E.GABLE,m.slate,0,T+9,CZ,33.5,5.5,19.6);
      for(let i=0;i<10;i++){ const x=-14.4+i*3.2; add(E.UNIT_BOX,m.marble,x,T,11.4,1.5,.5,1.5); add(E.CYL,m.white,x,T+.5,11.4,.6,8,.6); add(E.UNIT_BOX,m.marble,x,T+8.5,11.4,1.4,.5,1.4); }
      add(E.UNIT_BOX,m.marble,0,T+9,10.4,33,1.3,4); add(E.UNIT_BOX,m.gold,0,T+10.3,10.4,33.2,.25,4.1); add(E.GABLE,m.slate,0,T+10.55,10.4,33.6,5,4.4);
      add(E.GABLE,m.marble,0,T+10.95,12.65,29,3.7,.12); add(E.BALL,m.gold,0,T+12.4,12.75,1,1,.3); add(E.UNIT_BOX,m.gold,0,T,9.05,4.2,6.4,.2);
      for(const s of [-1,1]){ const x=s*19; add(E.UNIT_BOX,m.white,x,T,CZ,8,7,10); add(E.UNIT_BOX,m.gold,x,T+6.8,CZ,8.3,.25,10.3);
        add(OCTG,m.white,x,T+7,CZ,3.6,2.4,3.6); add(E.HDOME,m.slate,x,T+9.4,CZ,3.7,3.9,3.7); add(E.CONE,m.gold,x,T+13.2,CZ,.45,2.6,.45); }
      [[20,10],[-20,10],[13,-13],[-13,-13]].forEach(([x,z])=>{ add(OCTG,m.white,x,T,z,1.9,15,1.9); add(OCTG,m.marble,x,T+15,z,2.4,.6,2.4); add(E.CONE,m.slate,x,T+15.6,z,2.5,5.5,2.5);
        add(E.CYL,mat("#8a8378"),x,T+21,z,.1,3.4,.1); add(E.UNIT_BOX,m.red,x+1.05,T+23.1,z,2,1.2,.08); });
      [[26,0],[-26,0],[6,-13.6],[-6,-13.6]].forEach(([x,z])=>{ add(OCTG,m.marble,x,T,z,1.1,1.2,1.1); add(E.BLOB,m.leaf,x,T+2.9,z,1.6,1.8,1.6); });
      const TZ=-2; let y=T; add(E.UNIT_BOX,m.white,0,y,TZ,11,24,11);
      for(const sx of [-1,1]) for(const sz of [-1,1]){ add(E.CYL,m.marble,sx*5.5,y,TZ+sz*5.5,1.15,25.5,1.15); add(E.CONE,m.gold,sx*5.5,y+25.5,TZ+sz*5.5,1.2,3.4,1.2); }
      add(E.UNIT_BOX,m.gold,0,y+24,TZ,11.4,.4,11.4); y+=24.4;
      const windows=(r,y0,h,rows)=>{ const ap=r*Math.cos(Math.PI/8)+.06; for(let k=0;k<8;k++){ const a=k*Math.PI/4; for(let j=0;j<rows;j++) add(E.UNIT_BOX,m.glass,Math.sin(a)*ap,y0+j*(h/rows)+h/rows*.3,TZ+Math.cos(a)*ap,.85,h/rows*.45,.2,a); } };
      const balcony=r=>{ add(OCTG,m.marble,0,y,TZ,r,.7,r); add(OCTG,m.gold,0,y+.55,TZ,r+.08,.16,r+.08); for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(E.CONE,m.gold,Math.sin(a)*r*.98,y+.7,TZ+Math.cos(a)*r*.98,.28,2.4,.28); } y+=.7; };
      const stage=(rb,rt,h,rows)=>{ add(taper(rt/rb),m.white,0,y,TZ,rb,h,rb); windows((rb+rt)/2,y,h,rows); y+=h; };
      stage(5.2,4.8,26,5); for(const x of [-1.6,1.6]) add(E.UNIT_BOX,m.red,x,y-14,TZ+4.75,1.5,9,.12); balcony(6.7); stage(4.3,3.9,20,3); balcony(5.6); stage(3.4,3.1,14,2);
      add(OCTG,m.marble,0,y,TZ,4.3,.5,4.3); y+=.5; for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(E.CYL,m.white,Math.sin(a)*3.4,y,TZ+Math.cos(a)*3.4,.3,5,.3); }
      add(E.BALL,mat("#fff1c4",{emissive:new THREE.Color("#c99a2e")}),0,y+2.4,TZ,1.3,1.3,1.3); glow(g,"rgba(255,215,120,.45)",10,0,y+2.4,TZ);
      y+=5; add(OCTG,m.marble,0,y,TZ,4.2,.8,4.2); y+=.8; add(E.HDOME,m.gold,0,y,TZ,3.7,4.1,3.7); y+=4; add(E.CYL,m.gold,0,y,TZ,.9,1.8,.9); y+=1.8; add(E.CONE,m.gold,0,y,TZ,1.15,16,1.15); },

    lore(g,add,m,W=46,D=30){ cloister(g,add,m,W,D,{skip:(sx,sz)=>sx<0&&sz<0}); const rz=-D/2+6;
      add(E.DISC,m.white,0,0,rz,8,16,8); add(E.DISC,m.marble,0,16,rz,8.6,.9,8.6); add(E.DISC,m.gold,0,16.85,rz,8.7,.16,8.7);
      for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; if(Math.cos(a)>.3) continue; add(E.UNIT_BOX,m.glass,Math.sin(a)*8.05,10.5,rz+Math.cos(a)*8.05,1.2,4.4,.2,a); }
      add(E.HDOME,m.dome,0,17,rz,8.2,8.4,8.2); for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; for(let j=1;j<6;j++){ const t=j/6*Math.PI/2*.92; add(E.BALL,m.marble,Math.sin(a)*(8.2*Math.cos(t)+.12),17+8.4*Math.sin(t),rz+Math.cos(a)*(8.2*Math.cos(t)+.12),.32,.32,.32); } }
      add(OCTG,m.marble,0,25.2,rz,2.2,.6,2.2); add(E.HDOME,m.dome,0,28.4,rz,2,1.8,2); add(E.CONE,m.gold,0,30,rz,.4,4.6,.4);
      spire(add,m,-W/2+1,0,-D/2+3,{r:2.9,h:52,rows:7,thin:true}); },

    cloister(g,add,m){ cloister(g,add,m,50,30); },

    song(g,add,m){ const A=E.archGeo(), dz=4;   // seats curve round toward -z; the stage front of arches faces +z
      const half=new THREE.CircleGeometry(6.2,32,0,Math.PI); half.rotateX(-Math.PI/2); const orch=new THREE.Mesh(half,E.paveMat("#ece6d6",3)); orch.position.set(0,.05,dz); g.add(orch);
      for(let t=0;t<7;t++){ const r0=6.4+t*1.6, n=Math.ceil(Math.PI*(r0+.8)/1.6);
        for(let k=0;k<n;k++){ const a=(k+.5)/n*Math.PI, ca=Math.cos(a), sa=-Math.sin(a); add(E.UNIT_BOX,t%2?m.white:m.marble,(r0+.8)*ca,0,dz+(r0+.8)*sa,Math.PI*(r0+.8)/n+.08,(t+1)*.72,1.62,Math.atan2(-ca,-sa)); } }
      for(let k=0;k<=18;k++){ const a=k/18*Math.PI, R=18.2; add(E.CYL,m.white,R*Math.cos(a),5.04,dz-R*Math.sin(a),.38,5.4,.38); add(E.UNIT_BOX,m.gold,R*Math.cos(a),10.4,dz-R*Math.sin(a),.9,.35,.9); }
      for(let k=0;k<18;k++){ const a=(k+.5)/18*Math.PI, R=18.2, ca=Math.cos(a), sa=-Math.sin(a); add(E.UNIT_BOX,m.marble,R*ca,10.75,dz+R*sa,Math.PI*R/18+.2,.8,1.2,Math.atan2(-ca,-sa)); }
      add(E.UNIT_BOX,m.marble,0,0,dz+4.2,26,1.4,6.4);
      add(E.UNIT_BOX,m.white,0,0,dz+8.6,30,15,2.4); add(E.UNIT_BOX,m.marble,0,15,dz+8.6,30.6,.9,3); add(E.UNIT_BOX,m.gold,0,15.9,dz+8.6,30.8,.18,3.1);
      for(let k=-3;k<=3;k++){ add(A,m.marble,k*4,1.4,dz+7.3,3.6,6.2,.6); add(A,m.marble,k*4,8,dz+7.3,3.6,6,.6); add(E.CYL,m.white,k*4+2,1.4,dz+6.8,.32,13.4,.32); }
      for(const sd of [-1,1]){ add(OCTG,m.marble,sd*9,1.4,dz+3,.8,1.2,.8); add(E.CONE,mat("#f7f5ef"),sd*9,2.6,dz+3,.55,2.6,.55); add(E.BALL,m.gold,sd*9,5.4,dz+3,.4,.4,.4); pavilion(add,m,sd*17,dz+7,3,13,true); } },

    fountains(g,add,m){ const A=E.archGeo(), D=30, W=50;
      pave(g,W+2,D+2,0,0,"#ece6d6",2); pave(g,W-6,D-10,0,2,"#86ab5c",3);
      add(E.UNIT_BOX,m.marble,0,0,2,40,.9,6.4); add(E.UNIT_BOX,wmat(),0,.1,2,39,.85,5.6);
      for(let k=-4;k<=4;k++){ add(E.CYL,m.white,k*4.4,.6,2,.25,1.2,.25); if(k%2===0) add(E.CONE,E.sprayMat,k*4.4,1.6,2,.4,3.4,.4); }
      for(const sd of [-1,1]){ const z=2+sd*7.4; for(let x=-20;x<=20;x+=4){ add(E.CYL,m.white,x,0,z,.32,5,.32); add(E.BLOB,m.leaf,x,5.4,z,1.6,.9,1.6); }
        add(E.UNIT_BOX,m.marble,0,5,z,41,.5,1.2); add(E.UNIT_BOX,m.gold,0,5.5,z,41,.12,1.3); pavilion(add,m,sd*23,2,3.2,8,true); }
      add(E.UNIT_BOX,m.white,0,0,-D/2+2,30,11,3); add(E.UNIT_BOX,m.marble,0,11,-D/2+2,30.6,.8,3.6); add(E.UNIT_BOX,m.gold,0,11.8,-D/2+2,30.8,.16,3.7);
      for(let k=-2;k<=2;k++) add(A,m.marble,k*5.6,0,-D/2+3.6,5,9,.7);
      add(E.UNIT_BOX,m.marble,0,0,-D/2+6,14,.9,4.4); add(E.UNIT_BOX,wmat(),0,.1,-D/2+6,13.2,.85,3.8);
      E.waterfall(add,[0,10.6,-D/2+3.7],[0,1,-D/2+6],5,{cave:false});
      for(const sx of [-1,1]) for(const sz of [-1,1]) gtree(add,m,sx*14,2+sz*11.5,.9); },

    crafts(g,add,m){ const A=E.archGeo(), red=mat("#8e3f2c");   // the front with its twin towers faces +z
      const r=new THREE.Group(); r.rotation.y=-Math.PI/2; g.add(r); const ad=E.adder(r);
      pave(r,52,30,0,0,"#e4dccb",2);
      ad(E.UNIT_BOX,m.white,0,0,0,36,15,12); ad(E.GABLE,m.slate,0,15,0,12.8,5,37,Math.PI/2); ad(E.UNIT_BOX,m.gold,0,19.9,0,37,.3,.4);
      for(const sd of [-1,1]){ ad(E.UNIT_BOX,m.shade,0,0,sd*8.5,36,8.5,5); ad(E.UNIT_BOX,m.slate,0,8.5,sd*8.5,36.4,.5,5.6);
        for(let x=-16;x<=16;x+=4){ ad(E.UNIT_BOX,m.glass,x,10.6,sd*6.05,1.6,3.2,.15); ad(E.UNIT_BOX,m.glass,x,3,sd*11.05,1.4,3.6,.15); ad(E.UNIT_BOX,m.white,x,0,sd*11.4,1.1,8.5,1); } }
      ad(E.DISC,m.white,19,0,0,6,13,6); ad(E.HDOME,m.dome,19,13,0,6.2,5.6,6.2); ad(E.CONE,m.gold,19,18.4,0,.3,2,.3);
      for(const sd of [-1,1]) spire(ad,m,-19,0,sd*5.6,{r:2.6,h:38,rows:5,thin:true,roof:red,banner:red});
      ad(E.UNIT_BOX,m.white,-18.6,0,0,2,16,8.6); ad(A,m.marble,-19.8,0,0,7,12,.8,Math.PI/2); ad(E.UNIT_BOX,m.gold,-19.7,1.2,0,.2,7.6,3.6);
      const rose=new THREE.Mesh(new THREE.TorusGeometry(2.1,.35,6,24),m.gold); rose.position.set(-19.75,13.4,0); rose.rotation.y=Math.PI/2; r.add(rose);
      const ember=mat("#ff8a3d",{emissive:new THREE.Color("#c2410c")}); for(const sd of [-1,1]){ ad(E.UNIT_BOX,mat("#6a635d"),8,8.5,sd*10,2.4,12,2.4); ad(E.UNIT_BOX,ember,8,20.5,sd*10,2.4,.3,2.4); } },

    whitetower(g,add,m){ spire(add,m,0,0,0,{r:3.7,h:78,rows:8,banner:m.red}); },

    twotrees(g,add,m){ const stone=mat("#efe9dc"), grass=mat("#6f8f4e");
      [[-13.5,"#efc53f","#7a5608","#b48a3c","rgba(255,210,100,.5)"],[13.5,"#c9d6e2","#2c3a4a","#d5dde4","rgba(205,225,255,.28)"]].forEach(([x,c,em,tr,gl],ti)=>{
        const t=new THREE.Group(), ad=E.adder(t); t.position.set(x,0,0); g.add(t);
        ad(OCTG,stone,0,0,0,4.3,1,4.3); ad(OCTG,m.gold,0,1,0,4.45,.18,4.45); ad(OCTG,grass,0,1,0,3.85,.24,3.85);
        const bark=mat(tr); ad(E.CYL,bark,0,1,0,.95,5.6,.95);
        for(let k=0;k<4;k++){ const a=k*Math.PI/2+ti*.4, b=new THREE.Mesh(E.CYL,bark); b.position.set(0,5.4,0); b.scale.set(.42,3.8,.42); b.quaternion.setFromUnitVectors(UP,new THREE.Vector3(Math.cos(a)*.6,.8,Math.sin(a)*.6).normalize()); t.add(b); }
        const crown=new THREE.MeshPhongMaterial({color:new THREE.Color(c),emissive:new THREE.Color(em),flatShading:true,shininess:70});
        [[0,10.6,0,4.3],[-3.5,9.3,1.5,3],[3.3,9.5,-1.4,3.1],[1.2,8.7,3.3,2.7],[-1.4,8.9,-3.2,2.8],[0,13.4,.3,2.9],[-2.7,12,-1.6,2.4],[2.6,12.2,1.8,2.4]].forEach(([a,b,cz,s])=>ad(E.BLOB,crown,a,b,cz,s,s,s));
        const bloom=mat("#"+new THREE.Color(c).lerp(new THREE.Color("#ffffff"),.35).getHexString(),{emissive:new THREE.Color(em).multiplyScalar(1.6)});
        for(let k=0;k<16;k++){ const a=k*2.4, r=4.6+(k%3)*.5; ad(E.BALL,bloom,Math.cos(a)*r,7.2+(k%4)*.7,Math.sin(a)*r,.32,.42,.32); }
        glow(t,gl,24,0,10.5,0); }); },

    greatfountain(g,add,m){ const stone=mat("#f4f1e8"), trim=mat("#e2dccd"), DEGR=Math.PI/180;
      const ring=(r0,r1,c,o,y,ts,tl)=>{ const geo=new THREE.RingGeometry(r0,r1,120,1,ts||0,tl||Math.PI*2); geo.rotateX(-Math.PI/2); const q=new THREE.Mesh(geo,E.paveMat(c,o)); q.position.y=y; q.receiveShadow=true; g.add(q); };
      const disc=new THREE.CircleGeometry(27,120); disc.rotateX(-Math.PI/2); const dm=new THREE.Mesh(disc,E.paveMat("#eee9dc",3)); dm.position.y=.03; dm.receiveShadow=true; g.add(dm);
      ring(24.2,27,"#e3dccb",4,.04); ring(15,16.4,"#cdc4ad",4,.04); HOUSE_COLORS.forEach((c,i)=>ring(16.7,18.3,c,5,.05,i*30*DEGR+.02,30*DEGR-.04)); ring(10.2,10.7,"#d8b34a",6,.06);
      octWall(add,stone,0,0,0,10.4,1.5,.9); octWall(add,trim,0,1.5,0,10.45,.3,1.2); add(OCTG,wmat(),0,0,0,10,1.25,10);
      add(OCTG,trim,0,0,0,2.7,4.2,2.7); add(BASIN,stone,0,4.2,0,5.2,1.1,5.2); add(E.DISC,wmat(),0,5.2,0,4.8,.08,4.8); add(CURTAIN,E.curtainMat,0,1.25,0,5.05,3.95,5.05);
      add(E.CYL,trim,0,5.3,0,.95,3,.95); add(BASIN,stone,0,8.3,0,3.3,.85,3.3); add(E.DISC,wmat(),0,9.05,0,3,.08,3); add(CURTAIN,E.curtainMat,0,5.28,0,3.2,3.75,3.2);
      add(E.CYL,trim,0,9.15,0,.6,2.4,.6); add(BASIN,m.gold,0,11.55,0,1.9,.6,1.9); add(CURTAIN,E.curtainMat,0,9.1,0,1.85,2.45,1.85); add(E.CONE,m.gold,0,12.1,0,.5,2.4,.5); add(E.CONE,E.sprayMat,0,12.4,0,.6,4.6,.6);
      for(let k=0;k<8;k++){ const a=k*Math.PI/4, R=9.6, x=Math.cos(a)*R, z=Math.sin(a)*R; add(E.BALL,m.gold,x,2.2,z,.45,.55,.45);
        const j=new THREE.Mesh(E.CONE,E.sprayMat); j.position.set(x,2.4,z); j.scale.set(.26,4.4,.26); j.quaternion.setFromUnitVectors(UP,new THREE.Vector3(-Math.cos(a)*.66,.75,-Math.sin(a)*.66).normalize()); g.add(j); }
      const bs=[]; for(let b=6;b<360;b+=6) bs.push([0,90,180,270].some(a=>Math.abs(((b-a)%360+540)%360-180)<8)?null:b);
      bs.forEach((b,k)=>{ if(b===null) return; const P=(bb,r)=>[r*Math.sin(bb*DEGR),-r*Math.cos(bb*DEGR)], [x,z]=P(b,25.6);
        add(E.UNIT_BOX,trim,x,0,z,1.35,.5,1.35,-b*DEGR); add(E.CYL,stone,x,.5,z,.46,5.9,.46); add(E.UNIT_BOX,trim,x,6.4,z,1.25,.4,1.25,-b*DEGR);
        const nb=bs[k+1]; if(nb!=null){ const [x2,z2]=P(nb,25.6), bm=(b+nb)/2, len=Math.hypot(x2-x,z2-z)+1.25; add(E.UNIT_BOX,stone,(x+x2)/2,6.8,(z+z2)/2,len,.9,1.35,-bm*DEGR); add(E.UNIT_BOX,m.gold,(x+x2)/2,7.7,(z+z2)/2,len,.2,1.45,-bm*DEGR); } });
      [45,135,225,315].forEach(b=>{ const x=21.5*Math.sin(b*DEGR), z=-21.5*Math.cos(b*DEGR); E.lamp(add,x,0,z,4.6); }); },

    greatgate(g,add,m){ const A=E.archGeo(), zf=6.4;
      for(const sd of [-1,1]) spire(add,m,sd*7,0,0,{r:5.4,h:46,rows:7,banner:m.red});
      add(E.UNIT_BOX,m.white,0,0,0,10,14,4); add(A,m.white,0,0,zf,17,24,2.2); add(E.UNIT_BOX,m.marble,0,24,zf,18.4,3.2,2.8); add(E.UNIT_BOX,m.gold,0,26.4,zf+1.45,18.6,.5,.2);
      add(E.UNIT_BOX,m.marble,0,27.2,zf,13,5.4,2); add(E.BALL,mat("#eef2f6"),-4,29.9,zf+1,1.7,1.7,.4); add(E.BALL,m.gold,4,29.9,zf+1,1.7,1.7,.4);
      add(E.UNIT_BOX,m.red,0,29,zf+1,1.7,1.7,.5).rotation.z=Math.PI/4;
      for(const sd of [-1,1]) add(E.UNIT_BOX,m.gold,sd*5.3,1.4,zf+2.7,.4,17,5.2);
      for(let i=0;i<4;i++) for(const sd of [-1,1]){ const z=zf+8+i*7; add(E.CYL,mat("#8a8378"),sd*6,0,z,.14,9,.14); add(E.UNIT_BOX,mat(HOUSE_COLORS[(i*2+(sd+1)/2)%12]),sd*6.05,4.4,z,.12,4,1.9); } },
  };
  // the sky-bridge: a level deck high between two points (stand a White Tower at each end), on an arched rib
  function skybridge(add,m,a,b,s){ const ya=G(a[0],a[1]), yb=G(b[0],b[1]), BY=Math.max(ya,yb)+26*s, dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, ux=dx/l, uz=dz/l, px=-uz, pz=ux, yaw=Math.atan2(-dz,dx);
    const r0=4.6*s, L=Math.max(4,l-2*r0), x0=a[0]+ux*r0, z0=a[1]+uz*r0, N=Math.max(6,Math.round(L/2.2)), A=Math.min(9,L*.24), rib=t=>BY-1.6-A*(1-Math.sin(Math.PI*t));
    for(let k=0;k<N;k++){ const t0=k/N, t1=(k+1)/N, tm=(t0+t1)/2, cx=x0+ux*L*tm, cz=z0+uz*L*tm, sl=L/N+.06;
      add(E.UNIT_BOX,m.marble,cx,BY-.8,cz,sl,.8,3.4,yaw);
      for(const sd of [-1,1]){ add(E.UNIT_BOX,m.white,cx+px*sd*1.55,BY,cz+pz*sd*1.55,sl,.85,.28,yaw); add(E.UNIT_BOX,m.gold,cx+px*sd*1.55,BY+.85,cz+pz*sd*1.55,sl,.12,.36,yaw); }
      const y0=rib(t0), y1=rib(t1), rr=add(E.UNIT_BOX,m.white,cx,(y0+y1)/2-.5,cz,Math.hypot(sl,y1-y0)+.1,1,2.4,yaw); rr.rotation.z=Math.atan2(y1-y0,L/N);
      if(k%2===1){ const yr=rib(tm); if(BY-.8-yr>.6) add(E.UNIT_BOX,m.white,cx,yr,cz,.5,BY-.8-yr,2,yaw); } }
    E.lamp(add,x0+ux*L/2+px*1.3,BY,z0+uz*L/2+pz*1.3,2.4); }


  // each culture's own hall, tower, wall and town, so the styles differ in shape and not only in color
  function styleHall(x,y,z,yawR,s,group,motif){   // the style's district hall (white hall with a dome; arcaded hall with a spire; Rohan's longhall)
    const H=E.STYLE.hall({hall:[0,0],color:look().roof,motif:motif||{noldor:"dome",eldarin:"spire",rohan:"spire"}[SN]||"low"},Object.assign(Object.create(E),{P:()=>new THREE.Vector3(),groundY:()=>0}));
    const g=new THREE.Group(); g.add(H); g.position.set(x,y,z); g.rotation.y=yawR; g.scale.setScalar(s); (group||E.scene).add(g); return g; }
  function styleTower(add,x,z,s,beacon){ const y=G(x,z), L=look();
    if(SN==="eldarin"){ const w=mat(L.stone), sh=mat(L.shade), sp=mat(L.spire), gold=mat(L.gold,{emissive:new THREE.Color("#2a1e04")});   // a needle tower: arcaded foot, slender shaft, balconies, a tall spire
      add(E.CYL,sh,x,y-1,z,4.2*s,7*s,4.2*s); E.arcRing(add,w,x,y,z,4.5*s,12,6*s); let t=y+6*s;
      add(E.CYL,w,x,t,z,2.1*s,26*s,2.1*s);
      for(const f of [.45,1]){ const yy=t+26*s*f; add(E.CYL,mat(L.marble),x,yy,z,3.2*s,.6*s,3.2*s); for(let k=0;k<8;k++){ const a=k*Math.PI/4; add(E.CONE,sp,x+Math.sin(a)*3*s,yy+.6*s,z+Math.cos(a)*3*s,.25*s,2.2*s,.25*s); } }
      for(let j=0;j<5;j++) add(E.UNIT_BOX,mat("#3b4654"),x+2.12*s,t+3*s+j*4.6*s,z,.2,2*s,.8*s);
      t+=26*s+.6*s; if(beacon){ const b=add(E.BALL,mat("#fff1c4",{emissive:new THREE.Color("#d08a2a")}),x,t+1.4*s,z,1.1*s,1.1*s,1.1*s); E.addLantern(b,x,z); t+=2.6*s; }
      add(E.CONE,sp,x,t,z,2.3*s,20*s,2.3*s); add(E.CONE,gold,x,t+19*s,z,.35*s,3*s,.35*s); return; }
    if(SN==="rohan"){ const wood=mat(L.wood||"#5e3f24"), dark=mat("#4a3420"), thatch=mat("#b39a5a");   // a timber watchtower on four posts, with a railed deck and a thatched roof
      const H2=(beacon?20:16)*s, a=2.4*s;
      for(const sx of [-1,1]) for(const sz of [-1,1]){ add(E.CYL,wood,x+sx*a,y-1,z+sz*a,.38*s,H2+1,.38*s); }
      for(const f of [.3,.62]) for(const sd of [-1,1]){ add(E.UNIT_BOX,dark,x,y+H2*f,z+sd*a,a*2.2,.3*s,.3*s); add(E.UNIT_BOX,dark,x+sd*a,y+H2*f,z,.3*s,.3*s,a*2.2); }
      add(E.UNIT_BOX,wood,x,y+H2,z,a*2.8,.5*s,a*2.8);
      for(const sd of [-1,1]){ add(E.UNIT_BOX,dark,x,y+H2+.5*s,z+sd*a*1.35,a*2.8,1.2*s,.25*s); add(E.UNIT_BOX,dark,x+sd*a*1.35,y+H2+.5*s,z,.25*s,1.2*s,a*2.8); }
      for(const sx of [-1,1]) for(const sz of [-1,1]) add(E.CYL,wood,x+sx*a*1.2,y+H2,z+sz*a*1.2,.22*s,4.4*s,.22*s);
      if(beacon){ const b=add(E.CONE,mat("#ffb35c",{emissive:new THREE.Color("#c0601a")}),x,y+H2+.5*s,z,1.3*s,2*s,1.3*s); E.addLantern(b,x,z); }
      else add(E.PYRAMID,thatch,x,y+H2+4.4*s,z,a*3.4,3.4*s,a*3.4);
      const lad=add(E.UNIT_BOX,dark,x+a*1.3,y+H2*.5,z,.2*s,H2*1.04,1*s); lad.rotation.z=.12; return; }
    E.tower(add,x,z,beacon?{r:4*s,h:30*s,beacon:true}:{r:3.4*s,h:24*s,banner:L.roof}); }   // Noldor: a white round tower with battlements and a slate cap
  // Rohan's wall: an earth bank with a log palisade, sharpened tips, and timber towers along it
  function palisade(add,pts,s,owner){ const bank=[], logs=[], tips=[]; let n=0;
    for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], l=Math.hypot(bx-ax,bz-az)||1, yaw=Math.atan2(-(bz-az),bx-ax);
      for(let t=0;t<l;t+=4){ const f=(t+2)/l, x=ax+(bx-ax)*Math.min(1,f), z=az+(bz-az)*Math.min(1,f); bank.push({m:E.M(x,G(x,z)-1,z,yaw,4.6,2.4*s,5.4),c:"#7d8f4f",o:owner}); }
      for(let t=0;t<l;t+=.95,n++){ const x=ax+(bx-ax)*t/l, z=az+(bz-az)*t/l, y=G(x,z)+1.2*s, h=(5.4+(n*7%5)*.25)*s;
        logs.push({m:E.M(x,y,z,0,.46,h,.46),c:n%3?"#6b4a2e":"#5a3d24",o:owner}); tips.push({m:E.M(x,y+h,z,0,.46,.9,.46),c:"#5a3d24",o:owner}); }
      for(let t=i?36:0;t<l;t+=36) styleTower(add,ax+(bx-ax)*t/l,az+(bz-az)*t/l,s*.8); }
    styleTower(add,pts[pts.length-1][0],pts[pts.length-1][1],s*.8);
    E.instanced(E.UNIT_BOX,E.lam("#ffffff"),bank); E.instanced(E.CYL,E.lam("#ffffff"),logs); E.instanced(E.CONE,E.lam("#ffffff"),tips); }
  // Rohan's walled town: a burg on a mound, a palisade with a gate, a golden-roofed longhall in the middle and longhouses round it
  function burg(add,x,z,r,s,yawD,seed,owner,group){ const N=Math.round(r*2*Math.PI/6), gate=(yawD||150)*DEG, ring=[];
    for(let k=0;k<=N;k++){ const a=gate+.22+k/N*(Math.PI*2-.44); ring.push([x+Math.sin(a)*r,z-Math.cos(a)*r]); }
    palisade(add,ring,s,owner);
    styleHall(x,G(x,z),z,-gate,s*1.1,group,"spire");
    const rand=mulberry(seed), list=[];
    for(let t=0;t<200&&list.length<Math.round(r*.45);t++){ const a=rand()*Math.PI*2, rr=16*s+rand()*(r-22*s), hx=x+Math.cos(a)*rr, hz=z+Math.sin(a)*rr, w=(4+rand()*2)*s, d=(6+rand()*2.4)*s;
      if(list.some(o=>Math.hypot(o.x-hx,o.z-hz)<(o.d+d)*.7+2)||Math.abs(Math.atan2(hx-x,-(hz-z))-gate)<.25) continue;
      list.push({x:hx,z:hz,b:(Math.atan2(hx-x,-(hz-z))/DEG+360)%360,w,d}); }
    styleHouses(list,owner,seed,null,false); }

  // a Noldorin town: level ground inside a crenellated white wall with round towers and a gate, white houses round a paved square,
  // a fountain, and a tall white tower with a gold finial in the middle (the High Elven town climbs in arcaded terraces instead)
  function noldoTown(add,x,z,r,s,yawD,seed,owner){ const gate=(yawD||150)*DEG, ring=[], N=Math.round(r*2*Math.PI/8);
    for(let k=0;k<=N;k++){ const a=gate+.2+k/N*(Math.PI*2-.4); ring.push([x+Math.sin(a)*r,z-Math.cos(a)*r]); }
    wall(add,ring,s*.85,owner);
    for(const sd of [-1,1]){ const a=gate+sd*.2, gx=x+Math.sin(a)*r, gz=z-Math.cos(a)*r, gy=G(gx,gz); add(E.CYL,mat("#f4f1ea"),gx,gy-2,gz,3.4*s,17*s,3.4*s); add(E.CONE,mat("#d8b34a",{emissive:new THREE.Color("#2a1e04")}),gx,gy+15*s,gz,4*s,6*s,4*s); }
    const y=G(x,z), sq=10*s; const d=new THREE.CircleGeometry(sq,40); d.rotateX(-Math.PI/2); const pv=new THREE.Mesh(d,E.paveMat("#ece6d8",3)); pv.position.set(x,y+.05,z); pv.receiveShadow=true; add.group?add.group.add(pv):E.target?E.target.add(pv):E.scene.add(pv);
    const m=GM(); spire(add,m,x,y,z,{r:2.8*s,h:44*s,rows:6,banner:m.red});
    const rand=mulberry(seed), list=[];
    for(let t=0;t<400&&list.length<Math.round(r*.9);t++){ const a=rand()*Math.PI*2, rr=sq+5*s+rand()*(r-sq-11*s), hx=x+Math.cos(a)*rr, hz=z+Math.sin(a)*rr, w=(3.6+rand()*2.4)*s, dd=(4.2+rand()*1.8)*s;
      const ga=Math.atan2(hx-x,-(hz-z)); if(Math.abs(((ga-gate)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)<.3||list.some(o=>Math.hypot(o.x-hx,o.z-hz)<(o.w+w)*.6+1.6)) continue;
      list.push({x:hx,z:hz,b:(ga/DEG+360)%360,w,d:dd}); }
    styleHouses(list,owner,seed,null,true); E.addFountainPOI(x,z); E.addGardenPOI(x,z,sq); }
  // the turns of a stair between two points: straight on gentle ground; on a steep slope, flights back and forth across it
  function stairTurns(a,b,s){ const ya=G(a[0],a[1]), yb=G(b[0],b[1]), L=Math.hypot(b[0]-a[0],b[1]-a[1])||1, rise=Math.abs(yb-ya);
    const n=rise/L>.55?Math.min(9,Math.ceil(rise/(L*.5))):1, ux=(b[0]-a[0])/L, uz=(b[1]-a[1])/L, W=Math.min(9*s,4+L*.25);
    const pts=[a]; for(let k=1;k<n;k++){ const f=k/n, side=k%2?1:-1; pts.push([a[0]+(b[0]-a[0])*f-uz*W*side,a[1]+(b[1]-a[1])*f+ux*W*side]); } pts.push(b); return pts; }
  // the height of the stair along its turns: each flight climbs evenly from turn to turn, but never dips below the ground
  function stairPath(a,b,s){ const T=stairTurns(a,b,s), out=[];
    for(let i=0;i<T.length-1;i++){ const [ax,az]=T[i], [bx,bz]=T[i+1], ya=G(ax,az)+.4, yb=G(bx,bz)+.4, n=Math.max(3,Math.round(Math.hypot(bx-ax,bz-az)/1.2));
      for(let k=i?1:0;k<=n;k++){ const f=k/n, x=ax+(bx-ax)*f, z=az+(bz-az)*f; out.push([x,z,Math.max(ya+(yb-ya)*f,G(x,z)+.4),k===0||k===n]); } }
    return {T,out}; }
  function mountainStair(add,a,b,s){ const L=look(), m=mat(L.marble||"#e6e0d2"), rail=mat(L.stone), {T,out}=stairPath(a,b,s), W=5*s;
    for(let i=0;i<out.length-1;i++){ const [ax,az,ay]=out[i], [bx,bz,by]=out[i+1], mx=(ax+bx)/2, mz=(az+bz)/2, y=Math.max(ay,by), base=Math.min(G(mx,mz),Math.min(ay,by))-1.5;
      add(E.UNIT_BOX,m,mx,base,mz,W,y-base,Math.hypot(bx-ax,bz-az)+.25,Math.atan2(bx-ax,bz-az));                      // each step stands on the rock below it
      if(i%2===0){ const l=Math.hypot(bx-ax,bz-az)||1, px=-(bz-az)/l*W/2, pz=(bx-ax)/l*W/2; for(const sd of [-1,1]) add(E.UNIT_BOX,rail,mx+px*sd,y,mz+pz*sd,.45,.9,l*2.1,Math.atan2(bx-ax,bz-az)); } }
    T.forEach(([x,z],i)=>{ if(i===0||i===T.length-1) return; const y=G(x,z)+.4, base=y-6; add(E.UNIT_BOX,m,x,base,z,W*1.6,y-base,W*1.6); E.lamp(add,x+W*.6,y,z+W*.6,3.4); });   // landings at the turns
  }
  function build(rec,add,owner,group){
    const s=rec.s||1, x=rec.x, z=rec.z, y=x!==undefined?G(x,z):0, yaw=(rec.yaw||0)*DEG, L=look(), seed=rec.seed||7, r=rec.r||TYPES[rec.t].r||30;
    switch(rec.t){
      case "house": styleHouses([{x,z,b:rec.yaw||0,w:4.6*s,d:5.2*s}],owner,seed); break;
      case "village": { const rand=mulberry(seed), list=[], n=rec.n||Math.round(r*.4);
        for(let t=0;t<n*30&&list.length<n;t++){ const a=rand()*Math.PI*2, rr=10+Math.sqrt(rand())*(r-10), hx=x+Math.cos(a)*rr, hz=z+Math.sin(a)*rr, w=(3.6+rand()*2.6)*s, d=(4.2+rand()*2)*s;
          if(G(hx,hz)<water()+.8||list.some(o=>Math.hypot(o.x-hx,o.z-hz)<(o.w+w)*.7+2)) continue;
          list.push({x:hx,z:hz,b:(Math.atan2(hx-x,-(hz-z))/DEG+360)%360,w,d}); }
        styleHouses(list,owner,seed,[x,z],true); E.addFountainPOI(x,z); E.addGardenPOI(x,z,8); break; }
      case "hall": styleHall(x,y,z,yaw,s*1.3,group); E.addHome(x,z); break;
      case "tower": styleTower(add,x,z,s,false); break;
      case "beacon": styleTower(add,x,z,s,true); break;
      case "town": if(SN==="rohan"){ burg(add,x,z,r,s,rec.yaw,seed,owner,group); break; } if(SN==="noldor"){ noldoTown(add,x,z,r,s,rec.yaw,seed,owner); break; } group.add(E.town({c:[x,z],y0:y,radii:[r,r*.66,r*.36],levelH:7*s,gate:rec.yaw||150,stair:false,seed})); break;   // the editor flattens the ground under it first
      case "market": { const c=new THREE.Color(L.gold);
        E.hall(add,x-Math.sin(yaw)*26*s,z-Math.cos(yaw)*26*s,{w:22*s,d:10*s,h:7*s,yaw:-yaw,porch:true});
        add(E.CYL,mat(L.marble),x,y,z,2.4*s,1*s,2.4*s); const w=add(E.CYL,E.waterMat(),x,y+.95*s,z,1.9*s,.1,1.9*s); E.addWater(w.material);
        const COL=["#d6a32a","#b3373f","#3b7dc1","#3e7b48","#7b5ea8","#d9534f"];
        for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, sx=x+Math.cos(a)*12*s, sz=z+Math.sin(a)*12*s, sy=G(sx,sz);
          add(E.UNIT_BOX,mat("#8a6a48"),sx,sy,sz,3*s,1.2*s,2*s,-a); add(E.UNIT_BOX,mat(COL[k%6]),sx,sy+2.6*s,sz,3.4*s,.3*s,2.4*s,-a);
          for(const q of [-1,1]) add(E.CYL,mat("#6b4a2e"),sx+Math.sin(a)*q*1.4*s,sy,sz-Math.cos(a)*q*1.4*s,.12,2.6*s,.12); }
        E.addFountainPOI(x,z); break; }
      case "fountain": { add(E.CYL,mat(L.marble),x,y,z,3*s,1*s,3*s); const w=add(E.CYL,E.waterMat(),x,y+.9*s,z,2.6*s,.12,2.6*s); E.addWater(w.material);
        add(E.CYL,mat(L.stone),x,y,z,.45*s,3.4*s,.45*s); add(E.CYL,mat(L.stone),x,y+2.6*s,z,1.3*s,.35*s,1.3*s); add(E.CONE,E.sprayMat,x,y+3.2*s,z,.5*s,2.2*s,.5*s); E.addFountainPOI(x,z); break; }
      case "camp": E.camp({c:[x,z],r,n:rec.n||Math.round(r*.6),size:4,stretch:1,seed,owner,banner:L.roof}); break;
      case "huts": E.huts({c:[x,z],r,n:rec.n||Math.round(r*.4),size:3.4,fire:true,seed,owner}); E.addHome(x,z); break;
      case "wall": if(rec.pts&&rec.pts.length>1){ if(SN==="rohan") palisade(add,rec.pts,s,owner); else wall(add,rec.pts,s,owner); } break;
      case "road": if(rec.pts&&rec.pts.length>1) E.track(rec.pts,{w:5*s,color:L.paving==="#ebe6d8"?"#d8ccb0":L.paving,owner}); break;
      case "quay": if(rec.pts&&rec.pts.length>1) E.quay(add,rec.pts,{y:water()+1,w:5*s,lampEvery:34}); break;
      case "bridge": if(rec.p2){ const y0=G(x,z)+1, y1=G(rec.p2[0],rec.p2[1])+1; E.bridge(add,[x,z],rec.p2,{y0,y1,w:7*s,span:14,cutwaters:true,waterLevel:water()}); } break;
      case "stair": if(rec.p2) mountainStair(add,[x,z],rec.p2,s); break;
      case "pier": if(rec.p2) E.pier(add,[x,z],rec.p2,{y:water()+.8,w:3.6*s}); break;
      case "boat": E.boat(add,x,z,yaw,{len:8*s,sail:s>=1}); break;
      case "waterfall": if(rec.p2) E.waterfall(add,[x,G(x,z)+.5,z],[rec.p2[0],Math.max(G(rec.p2[0],rec.p2[1]),water()),rec.p2[1]],6*s,{cave:false}); break;
      case "forest": E.scatter({kind:"tree",n:rec.n||Math.round(r*r*.012),area:{x,z,r},seed,size:[.8*s,1.4*s],keep:(qx,qz,qy)=>qy>water()+.6,owner}); break;
      case "pines": E.scatter({kind:"pine",n:rec.n||Math.round(r*r*.012),area:{x,z,r},seed,size:[.8*s,1.3*s],keep:(qx,qz,qy)=>qy>water()+.6,owner}); break;
      case "cypresses": E.scatter({kind:"cypress",n:rec.n||Math.round(r*r*.02),area:{x,z,r},seed,size:[.8*s,1.3*s],keep:(qx,qz,qy)=>qy>water()+.6,owner}); break;
      case "rocks": E.scatter({kind:"rock",n:rec.n||Math.round(r*r*.01)+4,area:{x,z,r},seed,size:[.25*s,.7*s],colors:["#8f887b","#7a7469","#a39b8c"],owner}); break;
      case "reeds": E.scatter({kind:"reed",n:rec.n||Math.round(r*r*.06),area:{x,z,r},seed,size:[1,1.6],keep:(qx,qz,qy)=>qy>water()-.5&&qy<water()+1.4,owner}); break;
      case "fields": E.fields({area:{x0:x-r,x1:x+r,z0:z-r,z1:z+r},cell:[32,26],seed,owner,avoid:(fx,fz,w,d)=>Math.hypot(fx-x,fz-z)>r-12||G(fx,fz)<water()+.8}); break;
      case "herd": E.herd(add,x,z,rec.n||Math.round(r*.4)+4,{spread:r,seed}); break;
      case "skybridge": if(rec.p2) skybridge(add,GM(),[x,z],rec.p2,s); break;
      default: if(GREAT[rec.t]){ const g=new THREE.Group(), m=GM(); g.position.set(x,y,z); g.rotation.y=yaw; g.scale.setScalar(s);
        const R=(TYPES[rec.t].flat||20)*.9; E.adder(g)(E.DISC||E.CYL,m.shade,0,-10,0,R,10,R);   // a footing, in case the ground falls away
        GREAT[rec.t](g,E.adder(g),m); (group||E.scene).add(g); }
    }
  }
  return {TYPES,build,stairPath};
};
})();
