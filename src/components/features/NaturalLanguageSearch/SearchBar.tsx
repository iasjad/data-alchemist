'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/store/useDataStore'; 

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { applyFilters } = useDataStore(); 

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
        onChange={(_e) => setQuery(_e.target.value)}
        onKeyDown={(_e) => _e.key === 'Enter' && handleSearch()}
        disabled={isLoading}
      />
      <Button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
}
