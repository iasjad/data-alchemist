'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Worker } from '@/types';
import { EditableCell } from './EditableCell';
import { Badge } from '@/components/ui/badge';

export const getWorkerColumns = (): ColumnDef<Worker>[] => [
  { accessorKey: 'id', header: 'Worker ID' },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => {
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Worker, value: any) => void;
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
    accessorKey: 'skills',
    header: 'Skills',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.skills.map((s) => (
          <Badge key={s} variant="outline">
            {s}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'qualificationLevel',
    header: 'Level',
    cell: ({ row, table }) => {
      const { updateData } = table.options.meta as {
        updateData: (id: string, field: keyof Worker, value: any) => void;
      };
      return (
        <EditableCell
          initialValue={row.getValue('qualificationLevel')}
          onSave={(value) =>
            updateData(row.original.id, 'qualificationLevel', Number(value))
          }
        />
      );
    },
  },
];
