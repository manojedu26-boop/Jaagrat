const fs = require('fs');

let code = fs.readFileSync('c:/Jaagrat/scratch/generate_web.js', 'utf8');

// Replace multiline strings inside double quotes for titles
code = code.replace(/criticalMicrosleepTitle:\s*"([^"]*)\n([^"]*)"/g, 'criticalMicrosleepTitle: "$1: $2"');
code = code.replace(/criticalHeadDropTitle:\s*"([^"]*)\n([^"]*)"/g, 'criticalHeadDropTitle: "$1: $2"');
code = code.replace(/criticalYawnsTitle:\s*"([^"]*)\n([^"]*)"/g, 'criticalYawnsTitle: "$1: $2"');

fs.writeFileSync('c:/Jaagrat/scratch/generate_web.js', code, 'utf8');
console.log('Fixed generate_web.js multiline strings.');
