/* Eldarin style: the High Elven way of building, for citymaker. First used by Barad Eithel.
   Warm white stone climbing in arcades: walls and terraces faced with tall pointed (lancet) arches, tall narrow houses with
   steep roofs and corner pinnacles, the odd dome, slender towers with needle spires, and a great deal of green.
   The look leans on a pointed-arch panel (arcadeGeo): a slab with one lancet opening, stretched and repeated along walls.
   Its openings show the darker stone set behind them, which is what makes the arcades read from above.
   A style draws; the engine decides where. Keep the random calls in each piece in the same order once a city uses it. */
(function(){
window.STYLES=window.STYLES||{};
let ARC=null;
// one panel of an arcade: a 1 × 1 slab (base at y=0, centered on x and z) with a pointed arch cut through it
function arcadeGeo(THREE){
  if(ARC) return ARC;
  const s=new THREE.Shape(); s.moveTo(-.5,0); s.lineTo(.5,0); s.lineTo(.5,1); s.lineTo(-.5,1); s.lineTo(-.5,0);
  const h=new THREE.Path(); h.moveTo(-.3,.07); h.lineTo(.3,.07); h.lineTo(.3,.56); h.quadraticCurveTo(.3,.79,0,.91); h.quadraticCurveTo(-.3,.79,-.3,.56); h.lineTo(-.3,.07);
  s.holes.push(h);
  ARC=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:5}).translate(0,0,-.5);
  return ARC;
}
const WHITE="#f4eedf", SHADE="#b4aa95", ROOF="#b5bfc8", SPIRE="#c9d1d8", GOLD="#d8b34a";

window.STYLES.eldarin={
  arcadeGeo,                                    // for a city's own landmarks: E.STYLE.arcadeGeo(THREE)
  look:{stone:WHITE,shade:SHADE,marble:"#e9e1cf",roof:ROOF,spire:SPIRE,gold:GOLD,paving:"#efe8d6",leaf:"#4a7b3a",spires:true},   // colors for the engine's recipes
  palette:{tier:"#e3dac6",paving:"#efe8d6",lampPost:"#6a6152",lampUnlit:"#7d725e",lampLit:"#ffe2a0"},
  rows:{start:30.5,depth:5.6,lane:2.6,w:[3.2,2.6],gap:[.4,.9],alley:[.08,2.6],cut:[.4,1.2]},
  yards:{courts:3,gardens:5,gardenChance:.6,gardenR:[6,4],courtR:[5,2.4]},
  buckets:[
    {name:"arcades",geo:E=>arcadeGeo(E.THREE),mat:E=>E.lam("#ffffff")},
    {name:"domes",geo:E=>new E.THREE.SphereGeometry(1,18,9,0,Math.PI*2,0,Math.PI/2),mat:E=>new E.THREE.MeshPhongMaterial({color:0xffffff,shininess:30})},
  ],

  // the hall of a district: a tall hall with a steep roof, an arcaded front, a slender tower with a needle spire
  hall(h,E){
    const {THREE,P,DEG,lam,groundY,UNIT_BOX,PYRAMID,CYL,CONE,BLOB}=E;
    const g=new THREE.Group(), pos=P(h.hall[0],h.hall[1],groundY(h.hall[1])), ARCG=arcadeGeo(THREE);
    g.position.copy(pos); g.rotation.y=-h.hall[0]*DEG;
    const white=lam(WHITE), shade=lam(SHADE), roof=lam(new THREE.Color(ROOF).lerp(new THREE.Color(h.color),.25)), spire=lam(SPIRE), accent=lam(h.color);
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    add(UNIT_BOX,shade,0,0,0,11.4,9,13.4);
    add(UNIT_BOX,white,0,9,0,12,.6,14);
    add(PYRAMID,roof,0,9.6,0,12.6,7.5,14.6);
    for(let i=0;i<4;i++) add(ARCG,white,-4.5+i*3,0,6.9,3,8.6,.6);                      // the arcaded front, facing the middle of the city
    for(let i=0;i<4;i++) for(const s of [-1,1]) add(ARCG,white,s*5.9,0,-4.5+i*3,3,8.6,.6).rotation.y=Math.PI/2;   // and along the sides
    for(const sx of [-1,1]) for(const sz of [-1,1]) add(CONE,spire,sx*6,9.6,sz*7,.5,4,.5);  // pinnacles at the corners
    const towerH=h.motif==="spire"?30:h.motif==="tower"?26:21;
    add(CYL,white,-4.6,0,-4.6,1.9,towerH,1.9); add(CYL,shade,-4.6,towerH,-4.6,2.2,.6,2.2);
    add(CONE,h.motif==="spire"?lam(GOLD,{emissive:new THREE.Color("#2a1e04")}):spire,-4.6,towerH+.6,-4.6,2.1,towerH*.45,2.1);
    switch(h.motif){
      case "tower": add(CYL,white,4.6,0,-4.6,1.5,18,1.5); add(CONE,spire,4.6,18,-4.6,1.7,8,1.7); break;
      case "dome": add(CYL,white,0,9.6,0,3.6,3,3.6); { const d=new THREE.Mesh(new THREE.SphereGeometry(3.7,20,10,0,Math.PI*2,0,Math.PI/2),lam("#f7f2e6")); d.position.y=12.6; g.add(d); } add(CONE,lam(GOLD),0,16.3,0,.4,3,.4); break;
      case "pool": add(UNIT_BOX,lam("#4f9fcf",{emissive:new THREE.Color("#163e58")}),0,.05,11.5,9,.3,6); add(CYL,white,0,0,11.5,.5,3.2,.5); break;
      case "forge": add(UNIT_BOX,lam("#6a6460"),4.4,9,-4,2.2,9,2.2); add(UNIT_BOX,lam("#ff8a3d",{emissive:new THREE.Color("#c2410c")}),4.4,18,-4,2.2,.3,2.2); break;
      case "tree": { const tm=new THREE.MeshPhongMaterial({color:0x3f7d3e,flatShading:true,shininess:5}); [[8,6,6,4.2],[9.5,8.5,4,3]].forEach(([x,y,z,s])=>{ const m=new THREE.Mesh(BLOB,tm); m.position.set(x,y,z); m.scale.setScalar(s); g.add(m); }); break; }
    }
    add(CYL,lam("#8a8378"),6.8,0,6.4,.14,14,.14); add(UNIT_BOX,accent,8.3,10.6,6.4,3,2.3,.12);   // banner
    return g;
  },

  // the outer wall: an arcaded gallery on a solid base, slender towers with needle spires, and a pointed gate between two tall towers
  outerWall(E){
    const {THREE,H,DEG,P,M,edgeR,edgeS,angDist,GATE_B,lam,instanced,own,UNIT_BOX,CYL,CONE,CITY}=E;
    const core=[], face=[], rail=[], towers=[], spires=[], inset=2.5, STEP=2, WH=9;
    for(let b=0;b<360;b+=STEP){
      if(angDist(b+STEP/2,GATE_B)<3.6) continue;
      const p1=P(b,edgeR(b)-inset), p2=P(b+STEP,edgeR(b+STEP)-inset), dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+.5, yaw=Math.atan2(-dz,dx);
      const mx=(p1.x+p2.x)/2, mz=(p1.z+p2.z)/2, ob=(b+STEP/2)*DEG, ox=Math.sin(ob)*1.45, oz=-Math.cos(ob)*1.45;
      core.push({m:M(mx,H,mz,yaw,len,WH,2.6),c:SHADE,o:"walls"});
      face.push({m:M(mx+ox,H+2.2,mz+oz,yaw,len,WH-2.2,.5),c:WHITE,o:"walls"});
      face.push({m:M(mx-ox,H+2.2,mz-oz,yaw,len,WH-2.2,.5),c:WHITE,o:"walls"});
      rail.push({m:M(mx,H+WH,mz,yaw,len,.7,3.4),c:WHITE,o:"walls"});
    }
    const TSTEP=Math.max(7.5,Math.round(7.5*172/CITY.terrain.summit.radius/2.5)*2.5);
    for(let b=0;b<360;b+=TSTEP){
      if(angDist(b,GATE_B)<7) continue;
      const q=P(b,edgeR(b)-inset);
      towers.push({m:M(q.x,H,q.z,0,1.9,WH+8,1.9),c:WHITE,o:"walls"});
      spires.push({m:M(q.x,H+WH+8,q.z,0,2.2,9,2.2),c:SPIRE,o:"walls"});
    }
    instanced(UNIT_BOX,lam("#ffffff"),core);
    instanced(arcadeGeo(THREE),lam("#ffffff"),face);
    instanced(UNIT_BOX,lam("#ffffff"),rail);
    instanced(CYL,lam("#ffffff"),towers);
    instanced(CONE,lam("#ffffff"),spires);

    // the gate: two tall towers with gold-tipped needle spires and a great pointed arch between them, drawn facing south and turned
    const g=new THREE.Group(), white=lam(WHITE), shade=lam(SHADE), spire=lam(SPIRE), gold=lam(GOLD,{emissive:new THREE.Color("#2a1e04")}), stair=lam("#e7e1d0");
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    const gz=edgeS-inset;
    for(const s of [-1,1]){ add(CYL,white,s*7.5,H,gz,3.4,24,3.4); add(CYL,shade,s*7.5,H+24,gz,3.8,.8,3.8); add(CONE,spire,s*7.5,H+24.8,gz,3.6,15,3.6); add(CONE,gold,s*7.5,H+38,gz,.6,3,.6); }
    add(arcadeGeo(THREE),white,0,H,gz,12,17,3.4);
    add(UNIT_BOX,shade,0,H+15.4,gz,12,3,3);
    if(CITY.gate.stair!==false){                       // a stair down the hill from the gate
      const z0=edgeS-1, z1=edgeS*1.42, N=36;
      for(let i=0;i<N;i++){ const top=H*(1-i/N), z=z0+(i+.5)*(z1-z0)/N; add(UNIT_BOX,stair,0,0,z,9,Math.max(.3,top),(z1-z0)/N+.05); }
      for(const s of [-1,1]) for(let i=0;i<N;i+=2){ const top=H*(1-i/N)+1.1, z=z0+(i+.5)*(z1-z0)/N; add(UNIT_BOX,white,s*5,0,z,1,top,(z1-z0)/N*2+.05); }
    }
    g.rotation.y=Math.PI-GATE_B*DEG;
    own("gate",g);
  },

  // the terrace walls: a dark stone core faced with two tiers of lancet arches, a balustrade and pinnacles on top,
  // and a pointed gateway with a stair wherever an avenue climbs
  levelWalls(E){
    const {THREE,DEG,P,M,WALLS,AVENUES,RAMP,angDist,lam,instanced,UNIT_BOX,CYL,CONE}=E;
    const core=[], face=[], rail=[], posts=[], pins=[], towers=[], spires=[], arches=[], steps=[];
    WALLS.forEach(({R,yUp,yLow})=>{
      const h=yUp-yLow, half=a=>Math.asin((a.w/2+1.6)/R)/DEG, nearGate=(b,pad)=>AVENUES.some(a=>angDist(b,a.b)<half(a)+pad);
      for(let b=0;b<360;b+=1.5){
        if(nearGate(b+.75,.75)) continue;
        const p1=P(b,R), p2=P(b+1.5,R), dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+.4, yaw=Math.atan2(-dz,dx);
        const mx=(p1.x+p2.x)/2, mz=(p1.z+p2.z)/2, ob=(b+.75)*DEG, ox=Math.sin(ob)*1.45, oz=-Math.cos(ob)*1.45;
        core.push({m:M(mx,yLow,mz,yaw,len,h+.3,2.6),c:SHADE,o:"walls"});
        face.push({m:M(mx+ox,yLow,mz+oz,yaw,len,h*.5,.5),c:WHITE,o:"walls"});              // two tiers of arches on the outer face
        face.push({m:M(mx+ox,yLow+h*.5,mz+oz,yaw,len,h*.5,.5),c:WHITE,o:"walls"});
        rail.push({m:M(mx+ox*.9,yUp+.95,mz+oz*.9,yaw,len,.3,.5),c:WHITE,o:"walls"});        // a balustrade along the edge of the terrace above
        posts.push({m:M(mx+ox*.9,yUp,mz+oz*.9,yaw,.3,.95,.3),c:WHITE,o:"walls"});
      }
      for(let b=3;b<360;b+=9){ if(nearGate(b,3)) continue; const q=P(b,R+1.5); pins.push({m:M(q.x,yUp,q.z,0,.55,4.2,.55),c:SPIRE,o:"walls"}); }
      AVENUES.forEach(a=>{
        const main=!!a.main, off=half(a)+1.8/R/DEG;
        for(const sd of [-1,1]){ const q=P(a.b+sd*off,R);
          towers.push({m:M(q.x,yLow,q.z,0,1.7,h+(main?11:8),1.7),c:WHITE,o:"walls"});
          spires.push({m:M(q.x,yLow+h+(main?11:8),q.z,0,1.9,main?9:6.5,1.9),c:main?GOLD:SPIRE,o:"walls"}); }
        const q=P(a.b,R);
        arches.push({m:M(q.x,yUp,q.z,-a.b*DEG,a.w+3,9,2.6),c:WHITE,o:"walls"});            // a pointed gateway over the head of the stair
        const N=14;
        for(let i=0;i<N;i++){ const r0=R+i*RAMP/N, r1=r0+RAMP/N, t=yUp-(i+.5)/N*(yUp-yLow), m=P(a.b,(r0+r1)/2);
          steps.push({m:M(m.x,yLow,m.z,-a.b*DEG,a.w,Math.max(.2,t-yLow),RAMP/N+.05),c:"#e7e1d0",o:"walls"}); }
      });
    });
    const ARCG=arcadeGeo(THREE);
    instanced(UNIT_BOX,lam("#ffffff"),core);
    instanced(ARCG,lam("#ffffff"),face);
    instanced(UNIT_BOX,lam("#ffffff"),rail);
    instanced(UNIT_BOX,lam("#ffffff"),posts);
    instanced(CONE,lam("#ffffff"),pins);
    instanced(CYL,lam("#ffffff"),towers);
    instanced(CONE,lam("#ffffff",{emissive:new THREE.Color("#141008")}),spires);
    instanced(ARCG,lam("#ffffff"),arches);
    instanced(UNIT_BOX,lam("#ffffff"),steps);
  },

  // the pieces of the generated city. B holds the instanced shapes and rand; positions use H and are lifted to their level later
  pieces(B,E){
    const {THREE,M,H,DEG,rand,HOUSES,pick,tangentYaw}=B;
    const wA=new THREE.Color("#f4eedf"), wB=new THREE.Color("#e2d8c2"), shadeC=new THREE.Color(SHADE), roofC=new THREE.Color(ROOF);
    const tA=new THREE.Color("#3f7535"), tB=new THREE.Color("#6f9e4a");
    const STONE="#efe8d8", PAVE="#e9e1cc", GRASS=["#77a14f","#80a858","#6c9548"], HEDGE="#3a6a32";
    const FLOWERS=["#f7f7f2","#e9d2f0","#f0c419","#9fc6e8","#f2a7b5"];
    const tree=(x,z,s,o)=>B.trees.push({m:M(x,H+.1+s*.85,z,rand()*6,s,s*1.25,s),c:tA.clone().lerp(tB,rand()),o});
    const cypress=(x,z,s,o)=>B.cones.push({m:M(x,H,z,0,s*.55,s*3.2,s*.55),c:tA.clone().lerp(tB,rand()*.4),o});
    function fountain(x,z,R,o){
      B.cyl.push({m:M(x,H,z,0,R,.9,R),c:STONE,o});
      B.water.push({m:M(x,H+.82,z,0,R*.86,.14,R*.86),c:"#5aa8d6",o});
      B.cyl.push({m:M(x,H,z,0,R*.12+.22,3+R*.6,R*.12+.22),c:STONE,o});
      B.cyl.push({m:M(x,H+2.4+R*.45,z,0,R*.45,.35,R*.45),c:STONE,o});                     // an upper bowl
      B.jets.push({m:M(x,H+3+R*.6,z,0,R*.14+.2,1.8+R*.4,R*.14+.2),c:"#eaf6ff",o});
    }
    function statue(x,z,yaw,o){
      B.box.push({m:M(x,H,z,yaw,1.5,1.6,1.5),c:"#e6dcc8",o});
      B.cones.push({m:M(x,H+1.6,z,0,.55,3,.55),c:"#f7f5ef",o});
      B.trees.push({m:M(x,H+4.85,z,0,.4,.45,.4),c:"#f7f5ef",o});
    }
    function courtyard(x,z,R,o){                                                            // a cloister: paving, a ring of arches, a fountain
      B.cyl.push({m:M(x,H,z,0,R,.14,R),c:PAVE,o});
      const n=10+Math.floor(rand()*4), a0=rand()*6;
      for(let i=0;i<n;i++){ if(i===0) continue; const a=a0+i/n*Math.PI*2, rr=R-.6, len=2*rr*Math.sin(Math.PI/n)+.1;
        B.arcades.push({m:M(x+Math.cos(a)*rr,H,z+Math.sin(a)*rr,tangentYaw(a),len,3.6,.45),c:WHITE,o}); }
      if(rand()<.7){ fountain(x,z,1.3+R*.2,o); B.poi.fountains.push({x,z}); } else statue(x,z,rand()*6,o);
      const nt=2+Math.floor(rand()*2);
      for(let i=0;i<nt;i++){ const a=rand()*Math.PI*2, rr=R*.55; tree(x+Math.cos(a)*rr,z+Math.sin(a)*rr,.7+rand()*.4,o); }
    }
    function garden(x,z,R,o){                                                               // a deep green garden: lawn, trees, a pool or a domed pavilion
      B.poi.gardens.push({x,z,R});
      B.cyl.push({m:M(x,H,z,0,R,.16,R),c:pick(GRASS),o});
      const segs=16;
      for(let i=0;i<segs;i++){ if(i===0||i===8) continue;
        const am=(i+.5)/segs*Math.PI*2, rr=R-.45, len=2*rr*Math.sin(Math.PI/segs)+.15;
        B.box.push({m:M(x+Math.cos(am)*rr,H+.16,z+Math.sin(am)*rr,tangentYaw(am),len,1.1,.8),c:HEDGE,o}); }
      const k=rand();
      if(k<.4){ B.cyl.push({m:M(x,H,z,0,R*.4+.3,.45,R*.4+.3),c:STONE,o}); B.water.push({m:M(x,H+.4,z,0,R*.4,.1,R*.4),c:"#4f9fcf",o}); }
      else if(k<.75){ B.cyl.push({m:M(x,H,z,0,2.4,.4,2.4),c:STONE,o});
        for(let i=0;i<6;i++){ const a=i*Math.PI/3; B.cyl.push({m:M(x+Math.cos(a)*1.9,H+.4,z+Math.sin(a)*1.9,0,.16,2.8,.16),c:STONE,o}); }
        B.domes.push({m:M(x,H+3.2,z,0,2.5,2,2.5),c:"#f7f2e6",o}); }
      else tree(x,z,2+rand()*.8,o);
      const nt=4+Math.floor(rand()*4);
      for(let i=0;i<nt;i++){ const a=rand()*Math.PI*2, rr=R*(.55+rand()*.3);
        if(rand()<.35) cypress(x+Math.cos(a)*rr,z+Math.sin(a)*rr,1+rand()*.6,o); else tree(x+Math.cos(a)*rr,z+Math.sin(a)*rr,.8+rand()*.7,o); }
      const beds=5, a0=rand()*6;
      for(let i=0;i<beds;i++){ const a=a0+i/beds*Math.PI*2, rr=R*.7; B.box.push({m:M(x+Math.cos(a)*rr,H+.16,z+Math.sin(a)*rr,tangentYaw(a),R*.3,.4,.8),c:pick(FLOWERS),o}); }
    }
    return {tree,fountain,statue,courtyard,garden,
      plaza(q,PR,main,a,o){
        B.cyl.push({m:M(q.x,H,q.z,0,PR,.12,PR),c:"#ece5d3",o});
        B.cyl.push({m:M(q.x,H,q.z,0,PR-.9,.15,PR-.9),c:"#ddd2ba",o});
        if(main||rand()<.65) fountain(q.x,q.z,main?3.2:2.4,o); else statue(q.x,q.z,-a.b*DEG,o);
        for(let i=0;i<4;i++){ const an=i*Math.PI/2+.785; cypress(q.x+Math.cos(an)*(PR-1.4),q.z+Math.sin(an)*(PR-1.4),1.1,o); }
      },
      avenueDecor({x,z,tx,tz,side,k,a,isGate,o}){
        if(!isGate||k%2) { if(rand()<.5) cypress(x,z,1+rand()*.4,o); else tree(x,z,.9+rand()*.35,o); }
        else { B.cyl.push({m:M(x,H,z,0,.15,9,.15),c:"#8a8378",o}); B.box.push({m:M(x+tx*side*.9,H+5.6,z+tz*side*.9,-a.b*DEG,1.4,3,.12),c:HOUSES[(k+(side>0?2:0))%HOUSES.length].color,o}); }
      },
      // one lot in a row: a slender tower with a needle spire, a domed house, a garden plot, or a tall narrow house
      lot({q,b,w,d,rc,e,yaw,h,hc,kind}){
        const out=[Math.sin(b*DEG),-Math.cos(b*DEG)], body=wA.clone().lerp(wB,rand());
        if(kind<0.06){
          const tr=1.1+rand()*.6, th=16+rand()*12;
          B.towers.push({m:M(q.x,H,q.z,0,tr,th,tr),c:body,o:h.id});
          B.caps.push({m:M(q.x,H+th,q.z,0,tr*1.2,7+rand()*5,tr*1.2),c:new THREE.Color(SPIRE),o:h.id});
        } else if(kind<0.12){
          const ht=4+rand()*3, r=Math.min(w,d)*.48;
          B.bodies.push({m:M(q.x,H,q.z,yaw,w,ht,d),c:body,o:h.id});
          B.cyl.push({m:M(q.x,H+ht,q.z,0,r*.9,1.2,r*.9),c:body,o:h.id});
          B.domes.push({m:M(q.x,H+ht+1.2,q.z,0,r*.92,r*.85,r*.92),c:"#f7f2e6",o:h.id});
        } else if(kind<0.19){
          const n=1+Math.floor(rand()*3);
          for(let k=0;k<n;k++){ const s=1+rand()*1.1, off=(k-(n-1)/2)*(w/n);
            if(rand()<.4) cypress(q.x+Math.cos(b*DEG)*off,q.z+Math.sin(b*DEG)*off,1+rand()*.5,h.id);
            else B.trees.push({m:M(q.x+Math.cos(b*DEG)*off,H+s*.85,q.z+Math.sin(b*DEG)*off,rand()*6,s,s*1.25,s),c:tA.clone().lerp(tB,rand()),o:h.id}); }
        } else {
          const ht=5+rand()*4+(1-rc/e)*6+(rand()<0.1?5:0), rh=3+rand()*3.5;
          B.bodies.push({m:M(q.x,H,q.z,yaw,w,ht,d),c:body.clone().lerp(shadeC,.25),o:h.id});
          B.roofs.push({m:M(q.x,H+ht,q.z,yaw,w+.3,rh,d+.3),c:roofC.clone().lerp(hc,.18+rand()*.12),o:h.id});
          // lancet windows on the face toward the outside of the terrace, set just in front of the wall
          B.arcades.push({m:M(q.x+out[0]*(d/2+.12),H+ht*.12,q.z+out[1]*(d/2+.12),yaw,w*.9,ht*.78,.25),c:WHITE,o:h.id});
          if(rand()<.4) for(const sx of [-1,1]) B.cones.push({m:M(q.x+Math.cos(b*DEG)*sx*w*.45+out[0]*d*.42,H+ht,q.z+Math.sin(b*DEG)*sx*w*.45+out[1]*d*.42,0,.32,2.6+rand(),.32),c:SPIRE,o:h.id});
        }
      },
    };
  },
};
})();
