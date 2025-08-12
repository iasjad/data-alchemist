import { create } from 'zustand';
import { Client, Worker, Task, BusinessRule, PrioritySettings } from '@/types';
import { validateAllData } from '@/lib/validator';

interface FilterConfig {
  entity: 'clients' | 'workers' | 'tasks';
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number; 
  }[];
}

interface DataStoreState {
  originalClients: Client[];
  originalWorkers: Worker[];
  originalTasks: Task[];
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: BusinessRule[];
  priorities: PrioritySettings;
  updateAndValidateData: (data: {
    clients?: Client[];
    workers?: Worker[];
    tasks?: Task[];
  }) => void;
  applyFilters: (config: FilterConfig) => void;
  addRule: (rule: BusinessRule) => void;
  removeRule: (ruleIndex: number) => void;
  setPriorities: (newPriorities: Partial<PrioritySettings>) => void;
}


function applyFilterLogic<T extends Client | Worker | Task>(
  data: T[],
  config: FilterConfig
): T[] {
  return data.filter((item) => {
    return config.filters.every((filter) => {
      const itemValue = (item as unknown as Record<string, string | number | object>)[
        filter.field
      ];
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
}

export const useDataStore = create<DataStoreState>((set, get) => ({
  originalClients: [],
  originalWorkers: [],
  originalTasks: [],
  clients: [],
  workers: [],
  tasks: [],
  rules: [],
  priorities: { fulfillHighestPriority: 70, taskCompletion: 80, fairness: 50 },

  updateAndValidateData: (newData) => {
    const currentState = get();
    const mergedData = {
      clients: newData.clients ?? currentState.originalClients,
      workers: newData.workers ?? currentState.originalWorkers,
      tasks: newData.tasks ?? currentState.originalTasks,
    };
    const validated = validateAllData(
      mergedData.clients,
      mergedData.workers,
      mergedData.tasks
    );
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

  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  removeRule: (ruleIndex) =>
    set((state) => ({
      rules: state.rules.filter((_, index) => index !== ruleIndex),
    })),
  setPriorities: (newPriorities) =>
    set((state) => ({ priorities: { ...state.priorities, ...newPriorities } })),
}));
