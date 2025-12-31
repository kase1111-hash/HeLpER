import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import type { Note } from '../types';
import { formatDateDisplay } from '../utils/date';

export type ExportFormat = 'markdown' | 'json';

interface ExportOptions {
  notes: Note[];
  format: ExportFormat;
  includeMetadata?: boolean;
}

function notesToMarkdown(notes: Note[], includeMetadata: boolean): string {
  if (notes.length === 0) {
    return '# Notes\n\nNo notes to export.';
  }

  const lines: string[] = ['# Notes Export', ''];

  // Group notes by date
  const notesByDate = new Map<string, Note[]>();
  for (const note of notes) {
    const dateNotes = notesByDate.get(note.date) || [];
    dateNotes.push(note);
    notesByDate.set(note.date, dateNotes);
  }

  // Sort dates in descending order
  const sortedDates = Array.from(notesByDate.keys()).sort((a, b) => b.localeCompare(a));

  for (const date of sortedDates) {
    const dateNotes = notesByDate.get(date) || [];
    lines.push(`## ${formatDateDisplay(date)}`);
    lines.push('');

    for (const note of dateNotes) {
      lines.push(note.content || '*Empty note*');
      if (includeMetadata) {
        lines.push('');
        lines.push(`> Created: ${new Date(note.createdAt).toLocaleString()}`);
        if (note.updatedAt !== note.createdAt) {
          lines.push(`> Updated: ${new Date(note.updatedAt).toLocaleString()}`);
        }
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function notesToJson(notes: Note[], includeMetadata: boolean): string {
  const exportData = notes.map(note => {
    if (includeMetadata) {
      return {
        id: note.id,
        date: note.date,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
    }
    return {
      date: note.date,
      content: note.content,
    };
  });

  return JSON.stringify(exportData, null, 2);
}

export async function exportNotes(options: ExportOptions): Promise<boolean> {
  const { notes, format, includeMetadata = true } = options;

  const content = format === 'markdown'
    ? notesToMarkdown(notes, includeMetadata)
    : notesToJson(notes, includeMetadata);

  const extension = format === 'markdown' ? 'md' : 'json';
  const defaultName = `notes-export-${new Date().toISOString().split('T')[0]}.${extension}`;

  const filePath = await save({
    defaultPath: defaultName,
    filters: format === 'markdown'
      ? [{ name: 'Markdown', extensions: ['md'] }]
      : [{ name: 'JSON', extensions: ['json'] }],
  });

  if (!filePath) {
    return false; // User cancelled
  }

  try {
    await writeTextFile(filePath, content);
    return true;
  } catch (error) {
    console.error('Failed to export notes:', error);
    throw error;
  }
}

export async function backupAllData(notes: Note[]): Promise<boolean> {
  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notes: notes,
  };

  const defaultName = `helper-backup-${new Date().toISOString().split('T')[0]}.json`;

  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: 'JSON Backup', extensions: ['json'] }],
  });

  if (!filePath) {
    return false;
  }

  try {
    await writeTextFile(filePath, JSON.stringify(backupData, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to backup data:', error);
    throw error;
  }
}
