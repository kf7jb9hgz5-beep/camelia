// 캔버스/스타일 컨트롤의 숫자 +/- 버튼
window.stepInput = function (id, step, precision) {
    const input = document.getElementById(id);
    if (!input) return;

    let val = Number(input.value) + step;
    val = precision ? parseFloat(val.toFixed(precision)) : Math.round(val);
    input.value = val;

    const pairedSlider = document.getElementById(`${id}Slider`);
    if (pairedSlider) pairedSlider.value = val;

    if (typeof updateCanvas === "function") {
        updateCanvas();
    }
};

// 슬라이더를 움직였을 때 짝을 이루는 숫자 입력칸에도 값을 반영
window.syncRangeToNumber = function (sliderId, numberId) {
    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);
    if (!slider || !number) return;
    number.value = slider.value;
    if (typeof updateCanvas === "function") {
        updateCanvas();
    }
};

// 숫자 입력칸을 직접 타이핑했을 때도 슬라이더 위치를 맞춤
document.addEventListener("input", (e) => {
    const target = e.target;
    if (!target || target.tagName !== "INPUT" || target.type !== "number") return;
    const pairedSlider = document.getElementById(`${target.id}Slider`);
    if (pairedSlider) pairedSlider.value = target.value;
});

// 현재 모든 설정값을 하나의 객체로 캡처
// 주의: 발췌문/타이틀/저자 등 "내용(텍스트)"은 절대 포함하지 않는다. (els.editor, els.titleInput,
// els.creatorInput, els.headingTitleInput, els.headingSubtitleInput 는 의도적으로 제외)
function getPresetSnapshot() {
    return {
        ratioSelect: els.ratioSelect.value,
        canvasWidth: els.canvasWidth.value,
        paddingTop: els.paddingTop.value,
        paddingBottom: els.paddingBottom.value,
        paddingLeft: els.paddingLeft.value,
        paddingRight: els.paddingRight.value,
        bgType: els.bgType.value,
        bgColor1: els.bgColor1.value,
        gradColor1: els.gradColor1.value,
        gradColor2: els.gradColor2.value,
        gradColor3: els.gradColor3.value,
        gradientDir: els.gradientDir.value,
        gradMode: document.querySelector('input[name="gradMode"]:checked')?.value || "2",
        fontSelect: els.fontSelect.value,
        fontWeightSelect: els.fontWeightSelect?.value,
        dialogueMode: document.getElementById("dialogueMode")?.value,
        dlgNameSuffix: els.dlgNameSuffix?.value,
        dlgQuoteStyle: els.dlgQuoteStyle?.value,
        dlgShowAvatar: els.dlgShowAvatar?.checked,
        dlgShowName: els.dlgShowName?.checked,
        dlgShowTranslation: els.dlgShowTranslation?.checked,
        dlgAvatarShape: document.getElementById("dlgAvatarShape")?.value,
        dlgAvatarSize: els.dlgAvatarSize?.value,
        dlgUseCharColor: els.dlgUseCharColor?.checked,
        dlgLineGap: els.dlgLineGap?.value,
        dlgContinuationGap: els.dlgContinuationGap?.value,
        dlgNameGap: els.dlgNameGap?.value,
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
        headingSubtitleBold: els.headingSubtitleBold?.checked,
        // 하프톤 장식 / 테두리 장식 (장미·음표 하트 등)
        halftoneDir: document.getElementById("halftoneDir")?.value,
        halftoneColor: document.getElementById("halftoneColor")?.value,
        halftoneSize: document.getElementById("halftoneSize")?.value,
        halftoneRange: document.getElementById("halftoneRange")?.value,
        halftoneOpacity: document.getElementById("halftoneOpacity")?.value,
        frameStyle: document.getElementById("frameStyle")?.value,
        frameRoseColor: document.getElementById("frameRoseColor")?.value,
        frameRosePos: document.getElementById("frameRosePos")?.value,
        frameRoseSize: document.getElementById("frameRoseSize")?.value,
        frameRoseOpacity: document.getElementById("frameRoseOpacity")?.value,
        frameSymbol: document.getElementById("frameSymbol")?.value
    };
}

// 캡처해둔 설정값을 화면에 다시 적용
function applyPresetSnapshot(data) {
    if (!data) return;

    els.ratioSelect.value = data.ratioSelect ?? els.ratioSelect.value;
    els.canvasWidth.value = data.canvasWidth ?? els.canvasWidth.value;
    els.paddingTop.value = data.paddingTop ?? data.paddingY ?? els.paddingTop.value;
    els.paddingBottom.value = data.paddingBottom ?? data.paddingY ?? els.paddingBottom.value;
    els.paddingLeft.value = data.paddingLeft ?? data.paddingX ?? els.paddingLeft.value;
    els.paddingRight.value = data.paddingRight ?? data.paddingX ?? els.paddingRight.value;
    ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"].forEach((id) => {
        const slider = document.getElementById(`${id}Slider`);
        const number = document.getElementById(id);
        if (slider && number) slider.value = number.value;
    });
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
    if (data.dialogueMode) {
        const modeHidden = document.getElementById("dialogueMode");
        const modeGroup = document.querySelector('.segmented-control[data-target="dialogueMode"]');
        if (modeHidden) modeHidden.value = data.dialogueMode;
        if (modeGroup) {
            modeGroup.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.value === data.dialogueMode));
        }
    }
    if (els.dlgNameSuffix) els.dlgNameSuffix.value = data.dlgNameSuffix ?? els.dlgNameSuffix.value;
    if (els.dlgQuoteStyle) els.dlgQuoteStyle.value = data.dlgQuoteStyle ?? els.dlgQuoteStyle.value;
    if (els.dlgShowAvatar) els.dlgShowAvatar.checked = data.dlgShowAvatar ?? els.dlgShowAvatar.checked;
    if (els.dlgShowAvatar) {
        const list = document.getElementById("characterList");
        if (list) list.classList.toggle("hide-chip-avatars", !els.dlgShowAvatar.checked);
    }
    if (els.dlgShowName) els.dlgShowName.checked = data.dlgShowName ?? els.dlgShowName.checked;
    if (els.dlgShowTranslation) els.dlgShowTranslation.checked = data.dlgShowTranslation ?? els.dlgShowTranslation.checked;
    const dlgAvatarShapeHidden = document.getElementById("dlgAvatarShape");
    if (dlgAvatarShapeHidden && data.dlgAvatarShape) {
        dlgAvatarShapeHidden.value = data.dlgAvatarShape;
        const shapeGroup = document.querySelector('.segmented-control[data-target="dlgAvatarShape"]');
        if (shapeGroup) shapeGroup.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.value === data.dlgAvatarShape));
    }
    if (els.dlgAvatarSize) els.dlgAvatarSize.value = data.dlgAvatarSize ?? els.dlgAvatarSize.value;
    if (els.dlgUseCharColor) els.dlgUseCharColor.checked = data.dlgUseCharColor ?? els.dlgUseCharColor.checked;
    if (els.dlgLineGap) els.dlgLineGap.value = data.dlgLineGap ?? els.dlgLineGap.value;
    if (els.dlgContinuationGap) els.dlgContinuationGap.value = data.dlgContinuationGap ?? els.dlgContinuationGap.value;
    if (els.dlgNameGap) els.dlgNameGap.value = data.dlgNameGap ?? els.dlgNameGap.value;
    if (typeof syncDialogueModeUI === "function") syncDialogueModeUI();
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

    // 하프톤 / 테두리 장식 복원 (예전에 저장한 프리셋엔 없는 값이라, 있을 때만 적용)
    const setValueById = (id, value) => {
        if (value === undefined || value === null) return;
        const el = document.getElementById(id);
        if (el) el.value = value;
    };
    ["halftoneColor", "halftoneSize", "halftoneRange", "halftoneOpacity", "frameRoseSize", "frameRoseOpacity", "frameSymbol"]
        .forEach((id) => setValueById(id, data[id]));
    if (data.halftoneDir !== undefined) {
        const dirEl = document.getElementById("halftoneDir");
        if (dirEl) {
            dirEl.value = data.halftoneDir;
            // 방향에 따라 보이는 설정칸이 달라서 change 이벤트로 화면 상태도 같이 맞춤
            dirEl.dispatchEvent(new Event("change"));
        }
    }
    // 버튼식 선택(segmented)은 해당 버튼을 눌러주면 값/활성 표시/보이는 칸이 한 번에 맞춰진다
    ["frameStyle", "frameRoseColor", "frameRosePos"].forEach((id) => {
        if (data[id] === undefined) return;
        const btn = document.querySelector(`.segmented-control[data-target="${id}"] button[data-value="${data[id]}"]`);
        if (btn) btn.click();
    });

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
        return true;
    } catch (e) {
        console.warn("프리셋 저장 실패:", e);
        return false;
    }
}

// ==== 프리셋 미리보기(썸네일) ====
const PRESET_THUMB_W = 300;
const PRESET_THUMB_H = 375; // 4:5 카드

// 지금 캔버스를 작은 이미지로 찍어서 JPEG 데이터로 돌려줌. 실패하면 null (미리보기 없이 저장됨)
async function capturePresetThumbnail() {
    const area = els.captureArea;
    if (!area || typeof html2canvas !== "function") return null;

    const transparentBox = document.getElementById("exportTransparent");
    const wasTransparent = transparentBox ? transparentBox.checked : false;
    const originalHeight = area.style.height;
    const originalOverflow = area.style.overflow;
    const originalTransform = area.style.transform;
    let shot = null;

    try {
        // 투명 저장 옵션이 켜져 있어도 미리보기엔 배경까지 보여줌
        if (transparentBox) transparentBox.checked = false;
        area.style.transform = "none";
        if (els.ratioSelect.value === "free") area.style.height = area.scrollHeight + "px";
        area.style.overflow = "visible";
        if (typeof prepareCanvasForCapture === "function") prepareCanvasForCapture(area);
        const w = area.offsetWidth || 420;
        shot = await html2canvas(area, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            scale: PRESET_THUMB_W / w,
        });
    } catch (e) {
        console.warn("프리셋 미리보기 만들기 실패:", e);
        shot = null;
    } finally {
        if (typeof restoreCanvasAfterCapture === "function") restoreCanvasAfterCapture(area);
        area.style.height = originalHeight;
        area.style.overflow = originalOverflow;
        area.style.transform = originalTransform;
        if (transparentBox) transparentBox.checked = wasTransparent;
        if (typeof applyPreviewScale === "function") applyPreviewScale();
    }
    if (!shot) return null;

    try {
        // 4:5 카드 안에 맞춰 넣기: 너무 길면 위쪽만, 짧으면 가운데에 놓음
        const out = document.createElement("canvas");
        out.width = PRESET_THUMB_W;
        out.height = PRESET_THUMB_H;
        const ctx = out.getContext("2d");
        ctx.fillStyle = "#f6eff3";
        ctx.fillRect(0, 0, out.width, out.height);
        const ratio = PRESET_THUMB_W / shot.width;
        const drawH = Math.min(PRESET_THUMB_H, Math.round(shot.height * ratio));
        const srcH = drawH / ratio;
        const dy = Math.round((PRESET_THUMB_H - drawH) / 2);
        ctx.drawImage(shot, 0, 0, shot.width, srcH, 0, dy, PRESET_THUMB_W, drawH);
        return out.toDataURL("image/jpeg", 0.8);
    } catch (e) {
        // 외부 이미지가 섞여 있어 캔버스가 막힌 경우 등
        console.warn("프리셋 미리보기 변환 실패:", e);
        return null;
    }
}

let __presetSaving = false;

// "저장" 버튼(프리셋 패널)에서 호출
async function savePreset() {
    if (__presetSaving) return;
    const nameInput = document.getElementById("presetNameInput");
    const name = (nameInput.value || "").trim();
    if (!name) {
        alert("프리셋 이름을 입력해주세요.");
        return;
    }

    __presetSaving = true;
    const saveBtn = document.querySelector(".preset-save-box-minimal .btn-minimal-save");
    const saveBtnLabel = saveBtn ? saveBtn.textContent : "";
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "저장 중…"; }

    try {
        const data = getPresetSnapshot();
        const thumb = await capturePresetThumbnail();
        const list = getPresetsFromStorage();
        list.push({ name, data, thumb });
        if (!savePresetsToStorage(list)) {
            // 저장 공간이 모자라면 미리보기 없이 다시 시도
            list[list.length - 1].thumb = null;
            if (!savePresetsToStorage(list)) {
                list.pop();
                alert("저장 공간이 부족해서 프리셋을 저장하지 못했어요. 안 쓰는 프리셋을 지워주세요.");
                return;
            }
        }
        nameInput.value = "";
        renderPresets();
    } finally {
        __presetSaving = false;
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = saveBtnLabel || "저장"; }
    }
}

function deletePreset(index) {
    const list = getPresetsFromStorage();
    list.splice(index, 1);
    savePresetsToStorage(list);
    renderPresets();
}

// 미리보기가 없는 예전 프리셋용: 저장된 설정값만으로 그리는 간단한 견본 (배경 + "Aa")
function buildPresetSwatch(data) {
    const swatch = document.createElement("div");
    swatch.className = "preset-thumb-swatch";
    const d = data || {};
    if (d.bgType === "gradient") {
        const stops = d.gradMode === "3" ? [d.gradColor1, d.gradColor2, d.gradColor3] : [d.gradColor1, d.gradColor2];
        swatch.style.background = `linear-gradient(${d.gradientDir || "to bottom"}, ${stops.filter(Boolean).join(", ")})`;
    } else {
        swatch.style.background = d.bgColor1 || "#ffffff";
    }
    const sample = document.createElement("span");
    sample.textContent = "Aa 가나";
    sample.style.color = d.globalTextColor || "#000000";
    if (d.fontSelect) sample.style.fontFamily = d.fontSelect;
    swatch.appendChild(sample);
    return swatch;
}

// 불러오기를 눌렀는데 미리보기가 없던 프리셋은, 불러온 직후 화면을 찍어서 미리보기를 채워둠
async function fillMissingPresetThumb(index, name) {
    const thumb = await capturePresetThumbnail();
    if (!thumb) return;
    const list = getPresetsFromStorage();
    if (!list[index] || list[index].name !== name) return;
    list[index].thumb = thumb;
    if (savePresetsToStorage(list)) renderPresets();
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
        empty.style.gridColumn = "1 / -1";
        empty.textContent = "저장된 프리셋이 없어요.";
        container.appendChild(empty);
        return;
    }

    list.forEach((preset, index) => {
        const item = document.createElement("div");
        item.className = "preset-item";

        const thumbBox = document.createElement("div");
        thumbBox.className = "preset-thumb";
        if (preset.thumb) {
            const img = document.createElement("img");
            img.src = preset.thumb;
            img.alt = "";
            img.draggable = false;
            thumbBox.appendChild(img);
        } else {
            thumbBox.appendChild(buildPresetSwatch(preset.data));
        }

        const foot = document.createElement("div");
        foot.className = "preset-foot";

        const nameSpan = document.createElement("span");
        nameSpan.className = "preset-name";
        nameSpan.textContent = preset.name;

        const delBtn = document.createElement("button");
        delBtn.className = "preset-delete-btn";
        delBtn.textContent = "✕";
        delBtn.setAttribute("aria-label", "프리셋 삭제");
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deletePreset(index);
        });

        foot.appendChild(nameSpan);
        foot.appendChild(delBtn);
        item.appendChild(thumbBox);
        item.appendChild(foot);
        item.addEventListener("click", () => {
            applyPresetSnapshot(preset.data);
            if (!preset.thumb) {
                // 글꼴/장식이 다 적용된 뒤에 찍도록 잠깐 기다림
                setTimeout(() => fillMissingPresetThumb(index, preset.name), 700);
            }
        });
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
