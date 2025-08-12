'use client';

import React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react'; // Icon for delete button

export function RuleList() {
  const { rules, removeRule } = useDataStore();

  if (rules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No business rules defined yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex-grow">
            <p className="font-semibold capitalize text-primary">
              {rule.type} Rule
            </p>
            {rule.type === 'coRun' && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-sm">Tasks:</p>
                {rule.tasks.map((taskId) => (
                  <Badge key={taskId} variant="secondary">
                    {taskId}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeRule(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
