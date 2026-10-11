/* Hornburg style: a Rohirric garrison inside a fortress that Gondor built.
   extends:"rohan" — build.py includes styles/rohan.js first; this file replaces only the walls and colors.
   The walls are grey dressed stone with battlements and square towers (Gondor's masonry); the halls inside are
   Rohirric timber (inherited from the Rohan style). */
(function(){
window.STYLES=window.STYLES||{};
const STONE="#a19d94", STONE_B="#8f8b83", DOOR="#4a3826";

window.STYLES.hornburg=Object.assign({},window.STYLES.rohan,{
  extends:"rohan",
  look:Object.assign({},window.STYLES.rohan.look,{stone:"#a19d94",shade:"#8f8b83",marble:"#b1ab9f"}),   // Gondor's grey stone
  palette:{tier:"#9e9a90",paving:"#b1ab9f",lampPost:"#3a3632",lampUnlit:"#4a403a",lampLit:"#ffb35c"},

  // the great wall around the rock, square towers, a postern, and the gates at the head of the causeway
  outerWall(E){
    const {THREE,H,DEG,P,M,edgeR,edgeS,angDist,GATE_B,lam,instanced,own,surfaceY,UNIT_BOX,CITY}=E;
    const posterns=(CITY.gate&&CITY.gate.posterns)||[];
    const open=(b,gatePad,posPad)=>angDist(b,GATE_B)<gatePad||posterns.some(p=>angDist(b,p)<posPad);
    const segs=[], merlons=[], towers=[], inset=2.5, WH=8;
    for(let b=0;b<360;b+=2){
      if(open(b+1,3.6,1.6)) continue;
      const p1=P(b,edgeR(b)-inset), p2=P(b+2,edgeR(b+2)-inset), dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+.6, yaw=Math.atan2(-dz,dx);
      segs.push({m:M((p1.x+p2.x)/2,H-1,(p1.z+p2.z)/2,yaw,len,WH+1,3),c:(b/2)%3?STONE:STONE_B,o:"walls"});
      merlons.push({m:M((p1.x+p2.x)/2,H+WH,(p1.z+p2.z)/2,yaw,len*.45,1.3,3.1),c:STONE,o:"walls"});
    }
    for(let b=20;b<360;b+=40){                                                // square towers
      if(open(b,10,6)) continue;
      const q=P(b,edgeR(b)-inset);
      towers.push({m:M(q.x,H-1,q.z,-b*DEG,6,WH+6,6),c:STONE_B,o:"walls"});
      for(const s of [-1,1]) merlons.push({m:M(q.x+Math.cos(b*DEG)*s*2,H+WH+5,q.z+Math.sin(b*DEG)*s*2,-b*DEG,1.2,1.3,6.2),c:STONE,o:"walls"});
    }
    instanced(UNIT_BOX,lam("#ffffff"),segs);
    instanced(UNIT_BOX,lam("#ffffff"),merlons);
    instanced(UNIT_BOX,lam("#ffffff"),towers);

    // the gates, drawn facing south (bearing 180) and turned; then the causeway down the rock
    const g=new THREE.Group(), stone=lam(STONE), dark=lam(DOOR), road=lam("#a39d90");
    const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
    const gz=edgeS-inset;
    for(const s of [-1,1]){ add(UNIT_BOX,stone,s*7,H-1,gz,5,WH+9,5.5);
      for(const t of [-1,1]) add(UNIT_BOX,stone,s*7+t*1.6,H+WH+8,gz,1.2,1.4,5.6);
      const door=add(UNIT_BOX,dark,s*2.3,H,gz+.2,4.4,6.5,.5); }               // the great doors, shut
    add(UNIT_BOX,stone,0,H+6.5,gz,9.6,3,4.2);
    add(UNIT_BOX,lam("#3e6b3a"),0,H+3.5,gz+2.2,3,3,.12);                     // the green banner of the Mark above the doors
    const r0=edgeS-1, r1=edgeS*1.75, N=26;                                     // the causeway, following the slope
    for(let i=0;i<N;i++){ const a=r0+(r1-r0)*i/N, b=r0+(r1-r0)*(i+1)/N, pa=P(GATE_B,a), pb=P(GATE_B,b);
      const ya=i===0?H:surfaceY(pa.x,pa.z), yb=surfaceY(pb.x,pb.z);
      add(UNIT_BOX,road,0,Math.min(ya,yb)-1.5,(a+b)/2,7,1.5+Math.abs(ya-yb)+.3,b-a+.2);
      for(const s of [-1,1]) add(UNIT_BOX,stone,s*3.9,Math.min(ya,yb)-1.5,(a+b)/2,.7,2.6+Math.abs(ya-yb),b-a+.2); }
    g.rotation.y=Math.PI-GATE_B*DEG;
    own("gate",g);
  },

  // the inner wall around the keep: stone battlements, a gate arch and steps wherever a street climbs
  levelWalls(E){
    const {THREE,DEG,P,M,WALLS,AVENUES,RAMP,angDist,lam,instanced,UNIT_BOX}=E;
    const segs=[], merlons=[], steps=[];
    WALLS.forEach(({R,yUp,yLow})=>{
      const top=yUp+2.6, half=a=>Math.asin((a.w/2+1.4)/R)/DEG, nearGate=(b,pad)=>AVENUES.some(a=>angDist(b,a.b)<half(a)+pad);
      for(let b=0;b<360;b+=2){
        if(nearGate(b+1,1)) continue;
        const p1=P(b,R), p2=P(b+2,R), dx=p2.x-p1.x, dz=p2.z-p1.z, len=Math.hypot(dx,dz)+.4, yaw=Math.atan2(-dz,dx), mx=(p1.x+p2.x)/2, mz=(p1.z+p2.z)/2;
        segs.push({m:M(mx,yLow,mz,yaw,len,top-yLow,2.4),c:STONE,o:"walls"});
        merlons.push({m:M(mx,top,mz,yaw,len*.45,1.1,2.5),c:STONE,o:"walls"});
      }
      AVENUES.forEach(a=>{ const q=P(a.b,R);
        segs.push({m:M(q.x,yUp+4.6,q.z,-a.b*DEG,a.w+2.8,2.2,2.6),c:STONE_B,o:"walls"});
        for(const sd of [-1,1]){ const t=P(a.b+sd*(half(a)+.8),R); segs.push({m:M(t.x,yLow,t.z,-a.b*DEG,2,yUp+6.8-yLow,2.6),c:STONE_B,o:"walls"}); }
        const N=10;
        for(let i=0;i<N;i++){ const ra=R+i*RAMP/N, rb=ra+RAMP/N, t=yUp-(i+.5)/N*(yUp-yLow), m=P(a.b,(ra+rb)/2);
          steps.push({m:M(m.x,yLow,m.z,-a.b*DEG,a.w,Math.max(.2,t-yLow),RAMP/N+.05),c:"#a39d90",o:"walls"}); } });
    });
    instanced(UNIT_BOX,lam("#ffffff"),segs);
    instanced(UNIT_BOX,lam("#ffffff"),merlons);
    instanced(UNIT_BOX,lam("#ffffff"),steps);
  },
});
})();
