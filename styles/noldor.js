/* Noldor style: how the Elves of Gondolin build, for citymaker.
   White dressed stone, slate-blue and gold caps, crenellated walls with round towers, fountains and hedged gardens.
   A style draws; the engine decides where. Every function here is called by the engine with E (its helpers) or
   B (the instanced shapes the generated city draws into). Keep the random calls in each piece in the same order,
   or the generated city of every city using this style changes (and saved demolitions stop matching). */
(function(){
window.STYLES=window.STYLES||{};
window.STYLES.noldor={
  look:{stone:"#f4f1ea",shade:"#cfc9ba",marble:"#e6e0d2",roof:"#6f8ea8",spire:"#6f8ea8",gold:"#d8b34a",paving:"#ebe6d8",leaf:"#4c7d3c",spires:false},   // colors for the engine's recipes
  palette:{tier:"#d8d3c6",paving:"#ebe6d8",lampPost:"#6a6152",lampUnlit:"#7d725e",lampLit:"#ffe2a0"},
  // rows of houses: first row's radius, depth of a row, lane between row pairs, house width [min, extra], gap [min, extra],
  // alley [chance, width], and how much shallower than the row a house is [min, extra]. What stands on each lot is pieces().lot.
  rows:{start:30.5,depth:5.4,lane:2.4,w:[3,3.6],gap:[.35,.8],alley:[.07,2.4],cut:[.35,1.3]},
  // courtyards and gardens per district, and their sizes [min, extra]
  yards:{courts:7,gardens:5,gardenChance:.45,gardenR:[6.5,4],courtR:[5.5,2.8]},
  buckets:[],                                   // extra instanced shapes (none: the standard ones are enough)

  // the hall of a district: a white hall with a pyramid roof, styled by its motif, with a banner
  hall(h,E){
    const {THREE,P,DEG,lam,groundY,UNIT_BOX,PYRAMID,CYL,CONE,BLOB}=E;
    const g=new THREE.Group(), pos=P(h.hall[0],h.hall[1],groundY(h.hall[1]));
    g.position.copy(pos); g.rotation.y=-h.hall[0]*DEG;
    const white=lam("#f4f1ea"), roofC=lam(h.color), trim=lam(new THREE.Color(h.color).lerp(new THREE.Color("#ffffff"),.25));
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    const low=h.motif==="low";
    const bw=low?16:12, bh=low?4.5:7, bd=low?12:14;
    add(UNIT_BOX,white,0,0,0,bw,bh,bd);
    add(PYRAMID,roofC,0,bh,0,bw+1.4,low?2.6:5,bd+1.4);
    switch(h.motif){
      case "spire": add(CYL,white,0,bh,0,2.4,12,2.4); add(CONE,lam("#d8b34a"),0,bh+12,0,3,7,3); break;
      case "low": add(UNIT_BOX,lam("#26262b"),0,0.02,-9.5,5,.25,4); break;
      case "tower": add(CYL,white,4,0,5,2,18,2); add(CONE,roofC,4,18,5,2.6,6,2.6); add(CYL,white,-4,0,5,1.6,14,1.6); add(CONE,roofC,-4,14,5,2.1,5,2.1); break;
      case "arch": { const a=new THREE.Mesh(new THREE.TorusGeometry(6,.9,8,28,Math.PI),trim); a.position.set(0,0,-10); g.add(a); break; }
      case "pillar": add(CYL,white,0,bh,0,1.7,22,1.7); add(CYL,trim,0,bh+22,0,2.4,1.2,2.4); break;
      case "snowtower": add(CYL,white,0,0,-1,3.6,30,3.6); add(CONE,lam("#f7fafc"),0,30,-1,4.4,9,4.4); break;
      case "wing": add(CYL,white,0,bh,0,2,9,2); add(CONE,trim,0,bh+9,0,2.6,5,2.6);
        { const w1=add(UNIT_BOX,lam("#ffffff"),-4,bh+6,0,7,.5,3); w1.rotation.z=.5; const w2=add(UNIT_BOX,lam("#ffffff"),4,bh+6,0,7,.5,3); w2.rotation.z=-.5; } break;
      case "tree": { const tm=new THREE.MeshPhongMaterial({color:0x3f7d3e,flatShading:true,shininess:5}); [[-9,6,-4,4.6],[-10.5,8.5,-6,3.2],[-7.4,7.8,-1.8,3]].forEach(([x,y,z,s])=>{ const m=new THREE.Mesh(BLOB,tm); m.position.set(x,y,z); m.scale.setScalar(s); g.add(m); }); add(CYL,lam("#6b5a40"),-9,0,-4,.7,4,.7); break; }
      case "dome": { const d=new THREE.Mesh(new THREE.SphereGeometry(4.6,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhongMaterial({color:0xe2b437,shininess:80,emissive:0x3a2a05})); d.position.y=bh+3.5; g.add(d); add(CYL,white,0,bh,0,4.6,3.5,4.6); break; }
      case "pool": { const pool=add(UNIT_BOX,lam("#4f9fcf",{emissive:new THREE.Color("#163e58")}),0,0.05,-11.5,9,.3,6); add(CYL,white,0,0,-11.5,.6,3,.6); break; }
      case "rotunda": add(CYL,white,0,bh,0,3.4,4,3.4); add(CONE,roofC,0,bh+4,0,4,4,4); break;
      case "forge": add(UNIT_BOX,lam("#5b5550"),4,bh,3,2.4,8,2.4); add(UNIT_BOX,lam("#ff8a3d",{emissive:new THREE.Color("#c2410c")}),4,bh+8,3,2.4,.3,2.4); add(UNIT_BOX,lam("#5b5550"),-4,bh,-3,2,6,2); break;
    }
    // banner
    add(CYL,lam("#8a8378"),bw/2+1.5,0,bd/2-1,.16,13,.16);
    add(UNIT_BOX,lam(h.color),bw/2+3.1,10,bd/2-1,3.2,2.4,.14);
    return g;

  },

  // the outer wall around the summit's edge, its towers, and the gatehouse with the great stair down the hill
  outerWall(E){
    const {THREE,H,DEG,P,M,edgeR,edgeS,angDist,GATE_B,lam,instanced,own,UNIT_BOX,CYL,CONE,CITY}=E;
    const segs=[], towers=[], caps=[], inset=2.5, STEP=2;
    for(let b=0;b<360;b+=STEP){
      if(angDist(b+STEP/2,GATE_B)<3.4) continue;           // gap for the gate
      const p1=P(b,edgeR(b)-inset), p2=P(b+STEP,edgeR(b+STEP)-inset);
      const dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+0.7;
      segs.push({m:M((p1.x+p2.x)/2,H,(p1.z+p2.z)/2,Math.atan2(-dz,dx),len,7,2.6),c:"#f4f1ea",o:"walls"});
    }
    const TSTEP=Math.max(7.5,Math.round(7.5*172/CITY.terrain.summit.radius/2.5)*2.5);   // a tower every 7.5° on Gondolin's summit; further apart on a smaller one
    for(let b=0;b<360;b+=TSTEP){
      if(angDist(b,GATE_B)<6) continue;
      const q=P(b,edgeR(b)-inset);
      towers.push({m:M(q.x,H,q.z,0,3,12,3),c:"#f4f1ea",o:"walls"});
      caps.push({m:M(q.x,H+12,q.z,0,3.7,4.6,3.7),c:"#6f8ea8",o:"walls"});
    }
    instanced(UNIT_BOX,lam("#ffffff"),segs);
    instanced(CYL,lam("#ffffff"),towers);
    instanced(CONE,lam("#ffffff"),caps);

    const g=new THREE.Group(), white=lam("#f6f3ec"), gold=lam("#d8b34a"), stair=lam("#e7e1d0");
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    const gz=edgeS-inset;
    add(CYL,white,-7,H,gz,4.2,16,4.2); add(CONE,gold,-7,H+16,gz,5,6,5);
    add(CYL,white,7,H,gz,4.2,16,4.2);  add(CONE,gold,7,H+16,gz,5,6,5);
    add(UNIT_BOX,white,0,H+9,gz,12,4,3.6);
    if(CITY.gate.stair!==false){                         // the great stair down the hill (gate.stair:false when the city builds its own way out, like a bridge)
      const z0=edgeS-1, z1=edgeS*1.42, N=36;
      for(let i=0;i<N;i++){ const top=H*(1-i/N), z=z0+(i+.5)*(z1-z0)/N; add(UNIT_BOX,stair,0,0,z,9,Math.max(.3,top),(z1-z0)/N+.05); }
      for(const s of [-1,1]) for(let i=0;i<N;i+=2){ const top=H*(1-i/N)+1.1, z=z0+(i+.5)*(z1-z0)/N; add(UNIT_BOX,white,s*5,0,z,1,top,(z1-z0)/N*2+.05); }
    }
    g.rotation.y=Math.PI-GATE_B*DEG;    // drawn facing south (bearing 180), turned to face the real gate
    own("gate",g);
  },

  // the walls between levels: battlements, towers, a gatehouse and a stair wherever an avenue climbs
  levelWalls(E){
    const {THREE,DEG,P,M,WALLS,AVENUES,RAMP,R1,angDist,lam,instanced,UNIT_BOX,CYL,CONE}=E;
    const segs=[], merlons=[], towers=[], caps=[], steps=[], trim=[];
    const WHITE="#f4f1ea", BLUE="#6f8ea8", GOLD="#d8b34a";
    WALLS.forEach(({R,yUp,yLow})=>{
      const top=yUp+3.4, half=a=>Math.asin((a.w/2+1.6)/R)/DEG;
      const nearGate=(b,pad)=>AVENUES.some(a=>angDist(b,a.b)<half(a)+pad);
      for(let b=0;b<360;b+=1.5){
        if(nearGate(b+.75,.75)) continue;
        const p1=P(b,R), p2=P(b+1.5,R), dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+.45, yaw=Math.atan2(-dz,dx), mx=(p1.x+p2.x)/2, mz=(p1.z+p2.z)/2;
        segs.push({m:M(mx,yLow,mz,yaw,len,top-yLow,2.6),c:WHITE,o:"walls"});
        merlons.push({m:M(mx,top,mz,yaw,len*.45,1.15,2.7),c:WHITE,o:"walls"});
      }
      const every=R===R1?12:8;
      for(let b=every/2;b<360;b+=every){ if(nearGate(b,4)) continue; const q=P(b,R);
        towers.push({m:M(q.x,yLow,q.z,0,2.4,top+3.2-yLow,2.4),c:WHITE,o:"walls"}); caps.push({m:M(q.x,top+3.2,q.z,0,2.9,4.2,2.9),c:BLUE,o:"walls"}); }
      AVENUES.forEach(a=>{
        const main=!!a.main, tr=main?3.2:2.4, th=top+(main?6:3.4)-yLow, off=half(a)+tr/R/DEG;
        for(const sd of [-1,1]){ const q=P(a.b+sd*off,R);
          towers.push({m:M(q.x,yLow,q.z,0,tr,th,tr),c:WHITE,o:"walls"});
          caps.push({m:M(q.x,yLow+th,q.z,0,tr*1.2,main?5.2:4,tr*1.2),c:main?GOLD:BLUE,o:"walls"}); }
        const q=P(a.b,R);
        segs.push({m:M(q.x,yUp+5.4,q.z,-a.b*DEG,a.w+3.4,2.8,3),c:WHITE,o:"walls"});            // the arch over the gate
        if(main) trim.push({m:M(q.x,yUp+8.2,q.z,-a.b*DEG,a.w+3.6,.35,3.1),c:GOLD,o:"walls"});
        const N=14;
        for(let i=0;i<N;i++){ const r0=R+i*RAMP/N, r1=r0+RAMP/N, t=yUp-(i+.5)/N*(yUp-yLow), m=P(a.b,(r0+r1)/2);
          steps.push({m:M(m.x,yLow,m.z,-a.b*DEG,a.w,Math.max(.2,t-yLow),RAMP/N+.05),c:"#e7e1d0",o:"walls"}); }
      });
    });
    instanced(UNIT_BOX,lam("#ffffff"),segs);
    instanced(UNIT_BOX,lam("#ffffff"),merlons);
    instanced(CYL,lam("#ffffff"),towers);
    instanced(CONE,lam("#ffffff"),caps);
    instanced(UNIT_BOX,lam("#ffffff"),steps);
    instanced(UNIT_BOX,lam("#ffffff",{emissive:new THREE.Color("#2a1e04")}),trim);
  },

  // the pieces of the generated city. B holds the instanced shapes and rand; positions use H and are lifted to their level later
  pieces(B,E){
    const {THREE,M,H,DEG,rand,HOUSES,pick,tangentYaw}=B;
    const wA=new THREE.Color("#f4f0e7"), wB=new THREE.Color("#dcd5c6"), grey=new THREE.Color("#8b9097");
    const tA=new THREE.Color("#4c7d3c"), tB=new THREE.Color("#73a04f");
    const STONE="#efe9dc", PAVE="#e7e0cc", GRASS=["#7da455","#86ab5c","#71984c"], HEDGE="#3f6f35";
    const FLOWERS=["#d9534f","#f0c419","#9b59b6","#f7f7f2","#e67e22","#e05d9b"];
    const tree=(x,z,s,o)=>B.trees.push({m:M(x,H+.1+s*.85,z,rand()*6,s,s*1.15,s),c:tA.clone().lerp(tB,rand()),o});
    function fountain(x,z,R,o){
      B.cyl.push({m:M(x,H,z,0,R,1,R),c:STONE,o});
      B.water.push({m:M(x,H+.9,z,0,R*.86,.14,R*.86),c:"#5aa8d6",o});
      B.cyl.push({m:M(x,H,z,0,R*.13+.25,2.6+R*.5,R*.13+.25),c:STONE,o});
      if(R>2.2) B.cyl.push({m:M(x,H+2.2+R*.4,z,0,R*.42,.5,R*.42),c:STONE,o});
      B.jets.push({m:M(x,H+2.6+R*.5,z,0,R*.16+.2,1.6+R*.45,R*.16+.2),c:"#eaf6ff",o});
    }
    function statue(x,z,yaw,o){
      B.box.push({m:M(x,H,z,yaw,1.7,1.5,1.7),c:"#e0d8c6",o});
      B.cones.push({m:M(x,H+1.5,z,0,.62,2.6,.62),c:"#f7f5ef",o});
      B.trees.push({m:M(x,H+4.35,z,0,.42,.46,.42),c:"#f7f5ef",o});
    }
    function courtyard(x,z,R,o){
      B.cyl.push({m:M(x,H,z,0,R,.14,R),c:PAVE,o});
      B.cyl.push({m:M(x,H,z,0,R*.62,.18,R*.62),c:"#dcd2ba",o});
      const k=rand();
      if(k<.55){ fountain(x,z,1.5+R*.22,o); B.poi.fountains.push({x,z}); }
      else if(k<.8) statue(x,z,rand()*6,o);
      else { B.cyl.push({m:M(x,H,z,0,1.3,1.1,1.3),c:"#cfc7b3",o}); B.water.push({m:M(x,H+1.05,z,0,1,.1,1),c:"#3f86b4",o}); } // a well
      const n=5+Math.floor(rand()*3), a0=rand()*6;
      for(let i=0;i<n;i++){ const a=a0+i/n*Math.PI*2, rr=R-1.3, px=x+Math.cos(a)*rr, pz=z+Math.sin(a)*rr;
        if(rand()<.6) tree(px,pz,.75+rand()*.5,o); else B.box.push({m:M(px,H+.14,pz,tangentYaw(a),1.7,.5,.6),c:"#c9bc9b",o}); }
    }
    function garden(x,z,R,o){
      B.poi.gardens.push({x,z,R});
      B.cyl.push({m:M(x,H,z,0,R,.16,R),c:pick(GRASS),o});
      const segs=16;
      for(let i=0;i<segs;i++){ if(i===0||i===8) continue;  // two gates in the hedge
        const am=(i+.5)/segs*Math.PI*2, rr=R-.45, len=2*rr*Math.sin(Math.PI/segs)+.15;
        B.box.push({m:M(x+Math.cos(am)*rr,H+.16,z+Math.sin(am)*rr,tangentYaw(am),len,1,.75),c:HEDGE,o}); }
      const k=rand();
      if(k<.35){ // pond
        B.cyl.push({m:M(x,H,z,0,R*.42+.3,.45,R*.42+.3),c:STONE,o});
        B.water.push({m:M(x,H+.4,z,0,R*.42,.1,R*.42),c:"#4f9fcf",o});
      } else if(k<.6){ // pavilion
        B.cyl.push({m:M(x,H,z,0,2.3,.4,2.3),c:STONE,o});
        for(let i=0;i<4;i++){ const a=i*Math.PI/2+.785; B.cyl.push({m:M(x+Math.cos(a)*1.6,H+.4,z+Math.sin(a)*1.6,0,.18,2.4,.18),c:STONE,o}); }
        B.cones.push({m:M(x,H+2.8,z,0,2.7,1.8,2.7),c:"#c9a43a",o});
      } else tree(x,z,1.8+rand()*.8,o);
      const beds=6, a0=rand()*6;
      for(let i=0;i<beds;i++){ const a=a0+i/beds*Math.PI*2, rr=R*.62;
        B.box.push({m:M(x+Math.cos(a)*rr,H+.16,z+Math.sin(a)*rr,tangentYaw(a),R*.38,.45,.9),c:pick(FLOWERS),o}); }
      const nt=2+Math.floor(rand()*3);
      for(let i=0;i<nt;i++){ const a=rand()*Math.PI*2, rr=R*.62+(rand()<.5?-1.6:1.4); tree(x+Math.cos(a)*rr,z+Math.sin(a)*rr,.7+rand()*.5,o); }
    }
    return {tree,fountain,statue,courtyard,garden,
      // a fountain square where an avenue meets a ring road
      plaza(q,PR,main,a,o){
        B.cyl.push({m:M(q.x,H,q.z,0,PR,.12,PR),c:"#ece6d6",o});
        B.cyl.push({m:M(q.x,H,q.z,0,PR-.9,.15,PR-.9),c:"#ddd3bc",o});
        if(main||rand()<.65) fountain(q.x,q.z,main?3.3:2.5,o); else statue(q.x,q.z,-a.b*DEG,o);
        if(main) for(let i=0;i<4;i++){ const an=i*Math.PI/2+.785; tree(q.x+Math.cos(an)*(PR-1.6),q.z+Math.sin(an)*(PR-1.6),.9,o); }
      },
      // dressing along a great avenue: trees, or statues and banners on the road from the gate
      avenueDecor({x,z,tx,tz,side,k,a,isGate,o}){
        const GATE_B=isGate?a.b:NaN;
        if(a.b!==GATE_B) tree(x,z,.9+rand()*.35,o);
        else if(k%2===0) statue(x+tx*side*.6,z+tz*side*.6,-a.b*DEG,o);
        else { B.cyl.push({m:M(x,H,z,0,.16,8,.16),c:"#8a8378",o}); B.box.push({m:M(x+tx*side*.9,H+5.2,z+tz*side*.9,-a.b*DEG,1.6,2.6,.12),c:HOUSES[(k+(side>0?3:0))%HOUSES.length].color,o}); }
      },
      // one lot in a row of houses: a slender tower, a garden plot, or a house
      lot({q,b,w,d,rc,e,yaw,h,hc,kind}){
        if(kind<0.045){ // slender tower in a small court
          const tr=1.3+rand()*.7, th=12+rand()*10;
          B.towers.push({m:M(q.x,H,q.z,0,tr,th,tr),c:wA.clone().lerp(wB,rand()*.5),o:h.id});
          B.caps.push({m:M(q.x,H+th,q.z,0,tr*1.3,3.5+rand()*2,tr*1.3),c:hc.clone().lerp(grey,rand()*.2),o:h.id});
        } else if(kind<0.11){ // garden plot
          const n=1+Math.floor(rand()*3);
          for(let k=0;k<n;k++){ const s=1+rand()*1.1, off=(k-(n-1)/2)*(w/n);
            B.trees.push({m:M(q.x+Math.cos(b*DEG)*off,H+s*.85,q.z+Math.sin(b*DEG)*off,rand()*6,s,s*1.15,s),c:tA.clone().lerp(tB,rand()),o:h.id}); }
        } else {
          const ht=3+rand()*3.4+(1-rc/e)*6+(rand()<0.08?4:0);
          B.bodies.push({m:M(q.x,H,q.z,yaw,w,ht,d),c:wA.clone().lerp(wB,rand()),o:h.id});
          if(rand()<0.75) B.roofs.push({m:M(q.x,H+ht,q.z,yaw,w+.45,1.3+rand()*1.6,d+.45),c:hc.clone().lerp(grey,rand()*.3),o:h.id});
        }
      },
    };
  },
};
})();
