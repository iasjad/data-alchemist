'use client';

import React, { useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Button } from '@/components/ui/button';
import { CoRunRule } from '@/types';
import { Checkbox } from '@/components/ui/checkbox'; // Add this component via shadcn
import { Label } from '@/components/ui/label'; // And this one too

interface CoRunRuleFormProps {
  onRuleCreated: () => void;
}

export function CoRunRuleForm({ onRuleCreated }: CoRunRuleFormProps) {
  const { tasks, addRule } = useDataStore();
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  const handleTaskToggle = (taskId: string) => {
    const newSelection = new Set(selectedTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTaskIds(newSelection);
  };

  const handleSaveRule = () => {
    if (selectedTaskIds.size < 2) {
      setError('You must select at least two tasks for a Co-run rule.');
      return;
    }
    setError(null);
    const newRule: CoRunRule = {
      type: 'coRun',
      tasks: Array.from(selectedTaskIds),
    };
    addRule(newRule);
    onRuleCreated(); // Close the dialog
  };

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Please upload task data to create this rule.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">Select Tasks to Run Together</h4>
        <div className="mt-2 p-3 border rounded-md max-h-60 overflow-y-auto space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox
                id={task.id}
                checked={selectedTaskIds.has(task.id)}
                onCheckedChange={() => handleTaskToggle(task.id)}
              />
              <Label htmlFor={task.id} className="font-normal">
                {task.name} ({task.id})
              </Label>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleSaveRule} className="w-full">
        Save Co-run Rule
      </Button>
    </div>
  );
}
