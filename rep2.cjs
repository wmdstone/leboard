const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
content = content.replace(
  "import { useQuery, useQueryClient } from '@tanstack/react-query';",
  "import { useQueryClient } from '@tanstack/react-query';\nimport { useAuthQuery, useAppDataQuery } from './hooks/useAppQueries';\nimport { apiFetch, getLocalToken, setLocalToken, removeLocalToken } from './lib/api';\nimport type { Category, MasterGoal, AssignedGoal, Student } from './lib/types';"
);

// Remove the typing block and firebaseApi import since it's now in api.ts
content = content.replace("import { firebaseApiFetch } from './lib/firebaseApi';\n", "");

const typeStart = content.indexOf("// --- TYPES ---");
const typeEnd = content.indexOf("function ActionMenu");
if (typeStart !== -1 && typeEnd !== -1) {
  content = content.substring(0, typeStart) + content.substring(typeEnd);
}

// Remove the logic block from getLocalToken to fetchAppData
const tokenStart = content.indexOf("const getLocalToken = () => {");
const appCompStart = content.indexOf("export default function App() {");
if (tokenStart !== -1 && appCompStart !== -1) {
  content = content.substring(0, tokenStart) + "// --- APP COMPONENT ---\n" + content.substring(appCompStart);
}

// Inside App component, replace useQuery directly with custom hooks
const fetchAuthStart = content.indexOf("const { data: authData, isLoading: isAuthLoading } = useQuery({");
const fetchAppDataEnd = content.indexOf("const categories = appData?.categories || [];");

if (fetchAuthStart !== -1 && fetchAppDataEnd !== -1) {
  const replacement = `const { data: authData, isLoading: isAuthLoading } = useAuthQuery();

  const { data: appData, isLoading: isAppDataLoading } = useAppDataQuery();

  `;
  content = content.substring(0, fetchAuthStart) + replacement + content.substring(fetchAppDataEnd);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('done');
