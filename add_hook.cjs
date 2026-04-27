const fs = require('fs');

const hookStr = `

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: any }) => {
      const isEdit = !!id;
      const url = isEdit ? \`/api/students/\${id}\` : '/api/students';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save student');
      return res.json();
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['app-data'] });
      const previousData = queryClient.getQueryData(['app-data']);

      if (previousData) {
        queryClient.setQueryData(['app-data'], (old) => {
          if (!old) return old;
          const newStudents = [...(old.students || [])];
          if (id) {
            const index = newStudents.findIndex((s) => s.id === id);
            if (index !== -1) {
              newStudents[index] = { ...newStudents[index], ...data };
            }
          } else {
            newStudents.push({ ...data, id: 'temp-id-' + Date.now() });
          }
          return { ...old, students: newStudents };
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['app-data'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['app-data'] });
    },
  });
}
`;

fs.appendFileSync('src/hooks/useAppQueries.ts', hookStr, 'utf8');
