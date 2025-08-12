'use client';

import React, { useCallback } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { parseWorkbook, parseSingleFile, transformRow } from '@/lib/parser'; // Import new functions
import { validateAllData } from '@/lib/validator';
import { SingleFileUploader } from './SingleFileUploader';
import { Client, Task, Worker } from '@/types';

export function DataIngestionController() {
  const { clients, workers, tasks, updateAndValidateData } = useDataStore();

  const handleIndividualFileUpload = useCallback(
    async (file: File, fileType: 'clients' | 'workers' | 'tasks') => {
      const currentData = { clients, workers, tasks };
      const jsonData = await parseSingleFile(file);
      const transformedData = jsonData
        .map((row) => transformRow(row, fileType))
        .filter((obj) => obj && obj.id);

      switch (fileType) {
        case 'clients':
          currentData.clients = transformedData as Client[];
          break;
        case 'workers':
          currentData.workers = transformedData as Worker[];
          break;
        case 'tasks':
          currentData.tasks = transformedData as Task[];
          break;
      }

      updateAndValidateData(currentData);
    },
    [clients, workers, tasks, updateAndValidateData]
  );

  const handleAllInOneUpload = useCallback(
    async (file: File) => {
      const parsedData = await parseWorkbook(file);
      updateAndValidateData(parsedData);
    },
    [updateAndValidateData]
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      {/* Section for Individual File Uploads */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Upload Individual Files
          </h2>
          <p className="text-muted-foreground">
            Upload a separate CSV or Excel file for each data type.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SingleFileUploader
            title="Client Data"
            dataType="clients"
            onFileUpload={handleIndividualFileUpload}
            hasData={clients.length > 0}
          />
          <SingleFileUploader
            title="Worker Data"
            dataType="workers"
            onFileUpload={handleIndividualFileUpload}
            hasData={workers.length > 0}
          />
          <SingleFileUploader
            title="Task Data"
            dataType="tasks"
            onFileUpload={handleIndividualFileUpload}
            hasData={tasks.length > 0}
          />
        </div>
      </div>

      {/* OR Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      {/* Section for All-in-One Upload */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Upload All-in-One
          </h2>
          <p className="text-muted-foreground">
            Upload a single Excel (.xlsx) file with separate sheets for clients,
            workers, and tasks.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <SingleFileUploader
            title="All-in-One Workbook"
            dataType="clients"
            onFileUpload={handleAllInOneUpload}
            hasData={
              clients.length > 0 && workers.length > 0 && tasks.length > 0
            }
          />
        </div>
      </div>
    </div>
  );
}
