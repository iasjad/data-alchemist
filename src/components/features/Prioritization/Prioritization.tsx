'use client';

import React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function Prioritization() {
  const { priorities, setPriorities } = useDataStore();

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold tracking-tight mb-4">
        Prioritization & Weights
      </h2>
      <div className="p-6 border rounded-lg bg-card text-card-foreground space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="fulfillHighestPriority">
            Focus on High-Priority Clients
          </Label>
          <Slider
            id="fulfillHighestPriority"
            value={[priorities.fulfillHighestPriority]}
            onValueChange={([value]) =>
              setPriorities({ fulfillHighestPriority: value })
            }
            max={100}
            step={1}
          />
          <p className="text-sm text-muted-foreground">
            Higher value prioritizes completing tasks for clients with a
            `PriorityLevel` of 1-2.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="taskCompletion">Maximize Task Completion</Label>
          <Slider
            id="taskCompletion"
            value={[priorities.taskCompletion]}
            onValueChange={([value]) =>
              setPriorities({ taskCompletion: value })
            }
            max={100}
            step={1}
          />
          <p className="text-sm text-muted-foreground">
            Higher value aims to complete the maximum number of requested tasks
            overall.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fairness">Ensure Fair Worker Distribution</Label>
          <Slider
            id="fairness"
            value={[priorities.fairness]}
            onValueChange={([value]) => setPriorities({ fairness: value })}
            max={100}
            step={1}
          />
          <p className="text-sm text-muted-foreground">
            Higher value attempts to distribute tasks more evenly across all
            workers.
          </p>
        </div>
      </div>
    </div>
  );
}
