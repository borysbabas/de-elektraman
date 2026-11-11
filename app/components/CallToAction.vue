<script lang="ts" setup>
interface Props {
  title: string
  description: string
  buttonText: string
  buttonLink: string
  darkMode?: boolean
}

withDefaults(defineProps<Props>(), {
  darkMode: false
})
</script>

<template>
  <section
    :class="[
    'py-12 md:py-16 lg:py-20 px-4 md:px-6',
    darkMode ? 'bg-gray-900' : ''
  ]">
    <div
      :class="[
      'container mx-auto text-center',
      darkMode ? 'text-white' : ''
    ]">
      <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{{ title }}</h2>
      <p
        :class="[
        'text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto',
        darkMode ? 'opacity-95' : 'text-gray-700'
      ]">
        {{ description }}
      </p>
      <NuxtLink
        :to="buttonLink"
        class="press inline-block px-6 md:px-8 py-3 md:py-4 bg-primary text-white text-sm md:text-base font-semibold rounded-lg hover:bg-primary-dark shadow-lg"
      >
        {{ buttonText }}
      </NuxtLink>
    </div>
  </section>
</template>
