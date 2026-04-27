const fs = require('fs');

const appTsxPaths = 'src/App.tsx';
let content = fs.readFileSync(appTsxPaths, 'utf8');

function extractBlock(startToken, endToken) {
  const s = content.indexOf(startToken);
  if (s === -1) return null;
  const e = content.indexOf(endToken, s);
  if (e === -1) return null;
  return {
    start: s,
    end: e + endToken.length,
    text: content.substring(s, e + endToken.length)
  };
}

// 1. ActionMenu
const actionMenu = extractBlock('export function ActionMenu(', '  );\n}');
if (actionMenu) content = content.replace(actionMenu.text, '');

// 2. ConfirmModal
const confirmModal = extractBlock('export function ConfirmModal(', '  );\n}');
if (confirmModal) content = content.replace(confirmModal.text, '');

// 3. RankMovement
const rankMovement = extractBlock('function RankMovement(', '  }\n}');
if (rankMovement) content = content.replace(rankMovement.text, '');

// 4. StatCard
const statCard = extractBlock('function StatCard(', '  );\n}');
if (statCard) content = content.replace(statCard.text, '');

// LoginPage
const loginPage = extractBlock('function LoginPage(', '  );\n}');
if (loginPage) {
  fs.writeFileSync('src/components/pages/LoginPage.tsx',
    "import React, { useState } from 'react';\n" +
    "import { Settings, Loader2 } from 'lucide-react';\n" +
    "import { apiFetch, setLocalToken } from '../../lib/api';\n" +
    "import { ImageFallback } from '../ImageFallback';\n\n" +
    "export " + loginPage.text, 'utf8'
  );
  content = content.replace(loginPage.text, '');
}

// LeaderboardPage
const leaderboardPage = extractBlock('function LeaderboardPage(', '  );\n}');
if (leaderboardPage) {
  fs.writeFileSync('src/components/pages/LeaderboardPage.tsx',
    "import React, { useMemo, useState } from 'react';\n" +
    "import { motion, AnimatePresence } from 'motion/react';\n" +
    "import { Search, Trophy, Medal, Crown } from 'lucide-react';\n" +
    "import { trackEvent } from '../../lib/analytics';\n" +
    "import { ImageFallback, dicebearAvatar } from '../ImageFallback';\n" +
    "import { ActionMenu } from '../ui/ActionMenu';\n" +
    "import { ConfirmModal } from '../ui/ConfirmModal';\n" +
    "import { RankMovement } from '../ui/RankMovement';\n" +
    "import type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';\n\n" +
    "export " + leaderboardPage.text, 'utf8'
  );
  content = content.replace(leaderboardPage.text, '');
}

// StudentProfilePage
const studentProfilePage = extractBlock('function StudentProfilePage(', '  );\n}');
if (studentProfilePage) {
  fs.writeFileSync('src/components/pages/StudentProfilePage.tsx',
    "import React, { useState, useMemo } from 'react';\n" +
    "import { motion, AnimatePresence } from 'motion/react';\n" +
    "import { ArrowLeft, Target, Flame, Circle, CheckCircle2, ChevronDown } from 'lucide-react';\n" +
    "import { ImageFallback, dicebearAvatar } from '../ImageFallback';\n" +
    "import type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';\n\n" +
    "export " + studentProfilePage.text, 'utf8'
  );
  content = content.replace(studentProfilePage.text, '');
}

// Remove the INTERACTION_EVENTS block that is an artifact
content = content.replace(/\/\/ ==.*?INTERACTION_EVENTS.*?as const;/s, '');

// Clean up comments
content = content.replace(/\/\/ --- LOGIN PAGE ---\n/, '');
content = content.replace(/\/\/ --- LEADERBOARD PAGE ---\n/, '');
content = content.replace(/\/\/ --- STUDENT PROFILE PAGE ---\n/, '');
content = content.replace(/\/\/ --- ADMIN TABS \(API INTEGRATED\) ---\n\/\/ Tracks & Master Goals Unified Tab\n/, '');

// Add imports to App.tsx
const imports = [
  "import { ActionMenu } from './components/ui/ActionMenu';",
  "import { ConfirmModal } from './components/ui/ConfirmModal';",
  "import { RankMovement } from './components/ui/RankMovement';",
  "import { LoginPage } from './components/pages/LoginPage';",
  "import { LeaderboardPage } from './components/pages/LeaderboardPage';",
  "import { StudentProfilePage } from './components/pages/StudentProfilePage';"
].join('\\n');

content = imports + "\\n" + content;

fs.writeFileSync('src/App.tsx', content, 'utf8');

console.log('Phase 3 extraction complete!');
