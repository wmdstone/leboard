const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
"// --- ADMIN DASHBOARD ---\n: {\n  students: Student[];\n  refreshData: () => void;",
"// --- ADMIN DASHBOARD ---\nexport function AdminDashboard({ students, refreshData, masterGoals, categories, calculateTotalPoints, appSettings, setAppSettings, navigateTo }: {\n  students: Student[];\n  refreshData: () => void;"
);

content = content.replace(
"// --- ADMIN TABS (API INTEGRATED) ---\n\n: any) {\n  const [searchFilter",
"// --- ADMIN TABS (API INTEGRATED) ---\nexport function AdminStudentsTab({ students, refreshData, masterGoals, categories, calculateTotalPoints }: any) {\n  const [searchFilter"
);

content = content.replace(
"// Tracks & Master Goals Unified Tab\n: any) {\n  // Goal Modal States",
"// Tracks & Master Goals Unified Tab\nexport function AdminGoalsTab({ masterGoals, refreshData, categories }: any) {\n  // Goal Modal States"
);

content = content.replace(
"  );\n}\n\n: any) {\n  // Alias",
"  );\n}\n\nexport function AdminAppearanceTab({ refreshData, appSettings, setAppSettings }: any) {\n  // Alias"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed');
