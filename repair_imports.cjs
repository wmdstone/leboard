const fs = require('fs');

function repl(file, search, rep) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, rep);
  fs.writeFileSync(file, content, 'utf8');
}

// AdminDashboard.tsx
repl('src/components/admin/AdminDashboard.tsx',
"import { Tooltip as ReactTooltip } from 'react-tooltip';",
"// Tooltip extracted locally? Or just removed because we didn't add the lib");
repl('src/components/admin/AdminDashboard.tsx',
"import AdminImportExportTab from '../AdminImportExportTab';",
"import { AdminImportExportTab } from '../AdminImportExportTab';");
repl('src/components/admin/AdminDashboard.tsx',
"import AdminBackendTab from '../AdminBackendTab';",
"import { AdminBackendTab } from '../AdminBackendTab';");

// AdminGoalsTab.tsx
repl('src/components/admin/AdminGoalsTab.tsx',
"import ActionMenu from '../ActionMenu';",
"import { ActionMenu } from '../../App';");
repl('src/components/admin/AdminGoalsTab.tsx',
"import ConfirmModal from '../ConfirmModal';",
"import { ConfirmModal } from '../../App';");
// ChevronUp missing
repl('src/components/admin/AdminGoalsTab.tsx',
"import { Target",
"import { Target, ChevronUp");

// AdminStudentsTab.tsx
repl('src/components/admin/AdminStudentsTab.tsx',
"import StudentSearchFilter from '../StudentSearchFilter';",
"import { StudentSearchFilter } from '../StudentSearchFilter';");
repl('src/components/admin/AdminStudentsTab.tsx',
"import StudentSearchAdvanced from '../StudentSearchAdvanced';",
"import { StudentSearchAdvanced } from '../StudentSearchAdvanced';");
repl('src/components/admin/AdminStudentsTab.tsx',
"import StudentSortDropdown, { sortStudents, SortKey } from '../StudentSortDropdown';",
"import { StudentSortDropdown, sortStudents, SortKey } from '../StudentSortDropdown';");
repl('src/components/admin/AdminStudentsTab.tsx',
"import { dicebearAvatar } from '../../lib/utils';",
"import { dicebearAvatar } from '../ImageFallback';");
repl('src/components/admin/AdminStudentsTab.tsx',
"import ActionMenu from '../ActionMenu';",
"import { ActionMenu } from '../../App';");
repl('src/components/admin/AdminStudentsTab.tsx',
"import ConfirmModal from '../ConfirmModal';",
"import { ConfirmModal } from '../../App';");

// AdminStatisticsTab.tsx
repl('src/components/admin/AdminStatisticsTab.tsx',
"import TimeRangeFilter from '../TimeRangeFilter';",
"import { TimeRangeFilter } from '../TimeRangeFilter';");

// App.tsx
// Add export to ActionMenu and ConfirmModal
repl('src/App.tsx', 
"function ActionMenu", 
"export function ActionMenu");
repl('src/App.tsx', 
"function ConfirmModal", 
"export function ConfirmModal");
repl('src/App.tsx',
"import { AdminDashboard } from './components/admin/AdminDashboard';\nimport { AdminDashboard } from './components/admin/AdminDashboard';",
"import { applyThemeColors } from './components/admin/AdminAppearanceTab';\nimport { AdminDashboard } from './components/admin/AdminDashboard';");

console.log('Fixed imports programmatically.');
