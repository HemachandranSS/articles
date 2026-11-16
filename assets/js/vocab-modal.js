/**
 * Shared Vocabulary Modal Script
 * /home/cipl1168/Music/Articles/assets/js/vocab-modal.js
 *
 * Features:
 *   - Dynamically wraps words ≥4 chars with .vocab-silent.dynamic-word spans
 *   - .vocab-words  → highlighted, shows stored Tamil/meaning on click
 *   - .vocab-silent → quiet, fetches definition + Tamil translation from APIs
 *   - Keyboard (Escape) and overlay-click to close
 */

(function () {
    'use strict';

    /* ── DOM refs ── */
    const modal = document.getElementById('meaningModal');
    const modalWord = document.getElementById('modalWordTitle');
    const modalTamil = document.getElementById('modalTamilTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const closeBtn = document.getElementById('modalCloseBtn');

    /* ── Wrap all plain words in the article body ── */
    function wrapAllWords() {
        const article = document.querySelector('.article-body');
        if (!article) return;

        const walk = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        let n;
        while (n = walk.nextNode()) nodes.push(n);

        nodes.forEach(node => {
            const parent = node.parentElement;
            if (!parent) return;
            if (
                parent.closest('.vocab-words') ||
                parent.closest('.vocab-silent') ||
                parent.tagName === 'H2' ||
                parent.tagName === 'H3'
            ) return;

            const text = node.nodeValue;
            if (!text || text.trim().length === 0) return;

            const replaced = text.replace(
                /\b([A-Za-z]{4,})\b/g,
                "<span class='vocab-silent dynamic-word'>$1</span>"
            );

            if (replaced !== text) {
                const temp = document.createElement('span');
                temp.innerHTML = replaced;
                while (temp.firstChild) parent.insertBefore(temp.firstChild, node);
                parent.removeChild(node);
            }
        });
    }

    /* ── Parse Tamil from title string  "English word தமிழ்" ── */
    function parseTitle(raw) {
        if (!raw) return { word: '', tamil: '' };
        const match = raw.match(/^(.*?)\s*([\u0B80-\u0BFF].*)$/u);
        if (match) return { word: match[1].trim(), tamil: match[2].trim() };
        return { word: raw.trim(), tamil: '' };
    }

    /* ── Build a modal row ── */
    function row(label, value) {
        return `<div class="modal-row">
                  <span class="modal-label">${label}</span>
                  <span class="modal-value">${value}</span>
                </div>`;
    }

    /* ── Open modal ── */
    async function openModal(el) {

        /* Dynamic (API-fetched) word */
        if (el.classList.contains('dynamic-word')) {
            const word = el.textContent.trim().toLowerCase();
            modalWord.textContent = word;
            modalTamil.textContent = 'Translating…';
            modalBody.innerHTML = '<p style="color:#888;font-family:Inter,sans-serif;font-size:.9rem;">Fetching definition…</p>';
            modal.classList.remove('wide-modal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            try {
                const [dictRes, transRes] = await Promise.allSettled([
                    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),
                    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(word)}`)
                ]);

                let meaning = '', synonyms = '';

                if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
                    const data = await dictRes.value.json();
                    meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || '';
                    synonyms = (data[0]?.meanings?.[0]?.synonyms || []).slice(0, 4).join(', ');
                }

                if (transRes.status === 'fulfilled' && transRes.value.ok) {
                    const t = await transRes.value.json();
                    modalTamil.textContent = t[0]?.[0]?.[0] || '';
                } else {
                    modalTamil.textContent = '';
                }

                let html = '';
                if (meaning) html += row('Meaning', `– ${meaning}`);
                if (synonyms) html += row('Synonyms', synonyms);
                if (!meaning) html = '<p style="color:#888;font-family:Inter,sans-serif;font-size:.9rem;margin-bottom:8px;">Definition not found in dictionary.</p>';
                html += `<a href="https://www.google.com/search?q=${encodeURIComponent(word)}+meaning"
                            target="_blank" rel="noopener" class="modal-link-btn">Search on Google ↗</a>`;
                modalBody.innerHTML = html;

            } catch (e) {
                modalTamil.textContent = '';
                modalBody.innerHTML = `<p style="color:#888;font-family:Inter,sans-serif;font-size:.9rem;margin-bottom:8px;">Error connecting to APIs.</p>
                    <a href="https://www.google.com/search?q=${encodeURIComponent(word)}+meaning"
                       target="_blank" rel="noopener" class="modal-link-btn">Search on Google ↗</a>`;
            }
            return;
        }

        /* Pre-defined vocab-words (stored definitions) */
        const rawTitle = el.dataset.modalTitle || '';
        const { word, tamil } = parseTitle(rawTitle);
        const searchWord = word || rawTitle;

        modalWord.textContent = searchWord;
        modalTamil.textContent = tamil;

        let html = '';
        if (el.dataset.modalMeaning) html += row('Meaning', el.dataset.modalMeaning);
        if (el.dataset.modalSynonyms) html += row('Synonyms', el.dataset.modalSynonyms);
        html += `<a href="https://www.google.com/search?q=${encodeURIComponent(searchWord)}+meaning"
                    target="_blank" rel="noopener" class="modal-link-btn">Search on Google ↗</a>`;

        modalBody.innerHTML = html;
        modal.classList.remove('wide-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.classList.remove('wide-modal');
        document.body.style.overflow = '';
    }

    /* ── Event listeners ── */
    document.addEventListener('click', function (e) {
        const el = e.target.closest('.vocab-words, .vocab-silent');
        if (el) { openModal(el); return; }
        if (e.target === modal) closeModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    /* ── Init ── */
    wrapAllWords();

})();

document.addEventListener("DOMContentLoaded", () => {
    const imageModal = document.getElementById("imageModal");
    const modalHDImage = document.getElementById("modalHDImage");
    const imageMetaInfo = document.getElementById("imageMetaInfo");
    const imgModalCloseBtn = document.getElementById("imgModalCloseBtn");
    const imageModalBox = imageModal ? imageModal.querySelector(".image-modal-box") : null;
    const imageModalBody = imageModal ? imageModal.querySelector(".image-modal-body") : null;

    if (!imageModal || !modalHDImage || !imageModalBody) {
        // fall through to selection tooltip setup below
    }

    let viewport = null;
    let zoomLevelEl = null;
    let scale = 1;
    let tx = 0;
    let ty = 0;
    let fitScale = 1;
    let minScale = 0.5;
    let maxScale = 8;
    let naturalW = 0;
    let naturalH = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginTx = 0;
    let dragOriginTy = 0;
    let pinchStartDist = 0;
    let pinchStartScale = 1;

    function ensureZoomChrome() {
        if (!imageModalBody || viewport) return;

        viewport = document.createElement("div");
        viewport.className = "image-zoom-viewport";
        viewport.setAttribute("tabindex", "0");
        viewport.setAttribute("aria-label", "Zoomable page scan");

        modalHDImage.removeAttribute("width");
        modalHDImage.removeAttribute("height");
        viewport.appendChild(modalHDImage);

        const toolbar = document.createElement("div");
        toolbar.className = "image-zoom-toolbar";
        toolbar.innerHTML = [
            '<button type="button" data-zoom="out" title="Zoom out (−)" aria-label="Zoom out">−</button>',
            '<span class="image-zoom-level" id="imageZoomLevel">100%</span>',
            '<button type="button" data-zoom="in" title="Zoom in (+)" aria-label="Zoom in">+</button>',
            '<button type="button" data-zoom="fit" title="Fit to view" aria-label="Fit to view">Fit</button>',
            '<button type="button" data-zoom="width" title="Fit to width" aria-label="Fit to width">Width</button>',
            '<button type="button" data-zoom="reset" title="Actual pixels (1:1 when possible)" aria-label="Actual size">1:1</button>',
        ].join("");

        imageModalBody.insertBefore(toolbar, imageModalBody.firstChild);
        imageModalBody.insertBefore(viewport, toolbar.nextSibling);
        zoomLevelEl = toolbar.querySelector("#imageZoomLevel");

        toolbar.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-zoom]");
            if (!btn) return;
            const action = btn.getAttribute("data-zoom");
            if (action === "in") zoomBy(1.25);
            else if (action === "out") zoomBy(1 / 1.25);
            else if (action === "fit") fitContain();
            else if (action === "width") fitWidth();
            else if (action === "reset") zoomToActual();
        });

        viewport.addEventListener("wheel", onWheel, { passive: false });
        viewport.addEventListener("dblclick", onDblClick);
        viewport.addEventListener("pointerdown", onPointerDown);
        viewport.addEventListener("pointermove", onPointerMove);
        viewport.addEventListener("pointerup", onPointerUp);
        viewport.addEventListener("pointercancel", onPointerUp);
        viewport.addEventListener("pointerleave", onPointerUp);
    }

    function applyTransform() {
        if (!modalHDImage) return;
        modalHDImage.style.transform =
            `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`;
        if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
        if (viewport) {
            viewport.classList.toggle("is-zoomed", scale > fitScale * 1.02);
        }
        updateMeta();
    }

    function updateMeta() {
        if (!imageMetaInfo || !naturalW) return;
        const hint = "Scroll to zoom · drag to pan · double-click to toggle";
        imageMetaInfo.innerHTML =
            `<strong>Resolution:</strong> ${naturalW} × ${naturalH} px` +
            ` &nbsp;·&nbsp; <strong>Zoom:</strong> ${Math.round(scale * 100)}%` +
            `<span class="zoom-hint">${hint}</span>`;
    }

    function clampPan() {
        if (!viewport || !naturalW) return;
        const vw = viewport.clientWidth;
        const vh = viewport.clientHeight;
        const dispW = naturalW * scale;
        const dispH = naturalH * scale;
        const maxX = Math.max(0, (dispW - vw) / 2 + 40);
        const maxY = Math.max(0, (dispH - vh) / 2 + 40);
        tx = Math.min(maxX, Math.max(-maxX, tx));
        ty = Math.min(maxY, Math.max(-maxY, ty));
    }

    function setScale(next, pivotX, pivotY) {
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const cx = pivotX == null ? rect.left + rect.width / 2 : pivotX;
        const cy = pivotY == null ? rect.top + rect.height / 2 : pivotY;
        const ox = cx - rect.left - rect.width / 2;
        const oy = cy - rect.top - rect.height / 2;
        const prev = scale;
        scale = Math.min(maxScale, Math.max(minScale, next));
        if (prev !== 0) {
            const ratio = scale / prev;
            tx = ox - (ox - tx) * ratio;
            ty = oy - (oy - ty) * ratio;
        }
        clampPan();
        applyTransform();
    }

    function zoomBy(factor, pivotX, pivotY) {
        setScale(scale * factor, pivotX, pivotY);
    }

    function computeContainScale() {
        if (!viewport || !naturalW) return 1;
        const pad = 8;
        const sx = (viewport.clientWidth - pad) / naturalW;
        const sy = (viewport.clientHeight - pad) / naturalH;
        return Math.min(sx, sy, 1);
    }

    function computeWidthScale() {
        if (!viewport || !naturalW) return 1;
        return Math.min((viewport.clientWidth - 8) / naturalW, maxScale);
    }

    function fitContain() {
        fitScale = computeContainScale();
        minScale = Math.min(0.25, fitScale);
        maxScale = Math.max(8, fitScale * 12, (naturalW > 0 ? Math.max(2, naturalW / viewport.clientWidth) : 8));
        scale = fitScale;
        tx = 0;
        ty = 0;
        applyTransform();
    }

    function fitWidth() {
        scale = computeWidthScale();
        tx = 0;
        ty = 0;
        clampPan();
        applyTransform();
    }

    function zoomToActual() {
        setScale(1);
        tx = 0;
        ty = 0;
        clampPan();
        applyTransform();
    }

    function onWheel(e) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        zoomBy(factor, e.clientX, e.clientY);
    }

    function onDblClick(e) {
        e.preventDefault();
        if (scale < fitScale * 1.5) setScale(Math.min(fitScale * 2.5, maxScale), e.clientX, e.clientY);
        else fitContain();
    }

    let activePointers = new Map();

    function onPointerDown(e) {
        if (e.target.closest && e.target.closest("button")) return;
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size === 2) {
            const pts = [...activePointers.values()];
            pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            pinchStartScale = scale;
            dragging = false;
            viewport.classList.remove("is-panning");
            return;
        }

        // Single-finger / mouse pan (capture only for mouse/pen to keep pinch working)
        if (e.pointerType !== "touch") {
            try { viewport.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
        }
        dragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragOriginTx = tx;
        dragOriginTy = ty;
        viewport.classList.add("is-panning");
    }

    function onPointerMove(e) {
        if (activePointers.has(e.pointerId)) {
            activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }

        if (activePointers.size === 2 && pinchStartDist > 0) {
            const pts = [...activePointers.values()];
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const midX = (pts[0].x + pts[1].x) / 2;
            const midY = (pts[0].y + pts[1].y) / 2;
            setScale(pinchStartScale * (dist / pinchStartDist), midX, midY);
            return;
        }

        if (!dragging) return;
        tx = dragOriginTx + (e.clientX - dragStartX);
        ty = dragOriginTy + (e.clientY - dragStartY);
        clampPan();
        applyTransform();
    }

    function onPointerUp(e) {
        activePointers.delete(e.pointerId);
        if (activePointers.size < 2) pinchStartDist = 0;
        if (activePointers.size === 0) {
            dragging = false;
            viewport.classList.remove("is-panning");
        } else if (activePointers.size === 1) {
            // Resume pan from remaining finger
            const remaining = [...activePointers.values()][0];
            dragging = true;
            dragStartX = remaining.x;
            dragStartY = remaining.y;
            dragOriginTx = tx;
            dragOriginTy = ty;
        }
        try { viewport.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
    }

    function openImgModal(img) {
        if (!imageModal || !modalHDImage) return;
        ensureZoomChrome();

        scale = 1;
        tx = 0;
        ty = 0;
        activePointers.clear();
        pinchStartDist = 0;
        dragging = false;
        modalHDImage.style.opacity = "0";
        modalHDImage.src = img.src;
        modalHDImage.alt = img.alt || "HD Image";
        imageModal.style.display = "flex";
        document.body.style.overflow = "hidden";

        const finish = () => {
            naturalW = modalHDImage.naturalWidth || img.naturalWidth;
            naturalH = modalHDImage.naturalHeight || img.naturalHeight;
            modalHDImage.style.width = naturalW + "px";
            modalHDImage.style.height = naturalH + "px";
            modalHDImage.style.opacity = "1";
            fitContain();
            if (viewport) viewport.focus({ preventScroll: true });
        };

        if (modalHDImage.complete && modalHDImage.naturalWidth) finish();
        else modalHDImage.onload = finish;
    }

    const closeImgModal = () => {
        if (!imageModal) return;
        imageModal.style.display = "none";
        modalHDImage.src = "";
        modalHDImage.onload = null;
        document.body.style.overflow = "";
        dragging = false;
        activePointers.clear();
        scale = 1;
        tx = 0;
        ty = 0;
    };

    document.querySelectorAll(".article-image-figure img").forEach((img) => {
        img.addEventListener("click", () => openImgModal(img));
        img.style.cursor = "zoom-in";
        img.title = img.title || "Click to zoom";
    });

    if (imgModalCloseBtn) imgModalCloseBtn.addEventListener("click", closeImgModal);

    if (imageModal) {
        imageModal.addEventListener("click", (e) => {
            if (e.target === imageModal) closeImgModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (!imageModal || imageModal.style.display !== "flex") return;
        if (e.key === "Escape") {
            closeImgModal();
            return;
        }
        if (e.key === "+" || e.key === "=") {
            e.preventDefault();
            zoomBy(1.25);
        } else if (e.key === "-" || e.key === "_") {
            e.preventDefault();
            zoomBy(1 / 1.25);
        } else if (e.key === "0") {
            e.preventDefault();
            fitContain();
        } else if (e.key === "1") {
            e.preventDefault();
            zoomToActual();
        } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            const step = 60;
            if (e.key === "ArrowLeft") tx += step;
            if (e.key === "ArrowRight") tx -= step;
            if (e.key === "ArrowUp") ty += step;
            if (e.key === "ArrowDown") ty -= step;
            clampPan();
            applyTransform();
        }
    });

    /* ── Text Selection Translation & Search (User Friendly) ── */
    const tooltip = document.createElement('div');
    tooltip.className = 'selection-translate-tooltip';

    const translateBtn = document.createElement('button');
    translateBtn.className = 'tooltip-action-btn translate-btn';
    translateBtn.innerHTML = '🌍 Translate to Tamil';

    const searchBtn = document.createElement('button');
    searchBtn.className = 'tooltip-action-btn search-btn';
    searchBtn.innerHTML = '🔍 Search Google';

    tooltip.appendChild(translateBtn);
    tooltip.appendChild(searchBtn);
    document.body.appendChild(tooltip);

    document.addEventListener('mouseup', function (e) {
        if (e.target.closest('.modal-box') || e.target.closest('.selection-translate-tooltip')) return;

        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0 && e.target.closest('.article-body')) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                tooltip.style.top = `${rect.top + window.scrollY - 38}px`;
                tooltip.classList.add('visible');
                tooltip.dataset.text = text;
            } else {
                tooltip.classList.remove('visible');
            }
        }, 10);
    });

    document.addEventListener('mousedown', function (e) {
        if (!e.target.closest('.selection-translate-tooltip')) {
            tooltip.classList.remove('visible');
        }
    });

    translateBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const text = tooltip.dataset.text;
        if (text) {
            window.open(`https://translate.google.com/?sl=en&tl=ta&text=${encodeURIComponent(text)}&op=translate`, '_blank', 'noopener');
            tooltip.classList.remove('visible');
            window.getSelection().removeAllRanges();
        }
    });

    searchBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const text = tooltip.dataset.text;
        if (text) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank', 'noopener');
            tooltip.classList.remove('visible');
            window.getSelection().removeAllRanges();
        }
    });
});
