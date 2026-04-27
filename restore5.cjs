const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /: any\) \{\n  if \(\!isOpen\) return null;/g,
  'export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: any) {\n  if (!isOpen) return null;'
);

content = content.replace(
  /: \{ currentRank: number, previousRank\?: number \}\) \{\n  if \(previousRank \=\=\= undefined/g,
  'function RankMovement({ currentRank, previousRank }: { currentRank: number, previousRank?: number }) {\n  if (previousRank === undefined'
);

content = content.replace(
  /: \{ onLogin: \(\) => void, appSettings\?: any \}\) \{\n  const \[password/g,
  'function LoginPage({ onLogin, appSettings }: { onLogin: () => void, appSettings?: any }) {\n  const [password'
);

content = content.replace(
  /: \{\n\s*students: Student\[\];/g,
  'function LeaderboardPage({ students, masterGoals, calculateTotalPoints, navigateTo, isLoading, appSettings }: {\n  students: Student[];'
);

content = content.replace(
  /: \{\n\s*studentId: string;/g,
  'function StudentProfilePage({ studentId, students, masterGoals, categories, calculateTotalPoints, navigateTo }: {\n  studentId: string;'
);

content = content.replace(
  /: any\) \{\n\s*return \(\n\s*<div className="bg-base-50 p-6/g,
  'function StatCard({ title, value, icon: Icon, color }: any) {\n  return (\n    <div className="bg-base-50 p-6'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Restored App.tsx cleanly');
