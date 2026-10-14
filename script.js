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
    editor.style.fontWeight = "400";
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
    if (typeof renderWatermarkLayer === "function") renderWatermarkLayer();
    if (typeof renderFrameDecoration === "function") renderFrameDecoration();
    if (typeof syncColorSwatches === "function") syncColorSwatches();
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
    if (typeof renderWatermarkLayer === "function") renderWatermarkLayer();
    if (typeof renderFrameDecoration === "function") renderFrameDecoration();
    if (typeof applyPreviewScale === "function") applyPreviewScale();
}
function scheduleRefitAfterFonts() {
    if (!document.fonts || typeof document.fonts.load !== "function" || !els.fontSelect) return;
    const token = ++__fontRefitToken;
    const family = els.fontSelect.value;
    const weight = "400";
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
        stripStaleTypography(els.editor);
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
        textWrapper.style.fontWeight = "400";
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
        // 장평(가로 늘이기/줄이기)은 scaleX로 처리하므로, 늘어나는 만큼 미리 폭을 나눠서 잡아야
        // 화면에 보이는 폭이 정확히 '텍스트 블록 너비'가 된다. (예전엔 여기서 장평 보정이 지워져서
        // 장평을 바꾸면 오른쪽 여백이 줄거나 글이 오른쪽으로 삐져나왔다)
        const blockScale = (parseFloat(els.fontScaleX?.value) || 100) / 100;
        textWrapper.style.width = `${blockWidth / blockScale}%`;
        textWrapper.style.marginLeft = "0";
        const blockAnchor = els.textHorizontalAnchor?.value || "center";
        textWrapper.style.transformOrigin = blockAnchor === "flex-start" ? "left top" : blockAnchor === "flex-end" ? "right top" : "center top";
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
    // html2canvas로 저장할 때는 글자 높이가 화면보다 살짝 더 나오는 경우가 있어서 2% 여유를 둔다.
    const limit = targetH - Math.max(3, targetH * 0.02);
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
        const quoteRegex = /("[^"\n]*"|"[^"\n]*"|「[^」\n]*」|「[^」\n]*」|‹[^›\n]*›|«[^»\n]*»)/g;
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
    // 투명 배경으로 저장: 배경색/그라데이션/배경 사진/오버레이/그림자를 저장하는 순간만 잠깐 빼고,
    // 글자·스티커·테두리 장식·하프톤 같은 "올려둔 것들"만 PNG에 남긴다. (끝나면 restore에서 되돌림)
    if (document.getElementById("exportTransparent")?.checked) {
        container.__transparentSaved = {
            background: container.style.background,
            boxShadow: container.style.boxShadow,
            layers: ["bgImageLayer", "bgOverlayLayer"].map((id) => {
                const el = document.getElementById(id);
                const prev = el ? el.style.display : "";
                if (el) el.style.display = "none";
                return [el, prev];
            }),
        };
        container.style.background = "transparent";
        container.style.boxShadow = "none";
    }

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
    if (container.__transparentSaved) {
        const saved = container.__transparentSaved;
        container.style.background = saved.background;
        container.style.boxShadow = saved.boxShadow;
        saved.layers.forEach(([el, prev]) => { if (el) el.style.display = prev; });
        container.__transparentSaved = null;
    }

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
                const EXPORT_SCALE = getExportScale(els.captureArea);
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
    if (!editor || !nameInput || !avatarBox || !deleteBtn) return;

    if (id) {
        const c = characters.find((x) => x.id === id);
        if (!c) return;
        nameInput.value = c.name || "";
        avatarBox.style.backgroundImage = c.avatarData ? `url(${c.avatarData})` : "none";
        avatarBox.dataset.hasImage = c.avatarData ? "true" : "false";
        if (colorInput) colorInput.value = c.color || "#171717";
        deleteBtn.style.display = "block";
    } else {
        nameInput.value = "";
        avatarBox.style.backgroundImage = "none";
        avatarBox.dataset.hasImage = "false";
        if (colorInput) colorInput.value = "#171717";
        deleteBtn.style.display = "none";
    }

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
    let mode = document.getElementById("dialogueMode")?.value || "log";
    // 예전에 저장된 프리셋에 말풍선 모드가 남아 있으면 로그 모드로 바꿔준다
    if (mode !== "log" && mode !== "block") {
        mode = "log";
        const modeHidden = document.getElementById("dialogueMode");
        if (modeHidden) modeHidden.value = "log";
        document.querySelectorAll('.segmented-control[data-target="dialogueMode"] button').forEach((b) => b.classList.toggle("active", b.dataset.value === "log"));
    }
    const isLog = mode === "log";
    const isBlock = mode === "block";
    const areaMap = {
        dlgShowAvatarArea: isLog,
        dlgQuoteStyleArea: isLog,
        dlgTranslationArea: isLog,
        dlgContinuationGapArea: isLog,
        dlgLogOnlyTitle: isLog,
        dlgNameGapArea: isBlock,
        dlgBlockOnlyTitle: isBlock,
        dlgParagraphLayoutArea: isBlock
    };
    Object.keys(areaMap).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = areaMap[id] ? "" : "none";
    });
    const lineGapLabel = document.getElementById("dlgLineGapLabel");
    if (lineGapLabel) lineGapLabel.textContent = isLog ? "「대사(턴) 간 간격」" : "「대사 줄 사이 간격」";
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

    if (existing) {
        existing.name = name;
        existing.avatarData = avatarData;
        existing.color = color;
        updateExistingDialogueNames(existing.id);
    } else {
        characters.push({ id: uid(), name, avatarData, color });
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
    // 미연시 대사창 말투: 안내 문구 끝에 ♡를 붙인다 (실패/오류 안내에는 붙이지 않음)
    const isBad = /실패|오류|못|없|불가|부족|확인|다시/.test(message);
    const hasMark = /[♡♥!?…]|[\u{1F300}-\u{1FAFF}]/u.test(message);
    toast.textContent = isBad || hasMark ? message : `${message} ♡`;
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
        els.fontSelect, els.wordBreak, els.fontSize, els.letterSpacing, els.lineHeight,
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

// 저장/복사 직전에 한 번 더 맞춰 두기:
// 폰트가 다 불러와진 뒤 글자 크기(자동 축소)/장식 위치를 지금 설정 기준으로 다시 계산해서,
// 화면에 보이는 그대로 저장되게 한다.
async function syncBeforeExport() {
    try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
    } catch (e) {}
    try {
        if (typeof refitCanvasNow === "function") refitCanvasNow();
    } catch (e) {}
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

document.getElementById("btnCopy").addEventListener("click", async () => {
    if (!els.captureArea) return;
    await syncBeforeExport();
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
    html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: getExportScale(els.captureArea) })
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
    await syncBeforeExport();
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
    html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: getExportScale(els.captureArea) })
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
            reader.onload = async (event) => {
                let dataURL = event.target.result;
                const conv = await maybeAsciiConvert(dataURL);
                if (conv) dataURL = conv.dataUrl;
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
        r.onload = async (ev) => {
            let srcData = ev.target.result;
            const conv = await maybeAsciiConvert(srcData);
            if (conv) srcData = conv.dataUrl;
            const im = new Image();
            im.onload = () => {
                Object.assign(sideImg, { src: srcData, nw: im.naturalWidth, nh: im.naturalHeight, posX: 50, posY: 50 });
                updateCanvas();
            };
            im.src = srcData;
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
// 색 선택칸 꾸미기: 아이폰 사파리는 <input type="color">에 무지개 링을 억지로 그려서
// CSS로는 지울 수 없다. 그래서 진짜 입력칸은 투명하게 위에 겹쳐 두고(터치/선택은 그대로 동작),
// 눈에 보이는 건 직접 그린 동그란 색 견본으로 바꾼다.
// ==========================================================================
function wrapColorInputs() {
    document.querySelectorAll('input[type="color"]').forEach((input) => {
        if (input.__swatchDot) return;
        const wrap = document.createElement("span");
        wrap.className = "color-swatch-wrap";
        const dot = document.createElement("span");
        dot.className = "color-swatch-dot";
        dot.style.background = input.value;
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(dot);
        wrap.appendChild(input);
        input.__swatchDot = dot;
    });
}
function syncColorSwatches() {
    wrapColorInputs();
    document.querySelectorAll('input[type="color"]').forEach((input) => {
        if (input.__swatchDot) input.__swatchDot.style.background = input.value;
    });
}
["input", "change"].forEach((evt) => {
    document.addEventListener(evt, (e) => {
        const t = e.target;
        if (t && t.type === "color" && t.__swatchDot) t.__swatchDot.style.background = t.value;
    }, true);
});
wrapColorInputs();

// ==========================================================================
// 색 팔레트: 누르면 배경/글자/보조색/강조선/구분선/하프톤 색이 한 번에 바뀐다 (글 내용은 그대로)
// ==========================================================================
(function setupColorPalettes() {
    const grid = document.getElementById("paletteGrid");
    if (!grid) return;

    // bg 배경, text 글자, sub 보조색, accent 강조선+하프톤, divider 구분선
    const PALETTES = [
        { name: "로즈 핑크", bg: "#fff5f8", text: "#3a2a31", sub: "#b83b73", accent: "#e62c7a", divider: "#e8b4c8" },
        { name: "크림 모노", bg: "#faf7f2", text: "#222222", sub: "#8a8279", accent: "#222222", divider: "#cfc8bd" },
        { name: "블랙 로즈", bg: "#151215", text: "#f5eef1", sub: "#e8719f", accent: "#e62c7a", divider: "#4a3a42" },
        { name: "민트 소다", bg: "#f1fbf7", text: "#1f3a33", sub: "#3f9b86", accent: "#6fcfb4", divider: "#bfe3d8" },
        { name: "라벤더 밀크", bg: "#f6f3ff", text: "#2d2840", sub: "#7a62c9", accent: "#b9a6f2", divider: "#d6cdf5" },
        { name: "레몬 버터", bg: "#fffbe8", text: "#3a3320", sub: "#b58a12", accent: "#f2c94c", divider: "#efe2a8" },
        { name: "스카이 블루", bg: "#eff7ff", text: "#1d2f45", sub: "#3a7bd5", accent: "#7fb5ee", divider: "#c5dcf4" },
        { name: "버건디", bg: "#f7ece9", text: "#3b1f24", sub: "#9c2f45", accent: "#9c2f45", divider: "#e2c4c0" },
        { name: "미드나잇", bg: "#14192b", text: "#eef0fa", sub: "#8fa2ff", accent: "#5b6bff", divider: "#39415f" },
    ];

    const PALETTE_KEYS = ["bgType", "bgColor1", "globalTextColor", "subTextColor", "quoteLineColor", "dividerColor", "halftoneColor"];
    let appliedIdx = -1;
    let beforeSnap = null;
    const markApplied = () => {
        grid.querySelectorAll(".palette-chip").forEach((c, i) => c.classList.toggle("applied", i === appliedIdx));
    };

    PALETTES.forEach((p, idx) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "palette-chip";

        const preview = document.createElement("span");
        preview.className = "palette-chip-preview";
        preview.style.background = p.bg;
        preview.innerHTML = '<span class="pc-cg"></span><span class="pc-main">Aa</span><span class="pc-sub">가나</span><span class="pc-dot"></span>';
        const cg = preview.querySelector(".pc-cg");
        cg.textContent = `CG ${String(idx + 1).padStart(2, "0")}`;
        cg.style.color = p.sub;
        preview.querySelector(".pc-main").style.color = p.text;
        preview.querySelector(".pc-sub").style.color = p.sub;
        preview.querySelector(".pc-dot").style.background = p.accent;

        const name = document.createElement("span");
        name.className = "palette-chip-name";
        name.textContent = p.name;

        chip.appendChild(preview);
        chip.appendChild(name);
        chip.addEventListener("click", () => {
            if (typeof applyPresetSnapshot !== "function") return;

            // 이미 적용 중인 팔레트를 다시 누르면 → 팔레트를 누르기 전 색으로 되돌린다
            if (appliedIdx === idx && beforeSnap) {
                applyPresetSnapshot(beforeSnap);
                appliedIdx = -1;
                beforeSnap = null;
                markApplied();
                if (typeof showToast === "function") showToast(`${p.name} 팔레트 적용을 취소했어요`);
                return;
            }
            // 처음 누를 때만 "누르기 전 색"을 기억 (팔레트끼리 갈아타도 맨 처음 색으로 돌아갈 수 있게)
            if (appliedIdx === -1 && typeof getPresetSnapshot === "function") {
                const full = getPresetSnapshot();
                beforeSnap = {};
                PALETTE_KEYS.forEach((k) => { beforeSnap[k] = full[k]; });
            }
            appliedIdx = idx;
            markApplied();
            applyPresetSnapshot({
                bgType: "solid",
                bgColor1: p.bg,
                globalTextColor: p.text,
                subTextColor: p.sub,
                quoteLineColor: p.accent,
                dividerColor: p.divider,
                halftoneColor: p.accent,
            });
            if (typeof showToast === "function") showToast(`${p.name} 팔레트를 적용했어요`);
        });
        grid.appendChild(chip);
    });
})();

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
// 워터마크: 줄무늬 / 점자 도트로 만든 큰 장미·음표 하트를 글자 뒤에 옅게 깔기
// ==========================================================================
function renderWatermarkLayer() {
    const layer = document.getElementById("watermarkLayer");
    const capture = document.getElementById("captureArea");
    if (!layer || !capture) return;
    layer.innerHTML = "";

    const type = document.getElementById("wmType")?.value || "none";
    if (type === "none" || typeof DECOR_IMG === "undefined" || !DECOR_IMG[type]) return;

    const w = capture.clientWidth, h = capture.clientHeight;
    if (!w || !h) return;

    const color = document.getElementById("wmColor")?.value || "#e62c7a";
    const sizePct = parseFloat(document.getElementById("wmSize")?.value) || 70;
    const opacity = parseFloat(document.getElementById("wmOpacity")?.value) || 0.25;
    const pos = document.getElementById("wmPos")?.value || "center";

    const ratio = DECOR_RATIO[type] || 1;
    let bw = Math.min(w, h) * sizePct / 100;
    let bh = bw / ratio;
    if (bw > w * 1.2) { bw = w * 1.2; bh = bw / ratio; }
    const x = (w - bw) / 2;
    const gap = h * 0.04;
    const y = pos === "top" ? gap : pos === "bottom" ? h - bh - gap : (h - bh) / 2;

    const svgNS = "http://www.w3.org/2000/svg";
    const xlinkNS = "http://www.w3.org/1999/xlink";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.display = "block";
    appendTintFilter(svg, "wmTintFilter", color);

    const img = document.createElementNS(svgNS, "image");
    img.setAttribute("x", x);
    img.setAttribute("y", y);
    img.setAttribute("width", bw);
    img.setAttribute("height", bh);
    img.setAttribute("preserveAspectRatio", "xMidYMid meet");
    img.setAttribute("href", DECOR_IMG[type]);
    img.setAttributeNS(xlinkNS, "xlink:href", DECOR_IMG[type]);
    img.setAttribute("opacity", opacity);
    img.setAttribute("filter", "url(#wmTintFilter)");
    svg.appendChild(img);
    layer.appendChild(svg);
}

(function setupWatermark() {
    const typeEl = document.getElementById("wmType");
    if (!typeEl) return;
    const areas = ["wmColorArea", "wmSizeArea", "wmPosArea", "wmOpacityArea"];
    const sync = () => {
        const on = typeEl.value !== "none";
        areas.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = on ? "" : "none";
        });
    };
    ["change"].forEach((evt) => {
        typeEl.addEventListener(evt, () => { sync(); updateCanvas(); });
        document.getElementById("wmPos")?.addEventListener(evt, () => updateCanvas());
    });
    ["wmColor", "wmSize", "wmOpacity"].forEach((id) => document.getElementById(id)?.addEventListener("input", () => updateCanvas()));
    sync();
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
const DOT_FRAME_STYLES = ["dotrose", "dotclef", "dotvine"];
const ROSE_LIKE_FRAME_STYLES = ["rose", "clef", "dotrose", "dotclef", "dotvine"];

function pickFrameImage(style, color) {
    // dot* 는 decor-assets.js 의 점자 도트 이미지(검정). 색은 아래 필터로 입힌다.
    if (style === "dotrose") return DECOR_IMG.dotRose;
    if (style === "dotclef") return DECOR_IMG.dotClef;
    if (style === "dotvine") return DECOR_IMG.dotVine;
    if (style === "clef") return color === "original" ? CLEF_FRAME_IMG_COLOR : CLEF_FRAME_IMG_BW;
    return color === "original" ? ROSE_FRAME_IMG_COLOR : ROSE_FRAME_IMG;
}

// 검정 이미지에 입힐 색. null이면 이미지 그대로.
// 흰색은 항상 흰 실루엣, 점자 장식의 "원본"은 로고 핑크로 보여준다.
function frameTintHex(style, color) {
    if (color === "white") return "#ffffff";
    if (DOT_FRAME_STYLES.includes(style) && color === "original") return "#e62c7a";
    return null;
}

// 검정(불투명도만 있는) 이미지를 원하는 색으로 바꿔주는 SVG 필터를 svg 안에 넣는다.
function appendTintFilter(svg, id, hex) {
    const svgNS = "http://www.w3.org/2000/svg";
    const n = parseInt(String(hex).replace("#", ""), 16) || 0;
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const defs = document.createElementNS(svgNS, "defs");
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", id);
    filter.setAttribute("color-interpolation-filters", "sRGB");
    const cm = document.createElementNS(svgNS, "feColorMatrix");
    cm.setAttribute("type", "matrix");
    cm.setAttribute("values", `0 0 0 0 ${r.toFixed(3)}  0 0 0 0 ${g.toFixed(3)}  0 0 0 0 ${b.toFixed(3)}  0 0 0 1 0`);
    filter.appendChild(cm);
    defs.appendChild(filter);
    svg.appendChild(defs);
}

// 캔버스 가장자리를 따라 문구가 한 바퀴 도는 "글자 테두리".
// SVG <text>는 저장할 때 웹폰트를 못 쓰기 때문에, 페이지에 로드된 폰트를 그대로 쓰는 <canvas>로 그린다.
function renderEdgeTextBorder(layer, w, h) {
    const text = (document.getElementById("frameEdgeText")?.value || "").trim();
    if (!text) return;
    const fontFamily = document.getElementById("frameEdgeFont")?.value || "serif";
    const pct = parseFloat(document.getElementById("frameEdgeSize")?.value) || 8;
    const colorKey = document.getElementById("frameRoseColor")?.value || "black";
    const opacity = parseFloat(document.getElementById("frameRoseOpacity")?.value) || 0.9;
    const ink = colorKey === "white" ? "#ffffff" : colorKey === "original" ? "#e62c7a" : "#1a1a1a";
    const base = Math.min(w, h);
    const fs = Math.max(8, Math.round(base * pct / 100));
    const inset = Math.round(base * 0.02);
    const band = fs * 1.15;
    const dpr = 2;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;opacity:${opacity};`;
    layer.appendChild(canvas);

    const unitText = text + "  ";
    const draw = () => {
        const ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = ink;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = `${fs}px ${fontFamily}`;
        const unitW = ctx.measureText(unitText).width || 1;

        // 길이에 딱 맞게 반복 횟수를 정하고, 남는 오차는 가로로 살짝 늘려서 끝이 안 잘리게 한다.
        const drawLine = (len) => {
            if (len <= 10) return;
            const n = Math.max(1, Math.round(len / unitW));
            const sx = len / (n * unitW);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, -band, len, band * 2);
            ctx.clip();
            ctx.scale(sx, 1);
            for (let i = 0; i < n; i++) ctx.fillText(unitText, i * unitW, 0);
            ctx.restore();
        };

        const c = inset + band / 2; // 한 줄의 가운데선
        const topLen = w - inset * 2;
        const sideLen = h - 2 * (inset + band);
        ctx.save(); ctx.translate(inset, c); drawLine(topLen); ctx.restore();                              // 위
        ctx.save(); ctx.translate(w - c, inset + band); ctx.rotate(Math.PI / 2); drawLine(sideLen); ctx.restore(); // 오른쪽(위→아래)
        ctx.save(); ctx.translate(inset, h - c); drawLine(topLen); ctx.restore();                          // 아래
        ctx.save(); ctx.translate(c, h - inset - band); ctx.rotate(-Math.PI / 2); drawLine(sideLen); ctx.restore(); // 왼쪽(아래→위)
    };
    draw();
    // 글꼴이 아직 안 불러와졌을 수 있어서 불러온 뒤 한 번 더 그린다
    if (document.fonts && document.fonts.load) {
        document.fonts.load(`${fs}px ${fontFamily}`, text).then(() => { if (canvas.isConnected) draw(); }).catch(() => {});
    }
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

    if (style === "edgetext") {
        renderEdgeTextBorder(layer, w, h);
        return;
    }

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
    } else if (style === "dotvine") {
        // 모서리 덩굴: 왼쪽 위 모양 그림 하나를 뒤집어서 네 모서리에 맞춘다
        const color = document.getElementById("frameRoseColor")?.value || "black";
        const pos = document.getElementById("frameRosePos")?.value || "four";
        const sizePct = parseFloat(document.getElementById("frameRoseSize")?.value) || 20;
        const opacity = parseFloat(document.getElementById("frameRoseOpacity")?.value) || 0.9;
        const xlinkNS = "http://www.w3.org/1999/xlink";
        const base = Math.min(w, h);
        const ratio = DECOR_RATIO.dotVine || 0.8;
        // 슬라이더 20%일 때 짧은 변의 약 44% 크기. 캔버스가 납작해도 넘치지 않게 제한한다.
        const vw = Math.min(base * sizePct / 100 * 2.2, h * 0.9 * ratio, w * 0.9);
        const vh = vw / ratio;
        const m = Math.max(4, Math.round(base * 0.02));
        const tintHex = frameTintHex(style, color);
        if (tintHex) appendTintFilter(svg, "roseWhiteFilter", tintHex);

        const addVine = (corner) => {
            const x = corner.endsWith("r") ? w - m - vw : m;
            const y = corner.startsWith("b") ? h - m - vh : m;
            const sx = corner.endsWith("r") ? -1 : 1;
            const sy = corner.startsWith("b") ? -1 : 1;
            const g = document.createElementNS(svgNS, "g");
            g.setAttribute("transform", `translate(${x + vw / 2} ${y + vh / 2}) scale(${sx} ${sy}) translate(${-(x + vw / 2)} ${-(y + vh / 2)})`);
            const img = document.createElementNS(svgNS, "image");
            img.setAttribute("x", x);
            img.setAttribute("y", y);
            img.setAttribute("width", vw);
            img.setAttribute("height", vh);
            img.setAttribute("preserveAspectRatio", "xMidYMid meet");
            const src = pickFrameImage(style, color);
            img.setAttribute("href", src);
            img.setAttributeNS(xlinkNS, "xlink:href", src);
            img.setAttribute("opacity", opacity);
            if (tintHex) img.setAttribute("filter", "url(#roseWhiteFilter)");
            g.appendChild(img);
            svg.appendChild(g);
        };
        if (pos === "single") addVine("br");
        else if (pos === "diag") { addVine("tl"); addVine("br"); }
        else { addVine("tl"); addVine("tr"); addVine("bl"); addVine("br"); }
    } else if (["rose", "clef", "dotrose", "dotclef"].includes(style)) {
        const color = document.getElementById("frameRoseColor")?.value || "black";
        const pos = document.getElementById("frameRosePos")?.value || "four";
        const sizePct = parseFloat(document.getElementById("frameRoseSize")?.value) || 20;
        const opacity = parseFloat(document.getElementById("frameRoseOpacity")?.value) || 0.9;
        const size = Math.round(Math.min(w, h) * sizePct / 100);
        const margin = Math.max(8, Math.round(Math.min(w, h) * 0.035));
        const xlinkNS = "http://www.w3.org/1999/xlink";

        const tintHex = frameTintHex(style, color);
        if (tintHex) appendTintFilter(svg, "roseWhiteFilter", tintHex);

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
            if (tintHex) img.setAttribute("filter", "url(#roseWhiteFilter)");
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
        const isRoseLike = ROSE_LIKE_FRAME_STYLES.includes(style);
        const isEdge = style === "edgetext";
        const setShow = (id, on) => {
            const el = document.getElementById(id);
            if (el) el.style.display = on ? "" : "none";
        };
        setShow("frameRoseColorArea", isRoseLike || isEdge);
        setShow("frameRoseOpacityArea", isRoseLike || isEdge);
        setShow("frameRosePosArea", isRoseLike);
        setShow("frameRoseSizeArea", isRoseLike);
        setShow("frameEdgeTextArea", isEdge);
        setShow("frameEdgeFontArea", isEdge);
        setShow("frameEdgeSizeArea", isEdge);
    }

    // 글자 테두리 글꼴 목록 = 본문 글꼴 목록과 같은 것
    const fontSrc = document.getElementById("fontSelect");
    const edgeFont = document.getElementById("frameEdgeFont");
    if (fontSrc && edgeFont && !edgeFont.options.length) {
        Array.from(fontSrc.options).forEach((o) => {
            const opt = document.createElement("option");
            opt.value = o.value;
            opt.textContent = o.textContent;
            edgeFont.appendChild(opt);
        });
    }
    ["frameEdgeText", "frameEdgeSize"].forEach((id) => {
        document.getElementById(id)?.addEventListener("input", () => { if (typeof updateCanvas === "function") updateCanvas(); });
    });
    document.getElementById("frameEdgeFont")?.addEventListener("change", () => { if (typeof updateCanvas === "function") updateCanvas(); });

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
                let prepared = await prepareStickerImage(ev.target.result, file.type);
                if (!prepared) return;
                prepared = (await maybeAsciiConvert(prepared.dataUrl, prepared)) || prepared;
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

// ==========================================================================
// 값 변경 감시 도우미: 코드에서 input.value = ... 로 값을 바꿀 때도(프리셋 불러오기 등) 알림을 받는다
// ==========================================================================
function watchInputValue(el, fn) {
    const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    const own = Object.getOwnPropertyDescriptor(el, "value");
    const get = own ? own.get : proto.get;
    const set = own ? own.set : proto.set;
    Object.defineProperty(el, "value", {
        configurable: true,
        get() { return get.call(this); },
        set(v) {
            set.call(this, v);
            try { fn(this); } catch (e) {}
        }
    });
}

// ==========================================================================
// ♥ 숫자(눌러서 입력) % 숫자칸
// 기존 [-] 숫자 [+] 칸을 없애고, 같은 id의 원래 입력칸은 그대로 두어(숨김) 다른 코드가 읽는 값은 바뀌지 않는다.
// 화면에 보이는 숫자 = 원래 값 그대로.
// ==========================================================================
// 숫자는 입력한 값 그대로 쓰고, 뒤의 "%"는 디자인용 표시일 뿐이다 (값 변환 없음)

// 엘리베이터 버튼을 한 번 누를 때 바뀌는 크기 (예전 +/- 버튼과 같은 값)
const HEART_STEPS = {
    headingTitleSize: 1, headingSubtitleSize: 1, fontSize: 1, letterSpacing: 0.5, lineHeight: 2, paraSpacing: 2,
    indentSize: 0.5, fontScaleX: 1, infoFontSize: 1, canvasWidth: 50,
    paddingTop: 5, paddingBottom: 5, paddingLeft: 5, paddingRight: 5, textBlockWidth: 5,
    columnSplitIndex: 1, columnGap: 4, boxQuoteWidth: 1, dividerWidth: 0.5, fadeCount: 1, footnoteDividerWidth: 0.5,
    imgBlockSize: 10, imgBlockRadius: 2,
    dlgAvatarSize: 2, dlgNameFontSize: 1, dlgContinuationGap: 2, dlgNameGap: 2, dlgParagraphIndent: 2,
    dlgNameColumnWidth: 4, dlgLineGap: 2
};

(function setupHeartNumbers() {
    function fmt(n) {
        return String(Math.round(n * 10) / 10);
    }

    function init() {
        document.querySelectorAll(".stepper-minimal.heart-num").forEach((box) => {
            const orig = box.querySelector('input[type="number"]');
            if (!orig || box.dataset.heartReady) return;
            box.dataset.heartReady = "1";
            const minAttr = orig.getAttribute("min");
            const maxAttr = orig.getAttribute("max");

            const shown = document.createElement("input");
            shown.type = "text";
            shown.inputMode = "decimal";
            shown.className = "heart-num-input";
            shown.autocomplete = "off";
            shown.setAttribute("aria-label", orig.id);
            orig.style.display = "none";
            orig.insertAdjacentElement("afterend", shown);

            const toShown = (v) => {
                const n = parseFloat(v);
                if (isNaN(n)) return "";
                return String(n);
            };
            const toValue = (txt) => {
                const n = parseFloat(String(txt).replace(",", "."));
                if (isNaN(n)) return null;
                let v = n;
                if (minAttr !== null && minAttr !== "" && v < parseFloat(minAttr)) v = parseFloat(minAttr);
                if (maxAttr !== null && maxAttr !== "" && v > parseFloat(maxAttr)) v = parseFloat(maxAttr);
                return v;
            };

            const refresh = () => {
                if (document.activeElement === shown) return; // 입력 중에는 덮어쓰지 않음
                shown.value = toShown(orig.value);
            };
            watchInputValue(orig, refresh);
            shown.value = toShown(orig.value);

            shown.addEventListener("focus", () => setTimeout(() => { try { shown.select(); } catch (e) {} }, 0));
            shown.addEventListener("input", () => {
                const v = toValue(shown.value);
                if (v === null) return;
                orig.value = v;
                orig.dispatchEvent(new Event("input", { bubbles: true }));
            });
            shown.addEventListener("change", () => {
                const v = toValue(shown.value);
                if (v !== null) {
                    orig.value = v;
                    orig.dispatchEvent(new Event("input", { bubbles: true }));
                    orig.dispatchEvent(new Event("change", { bubbles: true }));
                }
                shown.value = toShown(orig.value);
            });
            shown.addEventListener("blur", () => { shown.value = toShown(orig.value); });
            shown.addEventListener("keydown", (e) => { if (e.key === "Enter") shown.blur(); });

            // 칸 전체에 물방울 무늬 배경을 입히기 위해 바깥 행에 표시를 달아둔다
            box.closest(".control-minimal-row")?.classList.add("row-dots");

            // ---- 엘리베이터 버튼 (▲ 늘리기 / ▼ 줄이기) ----
            const step = HEART_STEPS[orig.id] || 1;
            const decimals = (n) => (String(n).split(".")[1] || "").length;
            const nudge = (dir) => {
                const cur = parseFloat(orig.value);
                const base = isNaN(cur) ? 0 : cur;
                const prec = Math.max(decimals(step), Math.min(decimals(base), 2));
                let v = parseFloat((base + dir * step).toFixed(prec));
                if (minAttr !== null && minAttr !== "" && v < parseFloat(minAttr)) v = parseFloat(minAttr);
                if (maxAttr !== null && maxAttr !== "" && v > parseFloat(maxAttr)) v = parseFloat(maxAttr);
                if (document.activeElement === shown) shown.blur();
                orig.value = v;
                orig.dispatchEvent(new Event("input", { bubbles: true }));
            };
            const elev = document.createElement("span");
            elev.className = "heart-elev";
            [["elev-up", 1, "값 올리기"], ["elev-down", -1, "값 내리기"]].forEach(([cls, dir, label]) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = `elev-btn ${cls}`;
                btn.setAttribute("aria-label", label);
                let delay = null, timer = null, held = false;
                const stop = () => {
                    clearTimeout(delay); clearInterval(timer);
                    delay = timer = null;
                    btn.classList.remove("pressed");
                    if (held) orig.dispatchEvent(new Event("change", { bubbles: true }));
                    held = false;
                };
                btn.addEventListener("pointerdown", (e) => {
                    e.preventDefault(); // 입력칸에 포커스가 가서 키보드가 뜨는 걸 막음
                    btn.classList.add("pressed");
                    held = true;
                    nudge(dir);
                    // 꾹 누르고 있으면 빠르게 계속 올라가거나 내려감
                    delay = setTimeout(() => { timer = setInterval(() => nudge(dir), 80); }, 420);
                });
                ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stop));
                btn.addEventListener("contextmenu", (e) => e.preventDefault());
                elev.appendChild(btn);
            });
            box.insertAdjacentElement("afterend", elev); // 숫자 알약 밖, 행의 오른쪽 끝
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();



// ==========================================================================
// 자간/크기가 글자마다 제멋대로 보이는 문제 해결
// 크롬/사파리의 편집창(contenteditable)은 글을 지우거나 붙이거나 줄을 합칠 때, 그 순간의
// 자간·글자 크기·줄 높이·글꼴을 해당 글자 <span>에 "인라인 스타일"로 박아 넣는다.
// 이후에 자간 같은 설정을 바꿔도 그 글자들만 옛 값을 계속 들고 있어서 문단마다 간격이 달라 보였다.
// 본문 글자에는 이 값들을 직접 지정하는 기능이 없으므로(대사 블록·사진 블록 제외) 매번 지워서
// 항상 폰트 탭의 설정 하나만 따르게 한다.
// ==========================================================================
function stripStaleTypography(root) {
    if (!root) return;
    const PROPS = ["letter-spacing", "word-spacing", "font-size", "line-height", "font-family"];
    root.querySelectorAll("[style]").forEach((el) => {
        if (el.closest(".dlg-editor-marker, .editor-image-block, .dialogue-line")) return;
        let touched = false;
        PROPS.forEach((p) => {
            if (el.style.getPropertyValue(p)) { el.style.removeProperty(p); touched = true; }
        });
        if (touched && !el.getAttribute("style")) el.removeAttribute("style");
    });
}

// ==========================================================================
// 폰트 탭 '간격 디테일' 기본값 되돌리기 (이전 버전이 저장해 둔 "마지막 설정"은 지운다)
// ==========================================================================
const SPACING_DEFAULTS = { fontSize: 14, letterSpacing: 0, lineHeight: 18, paraSpacing: 2, indentSize: 1, fontScaleX: 100, infoFontSize: 11 };

function resetSpacingDefaults() {
    Object.keys(SPACING_DEFAULTS).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = SPACING_DEFAULTS[id];
        el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    if (typeof updateCanvas === "function") updateCanvas();
    if (typeof showToast === "function") showToast("간격 디테일을 기본값으로 되돌렸어요");
}

(function dropOldSpacingMemory() {
    try { localStorage.removeItem("quoteStudioSpacingPrefs"); } catch (e) {}
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("btnResetSpacing")?.addEventListener("click", resetSpacingDefaults);
    });
    if (document.readyState !== "loading") {
        document.getElementById("btnResetSpacing")?.addEventListener("click", resetSpacingDefaults);
    }
})();

// ---- 사진 → 점자 도트 아스키아트 변환 ----
// 점자 한 칸(가로 2점 × 세로 4점)을 기준으로 사진을 점으로 바꿔 투명 PNG로 만든다.
// 어두운 부분일수록 점이 찍히고(반전하면 밝은 부분), 투명한 부분은 점이 없다.
// 중간 밝기는 오차 확산(디더링)으로 표현해서 장미 장식처럼 점 농도로 명암이 나온다.
function photoToBrailleDataUrl(dataUrl, opts) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const cells = Math.max(10, opts.cells || 60);
            const dotsW = cells * 2;
            const aspect = img.naturalHeight / img.naturalWidth;
            const cellsH = Math.max(1, Math.round((dotsW * aspect) / 4));
            const dotsH = cellsH * 4;

            const tmp = document.createElement("canvas");
            tmp.width = dotsW; tmp.height = dotsH;
            const tctx = tmp.getContext("2d", { willReadFrequently: true });
            tctx.drawImage(img, 0, 0, dotsW, dotsH);
            const px = tctx.getImageData(0, 0, dotsW, dotsH).data;

            // 점이 찍힐 정도(0~1): 어두울수록 1, 투명하면 0
            const dark = new Float32Array(dotsW * dotsH);
            let lo = 1, hi = 0;
            for (let i = 0; i < dotsW * dotsH; i++) {
                const a = px[i * 4 + 3] / 255;
                const lum = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
                let d = opts.invert ? lum : 1 - lum;
                d = d * a;
                dark[i] = d;
                if (a > 0.5) { if (d < lo) lo = d; if (d > hi) hi = d; }
            }
            // 대비를 늘려서 밋밋한 사진도 또렷하게
            const range = hi - lo > 0.05 ? hi - lo : 1;
            for (let i = 0; i < dark.length; i++) {
                const a = px[i * 4 + 3] / 255;
                dark[i] = a < 0.5 ? 0 : Math.min(1, Math.max(0, (dark[i] - lo) / range));
            }

            // Floyd–Steinberg 디더링
            const on = new Uint8Array(dotsW * dotsH);
            for (let y = 0; y < dotsH; y++) {
                for (let x = 0; x < dotsW; x++) {
                    const i = y * dotsW + x;
                    if (px[i * 4 + 3] < 128) continue;
                    const old = dark[i];
                    const nv = old >= 0.5 ? 1 : 0;
                    on[i] = nv;
                    const err = old - nv;
                    if (x + 1 < dotsW) dark[i + 1] += err * 7 / 16;
                    if (y + 1 < dotsH) {
                        if (x > 0) dark[i + dotsW - 1] += err * 3 / 16;
                        dark[i + dotsW] += err * 5 / 16;
                        if (x + 1 < dotsW) dark[i + dotsW + 1] += err * 1 / 16;
                    }
                }
            }

            // 점자 칸 사이는 살짝 더 띄워서 '점자 같은' 느낌을 낸다
            const p = 6, gapX = 4, gapY = 8, r = 2.2; // 가로·세로 평균 간격이 같아야(8px) 사진 비율이 안 틀어진다
            const outW = cells * (2 * p + gapX);
            const outH = cellsH * (4 * p + gapY);
            const out = document.createElement("canvas");
            out.width = outW; out.height = outH;
            const ctx = out.getContext("2d");
            ctx.fillStyle = opts.color || "#e62c7a";
            for (let y = 0; y < dotsH; y++) {
                for (let x = 0; x < dotsW; x++) {
                    if (!on[y * dotsW + x]) continue;
                    const cx = Math.floor(x / 2) * (2 * p + gapX) + (x % 2) * p + p / 2 + gapX / 2;
                    const cy = Math.floor(y / 4) * (4 * p + gapY) + (y % 4) * p + p / 2 + gapY / 2;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            resolve({ dataUrl: out.toDataURL("image/png"), w: outW, h: outH });
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
}


// 변환 옵션(점자 아스키아트 변환 섹션)이 켜져 있으면 점 그림으로 바꿔 {dataUrl,w,h}를 돌려주고,
// 꺼져 있거나 실패하면 null(= 원본 그대로 사용)
async function maybeAsciiConvert(dataUrl) {
    const toggle = document.getElementById("stickerAsciiToggle");
    if (!toggle || !toggle.checked) return null;
    return photoToBrailleDataUrl(dataUrl, {
        cells: parseInt(document.getElementById("stickerAsciiDetail")?.value, 10) || 60,
        color: document.getElementById("stickerAsciiColor")?.value || "#e62c7a",
        invert: !!document.getElementById("stickerAsciiInvert")?.checked
    });
}

(function setupAsciiOptionsUI() {
    const init = () => {
        const toggle = document.getElementById("stickerAsciiToggle");
        const options = document.getElementById("stickerAsciiOptions");
        if (!toggle || !options) return;
        const sync = () => { options.style.display = toggle.checked ? "" : "none"; };
        toggle.addEventListener("change", sync);
        sync();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();


// ==========================================================================
// 저장/복사 해상도: 예전엔 항상 2배(가로 1040px 정도)라서 화질이 아쉬웠다.
// 이제 캔버스가 작으면 최대 4배까지 올리고, 아주 긴 글(자유 높이)은 아이폰 사파리의
// 캔버스 한계(약 1천6백만 픽셀)를 넘지 않는 선에서 자동으로 낮춘다. (최소 2배)
// ==========================================================================
function getExportScale(el) {
    const w = el.offsetWidth || 520;
    const h = Math.max(el.scrollHeight || 0, el.offsetHeight || 0) || 693;
    const MAX_PIXELS = 14000000;
    const fit = Math.sqrt(MAX_PIXELS / (w * h));
    return Math.min(4, Math.max(2, Math.floor(fit * 2) / 2));
}
