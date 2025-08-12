'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, FileUp, UploadCloud, XCircle } from 'lucide-react';

interface SingleFileUploaderProps {
  title: string;
  dataType: 'clients' | 'workers' | 'tasks';
  onFileUpload: (
    file: File,
    type: 'clients' | 'workers' | 'tasks'
  ) => Promise<void>;
  hasData: boolean;
}

export function SingleFileUploader({
  title,
  dataType,
  onFileUpload,
  hasData,
}: SingleFileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      try {
        await onFileUpload(file, dataType);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onFileUpload, dataType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    multiple: false, // Only allow one file at a time
    disabled: isLoading,
  });

  const borderColor = isDragActive
    ? 'border-primary'
    : hasData
    ? 'border-green-500'
    : 'border-border';

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          {hasData ? <CheckCircle2 className="text-green-500" /> : <FileUp />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors ${borderColor}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <UploadCloud className="h-10 w-10" />
            {isLoading ? (
              <p className="text-primary animate-pulse">Processing...</p>
            ) : hasData ? (
              <p className="font-semibold text-green-600">Data Loaded!</p>
            ) : (
              <p>Drop file here or click</p>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
