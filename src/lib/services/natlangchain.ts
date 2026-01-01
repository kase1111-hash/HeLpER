import { invoke } from '@tauri-apps/api/core';
import type {
  NatLangChainEntry,
  NatLangChainValidation,
  NatLangChainPublishResult,
  NatLangChainStats,
  Note,
  JournalContext,
  MonetizationModel,
  EntryVisibility,
} from '../types';

/**
 * Validate an entry before publishing
 */
export async function validateEntry(
  apiUrl: string,
  entry: NatLangChainEntry
): Promise<NatLangChainValidation | null> {
  try {
    return await invoke<NatLangChainValidation>('nlc_validate_entry', {
      apiUrl,
      entry,
    });
  } catch (error) {
    console.error('Failed to validate entry:', error);
    return null;
  }
}

/**
 * Publish an entry to NatLangChain
 */
export async function publishEntry(
  apiUrl: string,
  entry: NatLangChainEntry
): Promise<NatLangChainPublishResult> {
  try {
    return await invoke<NatLangChainPublishResult>('nlc_publish_entry', {
      apiUrl,
      entry,
    });
  } catch (error) {
    console.error('Failed to publish entry:', error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Get author stats from NatLangChain
 */
export async function getAuthorStats(
  apiUrl: string,
  authorId: string
): Promise<NatLangChainStats | null> {
  try {
    return await invoke<NatLangChainStats>('nlc_get_stats', {
      apiUrl,
      authorId,
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return null;
  }
}

/**
 * Check NatLangChain API connection
 */
export async function checkConnection(apiUrl: string): Promise<boolean> {
  try {
    return await invoke<boolean>('nlc_check_connection', { apiUrl });
  } catch (error) {
    console.error('Failed to check connection:', error);
    return false;
  }
}

/**
 * Convert a note to a NatLangChain entry
 */
export function noteToEntry(
  note: Note,
  author: string,
  intent: string,
  monetization: MonetizationModel,
  visibility: EntryVisibility,
  price?: number,
  journalContext?: JournalContext | null
): NatLangChainEntry {
  const context = journalContext
    ? {
        weather: journalContext.weather
          ? `${journalContext.weather.conditionText}, ${Math.round(journalContext.weather.tempCelsius)}°C`
          : undefined,
        location: journalContext.weather?.location,
        date: note.date,
        timeOfDay: journalContext.timeOfDay,
      }
    : undefined;

  return {
    author,
    content: note.content,
    intent,
    title: note.title || undefined,
    monetization,
    price: monetization === 'per_entry' ? price : undefined,
    visibility,
    context,
    createdAt: note.createdAt,
  };
}

/**
 * Get monetization label
 */
export function getMonetizationLabel(model: MonetizationModel): string {
  const labels: Record<MonetizationModel, string> = {
    free: 'Free',
    subscription: 'Subscribers Only',
    per_entry: 'Pay Per Entry',
    tip_jar: 'Tip Jar',
  };
  return labels[model];
}

/**
 * Get visibility label
 */
export function getVisibilityLabel(visibility: EntryVisibility): string {
  const labels: Record<EntryVisibility, string> = {
    public: 'Public',
    subscribers_only: 'Subscribers Only',
    private: 'Private (Draft)',
  };
  return labels[visibility];
}

/**
 * Format currency for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Extract intent from note content using simple heuristics
 */
export function suggestIntent(content: string): string {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('today i') || lowerContent.includes('this morning')) {
    return 'Sharing a daily journal entry and personal reflection';
  }
  if (lowerContent.includes('learned') || lowerContent.includes('realized')) {
    return 'Documenting a learning experience or insight';
  }
  if (lowerContent.includes('grateful') || lowerContent.includes('thankful')) {
    return 'Expressing gratitude and positive reflections';
  }
  if (lowerContent.includes('goal') || lowerContent.includes('plan to')) {
    return 'Setting intentions and goals for the future';
  }
  if (lowerContent.includes('struggle') || lowerContent.includes('difficult')) {
    return 'Processing challenges and seeking clarity';
  }

  return 'Sharing personal thoughts and experiences';
}
