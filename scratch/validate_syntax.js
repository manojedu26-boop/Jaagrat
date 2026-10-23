const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('c:/Jaagrat/index.html', 'utf8');
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart, scriptEnd);

try {
  new vm.Script(script);
  console.log('VALIDATION SUCCESS: <script> parsed with zero syntax errors!');
} catch (e) {
  console.error('Syntax error detected:', e.message);
  console.error(e.stack);
  process.exit(1);
}
