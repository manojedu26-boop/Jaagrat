const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const hasCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  if (!content.includes('manifest.json')) {
    const headTarget = '<title>Jaagrat (जाग्रत) — Commercial Driver Fatigue Detection & Fleet Portal</title>';
    const pwaMeta = `<title>Jaagrat (जाग्रत) — Commercial Driver Fatigue Detection & Fleet Portal</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/svg+xml" href="/assets/icon-192.svg">
  <meta name="theme-color" content="#0F172A">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Jaagrat">`;
    content = content.replace(headTarget, pwaMeta);
    console.log(`[OK] Added PWA & APK Manifest tags to ${filePath}`);
  }

  if (!content.includes("navigator.serviceWorker.register('/sw.js')")) {
    const swScriptTarget = '  <!-- Google MediaPipe Face Mesh & Camera Utils CDN -->';
    const swRegistration = `  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration note:', err));
      });
    }
  </script>\n` + swScriptTarget;
    content = content.replace(swScriptTarget, swRegistration);
    console.log(`[OK] Added Service Worker registration to ${filePath}`);
  }

  if (hasCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile(path.join(__dirname, '../index.html'));
updateFile(path.join(__dirname, '../web/index.html'));
console.log('Update script completed.');
