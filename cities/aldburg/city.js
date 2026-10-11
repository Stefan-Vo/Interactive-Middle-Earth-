/* Aldburg: city data for citymaker. Build with:  python build.py aldburg
   The old town of the Folde, where Eorl the Young had his house before Edoras was built, held afterwards by the line of
   Eofor, Brego's third son, and in the War of the Ring the home of Éomer, Third Marshal of the Riddermark.
   Tolkien says little of the place itself: its quarters, the House of Eorl's look, the riders' field, the fields of the
   Folde and the road are this map's interpretation. North is toward Edoras and the open plain; the White Mountains are south.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_APP="The Lord of the Rings, Appendix A, “The House of Eorl”", S_UT="Unfinished Tales, “The Battles of the Fords of Isen”";
const S_TT="The Two Towers, “The Riders of Rohan”", S_RK="The Return of the King";
const MAP="This quarter is the map's invention; Tolkien does not describe the town.";
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
const hash=(i,k)=>{ const v=Math.sin(i*127.1+k*311.7)*43758.5453; return v-Math.floor(v); };   // scatter that is the same every load
// the land off the hill: the flat Folde, rising in the south into the foothills and the White Mountains
function landY(x,z){
  const rough=1+.14*Math.sin(x*.021+z*.013)+.09*Math.sin(z*.047-x*.031);
  return smooth(250,380,z)*(9+5*Math.sin(x*.03))+smooth(330,620,z)*(220+60*Math.sin(x*.011)+35*Math.sin(x*.027+1))*rough;
}
const GATE_B=330, MUSTER={b:95,r:330,w:130,d:84};          // the riders' field lies east of the hill

window.CITY={
  id:"aldburg",
  style:"rohan",                              // timber halls, thatch, an earth bank and palisade: styles/rohan.js
  name:"Aldburg",
  title:"Aldburg from Above",
  tagline:"The old town of the Folde, where Eorl the Young had his house, and the home of Éomer, Third Marshal of the Riddermark",
  footnote:"Eorl's house, the line of Eofor and Éomer's home here come from Tolkien; the town's layout, its quarters, the riders' field and the fields of the Folde are this map's interpretation.",
  searchPlaceholder:"Search quarters, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#middle-earth", worldLabel:"The map of Middle-earth",
  seed:2545,                                  // TA 2545, the year Eorl fell in the Wold
  look:{sky:"#c6d6e0"},
  camera:{scale:.8, dist:1050, target:[0,8,110], from:340},   // from the north, along the road from Edoras, with the mountains behind

  // a green hill with gentle slopes, standing out of the farmland of the Folde
  terrain:{height:22, summit:{radius:105,waves:[[2,.05,2.2],[5,.03,.6]]}, mountains:{from:99999,to:100001,height:0}, plainFrom:99999, detail:360,
    profile:[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.06,.9],[1.16,.7],[1.32,.45],[1.52,.22],[1.78,.07],[2.05,0]],
    colors:{top:"#8faa5e",topB:"#86a157",rock1:"#7f9c55",rock2:"#6f8c4b",base:"#86a35f"},
    shape:landY},
  // two terraces: the town, and the hilltop where the House of Eorl stands
  levels:{height:6, radii:[38], ramp:12},
  fill:{yards:{courts:1,gardens:2}},           // a smaller town than Edoras: fewer yards, so the houses have room
  streets:{
    rings:[[72,4]],
    avenues:[GATE_B,90,210].map(b=>({b,r0:10,w:b===GATE_B?7:5,main:true}))
      .concat([30,150,270].map(b=>({b,r0:70,w:3.5,main:false}))),
  },
  gate:{bearing:GATE_B, channel:false},       // the gate faces north-west, toward the road to Edoras
  squareStatues:[],

  text:{
    districtKicker:"A quarter of Aldburg",
    storyHeading:"Its story",
    searchHint:"Try a name, such as Éomer or Éowyn.",
    citadel:"the hilltop",
    square:"the green before the House of Eorl",
    citizen:"One of the Rohirrim of the Folde, going about the town.",
  },

  // the quarters of the town (all this map's interpretation). sector = [from, to]; hall = [bearing, radius]
  districts:[
    {id:"q-household",name:"Eofor's Household",lord:"Éomer, Third Marshal of the Riddermark",color:"#3e6b3a",sector:[330,30],hall:[0,54],motif:"hall",
      heraldry:"Green; the white horse of Eorl",desc:"The house-carls of the lords of Aldburg, the line of Eofor son of Brego, lodged closest to the House of Eorl. "+MAP,fall:null,src:S_APP},
    {id:"q-riders",name:"Riders of the East-mark",lord:"Éomer, Third Marshal of the Riddermark",color:"#6f8ea8",sector:[30,90],hall:[60,54],motif:"stable",
      heraldry:"Green and white; horse-tail crests",desc:"Riders of Éomer's éored and their horses. The Rohirrim fought on horseback in companies called éoreds, and Éomer commanded in the East-mark. "+MAP,fall:null,src:S_UT+"; "+S_TT},
    {id:"q-smiths",name:"Smiths' Quarter",lord:"The master smith",color:"#8e3f2c",sector:[90,150],hall:[120,54],motif:"forge",
      heraldry:"Iron and red",desc:"Forges for horseshoes, bits and spear-heads. "+MAP,fall:null,src:S_APP},
    {id:"q-folde",name:"Folde-farmers' Quarter",lord:"The reeve of the Folde",color:"#c9a227",sector:[150,210],hall:[180,54],motif:"tree",
      heraldry:"Gold and green",desc:"The farmers of the Folde, whose fields spread around the hill, kept their barns and granaries here. "+MAP,fall:null,src:S_APP},
    {id:"q-herds",name:"Herdsmen's Quarter",lord:"The herd-master of Aldburg",color:"#a0784a",sector:[210,270],hall:[240,54],motif:"tower",
      heraldry:"Brown and green",desc:"Herdsmen and horse-breeders. The horses of the Mark were its pride and its wealth. "+MAP,fall:null,src:S_APP},
    {id:"q-weavers",name:"Weavers' Quarter",lord:"The mistress of the looms",color:"#7b5ea8",sector:[270,330],hall:[300,54],motif:"rotunda",
      heraldry:"Many colors",desc:"Spinners, weavers and dyers of the wool of the Folde. "+MAP,fall:null,src:S_APP},
  ],

  places(E){ const {THREE,P,H,edgeR,edgeS}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z), m=P(MUSTER.b,MUSTER.r); return {
    "eorl-house":{name:"The House of Eorl",kicker:"The Hilltop",alt:"The first royal seat of the Mark",color:"#c9a95c",showAs:"the House of Eorl",
      desc:"Eorl the Young had his house at Aldburg after Cirion, Steward of Gondor, gave the land of Calenardhon to his people, and it was the first seat of the Kings of the Mark. When Brego, Eorl's son, built Meduseld at Edoras, the kings went there, and Aldburg passed to Brego's third son, Eofor. His line held it until the end of the Third Age. On this map the old hall stands on the hilltop, thatched rather than golden.",
      fall:"Éomund of Eofor's line, Chief Marshal of the Mark, lived here with Théodwyn, Théoden's sister; their children Éomer and Éowyn grew up here. When Éomund was killed by Orcs and Théodwyn died soon after, Théoden took the children into his own house at Edoras. Éomer later returned as Third Marshal, and after the War of the Ring he became King of the Mark.",
      src:S_APP+"; "+S_UT,pos:P(180,24),zoom:150,ring:17,label:P(180,24,H+24),tier:1},
    "green":{name:"The Green",kicker:"The Hilltop",alt:"Before the doors of the House of Eorl",color:"#8fab5f",
      desc:"The open ground at the top of the town, before the doors of the old hall, where the street from the gate ends. On this map it has a well and four braziers.",
      fall:null,src:S_APP,pos:P(0,0),zoom:100,ring:12,label:P(330,6,H+6),tier:2},
    "gate":{name:"The Gate of Aldburg",kicker:"Walls and Fields",alt:"Where the road to Edoras begins",color:"#a8916a",
      desc:"The gate of the town, at the head of the road down the hill. On this map it faces north-west, toward Edoras.",
      fall:null,src:S_APP,pos:P(GATE_B,edgeS-2),zoom:120,ring:14,label:P(GATE_B,edgeS-2,H+18),tier:1},
    "walls":{name:"The Bank and the Palisade",kicker:"Walls and Fields",alt:"The defenses of Aldburg",color:"#7a5634",
      desc:"Its name means the old burg, or fortified town. On this map an earth bank and a log palisade with timber watchtowers ring the hill, as at Edoras.",
      fall:null,src:S_APP,pos:P(0,0),zoom:380,ring:0,label:P(100,edgeR(100)-2,H+10),tier:3},
    "muster":{name:"The Riders' Field",kicker:"Walls and Fields",alt:"Where the éored gathers",color:"#6f8ea8",fixedY:true,
      desc:"Éomer, Third Marshal of the Riddermark, commanded the riders of the East-mark, and his home was at Aldburg. On this map his éored gathers on a fenced field east of the hill, with its horses and tents.",
      fall:"Éomer rode out against the Orcs that had crossed Rohan carrying off Merry and Pippin, and destroyed them at the eaves of Fangorn, against Gríma's counsel. There he met Aragorn, Legolas and Gimli, and lent them horses.",
      src:S_UT+"; "+S_TT,pos:V3(m.x,1,m.z),zoom:260,ring:0,label:V3(m.x,16,m.z),tier:2},
    "folde":{name:"The Folde",kicker:"Walls and Fields",alt:"The farmland around Aldburg",color:"#c9b45a",fixedY:true,
      desc:"The Folde was the country about Aldburg, under the White Mountains some miles south-east of Edoras. On this map its fields and hedgerows spread around the hill.",
      fall:null,src:S_APP+"; "+S_RK,pos:V3(-300,1,120),zoom:520,ring:0,label:V3(-300,14,120),tier:2},
    "road":{name:"The Road to Edoras",kicker:"Walls and Fields",alt:"North-west across the Folde",color:"#a8916a",fixedY:true,
      desc:"The way from Aldburg to Edoras, the King's town, a few miles to the north-west. On this map it leaves the gate and runs off across the fields.",
      fall:null,src:S_APP,pos:V3(-260,1,-420),zoom:420,ring:0,label:V3(-260,14,-420),tier:2},
    "mountains":{name:"The White Mountains",kicker:"Walls and Fields",alt:"Ered Nimrais",color:"#d9dde2",fixedY:true,
      desc:"Ered Nimrais, the White Mountains, the long range that formed the southern border of Rohan, rising behind the Folde.",
      fall:null,src:S_APP,pos:V3(0,150,520),zoom:800,ring:0,label:V3(0,260,520),tier:2},
  }; },
  groups:[["The House of Eorl",["eorl-house","green"]],["The Quarters","@districts"],["Walls and Fields",["gate","walls","muster","folde","road","mountains"]]],
  reserves(E){ return [[0,0,12],[0,24,15]]; },

  landmarks(E){
    const {THREE,H,DEG,P,lam,adder,flat,paveMat,own,instanced,M,GABLE,OCT,DISC,CYL,CONE,UNIT_BOX,PYRAMID,BALL,waterMat,glowSprite,addWater,addLantern,addFountainPOI,groundY,edgeS}=E;
    const TOP=groundY(0)-H, T=H+2.6;                                  // the hilltop's lift; T: the terrace of the hall (in group space)
    const brazier=()=>lam("#ffb35c",{emissive:new THREE.Color("#b8641e")});
    { // the green: turf, a well, four braziers
      const g=new THREE.Group(), add=adder(g), stone=lam("#b8b2a6"), wood=lam("#5e3f24");
      const disc=new THREE.CircleGeometry(11.5,72); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#b9a27a",3),H+.03));
      const wq=P(330,4.5); add(DISC,stone,wq.x,H,wq.z,1.6,.9,1.6); const w=add(DISC,waterMat(),wq.x,H+.85,wq.z,1.25,.06,1.25); addWater(w.material);
      for(const s of [-1,1]) add(UNIT_BOX,wood,wq.x+s*1.3,H,wq.z,.2,2.6,.2); add(GABLE,lam("#b8963e"),wq.x,H+2.6,wq.z,3.4,1.2,1.8);
      addFountainPOI(wq.x,wq.z+2.2);
      [45,135,225,315].forEach(b=>{ const q=P(b,10); add(CYL,lam("#4a3a2a"),q.x,H,q.z,.18,2.6,.18); add(CYL,lam("#3a3430"),q.x,H+2.6,q.z,.6,.45,.6);
        addLantern(add(CONE,brazier(),q.x,H+3,q.z,.45,.8,.45),q.x,q.z); });
      own("green",g); g.position.y=TOP;
    }
    { // the House of Eorl: an old timber hall on a low stone terrace, thatched, its gables crowned with carved horse heads
      const g=new THREE.Group(), add=adder(g), stone=lam("#a8a296"), wood=lam("#56391f"), carve=lam("#7a5230"), thatch=lam("#b8963e");
      const Z=24;                                                                    // the hall's middle; its doors face north, onto the green
      add(UNIT_BOX,stone,0,H,Z,17,2.6,26);                                            // the terrace
      for(let i=0;i<5;i++) add(UNIT_BOX,stone,0,H,Z-13.3-i*.5,7-i*.2,2.6-i*.52,.55);  // steps down to the green
      add(UNIT_BOX,stone,0,T,Z,10.4,.8,22);                                           // footing
      add(UNIT_BOX,wood,0,T+.8,Z,9.4,5.2,21);                                         // timber walls
      for(let k=0;k<6;k++) for(const s of [-1,1]) add(UNIT_BOX,carve,s*4.75,T+.8,Z-9+k*3.6,.4,5.2,.4);   // posts along the walls
      add(GABLE,thatch,0,T+6,Z,12.2,6.6,24);                                          // the thatched roof
      add(UNIT_BOX,lam("#3a2a1c"),0,T+.8,Z-10.55,2.8,4,.15);                          // the doors
      for(const x of [-3.6,-1.8,1.8,3.6]){ add(CYL,carve,x,T+.8,Z-11.6,.36,5.2,.36); }   // a porch of carved pillars
      add(UNIT_BOX,wood,0,T+6,Z-11.9,9,.5,2.2);
      for(const z of [Z-12,Z+12]){ const s=z<Z?-1:1;                                  // horse heads where the barge-boards cross
        for(const side of [-1,1]){ const b=add(UNIT_BOX,carve,side*.7,T+12.2,z,.34,3.2,.34); b.rotation.z=side*.62; b.rotation.x=s*.1; }
        const neck=add(UNIT_BOX,carve,0,T+12.6,z+s*.2,.5,1.6,.5); neck.rotation.x=-s*.35;
        const head=add(UNIT_BOX,carve,0,T+13.9,z+s*.75,.45,.5,1.3); head.rotation.x=-s*.25; }
      add(CYL,lam("#6a5a48"),0,T+12.6,Z,.3,1.6,.3);                                   // the smoke-hole of the long hearth
      const smoke=glowSprite("rgba(230,226,215,.28)",9); smoke.position.set(0,T+15.5,Z); g.add(smoke);
      add(CYL,lam("#4a3a2a"),7.4,T,Z-11.6,.16,11,.16); add(UNIT_BOX,lam("#3e6b3a"),9,T+8,Z-11.6,3.2,2.4,.14);   // the green banner of the Marshal
      add(UNIT_BOX,lam("#f1f1ea"),9,T+8.6,Z-11.52,1.2,1,.03);                          // a white horse on it (just a hint)
      for(const s of [-1,1]){ add(CYL,lam("#3a3430"),s*5,T,Z-13.5,.18,2.4,.18); addLantern(add(CONE,brazier(),s*5,T+2.4,Z-13.5,.45,.8,.45),s*5,Z-13.5); }
      own("eorl-house",g); g.position.y=TOP;
    }
    { // the fields of the Folde (engine recipe): grain, grass and ploughland with hedgerows, around the hill and the riders' field
      const m=P(MUSTER.b,MUSTER.r), roadD=(x,z)=>{ const a=P(GATE_B,226), b=P(312,1300), dx=b.x-a.x, dz=b.z-a.z, L=dx*dx+dz*dz, f=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L)); return Math.hypot(x-a.x-dx*f,z-a.z-dz*f); };
      E.fields({area:{x0:-14*52,x1:14*52,z0:-12*42,z1:5*42},seed:30,owner:"folde",
        avoid:(x,z)=>Math.hypot(x,z)<232||landY(x,z)>3||roadD(x,z)<20||(Math.abs(x-m.x)<MUSTER.w/2+12&&Math.abs(z-m.z)<MUSTER.d/2+12)});
    }
    { // the road to Edoras, from the foot of the hill north-west across the fields
      const road=[], a=P(GATE_B,222), b=P(312,1300), N=Math.ceil(a.distanceTo(b)/10);
      for(let k=0;k<N;k++){ const x=a.x+(b.x-a.x)*(k+.5)/N, z=a.z+(b.z-a.z)*(k+.5)/N;
        road.push({m:M(x,landY(x,z)-.2,z,Math.atan2(-(b.z-a.z),b.x-a.x),a.distanceTo(b)/N+.4,.5,7.5),c:"#a8916a",o:"road"}); }
      instanced(UNIT_BOX,lam("#ffffff"),road,false);
    }
    { // snow on the high peaks of the White Mountains
      const snow=[]; for(let i=0;i<160;i++){ const x=-1300+hash(i,20)*2600, z=500+hash(i,21)*520, y=landY(x,z); if(y<170) continue;
        snow.push({m:M(x,y-6,z,i,14+hash(i,22)*12,10,14+hash(i,23)*12),c:"#f1f4f6",o:"mountains"}); }
      instanced(new THREE.IcosahedronGeometry(1,0),lam("#ffffff"),snow,false);
    }
    { // the riders' field: a fence, tents, banners and the éored's horses
      const g=new THREE.Group(), add=adder(g), wood=lam("#6b4a2e"), c=P(MUSTER.b,MUSTER.r), w=MUSTER.w, d=MUSTER.d;
      for(let i=0;i<=40;i++){ const t=i/40, pts=[[c.x-w/2+t*w,c.z-d/2],[c.x-w/2+t*w,c.z+d/2]]; if(i<=26){ const u=i/26; pts.push([c.x-w/2,c.z-d/2+u*d],[c.x+w/2,c.z-d/2+u*d]); }
        pts.forEach(([x,z])=>{ if(x<c.x-w/2+.1&&Math.abs(z-c.z)<5) return; add(CYL,wood,x,landY(x,z),z,.18,1.8,.18); }); }   // a gap in the west fence, toward the town
      for(const z of [c.z-d/2,c.z+d/2]) for(const y of [.8,1.5]) add(UNIT_BOX,wood,c.x,landY(c.x,z)+y,z,w,.14,.14);
      for(const y of [.8,1.5]){ add(UNIT_BOX,wood,c.x+w/2,landY(c.x+w/2,c.z)+y,c.z,.14,.14,d); for(const s of [-1,1]) add(UNIT_BOX,wood,c.x-w/2,landY(c.x-w/2,c.z)+y,c.z+s*(d/4+2.5),.14,.14,d/2-5); }
      [[-40,-26],[-26,-28],[-12,-26],[-40,26],[-26,28]].forEach(([dx,dz],k)=>{ const x=c.x+dx, z=c.z+dz;   // tents along the north and south fences
        add(GABLE,lam(k%2?"#e8e2d0":"#7c9a5a"),x,landY(x,z),z,6,4.4,8); });
      [[-8,0],[6,-14],[6,14]].forEach(([dx,dz])=>{ const x=c.x+dx, z=c.z+dz;                         // banners of the éored
        add(CYL,lam("#4a3a2a"),x,landY(x,z),z,.16,9,.16); add(UNIT_BOX,lam("#3e6b3a"),x+1.6,landY(x,z)+6.4,z,3.2,2.2,.12); });
      E.herd(add,c.x+w*.2,c.z,12,{spread:w*.24,seed:30});                                   // the éored's horses (engine recipe)
      for(const s of [-1,1]){ const x=c.x-w/2-2, z=c.z+s*6; add(CYL,lam("#3a3430"),x,landY(x,z),z,.18,2.4,.18); addLantern(add(CONE,brazier(),x,landY(x,z)+2.4,z,.45,.8,.45),x,z); }
      own("muster",g);
    }
  },

  // the cast. Sprite order: the lords below, then one soldier per quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,levelOff,groundY}=E, T=groundY(0)+2.6, c=P(MUSTER.b,MUSTER.r);     // T: the terrace of the House of Eorl
    const lv=v=>{ v.y+=levelOff(v.x,v.z); return v; };
    const ring=(R,b,span)=>({a:lv(P(b-span,R)),b:lv(P(b+span,R))});
    const hall=(house,b)=>({hall:(()=>{ const p=P(b,64); return V(p.x,p.z); })(),
      dayText:"Walking near the hall of the "+PLACES[house].name,nightText:"Asleep in the hall of the "+PLACES[house].name});
    const eorl={hall:V(0,18).setY(T),nightText:"Asleep in the House of Eorl"};
    const field=(dx0,dz0,dx1,dz1)=>({a:new THREE.Vector3(c.x+dx0,landY(c.x+dx0,c.z+dz0),c.z+dz0),b:new THREE.Vector3(c.x+dx1,landY(c.x+dx1,c.z+dz1),c.z+dz1)});
    return {
      lords:[
        Object.assign({i:0,name:"Éomer, Third Marshal of the Riddermark",short:"Éomer",house:"eorl-house",kicker:"Third Marshal of the Riddermark",
          desc:"Son of Éomund and Théodwyn, Théoden's sister-son, and of the line of Eofor. He commanded the riders of the East-mark, and his home was here at Aldburg. After the War of the Ring he became King of the Mark.",
          dayText:"Before the doors of the House of Eorl",a:new THREE.Vector3(-4.5,T,11.8),b:new THREE.Vector3(4.5,T,11.8)},eorl),
        Object.assign({i:1,name:"Éowyn of Rohan",short:"Éowyn",house:"eorl-house",kicker:"Sister of Éomer",
          desc:"Éomer's sister, who spent her childhood here until their father fell and their mother died, and Théoden took them both to Edoras. On this map she has come home for a while; that visit is the map's invention.",
          dayText:"Walking on the green"},ring(9,200,40),eorl),
        Object.assign({i:2,name:"Éothain, rider of Éomer's éored",short:"Éothain",house:"muster",kicker:"A rider of the East-mark",
          desc:"One of the riders of Éomer's éored. He rode with Éomer after the Orcs across the plains of Rohan, and was there when the riders met Aragorn, Legolas and Gimli."},
          field(-30,-6,20,-6),hall("q-riders",60),{dayText:"With the horses on the riders' field"}),
      ],
      soldierNames:{0:"Guard of Eofor's Household",1:"Rider of the East-mark",2:"Smith of Aldburg",3:"Yeoman of the Folde",4:"Herdsman of the Folde",5:"Shieldmaiden of Aldburg"},
      soldierNotes:{0:"One of the guard of the House of Eorl, keeping watch on the green.",1:"One of the riders of Éomer's éored."},
      townsfolk:[
        {role:"water",name:"Water-carrier",count:7,text:"Carrying water from the wells of the town."},
        {role:"merchant",name:"Trader",text:"Selling wool, grain and horse-gear at the market."},
        {role:"lore",name:"Lore-keeper",count:3,text:"A keeper of the songs of Eorl, who had his house here."},
        {role:"gardener",name:"Farmer of the Folde",count:8,text:"Working the kitchen gardens and the fields of the Folde."},
        {role:"minstrel",name:"Minstrel",count:3,text:"A singer of the old songs of the Mark."},
        {role:"mason",name:"Wright",count:5,text:"A worker in timber, mending the houses and fences."},
        {role:"citizen",name:"Woman of Aldburg",text:"One of the Rohirrim of the Folde, out walking in the town."},
        {role:"lamplighter",name:"Fire-keeper",count:4,text:"On the way to light the braziers of the green and the hall."},
      ],
      citizens:{count:32,sprites:["citizen","citizen","water","merchant","gardener","minstrel"]},
      guards:[
        {district:0,onText:"Keeping watch on the green before the House of Eorl",offText:"Off duty in the House of Eorl",
          posts:[0,1,2,3].map(k=>{ const b=k*90+20, q=P(b,10); return {post:V(q.x,q.z),barracks:V(k%2?3:-3,18).setY(T),act:{kind:"circle",R:10,b}}; })},
        {district:1,onText:"Keeping the gate of Aldburg",offText:"Off duty in the riders' hall",
          posts:[-1,1].map(side=>{ const tb=(GATE_B+90)*Math.PI/180, a0=P(GATE_B,edgeS-14), a1=P(GATE_B,edgeS-22);
            const off=new THREE.Vector3(Math.sin(tb)*side*4,0,-Math.cos(tb)*side*4), a=a0.clone().add(off), b=a1.clone().add(off);
            return {post:a.clone(),barracks:(()=>{ const p=P(60,64); return V(p.x,p.z); })(),act:{kind:"pace",a,b}}; })},
      ],
    };
  },
  routines:{
    squareRing:10,
    squareCrowd:[3.5,8.5],
    markets:["72:90","72:210"],
    study:{name:"the House of Eorl",x0:-3,x1:3,z:9.6},
    minstrelBearings:[150,210,100,260], minstrelRadius:7,
    patrolRing:72,
  },
};
})();
