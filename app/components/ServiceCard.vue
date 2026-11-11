<script lang="ts" setup>
import type { Component } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/solid'

interface Props {
  icon: Component
  title: string
  description: string
  features?: string[]
}

defineProps<Props>()
</script>

<template>
  <div
    class="p-6 md:p-8 rounded-xl border border-border">
    <div class="w-12 h-12 md:w-14 md:h-14 bg-primary-light rounded-lg flex items-center justify-center mb-4 md:mb-6">
      <component :is="icon" class="w-6 h-6 md:w-8 md:h-8 text-primary" />
    </div>
    <h3 class="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-secondary">{{ title }}</h3>
    <p class="leading-relaxed text-sm md:text-base text-gray-600 mb-3 md:mb-4">
      {{ description }}
    </p>
    <ul v-if="features && features.length > 0" class="space-y-2 text-sm md:text-base text-gray-700">
      <li v-for="(feature, index) in features" :key="index" class="flex items-center gap-2">
        <CheckIcon class="w-4 h-4 text-primary shrink-0" />
        <span>{{ feature }}</span>
      </li>
    </ul>
  </div>
</template>
