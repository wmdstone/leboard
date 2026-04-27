const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace new useQueries

content = content.replace(
  "import { useAuthQuery, useAppDataQuery } from './hooks/useAppQueries';",
  "import { useAuthQuery, useAppDataQuery, useAdminStatsQuery, useAppEventsQuery } from './hooks/useAppQueries';"
);

// AdminStatisticsTab
const statsQueryStart = content.indexOf("const { data, isLoading: loading } = useQuery({");
const statsQueryEnd = content.indexOf("  const stats = data?.stats;");
if (statsQueryStart !== -1 && statsQueryEnd !== -1) {
  content = content.substring(0, statsQueryStart) + "const { data, isLoading: loading } = useAdminStatsQuery(filter);\n\n" + content.substring(statsQueryEnd);
}

// AppAnalyticsPanel
const eventsQueryStart = content.indexOf("const { data: events, isLoading: loading } = useQuery({");
const eventsQueryEnd = content.indexOf("  // Aggregate metrics + chart-ready series.");
if (eventsQueryStart !== -1 && eventsQueryEnd !== -1) {
  content = content.substring(0, eventsQueryStart) + "const { data: events, isLoading: loading } = useAppEventsQuery(filter);\n\n" + content.substring(eventsQueryEnd);
}

// Also remove `presetMap` from App.tsx since it's now in useAppQueries.ts
const presetMapStart = content.indexOf("const presetMap: Record<string, string> = {");
const presetMapEnd = content.indexOf("  const { data, isLoading: loading } = useAdminStatsQuery(filter);");
if (presetMapStart !== -1 && presetMapEnd !== -1) {
  // Be careful not to remove too much. Let's find the closing brace of presetMap
  const closingBrace = content.indexOf("};\n", presetMapStart) + 3;
  if (closingBrace > presetMapStart && closingBrace < presetMapEnd) {
     content = content.substring(0, presetMapStart) + content.substring(closingBrace);
  }
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('done');
