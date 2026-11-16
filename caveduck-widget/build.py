import urllib.parse, re, sys
out = sys.argv[1]

def uri(svg):
    svg = re.sub(r'\s+', ' ', svg).strip()
    return "url('data:image/svg+xml," + urllib.parse.quote(svg, safe=" =:/,.-'") .replace("'", "%27") + "')"

def rose_tile(hi, lo):
    r = ("<path d='M20 13c5 0 8 3 8 7s-3 8-8 8-8-3-8-7 3-6 6-6 5 2 5 5-2 4-4 4-3-1-3-3 1-2 2-2'/>"
         "<path d='M11 17c-2 6 2 12 9 13 7-1 11-7 9-13M14 12c3-3 9-3 12 0'/>")
    return uri(f"<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>"
               f"<defs><g id='r' fill='none' stroke-width='1.3' stroke-linecap='round'>{r}</g></defs>"
               f"<use href='#r' stroke='{lo}' x='.8' y='.9'/><use href='#r' stroke='{hi}'/>"
               f"<g transform='translate(34 34) scale(.62)'><use href='#r' stroke='{lo}' x='1' y='1'/><use href='#r' stroke='{hi}'/></g></svg>")

ROSE_LIGHT = rose_tile('rgba(255,255,255,.75)', 'rgba(90,60,80,.22)')
ROSE_FAINT = rose_tile('rgba(255,255,255,.7)', 'rgba(70,70,95,.13)')
ROSE_DARK  = rose_tile('rgba(255,255,255,.16)', 'rgba(0,0,0,.45)')

T = {
 'song':'{{a}}','artist':'{{b}}','date':'{{c}}','day':'{{d}}','ampm':'{{e}}','time':'{{f}}',
 'place':'{{g}}','pose':'{{h}}','inner':'{{i}}','msg':'{{j}}','kn':'{{k}}','kp':'{{l}}',
 'met':'{{m}}','dday':'{{n}}','npc':'Pride','pc':'Banshee',
}
P = {
 'song':'Lover, Come Back','artist':'Silver Rosé','date':'2026.11.16','day':'MON','ampm':'PM','time':'11:42',
 'met':'2026.03.14','dday':'D+247','place':'창가 쪽 화장대 앞, 은은한 스탠드 불빛 아래','pose':'거울 너머로 너를 보며 턱을 괸 채, 다리를 꼬고 앉아 있음',
 'inner':'오늘따라 왜 이렇게 예뻐 보이지… 들키면 안 되는데. 조금만 더 이렇게 보고 있고 싶어.','msg':'늦었는데 아직 안 자? 잠깐 얼굴 보고 싶어서. 금방 갈게, 문 열어둬.','npc':'Pride','pc':'Banshee',
 'kn':'(˶ˆ꒳ˆ˵) ♡','kp':'( ˘͈ ᵕ ˘͈ ♡)',
}

SERIF = "'Cormorant Garamond','Playfair Display','Nanum Myeongjo','Noto Serif KR',serif"
CHROME = "linear-gradient(145deg,#ffffff 0%,#c4c5cc 18%,#f3f3f6 36%,#9fa0a9 55%,#eeeef2 74%,#b3b4bc 100%)"

FILIGREE = "<div style=\"text-align:center;margin:7px 0 5px;font-size:12px;line-height:1;letter-spacing:.15em;color:#8d8b98;text-shadow:0 1px 0 #fff\">⊱ ─── ❦ ─── ⊰</div>"
FILIGREE_S = "<div style=\"text-align:center;margin-top:2px;font-size:10px;line-height:1;letter-spacing:.12em;color:#8d8b98;text-shadow:0 1px 0 #fff\">⊱ ── ❦ ── ⊰</div>"

CLASP = ("<div style=\"display:flex;flex-direction:column;align-items:center;margin-bottom:-12px;position:relative;z-index:2\">"
 f"<div style=\"width:34px;height:34px;border-radius:50% 50% 46% 46%;background:{CHROME};box-shadow:0 2px 3px rgba(0,0,0,.3),0 0 0 1px #7d7e88,inset 0 0 0 3px rgba(255,255,255,.4);text-align:center;font-size:22px;line-height:34px;color:#9fa0aa;text-shadow:0 1px 0 #fff,0 -1px 0 rgba(0,0,0,.25)\">❀</div>"
 f"<div style=\"width:12px;height:9px;margin-top:-1px;border-radius:0 0 2px 2px;background:{CHROME};box-shadow:0 0 0 1px #7d7e88\"></div></div>")

POS=[(3,6,22),(27,52,14),(50,4,18),(74,46,24),(90,0,13),(12,68,16),(62,76,12),(38,22,11)]
def roses(c, sh, scale=1.0):
    sp=''.join(f"<span style=\"position:absolute;left:{x}%;top:{y}%;font-size:{round(z*scale)}px\">❀</span>" for x,y,z in POS)
    return f"<div style=\"position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:inherit;line-height:1;color:{c};text-shadow:1px 1px 0 {sh}\">{sp}</div>"

def pan(bg, fg, inner, extra='', rose=('rgba(255,255,255,.55)','rgba(90,60,80,.18)')):
    inner = roses(*rose) + "<div style=\"position:relative\">" + inner + "</div>"
    return f"<div style=\"position:relative;border-radius:7px;padding:12px 14px;color:{fg};background:{bg};box-shadow:0 0 0 2px #2c2b33,0 0 0 4px #e9e9ee,0 0 0 5px #9a9aa3,inset 0 1px 6px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.35);{extra}\">{inner}</div>"

def label(t, c):
    return f"<div style=\"font:600 9px/1 {SERIF};letter-spacing:.32em;text-transform:uppercase;color:{c};margin-bottom:6px\">{t}</div>"

def build(d):
    lid = ("<!--@ 거울 뚜껑 (탭하면 아래가 여닫힘) : 노래 a · 가수 b · 날짜 c · 요일 d · AM/PM e · 시각 f -->"
     f"<div style=\"border-radius:18px;padding:16px 16px 12px;background:linear-gradient(160deg,#eceef2 0%,#cdd0d8 30%,#f9f9fb 48%,#c2c5cd 68%,#e4e6ea 100%);box-shadow:inset 0 2px 8px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.8);text-align:center\">"
     f"<div style=\"font:600 9px/1 {SERIF};letter-spacing:.4em;color:#7c7a88\">✦ NOW PLAYING ✦</div>"
     f"<div style=\"font:italic 600 19px/1.25 {SERIF};color:#3e3c49;margin-top:8px;text-shadow:0 1px 0 rgba(255,255,255,.9)\">♪ {d['song']}</div>"
     f"<div style=\"font:12px/1.4 {SERIF};color:#6d6b78;letter-spacing:.08em\">— {d['artist']} —</div>"
     f"<div style=\"display:flex;align-items:center;gap:8px;margin:10px 6px 0;font:10px {SERIF};color:#7c7a88\"><span>◁◁</span><div style=\"flex:1;height:3px;border-radius:3px;background:linear-gradient(90deg,#b9a3ae 0%,#b9a3ae 42%,#d9dbe1 42%);box-shadow:inset 0 1px 1px rgba(0,0,0,.25)\"></div><span>❚❚</span><span>▷▷</span></div>"
     f"{FILIGREE}"
     f"<div style=\"display:flex;justify-content:center;align-items:baseline;gap:10px;color:#4b4957;text-shadow:0 1px 0 #fff\">"
     f"<span style=\"font:600 12px {SERIF};letter-spacing:.12em\">{d['date']}</span><span style=\"font:600 10px {SERIF};letter-spacing:.2em;color:#8a8796\">{d['day']}</span>"
     f"<span style=\"font:600 22px/1 {SERIF};letter-spacing:.06em\"><small style=\"font-size:10px;letter-spacing:.15em;margin-right:3px\">{d['ampm']}</small>{d['time']}</span></div>"
     f"<div style=\"text-align:center;font:600 8px {SERIF};letter-spacing:.35em;color:#9a98a5;margin-top:6px\">✦ TAP TO OPEN · CLOSE ✦</div></div>")

    hinge = ("<!--@ 경첩 --><div style=\"display:flex;justify-content:center;gap:46px;height:9px;margin:2px 0\">"
             + ("<div style=\"width:30px;height:9px;border-radius:3px;background:linear-gradient(180deg,#fff,#9c9da6 50%,#e9e9ee);box-shadow:0 1px 1px rgba(0,0,0,.3)\"></div>"*2) + "</div>")

    def slot(k, v):
        return (f"<div style=\"display:flex;align-items:center;gap:9px;padding:7px 12px;border-radius:9px;background:linear-gradient(180deg,#c9cad1,#eceef1);box-shadow:inset 0 2px 5px rgba(0,0,0,.3),0 1px 0 #fff\">"
                f"<span style=\"flex:none;width:22px;height:5px;border-radius:5px 2px 2px 5px;background:linear-gradient(90deg,#3b3a40 0 35%,#d8d9de 35% 100%);box-shadow:0 1px 1px rgba(0,0,0,.3)\"></span>"
                f"<span style=\"flex:none;font:600 9px {SERIF};letter-spacing:.25em;color:#7a7886\">{k}</span>"
                f"<span style=\"font-size:12px;line-height:1.45;color:#3e3c49\">{v}</span></div>")

    pink = f"radial-gradient(circle at 30% 20%,rgba(255,255,255,.7),transparent 45%),linear-gradient(150deg,#f3e6ea,#e6d2d9 55%,#efdfe4)"
    lav  = f"radial-gradient(circle at 75% 25%,rgba(255,255,255,.55),transparent 45%),linear-gradient(150deg,#cfcfdc,#b5b4c6 55%,#c9c8d6)"
    char = f"linear-gradient(150deg,#56545f,#3f3d48 60%,#4b4954)"
    pearl= f"radial-gradient(circle at 30% 30%,#fff,transparent 55%),linear-gradient(150deg,#f6f6f8,#dfe0e6)"
    bs = ""

    inner = (f"<details style=\"margin:0\"><summary style=\"cursor:pointer;list-style:none;outline:none\">{label('♡ Inner Whisper · '+d['npc']+'의 속마음','#9a7884')}"
             f"<div style=\"font-size:10px;color:#a68a94;letter-spacing:.1em\">▾ tap to open · close</div></summary>"
             f"<div style=\"margin-top:8px;font:italic 13px/1.65 {SERIF};color:#5a4650;text-shadow:0 1px 0 rgba(255,255,255,.7)\">“ {d['inner']} ”</div></details>")
    msg = (label('✧ To. '+d['pc'],'#5e5c73') +
           f"<div style=\"font-size:13px;line-height:1.65;color:#34323f;text-shadow:0 1px 0 rgba(255,255,255,.5)\">{d['msg']}</div>"
           f"<div style=\"text-align:right;font:italic 11px {SERIF};color:#5e5c73;margin-top:4px\">— from. {d['npc']}</div>")
    def kao(name, k, c1, c2):
        return (f"<div style=\"font:600 9px {SERIF};letter-spacing:.25em;color:{c1};text-align:center\">{name}</div>"
                f"<div style=\"font-size:15px;line-height:1.6;text-align:center;color:{c2};margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">{k}</div>")

    base = (f"<!--@ 아래 트레이 --><div style=\"border-radius:18px;padding:12px 12px 16px;background:linear-gradient(160deg,#f4f4f7,#d6d7de 45%,#f0f0f3);box-shadow:inset 0 2px 7px rgba(0,0,0,.2),inset 0 0 0 1px rgba(255,255,255,.8)\">"
            f"<div style=\"display:grid;gap:7px;margin-bottom:16px\"><!--@ 브러시 홈 : 장소 g / 자세 h -->{slot('PLACE',d['place'])}{slot('POSE',d['pose'])}</div>"
            f"<div style=\"display:grid;gap:14px;padding:0 5px\">"
            + "<!--@ 핑크 팬 : Pride의 속마음 i (탭해서 여닫기) -->" + pan(pink,'#5a4650',inner,bs)
            + "<!--@ 라벤더 팬 : Pride → Banshee 메시지 j -->" + pan(lav,'#34323f',msg,bs)
            + "<!--@ 카오모지 : 차콜 팬 Pride k / 펄 팬 Banshee l -->" + "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:14px\">"
            + pan(char,'#eeeaf3',kao(d['npc'],d['kn'],'#b9b5c6','#f3eff8'),bs+';padding:10px 8px',('rgba(255,255,255,.07)','rgba(0,0,0,.35)'))
            + pan(pearl,'#4b4957',kao(d['pc'],d['kp'],'#8b8898','#4b4957'),bs+';padding:10px 8px')
            + "</div></div>"
            f"<!--@ 바닥 각인 글씨 --><div style=\"text-align:center;margin-top:14px;font:italic 600 13px {SERIF};letter-spacing:.3em;color:#a3a4ad;text-shadow:0 1px 0 #fff,0 -1px 0 rgba(0,0,0,.18)\">Rosée</div></div>")

    tag = (f"<!--@ 은판 : 처음 만난 날 m / 디데이 n --><div style=\"display:flex;justify-content:center;margin-top:-8px;position:relative;z-index:1\"><div style=\"padding:4px;border-radius:50%/50%;background:{CHROME};box-shadow:0 5px 12px rgba(60,58,72,.25),0 0 0 1px #8e8f98\">"
           f"<div style=\"padding:10px 32px 8px;border-radius:50%/50%;text-align:center;position:relative;background:linear-gradient(160deg,#eceef2,#cdd0d8 35%,#f9f9fb 52%,#c7cad2);box-shadow:inset 0 2px 5px rgba(0,0,0,.22)\">"
           f"{roses('rgba(255,255,255,.6)','rgba(70,70,95,.12)',.7)}<div style=\"position:relative\"><div style=\"font:600 7px {SERIF};letter-spacing:.35em;color:#8a8796\">— SINCE {d['met']} —</div>"
           f"<div style=\"font:italic 600 21px/1.15 {SERIF};color:#4b4957;letter-spacing:.05em;text-shadow:0 1px 0 #fff,0 -1px 0 rgba(0,0,0,.15)\">{d['dday']}</div>"
           f"{FILIGREE_S}</div></div></div></div>")

    return ("<div style=\"max-width:360px;margin:12px auto;padding:4px 2px 8px;font-family:'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif;word-break:keep-all;box-sizing:border-box\">"
            + "<!--@ 장미 잠금쇠 -->" + CLASP +
            f"<!--@ 은색 케이스 --><div style=\"border-radius:26px;padding:9px;background:{CHROME};box-shadow:0 8px 22px rgba(60,58,72,.28),0 1px 0 #fff inset,0 0 0 1px #8e8f98\">"
            + "<details open style=\"margin:0\"><summary style=\"cursor:pointer;list-style:none;outline:none;display:block\">" + lid + "</summary>" + hinge + base + "</details></div>" + tag + "</div>")


def pretty(h):
    import re
    toks=re.findall(r'<!--.*?-->|<svg.*?</svg>|</?[a-z]+[^>]*>|[^<]+',h,flags=re.S)
    BLOCK=('div','details','summary')
    out=[];depth=0;stack=[]
    def nl(): out.append('\n'+'  '*depth)
    for t in toks:
        m=re.match(r'<(/?)([a-z]+)',t)
        if t.startswith('<!--@'):
            nl(); out.append('<!-- '+t[5:-3].strip()+' -->')
        elif t.startswith('<svg'):
            nl(); out.append(t)
            if stack: stack[-1]=True
        elif m and m.group(2) in BLOCK and not m.group(1):
            if stack: stack[-1]=True
            nl(); out.append(t); depth+=1; stack.append(False)
        elif m and m.group(2) in BLOCK:
            depth-=1; had=stack.pop()
            if had: nl()
            out.append(t)
        else:
            out.append(t)
    return ''.join(out).strip()+'\n'

open(f"{out}/rose-compact-widget.html","w").write(pretty(build(T)))
open(f"{out}/preview.html","w").write("<!doctype html><html lang='ko'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Rose Compact</title>"
  "<link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&display=swap' rel='stylesheet'></head>"
  "<body style='margin:0;padding:16px;background:#f3efe9'>"+pretty(build(P))+"</body></html>\n")
