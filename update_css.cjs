const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Replace the :root block
const rootBlock = `:root {
  --background: 40 33% 98%;
  --foreground: 20 14% 16%;
  --card: 0 0% 100%;
  --card-foreground: 20 14% 16%;
  --popover: 0 0% 100%;
  --popover-foreground: 20 14% 16%;
  --primary: 154 61% 25%;
  --primary-foreground: 0 0% 100%;
  --secondary: 40 20% 92%;
  --secondary-foreground: 20 14% 16%;
  --muted: 40 20% 92%;
  --muted-foreground: 25 10% 45%;
  --accent: 40 20% 92%;
  --accent-foreground: 20 14% 16%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 40 20% 88%;
  --input: 40 20% 88%;
  --ring: 154 61% 25%;
  --radius: 1.5rem;
  
  --sidebar: 40 33% 98%;
  --sidebar-foreground: 20 14% 16%;
  --sidebar-primary: 154 61% 25%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 40 20% 92%;
  --sidebar-accent-foreground: 20 14% 16%;
  --sidebar-border: 40 20% 88%;
  --sidebar-ring: 154 61% 25%;
}`;

code = code.replace(/:root\s*\{[\s\S]*?\}\s*(\.dark\s*\{)/, rootBlock + '\n\n$1');

// Update @theme inline section
const themeInlineAppend = `
  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.04);
  --shadow-primary-glow: 0 8px 30px rgba(25, 107, 72, 0.2);
`;

code = code.replace(/--radius-4xl: calc\(var\(--radius\) \* 2\.6\);/, '--radius-4xl: calc(var(--radius) * 2.6);\n' + themeInlineAppend);

fs.writeFileSync('src/index.css', code);
