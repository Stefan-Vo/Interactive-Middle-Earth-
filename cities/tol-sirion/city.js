/* Tol Sirion: city data for citymaker. Build with:  python build.py tol-sirion
   The isle in the river Sirion where it runs through the Pass of Sirion, and Finrod's watchtower Minas Tirith upon it,
   as it stood while Orodreth held it, before Sauron took it in FA 457 and it became Tol-in-Gaurhoth, the Isle of Werewolves.
   Geography follows The Silmarillion: Ered Wethrin to the west of the pass, the highland of Dorthonion to the east, the Fen of
   Serech to the north, and a bridge to the isle (where Lúthien stood). Which bank the bridge reaches, the garrison's quarters
   and the landing are this map's interpretation. North is up the river.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_RET="The Silmarillion, ch. 13, “Of the Return of the Noldor”", S_RUIN="The Silmarillion, ch. 18, “Of the Ruin of Beleriand”";
const S_BL="The Silmarillion, ch. 19, “Of Beren and Lúthien”", S_LAY="The Lays of Beleriand, “The Lay of Leithian”";
const MAP="Its place on the isle is this map's invention.";
const hash=(i,k)=>{ const v=Math.sin(i*127.1+k*311.7)*43758.5453; return v-Math.floor(v); };   // scatter for trees and rocks: the same every load
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };

// the isle: longer north to south, the way the river runs
const SUMMIT={radius:64,waves:[[2,.12,Math.PI/2],[5,.025,.9],[7,.015,2.2]]};
const edge=b=>{ const t=b*Math.PI/180; let v=1; for(const [n,a,p] of SUMMIT.waves) v+=a*Math.sin(n*t+p); return SUMMIT.radius*v; };
const H0=16, WATER_Y=.6;
// the river: a gentle bend, wide where it parts around the isle; the pass rises to the mountains on either side
const riverX=z=>10*Math.sin(z/240), riverW=z=>60+62*Math.exp(-(z/160)*(z/160));
// the bridge: level with the gate at the isle, coming down to the road on the west bank
const GATE_X=-edge(270), BANK_X=-150, BANK_Y=3.4;
const DECK=x=>H0+(x-GATE_X)/(BANK_X-GATE_X)*(BANK_Y-H0);
// the height of the land off the isle, straight from the terrain shape (much faster than casting a ray at the ground)
function landY(x,z){
  const d=Math.abs(x-riverX(z)), w=riverW(z), rough=1+.15*Math.sin(x*.03+z*.017)+.1*Math.sin(z*.05-x*.02);
  const fen=smooth(-380,-560,z)*(1-smooth(w+60,w+200,d));                                    // the Fen of Serech: pools and marsh north of the pass
  const bank=-7+10*smooth(w,w+16,d)-fen*3.4*(1+.7*Math.sin(x*.08)*Math.cos(z*.07));
  const west=smooth(-205,-420,x)*210*rough, east=smooth(215,380,x)*120*rough;                // Ered Wethrin; the highland of Dorthonion
  return bank+west+east+smooth(w+16,w+90,d)*4*(1+Math.sin(x*.05)*Math.cos(z*.04));
}
// the landing on the east side, and the stair cut up the cliff to a postern
const QUAY={x0:74,x1:86,z0:4,z1:24,y:1.6}, STAIR=[[58,2,H0],[77,16,QUAY.y]];
const stairAt=f=>[STAIR[0][0]+(STAIR[1][0]-STAIR[0][0])*f,STAIR[0][1]+(STAIR[1][1]-STAIR[0][1])*f,STAIR[0][2]+(STAIR[1][2]-STAIR[0][2])*f];

window.CITY={
  id:"tol-sirion",
  style:"noldor",                             // Finrod's people built like the other Noldor: styles/noldor.js
  name:"Tol Sirion",
  title:"Tol Sirion from Above",
  tagline:"The isle in the Pass of Sirion, and Minas Tirith, the watchtower Finrod Felagund raised upon it",
  footnote:"Tol Sirion, Minas Tirith, the bridge, the Pass and the Fen of Serech follow The Silmarillion; the bridge's bank, the garrison's quarters and the landing are this map's interpretation.",
  searchPlaceholder:"Search the isle, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand", worldLabel:"The map of Beleriand",
  seed:457,                                   // FA 457, the year Sauron took the isle
  look:{sky:"#c3d0da"},
  camera:{scale:.8, dist:1080, target:[-10,14,-90], from:200},   // from the south-west: the bridge in front, the pass running north behind

  terrain:{height:H0, summit:SUMMIT, mountains:{from:99999,to:100001,height:0}, plainFrom:99999, detail:420,
    profile:[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.02,.86],[1.06,.56],[1.11,.28],[1.17,.1],[1.24,.02],[1.3,0]],   // a rocky isle, sheer above the water
    colors:{top:"#c9c4b4",topB:"#bfbaa9",rock1:"#8d897e",rock2:"#5e5b55",base:"#5f6f58"},
    shape:landY},
  levels:{height:5, radii:[24], ramp:9},      // the tower stands on a raised ward in the middle of the isle
  streets:{
    rings:[],
    avenues:[{b:270,r0:16,w:6,main:true},{b:90,r0:16,w:4,main:false},{b:0,r0:16,w:4,main:false},{b:180,r0:16,w:4,main:false}],
    paths:[
      // out of the gate and over the bridge to the road on the west bank
      {from:"E:270",points:[[-46,0,H0],[GATE_X,0,H0],...[-70,-90,-110,-130].map(x=>[x,0,DECK(x)]),[BANK_X,0,BANK_Y],[BANK_X-10,0]]},
      // through the postern on the east side and down the stair to the landing
      {from:"E:90",points:[[47,0,H0],[56,1,H0],...[.25,.5,.75,1].map(f=>stairAt(f)),[80,14,QUAY.y]]},
    ],
  },
  gate:{bearing:270, channel:false, stair:false},   // the gate faces west, onto the bridge
  squareStatues:[],

  text:{
    districtKicker:"Part of the garrison",
    storyHeading:"When the isle fell, FA 457",
    searchHint:"Try a name, such as Orodreth or Finrod.",
    citadel:"the tower ward",
    square:"the tower court",
    citizen:"One of Finrod's people, keeping the watch on Tol Sirion.",
  },

  districts:[
    {id:"d-watch",name:"The Tower Watch",lord:"Orodreth",color:"#3b6fb0",sector:[270,360],hall:[315,44],motif:"tower",
      heraldry:"Blue and silver",desc:"The watchers who kept Minas Tirith's long look-out over the pass and the lands to the north. "+MAP,
      fall:"Sauron came against the isle with a cloud of fear, and the watch could not hold it.",src:S_RUIN},
    {id:"d-household",name:"Orodreth's Household",lord:"Orodreth",color:"#d6a32a",sector:[0,90],hall:[45,44],motif:"dome",
      heraldry:"Gold and blue",desc:"The household of the warden of the tower. Finrod's house, the house of Finarfin, was known for golden hair. "+MAP,
      fall:"Orodreth's people escaped with him and fled south to Nargothrond.",src:S_RUIN},
    {id:"d-river",name:"The River Wardens",lord:"Orodreth",color:"#2f8a8a",sector:[90,180],hall:[135,44],motif:"pool",
      heraldry:"Blue and green",desc:"The keepers of the isle's landing and of the river around it. "+MAP,fall:null,src:S_RET},
    {id:"d-bridge",name:"The Bridge Guard",lord:"Orodreth",color:"#9aa4ad",sector:[180,270],hall:[225,44],motif:"arch",
      heraldry:"Silver",desc:"The guard of the west gate and the bridge, the one way onto the isle by land. "+MAP,
      fall:"Later, under Sauron, the bridge was where his wolves came out to meet Lúthien and Huan.",src:S_BL},
  ],

  places(E){ const {THREE,P,H,edgeS}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z); return {
    "tower":{name:"Minas Tirith",kicker:"Tol Sirion",alt:"The Tower of Guard",color:"#e9e6dc",showAs:"Minas Tirith",
      desc:"Finrod Felagund raised this watchtower on Tol Sirion, the isle in the river where it runs through the Pass of Sirion, to guard the way south out of the north. It was a fortress of great strength. When Finrod went to dwell in Nargothrond, he gave it into the keeping of his brother Orodreth.",
      fall:"Two years after the Dagor Bragollach, Sauron came against the isle with werewolves and a cloud of dread. Orodreth was driven out, and the tower became a watchtower of Morgoth. The fair isle was cursed and renamed Tol-in-Gaurhoth, the Isle of Werewolves. Later Finrod and Beren were thrown into its pits, and Finrod died there, killing with his bare hands the wolf sent to devour Beren.",
      src:S_RET+"; "+S_RUIN+"; "+S_BL,pos:P(0,0),zoom:200,ring:15,label:P(0,0,H+90),tier:1},
    "court":{name:"The Tower Court",kicker:"Tol Sirion",alt:"The ward at the foot of the tower",color:"#e6e0d2",
      desc:"The raised ward around the foot of the tower, at the top of the isle. On this map it holds a well and a ring of trees.",
      fall:"When Sauron fled, Lúthien and Beren buried Finrod on the hilltop of his own isle. His green grave stayed clean and untouched until Beleriand was broken and drowned.",
      src:S_BL,pos:P(0,0),zoom:120,ring:21,label:P(180,17,H+8),tier:2},
    "gate":{name:"The West Gate",kicker:"Tol Sirion",alt:"The gate onto the bridge",color:"#e9e3d3",
      desc:"The gate of the isle's walls, opening onto the bridge. On this map it faces west, toward the road through the pass.",
      fall:"When Lúthien declared her power from the bridge, the spell that bound stone to stone was loosed, and the gates were thrown down.",
      src:S_BL,pos:P(270,edgeS-2),zoom:120,ring:12,label:P(270,edgeS-2,H+22),tier:1},
    "walls":{name:"The Walls of the Isle",kicker:"Tol Sirion",alt:"White walls on the river cliffs",color:"#f4f1ea",
      desc:"A white wall with round towers ringed the top of the isle, above cliffs that drop straight into the river.",
      fall:"With the spell loosed, the walls opened and the pits were laid bare; many thralls and captives came out blinking into the light.",
      src:S_BL,pos:P(0,0),zoom:260,ring:0,label:P(20,E.edgeR(20)-2,H+16),tier:3},
    "bridge":{name:"The Bridge",kicker:"Tol Sirion",alt:"Where Lúthien sang",color:"#d8d2c2",fixedY:true,
      desc:"A stone bridge joined the isle to the land. On this map it crosses the western arm of the river to the road through the pass.",
      fall:"Lúthien came to the isle with Huan, the hound of Valinor, and sang upon the bridge. Sauron sent out his wolves one by one, and Huan killed them all, and then Draugluin, their sire. Sauron came out himself in wolf's form; Huan seized him by the throat, and to escape he yielded the isle to Lúthien and fled.",
      src:S_BL+"; "+S_LAY,pos:V3(-100,DECK(-100),0),zoom:150,ring:0,label:V3(-100,DECK(-100)+14,0),tier:1},
    "landing":{name:"The Landing",kicker:"Tol Sirion",alt:"A quay and a stair on the east side",color:"#5aa8d6",fixedY:true,
      desc:"A stone quay at the foot of the isle's eastern cliff, where boats tie up, with a stair cut up the rock to a postern in the wall. "+MAP,
      fall:null,src:S_RET,pos:V3(80,QUAY.y,14),zoom:130,ring:0,label:V3(80,14,14),tier:2},
    "sirion":{name:"The River Sirion",kicker:"The Pass of Sirion",alt:"The great river of Beleriand",color:"#5aa8d6",fixedY:true,
      desc:"Sirion rose at Eithel Sirion under the eastern face of Ered Wethrin and flowed south through the pass, parting around Tol Sirion, on its long way to the sea. It was the greatest river of Beleriand.",
      fall:null,src:S_RET,pos:V3(100,WATER_Y,-170),zoom:420,ring:0,label:V3(100,14,-170),tier:2},
    "pass":{name:"The Pass of Sirion",kicker:"The Pass of Sirion",alt:"The way south out of the north",color:"#86a35f",fixedY:true,
      desc:"The vale of Sirion between the Mountains of Shadow and the highland of Dorthonion: the chief way from the north into West Beleriand. Minas Tirith was built to hold it.",
      fall:"With the tower taken, Sauron held the pass, and Morgoth's servants came and went through it as they would.",
      src:S_RET+"; "+S_RUIN,pos:V3(-60,4,-330),zoom:600,ring:0,label:V3(-60,26,-330),tier:2},
    "fen":{name:"The Fen of Serech",kicker:"The Pass of Sirion",alt:"The marshes north of the pass",color:"#7d8f4f",fixedY:true,
      desc:"Marshes at the northern mouth of the pass, where the river Rivil came down from Dorthonion into Sirion.",
      fall:"In the Dagor Bragollach, Finrod was cut off in the fen and surrounded. Barahir and the bravest of his men broke through and saved him, and Finrod gave Barahir his ring in token of lasting friendship.",
      src:S_RUIN,pos:V3(0,1,-560),zoom:420,ring:0,label:V3(0,20,-560),tier:2},
    "ered-wethrin":{name:"Ered Wethrin",kicker:"The Pass of Sirion",alt:"The Mountains of Shadow",color:"#9a948a",fixedY:true,
      desc:"The Mountains of Shadow, the great wall of Hithlum, rising on the western side of the pass.",
      fall:null,src:S_RET,pos:V3(-380,130,-40),zoom:700,ring:0,label:V3(-380,220,-40),tier:2},
    "dorthonion":{name:"Dorthonion",kicker:"The Pass of Sirion",alt:"The pine-clad highland to the east",color:"#3f5a3a",fixedY:true,
      desc:"The highland of great pine forests that rose on the eastern side of the pass, held by the house of Finarfin: Angrod and Aegnor, Finrod's brothers, and the Men of Bëor.",
      fall:"In the Dagor Bragollach it was overrun. Angrod and Aegnor fell, and the highland became Taur-nu-Fuin, the Forest under Night.",
      src:S_RET+"; "+S_RUIN,pos:V3(340,70,-30),zoom:700,ring:0,label:V3(340,150,-30),tier:2},
  }; },
  groups:[["Minas Tirith",["tower","court","gate","walls"]],["The Garrison","@districts"],["The Isle and the Pass",["bridge","landing","sirion","pass","fen","ered-wethrin","dorthonion"]]],
  reserves(E){ return [[0,0,21]]; },

  landmarks(E){
    const {THREE,H,DEG,P,LVL,lam,adder,flat,paveMat,own,instanced,M,OCT,octTaper,DISC,CYL,CONE,UNIT_BOX,BALL,BLOB,HDOME,goldMat,glowSprite,addWater,addLantern,addFountainPOI,addGardenPOI,surfaceY,PLACES}=E;
    const white=lam("#f6f3ec"), marble=lam("#e6e0d2"), slate=lam("#6f8ea8"), gold=goldMat(), glass=lam("#3b4654"), blue=lam("#3b6fb0");
    const lamp=()=>lam("#ffd88a",{emissive:new THREE.Color("#b8741e")});

    { // the river: one sheet of water at the river's level; the banks and the isle stand above it
      const g=new THREE.Group(), w=lam("#3f7397",{emissive:new THREE.Color("#0b2434")}); addWater(w);
      const sheet=new THREE.Mesh(new THREE.PlaneGeometry(760,4800).rotateX(-Math.PI/2),w); sheet.position.y=WATER_Y; g.add(sheet);
      // willows along the banks
      const trees=[]; for(let i=0;i<120;i++){ const s=i%2?1:-1, z=-760+hash(i,1)*1520, x=riverX(z)+s*(riverW(z)+18+hash(i,2)*30), y=landY(x,z), k=.8+hash(i,3)*.6;
        if(y>1.5&&Math.abs(z)>40) trees.push({m:M(x,y+2.4*k,z,0,3.4*k,3.2*k,3.4*k),c:hash(i,4)<.5?"#6f9a4c":"#7fa858",o:"sirion"}); }
      instanced(BLOB,new THREE.MeshPhongMaterial({color:0xffffff,flatShading:true,shininess:4}),trees);
      own("sirion",g);
      addFountainPOI(-136,8);                                                                  // fetching water at the west bank
    }

    { // Minas Tirith: a buttressed base, three tapering stages with balconies, a battlemented watch at the top, a beacon and a spire
      const g=new THREE.Group(), add=adder(g);
      const disc=new THREE.CircleGeometry(20.5,96); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#ece6d8",3),H+.03));
      let y=H; add(OCT,marble,0,y,0,10.5,1.2,10.5); y+=1.2;
      add(UNIT_BOX,white,0,y,0,13,14,13);
      for(const sx of [-1,1]) for(const sz of [-1,1]){ add(CYL,marble,sx*6.5,y,sz*6.5,1.9,17,1.9); add(CONE,slate,sx*6.5,y+17,sz*6.5,2.3,4.4,2.3); add(BALL,gold,sx*6.5,y+21.4,sz*6.5,.35,.35,.35); }
      for(let k=0;k<16;k++){ const t=k/16*4, side=Math.floor(t), f=t-side-.5, L=6.6;      // merlons round the top of the base
        const [x,z]=[[f*13,L],[L,-f*13],[-f*13,-L],[-L,f*13]][side]; add(UNIT_BOX,white,x,y+14,z,1.3,1.3,1.3); }
      add(UNIT_BOX,gold,0,y,6.55,3,5.6,.25);                                                   // the doors, facing the court
      add(UNIT_BOX,marble,0,y+5.6,6.6,3.8,.7,.4);
      y+=14;
      const windows=(r,y0,h,rows)=>{ const ap=r*Math.cos(Math.PI/8)+.06;
        for(let k=0;k<8;k++){ const a=k*Math.PI/4; for(let j=0;j<rows;j++) add(UNIT_BOX,glass,Math.sin(a)*ap,y0+j*(h/rows)+h/rows*.3,Math.cos(a)*ap,.8,h/rows*.42,.2,a); } };
      const balcony=r=>{ add(OCT,marble,0,y,0,r,.7,r); add(OCT,gold,0,y+.55,0,r+.08,.16,r+.08);
        for(let k=0;k<16;k++){ const a=k*Math.PI/8; add(UNIT_BOX,white,Math.sin(a)*(r-.35),y+.7,Math.cos(a)*(r-.35),.6,.85,.6,a); }
        y+=.7; };
      const stage=(rb,rt,h,rows)=>{ add(octTaper(rt/rb),white,0,y,0,rb,h,rb); windows((rb+rt)/2,y,h,rows); y+=h; };
      stage(5.6,5.1,24,4);
      for(const x of [-1.5,1.5]){ add(UNIT_BOX,blue,x,y-21,5.2,1.4,10,.12); add(UNIT_BOX,gold,x,y-11.2,5.25,1.7,.35,.16); }   // banners of Finrod's house (their colors are this map's)
      balcony(7.2);
      stage(4.8,4.3,18,3); balcony(6.2);
      stage(4,3.7,12,2);
      // the watch: a battlemented platform with an open lantern where the beacon burns
      add(OCT,marble,0,y,0,5.2,.9,5.2); y+=.9;
      for(let k=0;k<12;k++){ const a=k*Math.PI/6; add(UNIT_BOX,white,Math.sin(a)*4.8,y,Math.cos(a)*4.8,1.1,1.4,.7,a); }
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CYL,white,Math.sin(a)*3.1,y,Math.cos(a)*3.1,.28,5.2,.28); }
      const beacon=add(BALL,lam("#fff1c4",{emissive:new THREE.Color("#d08a2a")}),0,y+2.2,0,1.4,1.4,1.4);
      const glow=glowSprite("rgba(255,200,110,.55)",16); glow.position.copy(beacon.position); g.add(glow);
      addLantern(beacon,0,0);
      y+=5.2; add(OCT,marble,0,y,0,4.1,.7,4.1); add(OCT,gold,0,y+.55,0,4.18,.16,4.18); y+=.7;
      add(CONE,slate,0,y,0,4.3,10,4.3); y+=10;
      add(CYL,gold,0,y-.6,0,.12,4,.12); add(BALL,lam("#fff6d8",{emissive:new THREE.Color("#e0b040")}),0,y+3.6,0,.5,.5,.5);
      add(UNIT_BOX,blue,1.2,y+1.6,0,2.4,1.5,.08);                                             // a pennant at the very top
      PLACES.tower.label.set(0,y+12,0);
      own("tower",g); g.position.y=LVL;
    }

    { // the court: a well, a ring of trees, lanterns, benches
      const g=new THREE.Group(), add=adder(g), leaf=new THREE.MeshPhongMaterial({color:0x5f8f45,flatShading:true,shininess:4});
      const wq=P(180,15.5);
      add(OCT,marble,wq.x,H,wq.z,2,1,2); const water=add(OCT,lam("#4f9fcf",{emissive:new THREE.Color("#163e58")}),wq.x,H+.1,wq.z,1.6,.95,1.6); addWater(water.material);
      for(const s of [-1,1]) add(CYL,white,wq.x+s*1.7,H,wq.z,.18,3.2,.18); add(UNIT_BOX,slate,wq.x,H+3.2,wq.z,4.2,.3,1.6);
      addFountainPOI(wq.x,wq.z+3);
      [40,85,140,220,275,320].forEach(b=>{ const q=P(b,17.5); add(OCT,marble,q.x,H,q.z,.9,.9,.9); add(BLOB,leaf,q.x,H+3,q.z,1.9,2.4,1.9); add(CYL,lam("#6a5a48"),q.x,H+.9,q.z,.18,1.4,.18); });
      [20,110,200,290].forEach(b=>{ const q=P(b,19.5); add(CYL,lam("#6a6152"),q.x,H,q.z,.13,3.8,.13); addLantern(add(UNIT_BOX,lamp(),q.x,H+3.8,q.z,.6,.8,.6),q.x,q.z); });
      addGardenPOI(0,0,17);
      own("court",g); g.position.y=LVL;
    }

    { // the bridge: piers with cutwaters, a deck with parapets, lamps, and a bridgehead with two towers on the west bank
      const g=new THREE.Group(), add=adder(g), stone=lam("#d8d2c2"), stoneB=lam("#c7c0ae");
      for(let x=GATE_X;x>BANK_X;x-=3){ const x2=Math.max(BANK_X,x-3), ym=(DECK(x)+DECK(x2))/2, len=x-x2+.1, tilt=Math.atan2(DECK(x)-DECK(x2),x-x2);
        const deck=add(UNIT_BOX,stone,(x+x2)/2,ym-1.4,0,len,1.4,7); deck.rotation.z=tilt;
        for(const s of [-1,1]){ const p=add(UNIT_BOX,stoneB,(x+x2)/2,ym,s*3.3,len,1,.45); p.rotation.z=tilt; } }
      [-72,-90,-108,-126].forEach(x=>{ const top=DECK(x)-1.4, bed=landY(x,0)-.5;
        add(UNIT_BOX,stoneB,x,bed,0,4,top-bed,7.4);
        for(const s of [-1,1]) add(UNIT_BOX,stoneB,x,bed,s*3.7,2.8,Math.min(top-bed,WATER_Y-bed+2.4),2.8,Math.PI/4);   // cutwaters, up and down stream
        add(CYL,lam("#6a6152"),x,DECK(x),3.3,.13,3.4,.13); addLantern(add(UNIT_BOX,lamp(),x,DECK(x)+3.4,3.3,.55,.75,.55),x,3.3); });
      for(const s of [-1,1]){ const z=s*5.3; add(CYL,white,BANK_X-2,BANK_Y-1,z,2.4,13,2.4); add(CONE,slate,BANK_X-2,BANK_Y+12,z,2.9,5,2.9); add(BALL,gold,BANK_X-2,BANK_Y+17,z,.3,.3,.3); }
      add(UNIT_BOX,white,BANK_X-2,BANK_Y+7.5,0,3.4,2.6,8.2);
      own("bridge",g);
    }

    { // the landing: a stone quay at the foot of the eastern cliff, two boats, a stair up the rock and a postern in the wall
      const g=new THREE.Group(), add=adder(g), stone=lam("#c7c0ae"), wood=lam("#6b4f34"), Q=QUAY;
      add(UNIT_BOX,stone,(Q.x0+Q.x1)/2,-7,(Q.z0+Q.z1)/2,Q.x1-Q.x0,Q.y+7,Q.z1-Q.z0);
      for(let k=0;k<4;k++) add(CYL,wood,Q.x1-.4,Q.y,Q.z0+2+k*5.5,.3,1.1,.3);                    // mooring posts
      [[93,9],[94,19]].forEach(([x,z],k)=>{ add(UNIT_BOX,wood,x,WATER_Y-.4,z,2.6,1.3,9); add(UNIT_BOX,lam("#8a6a48"),x,WATER_Y+.85,z,2.2,.15,8.6);
        add(CONE,wood,x,WATER_Y-.4,z-5.6,1.25,1.4,1.25).rotation.x=-Math.PI/2; if(k===0){ add(CYL,wood,x,WATER_Y+.9,z,.12,6,.12); } });
      E.stair(add,[STAIR[0][0],STAIR[0][2],STAIR[0][1]],[STAIR[1][0],STAIR[1][2],STAIR[1][1]],3.2,{steps:18});   // engine recipe: steps built up from the rock
      add(UNIT_BOX,stone,57,surfaceY(57,1)-1.6,1,5,H-surfaceY(57,1)+1.6,5);                    // the landing at the top of the stair
      const pq=P(88,E.edgeR(88)-1.2); add(UNIT_BOX,lam("#3a2a1c"),pq.x,H,pq.z,.3,4,2.2);         // the postern door
      add(CYL,lam("#6a6152"),Q.x0+1,Q.y,Q.z1-1,.13,3.6,.13); addLantern(add(UNIT_BOX,lamp(),Q.x0+1,Q.y+3.6,Q.z1-1,.55,.75,.55),Q.x0+1,Q.z1-1);
      own("landing",g);
      addFountainPOI(81,12);                                                                   // fetching water at the quay
    }

    { // the pass: the road down the west bank; pines on Dorthonion; snow-capped Ered Wethrin; reeds in the Fen of Serech
      const road=[];
      for(let z=-900;z<900;z+=10){ const x=riverX(z)-riverW(z)-42, x2=riverX(z+10)-riverW(z+10)-42, y=landY(x,z);
        road.push({m:M(x,y-.3,z+5,Math.atan2(-10,x2-x),10.6,.6,4.2),c:"#b39f7c",o:"pass"}); }
      instanced(UNIT_BOX,lam("#ffffff"),road);
      // engine recipes: pines on Dorthonion, rocks on Ered Wethrin, reeds in the fen
      E.scatter({kind:"pine",n:1100,area:{x0:200,x1:560,z0:-1000,z1:1000},seed:5,size:[.8,1.4],keep:(x,z,y)=>y>=6,owner:"dorthonion"});
      E.scatter({kind:"rock",n:90,area:{x0:-520,x1:-290,z0:-900,z1:900},seed:8,size:[.8,1.4],keep:(x,z,y)=>y>=40,owner:"ered-wethrin"});
      E.scatter({kind:"reed",n:320,area:(i,u,v)=>{ const z=-660+u*300; return [riverX(z)+(v-.5)*420,z]; },seed:10,size:[1,1.6],keep:(x,z,y)=>y>=WATER_Y-.2&&y<=3,owner:"fen"});
    }
  },

  // the cast. Sprite order: the lords below, then one soldier per garrison quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,groundY}=E, K=groundY(0);                                 // K: the tower ward
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), hallOf=(b,name)=>({hall:(()=>{ const p=P(b,40); return V(p.x,p.z); })(),nightText:"Asleep in the hall of "+name});
    const tower={hall:v3(0,K,8.4),nightText:"Asleep in Minas Tirith"};
    const L=(i,name,short,house,o)=>Object.assign({i,name,short,house},o);
    return {
      lords:[
        L(0,"Orodreth, Warden of Minas Tirith","Orodreth","tower",Object.assign({kicker:"Warden of Minas Tirith",
          desc:"Finrod's brother, to whom Finrod gave the keeping of the tower. When Sauron came against the isle with his dread, Orodreth could not hold it; he escaped and fled to Nargothrond.",
          a:v3(-5,K,15),b:v3(5,K,15),dayText:"Keeping the tower court"},tower)),
        L(1,"Finrod Felagund, King of Nargothrond","Finrod","tower",Object.assign({kicker:"King of Nargothrond",
          desc:"Eldest son of Finarfin, who built Minas Tirith before he went to dwell in Nargothrond. He was the friend of Men, and wise and fair; long after, he came back to this isle as Sauron's prisoner and died in its pits to save Beren.",
          a:v3(-5,K,-15),b:v3(5,K,-15),dayText:"Looking north from the tower court"},tower)),
        L(2,"Edrahil of Nargothrond","Edrahil","bridge",Object.assign({kicker:"Of Finrod's people",
          desc:"One of Finrod's people, and in time the chief of the ten who went with Finrod and Beren on the quest for the Silmaril. Taken with them on this isle, he died in Sauron's pits.",
          a:v3(-64,DECK(-64),1.5),b:v3(-116,DECK(-116),1.5),dayText:"Crossing the bridge"},hallOf(225,"the Bridge Guard"))),
      ],
      soldierNames:{0:"Archer of the Tower Watch",1:"Guard of Orodreth's household",2:"River warden",3:"Guard of the bridge"},
      soldierNotes:{0:"One of the watchers of Minas Tirith, looking out over the pass.",3:"One of the guards of the west gate and the bridge."},
      townsfolk:[
        {role:"water",name:"Water-bearer",count:8,text:"Fetching water from the Sirion, at the landing or the bank below the bridge."},
        {role:"lore",name:"Loremaster",count:3,text:"One of Finrod's loremasters, keeping the records of the watch in the tower."},
        {role:"gardener",name:"Gardener",count:4,text:"Tending a garden within the walls of the isle."},
        {role:"minstrel",name:"Minstrel",count:2,text:"A singer of Finrod's people. Finrod himself was a great harper and singer."},
        {role:"mason",name:"Stonemason",count:3,text:"Keeping the white stone of the isle in repair."},
        {role:"lamplighter",name:"Lamplighter",count:4,text:"Lighting the lamps of the court, the walls and the bridge."},
        {role:"citizen",name:"Elf of Finrod's people",text:"One of Finrod's people, living on the isle."},
      ],
      citizens:{count:22,sprites:["citizen","water","gardener","citizen"]},
      guards:[
        {district:0,onText:"On watch around the tower",offText:"Off duty in the tower",
          posts:[0,1,2,3].map(k=>{ const b=k*90+45, q=P(b,14.5); return {post:V(q.x,q.z),barracks:v3(k%2?2:-2,K,8.4),act:{kind:"circle",R:14.5,b}}; })},
        {district:1,onText:"Guarding the stair up to the tower ward",offText:"Off duty in the household's hall",
          posts:[-1,1].map(s=>{ const a=P(270+s*10,19), b=P(270+s*24,19); return {post:V(a.x,a.z),barracks:(()=>{ const p=P(45,40); return V(p.x,p.z); })(),act:{kind:"pace",a:V(a.x,a.z),b:V(b.x,b.z)}}; })},
        {district:2,onText:"Keeping the landing",offText:"Off duty in the river wardens' hall",
          posts:[{post:v3(78,QUAY.y,8),barracks:(()=>{ const p=P(135,40); return V(p.x,p.z); })(),act:{kind:"pace",a:v3(78,QUAY.y,7),b:v3(78,QUAY.y,21)}}]},
        {district:3,onText:"Guarding the bridge",offText:"Off duty in the bridge guard's hall",
          posts:[-1,1].map(s=>({post:v3(-60,DECK(-60),s*2),barracks:(()=>{ const p=P(225,40); return V(p.x,p.z); })(),act:{kind:"pace",a:v3(-60,DECK(-60),s*2),b:v3(-88,DECK(-88),s*2)}}))},
      ],
    };
  },
  routines:{
    squareRing:16,
    squareCrowd:[11,19],
    markets:[],
    study:{name:"the tower",x0:-3,x1:3,z:8.4},
    minstrelBearings:[150,30], minstrelRadius:17,
    patrolRing:27,
  },
};
})();
