<script setup lang="ts">
withDefaults(
  defineProps<{
    tag?: 'button' | 'a'
    href?: string
    variant?: 'solid' | 'ghost'
    /** Use on dark backgrounds — swaps the palette instead of fighting it with class overrides. */
    invert?: boolean
  }>(),
  { tag: 'button', variant: 'solid', invert: false }
)

const el = ref<HTMLElement | null>(null)
useMagneticHover(el)
</script>

<template>
  <component
    :is="tag"
    ref="el"
    :href="tag === 'a' ? href : undefined"
    class="group relative inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm tracking-wide transition-colors duration-500 ease-premium"
    :class="
      variant === 'solid'
        ? invert
          ? 'bg-paper text-ink hover:bg-clay hover:text-paper'
          : 'bg-ink text-paper hover:bg-clay'
        : invert
          ? 'border border-paper/30 text-paper hover:border-paper'
          : 'border border-ink/25 text-ink hover:border-ink'
    "
  >
    <slot />
    <span
      class="inline-block h-[6px] w-[6px] rounded-full bg-current transition-transform duration-500 ease-premium group-hover:translate-x-1"
      aria-hidden="true"
    />
  </component>
</template>
