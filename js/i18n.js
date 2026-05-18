/**
 * i18n.js - Internationalization for Images to PDF tool
 * Supports: Chinese (zh) and English (en), default: zh
 */

const translations = {
  zh: {
    title: '图片合成 PDF',
    subtitle: '免费 · 纯本地处理 · 无需上传',
    footer: 'PDF工具 · 纯本地处理 · 您的图片不会离开浏览器',
    uploadHint: '拖拽图片到此处，或点击上传',
    uploadButton: '选择图片',
    imageCount: '已添加 {count} 张图片',
    emptyHint: '暂无图片，请先上传',
    delete: '删除',
    clearAll: '清空全部',
    exportPDF: '导出 PDF',
    exporting: '正在生成 PDF...',
    pageSize: '页面尺寸',
    pageSizeA4: 'A4',
    pageSizeLetter: 'Letter',
    pageSizeOriginal: '原图尺寸',
    quality: '图片质量',
    qualityHigh: '高',
    qualityMedium: '中',
    qualityLow: '低',
    pageNumber: '页码',
    pageNumberOn: '开启',
    pageNumberOff: '关闭',
    langSwitch: 'English',
    success: 'PDF 生成成功！',
    error: '生成失败，请重试',
    noImagesError: '请先添加至少一张图片',
    confirmClear: '确定要清空所有图片吗？',
    dropHint: '松开以添加图片',
    unsupportedFile: '不支持的图片格式：{type}',
    imageTooLarge: '图片文件过大，请压缩后重试',
    maxImagesWarning: '最多支持 200 张图片',
    rotate: '旋转',
    noLibrary: 'PDF 库加载失败，请检查网络连接后刷新页面',
    loadError: '图片加载失败：{name}',
  },
  en: {
    title: 'Images to PDF',
    subtitle: 'Free · Fully Local · No Upload Required',
    footer: 'PDF Tool · 100% Local Processing · Your images never leave your browser',
    uploadHint: 'Drag & drop images here, or click to upload',
    uploadButton: 'Select Images',
    imageCount: '{count} image(s) added',
    emptyHint: 'No images yet. Please upload first.',
    delete: 'Delete',
    clearAll: 'Clear All',
    exportPDF: 'Export PDF',
    exporting: 'Generating PDF...',
    pageSize: 'Page Size',
    pageSizeA4: 'A4',
    pageSizeLetter: 'Letter',
    pageSizeOriginal: 'Original',
    quality: 'Image Quality',
    qualityHigh: 'High',
    qualityMedium: 'Medium',
    qualityLow: 'Low',
    pageNumber: 'Page Number',
    pageNumberOn: 'On',
    pageNumberOff: 'Off',
    langSwitch: '中文',
    success: 'PDF generated successfully!',
    error: 'Generation failed. Please try again.',
    noImagesError: 'Please add at least one image first',
    confirmClear: 'Are you sure you want to clear all images?',
    dropHint: 'Release to add images',
    unsupportedFile: 'Unsupported image format: {type}',
    imageTooLarge: 'Image file too large. Please compress and try again.',
    maxImagesWarning: 'Maximum 200 images supported',
    rotate: 'Rotate',
    noLibrary: 'PDF library failed to load. Please check your internet connection and refresh.',
    loadError: 'Failed to load image: {name}',
  },
};

let currentLang = 'zh';
try {
  const saved = localStorage.getItem('pdfToolLang');
  if (saved === 'zh' || saved === 'en') currentLang = saved;
} catch (e) { /* localStorage unavailable */ }

/**
 * Translate a key with optional replacements.
 * @param {string} key - Translation key
 * @param {Object} [replacements] - Key-value pairs for {placeholder} replacement
 * @returns {string} Translated text
 */
function t(key, replacements = {}) {
  const text = translations[currentLang][key];
  if (text === undefined) {
    return key;
  }
  if (Object.keys(replacements).length === 0) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => replacements[k] !== undefined ? replacements[k] : `{${k}}`);
}

/**
 * Switch language and persist choice.
 * @param {'zh'|'en'} lang
 */
function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  try {
    localStorage.setItem('pdfToolLang', lang);
  } catch (e) { /* localStorage may be unavailable */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('title');
  updateStaticUI();
  // Trigger custom event so app.js can re-render dynamic content
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Update all static DOM elements that use data-i18n attributes.
 * Dynamic content (thumbnails, etc.) is handled by app.js via languageChanged event.
 */
function updateStaticUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.textContent = currentLang === 'zh' ? 'English' : '中文';
  }
}
