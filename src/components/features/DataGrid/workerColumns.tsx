'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Worker } from '@/types';
import { EditableCell } from './EditableCell';
import { useDataStore } from '@/store/useDataStore';
import { Badge } from '@/components/ui/badge';

// This hook encapsulates the logic for updating worker data in the global store
const useUpdateWorker = () => {
  const { clients, workers, tasks, updateAndValidateData } = useDataStore();
  const updateWorker = (workerId: string, field: keyof Worker, value: any) => {
    const updatedWorkers = workers.map((w) =>
      w.id === workerId ? { ...w, [field]: value } : w
    );
    // Call the new centralized function
    updateAndValidateData({ clients, workers: updatedWorkers, tasks });
  };
  return updateWorker;
};

// Function to generate the column definitions for the worker data grid
export const getWorkerColumns = (): ColumnDef<Worker>[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateWorker = useUpdateWorker();

  return [
    {
      accessorKey: 'id',
      header: 'Worker ID',
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
            onSave={(value) => updateWorker(row.original.id, 'name', value)}
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as string[];
        const error = row.original.errors?.find(
          (e) => e.field === 'skills'
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
    {
      accessorKey: 'qualificationLevel',
      header: 'Level',
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'qualificationLevel'
        )?.message;
        return (
          <EditableCell
            initialValue={row.getValue('qualificationLevel')}
            onSave={(value) =>
              updateWorker(row.original.id, 'qualificationLevel', Number(value))
            }
            error={error}
          />
        );
      },
    },
  ];
};
