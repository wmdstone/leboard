import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  '<div className="flex items-center space-x-4">\\n              <button \\n                onClick={() => navigateTo(\\'/\\')}\\n                className={\`px-4 py-2 rounded-xl text-sm font-semibold transition-all \${currentRoute.path === \\'/\\' ? \\'bg-primary/10 text-primary\\' : \\'text-muted-foreground hover:bg-secondary\\'}\`}\\n              >\\n                Leaderboard\\n              </button>',
  \`<div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl">
                {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => navigateTo('/')}
                className={\\\`px-4 py-2 rounded-xl text-sm font-semibold transition-all \\\${\\currentRoute.path === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}\\\`\}
              >
                Leaderboard
              </button>\`
);

fs.writeFileSync('src/App.tsx', content);
