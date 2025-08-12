'use client';

import React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Client, Worker, Task, FieldError } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react'; // An icon for the alert

// Helper function to flatten all errors from all data entities
const getAllErrors = (clients: Client[], workers: Worker[], tasks: Task[]) => {
  const allErrors: { entityId: string; type: string; error: FieldError }[] = [];

  clients.forEach((c) =>
    c.errors?.forEach((e) =>
      allErrors.push({ entityId: c.id, type: 'Client', error: e })
    )
  );
  workers.forEach((w) =>
    w.errors?.forEach((e) =>
      allErrors.push({ entityId: w.id, type: 'Worker', error: e })
    )
  );
  tasks.forEach((t) =>
    t.errors?.forEach((e) =>
      allErrors.push({ entityId: t.id, type: 'Task', error: e })
    )
  );

  return allErrors;
};

export function ValidationSummary() {
  const { clients, workers, tasks } = useDataStore();
  const allErrors = getAllErrors(clients, workers, tasks);

  if (allErrors.length === 0) {
    // If there are no errors, show a success message
    return (
      <Alert variant="default" className="mt-8 border-green-500">
        <AlertCircle className="h-4 w-4 !text-green-500" />
        <AlertTitle className="text-green-600">All checks passed!</AlertTitle>
        <AlertDescription>
          Your data looks clean and follows all core validation rules.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <Alert variant="destructive" className="w-full text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                Validation Failed: Found {allErrors.length} errors
              </AlertTitle>
              <AlertDescription>
                Click to expand and see all data integrity issues.
              </AlertDescription>
            </Alert>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="max-h-72 overflow-y-auto pr-4">
              <ul className="space-y-2">
                {allErrors.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm p-2 bg-secondary rounded-md"
                  >
                    <span className="font-semibold text-primary">
                      {item.type} {item.entityId}:
                    </span>
                    <span className="italic mx-2">({item.error.field})</span>
                    <span>- {item.error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
