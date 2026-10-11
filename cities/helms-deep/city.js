/* Helm's Deep: city data for citymaker. Build with:  python build.py helms-deep
   The Hornburg on its rock at the mouth of the Deep, the Deeping Wall, Helm's Dike, and the Glittering Caves of Aglarond.
   Geography follows The Two Towers, "Helm's Deep": the Hornburg stands on a heel of rock thrust out from the northern cliff;
   the Deeping Wall runs from it to the southern cliff; the Deeping Stream passes under the wall through a culvert;
   the Dike lies across the coomb further out; the caves are at the back of the Deep. Compass directions are this map's.
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){
const S_HD="The Two Towers, “Helm's Deep”", S_RI="The Two Towers, “The Road to Isengard”", S_APP="The Lord of the Rings, Appendix A";
const MAP="The garrison's quarters are this map's invention.";
const smooth=(a,b,v)=>{ const t=Math.min(1,Math.max(0,(v-a)/(b-a))); return t*t*(3-2*t); };
// the sides of the gorge: the Deep runs west behind the wall, the Deeping-coomb opens east
const northSide=x=>x<-120?80:x<0?80+(x+120)/120*-135:x<40?-55:-55-(x-40)*.3;   // the Deep narrows to a gorge behind the wall
const southSide=x=>x<0?150:150+x*.35;
const WALL_X=-28, WALL_TOP=10, CULVERT=[107,115];
const STREAM=[[-397,104],[-340,112],[-280,103],[-200,114],[-140,106],[-80,112],[WALL_X,111],[20,108],[90,116],[170,112],[260,124],[380,128],[520,134],[700,140]];

window.CITY={
  id:"helms-deep",
  style:"hornburg",                           // stone walls built by Gondor, Rohirric timber halls inside: styles/hornburg.js
  name:"Helm's Deep",
  title:"Helm's Deep from Above",
  tagline:"The Hornburg and the Deeping Wall, guarding the gorge of the Glittering Caves in the Westfold of Rohan",
  footnote:"The Hornburg, the Deeping Wall, the culvert, the Dike and the caves follow Tolkien's description; compass directions and the garrison's quarters are this map's interpretation.",
  searchPlaceholder:"Search the fortress, people, places",
  worldUrl:"https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf#middle-earth", worldLabel:"The map of Middle-earth",
  seed:2758,                                  // TA 2758, the Long Winter, when Helm Hammerhand held out here
  look:{sky:"#c2cfd8"},
  camera:{scale:1.7, dist:900, target:[-90,10,70], from:110},   // looking up the coomb into the Deep, as the enemy came

  // the Hornburg's rock: a small summit with sheer sides, joined to the northern cliff
  terrain:{height:32, summit:{radius:50,waves:[[3,.04,.5],[5,.03,1.7]]}, mountains:{from:900,to:1300,height:220}, plainFrom:99999, detail:480,
    colors:{top:"#a8a49a",topB:"#9e9a8f",rock1:"#8e8a82",rock2:"#6b6862",base:"#7f9c5b"},
    // the cliffs of the gorge, and the mountain wall at the back of the Deep
    shape(x,z){ const rough=1+.12*Math.sin(x*.045+z*.02)+.08*Math.sin(z*.07-x*.03);
      return (smooth(southSide(x),southSide(x)+16,z)*120+smooth(northSide(x),northSide(x)-24,z)*125+smooth(-402,-424,x)*140)*rough; }},
  levels:{height:6, radii:[24], ramp:10},     // the keep around the tower stands above the outer court
  fill:{rows:false, yards:false},             // a fortress: no rows of town houses
  streets:{
    rings:[],
    avenues:[{b:100,r0:8,w:6,main:true},{b:215,r0:8,w:3,main:false}],
    // from the postern down into the Deep and back to the caves
    paths:[{from:"E:215",points:[[-22.9,32.8],[-28.1,40.1],[-34.4,49.1],[-40.2,57.3],[-55,75],[-120,92],[-220,102],[-320,104],[-392,104]]}],
  },
  gate:{bearing:100, channel:false, posterns:[215]},   // the gates face the coomb; a postern opens toward the Deep
  squareStatues:[],

  text:{
    districtKicker:"Part of the garrison",
    storyHeading:"At the Battle of the Hornburg",
    searchHint:"Try a name, such as Erkenbrand or Gimli.",
    citadel:"the keep",
    square:"the court of the Hornburg",
    citizen:"One of the Westfold folk sheltering at Helm's Deep.",
  },

  districts:[
    {id:"d-watch",name:"Tower Watch",lord:"Erkenbrand, Lord of the Westfold",color:"#3e6b3a",sector:[325,55],hall:[10,37],motif:"hall",
      heraldry:"Green; the white horse of the Mark",desc:"The men who kept the tower of the Hornburg. Erkenbrand of the Westfold was its master. "+MAP,fall:null,src:S_HD},
    {id:"d-gate",name:"Gatewardens",lord:"The captain of the gate",color:"#8a6a44",sector:[55,145],hall:[60,37],motif:"hall",
      heraldry:"Brown and green",desc:"The guard of the great gates and the causeway. "+MAP,fall:null,src:S_HD},
    {id:"d-wall",name:"Wall Guard",lord:"Gamling the Old",color:"#6f8ea8",sector:[145,235],hall:[175,37],motif:"hall",
      heraldry:"Grey and green",desc:"The men who manned the Deeping Wall. "+MAP,fall:null,src:S_HD},
    {id:"d-stables",name:"Stables",lord:"The master of horse",color:"#a0784a",sector:[235,325],hall:[285,37],motif:"stable",
      heraldry:"Brown",desc:"The garrison's horses, inside the walls of the Burg. "+MAP,fall:null,src:S_HD},
  ],

  places(E){ const {THREE,P,H,edgeR,edgeS}=E; const V3=(x,y,z)=>new THREE.Vector3(x,y,z); return {
    "hornburg":{name:"The Hornburg",kicker:"The Hornburg",alt:"The tower on the rock at Helm's Gate",color:"#a19d94",showAs:"the Hornburg",
      desc:"A tower on a heel of rock thrust out from the northern cliff at the mouth of Helm's Deep, ringed by a great wall. Men of Gondor built it long ago, in the days of their power. It is named for Helm Hammerhand, who held out here through the Long Winter; when he blew his great horn from the tower, terror fell on his enemies.",
      fall:"Saruman's army of Orcs and Dunlendings assaulted it through a night of rain. At dawn the horn of Helm sounded again, Théoden rode out with his men, and the enemy fled into a forest of Huorns that had come into the coomb in the night.",src:S_HD+"; "+S_APP,
      pos:P(0,0),zoom:150,ring:14,label:P(0,0,H+44),tier:1},
    "gate":{name:"The Gates and the Causeway",kicker:"The Hornburg",alt:"The way up to the Hornburg",color:"#4a3826",
      desc:"The great gates of the Hornburg stood at the head of a causeway that climbed from the coomb. On this map they face east, down the coomb.",
      fall:"Through the night the Orcs battered the gates with rams. Aragorn and Éomer led a sally out of a postern and drove them back from the causeway.",src:S_HD,
      pos:P(100,edgeS-2),zoom:120,ring:13,label:P(100,edgeS-2,H+22),tier:1},
    "walls":{name:"The Walls of the Burg",kicker:"The Hornburg",alt:"Gondor's masonry",color:"#a19d94",
      desc:"A great wall of dressed stone ringed the rock, the work of Gondor's masons. On this map a postern opens on the west side, toward the Deep.",
      fall:null,src:S_HD,pos:P(0,0),zoom:300,ring:0,label:P(40,edgeR(40)-2,H+14),tier:3},
    "deeping-wall":{name:"The Deeping Wall",kicker:"Helm's Deep",alt:"From the Hornburg to the southern cliff",color:"#a19d94",fixedY:true,
      desc:"A wall of stone twenty feet high ran from the Hornburg across Helm's Gate to the southern cliff. It was wide enough for four men to walk abreast behind its parapet. The Deeping Stream passed out under it through a broad culvert.",
      fall:"Orcs crept in through the culvert, and were driven out. Later Saruman's blasting fire burst the culvert and broke the wall, and the enemy poured into the Deep.",src:S_HD,
      pos:V3(WALL_X,WALL_TOP,112),zoom:200,ring:0,label:V3(WALL_X,WALL_TOP+14,112),tier:1},
    "deep":{name:"Helm's Deep",kicker:"Helm's Deep",alt:"The gorge behind the Deeping Wall",color:"#5aa8d6",fixedY:true,
      desc:"The gorge behind the Deeping Wall, winding back into the Thrihyrne, the triple peak at the end of the White Mountains. Its sides were sheer cliffs, and the Deeping Stream ran down it from the caves.",
      fall:null,src:S_HD,pos:V3(-200,0,105),zoom:320,ring:0,label:V3(-200,18,105),tier:2},
    "aglarond":{name:"Aglarond, the Glittering Caves",kicker:"Helm's Deep",alt:"The caverns at the back of the Deep",color:"#cfe8ff",fixedY:true,showAs:"the Glittering Caves",
      desc:"At the back of the Deep lay the Glittering Caves of Aglarond, great caverns of glittering stone. During the battle the women, children and old folk of the Westfold took refuge in them.",
      fall:"Gimli was overwhelmed by their beauty. After the war he brought Dwarves from Erebor and became Lord of the Glittering Caves.",src:S_HD+"; "+S_RI+"; "+S_APP,
      pos:V3(-398,2,104),zoom:200,ring:0,label:V3(-398,34,104),tier:2},
    "dike":{name:"Helm's Dike",kicker:"Helm's Deep",alt:"The earthwork across the coomb",color:"#7d8f4f",fixedY:true,
      desc:"An earthwork and trench across the Deeping-coomb, well out in front of the Hornburg: the outermost defence of Helm's Deep.",
      fall:"At the end of the Long Winter, Helm Hammerhand was found dead upon the Dike, still standing.",src:S_HD+"; "+S_APP,
      pos:V3(380,4,60),zoom:300,ring:0,label:V3(380,16,60),tier:2},
    "coomb":{name:"The Deeping-coomb",kicker:"Helm's Deep",alt:"The green valley before the Hornburg",color:"#86a35f",fixedY:true,
      desc:"The green valley before the Hornburg, between the arms of the mountains. The Deeping Stream ran out through it toward the Westfold.",
      fall:"After the battle the coomb was filled with a forest of Huorns that had come in the night. The fleeing Orcs went in among the trees and were never seen again.",src:S_HD,
      pos:V3(180,0,60),zoom:500,ring:0,label:V3(180,14,60),tier:2},
  }; },
  groups:[["The Hornburg",["hornburg","gate","walls"]],["The Garrison","@districts"],["Helm's Deep",["deeping-wall","deep","aglarond","dike","coomb"]]],
  reserves(E){ return [[0,0,14]]; },

  landmarks(E){
    const {THREE,H,DEG,P,lam,adder,flat,paveMat,own,OCT,DISC,CYL,CONE,UNIT_BOX,BALL,HDOME,waterMat,glowSprite,addWater,addLantern,addHome,addFountainPOI,groundY,surfaceY,edgeR}=E;
    const STONE=lam("#a19d94"), STONE_B=lam("#8f8b83"), brazier=()=>lam("#ffb35c",{emissive:new THREE.Color("#b8641e")});
    { // the tower of the Hornburg on the keep, with its court
      const g=new THREE.Group(), add=adder(g), keep=groundY(0)-H;
      const disc=new THREE.CircleGeometry(15,64); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#b1ab9f",3),H+.03));
      add(OCT,STONE_B,0,H,0,8.4,4,8.4); add(CYL,STONE,0,H+4,0,6.4,28,6.4); add(OCT,STONE_B,0,H+32,0,7.4,1.4,7.4);
      for(let k=0;k<12;k++){ const a=k*Math.PI/6; add(UNIT_BOX,STONE,Math.sin(a)*6.9,H+33.4,Math.cos(a)*6.9,1.4,1.4,1.2,a); }
      add(UNIT_BOX,lam("#3a2a1c"),0,H,6.35,2.2,4,.3);                                   // the tower door
      for(const y of [12,20]) for(let k=0;k<4;k++){ const a=k*Math.PI/2+.4; add(UNIT_BOX,lam("#3b4654"),Math.sin(a)*6.45,H+y,Math.cos(a)*6.45,.8,1.6,.2,a); }
      add(CYL,lam("#4a3a2a"),0,H+33.4,0,.18,9,.18); add(UNIT_BOX,lam("#3e6b3a"),1.7,H+39.5,0,3.2,2.2,.12);   // the banner of the Mark
      addLantern(add(CONE,brazier(),3.6,H+33.4,3.6,.6,1,.6),3.6,3.6);
      own("hornburg",g); g.position.y=keep;
    }
    { // a stair down the rock from the postern into the Deep
      const g=new THREE.Group(), add=adder(g), pts=[[-34.4,49.1],[-40.2,57.3],[-48,66],[-55,75]];
      for(let i=0;i<pts.length-1;i++){ const [x0,z0]=pts[i], [x1,z1]=pts[i+1];
        for(let k=0;k<6;k++){ const f=(k+.5)/6, x=x0+(x1-x0)*f, z=z0+(z1-z0)*f, y=surfaceY(x,z);
          add(UNIT_BOX,STONE_B,x,y-2,z,3.2,2.2,Math.hypot(x1-x0,z1-z0)/6+.3,-Math.atan2(x1-x0,z1-z0)+Math.PI/2*0); } }
      own("walls",g);
    }
    { // the Deeping Wall: twenty feet high, four men wide, a parapet on the outer side, the culvert for the stream
      const g=new THREE.Group(), add=adder(g);
      for(let z=60;z<184;z+=2){
        const y0=Math.min(surfaceY(WALL_X,z),0)-1, inCulvert=z+1>CULVERT[0]&&z+1<CULVERT[1];
        const base=inCulvert?4:y0;
        add(UNIT_BOX,(z/2)%3?STONE:STONE_B,WALL_X,base,z+1,4.6,WALL_TOP-base,2.05);
        if(Math.floor(z/2)%2===0) add(UNIT_BOX,STONE,WALL_X+2.05,WALL_TOP,z+1,.6,1.5,1.1);   // merlons on the coomb side
      }
      add(UNIT_BOX,STONE_B,WALL_X,WALL_TOP,CULVERT[0]-.5,4.8,.4,1); add(UNIT_BOX,STONE_B,WALL_X,WALL_TOP,CULVERT[1]+.5,4.8,.4,1);
      for(let k=0;k<10;k++) add(UNIT_BOX,STONE_B,WALL_X-3.3,0,132-k*1.4,2,WALL_TOP-k,1.5);  // steps up from the Deep
      [78,112,146].forEach(z=>{ add(CYL,lam("#3a3632"),WALL_X-1.4,WALL_TOP,z,.15,1.6,.15); addLantern(add(CONE,brazier(),WALL_X-1.4,WALL_TOP+1.6,z,.5,.8,.5),WALL_X-1.4,z); });
      own("deeping-wall",g);
    }
    { // the Deeping Stream, from the caves down the Deep, through the culvert and out across the coomb
      const g=new THREE.Group(), w=lam("#4a86b0",{emissive:new THREE.Color("#0f2c40")}); addWater(w);
      for(let i=0;i<STREAM.length-1;i++){ const [x0,z0]=STREAM[i], [x1,z1]=STREAM[i+1], len=Math.hypot(x1-x0,z1-z0);
        for(let k=0;k<Math.ceil(len/12);k++){ const n=Math.ceil(len/12), f0=k/n, f1=(k+1)/n, xa=x0+(x1-x0)*f0, za=z0+(z1-z0)*f0, xb=x0+(x1-x0)*f1, zb=z0+(z1-z0)*f1;
          const xm=(xa+xb)/2, zm=(za+zb)/2, m=new THREE.Mesh(UNIT_BOX,w); m.position.set(xm,surfaceY(xm,zm)+.08,zm); m.scale.set(2.6,.12,len/n+.4); m.rotation.y=Math.atan2(xb-xa,zb-za); g.add(m); } }
      own("deep",g);
      [[-120,112],[-250,109],[-360,108]].forEach(([x,z])=>addFountainPOI(x,z));        // where the refugees fetch water
    }
    { // Helm's Dike: an earth bank and trench across the coomb, broken where the stream runs out
      const g=new THREE.Group(), add=adder(g), turf=lam("#7d8f4f"), ditch=lam("#5e7040"), X=380;
      for(let z=northSide(X)+10;z<southSide(X)-10;z+=8){ if(z>118&&z<138) continue; const y=surfaceY(X,z);
        add(UNIT_BOX,turf,X,y-1,z+4,7,5,8.2); add(UNIT_BOX,ditch,X+6,y-.2,z+4,4,.3,8.2); }
      own("dike",g);
    }
    { // Aglarond: the mouth of the Glittering Caves in the back wall of the Deep, glittering within
      const g=new THREE.Group(), add=adder(g), X=-405, Z=104, y=surfaceY(-394,Z);
      add(UNIT_BOX,lam("#1c1d22"),X,y-1,Z,3,15,18);
      for(const s of [-1,1]) add(UNIT_BOX,lam("#6b6862"),X+2,y-1,Z+s*10,6,18,3);
      add(UNIT_BOX,lam("#6b6862"),X+2,y+13,Z,6,4,22);
      const crystal=lam("#dff1ff",{emissive:new THREE.Color("#6f9fc8")});
      for(let k=0;k<14;k++){ const a=k*2.4; add(BALL,crystal,X+1.8,y+1+((k*5)%11),Z+Math.cos(a)*7,.25+(k%3)*.12,.6+(k%4)*.2,.25); }
      for(const s of [-1,1]){ const gl=glowSprite("rgba(200,230,255,.35)",14); gl.position.set(X+3,y+6,Z+s*3); g.add(gl); }
      for(const s of [-1,1]){ add(CYL,lam("#3a3632"),X+6,y,Z+s*7,.15,1.8,.15); addLantern(add(CONE,brazier(),X+6,y+1.8,Z+s*7,.5,.8,.5),X+6,Z+s*7); }
      own("aglarond",g);
      for(let k=0;k<6;k++) addHome(-396,96+k*3.2);                                        // the Westfold folk shelter in the caves
    }
  },

  // the cast. Sprite order: the lords below, then one soldier per garrison quarter (district order), then the townsfolk.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,edgeR,groundY,surfaceY}=E, K=groundY(0), WT=H+8.6;      // K: the keep; WT: the top of the Burg's wall
    const v3=(x,y,z)=>new THREE.Vector3(x,y,z), onWall=(b0,b1)=>({a:P(b0,edgeR(b0)-2.5,WT),b:P(b1,edgeR(b1)-2.5,WT)});
    const tower={hall:v3(0,K,7.2),nightText:"Asleep in the tower of the Hornburg"};
    const hallOf=(house,b,text)=>({hall:(()=>{ const p=P(b,30); return V(p.x,p.z); })(),nightText:"Asleep in the hall of the "+PLACES[house].name});
    const L=(i,name,short,house,o)=>Object.assign({i,name,short,house},o);
    return {
      lords:[
        L(0,"Erkenbrand, Lord of the Westfold","Erkenbrand","d-watch",Object.assign({kicker:"Master of the Hornburg",
          desc:"Lord of the Westfold and master of the Hornburg. In the battle he was away gathering men, and he came back at dawn with Gandalf to break the siege.",
          a:v3(-5,K,12.5),b:v3(5,K,12.5),dayText:"Keeping the Hornburg"},tower)),
        L(1,"Gamling the Old","Gamling","d-wall",Object.assign({kicker:"Captain on the Deeping Wall",
          desc:"An old warrior of the Westfold who fought on the Deeping Wall through the night of the battle.",
          a:v3(WALL_X,WALL_TOP,86),b:v3(WALL_X,WALL_TOP,102),dayText:"Walking the Deeping Wall"},hallOf("d-wall",175))),
        L(2,"Théoden, King of Rohan","Théoden","hornburg",Object.assign({kicker:"King of the Mark",
          desc:"The King took refuge in the Hornburg when Saruman's army marched on Rohan, and rode out at dawn at the head of his men.",
          a:v3(-4,K,-12.5),b:v3(4,K,-12.5),dayText:"Holding council in the court of the Hornburg"},tower)),
        L(3,"Éomer, Third Marshal of the Riddermark","Éomer","d-gate",Object.assign({kicker:"Third Marshal of the Riddermark",
          desc:"Théoden's nephew. With Aragorn he cleared the causeway in a sally from the postern."},
          {a:(()=>{ const p=P(92,40); return V(p.x,p.z); })(),b:(()=>{ const p=P(108,40); return V(p.x,p.z); })(),dayText:"Watching the gates"},hallOf("d-gate",60))),
        L(4,"Aragorn son of Arathorn","Aragorn","hornburg",Object.assign({kicker:"Heir of Isildur",
          desc:"The Ranger of the North who rode with Théoden to Helm's Deep and fought on its walls through the night."},onWall(118,134),{dayText:"Watching from the walls of the Burg"},tower)),
        L(5,"Gimli son of Glóin","Gimli","aglarond",Object.assign({kicker:"Dwarf of Erebor",
          desc:"A Dwarf of the Lonely Mountain. After the battle he spoke of the Glittering Caves as the greatest wonder he had seen, and later he made his home there."},
          {a:v3(-390,surfaceY(-390,98),98),b:v3(-390,surfaceY(-390,110),110),dayText:"Gazing into the Glittering Caves",hall:V(-396,104),nightText:"In the Glittering Caves"})),
        L(6,"Legolas of the Woodland Realm","Legolas","hornburg",Object.assign({kicker:"Elf of Mirkwood",
          desc:"An Elf of the Woodland Realm, who shot from the walls of the Hornburg and counted his kills against Gimli's."},onWall(148,164),{dayText:"Keeping watch from the walls"},tower)),
      ],
      soldierNames:{0:"Guard of the tower",1:"Gatewarden",2:"Archer of the Deeping Wall",3:"Horse-thegn of the stables"},
      soldierNotes:{0:"One of the men who kept the tower of the Hornburg.",2:"One of the archers who manned the Deeping Wall."},
      townsfolk:[
        {role:"water",name:"Westfold woman",count:10,text:"Sheltering at Helm's Deep, carrying water from the Deeping Stream."},
        {role:"mason",name:"Stonemason",count:6,text:"Mending the stonework of the Burg and the wall."},
        {role:"citizen",name:"Westfold elder",text:"An old man of the Westfold, sheltering at Helm's Deep."},
        {role:"lamplighter",name:"Watchman",count:4,text:"Lighting the braziers on the walls."},
      ],
      citizens:{count:30,sprites:["citizen","water","citizen","water"]},
      guards:[
        {district:0,onText:"On guard in the court of the Hornburg",offText:"Off duty in the tower",
          posts:[0,1,2,3].map(k=>{ const b=k*90+20, q=P(b,10); return {post:V(q.x,q.z),barracks:v3(k%2?2:-2,K,7.2),act:{kind:"circle",R:10,b}}; })},
        {district:1,onText:"Keeping the gates",offText:"Off duty in the gatewardens' hall",
          posts:[-1,1].map(s=>{ const b=100*Math.PI/180, base=P(100,edgeS-9), px=Math.cos(b)*s*4, pz=Math.sin(b)*s*4;
            const a=v3(base.x+px,H,base.z+pz), c=v3(base.x+px-Math.sin(b)*6,H,base.z+pz+Math.cos(b)*6);
            return {post:a.clone(),barracks:(()=>{ const p=P(60,30); return V(p.x,p.z); })(),act:{kind:"pace",a,b:c}}; })},
        {district:2,onText:"Watching from the Deeping Wall",offText:"Off duty in the wall guard's hall",
          posts:[[118,146],[70,96]].map(([z0,z1])=>({post:v3(WALL_X,WALL_TOP,z0),barracks:(()=>{ const p=P(175,30); return V(p.x,p.z); })(),act:{kind:"pace",a:v3(WALL_X,WALL_TOP,z0),b:v3(WALL_X,WALL_TOP,z1)}}))},
      ],
    };
  },
  routines:{
    squareRing:10,
    squareCrowd:[9,15],
    markets:[],
    study:{name:"the tower",x0:-3,x1:3,z:9},
    minstrelBearings:[150], minstrelRadius:9,
    patrolRing:29,
  },
};
})();
