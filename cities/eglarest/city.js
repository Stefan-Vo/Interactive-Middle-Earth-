/* Eglarest before the fall of the Falas. Build: python build.py eglarest.
   The harbour plan and all quarters are interpretations, not a reconstruction of a known plan. */
(function(){
const SRC="The Silmarillion, chapters 14 and 20", MAP="The layout and buildings here are this map's interpretation.";
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const shore=x=>190+24*Math.sin(x*.005)+100*Math.exp(-Math.pow((x+360)/110,2));
const wet=(x,z)=>smooth(shore(x)-3,shore(x)+7,z);
const cape=(x,z)=>24*Math.exp(-Math.pow((x+360)/100,2)-Math.pow((z-220)/90,2));
const QUAY=Array.from({length:13},(_,i)=>{const x=-180+i*30;return [x,shore(x)-8];});
const PATHS=[
  {from:"E:180",to:"QUAY",points:[[0,112],[0,150],[0,shore(0)-12]]},
  {from:"QUAY",to:"WEST-QUAY",points:[[0,shore(0)-12],[-90,shore(-90)-12],[-180,shore(-180)-12]]},
  {from:"QUAY",to:"EAST-QUAY",points:[[0,shore(0)-12],[90,shore(90)-12],[180,shore(180)-12],[245,150]]},
  {from:"E:270",to:"CAPE",points:[[-112,0],[-210,40],[-300,120],[-360,215]]},
  {from:"E:0",to:"ROAD",points:[[0,-112],[0,-180],[70,-340]]},
];
window.CITY={
  id:"eglarest",
  style:"noldor",
  name:"Eglarest",
  title:"Eglarest from Above",
  tagline:"A haven of the Falathrim, beside the mouth of the Nenning in the First Age",
  footnote:"Eglarest, Círdan's people, the rebuilding with Noldorin aid, and Barad Nimras come from The Silmarillion. The harbour plan, quarters, halls and daily activities are interpretations. Existing Elven sprites stand in for the Falathrim; no named Círdan portrait is included.",
  searchPlaceholder:"Search harbour, ships, tower, quarters",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#beleriand",
  worldLabel:"Map of Beleriand",
  seed:714,
  look:{sky:"#b6d6e0"},
  terrain:{height:5,summit:{radius:122,waves:[]},rough:0,plainFrom:99999,detail:300,
    mountains:{from:99999,to:100001,height:0},shape:cape,
    profile:[[0,1],[1,1],[1.12,.65],[1.4,.2],[1.65,0]],
    colors:{top:"#9eaf87",topB:"#93a57b",rock1:"#b8b4a1",rock2:"#a0aa89",base:"#90a17a"},
    water:{level:-1.5,bed:-8,color:"#4e91a3",place:"sea",carve:wet,
      rivers:[{points:[[390,-700],[350,-340],[320,-100],[310,130],[340,300]],width:[24,55]}]},
    tint(x,z,y,c){if(z>shore(x)-22)c.lerp({r:.72,g:.70,b:.57},.5);}},
  levels:{height:0,radii:[],ramp:12},
  fill:{gap:1.65,yards:{courts:1,gardens:1}},
  streets:{rings:[[76,5]],avenues:[0,90,180,270].map(b=>({b,r0:22,w:b===180?8:5,main:true})),paths:PATHS},
  gate:{bearing:180,channel:false,stair:false},
  camera:{scale:1.2,dist:1180,target:[-45,5,110],from:160,limit:850},
  squareStatues:[],
  text:{districtKicker:"A quarter of the haven",storyHeading:"Its story",searchHint:"Try Harbour or Barad Nimras.",citadel:"the shipwrights' court",square:"the well court",citizen:"An Elf of the haven, going about the town."},
  districts:[
    {id:"q-household",name:"The Haven Household",lord:"Círdan",color:"#758fa9",sector:[315,45],hall:[0,48],motif:"low",heraldry:"Sea-blue and silver; an invented scheme",desc:"A household quarter for the people of the haven. "+MAP,fall:null,src:SRC},
    {id:"q-crafts",name:"Sailmakers and Weavers",lord:"The sailmakers",color:"#bfaa71",sector:[45,135],hall:[90,48],motif:"arch",heraldry:"Linen and gold; an invented scheme",desc:"Workshops supplying cloth and cordage for the harbour. "+MAP,fall:null,src:SRC},
    {id:"q-mariner",name:"The Mariners' Quarter",lord:"The mariners",color:"#47858f",sector:[135,225],hall:[180,48],motif:"pool",heraldry:"Teal and white; an invented scheme",desc:"Homes for the Elves who sailed the coastal waters. "+MAP,fall:null,src:SRC},
    {id:"q-wrights",name:"The Woodwrights' Quarter",lord:"The shipwrights",color:"#867854",sector:[225,315],hall:[270,48],motif:"forge",heraldry:"Weathered wood and silver; an invented scheme",desc:"Carpenters and smiths serving the shipyards. "+MAP,fall:null,src:SRC},
  ],
  places(E){const {P,H,THREE}=E; const surfaceY=(x,z)=>Math.hypot(x,z)<122?H:(wet(x,z)>.9?-1.5:cape(x,z));
    const place=(name,x,z,zoom,desc,color)=>({name,kicker:"The Falas",alt:name,color,desc,fall:null,src:SRC,pos:new THREE.Vector3(x,surfaceY(x,z),z),label:new THREE.Vector3(x,surfaceY(x,z)+18,z),fixedY:true,zoom,ring:12,tier:2});
    return {
      court:place("The Shipwrights' Court",0,-24,160,"A meeting hall for the haven's shipbuilders. Círdan ruled the Falathrim, but this hall and its location are invented.","#bfa875"),
      square:place("The Well Court",0,0,100,"A well and gathering place in the town. "+MAP,"#86a4a7"),
      gate:{name:"The Harbour Gate",kicker:"The Walled Haven",alt:"The way to the quays",color:"#dedaca",desc:"The havens were rebuilt with the aid of the Noldor. This gate opens toward the harbour. "+MAP,fall:null,src:SRC,pos:P(180,120),label:P(180,120,H+21),zoom:130,ring:14,tier:1},
      walls:{name:"The Walls of Eglarest",kicker:"The Walled Haven",alt:"Stone defenses of the haven",color:"#dedaca",desc:"Stone walls sheltered the haven, rebuilt through the friendship of Círdan and Finrod. This circular inner town and the harbour defenses are invented.",fall:"The havens fell to Morgoth's forces after the Nirnaeth Arnoediad; survivors escaped by sea.",src:SRC,pos:P(0,0),label:P(110,120,H+15),zoom:430,ring:0,tier:3},
      harbour:place("The Harbour",0,205,390,"Eglarest was a haven at the mouth of the Nenning. These quays, jetties and moored ships depict the maritime life of the Falathrim. "+MAP,"#548fa3"),
      shipyards:place("The Shipyards",-145,142,210,"Shipbuilders shape hulls beside timber stores and working sheds. The workshops and unfinished hulls are invented.","#ad916c"),
      market:place("The Quayside Market",155,132,200,"A coastal market with stores for visiting mariners. "+MAP,"#baa064"),
      nimras:place("Barad Nimras",-360,215,230,"Finrod raised Barad Nimras on the cape west of Eglarest to watch the sea. The tower's form and the shape of the cape are interpretations.","#eee9dc"),
      nenning:place("The Mouth of the Nenning",320,160,430,"Eglarest stood beside the mouth of the Nenning. This river course is schematic.","#599db0"),
      sea:place("Belegaer",0,470,650,"The western sea beyond the Falas, where Círdan's people sailed. The depicted vessels are interpretations.","#599db0"),
    };},
  groups:[["The Haven",["court","square","gate","walls"]],["Quarters","@districts"],["Coast and Harbour",["harbour","shipyards","market","nimras","nenning","sea"]]],
  reserves(){return [[0,0,23],[0,-27,20]];},
  markets:[{x:155,z:132,r:14,stalls:6}],
  settlements(){return [
    {along:[[-195,117],[-75,139]],side:-1,offset:12,rows:2,rowGap:16,spacing:8,w:[5,3],d:[5,2],district:3,owner:"shipyards"},
    {c:[215,65],r:42,n:14,clear:10,spacing:7,w:[5,3],d:[5,2],district:1,owner:"market"},
  ];},
  landmarks(E){const {THREE,adder,lam,own,UNIT_BOX,CYL,DISC,waterMat,addWater,H}=E;
    const build=(id,fn)=>{const g=new THREE.Group();fn(adder(g));own(id,g);};
    build("court",add=>{E.hall(add,0,-28,{w:28,d:15,h:10,y:H,porch:true,tower:true,roof:"#6b8996"});});
    build("square",add=>{const stone=lam("#ded7c3");add(DISC,stone,0,H,0,4,.6,4);add(CYL,stone,0,H+.6,0,2.8,1.1,2.8);addWater(add(DISC,waterMat(),0,H+1.7,0,2.5,.04,2.5).material);E.addFountainPOI(4,0);[45,135,225,315].forEach(b=>{const p=E.P(b,18);E.lamp(add,p.x,H,p.z);});});
    build("harbour",add=>{
      E.quay(add,QUAY,{y:1,w:7,lampEvery:36});
      [-150,-75,0,75,150].forEach((x,i)=>{const z=shore(x)-8,len=i===2?76:48;E.pier(add,[x,z],[x,z+len],{y:1,w:i===2?7:4,stone:i===2});
        [-1,1].forEach(s=>E.boat(add,x+s*8,z+24,-Math.PI/2,{len:14,sail:i%2===0,color:"#ddd7c2",sailColor:"#f1ead6"}));});
      [-1,1].forEach(s=>{const x=s*222,z=shore(x)+24;E.pier(add,[x,shore(x)-18],[x,z+54],{y:1,w:8,stone:true});E.tower(add,x,shore(x)-22,{r:5,h:25,roof:"#72919d"});});
      [[-120,350,.3],[160,410,1.1],[30,530,-.5]].forEach(([x,z,yaw])=>E.boat(add,x,z,yaw,{len:20,sail:true,sailColor:"#eee5cb"}));
    });
    build("shipyards",add=>{[-180,-126,-72].forEach((x,i)=>{E.hall(add,x,136,{w:26,d:12,h:7,roof:"#758c91"});
      E.boat(add,x,162,0,{len:18,y:2,color:"#9b7751"});for(const dx of [-6,0,6])add(UNIT_BOX,lam("#6d5136"),x+dx,0,162,.7,2,7);
      for(let k=0;k<4;k++)add(CYL,lam("#a18058"),x-10+k*2,1,150,.5,10,.5,Math.PI/2);});});
    build("market",add=>{E.hall(add,155,102,{w:30,d:12,h:8,porch:true});E.hall(add,190,133,{w:18,d:10,h:7,roof:"#7f8992"});});
    build("nimras",add=>{E.tower(add,-360,215,{r:8,h:62,roof:"#c8d1d5"});E.hall(add,-337,196,{w:17,d:10,h:6});});
    PATHS.forEach(p=>E.track(p.points,{w:p.to==="CAPE"?4:6,color:"#b5ae93",owner:p.to==="CAPE"?"nimras":"harbour"}));
    E.scatter({kind:"tree",n:110,area:{x0:-520,x1:500,z0:-550,z1:-175},size:[.8,1.5],seed:715,owner:"walls",keep:(x,z)=>Math.abs(x)>25&&Math.abs(x-350)>35});
  },
  people(E){const land=(x,z)=>new E.THREE.Vector3(x,E.surfaceY(x,z),z);return {
    lords:[],
    soldierNames:{0:"Haven guard",1:"Sailmakers' watch",2:"Harbour warden",3:"Shipyard watch"},
    townsfolk:[
      {role:"water",name:"Water-bearer",count:4,text:"Carrying fresh water to the houses."},
      {role:"merchant",name:"Chandler",text:"Trading supplies for the ships."},
      {role:"lore",name:"Keeper of the haven's records",count:2,text:"Recording the work of the haven."},
      {role:"gardener",name:"Gardener",count:3,text:"Tending the haven's gardens."},
      {role:"minstrel",name:"Singer of the Falas",count:2,text:"Singing beside the well court."},
      {role:"mason",name:"Shipwright",count:4,text:"Working on the ships and quays."},
      {role:"citizen",name:"Elf of the Falas",text:"Walking through the haven."},
      {role:"lamplighter",name:"Lantern-keeper",count:3,text:"Lighting the streets at dusk."},
    ],
    citizens:{count:24,sprites:["citizen","water","merchant","mason"]},
    guards:[{district:2,onText:"Keeping the harbour gate",offText:"Resting in the mariners' hall",posts:[-1,1].map(s=>({post:land(s*4,108),barracks:land(0,48),act:{kind:"pace",a:land(s*4,100),b:land(s*4,115)}}))}],
    locals:[
      {sprite:"mason",count:6,spread:12,name:"Shipwright of the Falas",house:"shipyards",a:land(-170,155),b:land(-70,155),home:land(-126,136),dayText:"Building ships beside the harbour"},
      {sprite:"merchant",count:4,spread:10,name:"Harbour trader",house:"market",a:land(140,132),b:land(168,132),home:land(155,102),dayText:"Trading at the quayside market"},
      {sprite:"citizen",count:6,spread:8,name:"Mariner",house:"harbour",a:land(-120,shore(-120)-10),b:land(120,shore(120)-10),home:land(0,48),dayText:"Walking the quays"},
      {soldier:0,count:2,spread:3,name:"Watcher of Barad Nimras",house:"nimras",a:land(-370,200),b:land(-350,200),home:land(-337,196),dayText:"Watching the western sea"},
    ],
  };},
  routines:{squareRing:17,squareCrowd:[8,15],markets:["76:90","76:270"],study:{name:"the shipwrights' court",x0:-8,x1:8,z:-16},minstrelBearings:[45,135,225,315],minstrelRadius:14,patrolRing:76},
};
})();


