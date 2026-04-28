const fs = require('fs');

let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\\n');

let idx = lines.findIndex(l => l.includes('<div className="flex items-center space-x-4">'));

if (idx !== -1) {
    if (!lines[idx+1].includes('onClick={toggleTheme}')) {
        lines.splice(idx + 1, 0,
            '              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl">',
            '                {themeMode === \\'dark\\' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}',
            '              </button>'
        );
    }
}

let mobileIdx = lines.findIndex(l => l.includes('</nav>') && l.includes('bottom-0')); // find mobile nav end
if (mobileIdx === -1) {
   mobileIdx = lines.findIndex(l => l.includes('</nav>') && lines[l-1] && lines[l-1].includes('Admin')); // fallback
}

// Just add it to mobile nav too
let startMobileIdx = lines.findIndex(l => l.includes('<nav className="fixed bottom-0'));
if (startMobileIdx !== -1 && !lines[startMobileIdx+1].includes('onClick={toggleTheme}')) {
     lines.splice(startMobileIdx + 1, 0,
            '        <button onClick={toggleTheme} className="p-2 absolute top-2 right-2 md:hidden text-muted-foreground hover:text-foreground transition-colors bg-secondary/80 rounded-full shadow-soft backdrop-blur-md">',
            '          {themeMode === \\'dark\\' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}',
            '        </button>'
     );
}

fs.writeFileSync('src/App.tsx', lines.join('\\n'));
