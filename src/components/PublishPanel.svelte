<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { settings } from '../lib/stores/settings';
  import { journalContext } from '../lib/stores/weather';
  import { showToast } from '../lib/stores/ui';
  import { sendChatMessage } from '../lib/services/tauri';
  import {
    validateEntry,
    publishEntry,
    noteToEntry,
    getMonetizationLabel,
    getVisibilityLabel,
    getContentTypeLabel,
    getContentTypeIcon,
    formatPrice,
    suggestIntent,
    detectContentType,
    getDefaultTags,
    extractChapterNumber,
  } from '../lib/services/natlangchain';
  import type {
    Note,
    MonetizationModel,
    EntryVisibility,
    NatLangChainValidation,
    ContentType,
    StoryMetadata,
    ArticleMetadata,
    ArticleCategory,
  } from '../lib/types';

  export let note: Note;
  export let open = false;

  const dispatch = createEventDispatcher();

  // Form state
  let editedContent = '';
  let title = '';
  let intent = '';
  let tags = '';
  let contentType: ContentType = 'journal';
  let monetization: MonetizationModel = 'free';
  let visibility: EntryVisibility = 'public';
  let price = 0;

  // Story metadata state
  let seriesTitle = '';
  let chapterNumber = 1;
  let totalChapters: number | undefined = undefined;
  let genre = 'fiction';
  let isOngoing = true;
  let synopsis = '';

  // Article metadata state
  let headline = '';
  let byline = '';
  let articleCategory: ArticleCategory = 'news';
  let subcategory = '';
  let dateline = '';
  let sources = '';
  let isBreaking = false;
  let isOpinion = false;
  let isAnalysis = false;

  // UI state
  let validating = false;
  let publishing = false;
  let aiEditing = false;
  let validation: NatLangChainValidation | null = null;
  let activeTab: 'edit' | 'publish' = 'edit';

  const genres = [
    'fiction',
    'fantasy',
    'science-fiction',
    'mystery',
    'romance',
    'thriller',
    'horror',
    'literary',
    'historical',
    'adventure',
  ];

  const articleCategories: ArticleCategory[] = [
    'news',
    'opinion',
    'analysis',
    'feature',
    'review',
    'tutorial',
    'interview',
    'other',
  ];

  // Initialize form when note changes
  $: if (note && open) {
    editedContent = note.content;
    title = note.title || '';
    contentType = detectContentType(note.content);
    intent = suggestIntent(note.content, contentType);
    tags = getDefaultTags(contentType).join(', ');
    monetization = $settings.natLangChain.defaultMonetization;
    visibility = $settings.natLangChain.defaultVisibility;
    price = $settings.natLangChain.defaultPrice;
    validation = null;

    // Auto-detect chapter number for stories
    if (contentType === 'story_chapter') {
      const detected = extractChapterNumber(note.content);
      if (detected) chapterNumber = detected;
    }

    // Use title as headline for articles
    if (contentType === 'article' && note.title) {
      headline = note.title;
    }
  }

  // Update intent when content type changes
  function handleContentTypeChange() {
    intent = suggestIntent(editedContent, contentType);
    tags = getDefaultTags(contentType).join(', ');
  }

  function handleClose() {
    open = false;
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Build metadata objects
  function buildStoryMetadata(): StoryMetadata | undefined {
    if (contentType !== 'story_chapter') return undefined;
    return {
      seriesTitle,
      chapterNumber,
      totalChapters: isOngoing ? undefined : totalChapters,
      genre,
      isOngoing,
      synopsis: chapterNumber === 1 ? synopsis : undefined,
    };
  }

  function buildArticleMetadata(): ArticleMetadata | undefined {
    if (contentType !== 'article') return undefined;
    return {
      headline: headline || title,
      byline: byline || undefined,
      category: articleCategory,
      subcategory: subcategory || undefined,
      dateline: dateline || undefined,
      sources: sources ? sources.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      isBreaking,
      isOpinion,
      isAnalysis,
    };
  }

  async function handleValidate() {
    if (!$settings.natLangChain.enabled || !$settings.natLangChain.apiUrl) {
      showToast({ type: 'error', message: 'NatLangChain not configured' });
      return;
    }

    validating = true;
    try {
      const entry = noteToEntry(
        { ...note, content: editedContent, title },
        $settings.natLangChain.authorId || 'anonymous',
        intent,
        contentType,
        monetization,
        visibility,
        price,
        $journalContext,
        buildStoryMetadata(),
        buildArticleMetadata()
      );

      validation = await validateEntry($settings.natLangChain.apiUrl, entry);

      if (validation?.valid) {
        showToast({ type: 'success', message: 'Entry validated successfully' });
      } else if (validation?.warnings?.length) {
        showToast({ type: 'warning', message: validation.warnings[0] });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Validation failed' });
    } finally {
      validating = false;
    }
  }

  async function handlePublish() {
    if (!$settings.natLangChain.enabled || !$settings.natLangChain.apiUrl) {
      showToast({ type: 'error', message: 'NatLangChain not configured' });
      return;
    }

    // Validate first if auto-audit enabled
    if ($settings.natLangChain.autoAuditBeforePublish && !validation?.valid) {
      await handleValidate();
      if (!validation?.valid) {
        showToast({ type: 'warning', message: 'Please address validation issues before publishing' });
        return;
      }
    }

    publishing = true;
    try {
      const entry = noteToEntry(
        { ...note, content: editedContent, title },
        $settings.natLangChain.authorId || $settings.natLangChain.authorName || 'anonymous',
        intent,
        contentType,
        monetization,
        visibility,
        price,
        $journalContext,
        buildStoryMetadata(),
        buildArticleMetadata()
      );

      const result = await publishEntry($settings.natLangChain.apiUrl, entry);

      if (result.success) {
        const typeLabel = getContentTypeLabel(contentType);
        showToast({ type: 'success', message: `${typeLabel} published to NatLangChain!` });
        handleClose();
      } else {
        showToast({ type: 'error', message: result.error || 'Failed to publish' });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to publish entry' });
    } finally {
      publishing = false;
    }
  }

  async function handleAIEdit(action: 'polish' | 'clarify' | 'expand' | 'summarize') {
    if (!$settings.ai.ollamaUrl) {
      showToast({ type: 'error', message: 'AI not configured' });
      return;
    }

    // Content-type-specific prompts
    const promptsByType: Record<ContentType, Record<string, string>> = {
      journal: {
        polish: `Polish this journal entry for publication. Make it more engaging while keeping the authentic voice. Keep it personal but publication-ready:\n\n${editedContent}`,
        clarify: `Clarify and improve the clarity of this journal entry. Make the intent clear while preserving the personal voice:\n\n${editedContent}`,
        expand: `Expand this journal entry with more detail and context. Add depth while keeping it authentic:\n\n${editedContent}`,
        summarize: `Create a concise version of this journal entry, keeping the key insights and personal touch:\n\n${editedContent}`,
      },
      article: {
        polish: `Polish this news article for publication. Ensure it follows journalistic standards with clear, objective language. Maintain factual accuracy and proper attribution:\n\n${editedContent}`,
        clarify: `Improve the clarity of this article. Ensure the lead paragraph captures the key points. Make facts and sources clear:\n\n${editedContent}`,
        expand: `Expand this article with additional context, background information, and analysis. Add relevant details that inform readers:\n\n${editedContent}`,
        summarize: `Create a concise summary of this article suitable for a news brief. Capture the essential who, what, when, where, why:\n\n${editedContent}`,
      },
      story_chapter: {
        polish: `Polish this story chapter for publication. Enhance the prose, improve pacing, and strengthen the narrative voice while preserving the story:\n\n${editedContent}`,
        clarify: `Improve the clarity of this story chapter. Ensure character motivations are clear and scenes are well-described. Maintain narrative flow:\n\n${editedContent}`,
        expand: `Expand this story chapter with richer descriptions, deeper character development, and more atmospheric detail:\n\n${editedContent}`,
        summarize: `Create a more concise version of this chapter, tightening the prose while keeping key plot points and emotional beats:\n\n${editedContent}`,
      },
    };

    const prompts = promptsByType[contentType];

    aiEditing = true;
    try {
      const systemPrompts: Record<ContentType, string> = {
        journal: 'You are a helpful writing assistant for personal journals. Output only the improved text, no explanations.',
        article: 'You are an experienced news editor. Output only the improved article text, no explanations.',
        story_chapter: 'You are a fiction editor specializing in serialized stories. Output only the improved text, no explanations.',
      };

      const response = await sendChatMessage(
        $settings.ai.ollamaUrl,
        $settings.ai.model,
        [
          { role: 'system', content: systemPrompts[contentType], timestamp: new Date().toISOString() },
          { role: 'user', content: prompts[action], timestamp: new Date().toISOString() },
        ],
        $settings.ai.temperature,
        $settings.ai.maxTokens
      );

      if (response) {
        editedContent = response.content;
        showToast({ type: 'success', message: 'AI edit applied' });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'AI editing failed' });
    } finally {
      aiEditing = false;
    }
  }

  async function handleSuggestIntent() {
    if (!$settings.ai.ollamaUrl) {
      intent = suggestIntent(editedContent, contentType);
      return;
    }

    const systemPromptsByType: Record<ContentType, string> = {
      journal: 'You suggest the intent of journal entries for blockchain publication. Be concise (1 sentence). Format: "Sharing..." or "Documenting..." or "Expressing..."',
      article: 'You suggest the intent of news articles for blockchain publication. Be concise (1 sentence). Format: "Reporting..." or "Analyzing..." or "Investigating..."',
      story_chapter: 'You suggest the intent of story chapters for blockchain publication. Be concise (1 sentence). Format: "Beginning..." or "Continuing..." or "Concluding..."',
    };

    const typeLabels: Record<ContentType, string> = {
      journal: 'journal entry',
      article: 'news article',
      story_chapter: 'story chapter',
    };

    aiEditing = true;
    try {
      const response = await sendChatMessage(
        $settings.ai.ollamaUrl,
        $settings.ai.model,
        [
          { role: 'system', content: systemPromptsByType[contentType], timestamp: new Date().toISOString() },
          { role: 'user', content: `What is the intent of this ${typeLabels[contentType]}?\n\n${editedContent}`, timestamp: new Date().toISOString() },
        ],
        0.3,
        100
      );

      if (response) {
        intent = response.content.trim();
      }
    } catch (error) {
      intent = suggestIntent(editedContent, contentType);
    } finally {
      aiEditing = false;
    }
  }

  $: wordCount = editedContent.split(/\s+/).filter(Boolean).length;
  $: charCount = editedContent.length;
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 bg-earth-950/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    on:click={handleBackdropClick}
  >
    <div class="bg-earth-800 rounded-sleek shadow-elevated w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden border border-earth-600/50 animate-slide-up flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-earth-600/50">
        <div class="flex items-center gap-3">
          <span class="text-xl">{getContentTypeIcon(contentType)}</span>
          <div>
            <h2 class="text-lg font-semibold text-earth-50">Publish to NatLangChain</h2>
            <p class="text-xs text-earth-400">Monetize your {getContentTypeLabel(contentType).toLowerCase()} on the blockchain</p>
          </div>
        </div>
        <button
          on:click={handleClose}
          class="w-8 h-8 flex items-center justify-center rounded-md text-earth-400 hover:bg-earth-600 hover:text-earth-100 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-earth-600/50">
        <button
          on:click={() => (activeTab = 'edit')}
          class="flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          class:text-accent={activeTab === 'edit'}
          class:border-b-2={activeTab === 'edit'}
          class:border-accent={activeTab === 'edit'}
          class:text-earth-400={activeTab !== 'edit'}
        >
          <span>📝</span> Edit & Prepare
        </button>
        <button
          on:click={() => (activeTab = 'publish')}
          class="flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          class:text-accent={activeTab === 'publish'}
          class:border-b-2={activeTab === 'publish'}
          class:border-accent={activeTab === 'publish'}
          class:text-earth-400={activeTab !== 'publish'}
        >
          <span>⛓️</span> Publish on Chain
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5">
        {#if activeTab === 'edit'}
          <!-- Content Type Selector -->
          <div class="mb-4">
            <label class="text-sm text-earth-200 block mb-2">Content Type</label>
            <div class="flex gap-2">
              <button
                on:click={() => { contentType = 'journal'; handleContentTypeChange(); }}
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all"
                class:bg-accent={contentType === 'journal'}
                class:text-earth-900={contentType === 'journal'}
                class:bg-earth-700={contentType !== 'journal'}
                class:text-earth-300={contentType !== 'journal'}
                class:hover:bg-earth-600={contentType !== 'journal'}
              >
                <span>📝</span> Journal
              </button>
              <button
                on:click={() => { contentType = 'article'; handleContentTypeChange(); }}
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all"
                class:bg-accent={contentType === 'article'}
                class:text-earth-900={contentType === 'article'}
                class:bg-earth-700={contentType !== 'article'}
                class:text-earth-300={contentType !== 'article'}
                class:hover:bg-earth-600={contentType !== 'article'}
              >
                <span>📰</span> Article
              </button>
              <button
                on:click={() => { contentType = 'story_chapter'; handleContentTypeChange(); }}
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all"
                class:bg-accent={contentType === 'story_chapter'}
                class:text-earth-900={contentType === 'story_chapter'}
                class:bg-earth-700={contentType !== 'story_chapter'}
                class:text-earth-300={contentType !== 'story_chapter'}
                class:hover:bg-earth-600={contentType !== 'story_chapter'}
              >
                <span>📖</span> Story
              </button>
            </div>
          </div>

          <!-- Title -->
          <div class="mb-4">
            <label for="title" class="text-sm text-earth-200 block mb-1.5">
              {contentType === 'article' ? 'Headline' : contentType === 'story_chapter' ? 'Chapter Title' : 'Title'} (optional)
            </label>
            <input
              id="title"
              type="text"
              bind:value={title}
              class="input text-sm"
              placeholder={contentType === 'article' ? 'Enter headline...' : contentType === 'story_chapter' ? 'Chapter title...' : 'Give your entry a title...'}
            />
          </div>

          <!-- Content Editor -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <label for="content" class="text-sm text-earth-200">Content</label>
              <span class="text-xs text-earth-500">{wordCount} words, {charCount} chars</span>
            </div>
            <textarea
              id="content"
              bind:value={editedContent}
              class="input text-sm min-h-[200px] resize-y"
              placeholder="Your journal entry..."
            ></textarea>
          </div>

          <!-- AI Editing Tools -->
          <div class="mb-4">
            <p class="text-xs text-earth-400 mb-2">AI Editing Assistance</p>
            <div class="flex flex-wrap gap-2">
              <button
                on:click={() => handleAIEdit('polish')}
                disabled={aiEditing}
                class="btn btn-secondary text-xs px-3 py-1.5"
              >
                ✨ Polish
              </button>
              <button
                on:click={() => handleAIEdit('clarify')}
                disabled={aiEditing}
                class="btn btn-secondary text-xs px-3 py-1.5"
              >
                🔍 Clarify
              </button>
              <button
                on:click={() => handleAIEdit('expand')}
                disabled={aiEditing}
                class="btn btn-secondary text-xs px-3 py-1.5"
              >
                📝 Expand
              </button>
              <button
                on:click={() => handleAIEdit('summarize')}
                disabled={aiEditing}
                class="btn btn-secondary text-xs px-3 py-1.5"
              >
                📋 Summarize
              </button>
            </div>
            {#if aiEditing}
              <p class="text-xs text-accent mt-2 animate-pulse">AI is editing...</p>
            {/if}
          </div>

          <!-- Intent -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <label for="intent" class="text-sm text-earth-200">Intent</label>
              <button
                on:click={handleSuggestIntent}
                disabled={aiEditing}
                class="text-xs text-accent hover:underline"
              >
                Suggest with AI
              </button>
            </div>
            <input
              id="intent"
              type="text"
              bind:value={intent}
              class="input text-sm"
              placeholder="What's the purpose of sharing this entry?"
            />
            <p class="text-xs text-earth-500 mt-1">This helps readers understand your entry's purpose</p>
          </div>

          <!-- Tags -->
          <div class="mb-4">
            <label for="tags" class="text-sm text-earth-200 block mb-1.5">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              bind:value={tags}
              class="input text-sm"
              placeholder="personal, reflection, gratitude"
            />
          </div>

          <!-- Story-specific metadata -->
          {#if contentType === 'story_chapter'}
            <div class="p-4 bg-earth-700/30 rounded-lg space-y-4">
              <h4 class="text-sm font-medium text-earth-200 flex items-center gap-2">
                <span>📖</span> Story Details
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="seriesTitle" class="text-xs text-earth-300 block mb-1">Series Title</label>
                  <input
                    id="seriesTitle"
                    type="text"
                    bind:value={seriesTitle}
                    class="input text-sm"
                    placeholder="My Story Series"
                  />
                </div>
                <div>
                  <label for="genre" class="text-xs text-earth-300 block mb-1">Genre</label>
                  <select id="genre" bind:value={genre} class="input text-sm">
                    {#each genres as g}
                      <option value={g}>{g.charAt(0).toUpperCase() + g.slice(1).replace('-', ' ')}</option>
                    {/each}
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label for="chapterNumber" class="text-xs text-earth-300 block mb-1">Chapter #</label>
                  <input
                    id="chapterNumber"
                    type="number"
                    bind:value={chapterNumber}
                    min="1"
                    class="input text-sm"
                  />
                </div>
                <div>
                  <label for="totalChapters" class="text-xs text-earth-300 block mb-1">Total Chapters</label>
                  <input
                    id="totalChapters"
                    type="number"
                    bind:value={totalChapters}
                    min="1"
                    disabled={isOngoing}
                    class="input text-sm"
                    placeholder="?"
                  />
                </div>
                <div class="flex items-end">
                  <label class="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" bind:checked={isOngoing} class="rounded border-earth-500" />
                    <span class="text-xs text-earth-300">Ongoing</span>
                  </label>
                </div>
              </div>
              {#if chapterNumber === 1}
                <div>
                  <label for="synopsis" class="text-xs text-earth-300 block mb-1">Story Synopsis (for first chapter)</label>
                  <textarea
                    id="synopsis"
                    bind:value={synopsis}
                    class="input text-sm min-h-[60px] resize-y"
                    placeholder="Brief story description for readers..."
                  ></textarea>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Article-specific metadata -->
          {#if contentType === 'article'}
            <div class="p-4 bg-earth-700/30 rounded-lg space-y-4">
              <h4 class="text-sm font-medium text-earth-200 flex items-center gap-2">
                <span>📰</span> Article Details
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="articleCategory" class="text-xs text-earth-300 block mb-1">Category</label>
                  <select id="articleCategory" bind:value={articleCategory} class="input text-sm">
                    {#each articleCategories as cat}
                      <option value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="subcategory" class="text-xs text-earth-300 block mb-1">Subcategory</label>
                  <input
                    id="subcategory"
                    type="text"
                    bind:value={subcategory}
                    class="input text-sm"
                    placeholder="e.g., Technology, Politics"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="byline" class="text-xs text-earth-300 block mb-1">Byline (additional info)</label>
                  <input
                    id="byline"
                    type="text"
                    bind:value={byline}
                    class="input text-sm"
                    placeholder="e.g., Senior Correspondent"
                  />
                </div>
                <div>
                  <label for="dateline" class="text-xs text-earth-300 block mb-1">Dateline (location)</label>
                  <input
                    id="dateline"
                    type="text"
                    bind:value={dateline}
                    class="input text-sm"
                    placeholder="e.g., New York"
                  />
                </div>
              </div>
              <div>
                <label for="sources" class="text-xs text-earth-300 block mb-1">Sources (comma-separated)</label>
                <input
                  id="sources"
                  type="text"
                  bind:value={sources}
                  class="input text-sm"
                  placeholder="e.g., Official statement, Interview with..."
                />
              </div>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" bind:checked={isBreaking} class="rounded border-earth-500" />
                  <span class="text-xs text-earth-300">Breaking News</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" bind:checked={isOpinion} class="rounded border-earth-500" />
                  <span class="text-xs text-earth-300">Opinion Piece</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" bind:checked={isAnalysis} class="rounded border-earth-500" />
                  <span class="text-xs text-earth-300">Analysis</span>
                </label>
              </div>
            </div>
          {/if}

        {:else if activeTab === 'publish'}
          <!-- Monetization Settings (compact) -->
          <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-earth-700/30 rounded-lg">
            <div>
              <label for="monetization" class="text-xs text-earth-300 block mb-1">Monetization</label>
              <select id="monetization" bind:value={monetization} class="input text-sm">
                <option value="free">Free</option>
                <option value="subscription">Subscribers Only</option>
                <option value="per_entry">Pay Per Entry</option>
                <option value="tip_jar">Tip Jar</option>
              </select>
            </div>
            <div>
              <label for="visibility" class="text-xs text-earth-300 block mb-1">Visibility</label>
              <select id="visibility" bind:value={visibility} class="input text-sm">
                <option value="public">Public</option>
                <option value="subscribers_only">Subscribers Only</option>
                <option value="private">Draft</option>
              </select>
            </div>
            {#if monetization === 'per_entry'}
              <div class="col-span-2">
                <label for="price" class="text-xs text-earth-300 block mb-1">Price (USD)</label>
                <input
                  id="price"
                  type="number"
                  bind:value={price}
                  min="0"
                  step="0.01"
                  class="input text-sm w-32"
                  placeholder="0.00"
                />
              </div>
            {/if}
          </div>

          <!-- Preview -->
          <div class="border border-earth-600/50 rounded-lg p-5 bg-earth-850 mb-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">{getContentTypeIcon(contentType)}</span>
              <span class="text-xs text-earth-500 uppercase tracking-wide">{getContentTypeLabel(contentType)}</span>
              {#if monetization !== 'free'}
                <span class="text-xs text-accent ml-auto">{getMonetizationLabel(monetization)}</span>
              {/if}
            </div>

            {#if title}
              <h2 class="text-xl font-bold text-earth-50 mb-2">{title}</h2>
            {/if}

            <div class="flex items-center gap-2 text-xs text-earth-400 mb-3">
              <span>{$settings.natLangChain.authorName || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(note.date).toLocaleDateString()}</span>
              {#if contentType === 'story_chapter' && seriesTitle}
                <span>•</span>
                <span>{seriesTitle} Ch.{chapterNumber}</span>
              {/if}
            </div>

            {#if $journalContext?.weather}
              <div class="text-xs text-earth-500 mb-3">
                🌤️ {$journalContext.weather.conditionText}, {Math.round($journalContext.weather.tempCelsius)}°C
              </div>
            {/if}

            <div class="text-earth-200 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6">
              {editedContent || 'No content...'}
            </div>

            {#if tags}
              <div class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-earth-600/30">
                {#each tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5) as tag}
                  <span class="px-1.5 py-0.5 bg-earth-700 rounded text-xs text-earth-400">#{tag}</span>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Validation Results -->
          {#if validation}
            <div class="p-4 rounded-lg mb-4 {validation.valid ? 'bg-green-900/20' : 'bg-yellow-900/20'}">
              <div class="flex items-center gap-2 mb-2">
                <span>{validation.valid ? '✅' : '⚠️'}</span>
                <span class="text-sm font-medium" class:text-green-400={validation.valid} class:text-yellow-400={!validation.valid}>
                  {validation.valid ? 'Ready to Publish' : 'Needs Attention'}
                </span>
                <span class="text-xs text-earth-500 ml-auto">Clarity: {Math.round(validation.clarity_score * 100)}%</span>
              </div>
              {#if validation.suggestions?.length}
                <ul class="text-xs text-earth-400 list-disc list-inside">
                  {#each validation.suggestions.slice(0, 3) as suggestion}
                    <li>{suggestion}</li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}

          <!-- Intent display -->
          <div class="text-xs text-earth-500 italic">
            Intent: {intent}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-5 py-4 border-t border-earth-600/50 bg-earth-800/50">
        <button
          on:click={handleValidate}
          disabled={validating || publishing}
          class="btn btn-secondary text-sm"
        >
          {validating ? 'Validating...' : '🔍 Validate'}
        </button>
        <div class="flex gap-2">
          <button on:click={handleClose} class="btn btn-secondary text-sm">Cancel</button>
          <button
            on:click={handlePublish}
            disabled={publishing || validating || !editedContent.trim()}
            class="btn btn-primary text-sm"
          >
            {publishing ? 'Publishing...' : '🚀 Publish'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .prose {
    color: theme('colors.earth.200');
  }
  .bg-earth-850 {
    background-color: rgb(35 30 25);
  }
  .line-clamp-6 {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
