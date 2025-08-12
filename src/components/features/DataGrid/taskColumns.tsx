'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Task } from '@/types';
import { EditableCell } from './EditableCell';
import { Badge } from '@/components/ui/badge';

export const getTaskColumns = (): ColumnDef<Task>[] => [
  { accessorKey: 'id', header: 'Task ID' },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Task, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('name')}
          onSave={(value) => updateData(row.original.id, 'name', value)}
        />
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row, table }) => {
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Task, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('category')}
          onSave={(value) => updateData(row.original.id, 'category', value)}
        />
      );
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row, table }) => {
      const error = row.original.errors?.find(
        (e) => e.field === 'duration'
      )?.message;
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Task, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('duration')}
          onSave={(value) =>
            updateData(row.original.id, 'duration', Number(value))
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
      const error = row.original.errors?.find(
        (e) => e.field === 'requiredSkills'
      )?.message;
      return (
        <div className="flex flex-wrap gap-1" title={error}>
          {row.original.requiredSkills.map((s) => (
            <Badge key={s} variant={error ? 'destructive' : 'outline'}>
              {s}
            </Badge>
          ))}
        </div>
      );
    },
  },
];
