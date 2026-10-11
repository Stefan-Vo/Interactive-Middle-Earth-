/* Mithrim: city data for citymaker. Build with:  python build.py mithrim
   The north shore of Lake Mithrim in Hithlum, where Fingolfin's host dwelt after it crossed the Grinding Ice, in the first years
   of the Sun (about FA 5): the sons of Fëanor had withdrawn to the southern shore, Fingon had brought Maedhros back from
   Thangorodrim, and the feud between the houses was healed. Tolkien says the Noldor dwelt about the lake; the open town, its hall,
   the quays, the market and the steadings around the lake are this map's interpretation. North is away from the lake.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_RET="The Silmarillion, ch. 13, “Of the Return of the Noldor”", S_IDX="The Silmarillion, Index of Names, “Mithrim”";
const S_ARE="The Silmarillion, ch. 16, “Of Maeglin”";
const MAP="This quarter is the map's invention.";
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const at=(b,r)=>[r*Math.sin(b*Math.PI/180),-r*Math.cos(b*Math.PI/180)];

// the lake: a great oval south of the town, its near shore just below the town; the far shore lost in the mist
const SHORE=232, RX=1000, RZ=500, CZ=SHORE+RZ, LEVEL=-1.5;
const lakeQ=(x,z)=>Math.hypot(x/RX,(z-CZ)/RZ)-1-(.022*Math.sin(x*.011)+.016*Math.sin(z*.017+1))*smooth(180,420,Math.abs(x));
const wet=(x,z)=>smooth(5,-3,lakeQ(x,z)*RZ*.92);
const shoreZ=(x,far)=>CZ+(far?1:-1)*RZ*Math.sqrt(Math.max(0,1-(x/RX)*(x/RX)));   // the true oval, which the near shore keeps by the town
const QUAY_Y=1, QUAY=[-190,-152,-114,-76,-38,0,38,76,114,152,190].map(x=>[x,shoreZ(x)]);
const PIERS=[[0,64,true],[-74,42],[74,42],[-148,36],[148,36]];       // x, length, stone?
const CAMP=[-220,shoreZ(-220,true)+60];                                 // the Fëanorians on the far shore
// the settled land around the town: steadings in the fields, the waterside, the host's camp, the Grey-elves' village and fishers
const STEAD={west:[-330,40,74,26],east:[280,-150,54,20],north:[-70,-340,50,18]};   // x, z, radius, houses
const WEST_HALL=[-330,30], WEST_GREEN=[-330,52];                                    // the Western Steading's great hall, and the green before it
const HOST=[470,shoreZ(470)-46], SINDAR=[-640,-60], FISH=[-400,shoreZ(-400)];
const MARKET=[300,shoreZ(300)-58];                                                  // the Lakeside Market, between the waterside and the camp
const FARMS=[[-190,-150],[140,-280],[420,-40],[-480,170],[-260,-470],[320,-420],[560,-250],[-560,-280]];   // lone farmsteads
const TOWERS=[[-560,shoreZ(-560)-24,"beacon"],[620,shoreZ(620)-30,"beacon"],[-95,-600],[520,-330],[-520,-330],[200,-470]];
const SHORELINE=(x0,x1,step,back)=>{ const out=[]; for(let x=x0;x<=x1;x+=step) out.push([x,shoreZ(x)-back]); return out; };
// footpaths people walk, joined to the ends of the town's avenues (where the summit's edge is, less 10)
const SUMMIT={radius:92,waves:[[2,.04,.8],[5,.025,2.2]]};
const aveEnd=b=>{ const t=b*Math.PI/180; let v=1; for(const [n,a,ph] of SUMMIT.waves) v+=a*Math.sin(n*t+ph); return at(b,SUMMIT.radius*v-10); };
const LAKEROAD=[0,shoreZ(0)-34];
const PATHS=[
  {from:"E:180",to:"LAKEROAD",points:[aveEnd(180),[0,95],LAKEROAD]},
  {from:"LAKEROAD",to:"LANDING",points:[LAKEROAD,[0,shoreZ(0)-3]]},
  {from:"LAKEROAD",to:"SHORE-W",points:SHORELINE(-720,0,60,34).reverse()},
  {from:"LAKEROAD",to:"SHORE-E",points:SHORELINE(0,720,60,34)},
  {from:"E:270",to:"WEST",points:[aveEnd(270),[-110,8],[-200,22],[-290,52],WEST_GREEN]},
  {from:"WEST",to:"SINDAR",points:[WEST_GREEN,[-372,52],[-470,-10],SINDAR]},
  {from:"E:0",to:"NORTH",points:[aveEnd(0),[0,-100],[-30,-200],[-70,-340]]},
  {from:"NORTH",to:"NORTH-ROAD",points:[[-70,-340],[-95,-590],[-90,-720]]},
  {from:"E:90",to:"EAST",points:[aveEnd(90),[110,-20],[170,-60],[280,-150]]},
  {from:"EAST",to:"HOST",points:[[280,-150],[380,30],HOST]},
];
const TRACKS=Object.fromEntries(PATHS.filter(p=>p.from!=="E:180"&&p.to!=="LANDING").map(p=>[p.to,p.points]));   // drawn from the ends of the town's avenues, so road meets avenue
const MAIN_ROADS=["WEST","NORTH","EAST"];                                            // the roads out of the town's gates, as wide as its avenues
// a point a fraction u of the way along a polyline, and the road's direction there
const along=(pts,u)=>{ const L=[0]; for(let i=1;i<pts.length;i++) L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const d=u*L[L.length-1]; let i=1; while(i<pts.length-1&&L[i]<d) i++; const f=(d-L[i-1])/((L[i]-L[i-1])||1), [ax,az]=pts[i-1], [bx,bz]=pts[i], l=Math.hypot(bx-ax,bz-az)||1;
  return [ax+(bx-ax)*f,az+(bz-az)*f,(bx-ax)/l,(bz-az)/l]; };
const segD=(x,z,pts)=>{ let best=1e9; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)); best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t)); } return best; };
const nearTrack=(x,z,d)=>Object.values(TRACKS).some(t=>segD(x,z,t)<d);
const settled=(x,z,pad)=>Object.values(STEAD).some(([sx,sz,r])=>Math.hypot(x-sx,z-sz)<r+pad)||Math.hypot(x-HOST[0],(z-HOST[1])*1.4)<90+pad
  ||Math.hypot(x-SINDAR[0],z-SINDAR[1])<70+pad||(Math.abs(x)<300&&z>shoreZ(x)-60-pad&&z<shoreZ(x)+5)||Math.hypot(x-MARKET[0],z-MARKET[1])<42+pad
  ||FARMS.some(([fx,fz])=>Math.hypot(x-fx,z-fz)<20+pad)||TOWERS.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<8+pad);

window.CITY={
  id:"mithrim",
  style:"noldor",                             // the Noldor of Fingolfin's house: styles/noldor.js
  name:"Mithrim",
  title:"Mithrim from Above",
  tagline:"Fingolfin's town on the north shore of Lake Mithrim, in the first years of the Sun",
  footnote:"Fingolfin's host by Lake Mithrim, the Fëanorians on the southern shore, Maedhros's rescue and the healing of the feud come from The Silmarillion; the open town, its hall, the quays, the market and the steadings are this map's interpretation.",
  searchPlaceholder:"Search the town, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand", worldLabel:"The map of Beleriand",
  seed:5,                                     // about FA 5: Maedhros is healed, and the feud is laid to rest
  look:{sky:"#c4ccd2"},                       // grey skies: Hithlum is the Land of Mist
  camera:{scale:.8, dist:1350, target:[0,6,60], from:345, limit:1350},   // limit: room to look across the lake to the far shore   // from the north: the town in front, the quays, and the misty lake beyond

  terrain:{height:.3, flat:true, summit:SUMMIT,   // the town stands on the level ground, like the steadings
    mountains:{from:1550,to:2300,height:280}, plainFrom:99999, detail:480, rough:0,
    profile:[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.06,.9],[1.16,.7],[1.32,.45],[1.52,.22],[1.78,.07],[2.05,0]],
    colors:{top:"#d8d3c6",topB:"#cec9ba",rock1:"#8d9a7c",rock2:"#7a8a6a",base:"#7e9862"},
    water:{level:LEVEL,bed:-6,carve:wet,color:"#46667a",glow:"#0a1a24",place:"lake",center:[0,CZ],size:[2*RX+400,2*RZ+400]}},
  walls:false,                                // an open town on level ground, with no wall
  fill:{gap:1.7, yards:{courts:3,gardens:5}},   // houses spaced out with gardens between; the people spread out over the land below
  streets:{
    rings:[[50,4],[80,3.5]],
    avenues:[180,0,90,270].map(b=>({b,r0:10,w:b===180?6.5:4.5,main:true})).concat([45,135,225,315].map(b=>({b,r0:34,w:3.5,main:false}))),
    paths:PATHS,                              // footpaths out to the waterside, the market, the steadings, the camp and the woods
  },
  markets:[{x:MARKET[0],z:MARKET[1],r:16,stalls:12}],   // the Lakeside Market: a ring of stalls of its own, out by the lake
  gate:{bearing:180, channel:false},          // the town's main way faces the water
  squareStatues:[],

  text:{
    districtKicker:"A quarter of the town",
    storyHeading:"After the healing of the feud",
    searchHint:"Try a name, such as Fingolfin or Maedhros.",
    citadel:"the king's court",
    square:"the court before Fingolfin's hall",
    citizen:"One of the Noldor of Fingolfin's house, who came over the Grinding Ice.",
  },

  districts:[
    {id:"q-king",name:"The King's House",lord:"Fingolfin",color:"#3b5fa8",sector:[315,45],hall:[0,48],motif:"dome",
      heraldry:"Blue and silver",desc:"The household of Fingolfin, the High King, quartered behind his hall. Fingolfin's banners were blue and silver. "+MAP,
      fall:"In time Fingolfin made his chief fortress at Eithel Sirion, on the eastern face of the Mountains of Shadow, and the watch on Angband was kept from there.",src:S_RET},
    {id:"q-fingon",name:"Fingon's Folk",lord:"Fingon",color:"#c9a227",sector:[45,135],hall:[90,48],motif:"tower",
      heraldry:"Gold and blue",desc:"The people of Fingon, Fingolfin's eldest son, the valiant. "+MAP,
      fall:"Fingon's deed in rescuing Maedhros won him great renown among all the Noldor.",src:S_RET},
    {id:"q-lake",name:"The Lakewardens",lord:"Fingolfin",color:"#2f8a8a",sector:[135,225],hall:[180,48],motif:"pool",
      heraldry:"Blue and grey",desc:"The keepers of the quays and the boats of the lake, on the side of the town that looks over the water. "+MAP,fall:null,src:S_RET},
    {id:"q-sindar",name:"The Grey-elves of Mithrim",lord:"Their own chieftains",color:"#8a9aa4",sector:[225,315],hall:[270,48],motif:"arch",
      heraldry:"Grey and green",desc:"Grey-elves dwelt in Hithlum before the Noldor came; the name Mithrim was first theirs, and then the lake's and the land's. On this map some of them have a quarter in the town. "+MAP,
      fall:null,src:S_IDX},
  ],

  places(E){ const {THREE,P,H,edgeS}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z); return {
    "hall":{name:"Fingolfin's Hall",kicker:"The King's Court",alt:"The High King's hall above the lake",color:"#e9e6dc",showAs:"Fingolfin's Hall",
      desc:"The hall of Fingolfin, High King of the Noldor in Middle-earth. Abandoned by Fëanor at Losgar, Fingolfin led his people over the Helcaraxë, the Grinding Ice, and as the Sun first rose he marched into Mithrim with his blue and silver banners unfurled. His people dwelt about the lake. On this map his hall stands in the middle of the town, looking south over the water.",
      fall:"The sons of Fëanor withdrew to the southern shore, and the lake lay between the two houses, until Maedhros was brought back from Thangorodrim and the feud was healed. Maedhros asked pardon for the desertion at Losgar and gave up his claim to the kingship, and Fingolfin was named High King.",
      src:S_RET,pos:P(0,0),zoom:170,ring:20,label:P(0,0,H+40),tier:1},
    "court":{name:"The King's Court",kicker:"The King's Court",alt:"Before the doors of the hall",color:"#e6e0d2",
      desc:"The paved court in the middle of the town, before the doors of Fingolfin's hall, with a pool and lanterns.",
      fall:"On this map, it is here that Maedhros recovered from his torment. The fire of life burned strongly in him and he grew whole again, though the memory of his pain stayed with him; from then on he fought with his sword in his left hand.",
      src:S_RET,pos:P(180,22),zoom:110,ring:9,label:P(180,22,H+8),tier:2},
    "quays":{name:"The Quays of Mithrim",kicker:"The Lake",alt:"Stone quays and piers below the town",color:"#c7c0ae",fixedY:true,
      desc:"A stone embankment along the shore below the town, with a stone landing at the foot of the lake road and wooden piers on either side, where the boats of the lake tie up. Tolkien does not say the Noldor built quays here; this is the map's interpretation.",
      fall:null,src:S_RET,pos:V3(0,QUAY_Y,SHORE+14),zoom:300,ring:0,label:V3(0,16,SHORE+20),tier:1},
    "lake":{name:"Lake Mithrim",kicker:"The Lake",alt:"The great lake in the east of Hithlum",color:"#5aa8d6",fixedY:true,
      desc:"The great lake in the east of Hithlum. The name Mithrim was first that of the Grey-elves who dwelt there, and then of the lake, the land about it and the mountains to its west. Hithlum itself was the Land of Mist, and mist lies often on the water.",
      fall:"Fëanor's host had camped first on the shores of Mithrim, and there the first battle in Middle-earth was fought, the Battle-under-Stars, before the Moon had risen.",
      src:S_RET+"; "+S_IDX,pos:V3(0,LEVEL,CZ-300),zoom:900,ring:0,label:V3(0,30,CZ-300),tier:1},
    "south-shore":{name:"The Southern Shore",kicker:"The Lake",alt:"Where the sons of Fëanor camped",color:"#b0413e",fixedY:true,
      desc:"When Fingolfin came into Mithrim, the sons of Fëanor withdrew from him to the southern shore, and the lake lay between the two hosts. On this map their camp-fires burn far off across the water.",
      fall:"After Maedhros was healed and gave up the kingship, he and his brothers removed from Mithrim and went east, to the lands beyond Himring.",
      src:S_RET,pos:V3(CAMP[0],2,CAMP[1]),zoom:340,ring:0,label:V3(CAMP[0],60,CAMP[1]),tier:2},
    "waterside":{name:"The Waterside",kicker:"Around the Lake",alt:"Houses along the shore",color:"#2f8a8a",fixedY:true,
      desc:"Houses in two loose rows along the shore behind the quays, where the Lakewardens and the boatwrights live, with a path along the lake behind them. "+MAP.replace("This quarter","It"),
      fall:null,src:S_RET,pos:V3(0,2,SHORE-14),zoom:240,ring:0,label:V3(-150,18,shoreZ(-150)-16),tier:2},
    "west-steading":{name:"The Western Steading",kicker:"Around the Lake",alt:"A great hall among the first fields",color:"#8a9aa4",fixedY:true,
      desc:"The largest of the steadings, with no wall: a great hall with a pillared porch and a tower, two barns and a well on the green before it, and houses all around, on the way to the Grey-elves' woods. Noldor and Grey-elves meet here. "+MAP.replace("This quarter","It"),fall:null,src:S_RET,
      pos:V3(WEST_HALL[0],2,WEST_HALL[1]+10),zoom:170,ring:0,label:V3(WEST_HALL[0],34,WEST_HALL[1]),tier:1},
    "market":{name:"The Lakeside Market",kicker:"Around the Lake",alt:"Stalls, a market hall and storehouses",color:"#d6a32a",fixedY:true,
      desc:"A market of its own out by the lake, between the waterside and the host's camp: a ring of stalls around a well, a market hall and two storehouses. Traders set up in the morning and pack away in the evening. "+MAP.replace("This quarter","It"),
      fall:null,src:S_RET,pos:V3(MARKET[0],2,MARKET[1]),zoom:150,ring:0,label:V3(MARKET[0],28,MARKET[1]-26),tier:1},
    "farmsteads":{name:"The Farmsteads",kicker:"Around the Lake",alt:"Lone farms out in the land",color:"#8fab5f",fixedY:true,
      desc:"Farms of two or three houses scattered over the land about the lake, away from the steadings. "+MAP.replace("This quarter","They are"),
      fall:null,src:S_RET,pos:V3(FARMS[0][0],2,FARMS[0][1]),zoom:260,ring:0,label:V3(FARMS[0][0],18,FARMS[0][1]),tier:3},
    "towers":{name:"The Watchtowers",kicker:"Around the Lake",alt:"Towers on the shore and the roads",color:"#e9e6dc",fixedY:true,
      desc:"White towers on the roads and the hills about the lake, and beacon towers on the shore at either end of the bay, whose fires guide the boats home in the mist. "+MAP.replace("This quarter","They are"),
      fall:null,src:S_RET,pos:V3(TOWERS[0][0],2,TOWERS[0][1]),zoom:220,ring:0,label:V3(TOWERS[0][0],40,TOWERS[0][1]),tier:2},
    "east-steading":{name:"The Eastern Steading",kicker:"Around the Lake",alt:"A hamlet on the road to the camp",color:"#c9a227",fixedY:true,
      desc:"A hamlet of Fingon's folk east of the town, on the road down to the host's camp by the lake. "+MAP.replace("This quarter","It"),fall:null,src:S_RET,
      pos:V3(STEAD.east[0],2,STEAD.east[1]),zoom:150,ring:0,label:V3(STEAD.east[0],20,STEAD.east[1]),tier:2},
    "north-steading":{name:"The Northern Steading",kicker:"Around the Lake",alt:"A hamlet on the north road",color:"#3b5fa8",fixedY:true,
      desc:"A hamlet on the road north out of the town, toward the hills of Hithlum. "+MAP.replace("This quarter","It"),fall:null,src:S_RET,
      pos:V3(STEAD.north[0],2,STEAD.north[1]),zoom:150,ring:0,label:V3(STEAD.north[0],20,STEAD.north[1]),tier:2},
    "fields":{name:"The First Fields",kicker:"Around the Lake",alt:"Farmland newly broken by the Noldor",color:"#c9b45a",fixedY:true,
      desc:"Fields around the steadings. On this map the Noldor have begun to farm the land about the lake.",
      fall:null,src:S_RET,pos:V3(-200,2,-200),zoom:400,ring:0,label:V3(-200,18,-200),tier:3},
    "encampment":{name:"The Encampment of the Host",kicker:"Around the Lake",alt:"Fingolfin's people still under canvas",color:"#dfe4ea",fixedY:true,
      desc:"White and pale blue tents along the eastern shore under Fingolfin's blue banners. On this map, many of the host that came over the Grinding Ice still live in camp while the town is built.",
      fall:null,src:S_RET,pos:V3(HOST[0],2,HOST[1]),zoom:220,ring:0,label:V3(HOST[0],24,HOST[1]),tier:1},
    "sindar-village":{name:"The Grey-elves' Village",kicker:"Around the Lake",alt:"Round huts in the western woods",color:"#8a9aa4",fixedY:true,
      desc:"A village of the Grey-elves of Mithrim: round thatched huts around a fire in the woods west of the town. They lived in Hithlum before the Noldor came; on this map they keep to their woods.",
      fall:null,src:S_IDX,pos:V3(SINDAR[0],2,SINDAR[1]),zoom:200,ring:0,label:V3(SINDAR[0],24,SINDAR[1]),tier:1},
    "fishers":{name:"The Fishers' Huts",kicker:"Around the Lake",alt:"Huts on stilts at the water's edge",color:"#7a6a52",fixedY:true,
      desc:"Huts on stilts over the shallows, with racks for nets and boats drawn up beside them. This is the map's invention.",
      fall:null,src:S_RET,pos:V3(FISH[0],1,FISH[1]),zoom:140,ring:0,label:V3(FISH[0],16,FISH[1]),tier:2},
    "mountains":{name:"The Mountains of Hithlum",kicker:"The Lake",alt:"Ered Wethrin and the Mountains of Mithrim",color:"#9a948a",fixedY:true,
      desc:"Hithlum was walled by mountains: Ered Wethrin, the Mountains of Shadow, on the east and south, and the Mountains of Mithrim to the west of the lake, dividing it from Dor-lómin.",
      fall:null,src:S_RET+"; "+S_IDX,pos:V3(0,170,-2100),zoom:900,ring:0,label:V3(0,300,-2100),tier:2},
  }; },
  groups:[["The King's Court",["hall","court"]],["The Quarters","@districts"],["Around the Lake",["waterside","market","encampment","west-steading","east-steading","north-steading","farmsteads","towers","fields","sindar-village","fishers"]],["The Lake",["quays","lake","south-shore","mountains"]]],
  reserves(E){ return [[0,0,24]]; },
  // houses out on the land, in the town's own style (engine settlements): three steadings in the fields, and the waterside
  settlements(E){ const st=(k,o)=>{ const [x,z,r,n]=STEAD[k]; return Object.assign({owner:k+"-steading",c:[x,z],r,n,clear:11,spacing:4,w:[4.4,3.2],d:[4.4,2.2],avoid:(x,z)=>nearTrack(x,z,6)},o); };   // houses keep off the paths
    return [st("west",{district:3,r:74,clear:40,well:false,green:false}),st("east",{district:1}),st("north",{district:0}),
      ...FARMS.map(([x,z],i)=>({owner:"farmsteads",district:i%4,c:[x,z],r:17,n:2+i%3,clear:3,spacing:3,w:[4.6,3],d:[4.4,2.2],well:false,green:false,avoid:(x,z)=>nearTrack(x,z,6)})),
      {owner:"waterside",district:2,along:SHORELINE(-300,240,30,4),side:-1,offset:5,rows:2,rowGap:10,spacing:3.2,w:[3.4,2.8],d:[3.6,1.6],
        avoid:(x,z)=>Math.abs(x)<9||Math.hypot(Math.abs(x)-112,z-(shoreZ(112)-14))<14||Math.hypot(x,z)<150||Math.hypot(x-MARKET[0],z-MARKET[1])<44}]; },

  landmarks(E){
    const {THREE,H,P,LVL,lam,adder,flat,paveMat,own,instanced,M,OCT,DISC,CYL,CONE,UNIT_BOX,BALL,BLOB,GABLE,goldMat,glowSprite,addWater,addLantern,addFountainPOI,addGardenPOI,surfaceY,PLACES,
      quay,pier,boat,mist,scatter,lamp,camp,huts,track,hall,tower}=E;
    const white=lam("#f6f3ec"), marble=lam("#e6e0d2"), slate=lam("#5f7d98"), gold=goldMat(), blue=lam("#3b5fa8"), silver=lam("#dfe4ea");
    { // Fingolfin's hall: a long hall on a stepped plinth, a pillared porch facing the lake, a high slate roof, and a slender tower behind
      const g=new THREE.Group(), add=adder(g), Z=-2;
      const disc=new THREE.CircleGeometry(29.5,96); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#ece6d8",3),H+.03));
      add(UNIT_BOX,marble,0,H,Z,17,1.2,33); add(UNIT_BOX,marble,0,H+1.2,Z,15.6,.6,31.6);
      const F=H+1.8;
      add(UNIT_BOX,white,0,F,Z-2,13,11,25);                                                     // the walls
      for(let k=0;k<6;k++) for(const s of [-1,1]) add(UNIT_BOX,lam("#3b4654"),s*6.55,F+3.2,Z-12+k*4.2,.2,4.6,1.3);   // tall windows down each side
      add(GABLE,slate,0,F+11,Z-2,15,9,27); add(UNIT_BOX,gold,0,F+19.9,Z-2,.35,.3,27);         // the roof and its gilded ridge
      for(let k=0;k<6;k++){ const x=-6.5+k*2.6; add(CYL,white,x,F,Z+12.6,.55,10,.55); add(UNIT_BOX,marble,x,F+10,Z+12.6,1.4,.4,1.4); }   // the porch
      add(UNIT_BOX,marble,0,F+10.4,Z+12.6,15,1,4.4); add(GABLE,slate,0,F+11.4,Z+12.6,15.4,4.4,4.8);
      add(UNIT_BOX,gold,0,F,Z+10.45,3.6,6.4,.25);                                               // the doors
      for(let i=0;i<4;i++) add(UNIT_BOX,marble,0,H,Z+16.6+i*.7,9-i*.4,1.8-i*.45,.7);           // steps down to the court
      const tz=Z-17.5; add(OCT,marble,0,F,tz,4.6,1,4.6); add(CYL,white,0,F+1,tz,3.6,30,3.6);     // the tower
      for(let k=0;k<8;k++){ const a=k*Math.PI/4; add(UNIT_BOX,lam("#3b4654"),Math.sin(a)*3.62,F+24,tz+Math.cos(a)*3.62,.9,2.6,.2,a); }
      add(OCT,marble,0,F+31,tz,4.6,.8,4.6); add(CONE,slate,0,F+31.8,tz,4.2,11,4.2); add(BALL,gold,0,F+43,tz,.5,.5,.5);
      for(const s of [-1,1]){ add(CYL,lam("#6a6152"),s*9.5,H,Z+18,.16,14,.16); add(UNIT_BOX,blue,s*9.5+s*1.2,H+9.2,Z+18,2.4,4.6,.12); add(BALL,silver,s*9.5+s*1.2,H+11.2,Z+18.08,.6,.6,.12); }   // blue and silver banners
      PLACES.hall.label.set(0,F+50,tz);
      own("hall",g); g.position.y=LVL;
    }
    { // the court before the hall: a long pool, lanterns, trees in tubs
      const g=new THREE.Group(), add=adder(g), leaf=new THREE.MeshPhongMaterial({color:0x5f8f45,flatShading:true,shininess:4});
      add(UNIT_BOX,marble,0,H,23,6.4,.7,7); const pool=add(UNIT_BOX,lam("#4f8fb8",{emissive:new THREE.Color("#143a52")}),0,H+.05,23,5.4,.7,6); addWater(pool.material);
      addFountainPOI(0,27.5);
      [120,150,210,240].forEach(b=>{ const q=P(b,25); add(OCT,marble,q.x,H,q.z,.9,.9,.9); add(BLOB,leaf,q.x,H+3,q.z,1.8,2.3,1.8); add(CYL,lam("#6a5a48"),q.x,H+.9,q.z,.18,1.4,.18); });
      [100,135,225,260].forEach(b=>{ const q=P(b,27); lamp(add,q.x,H,q.z,3.8); });
      addGardenPOI(0,22,8);
      own("court",g); g.position.y=LVL;
    }
    { // the quays: an embankment, a stone landing in line with the gate and wooden piers, boats tied up and boats out on the lake
      const g=new THREE.Group(), add=adder(g);
      quay(add,QUAY,{y:QUAY_Y,w:6,lampEvery:38});                                              // engine recipes: quay, pier, boat
      for(const [x,len,stone] of PIERS){ const z0=shoreZ(x)+2;
        pier(add,[x,z0],[x,z0+len],{y:stone?QUAY_Y:.7,w:stone?7:3.6,stone});
        if(!stone) for(const s of [-1,1]) for(let k=0;k<2;k++) if((x+s*7+k*3)%3!==1) boat(add,x+s*3.6,z0+12+k*15,-Math.PI/2+s*.04,{len:7+k,color:k?"#6b4f34":"#5a4430"}); }
      boat(add,-9,shoreZ(0)+30,-Math.PI/2,{len:11,sail:true,color:"#e6e0d2",sailColor:"#dfe6ee"});   // the king's boat, white with a pale sail, at the stone landing
      [[-300,480,.6],[260,620,2.4],[60,820,1.2],[-480,760,-.4]].forEach(([x,z,yaw])=>boat(add,x,z,yaw,{len:8,sail:true}));
      { const r=[]; const z1=shoreZ(0)-2;                                                       // the road from the foot of the gate stair to the landing
        for(let z=aveEnd(180)[1];z<z1;z+=6){ const y=Math.max(QUAY_Y,surfaceY(0,z)); r.push({m:M(0,y-.25,z,Math.PI/2,6.6,.5,6.5),c:"#ebe6d8",o:"quays"}); }
        instanced(UNIT_BOX,lam("#ffffff"),r,false); }
      for(const s of [-1,1]){ const x=s*112, z=shoreZ(x)-14, y=surfaceY(x,z);                 // two boathouses among the waterside houses
        add(UNIT_BOX,white,x,y-1,z,16,6,11); add(GABLE,slate,x,y+5,z,17,4.4,12); add(UNIT_BOX,lam("#3a2a1c"),x,y-1,z+5.55,7,4.6,.2); }
      own("quays",g);
      addFountainPOI(-30,shoreZ(-30)-2); addFountainPOI(40,shoreZ(40)-2);                       // fetching water at the lake
    }
    // engine recipes: camps, huts and tracks. The sons of Fëanor across the water, in red; Fingolfin's host along the eastern shore
    camp({c:CAMP,r:70,stretch:1.6,n:40,size:5,colors:["#9a3330","#6e2624","#b0413e"],banner:"#9a3330",fires:7,glow:30,seed:31,owner:"south-shore"});
    camp({c:HOST,r:72,stretch:1.5,n:46,size:3.6,colors:["#f1ede2","#dfe4ea","#c9d4de","#e8e2d2"],banner:"#3b5fa8",banners:5,fires:6,seed:41,owner:"encampment",
      keep:(x,z)=>z<shoreZ(x)-8&&!nearTrack(x,z,5)});
    huts({c:SINDAR,r:62,n:14,size:3.4,wall:"#7d6e58",thatch:"#8f8a6a",fire:true,seed:51,owner:"sindar-village",keep:(x,z)=>!nearTrack(x,z,5)});   // the Grey-elves' village in the woods
    huts({c:FISH,r:46,stretch:1.8,n:9,size:2.6,stilts:true,racks:true,wall:"#7a6a52",thatch:"#9c8a5a",seed:57,owner:"fishers",
      keep:(x,z)=>Math.abs(z-shoreZ(x))<9});                                                  // fishers' huts on stilts at the water's edge
    { const g=new THREE.Group(), add=adder(g);                                                 // the fishers' boats, drawn up or just off the shore
      [-470,-430,-372,-340].forEach((x,i)=>boat(add,x,shoreZ(x)+6+i%2*5,-Math.PI/2+(i-1.5)*.3,{len:6,color:i%2?"#6b4f34":"#5a4430"})); own("fishers",g); }
    const TRACK_OWNER={"SHORE-W":"waterside","SHORE-E":"waterside","WEST":"west-steading","SINDAR":"sindar-village","NORTH":"north-steading","NORTH-ROAD":"towers","EAST":"east-steading","HOST":"encampment"};
    Object.entries(TRACKS).forEach(([k,pts])=>track(pts,{w:MAIN_ROADS.includes(k)?4.6:k.startsWith("SHORE")?3.8:3.2,owner:TRACK_OWNER[k]}));
    // trees lining the roads out of the town and the lake road, and groves in the open meadows
    const ROWED={WEST:[0,.62],NORTH:[0,.75],EAST:[0,.8],HOST:[.1,.9],"SHORE-W":[0,.5],"SHORE-E":[0,.42]};
    const lake=[aveEnd(180),[0,shoreZ(0)-20]];
    Object.entries(ROWED).concat([["LAKE",[0,1]]]).forEach(([k,[u0,u1]],j)=>{ const pts=k==="LAKE"?lake:TRACKS[k], len=pts.reduce((a,p,i)=>i?a+Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]):0,0), n=Math.floor(len*(u1-u0)/11);
      scatter({kind:"tree",n:n*2,area:i=>{ const [x,z,dx,dz]=along(pts,u0+(u1-u0)*(Math.floor(i/2)+.5)/n), side=i%2?1:-1, off=(MAIN_ROADS.includes(k)||k==="LAKE"?6:4.5);
          return [x-dz*off*side,z+dx*off*side]; },seed:60+j,size:[.95,1.15],colors:["#4f7a3a","#5b8c44"],
        keep:(x,z,y)=>Math.hypot(x,z)>SUMMIT.radius+4&&wet(x,z)<.01&&!settled(x,z,-4)&&!nearTrack(x,z,2.6),owner:TRACK_OWNER[k]||"quays"}); });
    [[-160,-60,40],[150,-30,34],[90,-170,30],[-230,-260,44],[420,-200,40],[-430,-170,50],[40,-470,40],[-150,140,30],[160,140,26]].forEach(([x,z,r],i)=>
      scatter({kind:"tree",n:Math.round(r*.9),area:{x,z,r},seed:80+i,size:[.9,1.5],keep:(x2,z2,y)=>Math.hypot(x2,z2)>SUMMIT.radius+12&&wet(x2,z2)<.01&&!settled(x2,z2,4)&&!nearTrack(x2,z2,5),owner:"fields"}));   // groves in the meadows
    { // the Western Steading: a great hall with a porch and a tower on its green, two barns, a well; no wall
      const g=new THREE.Group(), add=adder(g), [hx,hz]=WEST_HALL, [gx,gz]=WEST_GREEN;
      hall(add,hx,hz,{w:26,d:13,h:9,porch:true,tower:true});                                    // engine recipe: a big building on the land
      for(const s of [-1,1]) hall(add,hx+s*26,hz-12,{w:14,d:8,h:6,yaw:Math.PI/2,wall:"#c9b89a",roof:"#7d6a52"});   // the barns, behind the hall
      const disc=new THREE.CircleGeometry(9,40); disc.rotateX(-Math.PI/2); const lawn=flat(disc,paveMat("#d8d0bc",3),surfaceY(gx,gz)+.05); lawn.position.set(gx,surfaceY(gx,gz)+.05,gz); g.add(lawn);
      const y=surfaceY(gx,gz); add(CYL,marble,gx,y,gz,1.6,1,1.6); const w=add(CYL,lam("#3f86b4",{emissive:new THREE.Color("#0f2c40")}),gx,y+.95,gz,1.25,.1,1.25); addWater(w.material);
      for(const s of [-1,1]) add(CYL,white,gx+s*1.4,y,gz,.16,3,.16); add(CONE,slate,gx,y+3,gz,2.2,1.4,2.2);
      [[-7,4],[7,4],[-7,-4],[7,-4]].forEach(([dx,dz])=>lamp(add,gx+dx,surfaceY(gx+dx,gz+dz),gz+dz,3.6));
      own("west-steading",g); addFountainPOI(gx,gz+2.5); addGardenPOI(gx,gz,7);
    }
    { // the Lakeside Market: a market hall and two storehouses behind a ring of stalls (the stalls are the engine's, set by CITY.markets)
      const g=new THREE.Group(), add=adder(g), [mx,mz]=MARKET;
      hall(add,mx,mz-32,{w:28,d:12,h:8,porch:true});
      for(const s of [-1,1]) hall(add,mx+s*34,mz-12,{w:16,d:9,h:6,yaw:Math.PI/2,roof:"#7d6a52"});
      const disc=new THREE.CircleGeometry(22,48); disc.rotateX(-Math.PI/2); const y=surfaceY(mx,mz), pave=flat(disc,paveMat("#e2dac6",3),y+.04); pave.position.set(mx,y+.04,mz); g.add(pave);
      add(OCT,marble,mx,y,mz,2.4,1,2.4); const w=add(OCT,lam("#3f86b4",{emissive:new THREE.Color("#0f2c40")}),mx,y+.95,mz,1.9,.1,1.9); addWater(w.material);
      add(CYL,lam("#6a6152"),mx,y,mz,.2,9,.2); add(UNIT_BOX,blue,mx+1.3,y+6.6,mz,2.4,2,.1);   // the market pole with a blue pennant
      [0,60,120,180,240,300].forEach(a=>{ const r=20.5, x=mx+Math.sin(a*Math.PI/180)*r, z=mz-Math.cos(a*Math.PI/180)*r; lamp(add,x,surfaceY(x,z),z,3.8); });
      own("market",g); addFountainPOI(mx,mz+3);
    }
    { // watchtowers on the roads and hills, and beacon towers on the shore at either end of the bay
      const g=new THREE.Group(), add=adder(g);
      TOWERS.forEach(([x,z,kind])=>tower(add,x,z,kind==="beacon"?{r:4,h:28,beacon:true}:{r:3,h:20,banner:"#3b5fa8"}));
      own("towers",g);
    }
    E.fields({area:{x0:-600,x1:600,z0:-560,z1:200},cell:[32,27],seed:33,owner:"fields",          // patches of field around the steadings and farms, meadow between
      avoid:(x,z)=>[[-160,-60,40],[150,-30,34],[90,-170,30],[-230,-260,44],[420,-200,40],[-430,-170,50],[40,-470,40]].some(([gx,gz,gr])=>Math.hypot(x-gx,z-gz)<gr+14)||Object.values(STEAD).every(([sx,sz,r])=>Math.hypot(x-sx,z-sz)>r+120)&&FARMS.every(([fx,fz])=>Math.hypot(x-fx,z-fz)>70)||Math.hypot(x,z)<175||settled(x,z,10)||nearTrack(x,z,9)||wet(x,z)>0||z>shoreZ(x)-70||x<-500||Math.hypot(x,z)>600});
    // the lake's mist, reeds along the shore away from the quays, birches on the plain, pines on the mountains
    mist({n:70,area:{x0:-700,x1:700,z0:SHORE+70,z1:SHORE+640},y:LEVEL+1,size:130,opacity:.55,seed:71,keep:(x,z)=>lakeQ(x,z)<-.05});   // banks of mist on the near water
    mist({n:16,area:{x0:-900,x1:900,z0:SHORE+420,z1:SHORE+620},y:LEVEL+1,size:200,opacity:.35,seed:83,keep:(x,z)=>lakeQ(x,z)<-.08});
    scatter({kind:"reed",n:420,area:(i,u,v)=>{ const a=u*Math.PI*2, k=1+(v-.5)*.022; return [Math.cos(a)*RX*k,CZ+Math.sin(a)*RZ*k]; },seed:12,size:[1,1.6],
      keep:(x,z,y)=>y>LEVEL-.4&&y<1.2&&(Math.abs(x)>230||z>CZ),owner:"lake"});
    scatter({kind:"tree",n:420,area:{x:0,z:-200,r:1500},seed:14,size:[.8,1.3],keep:(x,z,y)=>Math.hypot(x,z)>600&&y>-.2&&y<24&&wet(x,z)<.01&&!settled(x,z,6),owner:"mountains"});
    Object.entries(STEAD).forEach(([k,[sx,sz,r]],i)=>scatter({kind:"tree",n:70,area:{x:sx,z:sz,r:r+34},seed:20+i,size:[.8,1.3],      // trees and orchards around each steading
      keep:(x,z,y)=>Math.hypot(x-sx,z-sz)>r+4&&!nearTrack(x,z,5)&&wet(x,z)<.01,owner:k+"-steading"}));
    scatter({kind:"tree",n:300,area:{x:SINDAR[0],z:SINDAR[1],r:230},seed:16,size:[.9,1.5],keep:(x,z,y)=>Math.hypot(x-SINDAR[0],z-SINDAR[1])>58&&!nearTrack(x,z,5)&&wet(x,z)<.01,owner:"sindar-village"});   // the Grey-elves' woods
    scatter({kind:"pine",n:1100,area:{x:0,z:0,r:2700},seed:15,size:[.9,1.4],keep:(x,z,y)=>y>26&&y<210,owner:"mountains"});
  },

  // the cast. Sprite order: the lords below, then one soldier per quarter (district order), then the townsfolk (see sprites/cast.txt).
  people(E){
    const {THREE,H,P,V,edgeS,groundY}=E, K=groundY(0);                                      // K: the king's court
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), land=(x,z)=>v3(x,E.surfaceY(x,z),z), onP=(b,r)=>{ const p=P(b,r); return V(p.x,p.z); };
    const hall={hall:v3(0,K,6),nightText:"Asleep in Fingolfin's hall"}, Q=shoreZ(0);
    const L=(i,name,short,house,o)=>Object.assign({i,name,short,house},hall,o);
    return {
      lords:[
        L(0,"Fingolfin, High King of the Noldor","Fingolfin","hall",{kicker:"High King of the Noldor",
          desc:"Second son of Finwë, and half-brother of Fëanor. Fëanor abandoned him at Losgar, and he led his people over the Grinding Ice into Middle-earth. He was counted the strongest, steadiest and bravest of Finwë's sons.",
          a:v3(-5,K,15.5),b:v3(5,K,15.5),dayText:"Before the doors of his hall"}),
        L(1,"Fingon the Valiant","Fingon","quays",{kicker:"Eldest son of Fingolfin",
          desc:"Fingolfin's eldest son. Alone he went to seek Maedhros, his old friend, hanging by one hand from the precipice of Thangorodrim; with the help of Thorondor, King of Eagles, he cut him free at the wrist and brought him back to Mithrim.",
          a:v3(-3,QUAY_Y,Q+20),b:v3(3,QUAY_Y,Q+52),dayText:"On the stone landing, looking south across the water"}),
        L(2,"Maedhros son of Fëanor","Maedhros","court",{kicker:"Eldest son of Fëanor",
          desc:"The tallest of the sons of Fëanor, red-haired. Morgoth hung him by his right wrist from Thangorodrim; Fingon rescued him, and in Mithrim he was healed. He asked pardon for the desertion at Losgar and gave up his claim to the kingship.",
          a:v3(-7,K,25),b:v3(7,K,25),dayText:"Healing in the king's court"}),
        L(3,"Turgon son of Fingolfin","Turgon","hall",{kicker:"Second son of Fingolfin",
          desc:"Fingolfin's second son. His wife Elenwë was lost in the crossing of the Ice; their daughter Idril was saved. In later years he went to Nevrast, and then in secret to Gondolin.",
          a:onP(150,50),b:onP(210,50),dayText:"Walking in the town"}),
        L(4,"Aredhel Ar-Feiniel","Aredhel","west-steading",{kicker:"The White Lady of the Noldor",
          desc:"Sister of Fingon and Turgon, tall and strong, pale-skinned and dark-haired, always clad in white and silver. She loved to ride and hunt in the forests.",
          a:land(-200,22),b:land(-470,-10),dayText:"Riding out to hunt in the western woods"}),
      ],
      soldierNames:{0:"Guard of the King's House",1:"One of Fingon's folk",2:"Lakewarden",3:"Grey-elf of Mithrim"},
      soldierNotes:{3:"One of the Grey-elves who dwelt in Mithrim before the Noldor came."},
      townsfolk:[
        {role:"water",name:"Water-bearer",count:12,text:"Fetching water from the lake, or from the wells of the town, the steadings and the market."},
        {role:"merchant",name:"Trader",text:"Trading at a market, in the town or by the lake."},
        {role:"lore",name:"Loremaster",count:3,text:"A loremaster of the Noldor, who remembers Valinor."},
        {role:"gardener",name:"Gardener",count:8,text:"Making gardens in the new land, in the town and in the steadings."},
        {role:"minstrel",name:"Minstrel",count:3,text:"A singer of the Noldor."},
        {role:"mason",name:"Stonemason",count:7,text:"Building the houses of the new town and the steadings."},
        {role:"citizen",name:"Elf of Fingolfin's people",text:"One of the Noldor who came over the Grinding Ice."},
        {role:"lamplighter",name:"Lamplighter",count:6,text:"Lighting the lamps of the court, the quays, the market and the steadings."},
      ],
      citizens:{count:56,sprites:["citizen","citizen","water","merchant","gardener","minstrel"]},
      // locals: people set at places of their own out on the land (a townsfolk sprite, or a quarter's soldier)
      locals:[
        {sprite:"citizen",count:3,spread:30,name:"Fisher",kicker:"The Fishers' Huts",house:"fishers",desc:"A fisher of the lake, out in a boat at dawn and mending nets by day.",
          a:land(FISH[0]-40,FISH[1]-6),b:land(FISH[0]+40,FISH[1]-6),home:land(FISH[0],FISH[1]-10),dayText:"Mending nets by the water"},
        {soldier:3,count:4,spread:50,name:"Grey-elf of Mithrim",kicker:"The Grey-elves' Village",house:"sindar-village",desc:"One of the Grey-elves who dwelt in Mithrim before the Noldor came.",
          a:land(SINDAR[0]-20,SINDAR[1]),b:land(SINDAR[0]+20,SINDAR[1]+10),home:land(SINDAR[0],SINDAR[1]),dayText:"Going about the village"},
        {sprite:"citizen",count:4,spread:80,name:"One of the host",kicker:"The Encampment of the Host",house:"encampment",desc:"One of Fingolfin's people, still living in the camp while the town is built.",
          a:land(HOST[0]-50,HOST[1]),b:land(HOST[0]+50,HOST[1]-10),home:land(HOST[0],HOST[1]),dayText:"Living in the camp until the town is built"},
        {sprite:"water",count:2,spread:40,name:"Water-bearer of the camp",kicker:"The Encampment of the Host",house:"encampment",
          a:land(HOST[0],HOST[1]),b:land(HOST[0]+10,shoreZ(HOST[0]+10)-4),home:land(HOST[0],HOST[1]),dayText:"Carrying water up from the lake to the camp"},
        {sprite:"mason",count:2,spread:60,name:"Builder",kicker:"The Encampment of the Host",house:"encampment",
          a:land(HOST[0]-80,HOST[1]-50),b:land(HOST[0]-20,HOST[1]-60),home:land(HOST[0],HOST[1]),dayText:"Cutting timber for the new houses"},
        {sprite:"gardener",count:4,spread:70,name:"Farmer",kicker:"The First Fields",house:"fields",desc:"Breaking new fields about the lake.",
          a:land(-200,-220),b:land(-150,-300),home:land(STEAD.north[0],STEAD.north[1]),dayText:"Working the first fields"},
        {sprite:"gardener",count:3,spread:60,name:"Farmer",kicker:"The First Fields",house:"fields",desc:"Breaking new fields about the lake.",
          a:land(330,-230),b:land(380,-120),home:land(STEAD.east[0],STEAD.east[1]),dayText:"Working the first fields"},
        {sprite:"mason",count:2,spread:12,name:"Boatwright",kicker:"The Waterside",house:"waterside",desc:"A builder of boats for the lake.",
          a:land(-112,shoreZ(-112)-6),b:land(-90,shoreZ(-90)-5),home:land(-112,shoreZ(-112)-24),dayText:"Mending a boat by the boathouse"},
        {sprite:"lore",count:1,name:"Steward of the steading",kicker:"The Western Steading",house:"west-steading",desc:"Keeps the records and the stores of the Western Steading.",
          a:land(WEST_GREEN[0]-6,WEST_GREEN[1]),b:land(WEST_GREEN[0]+6,WEST_GREEN[1]),home:land(WEST_HALL[0],WEST_HALL[1]),dayText:"On the green before the great hall"},
        {sprite:"citizen",count:5,spread:40,name:"Elf of the steading",kicker:"The Western Steading",house:"west-steading",
          a:land(WEST_GREEN[0]-20,WEST_GREEN[1]+6),b:land(WEST_GREEN[0]+20,WEST_GREEN[1]+6),home:land(WEST_HALL[0],WEST_HALL[1]),dayText:"Going about the Western Steading"},
        {sprite:"minstrel",count:1,name:"Singer",kicker:"The Lakeside Market",house:"market",
          a:land(MARKET[0]-6,MARKET[1]+24),b:land(MARKET[0]+6,MARKET[1]+24),home:land(MARKET[0],MARKET[1]-32),dayText:"Singing by the market"},
      ],
      guards:[
        {district:0,onText:"Keeping the king's court",offText:"Off duty in the King's House",
          posts:[0,1,2,3].map(k=>{ const b=k*90+45, q=P(b,34); return {post:V(q.x,q.z),barracks:onP(0,48),act:{kind:"circle",R:34,b}}; })},
        {district:1,onText:"Keeping the head of the lake road",offText:"Off duty among Fingon's folk",
          posts:[-1,1].map(s=>{ const a=P(180+s*3,edgeS-10), b=P(180+s*3,edgeS-22); return {post:V(a.x,a.z),barracks:onP(90,48),act:{kind:"pace",a:V(a.x,a.z),b:V(b.x,b.z)}}; })},
        {district:2,onText:"Keeping the quays",offText:"Off duty in the Lakewardens' hall",
          posts:[[-90,-30],[30,90]].map(([x0,x1])=>({post:v3(x0,QUAY_Y,shoreZ(x0)-1.5),barracks:onP(180,48),act:{kind:"pace",a:v3(x0,QUAY_Y,shoreZ(x0)-1.5),b:v3(x1,QUAY_Y,shoreZ(x1)-1.5)}}))},
        {district:3,onText:"Keeping watch on the west side of the town",offText:"Resting in the village",
          posts:[{post:land(SINDAR[0]+40,SINDAR[1]),barracks:land(SINDAR[0],SINDAR[1]+10),act:{kind:"pace",a:land(SINDAR[0]+40,SINDAR[1]),b:land(SINDAR[0]+70,SINDAR[1]-20)}}]},
        {district:2,onText:"Keeping the beacon tower",offText:"Resting in the tower",
          posts:TOWERS.filter(t=>t[2]).map(([x,z])=>({post:land(x+7,z),barracks:land(x,z),act:{kind:"pace",a:land(x+7,z-4),b:land(x+7,z+6)}}))},
        {district:0,onText:"Keeping watch on the road",offText:"Resting in the watchtower",
          posts:TOWERS.filter(t=>!t[2]).slice(0,3).map(([x,z])=>({post:land(x+6,z),barracks:land(x,z),act:{kind:"pace",a:land(x+6,z-5),b:land(x+6,z+5)}}))},
        {district:1,onText:"Keeping watch over the camp",offText:"Resting in the camp",
          posts:[{post:land(HOST[0]-60,HOST[1]),barracks:land(HOST[0],HOST[1]),act:{kind:"pace",a:land(HOST[0]-70,HOST[1]-10),b:land(HOST[0]+70,HOST[1]-10)}}]},
      ],
    };
  },
  routines:{
    squareRing:24,
    squareCrowd:[19,28],
    markets:["50:60","50:300"],
    study:{name:"Fingolfin's hall",x0:-3,x1:3,z:6},
    minstrelBearings:[150,210], minstrelRadius:24,
    patrolRing:50,
  },
};
})();
