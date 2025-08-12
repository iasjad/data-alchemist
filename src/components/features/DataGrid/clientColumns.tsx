'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/types';
import { EditableCell } from './EditableCell';
import { Badge } from '@/components/ui/badge';

export const getClientColumns = (): ColumnDef<Client>[] => [
  {
    accessorKey: 'id',
    header: 'Client ID',
    cell: ({ row }) => {},
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const error = row.original.errors?.find(
        (e) => e.field === 'name'
      )?.message;
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Client, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('name')}
          onSave={(value) => updateData(row.original.id, 'name', value)}
          error={error}
        />
      );
    },
  },
  {
    accessorKey: 'priorityLevel',
    header: 'Priority',
    cell: ({ row, table }) => {
      const error = row.original.errors?.find(
        (e) => e.field === 'priorityLevel'
      )?.message;
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Client, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('priorityLevel')}
          onSave={(value) =>
            updateData(row.original.id, 'priorityLevel', Number(value))
          }
          error={error}
        />
      );
    },
  },
  {
    accessorKey: 'groupTag',
    header: 'Group Tag',
    cell: ({ row, table }) => {
      const error = row.original.errors?.find(
        (e) => e.field === 'groupTag'
      )?.message;
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Client, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('groupTag')}
          onSave={(value) => updateData(row.original.id, 'groupTag', value)}
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
    cell: ({ row, table }) => {
      const attributes = row.original.attributes;
      const error = row.original.errors?.find(
        (e) => e.field === 'attributes'
      )?.message;
      const displayValue =
        typeof attributes === 'object'
          ? JSON.stringify(attributes)
          : attributes;
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Client, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={displayValue}
          onSave={(value) =>
            updateData(row.original.id, 'attributes', value as string)
          }
          error={error}
        />
      );
    },
  },
];
