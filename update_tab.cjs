const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminStudentsTab.tsx', 'utf8');

if (!code.includes('useUpdateStudentMutation')) {
    code = code.replace(
        "import { apiFetch } from '../../lib/api';",
        "import { apiFetch } from '../../lib/api';\nimport { useUpdateStudentMutation } from '../../hooks/useAppQueries';"
    );
}

// Inside AdminStudentsTab component
if (!code.match(/const updateStudentMutation = useUpdateStudentMutation\(\);/)) {
    code = code.replace(
        "const [deleteConfirm, setDeleteConfirm] = useState<any>(null);",
        "const [deleteConfirm, setDeleteConfirm] = useState<any>(null);\n  const updateStudentMutation = useUpdateStudentMutation();"
    );
}

// Modify handleSave
const oldSavePattern = /const res = await apiFetch\(url, \{\s*method,\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(finalData\)\s*\}\);\s*if \(!res\.ok\) \{\s*alert\(`Failed to save: \$\{res\.statusText\}`\);\s*return;\s*\}\s*refreshData\(\);\s*setModalOpen\(false\);/;

const newSave = `try {
      await updateStudentMutation.mutateAsync({ id: formData.id, data: finalData });
      setModalOpen(false);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    }`;

code = code.replace(oldSavePattern, newSave);

fs.writeFileSync('src/components/admin/AdminStudentsTab.tsx', code);
