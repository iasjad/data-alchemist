'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/types';
import { EditableCell } from './EditableCell';
import { useDataStore } from '@/store/useDataStore';
import { Badge } from '@/components/ui/badge';

// This hook encapsulates the logic for updating client data in the global store
const useUpdateClient = () => {
  const { clients, workers, tasks, updateAndValidateData } = useDataStore();

  const updateClient = (clientId: string, field: keyof Client, value: any) => {
    const updatedClients = clients.map((c) =>
      c.id === clientId ? { ...c, [field]: value } : c
    );
    // Call the new centralized function
    updateAndValidateData({ clients: updatedClients, workers, tasks });
  };
  return updateClient;
};

// Function to generate the column definitions for the client data grid
export const getClientColumns = (): ColumnDef<Client>[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateClient = useUpdateClient();

  return [
    {
      accessorKey: 'id',
      header: 'Client ID',
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
            onSave={(value) => updateClient(row.original.id, 'name', value)}
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'priorityLevel',
      header: 'Priority',
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'priorityLevel'
        )?.message;
        return (
          <EditableCell
            initialValue={row.getValue('priorityLevel')}
            onSave={(value) =>
              updateClient(row.original.id, 'priorityLevel', Number(value))
            }
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'groupTag',
      header: 'Group Tag',
      cell: ({ row }) => {
        const error = row.original.errors?.find(
          (e) => e.field === 'groupTag'
        )?.message;
        return (
          <EditableCell
            initialValue={row.getValue('groupTag')}
            onSave={(value) => updateClient(row.original.id, 'groupTag', value)}
            error={error}
          />
        );
      },
    },
    {
      accessorKey: 'requestedTaskIds',
      header: 'Requested Tasks',
      cell: ({ row }) => {
        const tasks = row.getValue('requestedTaskIds') as string[];
        const error = row.original.errors?.find(
          (e) => e.field === 'requestedTaskIds'
        )?.message;
        // Displaying tasks as badges for better readability
        return (
          <div className="flex flex-wrap gap-1" title={error}>
            {tasks.map((task) => (
              <Badge key={task} variant={error ? 'destructive' : 'secondary'}>
                {task}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'attributes',
      header: 'Attributes',
      cell: ({ row }) => {
        const attributes = row.original.attributes;
        const error = row.original.errors?.find(
          (e) => e.field === 'attributes'
        )?.message;
        const displayValue =
          typeof attributes === 'object'
            ? JSON.stringify(attributes, null, 2)
            : attributes;

        // Using a textarea for better multiline JSON editing
        return (
          <EditableCell
            initialValue={displayValue}
            onSave={(value) =>
              updateClient(row.original.id, 'attributes', value as string)
            }
            error={error}
            isTextArea={true} // A potential prop to render a textarea instead of input
          />
        );
      },
    },
  ];
};
