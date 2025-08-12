import * as XLSX from 'xlsx';
import { Client, Worker, Task } from '@/types';

// This helper function remains the same.
function parsePhases(input: unknown): number[] {
  const strInput = String(input).trim();
  if (strInput.startsWith('[') && strInput.endsWith(']')) {
    try {
      return JSON.parse(strInput.replace(/'/g, '"'));
    } catch {
      return [];
    }
  }
  if (strInput.includes('-')) {
    const parts = strInput.split('-').map((p) => parseInt(p.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [start, end] = parts;
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }
  const singleNumber = parseInt(strInput, 10);
  if (!isNaN(singleNumber)) {
    return [singleNumber];
  }
  return [];
}

// This helper function remains the same.
const getDataTypeFromSheetName = (
  name: string
): 'clients' | 'workers' | 'tasks' | null => {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes('client')) return 'clients';
  if (lowerCaseName.includes('worker')) return 'workers';
  if (lowerCaseName.includes('task')) return 'tasks';
  return null;
};

// This helper function is now more type-safe.
export function transformRow(
  row: Record<string, unknown>,
  dataType: 'clients' | 'workers' | 'tasks'
): Partial<Client | Worker | Task> {
  // Use a Partial type for better type safety instead of 'any'
  const transformed: Partial<Client & Worker & Task> = {};

  transformed.id = String(
    row.ClientID ||
      row['Client ID'] ||
      row.WorkerID ||
      row['Worker ID'] ||
      row.TaskID ||
      row['Task ID'] ||
      row.id ||
      ''
  );
  transformed.name = String(
    row.ClientName ||
      row['Client Name'] ||
      row.WorkerName ||
      row['Worker Name'] ||
      row.TaskName ||
      row['Task Name'] ||
      row.name ||
      ''
  );

  if (dataType === 'clients') {
    if (row.PriorityLevel != null)
      transformed.priorityLevel = Number(row.PriorityLevel);
    if (row.RequestedTaskIDs)
      transformed.requestedTaskIds = String(row.RequestedTaskIDs)
        .split(',')
        .map((s) => s.trim());
    if (row.GroupTag) transformed.groupTag = String(row.GroupTag);
    if (row.AttributesJSON) {
      try {
        // FIX: Ensure the value passed to JSON.parse is a string.
        transformed.attributes = JSON.parse(String(row.AttributesJSON));
      } catch {
        transformed.attributes = String(row.AttributesJSON);
      }
    }
  } else if (dataType === 'workers') {
    if (row.Skills)
      transformed.skills = String(row.Skills)
        .split(',')
        .map((s) => s.trim());
    if (row.AvailableSlots)
      transformed.availableSlots = parsePhases(row.AvailableSlots);
    if (row.MaxLoadPerPhase != null)
      transformed.maxLoadPerPhase = Number(row.MaxLoadPerPhase);
    if (row.WorkerGroup) transformed.workerGroup = String(row.WorkerGroup);
    if (row.QualificationLevel != null)
      transformed.qualificationLevel = Number(row.QualificationLevel);
  } else if (dataType === 'tasks') {
    if (row.Category) transformed.category = String(row.Category);
    if (row.Duration != null) transformed.duration = Number(row.Duration);
    if (row.RequiredSkills)
      transformed.requiredSkills = String(row.RequiredSkills)
        .split(',')
        .map((s) => s.trim());
    if (row.PreferredPhases)
      transformed.preferredPhases = parsePhases(row.PreferredPhases);
    if (row.MaxConcurrent != null)
      transformed.maxConcurrent = Number(row.MaxConcurrent);
  }
  return transformed;
}

export function parseSingleFile(
  file: File
): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) return reject(new Error('File is empty.'));
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName)
          return reject(new Error('No sheets found in file.'));
        const worksheet = workbook.Sheets[firstSheetName];
        // FIX: Assert the type of the parsed JSON data.
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
          string,
          unknown
        >[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function parseWorkbook(
  file: File
): Promise<{ clients: Client[]; workers: Worker[]; tasks: Task[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) return reject(new Error('File is empty.'));
        const workbook = XLSX.read(data, { type: 'array' });
        let clients: Client[] = [],
          workers: Worker[] = [],
          tasks: Task[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const dataType = getDataTypeFromSheetName(sheetName);
          if (!dataType) return;
          const worksheet = workbook.Sheets[sheetName];
          // FIX: Assert the type here as well. This fixes the error in the .map() call.
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
            string,
            unknown
          >[];
          const cleanedData = jsonData
            .map((row) => transformRow(row, dataType))
            .filter((obj) => obj && obj.id);
          if (dataType === 'clients') clients = cleanedData as Client[];
          if (dataType === 'workers') workers = cleanedData as Worker[];
          if (dataType === 'tasks') tasks = cleanedData as Task[];
        });
        resolve({ clients, workers, tasks });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
