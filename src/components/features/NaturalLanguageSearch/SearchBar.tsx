'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/store/useDataStore'; // We'll add filtering logic to the store next

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { applyFilters } = useDataStore(); // This function will apply the AI-generated filter

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const filterConfig = await response.json();

      if (filterConfig.error) {
        // Handle error from AI (e.g., show a toast notification)
        console.error(filterConfig.error);
      } else {
        applyFilters(filterConfig);
      }
    } catch (error) {
      console.error('Failed to fetch from search API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 flex gap-2">
      <Input
        type="text"
        placeholder="e.g., show workers with analysis skill and level 4..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        disabled={isLoading}
      />
      <Button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
}
