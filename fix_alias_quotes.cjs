const fs = require('fs');

function repl(file, search, rep) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, rep);
  fs.writeFileSync(file, content, 'utf8');
}

// src/components/AdminBackendTab.tsx
repl('src/components/AdminBackendTab.tsx', /from "(@\/lib[^"]*)"/g, "from '../lib$1'"); // wait, $1 has @/lib
repl('src/components/AdminBackendTab.tsx', /from ["']@\/lib\/dbConnections["']/g, "from '../lib/dbConnections'");

// src/lib/analytics.ts
repl('src/lib/analytics.ts', /from ["']@\/integrations\/supabase\/client["']/g, "from '../integrations/supabase/client'");

// src/lib/dbConnections.ts
repl('src/lib/dbConnections.ts', /from ["']@\/integrations\/supabase\/client["']/g, "from '../integrations/supabase/client'");
repl('src/lib/dbConnections.ts', /from ["']@\/lib\/firestoreDriver["']/g, "from './firestoreDriver'");

// src/lib/firebaseApi.ts
repl('src/lib/firebaseApi.ts', /from ["']@\/lib\/dbConnections["']/g, "from './dbConnections'");

console.log('Fixed quotes and aliases');
