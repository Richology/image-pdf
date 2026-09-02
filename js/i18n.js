/**
 * i18n.js - Internationalization for Papery
 * Supports: Chinese (zh) and English (en), default: zh
 */

const translations = {
  zh: {
    title: 'Papery - 简单快速的 PDF 工具',
    navTools: '工具',
    heroTitle: '几秒钟，把图片变成正式 PDF',
    heroCopy: '多图上传、排序、旋转与本地导出，都在浏览器中完成。',
    uploadOr: '或者',
    toolsTitle: '更多工具',
    toolsCopy: '未来会陆续添加的文件工具。',
    toolImagesTitle: '图片转 PDF',
    toolImagesCopy: '把零散图片整理成一份清爽 PDF',
    toolMergeTitle: 'PDF 合并',
    toolMergeCopy: '合并多个 PDF 文件',
    toolCompressTitle: 'PDF 压缩',
    toolCompressCopy: '减少文件大小',
    toolConvertTitle: 'PDF 转图片',
    toolConvertCopy: '导出高清图片',
    comingSoon: '即将推出',
    uploadPanelKicker: '添加文件',
    uploadPanelTitle: '图片转 PDF',
    previewKicker: '文件预览',
    previewTitle: '拖拽缩略图，自由调整页面顺序',
    exportKicker: '导出设置',
    exportTitle: '生成 PDF',
    exportHint: '支持 A4、Letter 和原图尺寸。导出完成后自动下载 PDF。',
    privacyNote: '文件只在本机浏览器处理，不会上传到服务器。',
    uploadHint: '拖放图片到这里',
    uploadButton: '选择文件',
    imageCount: '已添加 {count} 张图片',
    emptyHint: '选择图片后，它们会显示在这里',
    loadingImages: '正在读取图片...',
    delete: '删除',
    clearAll: '清空',
    exportPDF: '导出 PDF',
    exportEmptyHint: '添加图片后，即可调整导出设置。',
    exporting: '正在生成 PDF...',
    pageSize: '页面尺寸',
    pageSizeA4: 'A4',
    pageSizeLetter: 'Letter',
    pageSizeOriginal: '原图尺寸',
    quality: '图片质量',
    qualityHigh: '高',
    qualityMedium: '推荐',
    qualityHint: '推荐：平衡清晰度与文件大小',
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
    title: 'Papery - Simple, fast PDF tools',
    navTools: 'Tools',
    heroTitle: 'Turn images into a polished PDF in seconds',
    heroCopy: 'Upload, reorder, rotate, and export images right in your browser.',
    uploadOr: 'or',
    toolsTitle: 'More tools',
    toolsCopy: 'More simple file tools are on the way.',
    toolImagesTitle: 'Images to PDF',
    toolImagesCopy: 'Turn loose images into one tidy PDF',
    toolMergeTitle: 'Merge PDF',
    toolMergeCopy: 'Combine multiple PDF files',
    toolCompressTitle: 'Compress PDF',
    toolCompressCopy: 'Reduce file size',
    toolConvertTitle: 'PDF to Images',
    toolConvertCopy: 'Export high-quality images',
    comingSoon: 'Coming soon',
    uploadPanelKicker: 'Add files',
    uploadPanelTitle: 'Images to PDF',
    previewKicker: 'File preview',
    previewTitle: 'Drag thumbnails to set your page order',
    exportKicker: 'Export settings',
    exportTitle: 'Create PDF',
    exportHint: 'Supports A4, Letter, and original image sizes. The PDF downloads automatically when ready.',
    privacyNote: 'Files are processed in this browser and never uploaded to a server.',
    uploadHint: 'Drop images here',
    uploadButton: 'Choose files',
    imageCount: '{count} image(s) added',
    emptyHint: 'Your images will appear here.',
    loadingImages: 'Reading images...',
    delete: 'Delete',
    clearAll: 'Clear',
    exportPDF: 'Export PDF',
    exportEmptyHint: 'Add images to adjust export settings.',
    exporting: 'Generating PDF...',
    pageSize: 'Page Size',
    pageSizeA4: 'A4',
    pageSizeLetter: 'Letter',
    pageSizeOriginal: 'Original',
    quality: 'Image Quality',
    qualityHigh: 'High',
    qualityMedium: 'Recommended',
    qualityHint: 'Recommended: balances clarity and file size',
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
