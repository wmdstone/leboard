const fs = require('fs');

function repl(file, search, rep) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, rep);
  fs.writeFileSync(file, content, 'utf8');
}

// src/components/AdminBackendTab.tsx
repl('src/components/AdminBackendTab.tsx', /from '@\/lib/g, "from '../lib");
// src/components/AdminImportExportTab.tsx
repl('src/components/AdminImportExportTab.tsx', /from '@\/lib/g, "from '../lib");
repl('src/components/AdminImportExportTab.tsx', /from '@\/integrations/g, "from '../integrations");
// src/components/TimeRangeFilter.tsx
repl('src/components/TimeRangeFilter.tsx', /from '@\/lib/g, "from '../lib");

// src/lib/analytics.ts
repl('src/lib/analytics.ts', /from '@\/integrations/g, "from '../integrations");
// src/lib/dbConnections.ts
repl('src/lib/dbConnections.ts', /from '@\/integrations/g, "from '../integrations");
repl('src/lib/dbConnections.ts', /from '@\/lib\/firestoreDriver'/g, "from './firestoreDriver'");

// src/lib/firebaseApi.ts
repl('src/lib/firebaseApi.ts', /from '@\/lib\/dbConnections'/g, "from './dbConnections'");

console.log('Fixed aliases');
