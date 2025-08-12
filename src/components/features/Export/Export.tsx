'use client';

import React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);

  const formatCell = (value: unknown): string => {
    if (value == null) {
      return '';
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    const stringValue = String(value);

    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }

    return stringValue;
  };

  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => formatCell(row[header])).join(',')
    ),
  ];

  return csvRows.join('\n');
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Export() {
  const { clients, workers, tasks, rules, priorities } = useDataStore();

  const handleExport = () => {
    const cleanedClients = clients.map(({ errors, ...rest }) => rest);
    const cleanedWorkers = workers.map(({ errors, ...rest }) => rest);
    const cleanedTasks = tasks.map(({ errors, ...rest }) => rest);

    const rulesConfig = {
      priorities,
      rules,
    };
    const rulesJsonString = JSON.stringify(rulesConfig, null, 2);

    if (cleanedClients.length > 0)
      downloadFile(
        toCSV(cleanedClients),
        'clients_cleaned.csv',
        'text/csv;charset=utf-8;'
      );
    if (cleanedWorkers.length > 0)
      downloadFile(
        toCSV(cleanedWorkers),
        'workers_cleaned.csv',
        'text/csv;charset=utf-8;'
      );
    if (cleanedTasks.length > 0)
      downloadFile(
        toCSV(cleanedTasks),
        'tasks_cleaned.csv',
        'text/csv;charset=utf-8;'
      );
    downloadFile(rulesJsonString, 'rules.json', 'application/json');
  };

  const canExport =
    clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-8 p-6 text-center bg-card border-2 border-dashed rounded-lg">
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Ready to Export?
      </h2>
      <p className="text-muted-foreground mb-4">
        Download your cleaned data and the generated `rules.json` file.
      </p>
      <Button onClick={handleExport} disabled={!canExport} size="lg">
        <Download className="mr-2 h-4 w-4" />
        Export All Files
      </Button>
    </div>
  );
}
