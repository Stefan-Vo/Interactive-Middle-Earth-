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
const SUMMIT={radius:92,waves:[[3,.04,.4],[5,.025,1.3]]}, H0=72, LVL=9;   // the city stands high on a spur of the mountain
const edge=b=>{ const t=b*Math.PI/180; let v=1; for(const [n,a,p] of SUMMIT.waves) v+=a*Math.sin(n*t+p); return SUMMIT.radius*v; };
const at=(b,r)=>[r*Math.sin(b*Math.PI/180),-r*Math.cos(b*Math.PI/180)];
const TOP=H0+3*LVL;                                         // the ground of the highest terrace, where the tower stands
// the King's House stands on a shelf of the mountain, level with the highest terrace; the high bridge runs out to it
const BRIDGE_B=278, LEDGE_D=135, LEDGE=at(BRIDGE_B,LEDGE_D), LEDGE_R=30, LEDGE_Y=TOP, BRIDGE_R=[20,LEDGE_D-LEDGE_R+6];
// more high bridges: the North Watch on a pinnacle of rock to the north-west, the hanging gardens on a shelf at the mountain's
// foot to the south-west, a bridge along the mountain from the King's House to the Watch, and two flying bridges inside the
// city from the tower terrace to bridge-towers on the outer terrace
const NORTH={b:318,d:160,r:42,y:H0+LVL,tiers:[28,15]},   // the North Watch on a platform of rock against the cliff
      GARDEN={b:240,d:128,r:20,y:H0+LVL}, FLY=[60,195];       // the hanging gardens in a notch of the cliff
NORTH.c=at(NORTH.b,NORTH.d); GARDEN.c=at(GARDEN.b,GARDEN.d);
const SHELVES=[{c:LEDGE,r:LEDGE_R,y:LEDGE_Y,side:8},{c:NORTH.c,r:NORTH.r,y:NORTH.y,side:14},{c:GARDEN.c,r:GARDEN.r,y:GARDEN.y,side:10}];
const NORTH_TOP=NORTH.y+2*LVL;                             // the North Watch's top terrace, level with the tower terrace, where its bridges arrive
const LANES=[[BRIDGE_B,24],[NORTH.b,24],[GARDEN.b,56],...FLY.map(b=>[b,24])];   // [bearing, first radius] of the lanes kept clear under the bridges
// the water: a pool along the south foot of the rock, a stream from the King's shelf, and the young Sirion running south
const WATER_Y=.4, POOL_B=178, POOL_SPAN=42;
const STREAM_W=[at(BRIDGE_B,150),[-147,30],[-126,70],[-99,96]];
const RIVER=[at(178,138),[40,210],[68,300],[88,440],[104,620],[116,850],[124,1150]];
const FALLS=[[150,7],[172,10],[196,6]];                     // [bearing, width] of the falls from under the walls
const HERDS={x:520,z:-40};                                 // Fingolfin's horse-herds on Ard-galen, outside the ward
const THANGO=at(56,1900);
// the Sentinel Crags: pinnacles of rock in front of the cliff, natural stone below and Elvish masonry on top
// [x, z, top height, base radius]; the first is joined by a bridge to the North Watch, the second over the pool to the city wall
const CRAGS=[[-55,-150,NORTH.y+2*LVL,11],[-40,182,H0+9,10],[80,-110,null,9,40],[140,-20,null,11,44],[20,-150,null,9,34]];   // [x, z, top (or null), radius, height above the ground]                                  // Thangorodrim, far off across the plain
// the outer wall: from the mountain north of the North Watch, round the ward on the plain, over the Sirion, and back into the
// mountain south of the gardens (it is built only where the ground is low enough: its ends climb into the mountain's foot)
const WALL=[[-215,-330],[-130,-372],[40,-392],[220,-345],[340,-225],[385,-50],[372,130],[300,300],[190,410],[60,452],[-70,445],[-180,395],[-235,345]];
const WH=16;                                               // the wall's height above the ground
const WALL_L=[0]; for(let i=1;i<WALL.length;i++) WALL_L.push(WALL_L[i-1]+Math.hypot(WALL[i][0]-WALL[i-1][0],WALL[i][1]-WALL[i-1][1]));
const wallAt=sv=>{ let i=1; while(i<WALL.length-1&&WALL_L[i]<sv) i++; const f=(sv-WALL_L[i-1])/(WALL_L[i]-WALL_L[i-1]), [ax,az]=WALL[i-1], [bx,bz]=WALL[i], l=Math.hypot(bx-ax,bz-az);
  return {x:ax+(bx-ax)*f,z:az+(bz-az)*f,tx:(bx-ax)/l,tz:(bz-az)/l,nx:(bz-az)/l,nz:-(bx-ax)/l}; };   // a point on the wall, its direction, and the outward side
const GATE_S=WALL_L[4]+.35*(WALL_L[5]-WALL_L[4]), SOUTH_S=WALL_L[8]+.23*(WALL_L[9]-WALL_L[8]);   // the Great Gate (toward Ard-galen and Angband), the South Gate
const GATE_P=wallAt(GATE_S), SOUTH_P=wallAt(SOUTH_S);
const WARD=[...WALL,[-420,345],[-420,-330]];                 // the ward, closed off by the mountain
const inWard=(x,z)=>{ let c=false; for(let i=0,j=WARD.length-1;i<WARD.length;j=i++){ const [xi,zi]=WARD[i],[xj,zj]=WARD[j]; if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi) c=!c; } return c; };
const segD=(x,z,pts)=>{ let best=1e9; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)); best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t)); } return best; };
// the towns of the ward: a gate-town of the Noldor behind the Great Gate, a small terraced town in the north, a village of Hador's Men by the Sirion
const NW_S=WALL_L[1]+.647*(WALL_L[2]-WALL_L[1]), NW_P=wallAt(NW_S);       // where the Northern Ward meets the outer wall
const GATE_TOWN=[240,-175], MARKET=[250,-95], GARRISON=[262,-238], NWARD={radii:[34,22,12],y:3}, VILLAGE=[255,240], HADOR_HALL=[255,196];
NWARD.c=[NW_P.x-NW_P.nx*35,NW_P.z-NW_P.nz*35];                                 // its own wall touches the outer wall
// the roads of the ward: from the foot of the city's gate stair to the gates and the towns
const GU=[Math.sin(120*Math.PI/180),-Math.cos(120*Math.PI/180)], GN=[-GU[1],GU[0]];
const ZIG_RL=[[edge(120)+9,0],[122,-22],[144,22],[166,-22],[194,0]];   // landing, three turns, foot: [radius, sideways] along the gate's bearing
let ZIG_=null; const ZIG=()=>ZIG_||(ZIG_=ZIG_RL.map(([r,l],i)=>{ const x=GU[0]*r+GN[0]*l, z=GU[1]*r+GN[1]*l; return [x,z,i?land(x,z)+1.2:H0]; }));   // each turn on the ground of the spur
// the flights between the turns, cut into short steps that never sink below the rock of the spur (people walk the same points)
let ZP_=null; const zigPts=()=>ZP_||(ZP_=(()=>{ const Z=ZIG(), out=[Z[0]];
  for(let i=0;i<Z.length-1;i++){ const [ax,az,ay]=Z[i], [bx,bz,by]=Z[i+1], n=Math.max(4,Math.round(Math.hypot(bx-ax,bz-az)/2.2));
    for(let k=1;k<=n;k++){ const f=k/n, x=ax+(bx-ax)*f, z=az+(bz-az)*f; out.push([x,z,Math.max(ay+(by-ay)*f,land(x,z)+.9)]); } }
  return out; })());
const FOOT=[GU[0]*194,GU[1]*194], EJ=[200,-20], VJ=[150,200];
const ROADS={EAST:[FOOT,EJ],GREAT:[EJ,[300,-120],[GATE_P.x-GATE_P.nx*14,GATE_P.z-GATE_P.nz*14],[GATE_P.x+GATE_P.nx*18,GATE_P.z+GATE_P.nz*18],[470,-230]],
  GATETOWN:[EJ,[232,-128]],SOUTHJ:[FOOT,VJ],SOUTH:[VJ,[160,330],[SOUTH_P.x-SOUTH_P.nx*14,SOUTH_P.z-SOUTH_P.nz*14],[SOUTH_P.x+SOUTH_P.nx*18,SOUTH_P.z+SOUTH_P.nz*18],[175,540]],
  VILLAGE:[VJ,[228,206]],NORTH:[FOOT,[195,10],[170,-80],[60,-200],[NWARD.c[0]+18,NWARD.c[1]+33]]};
const nearRoad=(x,z,d)=>Object.values(ROADS).some(r=>segD(x,z,r)<d), nearWall=(x,z,d)=>segD(x,z,WALL)<d;
const inTown=(x,z,pad)=>Math.hypot(x-GATE_TOWN[0],z-GATE_TOWN[1])<62+pad||Math.hypot(x-NWARD.c[0],z-NWARD.c[1])<40+pad||Math.hypot(x-VILLAGE[0],z-VILLAGE[1])<60+pad
  ||Math.hypot(x-MARKET[0],z-MARKET[1])<36+pad||Math.hypot(x-GARRISON[0],z-GARRISON[1])<22+pad;
// the foot of the cliff: close behind the city's western walls, wandering a little north and south of it
const CLIFF=z=>-102+6*Math.sin(z*.013)-4*Math.sin(z*.031+1);
// the spur: a broad rough skirt of rock sloping from just below the city's walls down to the plain, joined to the cliff in the west;
// on the south it is cut away, so the rock drops sheer into the pool where the springs fall
const SKIRT=(x,z)=>{ const d=Math.hypot(x,z), rough=1+.12*Math.sin(x*.09+z*.05)+.08*Math.sin(z*.13-x*.07);
  return 58*smooth(205,96,d)*(1-smooth(55,35,angDist(bearing(x,z),POOL_B)))*rough; };
// the land: Ered Wethrin rising steeply in the west and the green plain (the shelves and the water are terrain recipes below)
function land(x,z){
  const rough=1+.16*Math.sin(x*.023+z*.017)+.1*Math.sin(z*.051-x*.029)+.06*Math.sin(z*.13+x*.07);
  return 2+SKIRT(x,z)+1.2*Math.sin(x*.02)*Math.cos(z*.025)*smooth(150,320,Math.hypot(x,z))+smooth(CLIFF(z),CLIFF(z)-58,x)*(250+60*Math.sin(z*.009+1)+35*Math.sin(z*.023))*rough;
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
  camera:{scale:.85, dist:1100, target:[-50,80,10], from:140, limit:720},   // limit: room to look out over the whole ward   // from the south-east: the falls in front, the terraces climbing to the tower, the King's House on the mountain behind

  terrain:{height:H0, summit:SUMMIT, mountains:{from:99999,to:100001,height:0}, plainFrom:99999, detail:520,
    colors:{top:"#e3dac6",topB:"#dbd1bb",rock1:"#a49d8e",rock2:"#6f6a5f",base:"#6f8a55"},
    shape:land,
    shelves:[...SHELVES.map(sh=>({x:sh.c[0],z:sh.c[1],r:sh.r,y:sh.y,side:sh.side})),{x:NWARD.c[0],z:NWARD.c[1],r:NWARD.radii[0]+4,y:NWARD.y,side:12}],   // the King's shelf, the North Watch's rock, the garden shelf, the Northern Ward
    water:{level:WATER_Y,bed:-4,rivers:[{points:RIVER,width:[16,44]}],carve:poolCarve,place:"sirion",center:[0,700],size:[1600,2600]}},
  levels:{height:LVL, radii:[68,46,26], ramp:12},   // four terraces climbing to the tower
  fill:{yards:{courts:2,gardens:3}},
  markets:[{x:MARKET[0],z:MARKET[1],r:13,stalls:8}],   // the market of the gate-town
  streets:{
    rings:[],
    avenues:[120,30,210,300].map(b=>({b,r0:14,w:b===120?7:4.5,main:b===120})),
    // over the North bridge, from the ring round the tower, to the North Watch's top terrace
    paths:[
      {from:"E:120",to:"FOOT",points:[at(120,edge(120)-10),[...at(120,edge(120)-1),H0],...zigPts().slice(0,-1),FOOT]},   // down the zig-zag stair
      ...Object.entries(ROADS).map(([k,pts])=>({from:{EAST:"FOOT",GREAT:"EJ",GATETOWN:"EJ",SOUTHJ:"FOOT",SOUTH:"VJ",VILLAGE:"VJ",NORTH:"FOOT"}[k],to:{EAST:"EJ",SOUTHJ:"VJ"}[k]||k,points:pts})),
      {from:"J16:300",points:[[...at(300,16),TOP],[...at(NORTH.b,20),TOP+.4],[...at(NORTH.b,NORTH.d-NORTH.tiers[1]+3),TOP+.4],[...at(NORTH.b,NORTH.d-5),NORTH_TOP]]}],
  },
  gate:{bearing:120, channel:false, stair:false},   // the gate faces the plain; the city's own zig-zag stair runs down the spur from it
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
      desc:"On this map Fingolfin's own house stands on a shelf cut into the cliff right behind the city, level with the tower terrace and joined to it by the high bridge, with the mountain rising sheer above it.",
      fall:"When the Dagor Bragollach was lost, Fingolfin rode alone across the burned plain to the gates of Angband and challenged Morgoth to single combat. He wounded him seven times before he fell.",
      src:S_RUIN,pos:V3(LEDGE[0],LEDGE_Y,LEDGE[1]),zoom:180,ring:0,label:V3(LEDGE[0],LEDGE_Y+70,LEDGE[1]),tier:1},
    "bridge":{name:"The High Bridges",kicker:"The Mountain Shelf",alt:"Level bridges on tall pointed arches",color:"#efe8d6",fixedY:true,
      desc:"Bridges on tall pointed arches run level from the tower terrace over the lower terraces: to the King's House on the mountain, to the North Watch on its pinnacle, and to two bridge-towers on the outer terrace. Another runs along the mountain from the King's House to the Watch, and a lower one from the third terrace to the hanging gardens. They are this map's invention.",
      fall:null,src:S_RET,pos:onB(120,LEDGE_Y),zoom:200,ring:0,label:onB(120,LEDGE_Y+12),tier:2},
    "north-watch":{name:"The North Watch",kicker:"The Mountain Shelf",alt:"A small city on a shelf of rock",color:"#f4eedf",fixedY:true,showAs:"the North Watch",
      desc:"On this map a small city of its own stands on a shelf cut into the foot of the mountain north-west of Barad Eithel, with the rock rising sheer behind it: three arcaded terraces of houses, gardens and domed halls inside its own wall, climbing to a slender watch-tower that looks out over Ard-galen toward Angband. High bridges join its top terrace to the tower terrace and to the King's House, and a stair runs down the rock from its gate.",
      fall:null,src:S_RET,pos:V3(NORTH.c[0],NORTH_TOP,NORTH.c[1]),zoom:220,ring:0,label:V3(NORTH.c[0],NORTH_TOP+86,NORTH.c[1]),tier:1},
    "crags":{name:"The Sentinel Crags",kicker:"The Mountain Shelf",alt:"Pinnacles of rock crowned with towers",color:"#a49d8e",fixedY:true,showAs:"the Sentinel Crags",
      desc:"Pinnacles of the mountain's rock standing on the flanks of the spur among slopes of fallen stone, split from the mountain by frost and water, their tops dressed and built up by the Noldor into arcaded platforms, each with a slender tower and a needle spire, so that the rock seems to grow into the tower. A bridge runs from one to the North Watch, and another from one over the pool to the city wall. They are the map's invention.",
      fall:null,src:S_RET,pos:V3(CRAGS[0][0],30,CRAGS[0][1]),zoom:260,ring:0,label:V3(CRAGS[3][0],150,CRAGS[3][1]),tier:1},
    "gardens":{name:"The Hanging Gardens",kicker:"The Mountain Shelf",alt:"A garden shelf at the mountain's foot",color:"#7da455",fixedY:true,
      desc:"On this map a notch cut into the cliff south-west of the city is laid out as a garden with a domed pavilion and cypresses, reached by a bridge from the third terrace, with a waterfall coming down the rock beside it into the pool.",
      fall:null,src:S_RET,pos:V3(GARDEN.c[0],GARDEN.y,GARDEN.c[1]),zoom:150,ring:0,label:V3(GARDEN.c[0],GARDEN.y+16,GARDEN.c[1]),tier:2},
    "gate":{name:"The Gate and the Stair",kicker:"Walls",alt:"Facing the plain",color:"#e9e3d3",
      desc:"The gate of the fortress, between two tall needle-spired towers, faces out over Ard-galen. From a landing below it a stair zig-zags down the spur to the plain, with lamps at every turn.",
      fall:"Before the Nirnaeth, the servants of Morgoth slew Gelmir of Nargothrond on the plain before these walls to goad the Noldor; his brother Gwindor rode out in fury, and the battle began before its time.",
      src:S_NIR,pos:P(120,edgeS-2),zoom:140,ring:15,label:P(120,edgeS-2,H+30),tier:1},
    "walls":{name:"The Arcaded Walls",kicker:"Walls",alt:"Terraces faced with pointed arches",color:"#f4eedf",
      desc:"On this map the city rises in four terraces, each faced with two tiers of pointed arches and crowned with a balustrade and pinnacles, inside an arcaded outer wall with slender needle-spired towers.",
      fall:null,src:S_RET,pos:P(0,0),zoom:420,ring:0,label:P(30,edgeR(30)-2,H+14),tier:3},
    "outer-wall":{name:"The Outer Wall",kicker:"The Outer Ward",alt:"From the mountain round the ward and back",color:"#f4eedf",fixedY:true,showAs:"the Outer Wall",
      desc:"On this map a great wall runs out from the face of Ered Wethrin north of the North Watch, sweeps round a wide ward of the plain with the city, its towns and the springs inside it, crosses the Sirion on arches, and climbs back into the mountain south of the hanging gardens. It is faced with two tiers of pointed arches, crowned with a walk and pinnacles, and set with needle-spired towers. Tolkien tells of the fortress and its walls but not of this wall; it is the map's interpretation.",
      fall:"In the Dagor Bragollach the Noldor of Fingolfin were driven back from Ard-galen to their fortresses under the mountains, and held them, though at great cost.",
      src:S_RET+"; "+S_RUIN,pos:V3(300,10,80),zoom:760,ring:0,label:V3(372,WH+30,130),tier:1},
    "great-gate":{name:"The Great Gate of the Ward",kicker:"The Outer Ward",alt:"Facing Ard-galen and Angband",color:"#d8b34a",fixedY:true,showAs:"the Great Gate",
      desc:"The chief gate of the outer wall, between two great towers with needle spires, under a lofty pointed arch with doors of gold. It faces north-east over Ard-galen, toward Angband. On this map the host of Fingolfin rides out from here.",
      fall:"Before the Nirnaeth Arnoediad the host of Fingon was gathered behind these walls, and from here they saw Gelmir slain on the plain and rode out before their time.",
      src:S_NIR,pos:V3(GATE_P.x,6,GATE_P.z),zoom:200,ring:0,label:V3(GATE_P.x,WH+52,GATE_P.z),tier:1},
    "south-gate":{name:"The South Gate",kicker:"The Outer Ward",alt:"On the road south toward the Pass of Sirion",color:"#e9e3d3",fixedY:true,
      desc:"A smaller gate in the south wall, where the road leaves the ward and follows the young Sirion south toward the Pass and Tol Sirion. It is the map's invention.",
      fall:null,src:S_RET,pos:V3(SOUTH_P.x,6,SOUTH_P.z),zoom:170,ring:0,label:V3(SOUTH_P.x,WH+36,SOUTH_P.z),tier:2},
    "water-gate":{name:"The Water-gate",kicker:"The Outer Ward",alt:"Where the Sirion flows out under the wall",color:"#5aa8d6",fixedY:true,
      desc:"Where the young Sirion leaves the ward, the wall crosses it on tall pointed arches between two towers, so the river runs out beneath. It is the map's invention.",
      fall:null,src:S_RET,pos:V3(90,4,442),zoom:180,ring:0,label:V3(90,WH+30,442),tier:2},
    "gate-town":{name:"The Gate-town",kicker:"The Outer Ward",alt:"Houses of the Noldor behind the Great Gate",color:"#6f8ea8",fixedY:true,
      desc:"A town of tall white houses around a green and a well, just inside the Great Gate, with the garrison's hall and a watch-tower beside it, where the archers and riders of the watch on Angband live with their families. It is the map's invention.",
      fall:null,src:S_RET,pos:V3(GATE_TOWN[0],4,GATE_TOWN[1]),zoom:200,ring:0,label:V3(GATE_TOWN[0],30,GATE_TOWN[1]),tier:1},
    "ward-market":{name:"The Ward Market",kicker:"The Outer Ward",alt:"Stalls by the road to the Great Gate",color:"#d6a32a",fixedY:true,
      desc:"A ring of stalls around a fountain beside the gate-town, with a market hall behind it. Traders set up in the morning and pack away in the evening. It is the map's invention.",
      fall:null,src:S_RET,pos:V3(MARKET[0],3,MARKET[1]),zoom:150,ring:0,label:V3(MARKET[0],24,MARKET[1]-24),tier:2},
    "north-ward":{name:"The Northern Ward",kicker:"The Outer Ward",alt:"A small terraced town with its own wall",color:"#f4eedf",fixedY:true,
      desc:"A small town in the north of the ward, on a low platform of rock built against the outer wall, with two of the wall's towers standing where they meet: its own arcaded wall and gate, terraces of tall houses and domed rotundas, and a slender tower at the top that keeps watch north across Ard-galen. It is the map's invention.",
      fall:null,src:S_RET,pos:V3(NWARD.c[0],NWARD.y+8,NWARD.c[1]),zoom:220,ring:0,label:V3(NWARD.c[0],NWARD.y+92,NWARD.c[1]),tier:1},
    "hador-village":{name:"The Village of Hador's Men",kicker:"The Outer Ward",alt:"Timber halls of the Edain by the Sirion",color:"#a07a52",fixedY:true,
      desc:"Fingolfin gave Hador Lórindol the lordship of Dor-lómin, and Men of his house fought beside the Noldor; Hador himself fell at Eithel Sirion. On this map some of his people live in the ward: round thatched houses and a timber hall inside a palisade by the Sirion, with their fields around them. The village is the map's interpretation.",
      fall:"In the Dagor Bragollach Hador, now old, fell defending the rear of Fingolfin at Eithel Sirion, and his younger son Gundor with him, pierced by many arrows.",
      src:S_RUIN,pos:V3(VILLAGE[0],4,VILLAGE[1]),zoom:200,ring:0,label:V3(VILLAGE[0],28,VILLAGE[1]),tier:1},
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
  groups:[["Barad Eithel",["tower","court","kings-house","bridge","north-watch","gardens","crags","gate","walls"]],["The Quarters","@districts"],
    ["The Outer Ward",["outer-wall","great-gate","south-gate","water-gate","gate-town","ward-market","north-ward","hador-village"]],["Around the Fortress",["springs","sirion","herds","ard-galen","ered-wethrin","thangorodrim"]]],
  // houses out in the ward, in the city's own style (engine settlements): the gate-town round its green
  settlements(E){ return [{owner:"gate-town",district:1,c:GATE_TOWN,r:60,n:40,clear:11,spacing:2.6,w:[4.6,3],d:[5,2.4],
    avoid:(x,z)=>nearRoad(x,z,6)||Math.hypot(x-GARRISON[0],z-GARRISON[1])<22||Math.hypot(x-MARKET[0],z-MARKET[1])<34}]; },
  reserves(E){ const out=[[0,0,20]]; LANES.forEach(([b,r0])=>{ for(let r=r0;r<=92;r+=6){ const [x,z]=at(b,r); out.push([x,z,5]); } }); FLY.forEach(b=>{ const [x,z]=at(b,82); out.push([x,z,7]); }); return out; },   // the tower, lanes under the bridges, the bridge-towers

  landmarks(E){
    const {THREE,H,DEG,lam,adder,flat,paveMat,own,OCT,octTaper,CYL,CONE,UNIT_BOX,PYRAMID,BALL,HDOME,BLOB,goldMat,glowSprite,addWater,addLantern,addFountainPOI,addGardenPOI,waterMat,surfaceY,STYLE,
      bridge,waterfall,lamp,arcRing,scatter,herd,distantPeaks,town,track,hall,tower,huts,M,stair}=E;
    const ARC=STYLE.arcadeGeo(THREE);
    const white=lam("#f4eedf"), shade=lam("#b4aa95"), marble=lam("#e9e1cf"), spire=lam("#c9d1d8"), roofM=lam("#b5bfc8"), gold=goldMat(), glass=lam("#3b4654"), blue=lam("#2f5b8c"), silver=lam("#dfe4ea");
    const leaf=new THREE.MeshPhongMaterial({color:0x4a7b3a,flatShading:true,shininess:4});
    const toward=(c,d,r)=>{ const dx=d[0]-c[0], dz=d[1]-c[1], l=Math.hypot(dx,dz); return [c[0]+dx/l*r,c[1]+dz/l*r]; };

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

      own("kings-house",g);
    }

    { // the falls: water breaking out from beneath the walls on the south face, leaping down the rock into the pool (engine recipe)
      const g=new THREE.Group(), add=adder(g);
      FALLS.forEach(([b,w])=>{ const e=edge(b), [mx,mz]=at(b,e*1.02), [px,pz]=at(b,e*1.47); waterfall(add,[mx,H*.86,mz],[px,WATER_Y,pz],w); });
      own("springs",g);
    }

    // green everywhere (engine recipe): trees and cypresses clinging to the rock, and groves on the plain
    const onRock=(i,u,v)=>{ const b=u*360; if(angDist(b,120)<7||LANES.some(([lb])=>angDist(b,lb)<3)) return null; return at(b,edge(b)*(1.03+v*.4)); };
    scatter({kind:"tree",n:315,area:onRock,seed:1,size:[.7,1.4],keep:(x,z,y)=>y>WATER_Y+.6&&x>CLIFF(z)+2,owner:"walls"});
    scatter({kind:"cypress",n:105,area:onRock,seed:11,size:[.7,1.4],keep:(x,z,y)=>y>WATER_Y+.6&&x>CLIFF(z)+2,owner:"walls"});
    scatter({kind:"tree",n:360,area:{x0:-150,x1:550,z0:-520,z1:780},seed:6,size:[.9,1.4],colors:["#3f6a32","#4f7a3a"],owner:"ard-galen",
      keep:(x,z,y)=>Math.hypot(x,z)>=140&&y>1.2&&y<120&&x>CLIFF(z)+2&&Math.hypot(x-HERDS.x,z-HERDS.z)>=70&&!SHELVES.some(sh=>Math.hypot(x-sh.c[0],z-sh.c[1])<sh.r+sh.side)&&(x<=40||hash(Math.round(x),Math.round(z))>.55)
        &&!nearWall(x,z,14)&&!nearRoad(x,z,6)&&!inTown(x,z,4)&&!CRAGS.some(([cx,cz,,cr])=>Math.hypot(x-cx,z-cz)<cr+8)&&!(x>140&&z>260&&z<410&&inWard(x,z))});

    { // the outer wall: a core faced outward with two tiers of pointed arches, a walk with merlons and pinnacles, towers along it
      const core=[], face=[], rail=[], merl=[], pins=[], tw=[], twc=[], tws=[], tipc=[], N=Math.round(WALL_L[WALL_L.length-1]/4), wet=[], built=[];
      const gapAt=sv=>Math.abs(sv-GATE_S)<11||Math.abs(sv-SOUTH_S)<9;
      for(let k=0;k<N;k++){ const sv=(k+.5)*WALL_L[WALL_L.length-1]/N, p=wallAt(sv), y=surfaceY(p.x,p.z), yaw=Math.atan2(-p.tz,p.tx), len=WALL_L[WALL_L.length-1]/N+.25;
        if(y>45||gapAt(sv)) continue;
        if(y<WATER_Y+.4){ wet.push(sv); continue; }                                               // over the river: the water-gate's arches instead
        core.push({m:M(p.x,y-4,p.z,yaw,len,WH+4,5),c:"#b4aa95",o:"outer-wall"}); built.push(sv);
        for(const t of [0,1]) face.push({m:M(p.x+p.nx*2.6,y-1+t*8.4,p.z+p.nz*2.6,yaw,len,8.4,.5),c:"#f4eedf",o:"outer-wall"});
        for(const sd of [-1,1]) rail.push({m:M(p.x+p.nx*sd*2.25,y+WH,p.z+p.nz*sd*2.25,yaw,len,1.1,.55),c:"#f4eedf",o:"outer-wall"});
        merl.push({m:M(p.x+p.nx*2.25,y+WH+1.1,p.z+p.nz*2.25,yaw,len*.45,1.3,.75),c:"#f4eedf",o:"outer-wall"});
        if(k%2===0) pins.push({m:M(p.x+p.nx*2.9,y+WH+1.1,p.z+p.nz*2.9,0,.35,3,.35),c:"#c9d1d8",o:"outer-wall"}); }
      const ends=[Math.min(...built),Math.max(...built)];                                          // a tower at each end, where the wall runs into the mountain
      const joins=[NW_S-17,NW_S+17], keepT=[...ends,...joins];                                 // and a pair where the Northern Ward joins the wall
      for(let sv of [...keepT,...Array.from({length:Math.floor(WALL_L[WALL_L.length-1]/46)},(_,i)=>20+i*46)]){ if(Math.abs(sv-GATE_S)<30||Math.abs(sv-SOUTH_S)<26||(!keepT.includes(sv)&&(ends.some(e=>Math.abs(sv-e)<24)||Math.abs(sv-NW_S)<40))) continue;    // towers along the wall
        const p=wallAt(sv), y=surfaceY(p.x,p.z); if(y>46||y<WATER_Y+.4) continue;
        tw.push({m:M(p.x+p.nx*1.5,y-4,p.z+p.nz*1.5,0,4.4,WH+14,4.4),c:"#f4eedf",o:"outer-wall"}); twc.push({m:M(p.x+p.nx*1.5,y+WH+10,p.z+p.nz*1.5,0,5,.8,5),c:"#b4aa95",o:"outer-wall"});
        tws.push({m:M(p.x+p.nx*1.5,y+WH+10.8,p.z+p.nz*1.5,0,4.6,16,4.6),c:"#c9d1d8",o:"outer-wall"}); tipc.push({m:M(p.x+p.nx*1.5,y+WH+25.5,p.z+p.nz*1.5,0,.5,3,.5),c:"#d8b34a",o:"outer-wall"}); }
      E.instanced(UNIT_BOX,lam("#ffffff"),core); E.instanced(ARC,lam("#ffffff"),face); E.instanced(UNIT_BOX,lam("#ffffff"),rail); E.instanced(UNIT_BOX,lam("#ffffff"),merl);
      E.instanced(CONE,lam("#ffffff"),pins); E.instanced(CYL,lam("#ffffff"),tw); E.instanced(CYL,lam("#ffffff"),twc); E.instanced(CONE,lam("#ffffff"),tws); E.instanced(CONE,lam("#ffffff",{emissive:new THREE.Color("#2a1e04")}),tipc);

      // the water-gate: the wall crosses the Sirion on tall pointed arches between two towers (engine recipe: bridge)
      if(wet.length){ const s0=Math.min(...wet)-6, s1=Math.max(...wet)+6, a=wallAt(s0), b=wallAt(s1), g=new THREE.Group(), add=adder(g), yb=Math.max(surfaceY(a.x,a.z),surfaceY(b.x,b.z));
        bridge(add,[a.x,a.z],[b.x,b.z],{y:yb+WH,w:5.4,span:9,cutwaters:true,waterLevel:WATER_Y,lamps:false});
        const yaw=Math.atan2(-a.tz,a.tx), L=Math.hypot(b.x-a.x,b.z-a.z), m=[(a.x+b.x)/2,(a.z+b.z)/2];
        add(UNIT_BOX,white,m[0]+a.nx*2.3,yb+WH,m[1]+a.nz*2.3,L,2.2,.7,yaw); add(UNIT_BOX,white,m[0]-a.nx*2.3,yb+WH,m[1]-a.nz*2.3,L,1.1,.6,yaw);
        for(const q of [a,b]){ const y=surfaceY(q.x,q.z); add(CYL,shade,q.x,y-3,q.z,5.2,WH+18,5.2); arcRing(add,white,q.x,y,q.z,5.5,12,WH+13);
          add(CYL,white,q.x,y+WH+15,q.z,5.8,.8,5.8); add(CONE,spire,q.x,y+WH+15.8,q.z,5,18,5); add(CONE,gold,q.x,y+WH+33,q.z,.5,3.2,.5); }
        own("water-gate",g); }

      // the two gates of the ward: towers with needle spires either side of a lofty pointed arch, golden doors standing open
      const gatehouse=(p,o)=>{ const g=new THREE.Group(), add=adder(g), y=surfaceY(p.x,p.z), yaw=Math.atan2(-p.tz,p.tx);
        for(const sd of [-1,1]){ const x=p.x+p.tx*sd*o.half, z=p.z+p.tz*sd*o.half;
          add(CYL,shade,x,y-4,z,o.r,o.h+4,o.r); arcRing(add,white,x,y,z,o.r+.3,14,o.h-2); add(CYL,white,x,y+o.h-2,z,o.r+.6,.9,o.r+.6); add(OCT,gold,x,y+o.h-1.2,z,o.r+.66,.18,o.r+.66);
          for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,spire,x+Math.sin(a)*(o.r+.3),y+o.h-1,z+Math.cos(a)*(o.r+.3),.42,3.4,.42); }
          add(CYL,white,x,y+o.h-1,z,o.r*.6,o.h*.35,o.r*.6); add(CONE,spire,x,y+o.h*1.35-1,z,o.r*.66,o.h*.6,o.r*.66); add(CONE,gold,x,y+o.h*1.95-2,z,.55,3.6,.55);
          add(UNIT_BOX,blue,x+p.nx*(o.r+.15),y+o.h*.35,z+p.nz*(o.r+.15),.14,o.h*.45,2.2,yaw+Math.PI/2); add(UNIT_BOX,silver,x+p.nx*(o.r+.2),y+o.h*.55,z+p.nz*(o.r+.2),.16,1,2.4,yaw+Math.PI/2); }
        add(ARC,white,p.x,y-1,p.z,o.half*2-o.r*1.2,o.h*.8,6,yaw); add(UNIT_BOX,shade,p.x,y+o.h*.8-1,p.z,o.half*2-o.r*.8,3.2,6.4,yaw); add(UNIT_BOX,gold,p.x+p.nx*3.25,y+o.h*.8+.4,p.z+p.nz*3.25,o.half*2-o.r,.4,.2,yaw);
        for(const sd of [-1,1]) add(UNIT_BOX,gold,p.x+p.tx*sd*(o.half-o.r-1.2)-p.nx*3.6,y,p.z+p.tz*sd*(o.half-o.r-1.2)-p.nz*3.6,.4,o.h*.42,5,yaw+Math.PI/2);
        for(const sd of [-1,1]) lamp(add,p.x+p.tx*sd*4.5-p.nx*9,y,p.z+p.tz*sd*4.5-p.nz*9);
        own(o.id,g); };
      gatehouse(GATE_P,{id:"great-gate",half:12,r:6.4,h:WH+20});
      gatehouse(SOUTH_P,{id:"south-gate",half:9,r:4.8,h:WH+12});
      Object.values(ROADS).forEach(pts=>track(pts,{w:5,color:"#c2b28c",owner:"outer-wall"}));
    }

    { // the gate-town: the garrison's hall and a watch-tower (its houses are the engine's settlement); the Ward Market's hall and fountain
      const g=new THREE.Group(), add=adder(g);
      hall(add,GARRISON[0],GARRISON[1],{w:30,d:12,h:10,porch:true,tower:true,yaw:Math.atan2(-GATE_P.tz,GATE_P.tx)});
      tower(add,GATE_P.x-GATE_P.nx*34+GATE_P.tx*26,GATE_P.z-GATE_P.nz*34+GATE_P.tz*26,{r:4,h:34,beacon:true});
      own("gate-town",g);
      const m=new THREE.Group(), am=adder(m), [mx,mz]=MARKET, y=surfaceY(mx,mz);
      hall(am,mx,mz-28,{w:24,d:10,h:8,porch:true});
      const disc=new THREE.CircleGeometry(19,48); disc.rotateX(-Math.PI/2); const pv=flat(disc,paveMat("#e9e1cc",3),y+.04); pv.position.set(mx,y+.04,mz); m.add(pv);
      am(OCT,marble,mx,y,mz,2.4,1,2.4); addWater(am(OCT,waterMat(),mx,y+.95,mz,1.9,.1,1.9).material); am(CYL,white,mx,y,mz,.3,3.4,.3); am(CONE,gold,mx,y+3.4,mz,.3,1.2,.3);
      [45,135,225,315].forEach(a=>{ const x=mx+Math.sin(a*DEG)*17.5, z=mz-Math.cos(a*DEG)*17.5; lamp(am,x,surfaceY(x,z),z); });
      own("ward-market",m); addFountainPOI(mx,mz+3);
    }

    // the Northern Ward: a small terraced town on its platform (engine recipe), its gate toward the road
    own("north-ward",town({c:NWARD.c,y0:NWARD.y,radii:NWARD.radii,levelH:LVL*.8,gate:150,stair:false,seed:71}));

    { // the village of Hador's Men: a timber hall, round thatched houses and a palisade by the Sirion, fields around it
      const g=new THREE.Group(), add=adder(g), [vx,vz]=VILLAGE, wood=lam("#7a5a3a");
      hall(add,HADOR_HALL[0],HADOR_HALL[1],{w:26,d:11,h:7,porch:true,wall:"#b89a72",roof:"#8a6a42"});
      for(let k=0;k<72;k++){ const a=k/72*Math.PI*2; if(Math.abs(Math.sin(a+Math.PI/2+.5))<.08) continue; const x=vx+Math.cos(a)*58, z=vz+Math.sin(a)*58, y=surfaceY(x,z);   // the palisade, with gaps for the paths
        if(nearRoad(x,z,5)) continue; add(CYL,wood,x,y-1,z,.55,5+(k%3)*.4,.55); add(CONE,wood,x,y+4+(k%3)*.4,z,.55,1,.55); }
      own("hador-village",g);
      huts({c:VILLAGE,r:50,n:16,size:3.8,wall:"#8a7656",thatch:"#a08c5c",fire:true,seed:83,owner:"hador-village",keep:(x,z)=>!nearRoad(x,z,5)&&Math.hypot(x-HADOR_HALL[0],z-HADOR_HALL[1])>17});
      addFountainPOI(vx-6,vz+8); addGardenPOI(vx,vz,9);
      E.fields({area:{x0:150,x1:360,z0:270,z1:400},cell:[30,24],seed:57,owner:"hador-village",
        avoid:(x,z,w,d)=>!inWard(x-w/2,z-d/2)||!inWard(x+w/2,z+d/2)||nearWall(x,z,22)||nearRoad(x,z,10)||Math.hypot(x-vx,z-vz)<66||segD(x,z,RIVER)<40});
    }
    { // the zig-zag stair from the gate down the spur: a landing below the gate, three flights back and forth, lamps at the turns
      const g=new THREE.Group(), add=adder(g), yaw=-120*DEG;
      { const [x,z,y]=ZIG()[0], gy=surfaceY(x,z)-2; add(UNIT_BOX,shade,x,gy,z,16,y-gy,14,yaw); add(UNIT_BOX,marble,x,y-.4,z,16.6,.5,14.6,yaw);
        for(const sd of [-1,1]){ add(UNIT_BOX,white,x+GN[0]*sd*7.6,y,z+GN[1]*sd*7.6,1,1.1,14,yaw); } }
      const [gx,gz]=at(120,edge(120)-1); stair(add,[gx,H0,gz],[ZIG()[0][0]-GU[0]*7,H0,ZIG()[0][1]-GU[1]*7],8,{steps:4});
      const Z=ZIG(), ZP=zigPts(), stepM=lam("#e9e1cf");
      for(let i=0;i<ZP.length-1;i++){ const [ax,az,ay]=ZP[i], [bx,bz,by]=ZP[i+1], mx=(ax+bx)/2, mz=(az+bz)/2, y=Math.max(ay,by), base=Math.min(surfaceY(mx,mz),Math.min(ay,by))-1.5;   // each step stands on the rock
        add(UNIT_BOX,stepM,mx,base,mz,7,y-base,Math.hypot(bx-ax,bz-az)+.25,Math.atan2(bx-ax,bz-az)); }
      for(let i=1;i<Z.length-1;i++){ const [x,z,y]=Z[i], gy=Math.min(surfaceY(x,z),y)-2; add(UNIT_BOX,marble,x,gy,z,9,y-gy,9); lamp(add,x+3.6,y,z+3.6); }
      own("gate",g);
    }
    { // the Sentinel Crags: a stack of leaning rock blocks narrowing upward, boulders at the foot, and on top an arcaded platform,
      // a slender tower and a needle spire; bridges from the first to the North Watch and from the second over the pool to the city wall
      const g=new THREE.Group(), add=adder(g), rockA=lam("#8f887b"), rockB=lam("#7a7469"), rockC=lam("#a39b8c");
      CRAGS.forEach(([x,z,top0,R,hh],i)=>{ const top=top0??surfaceY(x,z)+hh, y0=surfaceY(x,z)-2, h=top-y0, N=6;
        for(let k=0;k<N;k++){ const f=k/N, r=R*(1-f*.55)*(1+.12*hash(i,k)), yk=y0+h*f-1, hk=h/N+2.5, dx=(hash(i,k+9)-.5)*R*.25, dz=(hash(i,k+19)-.5)*R*.25;
          const m=add(octTaper(.82),[rockA,rockB,rockC][(i+k)%3],x+dx,yk,z+dz,r,hk,r*(.85+hash(i,k+29)*.3)); m.rotation.y=hash(i,k+39)*6; m.rotation.z=(hash(i,k+49)-.5)*.12; }
        for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+i, bx=x+Math.cos(a)*R*1.15, bz=z+Math.sin(a)*R*1.15; add(BLOB,[rockA,rockB][k%2],bx,surfaceY(bx,bz)+1,bz,R*.35,R*.3,R*.35); }
        const rt=R*.55+2.6;                                                                             // the masonry on top
        add(OCT,shade,x,top-2.4,z,rt,2.4,rt); add(OCT,marble,x,top,z,rt+.6,.6,rt+.6); add(OCT,gold,x,top+.48,z,rt+.66,.14,rt+.66);
        arcRing(add,white,x,top+.6,z,rt,12,4.6); add(OCT,marble,x,top+5.2,z,rt+.4,.5,rt+.4);
        for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,spire,x+Math.sin(a)*(rt+.2),top+5.7,z+Math.cos(a)*(rt+.2),.35,2.6,.35); }
        const th=16+R; add(CYL,white,x,top+5.7,z,2.1,th,2.1); add(CYL,shade,x,top+5.7+th,z,2.5,.6,2.5);
        for(let j=0;j<3;j++) add(UNIT_BOX,glass,x+2.12,top+9+j*4.5,z,.2,2.2,.7);
        add(CONE,spire,x,top+6.3+th,z,2.4,15,2.4); add(CONE,gold,x,top+20.8+th,z,.4,2.6,.4);
        if(i===3){ const b=add(BALL,lam("#fff1c4",{emissive:new THREE.Color("#c99a2e")}),x,top+3,z,1.2,1.2,1.2); addLantern(b,x,z); } });
      { const [cx,cz,top]=CRAGS[0], rt=CRAGS[0][3]*.55+2.6;                                             // to the North Watch's top terrace
        bridge(add,toward([cx,cz],NORTH.c,rt),toward(NORTH.c,[cx,cz],NORTH.tiers[1]-2),{y:top+.4,w:4.4,span:12,lamps:false}); }
      { const [cx,cz,top]=CRAGS[1], rt=CRAGS[1][3]*.55+2.6, b=bearing(cx,cz);                            // over the pool to the city's outer wall
        bridge(add,toward([cx,cz],[0,0],rt),at(b,edge(b)-1),{y:top+.4,w:4.4,span:12,cutwaters:true,waterLevel:WATER_Y,lamps:false}); }
      own("crags",g);
      scatter({kind:"rock",n:150,area:(i,u,v)=>{ const [cx,cz,,cr]=CRAGS[i%CRAGS.length], a=u*Math.PI*2, r=cr*(1.15+v*1.6); return [cx+Math.cos(a)*r,cz+Math.sin(a)*r]; },
        seed:61,size:[.22,.6],colors:["#8f887b","#7a7469","#a39b8c"],owner:"crags"});                                       // scree round the foot of each crag
      scatter({kind:"rock",n:240,area:{x:0,z:0,r:205},seed:63,size:[.18,.5],colors:["#8f887b","#7a7469","#9a9284"],owner:"crags",
        keep:(x,z,y)=>y>5&&y<62&&Math.hypot(x,z)>100&&x>CLIFF(z)+2&&!nearRoad(x,z,6)&&zigPts().every(([zx,zz])=>Math.hypot(x-zx,z-zz)>9)});   // fallen stone across the spur
      scatter({kind:"rock",n:40,area:(i,u,v)=>{ const z=-260+u*520; return [CLIFF(z)+4+v*7,z]; },seed:31,size:[.35,.7],owner:"ered-wethrin",
        keep:(x,z,y)=>y<75&&Math.hypot(x,z)>110&&!SHELVES.some(sh=>Math.hypot(x-sh.c[0],z-sh.c[1])<sh.r+sh.side+4)});   // fallen rock at the foot of the cliff
    }

    { // a waterfall down the cliff beside the hanging gardens, into the west end of the pool (engine recipe)
      const g=new THREE.Group(), z=GARDEN.c[1]+38, xt=CLIFF(z)-30, [px,pz]=at(POOL_B+POOL_SPAN-4,1.5*edge(POOL_B+POOL_SPAN-4));
      const add=adder(g); waterfall(add,[xt,surfaceY(xt,z)-6,z],[px,WATER_Y,pz],9);
      own("springs",g);
    }
    { const g=new THREE.Group(); herd(adder(g),HERDS.x,HERDS.z,14,{spread:50}); own("herds",g); }            // Fingolfin's horse-herds on Ard-galen
    { const g=new THREE.Group(); distantPeaks(adder(g),THANGO[0],THANGO[1]); own("thangorodrim",g); }        // Thangorodrim, far off across the plain
  },

  // the cast. Sprite order: the lords below, then one soldier per quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,groundY}=E, K=groundY(0);                               // K: the tower terrace
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), onP=(b,r)=>{ const p=P(b,r); return V(p.x,p.z); };
    const land=(x,z)=>v3(x,E.surfaceY(x,z),z), nw=(b,r)=>{ const [x,z]=at(b,r); return v3(NWARD.c[0]+x,NWARD.y,NWARD.c[1]+z); };
    const gp=(p,sd,inward)=>land(p.x+p.tx*sd*5-p.nx*inward,p.z+p.tz*sd*5-p.nz*inward);
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
          a:deck(36),b:deck(100),dayText:"Crossing the high bridge",hall:ledge(6,-6),nightText:"A guest in the King's House"}),
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
      extras:["Warrior of Hador's house","Woodwright of Hador's house","Herdsman of Hador's house","Man of Hador's house","Water-bearer of Hador's house"],   // Edain sprites from the library, for the village
      locals:[
        {sprite:"citizen",count:6,spread:50,name:"Elf of the gate-town",kicker:"The Gate-town",house:"gate-town",
          a:land(GATE_TOWN[0]-30,GATE_TOWN[1]),b:land(GATE_TOWN[0]+30,GATE_TOWN[1]+10),home:land(GATE_TOWN[0],GATE_TOWN[1]),dayText:"Going about the gate-town"},
        {sprite:"water",count:2,spread:20,name:"Water-bearer",kicker:"The Gate-town",house:"gate-town",
          a:land(GATE_TOWN[0],GATE_TOWN[1]),b:land(MARKET[0],MARKET[1]+3),home:land(GATE_TOWN[0],GATE_TOWN[1]),dayText:"Carrying water from the market fountain"},
        {soldier:1,count:3,spread:30,name:"Rider of the watch",kicker:"The Gate-town",house:"gate-town",desc:"One of the archers and riders who keep the watch on Angband from the ward.",
          a:land(GARRISON[0],GARRISON[1]+14),b:land(GATE_P.x-GATE_P.nx*20,GATE_P.z-GATE_P.nz*20),home:land(GARRISON[0],GARRISON[1]),dayText:"On the road between the garrison hall and the Great Gate"},
        {sprite:"citizen",count:4,spread:14,name:"Elf of the Northern Ward",kicker:"The Northern Ward",house:"north-ward",
          a:nw(200,27),b:nw(100,27),home:nw(150,27),dayText:"Walking the lowest terrace of the Northern Ward"},
        {extra:0,count:3,spread:40,name:"Warrior of Hador's house",kicker:"The Village of Hador's Men",house:"hador-village",desc:"One of the Men of the Third House, who fight beside the Noldor in the watch on Angband.",
          a:land(VILLAGE[0]-30,VILLAGE[1]-30),b:land(VILLAGE[0]+30,VILLAGE[1]-40),home:land(HADOR_HALL[0],HADOR_HALL[1]),dayText:"Training before Hador's hall"},
        {extra:1,count:2,spread:30,name:"Woodwright of Hador's house",kicker:"The Village of Hador's Men",house:"hador-village",
          a:land(VILLAGE[0]-20,VILLAGE[1]+10),b:land(VILLAGE[0]+20,VILLAGE[1]+20),home:land(VILLAGE[0],VILLAGE[1]),dayText:"Building in timber"},
        {extra:2,count:2,spread:40,name:"Herdsman of Hador's house",kicker:"The Village of Hador's Men",house:"hador-village",
          a:land(230,330),b:land(320,350),home:land(VILLAGE[0],VILLAGE[1]),dayText:"Tending the beasts in the fields"},
        {extra:3,count:4,spread:40,name:"One of Hador's people",kicker:"The Village of Hador's Men",house:"hador-village",
          a:land(VILLAGE[0]-25,VILLAGE[1]+5),b:land(VILLAGE[0]+25,VILLAGE[1]-5),home:land(VILLAGE[0],VILLAGE[1]),dayText:"Going about the village"},
        {extra:4,count:2,spread:16,name:"Water-bearer of Hador's house",kicker:"The Village of Hador's Men",house:"hador-village",
          a:land(VILLAGE[0]-6,VILLAGE[1]+8),b:land(150,270),home:land(VILLAGE[0],VILLAGE[1]),dayText:"Fetching water from the Sirion"},
      ],
      guards:[
        {district:0,onText:"On guard in the court of the tower",offText:"Off duty in the tower",
          posts:[0,1,2,3].map(k=>{ const b=k*90+45, q=P(b,16); return {post:V(q.x,q.z),barracks:v3(k%2?2:-2,K,10),act:{kind:"circle",R:16,b}}; })},
        {district:1,onText:"Keeping the gate",offText:"Off duty in the archers' hall",
          posts:[-1,1].map(s=>({post:gateA(s,edgeS-12),barracks:onP(75,57),act:{kind:"pace",a:gateA(s,edgeS-12),b:gateA(s,edgeS-21)}}))},
        {district:1,onText:"Keeping watch on the North Watch",offText:"Off duty in the archers' hall",
          posts:[-1,1].map(s=>{ const a0=(NORTH.b+180+s*50)*Math.PI/180, a1=(NORTH.b+180+s*120)*Math.PI/180, c=NORTH.c, r=NORTH.tiers[1]-3;
            const a=v3(c[0]+Math.sin(a0)*r,NORTH_TOP,c[1]-Math.cos(a0)*r), b=v3(c[0]+Math.sin(a1)*r,NORTH_TOP,c[1]-Math.cos(a1)*r);
            return {post:a.clone(),barracks:onP(75,57),act:{kind:"pace",a,b}}; })},
        {district:1,onText:"Keeping the Great Gate of the ward",offText:"Off duty in the garrison hall",
          posts:[-1,1].map(sd=>({post:gp(GATE_P,sd,8),barracks:land(GARRISON[0],GARRISON[1]),act:{kind:"pace",a:gp(GATE_P,sd,8),b:gp(GATE_P,sd,20)}}))},
        {district:0,onText:"Keeping the South Gate",offText:"Off duty in the gate-town",
          posts:[-1,1].map(sd=>({post:gp(SOUTH_P,sd,8),barracks:land(GATE_TOWN[0],GATE_TOWN[1]),act:{kind:"pace",a:gp(SOUTH_P,sd,8),b:gp(SOUTH_P,sd,18)}}))},
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
