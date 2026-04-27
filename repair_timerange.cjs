const fs = require('fs');

function repl(file, search, rep) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, rep);
  fs.writeFileSync(file, content, 'utf8');
}

// AdminStatisticsTab
repl('src/components/admin/AdminStatisticsTab.tsx',
"import { createDefaultTimeRangeValue, TimeRangeValue } from '../../lib/timeRanges';",
"import { createDefaultTimeRangeValue, TimeRangeValue } from '../TimeRangeFilter';");

// AdminStudentsTab
repl('src/components/admin/AdminStudentsTab.tsx',
"import type { Category, MasterGoal, AssignedGoal, Student, TimeRangeValue, StudentSearchFilterValue } from '../../lib/types';",
"import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';\nimport { TimeRangeValue } from '../TimeRangeFilter';\nimport { StudentSearchFilterValue } from '../StudentSearchFilter';");

console.log('Fixed time range types.');
