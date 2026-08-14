<script setup lang="ts">
const stats = [
  { value: 18, suffix: '', label: 'Proyectos entregados' },
  { value: 42000, suffix: ' m²', label: 'Construidos' },
  { value: 9, suffix: ' años', label: 'De trayectoria' }
]
</script>

<template>
  <section id="manifiesto" class="border-t-2 border-ink bg-paper-dim">
    <div class="container-edge py-28 md:py-32">
      <p class="eyebrow mb-6 !text-clay">Manifiesto</p>
      <RevealText as="p" class="max-w-3xl font-display text-3xl leading-[1.3] text-ink md:text-4xl">
        No construimos casas. Construimos la evidencia de una decisión bien tomada: dónde vivir,
        con qué materiales, mirando hacia dónde.
      </RevealText>

      <div class="mt-20 grid grid-cols-1 divide-y hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <StatCounter
          v-for="stat in stats"
          :key="stat.label"
          v-bind="stat"
          class="py-8 first:pt-0 sm:px-10 sm:py-0 sm:first:pl-0"
        />
      </div>
    </div>
  </section>
</template>
