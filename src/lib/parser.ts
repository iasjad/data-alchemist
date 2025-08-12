import * as XLSX from 'xlsx';
import { Client, Worker, Task } from '@/types';

// No changes are needed for the helper functions below this line
// parsePhases, getDataTypeFromSheetName, transformRow
function parsePhases(input: any): number[] {
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

const getDataTypeFromSheetName = (
  name: string
): 'clients' | 'workers' | 'tasks' | null => {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes('client')) return 'clients';
  if (lowerCaseName.includes('worker')) return 'workers';
  if (lowerCaseName.includes('task')) return 'tasks';
  return null;
};

export function transformRow(
  row: any,
  dataType: 'clients' | 'workers' | 'tasks'
): Partial<Client | Worker | Task> {
  const transformed: any = {};
  transformed.id =
    row.ClientID ||
    row['Client ID'] ||
    row.WorkerID ||
    row['Worker ID'] ||
    row.TaskID ||
    row['Task ID'] ||
    row.id;
  transformed.name =
    row.ClientName ||
    row['Client Name'] ||
    row.WorkerName ||
    row['Worker Name'] ||
    row.TaskName ||
    row['Task Name'] ||
    row.name;

  if (dataType === 'clients') {
    if (row.PriorityLevel != null)
      transformed.priorityLevel = Number(row.PriorityLevel);
    if (row.RequestedTaskIDs)
      transformed.requestedTaskIds = String(row.RequestedTaskIDs)
        .split(',')
        .map((s) => s.trim());
    if (row.GroupTag) transformed.groupTag = row.GroupTag;
    if (row.AttributesJSON) {
      try {
        transformed.attributes = JSON.parse(row.AttributesJSON);
      } catch {
        transformed.attributes = row.AttributesJSON;
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
    if (row.WorkerGroup) transformed.workerGroup = row.WorkerGroup;
    if (row.QualificationLevel != null)
      transformed.qualificationLevel = Number(row.QualificationLevel);
  } else if (dataType === 'tasks') {
    if (row.Category) transformed.category = row.Category;
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

/**
 * NEW: A dedicated parser for single CSV or single-sheet files.
 * It simply parses the first sheet it finds without guessing the data type.
 */
export function parseSingleFile(file: File): Promise<any[]> {
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * This function is now used ONLY for the 'All-in-One' upload.
 */
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
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
