/* Dor-lómin: city data for citymaker. Build with:  python build.py dor-lomin
   The land in the south of Hithlum that Fingolfin gave to Hador Lórindol and his people, fenced by the Mountains of Shadow,
   and the house of Húrin and Morwen there in FA 468, when Túrin was a small boy and his sister Lalaith still lived.
   The Edain of Hador's house were golden-haired and built in timber, so the town uses the rohan style. Tolkien describes the
   house and its people; the town around it, the stream, the fields and the roads are this map's interpretation.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_COH="The Children of Húrin, ch. 1–3", S_SIL="The Silmarillion, ch. 17 & 21", S_NIR="The Silmarillion, ch. 20, “Of the Fifth Battle”";
const MAP="This quarter is the map's invention.";
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const at=(b,r)=>[r*Math.sin(b*Math.PI/180),-r*Math.cos(b*Math.PI/180)];
const GATE_B=20, SOUTH_B=190;                                // the road north toward Mithrim, and the road south over the mountains
// a stream comes down from the mountains in the south and runs past the hill toward the north of Hithlum
const STREAM=[[262,820],[240,520],[222,300],[206,150],[214,10],[200,-160],[160,-420],[120,-760],[90,-1200]];
const ROAD_N=[at(GATE_B,182),at(GATE_B,1500)], ROAD_S=[at(SOUTH_B,150),at(SOUTH_B,330),at(SOUTH_B+6,470),at(SOUTH_B-4,600),at(SOUTH_B+3,760)];
const segD=(x,z,pts)=>{ let best=1e9; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)); best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t)); } return best; };
// where the north road crosses the stream: the point on the road nearest the stream
const CROSS=(()=>{ let best=[1e9,0]; for(let t=0;t<=1;t+=.002){ const x=ROAD_N[0][0]+(ROAD_N[1][0]-ROAD_N[0][0])*t, z=ROAD_N[0][1]+(ROAD_N[1][1]-ROAD_N[0][1])*t, d=segD(x,z,STREAM); if(d<best[0]) best=[d,t]; } return best[1]; })();

window.CITY={
  id:"dor-lomin",
  style:"rohan",                              // the Edain of Hador's house built in timber: styles/rohan.js
  name:"Dor-lómin",
  title:"Dor-lómin from Above",
  tagline:"The land of the House of Hador in Hithlum, and the house of Húrin and Morwen beneath the Mountains of Shadow",
  footnote:"Húrin's house, his household and the land of Dor-lómin come from Tolkien; the town around the house, its quarters, the stream, the fields and the roads are this map's interpretation.",
  searchPlaceholder:"Search the town, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand", worldLabel:"The map of Beleriand",
  seed:468,                                   // FA 468: Túrin is four, and Lalaith still lives
  look:{sky:"#bccad4"},
  camera:{scale:.8, dist:1450, target:[20,8,90], from:25},   // from the north, down the road from Mithrim: the house, then the vale and the mountains behind

  // a low green hill in a vale ringed by the Mountains of Shadow
  terrain:{height:14, summit:{radius:88,waves:[[2,.05,.4],[5,.03,1.9]]}, mountains:{from:390,to:760,height:230}, plainFrom:99999, detail:360, rough:0,                                  // a smooth green hill, not broken rock
    profile:[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.06,.9],[1.16,.7],[1.32,.45],[1.52,.22],[1.78,.07],[2.05,0]],
    colors:{top:"#8faa5e",topB:"#86a157",rock1:"#86a35a",rock2:"#7d9a54",base:"#7f9c5a"},
    water:{level:-2.2,bed:-5,rivers:[{points:STREAM,width:[10,20]}],place:"stream",color:"#2f5d78",size:[1200,2600],center:[150,0]}},
  levels:{height:5, radii:[34], ramp:10},     // the house stands on a raised green at the top of the hill
  fill:{yards:{courts:1,gardens:3}},
  streets:{
    rings:[[64,4]],
    avenues:[GATE_B,140,260].map(b=>({b,r0:10,w:b===GATE_B?6.5:4.5,main:true})).concat([80,200,320].map(b=>({b,r0:62,w:3.5,main:false}))),
  },
  gate:{bearing:GATE_B, channel:false},
  squareStatues:[],

  text:{
    districtKicker:"A quarter of the town",
    storyHeading:"After the Nirnaeth",
    searchHint:"Try a name, such as Húrin or Túrin.",
    citadel:"the house-green",
    square:"the green before Húrin's house",
    citizen:"One of the Edain of Hador's house, going about the town.",
  },

  districts:[
    {id:"q-household",name:"Húrin's Household",lord:"Húrin, Lord of Dor-lómin",color:"#c9a227",sector:[20,140],hall:[50,48],motif:"hall",
      heraldry:"Gold and green",desc:"The men of Húrin's household, quartered nearest the house. "+MAP,
      fall:"Húrin's household went with him to the Nirnaeth Arnoediad, and almost none came back.",src:S_NIR},
    {id:"q-wrights",name:"The Woodwrights",lord:"The master wright",color:"#8a5a34",sector:[140,260],hall:[170,48],motif:"tower",
      heraldry:"Brown and gold",desc:"Carpenters and carvers in wood. Sador, Húrin's servant, had been a woodwright before he lost his foot. "+MAP,fall:null,src:S_COH},
    {id:"q-herders",name:"Herders and Farmers",lord:"The reeve of Dor-lómin",color:"#5f8f45",sector:[260,20],hall:[290,48],motif:"stable",
      heraldry:"Green",desc:"The farmers and herders of the vale. "+MAP,
      fall:"After the Nirnaeth Morgoth gave Dor-lómin to the Easterlings, who took the land and made the people of Hador's house their thralls.",src:S_COH},
  ],

  places(E){ const {THREE,P,H,edgeR,edgeS}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z); return {
    "house":{name:"The House of Húrin",kicker:"The House-green",alt:"Húrin and Morwen's hall",color:"#c9a95c",showAs:"the House of Húrin",
      desc:"The house of Húrin Thalion, Lord of Dor-lómin, son of Galdor and grandson of Hador, and of Morwen Eledhwen his wife, of the House of Bëor. Their son Túrin was born here in the winter of 464, and their daughter Urwen, whom all called Lalaith, Laughter, two years later. On this map it is a great timber hall on a raised green at the top of the town.",
      fall:"Húrin rode to the Nirnaeth Arnoediad and did not come back: he was taken alive to Angband and cursed by Morgoth. Morwen stayed in her house among the Easterlings, and the next year she sent Túrin away over the mountains to Doriath, to be fostered by King Thingol.",
      src:S_COH+"; "+S_SIL,pos:P(180,22),zoom:150,ring:17,label:P(180,22,H+24),tier:1},
    "green":{name:"The House-green",kicker:"The House-green",alt:"Before the doors of the house",color:"#8fab5f",
      desc:"The green before Húrin's doors at the top of the town, where the road from the gate ends. On this map it has a well and four braziers.",
      fall:"In the autumn of 469 the Evil Breath came out of Angband, and Lalaith died of it. Túrin, who had the sickness too, lived.",src:S_COH,pos:P(0,0),zoom:100,ring:12,label:P(20,6,H+6),tier:2},
    "sador":{name:"Sador's Workshop",kicker:"The House-green",alt:"Where Labadal worked his wood",color:"#8a5a34",
      desc:"Sador, Húrin's old servant, had lost a foot to his own axe as a woodcutter, and Túrin called him Labadal, Hop-a-foot. He was Túrin's friend, and told him tales of the old wars. On this map he works in a shed beside the green.",
      fall:"Long after, Túrin came home as a grown man and found Brodda the Easterling in his mother's lands. In the fight in Brodda's hall, old Sador was killed.",src:S_COH,pos:P(110,26),zoom:90,ring:8,label:P(110,26,H+10),tier:2},
    "gate":{name:"The Gate",kicker:"The Town",alt:"Toward Mithrim and the north of Hithlum",color:"#a8916a",
      desc:"The gate of the town, at the head of the road north down the vale toward Mithrim.",
      fall:null,src:S_SIL,pos:P(GATE_B,edgeS-2),zoom:120,ring:14,label:P(GATE_B,edgeS-2,H+18),tier:1},
    "walls":{name:"The Dike and the Palisade",kicker:"The Town",alt:"Timber on an earth bank",color:"#7a5634",
      desc:"On this map an earth bank and a palisade of logs ring the hill, with timber watchtowers.",fall:null,src:S_SIL,
      pos:P(0,0),zoom:360,ring:0,label:P(100,edgeR(100)-2,H+10),tier:3},
    "stream":{name:"The Stream",kicker:"The Vale",alt:"From the mountains past the hill",color:"#5aa8d6",fixedY:true,
      desc:"On this map a stream comes down from the Mountains of Shadow and runs past the hill on its way north through Hithlum. The north road crosses it on a stone bridge.",
      fall:null,src:S_SIL,pos:V3(214,-2,10),zoom:300,ring:0,label:V3(214,12,10),tier:2},
    "fields":{name:"The Fields of Dor-lómin",kicker:"The Vale",alt:"Farms and herds in the vale",color:"#c9b45a",fixedY:true,
      desc:"Dor-lómin was the land of the Edain of Hador's house, given to Hador by Fingolfin. On this map its farms, hedgerows and herds fill the vale.",
      fall:"After the Nirnaeth the Easterlings were given the land; they oppressed the people of Hador's house and took their goods.",
      src:S_SIL+"; "+S_COH,pos:V3(-260,3,-160),zoom:520,ring:0,label:V3(-260,16,-160),tier:2},
    "road-south":{name:"The Road over the Mountains",kicker:"The Vale",alt:"South over Ered Wethrin",color:"#a8916a",fixedY:true,
      desc:"On this map a road climbs out of the vale to the south, into the Mountains of Shadow.",
      fall:"In 473 Morwen sent Túrin away by this way with two old men, Gethron and Grithnir, over the mountains and through the forest to Doriath. Túrin was eight years old.",
      src:S_COH,pos:(()=>{ const [x,z]=at(SOUTH_B,470); return V3(x,40,z); })(),zoom:420,ring:0,label:(()=>{ const [x,z]=at(SOUTH_B,470); return V3(x,70,z); })(),tier:2},
    "ered-wethrin":{name:"Ered Wethrin",kicker:"The Vale",alt:"The Mountains of Shadow",color:"#9a948a",fixedY:true,
      desc:"The Mountains of Shadow, which fenced Dor-lómin on the south and east and divided Hithlum from the lands beyond.",
      fall:null,src:S_SIL,pos:V3(0,170,700),zoom:800,ring:0,label:V3(0,280,700),tier:2},
  }; },
  groups:[["The House-green",["house","green","sador"]],["The Quarters","@districts"],["The Town and the Vale",["gate","walls","stream","fields","road-south","ered-wethrin"]]],
  reserves(E){ return [[0,0,12],[0,22,15],[...at(110,26),6]]; },

  landmarks(E){
    const {THREE,H,DEG,P,lam,adder,flat,paveMat,own,instanced,M,GABLE,DISC,CYL,CONE,UNIT_BOX,waterMat,glowSprite,addWater,addLantern,addFountainPOI,addGardenPOI,groundY,surfaceY,
      bridge,lamp,scatter,herd,fields,stair}=E;
    const TOP=groundY(0)-H, T=H+2.2;                                   // the house-green's lift; T: the floor of the house (in group space)
    const brazier=()=>lam("#ffb35c",{emissive:new THREE.Color("#b8641e")});
    { // the green: turf, a well, four braziers
      const g=new THREE.Group(), add=adder(g), stone=lam("#b8b2a6"), wood=lam("#5e3f24");
      const disc=new THREE.CircleGeometry(11.5,72); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#b9a27a",3),H+.03));
      const wq=P(GATE_B,5); add(DISC,stone,wq.x,H,wq.z,1.6,.9,1.6); const w=add(DISC,waterMat(),wq.x,H+.85,wq.z,1.25,.06,1.25); addWater(w.material);
      for(const s of [-1,1]) add(UNIT_BOX,wood,wq.x+s*1.3,H,wq.z,.2,2.6,.2); add(GABLE,lam("#b8963e"),wq.x,H+2.6,wq.z,3.4,1.2,1.8);
      addFountainPOI(wq.x,wq.z+2.2);
      [65,155,245,335].forEach(b=>{ const q=P(b,10); add(CYL,lam("#4a3a2a"),q.x,H,q.z,.18,2.6,.18); add(CYL,lam("#3a3430"),q.x,H+2.6,q.z,.6,.45,.6);
        addLantern(add(CONE,brazier(),q.x,H+3,q.z,.45,.8,.45),q.x,q.z); });
      own("green",g); g.position.y=TOP;
    }
    { // the House of Húrin: a great timber hall on a stone footing, a high porch, a side wing for the household, Morwen's garden
      const g=new THREE.Group(), add=adder(g), stone=lam("#a8a296"), wood=lam("#5a3b20"), carve=lam("#7a5230"), thatch=lam("#b39345"), Z=22;
      add(UNIT_BOX,stone,0,H,Z,18,2.2,28);                                            // the footing
      for(let i=0;i<4;i++) add(UNIT_BOX,stone,0,H,Z-14.4-i*.55,7-i*.3,2.2-i*.55,.6);  // steps down to the green
      add(UNIT_BOX,wood,0,T,Z,11,6,24);                                               // the hall
      for(let k=0;k<7;k++) for(const s of [-1,1]) add(UNIT_BOX,carve,s*5.6,T,Z-10.5+k*3.5,.45,6,.45);
      add(GABLE,thatch,0,T+6,Z,13.6,7.6,26);
      add(UNIT_BOX,lam("#3a2a1c"),0,T,Z-12.05,3,4.2,.15);                             // the doors
      add(UNIT_BOX,wood,0,T,Z-14,7,7.2,4); add(GABLE,thatch,0,T+7.2,Z-14,8.4,4.2,5);   // the high porch
      for(const x of [-2.8,2.8]) add(CYL,carve,x,T,Z-16,.35,7.2,.35);
      add(UNIT_BOX,wood,11,T,Z+6,8,4.6,10); add(GABLE,thatch,11,T+4.6,Z+6,9.2,4.4,11.2);   // the household's wing
      for(const z of [Z-13,Z+13]) for(const s of [-1,1]){ const b=add(UNIT_BOX,carve,s*.75,T+12.2,z,.32,3.4,.32); b.rotation.z=s*.62; }   // crossed gable-beams
      add(CYL,lam("#6a5a48"),0,T+12.4,Z,.3,1.6,.3); const smoke=glowSprite("rgba(230,226,215,.28)",9); smoke.position.set(0,T+15.3,Z); g.add(smoke);
      add(CYL,lam("#4a3a2a"),-7,T,Z-15.5,.16,11,.16); add(UNIT_BOX,lam("#c9a227"),-5.4,T+8,Z-15.5,3.2,2.4,.14);   // Húrin's banner
      { const gx=-12, gz=Z+4, fence=lam("#6b4a2e");                                    // Morwen's garden, fenced, with a tree
        const lawn=new THREE.CircleGeometry(7,40); lawn.rotateX(-Math.PI/2); const lw=flat(lawn,paveMat("#7da455",3),H+.05); lw.position.set(gx,H+.05,gz); g.add(lw);
        for(let k=0;k<20;k++){ const a=k/20*Math.PI*2; if(k===5) continue; add(UNIT_BOX,fence,gx+Math.cos(a)*7,H,gz+Math.sin(a)*7,.25,1.2,.25); }
        add(CYL,lam("#6b5a40"),gx+1,H,gz-1,.4,3,.4); add(E.BLOB,new THREE.MeshPhongMaterial({color:0x5f8f45,flatShading:true,shininess:4}),gx+1,H+4.6,gz-1,3.2,3,3.2);
        for(let k=0;k<6;k++){ const a=k; add(UNIT_BOX,lam(["#f4e6a0","#e9d2f0","#f2a7b5"][k%3]),gx+Math.cos(a)*4.5,H+.05,gz+Math.sin(a)*4.5,1.6,.4,.8); }
        addGardenPOI(gx,gz,6); }
      for(const s of [-1,1]){ add(CYL,lam("#3a3430"),s*4.2,H+2.2,Z-17,.18,2.4,.18); addLantern(add(CONE,brazier(),s*4.2,H+4.6,Z-17,.45,.8,.45),s*4.2,Z-17); }
      own("house",g); g.position.y=TOP;
    }
    { // Sador's workshop: an open shed, a sawhorse, stacked timber, a chopping block
      const g=new THREE.Group(), add=adder(g), wood=lam("#6b4a2e"), [sx,sz]=at(110,26), y=groundY(26);
      for(const dx of [-2.6,2.6]) for(const dz of [-1.8,1.8]) add(UNIT_BOX,wood,sx+dx,y,sz+dz,.3,3,.3);
      add(GABLE,lam("#b39345"),sx,y+3,sz,6.4,2,4.6);
      for(let k=0;k<5;k++) add(CYL,lam(k%2?"#8a6a48":"#7a5a3a"),sx-1+k*.6,y+.35,sz+3.2,.3,.3,3).rotation.x=Math.PI/2;   // a stack of logs
      add(UNIT_BOX,wood,sx+3.6,y,sz-1,.3,1,1.6); add(UNIT_BOX,wood,sx+4.6,y,sz-1,.3,1,1.6); add(UNIT_BOX,lam("#a07a52"),sx+4.1,y+1,sz-1,1.6,.25,2.4);   // a sawhorse with a plank
      add(CYL,lam("#8a6a48"),sx-3.6,y,sz-1.5,.7,.9,.7);                                                  // the chopping block
      own("sador",g);
    }
    { // the roads: north from the foot of the hill down the vale (with a stone bridge over the stream), and south up into the mountains
      const road=[], seg=(a,b,o)=>{ const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10);
        for(let k=0;k<n;k++){ const x=a[0]+(b[0]-a[0])*(k+.5)/n, z=a[1]+(b[1]-a[1])*(k+.5)/n; if(E.surfaceY(x,z)<-1.6) continue;
          road.push({m:M(x,surfaceY(x,z)-.2,z,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),Math.hypot(b[0]-a[0],b[1]-a[1])/n+.6,.5,6.5),c:"#a8916a",o}); } };
      seg(ROAD_N[0],ROAD_N[1],"gate");
      for(let i=0;i<ROAD_S.length-1;i++) seg(ROAD_S[i],ROAD_S[i+1],"road-south");
      instanced(UNIT_BOX,lam("#ffffff"),road,false);
      const g=new THREE.Group(), add=adder(g), t0=Math.max(0,CROSS-.025), t1=Math.min(1,CROSS+.025), p=t=>[ROAD_N[0][0]+(ROAD_N[1][0]-ROAD_N[0][0])*t,ROAD_N[0][1]+(ROAD_N[1][1]-ROAD_N[0][1])*t];
      bridge(add,p(t0),p(t1),{y:3.6,w:7,span:10,cutwaters:true,waterLevel:-2.2,lamps:false});         // engine recipe: a stone bridge over the stream
      own("stream",g);
    }
    // engine recipes: the fields and herds of the vale, and pines on the lower slopes of the mountains
    fields({area:{x0:-560,x1:560,z0:-640,z1:420},seed:31,owner:"fields",
      avoid:(x,z)=>Math.hypot(x,z)<200||Math.hypot(x,z)>420||E.surfaceY(x,z)>2.5||segD(x,z,STREAM)<24||segD(x,z,ROAD_N)<16||segD(x,z,ROAD_S)<16});
    { const g=new THREE.Group(); herd(adder(g),-330,-60,9,{spread:30,seed:44}); herd(adder(g),280,-320,7,{spread:24,seed:51}); own("fields",g); }
    scatter({kind:"pine",n:900,area:{x:0,z:0,r:900},seed:7,size:[.7,1.2],keep:(x,z,y)=>y>18&&y<150,owner:"ered-wethrin"});
    scatter({kind:"tree",n:160,area:{x:0,z:0,r:460},seed:9,size:[.8,1.3],keep:(x,z,y)=>Math.hypot(x,z)>190&&y>-1.6&&y<14&&segD(x,z,STREAM)<40,owner:"stream"});
  },

  // the cast. Sprite order: the lords below, then one soldier per quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,groundY}=E, K=groundY(0), T=K+2.2;              // K: the house-green; T: the floor of the house
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), onP=(b,r)=>{ const p=P(b,r); return V(p.x,p.z); };
    const house={hall:v3(0,T,16),nightText:"Asleep in the House of Húrin"}, [sx,sz]=at(110,26);
    return {
      lords:[
        Object.assign({i:0,name:"Húrin Thalion, Lord of Dor-lómin",short:"Húrin",house:"house",kicker:"Lord of Dor-lómin",
          desc:"Son of Galdor, of the House of Hador: less tall than his kin, but strong, and the greatest warrior of mortal Men. As a youth he had dwelt a year in Gondolin, and he alone of Men knew where it lay.",
          a:v3(-4,K,6.5),b:v3(4,K,6.5),dayText:"Before the doors of his house"},house),
        Object.assign({i:1,name:"Morwen Eledhwen",short:"Morwen",house:"house",kicker:"Lady of Dor-lómin",
          desc:"Húrin's wife, of the House of Bëor: dark-haired, tall and proud, called Elfsheen for her beauty. She was stern, and did not easily show her grief.",
          a:v3(-14,K,24),b:v3(-10,K,30),dayText:"In her garden beside the house"},house),
        Object.assign({i:2,name:"Túrin son of Húrin",short:"Túrin",house:"sador",kicker:"A boy of four",
          desc:"Húrin and Morwen's son, dark-haired like his mother, grave and slow to laugh, generous and quick to pity. His friend was Sador, the lame servant.",
          a:v3(sx+2,K,sz+5),b:v3(sx-3,K,sz+5),dayText:"Watching Sador at work"},house),
        Object.assign({i:3,name:"Lalaith",short:"Lalaith",house:"house",kicker:"Urwen, daughter of Húrin",
          desc:"Túrin's little sister, golden-haired like her father's kin. Her name was Urwen, but she laughed so much that everyone called her Lalaith, Laughter.",
          a:v3(-3,K,-2),b:v3(4,K,2),dayText:"Running about the green"},house),
        Object.assign({i:4,name:"Sador Labadal",short:"Sador",house:"sador",kicker:"Húrin's servant",
          desc:"An old servant of Húrin's house, lamed long ago by his own axe. Túrin called him Labadal, Hop-a-foot, and loved him."},
          {a:v3(sx-1,K,sz-1),b:v3(sx+2,K,sz-1),dayText:"Working wood in his shed",hall:v3(sx,K,sz),nightText:"Asleep in his shed"}),
        Object.assign({i:5,name:"Huor son of Galdor",short:"Huor",house:"house",kicker:"Brother of Húrin",
          desc:"Húrin's younger brother, tall and golden-haired, who had dwelt in Gondolin with him as a youth. He would marry Rían and fall beside Húrin in the Nirnaeth; his son was Tuor.",
          a:onP(320,64),b:onP(350,64),dayText:"Walking in the town"},house),
      ],
      soldierNames:{0:"Man of Húrin's household",1:"Woodwright",2:"Herdsman of Dor-lómin"},
      soldierNotes:{0:"One of Húrin's men, keeping the green before his house."},
      townsfolk:[
        {role:"water",name:"Water-carrier",count:7,text:"Carrying water from the wells of the town."},
        {role:"merchant",name:"Trader",text:"Selling wool, hides and grain at the market."},
        {role:"lore",name:"Lore-keeper",count:3,text:"A keeper of the tales of Hador and the wars with Morgoth."},
        {role:"gardener",name:"Farmer of Dor-lómin",count:8,text:"Working the gardens and the fields of the vale."},
        {role:"minstrel",name:"Singer",count:3,text:"A singer of the songs of the Edain."},
        {role:"mason",name:"Wright",count:5,text:"A worker in timber, mending the houses and fences."},
        {role:"citizen",name:"Woman of Dor-lómin",text:"One of the Edain of Hador's house, out walking in the town."},
        {role:"lamplighter",name:"Fire-keeper",count:4,text:"On the way to light the braziers of the green."},
      ],
      citizens:{count:30,sprites:["citizen","citizen","water","merchant","gardener","minstrel"]},
      guards:[
        {district:0,onText:"Keeping the green before Húrin's house",offText:"Off duty in the household hall",
          posts:[0,1,2,3].map(k=>{ const b=k*90+40, q=P(b,10); return {post:V(q.x,q.z),barracks:onP(50,48),act:{kind:"circle",R:10,b}}; })},
        {district:0,onText:"Keeping the gate",offText:"Off duty in the household hall",
          posts:[-1,1].map(s=>{ const tb=(GATE_B+90)*Math.PI/180, a0=P(GATE_B,edgeS-14), a1=P(GATE_B,edgeS-22), off=new THREE.Vector3(Math.sin(tb)*s*4,0,-Math.cos(tb)*s*4);
            return {post:a0.clone().add(off),barracks:onP(50,48),act:{kind:"pace",a:a0.clone().add(off),b:a1.clone().add(off)}}; })},
      ],
    };
  },
  routines:{
    squareRing:10,
    squareCrowd:[3.5,8.5],
    markets:["64:140","64:260"],
    study:{name:"the House of Húrin",x0:-3,x1:3,z:6},
    minstrelBearings:[150,210,100,260], minstrelRadius:7,
    patrolRing:64,
  },
};
})();
