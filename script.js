const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\\n');

let index = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="flex items-center space-x-4">')) {
     index = i;
     break;
  }
}

if (index !== -1 && !lines[index+1].includes('toggleTheme')) {
  lines.splice(index + 1, 0, 
    '              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl">',
    '                {themeMode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}',
    '              </button>'
  );
}

fs.writeFileSync('src/App.tsx', lines.join('\\n'));
