const fs = require('fs');

function replaceFileContents(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content, 'utf8');
}

replaceFileContents('src/components/admin/AdminGoalsTab.tsx', [
    [/import \{ ActionMenu \} from '\.\.\/\.\.\/App';/g, "import { ActionMenu } from '../ui/ActionMenu';"],
    [/import \{ ConfirmModal \} from '\.\.\/\.\.\/App';/g, "import { ConfirmModal } from '../ui/ConfirmModal';"]
]);

replaceFileContents('src/components/admin/AdminStudentsTab.tsx', [
    [/import \{ ActionMenu \} from '\.\.\/\.\.\/App';/g, "import { ActionMenu } from '../ui/ActionMenu';"],
    [/import \{ ConfirmModal \} from '\.\.\/\.\.\/App';/g, "import { ConfirmModal } from '../ui/ConfirmModal';"]
]);

console.log('Fixed single quotes imports');
