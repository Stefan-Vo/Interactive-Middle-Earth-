"""Build one city into a single self-contained page.

    python build.py gondolin            ->  dist/gondolin.html

Combines engine/shell.html + engine/engine.css + engine/recipes.js + engine/engine.js with styles/<style>.js, cities/<id>/city.js and the city's
sprites (cities/<id>/sprites/people.json, made by tools/collect_sprites.py, and any shared ones from library/
that cities/<id>/sprites/cast.txt names). The page loads three.js from a CDN
and needs nothing else.
"""
import html, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda *p: io.open(os.path.join(HERE, *p), encoding='utf-8').read()

# The plain "string" fields at the top of city.js that the page shell needs.
SHELL_FIELDS = ['id', 'style', 'name', 'title', 'tagline', 'footnote', 'searchPlaceholder']


def shell_fields(city_js):
    found = {}
    for key in SHELL_FIELDS:
        m = re.search(r'^\s*' + key + r'\s*:\s*("(?:[^"\\]|\\.)*")', city_js, re.M)
        if not m:
            sys.exit(f'city.js needs a plain string field {key}:"..." near the top')
        found[key] = json.loads(m.group(1))
    return found


TOWNSFOLK = ['water', 'merchant', 'lore', 'gardener', 'minstrel', 'mason', 'citizen', 'lamplighter']


def cast(city_dir):
    """The city's sprites in map order. Without a sprites/cast.txt that is just its own people.json. With one, each
    word in cast.txt is one or more sprites: own (all of people.json), own:3 or own:0-5 (some of it, by place),
    <folk>/<key> (one sprite from library/<folk>), or <folk>/townsfolk (that folk's eight townsfolk, in the usual order)."""
    own_path = os.path.join(city_dir, 'sprites', 'people.json')
    own = json.load(io.open(own_path, encoding='utf-8')) if os.path.exists(own_path) else []
    cast_path = os.path.join(city_dir, 'sprites', 'cast.txt')
    if not os.path.exists(cast_path):
        return own
    out, folks = [], {}
    for line in io.open(cast_path, encoding='utf-8'):
        for word in line.split('#', 1)[0].split():
            if word == 'own':
                out += own
            elif word.startswith('own:'):
                a, _, b = word[4:].partition('-')
                picks = own[int(a):int(b or a) + 1]
                if len(picks) != int(b or a) - int(a) + 1:
                    sys.exit(f'cast.txt asks for {word}, but people.json has only {len(own)} sprites')
                out += picks
            elif '/' in word:
                folk, key = word.split('/', 1)
                if folk not in folks:
                    path = os.path.join(HERE, 'library', folk, 'folk.json')
                    if not os.path.exists(path):
                        sys.exit(f'cast.txt asks for {word}, but there is no library/{folk}/folk.json')
                    folks[folk] = json.load(io.open(path, encoding='utf-8'))['sprites']
                for k in (TOWNSFOLK if key == 'townsfolk' else [key]):
                    if k not in folks[folk]:
                        sys.exit(f'cast.txt asks for {folk}/{k}, which library/{folk} does not have (python tools/library.py list {folk})')
                    out.append(folks[folk][k])
            else:
                sys.exit(f'cast.txt: cannot read "{word}"')
    return out


def build(city_id):
    city_dir = os.path.join(HERE, 'cities', city_id)
    if not os.path.isdir(city_dir):
        sys.exit(f'No city folder at cities/{city_id}')
    city_js = read('cities', city_id, 'city.js')
    f = shell_fields(city_js)
    if f['id'] != city_id:
        sys.exit(f'cities/{city_id}/city.js says id:"{f["id"]}"; the folder and the id must match')

    # a style may extend another (extends:"rohan"); include the chain, base first
    styles, name = [], f['style']
    while name:
        path = os.path.join(HERE, 'styles', name + '.js')
        if not os.path.exists(path):
            sys.exit(f'style "{name}" was asked for, but there is no styles/{name}.js')
        code = io.open(path, encoding='utf-8').read()
        styles.insert(0, code)
        m = re.search(r'^\s*extends\s*:\s*"([\w-]+)"', code, re.M)
        name = m.group(1) if m else None

    sprites = [{'n': p['name'], 'src': p['src']} for p in cast(city_dir)]
    if not sprites:
        print('note: no sprites/people.json or sprites/cast.txt, so the city will have no people')

    page = read('engine', 'shell.html')
    for key, val in [('TITLE', f['title']), ('NAME', f['name']), ('TAGLINE', f['tagline']),
                     ('FOOTNOTE', f['footnote']), ('SEARCH_PLACEHOLDER', f['searchPlaceholder'])]:
        page = page.replace('{{' + key + '}}', html.escape(val, quote=True))
    # Insert code last, with str.replace on unique markers, so nothing inside it is treated as a placeholder.
    for marker, code in [('/*ENGINE_CSS*/', read('engine', 'engine.css')),
                         ('/*STYLE_JS*/', chr(10).join(styles)),
                         ('/*CITY_JS*/', city_js),
                         ('/*CITY_SPRITES*/', 'window.CITY.sprites=' + json.dumps(sprites, separators=(',', ':')) + ';'),
                         ('/*RECIPES_JS*/', read('engine', 'recipes.js')),
                         ('/*ENGINE_JS*/', read('engine', 'engine.js'))]:
        assert page.count(marker) == 1, marker
        page = page.replace(marker, code.replace('</script', '<\\/script'))

    os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
    out = os.path.join(HERE, 'dist', city_id + '.html')
    io.open(out, 'w', encoding='utf-8').write(page)
    print(f'{out}  ({len(page.encode("utf-8")) // 1024} KB, {len(sprites)} sprites)')
    return out


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    build(sys.argv[1])
