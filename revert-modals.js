import * as fs from 'fs';

function removeModalFalse(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/<DropdownMenu modal=\{false\}>/g, '<DropdownMenu>');
  content = content.replace(/<DropdownMenu modal=\{false\} open=/g, '<DropdownMenu open=');
  content = content.replace(/<Popover modal=\{false\}>/g, '<Popover>');
  content = content.replace(/<Popover modal=\{false\} open=/g, '<Popover open=');
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
    removeModalFalse(f);
  }
});
