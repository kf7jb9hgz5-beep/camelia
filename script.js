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
    bubbleShowAvatar: document.getElementById("bubbleShowAvatar"),
    bubbleShowName: document.getElementById("bubbleShowName"),
    bubbleShowTail: document.getElementById("bubbleShowTail"),
    bubbleShape: document.getElementById("bubbleShape"),
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
        let rawHTML = els.editor.innerHTML || "<div><br></div>";
        textWrapper.innerHTML = rawHTML;
        normalizeParagraphs(textWrapper);

        textWrapper.style.setProperty("--quote-line-color", els.quoteLineColor.value);
        if (els.editor) els.editor.style.setProperty("--quote-line-color", els.quoteLineColor.value);
        textWrapper.style.setProperty("--box-quote-color", els.boxQuoteColor?.value || "#000000");
        if (els.editor) els.editor.style.setProperty("--box-quote-color", els.boxQuoteColor?.value || "#000000");
        const boxQuoteW = parseFloat(els.boxQuoteWidth?.value);
        textWrapper.style.setProperty("--box-quote-width", `${isNaN(boxQuoteW) ? 2 : boxQuoteW}px`);
        if (els.editor) els.editor.style.setProperty("--box-quote-width", `${isNaN(boxQuoteW) ? 2 : boxQuoteW}px`);
        textWrapper.style.setProperty("--divider-color", els.dividerColor?.value || "#94a3b8");
        if (els.editor) els.editor.style.setProperty("--divider-color", els.dividerColor?.value || "#94a3b8");
        const bubbleAvatarDisplay = (els.bubbleShowAvatar && !els.bubbleShowAvatar.checked) ? "none" : "flex";
        textWrapper.style.setProperty("--bubble-avatar-display", bubbleAvatarDisplay);
        if (els.editor) els.editor.style.setProperty("--bubble-avatar-display", bubbleAvatarDisplay);
        const bubbleNameDisplay = (els.bubbleShowName && !els.bubbleShowName.checked) ? "none" : "block";
        textWrapper.style.setProperty("--bubble-name-display", bubbleNameDisplay);
        if (els.editor) els.editor.style.setProperty("--bubble-name-display", bubbleNameDisplay);
        const bubbleTailDisplay = (els.bubbleShowTail && !els.bubbleShowTail.checked) ? "none" : "block";
        textWrapper.style.setProperty("--bubble-tail-display", bubbleTailDisplay);
        if (els.editor) els.editor.style.setProperty("--bubble-tail-display", bubbleTailDisplay);
        const bubbleRadius = (els.bubbleShape && els.bubbleShape.value === "square") ? "4px" : "16px";
        textWrapper.style.setProperty("--bubble-radius", bubbleRadius);
        if (els.editor) els.editor.style.setProperty("--bubble-radius", bubbleRadius);
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
        if (infoContainer.parentNode !== textContainer) textContainer.appendChild(infoContainer);

        infoContainer.style.justifyContent = "flex-end";

        const bodyFontSize = parseFloat(els.fontSize.value) || 16;
        const bodyLineHeight = parseFloat(els.lineHeight.value) || 1.6;
        infoContainer.style.marginTop = `${bodyFontSize * bodyLineHeight}px`;

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

    if (ratio !== "free") {
        fitTextToCanvas();
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
        titleEl.style.color = els.globalTextColor.value;
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
        subtitleEl.style.color = els.subTextColor ? els.subTextColor.value : els.globalTextColor.value;
        subtitleEl.style.marginTop = titleText ? "6px" : "0";
        headingContainer.appendChild(subtitleEl);
    }
}

function fitTextToCanvas() {
    const area = els.captureArea;
    const w = parseFloat(area.dataset.fixedRatioW);
    const h = parseFloat(area.dataset.fixedRatioH);
    if (!w || !h) return;

    const textWrapper = document.getElementById("canvasTextWrapper");
    if (!textWrapper) return;

    const baseFontSize = parseFloat(els.fontSize.value) || 16;
    const baseLineHeight = parseFloat(els.lineHeight.value) || 28;
    const lhRatio = baseLineHeight / baseFontSize;

    const areaW = area.getBoundingClientRect().width || parseFloat(area.style.width) || 420;
    const targetH = (areaW * h) / w;

    textWrapper.style.fontSize = `${baseFontSize}px`;
    textWrapper.style.lineHeight = `${baseLineHeight}px`;
    area.style.height = "auto";
    area.style.overflow = "visible";
    void area.offsetHeight;

    const naturalH = area.scrollHeight;

    if (naturalH <= targetH + 2) {
        area.style.height = `${Math.round(targetH)}px`;
        area.style.overflow = "hidden";
        return;
    }

    const scale = targetH / naturalH;
    const newFontSize = Math.max(4, baseFontSize * scale * 0.97);
    const newLineHeight = newFontSize * lhRatio;

    textWrapper.style.fontSize = `${newFontSize}px`;
    textWrapper.style.lineHeight = `${newLineHeight}px`;
    void area.offsetHeight;

    const checkH = area.scrollHeight;
    if (checkH > targetH + 2) {
        const scale2 = targetH / checkH;
        const finalSize = Math.max(4, newFontSize * scale2 * 0.97);
        textWrapper.style.fontSize = `${finalSize}px`;
        textWrapper.style.lineHeight = `${finalSize * lhRatio}px`;
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

onClick("btnInsertSpeaker", () => {
    openSheetPanel("panel-bubble");
});

// ==== 말풍선 캐릭터 관리 ====
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

        const name = document.createElement("div");
        name.className = "char-chip-name";
        name.textContent = c.name || "이름 없음";

        const insertBtn = document.createElement("button");
        insertBtn.type = "button";
        insertBtn.className = "char-chip-insert";
        insertBtn.textContent = "대사 추가";
        insertBtn.addEventListener("click", () => insertBubbleForCharacter(c.id));

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
    const alignInput = document.getElementById("charEditorAlign");
    const bubbleColor = document.getElementById("charEditorBubbleColor");
    const textColor = document.getElementById("charEditorTextColor");
    const deleteBtn = document.getElementById("btnDeleteCharacter");
    if (!editor || !nameInput || !avatarBox || !alignInput || !bubbleColor || !textColor || !deleteBtn) return;

    if (id) {
        const c = characters.find((x) => x.id === id);
        if (!c) return;
        nameInput.value = c.name || "";
        avatarBox.style.backgroundImage = c.avatarData ? `url(${c.avatarData})` : "none";
        avatarBox.dataset.hasImage = c.avatarData ? "true" : "false";
        alignInput.value = c.align || "left";
        bubbleColor.value = c.bubbleColor || "#e5e5ea";
        textColor.value = c.textColor || "#111111";
        deleteBtn.style.display = "block";
    } else {
        nameInput.value = "";
        avatarBox.style.backgroundImage = "none";
        avatarBox.dataset.hasImage = "false";
        alignInput.value = "left";
        bubbleColor.value = "#e5e5ea";
        textColor.value = "#111111";
        deleteBtn.style.display = "none";
    }

    const seg = editor.querySelector('.segmented-control[data-target="charEditorAlign"]');
    if (seg) {
        seg.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.value === alignInput.value));
    }

    editor.style.display = "flex";
    editor.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function closeCharacterEditor() {
    const editor = document.getElementById("characterEditor");
    if (editor) editor.style.display = "none";
    editingCharacterId = null;
    pendingCharAvatarData = null;
}

function updateExistingBubbles(charId) {
    const c = characters.find((x) => x.id === charId);
    if (!c || !els.editor) return;
    els.editor.querySelectorAll(`.chat-bubble-row[data-char-id="${charId}"]`).forEach((row) => {
        row.classList.remove("align-left", "align-right");
        row.classList.add(`align-${c.align}`);
        const avatar = row.querySelector(".bubble-avatar");
        if (avatar) avatar.style.backgroundImage = c.avatarData ? `url(${c.avatarData})` : "none";
        const nameEl = row.querySelector(".bubble-name");
        if (nameEl) nameEl.textContent = c.name;
        const bubble = row.querySelector(".bubble");
        if (bubble) {
            bubble.style.backgroundColor = c.bubbleColor;
            bubble.style.color = c.textColor;
            bubble.style.setProperty("--bubble-own-color", c.bubbleColor);
        }
    });
}

function insertBubbleForCharacter(charId) {
    const c = characters.find((x) => x.id === charId);
    if (!c || !els.editor) return;
    els.editor.focus();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div class="template-block chat-bubble-row align-${c.align}" data-char-id="${c.id}">
            <div class="bubble-avatar" contenteditable="false"${c.avatarData ? ` style="background-image:url(${c.avatarData})"` : ""}></div>
            <div class="bubble-col">
                <div class="bubble-name">${escapeHtml(c.name)}</div>
                <div class="bubble tpl-field tpl-multiline" data-placeholder="대사를 입력하세요" style="background-color:${c.bubbleColor};color:${c.textColor};--bubble-own-color:${c.bubbleColor};"></div>
            </div>
        </div>
    `.trim();
    const node = wrapper.firstElementChild;

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

onClick("btnAddCharacter", () => openCharacterEditor(null));
onClick("btnCancelCharacterEdit", closeCharacterEditor);

onClick("btnSaveCharacter", () => {
    const nameInput = document.getElementById("charEditorName");
    const alignInput = document.getElementById("charEditorAlign");
    const bubbleColorInput = document.getElementById("charEditorBubbleColor");
    const textColorInput = document.getElementById("charEditorTextColor");
    if (!nameInput || !alignInput || !bubbleColorInput || !textColorInput) return;

    const name = nameInput.value.trim() || "이름 없음";
    const align = alignInput.value || "left";
    const bubbleColor = bubbleColorInput.value;
    const textColor = textColorInput.value;
    const existing = editingCharacterId ? characters.find((x) => x.id === editingCharacterId) : null;
    const avatarData = pendingCharAvatarData !== null ? pendingCharAvatarData : (existing ? existing.avatarData : null);

    if (existing) {
        existing.name = name;
        existing.align = align;
        existing.bubbleColor = bubbleColor;
        existing.textColor = textColor;
        existing.avatarData = avatarData;
        updateExistingBubbles(existing.id);
    } else {
        characters.push({ id: uid(), name, align, bubbleColor, textColor, avatarData });
    }

    renderCharacterList();
    closeCharacterEditor();
    saveCharactersToStorage();
    updateCanvas();
    pushHistory(true);
});

onClick("btnDeleteCharacter", () => {
    if (!editingCharacterId) return;
    if (!window.confirm("이 캐릭터를 삭제할까요? 이미 넣은 말풍선은 그대로 남아요.")) return;
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

function insertTemplateBlock(html) {
    if (!els.editor) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    const node = wrapper.firstElementChild;
    if (!node) return;
    els.editor.appendChild(node);
    const trailer = document.createElement("div");
    trailer.appendChild(document.createElement("br"));
    els.editor.appendChild(trailer);
    closeSheetPanel();
    updateCanvas();
    pushHistory(true);
    showToast("템플릿을 추가했어요. 빈 칸을 탭해서 내용을 입력해 주세요.");

    const firstField = node.querySelector(".tpl-field");
    if (firstField) {
        setTimeout(() => {
            els.editor.focus();
            const range = document.createRange();
            range.selectNodeContents(firstField);
            range.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            firstField.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 50);
    }
}

onClick("btnTemplateVerticalMix", () => {
    insertTemplateBlock(`
        <div class="template-block template-vertical-mix">
            <div class="vertical-mix-source tpl-field tpl-multiline" data-placeholder="원문을 입력하세요"></div>
            <div class="vertical-mix-divider"></div>
            <div class="vertical-mix-translation tpl-field tpl-multiline" data-placeholder="번역문을 입력하세요"></div>
        </div>
    `);
});

onClick("btnTemplateSpeaker", () => {
    insertTemplateBlock(`
        <div class="template-block template-speaker">
            <div class="speaker-row"><div class="speaker-name tpl-field" data-placeholder="이름"></div><div class="speaker-line tpl-field tpl-multiline" data-placeholder="대사를 입력하세요"></div></div>
            <div class="speaker-row"><div class="speaker-name tpl-field" data-placeholder="이름"></div><div class="speaker-line tpl-field tpl-multiline" data-placeholder="대사를 입력하세요"></div></div>
        </div>
    `);
});

onClick("btnTemplateHeading", () => {
    insertTemplateBlock(`
        <div class="template-block template-heading-section">
            <div class="section-heading tpl-field" data-placeholder="— 소제목을 입력하세요"></div>
            <div class="section-body tpl-field tpl-multiline" data-placeholder="본문 내용을 입력하세요"></div>
            <div class="section-asterisk">＊</div>
            <div class="section-heading tpl-field" data-placeholder="— 소제목을 입력하세요"></div>
            <div class="section-body tpl-field tpl-multiline" data-placeholder="본문 내용을 입력하세요"></div>
        </div>
    `);
});

onClick("btnTemplateSideNote", () => {
    insertTemplateBlock(`
        <div class="template-block template-sidenote">
            <div class="sidenote-main tpl-field tpl-multiline" data-placeholder="본문 내용을 입력하세요"></div>
            <div class="sidenote-aside">
                <div class="sidenote-row"><span class="sidenote-label">DATE.</span><span class="sidenote-value tpl-field" data-placeholder="00/00"></span></div>
                <div class="sidenote-row"><span class="sidenote-label">TIME.</span><span class="sidenote-value tpl-field" data-placeholder="00:00"></span></div>
                <div class="sidenote-row"><span class="sidenote-label">PLACE.</span><span class="sidenote-value tpl-field" data-placeholder="장소"></span></div>
                <div class="sidenote-row"><span class="sidenote-label">NOTE.</span><span class="sidenote-value tpl-field" data-placeholder="메모"></span></div>
            </div>
        </div>
    `);
});

onClick("btnTemplatePageNumber", () => {
    insertTemplateBlock(`
        <div class="template-block template-page-number">
            <div class="page-number-big tpl-field" data-placeholder="07"></div>
            <div class="page-number-body tpl-field tpl-multiline" data-placeholder="본문 내용을 입력하세요."></div>
            <div class="hr-divider" contenteditable="false"></div>
            <div class="page-number-big tpl-field" data-placeholder="08"></div>
            <div class="page-number-body tpl-field tpl-multiline" data-placeholder="본문 내용을 입력하세요."></div>
        </div>
    `);
});

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

    // ==== 미리보기 탭하면 크게 보기 ====
    const previewZoomOverlay = document.getElementById("previewZoomOverlay");
    const previewZoomInner = document.getElementById("previewZoomInner");
    const captureAreaScaleWrapper = document.getElementById("captureAreaScaleWrapper");
    if (previewZoomOverlay && previewZoomInner && captureAreaScaleWrapper) {
        captureAreaScaleWrapper.addEventListener("click", () => {
            if (!els.captureArea) return;
            previewZoomInner.innerHTML = "";
            const clone = els.captureArea.cloneNode(true);
            clone.removeAttribute("id");
            clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
            clone.style.transform = "none";
            clone.style.margin = "0";
            clone.style.flexShrink = "0";
            clone.style.maxWidth = "none";
            previewZoomInner.appendChild(clone);
            previewZoomOverlay.classList.add("show");

            requestAnimationFrame(() => {
                const availW = previewZoomInner.clientWidth;
                const availH = previewZoomInner.clientHeight;
                const realW = clone.offsetWidth;
                const realH = clone.offsetHeight;
                const scale = realW > 0 && realH > 0 ? Math.min(availW / realW, availH / realH, 3) : 1;
                clone.style.transformOrigin = "center center";
                clone.style.transform = `scale(${scale})`;
            });
        });
        previewZoomOverlay.addEventListener("click", () => previewZoomOverlay.classList.remove("show"));
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
    if (typeof renderCustomTemplates === "function") renderCustomTemplates();

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
        els.boxQuoteColor, els.boxQuoteWidth, els.dividerColor, els.fadeCount, els.indentSize,
        els.fontSelect, els.fontWeightSelect, els.wordBreak, els.fontSize, els.letterSpacing, els.lineHeight,
        els.paraSpacing, els.fontScaleX, els.infoFontSize,
        els.columnSplitIndex, els.columnGap, els.textVerticalAlign, els.textHorizontalAnchor, els.textBlockWidth,
        els.headingTitleInput, els.headingSubtitleInput,
        els.headingTitleFont, els.headingTitleSize, els.headingTitleBold,
        els.headingSubtitleFont, els.headingSubtitleSize, els.headingSubtitleBold,
        els.bubbleShowAvatar, els.bubbleShowName, els.bubbleShowTail, els.bubbleShape
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

document.getElementById("btnCopy").addEventListener("click", () => {
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
    html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 })
        .then((canvas) => {
            restoreCanvasAfterCapture(els.captureArea);
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
            els.captureArea.style.height = originalHeight;
            els.captureArea.style.overflow = originalOverflow;
            els.captureArea.style.transform = originalTransform;
            applyPreviewScale();
        });
});

document.getElementById("btnSave").addEventListener("click", () => {
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
    html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 })
        .then((canvas) => {
            restoreCanvasAfterCapture(els.captureArea);
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
        html2canvas(els.captureArea, { useCORS: true, allowTaint: true, backgroundColor: null, scale: 2 })
            .then((canvas) => {
                restoreCanvasAfterCapture(els.captureArea);
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
                els.captureArea.style.height = originalHeight;
                els.captureArea.style.overflow = originalOverflow;
                els.captureArea.style.transform = originalTransform;
                applyPreviewScale();
                resolve();
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
    const color = document.getElementById("bgOverlayColor").value;
    const opacity = document.getElementById("bgOverlayOpacity").value;
    overlayLayer.style.backgroundColor = `rgba(${color}, ${opacity})`;
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
                if (node.querySelector("div, p, br, .dialogue-line, .box-quote, .template-block")) Array.from(node.childNodes).forEach(parseNodes);
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
        if (pNodes instanceof HTMLElement && (pNodes.classList.contains("dialogue-line") || pNodes.classList.contains("box-quote") || pNodes.classList.contains("hr-divider") || pNodes.classList.contains("template-block") || pNodes.classList.contains("editor-image-block"))) {
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
    } else {
        // 가운데: 사진이 자기 줄을 독립적으로 차지 (기존 방식)
        block.style.float = "none";
        block.style.marginLeft = "auto";
        block.style.marginRight = "auto";
        block.style.marginTop = "10px";
        block.style.marginBottom = "10px";
    }
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

    if (sizeInput) sizeInput.value = parseInt(block.style.width, 10) || block.offsetWidth || 240;
    if (radiusInput) radiusInput.value = parseInt(block.style.borderRadius, 10) || 0;

    const align = block.dataset.align || "center";
    document.querySelectorAll("#imgBlockAlignGroup button").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-value") === align);
    });
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

    const sizeInput = document.getElementById("imgBlockSize");
    const ratio = parseFloat(currentImageBlock.dataset.naturalRatio) || 1;
    const w = Math.max(20, parseInt(sizeInput.value, 10) || 20);
    const h = Math.max(20, Math.round(w / ratio));
    currentImageBlock.style.width = `${w}px`;
    currentImageBlock.style.height = `${h}px`;

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
    let startX, startW, ratio;

    handle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        resizing = true;
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
        startX = e.clientX;
        startW = parseInt(block.style.width, 10) || block.offsetWidth;
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
