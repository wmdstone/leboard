const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "export function ActionMenu({ onEdit, onDelete, placement = 'bottom-end' }export function ActionMenu({ onEdit, onDelete, placement = 'bottom-end' }: { onEdit: () => void, onDelete: () => void, placement?: 'bottom-end' | 'top-center' }) {",
  "export function ActionMenu({ onEdit, onDelete, placement = 'bottom-end' }: { onEdit: () => void, onDelete: () => void, placement?: 'bottom-end' | 'top-center' }) {"
);

// Leaderboard:
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === ': { ' && lines[i+1] && lines[i+1].includes('students: Student[];')) {
    lines[i] = 'function LeaderboardPage({ students, masterGoals, calculateTotalPoints, navigateTo, isLoading, appSettings }: {';
    break;
  }
}
content = lines.join('\n');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Final fixes');
