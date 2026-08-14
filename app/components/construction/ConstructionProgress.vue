<script setup lang="ts">
defineProps<{
  label: string
  progress: number
}>()
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-10">
    <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/50 to-transparent" aria-hidden="true" />

    <div class="container-edge relative flex h-full flex-col justify-between py-8">
      <div class="flex items-baseline justify-between font-mono text-xs text-paper/85">
        <span>{{ label }}</span>
        <span class="eyebrow !text-paper/70">Terra — En construcción</span>
      </div>

      <div class="hidden h-24 w-px self-end bg-paper/25 md:block">
        <div
          class="w-full bg-clay transition-[height] duration-200 ease-linear"
          :style="{ height: `${progress * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>
