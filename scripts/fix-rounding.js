import fs from 'fs';
import path from 'path';

function fixRounding(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixRounding(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      content = content.replace(/sm:rounded-\[2rem\]/g, 'sm:rounded-lg');
      content = content.replace(/rounded-\[1\.5rem\]/g, 'rounded-xl');
      content = content.replace(/rounded-\[2rem\]/g, 'rounded-xl');
      content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-xl');
      content = content.replace(/rounded-b-\[2\.5rem\]/g, 'rounded-b-xl');
      content = content.replace(/md:rounded-\[2\.5rem\]/g, 'md:rounded-xl');
      content = content.replace(/rounded-3xl/g, 'rounded-xl');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

fixRounding('./src');
console.log('Rounding fixes applied.');
