/**
 * app.js - Main application logic for Images to PDF tool
 * Dependencies: jsPDF (CDN), SortableJS (CDN), i18n.js
 */

(function () {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    images: [],        // { id, name, dataUrl, width, height, rotation }
    isProcessing: false,
  };

  const MAX_IMAGES = 200;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  const MAX_IMAGE_DIM = 6000; // px — auto-resize if any side exceeds this
  const PAGE_SIZES = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
  };

  // ============================================
  // DOM References
  // ============================================
  let els = {};

  function cacheDom() {
    els = {
      dropZone: document.getElementById('dropZone'),
      fileInput: document.getElementById('fileInput'),
      grid: document.getElementById('thumbnailGrid'),
      imageCount: document.getElementById('imageCount'),
      exportBtn: document.getElementById('exportBtn'),
      clearAllBtn: document.getElementById('clearAll'),
      langToggle: document.getElementById('langToggle'),
      pageSize: document.getElementById('pageSize'),
      quality: document.getElementById('quality'),
      pageNumber: document.getElementById('pageNumberToggle'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      loadingText: document.getElementById('loadingText'),
      toast: document.getElementById('toast'),
    };
  }

  // ============================================
  // Helpers
  // ============================================
  let idCounter = 0;
  function generateId() {
    return `img-${Date.now()}-${++idCounter}`;
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode error'));
      img.src = src;
    });
  }

  // ============================================
  // Image Processing
  // ============================================
  async function processFile(file) {
    // Validate type
    if (!file.type.startsWith('image/')) {
      showToast(t('unsupportedFile', { type: file.type || file.name.split('.').pop() }), 'error');
      return null;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      showToast(t('imageTooLarge'), 'error');
      return null;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);

      let finalDataUrl = dataUrl;
      let finalWidth = img.naturalWidth;
      let finalHeight = img.naturalHeight;

      // Auto-resize if dimensions exceed limit
      if (finalWidth > MAX_IMAGE_DIM || finalHeight > MAX_IMAGE_DIM) {
        const ratio = Math.min(MAX_IMAGE_DIM / finalWidth, MAX_IMAGE_DIM / finalHeight);
        const newW = Math.round(finalWidth * ratio);
        const newH = Math.round(finalHeight * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newW, newH);
        finalDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        finalWidth = newW;
        finalHeight = newH;
      }

      return {
        id: generateId(),
        name: file.name,
        dataUrl: finalDataUrl,
        width: finalWidth,
        height: finalHeight,
        rotation: 0,
      };
    } catch (e) {
      console.error('Failed to process image:', file.name, e);
      showToast(t('loadError', { name: file.name }), 'error');
      return null;
    }
  }

  async function handleFiles(files) {
    if (state.isProcessing) return;
    const fileArray = Array.from(files);

    if (state.images.length + fileArray.length > MAX_IMAGES) {
      showToast(t('maxImagesWarning'), 'info');
      // Only take the allowed number
      const remaining = MAX_IMAGES - state.images.length;
      if (remaining <= 0) return;
      fileArray.splice(remaining);
    }

    state.isProcessing = true;

    const results = await Promise.all(fileArray.map(f => processFile(f)));
    const validImages = results.filter(Boolean);

    if (validImages.length > 0) {
      state.images.push(...validImages);
      renderThumbnails();
      updateImageCount();
    }

    state.isProcessing = false;
  }

  // ============================================
  // Image CRUD
  // ============================================
  function deleteImage(id) {
    state.images = state.images.filter(img => img.id !== id);
    renderThumbnails();
    updateImageCount();
  }

  function rotateImage(id) {
    const img = state.images.find(i => i.id === id);
    if (!img) return;
    img.rotation = (img.rotation + 90) % 360;
    renderThumbnails();
  }

  function clearAll() {
    if (state.images.length === 0) return;
    if (!confirm(t('confirmClear'))) return;
    state.images = [];
    renderThumbnails();
    updateImageCount();
  }

  // ============================================
  // Rendering
  // ============================================
  let sortableInstance = null;

  function initSortable() {
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }

    if (state.images.length < 2) return;

    sortableInstance = new Sortable(els.grid, {
      animation: 200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      onEnd: () => {
        const order = Array.from(els.grid.children).map(el => el.dataset.id);
        // Re-index images array to match DOM order
        const idToImg = {};
        state.images.forEach(img => { idToImg[img.id] = img; });
        state.images = order.map(id => idToImg[id]).filter(Boolean);

        // Update order numbers without full re-render
        document.querySelectorAll('.order-num').forEach((el, i) => {
          el.textContent = i + 1;
        });
      },
    });
  }

  function renderThumbnails() {
    if (state.images.length === 0) {
      els.grid.innerHTML = `<div class="empty-state">${t('emptyHint')}</div>`;
      updateExportButton();
      return;
    }

    els.grid.innerHTML = state.images.map((img, index) => {
      const rotClass = img.rotation === 0 ? '' : ` rotation-${img.rotation}`;
      return `
        <div class="thumb-item" data-id="${img.id}">
          <div class="thumb-img-wrapper${rotClass}">
            <img src="${img.dataUrl}" alt="${escapeHtml(img.name)}" loading="lazy">
            <div class="thumb-actions">
              <button class="btn-rotate" data-action="rotate" data-id="${img.id}" title="${t('rotate')}" aria-label="${t('rotate')}">&#x21bb;</button>
              <button class="btn-delete" data-action="delete" data-id="${img.id}" title="${t('delete')}" aria-label="${t('delete')}">&times;</button>
            </div>
          </div>
          <div class="thumb-info">
            <div class="thumb-name" title="${escapeHtml(img.name)}">${escapeHtml(truncateFilename(img.name))}</div>
            <div class="thumb-meta">
              <span class="order-num">${index + 1}</span>
              <span class="img-size">${img.width}&thinsp;&times;&thinsp;${img.height}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    initSortable();
    updateExportButton();
  }

  function updateImageCount() {
    els.imageCount.textContent = t('imageCount', { count: state.images.length });
  }

  function updateExportButton() {
    els.exportBtn.disabled = state.images.length === 0;
  }

  /** Minimal HTML escaping */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Truncate filename for display */
  function truncateFilename(name, maxLen = 22) {
    if (name.length <= maxLen) return name;
    const ext = name.lastIndexOf('.');
    if (ext === -1) return name.slice(0, maxLen - 1) + '…';
    const extStr = name.slice(ext);
    const base = name.slice(0, ext);
    const maxBase = maxLen - extStr.length - 1;
    if (maxBase < 3) return name.slice(0, maxLen - 1) + '…';
    return base.slice(0, maxBase) + '…' + extStr;
  }

  // ============================================
  // PDF Generation
  // ============================================
  async function generatePDF() {
    if (state.images.length === 0) {
      showToast(t('noImagesError'), 'error');
      return;
    }

    // Check jsPDF loaded
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF !== 'function') {
      showToast(t('noLibrary'), 'error');
      return;
    }

    const { jsPDF } = window.jspdf;

    showLoading(true);
    await sleep(100); // Let the loading overlay render

    try {
      const pageSizeKey = els.pageSize.value;
      const quality = parseFloat(els.quality.value);
      const showPageNum = els.pageNumber.value === 'on';
      const useOriginalSize = pageSizeKey === 'original';

      let pageW, pageH;
      let pdf;

      if (useOriginalSize) {
        // Create first page based on first image
        const first = state.images[0];
        const dims = getOriginalPageDims(first);
        pageW = dims.width;
        pageH = dims.height;
        pdf = new jsPDF({ orientation: pageW > pageH ? 'l' : 'p', unit: 'mm', format: [pageW, pageH] });
      } else {
        const size = PAGE_SIZES[pageSizeKey];
        pageW = size.width;
        pageH = size.height;
        pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [pageW, pageH] });
      }

      for (let i = 0; i < state.images.length; i++) {
        const img = state.images[i];
        if (i > 0) {
          if (useOriginalSize) {
            const dims = getOriginalPageDims(img);
            pageW = dims.width;
            pageH = dims.height;
            pdf.addPage([pageW, pageH]);
          } else {
            pdf.addPage();
          }
        }

        // Render image with rotation onto a canvas
        const imgEl = await loadImage(img.dataUrl);
        const canvas = renderRotatedCanvas(imgEl, img.rotation, quality);
        const imgData = canvas.toDataURL('image/jpeg', quality);

        // Calculate placement to fit page with margins
        const margin = 10; // mm
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const imgAspect = canvas.width / canvas.height;
        const pageAspect = maxW / maxH;

        let renderW, renderH;
        if (imgAspect > pageAspect) {
          renderW = maxW;
          renderH = maxW / imgAspect;
        } else {
          renderH = maxH;
          renderW = maxH * imgAspect;
        }

        const x = (pageW - renderW) / 2;
        const y = (pageH - renderH) / 2;

        pdf.addImage(imgData, 'JPEG', x, y, renderW, renderH);

        // Page number
        if (showPageNum && state.images.length > 1) {
          pdf.setPage(i + 1);
          pdf.setFontSize(9);
          pdf.setTextColor(140, 140, 140);
          pdf.text(`${i + 1} / ${state.images.length}`, pageW - margin, pageH - 4, { align: 'right' });
        }
      }

      // Add total pages count for single-page PDFs when page numbers are on
      if (showPageNum && state.images.length === 1) {
        pdf.setPage(1);
        pdf.setFontSize(9);
        pdf.setTextColor(140, 140, 140);
        pdf.text(`1 / 1`, pageW - 10, pageH - 4, { align: 'right' });
      }

      // Save
      pdf.save('images.pdf');
      showToast(t('success'), 'success');
    } catch (e) {
      console.error('PDF generation error:', e);
      showToast(t('error'), 'error');
    } finally {
      showLoading(false);
    }
  }

  function getOriginalPageDims(img) {
    // Convert pixels to mm at 72 DPI
    let w = img.width / 72 * 25.4;
    let h = img.height / 72 * 25.4;
    if (img.rotation === 90 || img.rotation === 270) {
      [w, h] = [h, w];
    }
    // Minimum size
    w = Math.max(w, 50);
    h = Math.max(h, 50);
    return { width: w, height: h };
  }

  function renderRotatedCanvas(img, rotation, quality) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if (rotation === 90 || rotation === 270) {
      canvas.width = h;
      canvas.height = w;
    } else {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -w / 2, -h / 2);

    return canvas;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ============================================
  // Loading / Toast UI
  // ============================================
  function showLoading(show) {
    if (show) {
      els.loadingText.textContent = t('exporting');
      els.loadingOverlay.classList.add('active');
    } else {
      els.loadingOverlay.classList.remove('active');
    }
  }

  let toastTimer = null;

  function showToast(message, type = 'info') {
    if (toastTimer) {
      clearTimeout(toastTimer);
      els.toast.classList.remove('active');
    }

    els.toast.textContent = message;
    els.toast.className = `toast ${type}`;

    // Force reflow
    void els.toast.offsetWidth;
    els.toast.classList.add('active');

    toastTimer = setTimeout(() => {
      els.toast.classList.remove('active');
      toastTimer = null;
    }, 3000);
  }

  // ============================================
  // i18n — re-render dynamic content on lang change
  // ============================================
  function refreshUI() {
    renderThumbnails();
    updateImageCount();
  }

  // ============================================
  // Event Binding
  // ============================================
  function bindEvents() {
    // File input
    els.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFiles(e.target.files);
        els.fileInput.value = '';
      }
    });

    // Upload button triggers file input
    document.getElementById('uploadBtn').addEventListener('click', () => {
      els.fileInput.click();
    });

    // Click on drop zone (except when clicking button inside it)
    els.dropZone.addEventListener('click', (e) => {
      if (e.target.closest('#uploadBtn')) return;
      if (e.target.closest('.drop-overlay')) return;
      els.fileInput.click();
    });

    // Drag & Drop
    els.dropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.dropZone.classList.add('drag-over');
    });

    els.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.dropZone.classList.add('drag-over');
    });

    els.dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only remove class if leaving the drop zone entirely
      if (!els.dropZone.contains(e.relatedTarget)) {
        els.dropZone.classList.remove('drag-over');
      }
    });

    els.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });

    // Prevent drag/drop on the whole page (avoid browser default behavior)
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    // Thumbnail actions (event delegation)
    els.grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'delete') deleteImage(id);
      if (action === 'rotate') rotateImage(id);
    });

    // Clear all
    els.clearAllBtn.addEventListener('click', clearAll);

    // Export
    els.exportBtn.addEventListener('click', generatePDF);

    // Language toggle
    els.langToggle.addEventListener('click', () => {
      const newLang = currentLang === 'zh' ? 'en' : 'zh';
      setLang(newLang);
    });

    // Listen for language changes to update dynamic content
    document.addEventListener('languageChanged', refreshUI);
  }

  // ============================================
  // Initialization
  // ============================================
  function init() {
    cacheDom();
    bindEvents();
    // Apply initial language
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('title');
    updateStaticUI();
    // Initial empty state
    renderThumbnails();
    updateImageCount();
    updateExportButton();
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
