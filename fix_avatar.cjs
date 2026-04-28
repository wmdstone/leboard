const fs = require('fs');
const glob = require('glob');

const files = ['src/components/admin/AdminStudentsTab.tsx', 'src/components/pages/StudentProfilePage.tsx', 'src/components/pages/LeaderboardPage.tsx', 'src/App.tsx'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/['"](.*)\/ui\/Avatar['"]/g, "'$1/ui/custom-avatar'");
    fs.writeFileSync(f, content);
  }
});
