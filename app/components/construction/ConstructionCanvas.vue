<script setup lang="ts">
const canvasEl = ref<HTMLCanvasElement | null>(null)

defineExpose({ canvasEl })
</script>

<template>
  <canvas ref="canvasEl" class="absolute inset-0 block h-full w-full" />
</template>
