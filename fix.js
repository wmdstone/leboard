const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove duplicate themeMode (by finding the duplicated block roughly)
const matches = [...content.matchAll(/const \\\[themeMode/g)];
if (matches.length > 1) {
  // It got duplicated. Let's just find the first "const [themeMode" and grab everything up to "const [currentRoute"
  let idx1 = content.indexOf('const [themeMode');
  let idx2 = content.lastIndexOf('const [themeMode');
  let idxSplit = content.indexOf('const [currentRoute', idx2);
  if (idx1 !== -1 && idx2 !== -1 && idx1 !== idx2) {
    content = content.substring(0, idx2) + content.substring(idxSplit);
  }
}

// 2. Add Moon and Sun icon imports
if (!content.includes('Sun, Moon')) {
  content = content.replace('Database, Server, ShieldCheck', 'Database, Server, ShieldCheck, Sun, Moon');
}

// 3. Add to Navbar
if (!content.includes('onClick={toggleTheme}')) {
  let repl = \`<div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl">
                {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => navigateTo('/')}\`;
  
  content = content.replace(
    \`<div className="flex items-center space-x-4">
              <button 
                onClick={() => navigateTo('/')}\`,
    repl
  );
}

fs.writeFileSync('src/App.tsx', content);
