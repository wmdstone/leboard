const fs = require('fs');

function replaceFileContents(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content, 'utf8');
}

replaceFileContents('src/components/admin/AdminGoalsTab.tsx', [
    [/import \{ ActionMenu \} from "\.\.\/\.\.\/App";/g, 'import { ActionMenu } from "../ui/ActionMenu";'],
    [/import \{ ConfirmModal \} from "\.\.\/\.\.\/App";/g, 'import { ConfirmModal } from "../ui/ConfirmModal";']
]);

replaceFileContents('src/components/admin/AdminStudentsTab.tsx', [
    [/import \{ ActionMenu \} from "\.\.\/\.\.\/App";/g, 'import { ActionMenu } from "../ui/ActionMenu";'],
    [/import \{ ConfirmModal \} from "\.\.\/\.\.\/App";/g, 'import { ConfirmModal } from "../ui/ConfirmModal";']
]);

let leaderboardContent = fs.readFileSync('src/components/pages/LeaderboardPage.tsx', 'utf8');
leaderboardContent = leaderboardContent.replace(
  "import { Search, Trophy, Medal, Crown } from 'lucide-react';",
  "import { Search, Trophy, Medal, Crown, Flame, Loader2 } from 'lucide-react';\nimport { StudentSearchAdvanced } from '../StudentSearchAdvanced';"
);
fs.writeFileSync('src/components/pages/LeaderboardPage.tsx', leaderboardContent, 'utf8');

let profileContent = fs.readFileSync('src/components/pages/StudentProfilePage.tsx', 'utf8');
profileContent = profileContent.replace(
  "import { ArrowLeft, Target, Flame, Circle, CheckCircle2, ChevronDown } from 'lucide-react';",
  "import { ArrowLeft, Target, Flame, Circle, CheckCircle2, ChevronDown, CheckSquare, FolderTree, ChevronUp } from 'lucide-react';\nimport { TimeRangeValue, createDefaultTimeRangeValue, TimeRangeFilter } from '../TimeRangeFilter';\nimport { DateRange, isWithinRange, POINTS_CAPTION } from '../../lib/timeRanges';\nimport { RankMovement } from '../ui/RankMovement';\nimport { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, Line, BarChart, Bar } from 'recharts';"
);
profileContent = profileContent.replace("tickFormatter={(value) => value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}", "tickFormatter={(value: any) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}");
fs.writeFileSync('src/components/pages/StudentProfilePage.tsx', profileContent, 'utf8');

console.log('Fixed imports in components');
