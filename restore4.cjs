const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\n: any\) \{\n  if \(\!isOpen\) return null;/g,
  '\nexport function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: any) {\n  if (!isOpen) return null;'
);

content = content.replace(
  /\n: \{ currentRank: number, previousRank\?: number \}\) \{\n  if \(previousRank \=\=\= undefined/g,
  '\nfunction RankMovement({ currentRank, previousRank }: { currentRank: number, previousRank?: number }) {\n  if (previousRank === undefined'
);

content = content.replace(
  /\n: \{ onLogin: \(\) => void, appSettings\?: any \}\) \{\n  const \[password/g,
  '\nfunction LoginPage({ onLogin, appSettings }: { onLogin: () => void, appSettings?: any }) {\n  const [password'
);

content = content.replace(
  /\n: \{\n\s*students: Student\[\];/g,
  '\nfunction LeaderboardPage({ students, masterGoals, calculateTotalPoints, navigateTo, isLoading, appSettings }: {\n  students: Student[];'
);

content = content.replace(
  /\n: \{\n\s*studentId: string;/g,
  '\nfunction StudentProfilePage({ studentId, students, masterGoals, categories, calculateTotalPoints, navigateTo }: {\n  studentId: string;'
);

content = content.replace(
  /\n: any\) \{\n\s*return \(\n\s*<div className="bg-base-50 p-6/g,
  '\nfunction StatCard({ title, value, icon: Icon, color }: any) {\n  return (\n    <div className="bg-base-50 p-6'
);

// Fallbacks for double newlines
content = content.replace(
  /\n\n: any\) \{\n  if \(\!isOpen\) return null;/g,
  '\n\nexport function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: any) {\n  if (!isOpen) return null;'
);

content = content.replace(
  /\n\n: \{ currentRank: number, previousRank\?: number \}\) \{\n  if \(previousRank \=\=\= undefined/g,
  '\n\nfunction RankMovement({ currentRank, previousRank }: { currentRank: number, previousRank?: number }) {\n  if (previousRank === undefined'
);

content = content.replace(
  /\n\n: \{ onLogin: \(\) => void, appSettings\?: any \}\) \{\n  const \[password/g,
  '\n\nfunction LoginPage({ onLogin, appSettings }: { onLogin: () => void, appSettings?: any }) {\n  const [password'
);

content = content.replace(
  /\n\n: \{\n\s*students: Student\[\];/g,
  '\n\nfunction LeaderboardPage({ students, masterGoals, calculateTotalPoints, navigateTo, isLoading, appSettings }: {\n  students: Student[];'
);

content = content.replace(
  /\n\n: \{\n\s*studentId: string;/g,
  '\n\nfunction StudentProfilePage({ studentId, students, masterGoals, categories, calculateTotalPoints, navigateTo }: {\n  studentId: string;'
);

content = content.replace(
  /\n\n: any\) \{\n\s*return \(\n\s*<div className="bg-base-50 p-6/g,
  '\n\nfunction StatCard({ title, value, icon: Icon, color }: any) {\n  return (\n    <div className="bg-base-50 p-6'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Restored App.tsx correctly');
