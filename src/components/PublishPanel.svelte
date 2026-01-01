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
    formatPrice,
    suggestIntent,
  } from '../lib/services/natlangchain';
  import type { Note, MonetizationModel, EntryVisibility, NatLangChainValidation } from '../lib/types';

  export let note: Note;
  export let open = false;

  const dispatch = createEventDispatcher();

  // Form state
  let editedContent = '';
  let title = '';
  let intent = '';
  let tags = '';
  let monetization: MonetizationModel = 'free';
  let visibility: EntryVisibility = 'public';
  let price = 0;

  // UI state
  let validating = false;
  let publishing = false;
  let aiEditing = false;
  let validation: NatLangChainValidation | null = null;
  let activeTab: 'edit' | 'preview' | 'settings' = 'edit';

  // Initialize form when note changes
  $: if (note && open) {
    editedContent = note.content;
    title = note.title || '';
    intent = suggestIntent(note.content);
    monetization = $settings.natLangChain.defaultMonetization;
    visibility = $settings.natLangChain.defaultVisibility;
    price = $settings.natLangChain.defaultPrice;
    validation = null;
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
        monetization,
        visibility,
        price,
        $journalContext
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
        monetization,
        visibility,
        price,
        $journalContext
      );

      const result = await publishEntry($settings.natLangChain.apiUrl, entry);

      if (result.success) {
        showToast({ type: 'success', message: 'Published to NatLangChain!' });
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

    const prompts: Record<string, string> = {
      polish: `Polish this journal entry for publication. Make it more engaging while keeping the authentic voice. Keep it personal but publication-ready:\n\n${editedContent}`,
      clarify: `Clarify and improve the clarity of this journal entry. Make the intent clear while preserving the personal voice:\n\n${editedContent}`,
      expand: `Expand this journal entry with more detail and context. Add depth while keeping it authentic:\n\n${editedContent}`,
      summarize: `Create a concise version of this journal entry, keeping the key insights and personal touch:\n\n${editedContent}`,
    };

    aiEditing = true;
    try {
      const response = await sendChatMessage(
        $settings.ai.ollamaUrl,
        $settings.ai.model,
        [
          { role: 'system', content: 'You are a helpful writing assistant. Output only the improved text, no explanations.', timestamp: new Date().toISOString() },
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
      intent = suggestIntent(editedContent);
      return;
    }

    aiEditing = true;
    try {
      const response = await sendChatMessage(
        $settings.ai.ollamaUrl,
        $settings.ai.model,
        [
          { role: 'system', content: 'You suggest the intent of journal entries for blockchain publication. Be concise (1 sentence). Format: "Sharing..." or "Documenting..." or "Expressing..."', timestamp: new Date().toISOString() },
          { role: 'user', content: `What is the intent of this entry?\n\n${editedContent}`, timestamp: new Date().toISOString() },
        ],
        0.3,
        100
      );

      if (response) {
        intent = response.content.trim();
      }
    } catch (error) {
      intent = suggestIntent(editedContent);
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
          <span class="text-xl">📝</span>
          <div>
            <h2 class="text-lg font-semibold text-earth-50">Publish to NatLangChain</h2>
            <p class="text-xs text-earth-400">Monetize your journal entry on the blockchain</p>
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
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors"
          class:text-accent={activeTab === 'edit'}
          class:border-b-2={activeTab === 'edit'}
          class:border-accent={activeTab === 'edit'}
          class:text-earth-400={activeTab !== 'edit'}
        >
          Edit & AI Assist
        </button>
        <button
          on:click={() => (activeTab = 'preview')}
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors"
          class:text-accent={activeTab === 'preview'}
          class:border-b-2={activeTab === 'preview'}
          class:border-accent={activeTab === 'preview'}
          class:text-earth-400={activeTab !== 'preview'}
        >
          Preview
        </button>
        <button
          on:click={() => (activeTab = 'settings')}
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors"
          class:text-accent={activeTab === 'settings'}
          class:border-b-2={activeTab === 'settings'}
          class:border-accent={activeTab === 'settings'}
          class:text-earth-400={activeTab !== 'settings'}
        >
          Monetization
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5">
        {#if activeTab === 'edit'}
          <!-- Title -->
          <div class="mb-4">
            <label for="title" class="text-sm text-earth-200 block mb-1.5">Title (optional)</label>
            <input
              id="title"
              type="text"
              bind:value={title}
              class="input text-sm"
              placeholder="Give your entry a title..."
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
          <div>
            <label for="tags" class="text-sm text-earth-200 block mb-1.5">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              bind:value={tags}
              class="input text-sm"
              placeholder="personal, reflection, gratitude"
            />
          </div>

        {:else if activeTab === 'preview'}
          <!-- Blog Preview -->
          <div class="prose prose-invert max-w-none">
            <div class="border border-earth-600/50 rounded-lg p-6 bg-earth-850">
              {#if title}
                <h1 class="text-2xl font-bold text-earth-50 mb-2">{title}</h1>
              {/if}
              <div class="flex items-center gap-3 text-sm text-earth-400 mb-4">
                <span>By {$settings.natLangChain.authorName || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(note.date).toLocaleDateString()}</span>
                {#if monetization !== 'free'}
                  <span>•</span>
                  <span class="text-accent">{getMonetizationLabel(monetization)}</span>
                {/if}
              </div>
              {#if $journalContext?.weather}
                <div class="flex items-center gap-2 text-sm text-earth-500 mb-4 p-2 bg-earth-700/30 rounded">
                  <span>🌤️</span>
                  <span>{$journalContext.weather.conditionText}, {Math.round($journalContext.weather.tempCelsius)}°C</span>
                  <span>•</span>
                  <span>{$journalContext.dayOfWeek} {$journalContext.timeOfDay}</span>
                </div>
              {/if}
              <div class="text-earth-200 whitespace-pre-wrap leading-relaxed">
                {editedContent || 'No content yet...'}
              </div>
              {#if tags}
                <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-earth-600/50">
                  {#each tags.split(',').map(t => t.trim()).filter(Boolean) as tag}
                    <span class="px-2 py-0.5 bg-earth-700 rounded text-xs text-earth-300">#{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <!-- Validation Results -->
          {#if validation}
            <div class="mt-4 p-4 rounded-lg {validation.valid ? 'bg-green-900/20' : 'bg-yellow-900/20'}">
              <div class="flex items-center gap-2 mb-2">
                <span>{validation.valid ? '✅' : '⚠️'}</span>
                <span class="font-medium" class:text-green-400={validation.valid} class:text-yellow-400={!validation.valid}>
                  {validation.valid ? 'Ready to Publish' : 'Needs Attention'}
                </span>
              </div>
              <p class="text-sm text-earth-300">Clarity Score: {Math.round(validation.clarity_score * 100)}%</p>
              <p class="text-sm text-earth-400">Detected Intent: {validation.intent_detected}</p>
              {#if validation.suggestions?.length}
                <ul class="mt-2 text-sm text-earth-400 list-disc list-inside">
                  {#each validation.suggestions as suggestion}
                    <li>{suggestion}</li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}

        {:else if activeTab === 'settings'}
          <!-- Monetization Settings -->
          <div class="space-y-4">
            <div>
              <label for="monetization" class="text-sm text-earth-200 block mb-1.5">Monetization Model</label>
              <select
                id="monetization"
                bind:value={monetization}
                class="input text-sm"
              >
                <option value="free">Free - Anyone can read</option>
                <option value="subscription">Subscription - For your subscribers</option>
                <option value="per_entry">Pay Per Entry - One-time purchase</option>
                <option value="tip_jar">Tip Jar - Free with optional tips</option>
              </select>
            </div>

            {#if monetization === 'per_entry'}
              <div>
                <label for="price" class="text-sm text-earth-200 block mb-1.5">Price (USD)</label>
                <input
                  id="price"
                  type="number"
                  bind:value={price}
                  min="0"
                  step="0.01"
                  class="input text-sm"
                  placeholder="0.00"
                />
                <p class="text-xs text-earth-500 mt-1">Readers pay {formatPrice(price)} to access this entry</p>
              </div>
            {/if}

            <div>
              <label for="visibility" class="text-sm text-earth-200 block mb-1.5">Visibility</label>
              <select
                id="visibility"
                bind:value={visibility}
                class="input text-sm"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="subscribers_only">Subscribers Only</option>
                <option value="private">Private - Save as draft</option>
              </select>
            </div>

            <div class="pt-4 border-t border-earth-600/50">
              <h4 class="text-sm font-medium text-earth-200 mb-2">Context to Include</h4>
              <label class="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={$settings.natLangChain.includeWeatherContext}
                  on:change={() => {}}
                  class="rounded border-earth-500"
                />
                <span class="text-sm text-earth-300">Include weather context</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={$settings.natLangChain.includeLocationContext}
                  on:change={() => {}}
                  class="rounded border-earth-500"
                />
                <span class="text-sm text-earth-300">Include location</span>
              </label>
            </div>
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
</style>
