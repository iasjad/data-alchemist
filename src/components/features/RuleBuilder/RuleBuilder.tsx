'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CoRunRuleForm } from './CoRunRuleForm';
import { RuleList } from './RuleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { useDataStore } from '@/store/useDataStore';
import { BusinessRule } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

// New component for the AI Rule creation form
function AiRuleForm({ onRuleCreated }: { onRuleCreated: () => void }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addRule } = useDataStore();

  const handleCreateRule = async () => {
    if (!text) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        addRule(result as BusinessRule);
        onRuleCreated(); // Close dialog on success
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Describe the Rule!</AlertTitle>
        <AlertDescription>
          Try something like: "Tasks T1, T5, and T8 must run together".
        </AlertDescription>
      </Alert>
      <Textarea
        placeholder="Enter rule in plain English..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        onClick={handleCreateRule}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Thinking...' : 'Create Rule with AI'}
      </Button>
    </div>
  );
}

export function RuleBuilder() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Business Rules</h2>
      <div className="p-4 border rounded-lg bg-card text-card-foreground">
        <RuleList />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">Add New Rule</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a New Business Rule</DialogTitle>
            </DialogHeader>
            {/* Use tabs to switch between manual and AI creation */}
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai">✨ Create with AI</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="ai" className="pt-4">
                <AiRuleForm onRuleCreated={() => setIsDialogOpen(false)} />
              </TabsContent>
              <TabsContent value="manual" className="pt-4">
                <CoRunRuleForm onRuleCreated={() => setIsDialogOpen(false)} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
