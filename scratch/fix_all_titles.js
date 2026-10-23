const fs = require('fs');

let content = fs.readFileSync('c:/Jaagrat/scratch/generate_web.js', 'utf8');

// Replace any \nPlease or \\nPlease with " - Please"
content = content.replace(/\\?n\s*Please ensure camera permission is allowed\./g, ' - Please ensure camera permission is allowed.');

// Also check for any other \n inside string quotes
content = content.replace(/alertTitleText'\)\.innerHTML\s*=\s*reason\.replace\('\\\\n',\s*'<br>'\);/g, "alertTitleText').textContent = reason;");

fs.writeFileSync('c:/Jaagrat/scratch/generate_web.js', content, 'utf8');
console.log('Fixed camera alert and innerHTML replacement.');
