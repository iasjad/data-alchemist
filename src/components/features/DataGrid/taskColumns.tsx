'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Task } from '@/types';
import { EditableCell } from './EditableCell';
import { useDataStore } from '@/store/useDataStore';
import { Badge } from '@/components/ui/badge';

const useUpdateTask = () => {
  const { clients, workers, tasks, updateAndValidateData } = useDataStore();

  const updateTask = (taskId: string, field: keyof Task, value: any) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, [field]: value } : t
    );
    updateAndValidateData({ clients, workers, tasks: updatedTasks });
  };
  return updateTask;
};

// Function to generate the column definitions for the task data grid
export const getTaskColumns = (): ColumnDef<Task>[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateTask = useUpdateTask();

  return [
    {
      accessorKey: 'id',
      header: 'Task ID',
      // ID is not editable, but we can still show an error on it (e.g., for duplicates)
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'id'
        )?.message;
        return (
          <div className={error ? 'text-red-500' : ''} title={error}>
            {row.getValue('id')}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'name'
        )?.message;
        return (
          <EditableCell
            initialValue={row.getValue('name')}
            onSave={(value) => updateTask(row.original.id, 'name', value)}
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'category'
        )?.message;
        return (
          <EditableCell
            initialValue={row.getValue('category')}
            onSave={(value) => updateTask(row.original.id, 'category', value)}
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'duration'
        )?.message;
        return (
          <EditableCell
            initialValue={row.getValue('duration')}
            onSave={(value) =>
              updateTask(row.original.id, 'duration', Number(value))
            }
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'requiredSkills',
      header: 'Required Skills',
      cell: ({ row }) => {
        const skills = row.getValue('requiredSkills') as string[];
        const error = row.original.errors?.find(
          (e) => e.field === 'requiredSkills'
        )?.message;
        // Displaying skills as badges for better readability
        return (
          <div className="flex flex-wrap gap-1" title={error}>
            {skills.map((skill) => (
              <Badge key={skill} variant={error ? 'destructive' : 'secondary'}>
                {skill}
              </Badge>
            ))}
          </div>
        );
      },
    },
  ];
};
