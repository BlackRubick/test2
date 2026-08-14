<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-1000 ease-premium"
    enter-from-class="opacity-0 translate-y-6"
    leave-active-class="transition-all duration-300 ease-premium"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-ink/85 via-ink/55 to-transparent px-6 pb-16 pt-32 text-center"
    >
      <p class="eyebrow !text-clay">Proyecto destacado</p>
      <h3 class="font-display text-3xl text-paper md:text-4xl">Altiplano House</h3>
      <p class="text-sm text-paper/75">Valle de Bravo · 320 m² · 4 habitaciones · Desde $480,000</p>
      <MagneticButton tag="a" href="#propiedades" invert>Explorar proyecto</MagneticButton>
    </div>
  </Transition>
</template>
