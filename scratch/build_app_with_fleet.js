const fs = require('fs');
const path = require('path');

// Read existing build_full_app.js to inspect its length and structure
const srcPath = path.join(__dirname, 'build_full_app.js');
const src = fs.readFileSync(srcPath, 'utf8');

console.log('Read build_full_app.js with length: ' + src.length);
