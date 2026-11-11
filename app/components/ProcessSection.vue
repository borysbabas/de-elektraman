<script lang="ts" setup>
interface ProcessStep {
  number: number
  title: string
  description: string
}

interface Props {
  title: string
  description: string
  steps: ProcessStep[]
}

defineProps<Props>()
</script>

<template>
  <section class="bg-secondary text-white py-20 px-6">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">{{ title }}</h2>
        <p class="text-xl opacity-95">{{ description }}</p>
      </div>

      <div class="relative grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        <span
          aria-hidden="true"
          class="hidden md:block absolute top-7 left-[calc(12.5%-0.75rem)] right-[calc(12.5%-0.75rem)] h-px bg-white/20" />
        <div v-for="step in steps" :key="step.number" class="relative text-center">
          <div
            class="font-display w-14 h-14 bg-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {{ step.number }}
          </div>
          <h4 class="text-lg font-bold mb-2">{{ step.title }}</h4>
          <p class="text-white/80 text-sm">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
