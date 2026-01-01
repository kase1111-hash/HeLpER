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
  ContentType,
  StoryMetadata,
  ArticleMetadata,
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
  contentType: ContentType,
  monetization: MonetizationModel,
  visibility: EntryVisibility,
  price?: number,
  journalContext?: JournalContext | null,
  storyMetadata?: StoryMetadata,
  articleMetadata?: ArticleMetadata
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
    contentType,
    monetization,
    price: monetization === 'per_entry' ? price : undefined,
    visibility,
    context,
    storyMetadata: contentType === 'story_chapter' ? storyMetadata : undefined,
    articleMetadata: contentType === 'article' ? articleMetadata : undefined,
    createdAt: note.createdAt,
  };
}

/**
 * Get content type label
 */
export function getContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    journal: 'Journal Entry',
    article: 'News Article',
    story_chapter: 'Story Chapter',
  };
  return labels[type];
}

/**
 * Get content type icon
 */
export function getContentTypeIcon(type: ContentType): string {
  const icons: Record<ContentType, string> = {
    journal: '📝',
    article: '📰',
    story_chapter: '📖',
  };
  return icons[type];
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
 * Detect content type from content using heuristics
 */
export function detectContentType(content: string): ContentType {
  const lowerContent = content.toLowerCase();

  // Story chapter indicators
  const storyIndicators = [
    'chapter',
    '"',
    'said',
    'walked',
    'looked at',
    'she thought',
    'he thought',
    'once upon',
    'to be continued',
    'the end',
  ];
  const storyScore = storyIndicators.filter((ind) => lowerContent.includes(ind)).length;

  // Article indicators
  const articleIndicators = [
    'according to',
    'reported',
    'announced',
    'sources say',
    'officials',
    'statement',
    'press release',
    'breaking:',
    'update:',
    'exclusive:',
    'investigation',
  ];
  const articleScore = articleIndicators.filter((ind) => lowerContent.includes(ind)).length;

  // Journal indicators
  const journalIndicators = [
    'today i',
    'this morning',
    'i feel',
    'i think',
    'grateful',
    'my day',
    'dear diary',
    'personal',
  ];
  const journalScore = journalIndicators.filter((ind) => lowerContent.includes(ind)).length;

  // Determine based on highest score
  if (storyScore >= 2 && storyScore > articleScore && storyScore > journalScore) {
    return 'story_chapter';
  }
  if (articleScore >= 2 && articleScore > journalScore) {
    return 'article';
  }
  return 'journal';
}

/**
 * Extract intent from note content using simple heuristics
 */
export function suggestIntent(content: string, contentType?: ContentType): string {
  const lowerContent = content.toLowerCase();
  const type = contentType || detectContentType(content);

  // Story chapter intents
  if (type === 'story_chapter') {
    if (lowerContent.includes('chapter 1') || lowerContent.includes('once upon')) {
      return 'Beginning a new serialized story for readers';
    }
    if (lowerContent.includes('to be continued') || lowerContent.includes('next time')) {
      return 'Continuing an ongoing narrative adventure';
    }
    if (lowerContent.includes('the end') || lowerContent.includes('conclusion')) {
      return 'Concluding a serialized story arc';
    }
    return 'Sharing the next chapter of an ongoing story';
  }

  // Article intents
  if (type === 'article') {
    if (lowerContent.includes('breaking') || lowerContent.includes('just in')) {
      return 'Reporting breaking news and developments';
    }
    if (lowerContent.includes('opinion') || lowerContent.includes('i believe')) {
      return 'Sharing opinion and editorial perspective';
    }
    if (lowerContent.includes('analysis') || lowerContent.includes('examining')) {
      return 'Providing in-depth analysis and context';
    }
    if (lowerContent.includes('review') || lowerContent.includes('rating')) {
      return 'Publishing a review and assessment';
    }
    if (lowerContent.includes('how to') || lowerContent.includes('tutorial')) {
      return 'Teaching through instructional content';
    }
    if (lowerContent.includes('interview') || lowerContent.includes('spoke with')) {
      return 'Sharing insights from an interview';
    }
    return 'Reporting news and informing readers';
  }

  // Journal intents (original logic)
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

/**
 * Get default tags for content type
 */
export function getDefaultTags(contentType: ContentType): string[] {
  const tags: Record<ContentType, string[]> = {
    journal: ['personal', 'reflection', 'diary'],
    article: ['news', 'journalism'],
    story_chapter: ['fiction', 'story', 'serialized'],
  };
  return tags[contentType];
}

/**
 * Extract chapter number from content
 */
export function extractChapterNumber(content: string): number | null {
  const patterns = [
    /chapter\s+(\d+)/i,
    /ch\.?\s*(\d+)/i,
    /part\s+(\d+)/i,
    /#(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}
