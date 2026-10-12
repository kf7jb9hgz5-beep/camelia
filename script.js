const els = {
    editor: document.getElementById("textEditor"),
    titleInput: document.getElementById("titleInput"),
    creatorInput: document.getElementById("creatorInput"),
    ratioSelect: document.getElementById("ratioSelect"),
    canvasWidth: document.getElementById("canvasWidth"),
    paddingTop: document.getElementById("paddingTop"),
    paddingBottom: document.getElementById("paddingBottom"),
    paddingLeft: document.getElementById("paddingLeft"),
    paddingRight: document.getElementById("paddingRight"),
    dlgNameSuffix: document.getElementById("dlgNameSuffix"),
    dlgQuoteStyle: document.getElementById("dlgQuoteStyle"),
    dlgShowAvatar: document.getElementById("dlgShowAvatar"),
    dlgShowName: document.getElementById("dlgShowName"),
    dlgShowTranslation: document.getElementById("dlgShowTranslation"),
    dlgAvatarShape: document.getElementById("dlgAvatarShape"),
    dlgAvatarSize: document.getElementById("dlgAvatarSize"),
    dlgUseCharColor: document.getElementById("dlgUseCharColor"),
    dlgLineGap: document.getElementById("dlgLineGap"),
    dlgContinuationGap: document.getElementById("dlgContinuationGap"),
    dlgNameGap: document.getElementById("dlgNameGap"),
    bgType: document.getElementById("bgType"),
    bgColor1: document.getElementById("bgColor1"),
    gradColor1: document.getElementById("gradColor1"),
    gradColor2: document.getElementById("gradColor2"),
    gradColor3: document.getElementById("gradColor3"),
    gradientDir: document.getElementById("gradientDir"),
    globalTextColor: document.getElementById("globalTextColor"),
    subTextColor: document.getElementById("subTextColor"),
    hlColorA: document.getElementById("hlColorA"),
    hlColorB: document.getElementById("hlColorB"),
    hlColorC: document.getElementById("hlColorC"),
    quoteLineColor: document.getElementById("quoteLineColor"),
    boxQuoteColor: document.getElementById("boxQuoteColor"),
    boxQuoteWidth: document.getElementById("boxQuoteWidth"),
    dividerColor: document.getElementById("dividerColor"),
    fadeToggle: document.getElementById("fadeToggle"),
    fadeCount: document.getElementById("fadeCount"),
    indentSize: document.getElementById("indentSize"),
    indentToggle: document.getElementById("indentToggle"),
    enableQuoteColor: document.getElementById("enableQuoteColor"),
    quoteColor: document.getElementById("quoteColor"),
    enableParenColor: document.getElementById("enableParenColor"),
    parenColor: document.getElementById("parenColor"),
    fontSelect: document.getElementById("fontSelect"),
    fontWeightSelect: document.getElementById("fontWeightSelect"),
    alignH: document.getElementById("alignH"),
    wordBreak: document.getElementById("wordBreak"),
    tabs: document.querySelectorAll(".tab-btn"),
    panels: document.querySelectorAll(".tab-panel"),
    fontSize: document.getElementById("fontSize"),
    letterSpacing: document.getElementById("letterSpacing"),
    lineHeight: document.getElementById("lineHeight"),
    paraSpacing: document.getElementById("paraSpacing"),
    fontScaleX: document.getElementById("fontScaleX"),
    infoFontSize: document.getElementById("infoFontSize"),
    columnToggle: document.getElementById("columnToggle"),
    textVerticalAlign: document.getElementById("textVerticalAlign"),
    textHorizontalAnchor: document.getElementById("textHorizontalAnchor"),
    textBlockWidth: document.getElementById("textBlockWidth"),
    columnSplitIndex: document.getElementById("columnSplitIndex"),
    columnGap: document.getElementById("columnGap"),
    captureArea: document.getElementById("captureArea"),
    headingTitleInput: document.getElementById("headingTitleInput"),
    headingSubtitleInput: document.getElementById("headingSubtitleInput"),
    headingTitleFont: document.getElementById("headingTitleFont"),
    headingTitleAlign: document.getElementById("headingTitleAlign"),
    headingTitleSize: document.getElementById("headingTitleSize"),
    headingTitleBold: document.getElementById("headingTitleBold"),
    headingSubtitleFont: document.getElementById("headingSubtitleFont"),
    headingSubtitleAlign: document.getElementById("headingSubtitleAlign"),
    headingSubtitleSize: document.getElementById("headingSubtitleSize"),
    headingSubtitleBold: document.getElementById("headingSubtitleBold")
};

// 캔버스 미리보기 영역(헤더)의 "내용 영역" 너비를 정확히 구한다.
// header.clientWidth 에는 header 자신의 좌우 padding이 포함돼 있어서,
// 그 값을 그대로 "사용 가능한 너비"로 쓰면 실제보다 넓게 계산되어
// 타이핑/이미지 삽입 등으로 updateCanvas()가 반복 호출될 때마다
// 캔버스가 화면 폭을 살짝 넘었다 안 넘었다 하며 스케일(=캔버스와 글자 비율)이
// 미세하게 흔들리는 원인이 된다. 반드시 padding을 뺀 "content box" 너비를 사용한다.
function getAvailableHeaderWidth(fallback) {
    const headerEl = document.querySelector(".canvas-header");
    if (!headerEl) return fallback;
    const cs = getComputedStyle(headerEl);
    const paddingL = parseFloat(cs.paddingLeft) || 0;
    const paddingR = parseFloat(cs.paddingRight) || 0;
    const inner = headerEl.clientWidth - paddingL - paddingR;
    return inner > 0 ? inner : fallback;
}

// 편집창(#textEditor)의 글꼴/크기/자간/줄간격 "그리고 실제 폭"까지
// 캔버스(미리보기)와 최대한 똑같이 맞춰서, 편집창에서 보이는 줄바꿈이
// 실제 결과물과 일치하게 만든다.
// (이게 안 맞으면 "이 글자 옆에 사진" 하고 넣어도 실제로는 다른 위치에 들어감)
//
// 글꼴 크기/자간/줄간격만 맞추는 걸로는 부족했던 이유: 캔버스는 "너비"가
// 폰(예: 520px)이나 4:5 비율 등으로 정해져 있는데, 편집창은 그냥 화면
// 가로폭에 맞춰 늘어나 있어서 한 줄에 들어가는 글자 수 자체가 달랐다.
// → 편집창의 실제 폭을 캔버스의 "내용 폭"(캔버스 너비 - 좌우 여백*2)과
//   정확히 똑같은 px 값으로 맞춘다. 캔버스가 화면보다 넓게 설정된 경우엔
//   편집창도 그만큼 넓어지고, 대신 좌우로 스크롤해서 볼 수 있게 한다
//   (억지로 화면에 우겨넣어 축소하면 그 순간 다시 줄바꿈이 달라지기 때문).
//
// 단, 아이폰 사파리는 입력창의 실제(글꼴) 크기가 16px보다 작으면 탭할 때
// 화면을 확대해버리는 문제가 있어서, 폰트 크기는 16px 밑으로 절대 내리지 않는다.
// (캔버스 글자 크기를 16px보다 작게 설정한 경우에는 편집창은 16px로 보여서
//  아주 살짝 차이가 날 수 있지만, 실무에서 그렇게 작게 쓰는 경우는 드물다)
function syncEditorTypography() {
    const editor = els.editor;
    if (!editor || !els.fontSelect) return;

    const IOS_ZOOM_SAFE_MIN = 16;
    const desiredSize = parseFloat(els.fontSize.value) || 16;
    const desiredLineHeight = parseFloat(els.lineHeight.value) || Math.round(desiredSize * 1.6);
    const desiredLetterSpacing = parseFloat(els.letterSpacing.value) || 0;
    const realSize = Math.max(IOS_ZOOM_SAFE_MIN, desiredSize);

    editor.style.fontFamily = els.fontSelect.value;
    editor.style.fontWeight = els.fontWeightSelect?.value || "400";
    editor.style.fontSize = `${realSize}px`;
    // 폰트 크기를 16px로 올려야 했던 만큼 줄간격/자간도 같은 비율로 늘려서
    // (편집창 안에서의) 상대적인 느낌이 캔버스와 비슷하게 유지되도록 함
    const sizeRatio = realSize / desiredSize;
    editor.style.lineHeight = `${desiredLineHeight * sizeRatio}px`;
    editor.style.letterSpacing = `${desiredLetterSpacing * sizeRatio}px`;

    // 줄바꿈 규칙 자체가 다르면 폭이 같아도 줄바꿈 위치가 달라질 수 있음
    if (els.wordBreak) editor.style.wordBreak = els.wordBreak.value;
    editor.style.whiteSpace = "pre-wrap";

    // --- 여기서부터 "폭"을 캔버스 내용 폭과 정확히 동일하게 맞춘다 ---
    const ratioMode = els.ratioSelect ? els.ratioSelect.value : "free";
    const paddingLeft = parseFloat(els.paddingLeft?.value) || 0;
    const paddingRight = parseFloat(els.paddingRight?.value) || 0;
    let canvasContentWidth;
    if (ratioMode === "free") {
        const customW = parseFloat(els.canvasWidth?.value) || 520;
        canvasContentWidth = customW - paddingLeft - paddingRight;
    } else {
        const targetWidth = Math.min(420, getAvailableHeaderWidth(420));
        canvasContentWidth = targetWidth - paddingLeft - paddingRight;
    }
    canvasContentWidth = Math.max(60, Math.round(canvasContentWidth));

    // 편집창 자체에는 캔버스에는 없는 자기만의 좌우 padding(14px씩)이 있다.
    // canvasTextWrapper 쪽 실제 텍스트 폭(=canvasContentWidth)과 편집창 안의
    // "글자가 실제로 채워지는 폭"을 똑같이 맞추려면, 편집창의 padding만큼
    // 바깥 너비를 더 늘려줘야 안쪽 텍스트 영역 폭이 정확히 일치한다.
    const editorCS = getComputedStyle(editor);
    const editorPaddingX = (parseFloat(editorCS.paddingLeft) || 0) + (parseFloat(editorCS.paddingRight) || 0);
    const editorBorderX = (parseFloat(editorCS.borderLeftWidth) || 0) + (parseFloat(editorCS.borderRightWidth) || 0);

    editor.style.width = `${canvasContentWidth + editorPaddingX + editorBorderX}px`;
    editor.style.maxWidth = "none";
    editor.style.flexShrink = "0";

    // --- 옆으로 드래그하지 않고도 화면 안에서 한 번에 보이도록,
    //     캔버스 폭에 맞춰 커진 편집창을 화면 폭에 맞게 "통째로" 축소해서 보여준다.
    //     (글자 하나하나를 억지로 줄이는 게 아니라, 사진처럼 전체를 그대로 축소하는 것이라
    //      실제 줄바꿈 위치/비율은 캔버스와 동일하게 유지됨) ---
    const scrollWrapper = document.getElementById("editorScrollX");
    if (scrollWrapper) {
        editor.style.transform = "none";
        editor.style.transformOrigin = "top left";
        const realW = editor.offsetWidth;
        const realH = editor.offsetHeight;
        const availableW = scrollWrapper.clientWidth || realW;
        const fitScale = realW > 0 ? Math.min(1, availableW / realW) : 1;

        if (fitScale < 1) {
            editor.style.transform = `scale(${fitScale})`;
            scrollWrapper.style.height = `${Math.ceil(realH * fitScale)}px`;
        } else {
            editor.style.transform = "none";
            scrollWrapper.style.height = "";
        }
    }
}

// 탭 아이콘 위 "채워짐" 점 갱신 (제목/사진 탭에 내용이 있는지 표시)
function updateDockDots() {
    const dotTitle = document.getElementById("dockDotTitle");
    if (dotTitle) {
        const filled = (els.headingTitleInput?.value.trim() || els.headingSubtitleInput?.value.trim());
        dotTitle.classList.toggle("show", !!filled);
    }
    const dotImage = document.getElementById("dockDotImage");
    if (dotImage && els.editor) {
        dotImage.classList.toggle("show", !!els.editor.querySelector(".editor-image-block"));
    }
}

function updateCanvas() {
    updateCanvasCore();
    if (typeof applySideImage === "function") applySideImage();
    // ⚠️ 글자 맞춤(fit)은 옆 사진이 레이아웃을 확정한 "다음에" 해야 한다.
    // (예전엔 코어 안에서 먼저 맞추고 옆 사진을 나중에 붙여서 비율이 어긋났음)
    if (els.ratioSelect && els.ratioSelect.value !== "free") {
        fitTextToCanvas();
        // 글자 크기가 바뀌면 옆 사진 칸 높이도 바뀌므로 한 번 더 맞춰준다.
        if (typeof applySideImage === "function") applySideImage();
    }
    if (typeof renderHalftoneLayer === "function") renderHalftoneLayer();
    if (typeof renderFrameDecoration === "function") renderFrameDecoration();
    scheduleRefitAfterFonts();
}

// 폰트(woff2 등)는 바꾼 "직후"엔 아직 안 불러와져서 대체 글꼴로 높이를 재게 된다.
// 폰트가 실제로 도착하면 같은 계산을 다시 해서 비율/글자 잘림을 바로잡는다.
let __fontRefitToken = 0;
function refitCanvasNow() {
    if (!els.captureArea) return;
    if (els.ratioSelect && els.ratioSelect.value !== "free") {
        fitTextToCanvas();
        if (typeof applySideImage === "function") applySideImage();
    }
    if (typeof renderHalftoneLayer === "function") renderHalftoneLayer();
    if (typeof renderFrameDecoration === "function") renderFrameDecoration();
    if (typeof applyPreviewScale === "function") applyPreviewScale();
}
function scheduleRefitAfterFonts() {
    if (!document.fonts || typeof document.fonts.load !== "function" || !els.fontSelect) return;
    const token = ++__fontRefitToken;
    const family = els.fontSelect.value;
    const weight = els.fontWeightSelect?.value || "400";
    const size = parseFloat(els.fontSize?.value) || 16;
    try {
        document.fonts.load(`${weight} ${size}px ${family}`, "가나다ABC abc123").then(() => {
            if (token !== __fontRefitToken) return;
            refitCanvasNow();
        }).catch(() => {});
    } catch (e) {}
}

function updateCanvasCore() {
    if (!els.captureArea) return;

    syncEditorTypography();
    updateDockDots();

    const ratio = els.ratioSelect.value;
    els.captureArea.style.width = "";
    els.captureArea.style.height = "";
    els.captureArea.style.aspectRatio = "";
    els.captureArea.style.maxWidth = "none";

    if (ratio === "free") {
        const customW = parseFloat(els.canvasWidth.value) || 520;
        els.captureArea.style.width = `${customW}px`;
        els.captureArea.style.maxWidth = "none";
        els.captureArea.style.height = "auto";
        els.captureArea.style.maxHeight = "none";
        els.captureArea.style.margin = "0 auto";
        els.captureArea.style.overflow = "hidden";
        delete els.captureArea.dataset.customWidthTarget;
        delete els.captureArea.dataset.fixedRatioW;
        delete els.captureArea.dataset.fixedRatioH;
    } else {
        const [wStr, hStr] = ratio.split(":");
        const w = parseInt(wStr), h = parseInt(hStr);
        const targetWidth = Math.min(420, getAvailableHeaderWidth(420));
        const targetHeight = Math.round((targetWidth * h) / w);
        els.captureArea.style.width = `${targetWidth}px`;
        els.captureArea.style.maxWidth = `${targetWidth}px`;
        els.captureArea.style.height = `${targetHeight}px`;
        els.captureArea.style.maxHeight = "none";
        els.captureArea.style.margin = "0 auto";
        els.captureArea.style.overflow = "hidden";
        els.captureArea.dataset.fixedRatioW = w;
        els.captureArea.dataset.fixedRatioH = h;
        delete els.captureArea.dataset.customWidthTarget;
    }

    els.captureArea.style.padding = `${els.paddingTop.value}px ${els.paddingRight.value}px ${els.paddingBottom.value}px ${els.paddingLeft.value}px`;

    if (els.bgType.value === "solid") {
        document.getElementById("solidColorArea").style.display = "grid";
        document.getElementById("gradientColorArea").style.display = "none";
        els.captureArea.style.background = els.bgColor1.value;
    } else {
        document.getElementById("solidColorArea").style.display = "none";
        document.getElementById("gradientColorArea").style.display = "flex";
        const gradModeActive = document.querySelector('input[name="gradMode"]:checked')?.value;
        const grad3Wrapper = document.getElementById("grad3Wrapper");
        if (gradModeActive === "3") {
            if (grad3Wrapper) grad3Wrapper.style.display = "flex";
            els.captureArea.style.background = `linear-gradient(${els.gradientDir.value}, ${els.gradColor1.value}, ${els.gradColor2.value}, ${els.gradColor3.value})`;
        } else {
            if (grad3Wrapper) grad3Wrapper.style.display = "none";
            els.captureArea.style.background = `linear-gradient(${els.gradientDir.value}, ${els.gradColor1.value}, ${els.gradColor2.value})`;
        }
    }

    renderCanvasHeading();

    const textWrapper = document.getElementById("canvasTextWrapper");
    if (textWrapper) {
        // "대사 추가"로 넣은 블록(.dlg-editor-marker)은 이제 미리보기가 아니라 실제로 캔버스에
        // 그려지는 진짜 대사 블록이다. 본문(rawHTML) 안에 그대로 살아있는 채로 캔버스에 반영되므로,
        // 여기서 매번 최신 설정(이름표시·따옴표·색상·폰트 등)에 맞춰 블록 모양부터 새로고침한 다음
        // 본문 내용을 그대로 캔버스에 옮긴다. (더 이상 대사 목록을 따로 append하지 않음 — 중복 방지)
        ensureAllDialogueMarkersExist();
        refreshAllDialogueMarkers();
        // 대사 블록 위에 있는 위/아래 이동 버튼(.dlg-marker-controls)은 편집 편의용이라 실제
        // 저장/캔버스 결과물에는 나오면 안 되므로, 캔버스용 rawHTML을 만들 때는 항상 제외한다.
        let rawHTML;
        if (els.editor.querySelector(".dlg-marker-controls")) {
            const editorClone = els.editor.cloneNode(true);
            editorClone.querySelectorAll(".dlg-marker-controls").forEach((el) => el.remove());
            rawHTML = editorClone.innerHTML || "<div><br></div>";
        } else {
            rawHTML = els.editor.innerHTML || "<div><br></div>";
        }

        textWrapper.innerHTML = rawHTML;
        normalizeParagraphs(textWrapper);

        // "가득 채우기" 사진: 본문 폭(패딩 안쪽) 기준이 아니라 캔버스 좌우 끝까지 닿아야 하므로,
        // 현재 좌/우 여백값만큼 음수 마진을 줘서 캔버스에 그릴 때만 진짜로 "꽉 채워"지게 만든다.
        // (편집창 안에서는 그냥 편집창 폭 100%로만 보이고, 이 계산은 여기 캔버스 사본에만 적용됨)
        const fillPadL = parseFloat(els.paddingLeft?.value) || 0;
        const fillPadR = parseFloat(els.paddingRight?.value) || 0;
        textWrapper.querySelectorAll('.editor-image-block[data-align="fill"]').forEach((block) => {
            block.style.width = `calc(100% + ${fillPadL + fillPadR}px)`;
            block.style.marginLeft = `-${fillPadL}px`;
            block.style.marginRight = `-${fillPadR}px`;
        });

        // 자동 치환 규칙 적용: 본문(편집창)은 그대로 두고, 캔버스에 표시될 텍스트만 바꿔치기한다.
        if (replacementRules.some((r) => r.enabled !== false && r.find)) {
            const walker = document.createTreeWalker(textWrapper, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            let node;
            while ((node = walker.nextNode())) textNodes.push(node);
            textNodes.forEach((n) => {
                const replaced = applyReplacementRules(n.nodeValue);
                if (replaced !== n.nodeValue) n.nodeValue = replaced;
            });
        }

        // 각주 목록을 맨 아래에 붙인다.
        if (footnotes.length > 0) {
            refreshFootnoteMarkerColors();
            const footnoteSection = document.createElement("div");
            footnoteSection.innerHTML = buildFootnoteListHTML();
            textWrapper.appendChild(footnoteSection.firstElementChild);
        }

        textWrapper.style.setProperty("--quote-line-color", els.quoteLineColor.value);
        if (els.editor) els.editor.style.setProperty("--quote-line-color", els.quoteLineColor.value);
        textWrapper.style.setProperty("--box-quote-color", els.boxQuoteColor?.value || "#000000");
        if (els.editor) els.editor.style.setProperty("--box-quote-color", els.boxQuoteColor?.value || "#000000");
        const boxQuoteW = parseFloat(els.boxQuoteWidth?.value);
        textWrapper.style.setProperty("--box-quote-width", `${isNaN(boxQuoteW) ? 2 : boxQuoteW}px`);
        if (els.editor) els.editor.style.setProperty("--box-quote-width", `${isNaN(boxQuoteW) ? 2 : boxQuoteW}px`);
        textWrapper.style.setProperty("--divider-color", els.dividerColor?.value || "#94a3b8");
        if (els.editor) els.editor.style.setProperty("--divider-color", els.dividerColor?.value || "#94a3b8");
        const dividerWidthVal = document.getElementById("dividerWidth")?.value || "1";
        const dividerStyleVal = document.getElementById("dividerStyle")?.value || "solid";
        textWrapper.style.setProperty("--divider-width", `${dividerWidthVal}px`);
        textWrapper.style.setProperty("--divider-style", dividerStyleVal);
        if (els.editor) {
            els.editor.style.setProperty("--divider-width", `${dividerWidthVal}px`);
            els.editor.style.setProperty("--divider-style", dividerStyleVal);
        }

        const dlgNameSuffixVal = `"${document.getElementById("dlgNameSuffix")?.value ?? ":"}"`;
        textWrapper.style.setProperty("--dlg-name-suffix", dlgNameSuffixVal);
        if (els.editor) els.editor.style.setProperty("--dlg-name-suffix", dlgNameSuffixVal);

        const quoteChars = getQuoteChars(document.getElementById("dlgQuoteStyle")?.value || "dquote");
        textWrapper.style.setProperty("--dlg-quote-open", `"${quoteChars.open}"`);
        textWrapper.style.setProperty("--dlg-quote-close", `"${quoteChars.close}"`);
        if (els.editor) {
            els.editor.style.setProperty("--dlg-quote-open", `"${quoteChars.open}"`);
            els.editor.style.setProperty("--dlg-quote-close", `"${quoteChars.close}"`);
        }

        const translationDisplay = (document.getElementById("dlgShowTranslation")?.checked === false) ? "none" : "block";
        textWrapper.style.setProperty("--dlg-translation-display", translationDisplay);
        if (els.editor) els.editor.style.setProperty("--dlg-translation-display", translationDisplay);

        const avatarSizeVal = parseFloat(document.getElementById("dlgAvatarSize")?.value);
        const avatarSizePx = `${isNaN(avatarSizeVal) ? 32 : avatarSizeVal}px`;
        textWrapper.style.setProperty("--dlg-avatar-size", avatarSizePx);
        if (els.editor) els.editor.style.setProperty("--dlg-avatar-size", avatarSizePx);
        const avatarShapeVal = document.getElementById("dlgAvatarShape")?.value === "square" ? "22%" : "50%";
        textWrapper.style.setProperty("--dlg-avatar-radius", avatarShapeVal);
        if (els.editor) els.editor.style.setProperty("--dlg-avatar-radius", avatarShapeVal);
        const indentEm = parseFloat(els.indentSize?.value);
        const indentValue = (els.indentToggle && els.indentToggle.checked) ? `${isNaN(indentEm) ? 1 : indentEm}em` : "0";
        textWrapper.style.setProperty("--indent-size", indentValue);
        textWrapper.style.textIndent = indentValue;
        if (els.editor) {
            els.editor.style.setProperty("--indent-size", indentValue);
            els.editor.style.textIndent = indentValue;
        }

        applySmartHighlighting(textWrapper);

        const canvasSpans = textWrapper.getElementsByTagName("span");
        for (let span of canvasSpans) {
            if (span.style.backgroundColor && span.style.backgroundColor !== "transparent") {
                span.style.display = "inline";
                span.style.boxDecorationBreak = "clone";
                span.style.webkitBoxDecorationBreak = "clone";
            }
        }

        textWrapper.style.fontFamily = els.fontSelect.value;
        textWrapper.style.fontWeight = els.fontWeightSelect?.value || "400";
        textWrapper.style.textAlign = els.alignH.value;
        textWrapper.style.whiteSpace = "pre-wrap";
        textWrapper.style.wordBreak = els.wordBreak.value;
        textWrapper.style.color = els.globalTextColor.value;
        textWrapper.style.fontSize = `${els.fontSize.value}px`;
        textWrapper.style.lineHeight = `${els.lineHeight.value}px`;
        textWrapper.style.letterSpacing = `${els.letterSpacing.value}px`;

        const scaleFactor = (parseInt(els.fontScaleX.value) || 100) / 100;
        textWrapper.style.display = "block";
        textWrapper.style.width = `${100 / scaleFactor}%`;
        textWrapper.style.transform = `scaleX(${scaleFactor})`;

        if (els.alignH.value === "center") {
            textWrapper.style.transformOrigin = "center top";
            textWrapper.style.marginLeft = `calc((100% - 100% / ${scaleFactor}) / 2)`;
        } else if (els.alignH.value === "right") {
            textWrapper.style.transformOrigin = "right top";
            textWrapper.style.marginLeft = `calc(100% - 100% / ${scaleFactor})`;
        } else {
            textWrapper.style.transformOrigin = "left top";
            textWrapper.style.marginLeft = "0";
        }

        const columnsEnabled = !!(els.columnToggle && els.columnToggle.checked);
        if (columnsEnabled) {
            const paragraphNodes = Array.from(textWrapper.children);
            if (paragraphNodes.length > 1) {
                const rawSplit = parseInt(els.columnSplitIndex?.value, 10) || 1;
                const splitIndex = Math.min(Math.max(rawSplit, 1), paragraphNodes.length - 1);

                const col1 = document.createElement("div");
                col1.className = "canvas-column";
                const col2 = document.createElement("div");
                col2.className = "canvas-column";

                paragraphNodes.forEach((p, idx) => {
                    (idx < splitIndex ? col1 : col2).appendChild(p);
                });

                textWrapper.innerHTML = "";
                textWrapper.appendChild(col1);
                textWrapper.appendChild(col2);

                textWrapper.style.display = "flex";
                textWrapper.style.flexDirection = "row";
                textWrapper.style.alignItems = "flex-start";
                textWrapper.style.gap = `${parseFloat(els.columnGap?.value) || 32}px`;
                col1.style.flex = "1 1 0";
                col2.style.flex = "1 1 0";
                col1.style.minWidth = "0";
                col2.style.minWidth = "0";
            }
        }
    }

    const columnsActive = !!(els.columnToggle && els.columnToggle.checked && textWrapper.querySelector(".canvas-column"));
    const paragraphGroups = columnsActive
        ? Array.from(textWrapper.querySelectorAll(".canvas-column")).map((col) =>
              Array.from(col.querySelectorAll(":scope > div, :scope > p, :scope > .dialogue-line, :scope > .box-quote, :scope > .hr-divider"))
          )
        : [Array.from(textWrapper.querySelectorAll("#canvasTextWrapper > div, #canvasTextWrapper > p, #canvasTextWrapper > .dialogue-line, #canvasTextWrapper > .box-quote, #canvasTextWrapper > .hr-divider"))];

    const fadeEnabled = !!(els.fadeToggle && els.fadeToggle.checked);
    const fadeCountVal = Math.max(1, Math.min(parseInt(els.fadeCount?.value) || 3, 10));
    const FADE_MIN_OPACITY = 0.25; // 마지막 문장도 완전히 사라지지 않도록 남겨두는 최소 밝기

    paragraphGroups.forEach((group) => {
        const fadeCount = Math.min(fadeCountVal, group.length);
        group.forEach((p, idx) => {
            if (idx === group.length - 1) {
                p.style.marginBottom = "0px";
                p.style.paddingBottom = "0px";
            } else {
                p.style.marginBottom = `${els.paraSpacing.value}px`;
            }

            if (fadeEnabled && group.length > 1 && fadeCount > 0) {
                const fadeStartIdx = group.length - fadeCount;
                if (idx >= fadeStartIdx) {
                    const stepPosition = idx - fadeStartIdx + 1; // 1..fadeCount
                    const progress = stepPosition / fadeCount;
                    p.style.opacity = String(1 - progress * (1 - FADE_MIN_OPACITY));
                } else {
                    p.style.opacity = "1";
                }
            } else {
                p.style.opacity = "1";
            }
        });
    });

    const infoContainer = document.getElementById("canvasInfo");
    const textContainer = document.getElementById("canvasTextContainer");

    if (textContainer) {
        textContainer.style.justifyContent = els.textVerticalAlign?.value || "center";
        textContainer.style.alignItems = els.textHorizontalAnchor?.value || "center";
        const blockWidth = Math.min(Math.max(parseFloat(els.textBlockWidth?.value) || 100, 30), 100);
        textWrapper.style.width = `${blockWidth}%`;
    }

    if (infoContainer && textContainer) {
        const infoPosV = document.getElementById("infoPositionV")?.value || "drag";
        const xPercentRaw = parseFloat(document.getElementById("infoPositionX")?.value);
        const xPercent = isNaN(xPercentRaw) ? 100 : Math.min(100, Math.max(0, xPercentRaw));

        if (infoPosV === "drag") {
            // 직접 지정: 본문 흐름에서 빼서 캔버스 안에 절대 위치로 띄운다.
            // ⚠️ absolute 자식은 부모의 padding을 무시하고 테두리까지 붙을 수 있다(흐름 안의 요소만
            // padding 안쪽으로 밀려남) — 그래서 0%/100%가 진짜 캔버스 맨 끝까지 붙어버렸었다.
            // 그래서 캔버스 자체의 위/아래/좌/우 여백(padding) 값만큼을 직접 계산해서 안쪽으로 들여놓고,
            // 그 안에서만 0~100%가 움직이게 만들었다 — 이러면 본문이 있는 폭 안에서만 움직인다.
            if (els.captureArea && infoContainer.parentNode !== els.captureArea) {
                els.captureArea.appendChild(infoContainer);
            }
            const padT = parseFloat(els.paddingTop?.value) || 0;
            const padB = parseFloat(els.paddingBottom?.value) || 0;
            const padL = parseFloat(els.paddingLeft?.value) || 0;
            const padR = parseFloat(els.paddingRight?.value) || 0;
            const yPercentRaw = parseFloat(document.getElementById("infoPositionY")?.value);
            // 세로 위치를 100을 넘겨 더 아래까지 내릴 수 있게 상한을 160으로 넓혔다.
            const yPercent = isNaN(yPercentRaw) ? 90 : Math.min(160, Math.max(0, yPercentRaw));
            infoContainer.style.position = "absolute";
            infoContainer.style.left = `calc(${padL}px + (100% - ${padL + padR}px) * ${xPercent / 100})`;
            infoContainer.style.right = "auto";
            infoContainer.style.top = `calc(${padT}px + (100% - ${padT + padB}px) * ${yPercent / 100})`;
            infoContainer.style.transform = `translate(-${xPercent}%, -50%)`;
            infoContainer.style.width = "max-content";
            infoContainer.style.maxWidth = `calc(100% - ${padL + padR}px)`;
            infoContainer.style.marginTop = "0";
            infoContainer.style.marginBottom = "0";
            infoContainer.style.padding = "0";
            infoContainer.style.boxSizing = "border-box";
            infoContainer.style.zIndex = "5";
            infoContainer.style.cursor = "grab";
        } else {
            infoContainer.style.position = "static";
            infoContainer.style.transform = "none";
            // ⚠️ 버그였던 부분: CSS 클래스(.info-area)는 width:100%인데 여기서 inline으로
            // width:"auto"를 줘버려서, 박스가 글자 크기만큼만 좁아지고 남는 공간이 없어졌다.
            // 남는 공간이 없으니 justify-content(flex-start/center/flex-end)가 아무 효과가
            // 없어서 "좌측 아래/가운데 아래/우측 아래" 버튼을 눌러도 위치가 그대로였던 것.
            // 폭을 다시 100%로 줘서 justify-content가 실제로 좌/중/우로 밀어주게 만든다.
            infoContainer.style.width = "100%";
            infoContainer.style.maxWidth = "none";
            infoContainer.style.padding = "0";
            infoContainer.style.zIndex = "";
            infoContainer.style.cursor = "";
            // 우측/좌측/중앙 아래 세 가지 다 "본문 아래"라, 항상 본문 뒤(textWrapper 다음)에 둔다.
            if (infoContainer.parentNode !== textContainer || infoContainer.previousSibling !== textWrapper) textContainer.appendChild(infoContainer);
            const justifyMap = { "bottom-left": "flex-start", "bottom-center": "center", "bottom-right": "flex-end" };
            infoContainer.style.justifyContent = justifyMap[infoPosV] || "flex-end";
            const bodyLineHeightPx = parseFloat(els.lineHeight.value) || 26;
            // 기본값: 본문과 두 줄만큼 띄운다. lineHeight 설정값 자체가 이미 한 줄의 실제 픽셀
            // 높이라서(배율이 아님), 그냥 2배 하면 된다.
            const twoLineGap = bodyLineHeightPx * 2;
            infoContainer.style.marginTop = `${twoLineGap}px`;
            infoContainer.style.marginBottom = "0";
        }

        const baseColor = els.globalTextColor.value;
        const fontName = els.fontSelect.value;
        const infoSize = parseFloat(els.infoFontSize?.value) || Math.max(10, parseFloat(els.fontSize.value) * 0.65);

        const titleVal = els.titleInput.value.trim();
        const creatorVal = els.creatorInput.value.trim();
        let infoHTML = "";

        if (titleVal || creatorVal) {
            infoHTML += `<span class="info-dash" style="color: ${baseColor}; font-size: ${infoSize}px; margin-right: 6px;">ⓐ</span>`;
            if (titleVal && creatorVal) {
                infoHTML +=
                    `<span class="info-text-node" style="color: ${baseColor}; font-family: ${fontName}; font-size: ${infoSize}px;">${titleVal}</span>` +
                    `<span class="info-divider" style="color: ${baseColor}; font-size: ${infoSize}px; margin: 0 6px;">x</span>` +
                    `<span class="info-text-node" style="color: ${baseColor}; font-family: ${fontName}; font-size: ${infoSize}px;">${creatorVal}</span>`;
            } else if (titleVal) {
                infoHTML += `<span class="info-text-node" style="color: ${baseColor}; font-family: ${fontName}; font-size: ${infoSize}px;">${titleVal}</span>`;
            } else {
                infoHTML += `<span class="info-text-node" style="color: ${baseColor}; font-family: ${fontName}; font-size: ${infoSize}px;">${creatorVal}</span>`;
            }
        }

        infoContainer.innerHTML = infoHTML;
        infoContainer.style.display = (titleVal || creatorVal) ? "flex" : "none";
    }

    if (typeof syncLiveHighlights === "function") {
        try { syncLiveHighlights(); } catch (e) {}
    }

    applyPreviewScale();
}

function applyPreviewScale() {
    const wrapper = document.getElementById("captureAreaScaleWrapper");
    if (!wrapper || !els.captureArea) return;

    if (els.ratioSelect.value !== "free") {
        wrapper.style.width = "";
        wrapper.style.height = "";
        els.captureArea.style.transform = "none";
        els.captureArea.style.transformOrigin = "";
        return;
    }

    // 실제 크기(스케일 없이)를 정확히 측정하기 위해 우선 변형을 해제
    els.captureArea.style.transform = "none";
    const naturalW = els.captureArea.offsetWidth;
    const naturalH = els.captureArea.scrollHeight;
    const availableW = getAvailableHeaderWidth(naturalW) || naturalW;
    const scale = naturalW > 0 ? Math.min(1, availableW / naturalW) : 1;

    els.captureArea.style.transformOrigin = "0 0";
    els.captureArea.style.transform = scale < 1 ? `scale(${scale})` : "none";
    wrapper.style.width = `${Math.round(naturalW * scale)}px`;
    wrapper.style.height = `${Math.round(naturalH * scale)}px`;
}

// ⚠️ 핵심 버그 수정: 커스텀 폰트(woff2)로 바꾸면 브라우저가 그 폰트를 그제서야 네트워크로
// 불러오는데, 폰트가 도착하기 "전" 대체 글꼴로 잰 높이로 위 wrapper의 width/height(px 고정값)를
// 정해버리고 있었다. 그 직후 진짜 폰트가 도착해 글자 크기가 바뀌면 캔버스 내용은 더 커지는데
// wrapper는 overflow:hidden인 예전(더 작은) 치수에 그대로 묶여 있어서 — "폰트 바꾸면 캔버스가
// 잘린다"는 증상이 이거였다. 저장할 때만 document.fonts.ready를 기다려 다시 그리던 걸,
// 미리보기에도 적용한다. (※ 처음엔 applyPreviewScale 안에서 .then()으로 스스로를 다시
// 거는 방식으로 짰다가, 이미 resolve된 promise라 자기 자신을 무한히 재귀호출해서 탭이 완전히
// 멈춰버리는 버그를 만들었었다 — 그래서 "매번 다시 거는" 방식이 아니라, 폰트 로딩 상태가
// 바뀔 때만 브라우저가 스스로 알려주는 이벤트 하나를 처음 한 번만 구독하는 방식으로 고쳤다.)
if (document.fonts && typeof document.fonts.addEventListener === "function") {
    document.fonts.addEventListener("loadingdone", () => {
        if (typeof refitCanvasNow === "function") refitCanvasNow();
        else if (typeof applyPreviewScale === "function") applyPreviewScale();
    });
}

function renderCanvasHeading() {
    const headingContainer = document.getElementById("canvasHeading");
    if (!headingContainer) return;

    const titleText = (els.headingTitleInput?.value || "").trim();
    const subtitleText = (els.headingSubtitleInput?.value || "").trim();

    headingContainer.innerHTML = "";

    if (!titleText && !subtitleText) {
        headingContainer.style.display = "none";
        return;
    }
    headingContainer.style.display = "block";

    if (titleText) {
        const titleEl = document.createElement("div");
        titleEl.className = "canvas-heading-title";
        titleEl.textContent = titleText;
        titleEl.style.fontFamily = els.headingTitleFont ? els.headingTitleFont.value : els.fontSelect.value;
        titleEl.style.textAlign = els.headingTitleAlign ? els.headingTitleAlign.value : "left";
        titleEl.style.fontSize = `${parseFloat(els.headingTitleSize?.value) || 24}px`;
        titleEl.style.fontWeight = els.headingTitleBold && els.headingTitleBold.checked ? "700" : "400";
        titleEl.style.color = document.getElementById("headingTitleColor")?.value || els.globalTextColor.value;
        headingContainer.appendChild(titleEl);
    }

    if (subtitleText) {
        const subtitleEl = document.createElement("div");
        subtitleEl.className = "canvas-heading-subtitle";
        subtitleEl.textContent = subtitleText;
        subtitleEl.style.fontFamily = els.headingSubtitleFont ? els.headingSubtitleFont.value : els.fontSelect.value;
        subtitleEl.style.textAlign = els.headingSubtitleAlign ? els.headingSubtitleAlign.value : "left";
        subtitleEl.style.fontSize = `${parseFloat(els.headingSubtitleSize?.value) || 15}px`;
        subtitleEl.style.fontWeight = els.headingSubtitleBold && els.headingSubtitleBold.checked ? "700" : "400";
        subtitleEl.style.color = document.getElementById("headingSubtitleColor")?.value || (els.subTextColor ? els.subTextColor.value : els.globalTextColor.value);
        subtitleEl.style.marginTop = titleText ? "6px" : "0";
        headingContainer.appendChild(subtitleEl);
    }
}

// 고정 비율(1:1, 4:5 …)에서 글이 캔버스 밖으로 잘리지 않게 글자 크기를 자동으로 줄인다.
// Chat2Img의 "오토 스케일링 루프"와 같은 방식: 대충 비율로 짐작하지 않고,
// 영역 높이에 들어올 때까지 글자 크기를 줄여가며 "실제 높이를 재서" 확인한다.
// (예전엔 한 번 짐작해서 줄이고 끝이라, 제목/하단 정보/대사 블록처럼 안 줄어드는 부분 때문에
//  1:1처럼 낮은 비율에서 글이 잘렸다)
const __fitOriginals = new WeakMap();

function fitTextToCanvas() {
    const area = els.captureArea;
    if (!area) return;
    const w = parseFloat(area.dataset.fixedRatioW);
    const h = parseFloat(area.dataset.fixedRatioH);
    if (!w || !h) return;

    const textWrapper = document.getElementById("canvasTextWrapper");
    if (!textWrapper) return;

    const baseFs = parseFloat(els.fontSize.value) || 16;
    const baseLh = parseFloat(els.lineHeight.value) || Math.round(baseFs * 1.6);
    const baseLs = parseFloat(els.letterSpacing.value) || 0;
    const avatarVal = parseFloat(document.getElementById("dlgAvatarSize")?.value);
    const baseAvatar = isNaN(avatarVal) ? 32 : avatarVal;

    const areaW = parseFloat(area.style.width) || area.getBoundingClientRect().width || 420;
    const targetH = (areaW * h) / w;

    // 글 안에 인라인 px 크기로 박혀 있는 것들(대사 블록, 사진 등)도 같은 비율로 줄여야 하므로
    // 처음 한 번 원래 값을 기억해 둔다. (캔버스 본문은 매번 새로 만들어져서 원본이 안 꼬임)
    const readPx = (v) => (typeof v === "string" && /^-?\d*\.?\d+px$/.test(v.trim())) ? parseFloat(v) : null;
    const items = [];
    textWrapper.querySelectorAll("*").forEach((el) => {
        let o = __fitOriginals.get(el);
        if (!o) {
            o = {
                fs: readPx(el.style.fontSize),
                lh: readPx(el.style.lineHeight),
                ls: readPx(el.style.letterSpacing),
                mh: readPx(el.style.minHeight),
                w: null,
                h: null,
            };
            if (el.classList.contains("editor-image-block") && el.dataset.align !== "fill") {
                o.w = readPx(el.style.width);
                o.h = readPx(el.style.height);
            }
            __fitOriginals.set(el, o);
        }
        if (o.fs != null || o.lh != null || o.ls != null || o.mh != null || o.w != null || o.h != null) {
            items.push([el, o]);
        }
    });

    const apply = (f) => {
        textWrapper.style.fontSize = `${baseFs * f}px`;
        textWrapper.style.lineHeight = `${baseLh * f}px`;
        textWrapper.style.letterSpacing = `${baseLs * f}px`;
        textWrapper.style.setProperty("--dlg-avatar-size", `${baseAvatar * f}px`);
        items.forEach(([el, o]) => {
            if (o.fs != null) el.style.fontSize = `${o.fs * f}px`;
            if (o.lh != null) el.style.lineHeight = `${o.lh * f}px`;
            if (o.ls != null) el.style.letterSpacing = `${o.ls * f}px`;
            if (o.mh != null) el.style.minHeight = `${o.mh * f}px`;
            if (o.w != null) el.style.width = `${o.w * f}px`;
            if (o.h != null) el.style.height = `${o.h * f}px`;
        });
    };

    // 높이를 "자동"으로 풀어서 내용이 원래 얼마나 필요한지 재본다.
    const limit = targetH - 2; // html2canvas 저장 시 미세한 오차를 위한 여유
    const fits = () => area.scrollHeight <= limit;
    area.style.height = "auto";
    area.style.overflow = "visible";
    apply(1);
    void area.offsetHeight;

    if (!fits()) {
        const minF = Math.min(1, 4 / baseFs); // 글자는 최소 4px까지만 줄임
        apply(minF);
        void area.offsetHeight;
        let f = minF;
        if (fits()) {
            let lo = minF, hi = 1;
            for (let i = 0; i < 14; i++) {
                const mid = (lo + hi) / 2;
                apply(mid);
                void area.offsetHeight;
                if (fits()) lo = mid; else hi = mid;
            }
            f = lo;
        }
        apply(f);
        void area.offsetHeight;
        // 혹시 줄바꿈 때문에 경계에서 아슬아슬하게 넘치면 조금씩 더 줄인다.
        for (let guard = 0; guard < 20 && !fits() && f > minF; guard++) {
            f = Math.max(minF, f * 0.97);
            apply(f);
            void area.offsetHeight;
        }
    }

    area.style.height = `${Math.round(targetH)}px`;
    area.style.overflow = "hidden";
}

function applySmartHighlighting(container) {
    const hasQuotes = els.enableQuoteColor.checked;
    const hasParens = els.enableParenColor.checked;
    if (!hasQuotes && !hasParens) return;

    const textNodes = [];
    const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while ((n = walk.nextNode())) textNodes.push(n);

    let fullText = "";
    const nodeOffsets = [];
    textNodes.forEach((node) => {
        nodeOffsets.push({ node, start: fullText.length, end: fullText.length + node.nodeValue.length });
        fullText += node.nodeValue;
    });

    const intervals = [];
    if (hasQuotes) {
        const quoteRegex = /("[^"\n]*"|"[^"\n]*"|「[^」\n]*」|『[^』\n]*』|‹[^›\n]*›|«[^»\n]*»)/g;
        let match;
        while ((match = quoteRegex.exec(fullText)) !== null)
            intervals.push({ start: match.index, end: match.index + match[0].length, color: els.quoteColor.value });
    }
    if (hasParens) {
        const parenRegex = /(\([^)\n]*\)|\[[^\]\n]*\]|\{[^}\n]*\}|〈[^〉\n]*〉|《[^》\n]*\s*》)/g;
        let match;
        while ((match = parenRegex.exec(fullText)) !== null)
            intervals.push({ start: match.index, end: match.index + match[0].length, color: els.parenColor.value });
    }

    intervals.sort((a, b) => b.start - a.start);
    intervals.forEach((item) => {
        for (let i = nodeOffsets.length - 1; i >= 0; i--) {
            const info = nodeOffsets[i];
            const overlapStart = Math.max(item.start, info.start);
            const overlapEnd = Math.min(item.end, info.end);
            if (overlapStart < overlapEnd) {
                const localStart = overlapStart - info.start;
                const localEnd = overlapEnd - info.start;
                const node = info.node;
                const text = node.nodeValue;
                const p3 = text.substring(localEnd);
                const p2 = text.substring(localStart, localEnd);
                const p1 = text.substring(0, localStart);
                const parent = node.parentNode;
                const span = document.createElement("span");
                span.style.color = item.color;
                span.style.fontWeight = "inherit";
                span.style.fontFamily = "inherit";
                span.style.backgroundColor = "transparent";
                span.textContent = p2;
                let nextSibling = node.nextSibling;
                if (p3.length > 0) { const t3 = document.createTextNode(p3); parent.insertBefore(t3, nextSibling); nextSibling = t3; }
                parent.insertBefore(span, nextSibling);
                if (p1.length > 0) node.nodeValue = p1;
                else parent.removeChild(node);
            }
        }
    });
}

let lastHlColors = { A: "#fef08a", B: "#bbf7d0", C: "#bfdbfe" };
let lastSubTextColor = "#64748b";

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : "";
}

function syncLiveHighlights(overrideColors = null) {
    const textWrapper = document.getElementById("canvasTextWrapper");
    if (!textWrapper) return;

    let baseA = lastHlColors.A, baseB = lastHlColors.B, baseC = lastHlColors.C, baseSub = lastSubTextColor;

    if (overrideColors) {
        if (overrideColors.hlColorA && els.hlColorA) els.hlColorA.value = overrideColors.hlColorA;
        if (overrideColors.hlColorB && els.hlColorB) els.hlColorB.value = overrideColors.hlColorB;
        if (overrideColors.hlColorC && els.hlColorC) els.hlColorC.value = overrideColors.hlColorC;
        if (overrideColors.subTextColor && els.subTextColor) els.subTextColor.value = overrideColors.subTextColor;
    }

    const oldRgbA = hexToRgb(baseA).replace(/\s+/g, "");
    const oldRgbB = hexToRgb(baseB).replace(/\s+/g, "");
    const oldRgbC = hexToRgb(baseC).replace(/\s+/g, "");
    const oldRgbSub = hexToRgb(baseSub).replace(/\s+/g, "");
    const targetColorA = els.hlColorA ? els.hlColorA.value : baseA;
    const targetColorB = els.hlColorB ? els.hlColorB.value : baseB;
    const targetColorC = els.hlColorC ? els.hlColorC.value : baseC;
    const targetColorSub = els.subTextColor ? els.subTextColor.value : baseSub;

    const updateSpansColor = (container) => {
        if (!container) return;
        const spans = container.getElementsByTagName("span");
        for (let span of spans) {
            const bg = span.style.backgroundColor;
            if (bg && bg !== "transparent" && bg !== "initial") {
                const normalizedBg = bg.replace(/\s+/g, "");
                if (normalizedBg === oldRgbA) span.style.backgroundColor = targetColorA;
                else if (normalizedBg === oldRgbB) span.style.backgroundColor = targetColorB;
                else if (normalizedBg === oldRgbC) span.style.backgroundColor = targetColorC;
                span.style.display = "inline";
                span.style.boxDecorationBreak = "clone";
                span.style.webkitBoxDecorationBreak = "clone";
            }
            const fg = span.style.color;
            if (fg && fg !== "transparent" && fg !== "initial") {
                if (fg.replace(/\s+/g, "") === oldRgbSub) span.style.color = targetColorSub;
            }
        }
        const fonts = container.getElementsByTagName("font");
        for (let font of fonts) {
            const fontColor = font.color || font.style.color;
            if (fontColor) {
                const currentFontRgb = (fontColor.startsWith("#") ? hexToRgb(fontColor) : fontColor).replace(/\s+/g, "");
                if (currentFontRgb === oldRgbSub) { font.color = targetColorSub; font.style.color = targetColorSub; }
            }
        }
    };

    updateSpansColor(els.editor);
    updateSpansColor(textWrapper);
    if (els.hlColorA) lastHlColors.A = els.hlColorA.value;
    if (els.hlColorB) lastHlColors.B = els.hlColorB.value;
    if (els.hlColorC) lastHlColors.C = els.hlColorC.value;
    if (els.subTextColor) lastSubTextColor = els.subTextColor.value;
}

function prepareCanvasForCapture(container) {
    // 스티커는 (에디터 안 사진과 달리) 복제본이 아니라 캔버스 DOM에 그대로 상주하기 때문에,
    // 크기조절/삭제 손잡이와 선택 테두리를 내보내기 직전에만 잠깐 숨겼다가 끝나고 되돌린다.
    container.querySelectorAll(".sticker-item.selected").forEach((el) => el.classList.add("__was-selected"));
    container.querySelectorAll(".sticker-item").forEach((el) => el.classList.remove("selected"));
    container.querySelectorAll(".no-export").forEach((el) => { el.style.display = "none"; });

    const currentFont = els.fontSelect ? els.fontSelect.value : "inherit";
    container.querySelectorAll("span").forEach((span) => {
        const bg = span.style.backgroundColor;
        if (bg && bg !== "transparent" && bg !== "initial") {
            span.setAttribute("data-original-html", span.innerHTML);
            const chars = Array.from(span.textContent);
            span.innerHTML = chars.map((char) => char === "\n" ? "\n" : `<span style="background-color: ${bg}; display: inline; color: inherit; font-family: ${currentFont}; font-weight: inherit;">${char}</span>`).join("");
            span.style.backgroundColor = "transparent";
        }
    });
}

function restoreCanvasAfterCapture(container) {
    container.querySelectorAll("span[data-original-html]").forEach((span) => {
        const originalHTML = span.getAttribute("data-original-html");
        const restoredBg = span.querySelector("span")?.style.backgroundColor || "transparent";
        span.innerHTML = originalHTML;
        span.style.backgroundColor = restoredBg;
        span.removeAttribute("data-original-html");
    });

    container.querySelectorAll(".no-export").forEach((el) => { el.style.display = ""; });
    container.querySelectorAll(".sticker-item.__was-selected").forEach((el) => {
        el.classList.add("selected");
        el.classList.remove("__was-selected");
    });
}

// ==== 배경 블러를 저장본에도 실제로 반영하기 ====
// ⚠️ 이전에는 ctx.filter = "blur()"(캔버스 자체 흐림 필터)를 썼는데, 이게 아이폰 사파리 등 일부
// 브라우저에서 안정적으로 적용되지 않아 저장한 이미지에 블러가 아예 안 먹는 경우가 있었다.
// 그래서 브라우저 필터에 의존하지 않고, 픽셀을 직접 계산해서 흐리게 만드는 박스 블러를 구현했다 —
// 이 방식은 캔버스 API의 기본 기능(getImageData/putImageData)만 쓰기 때문에 어떤 브라우저에서도
// 똑같이 동작한다.
function boxBlurPass(pixels, w, h, radius, horizontal) {
    if (radius < 1) return;
    const out = new Uint8ClampedArray(pixels.length);
    const windowSize = radius * 2 + 1;
    const lineCount = horizontal ? h : w;
    const lineLength = horizontal ? w : h;
    for (let line = 0; line < lineCount; line++) {
        const getIdx = (pos) => {
            const clamped = Math.min(lineLength - 1, Math.max(0, pos));
            return horizontal ? (line * w + clamped) * 4 : (clamped * w + line) * 4;
        };
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
        for (let i = -radius; i <= radius; i++) {
            const idx = getIdx(i);
            rSum += pixels[idx]; gSum += pixels[idx + 1]; bSum += pixels[idx + 2]; aSum += pixels[idx + 3];
        }
        for (let pos = 0; pos < lineLength; pos++) {
            const idx = getIdx(pos);
            out[idx] = rSum / windowSize;
            out[idx + 1] = gSum / windowSize;
            out[idx + 2] = bSum / windowSize;
            out[idx + 3] = aSum / windowSize;
            const removeIdx = getIdx(pos - radius);
            const addIdx = getIdx(pos + radius + 1);
            rSum += pixels[addIdx] - pixels[removeIdx];
            gSum += pixels[addIdx + 1] - pixels[removeIdx + 1];
            bSum += pixels[addIdx + 2] - pixels[removeIdx + 2];
            aSum += pixels[addIdx + 3] - pixels[removeIdx + 3];
        }
    }
    pixels.set(out);
}

function boxBlurCanvasContext(ctx, width, height, radius) {
    if (radius < 1) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const px = imageData.data;
    // 3번 반복하면 박스 블러가 가우시안 블러와 거의 비슷하게 부드러워진다.
    for (let pass = 0; pass < 3; pass++) {
        boxBlurPass(px, width, height, radius, true);
        boxBlurPass(px, width, height, radius, false);
    }
    ctx.putImageData(imageData, 0, 0);
}

// 저장할 때 캔버스가 CSS의 filter:blur()를 지원하지 않아서(무시하고 그냥 그림), 미리보기 화면에서는
// 블러가 보여도 저장한 이미지에는 블러가 안 걸린 원본 사진이 그대로 나왔었다.
// 그래서 저장 직전에 배경 사진을 캔버스에 실제로 흐리게(픽셀 자체를) "구워서" 이미지로 바꿔치기하고,
// CSS filter는 꺼둔다 — 이러면 저장 라이브러리가 "그냥 흐린 사진"을 찍는 것뿐이라 문제없이 반영된다.
function bakeBackgroundBlurForCapture() {
    return new Promise((resolve) => {
        const bgLayer = document.getElementById("bgImageLayer");
        const blurEl = document.getElementById("bgImageBlur");
        if (!bgLayer || !blurEl) { resolve(); return; }
        const blurPx = parseFloat(blurEl.value) || 0;
        // ⚠️ 배경이 인라인 style이 아니라 프리셋 등 다른 방식(class 등)으로 적용됐을 수도 있어서,
        // 인라인 style만 보지 않고 getComputedStyle로 "최종적으로 실제 적용된" backgroundImage 값을
        // 읽는다 — 이러면 어떤 방식으로 배경이 걸렸든 항상 정확히 잡아낸다.
        const bgImageCss = bgLayer.style.backgroundImage || getComputedStyle(bgLayer).backgroundImage;
        const match = bgImageCss && bgImageCss.match(/url\((?:"|')?([^"')]+)(?:"|')?\)/);
        if (!blurPx) { console.warn("[블러 굽기] 블러 값이 0이라 건너뜀"); resolve(); return; }
        if (!match) { console.warn("[블러 굽기] 배경 이미지를 못 찾음. backgroundImage =", bgImageCss); resolve(); return; }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const rect = bgLayer.getBoundingClientRect();
                const containerW = Math.max(1, Math.round(rect.width));
                const containerH = Math.max(1, Math.round(rect.height));
                const sizePercent = parseFloat(document.getElementById("bgImageSize")?.value) || 100;
                const posX = parseFloat(document.getElementById("bgImageX")?.value);
                const posY = parseFloat(document.getElementById("bgImageY")?.value);
                const posXVal = isNaN(posX) ? 50 : posX;
                const posYVal = isNaN(posY) ? 50 : posY;

                // background-size: N% (한 값만 지정 → 가로 기준, 세로는 원본 비율 유지)와
                // background-position: X% Y%의 실제 CSS 계산 공식 그대로 좌표를 구한다.
                const displayedW = containerW * (sizePercent / 100);
                const displayedH = displayedW * (img.naturalHeight / img.naturalWidth);
                const offsetX = (containerW - displayedW) * (posXVal / 100);
                const offsetY = (containerH - displayedH) * (posYVal / 100);

                const pad = Math.ceil(blurPx * 3); // 블러 때 가장자리가 비쳐 보이지 않도록 여유 공간을 둔다

                // ⚠️ 저장은 scale:2로 두 배 해상도로 찍는데, 여기서 구운 배경 이미지가 화면 표시
                // 크기(1배) 그대로면 저장할 때 두 배로 늘어나면서 화질이 뚝 떨어졌었다.
                // 그래서 실제 그리는 캔버스 자체를 EXPORT_SCALE배 더 크게 만들고(블러 반경도 같이 배율
                // 적용), CSS로 보여주는 크기(backgroundSize)만 원래 크기로 맞춰서 고해상도를 유지한다.
                // 단, 픽셀 단위 블러는 계산량이 크므로 캔버스 자체 해상도는 EXPORT_SCALE 그대로 쓰되
                // 블러 반경은 너무 커지지 않게 적당히 맞춘다.
                const EXPORT_SCALE = 2;
                const off = document.createElement("canvas");
                off.width = (containerW + pad * 2) * EXPORT_SCALE;
                off.height = (containerH + pad * 2) * EXPORT_SCALE;
                const ctx = off.getContext("2d");
                ctx.drawImage(
                    img,
                    (offsetX + pad) * EXPORT_SCALE,
                    (offsetY + pad) * EXPORT_SCALE,
                    displayedW * EXPORT_SCALE,
                    displayedH * EXPORT_SCALE
                );
                boxBlurCanvasContext(ctx, off.width, off.height, Math.round(blurPx * EXPORT_SCALE));

                bgLayer.setAttribute("data-orig-bg-image", bgImageCss);
                bgLayer.setAttribute("data-orig-bg-filter", bgLayer.style.filter || "");
                bgLayer.setAttribute("data-orig-bg-size", bgLayer.style.backgroundSize || "");
                bgLayer.setAttribute("data-orig-bg-position", bgLayer.style.backgroundPosition || "");
                bgLayer.setAttribute("data-orig-bg-repeat", bgLayer.style.backgroundRepeat || "");

                bgLayer.style.backgroundImage = `url(${off.toDataURL("image/png")})`;
                bgLayer.style.backgroundSize = `${containerW + pad * 2}px ${containerH + pad * 2}px`;
                bgLayer.style.backgroundPosition = `-${pad}px -${pad}px`;
                bgLayer.style.backgroundRepeat = "no-repeat";
                bgLayer.style.filter = "none";
            } catch (e) {
                console.warn("배경 블러 굽기 실패:", e);
            }
            resolve();
        };
        img.onerror = () => resolve();
        img.src = match[1];
    });
}

function restoreBackgroundBlurAfterCapture() {
    const bgLayer = document.getElementById("bgImageLayer");
    if (!bgLayer || !bgLayer.hasAttribute("data-orig-bg-image")) return;
    bgLayer.style.backgroundImage = bgLayer.getAttribute("data-orig-bg-image");
    bgLayer.style.filter = bgLayer.getAttribute("data-orig-bg-filter");
    bgLayer.style.backgroundSize = bgLayer.getAttribute("data-orig-bg-size");
    bgLayer.style.backgroundPosition = bgLayer.getAttribute("data-orig-bg-position");
    bgLayer.style.backgroundRepeat = bgLayer.getAttribute("data-orig-bg-repeat");
    ["data-orig-bg-image", "data-orig-bg-filter", "data-orig-bg-size", "data-orig-bg-position", "data-orig-bg-repeat"].forEach((attr) => bgLayer.removeAttribute(attr));
}

document.getElementById("btnBold").addEventListener("click", () => { document.execCommand("bold", false, null); updateCanvas(); });
document.getElementById("btnItalic").addEventListener("click", () => { document.execCommand("italic", false, null); updateCanvas(); });

document.getElementById("btnQuoteWrap").addEventListener("click", () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    document.execCommand("insertText", false, `"${range.toString()}"`);
    updateCanvas();
});

document.getElementById("btnSubText").addEventListener("click", () => {
    document.execCommand("foreColor", false, els.subTextColor?.value || "#64748b");
    if (typeof syncLiveHighlights === "function") syncLiveHighlights();
    updateCanvas();
});

// rgb(...)/rgba(...) 문자열을 받아 밝기를 계산해 대비되는 흑/백을 반환
function getContrastColor(colorStr) {
    const nums = (colorStr || "").match(/[\d.]+/g);
    if (!nums || nums.length < 3) return "#ffffff";
    const [r, g, b] = nums.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "#000000" : "#ffffff";
}

// 선택 영역의 각 글자가 가진 "현재 글자색"을 그대로 배경색으로 바꾸고,
// 글자색은 그 배경과 대비되는 색(흰/검)으로 반전시킨다.
function applyInvertToSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return false;
    if (!els.editor.contains(selection.anchorNode)) return false;

    document.execCommand("fontSize", false, "7");

    const markers = els.editor.querySelectorAll('font[size="7"]');
    markers.forEach((marker) => {
        const walker = document.createTreeWalker(marker, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) textNodes.push(node);

        textNodes.forEach((textNode) => {
            if (!textNode.nodeValue || !textNode.parentElement) return;
            const computedColor = window.getComputedStyle(textNode.parentElement).color;
            const span = document.createElement("span");
            span.style.backgroundColor = computedColor;
            span.style.color = getContrastColor(computedColor);
            span.style.display = "inline";
            span.style.boxDecorationBreak = "clone";
            span.style.webkitBoxDecorationBreak = "clone";
            textNode.parentNode.insertBefore(span, textNode);
            span.appendChild(textNode);
        });

        const parent = marker.parentNode;
        while (marker.firstChild) parent.insertBefore(marker.firstChild, marker);
        parent.removeChild(marker);
    });

    return true;
}

document.getElementById("btnInvertHighlight").addEventListener("click", () => {
    if (applyInvertToSelection()) updateCanvas();
    else showToast("먼저 본문에서 글자를 드래그해 선택해 주세요.");
});

document.getElementById("selHighlight").addEventListener("change", function () {
    const val = this.value;
    if (!val) return;

    let color = "#fef08a";
    if (val === "A") color = els.hlColorA.value;
    if (val === "B") color = els.hlColorB.value;
    if (val === "C") color = els.hlColorC.value;
    document.execCommand("backColor", false, color);
    this.value = "";
    for (let span of els.editor.getElementsByTagName("span")) {
        if (span.style.backgroundColor && span.style.backgroundColor !== "transparent") {
            span.style.display = "inline";
            span.style.boxDecorationBreak = "clone";
            span.style.webkitBoxDecorationBreak = "clone";
        }
    }
    updateCanvas();
});

const selAlignEl = document.getElementById("selAlign");
if (selAlignEl) {
    selAlignEl.addEventListener("change", function () {
        const val = this.value;
        if (!val) return;
        const cmd = val === "left" ? "justifyLeft" : val === "center" ? "justifyCenter" : "justifyRight";
        document.execCommand(cmd, false, null);
        this.value = "";
        updateCanvas();
    });
}

// 선택 영역에만 인라인 스타일(서체/크기 등)을 적용하는 헬퍼.
// execCommand("fontSize", false, "7")로 선택 영역을 <font size="7"> 로 감싼 뒤,
// 그 마커를 원하는 CSS가 적용된 <span>으로 치환한다. (여러 블록/노드에 걸친
// 선택에도 안정적으로 동작하도록 브라우저 내장 로직을 활용)
function applyStylesToSelection(styles) {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return false;
    if (!els.editor.contains(selection.anchorNode)) return false;

    document.execCommand("fontSize", false, "7");

    const markers = els.editor.querySelectorAll('font[size="7"]');
    markers.forEach((marker) => {
        const span = document.createElement("span");
        Object.keys(styles).forEach((prop) => { span.style[prop] = styles[prop]; });
        while (marker.firstChild) span.appendChild(marker.firstChild);
        marker.parentNode.replaceChild(span, marker);
    });
    return true;
}

function applyStyleToSelection(cssProp, cssValue) {
    return applyStylesToSelection({ [cssProp]: cssValue });
}

const selFontFamilyEl = document.getElementById("selFontFamily");
if (selFontFamilyEl) {
    selFontFamilyEl.addEventListener("change", function () {
        const val = this.value;
        this.value = "";
        if (!val) return;
        // 나눔명조에코는 포인트용으로 쓸 때 항상 가장 굵은(800) 스타일로 고정
        const styles = { fontFamily: val };
        if (val === "NanumMyeongjoEco") styles.fontWeight = "800";
        if (applyStylesToSelection(styles)) updateCanvas();
        else showToast("먼저 본문에서 글자를 드래그해 선택해 주세요.");
    });
}

const selFontSizeEl = document.getElementById("selFontSize");
if (selFontSizeEl) {
    selFontSizeEl.addEventListener("change", function () {
        const val = this.value;
        this.value = "";
        if (!val) return;
        if (applyStyleToSelection("fontSize", `${val}px`)) updateCanvas();
        else showToast("먼저 본문에서 글자를 드래그해 선택해 주세요.");
    });
}

function onClick(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
}

onClick("btnQuoteLine", () => {
    let selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    let block = range.commonAncestorContainer;
    while (block && block.nodeType !== Node.ELEMENT_NODE) block = block.parentNode;
    if (block && block.id !== "textEditor") {
        block.classList.toggle("dialogue-line");
    } else {
        let div = document.createElement("div");
        div.classList.add("dialogue-line");
        div.appendChild(range.extractContents());
        range.insertNode(div);
    }
    updateCanvas();
    pushHistory(true);
});

onClick("btnBoxQuote", () => {
    let selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    let block = range.commonAncestorContainer;
    while (block && block.nodeType !== Node.ELEMENT_NODE) block = block.parentNode;
    if (block && block.id !== "textEditor") {
        block.classList.toggle("box-quote");
    } else {
        let div = document.createElement("div");
        div.classList.add("box-quote");
        div.appendChild(range.extractContents());
        range.insertNode(div);
    }
    updateCanvas();
    pushHistory(true);
});

onClick("btnInsertFootnote", () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || !els.editor || !els.editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        showToast("본문 안에서 각주를 넣을 위치를 먼저 눌러주세요.");
        return;
    }
    const range = selection.getRangeAt(0);

    const note = { id: uid(), text: "" };
    footnotes.push(note);

    const marker = document.createElement("sup");
    marker.className = "footnote-marker";
    marker.dataset.footnoteId = note.id;
    marker.contentEditable = "false";
    const footnoteColor = document.getElementById("footnoteColor")?.value || "#2563eb";
    marker.style.cssText = `font-size:0.7em;color:${footnoteColor};font-weight:700;margin:0 1px;user-select:none;`;
    marker.textContent = "•"; // 실제 번호는 renumberFootnoteMarkers()가 바로 매겨준다
    range.deleteContents();
    range.insertNode(marker);

    // 마커 뒤로 커서를 옮겨서 계속 이어 타이핑할 수 있게 한다.
    const newRange = document.createRange();
    newRange.setStartAfter(marker);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    renumberFootnoteMarkers();
    renderFootnoteList();
    updateCanvas();
    if (typeof pushHistory === "function") pushHistory(true);
});

onClick("btnInsertDivider", () => {
    let selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    let divider = document.createElement("div");
    divider.classList.add("hr-divider");
    divider.contentEditable = "false";
    range.deleteContents();
    range.insertNode(divider);

    let newLine = document.createElement("div");
    newLine.appendChild(document.createElement("br"));
    divider.after(newLine);

    const newRange = document.createRange();
    newRange.setStart(newLine, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    updateCanvas();
    pushHistory(true);
});

// 직접 작성한 HTML 코드를 본문에 블록으로 삽입한다. 다른 특수 블록들(대사·구분선 등)과 똑같이
// contenteditable=false로 넣어서 실수로 안이 깨지는 걸 막고, normalizeParagraphs에서
// .html-embed-block도 그대로 보존하도록 등록해뒀다(캔버스에도 입력한 그대로 나옴).
onClick("btnInsertHtmlBlock", () => {
    const html = window.prompt("본문에 넣을 HTML 코드를 붙여넣어 주세요:");
    if (!html || !html.trim()) return;
    if (!els.editor) return;

    const selection = window.getSelection();
    let range;
    if (selection && selection.rangeCount && els.editor.contains(selection.anchorNode)) {
        range = selection.getRangeAt(0);
    } else {
        range = document.createRange();
        range.selectNodeContents(els.editor);
        range.collapse(false);
    }

    const block = document.createElement("div");
    block.className = "html-embed-block";
    block.contentEditable = "false";
    block.innerHTML = html;

    range.deleteContents();
    range.insertNode(block);

    const newLine = document.createElement("div");
    newLine.appendChild(document.createElement("br"));
    block.after(newLine);

    const newRange = document.createRange();
    newRange.setStart(newLine, 0);
    newRange.collapse(true);
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    updateCanvas();
    if (typeof pushHistory === "function") pushHistory(true);
});

function insertInlineBlock(html) {
    if (!els.editor) return;
    els.editor.focus();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    const node = wrapper.firstElementChild;
    if (!node) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount && els.editor.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);
    } else {
        els.editor.appendChild(node);
    }

    const trailer = document.createElement("div");
    trailer.appendChild(document.createElement("br"));
    node.after(trailer);

    const field = node.querySelector(".tpl-field");
    if (field && selection) {
        const newRange = document.createRange();
        newRange.selectNodeContents(field);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    closeSheetPanel();
    updateCanvas();
    pushHistory(true);
}

// ==== 대사 탭: 캐릭터 관리 ====
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function uid() {
    return "c" + Math.random().toString(36).slice(2, 9);
}

let characters = [];
let editingCharacterId = null;
let pendingCharAvatarData = null;

function saveCharactersToStorage() {
    try {
        localStorage.setItem("quoteStudioCharacters", JSON.stringify(characters));
    } catch (e) {
        console.warn("캐릭터 저장 실패:", e);
    }
}

function loadCharactersFromStorage() {
    try {
        const raw = localStorage.getItem("quoteStudioCharacters");
        characters = raw ? JSON.parse(raw) : [];
    } catch (e) {
        characters = [];
    }
}

function renderCharacterList() {
    const container = document.getElementById("characterList");
    if (!container) return;
    container.innerHTML = "";

    if (characters.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "text-align:center;font-size:12px;color:var(--text-muted);padding:12px 0;";
        empty.textContent = "등록된 캐릭터가 없어요.";
        container.appendChild(empty);
        return;
    }

    characters.forEach((c) => {
        const row = document.createElement("div");
        row.className = "char-chip-row";

        const avatar = document.createElement("div");
        avatar.className = "char-chip-avatar";
        if (c.avatarData) avatar.style.backgroundImage = `url(${c.avatarData})`;
        if (c.color) avatar.style.boxShadow = `0 0 0 2px ${c.color}`;

        const name = document.createElement("div");
        name.className = "char-chip-name";
        name.textContent = c.name || "이름 없음";

        const insertBtn = document.createElement("button");
        insertBtn.type = "button";
        insertBtn.className = "char-chip-insert";
        insertBtn.textContent = "대사 추가";
        insertBtn.addEventListener("click", () => addDialogueLine(c.id));

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "char-chip-edit";
        editBtn.textContent = "편집";
        editBtn.addEventListener("click", () => openCharacterEditor(c.id));

        row.appendChild(avatar);
        row.appendChild(name);
        row.appendChild(insertBtn);
        row.appendChild(editBtn);
        container.appendChild(row);
    });
}

function openCharacterEditor(id) {
    editingCharacterId = id || null;
    pendingCharAvatarData = null;

    const editor = document.getElementById("characterEditor");
    const nameInput = document.getElementById("charEditorName");
    const avatarBox = document.getElementById("charEditorAvatar");
    const deleteBtn = document.getElementById("btnDeleteCharacter");
    const colorInput = document.getElementById("charEditorColor");
    const bubbleSideArea = document.getElementById("charEditorBubbleSideArea");
    const bubbleSideInput = document.getElementById("charEditorBubbleSide");
    if (!editor || !nameInput || !avatarBox || !deleteBtn) return;

    const mode = document.getElementById("dialogueMode")?.value || "log";
    if (bubbleSideArea) bubbleSideArea.style.display = mode === "bubble" ? "" : "none";

    if (id) {
        const c = characters.find((x) => x.id === id);
        if (!c) return;
        nameInput.value = c.name || "";
        avatarBox.style.backgroundImage = c.avatarData ? `url(${c.avatarData})` : "none";
        avatarBox.dataset.hasImage = c.avatarData ? "true" : "false";
        if (colorInput) colorInput.value = c.color || "#171717";
        deleteBtn.style.display = "block";
        setSegmentedValue("charEditorBubbleSide", c.bubbleSide || "left");
    } else {
        nameInput.value = "";
        avatarBox.style.backgroundImage = "none";
        avatarBox.dataset.hasImage = "false";
        if (colorInput) colorInput.value = "#171717";
        deleteBtn.style.display = "none";
        setSegmentedValue("charEditorBubbleSide", "left");
    }
    if (bubbleSideInput && !id) bubbleSideInput.value = "left";

    editor.style.display = "flex";
    editor.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

// 세그먼트 컨트롤(예: 왼쪽/오른쪽 버튼)의 활성 버튼과 숨은 input 값을 코드로 맞춰준다.
function setSegmentedValue(hiddenInputId, value) {
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) hiddenInput.value = value;
    const group = document.querySelector(`.segmented-control[data-target="${hiddenInputId}"]`);
    if (!group) return;
    group.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-value") === value);
    });
}

function closeCharacterEditor() {
    const editor = document.getElementById("characterEditor");
    if (editor) editor.style.display = "none";
    editingCharacterId = null;
    pendingCharAvatarData = null;
}

function updateExistingDialogueNames(charId) {
    const c = characters.find((x) => x.id === charId);
    if (!c) return;
    renderDialogueLineList();
    dialogueLines.filter((l) => l.charId === charId).forEach((l) => updateDialogueMarkerInEditor(l));
    updateCanvas();
}

function getQuoteChars(style) {
    if (style === "corner") return { open: "「", close: "」" };
    if (style === "none") return { open: "", close: "" };
    return { open: '"', close: '"' };
}

// 대사 탭: 로그/블록 모드에 따라 관련 설정 행을 보이기/숨기기 (프리셋 적용 시에도 재사용)
function syncDialogueModeUI() {
    const mode = document.getElementById("dialogueMode")?.value || "log";
    const isLog = mode === "log";
    const isBlock = mode === "block";
    const isBubble = mode === "bubble";
    const hint = document.getElementById("dialogueModeHint");
    const areaMap = {
        dlgShowAvatarArea: isLog || isBubble,
        dlgQuoteStyleArea: isLog,
        dlgTranslationArea: isLog,
        dlgContinuationGapArea: isLog,
        dlgLogOnlyTitle: isLog,
        dlgNameGapArea: isBlock,
        dlgBlockOnlyTitle: isBlock,
        dlgParagraphLayoutArea: isBlock,
        dlgBubbleOnlyTitle: isBubble,
        dlgBubbleThemeArea: isBubble,
        dlgBubbleThemeHint: isBubble,
        dlgBubbleOpacityArea: isBubble,
        dlgBubblePadYArea: isBubble,
        dlgBubblePadXArea: isBubble,
        dlgBubbleRadiusArea: isBubble,
        dlgBubbleTextColorArea: isBubble
    };
    Object.keys(areaMap).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = areaMap[id] ? "" : "none";
    });
    const bubbleSideArea = document.getElementById("charEditorBubbleSideArea");
    if (bubbleSideArea) bubbleSideArea.style.display = isBubble ? "" : "none";
    const lineGapLabel = document.getElementById("dlgLineGapLabel");
    if (lineGapLabel) lineGapLabel.textContent = isLog ? "대사(턴) 간 간격 (px)" : "대사 줄 사이 간격 (px)";
    if (hint) {
        hint.textContent = isLog
            ? "이름과 프로필 사진을 앞에 두고, 대사를 한 줄씩 이어 보여줘요."
            : isBubble
                ? "채팅 앱처럼 둥근 말풍선으로 보여줘요. 캐릭터별로 왼쪽/오른쪽, 색을 따로 정할 수 있어요."
                : "이름과 대사를 한 줄씩, 하나의 박스 안에 모아 보여줘요.";
    }
    syncParagraphLayoutUI();
    renderDialogueLineList();
    if (typeof updateCanvas === "function") updateCanvas();
}

// 대사 탭: "화자 · 줄글 단락 분리" 체크 여부에 따라 하위 설정 행(들여쓰기·이름 칸 너비) 보이기/숨기기
function syncParagraphLayoutUI() {
    const mode = document.getElementById("dialogueMode")?.value || "log";
    const checkbox = document.getElementById("dlgParagraphLayout");
    const on = mode === "block" && !!(checkbox && checkbox.checked);
    ["dlgParagraphIndentArea", "dlgNameColumnWidthArea"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = on ? "" : "none";
    });
    renderDialogueLineList();
}


// 대사 탭: 프사 표시 여부에 따라 모양/크기 설정 행 보이기/숨기기
function syncAvatarSettingUI() {
    const showAvatarEl = document.getElementById("dlgShowAvatar");
    if (!showAvatarEl) return;
    const show = showAvatarEl.checked;
    const shapeArea = document.getElementById("dlgAvatarShapeArea");
    const sizeArea = document.getElementById("dlgAvatarSizeArea");
    if (shapeArea) shapeArea.style.display = show ? "flex" : "none";
    if (sizeArea) sizeArea.style.display = show ? "flex" : "none";
    const list = document.getElementById("characterList");
    if (list) list.classList.toggle("hide-chip-avatars", !show);
}

// ==== 대사 목록 (셀 형식, JS 배열 + localStorage에 보관 — 탭 이동/새로고침해도 안 지워짐) ====
let dialogueLines = [];

function saveDialogueLinesToStorage() {
    try {
        localStorage.setItem("quoteStudioDialogueLines", JSON.stringify(dialogueLines));
    } catch (e) {
        console.warn("대사 목록 저장 실패:", e);
    }
}

function loadDialogueLinesFromStorage() {
    try {
        const raw = localStorage.getItem("quoteStudioDialogueLines");
        dialogueLines = raw ? JSON.parse(raw) : [];
    } catch (e) {
        dialogueLines = [];
    }
}

// ==== 자동 치환 규칙 (JS 배열 + localStorage — 한 번 등록하면 지우기 전까지 계속 유지) ====
const DEFAULT_REPLACEMENT_RULES = [
    { id: "rp1", find: "......", replace: "·", desc: "말줄임표를 가운데 점으로 — 점 3개당 한 개", enabled: true },
    { id: "rp2", find: "…", replace: "·", desc: "말줄임표(…) 하나를 가운데 점 하나로", enabled: true },
];
let replacementRules = [];

function saveReplacementRulesToStorage() {
    try {
        localStorage.setItem("quoteStudioReplacementRules", JSON.stringify(replacementRules));
    } catch (e) {
        console.warn("치환 규칙 저장 실패:", e);
    }
}

function loadReplacementRulesFromStorage() {
    try {
        const raw = localStorage.getItem("quoteStudioReplacementRules");
        replacementRules = raw ? JSON.parse(raw) : DEFAULT_REPLACEMENT_RULES.map((r) => ({ ...r }));
    } catch (e) {
        replacementRules = DEFAULT_REPLACEMENT_RULES.map((r) => ({ ...r }));
    }
}

function addReplacementRule() {
    replacementRules.push({ id: uid(), find: "", replace: "", desc: "", enabled: true });
    saveReplacementRulesToStorage();
    renderReplacementRuleList();
}

function deleteReplacementRule(id) {
    replacementRules = replacementRules.filter((r) => r.id !== id);
    saveReplacementRulesToStorage();
    renderReplacementRuleList();
    updateCanvas();
}

function renderReplacementRuleList() {
    const container = document.getElementById("replacementRuleList");
    if (!container) return;
    container.innerHTML = "";
    replacementRules.forEach((rule) => {
        const cell = document.createElement("div");
        cell.className = "replacement-rule-cell";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = rule.enabled !== false;
        checkbox.addEventListener("change", () => {
            rule.enabled = checkbox.checked;
            saveReplacementRulesToStorage();
            updateCanvas();
        });

        const findInput = document.createElement("input");
        findInput.type = "text";
        findInput.value = rule.find || "";
        findInput.placeholder = "찾을 글자";
        findInput.addEventListener("input", () => {
            rule.find = findInput.value;
            saveReplacementRulesToStorage();
            updateCanvas();
        });

        const arrow = document.createElement("span");
        arrow.className = "replacement-rule-arrow";
        arrow.textContent = "→";

        const replaceInput = document.createElement("input");
        replaceInput.type = "text";
        replaceInput.value = rule.replace || "";
        replaceInput.placeholder = "바꿀 글자";
        replaceInput.addEventListener("input", () => {
            rule.replace = replaceInput.value;
            saveReplacementRulesToStorage();
            updateCanvas();
        });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "replacement-rule-delete";
        delBtn.textContent = "×";
        delBtn.addEventListener("click", () => deleteReplacementRule(rule.id));

        cell.appendChild(checkbox);
        cell.appendChild(findInput);
        cell.appendChild(arrow);
        cell.appendChild(replaceInput);
        cell.appendChild(delBtn);
        container.appendChild(cell);
    });
}

// 활성화된 규칙들을 순서대로 텍스트에 적용한다. (본문은 그대로 두고, 캔버스에 그릴 때만 바꿔치기해서
// 보여주는 방식이라 원본 타이핑 내용은 안 건드림 — 실행취소·재수정에 안전함)
function applyReplacementRules(text) {
    let result = text;
    replacementRules.forEach((rule) => {
        if (rule.enabled === false) return;
        if (!rule.find) return;
        result = result.split(rule.find).join(rule.replace ?? "");
    });
    return result;
}

// ==== 각주 (JS 배열 + localStorage — 새로고침해도 안 지워짐) ====
let footnotes = [];

function saveFootnotesToStorage() {
    try {
        localStorage.setItem("quoteStudioFootnotes", JSON.stringify(footnotes));
    } catch (e) {
        console.warn("각주 저장 실패:", e);
    }
}

function loadFootnotesFromStorage() {
    try {
        const raw = localStorage.getItem("quoteStudioFootnotes");
        footnotes = raw ? JSON.parse(raw) : [];
    } catch (e) {
        footnotes = [];
    }
}

// 번호를 "배열 순서"가 아니라 "본문 안에 실제로 놓인 순서"대로 다시 매긴다.
// (각주를 순서와 다르게 넣거나 하나를 지워도 항상 1,2,3...으로 맞게 유지되도록)
function renumberFootnoteMarkers() {
    if (!els.editor) return;
    const markers = Array.from(els.editor.querySelectorAll(".footnote-marker"));
    markers.forEach((m, i) => { m.textContent = String(i + 1); });
    const orderedIds = markers.map((m) => m.dataset.footnoteId);
    footnotes.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
    saveFootnotesToStorage();
}

function deleteFootnote(id) {
    footnotes = footnotes.filter((n) => n.id !== id);
    const marker = els.editor ? els.editor.querySelector(`.footnote-marker[data-footnote-id="${id}"]`) : null;
    if (marker) marker.remove();
    renumberFootnoteMarkers();
    renderFootnoteList();
    updateCanvas();
}

function renderFootnoteList() {
    const container = document.getElementById("footnoteList");
    if (!container) return;
    container.innerHTML = "";
    footnotes.forEach((note, i) => {
        const cell = document.createElement("div");
        cell.className = "replacement-rule-cell";

        const numLabel = document.createElement("span");
        numLabel.textContent = String(i + 1);
        numLabel.style.cssText = "font-weight:700;flex:0 0 auto;min-width:18px;";

        const input = document.createElement("input");
        input.type = "text";
        input.value = note.text || "";
        input.placeholder = "각주 내용을 입력하세요";
        input.addEventListener("input", () => {
            note.text = input.value;
            saveFootnotesToStorage();
            updateCanvas();
        });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "replacement-rule-delete";
        delBtn.textContent = "×";
        delBtn.addEventListener("click", () => deleteFootnote(note.id));

        cell.appendChild(numLabel);
        cell.appendChild(input);
        cell.appendChild(delBtn);
        container.appendChild(cell);
    });
}

// 각주 목록을 캔버스 맨 아래에 작은 글씨로 붙여서 보여준다.
function buildFootnoteListHTML() {
    if (footnotes.length === 0) return "";
    const color = document.getElementById("footnoteColor")?.value || "#2563eb";
    const showDivider = document.getElementById("footnoteDividerShow")?.checked !== false;
    const dividerColor = document.getElementById("footnoteDividerColor")?.value || "#787878";
    const dividerWidthRaw = parseFloat(document.getElementById("footnoteDividerWidth")?.value);
    const dividerWidth = isNaN(dividerWidthRaw) ? 1 : Math.max(0.5, dividerWidthRaw);
    const borderStyle = showDivider ? `border-top:${dividerWidth}px solid ${dividerColor};` : "";
    const rows = footnotes.map((note, i) => `<div style="margin-top:2px;"><span style="color:${color};font-weight:700;">${i + 1})</span> ${escapeHtml(note.text || "")}</div>`).join("");
    return `<div style="margin-top:20px;padding-top:10px;${borderStyle}font-size:12px;line-height:1.6;opacity:0.75;text-align:left;">${rows}</div>`;
}

// 각주 번호(본문 안의 위첨자 마커) 색은 설정을 바꿀 때마다 즉시 반영되도록, updateCanvas가 실행될
// 때마다 편집창 속 마커들의 색을 항상 최신 설정으로 다시 칠한다(대사 블록 새로고침과 같은 방식).
function refreshFootnoteMarkerColors() {
    if (!els.editor) return;
    const color = document.getElementById("footnoteColor")?.value || "#2563eb";
    els.editor.querySelectorAll(".footnote-marker").forEach((marker) => {
        marker.style.color = color;
    });
}

function addDialogueLine(charId) {
    const line = { id: uid(), charId, text: "", translation: "", narration: "", stage: "" };
    dialogueLines.push(line);
    saveDialogueLinesToStorage();
    renderDialogueLineList();
    insertDialogueMarkerIntoEditor(line);
    updateCanvas();
    // 새로 추가된 칸이 어디 있는지 바로 보이도록 스크롤한다. 커서는 insertDialogueMarkerIntoEditor에서
    // 이미 편집창의 새 빈 줄로 옮겨놨으니(지문 바로 입력 가능), 여기서 다시 사이드바로 뺏지 않는다.
    const container = document.getElementById("dialogueLineList");
    if (container) {
        const lastCell = container.querySelector(".dialogue-line-cell:last-child");
        if (lastCell) lastCell.scrollIntoView({ block: "center", behavior: "smooth" });
    }
}

// 대사 하나(line)를 현재 설정(로그/블록/단락분리, 이름표시, 따옴표, 색상, 프사, 번역, 폰트 등)에 맞춰
// 실제로 화면·저장본에 그려질 모양 그대로 HTML로 만든다. 편집창 안의 블록(.dlg-editor-marker)과
// 캔버스 양쪽에 이 함수 하나로 항상 똑같은 모양을 그린다 (따로 관리하던 두 렌더링 경로를 통합).
// ⚠️ #canvasTextWrapper/#textEditor에 white-space:pre-wrap이 걸려 있으므로 태그 사이 줄바꿈 없이 한 줄로 만든다.
function buildDialogueBlockHTML(line) {
    const c = characters.find((x) => x.id === line.charId);
    if (!c) return `<div style="font-size:12px;color:#999;">(삭제된 캐릭터)</div>`;

    const mode = document.getElementById("dialogueMode")?.value || "log";
    const paragraphLayoutOn = mode === "block" && document.getElementById("dlgParagraphLayout")?.checked;
    const showAvatar = mode !== "block" && document.getElementById("dlgShowAvatar")?.checked;
    const showName = document.getElementById("dlgShowName")?.checked !== false && line.showName !== false;
    const showTranslation = document.getElementById("dlgShowTranslation")?.checked;
    const useCharColor = document.getElementById("dlgUseCharColor")?.checked;
    const nameSuffix = document.getElementById("dlgNameSuffix")?.value ?? ":";
    const quoteChars = getQuoteChars(document.getElementById("dlgQuoteStyle")?.value || "none");
    const nameGapRaw = parseFloat(document.getElementById("dlgNameGap")?.value);
    const nameGap = isNaN(nameGapRaw) ? 14 : nameGapRaw;
    const nameFontSizeRaw = parseFloat(document.getElementById("dlgNameFontSize")?.value);
    const nameFontSize = isNaN(nameFontSizeRaw) ? 16 : nameFontSizeRaw;
    const nameSizeStyle = `font-size:${nameFontSize}px;`;
    const avatarSizeRaw = parseFloat(document.getElementById("dlgAvatarSize")?.value);
    const avatarSize = isNaN(avatarSizeRaw) ? 32 : avatarSizeRaw;
    const avatarRadius = document.getElementById("dlgAvatarShape")?.value === "square" ? "22%" : "50%";
    const DLG_FONT = getDialogueFontStyle();
    const nameColor = (useCharColor && c.color) ? `color:${c.color};` : "";
    const quotedText = `${quoteChars.open}${escapeHtml(line.text || "")}${quoteChars.close}`;
    const narrationText = (line.narration || "").trim();

    if (mode === "bubble") {
        const side = c.bubbleSide === "right" ? "right" : "left";
        const padYRaw = parseFloat(document.getElementById("dlgBubblePadY")?.value);
        const padY = isNaN(padYRaw) ? 10 : padYRaw;
        const padXRaw = parseFloat(document.getElementById("dlgBubblePadX")?.value);
        const padX = isNaN(padXRaw) ? 14 : padXRaw;
        const radiusRaw = parseFloat(document.getElementById("dlgBubbleRadius")?.value);
        const radius = isNaN(radiusRaw) ? 18 : radiusRaw;
        const theme = document.getElementById("dlgBubbleTheme")?.value || "soft";
        const opacityRaw = parseFloat(document.getElementById("dlgBubbleOpacity")?.value);
        const opacityPct = isNaN(opacityRaw) ? 100 : Math.min(100, Math.max(0, opacityRaw));

        // 테마 3가지: 말랑(양쪽 다 완전히 둥근 알약 모양) / 꼬리형(말풍선 아래에 작은 삼각형 꼬리가
        // 달린 모양) / 카톡형(프로필이 있는 쪽 모서리 하나만 거의 각지게 만들어서 카카오톡처럼
        // 꼬리가 있는 듯한 느낌).
        let borderRadiusCss;
        if (theme === "soft") {
            borderRadiusCss = "999px";
        } else if (theme === "kakao") {
            const sharp = "4px";
            borderRadiusCss = side === "right"
                ? `${radius}px ${radius}px ${sharp} ${radius}px`
                : `${radius}px ${radius}px ${radius}px ${sharp}`;
        } else if (theme === "tail") {
            // 꼬리형: 글자가 짧아서 말풍선 자체가 작을 때도 뭉개져 보이지 않도록,
            // 모서리를 카톡형만큼 확 깎지 않고 살짝만 깎아서(라운드 유지) 둥근 사각형 느낌을 지킨다.
            const sharp = `${Math.max(6, radius * 0.4)}px`;
            borderRadiusCss = side === "right"
                ? `${radius}px ${radius}px ${sharp} ${radius}px`
                : `${radius}px ${radius}px ${radius}px ${sharp}`;
        } else {
            borderRadiusCss = `${radius}px`;
        }

        const bubbleTextColor = document.getElementById("dlgBubbleTextColor")?.value || "#ffffff";
        const bubbleHex = c.color || "#171717";
        const bubbleRgb = hexToRgb(bubbleHex).replace("rgb(", "").replace(")", "");
        const bubbleBg = `rgba(${bubbleRgb}, ${opacityPct / 100})`;

        // 꼬리형 테마일 때만, 말풍선 모서리에 둥근 물방울 모양 꼬리를 붙인다(아이메시지 느낌).
        // ⚠️ 꼬리를 말풍선 "안쪽 자식"으로 넣으면, 투명도가 있을 때 겹치는 부분이 두 겹으로
        // 칠해져서 그 자리만 유독 진하게 보이는 문제가 있었다. 그래서 꼬리를 말풍선보다 먼저
        // (아래에) 그리고, 말풍선 자체는 그 위에 나중에 그려서 겹치는 부분을 말풍선이 그냥
        // 덮어버리게 했다 — 이러면 겹친 부분도 항상 말풍선 하나 분량의 색만 보이고,
        // 꼬리가 말풍선 밖으로 삐져나온 부분만 꼬리 색이 보여서 이중으로 진해지지 않는다.
        const tailSize = Math.max(9, Math.min(14, radius * 0.7));
        const tailHtml = theme === "tail"
            ? (side === "right"
                ? `<div style="position:absolute;bottom:-1px;right:-1px;width:${tailSize}px;height:${tailSize}px;background-color:${bubbleBg};border-radius:${tailSize}px 0 ${tailSize}px ${tailSize}px;"></div>`
                : `<div style="position:absolute;bottom:-1px;left:-1px;width:${tailSize}px;height:${tailSize}px;background-color:${bubbleBg};border-radius:0 ${tailSize}px ${tailSize}px ${tailSize}px;"></div>`)
            : "";

        const nameHtml = showName ? `<div style="${DLG_FONT}${nameSizeStyle}font-weight:700;${nameColor}margin-bottom:3px;text-align:${side === "right" ? "right" : "left"};">${escapeHtml(c.name)}</div>` : "";
        const narrationHtml = narrationText ? `<div style="${DLG_FONT}margin-top:4px;white-space:pre-wrap;text-align:${side === "right" ? "right" : "left"};opacity:0.7;">${escapeHtml(narrationText)}</div>` : "";
        // 말풍선 자체는 flex로 좌/우 정렬한다. 말풍선 "안쪽" 레이아웃은 텍스트 하나뿐이라
        // 이전에 겪었던 flex+gap 관련 html2canvas 문제와는 무관하다(그건 아바타처럼 서로 다른
        // 두 요소를 나란히 놓을 때 생겼던 문제였음). 그래도 안전하게 태그 사이 공백 없이 한 줄로 만든다.
        const bubbleText = escapeHtml(line.text || "");
        const bubbleHtml = `<div style="display:flex;justify-content:${side === "right" ? "flex-end" : "flex-start"};">`
            + `<div style="position:relative;max-width:78%;">`
            + tailHtml
            + `<div style="position:relative;${DLG_FONT}background-color:${bubbleBg};color:${bubbleTextColor};padding:${padY}px ${padX}px;border-radius:${borderRadiusCss};white-space:pre-wrap;word-break:break-word;box-sizing:border-box;">${bubbleText}</div>`
            + `</div>`
            + `</div>`;

        const bodyHtml = `${nameHtml}${bubbleHtml}${narrationHtml}`;

        // 프사 표시: 왼쪽(상대) 말풍선일 때만 옆에 프사를 보여준다(카톡·아이메시지 등 흔한 채팅 UI 관례).
        // 내 말풍선(오른쪽)엔 보통 프사를 안 보여주므로 여긴 항상 생략한다.
        if (showAvatar && side === "left") {
            const avatarStyle = `flex:0 0 ${avatarSize}px;width:${avatarSize}px;height:${avatarSize}px;border-radius:${avatarRadius};background-color:#f3f3f1;border:1px solid #eaeaea;background-size:cover;background-position:center;box-sizing:border-box;align-self:flex-end;${c.avatarData ? `background-image:url(${c.avatarData});` : ""}`;
            return `<div style="display:flex;align-items:flex-end;gap:8px;"><div style="${avatarStyle}"></div><div style="flex:1 1 auto;min-width:0;">${bodyHtml}</div></div>`;
        }
        return `<div>${bodyHtml}</div>`;
    }

    if (paragraphLayoutOn) {
        const indentRaw = parseFloat(document.getElementById("dlgParagraphIndent")?.value);
        const indentPx = isNaN(indentRaw) ? 16 : indentRaw;
        const colWidthRaw = parseFloat(document.getElementById("dlgNameColumnWidth")?.value);
        const colWidthPx = isNaN(colWidthRaw) ? 88 : colWidthRaw;
        const nameCell = showName ? `<div style="${DLG_FONT}${nameSizeStyle}font-weight:700;${nameColor}">${escapeHtml(c.name)}${nameSuffix}</div>` : "";
        const narrationHtml = narrationText ? `<div style="${DLG_FONT}margin-left:${indentPx}px;margin-top:2px;white-space:pre-wrap;">${escapeHtml(narrationText)}</div>` : "";
        // ⚠️ CSS grid의 gap 속성은 음수를 허용하지 않아(브라우저가 무시함), 마이너스 간격을 넣어도
        // 아무 효과가 없었다. 그래서 grid gap은 0으로 고정하고, 대신 오른쪽 칸에 margin-left로
        // 간격을 주는 방식으로 바꿨다 — margin은 음수도 정상적으로 작동한다.
        return `<div style="display:grid;grid-template-columns:${colWidthPx}px 1fr;gap:0;align-items:start;text-align:inherit;"><div>${nameCell}</div><div style="margin-left:${nameGap}px;"><div style="${DLG_FONT}white-space:pre-wrap;">${quotedText}</div>${narrationHtml}</div></div>`;
    }

    if (mode === "log") {
        const avatarGap = 8;
        const leftOffset = showAvatar ? avatarSize + avatarGap : 0;
        const avatarStyle = `position:absolute;top:0;left:0;width:${avatarSize}px;height:${avatarSize}px;border-radius:${avatarRadius};background-color:#f3f3f1;border:1px solid #eaeaea;background-size:cover;background-position:center;box-sizing:border-box;${c.avatarData ? `background-image:url(${c.avatarData});` : ""}`;
        const avatarHtml = showAvatar ? `<div style="${avatarStyle}"></div>` : "";
        const nameHtml = showName ? `<div style="${DLG_FONT}${nameSizeStyle}font-weight:700;${nameColor}margin-bottom:3px;">${escapeHtml(c.name)}${nameSuffix}</div>` : "";
        const translationHtml = (showTranslation && line.translation) ? `<div style="${DLG_FONT}font-size:14px;white-space:pre-wrap;opacity:0.65;">${escapeHtml(line.translation)}</div>` : "";
        const narrationHtml = narrationText ? `<div style="${DLG_FONT}margin-top:2px;white-space:pre-wrap;">${escapeHtml(narrationText)}</div>` : "";
        const minHeight = showAvatar ? `min-height:${avatarSize}px;` : "";
        return `<div style="position:relative;${minHeight}text-align:inherit;box-sizing:border-box;white-space:normal;">${avatarHtml}<div style="margin-left:${leftOffset}px;white-space:normal;">${nameHtml}<div style="${DLG_FONT}white-space:pre-wrap;">${quotedText}</div>${translationHtml}${narrationHtml}</div></div>`;
    }

    // 기본 블록 모드(단락분리 미사용): 이름 + 대사 한 줄
    const nameHtml = showName ? `<span style="${DLG_FONT}${nameSizeStyle}display:inline-block;font-weight:700;${nameColor}margin-right:${nameGap}px;">${escapeHtml(c.name)}</span>` : "";
    const narrationHtml = narrationText ? `<div style="${DLG_FONT}margin-top:2px;white-space:pre-wrap;">${escapeHtml(narrationText)}</div>` : "";
    return `<div style="text-align:inherit;">${nameHtml}<span style="${DLG_FONT}white-space:pre-wrap;word-break:break-word;">${escapeHtml(line.text || "")}</span></div>${narrationHtml}`;
}

// 편집창 속 대사 블록 하나의 최종 내부 HTML: 위/아래 이동 버튼 + 드래그 손잡이(캔버스에는 안 찍힘) + 실제 대사 내용.
function buildDialogueMarkerInnerHTML(line) {
    const controls = `<div class="dlg-marker-controls" contenteditable="false" style="display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-bottom:4px;user-select:none;">`
        + `<span class="dlg-marker-drag" data-line-id="${line.id}" title="길게 눌러 드래그" style="touch-action:none;cursor:grab;border:1px solid #ddd;background:#fff;border-radius:4px;font-size:13px;line-height:1;padding:3px 8px;color:#888;letter-spacing:1px;">⠿</span>`
        + `<button type="button" onclick="moveDialogueMarker('${line.id}','up')" style="border:1px solid #ddd;background:#fff;border-radius:4px;font-size:11px;line-height:1;padding:3px 7px;color:#888;">▲</button>`
        + `<button type="button" onclick="moveDialogueMarker('${line.id}','down')" style="border:1px solid #ddd;background:#fff;border-radius:4px;font-size:11px;line-height:1;padding:3px 7px;color:#888;">▼</button>`
        + `</div>`;
    return `${controls}<div class="dlg-marker-content">${buildDialogueBlockHTML(line)}</div>`;
}

// ==== 대사 블록 드래그로 순서 바꾸기 ====
// HTML5 draggable API는 모바일 사파리에서 터치로는 아예 작동하지 않기 때문에,
// 포인터 이벤트(마우스·터치 공용)로 직접 드래그를 구현한다.
(function setupDialogueMarkerDrag() {
    let draggingMarker = null;
    let pointerId = null;

    function getEditorTopLevelChildren() {
        return els.editor ? Array.from(els.editor.children) : [];
    }

    function onPointerMove(e) {
        if (!draggingMarker || e.pointerId !== pointerId) return;
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        const children = getEditorTopLevelChildren().filter((el) => el !== draggingMarker);
        let target = null;
        let insertBefore = true;
        for (const child of children) {
            const rect = child.getBoundingClientRect();
            if (y < rect.top || y > rect.bottom) continue;
            target = child;
            insertBefore = y < rect.top + rect.height / 2;
            break;
        }
        if (!target && children.length > 0) {
            // 목록 맨 위/아래 바깥으로 나간 경우, 가장 가까운 쪽 끝으로 취급한다.
            const first = children[0].getBoundingClientRect();
            const last = children[children.length - 1].getBoundingClientRect();
            if (y < first.top) { target = children[0]; insertBefore = true; }
            else if (y > last.bottom) { target = children[children.length - 1]; insertBefore = false; }
        }
        if (target) {
            if (insertBefore) els.editor.insertBefore(draggingMarker, target);
            else els.editor.insertBefore(draggingMarker, target.nextSibling);
        }
    }

    function onPointerUp(e) {
        if (!draggingMarker || e.pointerId !== pointerId) return;
        draggingMarker.style.opacity = "";
        draggingMarker.style.boxShadow = "";
        draggingMarker = null;
        pointerId = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        if (typeof pushHistory === "function") pushHistory(true);
        updateCanvas();
    }

    document.addEventListener("pointerdown", (e) => {
        const handle = e.target.closest(".dlg-marker-drag");
        if (!handle) return;
        const marker = handle.closest(".dlg-editor-marker");
        if (!marker) return;
        e.preventDefault();
        draggingMarker = marker;
        pointerId = e.pointerId;
        marker.style.opacity = "0.5";
        marker.style.boxShadow = "0 0 0 2px #bbb";
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointercancel", onPointerUp);
    });
})();

// ==== 작품명·제작자(A¹/B²) 표시, 미리보기에서 직접 드래그로 세로 위치 옮기기 ====
// 세로 위치가 "직접 지정"일 때만 작동한다. 미리보기가 화면 크기에 맞춰 축소되어 있을 수 있어서
// (applyPreviewScale), 픽셀이 아니라 캔버스 기준 백분율로 계산해야 어느 화면에서도 정확하다.
// ⚠️ 버그 수정: 작품·제작자 배지를 드래그해서 옮겨도, 마우스를 떼는 순간 그 클릭이
// #captureAreaScaleWrapper 의 "탭하면 크게 보기" 클릭 핸들러로도 그대로 전달돼서
// 매번 전체화면 확대 오버레이가 튀어나왔다 — 그래서 "위치 이동이 안 된다"고 느껴졌던 것.
// 배지에서 시작된 클릭(드래그든 단순 탭이든)은 이 플래그로 표시해뒀다가, 확대 오버레이를 여는
// 클릭 핸들러 쪽에서 한 번 소비하고 무시하도록 한다.
window.__infoBadgeInteracting = false;

(function setupInfoDragPositioning() {
    let dragging = false;
    let pointerId = null;

    function clientToPercent(clientX, clientY) {
        const rect = els.captureArea.getBoundingClientRect();
        const padT = parseFloat(els.paddingTop?.value) || 0;
        const padB = parseFloat(els.paddingBottom?.value) || 0;
        const padL = parseFloat(els.paddingLeft?.value) || 0;
        const padR = parseFloat(els.paddingRight?.value) || 0;
        const usableW = Math.max(1, rect.width - padL - padR);
        const usableH = Math.max(1, rect.height - padT - padB);
        const xPct = ((clientX - rect.left - padL) / usableW) * 100;
        const yPct = ((clientY - rect.top - padT) / usableH) * 100;
        return {
            x: Math.min(100, Math.max(0, xPct)),
            // 세로는 화면 맨 아래까지 손가락/마우스를 끌고 가면 100을 넘어 더 내려갈 수 있게 한다.
            y: Math.min(160, Math.max(0, yPct))
        };
    }

    function onPointerMove(e) {
        if (!dragging || e.pointerId !== pointerId) return;
        e.preventDefault();
        const { x, y } = clientToPercent(e.clientX, e.clientY);
        const xInput = document.getElementById("infoPositionX");
        const xSlider = document.getElementById("infoPositionXSlider");
        const yInput = document.getElementById("infoPositionY");
        const ySlider = document.getElementById("infoPositionYSlider");
        if (xInput) xInput.value = String(Math.round(x));
        if (xSlider) xSlider.value = String(Math.round(x));
        if (yInput) yInput.value = String(Math.round(y));
        if (ySlider) ySlider.value = String(Math.round(y));
        const infoContainer = document.getElementById("canvasInfo");
        if (infoContainer) {
            const padT = parseFloat(els.paddingTop?.value) || 0;
            const padB = parseFloat(els.paddingBottom?.value) || 0;
            const padL = parseFloat(els.paddingLeft?.value) || 0;
            const padR = parseFloat(els.paddingRight?.value) || 0;
            infoContainer.style.left = `calc(${padL}px + (100% - ${padL + padR}px) * ${x / 100})`;
            infoContainer.style.top = `calc(${padT}px + (100% - ${padT + padB}px) * ${y / 100})`;
            infoContainer.style.transform = `translate(-${x}%, -50%)`;
        }
    }

    function onPointerUp(e) {
        if (!dragging || e.pointerId !== pointerId) return;
        dragging = false;
        pointerId = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        const infoContainer = document.getElementById("canvasInfo");
        if (infoContainer) infoContainer.style.cursor = "grab";
        updateCanvas();
        // 확대 오버레이 클릭 핸들러가 이 클릭을 한 번 소비할 시간을 준 다음 플래그를 내린다.
        setTimeout(() => { window.__infoBadgeInteracting = false; }, 0);
    }

    document.addEventListener("pointerdown", (e) => {
        const infoContainer = e.target.closest("#canvasInfo");
        if (!infoContainer) return;
        if ((document.getElementById("infoPositionV")?.value || "drag") !== "drag") return;
        e.preventDefault();
        dragging = true;
        pointerId = e.pointerId;
        window.__infoBadgeInteracting = true;
        infoContainer.style.cursor = "grabbing";
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointercancel", onPointerUp);
    });
})();

// "세로 위치" 선택에 따라 슬라이더/안내문구를 보이거나 숨긴다.
(function setupInfoPositionVToggle() {
    const group = document.querySelector('.segmented-control[data-target="infoPositionV"]');
    if (!group) return;
    const syncWith = (val) => {
        const areaY = document.getElementById("infoPositionYArea");
        const areaX = document.getElementById("infoPositionXArea");
        const hint = document.getElementById("infoPositionYHint");
        if (areaY) areaY.style.display = val === "drag" ? "" : "none";
        if (areaX) areaX.style.display = val === "drag" ? "" : "none";
        if (hint) hint.style.display = val === "drag" ? "" : "none";
    };
    // ⚠️ 이 리스너가 세그먼트 버튼 공통 처리(숨은 input 값 갱신)보다 먼저 등록돼서 먼저 실행되기
    // 때문에, 숨은 input 값을 다시 읽지 않고 클릭한 버튼 자신의 data-value를 바로 사용한다.
    group.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => syncWith(b.getAttribute("data-value"))));
    syncWith(document.getElementById("infoPositionV")?.value || "drag");
})();

// "각주 위 구분선 표시" 체크 여부에 따라 구분선 색·굵기 설정을 보이거나 숨긴다.
(function setupFootnoteDividerToggle() {
    const checkbox = document.getElementById("footnoteDividerShow");
    if (!checkbox) return;
    const sync = () => {
        const on = checkbox.checked;
        const colorArea = document.getElementById("footnoteDividerColorArea");
        const widthArea = document.getElementById("footnoteDividerWidthArea");
        if (colorArea) colorArea.style.display = on ? "" : "none";
        if (widthArea) widthArea.style.display = on ? "" : "none";
    };
    checkbox.addEventListener("change", sync);
    sync();
})();

// "대사 추가"를 누르면, 그 대사가 본문(편집창)에도 바로 보이도록 편집창 맨 끝에 실제 대사 블록을 넣는다.
// 이 블록은 contenteditable=false라서 본문 글자로는 타이핑이 안 되고(실수로 안에 글자가 섞이는 걸 방지),
// 사용자는 이 블록 위/아래에 자유롭게 줄글을 이어서 쓸 수 있다. 캔버스는 이제 이 본문 내용을 그대로
// 옮겨서 그리기 때문에, 이 블록이 곧 실제로 저장되는 대사 모양이다(더 이상 미리보기 전용이 아님).
function insertDialogueMarkerIntoEditor(line) {
    if (!els.editor) return;
    const marker = document.createElement("div");
    marker.className = "dlg-editor-marker";
    marker.dataset.lineId = line.id;
    marker.contentEditable = "false";
    marker.style.cssText = "";
    marker.innerHTML = buildDialogueMarkerInnerHTML(line);
    els.editor.appendChild(marker);
    // 마커는 contenteditable=false라서 탭으로 바로 뒤에 커서를 놓기 어렵다. 그래서 빈 줄을 하나 더
    // 붙여서 바로 이어서 지문(나레이션)을 입력할 수 있게 하고, 커서도 거기로 옮겨준다.
    const trailing = document.createElement("div");
    trailing.appendChild(document.createElement("br"));
    els.editor.appendChild(trailing);
    const range = document.createRange();
    range.setStart(trailing, 0);
    range.collapse(true);
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
    els.editor.focus();
    trailing.scrollIntoView({ block: "center", behavior: "smooth" });
    // 모바일 사파리는 가끔 이 시점에 focus를 줘도 키보드가 안 뜨는 경우가 있어서,
    // 다음 프레임에 한 번 더 확실히 포커스·커서 위치를 재적용한다.
    requestAnimationFrame(() => {
        els.editor.focus();
        const selection2 = window.getSelection();
        if (selection2) {
            const range2 = document.createRange();
            range2.setStart(trailing, 0);
            range2.collapse(true);
            selection2.removeAllRanges();
            selection2.addRange(range2);
        }
    });
    if (typeof pushHistory === "function") pushHistory(true);
}

// 편집창에서 대사 블록 위/아래로 자리를 옮긴다. 바로 위·아래에 있는 것(나레이션 문단이든 다른 대사
// 블록이든)과 순서를 맞바꾸는 방식이라, 원하는 위치에 자유롭게 끼워넣을 수 있다.
function moveDialogueMarker(lineId, direction) {
    if (!els.editor) return;
    const marker = els.editor.querySelector(`.dlg-editor-marker[data-line-id="${lineId}"]`);
    if (!marker) return;
    const sibling = direction === "up" ? marker.previousElementSibling : marker.nextElementSibling;
    if (!sibling) return; // 이미 맨 위/맨 아래라 더 옮길 데가 없음
    if (direction === "up") {
        els.editor.insertBefore(marker, sibling);
    } else {
        els.editor.insertBefore(sibling, marker);
    }
    if (typeof pushHistory === "function") pushHistory(true);
    updateCanvas();
}
window.moveDialogueMarker = moveDialogueMarker;

function updateDialogueMarkerInEditor(line) {
    if (!els.editor) return;
    const marker = els.editor.querySelector(`.dlg-editor-marker[data-line-id="${line.id}"]`);
    if (marker) marker.innerHTML = buildDialogueMarkerInnerHTML(line);
}

// 편집창에 이미 들어있는 모든 대사 블록을, 현재 설정(이름표시/따옴표/색상/폰트 등)에 맞춰 다시 그린다.
// 설정을 바꿀 때마다 일일이 리스너를 걸지 않고, updateCanvas가 실행될 때마다 항상 이걸 먼저 불러서
// 편집창 속 블록 모양이 캔버스와 항상 똑같이 최신 상태로 유지되게 한다.
function refreshAllDialogueMarkers() {
    if (!els.editor) return;
    els.editor.querySelectorAll(".dlg-editor-marker").forEach((marker) => {
        const line = dialogueLines.find((l) => l.id === marker.dataset.lineId);
        if (line) marker.innerHTML = buildDialogueMarkerInnerHTML(line);
        else marker.remove(); // 삭제된 대사인데 편집창에 블록이 남아있으면 정리
    });
}

// 새로고침 등으로 "대사 목록"엔 있는데 편집창엔 블록이 없는 대사가 생기면, 맨 끝에 자동으로 채워 넣는다.
function ensureAllDialogueMarkersExist() {
    if (!els.editor) return;
    dialogueLines.forEach((line) => {
        if (!els.editor.querySelector(`.dlg-editor-marker[data-line-id="${line.id}"]`)) {
            insertDialogueMarkerIntoEditor(line);
        }
    });
}

function deleteDialogueLine(lineId) {
    dialogueLines = dialogueLines.filter((l) => l.id !== lineId);
    saveDialogueLinesToStorage();
    renderDialogueLineList();
    const marker = els.editor ? els.editor.querySelector(`.dlg-editor-marker[data-line-id="${lineId}"]`) : null;
    if (marker) marker.remove();
    updateCanvas();
}

function renderDialogueLineList() {
    const container = document.getElementById("dialogueLineList");
    if (!container) return;
    container.innerHTML = "";

    const mode = document.getElementById("dialogueMode")?.value || "log";

    if (dialogueLines.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "text-align:center;font-size:12px;color:var(--text-muted);padding:12px 0;";
        empty.textContent = "위 캐릭터의 \"대사 추가\"를 눌러 시작하세요.";
        container.appendChild(empty);
        return;
    }

    dialogueLines.forEach((line) => {
        const c = characters.find((x) => x.id === line.charId);
        const cell = document.createElement("div");
        cell.className = "dialogue-line-cell";
        if (c && c.color) cell.style.borderLeft = `3px solid ${c.color}`;

        const header = document.createElement("div");
        header.className = "dlc-header";

        const nameGroup = document.createElement("div");
        nameGroup.className = "dlc-name-group";

        const avatarThumb = document.createElement("div");
        avatarThumb.className = "dlc-avatar-thumb";
        if (c && c.avatarData) avatarThumb.style.backgroundImage = `url(${c.avatarData})`;
        nameGroup.appendChild(avatarThumb);

        const nameSpan = document.createElement("span");
        nameSpan.className = "dlc-speaker-name";
        nameSpan.textContent = c ? c.name : "(삭제된 캐릭터)";
        if (c && c.color) nameSpan.style.color = c.color;
        nameGroup.appendChild(nameSpan);

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "dlc-delete";
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", () => deleteDialogueLine(line.id));

        header.appendChild(nameGroup);
        header.appendChild(delBtn);
        cell.appendChild(header);

        const textArea = document.createElement("textarea");
        textArea.className = "dlc-text";
        textArea.placeholder = mode === "log" ? "원문 대사를 입력하세요" : "대사를 입력하세요";
        textArea.value = line.text || "";
        textArea.addEventListener("input", () => {
            line.text = textArea.value;
            saveDialogueLinesToStorage();
            updateDialogueMarkerInEditor(line);
            updateCanvas();
        });
        cell.appendChild(textArea);

        const nameToggleRow = document.createElement("label");
        nameToggleRow.style.cssText = "display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);margin-top:6px;user-select:none;";
        const nameToggleCheckbox = document.createElement("input");
        nameToggleCheckbox.type = "checkbox";
        nameToggleCheckbox.checked = line.showName !== false;
        nameToggleCheckbox.addEventListener("change", () => {
            line.showName = nameToggleCheckbox.checked;
            saveDialogueLinesToStorage();
            updateDialogueMarkerInEditor(line);
            updateCanvas();
        });
        nameToggleRow.appendChild(nameToggleCheckbox);
        nameToggleRow.appendChild(document.createTextNode("이 대사에 이름 표시"));
        cell.appendChild(nameToggleRow);

        if (mode === "log" && document.getElementById("dlgShowTranslation")?.checked !== false) {
            const transArea = document.createElement("textarea");
            transArea.className = "dlc-translation";
            transArea.placeholder = "번역 (선택)";
            transArea.value = line.translation || "";
            transArea.addEventListener("input", () => {
                line.translation = transArea.value;
                saveDialogueLinesToStorage();
                updateCanvas();
            });
            cell.appendChild(transArea);
        }

        if (mode === "block" && document.getElementById("dlgParagraphLayout")?.checked) {
            const narrationArea = document.createElement("textarea");
            narrationArea.className = "dlc-translation";
            narrationArea.placeholder = "줄글 (선택)";
            narrationArea.value = line.narration || "";
            narrationArea.addEventListener("input", () => {
                line.narration = narrationArea.value;
                saveDialogueLinesToStorage();
                updateCanvas();
            });
            cell.appendChild(narrationArea);
        }

        container.appendChild(cell);
    });
}

// 대사 목록을 "같은 인물이 연속으로 말하는 묶음" 단위로 나눈다.
// (모코 사이트의 로그 continuation 묶음 처리와 동일한 방식)
function groupDialogueLinesByRun(lines) {
    const runs = [];
    let cur = null;
    lines.forEach((line) => {
        if (cur && cur.charId === line.charId) {
            cur.lines.push(line);
        } else {
            cur = { charId: line.charId, lines: [line] };
            runs.push(cur);
        }
    });
    return runs;
}

// 화자 · 줄글 단락 분리 레이아웃: 왼쪽엔 화자 이름, 오른쪽엔 그 화자의 대사(들)를 먼저 이어 붙이고
// 그 아래에 "대사 목록"에서 각 줄마다 직접 입력한 줄글(나레이션)을 이어서 들여쓰기로 붙여서 보여준다.
// (본문 편집기 문단과 순서로 짝짓지 않고, 대사 항목 자체에 딸린 줄글 입력칸을 사용한다.)
// ⚠️ #canvasTextWrapper 전체에 white-space:pre-wrap이 걸려 있어서, 여기서 만드는 HTML 문자열은
// 절대 보기 좋게 줄바꿈/들여쓰기하지 않고 항상 태그 사이 공백 없는 한 줄로 이어 붙인다.
// 대사 영역 글자 스타일: "폰트" 탭에서 사용자가 설정한 폰트 크기·자간·행간을 그대로 따라가게 한다.
// (이전엔 대사만 항상 고정 크기로 보이게 일부러 하드코딩했었는데, 이제는 본문과 똑같이 커스텀 폰트
//  설정이 적용되도록 매번 현재 설정값을 읽어서 만든다. font-family는 #canvasTextWrapper에서 이미
//  상속되니 여기서 따로 지정하지 않는다.)
function getDialogueFontStyle() {
    const fontSize = parseFloat(document.getElementById("fontSize")?.value) || 16;
    const letterSpacing = parseFloat(document.getElementById("letterSpacing")?.value) || 0;
    const lineHeightRaw = parseFloat(document.getElementById("lineHeight")?.value);
    const lineHeight = isNaN(lineHeightRaw) ? Math.round(fontSize * 1.6) : lineHeightRaw;
    return `font-size:${fontSize}px;line-height:${lineHeight}px;letter-spacing:${letterSpacing}px;`;
}

onClick("btnAddCharacter", () => openCharacterEditor(null));
onClick("btnCancelCharacterEdit", closeCharacterEditor);

onClick("btnSaveCharacter", () => {
    const nameInput = document.getElementById("charEditorName");
    if (!nameInput) return;

    const name = nameInput.value.trim() || "이름 없음";
    const existing = editingCharacterId ? characters.find((x) => x.id === editingCharacterId) : null;
    const avatarData = pendingCharAvatarData !== null ? pendingCharAvatarData : (existing ? existing.avatarData : null);
    const color = document.getElementById("charEditorColor")?.value || "#171717";
    const bubbleSide = document.getElementById("charEditorBubbleSide")?.value || "left";

    if (existing) {
        existing.name = name;
        existing.avatarData = avatarData;
        existing.color = color;
        existing.bubbleSide = bubbleSide;
        updateExistingDialogueNames(existing.id);
    } else {
        characters.push({ id: uid(), name, avatarData, color, bubbleSide });
    }

    renderCharacterList();
    closeCharacterEditor();
    saveCharactersToStorage();
    updateCanvas();
    pushHistory(true);
});

onClick("btnDeleteCharacter", () => {
    if (!editingCharacterId) return;
    if (!window.confirm("이 캐릭터를 삭제할까요? 이미 넣은 대사는 그대로 남아요.")) return;
    characters = characters.filter((c) => c.id !== editingCharacterId);
    renderCharacterList();
    closeCharacterEditor();
    saveCharactersToStorage();
});

const charEditorAvatarEl = document.getElementById("charEditorAvatar");
if (charEditorAvatarEl) {
    charEditorAvatarEl.addEventListener("click", () => {
        const input = document.getElementById("charAvatarInput");
        if (input) {
            input.value = "";
            input.click();
        }
    });
}

const charAvatarInputEl = document.getElementById("charAvatarInput");
if (charAvatarInputEl) {
    charAvatarInputEl.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            pendingCharAvatarData = ev.target.result;
            const avatarBox = document.getElementById("charEditorAvatar");
            if (avatarBox) {
                avatarBox.style.backgroundImage = `url(${ev.target.result})`;
                avatarBox.dataset.hasImage = "true";
            }
        };
        reader.readAsDataURL(file);
    });
}

loadCharactersFromStorage();
renderCharacterList();
loadDialogueLinesFromStorage();
renderDialogueLineList();
loadReplacementRulesFromStorage();
renderReplacementRuleList();
loadFootnotesFromStorage();
renderFootnoteList();

onClick("btnClearAll", () => {
    if (!els.editor) return;
    const hasContent = els.editor.textContent.trim().length > 0 || els.editor.querySelector(".editor-image-block, .template-block");
    if (hasContent && !window.confirm("본문 내용을 전부 지울까요? 되돌릴 수 없어요.")) return;
    els.editor.innerHTML = "";
    updateCanvas();
    pushHistory(true);
    showToast("본문을 전체 삭제했어요.");
});

// ==== 실행취소 / 다시실행 ====
let editorHistory = [];
let historyIndex = -1;
let historyPushTimer = null;

function updateHistoryButtons() {
    const undoBtn = document.getElementById("btnUndo");
    const redoBtn = document.getElementById("btnRedo");
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= editorHistory.length - 1;
}

function pushHistory(immediate) {
    if (!els.editor) return;
    const commit = () => {
        const html = els.editor.innerHTML;
        if (editorHistory[historyIndex] === html) return;
        editorHistory = editorHistory.slice(0, historyIndex + 1);
        editorHistory.push(html);
        if (editorHistory.length > 60) editorHistory.shift();
        historyIndex = editorHistory.length - 1;
        updateHistoryButtons();
    };
    clearTimeout(historyPushTimer);
    if (immediate) commit();
    else historyPushTimer = setTimeout(commit, 500);
}

function undoEdit() {
    if (historyIndex <= 0) return;
    historyIndex--;
    els.editor.innerHTML = editorHistory[historyIndex];
    updateCanvas();
    updateHistoryButtons();
}

function redoEdit() {
    if (historyIndex >= editorHistory.length - 1) return;
    historyIndex++;
    els.editor.innerHTML = editorHistory[historyIndex];
    updateCanvas();
    updateHistoryButtons();
}

onClick("btnUndo", undoEdit);
onClick("btnRedo", redoEdit);

els.editor.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const node = selection.anchorNode;
        const el = node.nodeType === 3 ? node.parentNode : node;

        const currentField = el.closest ? el.closest(".tpl-field") : null;
        if (currentField) {
            // 여러 줄이 필요한 칸(본문, 대사 등)은 줄바꿈만 넣고 칸 밖으로 나가지 않게 함
            if (currentField.classList.contains("tpl-multiline")) {
                e.preventDefault();
                document.execCommand("insertLineBreak");
                return;
            }
            const templateBlock = currentField.closest(".template-block");
            if (templateBlock) {
                const fields = Array.from(templateBlock.querySelectorAll(".tpl-field"));
                const idx = fields.indexOf(currentField);
                const nextField = fields[idx + 1];
                e.preventDefault();
                if (nextField) {
                    const range = document.createRange();
                    range.selectNodeContents(nextField);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    nextField.scrollIntoView({ block: "center", behavior: "smooth" });
                } else {
                    document.execCommand("insertLineBreak");
                }
                return;
            }
        }

        // 칸(tpl-field) 밖이라도 템플릿 블록 내부라면, 기본 Enter 동작이 구조를 쪼개 형식을
        // 무너뜨리지 않도록 줄바꿈만 삽입한다.
        const insideTemplate = el.closest ? el.closest(".template-block") : null;
        if (insideTemplate) {
            e.preventDefault();
            document.execCommand("insertLineBreak");
            return;
        }

        const inDialogue = el.closest(".dialogue-line, .box-quote");
        if (inDialogue) { e.preventDefault(); document.execCommand("insertLineBreak"); }
    }
});

// ==== 토스트 알림 ====
let toastTimer = null;
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) { alert(message); return; }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ==== 바텀시트 열기/닫기 (탭 클릭, 사진 선택, 프리셋 버튼에서 공통으로 사용) ====
function openSheetPanel(panelId) {
    const subWindow = document.querySelector(".adaptive-settings-window");
    const overlay = document.getElementById("sheetOverlay");
    const targetPanel = document.getElementById(panelId);
    if (!subWindow || !targetPanel) return;

    els.tabs.forEach((t) => t.classList.toggle("active", t.getAttribute("data-target") === panelId));
    els.panels.forEach((p) => p.classList.toggle("active", p.id === panelId));
    subWindow.classList.add("active");
    if (overlay) overlay.classList.add("active");
}

function closeSheetPanel() {
    const subWindow = document.querySelector(".adaptive-settings-window");
    const overlay = document.getElementById("sheetOverlay");
    els.tabs.forEach((t) => t.classList.remove("active"));
    els.panels.forEach((p) => p.classList.remove("active"));
    if (subWindow) subWindow.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
    els.tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const targetId = tab.getAttribute("data-target");
            if (tab.classList.contains("active")) {
                closeSheetPanel();
            } else {
                openSheetPanel(targetId);
            }
        });
    });

    const sheetOverlay = document.getElementById("sheetOverlay");
    if (sheetOverlay) sheetOverlay.addEventListener("click", closeSheetPanel);

    const btnCloseSheet = document.getElementById("btnCloseSheet");
    if (btnCloseSheet) btnCloseSheet.addEventListener("click", closeSheetPanel);

    const btnOpenPresets = document.getElementById("btnOpenPresets");
    if (btnOpenPresets) {
        btnOpenPresets.addEventListener("click", () => {
            const isOpen = document.getElementById("panel-presets")?.classList.contains("active");
            if (isOpen) closeSheetPanel();
            else openSheetPanel("panel-presets");
        });
    }

    // ==== 본문 글자 수 표시 ====
    const editorMeta = document.getElementById("editorMeta");
    if (editorMeta && els.editor) {
        const refreshEditorMeta = () => {
            const len = (els.editor.innerText || "").replace(/\n/g, "").length;
            editorMeta.textContent = `${len}자`;
        };
        els.editor.addEventListener("input", refreshEditorMeta);
        refreshEditorMeta();
    }

    document.querySelectorAll(".segmented-control button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const parent = btn.parentElement;
            parent.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const hiddenInput = document.getElementById(parent.getAttribute("data-target"));
            if (hiddenInput) { hiddenInput.value = btn.getAttribute("data-value"); updateCanvas(); }
        });
    });

    document.querySelectorAll('input[name="gradMode"]').forEach((radio) => {
        radio.addEventListener("change", () => updateCanvas());
    });

    els.ratioSelect.addEventListener("change", () => {
        const customArea = document.getElementById("customWidthArea");
        const customHint = document.getElementById("customWidthHint");
        const isFree = els.ratioSelect.value === "free";
        if (customArea) customArea.style.display = isFree ? "flex" : "none";
        if (customHint) customHint.style.display = isFree ? "block" : "none";
        updateCanvas();
    });

    els.editor.addEventListener("input", () => {
        if (typeof currentImageBlock !== "undefined" && currentImageBlock && !els.editor.contains(currentImageBlock)) {
            deselectImageBlock();
        }
        updateCanvas();
        pushHistory();
    });
    pushHistory(true);
    if (typeof renderPresets === "function") renderPresets();

    if (els.columnToggle) {
        const toggleColumnRows = () => {
            const show = els.columnToggle.checked ? "flex" : "none";
            const splitArea = document.getElementById("columnSplitArea");
            const gapArea = document.getElementById("columnGapArea");
            if (splitArea) splitArea.style.display = show;
            if (gapArea) gapArea.style.display = show;
        };
        toggleColumnRows();
        els.columnToggle.addEventListener("change", () => {
            toggleColumnRows();
            updateCanvas();
        });
    }

    if (els.fadeToggle) {
        const toggleFadeRow = () => {
            const fadeStartArea = document.getElementById("fadeStartArea");
            if (fadeStartArea) fadeStartArea.style.display = els.fadeToggle.checked ? "flex" : "none";
        };
        toggleFadeRow();
        els.fadeToggle.addEventListener("change", () => {
            toggleFadeRow();
            updateCanvas();
        });
    }

    if (els.indentToggle) {
        els.indentToggle.addEventListener("change", () => updateCanvas());
    }

    // 대사 탭: 로그/블록 모드 전환 시 관련 설정 행 보이기/숨기기
    const dialogueModeGroup = document.querySelector('.segmented-control[data-target="dialogueMode"]');
    if (dialogueModeGroup) {
        dialogueModeGroup.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", syncDialogueModeUI);
        });
        syncDialogueModeUI();
    }

    // 대사 탭: 프사 표시 여부에 따라 모양/크기 설정 행 보이기/숨기기
    if (els.dlgShowAvatar) {
        syncAvatarSettingUI();
        els.dlgShowAvatar.addEventListener("change", syncAvatarSettingUI);
    }

    // 대사 탭: 화자·줄글 단락 분리 체크박스가 바뀌면 하위 설정 보이기/숨기기 + 다시 그리기
    const dlgParagraphLayoutEl = document.getElementById("dlgParagraphLayout");
    if (dlgParagraphLayoutEl) {
        syncParagraphLayoutUI();
        dlgParagraphLayoutEl.addEventListener("change", () => {
            syncParagraphLayoutUI();
            updateCanvas();
        });
    }

    // 대사 탭: 번역 표시 여부가 바뀌면 목록 셀도 다시 그림
    const dlgShowTranslationEl = document.getElementById("dlgShowTranslation");
    if (dlgShowTranslationEl) {
        dlgShowTranslationEl.addEventListener("change", () => renderDialogueLineList());
    }
    if (els.dlgShowName) {
        els.dlgShowName.addEventListener("change", () => updateCanvas());
    }

    // 제목/글자크기 등을 빠르게 여러 번 건드릴 때(타이핑, 슬라이더 드래그)
    // updateCanvas()가 매 입력마다 동기적으로 강제 레이아웃을 발생시켜서
    // 캔버스가 순간적으로 흔들리거나 깨져 보이는 것처럼 느껴지는 문제가 있었다.
    // 짧은 시간 안에 여러 번 호출되면 화면이 그려지기 직전(rAF) 한 번으로 묶는다.
    let _updateCanvasRAF = null;
    function scheduleUpdateCanvas() {
        if (_updateCanvasRAF) return;
        _updateCanvasRAF = requestAnimationFrame(() => {
            _updateCanvasRAF = null;
            updateCanvas();
        });
    }

    const autoTriggers = [
        els.titleInput, els.creatorInput, els.canvasWidth, els.paddingTop, els.paddingBottom, els.paddingLeft, els.paddingRight,
        els.bgType, els.bgColor1, els.gradColor1, els.gradColor2, els.gradColor3, els.gradientDir,
        els.globalTextColor, els.subTextColor, els.hlColorA, els.hlColorB, els.hlColorC,
        els.quoteLineColor, els.enableQuoteColor, els.quoteColor, els.enableParenColor, els.parenColor,
        els.boxQuoteColor, els.boxQuoteWidth, els.dividerColor, document.getElementById("dividerWidth"), document.getElementById("dividerStyle"), els.fadeCount, els.indentSize,
        els.fontSelect, els.fontWeightSelect, els.wordBreak, els.fontSize, els.letterSpacing, els.lineHeight,
        els.paraSpacing, els.fontScaleX, els.infoFontSize,
        els.columnSplitIndex, els.columnGap, els.textVerticalAlign, els.textHorizontalAnchor, els.textBlockWidth,
        els.headingTitleInput, els.headingSubtitleInput,
        els.headingTitleFont, els.headingTitleSize, els.headingTitleBold, document.getElementById("headingTitleColor"),
        els.headingSubtitleFont, els.headingSubtitleSize, els.headingSubtitleBold, document.getElementById("headingSubtitleColor"),
        els.dlgNameSuffix, els.dlgQuoteStyle, els.dlgShowTranslation, els.dlgShowAvatar, els.dlgShowName,
        els.dlgAvatarSize, els.dlgUseCharColor, els.dlgLineGap, els.dlgContinuationGap,
        els.dlgNameGap,
        document.getElementById("dlgParagraphIndent"), document.getElementById("dlgNameColumnWidth"),
        document.getElementById("footnoteColor"), document.getElementById("footnoteDividerShow"),
        document.getElementById("footnoteDividerColor"), document.getElementById("footnoteDividerWidth")
    ];
    autoTriggers.forEach((el) => {
        if (el) { el.addEventListener("input", scheduleUpdateCanvas); el.addEventListener("change", scheduleUpdateCanvas); }
    });

    // 최초 렌더링. 페이지가 열리자마자 한 번 그리고,
    updateCanvas();

    // ⚠️ 핵심 버그 수정: 구글 폰트/커스텀 폰트(woff2)는 네트워크로 늦게 로드되는데,
    // 폰트가 다 로드되기 "전"에 measure된 글자 폭으로 줄바꿈이 정해지면
    // 나중에 폰트가 실제로 적용될 때 글자 너비가 바뀌면서 줄바꿈 위치가
    // 달라져 버린다(=1번처럼 나와야 할 게 2번처럼 흐트러짐).
    // 이전에는 이걸 "50ms 뒤에 한 번 더 그리기"로 땜질했는데, 폰트 로딩이
    // 그보다 오래 걸리는 네트워크(특히 최초 접속/캐시 없는 경우)에서는
    // 여전히 늦게 도착한 폰트가 반영이 안 됐다.
    // → 모든 폰트가 실제로 로드 완료된 시점(document.fonts.ready)에
    //   반드시 한 번 더 다시 그리도록 고쳐서, 폰트 로딩 속도와 무관하게
    //   항상 최종 폰트 기준으로 줄바꿈/비율이 계산되게 함.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => updateCanvas()).catch(() => {});
    }
    // 혹시 모를 브라우저 호환성/예외 상황을 위한 이중 안전망
    setTimeout(() => updateCanvas(), 300);
    setTimeout(() => updateCanvas(), 1200);
});

document.getElementById("btnCopy").addEventListener("click", async () => {
    if (!els.captureArea) return;
    const originalHeight = els.captureArea.style.height;
    const originalOverflow = els.captureArea.style.overflow;
    const originalTransform = els.captureArea.style.transform;
    els.captureArea.style.transform = "none";
    if (els.ratioSelect.value === "free") {
        els.captureArea.style.height = els.captureArea.scrollHeight + "px";
    }
    els.captureArea.style.overflow = "visible";
    prepareCanvasForCapture(els.captureArea);
    await bakeBackgroundBlurForCapture();
    html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 })
        .then((canvas) => {
            restoreCanvasAfterCapture(els.captureArea);
            restoreBackgroundBlurAfterCapture();
            els.captureArea.style.height = originalHeight;
            els.captureArea.style.overflow = originalOverflow;
            els.captureArea.style.transform = originalTransform;
            applyPreviewScale();
            canvas.toBlob((blob) => {
                if (!blob) { showToast("이미지 변환에 실패했어요."); return; }
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item])
                    .then(() => showToast("클립보드에 복사됐어요"))
                    .catch(() => showToast("복사가 막혀 있어요 — 저장 버튼을 이용해 주세요."));
            }, "image/png");
        })
        .catch(() => {
            restoreCanvasAfterCapture(els.captureArea);
            restoreBackgroundBlurAfterCapture();
            els.captureArea.style.height = originalHeight;
            els.captureArea.style.overflow = originalOverflow;
            els.captureArea.style.transform = originalTransform;
            applyPreviewScale();
        });
});

document.getElementById("btnSave").addEventListener("click", async () => {
    if (!els.captureArea) return;
    const originalHeight = els.captureArea.style.height;
    const originalOverflow = els.captureArea.style.overflow;
    const originalTransform = els.captureArea.style.transform;
    els.captureArea.style.transform = "none";
    if (els.ratioSelect.value === "free") {
        els.captureArea.style.height = els.captureArea.scrollHeight + "px";
    }
    els.captureArea.style.overflow = "visible";
    prepareCanvasForCapture(els.captureArea);
    await bakeBackgroundBlurForCapture();
    html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 })
        .then((canvas) => {
            restoreCanvasAfterCapture(els.captureArea);
            restoreBackgroundBlurAfterCapture();
            els.captureArea.style.height = originalHeight;
            els.captureArea.style.overflow = originalOverflow;
            els.captureArea.style.transform = originalTransform;
            applyPreviewScale();
            canvas.toBlob((blob) => {
                if (!blob) { showToast("이미지 변환에 실패했어요."); return; }
                const blobURL = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobURL;
                link.download = `excerpt_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobURL), 1000);
            }, "image/png");
        })
        .catch(() => {
            restoreCanvasAfterCapture(els.captureArea);
            restoreBackgroundBlurAfterCapture();
            els.captureArea.style.height = originalHeight;
            els.captureArea.style.overflow = originalOverflow;
            els.captureArea.style.transform = originalTransform;
            applyPreviewScale();
        });
});

// ==== 여러 장 한번에 저장 (가로선 기준으로 카드 분할) ====
function captureCanvasAsPNG(filename) {
    return new Promise((resolve) => {
        if (!els.captureArea) { resolve(); return; }
        const originalHeight = els.captureArea.style.height;
        const originalOverflow = els.captureArea.style.overflow;
        const originalTransform = els.captureArea.style.transform;
        els.captureArea.style.transform = "none";
        if (els.ratioSelect.value === "free") {
            els.captureArea.style.height = els.captureArea.scrollHeight + "px";
        }
        els.captureArea.style.overflow = "visible";
        prepareCanvasForCapture(els.captureArea);
        bakeBackgroundBlurForCapture().then(() => {
        html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 })
            .then((canvas) => {
                restoreCanvasAfterCapture(els.captureArea);
                restoreBackgroundBlurAfterCapture();
                els.captureArea.style.height = originalHeight;
                els.captureArea.style.overflow = originalOverflow;
                els.captureArea.style.transform = originalTransform;
                applyPreviewScale();
                canvas.toBlob((blob) => {
                    if (blob) {
                        const blobURL = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = blobURL;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(blobURL), 1000);
                    }
                    resolve();
                }, "image/png");
            })
            .catch(() => {
                restoreCanvasAfterCapture(els.captureArea);
                restoreBackgroundBlurAfterCapture();
                els.captureArea.style.height = originalHeight;
                els.captureArea.style.overflow = originalOverflow;
                els.captureArea.style.transform = originalTransform;
                applyPreviewScale();
                resolve();
            });
        });
    });
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

onClick("btnExportMulti", async () => {
    if (!els.editor) return;
    const originalHTML = els.editor.innerHTML;

    // 가로선이 문단 중간에 삽입돼 있어도(최상위가 아니어도) 정확히 찾도록
    // 캔버스 렌더링과 동일한 평탄화 로직을 거쳐서 최상위 블록 목록을 얻는다.
    const flatContainer = document.createElement("div");
    flatContainer.innerHTML = originalHTML;
    normalizeParagraphs(flatContainer);

    const groups = [[]];
    Array.from(flatContainer.childNodes).forEach((node) => {
        if (node.nodeType === 1 && node.classList && node.classList.contains("hr-divider")) {
            groups.push([]);
        } else {
            groups[groups.length - 1].push(node);
        }
    });
    const nonEmptyGroups = groups.filter((g) =>
        g.some((n) => (n.textContent || "").trim().length > 0 || (n.nodeType === 1 && n.querySelector && n.querySelector(".editor-image-block, .template-block")))
    );

    if (nonEmptyGroups.length < 2) {
        showToast("가로선으로 나눌 지점을 먼저 표시해 주세요.");
        return;
    }

    showToast(`${nonEmptyGroups.length}장을 순서대로 저장할게요.`);

    for (let i = 0; i < nonEmptyGroups.length; i++) {
        const wrapper = document.createElement("div");
        nonEmptyGroups[i].forEach((n) => wrapper.appendChild(n.cloneNode(true)));
        els.editor.innerHTML = wrapper.innerHTML || "<div><br></div>";
        updateCanvas();
        await wait(80);
        await captureCanvasAsPNG(`excerpt_${i + 1}.png`);
        await wait(350);
    }

    els.editor.innerHTML = originalHTML;
    updateCanvas();
    showToast("전체 저장이 끝났어요.");
});

document.getElementById("bgImageInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById("bgImageLayer").style.backgroundImage = `url(${event.target.result})`;
            updateBgImageStyles();
        };
        reader.readAsDataURL(file);
    }
});

function updateBgImageStyles() {
    const bgLayer = document.getElementById("bgImageLayer");
    const overlayLayer = document.getElementById("bgOverlayLayer");
    bgLayer.style.backgroundSize = `${document.getElementById("bgImageSize").value}%`;
    bgLayer.style.backgroundPosition = `${document.getElementById("bgImageX").value}% ${document.getElementById("bgImageY").value}%`;
    bgLayer.style.filter = `blur(${document.getElementById("bgImageBlur").value}px)`;
    const colorHex = document.getElementById("bgOverlayColor").value;
    const colorRgb = hexToRgb(colorHex).replace("rgb(", "").replace(")", "");
    const opacity = document.getElementById("bgOverlayOpacity").value;
    overlayLayer.style.backgroundColor = `rgba(${colorRgb}, ${opacity})`;
}

["bgImageSize", "bgImageX", "bgImageY", "bgImageBlur", "bgOverlayColor", "bgOverlayOpacity"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateBgImageStyles);
});

document.getElementById("textEditor").addEventListener("paste", function (e) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
});

function normalizeParagraphs(container) {
    const paragraphs = [];
    const paragraphAligns = [];
    const paragraphIndents = [];
    let currentParagraphNodes = [];
    let currentAlign = null;
    let currentIndent = false;

    function flushParagraph() {
        if (currentParagraphNodes.length > 0) {
            paragraphs.push(currentParagraphNodes);
            paragraphAligns.push(currentAlign);
            paragraphIndents.push(currentIndent);
            currentParagraphNodes = [];
        }
    }

    function parseNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            currentParagraphNodes.push(node.cloneNode(true));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName;
            if (tagName === "BR") {
                if (currentParagraphNodes.length > 0) flushParagraph();
                else { paragraphs.push([]); paragraphAligns.push(currentAlign); paragraphIndents.push(currentIndent); }
            } else if (node.classList.contains("dialogue-line")) {
                flushParagraph();
                paragraphs.push(node.cloneNode(true));
                paragraphAligns.push(node.style.textAlign || null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (node.classList.contains("box-quote")) {
                flushParagraph();
                paragraphs.push(node.cloneNode(true));
                paragraphAligns.push(node.style.textAlign || null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (node.classList.contains("hr-divider")) {
                flushParagraph();
                paragraphs.push(node.cloneNode(true));
                paragraphAligns.push(null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (node.classList.contains("template-block")) {
                flushParagraph();
                paragraphs.push(node.cloneNode(true));
                paragraphAligns.push(null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (node.classList.contains("editor-image-block")) {
                flushParagraph();
                const imgClone = node.cloneNode(true);
                imgClone.classList.remove("selected");
                imgClone.querySelectorAll(".no-export").forEach((el) => el.remove());
                paragraphs.push(imgClone);
                paragraphAligns.push(null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (node.classList.contains("dlg-editor-marker")) {
                // "대사 추가"로 삽입된 실제 대사 블록. 내부 구조(absolute 프사, grid 등)를 그대로
                // 보존해야 캔버스에서도 정확히 같은 모양으로 나오므로, 다른 블록들처럼 통째로 보존한다.
                flushParagraph();
                const markerClone = node.cloneNode(true);
                markerClone.removeAttribute("contenteditable");
                paragraphs.push(markerClone);
                paragraphAligns.push(null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (node.classList.contains("html-embed-block")) {
                // "HTML 삽입"으로 넣은 사용자 정의 HTML 블록. 안의 구조를 손대지 않고 통째로 보존한다.
                flushParagraph();
                const htmlClone = node.cloneNode(true);
                htmlClone.removeAttribute("contenteditable");
                paragraphs.push(htmlClone);
                paragraphAligns.push(null);
                paragraphIndents.push(false);
                flushParagraph();
            } else if (tagName === "DIV" || tagName === "P" || /^H[1-6]$/.test(tagName)) {
                flushParagraph();
                const prevAlign = currentAlign;
                const prevIndent = currentIndent;
                if (node.style.textAlign) currentAlign = node.style.textAlign;
                if (node.classList.contains("indent-para")) currentIndent = true;
                Array.from(node.childNodes).forEach(parseNodes);
                flushParagraph();
                currentAlign = prevAlign;
                currentIndent = prevIndent;
            } else {
                if (node.querySelector("div, p, br, .dialogue-line, .box-quote, .template-block, .dlg-editor-marker, .html-embed-block")) Array.from(node.childNodes).forEach(parseNodes);
                else currentParagraphNodes.push(node.cloneNode(true));
            }
        }
    }

    Array.from(container.childNodes).forEach(parseNodes);
    flushParagraph();

    while (paragraphs.length > 0) {
        const lastPara = paragraphs[paragraphs.length - 1];
        if (!(lastPara instanceof HTMLElement)) {
            if (lastPara.every((node) => node.textContent.trim() === "")) { paragraphs.pop(); paragraphAligns.pop(); paragraphIndents.pop(); continue; }
        }
        break;
    }

    container.innerHTML = "";
    paragraphs.forEach((pNodes, idx) => {
        const align = paragraphAligns[idx];
        const indented = paragraphIndents[idx];
        if (pNodes instanceof HTMLElement && (pNodes.classList.contains("dialogue-line") || pNodes.classList.contains("box-quote") || pNodes.classList.contains("hr-divider") || pNodes.classList.contains("template-block") || pNodes.classList.contains("editor-image-block") || pNodes.classList.contains("dlg-editor-marker") || pNodes.classList.contains("html-embed-block"))) {
            if (align && !pNodes.classList.contains("editor-image-block") && !pNodes.classList.contains("hr-divider")) pNodes.style.textAlign = align;
            container.appendChild(pNodes);
        } else {
            const newDiv = document.createElement("div");
            if (align) newDiv.style.textAlign = align;
            if (indented) newDiv.classList.add("indent-para");
            if (pNodes.length === 0) newDiv.appendChild(document.createElement("br"));
            else pNodes.forEach((n) => newDiv.appendChild(n));
            container.appendChild(newDiv);
        }
    });

    if (container.childNodes.length === 0) container.innerHTML = "<div><br></div>";
}

/* ========================================================================
   본문 내 사진 삽입 기능
   - 편집기(#textEditor) 안에 이미지 블록을 삽입하고,
   - 너비/높이/채우기 방식/정렬/모서리 둥글기를 자유롭게 조절할 수 있게 함.
   - 삽입된 블록은 normalizeParagraphs()에서 dialogue-line과 동일하게
     "그대로 보존해야 하는 블록"으로 취급되어 미리보기(canvas)에도 그대로 반영됨.
   ======================================================================== */

let currentImageBlock = null;

function applyImageAlign(block, align) {
    const prevAlign = block.dataset.align;
    block.dataset.align = align;
    if (align === "left") {
        // 사진을 좌측에 띄우고 글자가 사진 오른쪽으로 자유롭게 흐르게 함
        block.style.float = "left";
        block.style.marginLeft = "0";
        block.style.marginRight = "14px";
        block.style.marginTop = "2px";
        block.style.marginBottom = "8px";
    } else if (align === "right") {
        // 사진을 우측에 띄우고 글자가 사진 왼쪽으로 자유롭게 흐르게 함
        block.style.float = "right";
        block.style.marginLeft = "14px";
        block.style.marginRight = "0";
        block.style.marginTop = "2px";
        block.style.marginBottom = "8px";
    } else if (align === "fill") {
        // 가득 채우기: 사진이 좌우 여백까지 무시하고 캔버스 끝에서 끝까지 꽉 채움.
        // 실제 "끝까지 붙이는" 계산(여백만큼 음수 마진)은 캔버스에 그릴 때(updateCanvas)
        // 마다 현재 여백값 기준으로 다시 계산한다 — 편집창 안에서는 그냥 편집창 폭 100%로만 보여줌.
        //
        // Chat2Img 참고사항: 드래그로 아무렇게나 늘이는 게 아니라, 정해둔 비율(1:1, 16:9 등)
        // 중 하나를 고르면 그 비율대로 꽉 채운다. 비율은 폭에 상관없이 항상 동일하게 유지되므로
        // (aspect-ratio) 편집창에서 보이는 크롭 그대로 실제 캔버스에도 나온다 — 편집창·캔버스의
        // 실제 픽셀 폭이 서로 달라도 문제없다.
        if (prevAlign !== "fill") {
            block.dataset.widthBeforeFill = block.style.width || "240px";
        }
        if (!block.dataset.fillRatio) block.dataset.fillRatio = "16:9";
        block.style.float = "none";
        block.style.marginLeft = "0";
        block.style.marginRight = "0";
        block.style.marginTop = "10px";
        block.style.marginBottom = "10px";
        block.style.width = "100%";
        block.style.height = "auto";
        const [rw, rh] = block.dataset.fillRatio.split(":").map(Number);
        block.style.aspectRatio = `${rw || 16} / ${rh || 9}`;
        if (block.dataset.fillPosX === undefined) block.dataset.fillPosX = "50";
        if (block.dataset.fillPosY === undefined) block.dataset.fillPosY = "50";
        const img = block.querySelector("img");
        if (img) {
            img.style.objectFit = "cover";
            img.style.objectPosition = `${block.dataset.fillPosX}% ${block.dataset.fillPosY}%`;
        }
    } else {
        // 가운데: 사진이 자기 줄을 독립적으로 차지 (기존 방식)
        block.style.float = "none";
        block.style.marginLeft = "auto";
        block.style.marginRight = "auto";
        block.style.marginTop = "10px";
        block.style.marginBottom = "10px";
    }

    if (align !== "fill" && prevAlign === "fill") {
        // fill에서 돌아올 땐 폭/높이를 원래 비율 기준으로 되살리고, aspect-ratio는 제거한다.
        const restoredWidth = parseInt(block.dataset.widthBeforeFill, 10) || 240;
        const ratio = parseFloat(block.dataset.naturalRatio) || 1;
        block.style.width = `${restoredWidth}px`;
        block.style.height = `${Math.max(20, Math.round(restoredWidth / ratio))}px`;
        block.style.aspectRatio = "";
        const img = block.querySelector("img");
        if (img) img.style.objectPosition = "center center";
    }

    // 가득 채우기는 드래그 리사이즈 대신 정해진 비율만 쓰므로, 모서리 핸들은 숨긴다.
    const resizeHandle = block.querySelector(".image-resize-handle");
    if (resizeHandle) resizeHandle.style.display = align === "fill" ? "none" : "";
}

function applyImageFillPosition(block, x, y) {
    if (!block) return;
    block.dataset.fillPosX = String(x);
    block.dataset.fillPosY = String(y);
    const img = block.querySelector("img");
    if (img) img.style.objectPosition = `${x}% ${y}%`;
}

function applyImageFillRatio(block, ratioStr) {
    if (!block) return;
    block.dataset.fillRatio = ratioStr;
    const [rw, rh] = ratioStr.split(":").map(Number);
    block.style.aspectRatio = `${rw || 16} / ${rh || 9}`;
}

function selectImageBlock(block) {
    if (currentImageBlock && currentImageBlock !== block) {
        currentImageBlock.classList.remove("selected");
    }
    currentImageBlock = block;
    block.classList.add("selected");

    const panel = document.getElementById("imageBlockPanel");
    const emptyHint = document.getElementById("imageBlockEmptyHint");
    if (panel) panel.style.display = "flex";
    if (emptyHint) emptyHint.style.display = "none";
    openSheetPanel("panel-image");

    const sizeInput = document.getElementById("imgBlockSize");
    const radiusInput = document.getElementById("imgBlockRadius");
    const sizeArea = document.getElementById("imgBlockSizeArea");
    const sizeHint = document.getElementById("imgBlockSizeHint");

    const align = block.dataset.align || "center";
    const isFill = align === "fill";

    if (sizeArea) sizeArea.style.display = isFill ? "none" : "";
    if (sizeHint) sizeHint.style.display = isFill ? "none" : "";
    if (sizeInput && !isFill) sizeInput.value = parseInt(block.style.width, 10) || block.offsetWidth || 240;
    if (radiusInput) radiusInput.value = parseInt(block.style.borderRadius, 10) || 0;

    document.querySelectorAll("#imgBlockAlignGroup button").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-value") === align);
    });

    const fillRatioArea = document.getElementById("imgBlockFillRatioArea");
    const fillRatioHint = document.getElementById("imgBlockFillRatioHint");
    const fillDirArea = document.getElementById("imgBlockFillDirArea");
    const fillDirYArea = document.getElementById("imgBlockFillDirYArea");
    const fillDirHint = document.getElementById("imgBlockFillDirHint");
    if (fillRatioArea) fillRatioArea.style.display = isFill ? "" : "none";
    if (fillRatioHint) fillRatioHint.style.display = isFill ? "" : "none";
    if (fillDirArea) fillDirArea.style.display = isFill ? "" : "none";
    if (fillDirYArea) fillDirYArea.style.display = isFill ? "" : "none";
    if (fillDirHint) fillDirHint.style.display = isFill ? "" : "none";
    if (isFill) {
        const ratioSelect = document.getElementById("imgBlockFillRatio");
        if (ratioSelect) ratioSelect.value = block.dataset.fillRatio || "16:9";
        const posXInput = document.getElementById("imgBlockFillPosX");
        const posYInput = document.getElementById("imgBlockFillPosY");
        if (posXInput) posXInput.value = block.dataset.fillPosX || "50";
        if (posYInput) posYInput.value = block.dataset.fillPosY || "50";
    }
}

function deselectImageBlock() {
    if (currentImageBlock) currentImageBlock.classList.remove("selected");
    currentImageBlock = null;
    const panel = document.getElementById("imageBlockPanel");
    const emptyHint = document.getElementById("imageBlockEmptyHint");
    if (panel) panel.style.display = "none";
    if (emptyHint) emptyHint.style.display = "block";
    const imagePanelOpen = document.getElementById("panel-image")?.classList.contains("active");
    if (imagePanelOpen) closeSheetPanel();
}

function applyPanelToBlock() {
    if (!currentImageBlock) return;
    const isFill = currentImageBlock.dataset.align === "fill";

    if (!isFill) {
        const sizeInput = document.getElementById("imgBlockSize");
        const ratio = parseFloat(currentImageBlock.dataset.naturalRatio) || 1;
        const w = Math.max(20, parseInt(sizeInput.value, 10) || 20);
        const h = Math.max(20, Math.round(w / ratio));
        currentImageBlock.style.width = `${w}px`;
        currentImageBlock.style.height = `${h}px`;
    }

    const radiusInput = document.getElementById("imgBlockRadius");
    if (radiusInput) {
        const radius = Math.max(0, parseInt(radiusInput.value, 10) || 0);
        currentImageBlock.style.borderRadius = `${radius}px`;
    }

    updateCanvas();
}

function attachImageBlockInteractions(block) {
    const handle = block.querySelector(".image-resize-handle");
    const img = block.querySelector("img");
    if (!handle || !img) return;

    // ---- 모서리 드래그 = 박스 크기 조절 (항상 비율 고정) ----
    let resizing = false;
    let startX, startY, startW, ratio;

    handle.addEventListener("pointerdown", (e) => {
        if (block.dataset.align === "fill") return; // 가득 채우기는 드래그로 늘이지 않고, 정해진 비율만 사용
        e.preventDefault();
        e.stopPropagation();
        resizing = true;
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
        startX = e.clientX;
        startY = e.clientY;
        startW = parseInt(block.style.width, 10) || block.offsetWidth;
        block.dataset.__resizeStartH = String(parseInt(block.style.height, 10) || block.offsetHeight);
        ratio = parseFloat(block.dataset.naturalRatio) || 1;
        selectImageBlock(block);
    });

    handle.addEventListener("pointermove", (e) => {
        if (!resizing) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const newW = Math.max(20, Math.round(startW + dx));
        const newH = Math.max(20, Math.round(newW / ratio));

        block.style.width = `${newW}px`;
        block.style.height = `${newH}px`;

        const sizeInput = document.getElementById("imgBlockSize");
        if (sizeInput) sizeInput.value = newW;
    });

    const endResize = (e) => {
        if (!resizing) return;
        resizing = false;
        try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
        updateCanvas();
    };
    handle.addEventListener("pointerup", endResize);
    handle.addEventListener("pointercancel", endResize);
}

function insertImageBlock(dataURL, naturalW, naturalH) {
    const editor = els.editor;
    editor.focus();

    const editorWidth = editor.clientWidth || 300;
    // 기본으로 "글 옆에 사진"이 바로 보이도록, 전체 폭이 아니라
    // 편집창 폭의 절반 정도 + 좌측 정렬(float)을 기본값으로 삽입한다.
    // (그동안은 기본이 거의 전체 폭 + 가운데 정렬이라, 사진이 항상
    //  자기 혼자 한 줄을 차지해서 "옆으로 흐르는" 모습이 아예 안 보였음)
    const defaultSideWidth = Math.round(Math.min(editorWidth - 4, Math.max(140, editorWidth * 0.46)));
    let w = naturalW ? Math.min(defaultSideWidth, naturalW) : defaultSideWidth;
    let h = naturalW && naturalH ? Math.round((w * naturalH) / naturalW) : w;

    const block = document.createElement("div");
    block.className = "editor-image-block";
    block.setAttribute("contenteditable", "false");
    block.dataset.align = "left";
    block.dataset.naturalRatio = naturalW && naturalH ? (naturalW / naturalH).toFixed(6) : "1";
    block.style.width = `${w}px`;
    block.style.height = `${h}px`;
    block.style.borderRadius = "0px";
    block.dataset.originalSrc = dataURL;
    block.dataset.cropRect = JSON.stringify({ x: 0, y: 0, w: 100, h: 100 });
    applyImageAlign(block, "left");

    const img = document.createElement("img");
    img.src = dataURL;
    img.alt = "";
    img.draggable = false;
    img.style.objectFit = "cover";
    block.appendChild(img);

    const handle = document.createElement("div");
    handle.className = "image-resize-handle no-export";
    block.appendChild(handle);

    attachImageBlockInteractions(block);

    const selection = window.getSelection();
    let range;
    if (selection && selection.rangeCount && editor.contains(selection.anchorNode)) {
        range = selection.getRangeAt(0);
    } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
    }
    range.deleteContents();
    range.insertNode(block);

    if (!block.nextSibling) {
        const spacer = document.createElement("div");
        spacer.appendChild(document.createElement("br"));
        block.after(spacer);
    }

    const newRange = document.createRange();
    newRange.setStartAfter(block);
    newRange.collapse(true);
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    updateCanvas();
    selectImageBlock(block);
}

/* =========================================================
   사진 자르기(크롭) 오버레이 — 모서리 드래그로 자유롭게 영역 선택
   ========================================================= */
let cropTargetBlock = null;
let cropNaturalW = 0;
let cropNaturalH = 0;
let cropImgLeft = 0;
let cropImgTop = 0;
let cropImgW = 0;
let cropImgH = 0;
let cropAspectMode = "free"; // "free" | "1:1" | "original"
let cropBoxRect = { x1: 0, y1: 0, x2: 0, y2: 0 }; // 스테이지 좌표계(px), 절대값

function getCropAspectRatio() {
    if (cropAspectMode === "1:1") return 1;
    if (cropAspectMode === "original") return cropNaturalW / cropNaturalH || 1;
    return null;
}

function clampNum(v, min, max) {
    return Math.min(max, Math.max(min, v));
}

function layoutCropImage() {
    const stage = document.getElementById("cropStage");
    const stageImg = document.getElementById("cropStageImg");
    if (!stage || !stageImg || !cropNaturalW || !cropNaturalH) return;
    const pad = 20;
    const availW = Math.max(40, stage.clientWidth - pad * 2);
    const availH = Math.max(40, stage.clientHeight - pad * 2);
    const scale = Math.min(availW / cropNaturalW, availH / cropNaturalH);
    cropImgW = cropNaturalW * scale;
    cropImgH = cropNaturalH * scale;
    cropImgLeft = (stage.clientWidth - cropImgW) / 2;
    cropImgTop = (stage.clientHeight - cropImgH) / 2;
    stageImg.style.left = `${cropImgLeft}px`;
    stageImg.style.top = `${cropImgTop}px`;
    stageImg.style.width = `${cropImgW}px`;
    stageImg.style.height = `${cropImgH}px`;
}

function renderCropBox() {
    const box = document.getElementById("cropBox");
    if (!box) return;
    const { x1, y1, x2, y2 } = cropBoxRect;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;

    const stage = document.getElementById("cropStage");
    const stageW = stage ? stage.clientWidth : 0;
    const stageH = stage ? stage.clientHeight : 0;
    const dimTop = document.querySelector(".crop-dim-top");
    const dimBottom = document.querySelector(".crop-dim-bottom");
    const dimLeft = document.querySelector(".crop-dim-left");
    const dimRight = document.querySelector(".crop-dim-right");
    if (dimTop) {
        dimTop.style.left = "0px";
        dimTop.style.top = "0px";
        dimTop.style.width = `${stageW}px`;
        dimTop.style.height = `${top}px`;
    }
    if (dimBottom) {
        dimBottom.style.left = "0px";
        dimBottom.style.top = `${top + h}px`;
        dimBottom.style.width = `${stageW}px`;
        dimBottom.style.height = `${Math.max(0, stageH - (top + h))}px`;
    }
    if (dimLeft) {
        dimLeft.style.left = "0px";
        dimLeft.style.top = `${top}px`;
        dimLeft.style.width = `${left}px`;
        dimLeft.style.height = `${h}px`;
    }
    if (dimRight) {
        dimRight.style.left = `${left + w}px`;
        dimRight.style.top = `${top}px`;
        dimRight.style.width = `${Math.max(0, stageW - (left + w))}px`;
        dimRight.style.height = `${h}px`;
    }
}

function setCropBoxFromPercent(rect) {
    cropBoxRect = {
        x1: cropImgLeft + (rect.x / 100) * cropImgW,
        y1: cropImgTop + (rect.y / 100) * cropImgH,
        x2: cropImgLeft + ((rect.x + rect.w) / 100) * cropImgW,
        y2: cropImgTop + ((rect.y + rect.h) / 100) * cropImgH
    };
    renderCropBox();
}

function getCropBoxPercent() {
    const left = Math.min(cropBoxRect.x1, cropBoxRect.x2);
    const top = Math.min(cropBoxRect.y1, cropBoxRect.y2);
    const w = Math.abs(cropBoxRect.x2 - cropBoxRect.x1);
    const h = Math.abs(cropBoxRect.y2 - cropBoxRect.y1);
    const x = clampNum(((left - cropImgLeft) / cropImgW) * 100, 0, 100);
    const y = clampNum(((top - cropImgTop) / cropImgH) * 100, 0, 100);
    const wPct = clampNum((w / cropImgW) * 100, 0, 100 - x);
    const hPct = clampNum((h / cropImgH) * 100, 0, 100 - y);
    return { x, y, w: wPct, h: hPct };
}

function setCropAspectUI(mode) {
    cropAspectMode = mode;
    document.querySelectorAll("#cropAspectGroup button").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-aspect") === mode);
    });
    const aspect = getCropAspectRatio();
    if (!aspect) return;

    const bounds = { left: cropImgLeft, top: cropImgTop, right: cropImgLeft + cropImgW, bottom: cropImgTop + cropImgH };
    const centerX = (cropBoxRect.x1 + cropBoxRect.x2) / 2;
    const centerY = (cropBoxRect.y1 + cropBoxRect.y2) / 2;
    const curH = Math.abs(cropBoxRect.y2 - cropBoxRect.y1);

    let newW = Math.min(cropImgW, curH * aspect);
    let newH = newW / aspect;
    if (newH > cropImgH) {
        newH = cropImgH;
        newW = newH * aspect;
    }

    let x1 = centerX - newW / 2;
    let x2 = centerX + newW / 2;
    let y1 = centerY - newH / 2;
    let y2 = centerY + newH / 2;

    if (x1 < bounds.left) { x2 += bounds.left - x1; x1 = bounds.left; }
    if (x2 > bounds.right) { x1 -= x2 - bounds.right; x2 = bounds.right; }
    if (y1 < bounds.top) { y2 += bounds.top - y1; y1 = bounds.top; }
    if (y2 > bounds.bottom) { y1 -= y2 - bounds.bottom; y2 = bounds.bottom; }

    cropBoxRect = { x1, y1, x2, y2 };
    renderCropBox();
}

function openCropTool(block) {
    const overlay = document.getElementById("cropOverlay");
    const stageImg = document.getElementById("cropStageImg");
    if (!overlay || !stageImg) return;
    cropTargetBlock = block;
    const originalSrc = block.dataset.originalSrc || block.querySelector("img").src;

    overlay.style.display = "flex";

    stageImg.onload = () => {
        cropNaturalW = stageImg.naturalWidth;
        cropNaturalH = stageImg.naturalHeight;
        layoutCropImage();
        let rectPct;
        try {
            rectPct = JSON.parse(block.dataset.cropRect || "");
        } catch (err) {
            rectPct = null;
        }
        if (!rectPct || typeof rectPct.w !== "number") rectPct = { x: 0, y: 0, w: 100, h: 100 };
        setCropBoxFromPercent(rectPct);
        setCropAspectUI(block.dataset.cropAspect || "free");
    };
    stageImg.src = originalSrc;
}

function closeCropTool() {
    const overlay = document.getElementById("cropOverlay");
    if (overlay) overlay.style.display = "none";
    cropTargetBlock = null;
}

function applyCropTool() {
    if (!cropTargetBlock) return;
    const block = cropTargetBlock;
    const originalSrc = block.dataset.originalSrc || block.querySelector("img").src;
    const rectPct = getCropBoxPercent();

    const srcImg = new Image();
    srcImg.onload = () => {
        const natW = srcImg.naturalWidth;
        const natH = srcImg.naturalHeight;
        if (!natW || !natH) {
            showToast("이미지를 불러오지 못했어요. 다시 시도해주세요.");
            closeCropTool();
            return;
        }

        // 소스 이미지의 실제 범위를 절대 벗어나지 않도록 확실히 고정한다.
        // 범위를 살짝이라도 벗어나면 일부 브라우저(특히 모바일)에서
        // drawImage가 아무것도 그리지 않고 캔버스를 투명한 채로 남기는데,
        // 그 상태로 JPEG로 저장하면 투명 영역이 검게 칠해져서
        // 사진이 통째로 새까맣게 나오는 문제가 있었다.
        let sx = clampNum(Math.round((rectPct.x / 100) * natW), 0, natW - 1);
        let sy = clampNum(Math.round((rectPct.y / 100) * natH), 0, natH - 1);
        let sw = clampNum(Math.round((rectPct.w / 100) * natW), 1, natW - sx);
        let sh = clampNum(Math.round((rectPct.h / 100) * natH), 1, natH - sy);

        if (sw < 2 || sh < 2) {
            showToast("자르기 영역이 올바르지 않아요. 다시 잡아주세요.");
            closeCropTool();
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d");
        // 투명 영역이 JPEG로 저장될 때 검은색으로 채워지는 것을 막기 위해
        // 항상 흰 배경을 먼저 깔아둔다 (그림이 제대로 그려지면 안 보임).
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sw, sh);

        try {
            ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, sw, sh);
        } catch (err) {
            showToast("자르는 중 오류가 발생했어요. 다시 시도해주세요.");
            closeCropTool();
            return;
        }

        let mime = "image/jpeg";
        const mimeMatch = /^data:([^;]+);/.exec(originalSrc);
        if (mimeMatch && (mimeMatch[1] === "image/png" || mimeMatch[1] === "image/webp")) mime = mimeMatch[1];
        const croppedDataURL = canvas.toDataURL(mime, 0.92);

        const img = block.querySelector("img");
        if (img) img.src = croppedDataURL;
        block.dataset.naturalRatio = (sw / sh).toFixed(6);
        block.dataset.cropRect = JSON.stringify(rectPct);
        block.dataset.cropAspect = cropAspectMode;

        // 박스 비율을 잘라낸 이미지 비율과 항상 일치시킴 (너비 유지, 높이만 재계산)
        const curW = parseInt(block.style.width, 10) || block.offsetWidth || 240;
        const newH = Math.max(20, Math.round(curW / (sw / sh)));
        block.style.height = `${newH}px`;

        const sizeInput = document.getElementById("imgBlockSize");
        if (sizeInput) sizeInput.value = curW;

        updateCanvas();
        closeCropTool();
    };
    srcImg.onerror = () => {
        showToast("이미지를 불러오지 못했어요. 다시 시도해주세요.");
        closeCropTool();
    };
    srcImg.src = originalSrc;
}

document.addEventListener("DOMContentLoaded", () => {
    const cropBox = document.getElementById("cropBox");
    const btnCropCancel = document.getElementById("btnCropCancel");
    const btnCropApply = document.getElementById("btnCropApply");

    if (btnCropCancel) btnCropCancel.addEventListener("click", closeCropTool);
    if (btnCropApply) btnCropApply.addEventListener("click", applyCropTool);

    document.querySelectorAll("#cropAspectGroup button").forEach((btn) => {
        btn.addEventListener("click", () => {
            setCropAspectUI(btn.getAttribute("data-aspect"));
        });
    });

    window.addEventListener("resize", () => {
        const overlay = document.getElementById("cropOverlay");
        if (overlay && overlay.style.display !== "none") {
            const prevPct = getCropBoxPercent();
            layoutCropImage();
            setCropBoxFromPercent(prevPct);
        }
        // 화면 회전, 키보드 표시/숨김 등으로 실제 사용 가능한 폭이 바뀔 때마다
        // 캔버스/편집창 폭 계산을 다시 맞춰서, 오래된 값 그대로 남아
        // 글자가 잘리거나 비율이 어긋나 보이는 것을 방지
        updateCanvas();
    });
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", () => updateCanvas());
    }

    if (cropBox) {
        const minSize = 32;

        // ---- 크롭 박스 이동 ----
        let moving = false;
        let moveStartX = 0;
        let moveStartY = 0;
        let startRect = null;

        cropBox.addEventListener("pointerdown", (e) => {
            if (e.target.closest(".crop-handle")) return;
            e.preventDefault();
            moving = true;
            try { cropBox.setPointerCapture(e.pointerId); } catch (err) {}
            moveStartX = e.clientX;
            moveStartY = e.clientY;
            startRect = { ...cropBoxRect };
        });

        cropBox.addEventListener("pointermove", (e) => {
            if (!moving) return;
            e.preventDefault();
            const dx = e.clientX - moveStartX;
            const dy = e.clientY - moveStartY;
            const w = Math.abs(startRect.x2 - startRect.x1);
            const h = Math.abs(startRect.y2 - startRect.y1);
            const bounds = { left: cropImgLeft, top: cropImgTop, right: cropImgLeft + cropImgW, bottom: cropImgTop + cropImgH };
            const newLeft = clampNum(Math.min(startRect.x1, startRect.x2) + dx, bounds.left, bounds.right - w);
            const newTop = clampNum(Math.min(startRect.y1, startRect.y2) + dy, bounds.top, bounds.bottom - h);
            cropBoxRect = { x1: newLeft, y1: newTop, x2: newLeft + w, y2: newTop + h };
            renderCropBox();
        });

        const endMove = (e) => {
            if (!moving) return;
            moving = false;
            try { cropBox.releasePointerCapture(e.pointerId); } catch (err) {}
        };
        cropBox.addEventListener("pointerup", endMove);
        cropBox.addEventListener("pointercancel", endMove);

        // ---- 모서리 손잡이 = 크롭 영역 크기 조절 ----
        cropBox.querySelectorAll(".crop-handle").forEach((handle) => {
            const key = handle.getAttribute("data-handle");
            let resizing = false;

            handle.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                resizing = true;
                try { handle.setPointerCapture(e.pointerId); } catch (err) {}
            });

            handle.addEventListener("pointermove", (e) => {
                if (!resizing) return;
                e.preventDefault();
                const stage = document.getElementById("cropStage");
                const rect = stage.getBoundingClientRect();
                const px = e.clientX - rect.left;
                const py = e.clientY - rect.top;
                const bounds = { left: cropImgLeft, top: cropImgTop, right: cropImgLeft + cropImgW, bottom: cropImgTop + cropImgH };
                const aspect = getCropAspectRatio();

                let anchorX, anchorY;
                if (key === "tl") { anchorX = cropBoxRect.x2; anchorY = cropBoxRect.y2; }
                if (key === "tr") { anchorX = cropBoxRect.x1; anchorY = cropBoxRect.y2; }
                if (key === "bl") { anchorX = cropBoxRect.x2; anchorY = cropBoxRect.y1; }
                if (key === "br") { anchorX = cropBoxRect.x1; anchorY = cropBoxRect.y1; }

                const movesLeft = key === "tl" || key === "bl";
                const movesTop = key === "tl" || key === "tr";

                if (!aspect) {
                    let x1 = movesLeft ? clampNum(px, bounds.left, anchorX - minSize) : anchorX;
                    let x2 = movesLeft ? anchorX : clampNum(px, anchorX + minSize, bounds.right);
                    let y1 = movesTop ? clampNum(py, bounds.top, anchorY - minSize) : anchorY;
                    let y2 = movesTop ? anchorY : clampNum(py, anchorY + minSize, bounds.bottom);
                    cropBoxRect = { x1, y1, x2, y2 };
                } else {
                    const maxWFromBoundsX = movesLeft ? anchorX - bounds.left : bounds.right - anchorX;
                    const maxHFromBoundsY = movesTop ? anchorY - bounds.top : bounds.bottom - anchorY;
                    const maxWFromH = maxHFromBoundsY * aspect;
                    const effectiveMaxW = Math.max(minSize, Math.min(maxWFromBoundsX, maxWFromH));
                    const desiredW = Math.abs(px - anchorX);
                    const newW = clampNum(desiredW, minSize, effectiveMaxW);
                    const newH = newW / aspect;

                    let x1 = movesLeft ? anchorX - newW : anchorX;
                    let x2 = movesLeft ? anchorX : anchorX + newW;
                    let y1 = movesTop ? anchorY - newH : anchorY;
                    let y2 = movesTop ? anchorY : anchorY + newH;
                    cropBoxRect = { x1, y1, x2, y2 };
                }
                renderCropBox();
            });

            const endResize = (e) => {
                if (!resizing) return;
                resizing = false;
                try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
            };
            handle.addEventListener("pointerup", endResize);
            handle.addEventListener("pointercancel", endResize);
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const btnInsertImage = document.getElementById("btnInsertImage");
    const imageInsertInput = document.getElementById("imageInsertInput");

    if (btnInsertImage && imageInsertInput) {
        btnInsertImage.addEventListener("click", () => {
            imageInsertInput.value = "";
            imageInsertInput.click();
        });

        imageInsertInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type || !file.type.startsWith("image/")) {
                showToast("이미지 파일만 삽입할 수 있어요.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataURL = event.target.result;
                const tempImg = new Image();
                tempImg.onload = () => insertImageBlock(dataURL, tempImg.naturalWidth, tempImg.naturalHeight);
                tempImg.onerror = () => insertImageBlock(dataURL, 0, 0);
                tempImg.src = dataURL;
            };
            reader.readAsDataURL(file);
        });
    }

    els.editor.addEventListener("click", (e) => {
        // 크기 조절 핸들 클릭/드래그는 선택 토글과 무관하게 별도로 처리됨
        if (e.target.closest(".image-resize-handle")) return;

        const block = e.target.closest(".editor-image-block");
        if (block && els.editor.contains(block)) {
            if (currentImageBlock === block) {
                // 선택된 사진을 한 번 더 누르면 선택 해제
                deselectImageBlock();
            } else {
                selectImageBlock(block);
            }
        } else {
            deselectImageBlock();
        }
    });

    document.addEventListener("click", (e) => {
        const panel = document.getElementById("imageBlockPanel");
        if (!panel || panel.style.display === "none") return;
        if (panel.contains(e.target) || els.editor.contains(e.target)) return;
        deselectImageBlock();
    });

    ["imgBlockSize", "imgBlockRadius"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", applyPanelToBlock);
        el.addEventListener("change", applyPanelToBlock);
    });

    const btnOpenCrop = document.getElementById("btnOpenCrop");
    if (btnOpenCrop) {
        btnOpenCrop.addEventListener("click", () => {
            if (!currentImageBlock) return;
            openCropTool(currentImageBlock);
        });
    }

    const btnResetCrop = document.getElementById("btnResetCrop");
    if (btnResetCrop) {
        btnResetCrop.addEventListener("click", () => {
            if (!currentImageBlock) return;
            const block = currentImageBlock;
            const originalSrc = block.dataset.originalSrc;
            if (!originalSrc) return;
            const img = block.querySelector("img");
            if (img) img.src = originalSrc;
            block.dataset.cropRect = JSON.stringify({ x: 0, y: 0, w: 100, h: 100 });
            const tempImg = new Image();
            tempImg.onload = () => {
                block.dataset.naturalRatio = (tempImg.naturalWidth / tempImg.naturalHeight).toFixed(6);
                const w = parseInt(block.style.width, 10) || block.offsetWidth || 240;
                const h = Math.max(20, Math.round(w / parseFloat(block.dataset.naturalRatio)));
                block.style.height = `${h}px`;
                updateCanvas();
            };
            tempImg.src = originalSrc;
        });
    }

    document.querySelectorAll('[data-img-step]').forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!currentImageBlock) return;
            const prop = btn.getAttribute("data-img-step");
            const step = parseInt(btn.getAttribute("data-step"), 10) || 0;
            const inputId = prop === "size" ? "imgBlockSize" : "imgBlockRadius";
            const input = document.getElementById(inputId);
            if (!input) return;
            const minVal = prop === "radius" ? 0 : 20;
            const newVal = Math.max(minVal, (parseInt(input.value, 10) || 0) + step);
            input.value = newVal;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
    });

    document.querySelectorAll("#imgBlockAlignGroup button").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!currentImageBlock) return;
            document.querySelectorAll("#imgBlockAlignGroup button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            applyImageAlign(currentImageBlock, btn.getAttribute("data-value"));
            selectImageBlock(currentImageBlock); // 크기 입력 라벨/방향 패널 등 표시 상태 다시 동기화
            updateCanvas();
        });
    });

    const fillRatioSelect = document.getElementById("imgBlockFillRatio");
    if (fillRatioSelect) {
        fillRatioSelect.addEventListener("change", () => {
            if (!currentImageBlock) return;
            applyImageFillRatio(currentImageBlock, fillRatioSelect.value);
            updateCanvas();
        });
    }

    ["imgBlockFillPosX", "imgBlockFillPosY"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", () => {
            if (!currentImageBlock) return;
            const x = parseInt(document.getElementById("imgBlockFillPosX").value, 10) || 0;
            const y = parseInt(document.getElementById("imgBlockFillPosY").value, 10) || 0;
            applyImageFillPosition(currentImageBlock, x, y);
            updateCanvas();
        });
    });

    const btnRemoveImageBlock = document.getElementById("btnRemoveImageBlock");
    if (btnRemoveImageBlock) {
        btnRemoveImageBlock.addEventListener("click", () => {
            if (!currentImageBlock) return;
            const toRemove = currentImageBlock;
            deselectImageBlock();
            toRemove.remove();
            updateCanvas();
        });
    }
});


// ===== 본문 옆 사진 (Chat2Img 스타일: 한쪽 칸을 채우는 사진) =====
const sideImg = { src: "", nw: 0, nh: 0, posX: 50, posY: 50 };

function applySideImage() {
    const row = document.getElementById("sideImageRow");
    const box = document.getElementById("sideImageBox");
    const textContainer = document.getElementById("canvasTextContainer");
    const wrapper = document.getElementById("canvasTextWrapper");
    if (!row || !box || !textContainer || !wrapper) return;
    const controls = document.getElementById("sideImageControls");
    if (controls) controls.style.display = sideImg.src ? "" : "none";

    // 혹시 예전 방식(여백 트릭)이 남아있으면 초기화
    wrapper.style.paddingLeft = wrapper.style.paddingRight = wrapper.style.paddingTop = wrapper.style.paddingBottom = "";

    if (!sideImg.src) {
        // 꺼져 있을 땐 flex 관련 inline 스타일을 전부 지워서 기존 레이아웃(CSS 기본값)으로 되돌린다.
        box.style.display = "none";
        row.style.display = "";
        row.style.flexDirection = "";
        row.style.gap = "";
        row.style.alignItems = "";
        box.style.order = "";
        textContainer.style.order = "";
        textContainer.style.width = "";
        textContainer.style.minWidth = "";
        return;
    }

    const v = (id, d) => { const n = parseFloat(document.getElementById(id)?.value); return isNaN(n) ? d : n; };
    const dir = document.getElementById("sideImageDir")?.value || "right";
    const size = v("sideImageSize", 120), zoom = v("sideImageZoom", 100) / 100;
    const radius = v("sideImageRadius", 8), gap = v("sideImageGap", 14), border = v("sideImageBorder", 0);
    const isRowDir = dir === "left" || dir === "right";

    // ⚠️ 예전 버전의 버그: box를 position:absolute로 두고 height:calc(100% - ...)/bottom 으로
    // 띄웠는데, 캔버스 비율이 기본값인 "자동 조절"일 때는 captureArea의 높이가 애초에 auto라서
    // 그 100%가 계산이 안 되고(부모 체인에 "정해진 높이"가 하나도 없음) 박스가 찌그러지거나
    // 0 높이로 사라졌다 — 그래서 위/아래는 깨지고 좌/우는 아예 안 보였던 것.
    // absolute+퍼센트 대신, box를 canvasTextContainer와 나란한 '보통 flex 자식'으로 둔다.
    // flex는 부모의 확정된 높이 없이도 형제 요소 크기에 맞춰 늘어나므로 이 문제 자체가 없어진다.
    row.style.display = "flex";
    row.style.flexDirection = isRowDir ? "row" : "column";
    row.style.gap = `${gap}px`;
    row.style.alignItems = "stretch";

    box.style.display = "block";
    box.style.position = "static";
    box.style.overflow = "hidden";
    box.style.boxSizing = "border-box";
    box.style.borderRadius = `${radius}px`;
    box.style.border = border ? `${border}px solid rgba(0,0,0,0.25)` : "none";
    box.style.touchAction = "none";
    box.style.cursor = "grab";
    box.style.flexShrink = "0";
    box.style.flexGrow = "0";
    box.style.flexBasis = `${size}px`;
    box.style.width = isRowDir ? `${size}px` : "";
    box.style.height = isRowDir ? "" : `${size}px`;
    box.style.order = (dir === "left" || dir === "top") ? "1" : "2";

    textContainer.style.order = (dir === "left" || dir === "top") ? "2" : "1";
    textContainer.style.flex = "1 1 auto";
    textContainer.style.width = isRowDir ? "" : "100%";
    textContainer.style.minWidth = "0"; // flex 자식이 내용 때문에 줄어들지 못해 줄바꿈이 깨지는 것 방지

    // 사진을 칸에 꽉 채우고(cover) 확대/위치 적용 — flex가 이미 레이아웃을 확정했으니
    // clientWidth/Height로 실제 박스 크기를 바로 읽을 수 있다.
    const bw = box.clientWidth, bh = box.clientHeight;
    if (bw && bh && sideImg.nw && sideImg.nh) {
        const scale = Math.max(bw / sideImg.nw, bh / sideImg.nh) * zoom;
        box.style.backgroundImage = `url("${sideImg.src}")`;
        box.style.backgroundRepeat = "no-repeat";
        box.style.backgroundSize = `${sideImg.nw * scale}px ${sideImg.nh * scale}px`;
        box.style.backgroundPosition = `${sideImg.posX}% ${sideImg.posY}%`;
        box._scaled = { w: sideImg.nw * scale, h: sideImg.nh * scale, bw, bh };
    }
}

(function setupSideImage() {
    const input = document.getElementById("sideImageInput");
    const box = document.getElementById("sideImageBox");
    if (!input || !box) return;
    input.addEventListener("change", (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => {
            const im = new Image();
            im.onload = () => {
                Object.assign(sideImg, { src: ev.target.result, nw: im.naturalWidth, nh: im.naturalHeight, posX: 50, posY: 50 });
                updateCanvas();
            };
            im.src = ev.target.result;
        };
        r.readAsDataURL(f);
    });
    ["sideImageSize", "sideImageZoom", "sideImageRadius", "sideImageGap", "sideImageBorder"].forEach((id) => {
        document.getElementById(id)?.addEventListener("input", updateCanvas);
    });
    document.querySelectorAll('.segmented-control[data-target="sideImageDir"] button').forEach((b) => {
        b.addEventListener("click", () => {
            const prevDir = document.getElementById("sideImageDir").value;
            const newDir = b.dataset.value;
            document.getElementById("sideImageDir").value = newDir;
            document.querySelectorAll('.segmented-control[data-target="sideImageDir"] button').forEach((x) => x.classList.toggle("active", x === b));
            // 세로(위/아래) ↔ 가로(좌/우)처럼 박스 모양 자체가 완전히 바뀌는 방향 전환이면,
            // 이전 방향에서 드래그해 둔 위치가 새 모양에서는 엉뚱한 곳을 잘라내 보여줄 수 있다.
            // (세로 박스에서 맞춰둔 위치를 가로 박스에 그대로 쓰면 축이 안 맞아 이상하게 잘림)
            // 그래서 가로축↔세로축이 바뀌는 전환에서는 가운데(50/50)로 되돌린다.
            const prevIsRow = prevDir === "left" || prevDir === "right";
            const newIsRow = newDir === "left" || newDir === "right";
            if (prevIsRow !== newIsRow) {
                sideImg.posX = 50;
                sideImg.posY = 50;
            }
            updateCanvas();
        });
    });
    document.getElementById("btnRemoveSideImage")?.addEventListener("click", () => {
        sideImg.src = ""; input.value = ""; box.style.backgroundImage = "";
        updateCanvas();
    });

    // 미리보기에서 드래그로 사진 위치 이동
    let drag = null;
    box.addEventListener("pointerdown", (e) => {
        if (!sideImg.src) return;
        e.preventDefault();
        window.__infoBadgeInteracting = true; // 확대창이 같이 열리지 않게
        drag = { x: e.clientX, y: e.clientY, px: sideImg.posX, py: sideImg.posY };
        try { box.setPointerCapture(e.pointerId); } catch (err) {}
        box.style.cursor = "grabbing";
    });
    box.addEventListener("pointermove", (e) => {
        if (!drag || !box._scaled) return;
        const s = box._scaled;
        const rect = box.getBoundingClientRect();
        const k = rect.width ? s.bw / rect.width : 1; // 화면 배율 보정
        const rx = s.w - s.bw, ry = s.h - s.bh;
        if (rx > 0) sideImg.posX = Math.min(100, Math.max(0, drag.px - ((e.clientX - drag.x) * k / rx) * 100));
        if (ry > 0) sideImg.posY = Math.min(100, Math.max(0, drag.py - ((e.clientY - drag.y) * k / ry) * 100));
        box.style.backgroundPosition = `${sideImg.posX}% ${sideImg.posY}%`;
    });
    const end = () => { if (!drag) return; drag = null; box.style.cursor = "grab"; setTimeout(() => { window.__infoBadgeInteracting = false; }, 0); };
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
})();

// ==========================================================================
// 색상 설정 기억하기: 마지막에 골랐던 색을 새로고침해도 유지
// (글자색/보조색/형광펜/강조선/박스인용/가로선/배경색 등 color input 전부 대상,
//  캐릭터 카드처럼 "이 데이터 하나"에 귀속된 색은 제외)
// ==========================================================================
(function setupColorMemory() {
    const STORAGE_KEY = "quoteStudioColorPrefs";
    // 특정 캐릭터/항목 하나에 속한 색은 "마지막으로 쓴 공통 색"으로 취급하면 안 되므로 제외
    const EXCLUDE_IDS = new Set(["charEditorColor"]);

    function loadPrefs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function savePrefs(prefs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) {}
    }

    function init() {
        const prefs = loadPrefs();
        const inputs = Array.from(document.querySelectorAll('input[type="color"]')).filter(
            (el) => el.id && !EXCLUDE_IDS.has(el.id)
        );

        // 저장된 값이 있으면 페이지에 적용 (HTML의 기본값 대신)
        let changed = false;
        inputs.forEach((el) => {
            if (prefs[el.id] && prefs[el.id] !== el.value) {
                el.value = prefs[el.id];
                changed = true;
            }
        });
        // 캔버스가 저장된 색을 반영해서 다시 그리도록 한 번만 갱신
        if (changed && typeof updateCanvas === "function") updateCanvas();

        // 이후 색을 바꿀 때마다 저장
        inputs.forEach((el) => {
            el.addEventListener("input", () => {
                const p = loadPrefs();
                p[el.id] = el.value;
                savePrefs(p);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

// ==========================================================================
// 테두리 장식 (Chat2Img 스타일): 기본 테두리 / 네 모서리 기호 장식 / 없음
// ==========================================================================
// ==========================================================================
// 설정 패널 꾸밈: 섹션 제목(.panel-section-title) 하나가 한 묶음.
// 묶음의 "첫 번째 칸"에는 왼쪽 위, "마지막 칸"에는 오른쪽 아래 모서리에 하트를 붙인다.
// 숨겨진 칸(display:none)은 건너뛰고 "보이는 칸" 기준으로 계산한다.
// (옵션에 따라 칸이 나타나고 사라지기 때문에 CSS만으로는 첫/마지막을 정확히 못 잡음)
// ==========================================================================
(function setupSectionCornerHearts() {
    const panels = document.querySelectorAll(".tab-panel");
    if (!panels.length) return;

    const isVisible = (el) => el.getClientRects().length > 0;
    const setClass = (el, name, on) => {
        if (el.classList.contains(name) !== on) el.classList.toggle(name, on);
    };

    let raf = 0;
    const run = () => {
        raf = 0;
        panels.forEach((panel) => {
            if (!isVisible(panel)) return; // 안 보이는 탭은 열릴 때 다시 계산됨

            const groups = [[]];
            panel.querySelectorAll(".panel-section-title, .control-minimal-row").forEach((el) => {
                if (el.classList.contains("panel-section-title")) {
                    groups.push([]);
                } else if (isVisible(el)) {
                    groups[groups.length - 1].push(el);
                }
            });

            const firsts = new Set();
            const lasts = new Set();
            groups.forEach((rows) => {
                if (!rows.length) return;
                firsts.add(rows[0]);
                lasts.add(rows[rows.length - 1]);
            });

            panel.querySelectorAll(".control-minimal-row").forEach((row) => {
                setClass(row, "corner-heart-tl", firsts.has(row));
                setClass(row, "corner-heart-br", lasts.has(row));
            });
        });
    };
    const schedule = () => {
        if (!raf) raf = requestAnimationFrame(run);
    };

    // 탭 전환 / 옵션에 따라 칸이 보이고 숨겨질 때 다시 계산 (캔버스는 감시 대상이 아니라서 가볍다)
    const host = panels[0].parentElement;
    if (host && typeof MutationObserver === "function") {
        new MutationObserver(schedule).observe(host, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["style", "class", "hidden"],
        });
    }
    window.addEventListener("resize", schedule);
    schedule();
})();

// ==========================================================================
// 하프톤 장식: 점(도트)이 한쪽에서 점점 작아지며 사라지는 그라데이션 무늬
// 글자 뒤(배경 위)에 깔리고, 색/크기/범위/투명도를 고를 수 있다.
// ==========================================================================
function renderHalftoneLayer() {
    const layer = document.getElementById("halftoneLayer");
    const capture = document.getElementById("captureArea");
    if (!layer || !capture) return;
    layer.innerHTML = "";

    const dir = document.getElementById("halftoneDir")?.value || "none";
    if (dir === "none") return;

    const w = capture.clientWidth, h = capture.clientHeight;
    if (!w || !h) return;

    const color = document.getElementById("halftoneColor")?.value || "#e62c7a";
    const sizeVal = parseFloat(document.getElementById("halftoneSize")?.value) || 12;
    const rangePct = (parseFloat(document.getElementById("halftoneRange")?.value) || 60) / 100;
    const opacity = parseFloat(document.getElementById("halftoneOpacity")?.value) || 0.9;

    // 캔버스 폭에 비례해서 점 간격을 잡아야 미리보기/저장 어디서든 모양이 같다.
    const spacing = Math.max(4, sizeVal * (w / 420));
    const maxR = spacing * 0.55; // 0.5를 넘기면 가장 진한 곳에서 점들이 서로 붙어 꽉 찬 색이 된다
    const rowH = spacing * 0.866;
    const diag = Math.hypot(w, h);

    // (x,y)가 "시작 지점"에서 얼마나 떨어졌는지 0(시작)~1(끝)로 환산
    const distance = (x, y) => {
        switch (dir) {
            case "top": return y / (h * rangePct);
            case "bottom": return (h - y) / (h * rangePct);
            case "left": return x / (w * rangePct);
            case "right": return (w - x) / (w * rangePct);
            case "tl": return Math.hypot(x, y) / (diag * rangePct * 0.75);
            case "tr": return Math.hypot(w - x, y) / (diag * rangePct * 0.75);
            case "bl": return Math.hypot(x, h - y) / (diag * rangePct * 0.75);
            case "br": return Math.hypot(w - x, h - y) / (diag * rangePct * 0.75);
            case "edge": return Math.min(x, w - x, y, h - y) / (Math.min(w, h) * rangePct * 0.5);
            default: return 1;
        }
    };

    const f2 = (n) => Math.round(n * 100) / 100;
    let d = "";
    for (let row = 0, y = 0; y <= h + rowH; row++, y = row * rowH) {
        const xOff = (row % 2) * (spacing / 2); // 한 줄씩 엇갈리게 (인쇄 하프톤 느낌)
        for (let x = xOff; x <= w + spacing; x += spacing) {
            const v = 1 - distance(x, y);
            if (v <= 0) continue;
            const r = maxR * Math.pow(v, 0.85);
            if (r < 0.45) continue;
            d += `M${f2(x - r)},${f2(y)}a${f2(r)},${f2(r)} 0 1,0 ${f2(r * 2)},0a${f2(r)},${f2(r)} 0 1,0 ${f2(-r * 2)},0`;
        }
    }
    if (!d) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.display = "block";
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", color);
    path.setAttribute("opacity", opacity);
    svg.appendChild(path);
    layer.appendChild(svg);
}

(function setupHalftone() {
    const ids = ["halftoneColor", "halftoneSize", "halftoneRange", "halftoneOpacity"];
    const areas = ["halftoneColorArea", "halftoneSizeArea", "halftoneRangeArea", "halftoneOpacityArea"];
    const dirEl = document.getElementById("halftoneDir");
    if (!dirEl) return;
    const sync = () => {
        const on = dirEl.value !== "none";
        areas.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = on ? "" : "none";
        });
    };
    dirEl.addEventListener("change", () => { sync(); updateCanvas(); });
    ids.forEach((id) => document.getElementById(id)?.addEventListener("input", () => updateCanvas()));
    sync();
})();

// 카멜리아 장미 로고를 흑백(검정 실루엣, 도트는 투명)으로 만든 장식용 이미지
const ROSE_FRAME_IMG = "data:image/png;base64,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";

// 테두리 장식용 이미지들. 장미/음표 하트 각각 "원본 색"과 "검정 실루엣(도트는 투명)" 두 종류.
// 흰색은 검정 실루엣에 필터를 씌워서 만든다.
const ROSE_FRAME_IMG_COLOR = "data:image/png;base64,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";
const CLEF_FRAME_IMG_COLOR = "data:image/png;base64,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";
const CLEF_FRAME_IMG_BW = "data:image/png;base64,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";
function pickFrameImage(style, color) {
    if (style === "clef") return color === "original" ? CLEF_FRAME_IMG_COLOR : CLEF_FRAME_IMG_BW;
    return color === "original" ? ROSE_FRAME_IMG_COLOR : ROSE_FRAME_IMG;
}

function renderFrameDecoration() {
    const layer = document.getElementById("frameDecorLayer");
    const capture = document.getElementById("captureArea");
    if (!layer || !capture) return;
    const style = document.getElementById("frameStyle")?.value || "none";
    layer.innerHTML = "";
    if (style === "none") return;

    const ink = document.getElementById("globalTextColor")?.value || "#000000";
    const w = capture.clientWidth, h = capture.clientHeight;
    if (!w || !h) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.display = "block";

    // 캔버스 크기에 비례해서 여백을 잡아야 작은 미리보기/큰 내보내기 어디서든 비율이 같다.
    const offset = Math.max(14, Math.round(Math.min(w, h) * 0.045));

    if (style === "line") {
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", offset);
        rect.setAttribute("y", offset);
        rect.setAttribute("width", Math.max(0, w - offset * 2));
        rect.setAttribute("height", Math.max(0, h - offset * 2));
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", ink);
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("opacity", "0.16");
        svg.appendChild(rect);
    } else if (style === "corner") {
        const symbol = (document.getElementById("frameSymbol")?.value || "✦").trim() || "✦";
        const gap = Math.max(8, Math.round(offset * 0.42));
        const symSize = Math.max(12, Math.round(offset * 0.5));

        const addLine = (x1, y1, x2, y2) => {
            const l = document.createElementNS(svgNS, "line");
            l.setAttribute("x1", x1);
            l.setAttribute("y1", y1);
            l.setAttribute("x2", x2);
            l.setAttribute("y2", y2);
            l.setAttribute("stroke", ink);
            l.setAttribute("stroke-width", "1");
            l.setAttribute("opacity", "0.16");
            svg.appendChild(l);
        };
        // 네 모서리의 L자 괄호 (카메라 뷰파인더 모양) — 모서리 지점 자체는 비워두고 기호를 올림
        addLine(offset + gap, offset, w - offset - gap, offset);
        addLine(offset + gap, h - offset, w - offset - gap, h - offset);
        addLine(offset, offset + gap, offset, h - offset - gap);
        addLine(w - offset, offset + gap, w - offset, h - offset - gap);

        const addSymbol = (x, y) => {
            const t = document.createElementNS(svgNS, "text");
            t.setAttribute("x", x);
            t.setAttribute("y", y);
            t.setAttribute("text-anchor", "middle");
            t.setAttribute("dominant-baseline", "central");
            t.setAttribute("font-size", symSize);
            t.setAttribute("fill", ink);
            t.setAttribute("opacity", "0.55");
            t.textContent = symbol;
            svg.appendChild(t);
        };
        addSymbol(offset, offset);
        addSymbol(w - offset, offset);
        addSymbol(offset, h - offset);
        addSymbol(w - offset, h - offset);
    } else if (style === "rose" || style === "clef") {
        const color = document.getElementById("frameRoseColor")?.value || "black";
        const pos = document.getElementById("frameRosePos")?.value || "four";
        const sizePct = parseFloat(document.getElementById("frameRoseSize")?.value) || 20;
        const opacity = parseFloat(document.getElementById("frameRoseOpacity")?.value) || 0.9;
        const size = Math.round(Math.min(w, h) * sizePct / 100);
        const margin = Math.max(8, Math.round(Math.min(w, h) * 0.035));
        const xlinkNS = "http://www.w3.org/1999/xlink";

        if (color === "white") {
            // 검정 실루엣을 흰색으로 바꿔주는 필터 (이미지 한 장으로 두 색을 모두 지원)
            const defs = document.createElementNS(svgNS, "defs");
            const filter = document.createElementNS(svgNS, "filter");
            filter.setAttribute("id", "roseWhiteFilter");
            filter.setAttribute("color-interpolation-filters", "sRGB");
            const cm = document.createElementNS(svgNS, "feColorMatrix");
            cm.setAttribute("type", "matrix");
            cm.setAttribute("values", "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0");
            filter.appendChild(cm);
            defs.appendChild(filter);
            svg.appendChild(defs);
        }

        const addRose = (x, y, rotate) => {
            const g = document.createElementNS(svgNS, "g");
            g.setAttribute("transform", `rotate(${rotate} ${x + size / 2} ${y + size / 2})`);
            const img = document.createElementNS(svgNS, "image");
            img.setAttribute("x", x);
            img.setAttribute("y", y);
            img.setAttribute("width", size);
            img.setAttribute("height", size);
            img.setAttribute("preserveAspectRatio", "xMidYMid meet");
            const src = pickFrameImage(style, color);
            img.setAttribute("href", src);
            img.setAttributeNS(xlinkNS, "xlink:href", src);
            img.setAttribute("opacity", opacity);
            if (color === "white") img.setAttribute("filter", "url(#roseWhiteFilter)");
            g.appendChild(img);
            svg.appendChild(g);
        };

        const left = margin, top = margin;
        const right = w - margin - size, bottom = h - margin - size;
        if (pos === "single") {
            addRose(right, bottom, 12);
        } else if (pos === "diag") {
            addRose(left, top, -12);
            addRose(right, bottom, 12);
        } else {
            addRose(left, top, -12);
            addRose(right, top, 12);
            addRose(left, bottom, 12);
            addRose(right, bottom, -12);
        }
    }

    layer.appendChild(svg);
}

(function setupFrameDecoration() {
    const symbolArea = document.getElementById("frameSymbolArea");
    const hint = document.getElementById("frameHint");

    function syncVisibility() {
        const style = document.getElementById("frameStyle")?.value || "none";
        const show = style === "corner";
        if (symbolArea) symbolArea.style.display = show ? "" : "none";
        if (hint) hint.style.display = show ? "" : "none";
        const showRose = style === "rose" || style === "clef";
        ["frameRoseColorArea", "frameRosePosArea", "frameRoseSizeArea", "frameRoseOpacityArea"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = showRose ? "" : "none";
        });
    }

    document.querySelectorAll('.segmented-control[data-target="frameStyle"] button').forEach((btn) => {
        btn.addEventListener("click", () => {
            // 제너릭 segmented-control 핸들러가 hidden input 값/active class/updateCanvas()를
            // 이미 처리해주지만, 심볼 입력창 표시 여부는 여기서 별도로 맞춰준다.
            setTimeout(syncVisibility, 0);
        });
    });

    document.getElementById("frameSymbol")?.addEventListener("input", () => {
        if (typeof updateCanvas === "function") updateCanvas();
    });

    ["frameRoseSize", "frameRoseOpacity"].forEach((id) => {
        document.getElementById(id)?.addEventListener("input", () => {
            if (typeof updateCanvas === "function") updateCanvas();
        });
    });
    ["frameRoseColor", "frameRosePos"].forEach((id) => {
        document.querySelectorAll(`.segmented-control[data-target="${id}"] button`).forEach((btn) => {
            btn.addEventListener("click", () => setTimeout(() => { if (typeof updateCanvas === "function") updateCanvas(); }, 0));
        });
    });

    syncVisibility();
})();

// ==========================================================================
// 캔버스 스티커: 갖고 있는 사진(투명 PNG 포함)을 캔버스 위에 자유롭게 붙이기
// <img> 태그를 그대로 쓰기 때문에 PNG의 투명 배경은 브라우저가 알아서 그대로 살려준다
// (따로 처리할 필요 없음 — background-color를 깔지만 않으면 됨).
// ==========================================================================
(function setupStickers() {
    const input = document.getElementById("stickerInput");
    const layer = document.getElementById("stickerLayer");
    const capture = document.getElementById("captureArea");
    if (!input || !layer || !capture) return;

    let currentSticker = null;
    let stickerSeq = 0;

    // ---- 스티커 보관함: 한 번 등록한 사진은 브라우저(IndexedDB)에 저장해 두고 다음에도 꺼내 쓴다 ----
    const STICKER_DB = "camelia-stickers";
    const STICKER_STORE = "stickers";
    const STICKER_MAX_SIDE = 1024; // 너무 큰 사진은 줄여서 저장 (용량 절약)
    const libraryEl = document.getElementById("stickerLibrary");
    let dbPromise = null;

    function openStickerDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(new Error("IndexedDB 미지원"));
            const req = indexedDB.open(STICKER_DB, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(STICKER_STORE, { keyPath: "id" });
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return dbPromise;
    }
    async function dbRun(mode, fn) {
        const db = await openStickerDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STICKER_STORE, mode);
            const req = fn(tx.objectStore(STICKER_STORE));
            tx.oncomplete = () => resolve(req && req.result);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    }
    const dbAllStickers = () => dbRun("readonly", (s) => s.getAll()).then((list) => (list || []).sort((a, b) => a.created - b.created));
    const dbPutSticker = (rec) => dbRun("readwrite", (s) => s.put(rec));
    const dbDeleteSticker = (id) => dbRun("readwrite", (s) => s.delete(id));

    function quickHash(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i += 7) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
        return `s${(h >>> 0).toString(36)}_${str.length.toString(36)}`;
    }

    // 큰 사진만 줄이고(투명 PNG는 PNG 그대로), 작은 사진은 원본 그대로 보관
    function prepareStickerImage(dataUrl, mime) {
        return new Promise((resolve) => {
            const probe = new Image();
            probe.onload = () => {
                const w = probe.naturalWidth, h = probe.naturalHeight;
                const longest = Math.max(w, h);
                if (longest <= STICKER_MAX_SIDE) return resolve({ dataUrl, w, h });
                const k = STICKER_MAX_SIDE / longest;
                const cw = Math.round(w * k), ch = Math.round(h * k);
                const cv = document.createElement("canvas");
                cv.width = cw; cv.height = ch;
                cv.getContext("2d").drawImage(probe, 0, 0, cw, ch);
                const keepAlpha = /png|webp|gif/.test(mime || "");
                resolve({ dataUrl: keepAlpha ? cv.toDataURL("image/png") : cv.toDataURL("image/jpeg", 0.9), w: cw, h: ch });
            };
            probe.onerror = () => resolve(null);
            probe.src = dataUrl;
        });
    }

    async function renderStickerLibrary() {
        if (!libraryEl) return;
        let items = [];
        try { items = await dbAllStickers(); } catch (err) { items = []; }
        libraryEl.innerHTML = "";
        if (!items.length) {
            const empty = document.createElement("div");
            empty.className = "sticker-library-empty";
            empty.textContent = "아직 보관한 스티커가 없어요. 위에서 사진을 추가해 보세요!";
            libraryEl.appendChild(empty);
            return;
        }
        items.forEach((rec) => {
            const cell = document.createElement("div");
            cell.className = "sticker-lib-item";

            const useBtn = document.createElement("button");
            useBtn.type = "button";
            useBtn.className = "sticker-lib-use";
            useBtn.title = "캔버스에 붙이기";
            const thumb = document.createElement("img");
            thumb.src = rec.dataUrl;
            thumb.alt = "";
            thumb.draggable = false;
            useBtn.appendChild(thumb);
            useBtn.addEventListener("click", () => createSticker(rec.dataUrl, rec.w, rec.h));

            const del = document.createElement("button");
            del.type = "button";
            del.className = "sticker-lib-del";
            del.title = "보관함에서 지우기";
            del.textContent = "✕";
            del.addEventListener("click", async () => {
                if (!window.confirm("이 스티커를 보관함에서 지울까요? 이미 캔버스에 붙인 건 그대로 남아요.")) return;
                try { await dbDeleteSticker(rec.id); } catch (err) {}
                renderStickerLibrary();
            });

            cell.appendChild(useBtn);
            cell.appendChild(del);
            libraryEl.appendChild(cell);
        });
    }

    // 브라우저가 저장 공간을 마음대로 비우지 않도록 요청 (지원하는 브라우저에서만 동작)
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (err) {}
    renderStickerLibrary();

    function selectSticker(item) {
        if (currentSticker && currentSticker !== item) currentSticker.classList.remove("selected");
        currentSticker = item;
        if (item) item.classList.add("selected");
        const area = document.getElementById("stickerLayerArea");
        if (area) area.style.display = item ? "" : "none";
    }

    // 캔버스 빈 곳을 누르면 선택 해제
    capture.addEventListener("pointerdown", (e) => {
        if (!e.target.closest(".sticker-item")) selectSticker(null);
    });

    function createSticker(dataUrl, naturalW, naturalH) {
        stickerSeq += 1;
        const item = document.createElement("div");
        item.className = "sticker-item no-export-outline";
        item.dataset.stickerId = String(stickerSeq);

        // 처음 올릴 때 캔버스 폭의 30% 정도 크기로, 비율은 사진 그대로 유지
        const capW = capture.clientWidth || 360;
        const startW = Math.max(40, Math.round(capW * 0.3));
        const ratio = naturalW && naturalH ? naturalW / naturalH : 1;
        const startH = Math.max(40, Math.round(startW / ratio));

        item.style.width = `${startW}px`;
        item.style.height = `${startH}px`;
        item.style.left = `${Math.round((capture.clientWidth - startW) / 2)}px`;
        item.style.top = `${Math.round((capture.clientHeight - startH) / 2)}px`;

        const img = document.createElement("img");
        img.src = dataUrl;
        img.draggable = false;
        item.appendChild(img);

        const delHandle = document.createElement("div");
        delHandle.className = "sticker-delete-handle no-export";
        delHandle.textContent = "✕";
        item.appendChild(delHandle);

        const resizeHandle = document.createElement("div");
        resizeHandle.className = "sticker-resize-handle no-export";
        item.appendChild(resizeHandle);

        layer.appendChild(item);
        attachStickerInteractions(item, resizeHandle, delHandle, ratio);
        selectSticker(item);
        return item;
    }

    function attachStickerInteractions(item, resizeHandle, delHandle, ratio) {
        // ---- 본체를 누르면 선택 + 드래그로 이동 ----
        let dragging = false;
        let startX, startY, startLeft, startTop;

        item.addEventListener("pointerdown", (e) => {
            if (e.target === resizeHandle || e.target === delHandle) return;
            e.preventDefault();
            e.stopPropagation();
            selectSticker(item);
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(item.style.left) || 0;
            startTop = parseFloat(item.style.top) || 0;
            try { item.setPointerCapture(e.pointerId); } catch (err) {}
        });
        item.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            e.preventDefault();
            item.style.left = `${startLeft + (e.clientX - startX)}px`;
            item.style.top = `${startTop + (e.clientY - startY)}px`;
        });
        const stopDrag = () => { dragging = false; };
        item.addEventListener("pointerup", stopDrag);
        item.addEventListener("pointercancel", stopDrag);

        // ---- 모서리 핸들 = 크기 조절 (비율 고정) ----
        let resizing = false;
        let rStartX, rStartW;
        resizeHandle.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectSticker(item);
            resizing = true;
            rStartX = e.clientX;
            rStartW = parseFloat(item.style.width) || item.offsetWidth;
            try { resizeHandle.setPointerCapture(e.pointerId); } catch (err) {}
        });
        resizeHandle.addEventListener("pointermove", (e) => {
            if (!resizing) return;
            e.preventDefault();
            const newW = Math.max(24, Math.round(rStartW + (e.clientX - rStartX)));
            item.style.width = `${newW}px`;
            item.style.height = `${Math.max(24, Math.round(newW / ratio))}px`;
        });
        const stopResize = () => { resizing = false; };
        resizeHandle.addEventListener("pointerup", stopResize);
        resizeHandle.addEventListener("pointercancel", stopResize);

        // ---- 삭제 ----
        const removeThisSticker = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!item.isConnected) return;
            item.remove();
            if (currentSticker === item) selectSticker(null);
        };
        delHandle.addEventListener("pointerdown", removeThisSticker);
        // 일부 기기에서 pointerdown이 먹히지 않는 경우를 대비해 click/touchend도 같이 처리
        delHandle.addEventListener("click", removeThisSticker);
        delHandle.addEventListener("touchend", removeThisSticker, { passive: false });
    }

    input.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const prepared = await prepareStickerImage(ev.target.result, file.type);
                if (!prepared) return;
                createSticker(prepared.dataUrl, prepared.w, prepared.h);
                // 보관함에 저장 (같은 사진이면 중복 저장하지 않음)
                try {
                    await dbPutSticker({ id: quickHash(prepared.dataUrl), dataUrl: prepared.dataUrl, w: prepared.w, h: prepared.h, created: Date.now() });
                    renderStickerLibrary();
                } catch (err) {
                    if (typeof showToast === "function") showToast("보관함에 저장하지 못했어요. 이번엔 캔버스에만 붙었어요.");
                }
            };
            reader.readAsDataURL(file);
        });
        input.value = ""; // 같은 파일을 다시 선택해도 change가 또 뜨도록
    });

    document.getElementById("btnStickerFront")?.addEventListener("click", () => {
        if (currentSticker) layer.appendChild(currentSticker); // 마지막 자식 = 맨 앞
    });
    document.getElementById("btnStickerBack")?.addEventListener("click", () => {
        if (currentSticker) layer.insertBefore(currentSticker, layer.firstChild); // 첫 자식 = 맨 뒤
    });
})();
