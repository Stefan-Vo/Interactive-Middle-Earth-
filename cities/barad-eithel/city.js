/* Barad Eithel: city data for citymaker. Build with:  python build.py barad-eithel
   The Tower of the Well at Eithel Sirion, chief fortress of Fingolfin, High King of the Noldor, on the eastern face of
   Ered Wethrin, in the last years of the Siege of Angband, before the Dagor Bragollach of FA 455. Ard-galen is still green.
   Drawn in the eldarin (High Elven) style: the city climbs in arcaded terraces to the tower, with the mountain right
   behind; a King's House stands on a shelf of the mountain, joined by a high bridge; the springs break out under the walls
   in falls and gather in a pool, the source of Sirion. The plan, the King's House, the bridge and the falls are this map's
   interpretation. North is up; the mountains are west and the plain east.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_RET="The Silmarillion, ch. 13, “Of the Return of the Noldor”", S_RUIN="The Silmarillion, ch. 18, “Of the Ruin of Beleriand”";
const S_NIR="The Silmarillion, ch. 20, “Of the Fifth Battle”";
const MAP="This quarter is the map's invention.";
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const hash=(i,k)=>{ const v=Math.sin(i*127.1+k*311.7)*43758.5453; return v-Math.floor(v); };   // scatter that is the same every load
const angDist=(a,b)=>Math.abs(((a-b)%360+540)%360-180), bearing=(x,z)=>(Math.atan2(x,-z)*180/Math.PI+360)%360;
const SUMMIT={radius:92,waves:[[3,.04,.4],[5,.025,1.3]]}, H0=26, LVL=9;
const edge=b=>{ const t=b*Math.PI/180; let v=1; for(const [n,a,p] of SUMMIT.waves) v+=a*Math.sin(n*t+p); return SUMMIT.radius*v; };
const at=(b,r)=>[r*Math.sin(b*Math.PI/180),-r*Math.cos(b*Math.PI/180)];
const TOP=H0+3*LVL;                                         // the ground of the highest terrace, where the tower stands
// the King's House stands on a shelf of the mountain, level with the highest terrace; the high bridge runs out to it
const BRIDGE_B=278, LEDGE_D=192, LEDGE=at(BRIDGE_B,LEDGE_D), LEDGE_R=30, LEDGE_Y=TOP, BRIDGE_R=[20,LEDGE_D-LEDGE_R+6];
// more high bridges: the North Watch on a pinnacle of rock to the north-west, the hanging gardens on a shelf at the mountain's
// foot to the south-west, a bridge along the mountain from the King's House to the Watch, and two flying bridges inside the
// city from the tower terrace to bridge-towers on the outer terrace
const NORTH={b:322,d:196,r:42,y:H0+LVL,tiers:[28,15]}, GARDEN={b:232,d:182,r:20,y:H0+LVL}, FLY=[60,195];
NORTH.c=at(NORTH.b,NORTH.d); GARDEN.c=at(GARDEN.b,GARDEN.d);
const SHELVES=[{c:LEDGE,r:LEDGE_R,y:LEDGE_Y,side:8},{c:NORTH.c,r:NORTH.r,y:NORTH.y,side:14},{c:GARDEN.c,r:GARDEN.r,y:GARDEN.y,side:10}];
const NORTH_TOP=NORTH.y+2*LVL;                             // the North Watch's top terrace, level with the tower terrace, where its bridges arrive
const LANES=[[BRIDGE_B,24],[NORTH.b,24],[GARDEN.b,56],...FLY.map(b=>[b,24])];   // [bearing, first radius] of the lanes kept clear under the bridges
// the water: a pool along the south foot of the rock, a stream from the King's shelf, and the young Sirion running south
const WATER_Y=.4, POOL_B=178, POOL_SPAN=50;
const STREAM_W=[at(BRIDGE_B,150),[-147,30],[-126,70],[-99,96]];
const RIVER=[at(178,138),[40,210],[68,300],[88,440],[104,620],[116,850],[124,1150]];
const FALLS=[[150,7],[172,10],[196,6]];                     // [bearing, width] of the falls from under the walls
const HERDS={x:420,z:-60};                                 // Fingolfin's horse-herds on Ard-galen
const THANGO=at(56,1900);                                  // Thangorodrim, far off across the plain
// the land: Ered Wethrin rising steeply in the west and the green plain (the shelves and the water are terrain recipes below)
function land(x,z){
  const rough=1+.16*Math.sin(x*.023+z*.017)+.1*Math.sin(z*.051-x*.029)+.06*Math.sin(z*.13+x*.07);
  return 2+1.2*Math.sin(x*.02)*Math.cos(z*.025)*smooth(150,320,Math.hypot(x,z))+smooth(-150,-265,x)*(250+60*Math.sin(z*.009+1)+35*Math.sin(z*.023))*rough;
}
// the pool of Eithel Sirion: a crescent along the south foot of the rock, where the falls come down
const poolCarve=(x,z)=>{ const r=Math.hypot(x,z), b=bearing(x,z); return smooth(16,9,Math.abs(r-1.5*edge(b)))*smooth(POOL_SPAN+12,POOL_SPAN,angDist(b,POOL_B)); };

window.CITY={
  id:"barad-eithel",
  style:"eldarin",                            // the High Elven style: styles/eldarin.js
  name:"Barad Eithel",
  title:"Barad Eithel from Above",
  tagline:"The Tower of the Well at Eithel Sirion, chief fortress of Fingolfin, High King of the Noldor, in the days of the Siege of Angband",
  footnote:"Barad Eithel, the springs of Sirion, Ard-galen and the people come from The Silmarillion; the city's plan, the King's House, the high bridge and the falls are this map's interpretation.",
  searchPlaceholder:"Search the fortress, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand", worldLabel:"The map of Beleriand",
  seed:450,                                   // the last years of the Siege of Angband
  look:{sky:"#c3d0db"},
  camera:{scale:.85, dist:1050, target:[-50,40,10], from:140},   // from the south-east: the falls in front, the terraces climbing to the tower, the King's House on the mountain behind

  terrain:{height:H0, summit:SUMMIT, mountains:{from:99999,to:100001,height:0}, plainFrom:99999, detail:520,
    colors:{top:"#e3dac6",topB:"#dbd1bb",rock1:"#a49d8e",rock2:"#6f6a5f",base:"#6f8a55"},
    shape:land,
    shelves:SHELVES.map(sh=>({x:sh.c[0],z:sh.c[1],r:sh.r,y:sh.y,side:sh.side})),   // the King's shelf, the North Watch's rock, the garden shelf
    water:{level:WATER_Y,bed:-4,rivers:[{points:RIVER,width:[16,44]},{points:STREAM_W,width:[8,8]}],carve:poolCarve,place:"sirion",center:[0,700],size:[1600,2600]}},
  levels:{height:LVL, radii:[68,46,26], ramp:12},   // four terraces climbing to the tower
  fill:{yards:{courts:2,gardens:3}},
  streets:{
    rings:[],
    avenues:[120,30,210,300].map(b=>({b,r0:14,w:b===120?7:4.5,main:b===120})),
    // over the North bridge, from the ring round the tower, to the North Watch's top terrace
    paths:[{from:"J16:300",points:[[...at(300,16),TOP],[...at(NORTH.b,20),TOP+.4],[...at(NORTH.b,NORTH.d-NORTH.tiers[1]+3),TOP+.4],[...at(NORTH.b,NORTH.d-5),NORTH_TOP]]}],
  },
  gate:{bearing:120, channel:false},          // the gate faces the plain; a stair runs down the rock from it
  squareStatues:[],

  text:{
    districtKicker:"A quarter of the fortress",
    storyHeading:"In the Dagor Bragollach and after",
    searchHint:"Try a name, such as Fingolfin or Hador.",
    citadel:"the tower terrace",
    square:"the court of the tower",
    citizen:"One of the Noldor of Fingolfin's house, going about the fortress.",
  },

  districts:[
    {id:"d-household",name:"House of Fingolfin",lord:"Fingolfin, High King of the Noldor",color:"#2f5b8c",sector:[300,30],hall:[345,57],motif:"spire",
      heraldry:"Blue and silver",desc:"The household and guard of the High King, quartered nearest the mountain and the King's House. Fingolfin's colors were blue and silver. "+MAP,
      fall:"After Fingolfin fell before the gates of Angband, Fingon his son was High King and held Barad Eithel.",src:S_RUIN},
    {id:"d-archers",name:"Archers of the Tower",lord:"Fingon",color:"#6f8ea8",sector:[30,120],hall:[75,57],motif:"tower",
      heraldry:"Grey and silver",desc:"The watch on the walls, looking out over Ard-galen toward Thangorodrim. "+MAP,fall:null,src:S_RET},
    {id:"d-springs",name:"Wardens of the Springs",lord:"Fingolfin",color:"#2f8a8a",sector:[120,210],hall:[165,57],motif:"pool",
      heraldry:"Blue and green",desc:"The keepers of Eithel Sirion, whose falls break out under this quarter's walls. "+MAP,fall:null,src:S_RET},
    {id:"d-smiths",name:"The Smithies",lord:"Fingolfin",color:"#8e3f2c",sector:[210,300],hall:[255,57],motif:"forge",
      heraldry:"Iron and red",desc:"The forges of the Noldor, making mail and blades for the long watch on Angband. "+MAP,fall:null,src:S_RET},
  ],

  places(E){ const {THREE,P,H,edgeR,edgeS}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z), onB=(r,y)=>{ const [x,z]=at(BRIDGE_B,r); return V3(x,y,z); }, pool=at(178,1.5*edge(178)); return {
    "tower":{name:"Barad Eithel",kicker:"The Tower Terrace",alt:"The Tower of the Well",color:"#f4eedf",showAs:"Barad Eithel",
      desc:"The tower above Eithel Sirion, the springs of Sirion on the eastern face of Ered Wethrin: the chief fortress of Fingolfin, High King of the Noldor. From it his people kept watch over the green plain of Ard-galen through the long Siege of Angband.",
      fall:"In the Dagor Bragollach of FA 455 fire swept Ard-galen and the Noldor were driven back to the walls of Eithel Sirion; Hador Lórindol fell defending the rear here. Later Galdor his son was slain defending it. In 472 Fingon's host gathered here before the Nirnaeth Arnoediad, in which Fingon fell and Hithlum was lost.",
      src:S_RET+"; "+S_RUIN+"; "+S_NIR,pos:P(0,0),zoom:240,ring:14,label:P(0,0,H+150),tier:1},
    "court":{name:"The Court of the Tower",kicker:"The Tower Terrace",alt:"The highest terrace, and its well",color:"#efe8d6",
      desc:"The highest terrace of the city, around the foot of the tower. On this map a well-house stands in it, over the water that feeds the springs: the well that gave the tower its name.",
      fall:null,src:S_RET,pos:P(0,0),zoom:150,ring:22,label:P(120,18,H+6),tier:2},
    "kings-house":{name:"The King's House",kicker:"The Mountain Shelf",alt:"Fingolfin's own house, above the city",color:"#f4eedf",fixedY:true,showAs:"the King's House",
      desc:"On this map Fingolfin's own house stands on a shelf of the mountain above the city, level with the tower terrace and joined to it by the high bridge, with a stream falling from beneath it.",
      fall:"When the Dagor Bragollach was lost, Fingolfin rode alone across the burned plain to the gates of Angband and challenged Morgoth to single combat. He wounded him seven times before he fell.",
      src:S_RUIN,pos:V3(LEDGE[0],LEDGE_Y,LEDGE[1]),zoom:180,ring:0,label:V3(LEDGE[0],LEDGE_Y+70,LEDGE[1]),tier:1},
    "bridge":{name:"The High Bridges",kicker:"The Mountain Shelf",alt:"Level bridges on tall pointed arches",color:"#efe8d6",fixedY:true,
      desc:"Bridges on tall pointed arches run level from the tower terrace over the lower terraces: to the King's House on the mountain, to the North Watch on its pinnacle, and to two bridge-towers on the outer terrace. Another runs along the mountain from the King's House to the Watch, and a lower one from the third terrace to the hanging gardens. They are this map's invention.",
      fall:null,src:S_RET,pos:onB(120,LEDGE_Y),zoom:200,ring:0,label:onB(120,LEDGE_Y+12),tier:2},
    "north-watch":{name:"The North Watch",kicker:"The Mountain Shelf",alt:"A small city on a shelf of rock",color:"#f4eedf",fixedY:true,showAs:"the North Watch",
      desc:"On this map a small city of its own stands on a shelf of rock north-west of Barad Eithel: three arcaded terraces of houses, gardens and domed halls inside its own wall, climbing to a slender watch-tower that looks out over Ard-galen toward Angband. High bridges join its top terrace to the tower terrace and to the King's House, and a stair runs down the rock from its gate.",
      fall:null,src:S_RET,pos:V3(NORTH.c[0],NORTH_TOP,NORTH.c[1]),zoom:220,ring:0,label:V3(NORTH.c[0],NORTH_TOP+86,NORTH.c[1]),tier:1},
    "gardens":{name:"The Hanging Gardens",kicker:"The Mountain Shelf",alt:"A garden shelf at the mountain's foot",color:"#7da455",fixedY:true,
      desc:"On this map a shelf at the foot of the mountain, south-west of the city, is laid out as a garden with a domed pavilion and cypresses, reached by a bridge from the third terrace.",
      fall:null,src:S_RET,pos:V3(GARDEN.c[0],GARDEN.y,GARDEN.c[1]),zoom:150,ring:0,label:V3(GARDEN.c[0],GARDEN.y+16,GARDEN.c[1]),tier:2},
    "gate":{name:"The Gate and the Stair",kicker:"Walls",alt:"Facing the plain",color:"#e9e3d3",
      desc:"The gate of the fortress, between two tall needle-spired towers, faces out over Ard-galen at the head of a stair down the rock.",
      fall:"Before the Nirnaeth, the servants of Morgoth slew Gelmir of Nargothrond on the plain before these walls to goad the Noldor; his brother Gwindor rode out in fury, and the battle began before its time.",
      src:S_NIR,pos:P(120,edgeS-2),zoom:140,ring:15,label:P(120,edgeS-2,H+30),tier:1},
    "walls":{name:"The Arcaded Walls",kicker:"Walls",alt:"Terraces faced with pointed arches",color:"#f4eedf",
      desc:"On this map the city rises in four terraces, each faced with two tiers of pointed arches and crowned with a balustrade and pinnacles, inside an arcaded outer wall with slender needle-spired towers.",
      fall:null,src:S_RET,pos:P(0,0),zoom:420,ring:0,label:P(30,edgeR(30)-2,H+14),tier:3},
    "springs":{name:"Eithel Sirion",kicker:"The Springs of Sirion",alt:"Where Sirion rises",color:"#5aa8d6",fixedY:true,
      desc:"The springs of Sirion, the great river of Beleriand, rose here in the eastern face of Ered Wethrin. On this map their water breaks out from beneath the walls in falls and gathers in a pool along the foot of the rock.",
      fall:null,src:S_RET,pos:V3(pool[0],1,pool[1]),zoom:220,ring:0,label:V3(pool[0],16,pool[1]),tier:1},
    "sirion":{name:"The Young Sirion",kicker:"The Springs of Sirion",alt:"South toward the Pass",color:"#5aa8d6",fixedY:true,
      desc:"From its springs Sirion flowed away south along the mountains, toward the Pass of Sirion and the isle of Tol Sirion.",
      fall:null,src:S_RET,pos:V3(80,1,380),zoom:320,ring:0,label:V3(80,14,380),tier:2},
    "herds":{name:"The Horse-herds",kicker:"Ard-galen",alt:"Grazing on the green plain",color:"#86a35f",fixedY:true,
      desc:"The Noldor of Fingolfin's house rode to war, and in the days of the Siege the plain below their fortress was open grassland. On this map their horses graze on Ard-galen below the walls.",
      fall:null,src:S_RET,pos:V3(HERDS.x,2,HERDS.z),zoom:240,ring:0,label:V3(HERDS.x,16,HERDS.z),tier:2},
    "ard-galen":{name:"Ard-galen",kicker:"Ard-galen",alt:"The green plain",color:"#86a35f",fixedY:true,
      desc:"The great grassy plain north of Hithlum and Dorthonion, between the Noldor and Angband, where they kept the long Siege.",
      fall:"In the Dagor Bragollach Morgoth poured rivers of flame across it, and it became Anfauglith, the Gasping Dust.",
      src:S_RET+"; "+S_RUIN,pos:V3(560,2,-200),zoom:700,ring:0,label:V3(560,16,-200),tier:2},
    "ered-wethrin":{name:"Ered Wethrin",kicker:"The Mountains",alt:"The Mountains of Shadow",color:"#9a948a",fixedY:true,
      desc:"The Mountains of Shadow, the wall of Hithlum. Barad Eithel stands against their eastern face.",
      fall:null,src:S_RET,pos:V3(-330,200,90),zoom:700,ring:0,label:V3(-330,300,90),tier:2},
    "thangorodrim":{name:"Thangorodrim",kicker:"The North",alt:"Morgoth's mountains, far off across the plain",color:"#2a2324",fixedY:true,
      desc:"The three peaks Morgoth piled above Angband, reeking with smoke, seen far away across the plain to the north-east. On this map they are drawn much nearer than they were.",
      fall:null,src:S_RET,pos:V3(THANGO[0],200,THANGO[1]),zoom:1200,ring:0,label:V3(THANGO[0],680,THANGO[1]),tier:1},
  }; },
  groups:[["Barad Eithel",["tower","court","kings-house","bridge","north-watch","gardens","gate","walls"]],["The Quarters","@districts"],["Around the Fortress",["springs","sirion","herds","ard-galen","ered-wethrin","thangorodrim"]]],
  reserves(E){ const out=[[0,0,20]]; LANES.forEach(([b,r0])=>{ for(let r=r0;r<=92;r+=6){ const [x,z]=at(b,r); out.push([x,z,5]); } }); FLY.forEach(b=>{ const [x,z]=at(b,82); out.push([x,z,7]); }); return out; },   // the tower, lanes under the bridges, the bridge-towers

  landmarks(E){
    const {THREE,H,DEG,lam,adder,flat,paveMat,own,OCT,octTaper,CYL,CONE,UNIT_BOX,PYRAMID,BALL,HDOME,BLOB,goldMat,glowSprite,addWater,addLantern,addFountainPOI,addGardenPOI,waterMat,surfaceY,STYLE,
      bridge,waterfall,lamp,arcRing,scatter,herd,distantPeaks,town}=E;
    const ARC=STYLE.arcadeGeo(THREE);
    const white=lam("#f4eedf"), shade=lam("#b4aa95"), marble=lam("#e9e1cf"), spire=lam("#c9d1d8"), roofM=lam("#b5bfc8"), gold=goldMat(), glass=lam("#3b4654"), blue=lam("#2f5b8c"), silver=lam("#dfe4ea");
    const leaf=new THREE.MeshPhongMaterial({color:0x4a7b3a,flatShading:true,shininess:4});
    const toward=(c,d,r)=>{ const dx=d[0]-c[0], dz=d[1]-c[1], l=Math.hypot(dx,dz); return [c[0]+dx/l*r,c[1]+dz/l*r]; };
    for(const b of [160,185,205]){ const [x,z]=at(b,1.5*edge(b)-14); addFountainPOI(x,z); }      // where water-bearers fill their jugs at the pool

    { // Barad Eithel: an arcaded octagonal hall, then a tall slender shaft with balconies, a lantern with the beacon, and a needle spire
      const g=new THREE.Group(), add=adder(g);
      const disc=new THREE.CircleGeometry(23,96); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#efe8d6",3),H+.03));
      let y=H; add(OCT,marble,0,y,0,10,1.2,10); y+=1.2;
      add(OCT,shade,0,y,0,8.2,13,8.2); arcRing(add,white,0,y,0,8.6,16,12.4);
      add(OCT,white,0,y+12.4,0,9.2,.8,9.2); add(OCT,gold,0,y+13,0,9.3,.18,9.3);
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,spire,Math.sin(a)*8.6,y+13.2,Math.cos(a)*8.6,.6,5,.6); }
      add(HDOME,lam("#f7f2e6"),0,y+13.2,0,7,4.5,7);
      for(const s of [-1,1]) add(UNIT_BOX,blue,s*3,y+3,8.75,1.6,8,.12);                          // banners of Fingolfin's house by the doors
      add(UNIT_BOX,silver,0,y,8.8,2.6,6,.2);
      y+=13.2;
      const windows=(r,y0,h,rows)=>{ const ap=r*Math.cos(Math.PI/8)+.06;
        for(let k=0;k<8;k++){ const a=k*Math.PI/4; for(let j=0;j<rows;j++) add(UNIT_BOX,glass,Math.sin(a)*ap,y0+j*(h/rows)+h/rows*.3,Math.cos(a)*ap,.7,h/rows*.5,.2,a); } };
      const balcony=r=>{ add(OCT,marble,0,y,0,r,.6,r); add(OCT,gold,0,y+.48,0,r+.06,.14,r+.06);
        for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,spire,Math.sin(a)*r*.96,y+.6,Math.cos(a)*r*.96,.3,2.8,.3); } y+=.6; };
      const stage=(rb,rt,h,rows)=>{ add(octTaper(rt/rb),white,0,y,0,rb,h,rb); windows((rb+rt)/2,y,h,rows); y+=h; };
      stage(4.6,4.1,26,5); balcony(5.8);
      stage(3.9,3.4,20,4); balcony(5);
      stage(3.2,2.9,12,2);
      add(OCT,marble,0,y,0,3.9,.6,3.9); y+=.6;
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CYL,white,Math.sin(a)*2.9,y,Math.cos(a)*2.9,.24,5,.24); }
      const beacon=add(BALL,lam("#fff1c4",{emissive:new THREE.Color("#c99a2e")}),0,y+2.4,0,1.2,1.2,1.2);
      const glow=glowSprite("rgba(255,215,130,.5)",14); glow.position.copy(beacon.position); g.add(glow); addLantern(beacon,0,0);
      y+=5; add(OCT,marble,0,y,0,3.6,.6,3.6); y+=.6;
      add(CONE,spire,0,y,0,3.7,30,3.7); y+=30;
      add(CONE,gold,0,y-3,0,.6,6,.6); add(UNIT_BOX,blue,1.2,y-7,0,2.4,1.5,.08);
      E.PLACES.tower.label.set(0,y+8,0);
      own("tower",g); g.position.y=TOP-H;
    }

    { // the court: the well-house over the spring-water, cypresses, lanterns
      const g=new THREE.Group(), add=adder(g), [wx,wz]=at(120,15.5);
      add(OCT,marble,wx,H,wz,2.8,1,2.8); const w=add(OCT,waterMat(),wx,H+.1,wz,2.3,.95,2.3); addWater(w.material);
      for(let k=0;k<6;k++){ const a=k*Math.PI/3; add(CYL,white,wx+Math.sin(a)*2.6,H+1,wz+Math.cos(a)*2.6,.22,4,.22); }
      add(OCT,marble,wx,H+5,wz,3.1,.5,3.1); add(HDOME,lam("#f7f2e6"),wx,H+5.5,wz,2.9,2.4,2.9); add(CONE,gold,wx,H+7.8,wz,.3,1.6,.3);
      addFountainPOI(wx+3,wz+3);
      [30,75,165,210,255,330].forEach(b=>{ const [x,z]=at(b,19.5); add(CONE,leaf,x,H,z,1.2,7,1.2); });
      [60,150,240].forEach(b=>{ const [x,z]=at(b,21.5); lamp(add,x,H,z); });
      own("court",g); g.position.y=TOP-H;
    }

    { // the high bridges (engine recipe), and the two bridge-towers on the outer terrace
      const g=new THREE.Group(), add=adder(g), D=TOP+.4;
      bridge(add,at(BRIDGE_B,BRIDGE_R[0]),at(BRIDGE_B,BRIDGE_R[1]),{y:D,w:7.6});                                // to the King's House
      bridge(add,at(NORTH.b,20),at(NORTH.b,NORTH.d-NORTH.tiers[1]+3),{y:D,w:6});                               // to the North Watch
      bridge(add,toward(LEDGE,NORTH.c,LEDGE_R-3),toward(NORTH.c,LEDGE,NORTH.tiers[1]-3),{y:D,w:6,span:16});    // along the mountain, King's House to the Watch
      bridge(add,at(GARDEN.b,60),at(GARDEN.b,GARDEN.d-GARDEN.r+3),{y:GARDEN.y+.4,w:5.5,span:12});             // from the third terrace to the hanging gardens
      FLY.forEach(b=>{ bridge(add,at(b,20),at(b,78),{y:D,w:5,span:12});                                       // flying bridges to the bridge-towers
        const [x,z]=at(b,82);
        add(CYL,shade,x,H,z,4.2,TOP-H,4.2); arcRing(add,white,x,H,z,4.5,12,TOP-H-1);
        add(OCT,marble,x,TOP,z,5.2,.6,5.2); add(OCT,gold,x,TOP+.48,z,5.26,.14,5.26);
        for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,spire,x+Math.sin(a)*4.9,TOP+.6,z+Math.cos(a)*4.9,.35,2.6,.35); }
        add(CYL,white,x,TOP+.6,z,2.2,11,2.2); add(CYL,shade,x,TOP+11.6,z,2.5,.5,2.5); add(CONE,spire,x,TOP+12.1,z,2.4,17,2.4); add(CONE,gold,x,TOP+27,z,.4,3,.4); });
      own("bridge",g);
    }

    // the North Watch: a small terraced town on its rock (engine recipe), its bridges coming in from the city and the King's House
    own("north-watch",town({c:NORTH.c,y0:NORTH.y,radii:[NORTH.r-2,...NORTH.tiers],levelH:LVL,gate:70,stairTo:2,seed:60,
      keep:[bearing(-NORTH.c[0],-NORTH.c[1]),bearing(LEDGE[0]-NORTH.c[0],LEDGE[1]-NORTH.c[1])]}));

    { // the hanging gardens: lawn, a domed pavilion, cypresses and trees, a fountain, lamps
      const g=new THREE.Group(), add=adder(g), [cx,cz]=GARDEN.c, Y=GARDEN.y;
      const disc=new THREE.CircleGeometry(GARDEN.r-1.5,48); disc.rotateX(-Math.PI/2); const lawn=flat(disc,paveMat("#7da455",3),Y+.03); lawn.position.set(cx,Y+.03,cz); g.add(lawn);
      add(CYL,marble,cx,Y,cz,4.6,.6,4.6);
      for(let k=0;k<8;k++){ const a=k*Math.PI/4; add(CYL,white,cx+Math.sin(a)*3.9,Y+.6,cz+Math.cos(a)*3.9,.24,5.4,.24); }
      add(CYL,white,cx,Y+6,cz,4.4,.7,4.4); add(HDOME,lam("#f7f2e6"),cx,Y+6.7,cz,4.3,3.6,4.3); add(CONE,gold,cx,Y+10.2,cz,.3,1.8,.3);
      const [fx,fz]=toward(GARDEN.c,[0,0],9); add(CYL,marble,fx,Y,fz,2.2,.8,2.2); const w=add(CYL,waterMat(),fx,Y+.72,fz,1.9,.12,1.9); addWater(w.material); addFountainPOI(fx,fz);
      for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, rr=GARDEN.r-3-hash(i,50)*4, x=cx+Math.cos(a)*rr, z=cz+Math.sin(a)*rr;
        if(Math.hypot(x-fx,z-fz)<5) continue;
        if(hash(i,51)<.55) add(CONE,leaf,x,Y,z,1.1,6.5,1.1); else add(BLOB,leaf,x,Y+2.6,z,2.3,2.7,2.3); }
      for(const s of [-1,1]){ const [lx,lz]=toward(GARDEN.c,at(GARDEN.b+s*25,60),GARDEN.r-3); lamp(add,lx,Y,lz); }
      addGardenPOI(cx,cz,GARDEN.r-4);
      own("gardens",g);
    }

    { // the King's House on the mountain shelf: an arcaded hall facing the bridge, domed wings, a tall needle-spired tower, trees,
      // and a stream falling from beneath it into the ravine
      const g=new THREE.Group(), add=adder(g), [cx,cz]=LEDGE, Y=LEDGE_Y;
      const ub=(BRIDGE_B-180)*DEG, U=[Math.sin(ub),-Math.cos(ub)], Vv=[Math.cos(ub),Math.sin(ub)], rot=-ub;   // U: toward the city; Vv: across
      const L=(dx,dz)=>[cx+dx*Vv[0]+dz*U[0], cz+dx*Vv[1]+dz*U[1]];
      const disc=new THREE.CircleGeometry(LEDGE_R-2,72); disc.rotateX(-Math.PI/2); const pv=flat(disc,paveMat("#e9e1cc",3),Y+.03); pv.position.set(cx,Y+.03,cz); g.add(pv);
      const box=(dx,dz,y,sx,sy,sz,mat)=>{ const [x,z]=L(dx,dz); return add(UNIT_BOX,mat,x,y,z,sx,sy,sz,rot); };
      box(0,-2,Y,24,12,14,shade);                                                                 // the hall
      for(let i=0;i<6;i++){ const [x,z]=L(-10+i*4,5.3); add(ARC,white,x,Y,z,4,11.6,.5,rot); }     // its arcaded front, toward the bridge
      box(0,-2,Y+12,25,.7,15,white);
      { const [x,z]=L(0,-2); add(PYRAMID,roofM,x,Y+12.7,z,25,8,15,rot); }
      for(const s of [-1,1]){ const [x,z]=L(s*16,0);                                             // domed wings
        add(CYL,shade,x,Y,z,6,10,6); arcRing(add,white,x,Y,z,6.4,14,9.4); add(CYL,white,x,Y+10,z,6.6,.7,6.6);
        add(HDOME,lam("#f7f2e6"),x,Y+10.7,z,5.6,5,5.6); add(CONE,gold,x,Y+15.5,z,.35,2.6,.35);
        for(let k=0;k<6;k++){ const a=k*Math.PI/3; add(CONE,spire,x+Math.sin(a)*6.4,Y+10.7,z+Math.cos(a)*6.4,.4,3.2,.4); } }
      { const [x,z]=L(-8,-14); add(CYL,white,x,Y,z,3.3,52,3.3); add(CYL,shade,x,Y+52,z,3.7,.8,3.7);   // the tall tower behind, with its needle spire
        for(let j=0;j<6;j++) add(UNIT_BOX,glass,x+U[0]*3.32,Y+8+j*7.5,z+U[1]*3.32,.8,3,.2,rot);
        add(CONE,spire,x,Y+52.8,z,3.5,28,3.5); add(CONE,gold,x,Y+78,z,.5,4,.5); }
      { const [x,z]=L(9,-12); add(CYL,white,x,Y,z,2.2,30,2.2); add(CONE,spire,x,Y+30,z,2.4,14,2.4); }
      for(const s of [-1,1]){ const [x,z]=L(s*4,12); lamp(add,x,Y,z); }
      for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, rr=LEDGE_R-4-hash(i,40)*3, dx=Math.cos(a)*rr, dz=Math.sin(a)*rr;
        if(dz>0&&Math.abs(dx)<7) continue;                                                        // leave the way to the bridge open
        const [x,z]=L(dx,dz); if(hash(i,41)<.5) add(CONE,leaf,x,Y,z,1.1,6.5,1.1); else add(BLOB,leaf,x,Y+2.6,z,2.2,2.6,2.2); }
      addGardenPOI(cx,cz,LEDGE_R-6);
      const [mx,mz]=L(9,LEDGE_R-2), [fx,fz]=STREAM_W[0];
      waterfall(add,[mx,Y-2,mz],[fx,WATER_Y,fz],5);                                                // the stream from beneath the house (engine recipe)
      own("kings-house",g);
    }

    { // the falls: water breaking out from beneath the walls on the south face, leaping down the rock into the pool (engine recipe)
      const g=new THREE.Group(), add=adder(g);
      FALLS.forEach(([b,w])=>{ const e=edge(b), [mx,mz]=at(b,e*1.02), [px,pz]=at(b,e*1.47); waterfall(add,[mx,H*.86,mz],[px,WATER_Y,pz],w); });
      own("springs",g);
    }

    // green everywhere (engine recipe): trees and cypresses clinging to the rock, and groves on the plain
    const onRock=(i,u,v)=>{ const b=u*360; if(angDist(b,120)<7||LANES.some(([lb])=>angDist(b,lb)<3)) return null; return at(b,edge(b)*(1.03+v*.4)); };
    scatter({kind:"tree",n:315,area:onRock,seed:1,size:[.7,1.4],keep:(x,z,y)=>y>WATER_Y+.6,owner:"walls"});
    scatter({kind:"cypress",n:105,area:onRock,seed:11,size:[.7,1.4],keep:(x,z,y)=>y>WATER_Y+.6,owner:"walls"});
    scatter({kind:"tree",n:360,area:{x0:-150,x1:550,z0:-520,z1:780},seed:6,size:[.9,1.4],colors:["#3f6a32","#4f7a3a"],owner:"ard-galen",
      keep:(x,z,y)=>Math.hypot(x,z)>=140&&y>1.2&&y<120&&Math.hypot(x-HERDS.x,z-HERDS.z)>=70&&!SHELVES.some(sh=>Math.hypot(x-sh.c[0],z-sh.c[1])<sh.r+sh.side)&&(x<=40||hash(Math.round(x),Math.round(z))>.55)});

    { const g=new THREE.Group(); herd(adder(g),HERDS.x,HERDS.z,14,{spread:50}); own("herds",g); }            // Fingolfin's horse-herds on Ard-galen
    { const g=new THREE.Group(); distantPeaks(adder(g),THANGO[0],THANGO[1]); own("thangorodrim",g); }        // Thangorodrim, far off across the plain
  },

  // the cast. Sprite order: the lords below, then one soldier per quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,groundY}=E, K=groundY(0);                               // K: the tower terrace
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), onP=(b,r)=>{ const p=P(b,r); return V(p.x,p.z); };
    const hallOf=(b,name)=>({hall:onP(b,57),nightText:"Asleep in the hall of the "+name});
    const tower={hall:v3(0,K,10),nightText:"Asleep in Barad Eithel"};
    const ub=(BRIDGE_B-180)*Math.PI/180, U=[Math.sin(ub),-Math.cos(ub)], Vv=[Math.cos(ub),Math.sin(ub)];
    const ledge=(dx,dz)=>v3(LEDGE[0]+dx*Vv[0]+dz*U[0],LEDGE_Y,LEDGE[1]+dx*Vv[1]+dz*U[1]), deck=r=>{ const [x,z]=at(BRIDGE_B,r); return v3(x,LEDGE_Y+.4,z); };
    const gateA=(s,r)=>{ const p=P(120,r), tb=210*Math.PI/180; return V(p.x+Math.sin(tb)*s*4,p.z-Math.cos(tb)*s*4); };
    return {
      lords:[
        Object.assign({i:0,name:"Fingolfin, High King of the Noldor",short:"Fingolfin",house:"kings-house",kicker:"High King of the Noldor",
          desc:"Son of Finwë, who led his people across the Grinding Ice into Middle-earth and became High King of the Noldor. He held Hithlum and kept the Siege of Angband from Barad Eithel for four hundred years. When the Siege was broken he rode alone to Angband and challenged Morgoth, and wounded him seven times before he fell.",
          a:ledge(-6,14),b:ledge(6,14),dayText:"Before the doors of the King's House",hall:ledge(0,0),nightText:"Asleep in the King's House"}),
        Object.assign({i:1,name:"Fingon, son of Fingolfin",short:"Fingon",house:"tower",kicker:"Heir of the High King",
          desc:"Fingolfin's eldest son, valiant and well loved, who long before had rescued Maedhros from Thangorodrim. After his father fell he became High King; he died in the Nirnaeth Arnoediad.",
          a:v3(-6,K,12),b:v3(6,K,12),dayText:"Before the doors of the tower"},tower),
        Object.assign({i:2,name:"Hador Lórindol, Lord of Dor-lómin",short:"Hador",house:"bridge",kicker:"Lord of the Third House of the Edain",
          desc:"Golden-haired lord of the Third House of Men, beloved of Fingolfin, who gave him the lordship of Dor-lómin. In the Dagor Bragollach, already old, he fell defending the rear of Fingolfin at Eithel Sirion, and his younger son Gundor with him.",
          a:deck(60),b:deck(150),dayText:"Crossing the high bridge",hall:ledge(6,-6),nightText:"A guest in the King's House"}),
        Object.assign({i:3,name:"Galdor the Tall of Dor-lómin",short:"Galdor",house:"gate",kicker:"Son of Hador",
          desc:"Hador's elder son, who was lord of Dor-lómin after him and the father of Húrin and Huor. He was slain by an arrow in the defence of Eithel Sirion.",
          a:gateA(-1,edgeS-16),b:gateA(1,edgeS-16),dayText:"Looking out over Ard-galen from the gate"},hallOf(75,"Archers of the Tower")),
      ],
      soldierNames:{0:"Guard of the House of Fingolfin",1:"Archer of the Tower",2:"Warden of the Springs",3:"Smith of Barad Eithel"},
      soldierNotes:{0:"One of the High King's guard, keeping watch in the court of the tower."},
      townsfolk:[
        {role:"water",name:"Water-bearer",count:8,text:"Fetching water from the well-house and the pool of the springs."},
        {role:"lore",name:"Loremaster",count:3,text:"One of the loremasters of Fingolfin's house."},
        {role:"gardener",name:"Gardener",count:5,text:"Tending the gardens of the terraces."},
        {role:"minstrel",name:"Minstrel",count:3,text:"A singer of the Noldor."},
        {role:"mason",name:"Stonemason",count:4,text:"Keeping the arches and terraces in repair."},
        {role:"lamplighter",name:"Lamplighter",count:4,text:"Lighting the lamps of the court, the bridge and the walls."},
        {role:"citizen",name:"Elf of Hithlum",text:"One of the Noldor of Hithlum."},
      ],
      citizens:{count:32,sprites:["citizen","water","gardener","citizen"]},
      guards:[
        {district:0,onText:"On guard in the court of the tower",offText:"Off duty in the tower",
          posts:[0,1,2,3].map(k=>{ const b=k*90+45, q=P(b,16); return {post:V(q.x,q.z),barracks:v3(k%2?2:-2,K,10),act:{kind:"circle",R:16,b}}; })},
        {district:1,onText:"Keeping the gate",offText:"Off duty in the archers' hall",
          posts:[-1,1].map(s=>({post:gateA(s,edgeS-12),barracks:onP(75,57),act:{kind:"pace",a:gateA(s,edgeS-12),b:gateA(s,edgeS-21)}}))},
        {district:1,onText:"Keeping watch on the North Watch",offText:"Off duty in the archers' hall",
          posts:[-1,1].map(s=>{ const a0=(NORTH.b+180+s*50)*Math.PI/180, a1=(NORTH.b+180+s*120)*Math.PI/180, c=NORTH.c, r=NORTH.tiers[1]-3;
            const a=v3(c[0]+Math.sin(a0)*r,NORTH_TOP,c[1]-Math.cos(a0)*r), b=v3(c[0]+Math.sin(a1)*r,NORTH_TOP,c[1]-Math.cos(a1)*r);
            return {post:a.clone(),barracks:onP(75,57),act:{kind:"pace",a,b}}; })},
        {district:2,onText:"Watching over the falls",offText:"Off duty in the wardens' hall",
          posts:[{post:onP(160,82),barracks:onP(165,57),act:{kind:"pace",a:onP(150,82),b:onP(196,82)}}]},
      ],
    };
  },
  routines:{
    squareRing:16,
    squareCrowd:[11,21],
    markets:[],
    study:{name:"Barad Eithel",x0:-3,x1:3,z:12},
    minstrelBearings:[150,30,210,330], minstrelRadius:18,
    patrolRing:80,
  },
};
})();
