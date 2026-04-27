const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /<LeaderboardPage students=\{students\} masterGoals=\{masterGoals\} calculateTotalPoints=\{calculateTotalPoints\} navigateTo=\{navigateTo\} isLoading=\{isLoading\} appSettings=\{appSettings\} \/>/g,
  '<ErrorBoundary><LeaderboardPage students={students} masterGoals={masterGoals} calculateTotalPoints={calculateTotalPoints} navigateTo={navigateTo} isLoading={isLoading} appSettings={appSettings} /></ErrorBoundary>'
);
code = code.replace(
  /<StudentProfilePage([\s\S]*?)navigateTo=\{navigateTo\}\n*\s*\/>/g,
  '<ErrorBoundary>\n                <StudentProfilePage$1navigateTo={navigateTo}\n                />\n              </ErrorBoundary>'
);
code = code.replace(
  /<AdminDashboard([\s\S]*?)navigateTo=\{navigateTo\}\n*\s*\/>/g,
  '<ErrorBoundary>\n                  <AdminDashboard$1navigateTo={navigateTo}\n                  />\n                </ErrorBoundary>'
);
fs.writeFileSync('src/App.tsx', code);
