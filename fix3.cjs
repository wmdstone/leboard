const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\/\/ --- ADMIN DASHBOARD ---\r?\n:\s*\{\r?\n\s*students: Student\[\];/g, 
"// --- ADMIN DASHBOARD ---\nexport function AdminDashboard({ students, refreshData, masterGoals, categories, calculateTotalPoints, appSettings, setAppSettings, navigateTo }: {\n  students: Student[];");

content = content.replace(/\/\/ --- ADMIN TABS \(API INTEGRATED\) ---\r?\n\r?\n:\s*any\)\s*\{\r?\n\s*const \[searchFilter/g,
"// --- ADMIN TABS (API INTEGRATED) ---\nexport function AdminStudentsTab({ students, refreshData, masterGoals, categories, calculateTotalPoints }: any) {\n  const [searchFilter");

content = content.replace(/\/\/ Tracks & Master Goals Unified Tab\r?\n:\s*any\)\s*\{\r?\n\s*\/\/ Goal Modal States/g,
"// Tracks & Master Goals Unified Tab\nexport function AdminGoalsTab({ masterGoals, refreshData, categories }: any) {\n  // Goal Modal States");

content = content.replace(/\s*\);\r?\n\}\r?\n\r?\n:\s*any\)\s*\{\r?\n\s*\/\/ Alias/g,
"\n  );\n}\n\nexport function AdminAppearanceTab({ refreshData, appSettings, setAppSettings }: any) {\n  // Alias");

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed regex');
