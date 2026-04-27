const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /: any\) \{\r?\n\s*if \(\!isOpen\) return null;/g,
  'export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: any) {\n  if (!isOpen) return null;'
);

content = content.replace(
  /: \{ currentRank: number, previousRank\?: number \}\) \{\r?\n\s*if \(previousRank \=\=\= undefined/g,
  'function RankMovement({ currentRank, previousRank }: { currentRank: number, previousRank?: number }) {\n  if (previousRank === undefined'
);

content = content.replace(
  /: \{ onLogin: \(\) => void, appSettings\?: any \}\) \{\r?\n\s*const \[password/g,
  'function LoginPage({ onLogin, appSettings }: { onLogin: () => void, appSettings?: any }) {\n  const [password'
);

content = content.replace(
  /: \{\r?\n\s*students: Student\[\];/g,
  'function LeaderboardPage({ students, masterGoals, calculateTotalPoints, navigateTo, isLoading, appSettings }: {\n  students: Student[];'
);

content = content.replace(
  /: \{\r?\n\s*studentId: string;/g,
  'function StudentProfilePage({ studentId, students, masterGoals, categories, calculateTotalPoints, navigateTo }: {\n  studentId: string;'
);

content = content.replace(
  /: any\) \{\r?\n\s*return \(\r?\n\s*<div className="bg-base-50 p-6/g,
  'function StatCard({ title, value, icon: Icon, color }: any) {\n  return (\n    <div className="bg-base-50 p-6'
);

// We need to also fix ActionMenu which failed on line 50!
// 50: : { onEdit: () => void, onDelete: () => void, placement?: 'bottom-end' | 'top-center' }) {
// 51:   const [isOpen, setIsOpen] = useState(false);
content = content.replace(
  /: \{ onEdit: \(\) => void, onDelete: \(\) => void, placement\?: 'bottom-end' \| 'top-center' \}\) \{\r?\n\s*const \[isOpen/g,
  "export function ActionMenu({ onEdit, onDelete, placement = 'bottom-end' }: { onEdit: () => void, onDelete: () => void, placement?: 'bottom-end' | 'top-center' }) {\n  const [isOpen"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Restored App.tsx with CRLF logic');
