// ==========================================================================
// 페이지 레이아웃 (잡지 · 책 · 문서 창 · 메모 · 사진 배치 템플릿)
// --------------------------------------------------------------------------
// 레이아웃을 고르면 캔버스가 "한 장의 페이지"가 된다.
//  - 글 칸: 배치 탭에서 칸마다 따로 쓴 글이 들어간다 (칸마다 폰트 · 크기 · 행간 따로).
//    글이 칸보다 길면 글자를 자동으로 줄여서 다 들어가게 한다.
//  - 사진 칸 · 장식(창 테두리, 책, 아래 줄 정보 등)은 #pageLayoutLayer에 그린다 (글보다 뒤).
// 페이지 크기(너비 · 높이)는 배치 탭에서 정하고, 칸 위치는 페이지 크기에 대한 % 라서 같이 늘어난다.
// 저장(html2canvas)에서 안 되는 CSS(filter 등)는 쓰지 않는다. 흑백은 사진을 미리 흑백으로 바꿔서 넣는다.
// ==========================================================================

const PAGE_LAYOUTS = {
    none: { name: "사용 안 함" },

    magStrip: {
        stretchY: 50,
        name: "잡지 · 오른쪽 사진줄",
        minAspect: 0.85,
        slots: [{ label: "왼쪽 아래 글", left: 8, bottom: 21, width: 50, maxH: 70, size: 15 }],
        images: [["s1", "사진 1"], ["s2", "사진 2"], ["s3", "사진 3"], ["s4", "사진 4"]],
        fields: [
            { key: "label", label: "사진 위 작은 글", type: "text", def: "clover" },
            { key: "f1", label: "아래 줄 1", type: "text", def: "Clover&Rain" },
            { key: "f2", label: "아래 줄 2", type: "text", def: "03 / 100" },
            { key: "f3", label: "아래 줄 3", type: "text", def: "Umbrella" },
            { key: "f4", label: "아래 줄 4", type: "text", def: "Trifolium" },
            { key: "gray", label: "사진 흑백", type: "check", def: true },
        ],
        render(L, s, h) {
            const y0 = h.y(9), y1 = h.y(88), gap = (y1 - y0) * 0.04, each = (y1 - y0 - gap * 3) / 4;
            [0, 1, 2, 3].forEach((i) => L.appendChild(h.img(`s${i + 1}`, { left: 66, width: 26, topPx: y0 + i * (each + gap), heightPx: each }, { gray: s.gray })));
            L.appendChild(h.text(s.label, { left: 66, top: 5.6 }, { size: 0.026, color: "muted", italic: true }));
            h.footer(L, [s.f1, s.f2, s.f3, s.f4]);
        },
    },

    magBig: {
        stretchY: 70,
        name: "잡지 · 큰 사진",
        minAspect: 0.85,
        slots: [{ label: "오른쪽 아래 글", left: 44, top: 62, width: 48, bottom: 14, size: 15 }],
        images: [["main", "큰 사진"]],
        fields: [
            { key: "label", label: "사진 위 작은 글", type: "text", def: "material/emotional" },
            { key: "f1", label: "아래 줄 1", type: "text", def: "Clover&Rain" },
            { key: "f2", label: "아래 줄 2", type: "text", def: "01 / 100" },
            { key: "f3", label: "아래 줄 3", type: "text", def: "Human" },
            { key: "f4", label: "아래 줄 4", type: "text", def: "rain/umbrella" },
            { key: "gray", label: "사진 흑백", type: "check", def: false },
        ],
        render(L, s, h) {
            L.appendChild(h.img("main", { left: 8, top: 9, width: 58, height: 48 }, { gray: s.gray }));
            L.appendChild(h.text(s.label, { left: 8, top: 5.6 }, { size: 0.026, color: "muted", italic: true }));
            h.footer(L, [s.f1, s.f2, s.f3, s.f4]);
        },
    },

    book: {
        stretchY: 50,
        name: "펼친 책",
        size: [520, 650],
        fixedH: true,
        slots: [{ label: "오른쪽 쪽 글", left: 54, top: 26, width: 35, bottom: 25, size: 12 }],
        images: [["left", "왼쪽 쪽 사진"]],
        fields: [
            { key: "outerBg", label: "바깥 배경색", type: "color", def: "#0c0c0c" },
            { key: "pageColor", label: "종이 색", type: "color", def: "#ffffff" },
            { key: "spineColor", label: "가운데 선 색", type: "color", def: "#b84a4a" },
            { key: "leftOpacity", label: "왼쪽 사진 진하기", type: "range", min: 10, max: 100, def: 100 },
            { key: "gray", label: "사진 흑백", type: "check", def: false },
        ],
        render(L, s, h) {
            L.appendChild(h.box({ left: 0, top: 0, width: 100, height: 100 }, { background: s.outerBg }));
            L.appendChild(h.box({ left: 6, top: 20, width: 88, height: 60 }, { background: s.pageColor, boxShadow: "0 10px 30px rgba(0,0,0,.45)" }));
            const pic = h.img("left", { left: 6, top: 20, width: 44, height: 60 }, { gray: s.gray, placeholderOn: s.pageColor });
            pic.style.opacity = String((parseFloat(s.leftOpacity) || 100) / 100);
            L.appendChild(pic);
            L.appendChild(h.box({ left: 50, top: 20, width: 0, height: 60 }, { borderLeft: `1px dashed ${s.spineColor}` }));
        },
    },

    doc: {
        stretchY: 50,
        name: "문서 두 쪽",
        minAspect: 0.62,
        slots: [{ label: "왼쪽 쪽 글", left: 9, top: 8, width: 35.5, bottom: 4, size: 15, indent: true }, { label: "오른쪽 쪽 글", left: 55.5, top: 8, width: 35.5, bottom: 4, size: 15, indent: true }],
        fields: [
            { key: "outerBg", label: "바깥 배경색", type: "color", def: "#d9d9d9" },
            { key: "paperColor", label: "종이 색", type: "color", def: "#f2e8d8" },
        ],
        render(L, s, h) {
            L.appendChild(h.box({ left: 0, top: 0, width: 100, height: 100 }, { background: s.outerBg }));
            L.appendChild(h.box({ left: 5, top: 4, width: 43.5, height: 96 }, { background: s.paperColor }));
            L.appendChild(h.box({ left: 51.5, top: 4, width: 43.5, height: 96 }, { background: s.paperColor }));
        },
    },

    memo: {
        stretchY: 50,
        name: "메모 앱 창",
        minAspect: 0.6,
        slots: [{ label: "창 안 글", left: 12, top: 31, width: 76, bottom: 22, size: 15 }],
        fields: [
            { key: "date", label: "날짜", type: "text", def: "2026년 11월 23일 오후 2:35" },
            { key: "title", label: "제목", type: "text", def: "1-1. 《제목》" },
            { key: "sign", label: "서명", type: "text", def: "©" },
            { key: "winColor", label: "창 색", type: "color", def: "#ffffff" },
            { key: "barColor", label: "위쪽 막대 색", type: "color", def: "#f5f5f5" },
        ],
        render(L, s, h) {
            const win = h.box({ left: 7, top: 12, width: 86, height: 74 }, { background: s.winColor, borderRadius: h.px(0.028), boxShadow: "0 8px 28px rgba(0,0,0,.16)", border: "1px solid rgba(0,0,0,.08)", overflow: "hidden" });
            const bar = h.box({ left: 0, top: 0, width: 100, rel: true }, { height: h.px(0.06), background: s.barColor, borderBottom: "1px solid rgba(0,0,0,.07)" });
            [4, 7.5, 11].forEach((x) => bar.appendChild(h.box({ left: x, top: 34, width: 0, height: 0, rel: true }, { width: h.px(0.026), height: h.px(0.026), borderRadius: "50%", background: "#d9d9d9" })));
            win.appendChild(bar);
            L.appendChild(win);
            L.appendChild(h.text(s.date, { left: 7, top: 23, width: 86 }, { size: 0.024, color: "muted", align: "center" }));
            L.appendChild(h.text(s.title, { left: 12, top: 25.8, width: 76 }, { size: 0.042, bold: true }));
            L.appendChild(h.text(s.sign, { left: 12, bottom: 17, width: 76 }, { size: 0.028, align: "right" }));
        },
    },

    center: {
        stretchY: 70,
        name: "가운데 그림 + 캡션",
        size: [520, 650],
        fixedH: true,
        slots: [{ label: "그림 아래 글", left: 10, top: 62, width: 80, align: "center", maxH: 33, size: 16 }],
        images: [["main", "가운데 그림"]],
        fields: [
            { key: "border", label: "그림 테두리", type: "check", def: true },
            { key: "gray", label: "사진 흑백", type: "check", def: false },
        ],
        render(L, s, h) {
            L.appendChild(h.img("main", { left: 29, top: 17, width: 42, height: 40 }, { gray: s.gray, border: s.border }));
        },
    },

    duo: {
        stretchY: [40, 60],
        name: "사진 두 장 · 대각선",
        minAspect: 0.55,
        slots: [{ label: "왼쪽 위 사진 옆 글", left: 46, top: 5, width: 50, maxH: 44, size: 24 }, { label: "오른쪽 아래 사진 옆 글", left: 4, bottom: 5, width: 50, align: "right", maxH: 44, size: 18 }],
        images: [["a", "왼쪽 위 사진"], ["b", "오른쪽 아래 사진"]],
        fields: [
            { key: "border", label: "사진 테두리", type: "check", def: true },
            { key: "gray", label: "사진 흑백", type: "check", def: false },
        ],
        render(L, s, h) {
            L.appendChild(h.img("a", { left: 4, top: 4, width: 38, height: 31 }, { gray: s.gray, border: s.border }));
            L.appendChild(h.img("b", { right: 4, bottom: 4, width: 38, height: 31 }, { gray: s.gray, border: s.border }));
        },
    },

    zigzag: {
        stretchY: [40, 60],
        name: "지그재그 소개 + 배경 사진",
        minAspect: 0.7,
        slots: [{ label: "위 사진 옆 글", left: 37, top: 5, width: 58, maxH: 43, size: 16 }, { label: "아래 사진 옆 글", left: 5, bottom: 5, width: 58, align: "right", maxH: 43, size: 16 }],
        images: [["art", "배경 사진"], ["a", "위 사진"], ["b", "아래 사진"]],
        fields: [
            { key: "overlayColor", label: "오버레이색", type: "color", def: "#000000" },
            { key: "overlayAmount", label: "투명도", type: "range", min: 0, max: 100, def: 0 },
            { key: "border", label: "위·아래 사진 테두리", type: "check", def: true },
            { key: "gray", label: "위·아래 사진 흑백", type: "check", def: true },
        ],
        render(L, s, h) {
            // 배경 사진은 흐리게 하지 않고 그대로 깐다
            L.appendChild(h.img("art", { left: 0, top: 0, width: 100, height: 100 }, { noPlaceholder: true }));
            // 색상 오버레이 (배경 탭과 같은 방식): 배경 사진 위에 고른 색을 투명도만큼 덮는다
            if (((pageLayoutState.images.zigzag || {}).art) && parseFloat(s.overlayAmount) > 0) {
                const ov = h.box({ left: 0, top: 0, width: 100, height: 100 }, { background: s.overlayColor });
                ov.style.opacity = String(parseFloat(s.overlayAmount) / 100);
                L.appendChild(ov);
            }
            L.appendChild(h.img("a", { left: 5, top: 5, width: 28, height: 25 }, { gray: s.gray, border: s.border }));
            L.appendChild(h.img("b", { right: 5, bottom: 5, width: 28, height: 25 }, { gray: s.gray, border: s.border }));
        },
    },
    split: {
        stretchY: 50,
        name: "양쪽 사진 + 가운데 좁은 글",
        minAspect: 0.78,
        slots: [{ label: "가운데 좁은 글", left: 43, top: 5, width: 14, bottom: 5, align: "center", vcenter: true, size: 11 }],
        slotsFor(v) {
            const w = Math.min(60, Math.max(5, parseFloat(v.colW) || 14));
            return [Object.assign({}, this.slots[0], { left: 50 - w / 2, width: w })];
        },
        images: [["left", "왼쪽 사진"], ["right", "오른쪽 사진"]],
        fields: [
            { key: "colW", label: "가운데 글 칸 폭", type: "range", min: 5, max: 60, def: 14 },
            { key: "leftOvColor", label: "왼쪽 오버레이색", type: "color", def: "#ffffff" },
            { key: "leftOv", label: "왼쪽 투명도", type: "range", min: 0, max: 100, def: 0 },
            { key: "rightOvColor", label: "오른쪽 오버레이색", type: "color", def: "#000000" },
            { key: "rightOv", label: "오른쪽 투명도", type: "range", min: 0, max: 100, def: 0 },
            { key: "gray", label: "사진 흑백", type: "check", def: false },
        ],
        render(L, s, h) {
            const imgs = pageLayoutState.images.split || {};
            [["left", 0, s.leftOvColor, s.leftOv], ["right", 50, s.rightOvColor, s.rightOv]].forEach(([key, x, c, amt]) => {
                L.appendChild(h.img(key, { left: x, top: 0, width: 50, height: 100 }, { gray: s.gray }));
                if (imgs[key] && parseFloat(amt) > 0) {
                    const ov = h.box({ left: x, top: 0, width: 50, height: 100 }, { background: c });
                    ov.style.opacity = String(parseFloat(amt) / 100);
                    L.appendChild(ov);
                }
            });
        },
    },
    photoPanel: {
        stretchY: [50, 85],
        name: "왼쪽 사진 + 오른쪽 단색 칸",
        minAspect: 1.0,
        slots: [
            { label: "사진 위 큰 글", left: 4, top: 46, width: 56, size: 48, maxH: 20, align: "center", color: "#f3d6e4" },
            { label: "사진 아래 글", left: 6, bottom: 3, width: 52, size: 16, maxH: 22, align: "center", color: "#eeeeee" },
            { label: "오른쪽 칸 글", left: 66, top: 5, width: 30, bottom: 5, size: 14, align: "center", vcenter: true },
        ],
        slotsFor(v) {
            const pw = Math.min(60, Math.max(20, parseFloat(v.panelW) || 36));
            const pl = 100 - pw;
            const pad = 3;
            return [
                Object.assign({}, this.slots[0], { left: 3, width: pl - 6 }),
                Object.assign({}, this.slots[1], { left: 4, width: pl - 8 }),
                Object.assign({}, this.slots[2], { left: pl + pad, width: pw - pad * 2 }),
            ];
        },
        images: [["photo", "왼쪽 사진"]],
        fields: [
            { key: "panelW", label: "오른쪽 칸 폭", type: "range", min: 20, max: 60, def: 36 },
            { key: "panelColor", label: "오른쪽 칸 색", type: "color", def: "#f3dfe7" },
            { key: "ovColor", label: "사진 오버레이색", type: "color", def: "#000000" },
            { key: "ov", label: "사진 투명도", type: "range", min: 0, max: 100, def: 20 },
            { key: "gray", label: "사진 흑백", type: "check", def: true },
        ],
        render(L, s, h) {
            const pw = Math.min(60, Math.max(20, parseFloat(s.panelW) || 36));
            L.appendChild(h.img("photo", { left: 0, top: 0, width: 100 - pw, height: 100 }, { gray: s.gray }));
            if (((pageLayoutState.images.photoPanel || {}).photo) && parseFloat(s.ov) > 0) {
                const ov = h.box({ left: 0, top: 0, width: 100 - pw, height: 100 }, { background: s.ovColor });
                ov.style.opacity = String(parseFloat(s.ov) / 100);
                L.appendChild(ov);
            }
            L.appendChild(h.box({ left: 100 - pw, top: 0, width: pw, height: 100 }, { background: s.panelColor, boxShadow: "-4px 0 14px rgba(0,0,0,.18)" }));
        },
    },
};

// ---- 상태 ----
// { id, values: { [layoutId]: {field: value} }, images: { [layoutId]: {key: dataURL} } }
let pageLayoutState = { id: "none", values: {}, images: {} };
let __pageLayoutTouched = false; // 저장소에서 불러오기 전에 사용자가/프리셋이 이미 바꿨는지

function isPageLayoutActive() {
    return !!(pageLayoutState.id && pageLayoutState.id !== "none" && PAGE_LAYOUTS[pageLayoutState.id]);
}

function getPageLayoutValues(id) {
    const t = PAGE_LAYOUTS[id];
    const saved = pageLayoutState.values[id] || {};
    const out = {};
    (t.fields || []).forEach((f) => { out[f.key] = saved[f.key] !== undefined ? saved[f.key] : f.def; });
    return out;
}

function getPageLayoutState() {
    return JSON.parse(JSON.stringify(pageLayoutState));
}

function setPageLayoutState(st) {
    if (!st || typeof st !== "object") return;
    const keepImages = st.imagesOmitted ? pageLayoutState.images : null;
    pageLayoutState = {
        id: PAGE_LAYOUTS[st.id] ? st.id : "none",
        values: st.values && typeof st.values === "object" ? st.values : {},
        images: keepImages || (st.images && typeof st.images === "object" ? st.images : {}),
    };
    __pageLayoutTouched = true;
    buildPageLayoutPanel();
    savePageLayoutSoon();
}

// ---- 저장 (IndexedDB · 사진이 커서 localStorage 대신) ----
function pageLayoutDb() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error("IndexedDB 미지원"));
        const req = indexedDB.open("camelia-layout", 1);
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains("s")) req.result.createObjectStore("s"); };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
let __pageLayoutSaveTimer = null;
function savePageLayoutSoon() {
    clearTimeout(__pageLayoutSaveTimer);
    __pageLayoutSaveTimer = setTimeout(async () => {
        try {
            const db = await pageLayoutDb();
            const tx = db.transaction("s", "readwrite");
            tx.objectStore("s").put(pageLayoutState, "state");
            tx.oncomplete = () => db.close();
        } catch (e) { console.warn("레이아웃 저장 실패:", e); }
    }, 400);
}
async function loadPageLayoutFromDb() {
    try {
        const db = await pageLayoutDb();
        const st = await new Promise((resolve) => {
            const r = db.transaction("s", "readonly").objectStore("s").get("state");
            r.onsuccess = () => resolve(r.result || null);
            r.onerror = () => resolve(null);
        });
        db.close();
        if (!st) return;
        if (__pageLayoutTouched) {
            // 이미 다른 설정이 적용됐으면 빠진 사진만 채운다
            Object.keys(st.images || {}).forEach((id) => {
                pageLayoutState.images[id] = Object.assign({}, st.images[id], pageLayoutState.images[id] || {});
            });
        } else {
            pageLayoutState = { id: PAGE_LAYOUTS[st.id] ? st.id : "none", values: st.values || {}, images: st.images || {} };
        }
        buildPageLayoutPanel();
        if (typeof updateCanvas === "function") updateCanvas();
    } catch (e) { /* 저장소를 못 쓰면 그냥 넘어감 */ }
}

// ---- 사진 처리 (줄이기 · 흑백) ----
function readImageFile(file, maxSide) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
            const img = new Image();
            img.onload = () => {
                const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
                const c = document.createElement("canvas");
                c.width = Math.max(1, Math.round(img.naturalWidth * k));
                c.height = Math.max(1, Math.round(img.naturalHeight * k));
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                const png = /png|gif|webp/.test(file.type);
                resolve(c.toDataURL(png ? "image/png" : "image/jpeg", 0.9));
            };
            img.onerror = reject;
            img.src = fr.result;
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}
const __grayCache = new Map();
function getGrayImage(src) {
    if (__grayCache.has(src)) return __grayCache.get(src);
    __grayCache.set(src, null);
    const img = new Image();
    img.onload = () => {
        try {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            const ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const d = ctx.getImageData(0, 0, c.width, c.height);
            const p = d.data;
            for (let i = 0; i < p.length; i += 4) {
                const g = Math.round(p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114);
                p[i] = p[i + 1] = p[i + 2] = g;
            }
            ctx.putImageData(d, 0, 0);
            __grayCache.set(src, c.toDataURL(src.startsWith("data:image/png") ? "image/png" : "image/jpeg", 0.9));
            if (typeof updateCanvas === "function") updateCanvas();
        } catch (e) { __grayCache.delete(src); }
    };
    img.src = src;
    return null;
}

// ---- 그리기 ----
// 세로 위치 바꾸기: 설계 높이 Hb 기준 % → px. 늘어난 만큼(extra)은 "늘어나는 줄(ys)" 아래쪽에만 더해진다.
// → 늘어나는 줄 위의 사진 · 글은 그대로, 줄을 가로지르는 칸은 길어지고, 그 아래 것은 아래로 밀린다.
function makeYMap(Hb, lines) {
    // lines: [[ys, extra], ...] — ys 아래쪽은 그 줄에서 늘어난 만큼 밀린다
    return (pct) => (pct * Hb) / 100 + lines.reduce((sum, [ys, ex]) => sum + (pct > ys ? ex : 0), 0);
}

function placeVert(el, p, Y, H) {
    if (p.topPx !== undefined) {
        el.style.top = `${p.topPx}px`;
        if (p.heightPx !== undefined) el.style.height = `${p.heightPx}px`;
        return;
    }
    let y1 = null, y2 = null;
    if (p.top !== undefined) y1 = p.top;
    if (p.bottom !== undefined) y2 = 100 - p.bottom;
    if (p.height !== undefined) {
        if (y1 !== null) y2 = y1 + p.height;
        else if (y2 !== null) y1 = y2 - p.height;
    }
    if (y1 !== null && y2 !== null) {
        el.style.top = `${Y(y1)}px`;
        el.style.height = `${Math.max(0, Y(y2) - Y(y1))}px`;
    } else if (y1 !== null) {
        el.style.top = `${Y(y1)}px`;
    } else if (y2 !== null) {
        el.style.bottom = `${H - Y(y2)}px`;
    }
}

function pageLayoutHelpers(W, H, color, muted, font, Y, Hb) {
    const pos = (el, p) => {
        el.style.position = "absolute";
        el.style.boxSizing = "border-box";
        ["left", "right"].forEach((k) => { if (p[k] !== undefined) el.style[k] = `${p[k]}%`; });
        if (p.width !== undefined) el.style.width = `${p.width}%`;
        if (p.rel) {
            ["top", "bottom"].forEach((k) => { if (p[k] !== undefined) el.style[k] = `${p[k]}%`; });
            if (p.height !== undefined) el.style.height = `${p.height}%`;
            return;
        }
        placeVert(el, p, Y, H);
    };
    const h = {
        y: (pct) => Y(pct),
        // 장식 글자 · 테두리 크기는 처음(설계) 높이 기준 — 페이지가 길어져도 커지지 않는다
        px: (k) => `${(Math.min(W, Hb || H) * k).toFixed(2)}px`,
        box(p, css) {
            const el = document.createElement("div");
            pos(el, p);
            Object.assign(el.style, css || {});
            return el;
        },
        text(str, p, o) {
            const el = document.createElement("div");
            pos(el, p);
            el.textContent = str || "";
            el.style.fontFamily = font;
            el.style.fontSize = h.px(o.size || 0.03);
            el.style.lineHeight = "1.3";
            el.style.color = o.color === "muted" ? muted : color;
            el.style.whiteSpace = "nowrap";
            if (o.italic) el.style.fontStyle = "italic";
            if (o.bold) el.style.fontWeight = "700";
            if (o.align) el.style.textAlign = o.align;
            return el;
        },
        img(key, p, o) {
            const el = document.createElement("div");
            pos(el, p);
            const src = ((pageLayoutState.images[pageLayoutState.id] || {})[key]) || "";
            let url = src;
            if (src && o.gray) url = getGrayImage(src) || src;
            if (url) {
                el.style.backgroundImage = `url("${url}")`;
                el.style.backgroundSize = o.contain ? "contain" : "cover";
                el.style.backgroundPosition = "center";
                el.style.backgroundRepeat = "no-repeat";
            } else if (!o.noPlaceholder) {
                el.style.background = "rgba(128,128,128,.14)";
                el.style.display = "flex";
                el.style.alignItems = "center";
                el.style.justifyContent = "center";
                el.style.color = "rgba(128,128,128,.7)";
                el.style.fontSize = h.px(0.026);
                el.style.fontFamily = font;
                el.textContent = "사진 칸";
            }
            if (o.border) el.style.border = `${Math.max(1.5, W * 0.004).toFixed(1)}px solid ${color}`;
            return el;
        },
        footer(L, items) {
            L.appendChild(h.box({ left: 8, bottom: 11, width: 84, height: 0 }, { borderTop: `1px solid ${color}` }));
            const row = h.box({ left: 8, bottom: 6.6, width: 84 }, { display: "flex", justifyContent: "space-between" });
            items.forEach((t) => {
                const s = document.createElement("span");
                s.textContent = t || "";
                s.style.fontFamily = font;
                s.style.fontSize = h.px(0.024);
                s.style.color = color;
                s.style.whiteSpace = "nowrap";
                row.appendChild(s);
            });
            L.appendChild(row);
        },
    };
    return h;
}

function clearPageLayout() {
    const area = els.captureArea;
    if (!area || !area.classList.contains("pl-on")) return;
    area.classList.remove("pl-on");
    ["pageLayoutLayer", "pageLayoutText"].forEach((id) => { const el = document.getElementById(id); if (el) el.remove(); });
}

// 페이지 크기(너비 · 높이, px). 레이아웃마다 따로 기억한다.
// 기본: 너비 820, 높이는 글 길이에 맞춰 자동으로 늘어남 (펼친 책 · 가운데 그림은 520×650 고정)
function getPageLayoutSize(id) {
    const t = PAGE_LAYOUTS[id] || {};
    const v = pageLayoutState.values[id] || {};
    const d = t.size || [820, Math.round(820 * (t.minAspect || 0.8))];
    const w = Math.min(2000, Math.max(200, parseFloat(v.pageW) || d[0]));
    const h = Math.min(4000, Math.max(200, parseFloat(v.pageH) || d[1]));
    const auto = v.autoH !== undefined ? !!v.autoH : !t.fixedH;
    return { w, h, auto, minH: Math.round(w * (t.minAspect || (d[1] / d[0]))) };
}

// 칸 글 설정: t{번호}=글, t{번호}_font, t{번호}_size, t{번호}_lh(행간 %)
function getLayoutSlots(id) {
    const t = PAGE_LAYOUTS[id];
    return t.slotsFor ? t.slotsFor(getPageLayoutValues(id)) : t.slots;
}

function getSlotValues(id, i) {
    const t = PAGE_LAYOUTS[id];
    const v = pageLayoutState.values[id] || {};
    const p = t.slots[i];
    return {
        text: v[`t${i}`] ?? "",
        font: v[`t${i}_font`] || "",
        size: parseFloat(v[`t${i}_size`]) || p.size || 13,
        lh: parseFloat(v[`t${i}_lh`]) || 170,
        color: v[`t${i}_color`] || p.color || "",
    };
}

function applyPageLayout() {
    const area = els.captureArea;
    const content = document.getElementById("canvasContentContainer");
    if (!area || !content) return;
    const id = pageLayoutState.id;
    const t = PAGE_LAYOUTS[id];
    area.classList.add("pl-on");
    area.style.padding = "0px";

    const size = getPageLayoutSize(id);
    const W = size.w;
    area.style.width = `${W}px`;
    area.style.maxWidth = "none";
    area.style.maxHeight = "none";
    delete area.dataset.fixedRatioW;
    delete area.dataset.fixedRatioH;

    const color = els.globalTextColor?.value || "#222222";
    const values = getPageLayoutValues(id);
    const baseFont = els.fontSelect?.value || "sans-serif";

    // 장식 · 사진 레이어 (글 뒤)
    let layer = document.getElementById("pageLayoutLayer");
    if (!layer) {
        layer = document.createElement("div");
        layer.id = "pageLayoutLayer";
        area.insertBefore(layer, content);
    }
    // 글 칸 레이어 (배치 탭에서 칸마다 쓴 글)
    let textLayer = document.getElementById("pageLayoutText");
    if (!textLayer) {
        textLayer = document.createElement("div");
        textLayer.id = "pageLayoutText";
    }
    if (textLayer.parentNode !== area || textLayer.previousSibling !== layer) area.insertBefore(textLayer, layer.nextSibling);
    textLayer.innerHTML = "";
    const slots = getLayoutSlots(id);
    const built = slots.map((p, i) => {
        const sv = getSlotValues(id, i);
        const el = document.createElement("div");
        el.className = "pl-slot";
        el.style.position = "absolute";
        el.style.left = `${p.left}%`;
        el.style.width = `${p.width}%`;
        const inner = document.createElement("div");
        inner.className = "pl-slot-inner";
        inner.style.fontFamily = sv.font || baseFont;
        inner.style.fontSize = `${sv.size}px`;
        inner.style.lineHeight = `${(sv.size * sv.lh / 100).toFixed(2)}px`;
        inner.style.letterSpacing = `${parseFloat(els.letterSpacing?.value) || 0}px`;
        inner.style.color = sv.color || color;
        inner.style.wordBreak = els.wordBreak?.value || "keep-all";
        inner.style.overflowWrap = "break-word";
        inner.style.whiteSpace = "pre-wrap";
        inner.style.textAlign = p.align || "left";
        sv.text.split("\n").forEach((line) => {
            const d = document.createElement("div");
            if (line.trim() === "") d.appendChild(document.createElement("br"));
            else d.textContent = line;
            if (p.indent && line.trim() !== "") d.style.textIndent = "1em";
            inner.appendChild(d);
        });
        el.appendChild(inner);
        textLayer.appendChild(el);
        return { el, inner, p };
    });

    // 높이: 자동이면 설계 높이(최소 높이)에서 시작해, 글이 넘치는 만큼만 "늘어나는 줄" 아래로 페이지를 늘린다
    const lines = [].concat(t.stretchY ?? 50).sort((x, y) => x - y).map((ys) => [ys, 0]);
    const region = (p) => {
        if (p.top !== undefined && p.bottom !== undefined) return [p.top, 100 - p.bottom];
        if (p.top !== undefined) return [p.top, p.top + (p.maxH ?? 100 - p.top)];
        if (p.bottom !== undefined) return [100 - p.bottom - (p.maxH ?? 100 - p.bottom), 100 - p.bottom];
        return [0, 100];
    };
    let Hb = size.h;
    if (size.auto) {
        Hb = size.minH;
        // 칸마다 지나가는 첫 번째 줄에서 모자란 만큼 늘린다 (앞 줄에서 이미 늘어난 만큼은 빼고)
        built.forEach(({ inner, p }) => {
            const [y1, y2] = region(p);
            const k = lines.findIndex(([ys]) => y1 < ys && y2 > ys);
            if (k < 0) return;
            inner.style.width = `${(W * p.width) / 100}px`;
            const have = ((y2 - y1) * Hb) / 100 + lines.reduce((sum, [ys, ex], j) => sum + (j !== k && y1 < ys && y2 > ys ? ex : 0), 0);
            const need = inner.offsetHeight + 4 - have;
            if (need > lines[k][1]) lines[k][1] = need;
            inner.style.width = "";
        });
        let room = 4000 - Hb;
        lines.forEach((l) => { l[1] = Math.max(0, Math.min(room, Math.ceil(l[1]))); room -= l[1]; });
    }
    const H = Hb + lines.reduce((sum, l) => sum + l[1], 0);
    const Y = makeYMap(Hb, lines);
    area.style.height = `${H}px`;
    area.dataset.layoutH = String(H);
    built.forEach(({ el, p }) => {
        const [y1, y2] = region(p);
        el.style.top = el.style.bottom = el.style.height = "";
        if (p.top !== undefined && p.bottom !== undefined) { el.style.top = `${Y(y1)}px`; el.style.height = `${Y(y2) - Y(y1)}px`; }
        else if (p.top !== undefined) el.style.top = `${Y(y1)}px`;
        else el.style.bottom = `${H - Y(y2)}px`;
        p.__avail = Y(y2) - Y(y1);
    });

    layer.innerHTML = "";
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const muted = m ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},0.5)` : "rgba(0,0,0,.45)";
    t.render(layer, values, pageLayoutHelpers(W, H, color, muted, baseFont, Y, Hb));

    built.forEach(({ el, inner, p }) => fitPageLayoutSlot(el, inner, p, H));

    // HTML 배경도 바뀐 페이지 크기에 맞춰 다시 그린다
    if (typeof syncHtmlBackground === "function") syncHtmlBackground();
    if (typeof applyPreviewScale === "function") applyPreviewScale();
}

// 칸보다 글이 길면 그 칸 글자를 같은 비율로 줄여서 다 들어가게 한다 (transform: scale — 저장에도 그대로 나옴)
function fitPageLayoutSlot(el, inner, p, H) {
    const avail = p.__avail;
    if (!avail) return;
    const slotW = el.clientWidth;
    el.style.overflow = "hidden";
    let k = 1;
    const measure = () => {
        inner.style.width = `${slotW / k}px`;
        return inner.offsetHeight * k;
    };
    let h = measure();
    let guard = 0;
    while (h > avail && k > 0.3 && guard++ < 40) {
        k = Math.max(0.3, k * Math.min(0.97, Math.sqrt(avail / h)));
        h = measure();
    }
    if (k < 1) {
        inner.style.transform = `scale(${k})`;
        inner.style.transformOrigin = "left top";
    }
    // 세로 가운데 정렬 칸: 남는 높이의 절반만큼 내린다
    if (p.vcenter && h < avail) inner.style.marginTop = `${(avail - h) / 2}px`;
    if (p.top !== undefined && p.bottom !== undefined) return;
    el.style.height = `${Math.min(h, avail)}px`;
}

// ---- 설정 화면 ----
function buildPageLayoutPanel() {
    const sel = document.getElementById("pageLayoutSelect");
    const box = document.getElementById("pageLayoutFields");
    const hint = document.getElementById("pageLayoutHint");
    if (!sel || !box) return;
    const panel = document.getElementById("panel-layout");
    if (panel && box.parentElement !== panel) panel.appendChild(box);
    if (!sel.options.length) {
        Object.entries(PAGE_LAYOUTS).forEach(([id, t]) => {
            const o = document.createElement("option");
            o.value = id;
            o.textContent = t.name;
            sel.appendChild(o);
        });
    }
    sel.value = pageLayoutState.id;
    const id = pageLayoutState.id;
    const t = PAGE_LAYOUTS[id];
    box.innerHTML = "";
    if (hint) hint.textContent = id === "none"
        ? "레이아웃을 고르면 캔버스가 잡지 · 책 같은 한 장의 페이지가 돼요. 글은 아래 칸마다 따로 써요."
        : "글은 아래 글 칸마다 따로 써요 (본문 편집창 글은 쓰지 않아요). 글이 칸보다 길면 글자가 자동으로 작아져서 다 들어가요.";
    if (id === "none") return;

    const values = getPageLayoutValues(id);
    const setVal = (k, v) => {
        pageLayoutState.values[id] = Object.assign({}, pageLayoutState.values[id] || {}, { [k]: v });
        __pageLayoutTouched = true;
        savePageLayoutSoon();
        updateCanvas();
    };
    // 다른 탭과 같은 모양: 카드(♡ 제목) 안에 「라벨」 행, 하트 숫자칸 + ▲▼, 슬라이더
    let card = box;
    const section = (title) => {
        card = document.createElement("div");
        card.className = "panel-card";
        const head = document.createElement("div");
        head.className = "panel-card-head";
        const h = document.createElement("div");
        h.className = "panel-section-title";
        h.textContent = title;
        head.appendChild(h);
        card.appendChild(head);
        box.appendChild(card);
    };
    const row = (labelText) => {
        const r = document.createElement("div");
        r.className = "control-minimal-row pl-row";
        const lb = document.createElement("label");
        lb.textContent = `「${labelText}」`;
        r.appendChild(lb);
        card.appendChild(r);
        return r;
    };
    let numSeq = 0;
    const numberInput = (r, val, min, max, step, unit, onChange, withSlider) => {
        const g = document.createElement("div");
        g.className = "stepper-minimal heart-num";
        const ico = document.createElement("span");
        ico.className = "heart-ico";
        ico.setAttribute("aria-hidden", "true");
        const n = document.createElement("input");
        n.type = "number";
        n.id = `plNum${++numSeq}`;
        n.min = min; n.max = max; n.step = step; n.value = val;
        if (typeof HEART_STEPS === "object") HEART_STEPS[n.id] = step;
        const u = document.createElement("span");
        u.className = "heart-unit";
        u.textContent = unit || "";
        g.appendChild(ico); g.appendChild(n); g.appendChild(u);
        r.appendChild(g);
        let slider = null;
        if (withSlider) {
            slider = document.createElement("input");
            slider.type = "range";
            slider.className = "range-slider";
            slider.min = min; slider.max = max; slider.step = step; slider.value = val;
            card.appendChild(slider);
            slider.addEventListener("input", () => {
                n.value = slider.value;
                n.dispatchEvent(new Event("input", { bubbles: true }));
            });
        }
        n.addEventListener("input", () => {
            const x = parseFloat(n.value);
            if (slider) slider.value = n.value;
            if (!isNaN(x) && x >= min && x <= max) onChange(x);
        });
        n.addEventListener("change", () => {
            let x = parseFloat(n.value);
            if (isNaN(x)) return;
            x = Math.min(max, Math.max(min, x));
            n.value = x;
            onChange(x);
        });
    };

    // 페이지 크기
    section("페이지 크기");
    const size = getPageLayoutSize(id);
    numberInput(row("너비"), size.w, 200, 2000, 10, "px", (x) => setVal("pageW", x));
    {
        const r = row("높이 자동 맞춤");
        const g = document.createElement("div");
        g.className = "checkbox-minimal-group";
        const lb = document.createElement("label");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = size.auto;
        cb.addEventListener("change", () => {
            const cur = parseFloat(els.captureArea?.dataset.layoutH) || size.h;
            // 자동을 끄면 지금 보이는 높이에서 시작한다
            if (!cb.checked) pageLayoutState.values[id] = Object.assign({}, pageLayoutState.values[id] || {}, { pageH: Math.round(cur) });
            setVal("autoH", cb.checked);
            buildPageLayoutPanel();
        });
        lb.appendChild(cb);
        lb.appendChild(document.createTextNode(" 사용"));
        g.appendChild(lb);
        r.appendChild(g);
    }
    if (!size.auto) numberInput(row("높이"), size.h, 200, 4000, 10, "px", (x) => setVal("pageH", x));
    else {
        const hint = document.createElement("div");
        hint.className = "field-hint";
        hint.textContent = "글이 길어지면 페이지 높이가 저절로 늘어나요. 사진 · 칸 위치도 같이 늘어나요.";
        card.appendChild(hint);
    }

    // 글 칸
    const fontOptions = Array.from(document.querySelectorAll("#fontSelect option")).map((o) => [o.value, o.textContent]);
    t.slots.forEach((p, i) => {
        const sv = getSlotValues(id, i);
        section(`글 칸 ${i + 1} · ${p.label}`);
        const ta = document.createElement("textarea");
        ta.className = "side-text-input pl-textarea";
        ta.rows = 5;
        ta.placeholder = "여기에 이 칸에 들어갈 글을 써요";
        ta.value = sv.text;
        ta.addEventListener("input", () => setVal(`t${i}`, ta.value));
        card.appendChild(ta);
        const fr = row("폰트");
        const fs = document.createElement("select");
        [["", "본문과 같은 폰트"], ...fontOptions].forEach(([v, label]) => {
            const o = document.createElement("option");
            o.value = v; o.textContent = label;
            fs.appendChild(o);
        });
        fs.value = sv.font;
        fs.addEventListener("change", () => setVal(`t${i}_font`, fs.value));
        fr.appendChild(fs);
        numberInput(row("크기"), sv.size, 6, 80, 0.5, "px", (x) => setVal(`t${i}_size`, x));
        numberInput(row("행간"), sv.lh, 80, 400, 5, "%", (x) => setVal(`t${i}_lh`, x));
        const cr = row("글자색");
        const ci = document.createElement("input");
        ci.type = "color";
        ci.value = sv.color || els.globalTextColor?.value || "#222222";
        ci.addEventListener("input", () => setVal(`t${i}_color`, ci.value));
        cr.appendChild(ci);
    });

    if ((t.images || []).length) section("사진");
    (t.images || []).forEach(([key, label]) => {
        const r = row(label);
        const wrap = document.createElement("div");
        wrap.className = "pl-img-btns";
        const has = !!((pageLayoutState.images[id] || {})[key]);
        const pick = document.createElement("label");
        pick.className = "btn-template";
        pick.textContent = has ? "사진 바꾸기" : "사진 넣기";
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";
        input.addEventListener("change", async () => {
            const f = input.files && input.files[0];
            input.value = "";
            if (!f) return;
            try {
                const url = await readImageFile(f, 1400);
                pageLayoutState.images[id] = Object.assign({}, pageLayoutState.images[id] || {}, { [key]: url });
                __pageLayoutTouched = true;
                savePageLayoutSoon();
                buildPageLayoutPanel();
                updateCanvas();
            } catch (e) { alert("사진을 불러오지 못했어요."); }
        });
        pick.appendChild(input);
        wrap.appendChild(pick);
        if (has) {
            const del = document.createElement("button");
            del.type = "button";
            del.className = "btn-template";
            del.textContent = "빼기";
            del.addEventListener("click", () => {
                const imgs = Object.assign({}, pageLayoutState.images[id] || {});
                delete imgs[key];
                pageLayoutState.images[id] = imgs;
                savePageLayoutSoon();
                buildPageLayoutPanel();
                updateCanvas();
            });
            wrap.appendChild(del);
        }
        r.appendChild(wrap);
    });

    if ((t.fields || []).length) section("꾸미기");
    (t.fields || []).forEach((f) => {
        const r = row(f.label);
        if (f.type === "check") {
            const g = document.createElement("div");
            g.className = "checkbox-minimal-group";
            const lb = document.createElement("label");
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!values[f.key];
            cb.addEventListener("change", () => setVal(f.key, cb.checked));
            lb.appendChild(cb);
            lb.appendChild(document.createTextNode(" 사용"));
            g.appendChild(lb);
            r.appendChild(g);
        } else if (f.type === "color") {
            const c = document.createElement("input");
            c.type = "color";
            c.value = values[f.key];
            c.addEventListener("input", () => setVal(f.key, c.value));
            r.appendChild(c);
        } else if (f.type === "range") {
            numberInput(r, values[f.key], f.min, f.max, 1, "%", (x) => setVal(f.key, x), true);
        } else {
            const tx = document.createElement("input");
            tx.type = "text";
            tx.value = values[f.key] ?? "";
            tx.addEventListener("input", () => setVal(f.key, tx.value));
            r.appendChild(tx);
        }
    });
    if (typeof window.__initHeartNumbers === "function") { try { window.__initHeartNumbers(); } catch (e) {} }
    if (typeof wrapColorInputs === "function") { try { wrapColorInputs(); } catch (e) {} }
    if (typeof syncColorSwatches === "function") { try { syncColorSwatches(); } catch (e) {} }
}

document.addEventListener("DOMContentLoaded", () => {
    const sel = document.getElementById("pageLayoutSelect");
    buildPageLayoutPanel();
    if (sel) sel.addEventListener("change", () => {
        pageLayoutState.id = sel.value;
        __pageLayoutTouched = true;
        savePageLayoutSoon();
        buildPageLayoutPanel();
        updateCanvas();
    });
    loadPageLayoutFromDb();
});
