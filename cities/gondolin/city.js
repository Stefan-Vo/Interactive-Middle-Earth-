/* Gondolin: city data for citymaker.
   The engine (citymaker/engine) draws any city from a file like this one. Build with:  python build.py gondolin
   Everything here is specific to Gondolin: the lore, the districts (the Twelve Houses), the landmarks, the cast and their texts.
   The plain string fields at the top (id, name, title, tagline, footnote, searchPlaceholder) are read by build.py: keep them simple "strings". */
(function(){
const S_SIL="The Silmarillion, ch. 15–16 & 23", S_LT="The Book of Lost Tales II, “The Fall of Gondolin”", S_UT="Unfinished Tales, “Of Tuor and his Coming to Gondolin”";
// the towers: four great and four lesser in the citadel around the square, and one beside each house's hall on the middle level
const at=(b,r)=>[r*Math.sin(b*Math.PI/180),-r*Math.cos(b*Math.PI/180)], angD=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
const AVE=[45,105,180,255,315,15,75,135,165,195,225,285,345];
const GREAT=[75,140,220,285].map(b=>at(b,47)), LESSER=[122,162,198,238].map(b=>at(b,37));
function houseTower([hb,hr]){ let best=hb, bs=-1;
  for(const off of [-7.5,7.5,-10,10,-5,5,-2.5,2.5]){ const b=(hb+off+360)%360, sc=Math.min(...AVE.map(a=>angD(a,b))); if(sc>bs){ bs=sc; best=b; } }
  const r=hr>150?hr:angD(best,hb)<5?hr+19:hr+13; return {b:best,r,xz:at(best,r)}; }
const SITES=[{id:"cloister",b:30,r:186,W:50,D:30},{id:"lore",b:90,r:186,W:46,D:30},{id:"song",b:150,r:176,W:38,D:28,dz:-4},
  {id:"fountains",b:210,r:186,W:50,D:30},{id:"crafts",b:330,r:186,W:50,D:28}];   // the great buildings of the third level: bearing, radius, width, depth
const siteW=(st,x,z)=>{ const c=Math.cos(st.b*Math.PI/180), sn=Math.sin(st.b*Math.PI/180), [qx,qz]=at(st.b,st.r); return [qx+x*c-z*sn,qz+x*sn+z*c]; };   // local (x along, z inward) to world
const GREAT_HALL=at(0,122);                                                  // the Great Hall, on the level of the Houses north of the palace
const SUMMIT={radius:262,waves:[[3,.04,.4],[5,.03,1.3],[9,.015,2.1]]};   // widened: the city climbs in four walled levels
const edge=b=>{ const t=b*Math.PI/180; let v=1; for(const [n,a,p] of SUMMIT.waves) v+=a*Math.sin(n*t+p); return SUMMIT.radius*v; };
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const EDGE_S=edge(180), STAIR_Z=EDGE_S*1.42;                                 // the gate, and the foot of the great stair
// the Hidden Way: a ravine through the Encircling Mountains south of the city, shut by the Seven Gates
const HW=192, HU=[Math.sin(HW*Math.PI/180),-Math.cos(HW*Math.PI/180)], HN=[-HU[1],HU[0]];
const wig=s=>22*Math.sin((s-880)*.011), wigD=s=>22*.011*Math.cos((s-880)*.011);
const hwAt=s=>[HU[0]*s+HN[0]*wig(s),HU[1]*s+HN[1]*wig(s)], hwFloor=s=>4+Math.max(0,s-900)*.04;
const GATES=[1040,1100,1160,1220,1280,1340,1400];                           // the seventh (steel, nearest the city) first, out to the first (wood)
function mountain(x,z){ const d=Math.hypot(x,z), a=Math.atan2(z,x);          // the engine's ring of mountains, for cutting the ravine into it
  return Math.max(0,smooth(900,1350,d)*(160+60*Math.sin(a*7+1)+40*Math.sin(a*13+d*0.012)+30*Math.sin(x*0.013)*Math.cos(z*0.011))); }
function ravine(x,z){ const s=x*HU[0]+z*HU[1]; if(s<860) return 0;
  const lat=Math.abs(x*HN[0]+z*HN[1]-wig(s)), k=smooth(42,20,lat), wide=smooth(150,45,lat)*.6, f=(k+(1-k)*wide)*smooth(860,960,s); if(f<=0) return 0;
  return -f*Math.max(0,mountain(x,z)-hwFloor(s)); }   // a sheer-sided cut, in a broader notch, so the gates can be seen
// streams from the snows of the mountains across Tumladen to a mere, and a brook out of it back under the mountains
const MERE=at(132,560);
const STREAMS=[[at(25,880),at(38,770),at(58,660),at(84,575),at(108,548),MERE],
  [at(286,870),at(266,745),at(242,655),at(214,628),at(190,640),at(168,618),at(150,590),MERE],
  [MERE,at(146,650),at(146,750),at(150,905)]];
const BRIDGE=[at(190,620),at(190,660)];                                      // where the road crosses the western stream
const ROAD=[[0,STAIR_Z+8],at(186,420),at(189,560),at(190,612),at(190,668),at(191,800),...[960,1000,1060,1120,1180,1240,1300,1360,1420,1460].map(hwAt)];

window.CITY={
  id:"gondolin",
  style:"noldor",                             // how the city is built: styles/noldor.js
  name:"Gondolin",
  title:"Gondolin from Above",
  tagline:"Ondolindë, the Hidden City, on the hill of Amon Gwareth in the vale of Tumladen",
  footnote:"Tolkien never drew a street plan of Gondolin. The names and stories come from his writings; where things sit on this map is an interpretation.",
  searchPlaceholder:"Search houses, lords, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand", worldLabel:"The map of Beleriand",
  seed:510,                                   // FA 510, the year of the Fall. Changing it lays the city out differently.
  look:{sky:"#bcd3e2"},

  // the hill: a flat summit of this radius, its outline wobbled by sine waves [count, amount, phase]; mountains ring the plain
  terrain:{height:34, summit:SUMMIT, mountains:{from:900,to:1350,height:160}, detail:400, fine:1500,
    shape:ravine,                                                             // the Hidden Way cut through the mountains
    water:{level:-2.2,bed:-5.5,color:"#4a86a8",glow:"#0d2a3a",place:"streams",size:[3200,3200],
      rivers:[{points:STREAMS[0],width:[6,12]},{points:STREAMS[1],width:[6,12]},{points:STREAMS[2],width:[12,6]}],pools:[{x:MERE[0],z:MERE[1],r:44}]}},
  camera:{limit:1480},                                                        // room to pan out to the Seven Gates
  // walled levels: each radius is a wall, and the ground inside it is one level higher
  levels:{height:7, radii:[88,158,218], ramp:12},
  // ring roads [radius, width] and avenues (bearing b, starting radius r0, width w; main = a great avenue)
  streets:{
    rings:[[72,5],[146,4.5],[206,4]],
    avenues:[45,105,180,255,315].map(b=>({b,r0:22,w:b===180?9:6.5,main:true}))
      .concat([15,75,135,165,195,225,285,345].map(b=>({b,r0:62,w:4,main:false}))),
    paths:[{from:"E:180",to:"HIDDEN-WAY",points:[[0,EDGE_S-10],[0,EDGE_S-1,34],[0,STAIR_Z],...ROAD.slice(0,3),ROAD[3],[...at(190,628),1.8],[...at(190,652),1.8],...ROAD.slice(4)]}],
  },
  fill:{gap:1.55, yards:{courts:9,gardens:10}},   // roomier rows, and more gardens and courtyards in every house's quarter
  gate:{bearing:180, channel:true},            // the Great Gate faces south; a water channel runs down its avenue
  squareStatues:[[45,19.5,"square"],[135,19.5,"square"],[225,19.5,"square"],[315,19.5,"square"]],   // [bearing, radius, owner place]

  text:{
    districtKicker:"One of the Twelve Houses",
    storyHeading:"In the Fall, FA 510",
    searchHint:"Try a lord's name, such as Glorfindel or Ecthelion.",
    citadel:"the citadel",
    square:"the Square of the King",
    citizen:"One of the Gondothlim, going about the city.",
  },

  // the districts: the Twelve Houses. sector = [from, to] bearings; hall = [bearing, radius]; motif = the hall's style
  districts:[
 {id:"house-king",name:"House of the King",lord:"Turgon",color:"#b3373f",sector:[345,15],hall:[0,190],motif:"spire",
  heraldry:"White, gold and red; the moon, the sun and the scarlet heart",
  desc:"The King's own household and guard, quartered around the palace on the north side of the summit. Their arms were the most splendid in the city.",
  fall:"They held the ground around the King until the end. Many died with Turgon when his tower fell.",src:S_LT},
 {id:"house-mole",name:"House of the Mole",lord:"Maeglin",color:"#34343b",sector:[15,45],hall:[30,118],motif:"low",
  heraldry:"Sable; moleskin worn over their caps of steel",
  desc:"Maeglin, the King's nephew, led this house of miners and metal-workers. He found rich ore in the Encircling Mountains and grew powerful in the city. He wanted Idril for himself and hated Tuor.",
  fall:"Captured in the mountains, Maeglin saved his own life by revealing the city to Morgoth. During the assault he tried to seize Idril and her son Eärendil. Tuor threw him from the walls, and his body fell down the stony sides of Amon Gwareth.",src:S_SIL+"; "+S_LT},
 {id:"house-swallow",name:"House of the Swallow",lord:"Duilin",color:"#4b4a8c",sector:[45,75],hall:[60,118],motif:"tower",
  heraldry:"Feathered fans upon their helms",
  desc:"Duilin's people were archers, known for sharp eyes and fast, accurate shooting.",
  fall:"They shot from the walls at the first assault. Duilin fell in the fighting.",src:S_LT},
 {id:"house-arch",name:"House of the Heavenly Arch",lord:"Egalmoth",color:"#3b7dc1",sector:[75,105],hall:[90,118],motif:"arch",
  heraldry:"Sky blue, set with gems",
  desc:"Egalmoth's people dressed in the colors of the sky, and their arms were set with gems.",
  fall:"Egalmoth lived through the Fall. He fought his way out of the burning city at the head of a remnant.",src:S_LT},
 {id:"house-pillar",name:"House of the Pillar",lord:"Penlod",color:"#9aa4ad",sector:[105,135],hall:[120,118],motif:"pillar",
  heraldry:"The pillar",
  desc:"One of the two houses led by Penlod, who was said to be the tallest of the Gondothlim.",
  fall:"Penlod was killed defending the city.",src:S_LT},
 {id:"house-snow",name:"House of the Tower of Snow",lord:"Penlod",color:"#d6e2ec",sector:[135,165],hall:[150,118],motif:"snowtower",
  heraldry:"The tower of snow",
  desc:"The second house under Penlod. Its people fought alongside the House of the Pillar.",
  fall:"They suffered heavy losses beside the Pillar in the defense of the city.",src:S_LT},
 {id:"house-wing",name:"House of the Wing",lord:"Tuor, son of Huor",color:"#6f98c6",sector:[165,195],hall:[190,118],motif:"wing",
  heraldry:"White; swans' wings upon their helms",
  desc:"Tuor's own following. Tuor came to Gondolin as a messenger of Ulmo, married Idril, the King's daughter, and became one of the great lords of the city.",
  fall:"The House of the Wing guarded Idril and Eärendil. Its survivors escaped with Tuor through Idril's secret way.",src:S_LT+"; "+S_UT},
 {id:"house-tree",name:"House of the Tree",lord:"Galdor",color:"#3e7b48",sector:[195,225],hall:[210,118],motif:"tree",
  heraldry:"Green",
  desc:"Galdor's house was one of the largest in the city. Its people dressed in green.",
  fall:"Galdor survived the Fall and helped guard the survivors as they escaped.",src:S_LT},
 {id:"house-flower",name:"House of the Golden Flower",lord:"Glorfindel",color:"#d6a32a",sector:[225,255],hall:[240,118],motif:"dome",
  heraldry:"Gold, with the golden flower",
  desc:"Glorfindel's house wore gold, and he himself was known for his golden hair.",
  fall:"While escaping, the survivors were ambushed at Cirith Thoronath, the Eagles' Cleft. Glorfindel fought a Balrog on the narrow path, and they fell into the abyss together. Thorondor, lord of the Eagles, recovered his body, and the survivors buried him under a cairn.",src:S_SIL+"; "+S_LT},
 {id:"house-fountain",name:"House of the Fountain",lord:"Ecthelion",color:"#a7bccb",sector:[255,285],hall:[270,118],motif:"pool",
  heraldry:"Silver and diamond",
  desc:"Ecthelion's house wore silver and diamond. He was known for his voice and his flute.",
  fall:"Ecthelion killed Gothmog, Lord of Balrogs, in the Square of the King. They fell into the King's fountain together and both drowned.",src:S_SIL+"; "+S_LT},
 {id:"house-harp",name:"House of the Harp",lord:"Salgant",color:"#7b5ea8",sector:[285,315],hall:[300,118],motif:"rotunda",
  heraldry:"The harp",
  desc:"Salgant's house. Its lord was remembered as a coward, though his people were brave.",
  fall:"Salgant would not fight. His people, ashamed of him, went to the defense of the city without him.",src:S_LT},
 {id:"house-hammer",name:"House of the Hammer of Wrath",lord:"Rog",color:"#8e3f2c",sector:[315,345],hall:[330,118],motif:"forge",
  heraldry:"The hammer and anvil",
  desc:"The house of the smiths and craftsmen. Many of them were Noldor who had escaped slavery in Morgoth's mines.",
  fall:"Rog led them against the Balrogs and drove them back for a while. Rog and his whole house were killed.",src:S_LT},
],

  // places in the Explore list. Every city needs "walls" and "gate"; the rest are its own.
  places(E){ const {THREE,P,H,edgeR,edgeS}=E; return {
   "tower":{name:"Tower of the King",kicker:"The Citadel",alt:"Turgon's palace on the summit of Amon Gwareth",lord:"Turgon, High King of the Noldor",color:"#d8b34a",
    desc:"Turgon's palace stood at the heart of the city, and its white tower rose above every other roof in Gondolin. From the top you could see all of Tumladen and the Encircling Mountains around it. For almost four centuries the King ruled here in secret.",
    fall:"When Morgoth's army broke into the city, Turgon refused to flee. He stayed in his tower until it was thrown down, and he died in the ruins.",src:S_SIL,
    showAs:"the Tower of the King",pos:P(0,47),zoom:175,ring:31,label:P(0,47,H+62),tier:1},
   "square":{name:"Square of the King",kicker:"The Citadel",alt:"The great fountain before the palace",color:"#4f9fcf",
    desc:"A wide square of white stone in front of the palace, with a tall fountain in the middle. The images of the Two Trees stood at its northern edge, by the palace doors.",
    fall:"Ecthelion of the Fountain fought Gothmog, Lord of Balrogs, here. Both fell into the King's fountain and perished.",src:S_SIL,
    pos:P(0,0),zoom:120,ring:28,label:new THREE.Vector3(0,H+19,0),tier:2},
   "trees":{name:"Glingal and Belthil",kicker:"The Citadel",alt:"Images of the Two Trees of Valinor",color:"#e8bf3a",
    desc:"By the palace doors stood two trees that Turgon made in memory of the Two Trees of Valinor. Golden Glingal recalled Laurelin, and Belthil, with its silver blossom, recalled Telperion. They were works of Noldorin craft, not living trees.",
    fall:"They were lost when the city burned.",src:S_SIL+"; "+S_LT,
    pos:P(0,22),zoom:75,ring:16,label:P(0,22,H+13),tier:3},
   "spires":{name:"The White Towers",kicker:"The Citadel",alt:"Towers around the Square of the King",color:"#f4f1ea",showAs:"the White Towers",
    desc:"Gondolin was remembered as a city of white towers: when Tuor first saw it, it shone white on its hill above the green plain. On this map four great towers and four lesser ones ring the Square of the King, with the King's tower rising above them all. Their number and places are the map's interpretation.",
    fall:"In the Fall the dragons of fire and iron came up the hill and the city burned; the King's own tower was the last to fall.",src:S_SIL+"; "+S_UT+"; "+S_LT,
    fixedY:true,pos:P(0,10),zoom:260,ring:0,label:P(140,47,H+116),tier:2},
   "house-towers":{name:"The Towers of the Houses",kicker:"The Citadel",alt:"A tower beside each house's hall",color:"#d8b34a",showAs:"the Towers of the Houses",
    desc:"On this map each of the Twelve Houses raised a tower beside its hall, roofed in the house's colors and flying its banner, so that from the walls you can tell the quarters apart. The towers are the map's interpretation.",
    fall:null,src:S_LT,fixedY:true,pos:P(0,0),zoom:420,ring:0,label:P(60,106,H+62),tier:3},
   "bridges":{name:"The Sky-bridges",kicker:"The Citadel",alt:"Bridges high between the towers",color:"#e6e0d2",showAs:"the Sky-bridges",fixedY:true,
    desc:"On this map seven slender bridges join the towers of the citadel in a crescent round the south side of the Square of the King, high above the avenues, so that one may walk from tower to tower without coming down. They are the map's interpretation of a city famed for the skill of its builders.",
    fall:null,src:S_LT,pos:P(180,38,H+40),zoom:230,ring:0,label:P(180,36,H+58),tier:2},
   "cloister":{name:"The Great Cloister",kicker:"The Great Buildings",alt:"Arcaded courts around a garden",color:"#e6e0d2",
    desc:"A great quadrangle on the third level: ranges of white halls under slate roofs, arcades round a garden court with a fountain, domed pavilions at the corners and a gatehouse facing the citadel. On this map the Gondothlim walk and talk here among the flowers. It is the map's invention.",
    fall:null,src:S_LT,pos:P(30,186),zoom:170,ring:0,label:P(30,186,H+30),tier:2},
   "lore":{name:"The House of Lore",kicker:"The Great Buildings",alt:"A library under a golden dome",color:"#d8b34a",
    desc:"Where the loremasters of Gondolin keep the books and the memory of Valinor: a cloister of studies around a court, a reading hall under a golden dome, and a slender tower of the lore-masters. The Noldor were the most learned of the Elves; this building is the map's invention.",
    fall:null,src:S_SIL,pos:P(90,186),zoom:170,ring:0,label:P(90,186,H+40),tier:2},
   "song":{name:"The Court of Song",kicker:"The Great Buildings",alt:"An open theatre for music",color:"#a7bccb",
    desc:"Tiers of white seats curve round a stage with a two-storied front of arches, open to the sky. One of Gondolin's names was Ondolindë, the Rock of the Music of Water, and Ecthelion of the Fountain was the sweetest flute-player of the city; on this map music is heard here on summer evenings. The court is the map's invention.",
    fall:null,src:S_SIL+"; "+S_LT,pos:P(150,180),zoom:160,ring:0,label:P(150,180,H+28),tier:2},
   "fountains":{name:"The Court of Fountains",kicker:"The Great Buildings",alt:"A long canal, jets and a falling wall of water",color:"#4f9fcf",
    desc:"A long canal with leaping jets between shaded colonnades, domed pavilions at either end, and at the back a wall of arches over which water falls into a basin. Gondolin was famed for its fountains; this court is the map's invention.",
    fall:null,src:S_SIL,pos:P(210,186),zoom:170,ring:0,label:P(210,186,H+28),tier:2},
   "crafts":{name:"The Hall of Crafts",kicker:"The Great Buildings",alt:"The great hall of the smiths of the Hammer of Wrath",color:"#8e3f2c",
    desc:"A great aisled hall with a high clerestory, a domed apse and twin towers on its front, where the smiths and craftsmen of the Hammer of Wrath show their work. Many of them were Noldor who had escaped from Morgoth's mines. The hall is the map's invention.",
    fall:"Rog led the Hammer of Wrath against the Balrogs in the Fall, and all his house were slain.",src:S_LT,pos:P(330,186),zoom:170,ring:0,label:P(330,186,H+38),tier:2},
   "great-hall":{name:"The Great Hall of the Gondothlim",kicker:"The City",alt:"A round hall under a golden dome",color:"#e2b437",showAs:"the Great Hall",
    desc:"On this map a great round hall stands on the middle level north of the palace: a ring of columns around a tall drum with high windows, under a dome of gold ribbed with white stone and crowned with a lantern. Here the Gondothlim gather for their feasts and councils. Tolkien tells of the King's halls and the city's fair buildings but not of this one; it is the map's invention.",
    fall:"The feast of the Gates of Summer was held on the eve of the Fall. The people kept watch through the night to sing as the sun rose, and saw instead a red light in the north, where Morgoth's host was coming over the mountains.",src:S_LT,
    pos:P(0,122),zoom:170,ring:22,label:P(0,122,H+50),tier:1},
   "hidden-way":{name:"The Hidden Way and the Seven Gates",kicker:"Walls and Hill",alt:"Orfalch Echor, the ravine through the Encircling Mountains",color:"#aab4be",fixedY:true,
    desc:"The only way into Tumladen was the Hidden Way: a tunnel from the dry bed of an old river, then a deep ravine, the Orfalch Echor, climbing through the Encircling Mountains and shut by seven gates in turn, of wood, of stone, of bronze, of writhen iron, of silver, of gold, and last the Great Gate of steel, whose warden was Ecthelion. Tuor came this way with Voronwë, and from the last gate he saw Gondolin shining white across the plain. On this map the ravine opens south of the city; its course and the look of the gates are the map's interpretation.",
    fall:"In the Fall many who fled made for the Hidden Way and were caught and slain; those who lived went with Idril and Tuor by her secret tunnel instead.",src:S_UT+"; "+S_SIL,
    view:new THREE.Vector3(...(()=>{ const q=hwAt(1180); return [q[0],60,q[1]]; })()),pos:new THREE.Vector3(...(()=>{ const q=hwAt(1180); return [q[0],20,q[1]]; })()),zoom:330,ring:0,
    label:new THREE.Vector3(...(()=>{ const q=hwAt(1220); return [q[0],90,q[1]]; })()),tier:1},
   "streams":{name:"The Streams of Tumladen",kicker:"Walls and Hill",alt:"Brooks from the mountain snows, and a mere",color:"#4a86a8",fixedY:true,
    desc:"On this map brooks come down from the snows of the Encircling Mountains and wind across the green plain to a mere east of the road, and a stream runs from the mere back under the mountains. Tolkien says only that Tumladen was a smooth green plain; the streams are the map's interpretation.",
    fall:null,src:S_SIL,pos:new THREE.Vector3(MERE[0],0,MERE[1]),zoom:520,ring:0,label:new THREE.Vector3(MERE[0],24,MERE[1]),tier:2},
   "gate":{name:"The Great Gate and Stair",kicker:"Walls and Hill",alt:"Entrance to the city from the plain",color:"#e9e3d3",
    desc:"Visitors crossed Tumladen from the Hidden Way, where they passed the Seven Gates of wood, stone, bronze, iron, silver, gold and steel. Then they climbed the hill to the city gate. On this map the gate faces south, toward the Hidden Way: two tall towers flank it under a great arch crowned with the King's emblems of moon, sun and scarlet heart, its golden doors stand open, and banners of the Twelve Houses line the stair.",
    fall:"The enemy did not come this way. Morgoth's army came over the northern mountains, where few guards were watching, and broke through the walls with dragons of fire and iron.",src:S_SIL+"; "+S_UT,
    pos:P(180,edgeS-2),zoom:120,ring:15,label:P(180,edgeS-2,H+21),tier:1},
   "walls":{name:"The White Walls",kicker:"Walls and Hill",alt:"Gondobar, the City of Stone",color:"#f4f1ea",
    desc:"White stone walls with towers enclosed the whole leveled summit of Amon Gwareth. Turgon built the city in memory of Tirion in Valinor, and the Elves said it could compare even with Tirion. On this map the city also rises in three walled levels toward the palace; that part is the map's invention, not Tolkien's.",
    fall:"On the night of the Gates of Summer feast, the people stood on these walls to watch the sun rise. Instead they saw a red light over the mountains in the north. Morgoth's army had arrived.",src:S_SIL,
    pos:P(0,0),zoom:470,ring:0,label:P(100,edgeR(100)-2,H+13),tier:3},
   "idril":{name:"Idril's House and the Secret Way",kicker:"Walls and Hill",alt:"Idril Celebrindal, daughter of Turgon",color:"#d9a520",
    desc:"Idril, the King's daughter, sensed danger coming. She had a secret tunnel dug from her house, under the walls, and far out beneath the plain. Few people knew of it, and Maeglin never learned about it. Nobody knows exactly where her house stood; this map puts it near the south wall.",
    fall:"Tuor and Idril led the survivors through the tunnel and across the plain to the mountains, with Eärendil among them. Many who fled the other way, toward the main road out of the valley, were caught and killed.",src:S_SIL+"; "+S_LT,
    showAs:"Idril's house",view:P(166,340),pos:P(172,236),zoom:300,ring:9,label:P(172,236,H+12),tier:3},
   "caragdur":{name:"Caragdûr",kicker:"Walls and Hill",alt:"The black precipice on the north side of the hill",color:"#3e3b38",
    desc:"Gondolin executed people by throwing them from this cliff. Eöl, Maeglin's father, threw a poisoned dart at his son and hit Aredhel by mistake. She died, and Eöl was cast down from here.",
    fall:"As he fell, Eöl cursed Maeglin to die the same way. Years later, during the Fall, Tuor threw Maeglin from the walls.",src:S_SIL,
    fixedY:true,pos:P(7,edgeR(7)*1.06,H*0.6),zoom:120,ring:12,label:P(7,edgeR(7)*1.08,H+4),tier:2},
   "amon-gwareth":{name:"Amon Gwareth",kicker:"Walls and Hill",alt:"The Hill of Watch",color:"#9b968c",
    desc:"A steep hill of hard stone in the middle of Tumladen. Its top was leveled flat so the city could be built on it.",
    fall:null,src:S_SIL,fixedY:true,pos:P(0,10),zoom:600,ring:0},
   "tumladen":{name:"Tumladen",kicker:"Walls and Hill",alt:"The Smooth Valley",color:"#86a35f",
    desc:"A wide, level green plain inside the Encircling Mountains (the Echoriath), with Gondolin's hill in the middle. The only way in was the Hidden Way, a hidden path guarded by seven gates.",
    fall:null,src:S_SIL+"; "+S_UT,fixedY:true,pos:P(0,10),zoom:820,ring:0},
  };; },
  groups:[
    ["The Citadel",["tower","square","trees","great-hall","spires","bridges","house-towers"]],
    ["The Great Buildings",["cloister","lore","song","fountains","crafts"]],
    ["The Twelve Houses","@districts"],
    ["Walls and Hill",["gate","hidden-way","walls","idril","caragdur","amon-gwareth","tumladen","streams"]],
  ],
  // ground the generated city keeps clear for the landmarks: [x, z, radius]
  reserves(E){ const q=E.PLACES.idril.pos;
    return [[0,0,29],[0,-45,20],[-18,-42,12],[18,-42,12],[-14,-56,8],[14,-56,8],[0,-32,8],[q.x,q.z,9],
      ...GREAT.map(([x,z])=>[x,z,7.5]),...LESSER.map(([x,z])=>[x,z,5.5]),...E.HOUSES.map(h=>{ const t=houseTower(h.hall); return [t.xz[0],t.xz[1],6.5]; }),[GREAT_HALL[0],GREAT_HALL[1],22.5],
      ...SITES.flatMap(st=>[-1,0,1].map(k=>{ const [x,z]=siteW(st,k*(st.W/2-st.D/2),st.dz||0); return [x,z,st.D/2+3]; }))]; },

  // the city's own landmarks
  landmarks(E){
    const {THREE,H,DEG,P,lam,adder,flat,paveMat,HOUSES,PLACES,angDist,octWall,OCT,octTaper,DISC,BASIN,CURTAIN,CONE,CYL,BALL,UNIT_BOX,PYRAMID,UP,BLOB,
      HDOME,GABLE,curtainMat,sprayMat,waterMat,goldMat,glowSprite,own,LVL,edgeR,cliffJit,scene,addWater,addLantern,reveal}=E;
    /* ---------- Square of the King and the great fountain ---------- */
    (function square(){
      const g=new THREE.Group(), add=adder(g), stone=lam("#f4f1e8"), trim=lam("#e2dccd"), gold=goldMat();
      const W=[];
      // paving: white stone, an outer band, a ring in the colors of the Twelve Houses (each arc faces its own quarter),
      // and a sixteen-point star of gold and blue inlay around the fountain
      const flatRing=(r0,r1,c,o,y,ts,tl)=>{ const geo=new THREE.RingGeometry(r0,r1,120,1,ts||0,tl||Math.PI*2); geo.rotateX(-Math.PI/2); g.add(flat(geo,paveMat(c,o),H+y)); };
      const disc=new THREE.CircleGeometry(27,120); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#eee9dc",3),H+.03));
      flatRing(24.2,27,"#e3dccb",4,.04);
      flatRing(15,16.4,"#cdc4ad",4,.04);
      HOUSES.forEach(h=>{ const b1=h.sector[0]+30; flatRing(16.7,18.3,h.color,5,.05,(90-b1)*DEG+.02,30*DEG-.04); });
      for(let k=0;k<16;k++){ const b=k*22.5, q=P(b,12.6), s=new THREE.Mesh(new THREE.PlaneGeometry(k%2?.35:.55,k%2?4.6:5.6).rotateX(-Math.PI/2),paveMat(k%2?"#8fb0c8":"#d8b34a",6));
        s.position.set(q.x,H+.06,q.z); s.rotation.y=-b*DEG; s.receiveShadow=true; g.add(s); }
      flatRing(10.2,10.7,"#d8b34a",6,.06);
    
      // the great fountain: an octagonal pool, three bowls with water falling from each, a jet from the top, eight arching jets from the rim
      octWall(add,stone,0,H,0,10.4,1.5,.9);
      octWall(add,trim,0,H+1.5,0,10.45,.3,1.2);
      const pool=add(OCT,waterMat(),0,H,0,10,1.25,10); W.push(pool.material);
      add(OCT,trim,0,H,0,2.7,4.2,2.7);
      add(BASIN,stone,0,H+4.2,0,5.2,1.1,5.2);  W.push(add(DISC,waterMat(),0,H+5.2,0,4.8,.08,4.8).material);
      add(CURTAIN,curtainMat,0,H+1.25,0,5.05,3.95,5.05);
      add(CYL,trim,0,H+5.3,0,.95,3,.95);
      add(BASIN,stone,0,H+8.3,0,3.3,.85,3.3); W.push(add(DISC,waterMat(),0,H+9.05,0,3,.08,3).material);
      add(CURTAIN,curtainMat,0,H+5.28,0,3.2,3.75,3.2);
      add(CYL,trim,0,H+9.15,0,.6,2.4,.6);
      add(BASIN,gold,0,H+11.55,0,1.9,.6,1.9);
      add(CURTAIN,curtainMat,0,H+9.1,0,1.85,2.45,1.85);
      add(CONE,gold,0,H+12.1,0,.5,2.4,.5);
      add(CONE,sprayMat,0,H+12.4,0,.6,4.6,.6);
      for(let k=0;k<8;k++){
        const a=k*Math.PI/4, R=9.6, x=Math.cos(a)*R, z=Math.sin(a)*R;
        add(BALL,gold,x,H+2.2,z,.45,.55,.45);                         // a small gold spout on the rim
        const j=new THREE.Mesh(CONE,sprayMat); j.position.set(x,H+2.4,z); j.scale.set(.26,4.4,.26);
        j.quaternion.setFromUnitVectors(UP,new THREE.Vector3(-Math.cos(a)*.66,.75,-Math.sin(a)*.66).normalize()); g.add(j);
      }
    
      // a ring of columns around the square, open where the avenues and the palace stair come in
      const MAIN=[45,105,180,255,315], ring=[];
      for(let b=42;b<=318.01;b+=6) ring.push(MAIN.some(a=>angDist(a,b)<8)?null:b);
      ring.forEach((b,k)=>{
        if(b===null) return; const q=P(b,25.6);
        add(UNIT_BOX,trim,q.x,H,q.z,1.35,.5,1.35,-b*DEG); add(CYL,stone,q.x,H+.5,q.z,.46,5.9,.46); add(UNIT_BOX,trim,q.x,H+6.4,q.z,1.25,.4,1.25,-b*DEG);
        const nb=ring[k+1];
        if(nb!=null){ const q2=P(nb,25.6), bm=(b+nb)/2, len=Math.hypot(q2.x-q.x,q2.z-q.z)+1.25;
          add(UNIT_BOX,stone,(q.x+q2.x)/2,H+6.8,(q.z+q2.z)/2,len,.9,1.35,-bm*DEG);
          add(UNIT_BOX,gold,(q.x+q2.x)/2,H+7.7,(q.z+q2.z)/2,len,.2,1.45,-bm*DEG); }
      });
      // lanterns
      const lamp=lam("#ffd88a",{emissive:new THREE.Color("#b8741e")}), bronze=lam("#6a6152");
      [75,120,160,200,240,285].forEach(b=>{ const q=P(b,21.5);
        add(UNIT_BOX,trim,q.x,H,q.z,.9,.6,.9); add(CYL,bronze,q.x,H+.6,q.z,.15,4.6,.15);
        { const m=add(UNIT_BOX,lam("#ffd88a",{emissive:new THREE.Color("#b8741e")}),q.x,H+5.2,q.z,.72,.95,.72); addLantern(m,q.x,q.z); } add(CONE,gold,q.x,H+6.15,q.z,.58,.8,.58); });
      // banners of the houses, each on the side of the square that faces its quarter
      HOUSES.forEach(h=>{
        let b=(h.sector[0]+15)%360; if(b===0||b===30||b===330) return; if(b===180) b=190;
        const q=P(b,28.6), yaw=-b*DEG;
        add(CYL,bronze,q.x,H,q.z,.14,11.4,.14); add(BALL,gold,q.x,H+11.6,q.z,.32,.32,.32);
        add(UNIT_BOX,bronze,q.x,H+10.6,q.z,2.5,.14,.14,yaw);
        add(UNIT_BOX,lam(h.color),q.x,H+5.4,q.z,2.1,5.1,.1,yaw);
        add(UNIT_BOX,gold,q.x,H+5.2,q.z,2.12,.25,.12,yaw);
      });
      own("square",g); g.position.y=E.groundY(0)-H;
      W.forEach(addWater);
    })();
    
    /* ---------- Glingal and Belthil ---------- */
    (function trees(){
      const g=new THREE.Group(), stone=lam("#efe9dc"), gold=goldMat(), grass=lam("#6f8f4e");
      [[-13.5,"#efc53f","#7a5608","#b48a3c","rgba(255,210,100,.5)"],[13.5,"#c9d6e2","#2c3a4a","#d5dde4","rgba(205,225,255,.28)"]].forEach(([x,c,em,tr,glow],ti)=>{
        const t=new THREE.Group(), add=adder(t); t.position.set(x,H,-20); g.add(t);
        add(OCT,stone,0,0,0,4.3,1,4.3); add(OCT,gold,0,1,0,4.45,.18,4.45); add(OCT,grass,0,1,0,3.85,.24,3.85);
        const bark=lam(tr);
        add(CYL,bark,0,1,0,.95,5.6,.95);
        for(let k=0;k<4;k++){ const a=k*Math.PI/2+ti*.4, m=new THREE.Mesh(CYL,bark); m.position.set(0,5.4,0); m.scale.set(.42,3.8,.42);
          m.quaternion.setFromUnitVectors(UP,new THREE.Vector3(Math.cos(a)*.6,.8,Math.sin(a)*.6).normalize()); t.add(m); }
        const crown=new THREE.MeshPhongMaterial({color:new THREE.Color(c),emissive:new THREE.Color(em),flatShading:true,shininess:70});
        [[0,10.6,0,4.3],[-3.5,9.3,1.5,3],[3.3,9.5,-1.4,3.1],[1.2,8.7,3.3,2.7],[-1.4,8.9,-3.2,2.8],[0,13.4,.3,2.9],[-2.7,12,-1.6,2.4],[2.6,12.2,1.8,2.4]]
          .forEach(([a,b,cz,s])=>add(BLOB,crown,a,b,cz,s,s,s));
        const bloom=lam(new THREE.Color(c).lerp(new THREE.Color("#ffffff"),.35),{emissive:new THREE.Color(em).multiplyScalar(1.6)});
        for(let k=0;k<16;k++){ const a=k*2.4, r=4.6+(k%3)*.5; add(BALL,bloom,Math.cos(a)*r,7.2+(k%4)*.7,Math.sin(a)*r,.32,.42,.32); }  // hanging blossom
        const gl=glowSprite(glow,24); gl.position.set(0,10.5,0); t.add(gl);
      });
      own("trees",g); g.position.y=E.groundY(0)-H;
    })();
    
    /* ---------- Tower of the King ---------- */
    (function palace(){
      const g=new THREE.Group(), add=adder(g);
      const white=lam("#f6f3ec"), marble=lam("#e6e0d2"), slate=lam("#5c7d99"), gold=goldMat(), glass=lam("#3b4654"), red=lam("#b3373f");
      const leaf=new THREE.MeshPhongMaterial({color:0x4c7d3c,flatShading:true,shininess:4});
      const T=H+2.5, CZ=-45, RX=29, RZ=16;     // T: the top of the terrace the palace stands on
    
      // terrace: two tiers of marble in an oval, a balustrade around the edge, and a grand stair down to the square
      add(DISC,marble,0,H,CZ,RX+1.3,1.1,RZ+1.1);
      add(DISC,white,0,H+1.1,CZ,RX,1.4,RZ);
      for(let i=0;i<5;i++) add(UNIT_BOX,white,0,H,-26.7-i*.6,19-i*.3,(i+1)*.5,.62);
      for(const s of [-1,1]){ add(UNIT_BOX,marble,s*9.8,H,-28.2,1,3.1,3.6); add(OCT,gold,s*9.8,H+3.1,-26.9,.55,.9,.55); add(BALL,gold,s*9.8,H+4.2,-26.9,.45,.45,.45); }
      const N=72, pts=[];
      for(let k=0;k<N;k++){ const a=k/N*Math.PI*2; pts.push([Math.cos(a)*(RX-.45),CZ+Math.sin(a)*(RZ-.45)]); }
      pts.forEach(([x1,z1],k)=>{
        const [x2,z2]=pts[(k+1)%N], mx=(x1+x2)/2, mz=(z1+z2)/2;
        if(mz>-31.5&&Math.abs(mx)<10) return;                      // the opening at the top of the stair
        add(UNIT_BOX,marble,mx,T,mz,Math.hypot(x2-x1,z2-z1)+.1,.85,.32,Math.atan2(-(z2-z1),x2-x1));
        if(k%3===0) add(UNIT_BOX,white,x1,T,z1,.55,1.15,.55);
      });
    
      // the great hall, with a temple front of ten columns facing the square
      add(UNIT_BOX,white,0,T,CZ,32,9,18);
      add(UNIT_BOX,gold,0,T+8.8,CZ,32.4,.25,18.4);
      add(GABLE,slate,0,T+9,CZ,33.5,5.5,19.6);
      for(let i=0;i<10;i++){ const x=-14.4+i*3.2; add(UNIT_BOX,marble,x,T,-33.6,1.5,.5,1.5); add(CYL,white,x,T+.5,-33.6,.6,8,.6); add(UNIT_BOX,marble,x,T+8.5,-33.6,1.4,.5,1.4); }
      add(UNIT_BOX,marble,0,T+9,-34.6,33,1.3,4);
      add(UNIT_BOX,gold,0,T+10.3,-34.6,33.2,.25,4.1);
      add(GABLE,slate,0,T+10.55,-34.6,33.6,5,4.4);
      add(GABLE,marble,0,T+10.95,-32.35,29,3.7,.12);              // the pale face of the pediment
      add(BALL,gold,0,T+12.4,-32.25,1,1,.3);                       // a golden sun on it
      add(CONE,gold,0,T+15.5,-34.6,.5,1.8,.5); for(const s of [-1,1]) add(CONE,gold,s*16.6,T+10.55,-34.6,.45,1.4,.45);
      add(UNIT_BOX,gold,0,T,-35.95,4.2,6.4,.2);                    // golden doors
      for(const s of [-1,1]) for(const z of [-52,-48,-44,-40]) add(UNIT_BOX,glass,s*16.05,T+3,z,.12,3.4,1.4);
    
      // domed wings
      for(const s of [-1,1]){ const x=s*19;
        add(UNIT_BOX,white,x,T,CZ,8,7,10); add(UNIT_BOX,gold,x,T+6.8,CZ,8.3,.25,10.3);
        add(OCT,white,x,T+7,CZ,3.6,2.4,3.6); add(HDOME,slate,x,T+9.4,CZ,3.7,3.9,3.7); add(CONE,gold,x,T+13.2,CZ,.45,2.6,.45);
        for(const z of [-48.5,-45,-41.5]) add(UNIT_BOX,glass,x+s*4.05,T+2.4,z,.12,2.8,1.2);
      }
      // four turrets with the King's banners
      [[20,-35],[-20,-35],[13,-58],[-13,-58]].forEach(([x,z])=>{
        add(OCT,white,x,T,z,1.9,15,1.9); add(OCT,marble,x,T+15,z,2.4,.6,2.4); add(CONE,slate,x,T+15.6,z,2.5,5.5,2.5);
        add(CYL,lam("#8a8378"),x,T+21,z,.1,3.4,.1); add(UNIT_BOX,red,x+1.05,T+23.1,z,2,1.2,.08); add(BALL,gold,x,T+24.5,z,.25,.25,.25);
      });
      // planters with trees on the terrace
      [[26,CZ],[-26,CZ],[6,-58.6],[-6,-58.6]].forEach(([x,z])=>{ add(OCT,marble,x,T,z,1.1,1.2,1.1); add(OCT,gold,x,T+1.2,z,1.15,.15,1.15); add(BLOB,leaf,x,T+2.9,z,1.6,1.8,1.6); });
    
      // the tower: a buttressed base, three tapering octagonal stages with balconies, then an open lantern, a gold dome and a spire
      const TZ=-47; let y=T;
      add(UNIT_BOX,white,0,y,TZ,11,24,11);
      for(const sx of [-1,1]) for(const sz of [-1,1]){ add(CYL,marble,sx*5.5,y,TZ+sz*5.5,1.15,25.5,1.15); add(CONE,gold,sx*5.5,y+25.5,TZ+sz*5.5,1.2,3.4,1.2); }
      add(UNIT_BOX,gold,0,y+24,TZ,11.4,.4,11.4);
      y+=24.4;
      const windows=(r,y0,h,rows)=>{ const ap=r*Math.cos(Math.PI/8)+.06;
        for(let k=0;k<8;k++){ const a=k*Math.PI/4; for(let j=0;j<rows;j++) add(UNIT_BOX,glass,Math.sin(a)*ap,y0+j*(h/rows)+h/rows*.3,TZ+Math.cos(a)*ap,.85,h/rows*.45,.2,a); } };
      const balcony=r=>{ add(OCT,marble,0,y,TZ,r,.7,r); add(OCT,gold,0,y+.55,TZ,r+.08,.16,r+.08);
        for(let k=0;k<16;k++){ const a=k*Math.PI/8; add(UNIT_BOX,white,Math.sin(a)*(r-.35),y+.7,TZ+Math.cos(a)*(r-.35),.6,.85,.6,a); }
        for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,gold,Math.sin(a)*r*.98,y+.7,TZ+Math.cos(a)*r*.98,.28,2.4,.28); }
        y+=.7; };
      const stage=(rb,rt,h,rows)=>{ add(octTaper(rt/rb),white,0,y,TZ,rb,h,rb); windows((rb+rt)/2,y,h,rows); y+=h; };
      stage(5.2,4.8,26,5);
      for(const x of [-1.6,1.6]){ add(UNIT_BOX,red,x,y-14,TZ+4.75,1.5,9,.12); add(UNIT_BOX,gold,x,y-5.2,TZ+4.8,1.8,.35,.16); }  // the King's banners
      balcony(6.7);
      stage(4.3,3.9,20,3); balcony(5.6);
      stage(3.4,3.1,14,2);
      add(OCT,marble,0,y,TZ,4.3,.5,4.3); y+=.5;
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CYL,white,Math.sin(a)*3.4,y,TZ+Math.cos(a)*3.4,.3,5,.3); }
      const beacon=add(BALL,lam("#fff1c4",{emissive:new THREE.Color("#c99a2e")}),0,y+2.4,TZ,1.3,1.3,1.3);
      y+=5; add(OCT,marble,0,y,TZ,4.2,.8,4.2); add(OCT,gold,0,y+.65,TZ,4.28,.16,4.28); y+=.8;
      add(HDOME,gold,0,y,TZ,3.7,4.1,3.7); y+=4;
      add(CYL,gold,0,y,TZ,.9,1.8,.9); y+=1.8;
      add(CONE,gold,0,y,TZ,1.15,16,1.15); y+=16;
      add(BALL,lam("#fff6d8",{emissive:new THREE.Color("#e0b040")}),0,y+.3,TZ,.75,.75,.75);
      const crownGlow=glowSprite("rgba(255,215,120,.6)",12); crownGlow.position.set(0,y+.3,TZ); g.add(crownGlow);
      const lanternGlow=glowSprite("rgba(255,215,120,.45)",10); lanternGlow.position.copy(beacon.position); g.add(lanternGlow);
      PLACES.tower.label.set(0,y+5,TZ);
      own("tower",g); g.position.y=E.groundY(0)-H;
    })();
    
    /* ---------- Idril's house and the secret way ---------- */
    let secretWay;
    (function idril(){
      const g=new THREE.Group(), q=PLACES.idril.pos; g.position.copy(q); g.rotation.y=-172*DEG;
      const add=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;};
      add(UNIT_BOX,lam("#f6f3ec"),0,0,0,10,6,8); add(PYRAMID,lam("#9fb8d3"),0,6,0,11,3.6,9);
      add(CYL,lam("#f6f3ec"),-4,0,-3,1.8,11,1.8); add(CONE,lam("#d9a520"),-4,11,-3,2.3,4,2.3);
      own("idril",g);
      // tunnel: under the wall, down through the hill and out beneath the plain
      const pts=[P(172,236,H+0.6),P(171,edgeR(171)+1,H-6),P(169,edgeR(169)*1.25,4),P(165,420,1),P(161,520,1),P(157,600,1)];
      const curve=new THREE.CatmullRomCurve3(pts);
      const lg=new THREE.BufferGeometry().setFromPoints(curve.getPoints(120));
      secretWay=new THREE.Line(lg,new THREE.LineDashedMaterial({color:0xd9a520,dashSize:4,gapSize:3,depthTest:false,transparent:true}));
      secretWay.computeLineDistances(); secretWay.renderOrder=10; scene.add(secretWay); reveal("idril",secretWay);   // shown while Idril's house is selected
    })();
    
    /* ---------- Caragdûr ---------- */
    (function caragdur(){
      const g=new THREE.Group(), m=lam("#3c3936");
      [[2,1.03,.8],[5,1.06,.6],[8,1.04,.75],[11,1.08,.5],[14,1.05,.65],[6,1.11,.35],[9.5,1.14,.25]].forEach(([b,f,hf],k)=>{
        const s=new THREE.Mesh(CONE,m), q=P(b,edgeR(b)*f*cliffJit(b,7),H*hf-3);
        s.position.copy(q); s.scale.set(2.2+k%3,8+((k*7)%5)*1.6,2.2+((k+1)%3)); s.rotation.z=(k%2?.12:-.1); g.add(s);
      });
      own("caragdur",g);
    })();

    /* ---------- the White Towers of the citadel, and a tower for each of the Twelve Houses ---------- */
    /* ---------- one white tower, for the citadel, the houses and the Great Gate ---------- */
      const m={white:lam("#f6f3ec"),marble:lam("#e6e0d2"),glass:lam("#3b4654"),gold:goldMat(),slate:lam("#5c7d99")};
      // one tower: a plinth, a tapering octagonal shaft with windows and two balconies, an open lantern, a tall roof and a gold finial
      const spire=(add,x,y0,z,o)=>{ const r=o.r, h=o.h, sh=h*.7; let y=y0;
        add(OCT,m.marble,x,y,z,r+1.2,1.6,r+1.2); add(OCT,m.gold,x,y+1.45,z,r+1.26,.18,r+1.26); y+=1.6;
        add(octTaper(.84),m.white,x,y,z,r,sh,r);
        for(let j=0;j<o.rows;j++){ const f=.1+.82*j/o.rows, rr=r*(1-.16*f)*Math.cos(Math.PI/8)+.05;
          for(let k=j%2;k<8;k+=o.thin?2:1){ const a=k*Math.PI/4; add(UNIT_BOX,m.glass,x+Math.sin(a)*rr,y+sh*f,z+Math.cos(a)*rr,.7,Math.min(2.6,sh/o.rows*.5),.18,a); } }
        [.46,1].forEach(f=>{ const rr=r*(1-.16*f)+1.05, yy=y+sh*f; add(OCT,m.marble,x,yy,z,rr,.6,rr); add(OCT,m.gold,x,yy+.48,z,rr+.06,.14,rr+.06);
          for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CONE,m.gold,x+Math.sin(a)*rr*.97,yy+.6,z+Math.cos(a)*rr*.97,.2,1.6,.2); } });
        y+=sh+.6;
        const lr=r*.82, lh=Math.max(3,h*.07);
        for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CYL,m.white,x+Math.sin(a)*lr,y,z+Math.cos(a)*lr,.22,lh,.22); }
        add(OCT,m.gold,x,y+lh*.35,z,lr*.45,lh*.3,lr*.45);
        add(OCT,m.marble,x,y+lh,z,lr+.55,.5,lr+.55); y+=lh+.5;
        add(CONE,o.roof,x,y,z,lr+.7,h*.22,lr+.7); y+=h*.22;
        add(CYL,m.gold,x,y-.6,z,.12,3.4,.12); add(BALL,m.gold,x,y+2.9,z,.38,.38,.38);
        if(o.banner) add(UNIT_BOX,o.banner,x+1.1,y+1.2,z,1.9,1.1,.08);
        return y; };
    (function towers(){
      { // the citadel: four great towers and four lesser ones around the square
        const g=new THREE.Group(), add=adder(g), y0=E.groundY(0);
        GREAT.forEach(([x,z],i)=>{ const top=spire(add,x,y0,z,{r:3.7,h:74+(i%2)*8,rows:8,roof:m.slate,banner:lam("#b3373f")});
          if(i===1) PLACES.spires.label.set(x,top+8,z); });
        LESSER.forEach(([x,z],i)=>spire(add,x,y0,z,{r:2.5,h:50+(i%2)*6,rows:6,thin:true,roof:i%2?m.gold:m.slate}));
        own("spires",g);
      }
      { // the Towers of the Houses: one beside each hall on the middle level, roofed in the house's color
        const g=new THREE.Group(), add=adder(g);
        HOUSES.forEach((h,i)=>{ const t=houseTower(h.hall), c=lam(h.color);
          const top=spire(add,t.xz[0],E.groundY(t.r),t.xz[1],{r:2.8,h:40+(i%3)*5,rows:5,thin:true,roof:c,banner:c});
          if(h.id==="house-swallow") PLACES["house-towers"].label.set(t.xz[0],top+6,t.xz[1]); });
        own("house-towers",g);
      }
    })();

    /* ---------- the sky-bridges: a crescent of bridges from tower to tower round the south of the square ---------- */
    (function bridges(){
      const g=new THREE.Group(), add=adder(g), Y0=E.groundY(0), BY=Y0+26, white=lam("#f6f3ec"), marble=lam("#e6e0d2"), gold=goldMat();
      const T={75:[GREAT[0],3.4],122:[LESSER[0],2.25],140:[GREAT[1],3.4],162:[LESSER[1],2.25],198:[LESSER[2],2.25],220:[GREAT[2],3.4],238:[LESSER[3],2.25],285:[GREAT[3],3.4]};
      const CHAIN=[75,122,140,162,198,220,238,285];
      CHAIN.forEach(k=>{ const [[x,z],r]=T[k]; add(OCT,marble,x,BY-1.2,z,r+1.3,1.2,r+1.3); add(OCT,gold,x,BY,z,r+1.36,.2,r+1.36); });   // a collar where each bridge meets its tower
      for(let i=0;i<CHAIN.length-1;i++){ const [[ax,az],ra]=T[CHAIN[i]], [[bx,bz],rb]=T[CHAIN[i+1]];
        const dx=bx-ax, dz=bz-az, l=Math.hypot(dx,dz), ux=dx/l, uz=dz/l, px=-uz, pz=ux, yaw=Math.atan2(-dz,dx);
        const x0=ax+ux*(ra+1), z0=az+uz*(ra+1), L=l-ra-rb-2, N=Math.max(6,Math.round(L/2.2)), A=Math.min(9,L*.24);
        const rib=t=>BY-1.6-A*(1-Math.sin(Math.PI*t));
        for(let k=0;k<N;k++){ const t0=k/N, t1=(k+1)/N, tm=(t0+t1)/2, cx=x0+ux*L*tm, cz=z0+uz*L*tm, sl=L/N+.06;
          add(UNIT_BOX,marble,cx,BY-.8,cz,sl,.8,3.4,yaw);                                                              // the deck
          for(const sd of [-1,1]){ add(UNIT_BOX,white,cx+px*sd*1.55,BY,cz+pz*sd*1.55,sl,.85,.28,yaw); add(UNIT_BOX,gold,cx+px*sd*1.55,BY+.85,cz+pz*sd*1.55,sl,.12,.36,yaw); }
          const y0=rib(t0), y1=rib(t1), rb2=add(UNIT_BOX,white,cx,(y0+y1)/2-.5,cz,Math.hypot(sl,y1-y0)+.1,1,2.4,yaw); rb2.rotation.z=Math.atan2(y1-y0,L/N);   // the arch beneath
          if(k%2===1){ const yr=rib(tm); if(BY-.8-yr>.6) add(UNIT_BOX,white,cx,yr,cz,.5,BY-.8-yr,2,yaw); } }
        const mx=x0+ux*L/2, mz=z0+uz*L/2; E.lamp(add,mx+px*1.3,BY,mz+pz*1.3,2.4); }
      own("bridges",g);
    })();

    /* ---------- the great buildings of the third level ---------- */
    (function greatBuildings(){
      const white=lam("#f8f5ee"), marble=lam("#e9e3d5"), shade=lam("#d9d2c2"), gold=goldMat(), glass=lam("#33404f"), slate=lam("#5c7d99"), A=E.archGeo();
      const leaf=new THREE.MeshPhongMaterial({color:0x4c7d3c,flatShading:true,shininess:4}), domeM=new THREE.MeshPhongMaterial({color:0xe2b437,shininess:90,emissive:0x3a2a05});
      const FLOWERS=["#d9534f","#f0c419","#9b59b6","#f7f7f2","#e67e22"].map(c=>lam(c));
      const begin=st=>{ const g=new THREE.Group(), [qx,qz]=at(st.b,st.r); g.position.set(qx,E.groundY(st.r),qz); g.rotation.y=-st.b*DEG; return [g,adder(g),(x,z)=>siteW(st,x,z)]; };
      const pave=(g,w,d,x,z,c,o)=>{ const geo=new THREE.PlaneGeometry(w,d); geo.rotateX(-Math.PI/2); const m=flat(geo,paveMat(c,o||2),.04); m.position.x=x||0; m.position.z=z||0; g.add(m); };
      const tree=(add,x,z,s)=>{ add(OCT,marble,x,0,z,.9*s,.9,.9*s); add(BLOB,leaf,x,.9+1.9*s,z,1.7*s,2.1*s,1.7*s); };
      const fountain=(add,x,z,r)=>{ octWall(add,marble,x,0,z,r,1,.6); addWater(add(OCT,waterMat(),x,0,z,r-.3,.85,r-.3).material); add(CYL,white,x,0,z,.4,2.6+r*.4,.4); add(CONE,gold,x,2.6+r*.4,z,.35,1.2,.35); };
      const pavilion=(add,x,z,r,h,dome)=>{ add(OCT,marble,x,0,z,r+.5,.8,r+.5); add(OCT,white,x,.8,z,r,h,r); add(OCT,marble,x,h+.8,z,r+.4,.6,r+.4); add(OCT,gold,x,h+1.3,z,r+.45,.14,r+.45);
        if(dome) add(HDOME,domeM,x,h+1.4,z,r*.95,r*1.05,r*.95); else add(CONE,slate,x,h+1.4,z,r+.5,r*1.6,r+.5); add(CONE,gold,x,h+1.4+(dome?r*1.05:r*1.6),z,.25,1.8,.25); };
      // a quadrangle: four ranges of halls round a court, arcades facing in, pavilions at the corners, a gatehouse facing the citadel (+z)
      const cloister=(g,add,W,D,o)=>{ o=o||{}; const R=5.5, h=o.h||9;
        pave(g,W+2,D+2,0,0,"#ece6d6",2);
        [[0,-D/2+R/2,W,R,1],[0,D/2-R/2,W,R,1],[-W/2+R/2,0,R,D-2*R,0],[W/2-R/2,0,R,D-2*R,0]].forEach(([x,z,w,d,alongX])=>{
          add(UNIT_BOX,white,x,0,z,w,h,d); add(UNIT_BOX,marble,x,h,z,w+.5,.7,d+.5); add(UNIT_BOX,gold,x,h+.7,z,w+.6,.16,d+.6);
          if(alongX) add(GABLE,slate,x,h+.86,z,d+.6,3,w+.6,Math.PI/2); else add(GABLE,slate,x,h+.86,z,w+.6,3,d+.6); });
        for(let x=-W/2+R+1.8;x<W/2-R-1;x+=3.3) for(const sd of [-1,1]){ add(A,marble,x,0,sd*(D/2-R-.3),3.3,6.6,.6); add(UNIT_BOX,glass,x,2.6,sd*(D/2+.03),1,3,.12); add(UNIT_BOX,glass,x,6.2,sd*(D/2+.03),1,1.8,.12); }
        for(let z=-D/2+R+1.8;z<D/2-R-1;z+=3.3) for(const sd of [-1,1]){ add(A,marble,sd*(W/2-R-.3),0,z,3.3,6.6,.6,Math.PI/2); add(UNIT_BOX,glass,sd*(W/2+.03),2.6,z,.12,3,1); }
        for(const sd of [-1,1]){ add(UNIT_BOX,shade,0,6.6,sd*(D/2-R-1.2),W-2*R,.4,2.6); add(UNIT_BOX,shade,sd*(W/2-R-1.2),6.6,0,2.6,.4,D-2*R); }   // the roofs of the arcades
        if(!o.noCorners) for(const sx of [-1,1]) for(const sz of [-1,1]) if(!(o.skip&&o.skip(sx,sz))) pavilion(add,sx*W/2,sz*D/2,3.4,h+4,true);
        add(UNIT_BOX,white,0,0,D/2-R/2,10,h+5,R+1.6); add(UNIT_BOX,marble,0,h+5,D/2-R/2,10.6,.8,R+2.2); add(GABLE,marble,0,h+5.8,D/2-R/2,R+2.2,3.4,10.6,Math.PI/2);   // the gatehouse
        add(A,marble,0,0,D/2+.6,8,12,.9); add(UNIT_BOX,gold,0,1,D/2+.2,4.4,8.4,.2); add(BALL,gold,0,h+7.4,D/2+.9,.8,.8,.2);
        const cw=W-2*R-4, cd=D-2*R-4;                                                                              // the garden court
        pave(g,cw,cd,0,0,"#86ab5c",3); pave(g,cw,2.2,0,0,"#e7e0cc",4); pave(g,2.2,cd,0,0,"#e7e0cc",4);
        fountain(add,0,0,2.6);
        for(const sx of [-1,1]) for(const sz of [-1,1]){ tree(add,sx*cw*.3,sz*cd*.28,1); add(UNIT_BOX,FLOWERS[(sx+1+sz+1)%5],sx*cw*.3,0,sz*cd*.28+sz*-2.4,3.4,.5,.9); } };

      { // the Great Cloister
        const st=SITES[0], [g,add,w]=begin(st); cloister(g,add,st.W,st.D);
        E.addFountainPOI(...w(0,3.4)); E.addGardenPOI(...w(0,0),9); own("cloister",g); }

      { // the House of Lore: a cloister of studies, a reading hall under a golden dome on its far side, and the tower of the lore-masters
        const st=SITES[1], [g,add,w]=begin(st); cloister(g,add,st.W,st.D,{skip:(sx,sz)=>sx<0&&sz<0});
        const rz=-st.D/2+6; add(DISC,white,0,0,rz,8,16,8); add(DISC,marble,0,16,rz,8.6,.9,8.6); add(DISC,gold,0,16.85,rz,8.7,.16,8.7);
        for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; if(Math.cos(a)>.3) continue; add(UNIT_BOX,glass,Math.sin(a)*8.05,10.5,rz+Math.cos(a)*8.05,1.2,4.4,.2,a); }
        add(HDOME,domeM,0,17,rz,8.2,8.4,8.2); for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; for(let j=1;j<6;j++){ const t=j/6*Math.PI/2*.92; add(BALL,marble,Math.sin(a)*(8.2*Math.cos(t)+.12),17+8.4*Math.sin(t),rz+Math.cos(a)*(8.2*Math.cos(t)+.12),.32,.32,.32); } }
        add(OCT,marble,0,25.2,rz,2.2,.6,2.2); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; add(CYL,white,Math.sin(a)*1.7,25.8,rz+Math.cos(a)*1.7,.18,2.6,.18); }
        add(HDOME,domeM,0,28.4,rz,2,1.8,2); add(CONE,gold,0,30,rz,.4,4.6,.4);
        const top=spire(add,-st.W/2+1,0,-st.D/2+3,{r:2.9,h:52,rows:7,thin:true,roof:slate});
        PLACES.lore.label.set(...(()=>{ const [x,z]=w(0,rz); return [x,E.groundY(st.r)+38,z]; })());
        E.addFountainPOI(...w(0,3.4)); E.addGardenPOI(...w(0,0),8); own("lore",g); }

      { // the Court of Song: tiers of seats round a stage with a two-storied front of arches, open to the sky
        const st=SITES[2], [g,add,w]=begin(st), dz=-st.dz; g.rotation.y+=Math.PI;   // turned round: the seats face the citadel, the stage faces out
        const half=new THREE.CircleGeometry(6.2,32,0,Math.PI); half.rotateX(-Math.PI/2); half.rotateY(Math.PI); const orch=flat(half,paveMat("#ece6d6",3),.05); orch.position.z=dz; g.add(orch);
        for(let t=0;t<7;t++){ const r0=6.4+t*1.6, n=Math.ceil(Math.PI*(r0+.8)/1.6);
          for(let k=0;k<n;k++){ const a=(k+.5)/n*Math.PI, ca=Math.cos(a), sa=Math.sin(a), ry=Math.atan2(-ca,-sa);
            add(UNIT_BOX,t%2?white:marble,(r0+.8)*ca,0,dz+(r0+.8)*sa,Math.PI*(r0+.8)/n+.08,(t+1)*.72,1.62,ry); } }
        for(let k=0;k<=18;k++){ const a=k/18*Math.PI, ca=Math.cos(a), sa=Math.sin(a), R=18.2;                    // a colonnade round the top
          add(CYL,white,R*ca,5.04,dz+R*sa,.38,5.4,.38); add(UNIT_BOX,gold,R*ca,10.4,dz+R*sa,.9,.35,.9); }
        for(let k=0;k<18;k++){ const a=(k+.5)/18*Math.PI, ca=Math.cos(a), sa=Math.sin(a), R=18.2; add(UNIT_BOX,marble,R*ca,10.75,dz+R*sa,Math.PI*R/18+.2,.8,1.2,Math.atan2(-ca,-sa)); }
        add(UNIT_BOX,marble,0,0,dz-4.2,26,1.4,6.4);                                                                   // the stage
        add(UNIT_BOX,white,0,0,dz-8.6,30,15,2.4); add(UNIT_BOX,marble,0,15,dz-8.6,30.6,.9,3); add(UNIT_BOX,gold,0,15.9,dz-8.6,30.8,.18,3.1);   // its front of arches, two storeys
        for(let k=-3;k<=3;k++){ add(A,marble,k*4,1.4,dz-7.3,3.6,6.2,.6); add(A,marble,k*4,8,dz-7.3,3.6,6,.6); add(CYL,white,k*4+2,1.4,dz-6.8,.32,13.4,.32); }
        for(const sd of [-1,1]){ add(OCT,marble,sd*9,1.4,dz-3,.8,1.2,.8); add(CONE,lam("#f7f5ef"),sd*9,2.6,dz-3,.55,2.6,.55); add(BALL,gold,sd*9,5.4,dz-3,.4,.4,.4); }   // golden-headed statues on the stage
        for(const sd of [-1,1]) pavilion(add,sd*17,dz-7,3,13,true);
        E.addGardenPOI(...w(0,st.dz-9),8); own("song",g); }

      { // the Court of Fountains: a long canal with jets, colonnades with vines, domed pavilions, a wall of arches with falling water
        const st=SITES[3], [g,add,w]=begin(st);
        pave(g,st.W+2,st.D+2,0,0,"#ece6d6",2); pave(g,st.W-6,st.D-10,0,2,"#86ab5c",3);
        add(UNIT_BOX,marble,0,0,2,40,.9,6.4); addWater(add(UNIT_BOX,waterMat(),0,.1,2,39,.85,5.6).material);
        for(let k=-4;k<=4;k++){ add(CYL,white,k*4.4,.6,2,.25,1.2,.25); if(k%2===0) add(CONE,E.sprayMat,k*4.4,1.6,2,.4,3.4,.4); }
        for(const sd of [-1,1]){ const z=2+sd*7.4;                                                                     // colonnades with vines
          for(let x=-20;x<=20;x+=4){ add(CYL,white,x,0,z,.32,5,.32); add(BLOB,leaf,x,5.4,z,1.6,.9,1.6); }
          add(UNIT_BOX,marble,0,5,z,41,.5,1.2); add(UNIT_BOX,gold,0,5.5,z,41,.12,1.3); }
        for(const sd of [-1,1]) pavilion(add,sd*23,2,3.2,8,true);
        add(UNIT_BOX,white,0,0,-st.D/2+2,30,11,3); add(UNIT_BOX,marble,0,11,-st.D/2+2,30.6,.8,3.6); add(UNIT_BOX,gold,0,11.8,-st.D/2+2,30.8,.16,3.7);   // the wall of arches
        for(let k=-2;k<=2;k++) add(A,marble,k*5.6,0,-st.D/2+3.6,5,9,.7);
        add(UNIT_BOX,marble,0,0,-st.D/2+6,14,.9,4.4); addWater(add(UNIT_BOX,waterMat(),0,.1,-st.D/2+6,13.2,.85,3.8).material);
        E.waterfall(add,[0,10.6,-st.D/2+3.7],[0,1,-st.D/2+6],5,{cave:false});
        for(const sx of [-1,1]) for(const sz of [-1,1]) tree(add,sx*14,2+sz*11.5,.9);
        E.addFountainPOI(...w(0,5.5)); E.addFountainPOI(...w(0,-st.D/2+8.4)); E.addGardenPOI(...w(0,2),10); own("fountains",g); }

      { // the Hall of Crafts: an aisled hall with a clerestory, a domed apse, a front with twin towers, and forge chimneys behind
        const st=SITES[4], [g,add,w]=begin(st), red=lam("#8e3f2c");
        pave(g,st.W+2,st.D+2,0,0,"#e4dccb",2);
        add(UNIT_BOX,white,0,0,0,36,15,12); add(GABLE,slate,0,15,0,12.8,5,37,Math.PI/2); add(UNIT_BOX,gold,0,19.9,0,37,.3,.4);   // the nave
        for(const sd of [-1,1]){ add(UNIT_BOX,shade,0,0,sd*8.5,36,8.5,5); add(UNIT_BOX,slate,0,8.5,sd*8.5,36.4,.5,5.6);           // the aisles
          for(let x=-16;x<=16;x+=4){ add(UNIT_BOX,glass,x,10.6,sd*6.05,1.6,3.2,.15); add(UNIT_BOX,glass,x,3,sd*11.05,1.4,3.6,.15); add(UNIT_BOX,white,x,0,sd*11.4,1.1,8.5,1); } }
        add(DISC,white,19,0,0,6,13,6); add(HDOME,domeM,19,13,0,6.2,5.6,6.2); add(CONE,gold,19,18.4,0,.3,2,.3);           // the apse
        for(const sd of [-1,1]) spire(add,-19,0,sd*5.6,{r:2.6,h:38,rows:5,thin:true,roof:red,banner:red});               // twin towers on the front
        add(UNIT_BOX,white,-18.6,0,0,2,16,8.6); add(A,marble,-19.8,0,0,7,12,.8,Math.PI/2); add(UNIT_BOX,gold,-19.7,1.2,0,.2,7.6,3.6);
        const rose=new THREE.Mesh(new THREE.TorusGeometry(2.1,.35,6,24),gold); rose.position.set(-19.75,13.4,0); rose.rotation.y=Math.PI/2; g.add(rose);
        add(OCT,glass,-19.75,11.3,0,1.8,4.2,.15);
        const ember=lam("#ff8a3d",{emissive:new THREE.Color("#c2410c")});
        for(const sd of [-1,1]){ add(UNIT_BOX,lam("#6a635d"),8,8.5,sd*10,2.4,12,2.4); add(UNIT_BOX,ember,8,20.5,sd*10,2.4,.3,2.4); }
        for(const sd of [-1,1]){ add(OCT,marble,-23,0,sd*9,1,1.2,1); add(CONE,lam("#f7f5ef"),-23,1.2,sd*9,.6,2.8,.6); add(BALL,gold,-23,4.2,sd*9,.42,.42,.42); }
        own("crafts",g); }
    })();

    /* ---------- the Great Hall of the Gondothlim: a round hall under a golden dome, on the middle level north of the palace ---------- */
    (function greatHall(){
      const g=new THREE.Group(), add=adder(g), [cx,cz]=GREAT_HALL, R=18, DR=14.5, DH=22;
      const white=lam("#f8f5ee"), marble=lam("#e9e3d5"), gold=goldMat(), glass=lam("#33404f"), A=E.archGeo();
      const domeM=new THREE.MeshPhongMaterial({color:0xe2b437,shininess:90,emissive:0x3a2a05}), pearl=lam("#f4efe2");
      let y=H;
      [[R+3.4,.8],[R+2.4,.8],[R+1.4,.8]].forEach(([r,h])=>{ add(DISC,marble,cx,y,cz,r,h,r); y+=h; });       // a podium of three round steps
      const y0=y;
      add(DISC,white,cx,y,cz,DR,DH,DR);                                                                      // the drum
      add(DISC,gold,cx,y+DH-1.2,cz,DR+.15,.3,DR+.15);
      for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, r=DR+.08;                                                // tall windows round the clerestory
        add(UNIT_BOX,glass,cx+Math.sin(a)*r,y+13.6,cz+Math.cos(a)*r,1.5,6.2,.2,a); add(A,marble,cx+Math.sin(a)*(r+.25),y+13,cz+Math.cos(a)*(r+.25),2.6,8,.5,a); }
      for(let k=0;k<4;k++){ const a=k*Math.PI/2, r=DR+.1;                                                    // four golden doors, each with a pillared porch
        add(UNIT_BOX,gold,cx+Math.sin(a)*r,y,cz+Math.cos(a)*r,3.8,7.4,.25,a); add(A,marble,cx+Math.sin(a)*(r+.3),y,cz+Math.cos(a)*(r+.3),6,10,.7,a);
        for(const sd of [-1,1]){ const px=cx+Math.sin(a)*(R+2.8)+Math.cos(a)*sd*3.4, pz=cz+Math.cos(a)*(R+2.8)-Math.sin(a)*sd*3.4;
          add(OCT,marble,px,H,pz,1.3,y0-H+.6,1.3); add(CYL,white,px,y0+.6,pz,.75,15,.75); add(CONE,gold,px,y0+15.6,pz,.9,3.2,.9); add(BALL,gold,px,y0+19,pz,.4,.4,.4); } }
      for(let k=0;k<32;k++){ if(k%8===0) continue; const a=k/32*Math.PI*2, x=cx+Math.sin(a)*R, z=cz+Math.cos(a)*R;   // the ring of columns
        add(OCT,marble,x,y,z,.95,.6,.95); add(CYL,white,x,y+.6,z,.58,10.4,.58); add(UNIT_BOX,gold,x,y+11,z,1.3,.5,1.3,a); }
      add(DISC,marble,cx,y+11.5,cz,R+1.2,1.6,R+1.2); add(DISC,gold,cx,y+13.1,cz,R+1.3,.22,R+1.3);            // the entablature and the roof of the colonnade
      for(let k=0;k<32;k++){ const a=(k+.5)/32*Math.PI*2; add(CONE,gold,cx+Math.sin(a)*(R+.9),y+13.3,cz+Math.cos(a)*(R+.9),.22,1.6,.22); }
      y+=DH; add(DISC,marble,cx,y,cz,DR+1.1,1.1,DR+1.1); add(DISC,gold,cx,y+1.05,cz,DR+1.2,.2,DR+1.2); y+=1.25;
      const RX=DR+.5, RY=16;                                                                                  // the golden dome, ribbed with white beads and rings
      add(HDOME,domeM,cx,y,cz,RX,RY,RX);
      for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; for(let j=1;j<9;j++){ const t=j/9*Math.PI/2*.94, r=RX*Math.cos(t)+.18;
        add(BALL,pearl,cx+Math.sin(a)*r,y+RY*Math.sin(t),cz+Math.cos(a)*r,.42,.42,.42); } }
      [.3,.62].forEach(f=>{ const t=f*Math.PI/2, ring=new THREE.Mesh(new THREE.TorusGeometry(RX*Math.cos(t)+.1,.32,6,72),pearl); ring.rotation.x=Math.PI/2; ring.position.set(cx,y+RY*Math.sin(t),cz); g.add(ring); });
      y+=RY;                                                                                                  // the lantern on top, lit, under a small gold dome and a spire
      add(OCT,marble,cx,y-.6,cz,3.4,1.2,3.4); y+=.6;
      for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; add(CYL,white,cx+Math.sin(a)*2.6,y,cz+Math.cos(a)*2.6,.26,4.4,.26); }
      const glow=add(BALL,lam("#fff1c4",{emissive:new THREE.Color("#d8a43a")}),cx,y+2.1,cz,1.3,1.3,1.3); addLantern(glow,cx,cz+R+5);
      const gs=glowSprite("rgba(255,210,120,.5)",14); gs.position.set(cx,y+2.1,cz); g.add(gs);
      y+=4.4; add(OCT,marble,cx,y,cz,3.3,.6,3.3); y+=.6; add(HDOME,domeM,cx,y,cz,3,2.8,3); y+=2.6;
      add(CONE,gold,cx,y,cz,.8,10,.8); add(BALL,lam("#fff6d8",{emissive:new THREE.Color("#e0b040")}),cx,y+10.4,cz,.6,.6,.6);
      PLACES["great-hall"].label.set(cx,y+16,cz);
      for(let k=0;k<8;k++){ const a=(k+.5)/8*Math.PI*2; E.lamp(add,cx+Math.sin(a)*(R+4.6),H,cz+Math.cos(a)*(R+4.6),4); }
      own("great-hall",g); g.position.y=E.groundY(122)-H;
    })();

    /* ---------- the Great Gate: tall towers, a great arch with the King's emblems, golden doors, banners down the stair ---------- */
    (function greatGate(){
      const g=new THREE.Group(), add=adder(g), gz=EDGE_S-2.5, zf=gz+6.4, white=lam("#f6f3ec"), marble=lam("#e6e0d2"), gold=goldMat(), red=lam("#b3373f");
      for(const sd of [-1,1]) spire(add,sd*7,H,gz,{r:5.4,h:46,rows:7,roof:m.slate,banner:red});              // over the gatehouse towers
      add(E.archGeo(),white,0,H,zf,17,24,2.2);                                                                 // the great arch
      add(UNIT_BOX,marble,0,H+24,zf,18.4,3.2,2.8); add(UNIT_BOX,gold,0,H+26.4,zf+1.45,18.6,.5,.2);
      add(UNIT_BOX,marble,0,H+27.2,zf,13,5.4,2);                                                               // the crest: the moon, the sun and the scarlet heart
      add(BALL,lam("#eef2f6"),-4,H+29.9,zf+1,1.7,1.7,.4); add(BALL,gold,4,H+29.9,zf+1,1.7,1.7,.4);
      add(UNIT_BOX,red,0,H+29,zf+1,1.7,1.7,.5).rotation.z=Math.PI/4;
      for(const sd of [-1,1]) add(UNIT_BOX,gold,sd*5.3,H+1.4,zf+2.7,.4,17,5.2);                               // the golden doors, standing open
      const z0=EDGE_S-1, z1=STAIR_Z;
      for(let i=0;i<6;i++){ const f=(i+.7)/6.4, z=z0+f*(z1-z0), y=34*(1-f)+1.1;                              // banners of the Twelve Houses, lamps up the stair
        [-1,1].forEach((sd,k)=>{ const h=HOUSES[(i*2+k)%12]; add(CYL,lam("#8a8378"),sd*5,y,z,.14,9,.14); add(UNIT_BOX,lam(h.color),sd*5.05,y+4.4,z,.12,4,1.9); add(BALL,gold,sd*5,y+9.1,z,.3,.3,.3); });
        if(i%2===0) for(const sd of [-1,1]) E.lamp(add,sd*5,y,z+3.4,3.4); }
      { const fz=z1+14, y=E.surfaceY(0,fz);                                                                    // a court at the foot of the stair, with a fountain and gilded pylons
        const d=new THREE.CircleGeometry(15,48); d.rotateX(-Math.PI/2); const pv=flat(d,paveMat("#ece6d6",3),y+.05); pv.position.set(0,y+.05,fz); g.add(pv);
        octWall(add,marble,0,y,fz,4.4,1.2,.7); addWater(add(OCT,waterMat(),0,y,fz,4.1,1,4.1).material); add(CYL,white,0,y,fz,.5,3.4,.5); add(CONE,gold,0,y+3.4,fz,.4,1.4,.4);
        for(const sd of [-1,1]){ add(OCT,white,sd*11,y,fz,1.5,16,1.5); add(CONE,gold,sd*11,y+16,fz,1.7,4,1.7); }
        E.addFountainPOI(0,fz+5); }
      own("gate",g);
    })();

    /* ---------- the Hidden Way: the Seven Gates across the ravine, the road across Tumladen and its bridge ---------- */
    (function hiddenWay(){
      const g=new THREE.Group(), add=adder(g), A=E.archGeo(), wall=lam("#bdb6a6"), tower=lam("#d6d0c2");
      const KINDS=[["#aab4be","#e6eaee"],["#d8b34a","#f0d78a"],["#d8dee6","#ffffff"],["#3a3a40","#6a6a72"],["#b0753a","#d29a5a"],["#9a958a","#bdb8ad"],["#7a5636","#a07a52"]];   // steel, gold, silver, writhen iron, bronze, stone, wood
      GATES.forEach((s,i)=>{ const [cx,cz]=hwAt(s), d=wigD(s), tx=HU[0]+HN[0]*d, tz=HU[1]+HN[1]*d, tl=Math.hypot(tx,tz), ux=tx/tl, uz=tz/tl, ax=-uz, az=ux, ry=Math.atan2(-az,ax);
        const y=E.surfaceY(cx,cz)-1.5, H2=i===0?30:24, mat=lam(KINDS[i][0],i<3?{emissive:new THREE.Color(KINDS[i][0]).multiplyScalar(.12)}:{}), trim=lam(KINDS[i][1]);
        for(const sd of [-1,1]){ const L=40, off=6+L/2; add(UNIT_BOX,wall,cx+ax*sd*off,y,cz+az*sd*off,L,H2,5,ry); add(UNIT_BOX,trim,cx+ax*sd*off,y+H2,cz+az*sd*off,L,1,5.6,ry); }   // the wall across the ravine
        add(A,mat,cx,y,cz,16,H2,4,ry); add(UNIT_BOX,trim,cx,y+H2,cz,17,1.4,4.6,ry);                                      // the gate's arch, in its own metal
        for(const sd of [-1,1]){ const x=cx+ax*sd*9.6, z=cz+az*sd*9.6; add(CYL,tower,x,y,z,3.2,H2+8,3.2); add(CONE,mat,x,y+H2+8,z,3.8,6,3.8);
          add(UNIT_BOX,mat,cx+ax*sd*5.3-ux*2.6,y+1.5,cz+az*sd*5.3-uz*2.6,.4,(H2-2)*.62,5,ry); }                        // its doors, open toward the city
        const lx=cx-ux*7+ax*7, lz=cz-uz*7+az*7; E.lamp(add,lx,E.surfaceY(lx,lz),lz,3.8); });
      E.bridge(add,BRIDGE[0],BRIDGE[1],{y:1.8,w:6.5,span:13,lamps:false});
      own("hidden-way",g);
      E.track(ROAD,{w:6,color:"#c9b996",owner:"hidden-way"});
    })();

    /* ---------- Tumladen: trees and reeds along the streams and the mere, and groves on the plain ---------- */
    (function tumladen(){
      const nearStream=(x,z,dist)=>STREAMS.some(pts=>pts.some((p,i)=>{ if(!i) return false; const [ax,az]=pts[i-1], [bx,bz]=p, dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)); return Math.hypot(x-ax-dx*t,z-az-dz*t)<dist; }));
      const nearRoad=(x,z,dist)=>ROAD.some((p,i)=>{ if(!i) return false; const [ax,az]=ROAD[i-1], [bx,bz]=p, dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)); return Math.hypot(x-ax-dx*t,z-az-dz*t)<dist; });
      const alongStreams=(i,u,v)=>{ const pts=STREAMS[i%3], k=Math.floor(u*(pts.length-1)), f=u*(pts.length-1)-k, [ax,az]=pts[k], [bx,bz]=pts[Math.min(k+1,pts.length-1)], dx=bx-ax, dz=bz-az, l=Math.hypot(dx,dz)||1, side=v<.5?-1:1, off=9+v*14;
        return [ax+dx*f-dz/l*off*side,az+dz*f+dx/l*off*side]; };
      E.scatter({kind:"tree",n:260,area:alongStreams,seed:71,size:[.8,1.25],colors:["#5f8f45","#6f9a4c","#4f7a3a"],keep:(x,z,y)=>y>-1.4&&Math.hypot(x,z)>420&&!nearRoad(x,z,8),owner:"streams"});
      E.scatter({kind:"reed",n:240,area:(i,u,v)=>{ const pts=STREAMS[i%3], k=Math.floor(u*(pts.length-1)), f=u*(pts.length-1)-k, [ax,az]=pts[k], [bx,bz]=pts[Math.min(k+1,pts.length-1)], dx=bx-ax, dz=bz-az, l=Math.hypot(dx,dz)||1, side=v<.5?-1:1, off=4+v*5;
        return [ax+dx*f-dz/l*off*side,az+dz*f+dx/l*off*side]; },seed:73,size:[.9,1.4],keep:(x,z,y)=>y>-2.6&&y<.6&&!nearRoad(x,z,5),owner:"streams"});
      E.scatter({kind:"reed",n:120,area:(i,u,v)=>{ const a=u*Math.PI*2, r=42+v*9; return [MERE[0]+Math.cos(a)*r,MERE[1]+Math.sin(a)*r]; },seed:75,size:[1,1.5],keep:(x,z,y)=>y>-2.6&&y<.6,owner:"streams"});
      [[at(60,420),60],[at(300,460),70],[at(240,520),50],[at(20,600),60],[at(110,720),50],[at(330,700),60],[at(170,780),40],[at(260,780),50]].forEach(([[x,z],r],i)=>
        E.scatter({kind:"tree",n:Math.round(r*.7),area:{x,z,r},seed:80+i,size:[.9,1.4],keep:(x2,z2,y)=>y>-1&&Math.hypot(x2,z2)>420&&Math.hypot(x2,z2)<880&&!nearStream(x2,z2,10)&&!nearRoad(x2,z2,9),owner:"tumladen"}));
    })();
    
    
  },

  // the cast. Sprite order: the lords (in this list's order), one soldier per district (in district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,levelOff}=E, T=E.groundY(0)+2.5;     // T: the palace terrace
    const lv=v=>{ v.y+=levelOff(v.x,v.z); return v; };
    const ring=(R,b,span)=>({a:lv(P(b-span,R)),b:lv(P(b+span,R))});
    const hall=(house,b)=>({hall:(()=>{ const p=P(b,104); return V(p.x,p.z); })(),
      dayText:"Walking near the hall of the "+PLACES[house].name,nightText:"Asleep in the hall of the "+PLACES[house].name});
    const wing={hall:PLACES.idril.pos.clone(),dayText:"Walking near the House of the Wing",nightText:"At home in Idril's house"};
    const lord=(i,name,short,house,o)=>Object.assign({i,name,short,house},o);
    return {
      lords:[
        lord(0,"Turgon, High King of the Noldor","Turgon","tower",{kicker:"High King of the Noldor",
          desc:"Founder and King of Gondolin. He ruled from the tower at the city's heart for almost four centuries, and the city was kept secret from the world the whole time.",
          a:lv(new THREE.Vector3(-7,H+2.5,-31.4)),b:lv(new THREE.Vector3(7,H+2.5,-31.4)),hall:V(0,-35.6).setY(T),
          dayText:"Holding court on the palace terrace",nightText:"Asleep in the King's tower"}),
        lord(1,"Idril Celebrindal","Idril","idril",Object.assign({kicker:"Daughter of Turgon",
          desc:"Idril Celebrindal, Silver-foot. She foresaw danger before anyone else and had a secret way dug from her house under the walls."},ring(146,169,3),wing)),
        lord(2,"Tuor, son of Huor","Tuor","house-wing",Object.assign({kicker:"Lord of the House of the Wing",
          desc:"A mortal man who came to Gondolin as the messenger of Ulmo. He married Idril and led the House of the Wing."},ring(146,176,3),wing)),
        ...[[3,"Glorfindel of the Golden Flower","Glorfindel","house-flower",240],[4,"Ecthelion of the Fountain","Ecthelion","house-fountain",270],
            [5,"Maeglin of the Mole","Maeglin","house-mole",30],[6,"Duilin of the Swallow","Duilin","house-swallow",60],
            [7,"Egalmoth of the Heavenly Arch","Egalmoth","house-arch",90],[8,"Penlod of the Pillar","Penlod","house-pillar",122],
            [9,"Galdor of the Tree","Galdor","house-tree",210],[10,"Rog of the Hammer of Wrath","Rog","house-hammer",330],
            [11,"Salgant of the Harp","Salgant","house-harp",300]]
          .map(([i,name,short,house,b])=>lord(i,name,short,house,Object.assign(ring(146,b,3),hall(house,b))))
      ],
      soldierNames:{0:"Guard of the King's House",2:"Archer of the Swallow",11:"Smith of the Hammer of Wrath"},
      soldierNotes:{0:"One of the King's household guard, on watch around the Square of the King."},
      // townsfolk in sprite order. role picks the daily routine; count is how many walk the city (merchants get one per market stall)
      townsfolk:[
        {role:"water",name:"Water-carrier",count:14,text:"Carrying water from the fountains. Gondolin was famous for them; one of its names, Ondolindë, means the Rock of the Music of Water."},
        {role:"merchant",name:"Merchant",text:"A trader on the way to market."},
        {role:"lore",name:"Loremaster",count:6,text:"A keeper of the city's lore, books in hand."},
        {role:"gardener",name:"Gardener",count:12,text:"Tending one of the city's many gardens."},
        {role:"minstrel",name:"Minstrel",count:6,text:"A musician wandering the white streets."},
        {role:"mason",name:"Stonemason",count:10,text:"Gondolin was built of white stone, and its masons kept it shining."},
        {role:"citizen",name:"Maiden of Gondolin",text:"A citizen of Gondolin out walking in the city."},
        {role:"lamplighter",name:"Lamplighter",count:9,text:"On the way to light the lanterns of the squares."},
      ],
      citizens:{count:70,sprites:["citizen","citizen","citizen","water","merchant","gardener","minstrel"]},
      // guards work in day and night shifts at these posts; district picks whose soldier sprite they use
      guards:[
        {district:0,onText:"On guard around the Square of the King",offText:"Off duty in the King's house",
          posts:[0,1,2,3].map(k=>{ const b=k*90+20, q=P(b,23); return {post:V(q.x,q.z),barracks:V(k%2?3:-3,-35.6).setY(T),act:{kind:"circle",R:23,b}}; })},
        {district:6,onText:"Keeping the Great Gate",offText:"Off duty in the guardhouse of the Wing",
          note:"A soldier of the House of the Wing. The House of the Wing keeps the Great Gate, which stands in its quarter.",
          posts:[-1,1].map(side=>{ const z=edgeS-14, a=new THREE.Vector3(side*4.5,H,z), b=new THREE.Vector3(side*4.5,H,z-9);
            return {post:a.clone(),barracks:V(side*6,124+side*2),act:{kind:"pace",a,b}}; })},
        {district:9,onText:"Keeping the Great Gate of steel, the last of the Seven Gates",offText:"Resting in the guardhouse of the Gate of Steel",
          note:"A soldier of the House of the Fountain. Ecthelion, its lord, was Warden of the Great Gate.",
          posts:[-1,1].map(sd=>{ const s=GATES[0]-9, [x,z]=hwAt(s), p=new THREE.Vector3(x+HN[0]*sd*5,0,z+HN[1]*sd*5); p.y=E.surfaceY(p.x,p.z);
            const q=p.clone().add(new THREE.Vector3(-HU[0]*8,0,-HU[1]*8)); q.y=E.surfaceY(q.x,q.z); return {post:p,barracks:p.clone(),act:{kind:"pace",a:p,b:q}}; })},
        {district:0,onText:"Keeping one of the Seven Gates of the Hidden Way",offText:"Resting in the gate's guardhouse",
          posts:GATES.slice(1).map(s=>{ const [x,z]=hwAt(s-9), p=new THREE.Vector3(x,0,z); p.y=E.surfaceY(x,z);
            const q=new THREE.Vector3(x+HN[0]*8,0,z+HN[1]*8); q.y=E.surfaceY(q.x,q.z); return {post:p,barracks:p.clone(),act:{kind:"pace",a:p,b:q}}; })},
      ],
    };
  },
  routines:{
    squareRing:23,                                  // the walk around the central square
    squareCrowd:[11.5,21],                          // crowds gather between these radii
    markets:["72:45","72:315","146:105","146:255","206:45","206:315"], // fountain squares that hold markets: "ring radius:avenue bearing"
    study:{name:"the King's hall",x0:-10,x1:10,z:-31.2},
    minstrelBearings:[150,210,100,260,135,225], minstrelRadius:15,
    patrolRing:146,                                 // each district's soldiers patrol their stretch of this ring road
  },
};
})();
