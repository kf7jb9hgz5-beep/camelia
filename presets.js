// 캔버스/스타일 컨트롤의 숫자 +/- 버튼
window.stepInput = function (id, step, precision) {
    const input = document.getElementById(id);
    if (!input) return;

    let val = Number(input.value) + step;
    val = precision ? parseFloat(val.toFixed(precision)) : Math.round(val);
    input.value = val;

    if (typeof updateCanvas === "function") {
        updateCanvas();
    }
};

// 현재 모든 설정값을 하나의 객체로 캡처
// 주의: 발췌문/타이틀/저자 등 "내용(텍스트)"은 절대 포함하지 않는다. (els.editor, els.titleInput,
// els.creatorInput, els.headingTitleInput, els.headingSubtitleInput 는 의도적으로 제외)
function getPresetSnapshot() {
    return {
        ratioSelect: els.ratioSelect.value,
        canvasWidth: els.canvasWidth.value,
        paddingX: els.paddingX.value,
        paddingY: els.paddingY.value,
        bgType: els.bgType.value,
        bgColor1: els.bgColor1.value,
        gradColor1: els.gradColor1.value,
        gradColor2: els.gradColor2.value,
        gradColor3: els.gradColor3.value,
        gradientDir: els.gradientDir.value,
        gradMode: document.querySelector('input[name="gradMode"]:checked')?.value || "2",
        fontSelect: els.fontSelect.value,
        fontWeightSelect: els.fontWeightSelect?.value,
        alignH: els.alignH.value,
        wordBreak: els.wordBreak.value,
        fontSize: els.fontSize.value,
        letterSpacing: els.letterSpacing.value,
        lineHeight: els.lineHeight.value,
        paraSpacing: els.paraSpacing.value,
        fontScaleX: els.fontScaleX.value,
        infoFontSize: els.infoFontSize?.value,
        columnToggle: els.columnToggle?.checked,
        columnSplitIndex: els.columnSplitIndex?.value,
        columnGap: els.columnGap?.value,
        globalTextColor: els.globalTextColor.value,
        subTextColor: els.subTextColor.value,
        hlColorA: els.hlColorA.value,
        hlColorB: els.hlColorB.value,
        hlColorC: els.hlColorC.value,
        quoteLineColor: els.quoteLineColor.value,
        boxQuoteColor: els.boxQuoteColor?.value,
        boxQuoteWidth: els.boxQuoteWidth?.value,
        dividerColor: els.dividerColor?.value,
        fadeToggle: els.fadeToggle?.checked,
        fadeCount: els.fadeCount?.value,
        indentSize: els.indentSize?.value,
        indentToggle: els.indentToggle?.checked,
        textVerticalAlign: els.textVerticalAlign?.value,
        textHorizontalAnchor: els.textHorizontalAnchor?.value,
        textBlockWidth: els.textBlockWidth?.value,
        enableQuoteColor: els.enableQuoteColor.checked,
        quoteColor: els.quoteColor.value,
        enableParenColor: els.enableParenColor.checked,
        parenColor: els.parenColor.value,
        headingTitleFont: els.headingTitleFont?.value,
        headingTitleAlign: els.headingTitleAlign?.value,
        headingTitleSize: els.headingTitleSize?.value,
        headingTitleBold: els.headingTitleBold?.checked,
        headingSubtitleFont: els.headingSubtitleFont?.value,
        headingSubtitleAlign: els.headingSubtitleAlign?.value,
        headingSubtitleSize: els.headingSubtitleSize?.value,
        headingSubtitleBold: els.headingSubtitleBold?.checked
    };
}

// 캡처해둔 설정값을 화면에 다시 적용
function applyPresetSnapshot(data) {
    if (!data) return;

    els.ratioSelect.value = data.ratioSelect ?? els.ratioSelect.value;
    els.canvasWidth.value = data.canvasWidth ?? els.canvasWidth.value;
    els.paddingX.value = data.paddingX ?? els.paddingX.value;
    els.paddingY.value = data.paddingY ?? els.paddingY.value;
    els.bgType.value = data.bgType ?? els.bgType.value;
    els.bgColor1.value = data.bgColor1 ?? els.bgColor1.value;
    els.gradColor1.value = data.gradColor1 ?? els.gradColor1.value;
    els.gradColor2.value = data.gradColor2 ?? els.gradColor2.value;
    els.gradColor3.value = data.gradColor3 ?? els.gradColor3.value;
    els.gradientDir.value = data.gradientDir ?? els.gradientDir.value;

    if (data.gradMode) {
        const radio = document.querySelector(`input[name="gradMode"][value="${data.gradMode}"]`);
        if (radio) radio.checked = true;
    }

    els.fontSelect.value = data.fontSelect ?? els.fontSelect.value;
    if (els.fontWeightSelect) els.fontWeightSelect.value = data.fontWeightSelect ?? els.fontWeightSelect.value;
    els.wordBreak.value = data.wordBreak ?? els.wordBreak.value;
    els.fontSize.value = data.fontSize ?? els.fontSize.value;
    els.letterSpacing.value = data.letterSpacing ?? els.letterSpacing.value;
    els.lineHeight.value = data.lineHeight ?? els.lineHeight.value;
    els.paraSpacing.value = data.paraSpacing ?? els.paraSpacing.value;
    els.fontScaleX.value = data.fontScaleX ?? els.fontScaleX.value;

    if (els.infoFontSize) els.infoFontSize.value = data.infoFontSize ?? els.infoFontSize.value;
    if (els.columnToggle) els.columnToggle.checked = data.columnToggle ?? els.columnToggle.checked;
    if (els.columnSplitIndex) els.columnSplitIndex.value = data.columnSplitIndex ?? els.columnSplitIndex.value;
    if (els.columnGap) els.columnGap.value = data.columnGap ?? els.columnGap.value;

    if (els.columnToggle) {
        const show = els.columnToggle.checked ? "flex" : "none";
        const splitArea = document.getElementById("columnSplitArea");
        const gapArea = document.getElementById("columnGapArea");
        if (splitArea) splitArea.style.display = show;
        if (gapArea) gapArea.style.display = show;
    }

    els.globalTextColor.value = data.globalTextColor ?? els.globalTextColor.value;
    els.subTextColor.value = data.subTextColor ?? els.subTextColor.value;
    els.hlColorA.value = data.hlColorA ?? els.hlColorA.value;
    els.hlColorB.value = data.hlColorB ?? els.hlColorB.value;
    els.hlColorC.value = data.hlColorC ?? els.hlColorC.value;
    els.quoteLineColor.value = data.quoteLineColor ?? els.quoteLineColor.value;
    if (els.boxQuoteColor) els.boxQuoteColor.value = data.boxQuoteColor ?? els.boxQuoteColor.value;
    if (els.boxQuoteWidth) els.boxQuoteWidth.value = data.boxQuoteWidth ?? els.boxQuoteWidth.value;
    if (els.dividerColor) els.dividerColor.value = data.dividerColor ?? els.dividerColor.value;
    if (els.fadeToggle) els.fadeToggle.checked = data.fadeToggle ?? els.fadeToggle.checked;
    if (els.fadeCount) els.fadeCount.value = data.fadeCount ?? els.fadeCount.value;
    if (els.indentSize) els.indentSize.value = data.indentSize ?? els.indentSize.value;
    if (els.indentToggle) els.indentToggle.checked = data.indentToggle ?? els.indentToggle.checked;
    if (els.textVerticalAlign) els.textVerticalAlign.value = data.textVerticalAlign ?? els.textVerticalAlign.value;
    if (els.textHorizontalAnchor) els.textHorizontalAnchor.value = data.textHorizontalAnchor ?? els.textHorizontalAnchor.value;
    if (els.textBlockWidth) els.textBlockWidth.value = data.textBlockWidth ?? els.textBlockWidth.value;
    if (els.fadeToggle) {
        const fadeStartArea = document.getElementById("fadeStartArea");
        if (fadeStartArea) fadeStartArea.style.display = els.fadeToggle.checked ? "flex" : "none";
    }
    els.enableQuoteColor.checked = data.enableQuoteColor ?? els.enableQuoteColor.checked;
    els.quoteColor.value = data.quoteColor ?? els.quoteColor.value;
    els.enableParenColor.checked = data.enableParenColor ?? els.enableParenColor.checked;
    els.parenColor.value = data.parenColor ?? els.parenColor.value;

    if (els.headingTitleFont) els.headingTitleFont.value = data.headingTitleFont ?? els.headingTitleFont.value;
    if (els.headingTitleSize) els.headingTitleSize.value = data.headingTitleSize ?? els.headingTitleSize.value;
    if (els.headingTitleBold) els.headingTitleBold.checked = data.headingTitleBold ?? els.headingTitleBold.checked;
    if (els.headingSubtitleFont) els.headingSubtitleFont.value = data.headingSubtitleFont ?? els.headingSubtitleFont.value;
    if (els.headingSubtitleSize) els.headingSubtitleSize.value = data.headingSubtitleSize ?? els.headingSubtitleSize.value;
    if (els.headingSubtitleBold) els.headingSubtitleBold.checked = data.headingSubtitleBold ?? els.headingSubtitleBold.checked;

    if (data.alignH) {
        els.alignH.value = data.alignH;
        document.querySelectorAll('.segmented-control[data-target="alignH"] button').forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-value") === data.alignH);
        });
    }
    if (data.headingTitleAlign && els.headingTitleAlign) {
        els.headingTitleAlign.value = data.headingTitleAlign;
        document.querySelectorAll('.segmented-control[data-target="headingTitleAlign"] button').forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-value") === data.headingTitleAlign);
        });
    }
    if (data.headingSubtitleAlign && els.headingSubtitleAlign) {
        els.headingSubtitleAlign.value = data.headingSubtitleAlign;
        document.querySelectorAll('.segmented-control[data-target="headingSubtitleAlign"] button').forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-value") === data.headingSubtitleAlign);
        });
    }

    const customArea = document.getElementById("customWidthArea");
    const customHint = document.getElementById("customWidthHint");
    const isFreeRatio = els.ratioSelect.value === "free";
    if (customArea) customArea.style.display = isFreeRatio ? "flex" : "none";
    if (customHint) customHint.style.display = isFreeRatio ? "block" : "none";

    if (typeof syncLiveHighlights === "function") {
        syncLiveHighlights({
            hlColorA: els.hlColorA.value,
            hlColorB: els.hlColorB.value,
            hlColorC: els.hlColorC.value,
            subTextColor: els.subTextColor.value
        });
    }

    if (typeof updateCanvas === "function") {
        updateCanvas();
    }
}

function getPresetsFromStorage() {
    try {
        const raw = localStorage.getItem("quoteStudioPresets");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function savePresetsToStorage(list) {
    try {
        localStorage.setItem("quoteStudioPresets", JSON.stringify(list));
    } catch (e) {
        console.warn("프리셋 저장 실패:", e);
    }
}

// ==== 내 템플릿 (현재 본문 구조 저장) ====
function getCustomTemplatesFromStorage() {
    try {
        const raw = localStorage.getItem("quoteStudioCustomTemplates");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCustomTemplatesToStorage(list) {
    try {
        localStorage.setItem("quoteStudioCustomTemplates", JSON.stringify(list));
    } catch (e) {
        console.warn("내 템플릿 저장 실패:", e);
    }
}

function saveCustomTemplate() {
    const nameInput = document.getElementById("customTemplateNameInput");
    const name = (nameInput.value || "").trim();
    if (!name) {
        alert("템플릿 이름을 입력해주세요.");
        return;
    }
    const editor = document.getElementById("textEditor");
    const html = editor ? editor.innerHTML.trim() : "";
    if (!html || html === "<div><br></div>") {
        alert("저장할 본문 내용이 없어요. 먼저 레이아웃을 만들어주세요.");
        return;
    }

    const list = getCustomTemplatesFromStorage();
    list.push({ name, html });
    saveCustomTemplatesToStorage(list);
    nameInput.value = "";
    renderCustomTemplates();
    if (typeof showToast === "function") showToast("내 템플릿으로 저장했어요.");
}

function deleteCustomTemplate(index) {
    const list = getCustomTemplatesFromStorage();
    list.splice(index, 1);
    saveCustomTemplatesToStorage(list);
    renderCustomTemplates();
}

function applyCustomTemplate(html) {
    const editor = document.getElementById("textEditor");
    if (!editor) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    Array.from(wrapper.childNodes).forEach((n) => editor.appendChild(n));
    const trailer = document.createElement("div");
    trailer.appendChild(document.createElement("br"));
    editor.appendChild(trailer);
    if (typeof closeSheetPanel === "function") closeSheetPanel();
    if (typeof updateCanvas === "function") updateCanvas();
    if (typeof pushHistory === "function") pushHistory(true);
    if (typeof showToast === "function") showToast("내 템플릿을 추가했어요.");
}

function renderCustomTemplates() {
    const container = document.getElementById("customTemplateList");
    if (!container) return;

    const list = getCustomTemplatesFromStorage();
    container.innerHTML = "";

    if (list.length === 0) {
        const empty = document.createElement("div");
        empty.style.textAlign = "center";
        empty.style.fontSize = "12px";
        empty.style.color = "var(--text-muted)";
        empty.style.padding = "12px 0";
        empty.textContent = "저장된 내 템플릿이 없어요.";
        container.appendChild(empty);
        return;
    }

    list.forEach((tpl, index) => {
        const item = document.createElement("div");
        item.className = "preset-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "preset-name";
        nameSpan.textContent = tpl.name;

        const delBtn = document.createElement("button");
        delBtn.className = "preset-delete-btn";
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteCustomTemplate(index);
        });

        item.appendChild(nameSpan);
        item.appendChild(delBtn);
        item.addEventListener("click", () => applyCustomTemplate(tpl.html));
        container.appendChild(item);
    });
}

// "저장" 버튼(프리셋 패널)에서 호출
function savePreset() {
    const nameInput = document.getElementById("presetNameInput");
    const name = (nameInput.value || "").trim();
    if (!name) {
        alert("프리셋 이름을 입력해주세요.");
        return;
    }

    const list = getPresetsFromStorage();
    list.push({ name, data: getPresetSnapshot() });
    savePresetsToStorage(list);
    nameInput.value = "";
    renderPresets();
}

function deletePreset(index) {
    const list = getPresetsFromStorage();
    list.splice(index, 1);
    savePresetsToStorage(list);
    renderPresets();
}

// 프리셋 목록을 화면에 그려줌 (script.js의 DOMContentLoaded에서 호출됨)
function renderPresets() {
    const container = document.getElementById("presetList");
    if (!container) return;

    const list = getPresetsFromStorage();
    container.innerHTML = "";

    if (list.length === 0) {
        const empty = document.createElement("div");
        empty.style.textAlign = "center";
        empty.style.fontSize = "12px";
        empty.style.color = "var(--text-muted)";
        empty.style.padding = "12px 0";
        empty.textContent = "저장된 프리셋이 없어요.";
        container.appendChild(empty);
        return;
    }

    list.forEach((preset, index) => {
        const item = document.createElement("div");
        item.className = "preset-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "preset-name";
        nameSpan.textContent = preset.name;

        const delBtn = document.createElement("button");
        delBtn.className = "preset-delete-btn";
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deletePreset(index);
        });

        item.appendChild(nameSpan);
        item.appendChild(delBtn);
        item.addEventListener("click", () => applyPresetSnapshot(preset.data));
        container.appendChild(item);
    });
}

// "지우기" 버튼: 선택한 텍스트의 굵게/기울임/색/형광펜/강조선 효과를 모두 제거
document.addEventListener("DOMContentLoaded", () => {
    const clearBtn = document.getElementById("btnClearHighlight");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            document.execCommand("removeFormat");

            const selection = window.getSelection();
            if (selection.rangeCount) {
                let node = selection.anchorNode;
                node = node && node.nodeType === 3 ? node.parentNode : node;
                const dialogueLine = node && node.closest ? node.closest(".dialogue-line") : null;
                if (dialogueLine) {
                    dialogueLine.classList.remove("dialogue-line");
                }
                const boxQuote = node && node.closest ? node.closest(".box-quote") : null;
                if (boxQuote) {
                    boxQuote.classList.remove("box-quote");
                }
            }

            if (typeof updateCanvas === "function") {
                updateCanvas();
            }
        });
    }
});
