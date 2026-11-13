import json, re, os, glob, hashlib, io, sys, urllib.request, concurrent.futures as cf, datetime, statistics, collections
from PIL import Image
W = '/home/yh/.hermes/cache/scratch/gongtong'
R = '/home/yh/gongtong-sheet'
ACC = '/home/yh/ai_memory_work/accounts'
PACK = '/home/yh/ai_memory_work/packs/PACK_06_SNS_인스타.md'
PLAN = '/home/yh/ai_memory_work/02_normalized/chatgpt-chatgpt-6a1a8902-714c-83e9-8d92-9c8108042ec3-v1.md'
SKIP_AI = '--noai' in sys.argv
os.makedirs(R + '/data/acc', exist_ok=True); os.makedirs(R + '/img/t', exist_ok=True); os.makedirs(R + '/img/p', exist_ok=True)
master = json.load(open(W + '/accounts_master.json'))

def redact(s):
    return s.replace('연하님', '사용자님')

# ---------------- taxonomy ----------------
T = {}
def setT(hs, theme, targets, region='KR'):
    for h in hs.split():
        T[h] = (theme, targets, region)
setT('money_hamzzi ggulbees', '경제·재테크', ['2030 직장인'])
setT('jam._bi', '경제·재테크', ['20대·신혼'])
setT('four_seul', '경제·재테크', ['육아맘'])
setT('jujuclub.toon', '경제·재테크', ['주식 투자자'])
setT('upplan0413', '경제·재테크', ['중장년 4050'])
setT('_strongbox_ pocket_true', '직장·커리어', ['2030 직장인'])
setT('wild__meerkat', '직장·커리어', ['직장인'])
setT('mungdi_ ku_bbang', '창작·수익화', ['크리에이터·부업'])
setT('lee_llena tadaki_toon', '창작·수익화', ['작가·그림러'])
setT('kkonae_', '창작·수익화', ['자영업·브랜드'])
setT('chaegim_30', '연애·결혼', ['2030 미혼·신혼'])
setT('ppyodduri_toon', '연애·결혼', ['2030 커플'])
setT('bookie_diary', '일상·가족', ['2030 여성'])
setT('go_ae_mi', '일상·가족', ['육아맘'])
setT('bath.diary', '일상·가족', ['일반'])
setT('_han.yu__ greenycart', '공감·힐링·가치', ['2030 여성'])
setT('100basispoints theetftracker vince.quant daytrading autopilot callsbyjmo latinowallst', '주식·ETF', ['주식 투자자'], 'US')
setT('chartsurferr', '주식·ETF', ['트레이더'], 'US')
setT('jay_medrow bullstory1 jae_rri moneyhunter_kr onlyone_onlyoon_ ekke.now', '주식·ETF', ['주식 투자자'])
setT('metav3rse artificialintelligence.co', '주식·ETF', ['주식 투자자'], 'GL')
setT('flow.itself newneek.official', '시사·경제뉴스', ['2030 직장인'])
setT('polymarketmoney yahoofinance morningbrew targetingfinance cnbc', '시사·경제뉴스', ['투자 입문'], 'US')
setT('theeconomist visualcap', '시사·경제뉴스', ['일반'], 'GL')
setT('otoku_onichan kakemane', '생활금융·절약', ['주부·가계'], 'JP')
setT('freelife_blog ko_banker shia.moneyliteracy yuma_02_02', '생활금융·절약', ['투자 입문'], 'JP')
setT('uppity.official', '생활금융·절약', ['2030 직장인'])
setT('beerich168 goodgood.tw thelazywallet stockfeel', '생활금융·절약', ['투자 입문'], 'TW')
setT('apt_lap', '부동산', ['2030 직장인'])
setT('iamthirtyaf', '직장·커리어', ['2030 직장인'], 'US')
setT('tap.pick', '직장·커리어', ['2030 직장인'])
setT('money_life_bal', '생활금융·절약', ['일반'])
setT('helloheidi.trip', '여행·생활정보', ['일반'])

# ---------------- scrape ----------------
prof = {}
for f in sorted(glob.glob(W + '/out_*.txt'), key=lambda x: (x.endswith('out_test.txt'), x)):
    for l in open(f, errors='ignore'):
        if l.startswith('@@'):
            try: d = json.loads(l[2:])
            except Exception: continue
            if d.get('md') or d.get('posts'):
                if d['h'] not in prof or len(d.get('posts') or []) >= len(prof[d['h']].get('posts') or []):
                    prof[d['h']] = d
            elif d.get('title') and d['h'] not in prof:
                prof[d['h']] = d
print('profiles scraped', len(prof))

def pnum(s):
    s = s.replace(',', '').strip()
    m = re.match(r'([\d\.]+)\s*([KMB]?)', s, re.I)
    if not m: return None
    v = float(m.group(1)); u = m.group(2).upper()
    return int(round(v * {'': 1, 'K': 1e3, 'M': 1e6, 'B': 1e9}[u]))

MON = {m: i for i, m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'], 1)}
def pdate(alt):
    m = re.search(r'on (\w+) (\d{1,2}), (\d{4})', alt or '')
    if m and m.group(1) in MON: return '%s-%02d-%02d' % (m.group(3), MON[m.group(1)], int(m.group(2)))
    return ''

def lang(s):
    s = s or ''
    hg = len(re.findall(r'[가-힣]', s)); kn = len(re.findall(r'[ぁ-ゖァ-ヺ]', s)); hn = len(re.findall(r'[一-鿿]', s)); la = len(re.findall(r'[A-Za-z]', s))
    tot = hg + kn + hn + la
    if tot < 4: return None
    if hg / tot > 0.15: return 'KO'
    if kn > 2: return 'JP'
    if hn > la * 0.5: return 'ZH'
    return 'EN'

# ---------------- translation / AI via local Qwen ----------------
CACHE_F = W + '/ai_cache.json'
cache = json.load(open(CACHE_F)) if os.path.exists(CACHE_F) else {}
def qwen(system, user, max_tokens=700):
    key = hashlib.md5((system + '\x00' + user).encode()).hexdigest()
    if key in cache: return cache[key]
    if SKIP_AI: return None
    body = json.dumps({'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}], 'max_tokens': max_tokens, 'temperature': 0.2, 'chat_template_kwargs': {'enable_thinking': False}}).encode()
    for _ in range(2):
        try:
            req = urllib.request.Request('http://127.0.0.1:8081/v1/chat/completions', body, {'Content-Type': 'application/json'})
            out = json.load(urllib.request.urlopen(req, timeout=180))['choices'][0]['message']['content'].strip()
            out = re.sub(r'^<think>.*?</think>\s*', '', out, flags=re.S)
            cache[key] = out; return out
        except Exception as e:
            err = e
    print('qwen fail', err); return None
TR_SYS = 'You are a translator. Translate the user text into natural Korean. Keep emojis, hashtags (translate hashtag words), numbers and line breaks. Output only the Korean translation, nothing else.'

# ---------------- images ----------------
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Referer': 'https://www.instagram.com/'}
def dl(url, path, w):
    if os.path.exists(path) and os.path.getsize(path) > 500: return True
    if not url: return False
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        im = Image.open(io.BytesIO(data)).convert('RGB')
        if im.width > w: im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
        os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path, 'JPEG', quality=72, optimize=True, progressive=True)
        return True
    except Exception as e:
        return False

def safe(h): return re.sub(r'[^A-Za-z0-9._-]', '_', h)

accs, posts, jobs, trjobs = [], [], [], []
for m in master:
    h = m['ig']; d = prof.get(h, {})
    md_ = d.get('md', '') or ''
    mm = re.match(r'([\d\.,]+[KMB]?) Followers, ([\d\.,]+[KMB]?) Following, ([\d\.,]+[KMB]?) Posts - (?:(.*?) \()?@', md_)
    followers = pnum(mm.group(1)) if mm else None
    following = pnum(mm.group(2)) if mm else None
    postsN = pnum(mm.group(3)) if mm else None
    name = (mm.group(4) if mm and mm.group(4) else '') or m.get('name') or ''
    bm = re.search(r'on Instagram: "(.*)"\s*$', md_, re.S)
    bio = bm.group(1) if bm else ''
    th = T.get(h)
    if th: themeG, targets, region = th
    else:
        tp = (m.get('topic') or '').split('(')[0]
        themeG = re.split(r'[·/,]', tp)[0].strip() or '기타'; targets = ['일반']; region = None
    a = {'h': h, 'name': name, 'cat': m['cat'], 'topic': m.get('topic', ''), 'themeG': themeG, 'targets': targets, 'region': region,
         'followers': followers, 'following': following, 'postsN': postsN, 'bio': bio, 'fetched': (d.get('t') or '')[:16].replace('T', ' ') + (' UTC' if d.get('t') else ''),
         'mem': {'point': m['info'].get('벤치마킹 포인트', []), 'nums': [redact(x) for x in m['info'].get('수치', [])], 'files': m['files']}}
    if "isn't available" in (d.get('title') or ''): a['note'] = '프로필 없음·비공개 (ego 확인 결과 Profile isn\'t available)'
    elif d and not d.get('posts') and followers: a['note'] = '연령 제한 프로필 — 비로그인 ego로 게시물 수집 불가 (로그인 필요)'
    if d.get('og'):
        a['pf'] = 'img/p/%s.jpg' % safe(h); jobs.append((d['og'], R + '/' + a['pf'], 150))
    langs = collections.Counter()
    for p in d.get('posts') or []:
        if not p.get('sc'): continue
        cap = p.get('capt') or ''
        cm = re.search(r'View all ([\d,]+) comments?\s*$', cap)
        cap = re.sub(r'View all [\d,]+ comments?\s*$', '', cap).strip()
        if cap.startswith(h): cap = cap[len(h):].lstrip('\n ').strip()
        lc = p.get('lc'); sp = p.get('sp') or ''
        likes = None
        spm = re.match(r'([\d,\.]+[KM]?)\s+likes?', sp)
        if spm: likes = pnum(spm.group(1))
        if lc: likes = max(likes or 0, lc)
        cc = p.get('cc')
        if cc is None and cm: cc = pnum(cm.group(1))
        t = 'vid' if (p.get('kind') == 'reel' or p.get('vid') or p.get('isv')) else ('car' if p.get('car') else 'img')
        img = 'img/t/%s/%s.jpg' % (safe(h), p['sc'])
        jobs.append((p.get('grid_img') or p.get('img'), R + '/' + img, 320))
        lg = lang(cap)
        if lg: langs[lg] += 1
        po = {'a': h, 'sc': p['sc'], 'k': p.get('kind', 'p'), 't': t, 'l': likes, 'c': cc, 'v': p.get('vc'), 'd': pdate(p.get('alt')), 'pin': bool(p.get('pin')), 'cap': cap[:2200], 'img': img, 'lang': lg}
        posts.append(po)
        if lg and lg != 'KO' and cap: trjobs.append(po)
    if not region:
        top = langs.most_common(1)
        region = {'KO': 'KR', 'JP': 'JP', 'ZH': 'TW', 'EN': 'US'}.get(top[0][0], 'GL') if top else 'GL'
        a['region'] = region
    accs.append(a)
print('posts', len(posts), 'img jobs', len(jobs), 'translate', len(trjobs))

with cf.ThreadPoolExecutor(12) as ex:
    res = list(ex.map(lambda j: dl(*j), jobs))
print('images ok', sum(res), '/', len(res))
okimg = {j[1] for j, r in zip(jobs, res) if r}
for a in accs:
    if a.get('pf') and R + '/' + a['pf'] not in okimg: a.pop('pf')

LN = {'JP': '日本語', 'ZH': '中文', 'EN': 'English'}
def trans(po):
    out = qwen(TR_SYS, po['cap'][:1500], 900)
    if out:
        po['orig'] = po['cap']; po['cap'] = out; po['lang'] = LN.get(po['lang'], po['lang'])
with cf.ThreadPoolExecutor(4) as ex:
    list(ex.map(trans, trjobs))
json.dump(cache, open(CACHE_F, 'w'), ensure_ascii=False)

# ---------------- stats + AI summary ----------------
SUM_SYS = '너는 인스타그램 벤치마킹 분석가다. 한국어로만 답한다. 주어진 계정의 최근 게시물 캡션과 반응(좋아요·댓글)을 보고 JSON만 출력한다: {"summary": "이 계정이 주로 다루는 내용과 반응이 좋은 게시물의 공통 패턴(훅·형식·CTA)을 2~3문장, 200자 이내", "kw": ["핵심 키워드 5개"]}. 캡션에 없는 수익·매출 수치는 지어내지 않는다.'
byh = collections.defaultdict(list)
for p in posts: byh[p['a']].append(p)
def summarize(a):
    ps = byh.get(a['h']) or []
    if not ps: return
    lk = [p['l'] for p in ps if p['l'] is not None]
    cs = [p['c'] for p in ps if p['c'] is not None]
    s = {'n': len(ps), 'avgL': (sum(lk) / len(lk)) if lk else None, 'medL': statistics.median(lk) if lk else None, 'avgC': (sum(cs) / len(cs)) if cs else None}
    s['er'] = (s['avgL'] / a['followers']) if (s['avgL'] is not None and a.get('followers')) else None
    cnt = collections.Counter(p['t'] for p in ps)
    s['mix'] = '%d/%d/%d' % (cnt['car'], cnt['vid'], cnt['img'])
    ds = sorted([p['d'] for p in ps if p['d'] and not p['pin']], reverse=True)
    if len(ds) >= 3:
        dd = [(datetime.date.fromisoformat(ds[i]) - datetime.date.fromisoformat(ds[i + 1])).days for i in range(len(ds) - 1)]
        s['cad'] = round(statistics.median(dd), 1)
    if ds: s['last'] = ds[0]
    a['stats'] = s
    a['top'] = [p['sc'] for p in sorted(ps, key=lambda p: (p['l'] if p['l'] is not None else -1, p['c'] or 0), reverse=True)][:3]
    if a['cat'] in ('인스타툰', '카드뉴스', '한장형'):
        lines = []
        for p in sorted(ps, key=lambda p: (p['l'] or 0), reverse=True)[:12]:
            lines.append('- [♥%s 💬%s %s %s] %s' % (p['l'] if p['l'] is not None else '숨김', p['c'], p['t'], p['d'], re.sub(r'\s+', ' ', p['cap'])[:260]))
        u = '계정 @%s (%s), 형식: %s, 공통기억 주제: %s\n소개: %s\n최근 게시물(좋아요순):\n%s' % (a['h'], a['name'], a['cat'], a['topic'], a['bio'][:200], '\n'.join(lines))
        out = qwen(SUM_SYS, u, 600)
        if out:
            mm = re.search(r'\{.*\}', out, re.S)
            try:
                j = json.loads(mm.group(0)); a['ai'] = j.get('summary', ''); a['kw'] = [k for k in j.get('kw', []) if isinstance(k, str)][:6]
            except Exception:
                a['ai'] = out[:300]
with cf.ThreadPoolExecutor(4) as ex:
    list(ex.map(summarize, accs))
json.dump(cache, open(CACHE_F, 'w'), ensure_ascii=False)

# ---------------- account md ----------------
for a in accs:
    txt = []
    for f in a['mem']['files']:
        p = os.path.join(ACC, f)
        if os.path.exists(p): txt.append(redact(open(p).read()))
    open(R + '/data/acc/%s.js' % a['h'], 'w').write('window.ACC_MD=window.ACC_MD||{};ACC_MD[%s]=%s;' % (json.dumps(a['h']), json.dumps('\n\n---\n\n'.join(txt), ensure_ascii=False)))

fetched = max([a['fetched'] for a in accs if a['fetched']] or [''])
open(R + '/data/core.js', 'w').write('window.D=window.D||{};D.fetched=%s;D.acc=%s;D.posts=%s;' % (json.dumps('2026-11-13 KST'), json.dumps(accs, ensure_ascii=False, separators=(',', ':')), json.dumps(posts, ensure_ascii=False, separators=(',', ':'))))

# ---------------- pack ----------------
lines = open(PACK).read().split('\n')
secs = []; cur = None; conv = None
for ln in lines:
    if re.match(r'## (\d+(-[A-Z])?)\. ', ln):
        cur = {'title': ln[3:].strip(), 'convs': [], 'intro': []}; secs.append(cur); conv = None; continue
    if ln.startswith('### ★'):
        mm = re.match(r'### (★+)\s*(.*)', ln); conv = {'stars': len(mm.group(1)), 'title': mm.group(2).strip(), 'body': []}; cur['convs'].append(conv); continue
    if conv is not None: conv['body'].append(ln)
    elif cur is not None: cur['intro'].append(ln)
def parse_conv(c):
    d = {'stars': c['stars'], 'title': c['title'], 'fields': {}, 'blocks': [], 'extra': []}
    body = c['body']; i = 0
    while i < len(body):
        ln = body[i]
        mm = re.match(r'- (요약|규칙|결정|선호|🔗 링크|🖼 캡처[^:]*|⚠ 확인 필요|원문):\s*(.*)', ln)
        if mm:
            k = mm.group(1); k = '캡처' if k.startswith('🖼') else k.replace('🔗 ', '').replace('⚠ ', '')
            d['fields'].setdefault(k, []).append(ln[2:] if k == '캡처' else mm.group(2)); i += 1; continue
        mm = re.match(r'\*\*📌\s*(.*?)\*\*\s*$', ln)
        if mm:
            t = mm.group(1); j = i + 1
            while j < len(body) and not body[j].strip(): j += 1
            if j < len(body) and body[j].startswith('```'):
                k2 = j + 1; code = []
                while k2 < len(body) and not body[k2].startswith('```'): code.append(body[k2]); k2 += 1
                d['blocks'].append({'t': t, 'code': '\n'.join(code)}); i = k2 + 1; continue
        d['extra'].append(ln); i += 1
    d['extra'] = '\n'.join(d['extra']).strip()
    return d
SEC = [{'title': s['title'], 'intro': redact('\n'.join(s['intro']).strip()), 'convs': [parse_conv(c) for c in s['convs']]} for s in secs]
SEC = [s for s in SEC if s['convs'] or s['intro']]
packjs = json.dumps(SEC, ensure_ascii=False, separators=(',', ':'))
open(R + '/data/pack.js', 'w').write('window.D=window.D||{};D.pack=%s;' % redact(packjs))

# ---------------- 30 day plan ----------------
pl = open(PLAN).read()
days = []
for mm in re.finditer(r'### Day (\d+) — (.+?)\n\n\*\*주제:\*\*\s*(.+?)\n\n\*\*프롬프트:\*\*\n(.+?)\n\n---', pl, re.S):
    days.append({'d': int(mm.group(1)), 'title': mm.group(2).strip(), 'topic': mm.group(3).strip(), 'prompt': mm.group(4).strip().strip('“”"')})
steps = []
for mm in re.finditer(r'\| (\d+)단계 \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|', pl):
    p = mm.group(2).strip(); r2 = re.findall(r'\d+', p)
    a_, b_ = (int(r2[0]), int(r2[-1])) if 'Day' in p and r2 else (31, 60)
    steps.append({'n': int(mm.group(1)), 'p': p, 'a': a_, 'b': b_, 'todo': mm.group(3).strip(), 'pt': mm.group(4).strip(), 'ok': mm.group(5).strip()})
print('plan days', len(days), 'steps', len(steps))
plan30 = {
    'days': days, 'steps': steps,
    'rules': ['CTA는 \'무료 체험하세요\'보다 **\'내 계정/콘텐츠 문제 진단받기\'**', '가입 후 10분 안에 결과물(게시글·CTA·캘린더)을 보여줘 첫 성공 만들기',
              '피드백은 \'좋았나요?\'가 아니라 **\'돈 낼 기능은?\'·\'결제 안 한다면 이유는?\'**', '체험 종료 전 \'얻은 결과 / 계속 쓰면 이익 / 중단 시 손실\' 제시',
              '목표는 무료 유저 다수가 아니라 **돈 낼 가능성이 높은 사람 선별**', '30일 후 조회수가 아니라 **가입·결제를 만든 콘텐츠 TOP5**를 찾아 2개월차에 복제'],
    'weeks': [{'w': '1주차', 'goal': '문제 자각·관심 유도', 'r': [55, 25, 10, 10]}, {'w': '2주차', 'goal': '무료 체험 유입', 'r': [40, 25, 25, 10]},
              {'w': '3주차', 'goal': '사용 경험·후기·기능 검증', 'r': [35, 30, 20, 15]}, {'w': '4주차', 'goal': '유료 전환·케이스 정리', 'r': [30, 25, 35, 10]}],
    'daily': ['Threads 2개', 'X 2개', 'Instagram 카드뉴스 1개', 'Facebook 1개', 'LinkedIn 평일 1개', 'Pinterest 1개', 'Naver Blog 주 3개', 'Medium/Blogger 주 1~2개', 'Reddit 주 3회 (홍보 없이)'],
    'spec': [['Instagram', '캡션 2,200자', '80-150자 + 카드뉴스', '1080x1350, 1080x1080'], ['Facebook', '매우 김', '40-120자, 링크형 1-3문장', '1200x630, 1080x1080'],
             ['Threads', '500자', '80-180자', '1080x1350 또는 1:1'], ['X', '280자', '120-240자', '1600x900 또는 1080x1080'], ['Pinterest', '제목 100 / 설명 800', '제목 40-60 / 설명 150-300', '1000x1500'],
             ['Reddit', '제목 300자', '제목 60-120 / 본문 정보형', '서브레딧 규칙 우선'], ['Blogger', '넉넉함', '800-1,500자+', '대표 1200x630'], ['Medium', '넉넉함', '900-1,800자', '대표 1200x675'],
             ['LinkedIn', '게시글 3,000자', '600-1,200자', '1200x627'], ['Naver Blog', '넉넉함', '1,000-2,000자', '본문 860px 폭']],
    'tone': [['Instagram', '저장·공유·브랜드 인지', '카드뉴스형, 짧고 강한 문장', '1일 1개'], ['Facebook', '커뮤니티·스토리', '경험담, 짧은 문제 제기', '1일 1개'], ['Threads', '대화·댓글', '친구에게 말하듯, 날것의 통찰', '1일 2개'],
             ['X', '후킹·논쟁·요약', '짧고 날카롭게, 숫자 중심', '1일 2개'], ['Pinterest', '검색·체크리스트', '제목형, 실용 자료형', '1일 1~2개'], ['Reddit', '피드백·니치', '홍보 금지, 문제 해결형', '주 3회'],
             ['Blogger', 'SEO 보조', '정보형 긴 글', '주 2회'], ['Medium', '전문성·해외 아카이브', '칼럼형', '주 1~2회'], ['LinkedIn', 'B2B 신뢰·전환', '실험 기록, 인사이트', '주 5회'], ['Naver Blog', '국내 검색·신뢰', '1,000~2,000자 정보형', '주 3회']],
}
hm = json.load(open(W + '/hm.json'))
cmds = json.load(open(W + '/cmds.json'))
open(R + '/data/extra.js', 'w').write('window.D=window.D||{};D.plan30=%s;D.hm=%s;D.cmds=%s;' % (json.dumps(plan30, ensure_ascii=False), json.dumps(hm, ensure_ascii=False), json.dumps(cmds, ensure_ascii=False)))
print('done. accs', len(accs), 'with followers', sum(1 for a in accs if a['followers']), 'ai', sum(1 for a in accs if a.get('ai')), 'translated', sum(1 for p in posts if p.get('orig')))
