import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const anchor = \`<div className="flex items-center space-x-4">\`;
const addition = \`<button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl">
  {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
</button>\`;

if (!content.includes('onClick={toggleTheme}')) {
  content = content.replace(anchor, anchor + "\\n" + addition);
  fs.writeFileSync('src/App.tsx', content);
}
