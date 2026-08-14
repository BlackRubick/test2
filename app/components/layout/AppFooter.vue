<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer id="contacto" class="bg-ink">
    <div class="container-edge py-24">
      <div class="grid gap-16 md:grid-cols-2">
        <div>
          <p class="eyebrow mb-6 !text-clay">Hablemos de tu proyecto</p>
          <RevealText as="h2" class="max-w-md text-4xl leading-[1.1] text-paper md:text-5xl">
            Cada terreno tiene una historia por construir.
          </RevealText>
          <div class="mt-10">
            <MagneticButton tag="a" href="mailto:hola@terra.studio" invert>
              Escríbenos
            </MagneticButton>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 text-sm md:justify-self-end">
          <div>
            <p class="eyebrow mb-4">Estudio</p>
            <a href="mailto:hola@terra.studio" class="footer-link block py-1 text-paper/70"
              >hola@terra.studio</a
            >
            <a href="tel:+525500000000" class="footer-link block py-1 text-paper/70"
              >+52 55 0000 0000</a
            >
            <p class="py-1 text-paper/70">Ciudad de México, MX</p>
          </div>
          <div>
            <p class="eyebrow mb-4">Redes</p>
            <a href="#" class="footer-link block py-1 text-paper/70">Instagram</a>
            <a href="#" class="footer-link block py-1 text-paper/70">LinkedIn</a>
            <a href="#" class="footer-link block py-1 text-paper/70">Pinterest</a>
          </div>
        </div>
      </div>

      <div
        class="mt-20 flex flex-col gap-4 border-t border-paper/15 pt-8 text-xs text-paper/50 md:flex-row md:items-center md:justify-between"
      >
        <p>© {{ year }} Terra Estudio. Todos los derechos reservados.</p>
        <p>Arquitectura residencial de autor.</p>
      </div>
    </div>
  </footer>
</template>
