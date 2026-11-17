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
    # ornate budded cross inside a dotted circle
    W = 56
    def dot(x, y, r):
        return f"<div style=\"position:absolute;left:{f(x-r)}px;top:{f(y-r)}px;width:{f(2*r)}px;height:{f(2*r)}px;border-radius:50%;background:{INK}\"></div>"
    cx = cy = (W-3)/2  # inner (padding-box) centre
    v = f"<div style=\"position:absolute;left:{f(cx-1.5)}px;top:{f(cy-17)}px;width:3px;height:34px;background:{INK}\"></div>"
    h = f"<div style=\"position:absolute;left:{f(cx-11)}px;top:{f(cy-5.5)}px;width:22px;height:3px;background:{INK}\"></div>"
    ends = dot(cx, cy-18, 2.6) + dot(cx, cy+18, 2.6) + dot(cx-12, cy-4, 2.6) + dot(cx+12, cy-4, 2.6)
    mid = (f"<div style=\"position:absolute;left:{f(cx-4.5)}px;top:{f(cy-8.5)}px;width:9px;height:9px;box-sizing:border-box;"
           f"border:1.5px solid {INK};background:#fff;transform:rotate(45deg)\"></div>")
    return (f"<!--@ 십자가 엠블럼 --><div style=\"position:relative;width:{W}px;height:{W}px;margin:0 auto;border-radius:50%;"
            f"border:1.5px dotted {INK};box-sizing:border-box;background:#fff\">{v}{h}{ends}{mid}</div>")

LACE = '#e7e6eb'; LACE_LINE = '#b8b6be'
def lace(top=True):
    eyelets = (f"<div style=\"height:9px;background:radial-gradient(circle,#fff 0 1.7px,transparent 2.1px) 0 0/12px 9px repeat-x,radial-gradient(circle,#fff 0 .9px,transparent 1.2px) 6px 0/12px 9px repeat-x,{LACE};"
               f"border-top:1px solid {LACE_LINE};border-bottom:1px solid {LACE_LINE}\"></div>")
    at = '0' if top else '100%'
    scallop = (f"<div style=\"height:8px;background:radial-gradient(circle at 6px {'2px' if top else '6px'},#fff 0 1.2px,transparent 1.6px) 0 0/12px 8px repeat-x,"
               f"radial-gradient(circle at 6px {at},{LACE} 0 5.6px,{LACE_LINE} 6px 6.7px,transparent 7.1px) 0 0/12px 8px repeat-x\"></div>")
    picots = (f"<div style=\"height:3px;background:radial-gradient(circle,{LACE_LINE} 0 1px,transparent 1.4px) 0 0/12px 3px repeat-x\"></div>")
    parts = [eyelets, scallop, picots] if top else [picots, scallop, eyelets]
    return "<div>" + ''.join(parts) + "</div>"

DOTS = "radial-gradient(circle,#d9d9de 0 .9px,transparent 1.3px) 0 0/9px 9px,#fff"
GAP = 10   # one spacing unit used everywhere

BAR = '#55535b'
def sp(c):
    z = '8px' if c == '✚' else '1em'
    return f"<span style=\"font-size:{z};vertical-align:1px\">{c}</span>"
def bar(t, sym='✚'):
    return (f"<div style=\"background:{BAR};color:#fff;text-align:center;font:700 10.5px/1 {SERIF};letter-spacing:.06em;"
            f"padding:5px 6px 4px;margin-bottom:{GAP-3}px\">{sp(sym)} {t} {sp(sym)}</div>")

def frame(k, h, fs):
    return (f"<div style=\"height:{h}px;box-sizing:border-box;border:3px double {INK};background:#fff;display:flex;align-items:center;"
            f"justify-content:center;font-size:{fs}px;line-height:1;white-space:nowrap;overflow:hidden\">{k}</div>")

def label(t):
    return f"<div style=\"font:700 7.5px/1 {SERIF};letter-spacing:.16em;color:#77737a;margin-bottom:3px\">꩜ {t}</div>"

def body(t, size=9.5):
    return f"<div style=\"font:{size}px/1.38 {SANS};color:#3a373c\">{t}</div>"

def bold(t, size=10.5):
    return f"<div style=\"font:800 {size}px/1.32 {SERIF};color:{INK}\">{t}</div>"

def block(*parts, top=GAP):
    return f"<div style=\"margin-top:{top}px\">" + ''.join(parts) + "</div>"

def build(d):
    pride = ("<!--@ Pride 카드 : 카오모지 k · 옷차림 o · 속마음 i --><div>" + bar(d['npc'], '♝')
             + f"<div style=\"display:grid;grid-template-columns:72px 1fr;gap:{GAP}px;align-items:start\">"
             + frame(d['kn'], 58, 14) + "<div>" + label('OUTFIT') + body(d['o']) + "</div></div>"
             + block(label('INNER WHISPER'), bold('“ ' + d['inner'] + ' ”')) + "</div>")
    banshee = ("<!--@ Banshee 카드 : 카오모지 l · 옷차림 p --><div>" + bar(d['pc'], '♘') + frame(d['kp'], 40, 12)
               + block(label('OUTFIT'), body(d['p'], 9)) + "</div>")
    place = ("<!--@ 장소 g / 자세 h --><div>" + bar('Place') + body(d['place'], 9)
             + f"<div style=\"margin-top:{GAP}px\">" + bar('Pose') + body(d['pose'], 9) + "</div></div>")
    msg = ("<!--@ 메시지 j --><div>" + bar('To. ' + d['pc'], '†') + bold(d['msg'], 10)
           + f"<div style=\"text-align:right;font:italic 9px {SERIF};color:#55515a;margin-top:4px\">— from. {d['npc']}</div></div>")
    main = (f"<div style=\"flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:{GAP+4}px\">" + pride
            + f"<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:{GAP}px\">" + banshee + place + "</div>" + msg + "</div>")

    corner = lambda pos: (f"<span style=\"position:absolute;{pos};font-size:12px;line-height:1;color:{INK};background:#fff;padding:0 1px;font-size:10px\">✚</span>")
    side = ("<!--@ 오른쪽 점선 칸 : 노래 a · 가수 b · 날짜 c · 요일 d · AM/PM e · 시각 f · 처음 만난 날 m -->"
            f"<div style=\"flex:0 0 36%;position:relative;border:2px dotted {INK};padding:{GAP+6}px {GAP-2}px;box-sizing:border-box;"
            f"display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;gap:{GAP+4}px\">"
            + corner('top:-8px;left:-7px') + corner('top:-8px;right:-7px') + corner('bottom:-8px;left:-7px') + corner('bottom:-8px;right:-7px')
            + "<div>"
            + f"<div style=\"font-size:16px;line-height:1;color:{INK};margin-bottom:6px\">𝄡</div>"
            + f"<div style=\"font:10px/1.35 {SANS};color:#3a373c\">Which song<br>plays in<br>this scene?</div>"
            + f"<div style=\"font:800 15px/1.2 {SERIF};color:{INK};margin-top:{GAP}px\">{d['song']}</div>"
            + f"<div style=\"font:9px/1.3 {SANS};color:#55515a;margin-top:4px\">— {d['artist']} —</div></div>"
            + emblem()
            + "<div>"
            + f"<div style=\"font:800 12px/1.2 {SERIF};color:{INK}\">{d['date']}</div>"
            + f"<div style=\"font:700 8px/1 {SERIF};letter-spacing:.2em;color:#77737a;margin-top:4px\">{d['day']}</div>"
            + f"<div style=\"font:800 22px/1 {SERIF};color:{INK};margin-top:6px\"><span style=\"font-size:9px;letter-spacing:.1em;margin-right:2px\">{d['ampm']}</span>{d['time']}</div></div>"
            + f"<div style=\"font:9px/1.45 {SANS};color:#3a373c\">The day they first met<br><b style=\"font:800 11px/1.6 {SERIF};color:{INK}\">{d['met']}</b><br>every day since then<br>is counted on this page.</div>"
            + "</div>")

    foot = ("<!--@ 쪽번호 : 디데이 n -->"
            f"<div style=\"text-align:center;margin-top:{GAP}px\"><span style=\"display:inline-block;background:#fff;border:1.5px solid {INK};border-radius:12px;"
            f"padding:4px 12px 3px;font:800 10px/1 {SERIF};color:{INK}\">† {d['dday']} †</span></div>")

    return (f"<div style=\"max-width:360px;margin:12px auto;background:{DOTS};color:{INK};box-sizing:border-box;"
            f"font-family:{SANS};word-break:keep-all;box-shadow:0 2px 10px rgba(0,0,0,.12);\">"
            + "<!--@ 위 레이스 -->" + lace(True)
            + f"<div style=\"display:flex;gap:{GAP+2}px;padding:{GAP+6}px {GAP+4}px {GAP+2}px\">" + main + side + "</div>"
            + foot + "<div style=\"margin-top:" + str(GAP) + "px\"></div><!--@ 아래 레이스 -->" + lace(False) + "</div>")

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
