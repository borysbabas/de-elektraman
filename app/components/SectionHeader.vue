<script lang="ts" setup>
interface Props {
  title: string
  description?: string
  subtitle?: string
  centered?: boolean
}

withDefaults(defineProps<Props>(), {
  description: '',
  subtitle: '',
  centered: true
})
</script>

<template>
  <div
    :class="[
    'mb-12 md:mb-16',
    centered ? 'text-center' : ''
  ]">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-secondary">
      {{ title }}
    </h2>
    <p
      v-if="description" :class="[
      'text-base sm:text-lg md:text-xl text-gray-600',
      centered ? 'max-w-2xl mx-auto' : ''
    ]">
      {{ description }}
    </p>
    <p
      v-if="subtitle" :class="[
      'text-base sm:text-lg md:text-xl text-gray-700 mt-2',
      centered ? 'max-w-2xl mx-auto' : ''
    ]">
      {{ subtitle }}
    </p>
  </div>
</template>
