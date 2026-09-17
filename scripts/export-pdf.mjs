import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Tìm Edge hoặc Chrome
const candidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
];

let browserPath = candidates.find(p => p && existsSync(p));

if (!browserPath) {
  try {
    const whichEdge = execSync('where msedge', { encoding: 'utf-8' }).trim().split('\n')[0].trim();
    if (whichEdge && existsSync(whichEdge)) browserPath = whichEdge;
  } catch (e) {}
}

if (!browserPath) {
  try {
    const whichChrome = execSync('where chrome', { encoding: 'utf-8' }).trim().split('\n')[0].trim();
    if (whichChrome && existsSync(whichChrome)) browserPath = whichChrome;
  } catch (e) {}
}

console.log('Browser executable found:', browserPath);

// Parser markdown đơn giản nhưng đầy đủ tính năng: headers, table, code blocks, alerts, lists, bold, blockquotes
function markdownToHtml(md) {
  let html = md;

  // Escape HTML tags to prevent broken layout except known safe
  // Code blocks ```
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="code-block"><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers #
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Horizontal Rule
  html = html.replace(/^---$/gim, '<hr />');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
    const lines = match.trim().split(/\r?\n/).filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return match;
    
    let tableHtml = '<table class="styled-table">\n';
    let isHeader = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('---') && (line.includes(':---') || line.includes('---:'))) {
        isHeader = false;
        continue;
      }
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      if (isHeader && i === 0) {
        tableHtml += '  <thead>\n    <tr>\n';
        cells.forEach(c => { tableHtml += `      <th>${c}</th>\n`; });
        tableHtml += '    </tr>\n  </thead>\n  <tbody>\n';
      } else {
        tableHtml += '    <tr>\n';
        cells.forEach(c => { tableHtml += `      <td>${c}</td>\n`; });
        tableHtml += '    </tr>\n';
      }
    }
    tableHtml += '  </tbody>\n</table>\n';
    return tableHtml;
  });

  // Lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
  // Clean nested duplicate uls
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Paragraphs
  const sections = html.split(/\n\n+/);
  html = sections.map(sec => {
    const s = sec.trim();
    if (!s) return '';
    if (s.startsWith('<h') || s.startsWith('<table') || s.startsWith('<ul') || s.startsWith('<pre') || s.startsWith('<hr') || s.startsWith('<blockquote')) {
      return s;
    }
    return `<p>${s.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n\n');

  return html;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.65;
    font-size: 13.5px;
    background: #ffffff;
    margin: 0;
    padding: 20px 25px;
  }

  h1 {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2.5px solid #5C7A3F;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 16px;
    font-weight: 700;
    color: #2e441b;
    margin-top: 24px;
    margin-bottom: 10px;
    border-left: 4px solid #5C7A3F;
    padding-left: 10px;
    page-break-after: avoid;
  }

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  }

  .styled-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 12px;
    page-break-inside: avoid;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    overflow: hidden;
  }

  .styled-table th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
  }

  .styled-table td {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  .styled-table tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .code-block {
    background: #0f172a;
    color: #f8fafc;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 11.5px;
    line-height: 1.5;
    margin: 12px 0;
    white-space: pre-wrap;
    word-break: break-word;
    page-break-inside: avoid;
  }

  .inline-code {
    background: #f1f5f9;
    color: #b91c1c;
    font-family: 'JetBrains Mono', Consolas, monospace;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid #e2e8f0;
  }

  blockquote {
    border-left: 3px solid #cbd5e1;
    margin: 10px 0;
    padding-left: 12px;
    color: #475569;
    font-style: italic;
  }

  ul {
    margin-top: 4px;
    margin-bottom: 12px;
    padding-left: 22px;
  }

  li {
    margin-bottom: 4px;
  }

  .header-badge {
    display: inline-block;
    background: #ecfdf5;
    color: #065f46;
    font-weight: 700;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #a7f3d0;
    margin-bottom: 8px;
  }
`;

function exportFile(mdFilename, pdfFilename, title) {
  const mdPath = join(root, mdFilename);
  const pdfPath = join(root, pdfFilename);
  const tmpHtmlPath = join(root, `${pdfFilename}.html`);

  console.log(`\n⏳ Đang xử lý: ${mdFilename} -> ${pdfFilename}...`);
  const mdContent = readFileSync(mdPath, 'utf-8');
  const bodyHtml = markdownToHtml(mdContent);

  const fullHtml = `<!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>${css}</style>
  </head>
  <body>
    ${bodyHtml}
  </body>
  </html>`;

  writeFileSync(tmpHtmlPath, fullHtml, 'utf-8');

  // Chạy headless browser print-to-pdf
  const cmd = `"${browserPath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${tmpHtmlPath}"`;
  execSync(cmd, { stdio: 'inherit' });
  try { unlinkSync(tmpHtmlPath); } catch (e) {}
  console.log(`✅ Đã xuất thành công: ${pdfFilename}`);
}

exportFile('SECURITY-REPORT-v01.md', 'SECURITY-REPORT-v01.pdf', 'Báo cáo An toàn Bảo mật v01 - Cowdi English');
exportFile('SEO-REPORT-v01.md', 'SEO-REPORT-v01.pdf', 'Báo cáo Chiến lược SEO v01 - Cowdi English');
exportFile('STANDARDS-REPORT-v01.md', 'STANDARDS-REPORT-v01.pdf', 'Báo cáo Tiêu chuẩn Công nghệ v01 - Cowdi English');
exportFile('IEEE-AND-NESTJS-REPORT-v01.md', 'IEEE-AND-NESTJS-REPORT-v01.pdf', 'Báo cáo Tiêu chuẩn IEEE & So sánh NestJS - Cowdi English');
console.log('\n🎉 Hoàn thành xuất toàn bộ các file PDF!');
