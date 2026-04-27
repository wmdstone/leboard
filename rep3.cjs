const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Read imports again and add useQuery back
content = content.replace(
  "import { useQueryClient } from '@tanstack/react-query';",
  "import { useQuery, useQueryClient } from '@tanstack/react-query';"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('done');
