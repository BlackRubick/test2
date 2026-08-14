<template>
  <div class="flex flex-col items-center gap-3 text-stone">
    <span class="eyebrow">Desplázate</span>
    <span class="relative block h-12 w-px overflow-hidden bg-stone-light">
      <span class="scroll-cue-line absolute inset-x-0 top-0 h-full bg-ink" />
    </span>
  </div>
</template>

<style scoped>
.scroll-cue-line {
  animation: cue-fall 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes cue-fall {
  0% {
    transform: translateY(-100%);
  }
  60%,
  100% {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue-line {
    animation: none;
    transform: translateY(0);
  }
}
</style>
