"""Turn a map made in the Citymaker Sandbox into a city.

    python tools/sandbox_city.py <map.citymap.json> <city id> [--name "Name"] [--style noldor|eldarin|rohan]

Writes cities/<id>/city.js and cities/<id>/sprites/cast.txt; then build it with  python build.py <id>  and publish
dist/<id>.html like any city (capabilities {"db":{}}). The city's middle is the map's City centre marker (or the middle of
the map). The land, the water and the painted ground come from the map; every structure and bit of nature is rebuilt with
engine/objects.js, the same code the sandbox draws with; every object you named gets a card in the Explore list (with the
description you wrote); each group of people walks about its spot as locals. Edit the generated city.js freely afterwards:
add lore, lords and districts as for any city (see README.md).
"""
import argparse, collections, io, json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLK_OF_STYLE = {'noldor': 'noldor', 'eldarin': 'noldor', 'rohan': 'rohirrim'}
FOLK_SPRITE = {'noldor': 'citizen', 'rohirrim': 'citizen', 'edain': 'citizen', 'sindar': 'hunter'}
FOLK_NAME = {'noldor': 'One of the Noldor', 'rohirrim': 'One of the Rohirrim', 'edain': 'One of the Edain', 'sindar': 'One of the Grey-elves'}
TYPE_LABEL = {'house': 'House', 'village': 'Village', 'hall': 'Hall', 'tower': 'Tower', 'beacon': 'Beacon tower', 'town': 'Walled town',
              'market': 'Market', 'fountain': 'Fountain', 'camp': 'Camp', 'huts': 'Huts', 'wall': 'Wall', 'road': 'Road', 'bridge': 'Bridge',
              'stair': 'Stair', 'waterfall': 'Waterfall', 'quay': 'Quay', 'pier': 'Pier', 'boat': 'Boat', 'forest': 'Forest', 'pines': 'Pines',
              'cypresses': 'Cypresses', 'rocks': 'Rocks', 'reeds': 'Reeds', 'fields': 'Fields', 'herd': 'Herd', 'people': 'People',
              'greathall': 'Great Hall', 'kingstower': "King's Tower", 'lore': 'House of Lore', 'cloister': 'Great Cloister', 'song': 'Court of Song',
              'fountains': 'Court of Fountains', 'crafts': 'Hall of Crafts', 'greatfountain': "King's Fountain", 'twotrees': 'Two Trees',
              'whitetower': 'White Tower', 'greatgate': 'Great Gate', 'skybridge': 'Sky-bridge'}


def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('map'); ap.add_argument('id'); ap.add_argument('--name'); ap.add_argument('--style')
    a = ap.parse_args()
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', a.id):
        sys.exit('The city id must be lower-case letters, digits and hyphens, e.g. "my-town".')
    m = json.load(io.open(a.map, encoding='utf-8'))
    if m.get('app') != 'citymaker-sandbox':
        sys.exit(f'{a.map} is not a Citymaker Sandbox map (export one with the Export button).')
    name = a.name or m.get('name') or a.id
    objs = m.get('objs', [])
    centre = next((o for o in objs if o.get('t') == 'centre'), None)
    cx, cz = (centre['x'], centre['z']) if centre else (0.0, 0.0)

    # the city's own style: the one most structures use, unless given; any others come along as extra styles
    built = [o for o in objs if o.get('style')]
    styles = collections.Counter(o['style'] for o in built)
    style = a.style or (styles.most_common(1)[0][0] if styles else 'noldor')
    extra = sorted(s for s in styles if s != style)
    folk = FOLK_OF_STYLE.get(style, 'noldor')

    # move everything so the City centre is the middle; give each object a place id (its own card if named)
    places, groups_named, recs, locals_, extras, heroes = {}, [], [], [], [], []
    for i, o in enumerate(objs):
        o = dict(o)
        if o.get('t') == 'centre':
            continue
        o['x'] = round(o.get('x', 0) - cx, 2); o['z'] = round(o.get('z', 0) - cz, 2)
        if o.get('p2'): o['p2'] = [round(o['p2'][0] - cx, 2), round(o['p2'][1] - cz, 2)]
        if o.get('pts'): o['pts'] = [[round(p[0] - cx, 2), round(p[1] - cz, 2)] for p in o['pts']]
        pid = 'land'
        if o.get('name'):
            pid = 'obj-' + re.sub(r'[^a-z0-9]+', '-', o['name'].lower()).strip('-')[:40] + f'-{i}'
            places[pid] = {'name': o['name'], 'kicker': TYPE_LABEL.get(o['t'], 'Place'), 'desc': o.get('desc') or f"A {TYPE_LABEL.get(o['t'], 'place').lower()} on the map.", 'x': o['x'], 'z': o['z'], 'r': o.get('r', 30)}
            groups_named.append(pid)
        o['owner'] = pid
        if o['t'] == 'hero':
            heroes.append(o)
            continue
        if o['t'] == 'people':
            f = o.get('folk') or folk
            if f not in extras: extras.append(f)
            locals_.append({'extra': extras.index(f), 'count': min(40, o.get('n', 10)), 'spread': o.get('r', 30), 'x': o['x'], 'z': o['z'], 'r': o.get('r', 30),
                            'name': o.get('name') or FOLK_NAME.get(f, 'Townsfolk'), 'house': pid, 'desc': o.get('desc') or ''})
            continue
        recs.append(o)
    roads = [o['pts'] for o in recs if o['t'] == 'road' and o.get('pts')]
    lib = {}
    def char(key):
        folk, k = key.split('/', 1)
        if folk not in lib:
            lib[folk] = json.load(io.open(os.path.join(HERE, 'library', folk, 'folk.json'), encoding='utf-8'))['sprites']
        return lib[folk][k]
    lords = [{'i': i, 'name': (h.get('name') or char(h['hero'])['name']), 'short': (h.get('name') or char(h['hero'])['name']).split(',')[0], 'house': h['owner'],
              'desc': h.get('desc') or (char(h['hero']).get('prompt') or '').split(':', 1)[-1].strip(), 'x': h['x'], 'z': h['z']} for i, h in enumerate(heroes)]

    data = {'n': m['n'], 'size': m['size'], 'level': m.get('level', 0), 'h': m['h'], 'p': m.get('p', ''), 'cx': cx, 'cz': cz}
    title = name if len(name.split()) > 1 else name + ' from Above'
    city_js = f'''/* {name}: a city made in the Citymaker Sandbox and turned into a city by tools/sandbox_city.py.
   The land, the water, the painted ground and every structure come from the map; the cards come from the names and descriptions
   given in the sandbox. Edit freely: add lore, lords, districts and landmarks as for any city (README.md).
   The plain string fields at the top are read by build.py: keep them simple "strings". */
(function(){{
const MAP={js(data)};
const RECS={js(recs)};
const PLACES_={js(places)};
const LOCALS={js(locals_)};
const LORDS={js(lords)};
const ROADS={js(roads)};
// the map's height grid and painted ground, decoded once; heights are sampled around the City centre
const N=MAP.n, CELL=MAP.size/(N-1), HALF=MAP.size/2, unb64=s=>{{ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }};
const Q=new Uint16Array(unb64(MAP.h).buffer), HT=new Float32Array(N*N), PAINT=MAP.p?unb64(MAP.p):new Uint8Array(N*N); for(let i=0;i<N*N;i++) HT[i]=Q[i]/64-100;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)), sm=(a,b,v)=>{{ const t=cl((v-a)/(b-a),0,1); return t*t*(3-2*t); }};
function heightAt(x,z){{ const fx=cl((x+MAP.cx+HALF)/CELL,0,N-1.001), fz=cl((z+MAP.cz+HALF)/CELL,0,N-1.001), ix=Math.floor(fx), iz=Math.floor(fz), tx=fx-ix, tz=fz-iz, i=iz*N+ix;
  return (HT[i]*(1-tx)+HT[i+1]*tx)*(1-tz)+(HT[i+N]*(1-tx)+HT[i+N+1]*tx)*tz; }}
const paintAt=(x,z)=>PAINT[cl(Math.round((z+MAP.cz+HALF)/CELL),0,N-1)*N+cl(Math.round((x+MAP.cx+HALF)/CELL),0,N-1)];
const GROUND=[null,"#7ea253","#a9bf6a","#d9c99a","#9a7d58","#8e8a82","#eef2f4"], H0=heightAt(0,0)+.3, LEVEL=MAP.level;

window.CITY={{
  id:{js(a.id)},
  style:{js(style)},
  extraStyles:{js(extra)},
  name:{js(name)},
  title:{js(title)},
  tagline:{js("Designed in the Citymaker Sandbox")},
  footnote:{js("This place was designed in the Citymaker Sandbox; its names and stories are its maker's.")},
  searchPlaceholder:"Search places, people",
  seed:1,
  look:{{sky:"#bfd2df"}},
  camera:{{scale:1, dist:1500, target:[0,H0,0], from:135, limit:1150}},
  terrain:{{height:H0, flat:true, summit:{{radius:20,waves:[]}}, mountains:{{from:99999,to:100001,height:0}}, plainFrom:99999, detail:420, fine:1150, rough:0,
    shape:heightAt,
    tint:(x,z,y,c)=>{{ const p=paintAt(x,z), n=.5+.5*Math.sin(x*.011+2*Math.cos(z*.009))*Math.cos(z*.006-x*.004);
      if(p&&GROUND[p]){{ c.set(GROUND[p]).multiplyScalar(.93+.1*n); return; }}
      const sl=Math.hypot(heightAt(x+5,z)-heightAt(x-5,z),heightAt(x,z+5)-heightAt(x,z-5))/10;
      c.set("#8aa763").lerp(new THREE.Color("#6c8d4c"),n).lerp(new THREE.Color("#d6c79a"),sm(LEVEL+3.5,LEVEL+.6,y)*(1-sm(.35,.6,sl)))
        .lerp(new THREE.Color("#8a877e"),Math.max(sm(.55,1,sl),sm(70,130,y))).lerp(new THREE.Color("#f1f4f6"),sm(200,260,y)*(1-sm(.9,1.4,sl))); }},
    water:{{level:LEVEL,bed:LEVEL-5,place:"land",center:[-MAP.cx,-MAP.cz],size:[MAP.size,MAP.size]}}}},
  walls:false,
  fill:{{rows:false,yards:false}},
  streets:{{rings:[], avenues:[{{b:0,r0:2,w:3,main:true}}],
    paths:ROADS.map(pts=>({{from:"E:0",points:[[0,-10],...pts]}}))}},   // people walk the roads drawn in the sandbox
  gate:{{bearing:180, channel:false, stair:false}},
  squareStatues:[],
  text:{{districtKicker:"Its people", storyHeading:"Its story", searchHint:"Try the name of a place.", citadel:"the middle of the town", square:"the middle of the town", citizen:"One of the people of this land."}},
  districts:[{{id:"d-people",name:{js("The people of " + name)},lord:"Their own leaders",color:"#6f8ea8",sector:[0,360],hall:[90,13],motif:"low",heraldry:"Their own colors",desc:"The people who live in this land.",fall:null,src:"Citymaker Sandbox"}}],
  places(E){{ const {{THREE,P,H}}=E, V3=(x,y,z)=>new THREE.Vector3(x,y,z), out={{
      "square":{{name:"The Middle of the Town",kicker:{js(name)},alt:"Where the map's City centre stands",color:"#e6e0d2",desc:"The middle of the town, where the City centre marker stood in the sandbox.",fall:null,src:"Citymaker Sandbox",pos:P(0,0),zoom:140,ring:12,label:P(0,0,H+12),tier:2}},
      "land":{{name:{js(name)},kicker:"The land",alt:"Everything on the map",color:"#86a35f",fixedY:true,desc:"The land as it was designed in the Citymaker Sandbox.",fall:null,src:"Citymaker Sandbox",pos:V3(0,H,0),zoom:900,ring:0,tier:3}}}};
    for(const [id,p] of Object.entries(PLACES_)){{ const y=heightAt(p.x,p.z); out[id]={{name:p.name,kicker:p.kicker,alt:null,color:"#d8b34a",fixedY:true,desc:p.desc,fall:null,src:"Citymaker Sandbox",
      pos:V3(p.x,y,p.z),zoom:Math.max(120,p.r*3),ring:0,label:V3(p.x,y+30,p.z),tier:1}}; }}
    return out; }},
  groups:[[{js(name)},["square",...{js(groups_named)},"land"]],["Its people","@districts"]],
  reserves(E){{ return [[0,0,20]]; }},
  landmarks(E){{
    // one kit per style: the city's own recipes, plus a copy of them in each extra style the map used
    const kits={{}}, kit=st=>kits[st]||(kits[st]=(()=>{{ if(st===E.CITY.style||!window.STYLES[st]) return window.CITYMAKER_OBJECTS(E);
      const K=Object.assign(Object.create(E),{{STYLE:window.STYLES[st]}}); Object.assign(K,window.CITYMAKER_RECIPES(K)); return window.CITYMAKER_OBJECTS(K); }})());
    RECS.forEach(r=>{{ const g=new THREE.Group(); kit(r.style||E.CITY.style).build(r,E.adder(g),r.owner,g); E.own(r.owner,g); }});
    E.addHome(0,0); E.addFountainPOI(0,6); E.addGardenPOI(0,0,8);   // somewhere to live, fetch water and stroll even on a bare map
  }},
  people(E){{
    const {{THREE}}=E, land=(x,z)=>new THREE.Vector3(x,E.surfaceY(x,z),z);
    return {{
      lords:LORDS.map(L=>({{i:L.i,name:L.name,short:L.short,house:L.house,kicker:"A main character",desc:L.desc,a:land(L.x-6,L.z),b:land(L.x+6,L.z),hall:land(L.x,L.z+4),
        dayText:"Walking here",nightText:"Resting nearby"}})),
      soldierNames:{{0:"Guard"}},
      townsfolk:[
        {{role:"water",name:"Water-carrier",count:4,text:"Carrying water."}},{{role:"merchant",name:"Trader",text:"A trader."}},{{role:"lore",name:"Loremaster",count:1,text:"A keeper of lore."}},
        {{role:"gardener",name:"Gardener",count:3,text:"Tending a garden."}},{{role:"minstrel",name:"Minstrel",count:1,text:"A singer."}},{{role:"mason",name:"Mason",count:2,text:"Keeping the stonework in repair."}},
        {{role:"citizen",name:"Townsfolk",text:"One of the people of this land."}},{{role:"lamplighter",name:"Lamplighter",count:2,text:"Lighting the lamps."}}],
      citizens:{{count:16,sprites:["citizen","water","gardener"]}},
      extras:{js([FOLK_NAME.get(f, f) for f in extras])},
      locals:LOCALS.map(L=>({{extra:L.extra,count:L.count,spread:L.spread,name:L.name,kicker:"People",house:L.house,desc:L.desc||undefined,
        a:land(L.x-L.r/2,L.z),b:land(L.x+L.r/2,L.z+L.r/3),home:land(L.x,L.z),dayText:"Going about their day"}})),
      guards:[],
    }};
  }},
  routines:{{squareRing:8, squareCrowd:[3,7], markets:[], study:{{name:"the town",x0:-2,x1:2,z:4}}, minstrelBearings:[90,270], minstrelRadius:6, patrolRing:14}},
}};
}})();
'''
    city_dir = os.path.join(HERE, 'cities', a.id)
    os.makedirs(os.path.join(city_dir, 'sprites'), exist_ok=True)
    io.open(os.path.join(city_dir, 'city.js'), 'w', encoding='utf-8').write(city_js)
    cast = [f'# {name}: made in the Citymaker Sandbox. Sprites in map order: the main characters; the district\'s soldier; the townsfolk; extras for the people groups.',
            *([' '.join(h['hero'] for h in heroes)] if heroes else []),
            f'{folk}/guard', f'{folk}/townsfolk']
    if extras:
        cast.append(' '.join(f'{f}/{FOLK_SPRITE.get(f, "citizen")}' for f in extras) + '   # extras: ' + ', '.join(extras))
    io.open(os.path.join(city_dir, 'sprites', 'cast.txt'), 'w', encoding='utf-8').write('\n'.join(cast) + '\n')
    print(f'cities/{a.id}/city.js  ({len(recs)} objects, {len(places)} named places, {len(locals_)} groups of people, style {style}{", extra " + ", ".join(extra) if extra else ""})')
    print(f'next:  python build.py {a.id}')


if __name__ == '__main__':
    main()
