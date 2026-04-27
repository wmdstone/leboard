const ts = require('typescript');
const fs = require('fs');

const fileContent = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', fileContent, ts.ScriptTarget.Latest, true);

let newContent = fileContent;
const replacements = [];
const uiComponents = ['ActionMenu', 'ConfirmModal', 'RankMovement', 'StatCard'];
const pageComponents = ['LoginPage', 'LeaderboardPage', 'StudentProfilePage'];

function visit(node) {
  if (ts.isFunctionDeclaration(node)) {
    const name = node.name?.text;
    if (name && (uiComponents.includes(name) || pageComponents.includes(name))) {
      const code = fileContent.substring(node.pos, node.end);
      replacements.push({ name, code, start: node.pos, end: node.end });
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

// Sort back to front so we don't invalidate indices
replacements.sort((a, b) => b.start - a.start);

fs.mkdirSync('src/components/pages', { recursive: true });
fs.mkdirSync('src/components/ui', { recursive: true });

for (const { name, code, start, end } of replacements) {
    let cleanCode = code.replace(/^\s+/, '').replace(/^export /, '');
    cleanCode = `export ${cleanCode}\n`;

    let importBlock = '';
    let targetFile = '';
    
    if (pageComponents.includes(name)) {
        targetFile = `src/components/pages/${name}.tsx`;
        if (name === 'LoginPage') {
            importBlock = "import React, { useState } from 'react';\nimport { Settings, Loader2 } from 'lucide-react';\nimport { apiFetch, setLocalToken } from '../../lib/api';\nimport { ImageFallback } from '../ImageFallback';\n\n";
        } else if (name === 'LeaderboardPage') {
            importBlock = "import React, { useMemo, useState } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';\nimport { Search, Trophy, Medal, Crown } from 'lucide-react';\nimport { trackEvent } from '../../lib/analytics';\nimport { ImageFallback, dicebearAvatar } from '../ImageFallback';\nimport { ActionMenu } from '../ui/ActionMenu';\nimport { ConfirmModal } from '../ui/ConfirmModal';\nimport { RankMovement } from '../ui/RankMovement';\nimport type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';\nimport { TIME_RANGE, TIME_RANGE_OPTIONS, type TimeRange } from '../../lib/timeRanges';\nimport { TimeRangeFilter, createDefaultTimeRangeValue, type TimeRangeValue } from '../TimeRangeFilter';\nimport { StudentSearchFilter, applyStudentSearchFilter, emptyStudentSearchFilter, type StudentSearchFilterValue } from '../StudentSearchFilter';\nimport { StudentSortDropdown, sortStudents, type SortKey } from '../StudentSortDropdown';\n\n";
        } else if (name === 'StudentProfilePage') {
            importBlock = "import React, { useState, useMemo } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';\nimport { ArrowLeft, Target, Flame, Circle, CheckCircle2, ChevronDown } from 'lucide-react';\nimport { ImageFallback, dicebearAvatar } from '../ImageFallback';\nimport type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';\nimport { ActionMenu } from '../ui/ActionMenu';\nimport { ConfirmModal } from '../ui/ConfirmModal';\n\n";
        }
    } else {
        targetFile = `src/components/ui/${name}.tsx`;
        if (name === 'ActionMenu') {
            importBlock = "import React, { useState, useRef, useEffect } from 'react';\nimport { MoreHorizontal, Edit, Trash2 } from 'lucide-react';\nimport { motion, AnimatePresence } from 'motion/react';\n\n";
        } else if (name === 'ConfirmModal') {
            importBlock = "import React from 'react';\n\n";
        } else if (name === 'RankMovement') {
            importBlock = "import React from 'react';\nimport { ArrowUp, ArrowDown } from 'lucide-react';\n\n";
        } else if (name === 'StatCard') {
            importBlock = "import React from 'react';\n\n";
        }
    }
    
    fs.writeFileSync(targetFile, importBlock + cleanCode, 'utf8');
    
    // Snip it out
    newContent = newContent.substring(0, start) + newContent.substring(end);
}

// Add imports
const importsToAdd = [
  "import { ActionMenu } from './components/ui/ActionMenu';",
  "import { ConfirmModal } from './components/ui/ConfirmModal';",
  "import { RankMovement } from './components/ui/RankMovement';",
  "import { StatCard } from './components/ui/StatCard';",
  "import { LoginPage } from './components/pages/LoginPage';",
  "import { LeaderboardPage } from './components/pages/LeaderboardPage';",
  "import { StudentProfilePage } from './components/pages/StudentProfilePage';"
].join('\n');

newContent = importsToAdd + '\n' + newContent;

fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log('Extraction completed successfully using TS compiler API.');
