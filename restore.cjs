const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
    /\/\/ --- ADMIN DASHBOARD ---\n: \{/g,
    '// --- ADMIN DASHBOARD ---\nfunction AdminDashboard({ students, refreshData, masterGoals, categories, calculateTotalPoints, appSettings, setAppSettings, navigateTo }: {'
);

content = content.replace(
    /export default function App\(\) {\n  const queryClient = useQueryClient\(\);\n  \n  const \{ data: authData, isLoading: isAuthLoading \} = useAuthQuery\(\);\n\n  const \{ data: appData, isLoading: isAppDataLoading \} = useAppDataQuery\(\);\n\n  const categories = appData\?.categories \|\| \[\];\n  const masterGoals = appData\?.masterGoals \|\| \[\];\n  const students = appData\?.students \|\| \[\];\n  const appSettings = appData\?.appSettings \|\| \{\};\n  const isAdmin = !!authData\?.authenticated;\n  const isLoading = isAppDataLoading && !appData;/g,
    \`export default function App() {
  const queryClient = useQueryClient();
  
  const { data: authData, isLoading: isAuthLoading } = useAuthQuery();

  const { data: appData, isLoading: isAppDataLoading } = useAppDataQuery();

  const categories = appData?.categories || [];
  const masterGoals = appData?.masterGoals || [];
  const students = appData?.students || [];
  const appSettings = appData?.appSettings || {};
  const isAdmin = !!authData?.authenticated;
  const isLoading = isAppDataLoading && !appData;\`
); // this didn't change anything, wait. Let's just fix the functions.

content = content.replace(
    /\/\/ --- ADMIN TABS \(API INTEGRATED\) ---\n\n: any\) {/g,
    '// --- ADMIN TABS (API INTEGRATED) ---\n\nfunction AdminStudentsTab({ students, refreshData, masterGoals, categories, calculateTotalPoints }: any) {'
);

content = content.replace(
    /\/\/ Tracks & Master Goals Unified Tab\n: any\) {/g,
    '// Tracks & Master Goals Unified Tab\nfunction AdminGoalsTab({ masterGoals, refreshData, categories }: any) {'
);

content = content.replace(
    /function HSLPicker\(\{ label, value, onChange \}: any\) {\n  if \(\!value \|\| typeof value \!\=\= 'object' \|\| value\.h \=\=\= undefined\) return null;\n  return \(\n    <div className="space-y-2 mb-4 p-4 bg-base-100\/50 rounded-xl border border-base-200">\n      <div className="flex justify-between items-center mb-4">\n        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">\{label\}<\/label>\n        <div className="flex gap-2 items-center">\n           <div className="w-6 h-6 rounded-md shadow-inner border border-base-200" style=\{\{ backgroundColor: \`hsl\(\{value.h\}, \{value.s\}%, \{value.l\}%\)\` \}\} \/>\n           <span className="text-\[10px\] font-mono bg-base-200\/50 px-2 py-1 rounded text-text-muted">hsl(\{value.h\}, \{value.s\}%, \{value.l\}%)<\/span>\n        <\/div>\n      <\/div>\n      \n      <div className="space-y-4">\n        <div className="flex items-center gap-3">\n          <span className="text-xs font-bold text-text-light w-4">H<\/span>\n          <input type="range" min="0" max="360" value=\{value.h\} onChange=\{e => onChange\(\{...value, h: parseInt\(e.target.value\)\}\)\} className="flex-1 h-2 rounded-lg appearance-none bg-gradient-to-r from-red-500 via-green-500 to-blue-500 cursor-pointer" \/>\n        <\/div>\n        <div className="flex items-center gap-3">\n          <span className="text-xs font-bold text-text-light w-4">S<\/span>\n          <input type="range" min="0" max="100" value=\{value.s\} onChange=\{e => onChange\(\{...value, s: parseInt\(e.target.value\)\}\)\} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style=\{\{ background: \`linear-gradient\(to right, hsl\(\{value.h\}, 0%, \{value.l\}%\), hsl\(\{value.h\}, 100%, \{value.l\}%\)\)\` \}\} \/>\n        <\/div>\n        <div className="flex items-center gap-3">\n          <span className="text-xs font-bold text-text-light w-4">L<\/span>\n          <input type="range" min="0" max="100" value=\{value.l\} onChange=\{e => onChange\(\{...value, l: parseInt\(e.target.value\)\}\)\} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style=\{\{ background: \`linear-gradient\(to right, hsl\(\{value.h\}, \{value.s\}%, 0%\), hsl\(\{value.h\}, \{value.s\}%, 100%\)\)\` \}\} \/>\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}\n\n: any\) {/g,
    `function HSLPicker({ label, value, onChange }: any) {
  if (!value || typeof value !== 'object' || value.h === undefined) return null;
  return (
    <div className="space-y-2 mb-4 p-4 bg-base-100/50 rounded-xl border border-base-200">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
        <div className="flex gap-2 items-center">
           <div className="w-6 h-6 rounded-md shadow-inner border border-base-200" style={{ backgroundColor: \`hsl(\${value.h}, \${value.s}%, \${value.l}%)\` }} />
           <span className="text-[10px] font-mono bg-base-200/50 px-2 py-1 rounded text-text-muted">hsl({value.h}, {value.s}%, {value.l}%)</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-light w-4">H</span>
          <input type="range" min="0" max="360" value={value.h} onChange={e => onChange({...value, h: parseInt(e.target.value)})} className="flex-1 h-2 rounded-lg appearance-none bg-gradient-to-r from-red-500 via-green-500 to-blue-500 cursor-pointer" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-light w-4">S</span>
          <input type="range" min="0" max="100" value={value.s} onChange={e => onChange({...value, s: parseInt(e.target.value)})} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style={{ background: \`linear-gradient(to right, hsl(\${value.h}, 0%, \${value.l}%), hsl(\${value.h}, 100%, \${value.l}%))\` }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-light w-4">L</span>
          <input type="range" min="0" max="100" value={value.l} onChange={e => onChange({...value, l: parseInt(e.target.value)})} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style={{ background: \`linear-gradient(to right, hsl(\${value.h}, \${value.s}%, 0%), hsl(\${value.h}, \${value.s}%, 100%))\` }} />
        </div>
      </div>
    </div>
  );
}

function AdminAppearanceTab({ refreshData, appSettings, setAppSettings }: any) {`
);

content = content.replace(
    /\n: \{\n\s*students/g,
    '\nfunction AdminDashboard({ students'
);
content = content.replace(
    /\n: any\) \{\n\s*const \[searchFilter/g,
    '\nfunction AdminStudentsTab({ students, refreshData, masterGoals, categories, calculateTotalPoints }: any) {\n  const [searchFilter'
);
content = content.replace(
    /\n: any\) \{\n\s*\/\/ Goal Modal States/g,
    '\nfunction AdminGoalsTab({ masterGoals, refreshData, categories }: any) {\n  // Goal Modal States'
);
content = content.replace(
    /\n: any\) \{\n\s*\/\/ Alias for compatibility/g,
    '\nfunction AdminAppearanceTab({ refreshData, appSettings, setAppSettings }: any) {\n  // Alias for compatibility'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');

// I also need to remove 'import { AdminDashboard } from './components/admin/AdminDashboard';' since it is restored.
let finalContent = fs.readFileSync('src/App.tsx', 'utf8');
finalContent = finalContent.replace("import { AdminDashboard } from './components/admin/AdminDashboard';\n", "");
fs.writeFileSync('src/App.tsx', finalContent, 'utf8');

// Also delete the extracted files that failed.
fs.rmSync('src/components/admin', { recursive: true, force: true });
console.log('Restored App.tsx correctly');
