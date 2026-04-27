const fs = require('fs');
const path = require('path');

// Re-read app content from backup or try to fix files manually?
// Actually if I made files with literal \\n, I can just replace them.

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    // replace literal backslash n with actual newline
    content = content.replace(/\\n/g, '\n');
    fs.writeFileSync(file, content, 'utf8');
}

fixFile('src/components/admin/AdminStudentsTab.tsx');
fixFile('src/components/admin/AdminGoalsTab.tsx');
fixFile('src/components/admin/AdminAppearanceTab.tsx');
fixFile('src/components/admin/AdminStatisticsTab.tsx');
fixFile('src/components/admin/AdminDashboard.tsx');
fixFile('src/App.tsx');

console.log('Fixed newlines');
