const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

function extractString(source, tokenStart, tokenEnd) {
    const s = source.indexOf(tokenStart);
    if (s === -1) return null;
    const e = source.indexOf(tokenEnd, s);
    if (e === -1) return null;
    return {
        text: source.substring(s, e),
        start: s,
        end: e
    };
}

fs.mkdirSync('src/components/admin', { recursive: true });

// 1. AdminDashboard
const dDashboard = extractString(content, 
    "// --- ADMIN DASHBOARD ---\nexport function AdminDashboard", 
    "// --- ADMIN TABS (API INTEGRATED) ---"
);
if (dDashboard) {
    fs.writeFileSync('src/components/admin/AdminDashboard.tsx',
        "import React, { useState } from 'react';\n" +
        "import { Tooltip as ReactTooltip } from 'react-tooltip';\n" +
        "import { LogOut, CheckSquare, Target, FolderTree, Palette, Settings, Database, Server, Info, LayoutDashboard, Loader2, MoreHorizontal, ShieldCheck, Search, Users } from 'lucide-react';\n" +
        "import { useQueryClient } from '@tanstack/react-query';\n" +
        "import { apiFetch, removeLocalToken } from '../../lib/api';\n" +
        "import { trackEvent } from '../../lib/analytics';\n" +
        "import { AdminStudentsTab } from './AdminStudentsTab';\n" +
        "import { AdminGoalsTab } from './AdminGoalsTab';\n" +
        "import { AdminAppearanceTab } from './AdminAppearanceTab';\n" +
        "import { AdminStatisticsTab } from './AdminStatisticsTab';\n" +
        "import AdminImportExportTab from '../AdminImportExportTab';\n" +
        "import AdminBackendTab from '../AdminBackendTab';\n" +
        "import CacheHealthTab from '../CacheHealthTab';\n" +
        "import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';\n\n" +
        dDashboard.text, 'utf8'
    );
    content = content.replace(dDashboard.text, "");
}

// 2. AdminStudentsTab
const dStudents = extractString(content,
    "export function AdminStudentsTab",
    "// Tracks & Master Goals Unified Tab"
);
if (dStudents) {
    fs.writeFileSync('src/components/admin/AdminStudentsTab.tsx',
        "import React, { useState, useRef, useMemo, useCallback } from 'react';\n" +
        "import { Camera, Image as ImageIcon, Save, Trash2, Edit2, Info, Loader2, Link as LinkIcon, Download, X, Search, Filter, ArrowUpAZ, ArrowDownAZ, TrendingUp, Plus, CheckSquare, Square, CheckCircle2, ArrowLeft, ZoomOut, ZoomIn } from 'lucide-react';\n" +
        "import Cropper from 'react-easy-crop';\n" +
        "import { motion, AnimatePresence } from 'framer-motion';\n" +
        "import { apiFetch } from '../../lib/api';\n" +
        "import ImageFallback from '../ImageFallback';\n" +
        "import StudentSearchFilter from '../StudentSearchFilter';\n" +
        "import { applyStudentSearchFilter, emptyStudentSearchFilter } from '../StudentSearchFilter';\n" +
        "import StudentSearchAdvanced from '../StudentSearchAdvanced';\n" +
        "import StudentSortDropdown, { sortStudents, SortKey } from '../StudentSortDropdown';\n" +
        "import { dicebearAvatar } from '../../lib/utils';\n" +
        "import ActionMenu from '../ActionMenu';\n" +
        "import ConfirmModal from '../ConfirmModal';\n" +
        "import type { Category, MasterGoal, AssignedGoal, Student, TimeRangeValue, StudentSearchFilterValue } from '../../lib/types';\n\n" +
        dStudents.text, 'utf8'
    );
    content = content.replace(dStudents.text, "");
}

// 3. AdminGoalsTab
const dGoals = extractString(content,
    "export function AdminGoalsTab",
    "// Goal Admin Modal (Internal usage)"
);
const dGoalModal = extractString(content,
    "// Goal Admin Modal (Internal usage)",
    "const PRESETS ="
);
if (dGoals && dGoalModal) {
    fs.writeFileSync('src/components/admin/AdminGoalsTab.tsx',
        "import React, { useState, useMemo } from 'react';\n" +
        "import { Target, FolderTree, Info, Save, Trash2, Edit2, X, Plus, ChevronDown, ChevronRight, Tags } from 'lucide-react';\n" +
        "import { apiFetch } from '../../lib/api';\n" +
        "import { motion, AnimatePresence } from 'framer-motion';\n" +
        "import ActionMenu from '../ActionMenu';\n" +
        "import ConfirmModal from '../ConfirmModal';\n" +
        "import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';\n\n" +
        dGoals.text + "\n" + dGoalModal.text, 'utf8'
    );
    content = content.replace(dGoals.text, "").replace(dGoalModal.text, "");
}

// 4. AdminAppearanceTab
const dAppearance = extractString(content,
    "const PRESETS =",
    "function StatCard"
);
if (dAppearance) {
    fs.writeFileSync('src/components/admin/AdminAppearanceTab.tsx',
        "import React, { useState, useRef, useCallback, useEffect } from 'react';\n" +
        "import { Image as ImageIcon, Save, Upload, Info, Hexagon, CheckCircle2, Palette, Trophy, Flame, UserIcon, ZoomOut, ZoomIn, Loader2 } from 'lucide-react';\n" +
        "import Cropper from 'react-easy-crop';\n" +
        "import { apiFetch } from '../../lib/api';\n" +
        "import ImageFallback from '../ImageFallback';\n\n" +
        dAppearance.text, 'utf8'
    );
    content = content.replace(dAppearance.text, "");
}

// Rewrite AdminStatisticsTab
fs.writeFileSync('src/components/admin/AdminStatisticsTab.tsx',
    "import React, { useState, useMemo } from 'react';\n" +
    "import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';\n" +
    "import { Users, Target, Activity, Zap, CheckSquare, Settings } from 'lucide-react';\n" +
    "import { useAdminStatsQuery, useAppEventsQuery } from '../../hooks/useAppQueries';\n" +
    "import TimeRangeFilter from '../TimeRangeFilter';\n" +
    "import { createDefaultTimeRangeValue, TimeRangeValue } from '../../lib/timeRanges';\n" +
    "\n" +
    "export function StatCard({ title, value, icon: Icon, color }: any) {\n" +
    "  return (\n" +
    "    <div className='bg-base-50 p-6 rounded-2xl border border-base-200 shadow-sm flex items-center gap-4'>\n" +
    "      <div className={'p-4 rounded-xl bg-base-100 ' + color + ' shadow-sm border border-base-200'}>\n" +
    "        <Icon className='w-6 h-6' />\n" +
    "      </div>\n" +
    "      <div>\n" +
    "        <p className='text-xs font-bold uppercase tracking-widest text-text-muted mb-1'>{title}</p>\n" +
    "        <p className='text-2xl font-black text-text-main'>{value || 0}</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  );\n" +
    "}\n\n" +
    "export function AdminStatisticsTab() {\n" +
    "  const [filter, setFilter] = useState<TimeRangeValue>(() => createDefaultTimeRangeValue('last-week'));\n" +
    "  const { data, isLoading } = useAdminStatsQuery(filter);\n" +
    "  const { data: events } = useAppEventsQuery(filter);\n" +
    "  return (\n" +
    "    <div className='p-8'>\n" +
    "      <div className='flex justify-between items-center mb-8'>\n" +
    "        <h3 className='text-2xl font-black text-text-main py-2'>Analytics & Usage</h3>\n" +
    "        <TimeRangeFilter value={filter} onChange={setFilter} />\n" +
    "      </div>\n" +
    "      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>\n" +
    "        <StatCard title='Users' value={data?.stats?.totalUsers || 0} icon={Users} color='text-blue-500' />\n" +
    "        <StatCard title='Goals' value={data?.stats?.totalGoals || events?.length || 0} icon={Target} color='text-emerald-500' />\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  );\n" +
    "}\n", 'utf8'
);

content = content.replace(
    /function StatCard\(.*?return \(\n.*?<\/div>\n  \);\n}\n/s, ''
);
content = content.replace("// --- ADMIN TABS (API INTEGRATED) ---\n\n", "");

// Inject AdminDashboard import into App.tsx
content = "import { AdminDashboard } from './components/admin/AdminDashboard';\n" + content;

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Final extraction done');
