'use client';

import React, { useCallback } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { DataGrid } from '@/components/features/DataGrid/DataGrid';
import { getClientColumns } from '@/components/features/DataGrid/clientColumns';
import { getWorkerColumns } from '@/components/features/DataGrid/workerColumns';
import { getTaskColumns } from '@/components/features/DataGrid/taskColumns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationSummary } from '@/components/features/ValidationSummary/ValidationSummary';
import { SearchBar } from '@/components/features/NaturalLanguageSearch/SearchBar';
import { RuleBuilder } from '@/components/features/RuleBuilder/RuleBuilder';
import { Prioritization } from '@/components/features/Prioritization/Prioritization';
import { Export } from '@/components/features/Export/Export';
import { DataIngestionController } from '@/components/features/DataIngestion/DataIngestionController';
import { Client, Task, Worker } from '@/types';

function DataTablesDisplay() {
  const { clients, workers, tasks, updateAndValidateData } = useDataStore();

  const clientColumns = getClientColumns();
  const workerColumns = getWorkerColumns();
  const taskColumns = getTaskColumns();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateClient = useCallback(
    (id: string, field: keyof Client, value: any) => {
      const updated = clients.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      );
      updateAndValidateData({ clients: updated, workers, tasks });
    },
    [clients, workers, tasks, updateAndValidateData]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateWorker = useCallback(
    (id: string, field: keyof Worker, value: any) => {
      const updated = workers.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      );
      updateAndValidateData({ clients, workers: updated, tasks });
    },
    [clients, workers, tasks, updateAndValidateData]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTask = useCallback(
    (id: string, field: keyof Task, value: any) => {
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      );
      updateAndValidateData({ clients, workers, tasks: updated });
    },
    [clients, workers, tasks, updateAndValidateData]
  );

  if (!clients.length && !workers.length && !tasks.length) {
    return (
      <div className="text-center mt-12 text-muted-foreground">
        <p>Your data tables will appear here once files are uploaded.</p>
      </div>
    );
  }

  return (
    <>
      <ValidationSummary />
      <div className="w-full max-w-7xl mx-auto mt-8 space-y-8">
        {clients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Clients Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid
                columns={clientColumns}
                data={clients}
                meta={{ updateData: updateClient }}
              />
            </CardContent>
          </Card>
        )}
        {workers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Workers Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid
                columns={workerColumns}
                data={workers}
                meta={{ updateData: updateWorker }}
              />
            </CardContent>
          </Card>
        )}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tasks Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid
                columns={taskColumns}
                data={tasks}
                meta={{ updateData: updateTask }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default function Home() {
  const { clients, workers, tasks } = useDataStore();
  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center w-full">
          Data Alchemist 🔮
        </h1>
      </div>
      <div className="w-full">
        <DataIngestionController />
      </div>
      {hasData && (
        <>
          <SearchBar />
          <RuleBuilder />
          <Prioritization />
          <DataTablesDisplay />
          <Export />
        </>
      )}
    </main>
  );
}
