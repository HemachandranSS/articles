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
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /* ── Close modal ── */
    function closeModal() {
        modal.classList.remove('active');
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

    // Attach click event to all figures/article images
    document.querySelectorAll(".article-image-figure img").forEach((img) => {
        img.addEventListener("click", () => {
            if (!imageModal) return;
            modalHDImage.src = img.src;
            modalHDImage.alt = img.alt || "HD Image";

            // Wait for image load to capture actual HD resolution
            const tempImg = new Image();
            tempImg.src = img.src;
            tempImg.onload = () => {
                const hdWidth = tempImg.naturalWidth;
                const hdHeight = tempImg.naturalHeight;
                imageMetaInfo.innerHTML = `<strong>Resolution:</strong> ${hdWidth} × ${hdHeight} px (HD Original)`;
            };

            imageModal.style.display = "flex";
        });
    });

    // Close Modal Events
    const closeImgModal = () => {
        if (!imageModal) return;
        imageModal.style.display = "none";
        modalHDImage.src = "";
    };

    if (imgModalCloseBtn) imgModalCloseBtn.addEventListener("click", closeImgModal);

    if (imageModal) {
        imageModal.addEventListener("click", (e) => {
            if (e.target === imageModal) closeImgModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && imageModal && imageModal.style.display === "flex") {
            closeImgModal();
        }
    });
});
