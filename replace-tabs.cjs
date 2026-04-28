const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf-8');

const regex = /<div className="flex flex-col gap-6">[\s\S]*?(?=    <\/div>\n  \);\n})/m;

const replacement = `<Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <div className="sticky top-0 md:top-16 z-30 w-full overflow-x-auto no-scrollbar scrollbar-hide py-2">
          <TabsList className="h-14 w-max max-w-full justify-start rounded-xl p-1 bg-card border border-border shadow-soft">
            <TabsTrigger value="students" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Users className="w-4 h-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Target className="w-4 h-4" /> Tracks & Goals
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Palette className="w-4 h-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Search className="w-4 h-4" /> Statistics
            </TabsTrigger>
            <TabsTrigger value="import-export" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Database className="w-4 h-4" /> Import / Export
            </TabsTrigger>
            <TabsTrigger value="backend" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Server className="w-4 h-4" /> Backend & DB
            </TabsTrigger>
            <TabsTrigger value="cache" className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <ShieldCheck className="w-4 h-4" /> PWA Management
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card rounded-xl border border-border shadow-soft overflow-hidden min-h-[600px] mb-8">
          <TabsContent value="students" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <AdminStudentsTab 
              students={students} refreshData={refreshData}
              masterGoals={masterGoals} categories={categories}
              calculateTotalPoints={calculateTotalPoints}
            />
          </TabsContent>
          <TabsContent value="goals" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <AdminGoalsTab 
              masterGoals={masterGoals} refreshData={refreshData}
              categories={categories} 
            />
          </TabsContent>
          <TabsContent value="appearance" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <AdminAppearanceTab refreshData={refreshData} appSettings={appSettings} setAppSettings={() => queryClient.invalidateQueries({ queryKey: ['app-data'] })} />
          </TabsContent>
          <TabsContent value="statistics" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <AdminStatisticsTab />
          </TabsContent>
          <TabsContent value="import-export" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <AdminImportExportTab
              apiFetch={apiFetch}
              students={students}
              masterGoals={masterGoals}
              categories={categories}
              refreshData={refreshData}
            />
          </TabsContent>
          <TabsContent value="backend" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <AdminBackendTab refreshData={refreshData} />
          </TabsContent>
          <TabsContent value="cache" className="m-0 border-0 focus-visible:outline-none focus-visible:ring-0">
            <CacheHealthTab />
          </TabsContent>
        </div>
      </Tabs>\n`;

content = content.replace(regex, replacement);

if (!content.includes('import { Tabs, TabsContent, TabsList, TabsTrigger }')) {
  content = content.replace(
    "import CacheHealthTab from '../CacheHealthTab';",
    "import CacheHealthTab from '../CacheHealthTab';\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';"
  );
}

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', content);
