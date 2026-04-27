const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/import \{ firebaseApiFetch \} from '\.\/lib\/firebaseApi';\r?\n/, '');
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('done');
