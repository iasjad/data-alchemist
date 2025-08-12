/**
 * Represents a single validation error associated with a specific field.
 */
export interface FieldError {
  field: string; // The property name with the error (e.g., "priorityLevel")
  message: string; // The validation error message
}

/**
 * The core Client entity, including a property to hold validation errors.
 */
export interface Client {
  id: string; // Unique ClientID
  name: string;
  priorityLevel: number;
  requestedTaskIds: string[];
  groupTag: string;
  attributes: Record<string, unknown> | string;
  errors?: FieldError[]; // An array of validation errors for this client
}

/**
 * The core Worker entity.
 */
export interface Worker {
  id: string; // Unique WorkerID
  name: string;
  skills: string[];
  availableSlots: number[];
  maxLoadPerPhase: number;
  workerGroup: string;
  qualificationLevel: number;
  errors?: FieldError[]; // An array of validation errors for this worker
}

/**
 * The core Task entity.
 */
export interface Task {
  id: string; // Unique TaskID
  name: string;
  category: string;
  duration: number;
  requiredSkills: string[];
  preferredPhases: number[];
  maxConcurrent: number;
  errors?: FieldError[]; // An array of validation errors for this task
}

/**
 * A union type to represent any of the data entities we handle.
 */
export type DataEntity = Client | Worker | Task;

// --- Rule & Priority Types ---

export interface CoRunRule {
  type: 'coRun';
  tasks: string[]; // An array of TaskIDs that must run together
}

export type BusinessRule = CoRunRule;

/**
 * NEW: Defines the structure for the prioritization settings from the sliders.
 */
export interface PrioritySettings {
  fulfillHighestPriority: number;
  taskCompletion: number;
  fairness: number;
}
