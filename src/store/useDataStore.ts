import { create } from 'zustand';
import { Client, Worker, Task, BusinessRule, CoRunRule } from '@/types'; // <-- Add BusinessRule types
import { validateAllData } from '@/lib/validator';

export interface PrioritySettings {
  fulfillHighestPriority: number; // Weight for client priority level
  taskCompletion: number; // Weight for completing as many tasks as possible
  fairness: number; // Weight for distributing work evenly
}

// The shape of the AI-generated filter config
interface FilterConfig {
  entity: 'clients' | 'workers' | 'tasks';
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
}

// The new shape of our store's state
interface DataStoreState {
  originalClients: Client[];
  originalWorkers: Worker[];
  originalTasks: Task[];
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: BusinessRule[];
  priorities: PrioritySettings;

  // This will become our primary way to change data
  updateAndValidateData: (data: {
    clients?: Client[];
    workers?: Worker[];
    tasks?: Task[];
  }) => void;

  applyFilters: (config: any) => void; // Keep for search
  addRule: (rule: BusinessRule) => void;
  removeRule: (ruleIndex: number) => void;
  setPriorities: (newPriorities: Partial<PrioritySettings>) => void;
}

// Generic filtering utility
const applyFilterLogic = (data: any[], config: FilterConfig) => {
  return data.filter((item) => {
    return config.filters.every((filter) => {
      const itemValue = item[filter.field];
      switch (filter.operator) {
        case 'equals':
          return itemValue === filter.value;
        case 'contains':
          return Array.isArray(itemValue) && itemValue.includes(filter.value);
        case 'greater_than':
          return itemValue > filter.value;
        case 'less_than':
          return itemValue < filter.value;
        default:
          return true;
      }
    });
  });
};

export const useDataStore = create<DataStoreState>((set, get) => ({
  originalClients: [],
  originalWorkers: [],
  originalTasks: [],
  clients: [],
  workers: [],
  tasks: [],
  priorities: { fulfillHighestPriority: 70, taskCompletion: 80, fairness: 50 },

  setClients: (clients: any) => set({ clients, originalClients: clients }),
  setWorkers: (workers: any) => set({ workers, originalWorkers: workers }),
  setTasks: (tasks: any) => set({ tasks, originalTasks: tasks }),
  updateAndValidateData: (newData) => {
    const currentState = get();

    // Merge new data with current state
    const mergedData = {
      clients: newData.clients ?? currentState.originalClients,
      workers: newData.workers ?? currentState.originalWorkers,
      tasks: newData.tasks ?? currentState.originalTasks,
    };

    // Run validation on the entire, updated dataset
    const validated = validateAllData(
      mergedData.clients,
      mergedData.workers,
      mergedData.tasks
    );

    // Set the state
    set({
      originalClients: validated.clients,
      originalWorkers: validated.workers,
      originalTasks: validated.tasks,
      clients: validated.clients,
      workers: validated.workers,
      tasks: validated.tasks,
    });
  },

  applyFilters: (config) => {
    const { entity } = config;
    if (entity === 'clients') {
      const filtered = applyFilterLogic(get().originalClients, config);
      set({ clients: filtered });
    }
    if (entity === 'workers') {
      const filtered = applyFilterLogic(get().originalWorkers, config);
      set({ workers: filtered });
    }
    if (entity === 'tasks') {
      const filtered = applyFilterLogic(get().originalTasks, config);
      set({ tasks: filtered });
    }
  },
  rules: [],
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  removeRule: (ruleIndex) =>
    set((state) => ({
      rules: state.rules.filter((_, index) => index !== ruleIndex),
    })),
  setPriorities: (newPriorities) =>
    set((state) => ({ priorities: { ...state.priorities, ...newPriorities } })),
}));
