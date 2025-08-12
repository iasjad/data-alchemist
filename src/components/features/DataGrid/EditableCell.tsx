'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // ✅ Import Textarea
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  initialValue: string | number;
  onSave: (value: string | number) => void;
  error?: string;
  isTextArea?: boolean; // ✅ new prop
}

export const EditableCell: React.FC<EditableCellProps> = ({
  initialValue,
  onSave,
  error,
  isTextArea = false, // ✅ default false
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (value !== initialValue) {
      onSave(value);
    }
  };

  const inputElement = isTextArea ? (
    <Textarea
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={cn('w-full min-h-[80px]', {
        'border-red-500 focus-visible:ring-red-500': error,
      })}
    />
  ) : (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={cn('w-full h-8', {
        'border-red-500 focus-visible:ring-red-500': error,
      })}
    />
  );

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{inputElement}</TooltipTrigger>
          <TooltipContent className="bg-red-600 text-white">
            <p>{error}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return inputElement;
};
