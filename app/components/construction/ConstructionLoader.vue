<script setup lang="ts">
defineProps<{
  progress: number
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-500 ease-premium"
    leave-active-class="transition-opacity duration-700 ease-premium"
    leave-to-class="opacity-0"
  >
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-paper">
      <p class="eyebrow">Construyendo experiencia</p>
      <p class="font-display text-5xl tabular-nums text-ink md:text-6xl">
        {{ String(Math.round(progress * 100)).padStart(2, '0') }}%
      </p>
      <div class="h-px w-40 overflow-hidden bg-ink/10">
        <div
          class="h-full bg-clay transition-[width] duration-150 ease-linear"
          :style="{ width: `${progress * 100}%` }"
        />
      </div>
    </div>
  </Transition>
</template>
