/* Template city for citymaker. Copy this folder to cities/<your-id>/, set id below to match, and fill in every TODO.
   Build with:  python build.py <your-id>     (open dist/<your-id>.html to look at it)
   The plain string fields at the top (id, name, title, tagline, footnote, searchPlaceholder) are read by build.py:
   keep them simple "strings" on one line each. See README.md for the whole workflow. */
(function(){
const SRC="TODO: the books or sources the lore comes from";

window.CITY={
  id:"_template",                                   // TODO: the folder name, e.g. "minas-tirith"
  style:"noldor",                                   // TODO: a style in styles/ (noldor, rohan, ...)
  name:"Example City",                              // TODO
  title:"Example City from Above",                  // TODO: the page title, 2-4 words
  tagline:"TODO: one line on what and where this city is",
  footnote:"TODO: a note on what is sourced and what is this map's interpretation.",
  searchPlaceholder:"Search districts, people, places",
  seed:1,                                           // any number; it decides where the generated houses go
  look:{sky:"#bcd3e2"},

  // the hill: a flat summit of this radius, its outline wobbled by sine waves [count, amount, phase]
  terrain:{height:30, summit:{radius:150,waves:[[3,.05,.7],[5,.03,2.1]]}, mountains:{from:800,to:1200,height:140}},
  // walled levels: each radius is a wall; the ground inside it is one level higher. Use radii:[] for a flat city.
  levels:{height:7, radii:[70], ramp:12},
  // ring roads [radius, width]; avenues: bearing b (0 = north, clockwise), start radius r0, width w, main = great avenue.
  // Keep ring roads at least 10 inside a level wall, so their fountain squares clear the wall.
  streets:{
    rings:[[58,5],[110,4]],
    avenues:[0,60,120,180,240,300].map(b=>({b,r0:22,w:b===180?8:6,main:true})),
  },
  gate:{bearing:180, channel:false},                // the outer gate must sit on a main avenue
  squareStatues:[],                                 // [bearing, radius, owner place id] statues around the central square

  text:{
    districtKicker:"One of the districts",          // TODO: e.g. "One of the Twelve Houses"
    storyHeading:"Its story",                        // TODO: heading over each place's second paragraph
    searchHint:"Try the name of a district.",
    citadel:"the upper city",                       // what the innermost level is called
    square:"the central square",
    citizen:"A citizen going about the city.",
  },

  // TODO: the districts. sector = [from, to] bearings (they should cover the circle); hall = [bearing, radius] of the
  // district's hall, between ring roads and away from avenues; motif = spire | low | tower | arch | pillar | snowtower |
  // wing | tree | dome | pool | rotunda | forge
  districts:[
    {id:"d-north",name:"North Quarter",lord:"TODO",color:"#b3373f",sector:[0,60],hall:[30,86],motif:"spire",heraldry:"TODO",desc:"TODO",fall:null,src:SRC},
    {id:"d-east",name:"East Quarter",lord:"TODO",color:"#3b7dc1",sector:[60,120],hall:[90,86],motif:"tower",heraldry:"TODO",desc:"TODO",fall:null,src:SRC},
    {id:"d-south-east",name:"Market Quarter",lord:"TODO",color:"#d6a32a",sector:[120,180],hall:[150,86],motif:"dome",heraldry:"TODO",desc:"TODO",fall:null,src:SRC},
    {id:"d-south-west",name:"Smiths' Quarter",lord:"TODO",color:"#8e3f2c",sector:[180,240],hall:[210,86],motif:"forge",heraldry:"TODO",desc:"TODO",fall:null,src:SRC},
    {id:"d-west",name:"Garden Quarter",lord:"TODO",color:"#3e7b48",sector:[240,300],hall:[270,86],motif:"tree",heraldry:"TODO",desc:"TODO",fall:null,src:SRC},
    {id:"d-north-west",name:"Temple Quarter",lord:"TODO",color:"#7b5ea8",sector:[300,360],hall:[330,86],motif:"rotunda",heraldry:"TODO",desc:"TODO",fall:null,src:SRC},
  ],

  // places in the Explore list. "walls" and "gate" are required; landmarks add their own.
  // pos = where a click flies to, zoom = how far, ring = selection ring size, label = where the name floats, tier 1-3 = how far out it shows
  places(E){ const {P,H,edgeS}=E; return {
    "keep":{name:"The Keep",kicker:"The Upper City",alt:"TODO",color:"#d8b34a",desc:"TODO",fall:null,src:SRC,
      showAs:"the Keep",pos:P(0,42),zoom:150,ring:20,label:P(0,42,H+40),tier:1},
    "square":{name:"The Central Square",kicker:"The Upper City",alt:"TODO",color:"#4f9fcf",desc:"TODO",fall:null,src:SRC,
      pos:P(0,0),zoom:110,ring:26,label:P(0,0,H+12),tier:2},
    "gate":{name:"The Gate",kicker:"Walls",alt:"TODO",color:"#e9e3d3",desc:"TODO",fall:null,src:SRC,
      pos:P(180,edgeS-2),zoom:120,ring:15,label:P(180,edgeS-2,H+21),tier:1},
    "walls":{name:"The Walls",kicker:"Walls",alt:"TODO",color:"#f4f1ea",desc:"TODO",fall:null,src:SRC,
      pos:P(0,0),zoom:420,ring:0,label:P(100,E.edgeR(100)-2,H+13),tier:3},
  }; },
  groups:[["The Upper City",["keep","square"]],["Districts","@districts"],["Walls",["gate","walls"]]],
  // ground the generated houses keep clear for the landmarks: [x, z, radius]
  reserves(E){ return [[0,0,27],[0,-42,17]]; },

  // TODO: the city's landmarks. These two show the pattern: build a THREE.Group at the right height, then own(placeId, group).
  landmarks(E){
    const {THREE,H,P,lam,adder,flat,paveMat,own,OCT,DISC,CYL,CONE,UNIT_BOX,PYRAMID,octWall,waterMat,goldMat,addWater,addLantern,groundY}=E;
    const top=groundY(0)-H;                                    // how far the upper level sits above the summit
    { // the central square: paving, a fountain, four lanterns
      const g=new THREE.Group(), add=adder(g), stone=lam("#f4f1e8");
      const disc=new THREE.CircleGeometry(26,96); disc.rotateX(-Math.PI/2); g.add(flat(disc,paveMat("#eee9dc",3),H+.03));
      octWall(add,stone,0,H,0,6.4,1.3,.8);
      addWater(add(OCT,waterMat(),0,H,0,6,1.1,6).material);
      add(CYL,stone,0,H,0,.7,4,.7); add(CONE,goldMat(),0,H+4,0,.5,1.6,.5);
      [45,135,225,315].forEach(b=>{ const q=P(b,20); add(CYL,lam("#6a6152"),q.x,H,q.z,.15,4.6,.15);
        addLantern(add(UNIT_BOX,lam("#ffd88a",{emissive:new THREE.Color("#b8741e")}),q.x,H+4.6,q.z,.7,.9,.7),q.x,q.z); });
      own("square",g); g.position.y=top;
    }
    { // the keep: a hall and a tower
      const g=new THREE.Group(), add=adder(g), white=lam("#f6f3ec"), slate=lam("#5c7d99");
      add(UNIT_BOX,white,0,H,-42,22,8,16); add(PYRAMID,slate,0,H+8,-42,23,5,17);
      add(OCT,white,0,H,-46,4.5,34,4.5); add(CONE,goldMat(),0,H+34,-46,5,10,5);
      own("keep",g); g.position.y=top;
    }
  },

  // the cast. Sprites are made with sprite_forge in this order: the lords (this list's order), then one soldier per district
  // (in district order), then the townsfolk (in the townsfolk list's order). Without sprites the city simply has no people.
  people(E){
    const {THREE,H,P,V,PLACES,edgeS,levelOff,groundY}=E;
    const lv=v=>{ v.y+=levelOff(v.x,v.z); return v; };
    return {
      lords:[
        {i:0,name:"TODO: the ruler's full name",short:"TODO",house:"keep",kicker:"Ruler of the city",desc:"TODO",
          a:lv(new THREE.Vector3(-6,H,-30)),b:lv(new THREE.Vector3(6,H,-30)),hall:V(0,-33),
          dayText:"Holding court before the keep",nightText:"Asleep in the keep"},
      ],
      soldierNames:{},                                 // optional names by district index, e.g. {0:"Guard of the North Quarter"}
      soldierNotes:{},
      townsfolk:[                                      // roles: water, merchant, lore, gardener, minstrel, mason, citizen, lamplighter
        {role:"water",name:"Water-carrier",count:10,text:"Carrying water from the fountains."},
        {role:"merchant",name:"Merchant",text:"A trader on the way to market."},
        {role:"lore",name:"Scholar",count:4,text:"A keeper of the city's lore."},
        {role:"gardener",name:"Gardener",count:8,text:"Tending one of the city's gardens."},
        {role:"minstrel",name:"Minstrel",count:4,text:"A musician wandering the streets."},
        {role:"mason",name:"Stonemason",count:6,text:"Keeping the city's stone in repair."},
        {role:"citizen",name:"Citizen",text:"A citizen out walking in the city."},
        {role:"lamplighter",name:"Lamplighter",count:6,text:"On the way to light the lanterns."},
      ],
      citizens:{count:50,sprites:["citizen","citizen","water","merchant","gardener"]},
      guards:[                                         // two shifts each; district picks whose soldier sprite they use
        {district:0,onText:"On guard in the central square",offText:"Off duty in the keep",
          posts:[0,1,2,3].map(k=>{ const b=k*90+20, q=P(b,23); return {post:V(q.x,q.z),barracks:V(k%2?3:-3,-33),act:{kind:"circle",R:23,b}}; })},
        {district:3,onText:"Keeping the gate",offText:"Off duty in the gatehouse",
          posts:[-1,1].map(side=>{ const z=edgeS-14, a=new THREE.Vector3(side*4,H,z), b=new THREE.Vector3(side*4,H,z-9);
            return {post:a.clone(),barracks:V(side*6,110+side*2),act:{kind:"pace",a,b}}; })},
      ],
    };
  },
  routines:{
    squareRing:23,                                     // the walk around the central square (inside the square's paving)
    squareCrowd:[11,21],
    markets:["110:60","110:240"],                      // fountain squares that hold markets: "ring radius:avenue bearing"
    study:{name:"the keep",x0:-6,x1:6,z:-31},
    minstrelBearings:[150,210,90,270], minstrelRadius:15,
    patrolRing:110,                                    // each district's soldiers patrol their stretch of this ring road
  },
};
})();
