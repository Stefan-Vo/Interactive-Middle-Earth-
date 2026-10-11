/* Nargothrond: city data for citymaker. Build with:  python build.py nargothrond
   Finrod Felagund's halls delved under the High Faroth on the west bank of the river Narog, as they stood in the last years
   before their fall (about FA 490-495): Orodreth is king, Túrin is the Mormegil, captain of the host, and his great bridge
   spans the Narog from the Doors. Geography follows The Silmarillion and The Children of Húrin: the halls and the Doors on the
   west bank, the High Faroth above them, the Ringwil falling into Narog at Nargothrond, Talath Dirnen, the Guarded Plain, across
   the river, and Amon Ethir a league to the east. The carved face of the halls, the terrace before the Doors, the stair up the
   cliff and the steadings on the plain are this map's interpretation. North is up the river (which flows south).
   A cliff city: the engine's summit is the terrace before the Doors, and its western half lies buried under the Faroth.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_NAR="The Silmarillion, ch. 13, “Of the Return of the Noldor”", S_BEL="The Silmarillion, ch. 14, “Of Beleriand and its Realms”";
const S_BL="The Silmarillion, ch. 19, “Of Beren and Lúthien”", S_TUR="The Silmarillion, ch. 21, “Of Túrin Turambar”";
const S_COH="The Children of Húrin, ch. 10, “Túrin in Nargothrond”", S_FALL="The Children of Húrin, ch. 11, “The Fall of Nargothrond”";
const S_IDX="The Silmarillion, Index of Names";
const MAP="This is the map's interpretation.";
const DEG=Math.PI/180;
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const hash=(i,k)=>{ const v=Math.sin(i*127.1+k*311.7)*43758.5453; return v-Math.floor(v); };   // scatter that is the same every load
const at=(b,r)=>[r*Math.sin(b*DEG),-r*Math.cos(b*DEG)];

// the terrace before the Doors: longer north to south, along the foot of the cliff
const SUMMIT={radius:80,waves:[[2,.25,Math.PI/2],[5,.02,1.3]]};
const edge=b=>{ const t=b*DEG; let v=1; for(const [n,a,p] of SUMMIT.waves) v+=a*Math.sin(n*t+p); return SUMMIT.radius*v; };
const H0=12, LEVEL=0;
// the cliff of the High Faroth: straight behind the terrace, then curving east toward the river up and down the gorge
const cliffX=z=>-34+74*smooth(70,260,Math.abs(z)), FACE=z=>cliffX(z)+2.5;
// the Narog, flowing south down its gorge; the Ringwil comes down a ravine in the Faroth and falls into the gorge north of the Doors
const riverX=z=>128+16*Math.sin(z/280+.5), RW=46, RZ=-200, ringZ=x=>RZ+10*Math.sin(x*.015);
const AMON=[760,40];                                                                       // Amon Ethir, the Hill of Spies
function topY(x,z){ return 88+9*Math.sin(z*.011+x*.007)+5*Math.sin(z*.027-x*.013)+60*smooth(-250,-1000,x); }
// the height of the land, straight from these shapes (much faster than casting a ray at the ground)
function landY(x,z){
  const d=x-riverX(z);
  let y=3+.8*Math.sin(x*.05+z*.031)*(1-smooth(26,120,d))+7*smooth(26,120,d)+.5*smooth(60,200,d)*Math.sin(x*.013+1)*Math.cos(z*.011);   // the gorge floor, rising east to the plain
  y+=36*smooth(95,32,Math.hypot(x-AMON[0],z-AMON[1]));
  const c=smooth(cliffX(z)+2,cliffX(z)-6,x);
  if(c>0){ const cut=24*smooth(15,5,Math.abs(z-ringZ(x))); y=y*(1-c)+c*(topY(x,z)-cut); }   // the Faroth, and the Ringwil's ravine in it
  return y;
}
// Túrin's bridge: from the terrace's edge, level with it, over the Narog to a bridgehead on the east bank
const BR0=edge(90)-4, BR1=202, BRY1=10.5, DECK=x=>H0+(x-BR0)/(BR1-BR0)*(BRY1-H0);
// the stair cut up the cliff north of the Doors, from the terrace to the top of the Faroth
const ST_Z=[-66,-96,-124,-150,-172], ST_TOP=landY(cliffX(-172)-8,-172), stY=z=>H0+(ST_Z[0]-z)/(ST_Z[0]-ST_Z[4])*(ST_TOP-H0), stX=z=>FACE(z)+4;
// out on the land
const HUNT=[-300,-140], MEADS=[70,190], HAMLET=[290,72], MARKET=[262,-66];
const FARMS=[[430,-150],[520,130],[390,230],[630,-70],[560,-300],[310,-330],[700,260],[470,390]];
const TOWERS=[[360,-30,"beacon"],[560,-210],[560,250],[900,40],[330,190]];
const N0=[0,-(edge(0)-10)], S0=[0,edge(180)-10];
const PATHS=[
  {from:"E:90",to:"EAST",points:[[edge(90)-10,0],[BR0,0,H0],[BR1,0,BRY1],[224,0]]},
  {from:"EAST",to:"AMON",points:[[224,0],[330,8],[470,18],[610,30],[AMON[0]-70,AMON[1]],[AMON[0],AMON[1]]]},
  {from:"EAST",to:"MARKET",points:[[224,0],[244,-30],[MARKET[0],MARKET[1]+16]]},
  {from:"EAST",to:"HAMLET",points:[[224,0],[252,34],[HAMLET[0],HAMLET[1]-4]]},
  {from:"EAST",to:"NE",points:[[224,0],[300,-110],[390,-250],[470,-420],[520,-560]]},
  {from:"EAST",to:"SE",points:[[224,0],[310,130],[400,300],[480,460],[530,600]]},
  {from:"E:0",to:"RINGWIL",points:[N0,[0,-edge(0)+.5,H0],[0,-edge(0)-24],[16,-160],[FACE(RZ)+16,RZ+12]]},
  {from:"E:180",to:"MEADS",points:[S0,[0,edge(180)-.5,H0],[0,edge(180)+24],[34,150],MEADS]},
  {from:"J16:0",to:"STAIR",points:[[0,-16],[-14,-40],[stX(-66)+3,-60],...ST_Z.map(z=>[stX(z),z,stY(z)])]},
  {from:"STAIR",to:"FAROTH",points:[[stX(-172),-172,ST_TOP],[cliffX(-172)-12,-174]]},
  {from:"FAROTH",to:"HUNTERS",points:[[cliffX(-172)-12,-174],[-70,-176],[-170,-150],HUNT]},
];
const TRACKS=Object.fromEntries(PATHS.filter(p=>!["EAST","STAIR"].includes(p.to)).map(p=>[p.to,p.points.filter(q=>q.length===2)]));   // drawn on the land (not the bridge or the stair)
const segD=(x,z,pts)=>{ let best=1e9; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)); best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t)); } return best; };
const nearTrack=(x,z,d)=>Object.values(TRACKS).some(t=>segD(x,z,t)<d)||(Math.abs(z)<d+4&&x>190&&x<230);
const settled=(x,z,pad)=>Math.hypot(x-HAMLET[0],z-HAMLET[1])<52+pad||Math.hypot(x-MARKET[0],z-MARKET[1])<44+pad||Math.hypot(x-AMON[0],z-AMON[1])<100+pad
  ||FARMS.some(([fx,fz])=>Math.hypot(x-fx,z-fz)<22+pad)||TOWERS.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<8+pad);
const dryEast=(x,z)=>x>riverX(z)+RW/2+8;

window.CITY={
  id:"nargothrond",
  style:"noldor",                             // Finrod's people built like the other Noldor: styles/noldor.js
  name:"Nargothrond",
  title:"Nargothrond from Above",
  tagline:"Finrod Felagund's halls under the High Faroth, above the river Narog, in the days of Túrin and his bridge",
  footnote:"The halls under the High Faroth, the Doors of Felagund, Túrin's bridge, the Ringwil, Talath Dirnen and Amon Ethir follow The Silmarillion and The Children of Húrin; the carved face of the halls, the terrace, the cliff stair and the steadings on the plain are this map's interpretation.",
  searchPlaceholder:"Search the halls, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand", worldLabel:"The map of Beleriand",
  seed:495,                                   // FA 495, the year Nargothrond fell
  look:{sky:"#c9d6de"},
  camera:{scale:.8, dist:1150, target:[40,22,0], from:112, limit:1300},   // from the east-south-east: the bridge in front, the face of the halls beyond

  terrain:{height:H0, summit:SUMMIT, mountains:{from:99999,to:100001,height:0}, plainFrom:99999, detail:560,
    profile:[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.02,.86],[1.06,.56],[1.11,.28],[1.17,.1],[1.24,.02],[1.3,0]],   // the terrace drops sheer to the gorge floor
    colors:{top:"#d3cbb8",topB:"#c9c1ad",rock1:"#8f887b",rock2:"#6b665d",base:"#6f8a55"},
    shape:landY,
    shelves:[{x:214,z:0,r:12,y:BRY1,side:24}],                                              // the bridgehead on the east bank
    tint:(x,z,y,c)=>{ const CL=cliffX(z), n=.5+.5*Math.sin(x*.045+2*Math.cos(z*.038))*Math.cos(z*.02-x*.01);
      if(x<CL-5){ c.setRGB(.31+.07*n,.42+.08*n,.24+.03*n); const r=Math.abs(z-ringZ(x)); if(r<16) c.lerp(new THREE.Color("#7d776c"),smooth(16,7,r)*.7); }   // the woods of the Faroth
      else if(x>CL+3&&y<60){ c.setRGB(.54-.12*n,.65-.1*n,.39-.09*n); } },               // grass on the gorge floor, the plain and Amon Ethir
    water:{level:LEVEL,bed:-5,color:"#3f6f8c",glow:"#0a1c28",place:"narog",center:[130,0],size:[460,3400],
      rivers:[{points:[...Array(51)].map((_,i)=>{ const z=-1500+i*60; return [riverX(z),z]; }),width:[RW,RW]},
        {points:[[FACE(RZ)+6,RZ],[60,RZ+3],[riverX(RZ)-RW/2+6,RZ+6]],width:[8,10]}],
      pools:[{x:FACE(RZ)+9,z:RZ,r:9}]}},
  walls:false,                                // no wall: the Doors and the cliff were the defence
  fill:{rows:false, yards:false},             // the people of Nargothrond dwelt within; the terrace holds only the wardens' halls
  streets:{
    rings:[],
    avenues:[{b:90,r0:12,w:8,main:true},{b:0,r0:12,w:6,main:true},{b:180,r0:12,w:6,main:true}],
    paths:PATHS,                              // over the bridge, down to the gorge floor, up the cliff stair, and out over the plain
  },
  markets:[{x:MARKET[0],z:MARKET[1],r:14,stalls:10}],   // the Bridgefoot Market, out on the plain
  gate:{bearing:90, channel:false, stair:false},       // the terrace opens east, onto the bridge
  squareStatues:[],

  text:{
    districtKicker:"Among the wardens of the realm",
    storyHeading:"The fall of Nargothrond, FA 495",
    searchHint:"Try a name, such as Túrin or Finduilas.",
    citadel:"the terrace",
    square:"the forecourt before the Doors",
    citizen:"One of the people of Nargothrond, Noldor of Finrod's following and Grey-elves of the west.",
  },

  districts:[
    {id:"d-household",name:"The King's Household",lord:"Orodreth",color:"#c9a227",sector:[330,50],hall:[14,70],motif:"dome",
      heraldry:"Gold and blue",desc:"The household of Orodreth, who became King of Nargothrond after Finrod. The house of Finarfin was known for its golden hair. On this map the household keeps a hall on the terrace beside the Doors. "+MAP,
      fall:"Orodreth rode out with the host and was slain in the battle of Tumhalad.",src:S_TUR},
    {id:"d-plain",name:"The Wardens of the Guarded Plain",lord:"Orodreth, under Túrin's captaincy",color:"#3b6fb0",sector:[50,90],hall:[62,40],motif:"tower",
      heraldry:"Blue and silver",desc:"Talath Dirnen, the Guarded Plain across the river, was watched closely so that none came near Nargothrond unseen. In Túrin's day the Elves of Nargothrond gave up their secrecy and went openly to war, and their wardens rode the plain. "+MAP,
      fall:"The host of Nargothrond was overthrown at Tumhalad, between the Ginglith and the Narog, and Morgoth's army crossed the plain unopposed.",src:S_BEL+"; "+S_TUR},
    {id:"d-bridge",name:"The Bridgewardens",lord:"Orodreth",color:"#9aa4ad",sector:[90,130],hall:[118,40],motif:"arch",
      heraldry:"Silver and grey",desc:"The guard of Túrin's bridge and of the way up to the Doors. "+MAP,
      fall:"The bridge was too mighty to be cast down in time, and the Orcs and the dragon crossed it to the Doors.",src:S_TUR},
    {id:"d-hunters",name:"The Hunters of the Faroth",lord:"Their own captains",color:"#3e7b48",sector:[130,210],hall:[166,70],motif:"tree",
      heraldry:"Green and grey",desc:"Foresters and hunters of the wooded highland above the halls. Grey-elves of the west lived in Finrod's realm as well as Noldor; on this map many of the hunters are Sindar. "+MAP,
      fall:null,src:S_BEL},
  ],

  places(E){ const {THREE,P,H}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z); return {
    "doors":{name:"The Doors of Felagund",kicker:"Nargothrond",alt:"The great doors of the halls",color:"#d8b34a",showAs:"the Doors of Felagund",fixedY:true,
      desc:"The great doors of Nargothrond, opening east from the foot of the High Faroth onto the gorge of the Narog. Finrod was named Felagund, Hewer of Caves, by the Dwarves who helped him delve these halls. On this map the doors stand in a carved face of stone, with a terrace before them.",
      fall:"In FA 495 Glaurung came over the bridge with the Orcs behind him, burst the Doors with fire and went in. He drove out the people, sacked the halls, and gathered all their treasure into the innermost hall, where he lay upon it.",
      src:S_NAR+"; "+S_TUR+"; "+S_FALL,pos:V3(FACE(0)+6,H,0),zoom:140,ring:12,label:V3(FACE(0)+4,H+40,0),tier:1},
    "halls":{name:"The Halls of Nargothrond",kicker:"Nargothrond",alt:"The delved city under the High Faroth",color:"#e6e0d2",fixedY:true,
      desc:"Finrod Felagund found deep caves under the High Faroth beside the Narog and delved there a hidden city after the manner of Thingol's Thousand Caves in Menegroth, with the help of the Dwarves. Here he kept the treasure he had brought from Tirion. The people of Nargothrond dwelt within the rock. On this map the halls show outward only as galleries and windows cut in the cliff.",
      fall:"Under Glaurung the halls stood empty but for the dragon on his hoard. Long after, Mîm the Petty-dwarf sat among the treasure until Húrin came, slew him, and carried the Nauglamír, the Necklace of the Dwarves, out of the ruin to Doriath.",
      src:S_NAR+"; "+S_FALL,pos:V3(FACE(0)+30,H+30,0),zoom:260,ring:0,label:V3(FACE(0)+2,H+72,-36),tier:1},
    "square":{name:"The Forecourt",kicker:"Nargothrond",alt:"The paved court before the Doors",color:"#e6e0d2",
      desc:"A paved court with a fountain, in the middle of the terrace before the Doors. "+MAP,
      fall:"Here, on this map, Glaurung's spell fell on Túrin: he stood unable to move while the captives, Finduilas among them, were driven past him, and then the dragon sent him away north to seek his mother and sister.",
      src:S_TUR+"; "+S_FALL,pos:P(0,0),zoom:120,ring:20,label:P(0,0,H+10),tier:2},
    "bridge":{name:"Túrin's Bridge",kicker:"Nargothrond",alt:"The great bridge over the Narog",color:"#d8d2c2",fixedY:true,
      desc:"At Túrin's counsel a great bridge was built over the Narog from the Doors of Felagund, so that the host could cross swiftly to the war. Gwindor spoke against it. It also showed the enemy where the hidden city lay.",
      fall:"In 495 Gelmir and Arminas brought Ulmo's warning: shut the doors, cast the stones of the bridge into the river. Túrin scorned it. After Tumhalad the bridge could not be broken in time, and Glaurung and the Orcs crossed it to the Doors.",
      src:S_TUR+"; "+S_FALL,pos:V3(130,DECK(130),0),zoom:180,ring:0,label:V3(130,DECK(130)+16,0),tier:1},
    "narog":{name:"The River Narog",kicker:"The Gorge of Narog",alt:"The river of West Beleriand",color:"#5aa8d6",fixedY:true,
      desc:"The Narog rose at the Pools of Ivrin under the Mountains of Shadow and ran south through a deep gorge past Nargothrond, on its way to join the Sirion. Its name was given to Nargothrond, the fortress of the Narog.",
      fall:null,src:S_BEL+"; "+S_IDX,pos:V3(140,LEVEL,-260),zoom:420,ring:0,label:V3(140,16,-260),tier:2},
    "ringwil":{name:"The Falls of Ringwil",kicker:"The Gorge of Narog",alt:"A torrent from the Faroth",color:"#8fc4e0",fixedY:true,
      desc:"The Ringwil was a stream that ran down from the High Faroth into the Narog at Nargothrond. On this map it comes down a ravine in the highland and leaps from the cliff into the gorge north of the Doors.",
      fall:null,src:S_IDX,pos:V3(FACE(RZ)+20,8,RZ),zoom:200,ring:0,label:V3(FACE(RZ)+10,70,RZ),tier:2},
    "faroth":{name:"Taur-en-Faroth",kicker:"The Gorge of Narog",alt:"The wooded highland above the halls",color:"#4f6e3f",fixedY:true,
      desc:"The Faroth, a high wooded country west of the Narog; the halls of Nargothrond were delved beneath the High Faroth, its northern part, where its eastern side falls steep to the river.",
      fall:null,src:S_BEL+"; "+S_IDX,pos:V3(-260,95,40),zoom:700,ring:0,label:V3(-200,140,60),tier:2},
    "stair":{name:"The Cliff Stair",kicker:"The Gorge of Narog",alt:"Steps up the face of the Faroth",color:"#cfc7b4",fixedY:true,
      desc:"A stair cut up the face of the cliff north of the Doors, from the terrace to the woods above, with a watch-post at the top. "+MAP,
      fall:null,src:S_NAR,pos:V3(stX(-120),stY(-120),-120),zoom:200,ring:0,label:V3(stX(-120),stY(-120)+20,-120),tier:2},
    "hunters":{name:"The Hunters' Lodge",kicker:"The Gorge of Narog",alt:"Huts in the woods of the Faroth",color:"#3e7b48",fixedY:true,
      desc:"Round huts around a fire in a clearing of the Faroth, where the foresters and hunters of Nargothrond keep their gear. "+MAP,
      fall:"Before Túrin's time Celegorm and Curufin hunted in these woods with Huan; there they waylaid Lúthien and carried her to Nargothrond.",
      src:S_BL,pos:V3(HUNT[0],landY(HUNT[0],HUNT[1]),HUNT[1]),zoom:200,ring:0,label:V3(HUNT[0],landY(HUNT[0],HUNT[1])+24,HUNT[1]),tier:2},
    "meads":{name:"The Narog Meads",kicker:"The Gorge of Narog",alt:"Orchards and a landing below the terrace",color:"#7fa858",fixedY:true,
      desc:"Orchards on the gorge floor south of the terrace, down a stair from it, with a little landing on the river where boats tie up. "+MAP,
      fall:null,src:S_NAR,pos:V3(MEADS[0]+10,4,MEADS[1]),zoom:220,ring:0,label:V3(MEADS[0]+10,20,MEADS[1]),tier:2},
    "talath-dirnen":{name:"Talath Dirnen",kicker:"The Guarded Plain",alt:"The plain across the river",color:"#9ab868",fixedY:true,
      desc:"The Guarded Plain east of the Narog and north of Nargothrond, kept under close watch so that none came near the halls unseen. In Túrin's day the people of Nargothrond went out openly, and in those years the realm reached far to the east and north. On this map steadings and fields stand on the plain across the bridge.",
      fall:"From the north came Morgoth's host with Glaurung, and the Elves met it on the field of Tumhalad. All the pride of Nargothrond fell there.",
      src:S_BEL+"; "+S_TUR,pos:V3(470,12,60),zoom:700,ring:0,label:V3(470,40,60),tier:1},
    "bridgefoot":{name:"Bridgefoot",kicker:"The Guarded Plain",alt:"A hamlet at the east end of the bridge",color:"#9aa4ad",fixedY:true,
      desc:"A hamlet around a green and a well at the east end of Túrin's bridge. "+MAP,
      fall:null,src:S_TUR,pos:V3(HAMLET[0],12,HAMLET[1]),zoom:170,ring:0,label:V3(HAMLET[0],30,HAMLET[1]),tier:2},
    "market":{name:"The Bridgefoot Market",kicker:"The Guarded Plain",alt:"Stalls, a market hall and storehouses",color:"#d6a32a",fixedY:true,
      desc:"A ring of stalls around a well at the east end of the bridge, with a market hall and two storehouses. Traders set up in the morning and pack away in the evening. "+MAP,
      fall:null,src:S_TUR,pos:V3(MARKET[0],12,MARKET[1]),zoom:150,ring:0,label:V3(MARKET[0],32,MARKET[1]-26),tier:1},
    "farmsteads":{name:"The Farmsteads",kicker:"The Guarded Plain",alt:"Farms and fields on the plain",color:"#c9b45a",fixedY:true,
      desc:"Farms of two to four houses scattered over the plain, each with its fields and hedges. "+MAP,
      fall:null,src:S_BEL,pos:V3(FARMS[0][0],12,FARMS[0][1]),zoom:300,ring:0,label:V3(FARMS[0][0],26,FARMS[0][1]),tier:3},
    "towers":{name:"The Watchtowers",kicker:"The Guarded Plain",alt:"Towers that watch the plain",color:"#e9e6dc",fixedY:true,
      desc:"White towers on the roads across the plain, and a beacon tower near the bridge. In Finrod's day the plain was watched by hidden sentinels; on this map, in Túrin's day of open war, towers keep the watch.",
      fall:null,src:S_BEL,pos:V3(TOWERS[0][0],14,TOWERS[0][1]),zoom:240,ring:0,label:V3(TOWERS[0][0],44,TOWERS[0][1]),tier:2},
    "amon-ethir":{name:"Amon Ethir",kicker:"The Guarded Plain",alt:"The Hill of Spies",color:"#a3b878",fixedY:true,
      desc:"A great mound raised with much labour by Finrod Felagund on the plain a league east of the Doors of Nargothrond, as a watch-hill. On this map a ring of stone and a banner stand on its top.",
      fall:"Years after the fall, Morwen and Nienor came here seeking news of Túrin, and from this hill they saw Glaurung come out of the halls; the dragon's mist and spell scattered their company, and Nienor lost her memory.",
      src:S_TUR,pos:V3(AMON[0],50,AMON[1]),zoom:260,ring:0,label:V3(AMON[0],86,AMON[1]),tier:1},
  }; },
  groups:[["Nargothrond",["doors","halls","square","bridge"]],["The Wardens","@districts"],["The Gorge of Narog",["narog","ringwil","faroth","stair","hunters","meads"]],
    ["The Guarded Plain",["talath-dirnen","bridgefoot","market","farmsteads","towers","amon-ethir"]]],
  reserves(E){ return [[0,0,24]]; },
  // houses out on the plain, in the Noldor style (engine settlements): the hamlet at the bridgefoot, and the farms
  settlements(E){ return [
    {owner:"bridgefoot",district:2,c:HAMLET,r:48,n:15,clear:10,spacing:4,w:[4.4,3],d:[4.4,2],avoid:(x,z)=>nearTrack(x,z,6)},
    ...FARMS.map(([x,z],i)=>({owner:"farmsteads",district:i%2?1:0,c:[x,z],r:18,n:2+i%3,clear:3,spacing:3,w:[4.6,3],d:[4.4,2.2],well:false,green:false,avoid:(x,z)=>nearTrack(x,z,6)})),
  ]; },

  landmarks(E){
    const {THREE,H,P,lam,adder,flat,paveMat,own,instanced,M,OCT,CYL,CONE,UNIT_BOX,BALL,BLOB,goldMat,glowSprite,addWater,addLantern,addHome,addFountainPOI,addGardenPOI,surfaceY,PLACES,
      archGeo,lamp,bridge,waterfall,stair,scatter,huts,track,hall,tower,pier,boat,octWall,waterMat}=E;
    const white=lam("#f6f3ec"), marble=lam("#e6e0d2"), slate=lam("#5f7d98"), gold=goldMat(), blue=lam("#2f5b9a"), leafM=new THREE.MeshPhongMaterial({color:0x5a8a42,flatShading:true,shininess:4});
    const X=FACE(0)+2;                                                                        // the front of the carved face of the halls

    { // the cliffs of the High Faroth: three bands of rock the whole length of the gorge, stepping back as they rise
      const items=[], C=["#8c8476","#7c7568","#978e7f","#6f695e","#857d70"];
      for(let z=-640;z<=640;z+=6){
        const x=FACE(z), s=(cliffX(z+1)-cliffX(z-1))/2, n=Math.hypot(1,s), nx=1/n, nz=-s/n, yaw=Math.atan2(s,1);
        const yb=Math.min(surfaceY(x+6,z),H0)-3, yt=landY(x-10,z)+.6, h=yt-yb, j=hash(z,3)-.5;
        if(h<4) continue;
        [[0,.4,1.2],[.4,.76,.3],[.76,1,-.7]].forEach(([a,b,o],k)=>{ const off=o+j*.9-4.5;
          items.push({m:M(x+nx*off,yb+h*a,z+nz*off,yaw,9,h*(b-a)+.4,6.5),c:C[Math.floor(hash(z,k+5)*C.length)],o:"faroth"}); });
      }
      instanced(UNIT_BOX,lam("#ffffff"),items);
    }

    { // the carved face of the halls: a dressed wall of stone, the Doors under a great arch between pilasters, a colonnade along
      // the foot, three tiers of galleries with lit windows, and banners of Finarfin's house
      const g=new THREE.Group(), add=adder(g), stone=lam("#d9d1bf"), stone2=lam("#cbc2ae"), dark=lam("#1d1a17");
      const light=lam("#2e2a25",{emissive:new THREE.Color("#e8a848")});                       // every window shares one lamp: dark by day, lit at dusk, put out at dawn
      add(UNIT_BOX,stone,X-1.6,H0,0,3.2,64,128);
      add(UNIT_BOX,stone2,X-1.2,H0+64,0,3.4,2,130);                                           // a cornice along the top of the face
      add(archGeo(),stone2,X+.7,H0+1.6,0,16,30,1.4,Math.PI/2);                                // the arch over the Doors
      add(UNIT_BOX,dark,X+.1,H0+1.6,0,.4,27.4,10.2);                                          // the doorway, dark within
      for(const s of [-1,1]){ add(UNIT_BOX,gold,X+.45,H0+1.6,s*5.3,.5,19,.5); add(UNIT_BOX,lam("#8a6a3a"),X+.35,H0+1.6,s*2.6,.3,18.6,5); }   // gilded jambs; the bronze leaves, open
      add(UNIT_BOX,gold,X+.5,H0+20.4,0,.5,.6,11);
      for(const s of [-1,1]){ add(UNIT_BOX,stone2,X+1.2,H0,s*11,2.4,36,3.4); add(UNIT_BOX,marble,X+1.4,H0+36,s*11,2.9,1.4,4.2); add(BALL,gold,X+2.8,H0+33,s*11,.6,.6,.6); }   // the great pilasters
      add(UNIT_BOX,stone2,X+1.2,H0+37.4,0,2.8,3.4,26); add(UNIT_BOX,gold,X+2.65,H0+38.6,0,.12,.7,22);   // the lintel over all, with a gilded band
      for(let i=0;i<4;i++) add(UNIT_BOX,marble,X+1+(4-i)*1.4,H0,0,2.8*(4-i)+.2,(i+1)*.4,16-i);   // steps up to the Doors
      // the colonnade along the foot of the face
      for(let z=-58;z<=58;z+=6.5){ if(Math.abs(z)<17) continue; add(OCT,marble,X+2.4,H0,z,1.2,.8,1.2); add(CYL,stone,X+2.4,H0+.8,z,.85,13,.85); add(UNIT_BOX,marble,X+2.4,H0+13.8,z,2,.6,2); }
      for(const s of [-1,1]){ add(UNIT_BOX,stone2,X+1.9,H0+14.4,s*39,4.2,1.8,44); add(UNIT_BOX,stone,X+1.4,H0+16.2,s*39,3.4,.6,44.6); }
      // the galleries: a ledge with a balustrade, and a row of arched windows above it
      [H0+22,H0+36,H0+50].forEach((y,t)=>{ const skip=t<2?14:0;
        for(const [z0,z1] of skip?[[-56,-skip],[skip,56]]:[[-56,56]]){ const len=z1-z0, zc=(z0+z1)/2;
          add(UNIT_BOX,stone2,X+1.2,y-.8,zc,2.4,.8,len);
          for(let z=z0+.6;z<=z1;z+=1.6) add(UNIT_BOX,marble,X+2.2,y,z,.35,1.1,.35);
          add(UNIT_BOX,marble,X+2.2,y+1.1,zc,.45,.25,len); }
        for(let z=-52;z<=52;z+=6.5){ if(Math.abs(z)<skip+3) continue;
          add(UNIT_BOX,light,X+.05,y+.6,z,.3,6,2.6); add(archGeo(),stone2,X+.35,y+.2,z,4.2,8,.6,Math.PI/2); } });
      for(let z=-48;z<=48;z+=8) add(UNIT_BOX,light,X+.05,H0+58.5,z,.3,2.4,1.4);              // small high windows under the cornice
      addLantern(add(UNIT_BOX,light,X+.05,H0+58.5,52,.3,2.4,1.4),X+8,0);
      for(const s of [-1,1]){ add(UNIT_BOX,blue,X+.4,H0+20,s*16,.15,22,3.6); add(UNIT_BOX,gold,X+.45,H0+20.6,s*16,.16,.6,3.8); add(UNIT_BOX,gold,X+.5,H0+42,s*16,.4,.4,4.4); }   // long banners: blue and gold
      own("halls",g);
      // the Doors themselves, clickable on their own
      const d=new THREE.Group(), addD=adder(d);
      addD(UNIT_BOX,lam("#2a241e"),X+.3,H0+1.6,0,.3,19,10); own("doors",d);
      for(let k=0;k<40;k++) addHome(X+4,-4+(k%9));                                            // the people of Nargothrond dwell within: they go in at the Doors
    }

    { // the forecourt: paving, an approach to the Doors, a fountain, trees in tubs, lanterns
      const g=new THREE.Group(), add=adder(g);
      const disc=new THREE.CircleGeometry(22,96); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#ece6d8",3),H+.03));
      const ap=new THREE.PlaneGeometry(-16-X,18); ap.rotateX(-Math.PI/2); const apm=flat(ap,paveMat("#e4ddcc",2),H+.02); apm.position.x=(X-16)/2; g.add(apm);   // the paved way from the court to the Doors
      octWall(add,marble,0,H,0,6.4,1.3,.8);
      addWater(add(OCT,waterMat(),0,H,0,6,1.1,6).material);
      add(CYL,white,0,H,0,.7,4.6,.7); add(CONE,gold,0,H+4.6,0,.5,1.8,.5);
      addFountainPOI(0,7.5);
      [30,150,210,330].forEach(b=>{ const q=P(b,19.5); add(OCT,marble,q.x,H,q.z,.9,.9,.9); add(BLOB,leafM,q.x,H+3,q.z,1.9,2.4,1.9); add(CYL,lam("#6a5a48"),q.x,H+.9,q.z,.18,1.4,.18); });
      [60,120,240,300].forEach(b=>{ const q=P(b,21); lamp(add,q.x,H,q.z,4.2); });
      own("square",g);
    }

    { // the terrace: a parapet along its rim, two gardens, the pylons at the head of the bridge, the stairs down at either end
      const g=new THREE.Group(), add=adder(g), stone=lam("#d9d1bf");
      for(const [b0,b1] of [[5,84],[96,175],[185,200],[340,355]]) for(let b=b0;b<b1;b+=2.4){ const r=edge(b)-.8, [x,z]=at(b+1.2,r);
        add(UNIT_BOX,stone,x,H,z,2*r*Math.sin(1.2*DEG)+.15,1.1,.6,-(b+1.2)*DEG); }
      for(const s of [-1,1]){ const gz=s*44, gx=48;
        const disc=new THREE.CircleGeometry(8.5,40); disc.rotateX(-Math.PI/2); const lawn=flat(disc,paveMat("#9fb878",2),H+.04); lawn.position.set(gx,H+.04,gz); g.add(lawn);
        for(let k=0;k<6;k++){ const a=k/6*Math.PI*2+.4; add(BLOB,leafM,gx+Math.cos(a)*6,H+2.6,gz+Math.sin(a)*6,1.7,2.2,1.7); add(CYL,lam("#6a5a48"),gx+Math.cos(a)*6,H,gz+Math.sin(a)*6,.16,1.2,.16); }
        addGardenPOI(gx,gz,7); }
      for(const s of [-1,1]){ add(UNIT_BOX,marble,BR0-2,H,s*6,2.4,9,2.4); add(CONE,gold,BR0-2,H+9,s*6,1.2,2.6,1.2); }
      for(const s of [-1,1]){ const r0=s<0?edge(0):edge(180), zt=s*(r0-.5), zb=s*(r0+24);    // the stairs down to the gorge floor, north and south
        stair(add,[0,H0,zt],[0,surfaceY(0,zb),zb],6,{steps:22}); }
      own("square",g);
    }

    { // Túrin's bridge, with pylons at its eastern head
      const g=new THREE.Group(), add=adder(g);
      bridge(add,[BR0,0],[BR1,0],{y0:H0,y1:BRY1,w:9,span:18,cutwaters:true,waterLevel:LEVEL,lampEvery:36});
      for(const s of [-1,1]){ add(UNIT_BOX,marble,BR1+2,BRY1,s*6.5,2.6,10,2.6); add(CONE,gold,BR1+2,BRY1+10,s*6.5,1.3,2.8,1.3); add(UNIT_BOX,blue,BR1+3.4,BRY1+3,s*6.5,.12,6,1.8); }
      own("bridge",g);
    }

    { // the Ringwil: a stream down its ravine in the Faroth, a fall from the cliff, a pool and a short run to the Narog
      const g=new THREE.Group(), add=adder(g), w=lam("#4a7d9a",{emissive:new THREE.Color("#0f2a3a")}); addWater(w);
      { const pos=[], idx=[];                                                                  // the stream: one ribbon of water along the floor of the ravine
        for(let x=cliffX(RZ)-1,i=0;x>-520;x-=5,i++){ const z=ringZ(x), dz=.15*Math.cos(x*.015), l=Math.hypot(1,dz), nx=-dz/l*2.3, nz=1/l*2.3;
          for(const s of [-1,1]) pos.push(x+nx*s,landY(x+nx*s,z+nz*s)+.35,z+nz*s);
          if(i) idx.push(2*i-2,2*i-1,2*i, 2*i-1,2*i+1,2*i); }
        const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setIndex(idx); geo.computeVertexNormals();
        const rib=new THREE.Mesh(geo,w); rib.material.side=THREE.DoubleSide; g.add(rib); }
      const xt=cliffX(RZ)-2, yt=landY(xt-4,ringZ(xt-4))+.3;
      waterfall(add,[xt,yt,RZ],[FACE(RZ)+8,3.2,RZ],7,{cave:false});
      own("ringwil",g);
      addFountainPOI(FACE(RZ)+18,RZ+14);
      scatter({kind:"rock",n:26,area:{x:FACE(RZ)+14,z:RZ,r:30},seed:22,size:[.3,.6],keep:(x,z,y)=>x>FACE(z)+5&&y>LEVEL+.4,owner:"ringwil"});
    }

    { // the cliff stair, a landing at the top and a watch-post on the edge of the Faroth
      const g=new THREE.Group(), add=adder(g);
      const rockStep=lam("#a39d90"), rail=lam("#8e887c");                                    // steps cut as a ledge across the face, not built up from the ground
      for(let i=0;i<ST_Z.length-1;i++){ const z0=ST_Z[i], z1=ST_Z[i+1], n=Math.round(Math.abs(z1-z0)/1.1), yaw=Math.atan2(stX(z1)-stX(z0),z1-z0), len=Math.hypot(stX(z1)-stX(z0),z1-z0)/n+.15;
        for(let k=0;k<n;k++){ const f=(k+.5)/n, z=z0+(z1-z0)*f, x=stX(z0)+(stX(z1)-stX(z0))*f, y=stY(z0)+(stY(z1)-stY(z0))*f;
          add(UNIT_BOX,rockStep,x,y-2.6,z,4.4,2.6,len,yaw); if(k%2===0) add(UNIT_BOX,rail,x+2.1,y,z,.5,1,len*2,yaw); } }
      for(let i=1;i<ST_Z.length;i++){ const z=ST_Z[i]; lamp(add,stX(z)+1.6,stY(z),z,3); }
      const tx=cliffX(-172)-14; tower(add,tx,-186,{r:2.8,h:14,banner:"#3e7b48"});
      own("stair",g);
    }

    { // the Narog Meads: orchards, a landing with boats, water fetched from the river
      const g=new THREE.Group(), add=adder(g), bx=riverX(190)-RW/2;
      pier(add,[bx-4,190],[bx+18,190],{y:.8,w:3.6});
      boat(add,bx+8,193.5,0,{len:7}); boat(add,bx+12,186.4,.1,{len:6,color:"#5a4430"});
      lamp(add,bx-6,surfaceY(bx-6,186),186,3.6);
      own("meads",g);
      addFountainPOI(bx-5,194); addGardenPOI(MEADS[0],MEADS[1],18);
      scatter({kind:"tree",n:60,area:{x:MEADS[0],z:MEADS[1],r:40},seed:31,size:[.7,1],colors:["#6f9a4c","#7fa858","#8aa85a"],keep:(x,z,y)=>x>FACE(z)+8&&x<riverX(z)-RW/2-6&&!nearTrack(x,z,3),owner:"meads"});
    }

    { // the Hunters' Lodge in the woods of the Faroth
      huts({c:HUNT,r:40,n:9,size:3.2,wall:"#7d6e58",thatch:"#8f8a6a",fire:true,seed:61,owner:"hunters",keep:(x,z)=>!nearTrack(x,z,4)});
      const g=new THREE.Group(), add=adder(g);
      for(let k=0;k<3;k++){ const x=HUNT[0]+18+k*3, z=HUNT[1]+16, y=surfaceY(x,z); for(const s of [-1,1]) add(CYL,lam("#6b4a2e"),x,y,z+s*1.4,.1,2.4,.1); add(UNIT_BOX,lam("#8a6a48"),x,y+2.3,z,.12,.12,3); }   // drying racks
      own("hunters",g);
    }

    { // the Bridgefoot Market: a market hall and storehouses behind a ring of stalls (the stalls are the engine's)
      const g=new THREE.Group(), add=adder(g), [mx,mz]=MARKET;
      hall(add,mx,mz-30,{w:26,d:11,h:8,porch:true});
      for(const s of [-1,1]) hall(add,mx+s*32,mz-10,{w:15,d:8,h:6,yaw:Math.PI/2,roof:"#7d6a52"});
      const y=surfaceY(mx,mz), disc=new THREE.CircleGeometry(20,48); disc.rotateX(-Math.PI/2); const pv=flat(disc,paveMat("#e2dac6",3),y+.04); pv.position.set(mx,y+.04,mz); g.add(pv);
      add(OCT,marble,mx,y,mz,2.4,1,2.4); addWater(add(OCT,waterMat(),mx,y+.95,mz,1.9,.1,1.9).material);
      add(CYL,lam("#6a6152"),mx,y,mz,.2,9,.2); add(UNIT_BOX,lam("#c9a227"),mx+1.3,y+6.6,mz,2.4,2,.1);
      [0,90,180,270].forEach(a=>{ const [dx,dz]=at(a+45,18.5); lamp(add,mx+dx,surfaceY(mx+dx,mz+dz),mz+dz,3.8); });
      own("market",g); addFountainPOI(mx,mz+3);
    }

    { // watchtowers on the plain, a beacon by the bridge
      const g=new THREE.Group(), add=adder(g);
      TOWERS.forEach(([x,z,kind])=>tower(add,x,z,kind==="beacon"?{r:4,h:26,beacon:true}:{r:3,h:20,banner:"#3b6fb0"}));
      own("towers",g);
    }

    { // Amon Ethir: a ring of standing stones and a banner on the hill's flat top
      const g=new THREE.Group(), add=adder(g), [ax,az]=AMON, y=surfaceY(ax,az);
      for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; add(UNIT_BOX,lam(k%2?"#cfc7b4":"#bdb5a2"),ax+Math.cos(a)*15,y-.5,az+Math.sin(a)*15,1.6,4.2+hash(k,9)*1.4,1.2,-a); }
      add(CYL,lam("#6a6152"),ax,y,az,.2,14,.2); add(UNIT_BOX,lam("#c9a227"),ax+1.8,y+10.5,az,3.4,2.4,.12);
      own("amon-ethir",g);
    }

    // engine recipes: tracks over the land, fields around the farms, trees and reeds
    const TRACK_OWNER={AMON:"talath-dirnen",MARKET:"market",HAMLET:"bridgefoot",NE:"talath-dirnen",SE:"talath-dirnen",RINGWIL:"ringwil",MEADS:"meads",FAROTH:"stair",HUNTERS:"hunters"};
    Object.entries(TRACKS).forEach(([k,pts])=>{ const p=pts.filter(q=>Math.hypot(q[0],q[1])>edge(Math.atan2(q[0],-q[1])/DEG)+3); if(p.length>1) track(p,{w:["AMON","NE","SE"].includes(k)?5:3.4,owner:TRACK_OWNER[k]}); });
    track([[BR1+2,0],[224,0]],{w:5,owner:"bridge"});
    E.fields({area:{x0:330,x1:820,z0:-480,z1:520},cell:[34,28],seed:37,owner:"farmsteads",
      avoid:(x,z)=>FARMS.every(([fx,fz])=>Math.hypot(x-fx,z-fz)>78)||settled(x,z,10)||nearTrack(x,z,9)});
    scatter({kind:"tree",n:2400,area:{x0:-1100,x1:60,z0:-1100,z1:1100},seed:41,size:[.85,1.35],colors:["#3f6b33","#4f7a3a","#466f36","#5a8442"],
      keep:(x,z,y)=>x<cliffX(z)-9&&Math.abs(z-ringZ(x))>12&&Math.hypot(x-HUNT[0],z-HUNT[1])>44&&!nearTrack(x,z,4)&&Math.hypot(x-(cliffX(-172)-14),z+186)>8,owner:"faroth"});
    scatter({kind:"pine",n:500,area:{x0:-1300,x1:-380,z0:-1200,z1:1200},seed:43,size:[.8,1.3],keep:(x,z,y)=>Math.abs(z-ringZ(x))>12,owner:"faroth"});
    scatter({kind:"tree",n:140,area:(i,u,v)=>{ const z=-900+u*1800, s=v<.5?-1:1; return [riverX(z)+s*(RW/2+8+v*30),z]; },seed:45,size:[.8,1.2],colors:["#6f9a4c","#7fa858"],
      keep:(x,z,y)=>y>LEVEL+1&&Math.abs(z)>24&&x>FACE(z)+6&&!settled(x,z,2)&&!nearTrack(x,z,4)&&Math.hypot(x-MEADS[0],z-MEADS[1])>44,owner:"narog"});   // trees along the banks
    scatter({kind:"reed",n:300,area:(i,u,v)=>{ const z=-900+u*1800, s=v<.5?-1:1; return [riverX(z)+s*(RW/2-1+v*5),z]; },seed:47,size:[1,1.5],keep:(x,z,y)=>y>LEVEL-.4&&y<2.4&&Math.abs(z)>14,owner:"narog"});
    [[420,-20,40],[600,120,46],[360,330,34],[680,-220,40],[260,-220,30],[880,-160,50],[860,280,50]].forEach(([x,z,r],i)=>
      scatter({kind:"tree",n:Math.round(r*.8),area:{x,z,r},seed:50+i,size:[.9,1.4],keep:(x2,z2)=>dryEast(x2,z2)&&!settled(x2,z2,4)&&!nearTrack(x2,z2,5),owner:"talath-dirnen"}));   // groves on the plain
    scatter({kind:"tree",n:50,area:{x:HAMLET[0],z:HAMLET[1],r:80},seed:58,size:[.8,1.2],keep:(x,z)=>Math.hypot(x-HAMLET[0],z-HAMLET[1])>52&&dryEast(x,z)&&!nearTrack(x,z,5)&&!settled(x,z,-48),owner:"bridgefoot"});
  },

  // the cast. Sprite order: the lords below, then one soldier per district (district order), then the townsfolk (see sprites/cast.txt).
  people(E){
    const {THREE,P,V}=E;
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), land=(x,z)=>v3(x,E.surfaceY(x,z),z), onP=(b,r)=>{ const p=P(b,r); return V(p.x,p.z); };
    const X=FACE(0)+2, DOOR=v3(X+3,H0,0), within={hall:DOOR,nightText:"Within the halls of Nargothrond"};
    const L=(i,name,short,house,o)=>Object.assign({i,name,short,house},within,o);
    return {
      lords:[
        L(0,"Orodreth, King of Nargothrond","Orodreth","doors",{kicker:"King of Nargothrond",
          desc:"Finrod's brother, who once held Tol Sirion and fled from it to Nargothrond when Sauron took the isle. After Finrod's death he became king. He was swayed by Túrin and gave him command of the host.",
          a:v3(X+12,H0,-6),b:v3(X+12,H0,6),dayText:"Before the Doors of Felagund"}),
        L(1,"Finduilas, daughter of Orodreth","Finduilas","square",{kicker:"Daughter of Orodreth",
          desc:"Golden-haired after the manner of Finarfin's house. She had loved Gwindor before he went to the Nirnaeth; when he came back broken from Angband her heart turned to Túrin, who did not see it.",
          a:v3(50,H0,-40),b:v3(50,H0,40),dayText:"Walking in the gardens of the terrace"}),
        L(2,"Gwindor son of Guilin","Gwindor","square",{kicker:"A lord of Nargothrond",
          desc:"Captured at the Nirnaeth Arnoediad, he escaped from the mines of Angband years later, aged as if by many years of mortal Men. He found Túrin with Beleg in Taur-nu-Fuin and brought him to Nargothrond. He spoke against the bridge and against open war, and was not heeded.",
          a:v3(-12,H0,-12),b:v3(-6,H0,-17),dayText:"Sitting in the forecourt, apart"}),
        L(3,"Túrin son of Húrin, the Mormegil","Túrin","bridge",{kicker:"The Black Sword",
          desc:"Túrin came to Nargothrond under a false name and was called Mormegil, the Black Sword, for his sword Gurthang. He went to battle wearing a gilded dwarf-mask from Felagund's armoury. Orodreth gave him command, and for a while the servants of Morgoth were driven out of all the lands between Narog and Sirion.",
          a:v3(BR0+20,DECK(BR0+20),2),b:v3(BR1-12,DECK(BR1-12),2),dayText:"Crossing his bridge over the Narog"}),
        L(4,"Gelmir, messenger of Ulmo","Gelmir","talath-dirnen",{kicker:"Messenger of Ulmo",
          desc:"An Elf of Angrod's people who survived the Dagor Bragollach. In the spring of 495 he came with Arminas to bring Ulmo's warning, which they had from Círdan: shut the Doors and cast down the bridge, for evil was coming. Túrin would not hear it.",
          a:land(330,150),b:land(250,40),dayText:"Coming in haste up the road to the bridge"}),
        L(5,"Arminas, messenger of Ulmo","Arminas","talath-dirnen",{kicker:"Messenger of Ulmo",
          desc:"Gelmir's companion on the errand from Círdan to Nargothrond. Arminas spoke sharply to Túrin, and Túrin answered him with scorn.",
          a:land(336,156),b:land(256,46),dayText:"Coming in haste up the road to the bridge"}),
      ],
      soldierNames:{0:"Guard of the King's Household",1:"Warden of the Guarded Plain",2:"Bridgewarden",3:"Hunter of the Faroth"},
      soldierNotes:{3:"One of the hunters and foresters of the highland above the halls."},
      townsfolk:[
        {role:"water",name:"Water-bearer",count:10,text:"Fetching water from the forecourt fountain, the Ringwil, the river or the wells of the plain."},
        {role:"merchant",name:"Trader",text:"Selling at the Bridgefoot Market across the river."},
        {role:"lore",name:"Loremaster",count:3,text:"One of the loremasters of Nargothrond, who keep the memory of Finrod Felagund."},
        {role:"gardener",name:"Gardener",count:6,text:"Tending the gardens of the terrace, the orchards of the meads or the greens of the plain."},
        {role:"minstrel",name:"Minstrel",count:3,text:"A singer of Nargothrond. Finrod himself was a great harper."},
        {role:"mason",name:"Stonemason",count:5,text:"Keeping the stonework of the halls, the bridge and the houses of the plain in repair."},
        {role:"citizen",name:"Elf of Nargothrond",text:"One of the people of Nargothrond, who dwell within the halls."},
        {role:"lamplighter",name:"Lamplighter",count:5,text:"Lighting the lamps of the forecourt, the bridge, the stair, the plain and the windows of the halls."},
      ],
      citizens:{count:48,sprites:["citizen","citizen","water","merchant","gardener","minstrel"]},
      // locals: people at places of their own out on the land
      locals:[
        {soldier:3,count:5,spread:50,name:"Hunter of the Faroth",kicker:"The Hunters' Lodge",house:"hunters",desc:"A hunter of Nargothrond, out in the woods of the Faroth.",
          a:land(HUNT[0]-60,HUNT[1]+30),b:land(HUNT[0]+90,HUNT[1]-20),home:land(HUNT[0],HUNT[1]),dayText:"Hunting in the woods of the Faroth"},
        {sprite:"gardener",count:6,spread:80,name:"Farmer",kicker:"The Farmsteads",house:"farmsteads",desc:"A farmer of the Guarded Plain.",
          a:land(470,-80),b:land(540,80),home:land(FARMS[1][0],FARMS[1][1]),dayText:"Working the fields of the plain"},
        {sprite:"gardener",count:3,spread:60,name:"Farmer",kicker:"The Farmsteads",house:"farmsteads",desc:"A farmer of the Guarded Plain.",
          a:land(380,260),b:land(460,350),home:land(FARMS[7][0],FARMS[7][1]),dayText:"Working the fields of the plain"},
        {sprite:"citizen",count:5,spread:40,name:"Elf of Bridgefoot",kicker:"Bridgefoot",house:"bridgefoot",
          a:land(HAMLET[0]-20,HAMLET[1]+6),b:land(HAMLET[0]+20,HAMLET[1]-6),home:land(HAMLET[0],HAMLET[1]),dayText:"Going about the hamlet"},
        {sprite:"minstrel",count:1,name:"Singer",kicker:"The Bridgefoot Market",house:"market",
          a:land(MARKET[0]-6,MARKET[1]+24),b:land(MARKET[0]+6,MARKET[1]+24),home:land(HAMLET[0],HAMLET[1]),dayText:"Singing by the market"},
        {soldier:1,count:2,spread:16,name:"Watcher on Amon Ethir",kicker:"Amon Ethir",house:"amon-ethir",desc:"Keeping watch over the plain from Finrod's Hill of Spies.",
          a:land(AMON[0]-10,AMON[1]-8),b:land(AMON[0]+10,AMON[1]+8),home:land(TOWERS[3][0],TOWERS[3][1]),dayText:"Watching the plain from the Hill of Spies"},
        {sprite:"citizen",count:2,spread:20,name:"Boatman",kicker:"The Narog Meads",house:"meads",desc:"Keeps the boats at the little landing on the Narog.",
          a:land(MEADS[0]+20,MEADS[1]),b:land(riverX(190)-RW/2-4,186),home:DOOR,dayText:"Tending the boats at the landing"},
      ],
      guards:[
        {district:0,onText:"Guarding the Doors of Felagund",offText:"Within the halls",
          posts:[-1,1].map(s=>({post:v3(X+6,H0,s*9),barracks:DOOR,act:{kind:"pace",a:v3(X+6,H0,s*8),b:v3(X+6,H0,s*16)}}))},
        {district:2,onText:"Keeping Túrin's bridge",offText:"Off duty in the Bridgewardens' hall",
          posts:[[BR0+6,BR0+30],[BR1-6,BR1-30]].map(([a,b],k)=>({post:v3(a,DECK(a),k?3:-3),barracks:onP(118,40),act:{kind:"pace",a:v3(a,DECK(a),k?3:-3),b:v3(b,DECK(b),k?3:-3)}}))},
        {district:1,onText:"Keeping watch from a tower on the plain",offText:"Resting in the watchtower",
          posts:TOWERS.slice(0,4).map(([x,z])=>({post:land(x+7,z),barracks:land(x,z),act:{kind:"pace",a:land(x+7,z-5),b:land(x+7,z+5)}}))},
        {district:3,onText:"Keeping the watch-post at the top of the cliff stair",offText:"Resting at the Hunters' Lodge",
          posts:[{post:land(cliffX(-172)-10,-180),barracks:land(HUNT[0],HUNT[1]),act:{kind:"pace",a:land(cliffX(-172)-10,-176),b:land(cliffX(-172)-10,-196)}}]},
      ],
    };
  },
  routines:{
    squareRing:16,
    squareCrowd:[8,19],
    markets:[],
    study:{name:"the halls of Nargothrond",x0:-22,x1:-14,z:-12},
    minstrelBearings:[60,120,0,180], minstrelRadius:18,
    patrolRing:30,
  },
};
})();
