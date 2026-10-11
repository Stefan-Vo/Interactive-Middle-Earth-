/* Edoras: city data for citymaker. Build with:  python build.py edoras
   The royal town of Rohan on its green hill, with Meduseld, the Golden Hall, at the top.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_TT="The Two Towers, “The King of the Golden Hall”", S_RK="The Return of the King", S_APP="The Lord of the Rings, Appendix A";
const MAP="This quarter is the map's invention; Tolkien does not describe the town's quarters.";

window.CITY={
  id:"edoras",
  style:"rohan",                              // how the town is built: styles/rohan.js
  name:"Edoras",
  title:"Edoras from Above",
  tagline:"The royal town of the Mark, on its green hill below the White Mountains, crowned by Meduseld",
  footnote:"Tolkien describes Meduseld, the spring, the walls and the mounds; the layout of the town and its quarters are this map's interpretation.",
  searchPlaceholder:"Search quarters, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#middle-earth", worldLabel:"The map of Middle-earth",
  seed:2510,                                  // TA 2510, when Eorl the Young came to Calenardhon
  look:{sky:"#c4d6e2"},

  // a green hill with gentle slopes, rising out of the plain; the White Mountains stand around
  terrain:{height:26, summit:{radius:130,waves:[[2,.05,1],[5,.03,2]]}, mountains:{from:650,to:1050,height:210}, plainFrom:285,
    profile:[[0,1],[.3,1],[.6,1],[.85,1],[.97,1],[1,1],[1.06,.9],[1.16,.7],[1.32,.45],[1.52,.22],[1.78,.07],[2.05,0]],
    colors:{top:"#8faa5e",topB:"#86a157",rock1:"#7f9c55",rock2:"#6f8c4b",base:"#86a35f"}},
  // three terraces: the town, the upper town, and the hilltop where Meduseld stands
  levels:{height:6, radii:[45,95], ramp:12},
  streets:{
    rings:[[78,4]],
    avenues:[180,60,300].map(b=>({b,r0:10,w:b===180?7:5,main:true}))
      .concat([0,120,240].map(b=>({b,r0:76,w:3.5,main:false}))),
  },
  gate:{bearing:180, channel:true, channelFrom:13},   // the street from the gates climbs south to north; the spring's stream runs down it
  squareStatues:[],

  text:{
    districtKicker:"A quarter of Edoras",
    storyHeading:"In the War of the Ring",
    searchHint:"Try a name, such as Théoden or Éowyn.",
    citadel:"the hilltop",
    square:"the green below Meduseld",
    citizen:"One of the Rohirrim, going about the town.",
  },

  // the quarters of the town (all this map's interpretation). sector = [from, to]; hall = [bearing, radius]
  districts:[
    {id:"q-household",name:"King's Household",lord:"Háma, the King's doorward",color:"#c9a227",sector:[0,60],hall:[30,62],motif:"spire",
      heraldry:"Green and gold; the white horse of Eorl",desc:"The house-carls of the King and the guard of Meduseld lodged here, closest to the Golden Hall. "+MAP,fall:null,src:S_TT},
    {id:"q-riders",name:"Riders' Quarter",lord:"Éomer, Third Marshal of the Riddermark",color:"#3e7b48",sector:[60,120],hall:[90,62],motif:"stable",
      heraldry:"Green; horse-tail crests on their helms",desc:"Riders of the King's éored, with their stables. The Rohirrim fought on horseback, in companies called éoreds. "+MAP,fall:null,src:S_TT},
    {id:"q-smiths",name:"Smiths' Quarter",lord:"The master smith",color:"#8e3f2c",sector:[120,180],hall:[150,62],motif:"forge",
      heraldry:"Iron and red",desc:"Forges for horseshoes, mail and spear-heads. "+MAP,fall:null,src:S_TT},
    {id:"q-herds",name:"Herdsmen's Quarter",lord:"The King's herd-master",color:"#a0784a",sector:[180,240],hall:[210,62],motif:"tree",
      heraldry:"Brown and green",desc:"Herdsmen and horse-breeders. The Rohirrim loved their horses above all things, and their herds were their wealth. "+MAP,fall:null,src:S_TT},
    {id:"q-westfold",name:"Westfold Quarter",lord:"Erkenbrand of the Westfold",color:"#6f8ea8",sector:[240,300],hall:[270,62],motif:"tower",
      heraldry:"Blue and white",desc:"Lodgings for the men of the Westfold when they came to Edoras; Erkenbrand was their lord. "+MAP,fall:null,src:S_TT},
    {id:"q-weavers",name:"Weavers' Quarter",lord:"The mistress of the looms",color:"#7b5ea8",sector:[300,360],hall:[330,62],motif:"rotunda",
      heraldry:"Many colors",desc:"Weavers and dyers. The walls of Meduseld were hung with woven cloths showing the old tales of the Mark. "+MAP,fall:null,src:S_TT},
  ],

  places(E){ const {THREE,P,H,edgeR,edgeS}=E; return {
    "meduseld":{name:"Meduseld, the Golden Hall",kicker:"The Hilltop",alt:"The hall of the Kings of the Mark",color:"#d9b04a",showAs:"Meduseld",
      desc:"The hall of the Kings of Rohan, built by Brego son of Eorl. From far off its roof seemed thatched with gold and shone across the plains. Inside, carved and painted pillars held the roof, a long hearth burned down the middle of the floor, and the walls were hung with woven cloths of the old tales of the Mark, among them Eorl the Young on a white horse.",
      fall:"Gandalf came here and freed Théoden from the counsel of Gríma Wormtongue. Théoden took up his sword again and rode out to war.",src:S_TT+"; "+S_APP,
      pos:P(0,29),zoom:150,ring:20,label:P(0,29,H+24),tier:1},
    "spring":{name:"The Horse Spring",kicker:"The Hilltop",alt:"The spring beside the stair of Meduseld",color:"#5aa8d6",
      desc:"Beside the stair that climbed to Meduseld, clear water poured from a stone carved like a horse's head into a wide basin, and from there ran down through the town as a stream.",
      fall:null,src:S_TT,pos:new THREE.Vector3(-6.5,H,-12),zoom:70,ring:5,label:new THREE.Vector3(-6.5,H+5,-12),tier:3},
    "square":{name:"The Green below Meduseld",kicker:"The Hilltop",alt:"Where the street from the gates ends",color:"#8fab5f",
      desc:"The open ground at the foot of the stair of Meduseld, at the top of the town, where the street from the gates ends. On this map it is the place people gather.",
      fall:null,src:S_TT,pos:P(0,0),zoom:100,ring:13,label:P(0,4,H+6),tier:2},
    "gate":{name:"The Gates of Edoras",kicker:"Walls and Fields",alt:"Where the road crosses the dike",color:"#a8916a",
      desc:"A road climbed the hill to the gates, and the King's guards questioned every stranger who came. On this map the gates face south, down the road past the mounds of the Kings.",
      fall:"Théoden rode out from these gates to Helm's Deep, and later to the aid of Gondor.",src:S_TT+"; "+S_RK,
      pos:P(180,edgeS-2),zoom:120,ring:14,label:P(180,edgeS-2,H+18),tier:1},
    "walls":{name:"The Dike, the Wall and the Fence",kicker:"Walls and Fields",alt:"The defenses of Edoras",color:"#7a5634",
      desc:"A dike, a strong wall and a thorny fence ran around the hill of Edoras. On this map the town also rises in three terraces with low walls between them; that part is the map's invention.",
      fall:null,src:S_TT,pos:P(0,0),zoom:420,ring:0,label:P(100,edgeR(100)-2,H+10),tier:3},
    "barrows":{name:"The Mounds of the Kings",kicker:"Walls and Fields",alt:"The barrows below the hill",color:"#f1f4f6",fixedY:true,
      desc:"Below the hill, beside the road, lay the burial mounds of the Kings of the Mark: the earlier line of kings on one side and the later on the other. White flowers called simbelmynë, Evermind, grew thick on them in every season.",
      fall:"After the war Théoden was brought home and laid in a new mound beside his fathers.",src:S_TT+"; "+S_RK,
      pos:P(180,390,0),zoom:300,ring:0,label:P(180,330,14),tier:2},
    "fields":{name:"The Horse Fields",kicker:"Walls and Fields",alt:"Herds of the Horse-lords",color:"#a0784a",fixedY:true,
      desc:"The Rohirrim were the Horse-lords, and their herds grazed the grasslands of the Mark. On this map a fenced horse field lies east of the hill.",
      fall:null,src:S_TT,pos:P(95,340,0),zoom:150,ring:0,label:P(95,340,10),tier:2},
    "hill":{name:"The Hill of Edoras",kicker:"Walls and Fields",alt:"At the foot of the White Mountains",color:"#86a35f",fixedY:true,
      desc:"Edoras stood on a green hill where the Snowbourn came down out of Harrowdale, under the White Mountains.",
      fall:null,src:S_TT,pos:P(0,10),zoom:560,ring:0},
  }; },
  groups:[["Meduseld",["meduseld","spring","square"]],["The Quarters","@districts"],["Walls and Fields",["gate","walls","barrows","fields","hill"]]],
  reserves(E){ return [[0,0,13.5],[0,-29,16.5],[-6.5,-12,3]]; },

  landmarks(E){
    const {THREE,H,DEG,P,lam,adder,flat,paveMat,own,GABLE,OCT,DISC,CYL,CONE,UNIT_BOX,PYRAMID,BALL,HDOME,waterMat,goldMat,glowSprite,addWater,addLantern,groundY,surfaceY}=E;
    const TOP=groundY(0)-H, T=H+3;                                    // the hilltop's lift; T: the terrace of Meduseld (in group space)
    { // the green at the top of the town, with four braziers
      const g=new THREE.Group(), add=adder(g);
      const disc=new THREE.CircleGeometry(12.5,72); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#b9a27a",3),H+.03));
      [45,135,225,315].forEach(b=>{ const q=P(b,10.5); add(CYL,lam("#4a3a2a"),q.x,H,q.z,.18,2.6,.18); add(CYL,lam("#3a3430"),q.x,H+2.6,q.z,.6,.45,.6);
        addLantern(add(CONE,lam("#ffb35c",{emissive:new THREE.Color("#b8641e")}),q.x,H+3,q.z,.45,.8,.45),q.x,q.z); });
      // the stream from the spring, across the green to the street
      const rill=new THREE.Mesh(UNIT_BOX,waterMat()); rill.position.set(-3.2,H+.04,.5); rill.scale.set(.9,.1,23.5); rill.rotation.y=Math.atan2(6.5,23); g.add(rill); addWater(rill.material);
      own("square",g); g.position.y=TOP;
    }
    { // the horse spring: a stone horse's head pouring into a wide basin
      const g=new THREE.Group(), add=adder(g), stone=lam("#b8b2a6");
      add(DISC,stone,-6.5,H,-12,1.9,.8,1.9); const w=add(DISC,waterMat(),-6.5,H+.78,-12,1.6,.08,1.6); addWater(w.material);
      add(UNIT_BOX,stone,-6.5,H,-13.9,1,2.6,.8);
      const neck=add(UNIT_BOX,stone,-6.5,H+2.3,-13.6,.55,1.3,.6); neck.rotation.x=.4;
      const head=add(UNIT_BOX,stone,-6.5,H+3,-13.1,.5,.55,1.3); head.rotation.x=.35;
      own("spring",g); g.position.y=TOP;
    }
    { // Meduseld: a stone terrace and stair, the long hall, the golden roof, carved pillars, crossed beams on the gables
      const g=new THREE.Group(), add=adder(g), stone=lam("#a8a296"), wood=lam("#5e3f24"), carve=lam("#7a5230");
      const gold=lam("#d9b04a",{emissive:new THREE.Color("#4a3206")});
      add(UNIT_BOX,stone,0,H,-29.5,22,3,29);                                        // the terrace
      for(let i=0;i<6;i++) add(UNIT_BOX,stone,0,H,-12.4-i*.5,8-i*.2,(i+1)*.5,.55);    // the stair
      for(const s of [-1,1]) add(UNIT_BOX,lam("#8f897d"),s*6,T,-16.4,2.6,.7,.9);     // stone seats at the top of the stair
      add(UNIT_BOX,stone,0,T,-29.5,12.5,1,26);                                      // footing
      add(UNIT_BOX,wood,0,T+1,-29.5,11,6,24);                                       // timber walls
      add(GABLE,gold,0,T+7,-29.5,14,7.5,27.4);                                      // the golden roof
      add(UNIT_BOX,gold,0,T+1,-17.45,3,4.6,.15);                                    // the doors
      for(const x of [-5,-2.6,2.6,5]){ add(CYL,carve,x,T+1,-16.6,.42,6,.42); add(CYL,gold,x,T+5.4,-16.6,.5,.3,.5); }   // carved pillars
      for(const z of [-16.2,-42.8]) for(const s of [-1,1]){ const m=add(UNIT_BOX,carve,0,T+13.6,z,.35,3.6,.35); m.rotation.z=s*.62; }  // crossed beams
      add(CYL,lam("#4a3a2a"),8.5,T,-15.6,.16,11,.16); add(UNIT_BOX,lam("#3e6b3a"),10.1,T+8,-15.6,3.2,2.4,.14);           // the green banner
      const shine=glowSprite("rgba(255,214,110,.35)",34); shine.position.set(0,T+11,-29.5); g.add(shine);
      own("meduseld",g); g.position.y=TOP;
    }
    { // the mounds of the Kings along the road below the hill, white with simbelmynë
      const g=new THREE.Group(), add=adder(g), turf=lam("#7fa05a"), flowers=lam("#f6f7f2"), road=lam("#a8916a");
      for(let r=280;r<580;r+=12){ const q=P(180,r), y=surfaceY(q.x,q.z); add(UNIT_BOX,road,q.x,y-.3,q.z,7.5,.5,12.4); }
      [[-1,9],[1,8]].forEach(([side,count])=>{ for(let i=0;i<count;i++){
        const z=300+i*27+(side>0?13:0), x=side*16, y=surfaceY(x,z);
        add(HDOME,turf,x,y-.4,z,7,3.6,7);
        for(let k=0;k<26;k++){ const a=k*2.4, rr=Math.sqrt((k+.5)/26)*6.2, fx=x+Math.cos(a)*rr, fz=z+Math.sin(a)*rr;
          const fy=y-.4+3.6*Math.sqrt(Math.max(0,1-(rr/7)**2)); add(BALL,flowers,fx,fy,fz,.32,.2,.32); } } });
      own("barrows",g);
    }
    { // a fenced horse field east of the hill, with a small herd
      const g=new THREE.Group(), add=adder(g), wood=lam("#6b4a2e"), c=P(95,340), w=90, d=56;
      const yAt=(x,z)=>surfaceY(x,z);
      for(let i=0;i<=36;i++){ const t=i/36, pts=[[c.x-w/2+t*w,c.z-d/2],[c.x-w/2+t*w,c.z+d/2]]; if(i<=22){ const u=i/22; pts.push([c.x-w/2,c.z-d/2+u*d],[c.x+w/2,c.z-d/2+u*d]); }
        pts.forEach(([x,z])=>add(CYL,wood,x,yAt(x,z),z,.18,1.8,.18)); }
      for(const z of [c.z-d/2,c.z+d/2]) for(const y of [.8,1.5]) add(UNIT_BOX,wood,c.x,yAt(c.x,z)+y,z,w,.14,.14);
      for(const x of [c.x-w/2,c.x+w/2]) for(const y of [.8,1.5]) add(UNIT_BOX,wood,x,yAt(x,c.z)+y,c.z,.14,.14,d);
      const COATS=["#6b4a2e","#8a5a34","#3a2a20","#c9c4bc","#a3784e","#2e2622","#d8d2c6","#7a5638","#5a3a26"];
      COATS.forEach((coat,i)=>{ const x=c.x-w*.35+((i*37)%9)/9*w*.7, z=c.z-d*.32+((i*23)%7)/7*d*.64, y=yAt(x,z), yaw=i*1.7, m=lam(coat);
        const h=new THREE.Group(), ha=adder(h); h.position.set(x,y,z); h.rotation.y=yaw; h.scale.setScalar(1.7); g.add(h);   // a little larger than life, to read from above
        ha(UNIT_BOX,m,0,1.3,0,2.4,1,.9);                                                       // body
        for(const lx of [-.9,.9]) for(const lz of [-.3,.3]) ha(UNIT_BOX,m,lx,0,lz,.22,1.35,.22);   // legs
        const neck=ha(UNIT_BOX,m,1.2,1.9,0,.45,1.2,.5); neck.rotation.z=-.6;
        const head=ha(UNIT_BOX,m,1.85,2.35,0,.9,.4,.4); head.rotation.z=i%3?-.9:-.2;            // some graze
        ha(UNIT_BOX,lam("#2a201a"),-1.35,1.3,0,.2,.9,.2); });
      own("fields",g);
    }
  },

  // the cast. Sprite order: the lords below, then one soldier per quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,levelOff,groundY}=E, T=groundY(0)+3;           // T: the terrace of Meduseld
    const lv=v=>{ v.y+=levelOff(v.x,v.z); return v; };
    const ring=(R,b,span)=>({a:lv(P(b-span,R)),b:lv(P(b+span,R))});
    const hall=(house,b)=>({hall:(()=>{ const p=P(b,70); return V(p.x,p.z); })(),
      dayText:"Walking near the hall of the "+PLACES[house].name,nightText:"Asleep in the hall of the "+PLACES[house].name});
    const meduseld={hall:V(0,-19).setY(T),nightText:"Asleep in Meduseld"};
    const terrace=(x0,z0,x1,z1)=>({a:new THREE.Vector3(x0,T,z0),b:new THREE.Vector3(x1,T,z1)});
    return {
      lords:[
        Object.assign({i:0,name:"Théoden, King of Rohan",short:"Théoden",house:"meduseld",kicker:"King of the Mark",
          desc:"Seventeenth King of the Mark. Old and bent under the counsel of Gríma Wormtongue until Gandalf roused him; then he rode to war at the head of the Rohirrim.",
          dayText:"Holding court at the doors of Meduseld"},terrace(-4,-16.6,4,-16.6),meduseld),
        Object.assign({i:1,name:"Éowyn, the White Lady of Rohan",short:"Éowyn",house:"meduseld",kicker:"Sister-daughter of the King",
          desc:"Théoden's niece, who cared for the King in his decline. She longed for deeds of valour, and later rode to war in disguise.",
          dayText:"Walking on the terrace of Meduseld"},terrace(9.5,-22,9.5,-38),meduseld),
        Object.assign({i:2,name:"Éomer, Third Marshal of the Riddermark",short:"Éomer",house:"q-riders",kicker:"Third Marshal of the Riddermark",
          desc:"Théoden's nephew, captain of the riders of the East-mark, and the King's heir after Théodred fell."},ring(78,90,3),hall("q-riders",90)),
        Object.assign({i:3,name:"Gríma Wormtongue",short:"Gríma",house:"meduseld",kicker:"Counsellor to the King",
          desc:"The King's counsellor, secretly in the pay of Saruman. His whispers kept Théoden weak and idle until Gandalf exposed him.",
          dayText:"Lurking on the terrace of Meduseld"},terrace(-9.5,-22,-9.5,-38),meduseld),
        Object.assign({i:4,name:"Háma, doorward of the King",short:"Háma",house:"meduseld",kicker:"Doorward of Meduseld",
          desc:"Captain of the King's guard, who kept the doors of Meduseld and made visitors give up their weapons before they entered.",
          dayText:"Keeping the stair of Meduseld"},{a:lv(new THREE.Vector3(-3,H,-10.5)),b:lv(new THREE.Vector3(3,H,-10.5))},meduseld),
        Object.assign({i:5,name:"Gamling",short:"Gamling",house:"q-household",kicker:"A warrior of the King's household",
          desc:"An old warrior of Rohan, who would later hold the Deeping Wall at Helm's Deep."},ring(78,30,3),hall("q-household",30)),
      ],
      soldierNames:{0:"Guard of the King's Household",1:"Rider of the Éored",2:"Smith of Edoras",3:"Herdsman of the Mark",4:"Spearman of the Westfold",5:"Shieldmaiden of Edoras"},
      soldierNotes:{0:"One of the King's guard, keeping watch on the green below Meduseld."},
      townsfolk:[
        {role:"water",name:"Water-carrier",count:8,text:"Carrying water from the wells and the horse spring."},
        {role:"merchant",name:"Trader",text:"Selling wool, leather and horse-gear at the market."},
        {role:"lore",name:"Lore-keeper",count:4,text:"A keeper of the songs and lore of the Mark."},
        {role:"gardener",name:"Gardener",count:8,text:"Tending the kitchen gardens of the town."},
        {role:"minstrel",name:"Minstrel",count:4,text:"A singer of the old songs of Eorl."},
        {role:"mason",name:"Wright",count:6,text:"A worker in timber, mending the houses and fences."},
        {role:"citizen",name:"Woman of Edoras",text:"One of the Rohirrim, out walking in the town."},
        {role:"lamplighter",name:"Fire-keeper",count:5,text:"On the way to light the braziers and the lamps of the greens."},
      ],
      citizens:{count:40,sprites:["citizen","citizen","water","merchant","gardener","minstrel"]},
      guards:[
        {district:0,onText:"Keeping watch on the green below Meduseld",offText:"Off duty in Meduseld",
          posts:[0,1,2,3].map(k=>{ const b=k*90+20, q=P(b,11); return {post:V(q.x,q.z),barracks:V(k%2?3:-3,-19).setY(T),act:{kind:"circle",R:11,b}}; })},
        {district:4,onText:"Keeping the gates of Edoras",offText:"Off duty in the gatehouse",
          posts:[-1,1].map(side=>{ const z=edgeS-14, a=new THREE.Vector3(side*4,H,z), b=new THREE.Vector3(side*4,H,z-8);
            return {post:a.clone(),barracks:V(side*6,104),act:{kind:"pace",a,b}}; })},
      ],
    };
  },
  routines:{
    squareRing:11,
    squareCrowd:[3.5,9.5],
    markets:["78:60","78:300"],
    study:{name:"Meduseld",x0:-3,x1:3,z:-12},
    minstrelBearings:[150,210,100,260], minstrelRadius:7,
    patrolRing:78,
  },
};
})();
