"""Build the Citymaker Sandbox into one self-contained page.

    python build_sandbox.py            ->  dist/sandbox.html

Combines sandbox/sandbox.html with engine/engine.css (the city pages' look), the building styles, engine/recipes.js,
engine/objects.js (the map objects, shared with exported cities), a set of library sprites for the people tool, and
sandbox/sandbox.js. Publish dist/sandbox.html with capabilities {"db":{}, "downloads":true}.
"""
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda *p: io.open(os.path.join(HERE, *p), encoding='utf-8').read()

STYLES = ['noldor', 'eldarin', 'rohan']
# the people tool's folk, and which library sprites each walks with (townsfolk and a guard or two)
FOLK = {
    'noldor': ['citizen', 'citizen-golden', 'water', 'merchant', 'gardener', 'minstrel', 'lore', 'mason', 'guard'],
    'rohirrim': ['citizen', 'farmer', 'water', 'merchant', 'gardener', 'herdsman', 'guard', 'shieldmaiden'],
    'edain': ['citizen', 'water', 'merchant', 'gardener', 'herdsman', 'woodwright', 'guard'],
    'sindar': ['hunter'],
}


GENERIC = {'citizen', 'citizen-golden', 'water', 'merchant', 'gardener', 'minstrel', 'lore', 'mason', 'lamplighter', 'guard', 'guard-golden',
           'archer', 'archer-golden', 'warden', 'smith', 'river-warden', 'bridge-guard', 'guard-of-fingolfin', 'farmer', 'herdsman', 'woodwright', 'hunter',
           'rider', 'shieldmaiden', 'spearman', 'gatewarden', 'horse-thegn', 'watchman', 'yeoman', 'stonemason', 'refugee', 'old-refugee'}
AGE = {'noldor': 'First Age', 'edain': 'First Age', 'sindar': 'First Age', 'rohirrim': 'Third Age', 'fellowship': 'Third Age'}


def characters():
    """The library's named characters (everyone who isn't a townsfolk or soldier type), with the words they were drawn from."""
    out = []
    for folk in ['noldor', 'edain', 'rohirrim', 'fellowship', 'sindar']:
        lib = json.load(io.open(os.path.join(HERE, 'library', folk, 'folk.json'), encoding='utf-8'))['sprites']
        for k, p in lib.items():
            if k in GENERIC:
                continue
            rec = {'key': folk + '/' + k, 'folk': folk, 'age': AGE[folk], 'n': p['name'], 'about': (p.get('prompt') or '').split(':', 1)[-1].strip()[:220], 'src': p['src']}
            walk = (p.get('anims') or {}).get('walk')
            if walk:
                rec['anims'] = {'walk': walk}
            out.append(rec)
    return sorted(out, key=lambda r: (r['age'], r['n']))


def sprites():
    out = {}
    for folk, keys in FOLK.items():
        lib = json.load(io.open(os.path.join(HERE, 'library', folk, 'folk.json'), encoding='utf-8'))['sprites']
        out[folk] = []
        for k in keys:
            if k not in lib:
                continue
            p = lib[k]
            rec = {'n': p['name'], 'src': p['src']}
            walk = (p.get('anims') or {}).get('walk')
            if walk:
                rec['anims'] = {'walk': walk}
            out[folk].append(rec)
    return out


def build():
    page = read('sandbox', 'sandbox.html')
    for marker, code in [('/*ENGINE_CSS*/', read('engine', 'engine.css')),
                         ('/*STYLES_JS*/', '\n'.join(read('styles', s + '.js') for s in STYLES)),
                         ('/*RECIPES_JS*/', read('engine', 'recipes.js')),
                         ('/*OBJECTS_JS*/', read('engine', 'objects.js')),
                         ('/*SPRITES_JS*/', 'window.SANDBOX_SPRITES=' + json.dumps(sprites(), separators=(',', ':')) + ';window.SANDBOX_CHARACTERS=' + json.dumps(characters(), separators=(',', ':')) + ';'),
                         ('/*SANDBOX_JS*/', read('sandbox', 'sandbox.js'))]:
        assert page.count(marker) == 1, marker
        page = page.replace(marker, code.replace('</script', '<\\/script'))
    os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
    out = os.path.join(HERE, 'dist', 'sandbox.html')
    io.open(out, 'w', encoding='utf-8').write(page)
    print(f'{out}  ({len(page.encode("utf-8")) // 1024} KB)')


if __name__ == '__main__':
    build()
