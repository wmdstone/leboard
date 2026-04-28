import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace 1: Add Sun, Moon to imports
content = content.replace(
  "Database, Server, ShieldCheck",
  "Database, Server, ShieldCheck, Sun, Moon"
);

// Replace 2: Add themeMode and toggleTheme
const themeCode = \`const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light');

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [currentRoute\`;
content = content.replace('const [currentRoute', themeCode);

// Replace 3: Add button to Desktop Navbar
const navStr = \`<div className="flex items-center space-x-4">
              <button 
                onClick={() => navigateTo('/')}\`;
const navReplace = \`<div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl" title="Toggle Theme">
                {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => navigateTo('/')}\`;
content = content.replace(navStr, navReplace);

fs.writeFileSync('src/App.tsx', content);
