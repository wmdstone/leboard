const fs = require('fs');

let tsconfig = fs.readFileSync('tsconfig.json', 'utf8');
tsconfig = tsconfig.replace(/"@\/\*": \["\.\/\*"\]/, '"@/*": ["./src/*"]');
fs.writeFileSync('tsconfig.json', tsconfig);

let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
if (!viteConfig.includes("resolve: { alias: {")) {
  viteConfig = viteConfig.replace(
    'plugins: [react()]',
    `plugins: [react()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    }\n  }`
  );
  if (!viteConfig.includes("import path from")) {
    viteConfig = `import path from "path";\n` + viteConfig;
  }
}
fs.writeFileSync('vite.config.ts', viteConfig);
