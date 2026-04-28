import * as fs from 'fs';

function addModalFalse(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/<DropdownMenu>/g, '<DropdownMenu modal={false}>');
  content = content.replace(/<DropdownMenu open=/g, '<DropdownMenu modal={false} open=');
  content = content.replace(/<Popover>/g, '<Popover modal={false}>');
  content = content.replace(/<Popover open=/g, '<Popover modal={false} open=');
  fs.writeFileSync(filePath, content);
}

const files = [
  'src/components/ui/ActionMenu.tsx',
  'src/components/admin/AdminGoalsTab.tsx',
  'src/components/admin/AdminStudentsTab.tsx',
  'src/components/StudentSearchFilter.tsx',
  'src/components/TimeRangeFilter.tsx'
];

files.forEach(f => {
  if(fs.existsSync(f)) {
    addModalFalse(f);
  }
});
