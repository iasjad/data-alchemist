export interface FieldError {
  field: string;
  message: string;
}

export interface Client {
  id: string;
  name: string;
  priorityLevel: number;
  requestedTaskIds: string[];
  groupTag: string;
  attributes: Record<string, unknown> | string;
  errors?: FieldError[];
}

export interface Worker {
  id: string;
  name: string;
  skills: string[];
  availableSlots: number[];
  maxLoadPerPhase: number;
  workerGroup: string;
  qualificationLevel: number;
  errors?: FieldError[];
}

export interface Task {
  id: string;
  name: string;
  category: string;
  duration: number;
  requiredSkills: string[];
  preferredPhases: number[];
  maxConcurrent: number;
  errors?: FieldError[];
}

export type DataEntity = Client | Worker | Task;

export interface CoRunRule {
  type: 'coRun';
  tasks: string[];
}

export type BusinessRule = CoRunRule;

export interface PrioritySettings {
  fulfillHighestPriority: number;
  taskCompletion: number;
  fairness: number;
}
