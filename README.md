# Papery

> Turn photos and images into one clean PDF, privately in your browser.

[English](README.md) | [简体中文](README.zh-CN.md)

**Try it online: [https://pdf.richology.cn/](https://pdf.richology.cn/)**

Papery is a free, lightweight image-to-PDF tool. Add multiple images, arrange them in the right order, rotate them when needed, and export a polished PDF without uploading your files to a server.

![Papery illustration](assets/pdf-hero.png)

## Why I built Papery

I once needed to turn several paper contracts into a single PDF. I only had my phone with me, so taking photos was the obvious solution—but it immediately exposed two problems:

1. Phone cameras usually save scans as JPG, PNG, or other image files. A set of separate photos is not a single, continuous PDF that is easy to send, review, or archive.
2. Many PDF creation tools put this basic workflow behind a paywall, require an account, add watermarks, or ask you to upload sensitive documents.

I wanted a simpler option: open a webpage, select the photos, put them in order, and download one PDF. That small need became Papery.

## Where it helps

Papery is useful whenever several images need to become one shareable document:

- **Contracts and signed documents** — photograph every page and combine them in the correct order.
- **Receipts and reimbursements** — collect meal, travel, and purchase receipts into one expense file.
- **Class notes and study materials** — turn notebook pages, handouts, and whiteboard photos into a single PDF.
- **Forms and applications** — package photographed forms and supporting documents for submission.
- **Portfolios and field reports** — organize sketches, inspection photos, or site records into one document.
- **Personal archives** — preserve letters, certificates, recipes, or family documents in a format that is easier to store and share.

## Features

- Add multiple images by file picker or drag and drop
- Reorder pages by dragging thumbnails
- Rotate or remove individual images before export
- Choose A4, Letter, or original image dimensions
- Adjust image quality to balance clarity and file size
- Add optional page numbers
- Process up to 200 images, with automatic resizing for very large dimensions
- Generate and download the PDF directly in your browser
- Switch between English and Chinese in the web interface

## Privacy first

Your files stay on your device. Image processing and PDF generation happen locally in the browser; Papery does not upload your contracts, receipts, notes, or photos to a server.

This also means that processing speed and memory usage depend on your device, especially when working with many high-resolution photos.

## How to use it

1. Open [Papery](https://pdf.richology.cn/).
2. Select or drag in your images.
3. Reorder, rotate, or remove pages in the preview area.
4. Choose the page size, image quality, and page-number preference.
5. Click **Export PDF** to download the finished document.

## Run locally

Papery is a static web app with no build step. Clone the repository and serve the directory with any local HTTP server:

```bash
git clone https://github.com/Richology/image-pdf.git
cd image-pdf
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Built with

- HTML, CSS, and vanilla JavaScript
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [SortableJS](https://github.com/SortableJS/Sortable) for drag-and-drop page ordering

## Contributing

Contributions are welcome. If you have an idea, find a bug, want to improve accessibility or translations, or can make the workflow better, please open an issue or submit a pull request.

For a pull request, please keep the change focused, explain the problem it solves, and test the image-to-PDF flow in a modern browser.

