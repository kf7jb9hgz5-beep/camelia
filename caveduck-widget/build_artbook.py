# Artbook-page style Caveduck widget (black & white manga concept-art page)
import re, sys
out = sys.argv[1] if len(sys.argv) > 1 else '.'

INK = '#1f1d20'; PAPER = '#faf8f2'
SERIF = "'Nanum Myeongjo','Noto Serif KR','Times New Roman',serif"
SANS = "'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif"

def f(x): return ('%.2f' % x).rstrip('0').rstrip('.')

def rose(S, B=1.4):
    def ring(l, t, D, clear, rot):
        return (f'<div style="position:absolute;left:{f(l)}px;top:{f(t)}px;width:{f(D)}px;height:{f(D)}px;'
                f'box-sizing:border-box;border:{B}px solid;border-radius:50%;border-{clear}-color:transparent;transform:rotate({rot}deg)"></div>')
    l1, t1, D1 = S*.12, S*.08, S*.76+2*B
    l2, t2, D2 = S*.27, S*.24, S*.46+2*B
    l3, t3, D3 = S*.4, S*.37, S*.2+2*B
    cx, cy = l1+D1/2, t1+D1/2
    gap = max(1.2, (D1/2-B)-D2/2); Ra = D1/2+gap+B
    semi = (f'<div style="position:absolute;left:{f(cx-Ra)}px;top:{f(cy)}px;width:{f(2*Ra)}px;height:{f(Ra)}px;'
            f'box-sizing:border-box;border:{B}px solid;border-top:0;border-radius:0 0 {f(Ra)}px {f(Ra)}px"></div>')
    kids = ring(l1, t1, D1, 'bottom', 0)+ring(l2, t2, D2, 'left', -40)+ring(l3, t3, D3, 'top', 30)+semi
    return kids, (cx-Ra, t1, cx+Ra, cy+Ra)

def emblem():
    # rose centred inside a dotted circle (like the artbook's centre ornament)
    C = 26; S = 30
    kids, (x0, y0, x1, y1) = rose(S)
    L = C-(x0+x1)/2; T = C-(y0+y1)/2
    return (f"<!--@ 장미 엠블럼 --><div style=\"position:relative;width:{2*C}px;height:{2*C}px;margin:10px auto;border-radius:50%;"
            f"border:1.5px dotted {INK};color:{INK};box-sizing:border-box\">"
            f"<div style=\"position:absolute;left:{f(L-1.5)}px;top:{f(T-1.5)}px;width:{S}px;height:{S}px\">{kids}</div></div>")

def strip():
    unit = '☙ ✥ ❧ ✥ '
    return (f"<div style=\"text-align:center;white-space:nowrap;overflow:hidden;font-size:13px;line-height:1;letter-spacing:.06em;color:{INK};"
            f"padding:3px 0;border-top:1px solid {INK};border-bottom:1px solid {INK}\">{unit*8}</div>")

def bar(t, size=11):
    return (f"<div style=\"background:{INK};color:#fff;text-align:center;font:700 {size}px/1 {SERIF};letter-spacing:.06em;"
            f"padding:5px 6px 4px;margin-bottom:6px\">✤ {t} ✤</div>")

def portrait(k, w='64px', h='52px', fs=13):
    return (f"<div style=\"flex:none;width:{w};height:{h};border:3px double {INK};background:#fff;display:flex;align-items:center;"
            f"justify-content:center;font-size:{fs}px;line-height:1;white-space:nowrap;overflow:hidden\">{k}</div>")

def head(t, size=10.5):
    return f"<div style=\"font:800 {size}px/1.25 {SERIF};color:{INK};margin-top:6px\">{t}</div>"

def small(t, size=9.5):
    return f"<div style=\"font:{size}px/1.35 {SANS};color:#3a373c;margin-top:2px\">{t}</div>"

def label(t):
    return f"<div style=\"font:700 7.5px/1 {SERIF};letter-spacing:.18em;color:#77737a\">{t}</div>"

def build(d):
    pride = ("<!--@ Pride 카드 : 카오모지 k · 옷차림 o · 속마음 i --><div>" + bar(d['npc'], 12)
             + "<div style=\"display:flex;gap:7px;align-items:flex-start\">" + portrait(d['kn'], '70px', '58px', 14)
             + f"<div style=\"flex:1;min-width:0\">{label('OUTFIT')}{small(d['o'])}</div></div>"
             + f"<div style=\"margin-top:7px\">{label('INNER WHISPER')}</div>"
             + head('“ ' + d['inner'] + ' ”', 10.5) + "</div>")
    banshee = ("<!--@ Banshee 카드 : 카오모지 l · 옷차림 p --><div>" + bar(d['pc'], 10)
               + portrait(d['kp'], '100%', '40px', 12)
               + f"<div style=\"margin-top:6px\">{label('OUTFIT')}</div>{small(d['p'], 9)}</div>")
    place = ("<!--@ 장소 g / 자세 h --><div>" + bar('Place', 10) + small(d['place'], 9)
             + "<div style=\"margin-top:8px\"></div>" + bar('Pose', 10) + small(d['pose'], 9) + "</div>")
    msg = ("<!--@ 메시지 j --><div>" + bar('To. ' + d['pc'], 11)
           + head(d['msg'], 10) + f"<div style=\"text-align:right;font:italic 9px {SERIF};color:#55515a;margin-top:3px\">— from. {d['npc']}</div></div>")
    main = ("<div style=\"flex:1 1 0;min-width:0;display:grid;gap:10px\">" + pride
            + "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:8px\">" + banshee + place + "</div>" + msg + "</div>")

    corner = lambda pos, rot: (f"<span style=\"position:absolute;{pos};font-size:12px;line-height:1;color:{INK};background:{PAPER};"
                               f"padding:1px;transform:rotate({rot}deg)\">❦</span>")
    side = (f"<!--@ 오른쪽 점선 칸 : 노래 a · 가수 b · 날짜 c · 요일 d · AM/PM e · 시각 f · 처음 만난 날 m -->"
            f"<div style=\"flex:0 0 36%;position:relative;border:2px dotted {INK};padding:14px 8px 12px;box-sizing:border-box;text-align:center\">"
            + corner('top:-8px;left:-8px', 0) + corner('top:-8px;right:-8px', 90) + corner('bottom:-8px;left:-8px', -90) + corner('bottom:-8px;right:-8px', 180)
            + f"<div style=\"font:11px/1.3 {SANS};color:#3a373c\">Which song<br>plays in<br>this scene?</div>"
            + f"<div style=\"font:800 15px/1.2 {SERIF};color:{INK};margin-top:12px;word-break:keep-all\">{d['song']}</div>"
            + f"<div style=\"font:9.5px/1.3 {SANS};color:#55515a;margin-top:4px\">— {d['artist']} —</div>"
            + emblem()
            + f"<div style=\"font:800 12px/1.2 {SERIF};color:{INK}\">{d['date']}</div>"
            + f"<div style=\"font:700 8px/1 {SERIF};letter-spacing:.2em;color:#77737a;margin-top:3px\">{d['day']}</div>"
            + f"<div style=\"font:800 22px/1 {SERIF};color:{INK};margin-top:6px\"><span style=\"font-size:9px;letter-spacing:.1em;margin-right:2px\">{d['ampm']}</span>{d['time']}</div>"
            + f"<div style=\"font:9.5px/1.4 {SANS};color:#3a373c;margin-top:14px;text-align:left\">The day they first met — <b style=\"font-family:{SERIF}\">{d['met']}</b>. Every day since then is counted on this page.</div>"
            + "</div>")

    foot = (f"<!--@ 쪽번호 : 디데이 n --><div style=\"display:flex;justify-content:flex-end;margin-top:6px;padding-right:4px\">"
            f"<div style=\"background:{PAPER};border:1.5px solid {INK};border-radius:12px;padding:3px 9px;font:800 10px/1 {SERIF};color:{INK}\">{d['dday']}</div></div>")

    return (f"<div style=\"max-width:360px;margin:12px auto;padding:10px 10px 12px;background:{PAPER};color:{INK};box-sizing:border-box;"
            f"font-family:{SANS};word-break:keep-all;box-shadow:0 2px 10px rgba(0,0,0,.12)\">"
            + "<!--@ 위 문양 띠 -->" + strip()
            + "<div style=\"display:flex;gap:9px;margin:12px 2px 14px\">" + main + side + "</div>"
            + "<!--@ 아래 문양 띠 -->" + strip() + foot + "</div>")

def pretty(h):
    toks = re.findall(r'<!--.*?-->|</?[a-z]+[^>]*>|[^<]+', h, flags=re.S)
    BLOCK = ('div',); outp = []; depth = 0; stack = []
    def nl(): outp.append('\n'+'  '*depth)
    for t in toks:
        m = re.match(r'<(/?)([a-z]+)', t)
        if t.startswith('<!--@'):
            nl(); outp.append('<!-- '+t[5:-3].strip()+' -->')
        elif m and m.group(2) in BLOCK and not m.group(1):
            if stack: stack[-1] = True
            nl(); outp.append(t); depth += 1; stack.append(False)
        elif m and m.group(2) in BLOCK:
            depth -= 1; had = stack.pop()
            if had: nl()
            outp.append(t)
        else:
            outp.append(t)
    return ''.join(outp).strip()+'\n'

T = {k: '{{'+k+'}}' for k in 'abcdefghijklmnop'}
T = {'song': T['a'], 'artist': T['b'], 'date': T['c'], 'day': T['d'], 'ampm': T['e'], 'time': T['f'], 'place': T['g'], 'pose': T['h'],
     'inner': T['i'], 'msg': T['j'], 'kn': T['k'], 'kp': T['l'], 'met': T['m'], 'dday': T['n'], 'o': T['o'], 'p': T['p'],
     'npc': 'Pride', 'pc': 'Banshee'}
P = dict(T, song='Lover, Come Back', artist='Silver Rosé', date='2026.11.17', day='TUE', ampm='PM', time='11:42',
         place='창가 쪽 화장대 앞, 스탠드 불빛 아래', pose='거울 너머로 Banshee를 보며 턱을 괸 채 다리를 꼬고 앉아 있음',
         inner='오늘따라 왜 이렇게 예뻐 보이지… 들키면 안 되는데.', msg='늦었는데 아직 안 자? 잠깐 얼굴 보고 싶어서. 금방 갈게, 문 열어둬.',
         kn='(˶ˆ꒳ˆ˵) ♡', kp='( ˘͈ ᵕ ˘͈ ♡)', met='2026.03.14', dday='D+248',
         o='검은 실크 셔츠 단추 두 개를 푼 채, 은색 장미 브로치', p='크림색 니트 원피스에 연분홍 리본 헤어핀')

open(f"{out}/artbook-widget.html", "w").write(pretty(build(T)))
open(f"{out}/artbook-preview.html", "w").write(
    "<!doctype html><html lang='ko'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Artbook</title></head>"
    "<body style='margin:0;padding:16px;background:#e9e6e0'>" + pretty(build(P)) + "</body></html>\n")
