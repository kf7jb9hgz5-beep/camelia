# Artbook-page style Caveduck widget (black & white manga concept-art page)
import re, sys
out = sys.argv[1] if len(sys.argv) > 1 else '.'
STYLE_ARG = sys.argv[2] if len(sys.argv) > 2 else None
ROLE_ARG = sys.argv[3] if len(sys.argv) > 3 else ''
SIDE_STYLE = sys.argv[4] if len(sys.argv) > 4 else '0'

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
    W = 56
    return (f"<!--@ 십자가 엠블럼 --><div style=\"width:{W}px;height:{W}px;margin:0 auto;border-radius:50%;border:1.5px dotted {BAR};"
            f"box-sizing:border-box;background:#fff;display:flex;align-items:center;justify-content:center;"
            f"font-size:28px;line-height:1;color:{BAR}\">𖢒</div>")

LACE = '#d9d8de'; LACE_LINE = '#9d9ba5'
def lace(top=True):
    eyelets = (f"<div style=\"height:9px;background:radial-gradient(circle,#fff 0 1.7px,transparent 2.1px) 0 0/12px 9px repeat-x,radial-gradient(circle,#fff 0 .9px,transparent 1.2px) 6px 0/12px 9px repeat-x,{LACE};"
               f"border-top:1px solid {LACE_LINE};border-bottom:1px solid {LACE_LINE}\"></div>")
    at = '0' if top else '100%'
    scallop = (f"<div style=\"height:8px;background:radial-gradient(circle at 6px {'2px' if top else '6px'},#fff 0 1.2px,transparent 1.6px) 0 0/12px 8px repeat-x,"
               f"radial-gradient(circle at 6px {at},{LACE} 0 5.6px,{LACE_LINE} 6px 6.7px,transparent 7.1px) 0 0/12px 8px repeat-x\"></div>")
    picots = (f"<div style=\"height:3px;background:radial-gradient(circle,{LACE_LINE} 0 1px,transparent 1.4px) 0 0/12px 3px repeat-x\"></div>")
    parts = [eyelets, scallop, picots] if top else [picots, scallop, eyelets]
    return "<div>" + ''.join(parts) + "</div>"

KDOTS = "radial-gradient(circle,#e6e5ea 0 1.4px,transparent 1.8px) 0 0/8px 8px,radial-gradient(circle,#e6e5ea 0 1.4px,transparent 1.8px) 4px 4px/8px 8px,#fff"
DOTS = "radial-gradient(circle,#d9d9de 0 .9px,transparent 1.3px) 0 0/9px 9px,#fff"
GAP = 10   # one spacing unit used everywhere

BAR = '#55535b'
if STYLE_ARG: pass
def sp(c):
    z = '8px' if c == '✚' else '1em'
    return f"<span style=\"font-size:{z};line-height:1\">{c}</span>"
BAR_STYLE = STYLE_ARG or '2'   # 1 기본 · 2 이중선 · 4 인덱스 탭 · 5 레이스 띠 · 7 양옆 선+알약 · 9 라벨
ROLE_STYLE = dict(x.split('=') for x in (ROLE_ARG or 'place=9,pose=9').split(',') if x)
def bar(t, sym='✚', role=''):
    st = ROLE_STYLE.get(role, BAR_STYLE)
    T = f"font:700 10px/1 {SERIF};letter-spacing:.06em"
    C = "display:flex;align-items:center;justify-content:center;gap:5px"
    txt = f"{sp(sym)}<span>{t}</span>{sp(sym)}"
    mb = f"margin-bottom:{GAP-3}px"
    if st == '2':
        return f"<div style=\"{C};height:18px;border-top:3px double {BAR};border-bottom:3px double {BAR};color:{BAR};{T};{mb}\">{txt}</div>"
    if st == '4':
        return (f"<div style=\"display:flex;border-bottom:2px solid {BAR};{mb}\"><div style=\"{C};height:20px;padding:0 10px;"
                f"background:{BAR};color:#fff;border-radius:5px 5px 0 0;{T}\">{txt}</div></div>")
    if st == '5':
        sc = lambda y: f"<div style=\"height:4px;background:radial-gradient(circle at 4px {y},{BAR} 0 3.2px,transparent 3.6px) 0 0/8px 4px repeat-x\"></div>"
        return (f"<div style=\"{mb}\">" + sc('4px') + f"<div style=\"{C};height:16px;background:{BAR};color:#fff;{T}\">{txt}</div>" + sc('0') + "</div>")
    if st == '7':
        ln = f"<div style=\"flex:1;height:1px;background:{BAR}\"></div>"
        return (f"<div style=\"display:flex;align-items:center;gap:5px;{mb}\">{ln}<div style=\"{C};height:20px;padding:0 10px;border-radius:10px;"
                f"background:{BAR};color:#fff;white-space:nowrap;{T}\">{txt}</div>{ln}</div>")
    if st == '9':
        return (f"<div style=\"display:flex;align-items:center;gap:5px;height:24px;border-left:4px solid {BAR};background:#e9e8ec;"
                f"padding-left:7px;color:{BAR};{T};{mb}\">{txt}</div>")
    if st == 'D':   # 9 + 2 : left bar + double rules, light band
        return (f"<div style=\"display:flex;align-items:center;gap:5px;height:16px;border-left:4px solid {BAR};border-top:3px double {BAR};"
                f"border-bottom:3px double {BAR};background:#e9e8ec;padding-left:7px;color:{BAR};{T};{mb}\">{txt}</div>")
    if st == 'E':   # 2 + 9 : centred, double rules on light band
        return (f"<div style=\"{C};height:16px;border-top:3px double {BAR};border-bottom:3px double {BAR};background:#e9e8ec;color:{BAR};{T};{mb}\">{txt}</div>")
    if st == 'F':   # 9 label + double underline running out
        return (f"<div style=\"display:flex;align-items:center;gap:5px;height:18px;border-left:4px solid {BAR};border-bottom:3px double {BAR};"
                f"padding-left:7px;color:{BAR};{T};{mb}\">{txt}</div>")
    return f"<div style=\"{C};height:20px;padding:0 6px;background:{BAR};color:#fff;{T};{mb}\">{txt}</div>"

def frame(k, h, fs):
    return (f"<div style=\"height:{h}px;box-sizing:border-box;border:3px double {INK};background:{KDOTS};display:flex;align-items:center;"
            f"justify-content:center;font-size:{fs}px;line-height:1;white-space:nowrap;overflow:hidden\">{k}</div>")

def label(t):
    return f"<div style=\"font:700 7px/1.0 {SERIF};letter-spacing:.16em;color:#77737a;margin-bottom:3px\">꩜ {t}</div>"

def body(t, size=8.5):
    return f"<div style=\"font:{size}px/1.27 {SANS};color:#3a373c\">{t}</div>"

def bold(t, size=9.5):
    return f"<div style=\"font:800 {size}px/1.23 {SERIF};color:{INK}\">{t}</div>"

def block(*parts, top=GAP):
    return f"<div style=\"margin-top:{top}px\">" + ''.join(parts) + "</div>"

def build(d):
    pride = ("<!--@ Pride 카드 : 카오모지 k · 옷차림 o · 속마음 i --><div>" + bar(d['npc'], '♝', 'npc')
             + f"<div style=\"display:grid;grid-template-columns:72px 1fr;gap:{GAP}px;align-items:start\">"
             + frame(d['kn'], 54, 13) + "<div>" + label('OUTFIT') + body(d['o']) + "</div></div>"
             + block(label('INNER WHISPER'), bold('“ ' + d['inner'] + ' ”')) + "</div>")
    # Banshee / Place / Pose share one grid so the kaomoji frame ends level with the Pose bar
    nomb = lambda h: h.replace(f"margin-bottom:{GAP-3}px", "margin-bottom:0")
    kframe = (f"<div style=\"min-height:38px;height:100%;box-sizing:border-box;border:3px double {INK};background:{KDOTS};display:flex;"
              f"align-items:center;justify-content:center;font-size:11px;line-height:1;white-space:nowrap;overflow:hidden\">{d['kp']}</div>")
    duo = (f"<!--@ Banshee 카오모지 l · 옷차림 p / 장소 g · 자세 h -->"
           f"<div style=\"display:grid;grid-template-columns:1fr 1fr;column-gap:{GAP}px;row-gap:{GAP-3}px\">"
           + "<div style=\"display:flex;align-items:flex-start\"><div style=\"flex:1\">" + nomb(bar(d['pc'], '♘', 'pc')) + "</div></div>"
           + "<div style=\"display:flex;align-items:flex-start\"><div style=\"flex:1\">" + nomb(bar('Place', role='place')) + "</div></div>"
           + kframe
           + "<div>" + body(d['place'], 8) + f"<div style=\"margin-top:{GAP}px\">" + nomb(bar('Pose', role='pose')) + "</div></div>"
           + f"<div style=\"margin-top:3px\">" + label('OUTFIT') + body(d['p'], 8) + "</div>"
           + "<div>" + body(d['pose'], 8) + "</div>"
           + "</div>")
    tail = (f"<div style=\"position:absolute;left:14px;top:-9px;width:0;height:0;border-left:6px solid transparent;"
            f"border-right:6px solid transparent;border-bottom:7px solid {BAR}\"></div>")
    bubble = (f"<div style=\"position:relative;margin-top:{GAP+2}px;border-left:4px solid {BAR};border-top:3px double {BAR};"
              f"border-bottom:3px double {BAR};background:#e9e8ec;padding:7px 9px 6px\">" + tail + bold(d['msg'], 9)
              + f"<div style=\"text-align:right;font:italic 8px {SERIF};color:#55515a;margin-top:3px\">— from. {d['npc']}</div></div>")
    msg = ("<!--@ 메시지 j : 말풍선 --><div>" + bar('To. ' + d['pc'], '†', 'msg').replace(f"margin-bottom:{GAP-3}px", "margin-bottom:0") + bubble + "</div>")
    main = (f"<div style=\"flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:{GAP+4}px\">" + pride
            + duo + msg + "</div>")

    corner = lambda pos: (f"<span style=\"position:absolute;{pos};font-size:11px;line-height:1;color:{BAR};background:#fff;padding:0 1px;font-size:9px\">✚</span>")
    side_open = ("<!--@ 오른쪽 점선 칸 : 노래 a · 가수 b · 날짜 c · 요일 d · AM/PM e · 시각 f · 처음 만난 날 m -->"
            f"<div style=\"flex:0 0 36%;position:relative;border:2px dotted {BAR};padding:{GAP+6}px {GAP-2}px;box-sizing:border-box;"
            f"display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;gap:{GAP+4}px\">"
            + corner('top:-8px;left:-7px') + corner('top:-8px;right:-7px') + corner('bottom:-8px;left:-7px') + corner('bottom:-8px;right:-7px')
            )
    G2 = '#77737a'
    dbl = f"border-top:3px double {BAR};border-bottom:3px double {BAR}"
    if SIDE_STYLE == '1':   # 트랙리스트
        content = (f"<div style=\"width:100%\"><div style=\"font:700 7px/1 {SERIF};letter-spacing:.25em;color:{G2}\">𝄡 TRACK 01</div>"
            f"<div style=\"font:800 13.5px/1.14 {SERIF};color:{BAR};margin-top:8px\">{d['song']}</div>"
            f"<div style=\"font:8px/1.22 {SANS};color:{G2};margin-top:4px\">{d['artist']}</div>"
            f"<div style=\"display:flex;align-items:center;gap:4px;margin-top:9px;font-size:7px;color:{BAR}\"><span>◁◁</span>"
            f"<div style=\"flex:1;height:2px;background:linear-gradient(90deg,{BAR} 0 45%,#d9d8de 45%);position:relative\">"
            f"<span style=\"position:absolute;left:45%;top:-4px;margin-left:-4px;font-size:9px;line-height:1\">✚</span></div><span>▷▷</span></div></div>"
            + emblem()
            + f"<div style=\"width:100%;{dbl};padding:7px 0\"><div style=\"font:700 7px/1 {SERIF};letter-spacing:.2em;color:{G2}\">{d['day']} · {d['date']}</div>"
            f"<div style=\"font:800 20px/1 {SERIF};color:{BAR};margin-top:6px\"><span style=\"font-size:8px;letter-spacing:.1em;margin-right:2px\">{d['ampm']}</span>{d['time']}</div></div>"
            f"<div><div style=\"font:700 7px/1 {SERIF};letter-spacing:.25em;color:{G2}\">† SINCE †</div>"
            f"<div style=\"font:800 11px/1 {SERIF};color:{BAR};margin-top:5px\">{d['met']}</div></div>")
    elif SIDE_STYLE == '2':   # 달력 한 장
        content = (f"<div style=\"width:100%;border:1.5px solid {BAR};background:#fff\">"
            f"<div style=\"background:{BAR};color:#fff;font:700 8px/1 {SERIF};letter-spacing:.3em;padding:5px 0 4px\">{d['day']}</div>"
            f"<div style=\"height:4px;background:radial-gradient(circle,{BAR} 0 1.2px,transparent 1.6px) 0 0/8px 4px repeat-x;margin-top:3px\"></div>"
            f"<div style=\"font:800 13px/1.1 {SERIF};color:{BAR};padding:8px 2px 4px\">{d['date']}</div>"
            f"<div style=\"font:800 20px/1 {SERIF};color:{BAR};padding:2px 0 9px\"><span style=\"font-size:8px;letter-spacing:.1em;margin-right:2px\">{d['ampm']}</span>{d['time']}</div></div>"
            + emblem()
            + f"<div style=\"width:100%\"><div style=\"font:700 7px/1 {SERIF};letter-spacing:.25em;color:{G2}\">𝄡 NOW PLAYING</div>"
            f"<div style=\"font:800 13.5px/1.14 {SERIF};color:{BAR};margin-top:7px\">{d['song']}</div>"
            f"<div style=\"font:8px/1.22 {SANS};color:{G2};margin-top:4px\">— {d['artist']} —</div></div>"
            f"<div style=\"font:8px/1.32 {SANS};color:{BAR}\">first met on<br><b style=\"font:800 10px/1.43 {SERIF}\">{d['met']}</b></div>")
    elif SIDE_STYLE == '3':   # 장부(레저)
        row = lambda k, v, big=False: (f"<div style=\"display:flex;justify-content:space-between;align-items:baseline;gap:6px;padding:6px 0;border-bottom:1px dotted {BAR}\">"
            f"<span style=\"flex:none;font:700 7px/1 {SERIF};letter-spacing:.18em;color:{G2}\">{k}</span>"
            f"<span style=\"font:800 {'12px' if big else '9.5px'}/1.2 {SERIF};color:{BAR};text-align:right\">{v}</span></div>")
        content = (emblem()
            + f"<div style=\"width:100%;border-top:3px double {BAR}\">"
            + row('SONG', d['song']) + row('BY', f"<span style=\"font:8px/1.2 {SANS}\">{d['artist']}</span>")
            + row('DATE', d['date']) + row('DAY', d['day']) + row('TIME', f"<span style=\"font-size:7px;margin-right:2px\">{d['ampm']}</span>{d['time']}", True)
            + row('SINCE', d['met']) + "</div>"
            + f"<div style=\"font:italic 8px/1.3 {SERIF};color:{G2}\">every day since then<br>is counted on this page.</div>")
    elif SIDE_STYLE == '4':   # 티켓
        notch = lambda y: f"radial-gradient(circle at 0 {y},transparent 0 5px,#fff 5.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% {y},transparent 0 5px,#fff 5.5px) right/51% 100% no-repeat"
        content = (f"<div style=\"width:100%;box-sizing:border-box;background:{notch('50%')};border-top:1.5px solid {BAR};border-bottom:1.5px solid {BAR};padding:9px 6px\">"
            f"<div style=\"font:700 7px/1 {SERIF};letter-spacing:.25em;color:{G2}\">𝄡 ADMIT ONE</div>"
            f"<div style=\"font:800 13.5px/1.14 {SERIF};color:{BAR};margin-top:7px\">{d['song']}</div>"
            f"<div style=\"font:8px/1.22 {SANS};color:{G2};margin-top:4px\">{d['artist']}</div>"
            f"<div style=\"border-top:1.5px dashed {BAR};margin:9px -6px 7px\"></div>"
            f"<div style=\"font:700 7px/1 {SERIF};letter-spacing:.2em;color:{G2}\">{d['date']} · {d['day']}</div>"
            f"<div style=\"font:800 18px/1 {SERIF};color:{BAR};margin-top:5px\"><span style=\"font-size:7.5px;letter-spacing:.1em;margin-right:2px\">{d['ampm']}</span>{d['time']}</div></div>"
            + emblem()
            + f"<div style=\"width:100%;box-sizing:border-box;border-left:4px solid {BAR};{dbl};background:#e9e8ec;padding:6px 4px\">"
            f"<div style=\"font:700 7px/1 {SERIF};letter-spacing:.2em;color:{G2}\">FIRST MET</div>"
            f"<div style=\"font:800 10.5px/1 {SERIF};color:{BAR};margin-top:4px\">{d['met']}</div></div>")
    else:
        content = ("<div>"
            + f"<div style=\"font-size:14.5px;line-height:1;color:{BAR};margin-bottom:6px\">𝄡</div>"
            + f"<div style=\"font:9px/1.25 {SANS};color:{BAR}\">Which song<br>plays in<br>this scene?</div>"
            + f"<div style=\"font:800 13.5px/1.14 {SERIF};color:{BAR};margin-top:{GAP}px\">{d['song']}</div>"
            + f"<div style=\"font:8px/1.22 {SANS};color:#77737a;margin-top:4px\">— {d['artist']} —</div></div>"
            + emblem()
            + "<div>"
            + f"<div style=\"font:800 11px/1.14 {SERIF};color:{BAR}\">{d['date']}</div>"
            + f"<div style=\"font:700 7px/1.0 {SERIF};letter-spacing:.2em;color:#77737a;margin-top:4px\">{d['day']}</div>"
            + f"<div style=\"font:800 20px/1.0 {SERIF};color:{BAR};margin-top:6px\"><span style=\"font-size:8px;letter-spacing:.1em;margin-right:2px\">{d['ampm']}</span>{d['time']}</div></div>"
            + f"<div style=\"font:8px/1.32 {SANS};color:{BAR}\">The day they first met<br><b style=\"font:800 10px/1.43 {SERIF};color:{BAR}\">{d['met']}</b><br>every day since then<br>is counted on this page.</div>")
    side = side_open + content + "</div>"

    foot = ("<!--@ 쪽번호 : 디데이 n -->"
            f"<div style=\"text-align:center;margin-top:{GAP}px\"><span style=\"display:inline-block;background:#fff;border:1.5px solid {INK};border-radius:12px;"
            f"padding:4px 12px 3px;font:800 9px/1.0 {SERIF};color:{INK}\">† {d['dday']} †</span></div>")

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
