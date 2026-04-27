const fs = require('fs');
const path = require('path');

// read App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

function extractComponent(fileContent, componentName) {
    const startStr = 'function ' + componentName + '(';
    let startIdx = fileContent.indexOf(startStr);
    
    // what if there are no parameters and it uses trailing spaces? e.g. function AdminStatisticsTab() {
    if (startIdx === -1) {
        startIdx = fileContent.indexOf('function ' + componentName + '() {');
    }
    
    if (startIdx === -1) return null;
    
    // find end of component: we can search for the next `function ` or end of file,
    // but better to count bracket depth
    let depth = 0;
    let inComponent = false;
    let endIdx = -1;
    
    for (let i = startIdx; i < fileContent.length; i++) {
        if (fileContent[i] === '{') {
            depth++;
            inComponent = true;
        } else if (fileContent[i] === '}') {
            depth--;
        }
        
        if (inComponent && depth === 0) {
            endIdx = i + 1; // including the \`}\`
            break;
        }
    }
    
    if (endIdx !== -1) {
        return {
            content: fileContent.substring(startIdx, endIdx),
            start: startIdx,
            end: endIdx
        };
    }
    return null;
}

const componentsToExtract = [
    'AdminStudentsTab',
    'AdminGoalsTab',
    'AdminAppearanceTab',
    'AdminStatisticsTab',
    'AppAnalyticsPanel' // AppAnalyticsPanel is called from AdminStatisticsTab
];

const extracted = {};

componentsToExtract.forEach(comp => {
    const data = extractComponent(appContent, comp);
    if (data) {
        extracted[comp] = data.content;
        appContent = appContent.substring(0, data.start) + appContent.substring(data.end);
    }
});

// also extract AdminDashboard
const dataAdmin = extractComponent(appContent, 'AdminDashboard');
if (dataAdmin) {
    extracted['AdminDashboard'] = dataAdmin.content;
    appContent = appContent.substring(0, dataAdmin.start) + appContent.substring(dataAdmin.end);
}

fs.mkdirSync('src/components/admin', { recursive: true });

fs.writeFileSync('src/components/admin/AdminStudentsTab.tsx', 
"import React, { useState, useRef, useMemo } from 'react';\\n" +
"import { Camera, Image as ImageIcon, Save, Trash2, Edit2, Info, Loader2, Link as LinkIcon, Download, X, Search, Filter, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';\\n" +
"import { apiFetch } from '../../lib/api';\\n" +
"import ErrorBoundary from '../ErrorBoundary';\\n" +
"import ImageFallback from '../ImageFallback';\\n" +
"import StudentSearchFilter from '../StudentSearchFilter';\\n" +
"import StudentSortDropdown from '../StudentSortDropdown';\\n" +
"\\nexport " + extracted['AdminStudentsTab']);

fs.writeFileSync('src/components/admin/AdminGoalsTab.tsx', 
"import React, { useState } from 'react';\\n" +
"import { Target, FolderTree, Info, Save, Trash2, Edit2, X, Plus } from 'lucide-react';\\n" +
"import { apiFetch } from '../../lib/api';\\n" +
"\\nexport " + extracted['AdminGoalsTab']);

fs.writeFileSync('src/components/admin/AdminAppearanceTab.tsx', 
"import React, { useState, useRef } from 'react';\\n" +
"import { Image as ImageIcon, Save, Upload, Info, Hexagon } from 'lucide-react';\\n" +
"import { apiFetch } from '../../lib/api';\\n" +
"\\nexport " + extracted['AdminAppearanceTab']);

fs.writeFileSync('src/components/admin/AdminStatisticsTab.tsx', 
"import React, { useState, useMemo } from 'react';\\n" +
"import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';\\n" +
"import { Users, Target, Activity, Zap, CheckSquare, Settings } from 'lucide-react';\\n" +
"import { useAdminStatsQuery, useAppEventsQuery } from '../../hooks/useAppQueries';\\n" +
"import TimeRangeFilter from '../TimeRangeFilter';\\n" +
"import { createDefaultTimeRangeValue, TimeRangeValue } from '../../lib/timeRanges';\\n" +
"\\n" + (extracted['AppAnalyticsPanel'] || '') + "\\n\\nexport " + extracted['AdminStatisticsTab']);


fs.writeFileSync('src/components/admin/AdminDashboard.tsx', 
"import React, { useState } from 'react';\\n" +
"import { Tooltip as ReactTooltip } from 'react-tooltip';\\n" +
"import { LogOut, CheckSquare, Target, FolderTree, Settings, Database, Server, Info, LayoutDashboard, Loader2, MoreHorizontal } from 'lucide-react';\\n" +
"import { useQueryClient } from '@tanstack/react-query';\\n" +
"import { apiFetch, removeLocalToken } from '../../lib/api';\\n" +
"import { trackEvent } from '../../lib/analytics';\\n" +
"import { AdminStudentsTab } from './AdminStudentsTab';\\n" +
"import { AdminGoalsTab } from './AdminGoalsTab';\\n" +
"import { AdminAppearanceTab } from './AdminAppearanceTab';\\n" +
"import { AdminStatisticsTab } from './AdminStatisticsTab';\\n" +
"import AdminImportExportTab from '../AdminImportExportTab';\\n" +
"import AdminBackendTab from '../AdminBackendTab';\\n" +
"import CacheHealthTab from '../CacheHealthTab';\\n" +
"import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';\\n" +
"\\nexport " + extracted['AdminDashboard']);


// Add imports to App.tsx
appContent = "import { AdminDashboard } from './components/admin/AdminDashboard';\\n" + appContent;

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log('Extraction complete');
