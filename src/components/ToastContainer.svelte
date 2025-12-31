<script lang="ts">
  import { toasts, dismissToast } from '../lib/stores/ui';
</script>

<div class="fixed bottom-14 right-4 z-50 space-y-2">
  {#each $toasts as toast (toast.id)}
    <div
      class="flex items-center gap-3 px-4 py-3 rounded-sleek shadow-elevated max-w-sm border animate-slide-up text-earth-50
        {toast.type === 'error' ? 'bg-error border-error/30' : ''}
        {toast.type === 'warning' ? 'bg-warning border-warning/30' : ''}
        {toast.type === 'success' ? 'bg-success border-success/30' : ''}
        {toast.type === 'info' ? 'bg-accent-muted border-accent/30' : ''}"
      role="alert"
    >
      <!-- Icon -->
      <div class="flex-shrink-0">
        {#if toast.type === 'error'}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        {:else if toast.type === 'warning'}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        {:else if toast.type === 'success'}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        {/if}
      </div>

      <!-- Message -->
      <p class="text-sm flex-1">{toast.message}</p>

      <!-- Dismiss Button -->
      <button
        on:click={() => dismissToast(toast.id)}
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>
