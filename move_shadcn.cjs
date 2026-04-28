const fs = require('fs');
const path = require('path');

const srcDir = 'components/ui';
const destDir = 'src/components/ui';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach(file => {
  fs.renameSync(path.join(srcDir, file), path.join(destDir, file));
});

// also move lib/utils.ts to src/lib/utils.ts
if (fs.existsSync('lib/utils.ts')) {
   fs.renameSync('lib/utils.ts', 'src/lib/utils.ts');
}

let componentsJson = fs.readFileSync('components.json', 'utf8');
componentsJson = componentsJson.replace(/"@\/components\//g, '"@/src/components/');
componentsJson = componentsJson.replace(/"@\/lib\//g, '"@/src/lib/');
fs.writeFileSync('components.json', componentsJson);
