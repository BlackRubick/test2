<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 40)

const links = [
  { label: 'Proyectos', href: '#propiedades' },
  { label: 'Nosotros', href: '#manifiesto' },
  { label: 'Contacto', href: '#contacto' }
]

const open = ref(false)
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium"
    :class="scrolled ? 'bg-paper/90 backdrop-blur-sm border-b border-ink/10' : 'bg-transparent'"
  >
    <div class="container-edge flex h-20 items-center justify-between">
      <NuxtLink to="/" class="font-display text-lg tracking-tight text-ink"> Terra </NuxtLink>

      <nav class="hidden items-center gap-10 md:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="eyebrow relative text-ink/70 transition-colors hover:text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-clay after:transition-all after:duration-300 hover:after:w-full"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="hidden md:block">
        <MagneticButton tag="a" href="#contacto" variant="ghost" class="!px-5 !py-2 text-xs">
          Iniciar proyecto
        </MagneticButton>
      </div>

      <button
        class="flex h-10 w-10 items-center justify-center md:hidden"
        aria-label="Abrir menú"
        @click="open = !open"
      >
        <span class="relative block h-4 w-5">
          <span
            class="absolute left-0 top-0 h-px w-full bg-ink transition-transform duration-300"
            :class="open ? 'translate-y-[7px] rotate-45' : ''"
          />
          <span
            class="absolute bottom-0 left-0 h-px w-full bg-ink transition-transform duration-300"
            :class="open ? '-translate-y-[7px] -rotate-45' : ''"
          />
        </span>
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-premium"
      leave-active-class="transition-all duration-200 ease-premium"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="open" class="border-t border-ink/10 bg-paper md:hidden">
        <nav class="container-edge flex flex-col gap-1 py-4">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="py-3 text-sm text-ink/80"
            @click="open = false"
          >
            {{ link.label }}
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>
