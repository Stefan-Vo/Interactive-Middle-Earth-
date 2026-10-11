/* Rohan style: how the Rohirrim build, for citymaker.
   Timber longhouses with steep thatched gables on stone footings, an earth bank topped by a log palisade,
   timber watchtowers and gates, fieldstone terraces with fences, wells, haystacks, vegetable gardens and horse-head posts.
   A style draws; the engine decides where. Functions get E (engine helpers) or B (the instanced shapes the generated
   city draws into, plus rand). Keep each piece's random calls in a fixed order: changing them re-lays the city. */
(function(){
window.STYLES=window.STYLES||{};
const TIMBER=["#7a5634","#8a6440","#6b4a2e","#9a7450"], WASH="#cbb89a", THATCH=["#b8955a","#a8854a","#c4a265"], TURF="#71884a";
const WOOD="#5e4128", STONE="#9a948a", EARTH="#a8916a", GRASS=["#7da455","#86ab5c","#71984c"], HAY="#d8b860";

window.STYLES.rohan={
  look:{stone:"#a8a296",shade:"#8f897d",marble:"#b8b2a6",roof:"#b8963e",spire:"#6b4a2e",gold:"#d9b04a",wood:"#5e3f24",paving:"#b9a27a",leaf:"#4f7a3a",spires:false},   // colors for the engine's recipes
  palette:{tier:"#86a157",paving:"#b9a27a",lampPost:"#4a3a2a",lampUnlit:"#5a4a3a",lampLit:"#ffb35c"},
  // longhouses stand with their long side along the street, spaced out, with more yards between them
  rows:{start:30.5,depth:7,lane:3.5,w:[6,5],gap:[1.5,2.5],alley:[.2,4],cut:[1.5,1.2]},
  yards:{courts:3,gardens:6,gardenChance:.6,gardenR:[6,4],courtR:[5,2.5]},
  // gable roofs with the ridge along the house's length (x), drawn as one instanced shape
  buckets:[{name:"gables",geo:E=>E.GABLE.clone().rotateY(Math.PI/2),mat:E=>E.lam("#ffffff"),shadow:true}],

  // a district's longhall: stone footing, timber walls, steep thatched gable, crossed beams on the gable ends, a banner
  hall(h,E){
    const {THREE,P,DEG,lam,groundY,UNIT_BOX,PYRAMID,CYL,CONE,BLOB,GABLE}=E;
    const g=new THREE.Group(), pos=P(h.hall[0],h.hall[1],groundY(h.hall[1]));
    g.position.copy(pos); g.rotation.y=-h.hall[0]*DEG;
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    const gableX=GABLE.clone().rotateY(Math.PI/2), wood=lam(WOOD), timber=lam("#6b4a2e");
    const roof=lam(h.motif==="spire"?"#d9b04a":THATCH[0],h.motif==="spire"?{emissive:new THREE.Color("#3a2805")}:{});
    add(UNIT_BOX,lam(STONE),0,0,0,17,1,10);
    add(UNIT_BOX,timber,0,1,0,16,4.5,9);
    add(gableX,roof,0,5.5,0,18.4,6,11);
    add(UNIT_BOX,lam("#3a2a1c"),0,1,4.55,2.2,3.2,.12);                       // the door
    for(const x of [-9.2,9.2]) for(const s of [-1,1]){                       // crossed beams on each gable end
      const m=add(UNIT_BOX,wood,x,10.6,0,.3,3,.3); m.rotation.x=s*.62; }
    switch(h.motif){
      case "forge": add(UNIT_BOX,lam("#5b5550"),5,5,-2,2,7,2); add(UNIT_BOX,lam("#ff8a3d",{emissive:new THREE.Color("#c2410c")}),5,12,-2,2,.3,2); break;
      case "tree": { const tm=new THREE.MeshPhongMaterial({color:0x3f7d3e,flatShading:true,shininess:5});
        [[-9,6,-4,4.6],[-10.5,8.5,-6,3.2],[-7.4,7.8,-1.8,3]].forEach(([x,y,z,s])=>{ const m=new THREE.Mesh(BLOB,tm); m.position.set(x,y,z); m.scale.setScalar(s); g.add(m); }); add(CYL,lam("#6b5a40"),-9,0,-4,.7,4,.7); break; }
      case "stable": add(UNIT_BOX,timber,0,0,-9,14,3,5); add(gableX,lam(THATCH[1]),0,3,-9,15,3,6); break;
      case "tower": for(const x of [-1.5,1.5]) for(const z of [-1.5,1.5]) add(CYL,wood,-11+x,0,-6+z,.3,12,.3);
        add(UNIT_BOX,wood,-11,10,-6,4.4,.5,4.4); add(PYRAMID,lam(THATCH[2]),-11,10.5,-6,5,3,5); break;
      case "rotunda": add(CYL,timber,-11,0,-5,3.2,3.5,3.2); add(CONE,lam(THATCH[2]),-11,3.5,-5,4,3.6,4); break;
    }
    add(CYL,lam(WOOD),9,0,4,.16,12,.16);                                       // banner
    add(UNIT_BOX,lam(h.color),10.6,8.6,4,3.2,2.6,.14);
    return g;
  },

  // an earth bank topped by a log palisade around the summit, timber watchtowers, and the gate with a road down the hill
  outerWall(E){
    const {THREE,H,DEG,P,M,edgeR,edgeS,angDist,GATE_B,lam,instanced,own,surfaceY,UNIT_BOX,CYL,CONE,PYRAMID}=E;
    const bank=[], logs=[], tips=[], posts=[], decks=[], roofs=[];
    for(let b=0;b<360;b+=2){
      if(angDist(b+1,GATE_B)<3.4) continue;
      const p1=P(b,edgeR(b)-3), p2=P(b+2,edgeR(b+2)-3), dx=p2.x-p1.x, dz=p2.z-p1.z;
      bank.push({m:M((p1.x+p2.x)/2,H,(p1.z+p2.z)/2,Math.atan2(-dz,dx),Math.hypot(dx,dz)+.6,1.6,4.6),c:"#7d8f4f",o:"walls"});
    }
    let n=0;
    for(let b=0;b<360;b+=.42,n++){                                           // one log about every 0.9 along the wall
      if(angDist(b,GATE_B)<3.2) continue;
      const q=P(b,edgeR(b)-2.6), h=5.6+((n*7)%5)*.25;
      logs.push({m:M(q.x,H+1.4,q.z,0,.44,h,.44),c:TIMBER[n%4],o:"walls"});
      tips.push({m:M(q.x,H+1.4+h,q.z,0,.46,1.2,.46),c:TIMBER[(n+1)%4],o:"walls"});
    }
    for(let b=15;b<360;b+=30){                                               // watchtowers
      if(angDist(b,GATE_B)<12) continue;
      const q=P(b,edgeR(b)-5), yaw=-b*DEG;
      for(const x of [-1.6,1.6]) for(const z of [-1.6,1.6]) posts.push({m:M(q.x+Math.cos(b*DEG)*x-Math.sin(b*DEG)*z,H,q.z+Math.sin(b*DEG)*x+Math.cos(b*DEG)*z,0,.32,11,.32),c:WOOD,o:"walls"});
      decks.push({m:M(q.x,H+9,q.z,yaw,4.6,.5,4.6),c:WOOD,o:"walls"});
      roofs.push({m:M(q.x,H+12,q.z,yaw,5.4,2.8,5.4),c:THATCH[2],o:"walls"});
      decks.push({m:M(q.x,H+9.5,q.z,yaw,4.6,1,.2),c:WOOD,o:"walls"});
    }
    instanced(UNIT_BOX,lam("#ffffff"),bank);
    instanced(CYL,lam("#ffffff"),logs);
    instanced(CONE,lam("#ffffff"),tips);
    instanced(CYL,lam("#ffffff"),posts);
    instanced(UNIT_BOX,lam("#ffffff"),decks);
    instanced(PYRAMID,lam("#ffffff"),roofs);

    // the gate, drawn facing south (bearing 180) and then turned to face the real gate
    const g=new THREE.Group(), wood=lam(WOOD), dark=lam("#4a3320"), road=lam("#a8916a"), thatch=lam(THATCH[0]);
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    const gz=edgeS-2.6;
    for(const s of [-1,1]){ add(UNIT_BOX,wood,s*6,H,gz,3.2,12,3.2); add(PYRAMID,thatch,s*6,H+12,gz,4.4,3.2,4.4);
      const door=add(UNIT_BOX,dark,s*3.4,H,gz+2.6,4,6.5,.35); door.rotation.y=s*1.1; }   // the gate leaves stand open
    add(UNIT_BOX,wood,0,H+8.4,gz,13,1.4,1.8);
    add(UNIT_BOX,lam("#3e6b3a"),0,H+5.4,gz+.95,3.4,2.6,.12);                 // a green banner over the way in
    // the road down the hill, following the slope
    const r0=edgeS-3, r1=edgeS*2.15, N=30;
    for(let i=0;i<N;i++){
      const a=r0+(r1-r0)*i/N, b=r0+(r1-r0)*(i+1)/N, pa=P(GATE_B,a), pb=P(GATE_B,b);
      const ya=i===0?H:surfaceY(pa.x,pa.z), yb=surfaceY(pb.x,pb.z), len=b-a;
      const m=add(UNIT_BOX,road,0,Math.min(ya,yb)-.25,(a+b)/2,7.5,.5+Math.abs(ya-yb),len+.2); m.rotation.x=0;
    }
    g.rotation.y=Math.PI-GATE_B*DEG;
    own("gate",g);
  },

  // terraces: a low fieldstone retaining wall with a fence along the top; stone steps and plain posts where avenues climb
  levelWalls(E){
    const {THREE,DEG,P,M,WALLS,AVENUES,RAMP,angDist,lam,instanced,UNIT_BOX,CYL}=E;
    const walls=[], rails=[], fposts=[], gates=[], steps=[];
    WALLS.forEach(({R,yUp,yLow})=>{
      const half=a=>Math.asin((a.w/2+1.2)/R)/DEG, nearGate=(b,pad)=>AVENUES.some(a=>angDist(b,a.b)<half(a)+pad);
      for(let b=0;b<360;b+=1.5){
        if(nearGate(b+.75,.75)) continue;
        const p1=P(b,R), p2=P(b+1.5,R), dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+.3, yaw=Math.atan2(-dz,dx), mx=(p1.x+p2.x)/2, mz=(p1.z+p2.z)/2;
        walls.push({m:M(mx,yLow,mz,yaw,len,yUp+.5-yLow,1.8),c:STONE,o:"walls"});
        rails.push({m:M(mx,yUp+1.3,mz,yaw,len,.18,.18),c:WOOD,o:"walls"});
        fposts.push({m:M(p1.x,yUp+.5,p1.z,0,.14,1.4,.14),c:WOOD,o:"walls"});
      }
      AVENUES.forEach(a=>{
        const off=half(a)+.6;
        for(const sd of [-1,1]){ const q=P(a.b+sd*off,R); gates.push({m:M(q.x,yLow,q.z,-a.b*DEG,.8,yUp+4.6-yLow,.8),c:WOOD,o:"walls"}); }
        const q=P(a.b,R); gates.push({m:M(q.x,yUp+4.2,q.z,-a.b*DEG,a.w+2.8,.6,.7),c:WOOD,o:"walls"});
        const N=10;
        for(let i=0;i<N;i++){ const ra=R+i*RAMP/N, rb=ra+RAMP/N, t=yUp-(i+.5)/N*(yUp-yLow), m=P(a.b,(ra+rb)/2);
          steps.push({m:M(m.x,yLow,m.z,-a.b*DEG,a.w,Math.max(.2,t-yLow),RAMP/N+.05),c:"#a39d90",o:"walls"}); }
      });
    });
    instanced(UNIT_BOX,lam("#ffffff"),walls);
    instanced(UNIT_BOX,lam("#ffffff"),rails);
    instanced(CYL,lam("#ffffff"),fposts);
    instanced(UNIT_BOX,lam("#ffffff"),gates);
    instanced(UNIT_BOX,lam("#ffffff"),steps);
  },

  // the pieces of the generated city
  pieces(B,E){
    const {THREE,M,H,DEG,rand,HOUSES,pick,tangentYaw}=B;
    const tA=new THREE.Color("#4c7d3c"), tB=new THREE.Color("#73a04f");
    const tree=(x,z,s,o)=>B.trees.push({m:M(x,H+.1+s*.85,z,rand()*6,s,s*1.15,s),c:tA.clone().lerp(tB,rand()),o});
    const haystack=(x,z,s,o)=>B.cones.push({m:M(x,H,z,0,s,s*1.3,s),c:HAY,o});
    function well(x,z,o){                                                    // a stone well with a little thatched roof
      B.cyl.push({m:M(x,H,z,0,1.3,1,1.3),c:STONE,o}); B.water.push({m:M(x,H+.95,z,0,1,.1,1),c:"#3f86b4",o});
      for(const s of [-1,1]) B.towers.push({m:M(x+s*1.1,H+1,z,0,.12,2.2,.12),c:WOOD,o});
      B.roofs.push({m:M(x,H+3.2,z,0,2.6,1.3,2.6),c:THATCH[0],o});
    }
    function fountain(x,z,R,o){                                              // a stone trough fed by the stream
      B.cyl.push({m:M(x,H,z,0,R,.8,R),c:STONE,o}); B.water.push({m:M(x,H+.75,z,0,R*.84,.1,R*.84),c:"#5aa8d6",o});
    }
    function statue(x,z,yaw,o){                                              // a carved post topped with a horse's head
      B.cyl.push({m:M(x,H,z,0,.32,4,.32),c:WOOD,o});
      B.box.push({m:M(x,H+3.6,z,yaw,.45,1,1.5),c:"#c9b07a",o});
    }
    function courtyard(x,z,R,o){                                             // a farmyard: well, haystacks or a big tree, posts around
      B.cyl.push({m:M(x,H,z,0,R,.12,R),c:EARTH,o});
      const k=rand();
      if(k<.45){ well(x,z,o); B.poi.fountains.push({x,z}); }
      else if(k<.75){ haystack(x-1.4,z,1.6,o); haystack(x+1.6,z+.6,1.3,o); }
      else tree(x,z,1.8+rand()*.6,o);
      const n=7+Math.floor(rand()*4), a0=rand()*6;
      for(let i=0;i<n;i++){ const a=a0+i/n*Math.PI*2; B.towers.push({m:M(x+Math.cos(a)*(R-.4),H,z+Math.sin(a)*(R-.4),0,.12,1.3,.12),c:WOOD,o}); }
    }
    function garden(x,z,R,o){                                                // a kitchen garden inside a wattle fence
      B.poi.gardens.push({x,z,R});
      B.cyl.push({m:M(x,H,z,0,R,.14,R),c:pick(GRASS),o});
      const segs=14;
      for(let i=0;i<segs;i++){ if(i===0) continue;
        const am=(i+.5)/segs*Math.PI*2, rr=R-.3, len=2*rr*Math.sin(Math.PI/segs)+.1;
        B.box.push({m:M(x+Math.cos(am)*rr,H+.14,z+Math.sin(am)*rr,tangentYaw(am),len,.9,.25),c:"#8a6a44",o}); }
      const rowsN=3+Math.floor(rand()*2), yaw=rand()*3;
      for(let i=0;i<rowsN;i++){ const off=(i-(rowsN-1)/2)*1.6;
        B.box.push({m:M(x+Math.cos(yaw)*off,H+.14,z+Math.sin(yaw)*off,-yaw+Math.PI/2,R*1.1,.4,.8),c:i%2?"#6d9a4a":"#5d8a3f",o}); }
      if(rand()<.5) haystack(x+R*.45,z-R*.35,1.2,o); else tree(x-R*.45,z+R*.35,1.2+rand()*.5,o);
    }
    return {tree,fountain,statue,courtyard,garden,
      // a green where an avenue meets a ring road: a well, trees, and on the great streets a horse trough
      plaza(q,PR,main,a,o){
        B.cyl.push({m:M(q.x,H,q.z,0,PR,.12,PR),c:"#8fab5f",o});
        B.cyl.push({m:M(q.x,H,q.z,0,PR-1.4,.15,PR-1.4),c:EARTH,o});
        well(q.x,q.z,o);
        if(main){ for(let i=0;i<4;i++){ const an=i*Math.PI/2+.785; tree(q.x+Math.cos(an)*(PR-1.6),q.z+Math.sin(an)*(PR-1.6),.9,o); }
          B.box.push({m:M(q.x+3.2,H,q.z,-a.b*DEG,.9,.7,3.2),c:STONE,o}); }
        else if(rand()<.5) statue(q.x+2.6,q.z,-a.b*DEG,o);
      },
      // along a great street: trees; on the street from the gate, green and white banners on tall poles
      avenueDecor({x,z,tx,tz,side,k,a,isGate,o}){
        if(!isGate) tree(x,z,.9+rand()*.35,o);
        else { B.cyl.push({m:M(x,H,z,0,.16,8.5,.16),c:WOOD,o});
          B.box.push({m:M(x+tx*side*.9,H+5.4,z+tz*side*.9,-a.b*DEG,1.6,2.8,.12),c:k%2?"#f1ead8":"#3e6b3a",o}); }
      },
      // one lot in a row: a watchtower, a yard with haystacks, or a longhouse
      lot({q,b,w,d,rc,e,yaw,h,hc,kind}){
        if(kind<.03){
          for(const s of [-1,1]) for(const t of [-1,1]) B.towers.push({m:M(q.x+Math.cos(b*DEG)*s*1.4-Math.sin(b*DEG)*t*1.4,H,q.z+Math.sin(b*DEG)*s*1.4+Math.cos(b*DEG)*t*1.4,0,.28,9,.28),c:WOOD,o:h.id});
          B.box.push({m:M(q.x,H+7.5,q.z,yaw,3.8,.4,3.8),c:WOOD,o:h.id});
          B.roofs.push({m:M(q.x,H+9,q.z,yaw,4.4,2.4,4.4),c:THATCH[rand()<.5?0:2],o:h.id});
        } else if(kind<.2){
          haystack(q.x,q.z,1.2+rand()*.8,h.id);
          if(rand()<.6) tree(q.x+Math.cos(b*DEG)*w*.3,q.z+Math.sin(b*DEG)*w*.3,1+rand()*.6,h.id);
        } else {
          const ht=2.8+rand()*1.6, washed=rand()<.25;
          B.bodies.push({m:M(q.x,H,q.z,yaw,w,ht,d),c:washed?WASH:TIMBER[Math.floor(rand()*4)],o:h.id});
          const turf=rand()<.12, c=new THREE.Color(turf?TURF:THATCH[Math.floor(rand()*3)]).lerp(hc,.08);
          B.gables.push({m:M(q.x,H+ht,q.z,yaw,w+.9,d*.85,d+.9),c,o:h.id});
        }
      },
    };
  },
};
})();
