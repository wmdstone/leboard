const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The pieces look like:
content = content.replace(
  /\n: \{ onEdit: \(\) => void, onDelete: \(\) => void, placement\?: 'bottom-end' \| 'top-center' \}\) \{/g,
  "\nexport function ActionMenu({ onEdit, onDelete, placement = 'bottom-end' }: { onEdit: () => void, onDelete: () => void, placement?: 'bottom-end' | 'top-center' }) {"
);

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

// We need to remove the imports we added to App.tsx
const imports = [
  "import { ActionMenu } from './components/ui/ActionMenu';\n",
  "import { ConfirmModal } from './components/ui/ConfirmModal';\n",
  "import { RankMovement } from './components/ui/RankMovement';\n",
  "import { LoginPage } from './components/pages/LoginPage';\n",
  "import { LeaderboardPage } from './components/pages/LeaderboardPage';\n",
  "import { StudentProfilePage } from './components/pages/StudentProfilePage';\n"
];
for (const imp of imports) {
  content = content.replace(imp, '');
}

fs.writeFileSync('src/App.tsx', content, 'utf8');

fs.rmSync('src/components/pages', { recursive: true, force: true });
console.log('Restored App.tsx correctly');
