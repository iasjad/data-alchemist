import { Client, Worker, Task, FieldError } from '@/types';

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

export const validateAllData = (
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
) => {
  const clientIds = clients.map((c) => c.id);
  const workerIds = workers.map((w) => w.id);
  const taskIds = tasks.map((t) => t.id);

  const duplicateClientIds = findDuplicates(clientIds);
  const duplicateWorkerIds = findDuplicates(workerIds);
  const duplicateTaskIds = findDuplicates(taskIds);

  const taskIdSet = new Set(taskIds);
  const allWorkerSkills = new Set(workers.flatMap((w) => w.skills));

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


function validateClient(
  client: Client,
  taskIds: Set<string>,
  duplicateIds: string[]
): Client {
  const errors: FieldError[] = [];

  if (duplicateIds.includes(client.id)) {
    errors.push({
      field: 'id',
      message: `Duplicate ClientID found: ${client.id}`,
    });
  }

  if (client.priorityLevel < 1 || client.priorityLevel > 5) {
    errors.push({
      field: 'priorityLevel',
      message: 'Priority must be between 1 and 5.',
    });
  }

  const unknownTasks = client.requestedTaskIds.filter((id) => !taskIds.has(id));
  if (unknownTasks.length > 0) {
    errors.push({
      field: 'requestedTaskIds',
      message: `Requests unknown TaskIDs: ${unknownTasks.join(', ')}`,
    });
  }

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

  if (duplicateIds.includes(worker.id)) {
    errors.push({
      field: 'id',
      message: `Duplicate WorkerID found: ${worker.id}`,
    });
  }

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

  if (duplicateIds.includes(task.id)) {
    errors.push({ field: 'id', message: `Duplicate TaskID found: ${task.id}` });
  }

  if (task.duration < 1) {
    errors.push({
      field: 'duration',
      message: 'Duration must be at least 1 phase.',
    });
  }

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
