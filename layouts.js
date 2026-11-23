// ==========================================================================
// 페이지 레이아웃 (잡지 · 책 · 문서 창 · 메모 · 사진 배치 템플릿)
// --------------------------------------------------------------------------
// 레이아웃을 고르면 캔버스가 "한 장의 페이지"가 된다.
//  - 글 칸: 본문 편집창의 글이 그대로 들어간다 (폰트 · 크기 · 형광펜 · 대사 등 그대로 적용).
//    본문에 "구분선"을 넣으면 그다음 글은 다음 글 칸으로 넘어간다.
//  - 사진 칸 · 장식(창 테두리, 책, 아래 줄 정보 등)은 #pageLayoutLayer에 그린다 (글보다 뒤).
// 위치는 모두 캔버스 크기에 대한 % 라서 비율을 바꿔도 같은 모양으로 늘어난다.
// 저장(html2canvas)에서 안 되는 CSS(filter 등)는 쓰지 않는다. 흑백은 사진을 미리 흑백으로 바꿔서 넣는다.
// ==========================================================================

const PAGE_LAYOUTS = {
    none: { name: "사용 안 함" },

    magStrip: {
        name: "잡지 · 오른쪽 사진줄",
        hint: "글은 왼쪽 아래 칸에 들어가요. 글자 크기 11~13 정도를 추천해요.",
        slots: [{ left: 8, bottom: 21, width: 50 }],
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
            [9, 29.5, 50, 70.5].forEach((top, i) => L.appendChild(h.img(`s${i + 1}`, { left: 66, top, width: 26, height: 17.5 }, { gray: s.gray })));
            L.appendChild(h.text(s.label, { left: 66, top: 5.6 }, { size: 0.026, color: "muted", italic: true }));
            h.footer(L, [s.f1, s.f2, s.f3, s.f4]);
        },
    },

    magBig: {
        name: "잡지 · 큰 사진",
        hint: "글은 오른쪽 아래 칸에 들어가요. 글자 크기 11~13 정도를 추천해요.",
        slots: [{ left: 44, top: 62, width: 48, bottom: 14, clip: true }],
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
        name: "펼친 책",
        hint: "글은 오른쪽 쪽에 들어가요. 왼쪽 쪽에는 원하는 사진을 넣을 수 있어요.",
        slots: [{ left: 54, top: 26, width: 35, bottom: 25, clip: true }],
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
        name: "문서 두 쪽",
        hint: "글이 왼쪽 쪽을 채우면 오른쪽 쪽으로 저절로 넘어가요. 구분선을 넣으면 그 자리에서 넘어가요.",
        slots: [{ left: 9, top: 8, width: 35.5, bottom: 4, clip: true }, { left: 55.5, top: 8, width: 35.5, bottom: 4, clip: true }],
        flow: true,
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
        name: "메모 앱 창",
        hint: "글은 창 안에 들어가요.",
        slots: [{ left: 12, top: 31, width: 76, bottom: 22, clip: true }],
        fields: [
            { key: "date", label: "날짜", type: "text", def: "2026년 11월 23일 오후 2:35" },
            { key: "title", label: "제목", type: "text", def: "1-1. 《제목》" },
            { key: "sign", label: "서명", type: "text", def: "©" },
            { key: "winColor", label: "창 색", type: "color", def: "#ffffff" },
            { key: "barColor", label: "위쪽 막대 색", type: "color", def: "#f5f5f5" },
        ],
        render(L, s, h) {
            const win = h.box({ left: 7, top: 12, width: 86, height: 74 }, { background: s.winColor, borderRadius: h.px(0.028), boxShadow: "0 8px 28px rgba(0,0,0,.16)", border: "1px solid rgba(0,0,0,.08)", overflow: "hidden" });
            const bar = h.box({ left: 0, top: 0, width: 100, height: 9 }, { background: s.barColor, borderBottom: "1px solid rgba(0,0,0,.07)" });
            [4, 7.5, 11].forEach((x) => bar.appendChild(h.box({ left: x, top: 34, width: 0, height: 0 }, { width: h.px(0.026), height: h.px(0.026), borderRadius: "50%", background: "#d9d9d9" })));
            win.appendChild(bar);
            L.appendChild(win);
            L.appendChild(h.text(s.date, { left: 7, top: 23, width: 86 }, { size: 0.024, color: "muted", align: "center" }));
            L.appendChild(h.text(s.title, { left: 12, top: 25.8, width: 76 }, { size: 0.042, bold: true }));
            L.appendChild(h.text(s.sign, { left: 12, bottom: 17, width: 76 }, { size: 0.028, align: "right" }));
        },
    },

    center: {
        name: "가운데 그림 + 캡션",
        hint: "글은 그림 아래 가운데에 들어가요. 짧은 문장 몇 줄이 잘 어울려요.",
        slots: [{ left: 10, top: 63, width: 80, align: "center" }],
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
        name: "사진 두 장 · 대각선",
        hint: "구분선 앞의 글은 왼쪽 위 사진 옆, 구분선 뒤의 글은 오른쪽 아래 사진 옆에 들어가요.",
        slots: [{ left: 46, top: 5, width: 50 }, { left: 4, bottom: 5, width: 50, align: "right" }],
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

    spread: {
        name: "두 단 + 가운데 사진 + 각주",
        hint: "구분선으로 나눈 순서대로 ① 왼쪽 단 ② 오른쪽 단 ③ 가운데 흐린 각주 ④ 아래 사진 옆 글 칸에 들어가요. 글자 크기 10~12 정도를 추천해요.",
        slots: [
            { left: 5, top: 5, width: 27 },
            { left: 68, top: 5, width: 27 },
            { left: 34, top: 41, width: 61, note: true },
            { left: 60, top: 56, width: 35 },
        ],
        images: [["mid", "가운데 사진"], ["low", "아래 사진"]],
        fields: [
            { key: "mark", label: "각주 앞 표시", type: "text", def: "ff." },
            { key: "midOpacity", label: "가운데 사진 진하기", type: "range", min: 10, max: 100, def: 45 },
            { key: "lowOpacity", label: "아래 사진 진하기", type: "range", min: 10, max: 100, def: 35 },
            { key: "gray", label: "사진 흑백", type: "check", def: true },
        ],
        render(L, s, h) {
            const mid = h.img("mid", { left: 34, top: 8, width: 32, height: 26 }, { gray: s.gray });
            mid.style.opacity = String((parseFloat(s.midOpacity) || 45) / 100);
            const low = h.img("low", { left: 5, top: 55, width: 50, height: 33 }, { gray: s.gray });
            low.style.opacity = String((parseFloat(s.lowOpacity) || 35) / 100);
            L.appendChild(mid);
            L.appendChild(low);
        },
    },

    zigzag: {
        name: "지그재그 소개 + 흐린 배경 그림",
        hint: "구분선 앞의 글은 위(왼쪽 사진 옆), 구분선 뒤의 글은 아래(오른쪽 사진 옆, 오른쪽 정렬)에 들어가요.",
        slots: [{ left: 37, top: 5, width: 58 }, { left: 5, bottom: 5, width: 58, align: "right" }],
        images: [["a", "위 사진"], ["b", "아래 사진"], ["art", "배경 사진"]],
        fields: [
            { key: "artFull", label: "배경 사진 페이지 전체", type: "check", def: false },
            { key: "artOpacity", label: "배경 사진 진하기", type: "range", min: 5, max: 100, def: 100 },
            { key: "overlayColor", label: "배경 사진 덮는 색", type: "color", def: "#ffffff" },
            { key: "overlayAmount", label: "덮는 색 진하기", type: "range", min: 0, max: 100, def: 75 },
            { key: "border", label: "사진 테두리", type: "check", def: true },
            { key: "gray", label: "사진 흑백", type: "check", def: true },
        ],
        render(L, s, h) {
            const art = s.artFull
                ? h.img("art", { left: 0, top: 0, width: 100, height: 100 }, { gray: s.gray, noPlaceholder: true })
                : h.img("art", { left: 12, top: 22, width: 76, height: 56 }, { gray: s.gray, noPlaceholder: true });
            art.style.opacity = String((parseFloat(s.artOpacity) || 100) / 100);
            L.appendChild(art);
            // 색상 오버레이: 배경 사진 위에 고른 색을 반투명하게 덮는다 (사진이 있을 때만)
            if (((pageLayoutState.images.zigzag || {}).art) && parseFloat(s.overlayAmount) > 0) {
                const ov = h.box(s.artFull ? { left: 0, top: 0, width: 100, height: 100 } : { left: 12, top: 22, width: 76, height: 56 }, { background: s.overlayColor });
                ov.style.opacity = String(parseFloat(s.overlayAmount) / 100);
                L.appendChild(ov);
            }
            L.appendChild(h.img("a", { left: 5, top: 5, width: 28, height: 25 }, { gray: s.gray, border: s.border }));
            L.appendChild(h.img("b", { right: 5, bottom: 5, width: 28, height: 25 }, { gray: s.gray, border: s.border }));
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
function pageLayoutHelpers(W, H, color, muted, font) {
    const pos = (el, p) => {
        el.style.position = "absolute";
        ["left", "top", "right", "bottom"].forEach((k) => { if (p[k] !== undefined) el.style[k] = `${p[k]}%`; });
        if (p.width !== undefined) el.style.width = `${p.width}%`;
        if (p.height !== undefined) el.style.height = `${p.height}%`;
        el.style.boxSizing = "border-box";
    };
    const h = {
        px: (k) => `${(W * k).toFixed(2)}px`,
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
    const layer = document.getElementById("pageLayoutLayer");
    if (layer) layer.remove();
}

function applyPageLayout() {
    const area = els.captureArea;
    const wrapper = document.getElementById("canvasTextWrapper");
    const content = document.getElementById("canvasContentContainer");
    if (!area || !wrapper || !content) return;
    const id = pageLayoutState.id;
    const t = PAGE_LAYOUTS[id];
    area.classList.add("pl-on");
    area.style.padding = "0px";

    // 자동 조절 비율이면 페이지 모양(4:5)으로 높이를 정해준다
    const W = parseFloat(area.style.width) || area.getBoundingClientRect().width || 420;
    if (!area.dataset.fixedRatioW) area.style.height = `${Math.round(W * 1.25)}px`;
    const H = parseFloat(area.style.height) || W * 1.25;

    // 글 위치는 페이지 기준이므로 가로 장평(scaleX) 변형은 끈다
    wrapper.style.transform = "none";
    wrapper.style.width = "100%";
    wrapper.style.marginLeft = "0";
    wrapper.style.display = "block";

    // 본문을 구분선 기준으로 나눈다
    const groups = [[]];
    Array.from(wrapper.childNodes).forEach((n) => {
        if (n.nodeType === 1 && n.classList.contains("canvas-column")) {
            Array.from(n.childNodes).forEach((c) => groups[groups.length - 1].push(c));
            return;
        }
        if (n.nodeType === 1 && n.classList.contains("hr-divider")) { groups.push([]); return; }
        groups[groups.length - 1].push(n);
    });
    while (groups.length > t.slots.length) {
        const extra = groups.pop();
        groups[groups.length - 1].push(...extra);
    }
    wrapper.innerHTML = "";

    const color = els.globalTextColor?.value || "#222222";
    const values = getPageLayoutValues(id);
    const slotEls = t.slots.map((p, i) => {
        const el = document.createElement("div");
        el.className = "pl-slot";
        el.style.position = "absolute";
        ["left", "top", "right", "bottom"].forEach((k) => { if (p[k] !== undefined) el.style[k] = `${p[k]}%`; });
        el.style.width = `${p.width}%`;
        if (p.clip) el.style.overflow = "hidden";
        (groups[i] || []).forEach((n) => el.appendChild(n));
        if (p.align) {
            el.style.textAlign = p.align;
            Array.from(el.children).forEach((c) => { c.style.textAlign = p.align; });
        }
        if (p.note) {
            el.style.opacity = "0.5";
            el.style.fontSize = "0.86em";
            el.style.fontStyle = "italic";
            const first = el.firstElementChild;
            if (first && values.mark) {
                const m = document.createElement("span");
                m.textContent = `${values.mark} `;
                m.style.fontSize = "1.25em";
                first.insertBefore(m, first.firstChild);
            }
        }
        wrapper.appendChild(el);
        return el;
    });
    // 단마다 마지막 문단 아래 여백 없애기
    slotEls.forEach((el) => { const last = el.lastElementChild; if (last) { last.style.marginBottom = "0px"; } });

    // 넘치는 글은 다음 칸으로 (문서 두 쪽)
    if (t.flow && groups.length < t.slots.length) {
        for (let i = 0; i < slotEls.length - 1; i++) {
            const a = slotEls[i], b = slotEls[i + 1];
            let guard = 0;
            while (a.scrollHeight > a.clientHeight + 1 && a.children.length > 1 && guard++ < 400) {
                const moved = a.lastElementChild;
                b.insertBefore(moved, b.firstChild);
            }
        }
        slotEls.forEach((el) => { Array.from(el.children).forEach((c, idx, arr) => { c.style.marginBottom = idx === arr.length - 1 ? "0px" : `${els.paraSpacing.value}px`; }); });
    }

    // 장식 레이어
    let layer = document.getElementById("pageLayoutLayer");
    if (!layer) {
        layer = document.createElement("div");
        layer.id = "pageLayoutLayer";
        area.insertBefore(layer, content);
    }
    layer.innerHTML = "";
    const font = getComputedStyle(wrapper).fontFamily || els.fontSelect.value;
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const muted = m ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},0.5)` : "rgba(0,0,0,.45)";
    t.render(layer, values, pageLayoutHelpers(W, H, color, muted, font));
}

// ---- 설정 화면 ----
function buildPageLayoutPanel() {
    const sel = document.getElementById("pageLayoutSelect");
    const box = document.getElementById("pageLayoutFields");
    const hint = document.getElementById("pageLayoutHint");
    if (!sel || !box) return;
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
        ? "레이아웃을 고르면 캔버스가 잡지 · 책 같은 한 장의 페이지가 돼요. 글은 본문 편집창에 쓰면 되고, 구분선을 넣으면 다음 글 칸으로 넘어가요."
        : `${t.hint || ""} 사진 칸 위치가 정해져 있어서 여백 설정은 쓰지 않아요.`;
    if (id === "none") return;

    const values = getPageLayoutValues(id);
    const setVal = (k, v) => {
        pageLayoutState.values[id] = Object.assign({}, pageLayoutState.values[id] || {}, { [k]: v });
        __pageLayoutTouched = true;
        savePageLayoutSoon();
        updateCanvas();
    };
    const row = (labelText) => {
        const r = document.createElement("div");
        r.className = "control-minimal-row pl-row";
        const lb = document.createElement("label");
        lb.textContent = labelText;
        r.appendChild(lb);
        box.appendChild(r);
        return r;
    };

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

    (t.fields || []).forEach((f) => {
        const r = row(f.label);
        if (f.type === "check") {
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!values[f.key];
            cb.addEventListener("change", () => setVal(f.key, cb.checked));
            const g = document.createElement("div");
            g.className = "checkbox-minimal-group";
            g.appendChild(cb);
            r.appendChild(g);
        } else if (f.type === "color") {
            const c = document.createElement("input");
            c.type = "color";
            c.value = values[f.key];
            c.addEventListener("input", () => setVal(f.key, c.value));
            r.appendChild(c);
        } else if (f.type === "range") {
            const g = document.createElement("div");
            g.className = "pl-range";
            const rg = document.createElement("input");
            rg.type = "range";
            rg.min = f.min; rg.max = f.max; rg.value = values[f.key];
            const num = document.createElement("span");
            num.textContent = `${values[f.key]}%`;
            rg.addEventListener("input", () => { num.textContent = `${rg.value}%`; setVal(f.key, parseFloat(rg.value)); });
            g.appendChild(rg);
            g.appendChild(num);
            r.appendChild(g);
        } else {
            const tx = document.createElement("input");
            tx.type = "text";
            tx.value = values[f.key] ?? "";
            tx.addEventListener("input", () => setVal(f.key, tx.value));
            r.appendChild(tx);
        }
    });
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
