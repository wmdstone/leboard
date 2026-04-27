const fs = require('fs');

const appTsxPaths = 'src/App.tsx';
let content = fs.readFileSync(appTsxPaths, 'utf8');

content = content.replace(/\\n/g, '\n');

fs.writeFileSync(appTsxPaths, content, 'utf8');

console.log('Fixed \\n');
