<script setup lang="ts">
import { properties } from '~/data/properties'
</script>

<template>
  <section id="propiedades" class="container-edge py-24">
    <div class="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="eyebrow mb-4 !text-clay">Proyectos</p>
        <RevealText as="h2" class="max-w-xl text-4xl leading-[1.1] text-ink md:text-5xl">
          Cada propiedad es la conclusión de un proceso, no un producto de catálogo.
        </RevealText>
      </div>
      <p class="max-w-xs text-sm text-ink/60">
        {{ properties.length }} proyectos residenciales en desarrollo activo.
      </p>
    </div>

    <div>
      <PropertyEntry
        v-for="(property, index) in properties"
        :id="property.slug"
        :key="property.slug"
        :property="property"
        :index="index"
      />
    </div>
  </section>
</template>
