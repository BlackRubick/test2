<script setup lang="ts">
import type { Property } from '~/data/properties'
import { formatPrice } from '~/data/properties'

const props = defineProps<{
  property: Property
  index: number
}>()

const hovered = ref(false)
</script>

<template>
  <article
    class="group relative grid min-h-[85vh] grid-cols-1 items-center gap-8 border-t hairline py-14 md:grid-cols-12 md:gap-4"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <span
      class="font-display text-2xl text-clay/70 md:col-span-1"
      aria-hidden="true"
    >
      {{ String(props.index + 1).padStart(2, '0') }}
    </span>

    <div
      class="relative overflow-hidden shadow-none transition-shadow duration-500 ease-premium md:col-span-7"
      :class="hovered ? 'shadow-2xl shadow-ink/20' : ''"
    >
      <div class="relative aspect-[4/3] w-full overflow-hidden bg-paper-dim">
        <img
          :src="property.images[0]"
          :alt="`${property.name} — ${property.location}`"
          class="absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1200ms] ease-premium"
          :class="hovered ? 'scale-[1.04] opacity-0' : 'scale-100 opacity-100'"
          loading="lazy"
          width="800"
          height="600"
        />
        <img
          v-if="property.images[1]"
          :src="property.images[1]"
          :alt="`${property.name} — ${property.location}, vista alterna`"
          class="absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1200ms] ease-premium"
          :class="hovered ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-0'"
          loading="lazy"
          width="800"
          height="600"
        />
      </div>
      <div
        class="absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-500 ease-premium"
        :class="hovered ? 'opacity-100' : ''"
      >
        <span class="eyebrow !text-paper">{{ property.year }} · {{ property.areaM2 }} m²</span>
      </div>
    </div>

    <div class="md:col-span-4 md:col-start-9">
      <h3 class="font-display text-3xl leading-tight text-ink md:text-4xl">
        {{ property.name }}
      </h3>
      <p class="eyebrow mt-3">{{ property.location }}</p>
      <p class="mt-6 max-w-sm text-sm leading-relaxed text-ink/70">
        {{ property.description }}
      </p>

      <dl class="mt-8 grid grid-cols-3 gap-4 border-t hairline pt-6 text-xs">
        <div>
          <dt class="text-stone">Superficie</dt>
          <dd class="mt-1 text-ink">{{ property.areaM2 }} m²</dd>
        </div>
        <div>
          <dt class="text-stone">Habitaciones</dt>
          <dd class="mt-1 text-ink">{{ property.bedrooms }}</dd>
        </div>
        <div>
          <dt class="text-stone">Desde</dt>
          <dd class="mt-1 text-ink">{{ formatPrice(property.priceFrom, property.currency) }}</dd>
        </div>
      </dl>

      <div class="mt-8">
        <MagneticButton tag="a" :href="`#${property.slug}`" variant="ghost" class="!px-5 !py-2 text-xs">
          Ver proyecto
        </MagneticButton>
      </div>
    </div>
  </article>
</template>
