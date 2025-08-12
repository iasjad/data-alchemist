import { Client, Worker, Task, FieldError } from '@/types';

// Helper to find duplicates in an array
const findDuplicates = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }
  return Array.from(duplicates);
};

/**
 * Main validation function that orchestrates all checks.
 */
export const validateAllData = (
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
) => {
  // --- Pre-computation for efficient lookups ---
  const clientIds = clients.map((c) => c.id);
  const workerIds = workers.map((w) => w.id);
  const taskIds = tasks.map((t) => t.id);

  const duplicateClientIds = findDuplicates(clientIds);
  const duplicateWorkerIds = findDuplicates(workerIds);
  const duplicateTaskIds = findDuplicates(taskIds);

  const taskIdSet = new Set(taskIds);
  const allWorkerSkills = new Set(workers.flatMap((w) => w.skills));

  // --- Run validations ---
  const validatedClients = clients.map((client) =>
    validateClient(client, taskIdSet, duplicateClientIds)
  );
  const validatedWorkers = workers.map((worker) =>
    validateWorker(worker, duplicateWorkerIds)
  );
  const validatedTasks = tasks.map((task) =>
    validateTask(task, allWorkerSkills, duplicateTaskIds)
  );

  return {
    clients: validatedClients,
    workers: validatedWorkers,
    tasks: validatedTasks,
  };
};

// --- Individual Entity Validators ---

function validateClient(
  client: Client,
  taskIds: Set<string>,
  duplicateIds: string[]
): Client {
  const errors: FieldError[] = [];

  // Core Rule: Duplicate ClientID
  if (duplicateIds.includes(client.id)) {
    errors.push({
      field: 'id',
      message: `Duplicate ClientID found: ${client.id}`,
    });
  }

  // Core Rule: PriorityLevel out of range (1-5)
  if (client.priorityLevel < 1 || client.priorityLevel > 5) {
    errors.push({
      field: 'priorityLevel',
      message: 'Priority must be between 1 and 5.',
    });
  }

  // Core Rule: Unknown references in RequestedTaskIDs
  const unknownTasks = client.requestedTaskIds.filter((id) => !taskIds.has(id));
  if (unknownTasks.length > 0) {
    errors.push({
      field: 'requestedTaskIds',
      message: `Requests unknown TaskIDs: ${unknownTasks.join(', ')}`,
    });
  }

  // Core Rule: Broken JSON in AttributesJSON
  if (
    typeof client.attributes === 'string' &&
    client.attributes.trim().startsWith('{')
  ) {
    try {
      JSON.parse(client.attributes);
    } catch (e) {
      errors.push({
        field: 'attributes',
        message: 'Attributes field contains invalid JSON.',
      });
    }
  }

  return { ...client, errors };
}

function validateWorker(worker: Worker, duplicateIds: string[]): Worker {
  const errors: FieldError[] = [];

  // Core Rule: Duplicate WorkerID
  if (duplicateIds.includes(worker.id)) {
    errors.push({
      field: 'id',
      message: `Duplicate WorkerID found: ${worker.id}`,
    });
  }

  // Core Rule: Malformed lists (non-numeric in AvailableSlots)
  if (
    worker.availableSlots.some(
      (slot) => typeof slot !== 'number' || isNaN(slot)
    )
  ) {
    errors.push({
      field: 'availableSlots',
      message: 'AvailableSlots must only contain numbers.',
    });
  }

  // Core Rule: Overloaded workers
  if (worker.availableSlots.length < worker.maxLoadPerPhase) {
    errors.push({
      field: 'maxLoadPerPhase',
      message:
        'MaxLoadPerPhase cannot be greater than the number of available slots.',
    });
  }

  return { ...worker, errors };
}

function validateTask(
  task: Task,
  allWorkerSkills: Set<string>,
  duplicateIds: string[]
): Task {
  const errors: FieldError[] = [];

  // Core Rule: Duplicate TaskID
  if (duplicateIds.includes(task.id)) {
    errors.push({ field: 'id', message: `Duplicate TaskID found: ${task.id}` });
  }

  // Core Rule: Out-of-range values (Duration < 1)
  if (task.duration < 1) {
    errors.push({
      field: 'duration',
      message: 'Duration must be at least 1 phase.',
    });
  }

  // Core Rule: Skill-coverage matrix
  const unstaffableSkills = task.requiredSkills.filter(
    (skill) => !allWorkerSkills.has(skill)
  );
  if (unstaffableSkills.length > 0) {
    errors.push({
      field: 'requiredSkills',
      message: `No worker has the required skill(s): ${unstaffableSkills.join(
        ', '
      )}`,
    });
  }

  return { ...task, errors };
}
