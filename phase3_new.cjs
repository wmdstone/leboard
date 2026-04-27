const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

function extractFunc(funcName) {
  const isExport = content.includes(`export function ${funcName}(`);
  const prefix = isExport ? `export function ${funcName}(` : `function ${funcName}(`;
  let startIdx = content.indexOf(prefix);
  if (startIdx === -1) return null;
  
  let braceCount = 0;
  let inFunc = false;
  let endIdx = -1;
  let startedBrace = false;

  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      startedBrace = true;
    }
    if (content[i] === '}') {
      braceCount--;
    }
    if (startedBrace && braceCount === 0) {
      endIdx = i + 1;
      break;
    }
  }

  if (endIdx !== -1) {
    const text = content.substring(startIdx, endIdx);
    content = content.substring(0, startIdx) + content.substring(endIdx);
    return text;
  }
  return null;
}

// Extract UI components
const actionMenu = extractFunc('ActionMenu');
const confirmModal = extractFunc('ConfirmModal');
const rankMovement = extractFunc('RankMovement');
const statCard = extractFunc('StatCard');

// Extract Pages
const loginPage = extractFunc('LoginPage');
if (loginPage) {
  fs.mkdirSync('src/components/pages', { recursive: true });
  fs.writeFileSync('src/components/pages/LoginPage.tsx',
    "import React, { useState } from 'react';\n" +
    "import { Settings, Loader2 } from 'lucide-react';\n" +
    "import { apiFetch, setLocalToken } from '../../lib/api';\n" +
    "import { ImageFallback } from '../ImageFallback';\n\n" +
    loginPage.replace(/^function/, 'export function'), 'utf8'
  );
}

const leaderboardPage = extractFunc('LeaderboardPage');
if (leaderboardPage) {
  fs.mkdirSync('src/components/pages', { recursive: true });
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
    leaderboardPage.replace(/^function/, 'export function'), 'utf8'
  );
}

const studentProfilePage = extractFunc('StudentProfilePage');
if (studentProfilePage) {
  fs.mkdirSync('src/components/pages', { recursive: true });
  fs.writeFileSync('src/components/pages/StudentProfilePage.tsx',
    "import React, { useState, useMemo } from 'react';\n" +
    "import { motion, AnimatePresence } from 'motion/react';\n" +
    "import { ArrowLeft, Target, Flame, Circle, CheckCircle2, ChevronDown } from 'lucide-react';\n" +
    "import { ImageFallback, dicebearAvatar } from '../ImageFallback';\n" +
    "import type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';\n" +
    "import { ActionMenu } from '../ui/ActionMenu';\n" +
    "import { ConfirmModal } from '../ui/ConfirmModal';\n\n" +
    studentProfilePage.replace(/^function/, 'export function'), 'utf8'
  );
}

// Clean up comments and unused events array from bottom
content = content.replace(/\/\/ ==.*?INTERACTION_EVENTS.*?as const;/s, '');
content = content.replace(/\/\/ --- LOGIN PAGE ---\n/, '');
content = content.replace(/\/\/ --- LEADERBOARD PAGE ---\n/, '');
content = content.replace(/\/\/ --- STUDENT PROFILE PAGE ---\n/, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Extraction phase 3 complete.');
