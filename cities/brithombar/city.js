/* Brithombar before the fall of the Falas. Build: python build.py brithombar.
   The curved bay, terraced town, buildings and street plan are interpretations. */
(function(){
const SRC="The Silmarillion, chapters 14 and 20", MAP="This layout and architecture are the map's interpretation.";
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const shore=x=>232-58*Math.exp(-Math.pow(x/150,2))+12*Math.sin(x*.007);
const wet=(x,z)=>smooth(shore(x)-4,shore(x)+5,z);
const ridge=(x,z)=>16*Math.exp(-Math.pow((Math.abs(x)-315)/95,2)-Math.pow((z-220)/90,2))+34*smooth(-220,-560,z)*(1+.2*Math.sin(x*.01));
const shelves=[{x:-155,z:60,r:66,y:12,side:14},{x:155,z:60,r:66,y:12,side:14}];
const quay=Array.from({length:21},(_,i)=>{const x=-240+i*24;return [x,shore(x)-6];});
const coastalPath=quay.map(([x,z])=>[x,z-6]);
const paths=[
  {from:"E:180",to:"LANDING",points:[[0,82,24],[0,94,24],[0,114,17.75],[0,146,7.75],[0,shore(0)-8,1.5]]},
  {from:"LANDING",to:"WEST-QUAY",points:[[0,shore(0)-8],...coastalPath.filter(p=>p[0]<0).reverse()]},
  {from:"LANDING",to:"EAST-QUAY",points:[[0,shore(0)-8],...coastalPath.filter(p=>p[0]>0)]},
  {from:"E:270",to:"WEST-TERRACE",points:[[-82,0],[-112,24],[-155,60],[-212,64]]},
  {from:"WEST-TERRACE",to:"FISHERS",points:[[-212,64],[-242,106],[-240,shore(-240)-12]]},
  {from:"E:90",to:"EAST-TERRACE",points:[[82,0],[112,24],[155,60],[210,64]]},
  {from:"EAST-TERRACE",to:"MARKET",points:[[210,64],[224,109],[170,145]]},
  {from:"EAST-TERRACE",to:"BRIDGE",points:[[210,64],[250,55],[273,55,6],[340,55,6],[380,55]]},
  {from:"E:0",to:"NORTH-ROAD",points:[[0,-82],[0,-125],[35,-205],[70,-330]]},
];
window.CITY={
  id:"brithombar",
  style:"noldor",
  name:"Brithombar",
  title:"Brithombar from Above",
  tagline:"The northern haven of the Falathrim, where the Brithon meets the western sea",
  footnote:"Brithombar, the Brithon, Círdan's rule, and the rebuilding with Noldorin aid come from The Silmarillion. The bay, terraces, buildings, bridge and daily activities are interpretations. Existing Elven artwork stands in for the Falathrim.",
  searchPlaceholder:"Search terraces, harbour, Brithon, ships",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand",
  worldLabel:"Map of Beleriand",
  seed:715,
  look:{sky:"#b9d5df"},
  terrain:{height:24,summit:{radius:92,waves:[]},rough:0,plainFrom:99999,detail:340,fine:750,
    mountains:{from:99999,to:100001,height:0},shape:ridge,shelves,
    profile:[[0,1],[1,1],[1.08,.83],[1.25,.45],[1.45,.12],[1.65,0]],
    colors:{top:"#a8b39b",topB:"#98aa8d",rock1:"#a8a99f",rock2:"#8b9b89",base:"#8fa37c"},
    water:{level:-1.5,bed:-9,color:"#467b93",place:"sea",carve:wet,
      rivers:[{points:[[380,-800],[345,-440],[333,-180],[307,0],[305,110],[282,210],[270,340]],width:[23,46]}]},
    tint(x,z,y,c){if(z>shore(x)-26)c.lerp({r:.73,g:.71,b:.62},.6);}},
  levels:{height:7,radii:[40],ramp:12},
  fill:{gap:2.2,yards:false},
  streets:{rings:[],avenues:[0,90,180,270].map(b=>({b,r0:15,w:b===180?7:4.5,main:true})),paths},
  gate:{bearing:180,channel:false,stair:false},
  camera:{scale:1.25,dist:1320,target:[20,12,115],from:175,limit:850},
  squareStatues:[],
  text:{districtKicker:"A household of the haven",storyHeading:"Its story",searchHint:"Try Brithon or Mariners.",citadel:"the haven court",square:"the well court",citizen:"One of the Falathrim, going about the haven."},
  districts:[
    {id:"q-keepers",name:"Keepers of the Haven",lord:"Círdan",color:"#6e8ba1",sector:[315,45],hall:[0,63],motif:"low",heraldry:"Blue and pearl; an invented scheme",desc:"The household that oversees the haven and its stores. "+MAP,fall:null,src:SRC},
    {id:"q-weavers",name:"The Sailmakers",lord:"The sailmakers",color:"#c2b388",sector:[45,135],hall:[90,63],motif:"arch",heraldry:"Linen and silver; an invented scheme",desc:"Weavers and rope-makers serving the ships. "+MAP,fall:null,src:SRC},
    {id:"q-mariners",name:"The Mariners",lord:"The mariners",color:"#487e88",sector:[135,225],hall:[180,63],motif:"low",heraldry:"Sea-green and white; an invented scheme",desc:"The mariners of Círdan's people. Their household hall above the harbour is invented.",fall:null,src:SRC},
    {id:"q-builders",name:"The Stonewrights",lord:"The stonewrights",color:"#90969d",sector:[225,315],hall:[270,63],motif:"tower",heraldry:"Slate and silver; an invented scheme",desc:"Craftspeople maintaining the stone walls, quays and piers. "+MAP,fall:null,src:SRC},
  ],
  places(E){const {P,H,THREE}=E;
    const place=(name,x,z,y,zoom,desc,color,tier=2)=>({name,kicker:"Brithombar",alt:"A place in the haven",color,desc,fall:null,src:SRC,pos:new THREE.Vector3(x,y,z),label:new THREE.Vector3(x,y+18,z),fixedY:true,zoom,ring:12,tier});
    return {
      court:place("The Haven Hall",0,-23,H+7,160,"A meeting hall overlooking the harbour. Círdan ruled the Falas; this particular hall is invented.","#b9b7a2",1),
      square:place("The Well Court",0,0,H+7,95,"An open court with a well and lanterns, above the waterfront. "+MAP,"#86a2a5"),
      gate:{name:"The Sea Gate",kicker:"The Walled Haven",alt:"The stair to the stone quays",color:"#d8d9ce",desc:"The gate facing the harbour and the broad stair descending to it are invented.",fall:null,src:SRC,pos:P(180,90),label:P(180,90,H+20),zoom:150,ring:14,tier:1},
      walls:{name:"The Walls of Brithombar",kicker:"The Walled Haven",alt:"The defenses of the haven",color:"#e0dfd2",desc:"With the aid of Finrod's people, the havens were rebuilt as fortified towns with stone quays and piers. The arrangement of walls in this model is invented.",fall:"After the Nirnaeth Arnoediad, Morgoth's forces ravaged the Falas and destroyed the havens. Círdan and survivors escaped by sea to Balar.",src:SRC,pos:P(0,0),label:P(45,91,H+14),zoom:400,ring:0,tier:3},
      west:place("The Western Terrace",-155,60,12,270,"Stone houses and small gardens on a shelf above the bay. The residential terraces are invented.","#8fa59a"),
      east:place("The Eastern Terrace",155,60,12,270,"Homes of sailmakers and traders above the eastern quays. "+MAP,"#b7b399"),
      harbour:place("The Sheltered Harbour",0,205,1.5,470,"Brithombar was a haven of the Falathrim at the mouth of the Brithon. This crescent bay, breakwaters and ship berths are interpretations.","#528da0",1),
      shipyard:place("The Shipbuilders' Yard",-142,152,1.5,220,"Open workshops, an unfinished hull on trestles, and timber stores depict the work of the Falathrim. These buildings are invented.","#ac9777"),
      fishers:place("The Fishers' Landing",-240,shore(-240)-12,1.5,200,"Small fishing boats and waterside stores beside the western quay. "+MAP,"#8ca5a3"),
      market:place("The Sailcloth Market",170,145,1.5,220,"A market for cloth, rope and provisions. "+MAP,"#bca46e"),
      brithon:place("The Mouth of the Brithon",300,120,-1.5,440,"The river from which Brithombar took its name meets the sea beside the haven. This river course is schematic.","#568d9c"),
      bridge:place("The Brithon Bridge",307,55,6,260,"A stone bridge carrying a road across the river. The bridge and road are the map's invention.","#c7c9bc"),
      watch:place("The Harbour Watch",-262,shore(-262)-16,6,240,"A tower on the western headland watching the bay's entrance. This is an invented harbour tower, distinct from Barad Nimras near Eglarest.","#b7c6cd"),
      sea:place("Belegaer",0,480,-1.5,700,"The western sea beyond the Falas. The ships and the view of the coast are interpretations.","#528da0"),
    };},
  groups:[["The Upper Haven",["court","square","gate","walls"]],["Households","@districts"],["Terraces and Waterfront",["west","east","harbour","shipyard","fishers","market"]],["River and Sea",["brithon","bridge","watch","sea"]]],
  reserves(){return [[0,0,17],[0,-23,20]];},
  markets:[{x:170,z:145,r:13,stalls:6}],
  settlements(){const row=(owner,pts,o)=>Object.assign({owner,along:pts,side:-1,offset:8,rows:2,rowGap:15,spacing:5,w:[7,3],d:[6,2],well:false,green:false},o);
    return [
      row("west",[[-207,73],[-108,73]],{district:3,avoid:(x,z)=>Math.hypot(x,z)<105||Math.abs(z-60)<6}),
      row("east",[[108,73],[207,73]],{district:1,avoid:(x,z)=>Math.hypot(x,z)<105||Math.abs(z-60)<6}),
      row("west",[[-190,18],[-112,18]],{district:0,rows:1,offset:5}),
      row("east",[[112,18],[190,18]],{district:1,rows:1,offset:5}),
      {c:[-225,154],r:26,n:9,clear:8,spacing:5,w:[4,2],d:[4,2],district:2,owner:"fishers",avoid:(x,z)=>z>shore(x)-22},
      row("harbour",[[72,shore(72)-32],[122,shore(122)-32],[190,shore(190)-32]],{district:2,rows:1,offset:5,avoid:(x,z)=>Math.hypot(x-170,z-145)<27}),
    ];},
  landmarks(E){const {THREE,adder,lam,own,UNIT_BOX,CYL,DISC,H,groundY,surfaceY}=E;
    const build=(id,fn)=>{const g=new THREE.Group();fn(adder(g));own(id,g);};
    const stone=lam("#d8d6c8"),wood=lam("#806347"),roof="#76929c";
    build("court",add=>{E.hall(add,0,-23,{w:27,d:14,h:10,y:H+7,porch:true,roof});E.tower(add,-24,-23,{r:4,h:24,roof});});
    build("square",add=>{const y=groundY(0);add(DISC,stone,0,y,0,3.2,.6,3.2);add(CYL,stone,0,y+.6,0,2.5,1.2,2.5);
      E.addWater(add(DISC,E.waterMat(),0,y+1.8,0,2.2,.05,2.2).material);E.addFountainPOI(3.5,0);[45,135,225,315].forEach(b=>{const p=E.P(b,13);E.lamp(add,p.x,y,p.z);});});
    build("gate",add=>{E.stair(add,[0,24,94],[0,1.5,shore(0)-9],7);});
    ["west","east"].forEach((id,i)=>build(id,add=>{const side=i?1:-1;
      for(let k=0;k<16;k++){const x=side*(108+k*6),z=106,y=surfaceY(x,z);add(UNIT_BOX,stone,x,0,z,6.4,Math.max(1,y),3);add(UNIT_BOX,stone,x,y,z,6.5,.7,4);}
      E.hall(add,side*155,78,{w:20,d:10,h:7,y:12,porch:true,roof});
      E.stair(add,[side*213,12,70],[side*234,1.5,127],4);
      E.track([[side*108,60],[side*210,60]],{w:5,color:"#c9c4b4",owner:id});
      E.addGardenPOI(side*155,35,9);
    }));
    build("harbour",add=>{E.quay(add,quay,{y:1.5,w:8,lampEvery:40});
      [-190,-95,95,190].forEach((x,i)=>{const z=shore(x)-6,len=i===1||i===2?55:38;E.pier(add,[x,z],[x,z+len],{y:1.5,w:6,stone:true});
        for(const s of [-1,1])E.boat(add,x+s*9,z+24,-Math.PI/2,{len:i===1?20:14,sail:i===2,color:"#d7d8d0",sailColor:"#eae9da"});});
      const arms=[[[ -258,shore(-258)-8],[-220,330],[-100,355]],[[258,shore(258)-8],[220,330],[100,355]]];
      arms.forEach(pts=>{for(let i=1;i<pts.length;i++)E.pier(add,pts[i-1],pts[i],{y:2,w:8,stone:true});const [x,z]=pts[2];
        add(CYL,stone,x,2,z,4,17,4);add(CYL,stone,x,19,z,4.7,1,4.7);add(E.CONE,lam(roof),x,20,z,4.8,6,4.8);E.lamp(add,x,20,z,4);});
      E.boat(add,0,310,-Math.PI/2,{len:24,sail:true,color:"#d4dace",sailColor:"#e8e6cf"});
      [[-70,465,.35],[165,550,1.8]].forEach(([x,z,yaw])=>E.boat(add,x,z,yaw,{len:21,sail:true}));
    });
    build("shipyard",add=>{E.hall(add,-148,145,{w:40,d:13,h:8,roof:"#768582",doors:false});
      E.boat(add,-140,168,0,{len:26,y:3,color:"#9b7856"});[-150,-142,-134].forEach(x=>add(UNIT_BOX,wood,x,0,168,1,3,9));
      for(let k=0;k<7;k++){const timber=add(CYL,wood,-181+k*1.2,1,168,.5,12,.5);timber.rotation.z=Math.PI/2;}
      for(const x of [-156,-127]){add(CYL,wood,x,0,172,.35,15,.35);add(UNIT_BOX,wood,x+4,13,172,9,.6,.6);add(CYL,lam("#bdb497"),x+8,6,172,.1,7,.1);}
    });
    build("fishers",add=>{E.hall(add,-239,shore(-239)-30,{w:18,d:9,h:6,roof:"#819599"});
      E.pier(add,[-240,shore(-240)-6],[-227,shore(-240)+25],{y:1.2,w:3});[-1,1].forEach(s=>E.boat(add,-227+s*6,shore(-240)+17,-Math.PI/2,{len:7,color:"#876f53"}));});
    build("market",add=>{E.hall(add,170,117,{w:27,d:12,h:8,porch:true,roof:"#9e9b82"});E.hall(add,211,143,{w:16,d:11,h:7,roof});});
    build("bridge",add=>{E.bridge(add,[273,55],[340,55],{y:6,w:7,arches:4,span:17,lamps:true});});
    build("watch",add=>{E.tower(add,-262,shore(-262)-16,{r:6,h:35,roof});E.hall(add,-278,shore(-278)-40,{w:16,d:10,h:7,roof});});
    paths.filter(p=>p.to!=="LANDING"&&p.to!=="BRIDGE").forEach(p=>E.track(p.points,{w:p.to.includes("TERRACE")?5:4,color:"#bcb9a4",owner:p.to==="NORTH-ROAD"?"walls":"harbour"}));
    E.track([[210,64],[250,55],[273,55]],{w:6,owner:"bridge"});E.track([[340,55],[380,55],[490,5]],{w:6,owner:"bridge"});
    E.scatter({kind:"pine",n:95,seed:716,area:{x0:-500,x1:230,z0:-520,z1:-220},size:[.7,1.4],owner:"walls",keep:(x,z)=>Math.abs(x-70)>30});
  },
  people(E){const land=(x,z)=>new E.THREE.Vector3(x,E.surfaceY(x,z),z);return {
    lords:[],
    soldierNames:{0:"Haven guard",1:"Sailmakers' watch",2:"Harbour warden",3:"Stonewrights' watch"},
    townsfolk:[
      {role:"water",name:"Water-bearer",count:4,text:"Taking water to the terrace houses."},
      {role:"merchant",name:"Chandler",count:4,text:"Supplying the ships and workshops."},
      {role:"lore",name:"Keeper of sailing records",count:2,text:"Recording the haven's voyages."},
      {role:"gardener",name:"Terrace gardener",count:3,text:"Tending the gardens above the harbour."},
      {role:"minstrel",name:"Singer of the Falas",count:2,text:"Singing in the well court."},
      {role:"mason",name:"Stonewright",count:4,text:"Maintaining the walls and piers."},
      {role:"citizen",name:"Elf of Brithombar",text:"Going about the haven."},
      {role:"lamplighter",name:"Quay lantern-keeper",count:4,text:"Lighting the harbour lanterns at dusk."},
    ],
    citizens:{count:20,sprites:["citizen","merchant","water","mason"]},
    guards:[{district:2,onText:"Watching the Sea Gate",offText:"Resting in the mariners' hall",posts:[-1,1].map(s=>({post:land(s*4,80),barracks:land(0,63),act:{kind:"pace",a:land(s*4,73),b:land(s*4,86)}}))}],
    locals:[
      {sprite:"mason",count:5,spread:6,name:"Shipbuilder",house:"shipyard",a:land(-175,164),b:land(-115,164),home:land(-148,145),dayText:"Shaping timber in the shipyard"},
      {sprite:"merchant",count:4,spread:8,name:"Sailcloth trader",house:"market",a:land(157,145),b:land(180,145),home:land(170,117),dayText:"Trading cloth and provisions"},
      {sprite:"citizen",count:4,spread:5,name:"Fisher of the Falas",house:"fishers",a:land(-245,shore(-245)-15),b:land(-220,shore(-220)-15),home:land(-239,shore(-239)-30),dayText:"Mending nets beside the landing"},
      {sprite:"gardener",count:3,spread:5,name:"Elf of the western terrace",house:"west",a:land(-180,60),b:land(-130,60),home:land(-155,78),dayText:"Walking the terrace street"},
      {sprite:"citizen",count:3,spread:5,name:"Elf of the eastern terrace",house:"east",a:land(130,60),b:land(180,60),home:land(155,78),dayText:"Walking above the harbour"},
      {soldier:0,count:2,spread:2,name:"Harbour watcher",house:"watch",a:land(-270,shore(-270)-25),b:land(-250,shore(-250)-25),home:land(-278,shore(-278)-40),dayText:"Watching the bay's entrance"},
    ],
  };},
  routines:{squareRing:12,squareCrowd:[6,11],markets:[],study:{name:"the haven hall",x0:-7,x1:7,z:-12},minstrelBearings:[45,135,225,315],minstrelRadius:10,patrolRing:65},
};
})();
